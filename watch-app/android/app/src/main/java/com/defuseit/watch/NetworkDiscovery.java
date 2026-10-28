package com.defuseit.watch;

import android.content.Context;
import android.net.wifi.WifiManager;
import android.os.Handler;
import android.os.Looper;
import android.util.Log;

import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.DatagramPacket;
import java.net.DatagramSocket;
import java.net.HttpURLConnection;
import java.net.Inet4Address;
import java.net.InetAddress;
import java.net.NetworkInterface;
import java.net.URL;
import java.util.Collections;
import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicBoolean;

public class NetworkDiscovery {
    private static final String TAG = "NetworkDiscovery";
    public static final int BROADCAST_PORT = 41234;
    public static final int DEFAULT_SERVER_PORT = 3000;

    public interface DiscoveryCallback {
        void onServerFound(String host, int port, String fullUrl);
        void onSearching(String message);
        void onSearchFailed();
    }

    private final Context context;
    private final Handler mainHandler;
    private final AtomicBoolean isSearching = new AtomicBoolean(false);
    private final AtomicBoolean serverFound = new AtomicBoolean(false);
    private ExecutorService executorService;
    private WifiManager.MulticastLock multicastLock;

    public NetworkDiscovery(Context context) {
        this.context = context.getApplicationContext();
        this.mainHandler = new Handler(Looper.getMainLooper());
    }

    public synchronized void startDiscovery(DiscoveryCallback callback) {
        if (isSearching.get()) {
            Log.d(TAG, "Discovery already in progress.");
            return;
        }

        isSearching.set(true);
        serverFound.set(false);
        executorService = Executors.newFixedThreadPool(30);

        mainHandler.post(() -> callback.onSearching("Buscando en red..."));

        // 1. Start UDP Broadcast Listener in background thread
        executorService.execute(() -> listenForUdpBroadcast(callback));

        // 2. Start HTTP Subnet Sweep in background thread
        executorService.execute(() -> sweepSubnet(callback));
    }

    public synchronized void stopDiscovery() {
        isSearching.set(false);
        releaseMulticastLock();
        if (executorService != null && !executorService.isShutdown()) {
            executorService.shutdownNow();
        }
    }

    private void notifyServerFound(String host, int port, DiscoveryCallback callback) {
        if (serverFound.compareAndSet(false, true)) {
            isSearching.set(false);
            releaseMulticastLock();
            if (executorService != null) {
                executorService.shutdownNow();
            }
            String fullUrl = "http://" + host + ":" + port;
            Log.i(TAG, "Server discovered at " + fullUrl);
            mainHandler.post(() -> callback.onServerFound(host, port, fullUrl));
        }
    }

    // --- STRATEGY 1: UDP Broadcast Listener ---
    private void listenForUdpBroadcast(DiscoveryCallback callback) {
        DatagramSocket socket = null;
        try {
            acquireMulticastLock();
            socket = new DatagramSocket(BROADCAST_PORT);
            socket.setSoTimeout(3500); // Wait up to 3.5 seconds

            byte[] buffer = new byte[2048];
            DatagramPacket packet = new DatagramPacket(buffer, buffer.length);

            while (isSearching.get() && !serverFound.get()) {
                try {
                    socket.receive(packet);
                    String data = new String(packet.getData(), 0, packet.getLength(), "UTF-8");
                    JSONObject json = new JSONObject(data);
                    if ("defuse-it".equals(json.optString("app"))) {
                        String senderIp = packet.getAddress().getHostAddress();
                        int port = json.optInt("port", DEFAULT_SERVER_PORT);
                        Log.i(TAG, "UDP Beacon received from " + senderIp);
                        notifyServerFound(senderIp, port, callback);
                        break;
                    }
                } catch (Exception e) {
                    // Socket timeout or parsing error
                    break;
                }
            }
        } catch (Exception e) {
            Log.w(TAG, "UDP listener error: " + e.getMessage());
        } finally {
            if (socket != null && !socket.isClosed()) {
                socket.close();
            }
            releaseMulticastLock();
        }
    }

