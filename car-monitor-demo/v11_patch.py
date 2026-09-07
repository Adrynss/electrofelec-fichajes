from pathlib import Path

p = Path('app/src/main/java/com/carmonitor/demo/MainActivity.java')
s = p.read_text(encoding='utf-8')

def replace_method(text, start_sig, next_sig, new_method):
    a = text.index(start_sig)
    b = text.index(next_sig, a)
    return text[:a] + new_method.rstrip() + '\n\n        ' + text[b:]

# The reference dashboard is 16:9. Previous builds used a 2:1 virtual canvas,
# which made the whole UI look too wide and flat on a phone.
s = s.replace('s=Math.min(w/1800f,h/900f);\n            float usedW=1800*s, usedH=900*s;',
              's=Math.min(w/1600f,h/900f);\n            float usedW=1600*s, usedH=900*s;')
s = s.replace('drawNav(canvas);', 'if(page<=3) drawNav(canvas);')

# Dark navy/black surfaces closer to the reference image.
s = s.replace('private final int bg = Color.rgb(5,7,9);', 'private final int bg = Color.rgb(3,8,12);')
s = s.replace('private final int panel = Color.rgb(12,16,19);', 'private final int panel = Color.rgb(7,17,25);')
s = s.replace('private final int panel2 = Color.rgb(15,20,24);', 'private final int panel2 = Color.rgb(9,22,32);')
s = s.replace('private final int border = Color.rgb(39,47,53);', 'private final int border = Color.rgb(20,48,66);')
s = s.replace('private final int muted = Color.rgb(164,173,181);', 'private final int muted = Color.rgb(181,193,202);')

new_header = r'''private void drawHeader(Canvas c){
            backRect.setEmpty();
            gearRect.setEmpty();
            obdRect.setEmpty();
            line(c,20,78,1580,78,border,1);

            if(page==4 || page==5){
                backRect.set(X(20),X(13),X(155),X(64));
                round(c,20,13,155,64,22,panel2); outline(c,20,13,155,64,22,border,1.2f);
                line(c,52,28,36,39,white,3); line(c,36,39,52,50,white,3);
                txt(c,"VOLVER",69,47,17,white,Paint.Align.LEFT,true);
                txt(c,page==4?"Conexión OBD":"Ajustes",175,50,27,white,Paint.Align.LEFT,true);
            }else{
                drawCarIcon(c,28,21,43,accent);
                txt(c,"Car Monitor",82,51,27,white,Paint.Align.LEFT,true);

                // Same compact pill position as the small status chip in the reference.
                obdRect.set(X(300),X(16),X(510),X(61));
                round(c,300,16,510,61,21,panel2); outline(c,300,16,510,61,21,obd.connected?green:accent,1.3f);
                p.setStyle(Paint.Style.FILL); p.setColor(obd.connected?green:accent); c.drawCircle(X(320),X(38),X(5),p);
                txt(c,obd.connected?"OBD conectado":"OBD desconectado",338,46,15,obd.connected?green:accent2,Paint.Align.LEFT,true);

                gearRect.set(X(1288),X(15),X(1338),X(63));
                round(c,1288,15,1338,63,23,panel2); outline(c,1288,15,1338,63,23,border,1);
                drawGear(c,1313,39,13,muted);
            }

            String temp;
            if(obd.connected) temp=Float.isNaN(obd.ambient)?"--°C":String.format(Locale.getDefault(),"%.0f°C",obd.ambient);
            else temp="27°C";
            txt(c,temp,1372,48,27,accent2,Paint.Align.LEFT,true);
            txt(c,"exterior",1438,47,16,muted,Paint.Align.LEFT,false);
            txt(c,new SimpleDateFormat("HH:mm",Locale.getDefault()).format(new Date()),1575,48,27,white,Paint.Align.RIGHT,true);
        }'''
s = replace_method(s, 'private void drawHeader(Canvas c){', 'private void drawHome(Canvas c){', new_header)

