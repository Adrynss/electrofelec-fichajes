package com.carmonitor.demo;

import android.Manifest;
import android.app.Activity;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothSocket;
import android.content.Context;
import android.content.SharedPreferences;
import android.content.pm.ActivityInfo;
import android.content.pm.PackageManager;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.graphics.Path;
import android.graphics.RectF;
import android.os.Build;
import android.os.Bundle;
import android.view.MotionEvent;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;

import java.io.InputStream;
import java.io.OutputStream;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

public class MainActivity extends Activity {
    private DashboardView dashboard;
    private static final int REQ_BT = 5001;

    @Override protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        requestWindowFeature(Window.FEATURE_NO_TITLE);
        setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_LANDSCAPE);
        getWindow().setFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN, WindowManager.LayoutParams.FLAG_FULLSCREEN);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        getWindow().getDecorView().setSystemUiVisibility(
                View.SYSTEM_UI_FLAG_FULLSCREEN | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION |
                View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN |
                View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION | View.SYSTEM_UI_FLAG_LAYOUT_STABLE);
        dashboard = new DashboardView(this);
        setContentView(dashboard);
        ensureBluetoothPermission();
    }

    private boolean hasBluetoothPermission() {
        return Build.VERSION.SDK_INT < 31 || checkSelfPermission(Manifest.permission.BLUETOOTH_CONNECT) == PackageManager.PERMISSION_GRANTED;
    }

    private void ensureBluetoothPermission() {
        if (Build.VERSION.SDK_INT >= 31 && !hasBluetoothPermission()) requestPermissions(new String[]{Manifest.permission.BLUETOOTH_CONNECT}, REQ_BT);
    }

    @Override public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (dashboard != null) dashboard.invalidate();
    }

    @Override protected void onDestroy() {
        if (dashboard != null) dashboard.obd.disconnect();
        super.onDestroy();
    }

    private class DashboardView extends View {
        private final Paint p = new Paint(Paint.ANTI_ALIAS_FLAG);
        private final Paint stroke = new Paint(Paint.ANTI_ALIAS_FLAG);
        private final SharedPreferences prefs;
        private final ObdManager obd = new ObdManager();

        private final int bg = Color.rgb(5,7,9);
        private final int panel = Color.rgb(12,16,19);
        private final int panel2 = Color.rgb(15,20,24);
        private final int border = Color.rgb(39,47,53);
        private final int white = Color.rgb(246,248,250);
        private final int muted = Color.rgb(164,173,181);
        private final int green = Color.rgb(75,218,112);
        private final int red = Color.rgb(244,80,65);

        private int accent;
        private int accent2;
        private boolean diesel;
        private int page = 0; // 0 inicio, 1 viaje, 2 motor, 3 errores, 4 conexión, 5 ajustes
        private float s = 1f;
        private final RectF obdRect = new RectF();
        private final RectF gearRect = new RectF();
        private final RectF resetTripRect = new RectF();
        private final RectF readDtcRect = new RectF();
        private final RectF clearDtcRect = new RectF();
        private final RectF fuelToggleRect = new RectF();
        private final List<RectF> deviceRects = new ArrayList<>();
        private final List<BluetoothDevice> deviceHits = new ArrayList<>();
        private final List<RectF> colorRects = new ArrayList<>();
        private final int[] themeColors = new int[]{
                Color.rgb(255,174,0), Color.rgb(255,126,0), Color.rgb(255,65,138),
                Color.rgb(226,64,255), Color.rgb(145,78,255), Color.rgb(74,120,255),
                Color.rgb(0,190,255), Color.rgb(0,210,175), Color.rgb(88,214,87),
                Color.rgb(255,70,70), Color.rgb(230,230,230), Color.rgb(255,214,82)
        };
        private final String[] themeNames = new String[]{"Amarillo","Naranja","Rosa","Fucsia","Violeta","Azul","Cian","Turquesa","Verde","Rojo","Blanco","Dorado"};

        DashboardView(Context context) {
            super(context);
            setBackgroundColor(bg);
            prefs = getSharedPreferences("car_monitor", MODE_PRIVATE);
            accent = prefs.getInt("accent", Color.rgb(255,174,0));
            accent2 = brighten(accent, 1.15f);
            diesel = prefs.getBoolean("diesel", true);
            stroke.setStyle(Paint.Style.STROKE);
            stroke.setStrokeCap(Paint.Cap.ROUND);
            postDelayed(new Runnable() { @Override public void run() { invalidate(); postDelayed(this, 500); } }, 500);
        }

        private int brighten(int c, float f) {
            int r=Math.min(255,(int)(Color.red(c)*f)), g=Math.min(255,(int)(Color.green(c)*f)), b=Math.min(255,(int)(Color.blue(c)*f));
            return Color.rgb(r,g,b);
        }
        private void setAccent(int c) {
            accent=c; accent2=brighten(c,1.15f); prefs.edit().putInt("accent",c).apply(); invalidate();
        }
        private float X(float v) { return v*s; }
        private void txt(Canvas c,String t,float x,float y,float size,int color,Paint.Align align,boolean bold){
            p.setStyle(Paint.Style.FILL); p.setColor(color); p.setTextSize(X(size)); p.setTextAlign(align);
            p.setTypeface(bold?android.graphics.Typeface.DEFAULT_BOLD:android.graphics.Typeface.DEFAULT); c.drawText(t,X(x),X(y),p);
        }
        private void round(Canvas c,float l,float t,float r,float b,float radius,int color){
            p.setStyle(Paint.Style.FILL); p.setColor(color); c.drawRoundRect(new RectF(X(l),X(t),X(r),X(b)),X(radius),X(radius),p);
        }
        private void outline(Canvas c,float l,float t,float r,float b,float radius,int color,float width){
            stroke.setColor(color); stroke.setStrokeWidth(X(width)); c.drawRoundRect(new RectF(X(l),X(t),X(r),X(b)),X(radius),X(radius),stroke);
        }
        private void line(Canvas c,float x1,float y1,float x2,float y2,int color,float width){
            stroke.setColor(color); stroke.setStrokeWidth(X(width)); c.drawLine(X(x1),X(y1),X(x2),X(y2),stroke);
        }

        @Override protected void onDraw(Canvas canvas) {
            super.onDraw(canvas);
            float w=getWidth(), h=getHeight();
            s=Math.min(w/1800f,h/900f);
            float usedW=1800*s, usedH=900*s;
            canvas.save();
            canvas.translate((w-usedW)/2f,(h-usedH)/2f);
            canvas.drawColor(bg);
            drawHeader(canvas);
            if(page==0) drawHome(canvas);
            else if(page==1) drawTrip(canvas);
            else if(page==2) drawEngine(canvas);
            else if(page==3) drawErrors(canvas);
            else if(page==4) drawConnection(canvas);
            else drawSettings(canvas);
            drawNav(canvas);
            canvas.restore();
        }

        private void drawHeader(Canvas c){
            // left car icon + title
            drawCarIcon(c,25,24,42,accent);
            txt(c,"Car Monitor",82,54,28,white,Paint.Align.LEFT,true);
            line(c,22,81,1778,81,border,1);

            gearRect.set(X(1262),X(18),X(1317),X(66));
            round(c,1262,18,1317,66,24,panel2); outline(c,1262,18,1317,66,24,border,1);
            drawGear(c,1289,42,13,muted);

            obdRect.set(X(1327),X(18),X(1522),X(66));
            round(c,1327,18,1522,66,24,panel2);
            outline(c,1327,18,1522,66,24,obd.connected?green:red,1.7f);
            p.setStyle(Paint.Style.FILL); p.setColor(obd.connected?green:red); c.drawCircle(X(1347),X(42),X(5),p);
            txt(c,obd.connected?"OBD CONECTADO":"OBD DESCONECTADO",1363,50,16,white,Paint.Align.LEFT,true);

            String temp;
            if(obd.connected) temp=Float.isNaN(obd.ambient)?"--°C":String.format(Locale.getDefault(),"%.0f°C",obd.ambient);
            else temp="27°C";
            txt(c,temp,1534,51,27,accent2,Paint.Align.LEFT,true);
            txt(c,"exterior",1602,50,17,muted,Paint.Align.LEFT,false);
            txt(c,new SimpleDateFormat("HH:mm",Locale.getDefault()).format(new Date()),1770,51,27,white,Paint.Align.RIGHT,true);
        }

        private void drawHome(Canvas c){
            // exact reference composition: large dual-gauge block + consumption column
            round(c,23,103,1461,409,20,panel); outline(c,23,103,1461,409,20,border,1.2f);
            line(c,744,128,744,383,border,1);
            drawGauge(c,420,256,128,true);
            drawGauge(c,1060,256,128,false);

            drawConsumptionCard(c,1474,103,1778,250,true);
            drawConsumptionCard(c,1474,263,1778,409,false);

            // lower 3x2 grid, matching reference proportions
            drawDataCard(c,23,421,601,574,0,"Motor",valueTemp(),"°C",accent);
            drawDataCard(c,612,421,1190,574,1,"Batería",valueBattery(),"V",green);
            drawDataCard(c,1201,421,1778,574,2,"Carga motor",valueLoad(),"%",accent);
            drawDataCard(c,23,587,601,744,3,"Trayecto",valueTrip(),"km",white);
            drawDataCard(c,612,587,1190,744,4,"Tiempo de viaje",valueTime(),"",white);
            drawDataCard(c,1201,587,1778,744,5,"Sistema OBD",obd.dtcs.isEmpty()?"Sin errores":obd.dtcs.size()+" errores","",obd.dtcs.isEmpty()?green:red);
        }

        private int demoRpm(){ return 2150+(int)(Math.sin(System.currentTimeMillis()/1700.0)*35); }
        private int demoSpeed(){ return 87+(int)(Math.sin(System.currentTimeMillis()/2300.0)*1); }
        private int rpm(){ return obd.connected?obd.rpm:demoRpm(); }
        private int speed(){ return obd.connected?obd.speed:demoSpeed(); }
        private float currentCons(){ return obd.connected?obd.currentCons:6.4f; }
        private float avgCons(){ return obd.connected && obd.tripKm>0.1?obd.avgCons:6.8f; }
        private String valueTemp(){ return String.valueOf(obd.connected?Math.round(obd.coolant):89); }
        private String valueBattery(){ return String.format(Locale.getDefault(),"%.1f",obd.connected?obd.voltage:14.2f); }
        private String valueLoad(){ return String.valueOf(obd.connected?Math.round(obd.load):34); }
        private String valueTrip(){ return String.format(Locale.getDefault(),"%.1f",obd.connected?obd.tripKm:124.6f); }
        private String valueTime(){ long sec=obd.connected?obd.tripSeconds:6120; long h=sec/3600,m=(sec%3600)/60; return h>0?h+" h "+m+" min":m+" min"; }

        private void drawGauge(Canvas c,float cx,float cy,float r,boolean rpmGauge){
            p.setStyle(Paint.Style.FILL); p.setColor(Color.rgb(7,10,12)); c.drawCircle(X(cx),X(cy),X(r),p);
            RectF rr=new RectF(X(cx-r+9),X(cy-r+9),X(cx+r-9),X(cy+r-9));
            stroke.setStrokeWidth(X(10)); stroke.setStrokeCap(Paint.Cap.ROUND); stroke.setColor(Color.rgb(48,55,60));
            c.drawArc(rr,135,270,false,stroke);
            float frac=rpmGauge?Math.min(1,rpm()/7000f):Math.min(1,speed()/240f);
            stroke.setColor(accent); c.drawArc(rr,135,270*frac,false,stroke);
            if(rpmGauge){ stroke.setColor(red); c.drawArc(rr,75,60,false,stroke); }
            int ticks=rpmGauge?8:12;
            for(int i=0;i<=ticks;i++){
                double a=Math.toRadians(135+270.0*i/ticks);
                float x1=cx+(float)Math.cos(a)*(r-22),y1=cy+(float)Math.sin(a)*(r-22);
                float x2=cx+(float)Math.cos(a)*(r-39),y2=cy+(float)Math.sin(a)*(r-39);
                line(c,x1,y1,x2,y2,white,2);
                String lab=rpmGauge?String.valueOf(i):String.valueOf(i*20);
                float tx=cx+(float)Math.cos(a)*(r-57),ty=cy+(float)Math.sin(a)*(r-57)+5;
                txt(c,lab,tx,ty,13,white,Paint.Align.CENTER,false);
            }
            txt(c,String.valueOf(rpmGauge?rpm():speed()),cx,cy+10,47,white,Paint.Align.CENTER,true);
            txt(c,rpmGauge?"RPM":"km/h",cx,cy+45,22,white,Paint.Align.CENTER,false);
            if(rpmGauge) txt(c,"x1000",cx,cy+70,13,muted,Paint.Align.CENTER,false);
        }

        private void drawConsumptionCard(Canvas c,float l,float t,float r,float b,boolean current){
            round(c,l,t,r,b,18,panel); outline(c,l,t,r,b,18,border,1.2f);
            drawFuelIcon(c,l+35,t+52,29,accent);
            txt(c,current?"Consumo actual":"Consumo medio",l+75,t+31,18,muted,Paint.Align.LEFT,false);
            String v=String.format(Locale.getDefault(),"%.1f",current?currentCons():avgCons());
            txt(c,v,l+75,t+91,39,white,Paint.Align.LEFT,true);
            txt(c,"L/100 km",r-18,b-22,17,muted,Paint.Align.RIGHT,false);
        }

        private void drawDataCard(Canvas c,float l,float t,float r,float b,int icon,String label,String value,String unit,int color){
            round(c,l,t,r,b,18,panel); outline(c,l,t,r,b,18,border,1.2f);
            txt(c,label,l+58,t+29,18,muted,Paint.Align.LEFT,false);
            if(icon==0) drawThermometer(c,l+31,t+83,29,color);
            else if(icon==1) drawBattery(c,l+28,t+75,34,color);
            else if(icon==2) drawEngineIcon(c,l+28,t+74,37,color);
            else if(icon==3) drawRoad(c,l+27,t+69,38,color);
            else if(icon==4) drawClock(c,l+27,t+75,34,color);
            else drawEngineIcon(c,l+28,t+72,37,color);
            txt(c,value,l+58,b-24,icon==5?30:36,color==green?green:white,Paint.Align.LEFT,true);
            if(!unit.isEmpty()) txt(c,unit,r-18,b-25,17,muted,Paint.Align.RIGHT,false);
        }

        private void drawNav(Canvas c){
            line(c,23,760,1778,760,border,1);
            String[] names={"Inicio","Viaje","Motor","Errores"};
            for(int i=0;i<4;i++){
                float cx=225+i*450;
                boolean active=page==i;
                int col=active?accent:muted;
                if(i==0) drawHomeIcon(c,cx,787,19,col);
                else if(i==1) drawTripIcon(c,cx,787,19,col);
                else if(i==2) drawEngineIcon(c,cx-20,771,36,col);
                else drawWarning(c,cx,787,20,col);
                txt(c,names[i],cx,835,18,col,Paint.Align.CENTER,active);
                if(active) round(c,cx-48,853,cx+48,858,3,accent);
            }
        }

        private void drawTrip(Canvas c){
            txt(c,"Viaje actual",30,118,27,white,Paint.Align.LEFT,true);
            round(c,23,140,700,730,20,panel); outline(c,23,140,700,730,20,border,1);
            txt(c,valueTrip(),55,280,82,white,Paint.Align.LEFT,true); txt(c,"km",295,275,28,accent,Paint.Align.LEFT,true);
            txt(c,"Distancia recorrida",55,320,18,muted,Paint.Align.LEFT,false);
            txt(c,valueTime(),55,403,43,white,Paint.Align.LEFT,true); txt(c,"Tiempo de viaje",55,440,18,muted,Paint.Align.LEFT,false);
            txt(c,String.format(Locale.getDefault(),"%.1f",avgCons()),55,535,58,accent,Paint.Align.LEFT,true); txt(c,"L/100 km",220,528,25,white,Paint.Align.LEFT,false);
            txt(c,"Consumo medio",55,570,18,muted,Paint.Align.LEFT,false);
            resetTripRect.set(X(55),X(625),X(665),X(698)); round(c,55,625,665,698,16,Color.rgb(41,34,9)); outline(c,55,625,665,698,16,accent,1.5f);
            txt(c,"REINICIAR VIAJE",360,670,23,accent,Paint.Align.CENTER,true);

            drawMetricBox(c,725,140,1238,318,"Velocidad media",String.format(Locale.getDefault(),"%.0f",obd.connected?obd.avgSpeed:73f),"km/h",accent);
            drawMetricBox(c,1265,140,1778,318,"Velocidad máxima",String.format(Locale.getDefault(),"%.0f",obd.connected?obd.maxSpeed:112f),"km/h",accent);
            drawMetricBox(c,725,339,1238,517,"Combustible estimado",String.format(Locale.getDefault(),"%.1f",obd.connected?obd.tripFuel:8.5f),"L",accent);
            drawMetricBox(c,1265,339,1778,517,"Consumo actual",String.format(Locale.getDefault(),"%.1f",currentCons()),"L/100 km",accent);
            drawMetricBox(c,725,538,1238,730,"RPM actuales",String.valueOf(rpm()),"RPM",accent);
            drawMetricBox(c,1265,538,1778,730,"Velocidad actual",String.valueOf(speed()),"km/h",accent);
        }

        private void drawMetricBox(Canvas c,float l,float t,float r,float b,String label,String value,String unit,int color){
            round(c,l,t,r,b,18,panel); outline(c,l,t,r,b,18,border,1);
            txt(c,label,l+28,t+35,18,muted,Paint.Align.LEFT,false);
            txt(c,value,l+28,t+111,48,white,Paint.Align.LEFT,true);
            txt(c,unit,r-24,t+110,19,color,Paint.Align.RIGHT,true);
        }

        private void drawEngine(Canvas c){
            txt(c,"Motor",30,118,27,white,Paint.Align.LEFT,true);
            float[][] box={{23,140,580,310},{606,140,1163,310},{1189,140,1778,310},{23,336,580,506},{606,336,1163,506},{1189,336,1778,506},{23,532,580,730},{606,532,1163,730},{1189,532,1778,730}};
            String[] labs={"Temperatura motor","Voltaje batería","Carga motor","MAF","Temp. admisión","Presión MAP","Acelerador","RPM","Velocidad"};
            String[] vals={valueTemp(),valueBattery(),valueLoad(),fmt(obd.connected?obd.maf:18.4f,1),String.valueOf(Math.round(obd.connected?obd.intake:31)),String.valueOf(Math.round(obd.connected?obd.map:101)),String.valueOf(Math.round(obd.connected?obd.throttle:22)),String.valueOf(rpm()),String.valueOf(speed())};
            String[] units={"°C","V","%","g/s","°C","kPa","%","RPM","km/h"};
            for(int i=0;i<9;i++) drawMetricBox(c,box[i][0],box[i][1],box[i][2],box[i][3],labs[i],vals[i],units[i],accent);
        }
        private String fmt(float v,int dec){ return String.format(Locale.getDefault(),dec==1?"%.1f":"%.0f",v); }

        private void drawErrors(Canvas c){
            txt(c,"Diagnóstico OBD",30,118,27,white,Paint.Align.LEFT,true);
            round(c,23,140,1778,545,20,panel); outline(c,23,140,1778,545,20,border,1);
            drawEngineIcon(c,55,181,45,obd.dtcs.isEmpty()?green:red);
            txt(c,obd.dtcs.isEmpty()?"Sin errores detectados":obd.dtcs.size()+" códigos detectados",125,202,32,obd.dtcs.isEmpty()?green:red,Paint.Align.LEFT,true);
            txt(c,obd.connected?"Centralita conectada":"Conecta el OBD para leer errores reales",125,235,18,muted,Paint.Align.LEFT,false);
            if(obd.dtcs.isEmpty()) txt(c,"No hay códigos DTC almacenados en la lectura actual.",55,315,24,white,Paint.Align.LEFT,false);
            else {
                float y=300; for(String d:obd.dtcs){ txt(c,"•  "+d,55,y,25,white,Paint.Align.LEFT,true); y+=48; if(y>510) break; }
            }
            readDtcRect.set(X(23),X(575),X(868),X(710)); clearDtcRect.set(X(890),X(575),X(1778),X(710));
            round(c,23,575,868,710,18,Color.rgb(35,31,12)); outline(c,23,575,868,710,18,accent,1.5f);
            txt(c,"LEER ERRORES",445,650,25,accent,Paint.Align.CENTER,true);
            round(c,890,575,1778,710,18,Color.rgb(35,17,17)); outline(c,890,575,1778,710,18,red,1.5f);
            txt(c,"BORRAR ERRORES",1334,650,25,red,Paint.Align.CENTER,true);
        }

        private void drawConnection(Canvas c){
            txt(c,"Conexión OBD",30,118,27,white,Paint.Align.LEFT,true);
            round(c,23,140,1778,720,20,panel); outline(c,23,140,1778,720,20,border,1);
            txt(c,obd.connected?"Conectado a "+obd.deviceName:"Selecciona un OBD Bluetooth emparejado",55,195,28,obd.connected?green:white,Paint.Align.LEFT,true);
            txt(c,"Compatible con ELM327 / Vgate iCar Pro 2S mediante Bluetooth Classic",55,230,18,muted,Paint.Align.LEFT,false);
            if(!hasBluetoothPermission()){
                txt(c,"Falta permiso Bluetooth. Toca aquí para concederlo.",55,300,24,red,Paint.Align.LEFT,true);
                return;
            }
            deviceRects.clear(); deviceHits.clear();
            List<BluetoothDevice> devices=getBonded();
            if(devices.isEmpty()) txt(c,"No hay dispositivos emparejados. Empareja primero el Vgate desde Ajustes de Android.",55,310,22,muted,Paint.Align.LEFT,false);
            float y=275;
            for(BluetoothDevice d:devices){
                RectF rr=new RectF(X(55),X(y),X(1745),X(y+88)); deviceRects.add(rr); deviceHits.add(d);
                round(c,55,y,1745,y+88,15,panel2); outline(c,55,y,1745,y+88,15,border,1);
                String name=safeName(d); txt(c,name,85,y+36,24,white,Paint.Align.LEFT,true);
                txt(c,d.getAddress(),85,y+67,17,muted,Paint.Align.LEFT,false);
                txt(c,obd.connected && d.getAddress().equals(obd.deviceAddress)?"CONECTADO":"CONECTAR",1690,y+53,20,obd.connected&&d.getAddress().equals(obd.deviceAddress)?green:accent,Paint.Align.RIGHT,true);
                y+=103; if(y>650) break;
            }
            if(obd.connected){ txt(c,"Toca el dispositivo conectado para desconectar.",55,690,18,muted,Paint.Align.LEFT,false); }
        }

        private List<BluetoothDevice> getBonded(){
            List<BluetoothDevice> out=new ArrayList<>();
            try{ BluetoothAdapter a=BluetoothAdapter.getDefaultAdapter(); if(a!=null){ Set<BluetoothDevice> set=a.getBondedDevices(); out.addAll(set); } }catch(SecurityException ignored){}
            return out;
        }
        private String safeName(BluetoothDevice d){ try{String n=d.getName(); return n==null?"Dispositivo OBD":n;}catch(Exception e){return "Dispositivo OBD";} }

        private void drawSettings(Canvas c){
            txt(c,"Personalización",30,118,27,white,Paint.Align.LEFT,true);
            round(c,23,140,1778,720,20,panel); outline(c,23,140,1778,720,20,border,1);
            txt(c,"Color principal",55,195,25,white,Paint.Align.LEFT,true);
            txt(c,"Elige el color del cuadro, relojes, iconos y menú activo.",55,227,18,muted,Paint.Align.LEFT,false);
            colorRects.clear();
            float startX=60,startY=275,cellW=270,cellH=110,gap=18;
            for(int i=0;i<themeColors.length;i++){
                int row=i/6,col=i%6; float l=startX+col*(cellW+gap), t=startY+row*(cellH+25);
                RectF rr=new RectF(X(l),X(t),X(l+cellW),X(t+cellH)); colorRects.add(rr);
                round(c,l,t,l+cellW,t+cellH,16,panel2); outline(c,l,t,l+cellW,t+cellH,16,themeColors[i]==accent?white:border,themeColors[i]==accent?2.5f:1);
                p.setStyle(Paint.Style.FILL);p.setColor(themeColors[i]);c.drawCircle(X(l+42),X(t+45),X(20),p);
                txt(c,themeNames[i],l+78,t+52,19,white,Paint.Align.LEFT,true);
            }
            txt(c,"Tipo de combustible",55,587,24,white,Paint.Align.LEFT,true);
            txt(c,"Se usa solo si la ECU no ofrece caudal de combustible y hay que estimarlo con el MAF.",55,617,17,muted,Paint.Align.LEFT,false);
            fuelToggleRect.set(X(55),X(642),X(560),X(700));
            round(c,55,642,560,700,16,panel2); outline(c,55,642,560,700,16,accent,1.5f);
            txt(c,diesel?"DIÉSEL":"GASOLINA",307,680,21,accent,Paint.Align.CENTER,true);
        }

        @Override public boolean onTouchEvent(MotionEvent e){
            if(e.getAction()!=MotionEvent.ACTION_UP) return true;
            float ox=(getWidth()-1800*s)/2f, oy=(getHeight()-900*s)/2f;
            float x=e.getX()-ox,y=e.getY()-oy;
            if(gearRect.contains(x,y)){ page=5; invalidate(); return true; }
            if(obdRect.contains(x,y)){ page=4; invalidate(); return true; }
            if(y>=X(760)){
                float dx=x/s; int idx=(int)(dx/450f); if(idx<0)idx=0;if(idx>3)idx=3; page=idx; invalidate(); return true;
            }
            if(page==1 && resetTripRect.contains(x,y)){ obd.resetTrip(); invalidate(); return true; }
            if(page==3 && readDtcRect.contains(x,y)){ obd.readDtcs(); return true; }
            if(page==3 && clearDtcRect.contains(x,y)){ obd.clearDtcs(); return true; }
            if(page==4){
                if(!hasBluetoothPermission()){ ensureBluetoothPermission(); return true; }
                for(int i=0;i<deviceRects.size();i++) if(deviceRects.get(i).contains(x,y)){
                    BluetoothDevice d=deviceHits.get(i);
                    if(obd.connected && d.getAddress().equals(obd.deviceAddress)) obd.disconnect(); else obd.connect(d);
                    invalidate(); return true;
                }
            }
            if(page==5){
                for(int i=0;i<colorRects.size();i++) if(colorRects.get(i).contains(x,y)){ setAccent(themeColors[i]); return true; }
                if(fuelToggleRect.contains(x,y)){ diesel=!diesel; prefs.edit().putBoolean("diesel",diesel).apply(); invalidate(); return true; }
            }
            return true;
        }

        // --- vector icons ---
        private void drawCarIcon(Canvas c,float x,float y,float size,int col){
            stroke.setColor(col);stroke.setStrokeWidth(X(3));stroke.setStyle(Paint.Style.STROKE);
            RectF body=new RectF(X(x),X(y+12),X(x+size),X(y+31)); c.drawRoundRect(body,X(6),X(6),stroke);
            line(c,x+8,y+12,x+14,y+3,col,3); line(c,x+14,y+3,x+31,y+3,col,3); line(c,x+31,y+3,x+37,y+12,col,3);
            p.setColor(col);p.setStyle(Paint.Style.FILL);c.drawCircle(X(x+9),X(y+33),X(4),p);c.drawCircle(X(x+33),X(y+33),X(4),p);
        }
        private void drawFuelIcon(Canvas c,float x,float y,float z,int col){
            stroke.setColor(col);stroke.setStrokeWidth(X(3));stroke.setStyle(Paint.Style.STROKE);c.drawRect(X(x),X(y),X(x+z*0.55f),X(y+z),stroke);
            line(c,x+z*.55f,y+z*.15f,x+z*.78f,y+z*.27f,col,3);line(c,x+z*.78f,y+z*.27f,x+z*.78f,y+z*.78f,col,3);
        }
        private void drawThermometer(Canvas c,float x,float y,float z,int col){
            stroke.setColor(col);stroke.setStrokeWidth(X(3));stroke.setStyle(Paint.Style.STROKE);c.drawCircle(X(x+z*.35f),X(y+z*.8f),X(z*.18f),stroke);line(c,x+z*.35f,y,x+z*.35f,y+z*.65f,col,3);line(c,x+z*.35f,y+z*.25f,x+z*.65f,y+z*.25f,col,2);
        }
        private void drawBattery(Canvas c,float x,float y,float z,int col){
            stroke.setColor(col);stroke.setStrokeWidth(X(3));stroke.setStyle(Paint.Style.STROKE);c.drawRect(X(x),X(y),X(x+z),X(y+z*.62f),stroke);line(c,x+z*.25f,y-4,x+z*.38f,y-4,col,3);line(c,x+z*.62f,y-4,x+z*.76f,y-4,col,3);line(c,x+z*.5f,y+z*.12f,x+z*.5f,y+z*.48f,col,2);line(c,x+z*.34f,y+z*.3f,x+z*.66f,y+z*.3f,col,2);
        }
        private void drawEngineIcon(Canvas c,float x,float y,float z,int col){
            stroke.setColor(col);stroke.setStrokeWidth(X(3));stroke.setStyle(Paint.Style.STROKE);RectF r=new RectF(X(x+5),X(y+7),X(x+z-4),X(y+z*.65f));c.drawRoundRect(r,X(5),X(5),stroke);line(c,x+z*.28f,y+7,x+z*.36f,y,col,3);line(c,x+z*.36f,y,x+z*.62f,y,col,3);line(c,x+z*.75f,y+14,x+z,y+14,col,3);line(c,x+5,y+z*.3f,x-3,y+z*.3f,col,3);
        }
        private void drawRoad(Canvas c,float x,float y,float z,int col){
            line(c,x+z*.25f,y,x,y+z,col,3);line(c,x+z*.75f,y,x+z,y+z,col,3);line(c,x+z*.5f,y+5,x+z*.5f,y+14,col,2);line(c,x+z*.5f,y+23,x+z*.5f,y+32,col,2);
        }
        private void drawClock(Canvas c,float x,float y,float z,int col){
            stroke.setColor(col);stroke.setStrokeWidth(X(3));stroke.setStyle(Paint.Style.STROKE);c.drawCircle(X(x+z/2),X(y+z/2),X(z/2),stroke);line(c,x+z/2,y+z/2,x+z/2,y+z*.2f,col,3);line(c,x+z/2,y+z/2,x+z*.73f,y+z*.62f,col,3);
        }
        private void drawHomeIcon(Canvas c,float x,float y,float z,int col){
            Path path=new Path();path.moveTo(X(x-z),X(y));path.lineTo(X(x),X(y-z));path.lineTo(X(x+z),X(y));path.lineTo(X(x+z*.7f),X(y));path.lineTo(X(x+z*.7f),X(y+z));path.lineTo(X(x-z*.7f),X(y+z));path.lineTo(X(x-z*.7f),X(y));path.close();stroke.setColor(col);stroke.setStrokeWidth(X(2.5f));stroke.setStyle(Paint.Style.STROKE);c.drawPath(path,stroke);
        }
        private void drawTripIcon(Canvas c,float x,float y,float z,int col){ line(c,x-z,y+z,x+z,y-z,col,2.5f);line(c,x+z*.45f,y-z,x+z,y-z,col,2.5f);line(c,x+z,y-z,x+z,y-z*.45f,col,2.5f); }
        private void drawWarning(Canvas c,float x,float y,float z,int col){ Path path=new Path();path.moveTo(X(x),X(y-z));path.lineTo(X(x+z),X(y+z));path.lineTo(X(x-z),X(y+z));path.close();stroke.setColor(col);stroke.setStrokeWidth(X(2.5f));stroke.setStyle(Paint.Style.STROKE);c.drawPath(path,stroke);line(c,x,y-7,x,y+5,col,2.5f);p.setColor(col);p.setStyle(Paint.Style.FILL);c.drawCircle(X(x),X(y+11),X(2),p); }
        private void drawGear(Canvas c,float x,float y,float z,int col){ stroke.setColor(col);stroke.setStrokeWidth(X(2.5f));stroke.setStyle(Paint.Style.STROKE);c.drawCircle(X(x),X(y),X(z),stroke);c.drawCircle(X(x),X(y),X(z*.38f),stroke);for(int i=0;i<8;i++){double a=i*Math.PI/4;line(c,x+(float)Math.cos(a)*z,y+(float)Math.sin(a)*z,x+(float)Math.cos(a)*(z+5),y+(float)Math.sin(a)*(z+5),col,2.5f);} }

        // --- real Bluetooth Classic ELM327 layer ---
        private class ObdManager {
            volatile boolean connected=false, connecting=false;
            volatile String deviceName="", deviceAddress="";
            volatile int rpm=0,speed=0;
            volatile float coolant=0,voltage=0,load=0,maf=0,intake=0,map=0,throttle=0,ambient=Float.NaN;
            volatile float fuelRate=0,currentCons=0,avgCons=0,avgSpeed=0,maxSpeed=0;
            volatile double tripKm=0,tripFuel=0;
            volatile long tripSeconds=0;
            final List<String> dtcs=new ArrayList<>();
            BluetoothSocket socket; InputStream in; OutputStream out; Thread pollThread; long tripStart=System.currentTimeMillis(); long lastPoll=System.currentTimeMillis();
            final UUID SPP=UUID.fromString("00001101-0000-1000-8000-00805F9B34FB");

            void connect(final BluetoothDevice d){
                if(connecting)return; disconnect(); connecting=true; invalidate();
                new Thread(() -> {
                    try{
                        if(!hasBluetoothPermission()) throw new SecurityException("Permiso Bluetooth");
                        BluetoothAdapter a=BluetoothAdapter.getDefaultAdapter(); if(a!=null)a.cancelDiscovery();
                        socket=d.createRfcommSocketToServiceRecord(SPP); socket.connect(); in=socket.getInputStream(); out=socket.getOutputStream();
                        send("ATZ",3500); send("ATE0",1500); send("ATL0",1200); send("ATS0",1200); send("ATH0",1200); send("ATSP0",2500);
                        connected=true; connecting=false; deviceName=safeName(d); deviceAddress=d.getAddress(); tripStart=System.currentTimeMillis(); lastPoll=tripStart;
                        startPolling();
                    }catch(Exception ex){ connected=false; connecting=false; closeSocket(); }
                    postInvalidate();
                }).start();
            }
            void disconnect(){ connected=false; connecting=false; if(pollThread!=null)pollThread.interrupt(); closeSocket(); postInvalidate(); }
            void closeSocket(){ try{if(in!=null)in.close();}catch(Exception ignored){}try{if(out!=null)out.close();}catch(Exception ignored){}try{if(socket!=null)socket.close();}catch(Exception ignored){} in=null;out=null;socket=null; }
            synchronized String send(String cmd,long timeout) throws Exception{
                if(out==null||in==null)throw new Exception("Sin conexión");
                while(in.available()>0)in.read(); out.write((cmd+"\r").getBytes()); out.flush();
                StringBuilder sb=new StringBuilder(); long end=System.currentTimeMillis()+timeout;
                while(System.currentTimeMillis()<end){ while(in.available()>0){ int b=in.read(); if(b<0)break; char ch=(char)b; sb.append(ch); if(ch=='>')return sb.toString(); } Thread.sleep(12); }
                return sb.toString();
            }
            String q(String cmd){ try{return send(cmd,1800);}catch(Exception e){return "";} }
            String clean(String r){ return r==null?"":r.toUpperCase(Locale.US).replace("SEARCHING...","").replace(" ","").replace("\r","").replace("\n","").replace(">',","").replace(">",""); }
            int[] bytesFor(String raw,String pid,int n){
                String x=clean(raw); String key="41"+pid; int k=x.indexOf(key); if(k<0)return null; k+=key.length(); if(k+n*2>x.length())return null; int[] a=new int[n];
                try{for(int i=0;i<n;i++)a[i]=Integer.parseInt(x.substring(k+i*2,k+i*2+2),16);return a;}catch(Exception e){return null;}
            }
            float pid1(String cmd,String pid,float mul,float add){ int[] a=bytesFor(q(cmd),pid,1);return a==null?Float.NaN:a[0]*mul+add; }
            void startPolling(){
                pollThread=new Thread(() -> {
                    int cycle=0;
                    while(connected&&!Thread.currentThread().isInterrupted()){
                        try{
                            int[] rr=bytesFor(q("010C"),"0C",2); if(rr!=null)rpm=(rr[0]*256+rr[1])/4;
                            int[] ss=bytesFor(q("010D"),"0D",1); if(ss!=null)speed=ss[0];
                            float v=pid1("0105","05",1,-40); if(!Float.isNaN(v))coolant=v;
                            v=pid1("0104","04",100f/255f,0); if(!Float.isNaN(v))load=v;
                            String vr=q("ATRV").toUpperCase(Locale.US).replace("V","").replace(">","").trim(); try{String[] z=vr.split("\\s+");voltage=Float.parseFloat(z[z.length-1]);}catch(Exception ignored){}
                            if(cycle%2==0){
                                int[] mm=bytesFor(q("0110"),"10",2); if(mm!=null)maf=(mm[0]*256+mm[1])/100f;
                                v=pid1("010F","0F",1,-40);if(!Float.isNaN(v))intake=v;
                                v=pid1("010B","0B",1,0);if(!Float.isNaN(v))map=v;
                                v=pid1("0111","11",100f/255f,0);if(!Float.isNaN(v))throttle=v;
                                v=pid1("0146","46",1,-40);if(!Float.isNaN(v))ambient=v;
                            }
                            if(cycle%3==0){ int[] fr=bytesFor(q("015E"),"5E",2); if(fr!=null)fuelRate=(fr[0]*256+fr[1])*0.05f; else if(maf>0)fuelRate=estimateFuel(maf); }
                            updateTrip(); cycle++; postInvalidate(); Thread.sleep(250);
                        }catch(Exception e){ connected=false; closeSocket(); postInvalidate(); break; }
                    }
                }); pollThread.start();
            }
            float estimateFuel(float mafGps){ float afr=diesel?14.5f:14.7f; float density=diesel?832f:745f; return mafGps*3600f/(afr*density); }
            void updateTrip(){
                long now=System.currentTimeMillis(); double dh=(now-lastPoll)/3600000.0; lastPoll=now; if(dh<0||dh>0.01)return;
                tripKm+=speed*dh; tripFuel+=Math.max(0,fuelRate)*dh; tripSeconds=(now-tripStart)/1000;
                if(speed>2 && fuelRate>0)currentCons=(float)(fuelRate/speed*100.0); else currentCons=0;
                if(tripKm>0.05)avgCons=(float)(tripFuel/tripKm*100.0);
                double hours=Math.max(0.0001,tripSeconds/3600.0);avgSpeed=(float)(tripKm/hours);if(speed>maxSpeed)maxSpeed=speed;
            }
            void resetTrip(){ tripKm=0;tripFuel=0;tripSeconds=0;avgCons=0;avgSpeed=0;maxSpeed=0;tripStart=System.currentTimeMillis();lastPoll=tripStart; }
            void readDtcs(){ if(!connected){postInvalidate();return;} new Thread(() -> { try{String r=clean(send("03",2500)); List<String> list=parseDtcs(r); synchronized(dtcs){dtcs.clear();dtcs.addAll(list);} }catch(Exception ignored){} postInvalidate(); }).start(); }
            void clearDtcs(){ if(!connected)return; new Thread(() -> { try{send("04",2500); synchronized(dtcs){dtcs.clear();}}catch(Exception ignored){} postInvalidate(); }).start(); }
            List<String> parseDtcs(String r){
                List<String> list=new ArrayList<>(); int k=r.indexOf("43"); if(k<0)return list; String d=r.substring(k+2);
                for(int i=0;i+4<=d.length();i+=4){String code=d.substring(i,i+4);if(code.equals("0000"))continue;try{int a=Integer.parseInt(code.substring(0,2),16),b=Integer.parseInt(code.substring(2,4),16);String letters="PCBU";char pre=letters.charAt((a>>6)&3);int d1=(a>>4)&3,d2=a&15,d3=(b>>4)&15,d4=b&15;list.add(""+pre+d1+Integer.toHexString(d2).toUpperCase()+Integer.toHexString(d3).toUpperCase()+Integer.toHexString(d4).toUpperCase());}catch(Exception ignored){}
                }return list;
            }
        }
    }
}
