package com.carmonitor.demo;

import android.Manifest;
import android.app.Activity;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothSocket;
import android.content.pm.ActivityInfo;
import android.content.pm.PackageManager;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.LinearGradient;
import android.graphics.Paint;
import android.graphics.RectF;
import android.graphics.Shader;
import android.os.Build;
import android.os.Bundle;
import android.view.MotionEvent;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;

import java.io.InputStream;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

public class MainActivity extends Activity {
    private DashboardView dashboard;
    private ObdManager obd;

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
        obd = new ObdManager(this);
        dashboard = new DashboardView(this, obd);
        setContentView(dashboard);
        if (Build.VERSION.SDK_INT >= 31 && checkSelfPermission(Manifest.permission.BLUETOOTH_CONNECT) != PackageManager.PERMISSION_GRANTED) {
            requestPermissions(new String[]{Manifest.permission.BLUETOOTH_CONNECT}, 41);
        }
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == 41 && dashboard != null) {
            obd.refreshBondedDevices();
            dashboard.invalidate();
        }
    }

    @Override
    protected void onDestroy() {
        if (obd != null) obd.disconnect();
        super.onDestroy();
    }

    public boolean hasBluetoothPermission() {
        return Build.VERSION.SDK_INT < 31 || checkSelfPermission(Manifest.permission.BLUETOOTH_CONNECT) == PackageManager.PERMISSION_GRANTED;
    }

    static class LiveData {
        volatile float rpm = Float.NaN, speed = Float.NaN, coolant = Float.NaN, voltage = Float.NaN;
        volatile float load = Float.NaN, maf = Float.NaN, intakeTemp = Float.NaN, map = Float.NaN;
        volatile float ambient = Float.NaN, throttle = Float.NaN, fuelRate = Float.NaN;
        volatile float instantConsumption = Float.NaN, avgConsumption = Float.NaN;
        volatile float tripKm = 0f, tripFuel = 0f, maxSpeed = 0f;
        volatile long tripMillis = 0L, lastUpdate = 0L;
        volatile String protocol = "";
        volatile String[] dtcs = new String[0];
        volatile boolean fuelRateDirect = false;
    }

    class ObdManager {
        private final MainActivity activity;
        final LiveData data = new LiveData();
        private final UUID SPP = UUID.fromString("00001101-0000-1000-8000-00805F9B34FB");
        volatile boolean connected = false, connecting = false, demoMode = true, diesel = true;
        volatile String deviceName = "", statusMessage = "OBD desconectado";
        final List<BluetoothDevice> bonded = new ArrayList<>();
        private BluetoothSocket socket;
        private InputStream input;
        private OutputStream output;
        private Thread worker;
        private volatile boolean stop = false, requestDtc = false, requestClearDtc = false;
        private long lastLoop = 0L;
        private int loopCount = 0;

        ObdManager(MainActivity a) { activity = a; refreshBondedDevices(); }

        void refreshBondedDevices() {
            bonded.clear();
            try {
                if (!activity.hasBluetoothPermission()) return;
                BluetoothAdapter adapter = BluetoothAdapter.getDefaultAdapter();
                if (adapter == null) return;
                Set<BluetoothDevice> set = adapter.getBondedDevices();
                if (set != null) bonded.addAll(set);
            } catch (Exception ignored) {}
        }

        BluetoothDevice preferredDevice() {
            refreshBondedDevices();
            BluetoothDevice fallback = bonded.isEmpty() ? null : bonded.get(0);
            for (BluetoothDevice d : bonded) {
                try {
                    String n = d.getName();
                    if (n == null) continue;
                    String u = n.toUpperCase(Locale.ROOT);
                    if (u.contains("VGATE") || u.contains("VLINK") || u.contains("ICAR") || u.contains("OBD") || u.contains("ELM")) return d;
                } catch (Exception ignored) {}
            }
            return fallback;
        }

        void connectPreferred() {
            BluetoothDevice d = preferredDevice();
            if (d == null) {
                statusMessage = activity.hasBluetoothPermission() ? "Empareja primero el OBD en Android" : "Permiso Bluetooth necesario";
                return;
            }
            connect(d);
        }

        synchronized void connect(final BluetoothDevice device) {
            if (connecting) return;
            disconnect();
            connecting = true; demoMode = false; stop = false; statusMessage = "Conectando...";
            worker = new Thread(() -> {
                try {
                    if (!activity.hasBluetoothPermission()) throw new SecurityException("Bluetooth sin permiso");
                    BluetoothAdapter adapter = BluetoothAdapter.getDefaultAdapter();
                    if (adapter == null || !adapter.isEnabled()) throw new Exception("Bluetooth desactivado");
                    try { adapter.cancelDiscovery(); } catch (Exception ignored) {}
                    socket = device.createRfcommSocketToServiceRecord(SPP);
                    socket.connect();
                    input = socket.getInputStream(); output = socket.getOutputStream();
                    try { deviceName = device.getName(); } catch (Exception e) { deviceName = "OBD"; }
                    initElm();
                    connected = true; connecting = false; statusMessage = "OBD conectado"; lastLoop = System.currentTimeMillis();
                    while (!stop && socket != null && socket.isConnected()) {
                        if (requestClearDtc) { requestClearDtc = false; command("04", 2200); data.dtcs = new String[0]; }
                        if (requestDtc) { requestDtc = false; data.dtcs = parseDtcs(command("03", 2500)); }
                        poll();
                    }
                } catch (Exception e) {
                    statusMessage = "Sin conexión: " + shortMessage(e.getMessage());
                } finally {
                    connected = false; connecting = false; closeSocket();
                }
            }, "OBD-Worker");
            worker.start();
        }

        private String shortMessage(String s) {
            if (s == null || s.trim().isEmpty()) return "comprueba el adaptador";
            return s.length() > 38 ? s.substring(0, 38) : s;
        }

        void disconnect() { stop = true; connected = false; connecting = false; closeSocket(); }

        private synchronized void closeSocket() {
            try { if (input != null) input.close(); } catch (Exception ignored) {}
            try { if (output != null) output.close(); } catch (Exception ignored) {}
            try { if (socket != null) socket.close(); } catch (Exception ignored) {}
            input = null; output = null; socket = null;
        }

        private void initElm() throws Exception {
            command("ATZ", 3000); sleep(450); command("ATE0", 1200); command("ATL0", 1200); command("ATS0", 1200);
            command("ATH0", 1200); command("ATAT1", 1200); command("ATSP0", 3000);
            data.protocol = cleanText(command("ATDP", 1800));
        }

        private void poll() throws Exception {
            long now = System.currentTimeMillis();
            float dtHours = lastLoop == 0 ? 0 : (now - lastLoop) / 3600000f; lastLoop = now;
            Float rpm = pid2("010C", 12, 4f), speed = pid1("010D", 13, 1f, 0f), coolant = pid1("0105", 5, 1f, -40f);
            Float load = pid1("0104", 4, 100f / 255f, 0f), voltage = pid2("0142", 66, 1000f), maf = pid2("0110", 16, 100f);
            Float iat = pid1("010F", 15, 1f, -40f), map = pid1("010B", 11, 1f, 0f), ambient = pid1("0146", 70, 1f, -40f);
            Float throttle = pid1("0111", 17, 100f / 255f, 0f), fuelRate = pid2("015E", 94, 20f);
            if (rpm != null) data.rpm = rpm; if (speed != null) data.speed = speed; if (coolant != null) data.coolant = coolant;
            if (load != null) data.load = load; if (voltage != null) data.voltage = voltage; if (maf != null) data.maf = maf;
            if (iat != null) data.intakeTemp = iat; if (map != null) data.map = map; if (ambient != null) data.ambient = ambient; if (throttle != null) data.throttle = throttle;
            if (fuelRate != null && fuelRate >= 0f) { data.fuelRate = fuelRate; data.fuelRateDirect = true; }
            else if (maf != null && maf > 0f) {
                float afr = diesel ? 14.5f : 14.7f, density = diesel ? 832f : 745f;
                data.fuelRate = maf * 3600f / (afr * density); data.fuelRateDirect = false;
            }
            if ((!Float.isFinite(data.voltage) || data.voltage < 5f) && loopCount % 8 == 0) {
                Float v = parseVoltageText(command("ATRV", 1000)); if (v != null) data.voltage = v;
            }
            if (Float.isFinite(data.speed) && data.speed > 3f && Float.isFinite(data.fuelRate)) data.instantConsumption = data.fuelRate / data.speed * 100f;
            else if (Float.isFinite(data.speed) && data.speed <= 3f) data.instantConsumption = Float.NaN;
            if (dtHours > 0 && dtHours < 0.01f && Float.isFinite(data.rpm) && data.rpm > 300f) {
                data.tripMillis += (long)(dtHours * 3600000f);
                if (Float.isFinite(data.speed)) { data.tripKm += data.speed * dtHours; if (data.speed > data.maxSpeed) data.maxSpeed = data.speed; }
                if (Float.isFinite(data.fuelRate) && data.fuelRate >= 0) data.tripFuel += data.fuelRate * dtHours;
                if (data.tripKm > 0.15f) data.avgConsumption = data.tripFuel / data.tripKm * 100f;
            }
            data.lastUpdate = now; loopCount++; sleep(70);
        }

        private Float pid1(String cmd, int pid, float factor, float offset) throws Exception {
            int[] b = payload(command(cmd, 900), pid, 1); return b == null ? null : b[0] * factor + offset;
        }
        private Float pid2(String cmd, int pid, float divisor) throws Exception {
            int[] b = payload(command(cmd, 900), pid, 2); return b == null ? null : (b[0] * 256f + b[1]) / divisor;
        }
        private int[] payload(String response, int pid, int count) {
            if (response == null) return null;
            String clean = response.toUpperCase(Locale.ROOT).replaceAll("[^0-9A-F]", "");
            String prefix = String.format(Locale.ROOT, "41%02X", pid); int at = clean.indexOf(prefix), start = at + 4;
            if (at < 0 || clean.length() < start + count * 2) return null;
            int[] out = new int[count];
            try { for (int i=0;i<count;i++) out[i] = Integer.parseInt(clean.substring(start+i*2,start+i*2+2),16); return out; } catch(Exception e){ return null; }
        }
        private Float parseVoltageText(String r) {
            if (r == null) return null;
            String[] parts = r.toUpperCase(Locale.ROOT).replace("V"," ").replace(">"," ").trim().split("[^0-9.]+");
            for(String q:parts) try { float v=Float.parseFloat(q); if(v>5&&v<20)return v; } catch(Exception ignored){}
            return null;
        }
        private String[] parseDtcs(String response) {
            ArrayList<String> codes = new ArrayList<>(); if(response==null)return new String[0];
            String clean=response.toUpperCase(Locale.ROOT).replaceAll("[^0-9A-F]",""); int at=clean.indexOf("43"); if(at<0)return new String[0];
            String q=clean.substring(at+2);
            for(int i=0;i+4<=q.length()&&codes.size()<12;i+=4){ String h=q.substring(i,i+4); if("0000".equals(h))continue;
                try{ int a=Integer.parseInt(h.substring(0,2),16),b=Integer.parseInt(h.substring(2,4),16); char type="PCBU".charAt((a>>6)&3);
                    codes.add(""+type+((a>>4)&3)+Integer.toHexString(a&15).toUpperCase(Locale.ROOT)+String.format(Locale.ROOT,"%02X",b)); }catch(Exception ignored){}
            }
            return codes.toArray(new String[0]);
        }
        private String cleanText(String r){ return r==null?"":r.replace(">","").replace("\r"," ").replace("\n"," ").replaceAll("\\s+"," ").trim(); }
        private String command(String cmd,long timeoutMs)throws Exception{
            if(output==null||input==null)throw new Exception("sin canal OBD"); while(input.available()>0)input.read();
            output.write((cmd+"\r").getBytes(StandardCharsets.US_ASCII)); output.flush(); StringBuilder sb=new StringBuilder(); long end=System.currentTimeMillis()+timeoutMs;
            while(System.currentTimeMillis()<end){ if(input.available()>0){ int ch=input.read(); if(ch<0)break; char c=(char)ch; if(c=='>')break; sb.append(c);}else sleep(8); }
            String r=sb.toString(); if(r.toUpperCase(Locale.ROOT).contains("UNABLE TO CONNECT"))throw new Exception("ECU no responde"); return r;
        }
        void requestReadDtcs(){requestDtc=true;} void requestClearDtcs(){requestClearDtc=true;}
        void resetTrip(){data.tripKm=0f;data.tripFuel=0f;data.avgConsumption=Float.NaN;data.maxSpeed=0f;data.tripMillis=0L;}
        private void sleep(long ms){try{Thread.sleep(ms);}catch(InterruptedException ignored){}}
    }

    static class DashboardView extends View {
        private final MainActivity activity; private final ObdManager obd; private final Paint p=new Paint(Paint.ANTI_ALIAS_FLAG);
        private float s=1f; private int page=0,demoTick=0; private String toast=""; private long toastUntil=0;
        private final RectF statusRect=new RectF(),primaryRect=new RectF(),secondaryRect=new RectF(),fuelTypeRect=new RectF();
        private final RectF[] deviceRects={new RectF(),new RectF(),new RectF(),new RectF()};
        private final int BG=Color.rgb(5,7,9),PANEL=Color.rgb(13,17,20),PANEL2=Color.rgb(18,23,27),BORDER=Color.rgb(42,48,52);
        private final int ORANGE=Color.rgb(255,132,0),AMBER=Color.rgb(255,177,0),YELLOW=Color.rgb(255,204,41),WHITE=Color.rgb(247,248,249);
        private final int MUTED=Color.rgb(160,168,174),GREEN=Color.rgb(84,222,121),RED=Color.rgb(255,85,63);

        DashboardView(MainActivity a,ObdManager manager){super(a);activity=a;obd=manager;setBackgroundColor(BG);postDelayed(new Runnable(){@Override public void run(){demoTick++;invalidate();postDelayed(this,700);}},700);}
        private void text(Canvas c,String t,float x,float y,float size,int color,Paint.Align align,boolean bold){p.setShader(null);p.setStyle(Paint.Style.FILL);p.setColor(color);p.setTextAlign(align);p.setTextSize(size*s);p.setTypeface(bold?android.graphics.Typeface.DEFAULT_BOLD:android.graphics.Typeface.DEFAULT);c.drawText(t,x,y,p);}
        private void fillRound(Canvas c,float l,float t,float r,float b,float radius,int color){p.setShader(null);p.setStyle(Paint.Style.FILL);p.setColor(color);c.drawRoundRect(new RectF(l,t,r,b),radius*s,radius*s,p);}
        private void strokeRound(Canvas c,float l,float t,float r,float b,float radius,int color,float width){p.setShader(null);p.setStyle(Paint.Style.STROKE);p.setStrokeWidth(width*s);p.setColor(color);c.drawRoundRect(new RectF(l,t,r,b),radius*s,radius*s,p);}
        private void gradientRound(Canvas c,float l,float t,float r,float b,float radius,int a,int bc){p.setStyle(Paint.Style.FILL);p.setShader(new LinearGradient(l,t,r,b,a,bc,Shader.TileMode.CLAMP));c.drawRoundRect(new RectF(l,t,r,b),radius*s,radius*s,p);p.setShader(null);}
        private void line(Canvas c,float x1,float y1,float x2,float y2,int color,float width){p.setShader(null);p.setStyle(Paint.Style.STROKE);p.setStrokeWidth(width*s);p.setColor(color);c.drawLine(x1,y1,x2,y2,p);}
        private boolean live(){return obd.connected;} private boolean demo(){return !live()&&obd.demoMode;}
        private float demoRpm(){return 2150+(float)Math.sin(demoTick/3.0)*80f;} private float demoSpeed(){return 87+(float)Math.sin(demoTick/4.0)*2f;}
        private float value(float real,float dv){return live()&&Float.isFinite(real)?real:demo()?dv:Float.NaN;}
        private String n(float v,int d){if(!Float.isFinite(v))return "--";return d==0?String.format(Locale.getDefault(),"%.0f",v):String.format(Locale.getDefault(),"%."+d+"f",v);}
        private String time(long ms){long total=ms/1000L,h=total/3600L,m=(total%3600L)/60L;return h>0?h+" h "+m+" min":m+" min";}

        @Override protected void onDraw(Canvas c){super.onDraw(c);float w=getWidth(),h=getHeight();s=Math.max(0.64f,Math.min(w/1600f,h/900f));c.drawColor(BG);drawHeader(c,w);if(page==0)drawHome(c,w,h);else if(page==1)drawTrip(c,w,h);else if(page==2)drawEngine(c,w,h);else if(page==3)drawErrors(c,w,h);else drawConnection(c,w,h);drawNav(c,w,h);drawToast(c,w,h);}

        private void drawHeader(Canvas c,float w){float m=26*s;p.setStyle(Paint.Style.STROKE);p.setStrokeWidth(3*s);p.setColor(AMBER);c.drawRoundRect(new RectF(m,30*s,m+46*s,59*s),8*s,8*s,p);c.drawCircle(m+11*s,60*s,5*s,p);c.drawCircle(m+36*s,60*s,5*s,p);text(c,"Car Monitor",m+62*s,56*s,31,WHITE,Paint.Align.LEFT,true);
            String status;int sc;if(obd.connected){status="OBD CONECTADO";sc=GREEN;}else if(obd.connecting){status="CONECTANDO...";sc=YELLOW;}else{status="OBD DESCONECTADO";sc=RED;}
            statusRect.set(w-560*s,25*s,w-310*s,70*s);fillRound(c,statusRect.left,statusRect.top,statusRect.right,statusRect.bottom,22,PANEL2);strokeRound(c,statusRect.left,statusRect.top,statusRect.right,statusRect.bottom,22,sc,1.5f);p.setStyle(Paint.Style.FILL);p.setColor(sc);c.drawCircle(statusRect.left+20*s,47*s,5*s,p);text(c,status,statusRect.left+36*s,55*s,18,WHITE,Paint.Align.LEFT,true);
            float amb=value(obd.data.ambient,27f);text(c,n(amb,0)+"°C",w-250*s,55*s,28,YELLOW,Paint.Align.RIGHT,true);text(c,"exterior",w-240*s,55*s,18,MUTED,Paint.Align.LEFT,false);text(c,new SimpleDateFormat("HH:mm",Locale.getDefault()).format(new Date()),w-26*s,55*s,27,WHITE,Paint.Align.RIGHT,true);line(c,26*s,90*s,w-26*s,90*s,BORDER,1);}

        private void drawHome(Canvas c,float w,float h){float m=26*s,top=112*s,navTop=h-86*s,gap=14*s,rightW=330*s,mainR=w-m-rightW-gap,gaugeBottom=top+330*s;gradientRound(c,m,top,mainR,gaugeBottom,20,Color.rgb(16,21,24),Color.rgb(9,12,14));strokeRound(c,m,top,mainR,gaugeBottom,20,BORDER,1);float mid=(m+mainR)/2f,r=142*s;float rpm=value(obd.data.rpm,demoRpm()),speed=value(obd.data.speed,demoSpeed());drawGauge(c,m+(mainR-m)*0.28f,top+166*s,r,0,7000,rpm,n(rpm,0),"RPM",true);drawGauge(c,m+(mainR-m)*0.72f,top+166*s,r,0,220,speed,n(speed,0),"km/h",false);line(c,mid,top+30*s,mid,gaugeBottom-30*s,BORDER,1);
            float rx=mainR+gap,cardH=(gaugeBottom-top-gap)/2f;infoCard(c,rx,top,w-m,top+cardH,"fuel","Consumo actual",n(value(obd.data.instantConsumption,6.4f),1),"L/100 km",YELLOW);infoCard(c,rx,top+cardH+gap,w-m,gaugeBottom,"fuel","Consumo medio",n(value(obd.data.avgConsumption,6.8f),1),"L/100 km",AMBER);
            float y1=gaugeBottom+gap,rowGap=12*s,rowH=(navTop-y1-rowGap*2)/2f,colGap=12*s,colW=(w-2*m-2*colGap)/3f,c1=m,c2=m+colW+colGap,c3=m+2*(colW+colGap);infoCard(c,c1,y1,c1+colW,y1+rowH,"temp","Motor",n(value(obd.data.coolant,89f),0),"°C",ORANGE);infoCard(c,c2,y1,c2+colW,y1+rowH,"battery","Batería",n(value(obd.data.voltage,14.2f),1),"V",GREEN);infoCard(c,c3,y1,c3+colW,y1+rowH,"engine","Carga motor",n(value(obd.data.load,34f),0),"%",AMBER);float y2=y1+rowH+rowGap;infoCard(c,c1,y2,c1+colW,navTop-8*s,"road","Trayecto",n(value(obd.data.tripKm,124.6f),1),"km",WHITE);infoCard(c,c2,y2,c2+colW,navTop-8*s,"clock","Tiempo de viaje",live()?time(obd.data.tripMillis):demo()?"1 h 42 min":"--","",WHITE);String sys=obd.connected?(obd.data.dtcs.length==0?"Sin errores":obd.data.dtcs.length+" errores"):demo()?"Sin errores":"Sin conexión";infoCard(c,c3,y2,c3+colW,navTop-8*s,"obd","Sistema OBD",sys,"",obd.connected&&obd.data.dtcs.length>0?RED:GREEN);}

        private void drawGauge(Canvas c,float cx,float cy,float r,float min,float max,float val,String main,String unit,boolean rpmGauge){p.setStyle(Paint.Style.FILL);p.setColor(Color.rgb(8,11,13));c.drawCircle(cx,cy,r,p);RectF rr=new RectF(cx-r+8*s,cy-r+8*s,cx+r-8*s,cy+r-8*s);p.setStyle(Paint.Style.STROKE);p.setStrokeCap(Paint.Cap.ROUND);p.setStrokeWidth(12*s);p.setColor(Color.rgb(40,45,49));c.drawArc(rr,135,270,false,p);float frac=Float.isFinite(val)?Math.max(0,Math.min(1,(val-min)/(max-min))):0;p.setColor(AMBER);c.drawArc(rr,135,270*frac,false,p);if(rpmGauge){p.setColor(RED);c.drawArc(rr,135+270*0.84f,270*0.16f,false,p);}int ticks=rpmGauge?7:11;for(int i=0;i<=ticks;i++){double a=Math.toRadians(135+270.0*i/ticks);float x1=cx+(float)Math.cos(a)*(r-28*s),y1=cy+(float)Math.sin(a)*(r-28*s),x2=cx+(float)Math.cos(a)*(r-46*s),y2=cy+(float)Math.sin(a)*(r-46*s);line(c,x1,y1,x2,y2,WHITE,2);String lab=rpmGauge?String.valueOf(i):String.valueOf(i*20);text(c,lab,cx+(float)Math.cos(a)*(r-70*s),cy+(float)Math.sin(a)*(r-70*s)+6*s,15,WHITE,Paint.Align.CENTER,false);}text(c,main,cx,cy+8*s,54,WHITE,Paint.Align.CENTER,true);text(c,unit,cx,cy+48*s,21,MUTED,Paint.Align.CENTER,true);if(rpmGauge)text(c,"x1000",cx,cy+76*s,14,MUTED,Paint.Align.CENTER,false);}

        private void infoCard(Canvas c,float l,float t,float r,float b,String icon,String label,String value,String unit,int accent){fillRound(c,l,t,r,b,17,PANEL);strokeRound(c,l,t,r,b,17,BORDER,1);drawIcon(c,icon,l+30*s,(t+b)/2f,accent);text(c,label,l+62*s,t+31*s,18,MUTED,Paint.Align.LEFT,false);float vs=value.length()>12?25:value.length()>8?29:37;text(c,value,l+62*s,b-22*s,vs,accent==GREEN?GREEN:WHITE,Paint.Align.LEFT,true);if(!unit.isEmpty())text(c,unit,r-18*s,b-24*s,18,MUTED,Paint.Align.RIGHT,false);}
        private void drawIcon(Canvas c,String type,float x,float y,int color){p.setShader(null);p.setColor(color);p.setStrokeWidth(3*s);p.setStyle(Paint.Style.STROKE);if("fuel".equals(type)){c.drawRoundRect(new RectF(x-12*s,y-18*s,x+9*s,y+18*s),3*s,3*s,p);c.drawLine(x+9*s,y-12*s,x+18*s,y-7*s,p);c.drawLine(x+18*s,y-7*s,x+18*s,y+12*s,p);}else if("temp".equals(type)){c.drawCircle(x,y+11*s,7*s,p);c.drawLine(x,y+8*s,x,y-18*s,p);c.drawLine(x+7*s,y-8*s,x+14*s,y-8*s,p);}else if("battery".equals(type)){c.drawRect(x-17*s,y-11*s,x+17*s,y+12*s,p);c.drawLine(x-7*s,y-15*s,x-2*s,y-15*s,p);c.drawLine(x+5*s,y-15*s,x+10*s,y-15*s,p);c.drawLine(x-8*s,y,x-2*s,y,p);c.drawLine(x+6*s,y-4*s,x+6*s,y+4*s,p);c.drawLine(x+2*s,y,x+10*s,y,p);}else if("engine".equals(type)||"obd".equals(type)){c.drawRoundRect(new RectF(x-18*s,y-11*s,x+18*s,y+11*s),4*s,4*s,p);c.drawLine(x-10*s,y-16*s,x+6*s,y-16*s,p);c.drawLine(x+18*s,y-5*s,x+25*s,y-5*s,p);}else if("road".equals(type)){c.drawLine(x-14*s,y+18*s,x-5*s,y-18*s,p);c.drawLine(x+14*s,y+18*s,x+5*s,y-18*s,p);c.drawLine(x,y-13*s,x,y-4*s,p);c.drawLine(x,y+3*s,x,y+12*s,p);}else if("clock".equals(type)){c.drawCircle(x,y,17*s,p);c.drawLine(x,y,x,y-10*s,p);c.drawLine(x,y,x+9*s,y+5*s,p);}}

        private void drawTrip(Canvas c,float w,float h){float m=26*s,top=112*s,navTop=h-86*s,g=14*s,left=w*0.43f;gradientRound(c,m,top,left,navTop-8*s,20,Color.rgb(16,21,24),Color.rgb(9,12,14));strokeRound(c,m,top,left,navTop-8*s,20,BORDER,1);text(c,"VIAJE ACTUAL",m+30*s,top+42*s,21,MUTED,Paint.Align.LEFT,true);text(c,n(value(obd.data.tripKm,124.6f),1),m+30*s,top+135*s,78,WHITE,Paint.Align.LEFT,true);text(c,"km",m+270*s,top+128*s,28,YELLOW,Paint.Align.LEFT,true);text(c,live()?time(obd.data.tripMillis):demo()?"1 h 42 min":"--",m+30*s,top+200*s,31,WHITE,Paint.Align.LEFT,true);text(c,"tiempo en marcha",m+30*s,top+232*s,18,MUTED,Paint.Align.LEFT,false);line(c,m+30*s,top+270*s,left-30*s,top+270*s,BORDER,1);text(c,n(value(obd.data.avgConsumption,6.8f),1),m+30*s,top+354*s,58,YELLOW,Paint.Align.LEFT,true);text(c,"L/100 km  MEDIA",m+168*s,top+347*s,20,MUTED,Paint.Align.LEFT,true);float avg=live()&&obd.data.tripMillis>1000?obd.data.tripKm/(obd.data.tripMillis/3600000f):demo()?73f:Float.NaN;text(c,n(avg,0)+" km/h",m+30*s,top+420*s,30,WHITE,Paint.Align.LEFT,true);text(c,"velocidad media",m+30*s,top+450*s,18,MUTED,Paint.Align.LEFT,false);float rL=left+g,rR=w-m,cardW=(rR-rL-g)/2f,cardH=145*s;infoCard(c,rL,top,rL+cardW,top+cardH,"fuel","Combustible",n(value(obd.data.tripFuel,8.5f),1),"L",YELLOW);infoCard(c,rL+cardW+g,top,rR,top+cardH,"road","Velocidad máx.",n(value(obd.data.maxSpeed,112f),0),"km/h",ORANGE);infoCard(c,rL,top+cardH+g,rL+cardW,top+2*cardH+g,"clock","Tiempo viaje",live()?time(obd.data.tripMillis):demo()?"1 h 42 min":"--","",WHITE);infoCard(c,rL+cardW+g,top+cardH+g,rR,top+2*cardH+g,"fuel","Consumo medio",n(value(obd.data.avgConsumption,6.8f),1),"L/100 km",AMBER);float bt=top+2*cardH+g*2;primaryRect.set(rL,bt,rR,navTop-8*s);fillRound(c,rL,bt,rR,navTop-8*s,17,Color.rgb(45,34,5));strokeRound(c,rL,bt,rR,navTop-8*s,17,YELLOW,1.5f);text(c,"REINICIAR VIAJE",(rL+rR)/2f,bt+(navTop-8*s-bt)*0.55f,25,YELLOW,Paint.Align.CENTER,true);}

        private void drawEngine(Canvas c,float w,float h){float m=26*s,top=112*s,navTop=h-86*s,g=14*s,cardW=(w-2*m-2*g)/3f,cardH=(navTop-top-g*2-8*s)/3f;String[] labels={"Temperatura motor","Voltaje batería","Carga motor","Caudal MAF","Temp. admisión","Presión MAP","Acelerador","Consumo/h","Protocolo"};String[] vals={n(value(obd.data.coolant,89f),0),n(value(obd.data.voltage,14.2f),1),n(value(obd.data.load,34f),0),n(value(obd.data.maf,18.4f),1),n(value(obd.data.intakeTemp,31f),0),n(value(obd.data.map,102f),0),n(value(obd.data.throttle,22f),0),n(value(obd.data.fuelRate,5.6f),1),obd.connected?(obd.data.protocol.isEmpty()?"AUTO":obd.data.protocol):demo()?"AUTO / CAN":"--"};String[] units={"°C","V","%","g/s","°C","kPa","%","L/h",""};String[] icons={"temp","battery","engine","engine","temp","engine","engine","fuel","obd"};int[] accents={ORANGE,GREEN,AMBER,YELLOW,ORANGE,WHITE,AMBER,YELLOW,GREEN};int k=0;for(int row=0;row<3;row++)for(int col=0;col<3;col++){float l=m+col*(cardW+g),t=top+row*(cardH+g);infoCard(c,l,t,l+cardW,t+cardH,icons[k],labels[k],vals[k],units[k],accents[k]);k++;}}

        private void drawErrors(Canvas c,float w,float h){float m=26*s,top=112*s,navTop=h-86*s,g=14*s,left=w*0.43f;fillRound(c,m,top,left,navTop-8*s,20,PANEL);strokeRound(c,m,top,left,navTop-8*s,20,BORDER,1);boolean has=obd.data.dtcs.length>0;text(c,has?"AVERÍAS DETECTADAS":"SISTEMA OBD",m+32*s,top+46*s,22,MUTED,Paint.Align.LEFT,true);text(c,has?String.valueOf(obd.data.dtcs.length):"OK",m+32*s,top+150*s,78,has?RED:GREEN,Paint.Align.LEFT,true);text(c,has?"códigos guardados":"Sin errores registrados",m+32*s,top+195*s,25,WHITE,Paint.Align.LEFT,true);text(c,obd.connected?"Conectado a "+(obd.deviceName.isEmpty()?"OBD":obd.deviceName):demo()?"Modo demostración":"Conecta el OBD para leer fallos",m+32*s,top+242*s,18,MUTED,Paint.Align.LEFT,false);float rL=left+g,rR=w-m;fillRound(c,rL,top,rR,top+285*s,20,PANEL);strokeRound(c,rL,top,rR,top+285*s,20,BORDER,1);text(c,"CÓDIGOS DTC",rL+26*s,top+40*s,21,MUTED,Paint.Align.LEFT,true);String[] codes=obd.data.dtcs;if(codes.length==0&&demo())codes=new String[]{"Sin códigos de avería"};if(codes.length==0)text(c,"No hay datos todavía",rL+26*s,top+96*s,26,WHITE,Paint.Align.LEFT,true);else for(int i=0;i<Math.min(codes.length,4);i++){int col=i%2,row=i/2;float x=rL+26*s+col*((rR-rL)/2f),y=top+94*s+row*82*s;text(c,codes[i],x,y,28,"Sin códigos de avería".equals(codes[i])?GREEN:RED,Paint.Align.LEFT,true);if(!"Sin códigos de avería".equals(codes[i]))text(c,"Código diagnóstico OBD-II",x,y+26*s,16,MUTED,Paint.Align.LEFT,false);}float bt=top+299*s;primaryRect.set(rL,bt,rL+(rR-rL-g)/2f,navTop-8*s);secondaryRect.set(primaryRect.right+g,bt,rR,navTop-8*s);fillRound(c,primaryRect.left,bt,primaryRect.right,navTop-8*s,17,Color.rgb(45,34,5));strokeRound(c,primaryRect.left,bt,primaryRect.right,navTop-8*s,17,YELLOW,1.5f);text(c,"LEER AVERÍAS",primaryRect.centerX(),bt+(navTop-8*s-bt)*0.55f,23,YELLOW,Paint.Align.CENTER,true);fillRound(c,secondaryRect.left,bt,secondaryRect.right,navTop-8*s,17,PANEL2);strokeRound(c,secondaryRect.left,bt,secondaryRect.right,navTop-8*s,17,RED,1.3f);text(c,"BORRAR CÓDIGOS",secondaryRect.centerX(),bt+(navTop-8*s-bt)*0.55f,23,RED,Paint.Align.CENTER,true);}

        private void drawConnection(Canvas c,float w,float h){float m=26*s,top=112*s,navTop=h-86*s,g=14*s,left=w*0.48f;fillRound(c,m,top,left,navTop-8*s,20,PANEL);strokeRound(c,m,top,left,navTop-8*s,20,BORDER,1);text(c,"CONEXIÓN OBD",m+30*s,top+48*s,26,WHITE,Paint.Align.LEFT,true);text(c,"Vgate / ELM327 · Bluetooth Classic",m+30*s,top+82*s,18,MUTED,Paint.Align.LEFT,false);String st=obd.connected?"Conectado":obd.connecting?"Conectando...":"Desconectado";text(c,st,m+30*s,top+144*s,42,obd.connected?GREEN:obd.connecting?YELLOW:RED,Paint.Align.LEFT,true);if(obd.connected)text(c,obd.deviceName,m+30*s,top+180*s,21,WHITE,Paint.Align.LEFT,true);text(c,obd.statusMessage,m+30*s,top+220*s,18,MUTED,Paint.Align.LEFT,false);primaryRect.set(m+30*s,top+275*s,left-30*s,top+350*s);fillRound(c,primaryRect.left,primaryRect.top,primaryRect.right,primaryRect.bottom,16,Color.rgb(49,37,4));strokeRound(c,primaryRect.left,primaryRect.top,primaryRect.right,primaryRect.bottom,16,YELLOW,1.5f);text(c,obd.connected?"DESCONECTAR":"CONECTAR OBD",primaryRect.centerX(),primaryRect.centerY()+8*s,25,YELLOW,Paint.Align.CENTER,true);secondaryRect.set(m+30*s,top+367*s,left-30*s,top+432*s);fillRound(c,secondaryRect.left,secondaryRect.top,secondaryRect.right,secondaryRect.bottom,16,PANEL2);strokeRound(c,secondaryRect.left,secondaryRect.top,secondaryRect.right,secondaryRect.bottom,16,BORDER,1);text(c,"MODO DEMO: "+(obd.demoMode?"ACTIVO":"DESACTIVADO"),secondaryRect.centerX(),secondaryRect.centerY()+7*s,20,obd.demoMode?YELLOW:MUTED,Paint.Align.CENTER,true);fuelTypeRect.set(m+30*s,top+449*s,left-30*s,top+514*s);fillRound(c,fuelTypeRect.left,fuelTypeRect.top,fuelTypeRect.right,fuelTypeRect.bottom,16,PANEL2);strokeRound(c,fuelTypeRect.left,fuelTypeRect.top,fuelTypeRect.right,fuelTypeRect.bottom,16,BORDER,1);text(c,"COMBUSTIBLE: "+(obd.diesel?"DIÉSEL":"GASOLINA"),fuelTypeRect.centerX(),fuelTypeRect.centerY()+7*s,20,WHITE,Paint.Align.CENTER,true);float rL=left+g,rR=w-m;fillRound(c,rL,top,rR,navTop-8*s,20,PANEL);strokeRound(c,rL,top,rR,navTop-8*s,20,BORDER,1);text(c,"DISPOSITIVOS EMPAREJADOS",rL+26*s,top+42*s,20,MUTED,Paint.Align.LEFT,true);if(!activity.hasBluetoothPermission()){text(c,"Permite acceso a dispositivos cercanos",rL+26*s,top+96*s,24,WHITE,Paint.Align.LEFT,true);text(c,"Android necesita este permiso para usar el OBD.",rL+26*s,top+130*s,18,MUTED,Paint.Align.LEFT,false);}else{obd.refreshBondedDevices();int count=Math.min(4,obd.bonded.size());if(count==0){text(c,"No hay dispositivos emparejados",rL+26*s,top+96*s,25,WHITE,Paint.Align.LEFT,true);text(c,"Empareja primero el Vgate desde Ajustes > Bluetooth.",rL+26*s,top+132*s,18,MUTED,Paint.Align.LEFT,false);}for(int i=0;i<count;i++){float yt=top+64*s+i*92*s;deviceRects[i].set(rL+22*s,yt,rR-22*s,yt+76*s);fillRound(c,deviceRects[i].left,yt,deviceRects[i].right,yt+76*s,14,PANEL2);strokeRound(c,deviceRects[i].left,yt,deviceRects[i].right,yt+76*s,14,BORDER,1);BluetoothDevice d=obd.bonded.get(i);String name="OBD",addr="";try{if(d.getName()!=null)name=d.getName();addr=d.getAddress();}catch(Exception ignored){}text(c,name,deviceRects[i].left+22*s,yt+31*s,22,WHITE,Paint.Align.LEFT,true);text(c,addr,deviceRects[i].left+22*s,yt+56*s,15,MUTED,Paint.Align.LEFT,false);text(c,"CONECTAR",deviceRects[i].right-20*s,yt+45*s,18,YELLOW,Paint.Align.RIGHT,true);}}text(c,"Empareja el OBD una vez desde Android. Después puedes conectar desde aquí.",rL+26*s,navTop-30*s,16,MUTED,Paint.Align.LEFT,false);}

        private void drawNav(Canvas c,float w,float h){float top=h-78*s;line(c,26*s,top,w-26*s,top,BORDER,1);String[] labs={"Inicio","Viaje","Motor","Errores"};for(int i=0;i<4;i++){float cx=w*(0.125f+0.25f*i);boolean active=page==i;int col=active?YELLOW:MUTED;String icon=i==0?"⌂":i==1?"↗":i==2?"⚙":"△";text(c,icon,cx,top+29*s,26,col,Paint.Align.CENTER,true);text(c,labs[i],cx,top+58*s,18,col,Paint.Align.CENTER,active);if(active)fillRound(c,cx-52*s,top+68*s,cx+52*s,top+72*s,2,col);}}
        private void showToast(String msg){toast=msg;toastUntil=System.currentTimeMillis()+2300;invalidate();}
        private void drawToast(Canvas c,float w,float h){if(System.currentTimeMillis()>toastUntil||toast.isEmpty())return;float tw=520*s,th=60*s,l=(w-tw)/2f,b=h-105*s,t=b-th;fillRound(c,l,t,l+tw,b,25,Color.rgb(28,31,34));strokeRound(c,l,t,l+tw,b,25,BORDER,1);text(c,toast,w/2f,t+39*s,20,WHITE,Paint.Align.CENTER,true);}

        @Override public boolean onTouchEvent(MotionEvent e){if(e.getAction()!=MotionEvent.ACTION_UP)return true;float x=e.getX(),y=e.getY(),w=getWidth(),h=getHeight();if(statusRect.contains(x,y)){page=4;invalidate();return true;}if(y>h-92*s){page=Math.min(3,Math.max(0,(int)(x/(w/4f))));invalidate();return true;}if(page==1&&primaryRect.contains(x,y)){obd.resetTrip();showToast("Viaje reiniciado");return true;}if(page==3){if(primaryRect.contains(x,y)){if(obd.connected){obd.requestReadDtcs();showToast("Leyendo averías...");}else showToast("Conecta el OBD primero");return true;}if(secondaryRect.contains(x,y)){if(obd.connected){obd.requestClearDtcs();showToast("Borrando códigos...");}else showToast("Conecta el OBD primero");return true;}}if(page==4){if(primaryRect.contains(x,y)){if(obd.connected||obd.connecting){obd.disconnect();showToast("OBD desconectado");}else{obd.connectPreferred();showToast("Conectando con OBD...");}invalidate();return true;}if(secondaryRect.contains(x,y)){obd.demoMode=!obd.demoMode;invalidate();return true;}if(fuelTypeRect.contains(x,y)){obd.diesel=!obd.diesel;showToast(obd.diesel?"Perfil diésel":"Perfil gasolina");invalidate();return true;}for(int i=0;i<4;i++)if(deviceRects[i].contains(x,y)&&i<obd.bonded.size()){obd.connect(obd.bonded.get(i));showToast("Conectando...");return true;}}return true;}
    }
}