new_home = r'''private void drawHome(Canvas c){
            // Exact reference composition on a 1600x900 (16:9) virtual canvas.
            // Top: 69% dual-gauge panel + 29% stacked consumption cards.
            round(c,20,94,1100,407,18,panel); outline(c,20,94,1100,407,18,border,1.3f);
            line(c,557,116,557,386,border,1);
            drawGauge(c,286,251,145,true);
            drawGauge(c,827,251,145,false);

            drawConsumptionCard(c,1115,94,1580,244,true);
            drawConsumptionCard(c,1115,257,1580,407,false);

            // Bottom 3x2 card grid, same visual hierarchy as the reference.
            drawDataCard(c,20,421,515,570,0,"Temp. motor",valueTemp(),"°C",accent);
            drawDataCard(c,528,421,1045,570,1,"Voltaje batería",valueBattery(),"V",green);
            drawDataCard(c,1058,421,1580,570,2,"Carga motor",valueLoad(),"%",accent);
            drawDataCard(c,20,583,515,735,3,"Trayecto",valueTrip(),"km",white);
            drawDataCard(c,528,583,1045,735,4,"Tiempo de viaje",valueTime(),"",white);
            drawDataCard(c,1058,583,1580,735,5,"Sistema OBD",obd.dtcs.isEmpty()?"Sin errores":obd.dtcs.size()+" errores","",obd.dtcs.isEmpty()?green:red);
        }'''
s = replace_method(s, 'private void drawHome(Canvas c){', 'private int demoRpm()', new_home)

new_gauge = r'''private void drawGauge(Canvas c,float cx,float cy,float r,boolean rpmGauge){
            // Visual gauge copied from the reference: a long ornamental accent arc,
            // dark remainder, many tiny ticks and a short bright marker for the live value.
            p.setStyle(Paint.Style.FILL); p.setColor(Color.rgb(4,12,18)); c.drawCircle(X(cx),X(cy),X(r),p);

            RectF outer=new RectF(X(cx-r+7),X(cy-r+7),X(cx+r-7),X(cy+r-7));
            stroke.setStrokeCap(Paint.Cap.ROUND);
            stroke.setStrokeWidth(X(9)); stroke.setColor(Color.rgb(23,43,56));
            c.drawArc(outer,136,268,false,stroke);
            stroke.setColor(accent);
            c.drawArc(outer,136,202,false,stroke);

            int ticks=26;
            for(int i=0;i<=ticks;i++){
                double a=Math.toRadians(136+268.0*i/ticks);
                float len=(i%5==0)?14:8;
                float x1=cx+(float)Math.cos(a)*(r-22), y1=cy+(float)Math.sin(a)*(r-22);
                float x2=cx+(float)Math.cos(a)*(r-22-len), y2=cy+(float)Math.sin(a)*(r-22-len);
                line(c,x1,y1,x2,y2,i%5==0?white:accent2,i%5==0?1.8f:1.1f);
            }

            // Live marker on the scale.
            float frac=rpmGauge?Math.min(1f,rpm()/8000f):Math.min(1f,speed()/240f);
            double ma=Math.toRadians(136+268*frac);
            float mx1=cx+(float)Math.cos(ma)*(r-12), my1=cy+(float)Math.sin(ma)*(r-12);
            float mx2=cx+(float)Math.cos(ma)*(r-37), my2=cy+(float)Math.sin(ma)*(r-37);
            line(c,mx1,my1,mx2,my2,accent2,4.5f);

            txt(c,String.valueOf(rpmGauge?rpm():speed()),cx,cy+5,58,white,Paint.Align.CENTER,true);
            txt(c,rpmGauge?"RPM":"km/h",cx,cy+42,20,white,Paint.Align.CENTER,false);
            txt(c,"0",cx-r+27,cy+r-20,14,white,Paint.Align.CENTER,false);
            txt(c,rpmGauge?"8":"240",cx+r-27,cy+r-20,14,white,Paint.Align.CENTER,false);
            if(rpmGauge) txt(c,"x1000",cx,cy+r-16,13,muted,Paint.Align.CENTER,false);
        }'''
