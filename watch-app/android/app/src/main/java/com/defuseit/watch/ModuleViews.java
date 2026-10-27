package com.defuseit.watch;

import android.content.Context;
import android.graphics.Color;
import android.graphics.Typeface;
import android.os.Handler;
import android.os.Looper;
import android.view.Gravity;
import android.view.MotionEvent;
import android.view.View;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.TextView;
import org.json.JSONArray;
import org.json.JSONObject;

import java.util.Locale;

public class ModuleViews {

    // Listener Interfaces
    public interface OnWireCutListener { void onCut(int wireIndex); }
    public interface OnButtonActionListener { void onAction(String actionType, int releaseDigit); }
    public interface OnKeypadClickListener { void onClick(String symbol); }
    public interface OnSimonClickListener { void onClick(String color); }
    public interface OnMemoryClickListener { void onClick(int buttonIndex, int label); }
    public interface OnPasswordSubmitListener { void onSubmit(String word); }

    // --- 0. EDGEWORK VIEW ---
    public static View buildEdgeworkView(Context ctx, JSONObject edgework) {
        ScrollView scroll = new ScrollView(ctx);
        scroll.setFillViewport(true);
        scroll.setVerticalScrollBarEnabled(false);

        LinearLayout layout = new LinearLayout(ctx);
        layout.setOrientation(LinearLayout.VERTICAL);
        layout.setGravity(Gravity.CENTER_HORIZONTAL);
        layout.setPadding(6, 2, 6, 16);

        TextView tvTitle = new TextView(ctx);
        tvTitle.setText("CARCASA (EDGEWORK)");
        tvTitle.setTextColor(Color.parseColor("#00E5FF"));
        tvTitle.setTextSize(10f);
        tvTitle.setTypeface(Typeface.DEFAULT_BOLD);
        layout.addView(tvTitle);

        if (edgework != null) {
            String serial = edgework.optString("serialNumber", "------");
            TextView tvSerial = new TextView(ctx);
            tvSerial.setText("SERIAL: " + serial);
            tvSerial.setTextColor(Color.parseColor("#FBBF24"));
            tvSerial.setTextSize(14f);
            tvSerial.setTypeface(Typeface.MONOSPACE, Typeface.BOLD);
            tvSerial.setPadding(0, 4, 0, 2);
            layout.addView(tvSerial);

            JSONObject bat = edgework.optJSONObject("batteries");
            int total = bat != null ? bat.optInt("total", 0) : 0;
            int aa = bat != null ? bat.optInt("aa", 0) : 0;
            int d = bat != null ? bat.optInt("d", 0) : 0;
            TextView tvBat = new TextView(ctx);
            tvBat.setText(String.format(Locale.getDefault(), "Baterías: %d (AA: %d, D: %d)", total, aa, d));
            tvBat.setTextColor(Color.parseColor("#F1F5F9"));
            tvBat.setTextSize(10f);
            layout.addView(tvBat);

            JSONArray inds = edgework.optJSONArray("indicators");
            StringBuilder indStr = new StringBuilder("Indicadores: ");
            if (inds != null && inds.length() > 0) {
                for (int i = 0; i < inds.length(); i++) {
                    JSONObject ind = inds.optJSONObject(i);
                    if (ind != null) {
                        indStr.append(ind.optString("label"))
                              .append(ind.optBoolean("lit") ? "★ " : "☆ ");
                    }
                }
            } else {
                indStr.append("Ninguno");
            }
            TextView tvInds = new TextView(ctx);
            tvInds.setText(indStr.toString());
            tvInds.setTextColor(Color.parseColor("#94A3B8"));
            tvInds.setTextSize(10f);
            tvInds.setPadding(0, 2, 0, 2);
            layout.addView(tvInds);

            JSONArray ports = edgework.optJSONArray("ports");
            StringBuilder portStr = new StringBuilder("Puertos: ");
            if (ports != null && ports.length() > 0) {
                for (int i = 0; i < ports.length(); i++) {
                    portStr.append(ports.optString(i));
                    if (i < ports.length() - 1) portStr.append(", ");
                }
            } else {
                portStr.append("Ninguno");
            }
            TextView tvPorts = new TextView(ctx);
            tvPorts.setText(portStr.toString());
            tvPorts.setTextColor(Color.parseColor("#38BDF8"));
            tvPorts.setTextSize(10f);
            layout.addView(tvPorts);
        }

        scroll.addView(layout);
        return scroll;
    }

