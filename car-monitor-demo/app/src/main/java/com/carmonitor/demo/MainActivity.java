package com.carmonitor.demo;

import android.app.Activity;
import android.content.Context;
import android.content.pm.ActivityInfo;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.LinearGradient;
import android.graphics.Paint;
import android.graphics.RectF;
import android.graphics.Shader;
import android.os.Bundle;
import android.view.MotionEvent;
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
        private final int bg = Color.rgb(6, 8, 10);
        private final int panel = Color.rgb(15, 18, 22);
        private final int panel2 = Color.rgb(20, 24, 29);
        private final int border = Color.rgb(45, 49, 55);
        private final int orange = Color.rgb(255, 136, 0);
        private final int yellow = Color.rgb(255, 190, 0);
        private final int amber = Color.rgb(255, 211, 84);
        private final int white = Color.rgb(245, 247, 249);
        private final int muted = Color.rgb(163, 170, 178);
        private final int green = Color.rgb(80, 220, 110);
        private final int red = Color.rgb(255, 82, 66);

        private float s = 1f;
        private int tick = 0;
        private int page = 0; // 0 Inicio, 1 Viaje, 2 Motor, 3 Errores
        private final RectF[] navRects = {new RectF(), new RectF(), new RectF(), new RectF()};

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

        private void text(Canvas c, String t, float x, float y, float size, int color, Paint.Align align, boolean bold) {
            p.setShader(null);
            p.setStyle(Paint.Style.FILL);
            p.setColor(color);
            p.setTextSize(size * s);
            p.setTextAlign(align);
            p.setTypeface(bold ? android.graphics.Typeface.DEFAULT_BOLD : android.graphics.Typeface.DEFAULT);
            c.drawText(t, x, y, p);
        }

        private void round(Canvas c, float l, float t, float r, float b, float radius, int color) {
            p.setShader(null);
            p.setStyle(Paint.Style.FILL);
            p.setColor(color);
            c.drawRoundRect(new RectF(l, t, r, b), radius * s, radius * s, p);
        }

        private void stroke(Canvas c, float l, float t, float r, float b, float radius, int color, float w) {
            p.setShader(null);
            p.setStyle(Paint.Style.STROKE);
            p.setStrokeWidth(w * s);
            p.setColor(color);
            c.drawRoundRect(new RectF(l, t, r, b), radius * s, radius * s, p);
        }

        private void line(Canvas c, float x1, float y1, float x2, float y2, int color, float w) {
            p.setShader(null);
            p.setStyle(Paint.Style.STROKE);
            p.setStrokeWidth(w * s);
            p.setColor(color);
            c.drawLine(x1, y1, x2, y2, p);
        }

        private void gradient(Canvas c, float l, float t, float r, float b, int c1, int c2) {
            p.setStyle(Paint.Style.FILL);
            p.setShader(new LinearGradient(l, t, r, b, c1, c2, Shader.TileMode.CLAMP));
            c.drawRoundRect(new RectF(l,t,r,b), 22*s, 22*s, p);
            p.setShader(null);
        }

        @Override
        protected void onDraw(Canvas c) {
            super.onDraw(c);
            float w = getWidth(), h = getHeight();
            s = Math.max(0.72f, Math.min(w / 1600f, h / 900f));
            c.drawColor(bg);
            drawTop(c, w);
            if (page == 0) drawHome(c, w, h);
            else if (page == 1) drawTrip(c, w, h);
            else if (page == 2) drawEngine(c, w, h);
            else drawErrors(c, w, h);
            drawBottom(c, w, h);
        }

        private void drawTop(Canvas c, float w) {
            float m = 26*s;
            String now = new SimpleDateFormat("HH:mm", Locale.getDefault()).format(new Date());
            text(c, now, m, 46*s, 28, white, Paint.Align.LEFT, true);
            text(c, "27°C exterior", 150*s, 46*s, 25, amber, Paint.Align.LEFT, true);

            String title = page == 0 ? "CAR MONITOR" : page == 1 ? "VIAJE" : page == 2 ? "MOTOR" : "ERRORES";
            text(c, title, m, 96*s, 34, white, Paint.Align.LEFT, true);

            float r = w - m;
            round(c, r-365*s, 18*s, r-176*s, 62*s, 20, Color.rgb(58,43,5));
            stroke(c, r-365*s, 18*s, r-176*s, 62*s, 20, yellow, 1.4f);
            text(c, "MODO DEMO", r-270*s, 47*s, 18, yellow, Paint.Align.CENTER, true);

            round(c, r-162*s, 18*s, r, 62*s, 20, panel2);
            stroke(c, r-162*s, 18*s, r, 62*s, 20, red, 1.3f);
            p.setStyle(Paint.Style.FILL); p.setColor(red); c.drawCircle(r-140*s, 40*s, 5*s, p);
            text(c, "OBD OFF", r-77*s, 47*s, 18, white, Paint.Align.CENTER, true);
            line(c, m, 116*s, w-m, 116*s, border, 1);
        }

        private void drawHome(Canvas c, float w, float h) {
            float m=26*s, top=136*s, bottom=h-104*s, gap=14*s;
            float leftR = w*0.61f;
            gradient(c,m,top,leftR,bottom,Color.rgb(17,20,24),Color.rgb(9,11,13));
            stroke(c,m,top,leftR,bottom,22,border,1);

            int rpm = 2150 + (int)(Math.sin(tick/2.8)*65);
            int speed = 87 + (int)(Math.sin(tick/3.3)*2);
            float centerY = top + (bottom-top)*0.43f;
            float r = Math.min(190*s, (bottom-top)*0.34f);
            float gx1 = m + (leftR-m)*0.31f;
            float gx2 = m + (leftR-m)*0.72f;
            drawGauge(c,gx1,centerY,r,0,8,rpm/1000f,String.valueOf(rpm),"RPM",true);
            drawGauge(c,gx2,centerY,r,0,240,speed,String.valueOf(speed),"km/h",false);

            float infoY = bottom-118*s;
            line(c,m+30*s,infoY-30*s,leftR-30*s,infoY-30*s,border,1);
            text(c,"CONSUMO ACTUAL",m+40*s,infoY,21,muted,Paint.Align.LEFT,true);
            text(c,"6.4",m+40*s,infoY+62*s,52,yellow,Paint.Align.LEFT,true);
            text(c,"L/100 km",m+155*s,infoY+57*s,24,white,Paint.Align.LEFT,true);
            text(c,"MEDIA",m+365*s,infoY,21,muted,Paint.Align.LEFT,true);
            text(c,"6.8",m+365*s,infoY+62*s,46,white,Paint.Align.LEFT,true);
            text(c,"L/100 km",m+470*s,infoY+57*s,21,muted,Paint.Align.LEFT,false);

            float rl = leftR+gap, rr=w-m;
            float cardGap=12*s, cw=(rr-rl-cardGap)/2f, ch=(bottom-top-2*cardGap)/3f;
            smallCard(c,rl,top,rl+cw,top+ch,"MOTOR","89","°C",yellow);
            smallCard(c,rl+cw+cardGap,top,rr,top+ch,"BATERÍA","14.2","V",green);
            smallCard(c,rl,top+ch+cardGap,rl+cw,top+2*ch+cardGap,"CARGA","34","%",orange);
            smallCard(c,rl+cw+cardGap,top+ch+cardGap,rr,top+2*ch+cardGap,"TRAYECTO","124.6","km",white);
            float y3=top+2*ch+2*cardGap;
            round(c,rl,y3,rr,bottom,18,panel);
            stroke(c,rl,y3,rr,bottom,18,border,1);
            text(c,"SISTEMA OBD",rl+28*s,y3+42*s,19,muted,Paint.Align.LEFT,true);
            text(c,"Sin errores",rl+28*s,y3+91*s,32,green,Paint.Align.LEFT,true);
        }

        private void drawTrip(Canvas c, float w, float h) {
            float m=26*s, top=136*s, bottom=h-104*s, gap=14*s;
            float heroR=w*0.48f;
            gradient(c,m,top,heroR,bottom,Color.rgb(18,21,25),Color.rgb(10,12,14));
            stroke(c,m,top,heroR,bottom,22,border,1);
            text(c,"VIAJE ACTUAL",m+36*s,top+50*s,22,muted,Paint.Align.LEFT,true);
            text(c,"124.6",m+36*s,top+165*s,88,white,Paint.Align.LEFT,true);
            text(c,"km",m+320*s,top+156*s,30,amber,Paint.Align.LEFT,true);
            text(c,"1 h 42 min",m+36*s,top+235*s,38,white,Paint.Align.LEFT,true);
            text(c,"Tiempo en marcha",m+36*s,top+269*s,19,muted,Paint.Align.LEFT,false);
            line(c,m+36*s,top+305*s,heroR-36*s,top+305*s,border,1);
            text(c,"6.8",m+36*s,top+395*s,60,yellow,Paint.Align.LEFT,true);
            text(c,"L/100 km  media",m+178*s,top+388*s,22,muted,Paint.Align.LEFT,true);
            text(c,"73 km/h",m+36*s,top+470*s,34,white,Paint.Align.LEFT,true);
            text(c,"Velocidad media",m+36*s,top+505*s,19,muted,Paint.Align.LEFT,false);

            float rl=heroR+gap, rr=w-m, cg=12*s, cw=(rr-rl-cg)/2f, ch=(bottom-top-cg)/2f;
            smallCard(c,rl,top,rl+cw,top+ch,"COMBUSTIBLE","8.5","L",yellow);
            smallCard(c,rl+cw+cg,top,rr,top+ch,"V. MÁXIMA","112","km/h",orange);
            smallCard(c,rl,top+ch+cg,rl+cw,bottom,"PARADO","18","min",white);
            smallCard(c,rl+cw+cg,top+ch+cg,rr,bottom,"AUTONOMÍA","---","km",muted);
        }

        private void drawEngine(Canvas c, float w, float h) {
            float m=26*s, top=136*s, bottom=h-104*s, gap=14*s;
            float cw=(w-2*m-2*gap)/3f, ch=(bottom-top-gap)/2f;
            engineCard(c,m,top,m+cw,top+ch,"RPM","2.150","rpm",yellow,"Régimen actual");
            engineCard(c,m+cw+gap,top,m+2*cw+gap,top+ch,"MOTOR","89","°C",orange,"Temperatura refrigerante");
            engineCard(c,m+2*cw+2*gap,top,w-m,top+ch,"BATERÍA","14.2","V",green,"Alternador correcto");
            engineCard(c,m,top+ch+gap,m+cw,bottom,"CARGA","34","%",yellow,"Carga calculada");
            engineCard(c,m+cw+gap,top+ch+gap,m+2*cw+gap,bottom,"MAF","18.7","g/s",white,"Caudal de aire");
            engineCard(c,m+2*cw+2*gap,top+ch+gap,w-m,bottom,"ADMISIÓN","31","°C",white,"Temperatura aire");
        }

        private void drawErrors(Canvas c, float w, float h) {
            float m=26*s, top=136*s, bottom=h-104*s;
            gradient(c,m,top,w-m,bottom,Color.rgb(17,20,23),Color.rgb(9,11,13));
            stroke(c,m,top,w-m,bottom,22,border,1);
            float cx=w/2f;
            p.setStyle(Paint.Style.STROKE); p.setStrokeWidth(8*s); p.setColor(green);
            c.drawCircle(cx,top+160*s,72*s,p);
            line(c,cx-32*s,top+160*s,cx-8*s,top+184*s,green,8);
            line(c,cx-8*s,top+184*s,cx+38*s,top+134*s,green,8);
            text(c,"SIN ERRORES",cx,top+285*s,48,green,Paint.Align.CENTER,true);
            text(c,"No hay códigos de avería almacenados",cx,top+335*s,24,white,Paint.Align.CENTER,false);
            text(c,"Cuando conectemos el OBD, aquí aparecerán los DTC reales del coche.",cx,top+388*s,21,muted,Paint.Align.CENTER,false);
            round(c,cx-190*s,top+445*s,cx+190*s,top+515*s,18,Color.rgb(55,42,5));
            stroke(c,cx-190*s,top+445*s,cx+190*s,top+515*s,18,yellow,1.4f);
            text(c,"LEER ERRORES",cx,top+490*s,24,yellow,Paint.Align.CENTER,true);
        }

        private void smallCard(Canvas c, float l,float t,float r,float b,String label,String value,String unit,int accent) {
            round(c,l,t,r,b,18,panel);
            stroke(c,l,t,r,b,18,border,1);
            round(c,l+18*s,t+18*s,l+24*s,b-18*s,3,accent);
            text(c,label,l+42*s,t+38*s,18,muted,Paint.Align.LEFT,true);
            text(c,value,l+42*s,t+95*s,42,white,Paint.Align.LEFT,true);
            text(c,unit,r-18*s,t+93*s,21,accent,Paint.Align.RIGHT,true);
        }

        private void engineCard(Canvas c,float l,float t,float r,float b,String label,String value,String unit,int accent,String sub) {
            round(c,l,t,r,b,18,panel);
            stroke(c,l,t,r,b,18,border,1);
            text(c,label,l+26*s,t+45*s,21,muted,Paint.Align.LEFT,true);
            text(c,value,l+26*s,t+125*s,54,white,Paint.Align.LEFT,true);
            text(c,unit,r-24*s,t+118*s,23,accent,Paint.Align.RIGHT,true);
            line(c,l+26*s,b-58*s,r-26*s,b-58*s,border,1);
            text(c,sub,l+26*s,b-24*s,19,muted,Paint.Align.LEFT,false);
        }

        private void drawGauge(Canvas c,float cx,float cy,float r,float min,float max,float value,String main,String unit,boolean rpmGauge) {
            p.setStyle(Paint.Style.FILL); p.setColor(Color.rgb(10,13,16)); c.drawCircle(cx,cy,r,p);
            RectF rr=new RectF(cx-r+8*s,cy-r+8*s,cx+r-8*s,cy+r-8*s);
            p.setStyle(Paint.Style.STROKE); p.setStrokeCap(Paint.Cap.ROUND); p.setStrokeWidth(11*s);
            p.setColor(Color.rgb(43,47,52)); c.drawArc(rr,135,270,false,p);
            p.setColor(yellow); c.drawArc(rr,135,165,false,p);
            p.setColor(orange); c.drawArc(rr,300,75,false,p);
            if(rpmGauge){p.setColor(red);c.drawArc(rr,25,65,false,p);}

            int ticks=rpmGauge?8:12;
            for(int i=0;i<=ticks;i++){
                float a=(float)Math.toRadians(135+270f*i/ticks);
                float x1=cx+(float)Math.cos(a)*(r-22*s), y1=cy+(float)Math.sin(a)*(r-22*s);
                float x2=cx+(float)Math.cos(a)*(r-38*s), y2=cy+(float)Math.sin(a)*(r-38*s);
                line(c,x1,y1,x2,y2,white,1.8f);
                String n=rpmGauge?String.valueOf(i):String.valueOf(i*20);
                float tx=cx+(float)Math.cos(a)*(r-62*s), ty=cy+(float)Math.sin(a)*(r-62*s)+5*s;
                text(c,n,tx,ty,14,muted,Paint.Align.CENTER,false);
            }

            float frac=Math.max(0,Math.min(1,(value-min)/(max-min)));
            float a=(float)Math.toRadians(135+270*frac);
            float nx=cx+(float)Math.cos(a)*(r-54*s), ny=cy+(float)Math.sin(a)*(r-54*s);
            line(c,cx,cy,nx,ny,amber,4.5f);
            p.setStyle(Paint.Style.FILL);p.setColor(amber);c.drawCircle(cx,cy,7*s,p);
            text(c,main,cx,cy+8*s,46,white,Paint.Align.CENTER,true);
            text(c,unit,cx,cy+45*s,22,muted,Paint.Align.CENTER,true);
        }

        private void drawBottom(Canvas c,float w,float h) {
            float top=h-88*s;
            line(c,26*s,top,w-26*s,top,border,1);
            String[] labels={"Inicio","Viaje","Motor","Errores"};
            String[] icons={"●","◆","■","▲"};
            float each=w/4f;
            for(int i=0;i<4;i++){
                float l=i*each, r=(i+1)*each, cx=(l+r)/2f;
                navRects[i].set(l,top,r,h);
                int color=page==i?yellow:muted;
                text(c,icons[i],cx,top+30*s,18,color,Paint.Align.CENTER,true);
                text(c,labels[i],cx,top+61*s,20,color,Paint.Align.CENTER,page==i);
                if(page==i) round(c,cx-54*s,h-8*s,cx+54*s,h-4*s,2,yellow);
            }
        }

        @Override
        public boolean onTouchEvent(MotionEvent e) {
            if(e.getAction()==MotionEvent.ACTION_UP){
                float x=e.getX(), y=e.getY();
                for(int i=0;i<4;i++){
                    if(navRects[i].contains(x,y)){
                        page=i;
                        invalidate();
                        return true;
                    }
                }
            }
            return true;
        }
    }
}