s = replace_method(s, 'private void drawGauge(Canvas c,float cx,float cy,float r,boolean rpmGauge){', 'private void drawConsumptionCard', new_gauge)

new_cons = r'''private void drawConsumptionCard(Canvas c,float l,float t,float r,float b,boolean current){
            round(c,l,t,r,b,17,panel); outline(c,l,t,r,b,17,border,1.3f);
            drawFuelIcon(c,l+28,t+45,37,accent);
            txt(c,current?"Consumo actual":"Consumo medio",l+87,t+31,18,muted,Paint.Align.LEFT,false);
            String v=String.format(Locale.getDefault(),"%.1f",current?currentCons():avgCons());
            txt(c,v,l+87,t+95,45,white,Paint.Align.LEFT,true);
            txt(c,"L/100 km",r-20,t+94,17,muted,Paint.Align.RIGHT,false);
        }'''
s = replace_method(s, 'private void drawConsumptionCard(Canvas c,float l,float t,float r,float b,boolean current){', 'private void drawDataCard', new_cons)

new_data = r'''private void drawDataCard(Canvas c,float l,float t,float r,float b,int icon,String label,String value,String unit,int color){
            round(c,l,t,r,b,17,panel); outline(c,l,t,r,b,17,border,1.25f);

            if(icon==0) drawThermometer(c,l+25,t+61,39,color);
            else if(icon==1) drawBattery(c,l+23,t+59,42,color);
            else if(icon==2) drawEngineIcon(c,l+22,t+58,45,color);
            else if(icon==3) drawRoad(c,l+22,t+57,44,color);
            else if(icon==4) drawClock(c,l+23,t+57,42,color);
            else drawEngineIcon(c,l+22,t+57,45,color);

            txt(c,label,l+80,t+31,18,muted,Paint.Align.LEFT,false);
            float base=b-24;
            float size=(icon==4?35:(icon==5?31:40));
            int valColor=(icon==1||icon==5)?color:white;
            txt(c,value,l+80,base,size,valColor,Paint.Align.LEFT,true);
            if(!unit.isEmpty()) txt(c,unit,r-18,base,16,muted,Paint.Align.RIGHT,false);
        }'''
s = replace_method(s, 'private void drawDataCard(Canvas c,float l,float t,float r,float b,int icon,String label,String value,String unit,int color){', 'private void drawNav(Canvas c){', new_data)

new_nav = r'''private void drawNav(Canvas c){
            // Reference-style bottom navigation bar.
            round(c,20,750,1580,892,0,Color.rgb(5,14,21));
            line(c,20,750,1580,750,border,1);
            String[] names={"Inicio","Viaje","Motor","Errores"};
            for(int i=0;i<4;i++){
                float cx=200+i*400;
                boolean active=page==i;
                int col=active?accent:muted;
                if(i==0) drawHomeIcon(c,cx,785,20,col);
                else if(i==1) drawClock(c,cx-17,768,34,col);
                else if(i==2) drawEngineIcon(c,cx-20,768,39,col);
                else drawWarning(c,cx,785,20,col);
                txt(c,names[i],cx,833,17,col,Paint.Align.CENTER,active);
                if(active) round(c,cx-44,850,cx+44,855,3,accent);
            }
        }'''
s = replace_method(s, 'private void drawNav(Canvas c){', 'private void drawTrip(Canvas c){', new_nav)