    // --- 1. WIRES MODULE ---
    public static View buildWiresView(Context ctx, JSONObject mod, int selectedWireIndex, OnWireCutListener listener) {
        LinearLayout layout = new LinearLayout(ctx);
        layout.setOrientation(LinearLayout.VERTICAL);
        layout.setGravity(Gravity.CENTER_HORIZONTAL);
        layout.setPadding(4, 2, 4, 4);

        if (mod.optBoolean("solved")) {
            layout.addView(createSolvedBadge(ctx));
            return layout;
        }

        JSONArray wires = mod.optJSONArray("wires");
        if (wires == null) wires = mod.optJSONArray("colors");

        if (wires != null) {
            for (int i = 0; i < wires.length(); i++) {
                String colorName = wires.optString(i, "blanco").toLowerCase();

                LinearLayout wireRow = new LinearLayout(ctx);
                wireRow.setOrientation(LinearLayout.HORIZONTAL);
                wireRow.setGravity(Gravity.CENTER_VERTICAL);
                wireRow.setPadding(4, 1, 4, 1);

                TextView tvPointer = new TextView(ctx);
                tvPointer.setText(i == selectedWireIndex ? "▶" : " ");
                tvPointer.setTextColor(Color.parseColor("#00E5FF"));
                tvPointer.setTextSize(10f);
                tvPointer.setWidth(20);
                wireRow.addView(tvPointer);

                View wireLine = new View(ctx);
                LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(100, 8);
                lp.setMargins(4, 0, 4, 0);
                wireLine.setLayoutParams(lp);

                int wireColor = Color.WHITE;
                if ("rojo".equals(colorName)) wireColor = Color.parseColor("#EF4444");
                else if ("azul".equals(colorName)) wireColor = Color.parseColor("#3B82F6");
                else if ("amarillo".equals(colorName)) wireColor = Color.parseColor("#EAB308");
                else if ("negro".equals(colorName)) wireColor = Color.parseColor("#475569");
                wireLine.setBackgroundColor(wireColor);
                wireRow.addView(wireLine);

                TextView tvLabel = new TextView(ctx);
                tvLabel.setText(String.format(Locale.getDefault(), "#%d %s", i + 1, colorName.toUpperCase()));
                tvLabel.setTextColor(i == selectedWireIndex ? Color.parseColor("#00E5FF") : Color.parseColor("#94A3B8"));
                tvLabel.setTextSize(9f);
                tvLabel.setTypeface(i == selectedWireIndex ? Typeface.DEFAULT_BOLD : Typeface.DEFAULT);
                wireRow.addView(tvLabel);

                layout.addView(wireRow);
            }
        }

        Button btnCut = new Button(ctx);
        btnCut.setText("✂ CORTAR CABLE");
        btnCut.setTextSize(9f);
        btnCut.setTextColor(Color.parseColor("#EF4444"));
        btnCut.setBackgroundResource(R.drawable.btn_round_red);
        LinearLayout.LayoutParams btnLp = new LinearLayout.LayoutParams(
            LinearLayout.LayoutParams.WRAP_CONTENT, 36
        );
        btnLp.setMargins(0, 2, 0, 0);
        btnCut.setLayoutParams(btnLp);
        btnCut.setOnClickListener(v -> {
            if (listener != null) listener.onCut(selectedWireIndex);
        });
        layout.addView(btnCut);

        return layout;
    }