    // --- STRATEGY 2: Fast Parallel HTTP Subnet Sweep ---
    private void sweepSubnet(DiscoveryCallback callback) {
        try {
            String myIp = getLocalWifiIpAddress();
            if (myIp == null || myIp.isEmpty() || !myIp.contains(".")) {
                Log.w(TAG, "Could not determine device Wi-Fi IP");
                return;
            }

            int lastDot = myIp.lastIndexOf('.');
            String subnetPrefix = myIp.substring(0, lastDot + 1); // e.g. "10.222.1."
            int myLastOctet = Integer.parseInt(myIp.substring(lastDot + 1));

            Log.i(TAG, "Starting subnet sweep on " + subnetPrefix + "* (Device IP: " + myIp + ")");

            // Priority targets first: router (.1), common PC IPs, and device neighbors
            int[] priorityOctets = {1, 2, 100, 101, 102, 150, 192, 200};
            for (int octet : priorityOctets) {
                if (octet != myLastOctet && isSearching.get() && !serverFound.get()) {
                    final String targetIp = subnetPrefix + octet;
                    executorService.execute(() -> probeHttpServer(targetIp, callback));
                }
            }

            // Then probe the rest of the /24 subnet
            for (int i = 1; i <= 254; i++) {
                if (i == myLastOctet) continue;
                if (!isSearching.get() || serverFound.get()) break;

                final String targetIp = subnetPrefix + i;
                executorService.execute(() -> probeHttpServer(targetIp, callback));
            }

        } catch (Exception e) {
            Log.w(TAG, "Subnet sweep error: " + e.getMessage());
        }
    }

    private void probeHttpServer(String ip, DiscoveryCallback callback) {
        if (!isSearching.get() || serverFound.get()) return;

        HttpURLConnection conn = null;
        try {
            URL url = new URL("http://" + ip + ":" + DEFAULT_SERVER_PORT + "/api/discover");
            conn = (HttpURLConnection) url.openConnection();
            conn.setConnectTimeout(280);
            conn.setReadTimeout(280);
            conn.setRequestMethod("GET");

            if (conn.getResponseCode() == 200) {
                BufferedReader reader = new BufferedReader(new InputStreamReader(conn.getInputStream()));
                StringBuilder sb = new StringBuilder();
                String line;
                while ((line = reader.readLine()) != null) {
                    sb.append(line);
                }
                reader.close();

                JSONObject res = new JSONObject(sb.toString());
                if ("defuse-it".equals(res.optString("app"))) {
                    notifyServerFound(ip, res.optInt("port", DEFAULT_SERVER_PORT), callback);
                }
            }
        } catch (Exception ignored) {
            // Host unreachable or timeout, normal during subnet sweep
        } finally {
            if (conn != null) {
                conn.disconnect();
            }
        }
    }

    private String getLocalWifiIpAddress() {
        try {
            List<NetworkInterface> interfaces = Collections.list(NetworkInterface.getNetworkInterfaces());
            for (NetworkInterface intf : interfaces) {
                if (intf.isLoopback() || !intf.isUp()) continue;
                List<InetAddress> addrs = Collections.list(intf.getInetAddresses());
                for (InetAddress addr : addrs) {
                    if (!addr.isLoopbackAddress() && addr instanceof Inet4Address) {
                        String ip = addr.getHostAddress();
                        if (ip != null && !ip.startsWith("127.")) {
                            return ip;
                        }
                    }
                }
            }
        } catch (Exception e) {
            Log.w(TAG, "Error reading network interfaces: " + e.getMessage());
        }
        return null;
    }

    private void acquireMulticastLock() {
        try {
            WifiManager wifi = (WifiManager) context.getSystemService(Context.WIFI_SERVICE);
            if (wifi != null) {
                multicastLock = wifi.createMulticastLock("defuse_it_multicast_lock");
                multicastLock.setReferenceCounted(true);
                multicastLock.acquire();
            }
        } catch (Exception e) {
            Log.w(TAG, "Could not acquire MulticastLock: " + e.getMessage());
        }
    }

    private void releaseMulticastLock() {
        try {
            if (multicastLock != null && multicastLock.isHeld()) {
                multicastLock.release();
            }
        } catch (Exception ignored) {}
    }
}