new_trip = r'''private void drawTrip(Canvas c){
            txt(c,"Viaje actual",24,118,26,white,Paint.Align.LEFT,true);
            round(c,20,138,650,730,18,panel); outline(c,20,138,650,730,18,border,1.2f);
            txt(c,valueTrip(),52,270,78,white,Paint.Align.LEFT,true); txt(c,"km",285,267,26,accent,Paint.Align.LEFT,true);
            txt(c,"Distancia recorrida",52,308,17,muted,Paint.Align.LEFT,false);
            txt(c,valueTime(),52,397,43,white,Paint.Align.LEFT,true); txt(c,"Tiempo de viaje",52,434,17,muted,Paint.Align.LEFT,false);
            txt(c,String.format(Locale.getDefault(),"%.1f",avgCons()),52,527,57,accent,Paint.Align.LEFT,true); txt(c,"L/100 km",216,521,24,white,Paint.Align.LEFT,false);
            txt(c,"Consumo medio",52,561,17,muted,Paint.Align.LEFT,false);
            resetTripRect.set(X(52),X(620),X(620),X(695)); round(c,52,620,620,695,15,panel2); outline(c,52,620,620,695,15,accent,1.4f);
            txt(c,"REINICIAR VIAJE",336,666,21,accent,Paint.Align.CENTER,true);

            drawMetricBox(c,675,138,1118,315,"Velocidad media",String.format(Locale.getDefault(),"%.0f",obd.connected?obd.avgSpeed:73f),"km/h",accent);
            drawMetricBox(c,1135,138,1580,315,"Velocidad máxima",String.format(Locale.getDefault(),"%.0f",obd.connected?obd.maxSpeed:112f),"km/h",accent);
            drawMetricBox(c,675,333,1118,510,"Combustible estimado",String.format(Locale.getDefault(),"%.1f",obd.connected?obd.tripFuel:8.5f),"L",accent);
            drawMetricBox(c,1135,333,1580,510,"Consumo actual",String.format(Locale.getDefault(),"%.1f",currentCons()),"L/100 km",accent);
            drawMetricBox(c,675,528,1118,730,"RPM actuales",String.valueOf(rpm()),"RPM",accent);
            drawMetricBox(c,1135,528,1580,730,"Velocidad actual",String.valueOf(speed()),"km/h",accent);
        }'''
s = replace_method(s, 'private void drawTrip(Canvas c){', 'private void drawMetricBox', new_trip)

new_engine = r'''private void drawEngine(Canvas c){
            txt(c,"Motor",24,118,26,white,Paint.Align.LEFT,true);
            float[][] box={{20,138,510,315},{525,138,1040,315},{1055,138,1580,315},{20,333,510,510},{525,333,1040,510},{1055,333,1580,510},{20,528,510,730},{525,528,1040,730},{1055,528,1580,730}};
            String[] labs={"Temperatura motor","Voltaje batería","Carga motor","MAF","Temp. admisión","Presión MAP","Acelerador","RPM","Velocidad"};
            String[] vals={valueTemp(),valueBattery(),valueLoad(),fmt(obd.connected?obd.maf:18.4f,1),String.valueOf(Math.round(obd.connected?obd.intake:31)),String.valueOf(Math.round(obd.connected?obd.map:101)),String.valueOf(Math.round(obd.connected?obd.throttle:22)),String.valueOf(rpm()),String.valueOf(speed())};
            String[] units={"°C","V","%","g/s","°C","kPa","%","RPM","km/h"};
            for(int i=0;i<9;i++) drawMetricBox(c,box[i][0],box[i][1],box[i][2],box[i][3],labs[i],vals[i],units[i],accent);
        }'''
s = replace_method(s, 'private void drawEngine(Canvas c){', 'private String fmt', new_engine)