    // --- 2. THE BUTTON MODULE ---
    public static View buildButtonView(Context ctx, JSONObject mod, long remainingMs, OnButtonActionListener listener) {
        LinearLayout layout = new LinearLayout(ctx);
        layout.setOrientation(LinearLayout.VERTICAL);
        layout.setGravity(Gravity.CENTER_HORIZONTAL);
        layout.setPadding(4, 0, 4, 4);

        if (mod.optBoolean("solved")) {
            layout.addView(createSolvedBadge(ctx));
            return layout;
        }

        String color = mod.optString("color", "rojo").toLowerCase();
        String label = mod.optString("label", "Presionar").toUpperCase();
        String stripColor = mod.optString("stripColor", "azul").toLowerCase();

        final TextView tvStrip = new TextView(ctx);
        tvStrip.setText("FRANJA: " + stripColor.toUpperCase());
        tvStrip.setTextSize(9f);
        tvStrip.setTypeface(Typeface.DEFAULT_BOLD);
        tvStrip.setGravity(Gravity.CENTER);
        tvStrip.setVisibility(View.INVISIBLE);
        tvStrip.setPadding(8, 1, 8, 1);

        int stripBg = Color.BLUE;
        if ("rojo".equals(stripColor)) stripBg = Color.parseColor("#EF4444");
        else if ("amarillo".equals(stripColor)) stripBg = Color.parseColor("#EAB308");
        else if ("blanco".equals(stripColor)) stripBg = Color.WHITE;
        else if ("azul".equals(stripColor)) stripBg = Color.parseColor("#2563EB");
        tvStrip.setTextColor(stripBg);
        layout.addView(tvStrip);

        final Button btnBig = new Button(ctx);
        btnBig.setText(label);
        btnBig.setTextSize(12f);
        btnBig.setTypeface(Typeface.DEFAULT_BOLD);
        btnBig.setTextColor(Color.WHITE);

        int btnColor = Color.parseColor("#EF4444");
        if ("azul".equals(color)) btnColor = Color.parseColor("#2563EB");
        else if ("amarillo".equals(color)) btnColor = Color.parseColor("#D97706");
        else if ("blanco".equals(color)) {
            btnColor = Color.parseColor("#E2E8F0");
            btnBig.setTextColor(Color.BLACK);
        }
        btnBig.setBackgroundColor(btnColor);
        LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(110, 80);
        lp.setMargins(0, 2, 0, 2);
        btnBig.setLayoutParams(lp);

        final Handler handler = new Handler(Looper.getMainLooper());
        final boolean[] isHolding = {false};
        final Runnable holdRunnable = () -> {
            isHolding[0] = true;
            tvStrip.setVisibility(View.VISIBLE);
        };

        btnBig.setOnTouchListener((v, event) -> {
            switch (event.getAction()) {
                case MotionEvent.ACTION_DOWN:
                    isHolding[0] = false;
                    handler.postDelayed(holdRunnable, 400);
                    return true;
                case MotionEvent.ACTION_UP:
                case MotionEvent.ACTION_CANCEL:
                    handler.removeCallbacks(holdRunnable);
                    if (isHolding[0]) {
                        int seconds = (int) (remainingMs / 1000);
                        int digit = seconds % 10;
                        if (listener != null) listener.onAction("hold_release", digit);
                    } else {
                        if (listener != null) listener.onAction("tap", 0);
                    }
                    tvStrip.setVisibility(View.INVISIBLE);
                    isHolding[0] = false;
                    return true;
            }
            return false;
        });

        layout.addView(btnBig);

        TextView tvHint = new TextView(ctx);
        tvHint.setText("Toca o mantén pulsado");
        tvHint.setTextColor(Color.parseColor("#64748B"));
        tvHint.setTextSize(8f);
        layout.addView(tvHint);

        return layout;
    }

    // --- 3. KEYPADS MODULE ---
    public static View buildKeypadsView(Context ctx, JSONObject mod, OnKeypadClickListener listener) {
        LinearLayout layout = new LinearLayout(ctx);
        layout.setOrientation(LinearLayout.VERTICAL);
        layout.setGravity(Gravity.CENTER_HORIZONTAL);
        layout.setPadding(4, 2, 4, 4);

        if (mod.optBoolean("solved")) {
            layout.addView(createSolvedBadge(ctx));
            return layout;
        }

        JSONArray symbols = mod.optJSONArray("symbols");
        int currentStep = mod.optInt("currentStep", 0);
        JSONArray correctSeq = mod.optJSONArray("correctSequence");

        if (symbols != null && symbols.length() >= 4) {
            LinearLayout row1 = new LinearLayout(ctx);
            row1.setOrientation(LinearLayout.HORIZONTAL);
            row1.setGravity(Gravity.CENTER);

            LinearLayout row2 = new LinearLayout(ctx);
            row2.setOrientation(LinearLayout.HORIZONTAL);
            row2.setGravity(Gravity.CENTER);

            for (int i = 0; i < 4; i++) {
                final String sym = symbols.optString(i);
                Button btn = new Button(ctx);
                btn.setText(sym);
                btn.setTextSize(16f);
                btn.setTextColor(Color.parseColor("#F8FAFC"));
                btn.setBackgroundResource(R.drawable.btn_round_dark);
                LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(54, 46);
                lp.setMargins(3, 2, 3, 2);
                btn.setLayoutParams(lp);

                boolean isPressed = false;
                if (correctSeq != null) {
                    for (int s = 0; s < currentStep && s < correctSeq.length(); s++) {
                        if (sym.equals(correctSeq.optString(s))) {
                            isPressed = true;
                            break;
                        }
                    }
                }
                if (isPressed) {
                    btn.setTextColor(Color.parseColor("#10B981"));
                    btn.setText(sym + "✓");
                    btn.setEnabled(false);
                } else {
                    btn.setOnClickListener(v -> {
                        if (listener != null) listener.onClick(sym);
                    });
                }

                if (i < 2) row1.addView(btn);
                else row2.addView(btn);
            }
            layout.addView(row1);
            layout.addView(row2);
        }

        return layout;
    }

