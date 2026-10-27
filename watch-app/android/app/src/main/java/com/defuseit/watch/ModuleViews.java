package com.defuseit.watch;

import android.content.Context;
import android.graphics.Color;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.os.Handler;
import android.os.Looper;
import android.view.Gravity;
import android.view.MotionEvent;
import android.view.View;
import android.view.ViewGroup;
import android.widget.FrameLayout;
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
    public interface OnPasswordColSelectListener { void onColSelect(int colIndex); }
    public interface OnWireSelectListener { void onSelect(int wireIndex); }

    public static int dpToPx(Context ctx, int dp) {
        return (int) (dp * ctx.getResources().getDisplayMetrics().density + 0.5f);
    }

    // --- 0. EDGEWORK VIEW ---
    public static View buildEdgeworkView(Context ctx, JSONObject edgework) {
        ScrollView scroll = new ScrollView(ctx);
        scroll.setFillViewport(true);
        scroll.setVerticalScrollBarEnabled(false);

        LinearLayout layout = new LinearLayout(ctx);
        layout.setOrientation(LinearLayout.VERTICAL);
        layout.setGravity(Gravity.CENTER_HORIZONTAL);
        layout.setPadding(dpToPx(ctx, 6), dpToPx(ctx, 4), dpToPx(ctx, 6), dpToPx(ctx, 24));

        TextView tvTitle = new TextView(ctx);
        tvTitle.setText("CARCASA (EDGEWORK)");
        tvTitle.setTextColor(Color.parseColor("#00E5FF"));
        tvTitle.setTextSize(10f);
        tvTitle.setTypeface(Typeface.DEFAULT_BOLD);
        tvTitle.setGravity(Gravity.CENTER);
        layout.addView(tvTitle);

        if (edgework != null) {
            String serial = edgework.optString("serialNumber", "------");

            TextView tvSerial = new TextView(ctx);
            tvSerial.setText("SERIAL: " + serial);
            tvSerial.setTextColor(Color.parseColor("#FBBF24"));
            tvSerial.setTextSize(14f);
            tvSerial.setTypeface(Typeface.MONOSPACE, Typeface.BOLD);
            tvSerial.setGravity(Gravity.CENTER);
            tvSerial.setPadding(0, dpToPx(ctx, 4), 0, dpToPx(ctx, 4));
            layout.addView(tvSerial);

            JSONObject bat = edgework.optJSONObject("batteries");
            int total = bat != null ? bat.optInt("total", 0) : 0;
            int aa = bat != null ? bat.optInt("aa", 0) : 0;
            int d = bat != null ? bat.optInt("d", 0) : 0;
            TextView tvBat = new TextView(ctx);
            tvBat.setText(String.format(Locale.getDefault(), "Baterías: %d (AA: %d, D: %d)", total, aa, d));
            tvBat.setTextColor(Color.parseColor("#F1F5F9"));
            tvBat.setTextSize(10f);
            tvBat.setGravity(Gravity.CENTER);
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
            tvInds.setGravity(Gravity.CENTER);
            tvInds.setPadding(0, dpToPx(ctx, 2), 0, dpToPx(ctx, 2));
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
            tvPorts.setGravity(Gravity.CENTER);
            layout.addView(tvPorts);
        }

        scroll.addView(layout);
        return scroll;
    }

    // --- 1. WIRES MODULE (HORIZONTAL WIRES WITH VERTICAL SCISSORS CUT BUTTON) ---
    public static View buildWiresView(Context ctx, JSONObject mod, int selectedWireIndex,
                                      OnWireSelectListener selectListener, OnWireCutListener cutListener) {
        LinearLayout layout = new LinearLayout(ctx);
        layout.setOrientation(LinearLayout.HORIZONTAL);
        layout.setGravity(Gravity.CENTER);
        layout.setPadding(dpToPx(ctx, 4), dpToPx(ctx, 2), dpToPx(ctx, 4), dpToPx(ctx, 2));

        if (mod.optBoolean("solved")) {
            LinearLayout solvedLayout = new LinearLayout(ctx);
            solvedLayout.setOrientation(LinearLayout.VERTICAL);
            solvedLayout.setGravity(Gravity.CENTER);
            solvedLayout.addView(createSolvedBadge(ctx));
            return solvedLayout;
        }

        JSONArray wires = mod.optJSONArray("wires");
        if (wires == null) wires = mod.optJSONArray("colors");

        if (wires != null && wires.length() > 0) {
            int count = wires.length();

            // Left/Center: Container of horizontal wire rows
            LinearLayout wiresCol = new LinearLayout(ctx);
            wiresCol.setOrientation(LinearLayout.VERTICAL);
            wiresCol.setGravity(Gravity.CENTER_VERTICAL);
            wiresCol.setPadding(0, 0, dpToPx(ctx, 8), 0);

            // Compute wire height based on count so 6 wires fit snugly
            int wireHeight = count > 4 ? dpToPx(ctx, 8) : dpToPx(ctx, 10);
            int rowMargin = count > 4 ? dpToPx(ctx, 2) : dpToPx(ctx, 3);
            int wireWidth = dpToPx(ctx, 88);

            for (int i = 0; i < count; i++) {
                final int wireIdx = i;
                String colorName = wires.optString(i, "blanco").toLowerCase();
                boolean isSelected = (wireIdx == selectedWireIndex);

                LinearLayout wireRow = new LinearLayout(ctx);
                wireRow.setOrientation(LinearLayout.HORIZONTAL);
                wireRow.setGravity(Gravity.CENTER_VERTICAL);
                wireRow.setPadding(0, rowMargin, 0, rowMargin);
                wireRow.setClickable(true);
                wireRow.setFocusable(true);
                wireRow.setOnClickListener(v -> {
                    if (selectListener != null) selectListener.onSelect(wireIdx);
                });

                // Pointer Arrow on the left
                TextView tvPointer = new TextView(ctx);
                tvPointer.setText(isSelected ? "▶" : " ");
                tvPointer.setTextColor(Color.parseColor("#00E5FF"));
                tvPointer.setTextSize(10f);
                tvPointer.setWidth(dpToPx(ctx, 14));
                tvPointer.setGravity(Gravity.CENTER);
                wireRow.addView(tvPointer);

                // Horizontal wire line
                View wireLine = new View(ctx);
                LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(wireWidth, wireHeight);
                lp.setMargins(dpToPx(ctx, 2), 0, 0, 0);
                wireLine.setLayoutParams(lp);

                int wireColor = Color.WHITE;
                if ("rojo".equals(colorName)) wireColor = Color.parseColor("#EF4444");
                else if ("azul".equals(colorName)) wireColor = Color.parseColor("#3B82F6");
                else if ("amarillo".equals(colorName)) wireColor = Color.parseColor("#FACC15");
                else if ("negro".equals(colorName)) wireColor = Color.parseColor("#1E293B");

                GradientDrawable wireG = new GradientDrawable();
                wireG.setShape(GradientDrawable.RECTANGLE);
                wireG.setColor(wireColor);
                wireG.setCornerRadius(dpToPx(ctx, 5));

                if (isSelected) {
                    wireG.setStroke(dpToPx(ctx, 2), Color.parseColor("#00E5FF"));
                } else {
                    wireG.setStroke(1, Color.parseColor("#475569"));
                }
                wireLine.setBackground(wireG);
                wireRow.addView(wireLine);

                wiresCol.addView(wireRow);
            }
            layout.addView(wiresCol);

            // Right: Vertical Red Cut Button (Capsule) with rotated scissors icon inside
            FrameLayout btnCut = new FrameLayout(ctx);
            btnCut.setBackgroundResource(R.drawable.btn_round_red);
            btnCut.setClickable(true);
            btnCut.setFocusable(true);

            int totalColHeight = count * (wireHeight + rowMargin * 2);
            int btnHeight = Math.max(totalColHeight, dpToPx(ctx, 48));
            int btnWidth = dpToPx(ctx, 30);

            LinearLayout.LayoutParams btnLp = new LinearLayout.LayoutParams(btnWidth, btnHeight);
            btnCut.setLayoutParams(btnLp);

            TextView tvScissors = new TextView(ctx);
            tvScissors.setText("✂");
            tvScissors.setTextSize(18f);
            tvScissors.setTextColor(Color.WHITE);
            tvScissors.setGravity(Gravity.CENTER);
            // Rotate scissors text so it points vertically
            tvScissors.setRotation(90f);

            FrameLayout.LayoutParams scisLp = new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
            );
            scisLp.gravity = Gravity.CENTER;
            tvScissors.setLayoutParams(scisLp);
            btnCut.addView(tvScissors);

            btnCut.setOnClickListener(v -> {
                if (cutListener != null) cutListener.onCut(selectedWireIndex);
            });
            layout.addView(btnCut);
        }

        return layout;
    }

    // --- 2. THE BUTTON MODULE ---
    public static View buildButtonView(Context ctx, JSONObject mod, long remainingMs, OnButtonActionListener listener) {
        LinearLayout layout = new LinearLayout(ctx);
        layout.setOrientation(LinearLayout.VERTICAL);
        layout.setGravity(Gravity.CENTER_HORIZONTAL);
        layout.setPadding(dpToPx(ctx, 4), 0, dpToPx(ctx, 4), dpToPx(ctx, 4));

        if (mod.optBoolean("solved")) {
            layout.addView(createSolvedBadge(ctx));
            return layout;
        }

        String color = mod.optString("color", "rojo").toLowerCase();
        String label = mod.optString("label", "Presionar").toUpperCase();
        String stripColor = mod.optString("stripColor", "azul").toLowerCase();

        // Neon Glow Strip Header (visible when holding)
        final TextView tvStrip = new TextView(ctx);
        tvStrip.setText("⚡ FRANJA: " + stripColor.toUpperCase() + " ⚡");
        tvStrip.setTextSize(10f);
        tvStrip.setTypeface(Typeface.DEFAULT_BOLD);
        tvStrip.setGravity(Gravity.CENTER);
        tvStrip.setVisibility(View.INVISIBLE);
        tvStrip.setPadding(dpToPx(ctx, 8), dpToPx(ctx, 2), dpToPx(ctx, 8), dpToPx(ctx, 2));

        int tempStrip = Color.BLUE;
        if ("rojo".equals(stripColor)) tempStrip = Color.parseColor("#EF4444");
        else if ("amarillo".equals(stripColor)) tempStrip = Color.parseColor("#FACC15");
        else if ("blanco".equals(stripColor)) tempStrip = Color.WHITE;
        else if ("azul".equals(stripColor)) tempStrip = Color.parseColor("#38BDF8");
        final int stripBg = tempStrip;
        tvStrip.setTextColor(stripBg);
        layout.addView(tvStrip);

        // Circular arcade button container
        FrameLayout buttonFrame = new FrameLayout(ctx);
        int btnDiameter = dpToPx(ctx, 84);
        LinearLayout.LayoutParams frameLp = new LinearLayout.LayoutParams(btnDiameter, btnDiameter);
        frameLp.setMargins(0, dpToPx(ctx, 2), 0, dpToPx(ctx, 2));
        buttonFrame.setLayoutParams(frameLp);

        // Circular background drawable
        int btnBgColor = Color.parseColor("#EF4444");
        int btnTextColor = Color.WHITE;
        if ("azul".equals(color)) btnBgColor = Color.parseColor("#2563EB");
        else if ("amarillo".equals(color)) {
            btnBgColor = Color.parseColor("#D97706");
            btnTextColor = Color.WHITE;
        } else if ("blanco".equals(color)) {
            btnBgColor = Color.parseColor("#F1F5F9");
            btnTextColor = Color.BLACK;
        }

        GradientDrawable circularBg = new GradientDrawable();
        circularBg.setShape(GradientDrawable.OVAL);
        circularBg.setColor(btnBgColor);
        circularBg.setStroke(dpToPx(ctx, 4), Color.parseColor("#FFFFFF"));
        buttonFrame.setBackground(circularBg);

        final TextView tvBtnLabel = new TextView(ctx);
        tvBtnLabel.setText(label);
        tvBtnLabel.setTextSize(13f);
        tvBtnLabel.setTypeface(Typeface.DEFAULT_BOLD);
        tvBtnLabel.setTextColor(btnTextColor);
        tvBtnLabel.setGravity(Gravity.CENTER);
        FrameLayout.LayoutParams textLp = new FrameLayout.LayoutParams(
            FrameLayout.LayoutParams.MATCH_PARENT, FrameLayout.LayoutParams.MATCH_PARENT
        );
        tvBtnLabel.setLayoutParams(textLp);
        buttonFrame.addView(tvBtnLabel);

        final Handler handler = new Handler(Looper.getMainLooper());
        final boolean[] isHolding = {false};
        final Runnable holdRunnable = () -> {
            isHolding[0] = true;
            tvStrip.setVisibility(View.VISIBLE);
            circularBg.setStroke(dpToPx(ctx, 5), stripBg);
            buttonFrame.setBackground(circularBg);
        };

        buttonFrame.setOnTouchListener((v, event) -> {
            switch (event.getAction()) {
                case MotionEvent.ACTION_DOWN:
                    isHolding[0] = false;
                    handler.postDelayed(holdRunnable, 350);
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
                    circularBg.setStroke(dpToPx(ctx, 4), Color.parseColor("#FFFFFF"));
                    buttonFrame.setBackground(circularBg);
                    isHolding[0] = false;
                    return true;
            }
            return false;
        });

        layout.addView(buttonFrame);
        return layout;
    }

    // --- 3. KEYPADS MODULE ---
    public static View buildKeypadsView(Context ctx, JSONObject mod, OnKeypadClickListener listener) {
        LinearLayout layout = new LinearLayout(ctx);
        layout.setOrientation(LinearLayout.VERTICAL);
        layout.setGravity(Gravity.CENTER_HORIZONTAL);
        layout.setPadding(dpToPx(ctx, 4), dpToPx(ctx, 2), dpToPx(ctx, 4), dpToPx(ctx, 4));

        if (mod.optBoolean("solved")) {
            layout.addView(createSolvedBadge(ctx));
            return layout;
        }

        // Support both "displaySymbols" and "symbols"
        JSONArray symbols = mod.optJSONArray("displaySymbols");
        if (symbols == null) symbols = mod.optJSONArray("symbols");

        int currentStep = mod.optInt("currentStep", 0);
        JSONArray correctSeq = mod.optJSONArray("correctSequence");

        if (symbols != null && symbols.length() >= 4) {
            LinearLayout row1 = new LinearLayout(ctx);
            row1.setOrientation(LinearLayout.HORIZONTAL);
            row1.setGravity(Gravity.CENTER);

            LinearLayout row2 = new LinearLayout(ctx);
            row2.setOrientation(LinearLayout.HORIZONTAL);
            row2.setGravity(Gravity.CENTER);
            row2.setPadding(0, dpToPx(ctx, 4), 0, 0);

            for (int i = 0; i < 4; i++) {
                final String sym = symbols.optString(i);

                TextView btn = new TextView(ctx);
                btn.setText(sym);
                btn.setTextSize(20f);
                btn.setTypeface(Typeface.DEFAULT_BOLD);
                btn.setGravity(Gravity.CENTER);

                LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(dpToPx(ctx, 52), dpToPx(ctx, 42));
                lp.setMargins(dpToPx(ctx, 3), 0, dpToPx(ctx, 3), 0);
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
                    btn.setText(sym + "✓");
                    btn.setTextColor(Color.parseColor("#10B981"));
                    btn.setBackgroundResource(R.drawable.btn_round_green);
                } else {
                    btn.setTextColor(Color.parseColor("#F8FAFC"));
                    btn.setBackgroundResource(R.drawable.btn_round_dark);
                    btn.setClickable(true);
                    btn.setFocusable(true);
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
    public static View buildSimonView(Context ctx, JSONObject mod, JSONObject edgework, String flashColor, OnSimonClickListener listener) {
        LinearLayout layout = new LinearLayout(ctx);
        layout.setOrientation(LinearLayout.VERTICAL);
        layout.setGravity(Gravity.CENTER_HORIZONTAL);
        layout.setPadding(dpToPx(ctx, 4), 0, dpToPx(ctx, 4), dpToPx(ctx, 4));

        if (mod.optBoolean("solved")) {
            layout.addView(createSolvedBadge(ctx));
            return layout;
        }

        int stage = mod.optInt("currentStage", 1);
        int total = mod.optJSONArray("sequence") != null ? mod.optJSONArray("sequence").length() : 3;

        // Serial helper banner so the player knows what to report to the expert
        String serialText = "";
        if (edgework != null) {
            String sNum = edgework.optString("serialNumber", "");
            if (!sNum.isEmpty()) {
                serialText = " | SERIAL: " + sNum;
            }
        }

        TextView tvHeader = new TextView(ctx);
        tvHeader.setText(String.format("ETAPA %d / %d%s", stage, total, serialText));
        tvHeader.setTextColor(Color.parseColor("#00E5FF"));
        tvHeader.setTextSize(9f);
        tvHeader.setTypeface(Typeface.DEFAULT_BOLD);
        tvHeader.setGravity(Gravity.CENTER);
        tvHeader.setPadding(0, 0, 0, dpToPx(ctx, 2));
        layout.addView(tvHeader);

        // 2x2 Quadrant layout: Top (Red | Blue), Bottom (Yellow | Green)
        LinearLayout topRow = new LinearLayout(ctx);
        topRow.setOrientation(LinearLayout.HORIZONTAL);
        topRow.setGravity(Gravity.CENTER);

        TextView btnRed = createSimonArcButton(ctx, "ROJO", "#EF4444", "rojo".equalsIgnoreCase(flashColor), listener);
        TextView btnBlue = createSimonArcButton(ctx, "AZUL", "#3B82F6", "azul".equalsIgnoreCase(flashColor), listener);
        topRow.addView(btnRed);
        topRow.addView(btnBlue);
        layout.addView(topRow);

        LinearLayout botRow = new LinearLayout(ctx);
        botRow.setOrientation(LinearLayout.HORIZONTAL);
        botRow.setGravity(Gravity.CENTER);
        botRow.setPadding(0, dpToPx(ctx, 3), 0, 0);

        TextView btnYellow = createSimonArcButton(ctx, "AMARILLO", "#FACC15", "amarillo".equalsIgnoreCase(flashColor), listener);
        TextView btnGreen = createSimonArcButton(ctx, "VERDE", "#10B981", "verde".equalsIgnoreCase(flashColor), listener);
        botRow.addView(btnYellow);
        botRow.addView(btnGreen);
        layout.addView(botRow);

        return layout;
    }

    private static TextView createSimonArcButton(Context ctx, String label, String hexColor, boolean isFlashing, OnSimonClickListener listener) {
        TextView btn = new TextView(ctx);
        btn.setText(label);
        btn.setTextSize(10f);
        btn.setTypeface(Typeface.DEFAULT_BOLD);
        btn.setGravity(Gravity.CENTER);

        GradientDrawable bg = new GradientDrawable();
        bg.setShape(GradientDrawable.RECTANGLE);
        bg.setCornerRadius(dpToPx(ctx, 10));

        if (isFlashing) {
            bg.setColor(Color.WHITE);
            bg.setStroke(dpToPx(ctx, 2), Color.parseColor("#FBBF24"));
            btn.setTextColor(Color.BLACK);
        } else {
            bg.setColor(Color.parseColor(hexColor));
            bg.setStroke(1, Color.parseColor("#FFFFFF"));
            btn.setTextColor(Color.WHITE);
        }
        btn.setBackground(bg);

        LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(dpToPx(ctx, 62), dpToPx(ctx, 38));
        lp.setMargins(dpToPx(ctx, 2), 0, dpToPx(ctx, 2), 0);
        btn.setLayoutParams(lp);

        btn.setClickable(true);
        btn.setFocusable(true);
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
        layout.setPadding(dpToPx(ctx, 4), 0, dpToPx(ctx, 4), dpToPx(ctx, 4));

        if (mod.optBoolean("solved")) {
            layout.addView(createSolvedBadge(ctx));
            return layout;
        }

        int stageIdx = mod.optInt("currentStage", 0);
        JSONArray stages = mod.optJSONArray("stages");
        if (stages != null && stageIdx < stages.length()) {
            JSONObject stage = stages.optJSONObject(stageIdx);
            // In server bombGenerator: property is named "display"!
            int displayNum = stage.optInt("display", stage.optInt("displayNumber", 1));
            JSONArray buttons = stage.optJSONArray("buttons");

            TextView tvStage = new TextView(ctx);
            tvStage.setText(String.format(Locale.getDefault(), "ETAPA %d / 5", stageIdx + 1));
            tvStage.setTextColor(Color.parseColor("#00E5FF"));
            tvStage.setTextSize(9f);
            tvStage.setTypeface(Typeface.DEFAULT_BOLD);
            layout.addView(tvStage);

            // CRT Display screen for the large number
            TextView tvDisp = new TextView(ctx);
            tvDisp.setText(String.valueOf(displayNum));
            tvDisp.setTextColor(Color.parseColor("#FBBF24"));
            tvDisp.setTextSize(26f);
            tvDisp.setTypeface(Typeface.MONOSPACE, Typeface.BOLD);
            tvDisp.setGravity(Gravity.CENTER);
            tvDisp.setBackgroundResource(R.drawable.btn_round_dark);
            tvDisp.setWidth(dpToPx(ctx, 58));
            tvDisp.setHeight(dpToPx(ctx, 36));
            layout.addView(tvDisp);

            if (buttons != null) {
                LinearLayout row = new LinearLayout(ctx);
                row.setOrientation(LinearLayout.HORIZONTAL);
                row.setGravity(Gravity.CENTER);
                row.setPadding(0, dpToPx(ctx, 4), 0, 0);

                for (int i = 0; i < buttons.length(); i++) {
                    final int idx = i;
                    final int val = buttons.optInt(i);

                    TextView b = new TextView(ctx);
                    b.setText(String.valueOf(val));
                    b.setTextSize(15f);
                    b.setTypeface(Typeface.DEFAULT_BOLD);
                    b.setGravity(Gravity.CENTER);

                    if (idx == selectedIndex) {
                        b.setTextColor(Color.parseColor("#00E5FF"));
                        b.setBackgroundResource(R.drawable.btn_round_cyan);
                    } else {
                        b.setTextColor(Color.WHITE);
                        b.setBackgroundResource(R.drawable.btn_round_dark);
                    }

                    LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(dpToPx(ctx, 34), dpToPx(ctx, 34));
                    lp.setMargins(dpToPx(ctx, 2), 0, dpToPx(ctx, 2), 0);
                    b.setLayoutParams(lp);

                    b.setClickable(true);
                    b.setFocusable(true);
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
    public static View buildPasswordsView(Context ctx, JSONObject mod, int activeCol, int[] colIndices,
                                          OnPasswordColSelectListener colSelectListener,
                                          OnPasswordSubmitListener submitListener) {
        LinearLayout layout = new LinearLayout(ctx);
        layout.setOrientation(LinearLayout.VERTICAL);
        layout.setGravity(Gravity.CENTER_HORIZONTAL);
        layout.setPadding(dpToPx(ctx, 4), 0, dpToPx(ctx, 4), dpToPx(ctx, 4));

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

                LinearLayout colBox = new LinearLayout(ctx);
                colBox.setOrientation(LinearLayout.VERTICAL);
                colBox.setGravity(Gravity.CENTER);
                colBox.setClickable(true);
                colBox.setFocusable(true);
                colBox.setOnClickListener(v -> {
                    if (colSelectListener != null) colSelectListener.onColSelect(colIdx);
                });

                if (i == activeCol) {
                    colBox.setBackgroundResource(R.drawable.btn_round_cyan);
                } else {
                    colBox.setBackgroundResource(R.drawable.btn_round_dark);
                }

                LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(dpToPx(ctx, 28), dpToPx(ctx, 44));
                lp.setMargins(dpToPx(ctx, 1), 0, dpToPx(ctx, 1), 0);
                colBox.setLayoutParams(lp);

                TextView tvArrowUp = new TextView(ctx);
                tvArrowUp.setText("▲");
                tvArrowUp.setTextSize(7f);
                tvArrowUp.setTextColor(i == activeCol ? Color.parseColor("#00E5FF") : Color.parseColor("#64748B"));
                tvArrowUp.setGravity(Gravity.CENTER);
                colBox.addView(tvArrowUp);

                TextView tvLetter = new TextView(ctx);
                tvLetter.setText(letter.toUpperCase());
                tvLetter.setTextSize(15f);
                tvLetter.setTypeface(Typeface.DEFAULT_BOLD);
                tvLetter.setTextColor(i == activeCol ? Color.parseColor("#00E5FF") : Color.WHITE);
                tvLetter.setGravity(Gravity.CENTER);
                colBox.addView(tvLetter);

                TextView tvArrowDown = new TextView(ctx);
                tvArrowDown.setText("▼");
                tvArrowDown.setTextSize(7f);
                tvArrowDown.setTextColor(i == activeCol ? Color.parseColor("#00E5FF") : Color.parseColor("#64748B"));
                tvArrowDown.setGravity(Gravity.CENTER);
                colBox.addView(tvArrowDown);

                row.addView(colBox);
            }
            layout.addView(row);
        }

        // Prominent Submit button showing current word
        TextView btnSubmit = new TextView(ctx);
        final String wordToSend = currentWord.toString();
        btnSubmit.setText(String.format("✔ INGRESAR: %s", wordToSend.toUpperCase()));
        btnSubmit.setTextSize(10f);
        btnSubmit.setTypeface(Typeface.DEFAULT_BOLD);
        btnSubmit.setTextColor(Color.WHITE);
        btnSubmit.setGravity(Gravity.CENTER);
        btnSubmit.setBackgroundResource(R.drawable.btn_round_green);
        btnSubmit.setClickable(true);
        btnSubmit.setFocusable(true);

        LinearLayout.LayoutParams btnLp = new LinearLayout.LayoutParams(
            dpToPx(ctx, 140), dpToPx(ctx, 28)
        );
        btnLp.setMargins(0, dpToPx(ctx, 4), 0, 0);
        btnSubmit.setLayoutParams(btnLp);
        btnSubmit.setOnClickListener(v -> {
            if (submitListener != null) submitListener.onSubmit(wordToSend);
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
        tv.setGravity(Gravity.CENTER);
        tv.setPadding(0, dpToPx(ctx, 16), 0, dpToPx(ctx, 16));
        return tv;
    }
}