new_errors = r'''private void drawErrors(Canvas c){
            txt(c,"Diagnóstico OBD",24,118,26,white,Paint.Align.LEFT,true);
            round(c,20,138,1580,535,18,panel); outline(c,20,138,1580,535,18,border,1.2f);
            drawEngineIcon(c,52,177,45,obd.dtcs.isEmpty()?green:red);
            txt(c,obd.dtcs.isEmpty()?"Sin errores detectados":obd.dtcs.size()+" códigos detectados",120,199,31,obd.dtcs.isEmpty()?green:red,Paint.Align.LEFT,true);
            txt(c,obd.connected?"Centralita conectada":"Conecta el OBD para leer errores reales",120,233,18,muted,Paint.Align.LEFT,false);
            if(obd.dtcs.isEmpty()) txt(c,"No hay códigos DTC almacenados en la lectura actual.",52,315,23,white,Paint.Align.LEFT,false);
            else { float y=295; for(String d:obd.dtcs){ txt(c,"•  "+d,52,y,24,white,Paint.Align.LEFT,true); y+=46; if(y>500) break; } }
            readDtcRect.set(X(20),X(565),X(770),X(705)); clearDtcRect.set(X(790),X(565),X(1580),X(705));
            round(c,20,565,770,705,17,panel2); outline(c,20,565,770,705,17,accent,1.5f); txt(c,"LEER ERRORES",395,644,24,accent,Paint.Align.CENTER,true);
            round(c,790,565,1580,705,17,Color.rgb(30,12,15)); outline(c,790,565,1580,705,17,red,1.5f); txt(c,"BORRAR ERRORES",1185,644,24,red,Paint.Align.CENTER,true);
        }'''
s = replace_method(s, 'private void drawErrors(Canvas c){', 'private void drawConnection(Canvas c){', new_errors)

new_connection = r'''private void drawConnection(Canvas c){
            round(c,20,94,1580,850,18,panel); outline(c,20,94,1580,850,18,border,1.2f);
            txt(c,obd.connected?"Conectado a "+obd.deviceName:"Selecciona un OBD Bluetooth emparejado",48,148,27,obd.connected?green:white,Paint.Align.LEFT,true);
            txt(c,"Compatible con ELM327 / Vgate iCar Pro 2S mediante Bluetooth Classic",48,181,17,muted,Paint.Align.LEFT,false);
            if(!hasBluetoothPermission()){
                txt(c,"Falta permiso Bluetooth. Toca aquí para concederlo.",48,255,23,red,Paint.Align.LEFT,true); return;
            }
            deviceRects.clear(); deviceHits.clear();
            List<BluetoothDevice> devices=getBonded();
            if(devices.isEmpty()) txt(c,"No hay dispositivos emparejados. Empareja primero el Vgate desde Ajustes de Android.",48,265,21,muted,Paint.Align.LEFT,false);
            float y=220;
            for(BluetoothDevice d:devices){
                RectF rr=new RectF(X(48),X(y),X(1550),X(y+86)); deviceRects.add(rr); deviceHits.add(d);
                round(c,48,y,1550,y+86,15,panel2); outline(c,48,y,1550,y+86,15,border,1);
                String name=safeName(d); txt(c,name,78,y+35,23,white,Paint.Align.LEFT,true); txt(c,d.getAddress(),78,y+65,16,muted,Paint.Align.LEFT,false);
                txt(c,obd.connected && d.getAddress().equals(obd.deviceAddress)?"CONECTADO":"CONECTAR",1495,y+52,19,obd.connected&&d.getAddress().equals(obd.deviceAddress)?green:accent,Paint.Align.RIGHT,true);
                y+=101; if(y>760) break;
            }
        }'''
s = replace_method(s, 'private void drawConnection(Canvas c){', 'private List<BluetoothDevice> getBonded()', new_connection)