    // --- 4. SIMON SAYS MODULE ---
    public static View buildSimonView(Context ctx, JSONObject mod, String flashColor, OnSimonClickListener listener) {
        LinearLayout layout = new LinearLayout(ctx);
        layout.setOrientation(LinearLayout.VERTICAL);
        layout.setGravity(Gravity.CENTER_HORIZONTAL);
        layout.setPadding(4, 0, 4, 4);

        if (mod.optBoolean("solved")) {
            layout.addView(createSolvedBadge(ctx));
            return layout;
        }

        int stage = mod.optInt("currentStage", 1);
        int total = mod.optJSONArray("sequence") != null ? mod.optJSONArray("sequence").length() : 3;

        TextView tvStage = new TextView(ctx);
        tvStage.setText(String.format(Locale.getDefault(), "ETAPA %d / %d", stage, total));
        tvStage.setTextColor(Color.parseColor("#00E5FF"));
        tvStage.setTextSize(9f);
        tvStage.setTypeface(Typeface.DEFAULT_BOLD);
        layout.addView(tvStage);

        Button btnRed = createSimonButton(ctx, "ROJO", "#EF4444", "rojo".equalsIgnoreCase(flashColor), listener);
        layout.addView(btnRed);

        LinearLayout midRow = new LinearLayout(ctx);
        midRow.setOrientation(LinearLayout.HORIZONTAL);
        midRow.setGravity(Gravity.CENTER);

        Button btnGreen = createSimonButton(ctx, "VERDE", "#10B981", "verde".equalsIgnoreCase(flashColor), listener);
        Button btnBlue = createSimonButton(ctx, "AZUL", "#3B82F6", "azul".equalsIgnoreCase(flashColor), listener);
        midRow.addView(btnGreen);
        midRow.addView(btnBlue);
        layout.addView(midRow);

        Button btnYellow = createSimonButton(ctx, "AMARILLO", "#FACC15", "amarillo".equalsIgnoreCase(flashColor), listener);
        layout.addView(btnYellow);

        return layout;
    }

    private static Button createSimonButton(Context ctx, String label, String hexColor, boolean isFlashing, OnSimonClickListener listener) {
        Button btn = new Button(ctx);
        btn.setText(label);
        btn.setTextSize(9f);
        btn.setTypeface(Typeface.DEFAULT_BOLD);
        btn.setTextColor(Color.WHITE);
        int baseColor = Color.parseColor(hexColor);
        if (isFlashing) {
            btn.setBackgroundColor(Color.WHITE);
            btn.setTextColor(Color.BLACK);
        } else {
            btn.setBackgroundColor(baseColor);
        }
        LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(66, 36);
        lp.setMargins(3, 1, 3, 1);
        btn.setLayoutParams(lp);
        btn.setOnClickListener(v -> {
            if (listener != null) listener.onClick(label.toLowerCase());
        });
        return btn;
    }

    // --- 5. MEMORY MODULE ---
    public static View buildMemoryView(Context ctx, JSONObject mod, int selectedIndex, OnMemoryClickListener listener) {
        LinearLayout layout = new LinearLayout(ctx);
        layout.setOrientation(LinearLayout.VERTICAL);
        layout.setGravity(Gravity.CENTER_HORIZONTAL);
        layout.setPadding(4, 0, 4, 4);

        if (mod.optBoolean("solved")) {
            layout.addView(createSolvedBadge(ctx));
            return layout;
        }

        int stageIdx = mod.optInt("currentStage", 0);
        JSONArray stages = mod.optJSONArray("stages");
        if (stages != null && stageIdx < stages.length()) {
            JSONObject stage = stages.optJSONObject(stageIdx);
            int displayNum = stage.optInt("displayNumber", 1);
            JSONArray buttons = stage.optJSONArray("buttons");

            TextView tvStage = new TextView(ctx);
            tvStage.setText(String.format(Locale.getDefault(), "ETAPA %d / 5", stageIdx + 1));
            tvStage.setTextColor(Color.parseColor("#00E5FF"));
            tvStage.setTextSize(9f);
            tvStage.setTypeface(Typeface.DEFAULT_BOLD);
            layout.addView(tvStage);

            TextView tvDisp = new TextView(ctx);
            tvDisp.setText(String.valueOf(displayNum));
            tvDisp.setTextColor(Color.parseColor("#FBBF24"));
            tvDisp.setTextSize(20f);
            tvDisp.setTypeface(Typeface.MONOSPACE, Typeface.BOLD);
            tvDisp.setBackgroundResource(R.drawable.btn_round_dark);
            tvDisp.setPadding(14, 2, 14, 2);
            layout.addView(tvDisp);

            if (buttons != null) {
                LinearLayout row = new LinearLayout(ctx);
                row.setOrientation(LinearLayout.HORIZONTAL);
                row.setGravity(Gravity.CENTER);
                row.setPadding(0, 4, 0, 0);

                for (int i = 0; i < buttons.length(); i++) {
                    final int idx = i;
                    final int val = buttons.optInt(i);
                    Button b = new Button(ctx);
                    b.setText(String.valueOf(val));
                    b.setTextSize(12f);
                    b.setTextColor(idx == selectedIndex ? Color.parseColor("#00E5FF") : Color.WHITE);
                    b.setBackgroundResource(idx == selectedIndex ? R.drawable.btn_round_cyan : R.drawable.btn_round_dark);
                    LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(38, 38);
                    lp.setMargins(2, 2, 2, 2);
                    b.setLayoutParams(lp);
                    b.setOnClickListener(v -> {
                        if (listener != null) listener.onClick(idx, val);
                    });
                    row.addView(b);
                }
                layout.addView(row);
            }
        }

        return layout;
    }

