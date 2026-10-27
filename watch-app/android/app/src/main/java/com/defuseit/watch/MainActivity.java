package com.defuseit.watch;

import android.content.Context;
import android.content.SharedPreferences;
import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.view.LayoutInflater;
import android.view.MotionEvent;
import android.view.View;
import android.view.WindowManager;
import android.widget.Button;
import android.widget.EditText;
import android.widget.FrameLayout;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.net.URISyntaxException;
import java.util.Locale;

import io.socket.client.IO;
import io.socket.client.Socket;

public class MainActivity extends AppCompatActivity {

    private static final String PREFS_NAME = "defuse_it_prefs";
    private static final String KEY_SERVER_IP = "server_ip";
    private static final String DEFAULT_SERVER_IP = "http://10.0.0.34:3000";

    // View State Enum
    private enum ScreenState {
        CONNECT,
        LOBBY,
        GAME,
        EXPLODED,
        DEFUSED
    }

    private ScreenState currentScreen = ScreenState.CONNECT;
    private FrameLayout rootContainer;
    private Vibrator vibrator;
    private Socket mSocket;
    private SharedPreferences prefs;

    // Game data from server
    private String currentPin = "";
    private JSONObject currentBombState = null;
    private JSONArray modulesArray = null;
    private JSONObject edgeworkObj = null;
    private long timeRemainingMs = 300000;
    private int strikes = 0;
    private int maxStrikes = 3;

    // Bezel control modes
    private boolean bezelModeAction = false; // false: MÓDULOS, true: ACCIÓN
    private int currentModuleIndex = 0; // -1: Edgework, 0..N-1: modules

    // Module internal UI states
    private int selectedWireIndex = 0;
    private float morseFrequency = 3.545f;
    private boolean isMorseLightOn = false;
    private int passwordActiveCol = 0;
    private int[] passwordColIndices = new int[]{0, 0, 0, 0, 0};
    private int whosSelectedBtn = 0;
    private int memorySelectedBtn = 0;
    private String knobCurrentDir = "ARRIBA";

    // Views in Game HUD
    private TextView tvGameTimer;
    private TextView tvGameStrikes;
    private TextView tvBezelMode;
    private TextView tvModuleTitle;
    private FrameLayout moduleContainer;

    // Morse loop handler
    private final Handler morseHandler = new Handler(Looper.getMainLooper());
    private Runnable morseRunnable = null;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        setContentView(R.layout.activity_main);

        rootContainer = findViewById(R.id.rootContainer);
        vibrator = (Vibrator) getSystemService(Context.VIBRATOR_SERVICE);
        prefs = getSharedPreferences(PREFS_NAME, MODE_PRIVATE);