new_settings = r'''private void drawSettings(Canvas c){
            round(c,20,94,1580,850,18,panel); outline(c,20,94,1580,850,18,border,1.2f);
            txt(c,"Color de la interfaz",48,145,27,white,Paint.Align.LEFT,true);
            txt(c,"Elige cualquier color. Se aplica al instante y queda guardado.",48,178,17,muted,Paint.Align.LEFT,false);

            colorRects.clear();
            float startX=48,startY=215,cellW=230,cellH=70,gapX=24,gapY=15;
            for(int i=0;i<themeColors.length;i++){
                int row=i/6,col=i%6; float l=startX+col*(cellW+gapX), t=startY+row*(cellH+gapY);
                RectF rr=new RectF(X(l),X(t),X(l+cellW),X(t+cellH)); colorRects.add(rr);
                round(c,l,t,l+cellW,t+cellH,14,panel2); outline(c,l,t,l+cellW,t+cellH,14,themeColors[i]==accent?white:border,themeColors[i]==accent?2.2f:1);
                p.setStyle(Paint.Style.FILL); p.setColor(themeColors[i]); c.drawCircle(X(l+32),X(t+35),X(16),p);
                txt(c,themeNames[i],l+62,t+43,18,white,Paint.Align.LEFT,true);
            }

            txt(c,"Color libre",48,415,22,white,Paint.Align.LEFT,true);
            txt(c,"Toca la barra para elegir el tono exacto: rosa, violeta, azul, verde, etc.",48,444,16,muted,Paint.Align.LEFT,false);
            hueRect.set(X(48),X(470),X(1550),X(526));
            int segs=100; float segW=(1550f-48f)/segs;
            for(int i=0;i<segs;i++){
                float hue=360f*i/(segs-1); int col=Color.HSVToColor(new float[]{hue,0.90f,1f});
                p.setStyle(Paint.Style.FILL); p.setColor(col); c.drawRect(X(48+i*segW),X(470),X(48+(i+1)*segW+1),X(526),p);
            }
            outline(c,48,470,1550,526,9,white,1);

            txt(c,"Tipo de combustible",48,595,22,white,Paint.Align.LEFT,true);
            txt(c,"Solo afecta a la estimación de consumo cuando la ECU no da caudal de combustible.",48,624,16,muted,Paint.Align.LEFT,false);
            fuelToggleRect.set(X(48),X(650),X(490),X(714));
            round(c,48,650,490,714,15,panel2); outline(c,48,650,490,714,15,accent,1.4f);
            txt(c,diesel?"DIÉSEL":"GASOLINA",269,690,20,accent,Paint.Align.CENTER,true);
        }'''
s = replace_method(s, 'private void drawSettings(Canvas c){', '@Override public boolean onTouchEvent', new_settings)

new_touch = r'''@Override public boolean onTouchEvent(MotionEvent e){
            if(e.getAction()!=MotionEvent.ACTION_UP) return true;
            float ox=(getWidth()-1600*s)/2f, oy=(getHeight()-900*s)/2f;
            float x=e.getX()-ox,y=e.getY()-oy;

            if(!backRect.isEmpty() && backRect.contains(x,y)){ page=0; invalidate(); return true; }
            if(gearRect.contains(x,y)){ page=5; invalidate(); return true; }
            if(obdRect.contains(x,y)){ page=4; invalidate(); return true; }
            if(page<=3 && y>=X(750)){
                float dx=x/s; int idx=(int)(dx/400f); if(idx<0)idx=0;if(idx>3)idx=3; page=idx; invalidate(); return true;
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
                if(hueRect.contains(x,y)){
                    float left=X(48), right=X(1550); float frac=Math.max(0f,Math.min(1f,(x-left)/(right-left)));
                    setAccent(Color.HSVToColor(new float[]{frac*360f,0.90f,1f})); return true;
                }
                if(fuelToggleRect.contains(x,y)){ diesel=!diesel; prefs.edit().putBoolean("diesel",diesel).apply(); invalidate(); return true; }
            }
            return true;
        }

        boolean goBack(){
            if(page==4 || page==5){ page=0; invalidate(); return true; }
            return false;
        }'''
s = replace_method(s, '@Override public boolean onTouchEvent(MotionEvent e){', '// --- vector icons ---', new_touch)

p.write_text(s, encoding='utf-8')
print('v11 16:9 reference UI patch applied')