    // --- 6. PASSWORDS MODULE ---
    public static View buildPasswordsView(Context ctx, JSONObject mod, int activeCol, int[] colIndices, OnPasswordSubmitListener listener) {
        LinearLayout layout = new LinearLayout(ctx);
        layout.setOrientation(LinearLayout.VERTICAL);
        layout.setGravity(Gravity.CENTER_HORIZONTAL);
        layout.setPadding(4, 0, 4, 4);

        if (mod.optBoolean("solved")) {
            layout.addView(createSolvedBadge(ctx));
            return layout;
        }

        JSONArray columns = mod.optJSONArray("columns");
        StringBuilder currentWord = new StringBuilder();

        if (columns != null) {
            LinearLayout row = new LinearLayout(ctx);
            row.setOrientation(LinearLayout.HORIZONTAL);
            row.setGravity(Gravity.CENTER);

            for (int i = 0; i < 5; i++) {
                final int colIdx = i;
                JSONArray colLetters = columns.optJSONArray(i);
                int letterIdx = colIndices != null && colIndices.length > i ? colIndices[i] : 0;
                String letter = "A";
                if (colLetters != null && colLetters.length() > 0) {
                    letter = colLetters.optString(letterIdx % colLetters.length());
                }
                currentWord.append(letter);

                Button btnCol = new Button(ctx);
                btnCol.setText(letter.toUpperCase());
                btnCol.setTextSize(12f);
                btnCol.setTextColor(i == activeCol ? Color.parseColor("#00E5FF") : Color.WHITE);
                btnCol.setBackgroundResource(i == activeCol ? R.drawable.btn_round_cyan : R.drawable.btn_round_dark);
                LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(32, 40);
                lp.setMargins(1, 1, 1, 1);
                btnCol.setLayoutParams(lp);
                row.addView(btnCol);
            }
            layout.addView(row);
        }

        TextView tvHint = new TextView(ctx);
        tvHint.setText("Bisel cambia letra");
        tvHint.setTextColor(Color.parseColor("#64748B"));
        tvHint.setTextSize(8f);
        tvHint.setPadding(0, 2, 0, 2);
        layout.addView(tvHint);

        Button btnSubmit = new Button(ctx);
        btnSubmit.setText("✔ INGRESAR");
        btnSubmit.setTextSize(10f);
        btnSubmit.setTextColor(Color.parseColor("#10B981"));
        btnSubmit.setBackgroundResource(R.drawable.btn_round_green);
        LinearLayout.LayoutParams btnLp = new LinearLayout.LayoutParams(
            LinearLayout.LayoutParams.WRAP_CONTENT, 50
        );
        btnSubmit.setLayoutParams(btnLp);
        final String wordToSend = currentWord.toString();
        btnSubmit.setOnClickListener(v -> {
            if (listener != null) listener.onSubmit(wordToSend);
        });
        layout.addView(btnSubmit);

        return layout;
    }

    private static View createSolvedBadge(Context ctx) {
        TextView tv = new TextView(ctx);
        tv.setText("¡DESARMADO! ✓");
        tv.setTextColor(Color.parseColor("#10B981"));
        tv.setTextSize(14f);
        tv.setTypeface(Typeface.DEFAULT_BOLD);
        tv.setPadding(0, 16, 0, 16);
        return tv;
    }
}