        showConnectScreen();
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        stopMorseLoop();
        if (mSocket != null) {
            mSocket.disconnect();
            mSocket.off();
        }
    }

    // --- HARDWARE ROTARY BEZEL INTERCEPTOR (GALAXY WATCH 4 CLASSIC) ---
    @Override
    public boolean dispatchGenericMotionEvent(MotionEvent event) {
        if (event.getAction() == MotionEvent.ACTION_SCROLL) {
            float axisValue = -event.getAxisValue(MotionEvent.AXIS_SCROLL);
            if (axisValue != 0) {
                triggerRotaryClickHaptic();
                int direction = axisValue > 0 ? 1 : -1;
                handleRotaryBezel(direction);
                return true;
            }
        }
        return super.dispatchGenericMotionEvent(event);
    }

    // PIN Rotary Picker State
    private int[] pinDigits = new int[]{1, 0, 0, 0};
    private int activePinIndex = 0;
    private TextView[] tvPinDigits = new TextView[4];

    private void handleRotaryBezel(int direction) {
        if (currentScreen == ScreenState.CONNECT) {
            pinDigits[activePinIndex] = (pinDigits[activePinIndex] + direction + 10) % 10;
            if (tvPinDigits[activePinIndex] != null) {
                tvPinDigits[activePinIndex].setText(String.valueOf(pinDigits[activePinIndex]));
            }
            return;
        }

        if (currentScreen != ScreenState.GAME) return;

        if (!bezelModeAction) {
            // MÓDULOS MODE: Cycle between Edgework (-1) and modules (0 to N-1)
            int totalViews = (modulesArray != null ? modulesArray.length() : 0) + 1; // +1 for Edgework
            if (totalViews <= 0) return;

            int mapped = currentModuleIndex + 1;
            mapped = (mapped + direction + totalViews) % totalViews;
            currentModuleIndex = mapped - 1;

            updateGameHeader();
            renderActiveModuleView();
        } else {
            // ACCIÓN MODE: Control active module
            handleActionBezel(direction);
        }
    }

    private void handleActionBezel(int direction) {
        if (currentModuleIndex == -1) {
            // Edgework scrolling (handled by scrollview)
            return;
        }

        JSONObject mod = getActiveModule();
        if (mod == null || mod.optBoolean("solved")) return;

        String type = mod.optString("type", "");

        switch (type) {
            case "wires": {
                JSONArray colors = mod.optJSONArray("colors");
                int count = colors != null ? colors.length() : 1;
                selectedWireIndex = (selectedWireIndex + direction + count) % count;
                renderActiveModuleView();
                break;
            }
            case "morse_code": {
                // Adjust frequency in steps of 0.005 MHz between 3.500 and 3.600
                morseFrequency = Math.round((morseFrequency + direction * 0.005f) * 1000f) / 1000f;
                if (morseFrequency < 3.500f) morseFrequency = 3.500f;
                if (morseFrequency > 3.600f) morseFrequency = 3.600f;

                // Transmit live telemetry to phone
                emitTelemetry();
                renderActiveModuleView();
                break;
            }
            case "passwords": {
                JSONArray cols = mod.optJSONArray("columns");
                if (cols != null && passwordActiveCol < cols.length()) {
                    JSONArray colLetters = cols.optJSONArray(passwordActiveCol);
                    int count = colLetters != null ? colLetters.length() : 6;
                    passwordColIndices[passwordActiveCol] = (passwordColIndices[passwordActiveCol] + direction + count) % count;
                    renderActiveModuleView();
                }
                break;
            }
            case "needy_knob": {
                String[] dirs = new String[]{"ARRIBA", "DERECHA", "ABAJO", "IZQUIERDA"};
                int curIdx = 0;
                for (int i = 0; i < dirs.length; i++) {
                    if (dirs[i].equals(knobCurrentDir)) { curIdx = i; break; }
                }
                curIdx = (curIdx + direction + dirs.length) % dirs.length;
                knobCurrentDir = dirs[curIdx];

                emitTelemetry();
                renderActiveModuleView();
                break;
            }
            case "needy_vent_capacitor": {
                // Discharging capacitor
                if (mSocket != null && mSocket.connected()) {
                    try {
                        JSONObject act = new JSONObject();
                        act.put("action", "discharge");
                        act.put("dischargeAmount", 20);
                        mSocket.emit("action:vent_capacitor", act);
                    } catch (JSONException ignored) {}
                }
                break;
            }
            case "whos_on_first": {
                whosSelectedBtn = (whosSelectedBtn + direction + 6) % 6;
                renderActiveModuleView();
                break;
            }
            case "memory": {
                memorySelectedBtn = (memorySelectedBtn + direction + 4) % 4;
                renderActiveModuleView();
                break;
            }
        }
    }

    private void emitTelemetry() {
        if (mSocket != null && mSocket.connected()) {
            try {
                JSONObject telem = new JSONObject();
                telem.put("morseFrequency", morseFrequency);
                telem.put("knobDirection", knobCurrentDir);
                telem.put("rotaryDirection", bezelModeAction ? "action" : "nav");
                mSocket.emit("watch:telemetry", telem);
            } catch (JSONException ignored) {}
        }
    }

    // --- SCREEN: CONNECT / ROTARY PIN PICKER ---
    private void showConnectScreen() {
        currentScreen = ScreenState.CONNECT;
        stopMorseLoop();
        rootContainer.removeAllViews();

        View v = LayoutInflater.from(this).inflate(R.layout.view_connect, rootContainer, false);
        rootContainer.addView(v);

        TextView tvServerIp = v.findViewById(R.id.tvServerIp);
        TextView tvStatus = v.findViewById(R.id.tvConnectStatus);
        Button btnConnect = v.findViewById(R.id.btnConnect);
        Button btnPrev = v.findViewById(R.id.btnPinPrev);
        Button btnNext = v.findViewById(R.id.btnPinNext);

        tvPinDigits[0] = v.findViewById(R.id.tvPinDigit0);
        tvPinDigits[1] = v.findViewById(R.id.tvPinDigit1);
        tvPinDigits[2] = v.findViewById(R.id.tvPinDigit2);
        tvPinDigits[3] = v.findViewById(R.id.tvPinDigit3);

        String savedIp = prefs.getString(KEY_SERVER_IP, DEFAULT_SERVER_IP);
        tvServerIp.setText("IP: " + savedIp.replace("http://", ""));
        tvServerIp.setOnClickListener(view -> showEditIpDialog(tvServerIp));

        updatePinDigitBoxes();

        for (int i = 0; i < 4; i++) {
            final int idx = i;
            tvPinDigits[i].setOnClickListener(view -> {
                if (activePinIndex == idx) {
                    pinDigits[idx] = (pinDigits[idx] + 1) % 10;
                } else {
                    activePinIndex = idx;
                }
                updatePinDigitBoxes();
                triggerRotaryClickHaptic();
            });
        }

        btnPrev.setOnClickListener(view -> {
            activePinIndex = (activePinIndex - 1 + 4) % 4;
            updatePinDigitBoxes();
            triggerRotaryClickHaptic();
        });

        btnNext.setOnClickListener(view -> {
            activePinIndex = (activePinIndex + 1) % 4;
            updatePinDigitBoxes();
            triggerRotaryClickHaptic();
        });

        btnConnect.setOnClickListener(view -> {
            currentPin = "" + pinDigits[0] + pinDigits[1] + pinDigits[2] + pinDigits[3];
            connectToServer(prefs.getString(KEY_SERVER_IP, DEFAULT_SERVER_IP), currentPin, tvStatus);
        });
    }

    private void updatePinDigitBoxes() {
        for (int i = 0; i < 4; i++) {
            if (tvPinDigits[i] != null) {
                tvPinDigits[i].setText(String.valueOf(pinDigits[i]));
                if (i == activePinIndex) {
                    tvPinDigits[i].setTextColor(Color.parseColor("#00E5FF"));
                    tvPinDigits[i].setBackgroundResource(R.drawable.btn_round_cyan);
                } else {
                    tvPinDigits[i].setTextColor(Color.parseColor("#F1F5F9"));
                    tvPinDigits[i].setBackgroundResource(R.drawable.btn_round_dark);
                }
            }
        }
    }

    private void showEditIpDialog(TextView tvDisplay) {
        AlertDialog.Builder builder = new AlertDialog.Builder(this);
        builder.setTitle("IP Servidor");

        final EditText input = new EditText(this);
        input.setText(prefs.getString(KEY_SERVER_IP, DEFAULT_SERVER_IP));
        builder.setView(input);

        builder.setPositiveButton("Guardar", (dialog, which) -> {
            String newIp = input.getText().toString().trim();
            if (!newIp.startsWith("http://") && !newIp.startsWith("https://")) {
                newIp = "http://" + newIp;
            }
            prefs.edit().putString(KEY_SERVER_IP, newIp).apply();
            tvDisplay.setText("IP: " + newIp.replace("http://", ""));
        });
        builder.setNegativeButton("Cancelar", null);
        builder.show();
    }

    // --- SOCKET.IO CONNECTION ---
    private void connectToServer(String serverUrl, String pin, TextView tvStatus) {
        tvStatus.setText("Conectando a " + serverUrl + "...");
        if (mSocket != null) {
            mSocket.disconnect();
            mSocket.off();
        }

        try {
            IO.Options opts = new IO.Options();
            opts.transports = new String[]{"websocket", "polling"};
            opts.reconnection = true;
            opts.reconnectionAttempts = 5;
            opts.reconnectionDelay = 1000;
            opts.timeout = 10000;

            mSocket = IO.socket(serverUrl, opts);

            mSocket.on(Socket.EVENT_CONNECT, args -> runOnUiThread(() -> {
                tvStatus.setText("Conectado. Uniendo a sala " + pin + "...");
                try {
                    JSONObject joinData = new JSONObject();
                    joinData.put("code", pin);
                    joinData.put("role", "watch");
                    mSocket.emit("join-room", joinData);
                } catch (JSONException ignored) {}
            }));

            mSocket.on(Socket.EVENT_CONNECT_ERROR, args -> runOnUiThread(() -> {
                String detail = (args.length > 0 && args[0] != null) ? args[0].toString() : "timeout";
                tvStatus.setText("Error: " + detail);
            }));

            mSocket.on("error:room", args -> runOnUiThread(() -> {
                if (args.length > 0 && args[0] instanceof JSONObject) {
                    JSONObject err = (JSONObject) args[0];
                    tvStatus.setText(err.optString("message", "Error de sala"));
                }
            }));

            mSocket.on("room:joined", args -> runOnUiThread(() -> {
                if (args.length > 0 && args[0] instanceof JSONObject) {
                    JSONObject data = (JSONObject) args[0];
                    handleRoomStatePayload(data);
                }
            }));

            mSocket.on("room:state", args -> runOnUiThread(() -> {
                if (args.length > 0 && args[0] instanceof JSONObject) {
                    JSONObject data = (JSONObject) args[0];
                    handleRoomStatePayload(data);
                }
            }));

            mSocket.on("sync:time", args -> runOnUiThread(() -> {
                if (args.length > 0 && args[0] instanceof JSONObject) {
                    JSONObject sync = (JSONObject) args[0];
                    timeRemainingMs = (long) sync.optDouble("timeRemainingMs", timeRemainingMs);
                    strikes = sync.optInt("strikes", strikes);
                    updateTimerText();
                    updateStrikesText();
                }
            }));

            mSocket.on("strike", args -> runOnUiThread(() -> {
                triggerStrikeHaptic();
                if (args.length > 0 && args[0] instanceof JSONObject) {
                    JSONObject s = (JSONObject) args[0];
                    strikes = s.optInt("strikes", strikes + 1);
                    updateStrikesText();
                }
            }));

            mSocket.on("module:solved", args -> runOnUiThread(() -> {
                triggerSuccessHaptic();
            }));

            mSocket.on("bomb:defused", args -> runOnUiThread(this::showDefusedScreen));

            mSocket.connect();
        } catch (URISyntaxException e) {
            tvStatus.setText("URL inválida: " + e.getMessage());
        }
    }

    private void handleRoomStatePayload(JSONObject data) {
        JSONObject bomb = data.optJSONObject("bomb");
        if (bomb == null) return;

        currentBombState = bomb;
        modulesArray = bomb.optJSONArray("modules");
        edgeworkObj = bomb.optJSONObject("edgework");
        timeRemainingMs = (long) bomb.optDouble("timeRemainingMs", 300000);
        strikes = bomb.optInt("strikes", 0);
        maxStrikes = bomb.optInt("maxStrikes", 3);

        String status = bomb.optString("status", "waiting");

        if ("waiting".equals(status)) {
            showLobbyScreen();
        } else if ("active".equals(status)) {
            if (currentScreen != ScreenState.GAME) {
                showGameScreen();
            } else {
                updateTimerText();
                updateStrikesText();
                renderActiveModuleView();
            }
        } else if ("exploded".equals(status)) {
            showExplodedScreen(bomb.optString("explosionReason", "Bomba detonada"));
        } else if ("defused".equals(status)) {
            showDefusedScreen();
        }
    }

    // --- SCREEN: LOBBY ---
    private void showLobbyScreen() {
        currentScreen = ScreenState.LOBBY;
        stopMorseLoop();
        rootContainer.removeAllViews();

        View v = LayoutInflater.from(this).inflate(R.layout.view_lobby, rootContainer, false);
        rootContainer.addView(v);

        TextView tvPin = v.findViewById(R.id.tvLobbyPin);
        TextView tvStatus = v.findViewById(R.id.tvLobbyStatus);
        Button btnStart = v.findViewById(R.id.btnLobbyStart);
        Button btnDisconnect = v.findViewById(R.id.btnLobbyDisconnect);

        tvPin.setText("PIN: " + currentPin);
        tvStatus.setText("Reloj sincronizado. Pulsa abajo para iniciar o espera al teléfono.");

        btnStart.setOnClickListener(view -> {
            if (mSocket != null && mSocket.connected()) {
                try {
                    JSONObject startData = new JSONObject();
                    startData.put("testMode", false);
                    mSocket.emit("start-game", startData);
                } catch (JSONException ignored) {}
            }
        });

        btnDisconnect.setOnClickListener(view -> showConnectScreen());
    }

    // --- SCREEN: GAME HUD ---
    private void showGameScreen() {
        currentScreen = ScreenState.GAME;
        rootContainer.removeAllViews();

        View v = LayoutInflater.from(this).inflate(R.layout.view_game, rootContainer, false);
        rootContainer.addView(v);

        tvGameTimer = v.findViewById(R.id.tvGameTimer);
        tvGameStrikes = v.findViewById(R.id.tvGameStrikes);
        tvBezelMode = v.findViewById(R.id.tvBezelMode);
        tvModuleTitle = v.findViewById(R.id.tvModuleTitle);
        moduleContainer = v.findViewById(R.id.moduleContainer);

        // Mode Pill Toggle Click
        tvBezelMode.setOnClickListener(view -> {
            bezelModeAction = !bezelModeAction;
            updateBezelModeBadge();
            triggerRotaryClickHaptic();
        });

        // Prev / Next Module buttons
        v.findViewById(R.id.btnNavPrev).setOnClickListener(view -> {
            int total = (modulesArray != null ? modulesArray.length() : 0) + 1;
            int mapped = (currentModuleIndex + 1 - 1 + total) % total;
            currentModuleIndex = mapped - 1;
            updateGameHeader();
            renderActiveModuleView();
            triggerRotaryClickHaptic();
        });

        v.findViewById(R.id.btnNavNext).setOnClickListener(view -> {
            int total = (modulesArray != null ? modulesArray.length() : 0) + 1;
            int mapped = (currentModuleIndex + 1 + 1) % total;
            currentModuleIndex = mapped - 1;
            updateGameHeader();
            renderActiveModuleView();
            triggerRotaryClickHaptic();
        });

        updateBezelModeBadge();
        updateGameHeader();
        renderActiveModuleView();
    }

    private void updateBezelModeBadge() {
        if (tvBezelMode == null) return;
        if (bezelModeAction) {
            tvBezelMode.setText("BISEL: ACCIÓN");
            tvBezelMode.setTextColor(Color.parseColor("#FBBF24")); // Amber
        } else {
            tvBezelMode.setText("BISEL: MÓDULOS");
            tvBezelMode.setTextColor(Color.parseColor("#00E5FF")); // Cyan
        }
    }

    private void updateGameHeader() {
        updateTimerText();
        updateStrikesText();

        if (tvModuleTitle == null) return;

        if (currentModuleIndex == -1) {
            tvModuleTitle.setText("EDGEWORK");
            tvModuleTitle.setTextColor(Color.parseColor("#38BDF8"));
        } else {
            JSONObject mod = getActiveModule();
            int total = modulesArray != null ? modulesArray.length() : 0;
            if (mod != null) {
                String title = mod.optString("title", "MÓDULO");
                boolean solved = mod.optBoolean("solved", false);
                tvModuleTitle.setText(String.format(Locale.getDefault(), "%d/%d: %s %s", currentModuleIndex + 1, total, title.toUpperCase(), solved ? "✓" : ""));
                tvModuleTitle.setTextColor(solved ? Color.parseColor("#10B981") : Color.WHITE);
            }
        }
    }

    private void updateTimerText() {
        if (tvGameTimer == null) return;
        long totalSeconds = timeRemainingMs / 1000;
        long minutes = totalSeconds / 60;
        long seconds = totalSeconds % 60;
        long tenths = (timeRemainingMs % 1000) / 100;

        tvGameTimer.setText(String.format(Locale.getDefault(), "%02d:%02d.%d", minutes, seconds, tenths));
        if (timeRemainingMs < 60000) {
            tvGameTimer.setTextColor(Color.parseColor("#EF4444")); // Red flash
        } else if (timeRemainingMs < 120000) {
            tvGameTimer.setTextColor(Color.parseColor("#FBBF24")); // Amber
        } else {
            tvGameTimer.setTextColor(Color.parseColor("#FBBF24"));
        }
    }

    private void updateStrikesText() {
        if (tvGameStrikes == null) return;
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < maxStrikes; i++) {
            if (i < strikes) sb.append("[X] ");
            else sb.append("[ ] ");
        }
        tvGameStrikes.setText(sb.toString().trim());
        tvGameStrikes.setTextColor(strikes > 0 ? Color.parseColor("#EF4444") : Color.parseColor("#64748B"));
    }

    private JSONObject getActiveModule() {
        if (modulesArray != null && currentModuleIndex >= 0 && currentModuleIndex < modulesArray.length()) {
            return modulesArray.optJSONObject(currentModuleIndex);
        }
        return null;
    }

    // --- RENDER ACTIVE MODULE IN CONTAINER ---
    private void renderActiveModuleView() {
        if (moduleContainer == null) return;
        stopMorseLoop();
        moduleContainer.removeAllViews();

        if (currentModuleIndex == -1) {
            // EDGEWORK VIEW
            View v = ModuleViews.buildEdgeworkView(this, edgeworkObj);
            moduleContainer.addView(v);
            return;
        }

        JSONObject mod = getActiveModule();
        if (mod == null) return;

        String type = mod.optString("type", "");

        switch (type) {
            case "wires": {
                View v = ModuleViews.buildWiresView(this, mod, selectedWireIndex, wireIndex -> {
                    emitModuleAction("action:wires", "wireIndex", wireIndex);
                });
                moduleContainer.addView(v);
                break;
            }
            case "the_button": {
                View v = ModuleViews.buildButtonView(this, mod, timeRemainingMs, (actionType, releaseDigit) -> {
                    try {
                        JSONObject act = new JSONObject();
                        act.put("actionType", actionType);
                        act.put("releaseDigit", releaseDigit);
                        mSocket.emit("action:button", act);
                    } catch (JSONException ignored) {}
                });
                moduleContainer.addView(v);
                break;
            }
            case "keypads": {
                View v = ModuleViews.buildKeypadsView(this, mod, symbol -> {
                    emitModuleAction("action:keypad", "symbol", symbol);
                });
                moduleContainer.addView(v);
                break;
            }
            case "simon_says": {
                View v = ModuleViews.buildSimonView(this, mod, null, color -> {
                    emitModuleAction("action:simon", "color", color);
                });
                moduleContainer.addView(v);
                break;
            }
            case "whos_on_first": {
                View v = ModuleViews.buildWhosOnFirstView(this, mod, whosSelectedBtn, buttonIndex -> {
                    emitModuleAction("action:whos_on_first", "buttonIndex", buttonIndex);
                });
                moduleContainer.addView(v);
                break;
            }
            case "memory": {
                View v = ModuleViews.buildMemoryView(this, mod, memorySelectedBtn, (buttonIndex, label) -> {
                    try {
                        JSONObject act = new JSONObject();
                        act.put("buttonIndex", buttonIndex);
                        act.put("label", label);
                        mSocket.emit("action:memory", act);
                    } catch (JSONException ignored) {}
                });
                moduleContainer.addView(v);
                break;
            }
            case "morse_code": {
                View v = ModuleViews.buildMorseView(this, mod, morseFrequency, isMorseLightOn, freq -> {
                    try {
                        JSONObject act = new JSONObject();
                        act.put("frequency", freq);
                        mSocket.emit("action:morse", act);
                    } catch (JSONException ignored) {}
                });
                moduleContainer.addView(v);
                startMorseLoop(mod);
                break;
            }
            case "passwords": {
                View v = ModuleViews.buildPasswordsView(this, mod, passwordActiveCol, passwordColIndices, word -> {
                    emitModuleAction("action:passwords", "word", word);
                });
                moduleContainer.addView(v);
                break;
            }
            case "needy_knob": {
                View v = ModuleViews.buildKnobView(this, mod, knobCurrentDir, direction -> {
                    emitModuleAction("action:knob", "direction", direction);
                });
                moduleContainer.addView(v);
                break;
            }
            case "needy_vent_capacitor": {
                View v = ModuleViews.buildVentCapacitorView(this, mod, (action, answer, dischargeAmount) -> {
                    try {
                        JSONObject act = new JSONObject();
                        act.put("action", action);
                        act.put("answer", answer);
                        act.put("dischargeAmount", dischargeAmount);
                        mSocket.emit("action:vent_capacitor", act);
                    } catch (JSONException ignored) {}
                });
                moduleContainer.addView(v);
                break;
            }
        }
    }

    private void emitModuleAction(String event, String key, Object value) {
        if (mSocket != null && mSocket.connected()) {
            try {
                JSONObject act = new JSONObject();
                act.put(key, value);
                mSocket.emit(event, act);
            } catch (JSONException ignored) {}
        }
    }

    // --- MORSE BLINKING & HAPTIC LOOP ---
    private void startMorseLoop(JSONObject mod) {
        stopMorseLoop();
        String code = mod.optString("morseCode", ".-");
        final String sequence = code + "   "; // pause at end
        final int[] index = {0};

        morseRunnable = new Runnable() {
            @Override
            public void run() {
                if (index[0] >= sequence.length()) index[0] = 0;
                char c = sequence.charAt(index[0]++);

                long duration = 250;
                if (c == '.') {
                    isMorseLightOn = true;
                    duration = 200;
                    triggerRotaryClickHaptic();
                } else if (c == '-') {
                    isMorseLightOn = true;
                    duration = 500;
                    triggerStrikeHaptic();
                } else {
                    isMorseLightOn = false;
                    duration = 400;
                }

                if (moduleContainer != null && currentModuleIndex >= 0) {
                    renderActiveModuleView();
                }

                morseHandler.postDelayed(this, duration);
            }
        };
        morseHandler.post(morseRunnable);
    }

    private void stopMorseLoop() {
        if (morseRunnable != null) {
            morseHandler.removeCallbacks(morseRunnable);
            morseRunnable = null;
        }
        isMorseLightOn = false;
    }

    // --- SCREEN: EXPLODED ---
    private void showExplodedScreen(String reason) {
        currentScreen = ScreenState.EXPLODED;
        stopMorseLoop();
        triggerLongDetonationHaptic();
        rootContainer.removeAllViews();

        View v = LayoutInflater.from(this).inflate(R.layout.view_exploded, rootContainer, false);
        rootContainer.addView(v);

        TextView tvReason = v.findViewById(R.id.tvExplosionReason);
        tvReason.setText(reason);

        v.findViewById(R.id.btnExplodedRestart).setOnClickListener(view -> {
            if (mSocket != null && mSocket.connected()) {
                try {
                    JSONObject req = new JSONObject();
                    req.put("difficulty", "normal");
                    mSocket.emit("restart-game", req);
                } catch (JSONException ignored) {}
            }
        });
    }

    // --- SCREEN: DEFUSED (VICTORY) ---
    private void showDefusedScreen() {
        currentScreen = ScreenState.DEFUSED;
        stopMorseLoop();
        triggerVictoryHaptic();
        rootContainer.removeAllViews();

        View v = LayoutInflater.from(this).inflate(R.layout.view_defused, rootContainer, false);
        rootContainer.addView(v);

        TextView tvStats = v.findViewById(R.id.tvDefusedStats);
        long s = timeRemainingMs / 1000;
        tvStats.setText(String.format(Locale.getDefault(), "Tiempo restante: %02d:%02d\nFallos: %d/%d", s / 60, s % 60, strikes, maxStrikes));

        v.findViewById(R.id.btnDefusedNewGame).setOnClickListener(view -> {
            if (mSocket != null && mSocket.connected()) {
                try {
                    JSONObject req = new JSONObject();
                    req.put("difficulty", "normal");
                    mSocket.emit("restart-game", req);
                } catch (JSONException ignored) {}
            }
        });
    }

    // --- HAPTICS FOR WEAR OS ---
    private void triggerRotaryClickHaptic() {
        if (vibrator != null && vibrator.hasVibrator()) {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                vibrator.vibrate(VibrationEffect.createOneShot(16, VibrationEffect.DEFAULT_AMPLITUDE));
            } else {
                vibrator.vibrate(16);
            }
        }
    }

    private void triggerStrikeHaptic() {
        if (vibrator != null && vibrator.hasVibrator()) {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                vibrator.vibrate(VibrationEffect.createWaveform(new long[]{0, 120, 80, 120}, -1));
            } else {
                vibrator.vibrate(300);
            }
        }
    }

    private void triggerSuccessHaptic() {
        if (vibrator != null && vibrator.hasVibrator()) {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                vibrator.vibrate(VibrationEffect.createOneShot(60, VibrationEffect.DEFAULT_AMPLITUDE));
            } else {
                vibrator.vibrate(60);
            }
        }
    }

    private void triggerVictoryHaptic() {
        if (vibrator != null && vibrator.hasVibrator()) {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                vibrator.vibrate(VibrationEffect.createWaveform(new long[]{0, 80, 60, 80, 60, 180}, -1));
            } else {
                vibrator.vibrate(400);
            }
        }
    }

    private void triggerLongDetonationHaptic() {
        if (vibrator != null && vibrator.hasVibrator()) {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                vibrator.vibrate(VibrationEffect.createWaveform(new long[]{0, 200, 100, 200, 100, 500}, -1));
            } else {
                vibrator.vibrate(1000);
            }
        }
    }
}
