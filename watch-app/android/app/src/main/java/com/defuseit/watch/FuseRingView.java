package com.defuseit.watch;

import android.content.Context;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.DashPathEffect;
import android.graphics.Paint;
import android.graphics.RadialGradient;
import android.graphics.RectF;
import android.graphics.Shader;
import android.util.AttributeSet;
import android.view.View;

import java.util.Random;

/**
 * FuseRingView - Cartoon Bomb Fuse (Mecha de Bomba Clásica)
 * Renders a braided rope wick around the circular bezel of Galaxy Watch 4,
 * burning down progressively in sync with the bomb countdown timer,
 * with animated crackling sparks and flame at the burning tip.
 */
public class FuseRingView extends View {

    private final Paint wickPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
    private final Paint ashPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
    private final Paint sparkPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
    private final Paint flameGlowPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
    private final Paint flameCorePaint = new Paint(Paint.ANTI_ALIAS_FLAG);

    private final RectF arcRect = new RectF();
    private final Random random = new Random();

    // Progress: 1.0 (full time) -> 0.0 (detonation)
    private float progress = 1.0f;
    private long lastAnimTime = 0;
    private int strikeCount = 0;

    // Sparks simulation
    private static final int NUM_SPARKS = 5;
    private final float[] sparkAngles = new float[NUM_SPARKS];
    private final float[] sparkDists = new float[NUM_SPARKS];
    private final float[] sparkRadii = new float[NUM_SPARKS];

    public FuseRingView(Context context) {
        super(context);
        init();
    }

    public FuseRingView(Context context, AttributeSet attrs) {
        super(context, attrs);
        init();
    }

    public FuseRingView(Context context, AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
        init();
    }

    private void init() {
        // Unburned braided wick (cuerda de mecha)
        wickPaint.setStyle(Paint.Style.STROKE);
        wickPaint.setStrokeWidth(7f);
        wickPaint.setColor(Color.parseColor("#8D6E63")); // Natural hemp brown
        wickPaint.setStrokeCap(Paint.Cap.ROUND);
        wickPaint.setPathEffect(new DashPathEffect(new float[]{8f, 4f}, 0));

        // Burned ash trail
        ashPaint.setStyle(Paint.Style.STROKE);
        ashPaint.setStrokeWidth(3f);
        ashPaint.setColor(Color.parseColor("#261C1C")); // Dark ash
        ashPaint.setStrokeCap(Paint.Cap.ROUND);

        // Sparks & Flame
        sparkPaint.setStyle(Paint.Style.FILL);
        flameGlowPaint.setStyle(Paint.Style.FILL);
        flameCorePaint.setStyle(Paint.Style.FILL);
        flameCorePaint.setColor(Color.parseColor("#FFFDE7")); // White-hot core
    }

    /**
     * Set remaining fraction from 1.0f down to 0.0f
     */
    public void setProgress(float prog) {
        this.progress = Math.max(0.0f, Math.min(1.0f, prog));
        postInvalidate();
    }

    public void setStrikes(int strikes) {
        this.strikeCount = strikes;
        postInvalidate();
    }

    @Override
    protected void onDraw(Canvas canvas) {
        super.onDraw(canvas);

        int w = getWidth();
        int h = getHeight();
        if (w == 0 || h == 0) return;

        float cx = w / 2f;
        float cy = h / 2f;
        float strokeInset = 6f; // Hugs right against the bezel
        float radius = (Math.min(w, h) / 2f) - strokeInset;

        arcRect.set(cx - radius, cy - radius, cx + radius, cy + radius);

        // Start angle at top: -90 degrees
        float startAngle = -90f;
        float sweepAngle = 360f * progress;

        // 1. Draw burned ash trail (the part that already burned)
        if (progress < 1.0f) {
            float ashStart = startAngle + sweepAngle;
            float ashSweep = 360f - sweepAngle;
            canvas.drawArc(arcRect, ashStart, ashSweep, false, ashPaint);
        }

        // 2. Draw unburned wick rope
        if (progress > 0.005f) {
            // Color shifts slightly to fiery orange if time is very low
            if (progress < 0.2f) {
                wickPaint.setColor(Color.parseColor("#D97706")); // Warning amber
            } else {
                wickPaint.setColor(Color.parseColor("#8D6E63")); // Classic hemp
            }
            canvas.drawArc(arcRect, startAngle, sweepAngle, false, wickPaint);

            // 3. Draw burning flame & sparks at the tip
            float tipAngleDeg = startAngle + sweepAngle;
            double tipAngleRad = Math.toRadians(tipAngleDeg);

            float tipX = cx + (float) (radius * Math.cos(tipAngleRad));
            float tipY = cy + (float) (radius * Math.sin(tipAngleRad));

            // Outer flame glow with radial gradient
            float glowRadius = 14f + random.nextFloat() * 4f;
            RadialGradient glow = new RadialGradient(
                tipX, tipY, glowRadius,
                new int[]{Color.parseColor("#FFFF6D00"), Color.parseColor("#80FF3D00"), Color.TRANSPARENT},
                new float[]{0.0f, 0.6f, 1.0f},
                Shader.TileMode.CLAMP
            );
            flameGlowPaint.setShader(glow);
            canvas.drawCircle(tipX, tipY, glowRadius, flameGlowPaint);

            // Inner hot core
            float coreRadius = 4.5f + random.nextFloat() * 2f;
            canvas.drawCircle(tipX, tipY, coreRadius, flameCorePaint);

            // 4. Crackling flying sparks (chispas que saltan de la mecha)
            long now = System.currentTimeMillis();
            boolean updateSparks = (now - lastAnimTime > 60);
            if (updateSparks) {
                lastAnimTime = now;
                for (int i = 0; i < NUM_SPARKS; i++) {
                    sparkAngles[i] = (float) (tipAngleDeg + (random.nextFloat() - 0.5f) * 120f);
                    sparkDists[i] = 6f + random.nextFloat() * 12f;
                    sparkRadii[i] = 1.2f + random.nextFloat() * 2f;
                }
            }

            for (int i = 0; i < NUM_SPARKS; i++) {
                double rad = Math.toRadians(sparkAngles[i]);
                float sx = tipX + (float) (sparkDists[i] * Math.cos(rad));
                float sy = tipY + (float) (sparkDists[i] * Math.sin(rad));

                sparkPaint.setColor(random.nextBoolean() ? Color.parseColor("#FFEE58") : Color.parseColor("#FF6D00"));
                canvas.drawCircle(sx, sy, sparkRadii[i], sparkPaint);
            }
        }

        // Keep sparks crackling at ~30-60 FPS
        if (progress > 0.0f && progress < 1.0f) {
            postInvalidateOnAnimation();
        }
    }
}
