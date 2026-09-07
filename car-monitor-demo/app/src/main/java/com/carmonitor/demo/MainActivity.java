package com.carmonitor.demo;

import android.app.Activity;
import android.content.Context;
import android.content.pm.ActivityInfo;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.graphics.RectF;
import android.os.Bundle;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

public class MainActivity extends Activity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        requestWindowFeature(Window.FEATURE_NO_TITLE);
        setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_LANDSCAPE);
        getWindow().setFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN, WindowManager.LayoutParams.FLAG_FULLSCREEN);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        getWindow().getDecorView().setSystemUiVisibility(
                View.SYSTEM_UI_FLAG_FULLSCREEN |
                View.SYSTEM_UI_FLAG_HIDE_NAVIGATION |
                View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY |
                View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN |
                View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION |
                View.SYSTEM_UI_FLAG_LAYOUT_STABLE);
        setContentView(new DashboardView(this));
    }

    static class DashboardView extends View {
        private final Paint p = new Paint(Paint.ANTI_ALIAS_FLAG);
        private final int bg = Color.rgb(8, 10, 12);
        private final int panel = Color.rgb(18, 21, 24);
        private final int panel2 = Color.rgb(24, 28, 32);
        private final int line = Color.rgb(48, 53, 58);
        private final int orange = Color.rgb(255, 157, 0);
        private final int yellow = Color.rgb(255, 197, 0);
        private final int white = Color.rgb(244, 246, 248);
        private final int muted = Color.rgb(160, 168, 176);
        private final int green = Color.rgb(104, 220, 99);
        private final int red = Color.rgb(255, 91, 72);
        private float scale = 1f;
        private int tick = 0;

        DashboardView(Context c) {
            super(c);
            setBackgroundColor(bg);
            postDelayed(new Runnable() {
                @Override public void run() {
                    tick++;
                    invalidate();
                    postDelayed(this, 1000);
                }
            }, 1000);
        }

        private void txt(Canvas c, String s, float x, float y, float size, int color, Paint.Align align, boolean bold) {
            p.setStyle(Paint.Style.FILL);
            p.setColor(color);
            p.setTextSize(size * scale);
            p.setTextAlign(align);
            p.setTypeface(bold ? android.graphics.Typeface.DEFAULT_BOLD : android.graphics.Typeface.DEFAULT);
            c.drawText(s, x, y, p);
        }

        private void round(Canvas c, float l, float t, float r, float b, float radius, int color) {
            p.setStyle(Paint.Style.FILL);
            p.setColor(color);
            c.drawRoundRect(new RectF(l, t, r, b), radius * scale, radius * scale, p);
        }

        private void line(Canvas c, float x1, float y1, float x2, float y2, int color, float width) {
            p.setStyle(Paint.Style.STROKE);
            p.setStrokeWidth(width * scale);
            p.setColor(color);
            c.drawLine(x1, y1, x2, y2, p);
        }

        @Override
        protected void onDraw(Canvas c) {
            super.onDraw(c);
            float w = getWidth(), h = getHeight();
            scale = Math.max(0.72f, Math.min(w / 1600f, h / 900f));
            float topH = 150 * scale;
            float bottomH = 105 * scale;
            float margin = 26 * scale;

            c.drawColor(bg);

            // Header
            txt(c, new SimpleDateFormat("HH:mm", Locale.getDefault()).format(new Date()), margin, 54*scale, 30, white, Paint.Align.LEFT, false);
            txt(c, "☀  27°C exterior", 170*scale, 54*scale, 27, white, Paint.Align.LEFT, false);
            txt(c, "Car Monitor", margin, 108*scale, 38, white, Paint.Align.LEFT, true);
            txt(c, "Tu coche, siempre contigo", margin, 138*scale, 20, muted, Paint.Align.LEFT, false);

            float statusX = w - 620*scale;
            round(c, statusX, 22*scale, w-300*scale, 82*scale, 12, panel2);
            txt(c, "OBD no conectado", statusX+56*scale, 62*scale, 24, white, Paint.Align.LEFT, false);
            p.setStyle(Paint.Style.STROKE); p.setStrokeWidth(3*scale); p.setColor(red);
            c.drawRect(statusX+18*scale, 38*scale, statusX+42*scale, 58*scale, p);
            line(c, statusX+14*scale, 31*scale, statusX+48*scale, 66*scale, red, 3);
            round(c, w-280*scale, 22*scale, w-margin, 82*scale, 12, Color.rgb(48,39,8));
            p.setStyle(Paint.Style.STROKE); p.setStrokeWidth(2*scale); p.setColor(yellow);
            c.drawRoundRect(new RectF(w-280*scale,22*scale,w-margin,82*scale),12*scale,12*scale,p);
            txt(c, "Modo demostración", w-152*scale, 61*scale, 22, yellow, Paint.Align.CENTER, true);
            txt(c, "Explora la interfaz sin necesidad de un dispositivo OBD", statusX, 116*scale, 18, muted, Paint.Align.LEFT, false);
            line(c, margin, topH, w-margin, topH, line, 1);

            // Main layout
            float mainTop = topH + 22*scale;
            float mainBottom = h - bottomH - 14*scale;
            float leftW = w * 0.55f;
            float gaugeY = (mainTop + mainBottom) / 2f + 8*scale;
            float gaugeR = Math.min((mainBottom-mainTop)*0.43f, leftW*0.205f);
            float g1x = margin + gaugeR + 18*scale;
            float g2x = g1x + gaugeR*2 + 55*scale;

            int rpm = 2150 + (int)(Math.sin(tick/3.0)*70);
            int speed = 87 + (int)(Math.sin(tick/4.0)*2);
            drawGauge(c, g1x, gaugeY, gaugeR, 0, 8, rpm/1000f, String.valueOf(rpm), "RPM", true);
            drawGauge(c, g2x, gaugeY, gaugeR, 0, 240, speed, String.valueOf(speed), "km/h", false);

            // Cards
            float cardsX = Math.max(leftW+20*scale, g2x+gaugeR+30*scale);
            float cardsR = w-margin;
            float colGap = 14*scale;
            float colW = (cardsR-cardsX-colGap)/2f;
            float cardGap = 14*scale;
            float cardH = (mainBottom-mainTop-3*cardGap)/4f;

            card(c, cardsX, mainTop, cardsX+colW, mainTop+cardH, "▣", "Consumo actual", "6.4", "L/100 km");
            card(c, cardsX+colW+colGap, mainTop, cardsR, mainTop+cardH, "▥", "Consumo medio", "6.8", "L/100 km");
            float y2 = mainTop+cardH+cardGap;
            card(c, cardsX, y2, cardsX+colW, y2+cardH, "♨", "Temp. motor", "89°C", "");
            card(c, cardsX+colW+colGap, y2, cardsR, y2+cardH, "▭", "Voltaje batería", "14.2", "V");
            float y3 = y2+cardH+cardGap;
            card(c, cardsX, y3, cardsX+colW, y3+cardH, "⚙", "Carga motor", "34%", "");
            card(c, cardsX+colW+colGap, y3, cardsR, y3+cardH, "∥", "Trayecto", "124.6", "km");
            float y4 = y3+cardH+cardGap;
            round(c, cardsX, y4, cardsR, mainBottom, 14, panel);
            txt(c, "✓", cardsX+42*scale, y4+(mainBottom-y4)*0.65f, 36, green, Paint.Align.CENTER, true);
            txt(c, "Sin errores", cardsX+84*scale, y4+(mainBottom-y4)*0.65f, 27, green, Paint.Align.LEFT, true);
            txt(c, "›", cardsR-30*scale, y4+(mainBottom-y4)*0.64f, 36, muted, Paint.Align.CENTER, false);

            // Bottom nav
            float navTop = h-bottomH;
            line(c, margin, navTop, w-margin, navTop, line, 1);
            navItem(c, w*0.125f, navTop, bottomH, "⌂", "Inicio", true);
            navItem(c, w*0.375f, navTop, bottomH, "⌁", "Viaje", false);
            navItem(c, w*0.625f, navTop, bottomH, "⚙", "Motor", false);
            navItem(c, w*0.875f, navTop, bottomH, "△", "Errores", false);
        }

        private void card(Canvas c, float l, float t, float r, float b, String icon, String label, String value, String unit) {
            round(c,l,t,r,b,14,panel);
            txt(c, icon, l+42*scale, t+(b-t)*0.57f, 31, yellow, Paint.Align.CENTER, true);
            txt(c, label, l+82*scale, t+31*scale, 19, muted, Paint.Align.LEFT, false);
            txt(c, value, l+82*scale, b-20*scale, 37, white, Paint.Align.LEFT, true);
            if (!unit.isEmpty()) txt(c, unit, r-18*scale, b-22*scale, 19, muted, Paint.Align.RIGHT, false);
        }

        private void navItem(Canvas c, float cx, float top, float height, String icon, String label, boolean active) {
            int color = active ? yellow : muted;
            txt(c, icon, cx, top+43*scale, 31, color, Paint.Align.CENTER, true);
            txt(c, label, cx, top+78*scale, 20, color, Paint.Align.CENTER, active);
            if (active) {
                p.setStyle(Paint.Style.FILL); p.setColor(yellow);
                c.drawRoundRect(new RectF(cx-75*scale, top+91*scale, cx+75*scale, top+96*scale),3*scale,3*scale,p);
            }
        }

        private void drawGauge(Canvas c, float cx, float cy, float r, float min, float max, float value, String main, String unit, boolean rpmGauge) {
            p.setStyle(Paint.Style.FILL); p.setColor(Color.rgb(12,15,18)); c.drawCircle(cx,cy,r,p);
            p.setStyle(Paint.Style.STROKE); p.setStrokeWidth(12*scale); p.setStrokeCap(Paint.Cap.ROUND);
            RectF rr = new RectF(cx-r+10*scale,cy-r+10*scale,cx+r-10*scale,cy+r-10*scale);
            p.setColor(Color.rgb(45,49,52)); c.drawArc(rr,135,270,false,p);
            p.setColor(yellow); c.drawArc(rr,135,220,false,p);
            p.setColor(orange); c.drawArc(rr,355,50,false,p);
            if (rpmGauge) { p.setColor(Color.rgb(244,74,48)); c.drawArc(rr,45,45,false,p); }

            int ticks = rpmGauge ? 8 : 12;
            for (int i=0;i<=ticks;i++) {
                float a = (float)Math.toRadians(135 + 270f*i/ticks);
                float x1 = cx + (float)Math.cos(a)*(r-28*scale);
                float y1 = cy + (float)Math.sin(a)*(r-28*scale);
                float x2 = cx + (float)Math.cos(a)*(r-50*scale);
                float y2 = cy + (float)Math.sin(a)*(r-50*scale);
                line(c,x1,y1,x2,y2,white,2);
                String n = rpmGauge ? String.valueOf(i) : String.valueOf(i*20);
                float tx = cx + (float)Math.cos(a)*(r-77*scale);
                float ty = cy + (float)Math.sin(a)*(r-77*scale) + 7*scale;
                txt(c,n,tx,ty,17,white,Paint.Align.CENTER,false);
            }

            float frac = Math.max(0,Math.min(1,(value-min)/(max-min)));
            float angle = (float)Math.toRadians(135+270*frac);
            float nx = cx + (float)Math.cos(angle)*(r-62*scale);
            float ny = cy + (float)Math.sin(angle)*(r-62*scale);
            line(c,cx,cy,nx,ny,yellow,5);
            p.setStyle(Paint.Style.FILL); p.setColor(yellow); c.drawCircle(cx,cy,8*scale,p);
            txt(c,main,cx,cy+10*scale,50,white,Paint.Align.CENTER,true);
            txt(c,unit,cx,cy+50*scale,24,white,Paint.Align.CENTER,false);
            if (rpmGauge) txt(c,"x1000",cx,cy+r-27*scale,16,muted,Paint.Align.CENTER,false);
        }
    }
}
