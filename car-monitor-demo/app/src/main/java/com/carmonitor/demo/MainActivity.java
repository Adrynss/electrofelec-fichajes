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
        private final int bg = Color.rgb(5, 7, 9);
        private final int panel = Color.rgb(17, 20, 23);
        private final int panel2 = Color.rgb(24, 28, 32);
        private final int border = Color.rgb(48, 53, 58);
        private final int orange = Color.rgb(255, 143, 0);
        private final int yellow = Color.rgb(255, 194, 0);
        private final int yellow2 = Color.rgb(255, 220, 92);
        private final int white = Color.rgb(248, 249, 250);
        private final int muted = Color.rgb(170, 177, 184);
        private final int green = Color.rgb(92, 220, 126);
        private final int red = Color.rgb(255, 93, 72);
        private final int darkYellow = Color.rgb(60, 46, 5);

        private float scale = 1f;
        private int tick = 0;
        private int page = 0; // 0 inicio, 1 viaje, 2 motor, 3 errores, 4 conexión
        private String actionMessage = "";
        private long actionMessageUntil = 0;
        private final RectF connectionRect = new RectF();
        private final RectF primaryButtonRect = new RectF();

        DashboardView(Context c) {
            super(c);
            setBackgroundColor(bg);
            setFocusable(true);
            postDelayed(new Runnable() {
                @Override public void run() {
                    tick++;
                    invalidate();
                    postDelayed(this, 1000);
                }
            }, 1000);
        }

        private void txt(Canvas c, String s, float x, float y, float size, int color, Paint.Align align, boolean bold) {
            p.setShader(null);
            p.setStyle(Paint.Style.FILL);
            p.setColor(color);
            p.setTextSize(size * scale);
            p.setTextAlign(align);
            p.setTypeface(bold ? android.graphics.Typeface.DEFAULT_BOLD : android.graphics.Typeface.DEFAULT);
            c.drawText(s, x, y, p);
        }

        private void round(Canvas c, float l, float t, float r, float b, float radius, int color) {
            p.setShader(null);
            p.setStyle(Paint.Style.FILL);
            p.setColor(color);
            c.drawRoundRect(new RectF(l, t, r, b), radius * scale, radius * scale, p);
        }

        private void strokeRound(Canvas c, float l, float t, float r, float b, float radius, int color, float width) {
            p.setShader(null);
            p.setStyle(Paint.Style.STROKE);
            p.setStrokeWidth(width * scale);
            p.setColor(color);
            c.drawRoundRect(new RectF(l, t, r, b), radius * scale, radius * scale, p);
        }

        private void line(Canvas c, float x1, float y1, float x2, float y2, int color, float width) {
            p.setShader(null);
            p.setStyle(Paint.Style.STROKE);
            p.setStrokeWidth(width * scale);
            p.setColor(color);
            c.drawLine(x1, y1, x2, y2, p);
        }

        private void gradientRound(Canvas c, float l, float t, float r, float b, float radius, int c1, int c2) {
            p.setStyle(Paint.Style.FILL);
            p.setShader(new LinearGradient(l, t, r, b, c1, c2, Shader.TileMode.CLAMP));
            c.drawRoundRect(new RectF(l,t,r,b), radius*scale, radius*scale, p);
            p.setShader(null);
        }

        @Override
        protected void onDraw(Canvas c) {
            super.onDraw(c);
            float w = getWidth(), h = getHeight();
            scale = Math.max(0.68f, Math.min(w / 1600f, h / 900f));
            c.drawColor(bg);
            drawHeader(c, w, h);
            if (page == 0) drawHome(c, w, h);
            else if (page == 1) drawTrip(c, w, h);
            else if (page == 2) drawEngine(c, w, h);
            else if (page == 3) drawErrors(c, w, h);
            else drawConnection(c, w, h);
            drawNav(c, w, h);
            drawToast(c, w, h);
        }

        private void drawHeader(Canvas c, float w, float h) {
            float m = 28*scale;
            float headerH = 122*scale;
            String now = new SimpleDateFormat("HH:mm", Locale.getDefault()).format(new Date());

            txt(c, now, m, 52*scale, 33, white, Paint.Align.LEFT, true);
            txt(c, "27°C", 155*scale, 52*scale, 33, yellow2, Paint.Align.LEFT, true);
            txt(c, "exterior", 247*scale, 52*scale, 22, muted, Paint.Align.LEFT, false);

            String title = page == 0 ? "CAR MONITOR" : page == 1 ? "VIAJE" : page == 2 ? "MOTOR" : page == 3 ? "DIAGNÓSTICO" : "CONEXIÓN OBD";
            txt(c, title, m, 102*scale, 35, white, Paint.Align.LEFT, true);

            float demoL = w - 510*scale;
            round(c, demoL, 22*scale, demoL+185*scale, 70*scale, 22, darkYellow);
            strokeRound(c, demoL, 22*scale, demoL+185*scale, 70*scale, 22, yellow, 1.5f);
            txt(c, "MODO DEMO", demoL+92.5f*scale, 54*scale, 20, yellow, Paint.Align.CENTER, true);

            float connL = w - 305*scale;
            connectionRect.set(connL, 22*scale, w-m, 70*scale);
            round(c, connL, 22*scale, w-m, 70*scale, 22, panel2);
            strokeRound(c, connL, 22*scale, w-m, 70*scale, 22, red, 1.5f);
            p.setStyle(Paint.Style.FILL); p.setColor(red); c.drawCircle(connL+23*scale, 46*scale, 6*scale, p);
            txt(c, "OBD DESCONECTADO", connL+42*scale, 54*scale, 19, white, Paint.Align.LEFT, true);

            line(c, m, headerH, w-m, headerH, border, 1);
        }

        private void drawHome(Canvas c, float w, float h) {
            float m = 28*scale;
            float top = 145*scale;
            float bottom = h - 112*scale;
            float gap = 18*scale;
            float leftW = w*0.57f;
            float leftR = leftW - gap/2;
            float rightL = leftW + gap/2;
            float rightR = w-m;

            // Main speed panel
            gradientRound(c, m, top, leftR, bottom, 24, Color.rgb(20,23,26), Color.rgb(11,13,15));
            strokeRound(c, m, top, leftR, bottom, 24, Color.rgb(43,47,51), 1);
            txt(c, "VELOCIDAD", m+34*scale, top+45*scale, 24, muted, Paint.Align.LEFT, true);

            int speed = 87 + (int)(Math.sin(tick/3.0)*2);
            int rpm = 2150 + (int)(Math.sin(tick/2.8)*65);
            txt(c, String.valueOf(speed), m+42*scale, top+175*scale, 118, white, Paint.Align.LEFT, true);
            txt(c, "km/h", m+315*scale, top+166*scale, 34, yellow2, Paint.Align.LEFT, true);

            // RPM large line
            float rpmY = top + 250*scale;
            txt(c, "RPM", m+38*scale, rpmY, 24, muted, Paint.Align.LEFT, true);
            txt(c, String.format(Locale.getDefault(), "%,d", rpm).replace(',', '.'), m+155*scale, rpmY+4*scale, 54, white, Paint.Align.LEFT, true);
            drawRpmBar(c, m+38*scale, rpmY+35*scale, leftR-m-76*scale, rpm/7000f);

            // Consumption hero row
            float cTop = top + 350*scale;
            line(c, m+34*scale, cTop, leftR-34*scale, cTop, border, 1);
            txt(c, "CONSUMO AHORA", m+38*scale, cTop+49*scale, 23, muted, Paint.Align.LEFT, true);
            txt(c, "6.4", m+38*scale, cTop+126*scale, 66, yellow, Paint.Align.LEFT, true);
            txt(c, "L/100 km", m+188*scale, cTop+119*scale, 29, white, Paint.Align.LEFT, true);

            txt(c, "MEDIA", m+430*scale, cTop+49*scale, 23, muted, Paint.Align.LEFT, true);
            txt(c, "6.8", m+430*scale, cTop+126*scale, 56, white, Paint.Align.LEFT, true);
            txt(c, "L/100 km", m+560*scale, cTop+119*scale, 25, muted, Paint.Align.LEFT, true);

            // right cards 2x2
            float rgap = 16*scale;
            float cardW = (rightR-rightL-rgap)/2f;
            float cardH = (bottom-top-rgap)/2f;
            metricCard(c, rightL, top, rightL+cardW, top+cardH, "MOTOR", "89", "°C", yellow, "Temperatura");
            metricCard(c, rightL+cardW+rgap, top, rightR, top+cardH, "BATERÍA", "14.2", "V", green, "Carga correcta");
            metricCard(c, rightL, top+cardH+rgap, rightL+cardW, bottom, "CARGA", "34", "%", orange, "Motor");
            metricCard(c, rightL+cardW+rgap, top+cardH+rgap, rightR, bottom, "TRAYECTO", "124.6", "km", white, "Actual");
        }

        private void drawRpmBar(Canvas c, float x, float y, float width, float frac) {
            int segments = 14;
            float gap = 6*scale;
            float sw = (width-(segments-1)*gap)/segments;
            int lit = Math.round(Math.max(0, Math.min(1, frac))*segments);
            for (int i=0;i<segments;i++) {
                int color;
                if (i < lit) color = i > 10 ? red : (i > 7 ? orange : yellow);
                else color = Color.rgb(46,50,54);
                round(c, x+i*(sw+gap), y, x+i*(sw+gap)+sw, y+17*scale, 4, color);
            }
            txt(c, "1", x, y+49*scale, 17, muted, Paint.Align.LEFT, false);
            txt(c, "4", x+width*0.5f, y+49*scale, 17, muted, Paint.Align.CENTER, false);
            txt(c, "7", x+width, y+49*scale, 17, muted, Paint.Align.RIGHT, false);
        }

        private void metricCard(Canvas c, float l, float t, float r, float b, String label, String value, String unit, int accent, String sub) {
            round(c,l,t,r,b,20,panel);
            strokeRound(c,l,t,r,b,20,Color.rgb(40,44,48),1);
            round(c,l+22*scale,t+22*scale,l+29*scale,b-22*scale,4,accent);
            txt(c,label,l+52*scale,t+47*scale,22,muted,Paint.Align.LEFT,true);
            txt(c,value,l+52*scale,t+124*scale,54,white,Paint.Align.LEFT,true);
            txt(c,unit,r-24*scale,t+120*scale,25,accent,Paint.Align.RIGHT,true);
            txt(c,sub,l+52*scale,b-27*scale,20,muted,Paint.Align.LEFT,false);
        }

        private void drawTrip(Canvas c, float w, float h) {
            float m=28*scale, top=145*scale, bottom=h-112*scale, gap=18*scale;
            float heroW=w*0.43f;
            gradientRound(c,m,top,heroW,bottom,24,Color.rgb(22,24,27),Color.rgb(11,13,15));
            txt(c,"VIAJE ACTUAL",m+35*scale,top+47*scale,24,muted,Paint.Align.LEFT,true);
            txt(c,"124.6",m+35*scale,top+155*scale,88,white,Paint.Align.LEFT,true);
            txt(c,"km",m+315*scale,top+148*scale,32,yellow2,Paint.Align.LEFT,true);
            txt(c,"1 h 42 min",m+35*scale,top+220*scale,36,white,Paint.Align.LEFT,true);
            txt(c,"Tiempo en marcha",m+35*scale,top+255*scale,20,muted,Paint.Align.LEFT,false);
            line(c,m+35*scale,top+295*scale,heroW-35*scale,top+295*scale,border,1);
            txt(c,"6.8",m+35*scale,top+390*scale,62,yellow,Paint.Align.LEFT,true);
            txt(c,"L/100 km  MEDIA",m+180*scale,top+382*scale,23,muted,Paint.Align.LEFT,true);
            txt(c,"73 km/h",m+35*scale,top+465*scale,36,white,Paint.Align.LEFT,true);
            txt(c,"Velocidad media",m+35*scale,top+500*scale,20,muted,Paint.Align.LEFT,false);

            float rL=heroW+gap, rR=w-m, cardGap=16*scale;
            float cardW=(rR-rL-cardGap)/2f;
            float cardH=150*scale;
            metricSmall(c,rL,top,rL+cardW,top+cardH,"COMBUSTIBLE EST.","8.5","L",yellow);
            metricSmall(c,rL+cardW+cardGap,top,rR,top+cardH,"VELOCIDAD MÁX.","112","km/h",orange);
            metricSmall(c,rL,top+cardH+cardGap,rL+cardW,top+2*cardH+cardGap,"TIEMPO PARADO","18","min",white);
            metricSmall(c,rL+cardW+cardGap,top+cardH+cardGap,rR,top+2*cardH+cardGap,"AUTONOMÍA","---","km",muted);

            float btnT=top+2*cardH+cardGap*2;
            primaryButtonRect.set(rL,btnT,rR,bottom);
            gradientRound(c,rL,btnT,rR,bottom,20,Color.rgb(57,42,4),Color.rgb(37,29,5));
            strokeRound(c,rL,btnT,rR,bottom,20,yellow,1.5f);
            txt(c,"REINICIAR VIAJE",(rL+rR)/2f,btnT+(bottom-btnT)*0.53f,28,yellow,Paint.Align.CENTER,true);
            txt(c,"Poner distancia y medias a cero",(rL+rR)/2f,btnT+(bottom-btnT)*0.73f,19,muted,Paint.Align.CENTER,false);
        }

        private void metricSmall(Canvas c,float l,float t,float r,float b,String label,String value,String unit,int accent){
            round(c,l,t,r,b,18,panel);
            strokeRound(c,l,t,r,b,18,Color.rgb(40,44,48),1);
            txt(c,label,l+24*scale,t+38*scale,20,muted,Paint.Align.LEFT,true);
            txt(c,value,l+24*scale,b-28*scale,46,white,Paint.Align.LEFT,true);
            txt(c,unit,r-22*scale,b-30*scale,22,accent,Paint.Align.RIGHT,true);
        }

        private void drawEngine(Canvas c, float w, float h) {
            float m=28*scale, top=145*scale, bottom=h-112*scale, gap=16*scale;
            float heroH=125*scale;
            gradientRound(c,m,top,w-m,top+heroH,22,Color.rgb(21,25,20),Color.rgb(14,18,14));
            p.setStyle(Paint.Style.FILL);p.setColor(green);c.drawCircle(m+42*scale,top+62*scale,10*scale,p);
            txt(c,"MOTOR ESTABLE",m+72*scale,top+56*scale,30,white,Paint.Align.LEFT,true);
            txt(c,"Todos los valores están dentro de rango en modo demostración",m+72*scale,top+90*scale,21,muted,Paint.Align.LEFT,false);
            txt(c,"89°C",w-m-35*scale,top+72*scale,42,yellow,Paint.Align.RIGHT,true);

            float gridTop=top+heroH+gap;
            float cols=3, cardW=(w-2*m-2*gap)/3f;
            float cardH=(bottom-gridTop-gap)/2f;
            metricCard(c,m,gridTop,m+cardW,gridTop+cardH,"REFRIGERANTE","89","°C",yellow,"Temperatura motor");
            metricCard(c,m+cardW+gap,gridTop,m+2*cardW+gap,gridTop+cardH,"BATERÍA","14.2","V",green,"Alternador correcto");
            metricCard(c,m+2*cardW+2*gap,gridTop,w-m,gridTop+cardH,"CARGA","34","%",orange,"Carga calculada");
            float y2=gridTop+cardH+gap;
            metricCard(c,m,y2,m+cardW,bottom,"MAF","18.6","g/s",white,"Caudal de aire");
            metricCard(c,m+cardW+gap,y2,m+2*cardW+gap,bottom,"ADMISIÓN","31","°C",yellow2,"Aire de entrada");
            metricCard(c,m+2*cardW+2*gap,y2,w-m,bottom,"ACELERADOR","18","%",white,"Posición");
        }

        private void drawErrors(Canvas c, float w, float h) {
            float m=28*scale, top=145*scale, bottom=h-112*scale;
            float centerX=w/2f;
            round(c,m,top,w-m,bottom,24,panel);
            strokeRound(c,m,top,w-m,bottom,24,Color.rgb(40,44,48),1);
            p.setStyle(Paint.Style.STROKE);p.setStrokeWidth(7*scale);p.setColor(green);c.drawCircle(centerX,top+125*scale,44*scale,p);
            line(c,centerX-18*scale,top+126*scale,centerX-4*scale,top+140*scale,green,6);
            line(c,centerX-4*scale,top+140*scale,centerX+24*scale,top+108*scale,green,6);
            txt(c,"SIN ERRORES",centerX,top+225*scale,48,white,Paint.Align.CENTER,true);
            txt(c,"Modo demostración",centerX,top+267*scale,23,yellow,Paint.Align.CENTER,true);
            txt(c,"Cuando conectemos el OBD, aquí aparecerán los códigos DTC y su descripción.",centerX,top+321*scale,22,muted,Paint.Align.CENTER,false);
            txt(c,"También podrás borrar los errores compatibles desde esta pantalla.",centerX,top+357*scale,22,muted,Paint.Align.CENTER,false);
            float bw=520*scale, bh=96*scale;
            primaryButtonRect.set(centerX-bw/2,bottom-bh-28*scale,centerX+bw/2,bottom-28*scale);
            gradientRound(c,primaryButtonRect.left,primaryButtonRect.top,primaryButtonRect.right,primaryButtonRect.bottom,20,Color.rgb(57,42,4),Color.rgb(37,29,5));
            strokeRound(c,primaryButtonRect.left,primaryButtonRect.top,primaryButtonRect.right,primaryButtonRect.bottom,20,yellow,1.5f);
            txt(c,"ESCANEAR VEHÍCULO",centerX,primaryButtonRect.top+59*scale,27,yellow,Paint.Align.CENTER,true);
        }

        private void drawConnection(Canvas c, float w, float h) {
            float m=28*scale, top=145*scale, bottom=h-112*scale, gap=18*scale;
            float leftR=w*0.56f;
            round(c,m,top,leftR,bottom,24,panel);
            txt(c,"ADAPTADOR PREPARADO",m+34*scale,top+47*scale,23,muted,Paint.Align.LEFT,true);
            txt(c,"Vgate iCar Pro 2S",m+34*scale,top+105*scale,42,white,Paint.Align.LEFT,true);
            txt(c,"Bluetooth Classic / ELM327",m+34*scale,top+148*scale,24,yellow2,Paint.Align.LEFT,true);
            line(c,m+34*scale,top+185*scale,leftR-34*scale,top+185*scale,border,1);
            statusRow(c,m+34*scale,top+235*scale,"Bluetooth","Pendiente",red);
            statusRow(c,m+34*scale,top+305*scale,"Adaptador","No conectado",red);
            statusRow(c,m+34*scale,top+375*scale,"Protocolo coche","Se detectará automáticamente",muted);
            statusRow(c,m+34*scale,top+445*scale,"Modo","Demostración",yellow);

            float rightL=leftR+gap, rightR=w-m;
            round(c,rightL,top,rightR,bottom,24,panel);
            txt(c,"CUANDO LLEGUE EL OBD",rightL+32*scale,top+47*scale,23,muted,Paint.Align.LEFT,true);
            step(c,rightL+32*scale,top+105*scale,"1","Emparejar el Vgate en Android");
            step(c,rightL+32*scale,top+177*scale,"2","Abrir Car Monitor");
            step(c,rightL+32*scale,top+249*scale,"3","Pulsar Conectar");
            step(c,rightL+32*scale,top+321*scale,"4","La app detectará los PIDs disponibles");
            float btnT=top+395*scale;
            primaryButtonRect.set(rightL+32*scale,btnT,rightR-32*scale,bottom-32*scale);
            gradientRound(c,primaryButtonRect.left,primaryButtonRect.top,primaryButtonRect.right,primaryButtonRect.bottom,18,Color.rgb(57,42,4),Color.rgb(37,29,5));
            strokeRound(c,primaryButtonRect.left,primaryButtonRect.top,primaryButtonRect.right,primaryButtonRect.bottom,18,yellow,1.5f);
            txt(c,"BUSCAR / CONECTAR OBD",(primaryButtonRect.left+primaryButtonRect.right)/2f,primaryButtonRect.top+57*scale,25,yellow,Paint.Align.CENTER,true);
        }

        private void statusRow(Canvas c,float x,float y,String label,String value,int color){
            p.setStyle(Paint.Style.FILL);p.setColor(color);c.drawCircle(x+7*scale,y-7*scale,6*scale,p);
            txt(c,label,x+28*scale,y,21,muted,Paint.Align.LEFT,true);
            txt(c,value,x+245*scale,y,22,white,Paint.Align.LEFT,true);
        }

        private void step(Canvas c,float x,float y,String n,String text){
            round(c,x,y-35*scale,x+48*scale,y+13*scale,15,darkYellow);
            txt(c,n,x+24*scale,y,22,yellow,Paint.Align.CENTER,true);
            txt(c,text,x+68*scale,y,22,white,Paint.Align.LEFT,true);
        }

        private void drawNav(Canvas c, float w, float h) {
            float navTop=h-96*scale;
            line(c,28*scale,navTop-8*scale,w-28*scale,navTop-8*scale,border,1);
            navItem(c,w*0.125f,navTop,"INICIO",0,page==0);
            navItem(c,w*0.375f,navTop,"VIAJE",1,page==1);
            navItem(c,w*0.625f,navTop,"MOTOR",2,page==2);
            navItem(c,w*0.875f,navTop,"ERRORES",3,page==3);
        }

        private void navItem(Canvas c,float cx,float top,String label,int index,boolean active){
            int color=active?yellow:muted;
            txt(c,label,cx,top+45*scale,23,color,Paint.Align.CENTER,true);
            if(active){
                round(c,cx-70*scale,top+63*scale,cx+70*scale,top+69*scale,3,yellow);
            }
        }

        private void drawToast(Canvas c,float w,float h){
            if(actionMessage.isEmpty() || System.currentTimeMillis()>actionMessageUntil) return;
            float tw=Math.min(w-100*scale,760*scale);
            float l=(w-tw)/2f, b=h-125*scale, t=b-72*scale;
            round(c,l,t,l+tw,b,18,Color.rgb(31,34,37));
            strokeRound(c,l,t,l+tw,b,18,Color.rgb(70,74,78),1);
            txt(c,actionMessage,w/2f,t+46*scale,22,white,Paint.Align.CENTER,true);
        }

        private void showMessage(String s){
            actionMessage=s;
            actionMessageUntil=System.currentTimeMillis()+2600;
            invalidate();
        }

        @Override
        public boolean onTouchEvent(MotionEvent e){
            if(e.getAction()!=MotionEvent.ACTION_UP) return true;
            float x=e.getX(), y=e.getY();
            float w=getWidth(), h=getHeight();

            if(connectionRect.contains(x,y)){
                page=4; invalidate(); return true;
            }

            float navTop=h-105*scale;
            if(y>=navTop){
                if(x<w*0.25f) page=0;
                else if(x<w*0.5f) page=1;
                else if(x<w*0.75f) page=2;
                else page=3;
                invalidate(); return true;
            }

            if(primaryButtonRect.contains(x,y)){
                if(page==1) showMessage("Viaje reiniciado en modo demostración");
                else if(page==3) showMessage("Conecta el OBD para escanear averías reales");
                else if(page==4) showMessage("Conexión OBD pendiente de integrar");
                return true;
            }
            return true;
        }
    }
}
