package com.defuseit.watch;

import android.content.Context;
import android.os.Build;
import android.os.Bundle;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.view.MotionEvent;
import android.view.WindowManager;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    private Vibrator vibrator;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // 1. Keep Watch screen on at all times during gameplay
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);

        // Initialize haptic vibrator for rotary clicks
        vibrator = (Vibrator) getSystemService(Context.VIBRATOR_SERVICE);
    }

    /**
     * Intercept hardware rotating bezel from Samsung Galaxy Watch 4 Classic
     */
    @Override
    public boolean dispatchGenericMotionEvent(MotionEvent event) {
        if (event.getAction() == MotionEvent.ACTION_SCROLL) {
            float axisValue = -event.getAxisValue(MotionEvent.AXIS_SCROLL);
            if (axisValue != 0) {
                // Micro haptic pulse for physical click sensation
                triggerRotaryClickHaptic();

                // Determine direction: clockwise vs counterclockwise
                final String direction = axisValue > 0 ? "clockwise" : "counterclockwise";
                final float delta = axisValue;

                // Dispatch custom event and wheel event to the WebView
                if (getBridge() != null && getBridge().getWebView() != null) {
                    getBridge().getWebView().post(new Runnable() {
                        @Override
                        public void run() {
                            String js = String.format(
                                "window.dispatchEvent(new CustomEvent('watch-rotary', { detail: { direction: '%s', delta: %f } }));" +
                                "window.dispatchEvent(new WheelEvent('wheel', { deltaY: %f }));",
                                direction, delta, delta * 80f
                            );
                            getBridge().getWebView().evaluateJavascript(js, null);
                        }
                    });
                }
                return true;
            }
        }
        return super.dispatchGenericMotionEvent(event);
    }

    private void triggerRotaryClickHaptic() {
        if (vibrator != null && vibrator.hasVibrator()) {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                vibrator.vibrate(VibrationEffect.createOneShot(14, VibrationEffect.DEFAULT_AMPLITUDE));
            } else {
                vibrator.vibrate(14);
            }
        }
    }
}
