from pathlib import Path

p = Path('app/src/main/java/com/carmonitor/demo/MainActivity.java')
s = p.read_text(encoding='utf-8')

# New hit targets for back navigation and free hue selection.
s = s.replace('private final RectF gearRect = new RectF();', 'private final RectF gearRect = new RectF();\n        private final RectF backRect = new RectF();\n        private final RectF hueRect = new RectF();')

# Android back gesture/button should leave settings/connection before closing app.
needle = '''    @Override protected void onDestroy() {\n        if (dashboard != null) dashboard.obd.disconnect();\n        super.onDestroy();\n    }'''
repl = needle + '''\n\n    @Override public void onBackPressed() {\n        if (dashboard != null && dashboard.goBack()) return;\n        super.onBackPressed();\n    }'''
s = s.replace(needle, repl)

def replace_method(text, start_sig, next_sig, new_method):
    a = text.index(start_sig)
    b = text.index(next_sig, a)
    return text[:a] + new_method.rstrip() + '\n\n        ' + text[b:]

new_header = r'''private void drawHeader(Canvas c){
            line(c,22,82,1778,82,border,1);
            backRect.setEmpty();

            if(page==4 || page==5){
                backRect.set(X(22),X(17),X(74),X(67));
                round(c,22,17,74,67,24,panel2); outline(c,22,17,74,67,24,border,1);
                // clear, large chevron back button
                line(c,53,29,38,42,white,3); line(c,38,42,53,55,white,3);
                txt(c,page==4?"Conexión OBD":"Ajustes",88,54,28,white,Paint.Align.LEFT,true);
            }else{
                drawCarIcon(c,25,24,42,accent);
                txt(c,"Car Monitor",82,54,28,white,Paint.Align.LEFT,true);
            }

            if(page!=5){
                gearRect.set(X(1262),X(18),X(1317),X(66));
                round(c,1262,18,1317,66,24,panel2); outline(c,1262,18,1317,66,24,border,1);
                drawGear(c,1289,42,13,muted);
            }else gearRect.setEmpty();

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
        }'''
s = replace_method(s, 'private void drawHeader(Canvas c){', 'private void drawHome(Canvas c){', new_header)

new_home = r'''private void drawHome(Canvas c){
            // Composition copied from the approved reference: dual large gauges, slim right consumption column,
            // then a strict 3x2 information grid.
            round(c,23,100,1460,414,18,panel); outline(c,23,100,1460,414,18,border,1.2f);
            line(c,742,124,742,390,border,1);
            drawGauge(c,415,257,151,true);
            drawGauge(c,1060,257,151,false);

            drawConsumptionCard(c,1473,100,1778,252,true);
            drawConsumptionCard(c,1473,264,1778,414,false);

            drawDataCard(c,23,426,601,576,0,"Temp. motor",valueTemp(),"°C",accent);
            drawDataCard(c,612,426,1190,576,1,"Voltaje batería",valueBattery(),"V",green);
            drawDataCard(c,1201,426,1778,576,2,"Carga motor",valueLoad(),"%",accent);
            drawDataCard(c,23,588,601,742,3,"Trayecto",valueTrip(),"km",white);
            drawDataCard(c,612,588,1190,742,4,"Tiempo de viaje",valueTime(),"",white);
            drawDataCard(c,1201,588,1778,742,5,"Sistema OBD",obd.dtcs.isEmpty()?"Sin errores":obd.dtcs.size()+" errores","",obd.dtcs.isEmpty()?green:red);
        }'''
s = replace_method(s, 'private void drawHome(Canvas c){', 'private int demoRpm()', new_home)

new_gauge = r'''private void drawGauge(Canvas c,float cx,float cy,float r,boolean rpmGauge){
            p.setStyle(Paint.Style.FILL); p.setColor(Color.rgb(6,9,11)); c.drawCircle(X(cx),X(cy),X(r),p);
            RectF outer=new RectF(X(cx-r+8),X(cy-r+8),X(cx+r-8),X(cy+r-8));
            stroke.setStrokeWidth(X(10)); stroke.setStrokeCap(Paint.Cap.ROUND); stroke.setColor(Color.rgb(47,54,60));
            c.drawArc(outer,138,264,false,stroke);
            float frac=rpmGauge?Math.min(1,rpm()/8000f):Math.min(1,speed()/240f);
            stroke.setColor(accent); c.drawArc(outer,138,264*frac,false,stroke);
            if(rpmGauge){ stroke.setColor(red); c.drawArc(outer,48,48,false,stroke); }

            int ticks=rpmGauge?8:12;
            for(int i=0;i<=ticks;i++){
                double a=Math.toRadians(138+264.0*i/ticks);
                float x1=cx+(float)Math.cos(a)*(r-26),y1=cy+(float)Math.sin(a)*(r-26);
                float x2=cx+(float)Math.cos(a)*(r-43),y2=cy+(float)Math.sin(a)*(r-43);
                line(c,x1,y1,x2,y2,white,2);
                String lab=rpmGauge?String.valueOf(i):String.valueOf(i*20);
                float tx=cx+(float)Math.cos(a)*(r-64),ty=cy+(float)Math.sin(a)*(r-64)+5;
                txt(c,lab,tx,ty,13,white,Paint.Align.CENTER,false);
            }
            txt(c,String.valueOf(rpmGauge?rpm():speed()),cx,cy+8,57,white,Paint.Align.CENTER,true);
            txt(c,rpmGauge?"RPM":"km/h",cx,cy+45,22,white,Paint.Align.CENTER,false);
            if(rpmGauge) txt(c,"x1000",cx,cy+70,13,muted,Paint.Align.CENTER,false);
        }'''
s = replace_method(s, 'private void drawGauge(Canvas c,float cx,float cy,float r,boolean rpmGauge){', 'private void drawConsumptionCard', new_gauge)

new_cons = r'''private void drawConsumptionCard(Canvas c,float l,float t,float r,float b,boolean current){
            round(c,l,t,r,b,17,panel); outline(c,l,t,r,b,17,border,1.2f);
            drawFuelIcon(c,l+28,t+54,31,accent);
            txt(c,current?"Consumo actual":"Consumo medio",l+72,t+31,18,muted,Paint.Align.LEFT,false);
            String v=String.format(Locale.getDefault(),"%.1f",current?currentCons():avgCons());
            txt(c,v,l+72,t+105,48,white,Paint.Align.LEFT,true);
            txt(c,"L/100 km",r-17,t+103,17,muted,Paint.Align.RIGHT,false);
        }'''
s = replace_method(s, 'private void drawConsumptionCard(Canvas c,float l,float t,float r,float b,boolean current){', 'private void drawDataCard', new_cons)

new_data = r'''private void drawDataCard(Canvas c,float l,float t,float r,float b,int icon,String label,String value,String unit,int color){
            round(c,l,t,r,b,17,panel); outline(c,l,t,r,b,17,border,1.2f);
            txt(c,label,l+58,t+29,18,muted,Paint.Align.LEFT,false);
            if(icon==0) drawThermometer(c,l+27,t+73,31,color);
            else if(icon==1) drawBattery(c,l+25,t+72,37,color);
            else if(icon==2) drawEngineIcon(c,l+25,t+70,39,color);
            else if(icon==3) drawRoad(c,l+25,t+68,40,color);
            else if(icon==4) drawClock(c,l+25,t+70,37,color);
            else drawEngineIcon(c,l+25,t+69,39,color);

            float base=b-25;
            float size=(icon==4?34:(icon==5?31:42));
            int valColor=(icon==1||icon==5)?color:white;
            txt(c,value,l+72,base,size,valColor,Paint.Align.LEFT,true);
            if(!unit.isEmpty()) txt(c,unit,r-18,base,17,muted,Paint.Align.RIGHT,false);
        }'''
s = replace_method(s, 'private void drawDataCard(Canvas c,float l,float t,float r,float b,int icon,String label,String value,String unit,int color){', 'private void drawNav(Canvas c){', new_data)

new_nav = r'''private void drawNav(Canvas c){
            line(c,23,758,1778,758,border,1);
            String[] names={"Inicio","Viaje","Motor","Errores"};
            for(int i=0;i<4;i++){
                float cx=225+i*450;
                boolean active=page==i;
                int col=active?accent:muted;
                if(i==0) drawHomeIcon(c,cx,790,21,col);
                else if(i==1) drawTripIcon(c,cx,790,21,col);
                else if(i==2) drawEngineIcon(c,cx-21,773,40,col);
                else drawWarning(c,cx,790,22,col);
                txt(c,names[i],cx,838,18,col,Paint.Align.CENTER,active);
                if(active) round(c,cx-50,855,cx+50,860,3,accent);
            }
        }'''
s = replace_method(s, 'private void drawNav(Canvas c){', 'private void drawTrip(Canvas c){', new_nav)

new_settings = r'''private void drawSettings(Canvas c){
            // Back is intentionally visible in the header and Android Back also works.
            round(c,23,105,1778,742,20,panel); outline(c,23,105,1778,742,20,border,1);
            txt(c,"Color de la interfaz",55,154,27,white,Paint.Align.LEFT,true);
            txt(c,"El color cambia relojes, iconos, indicadores y el menú activo.",55,187,18,muted,Paint.Align.LEFT,false);

            colorRects.clear();
            float startX=55,startY=220,cellW=270,cellH=76,gapX=18,gapY=15;
            for(int i=0;i<themeColors.length;i++){
                int row=i/6,col=i%6; float l=startX+col*(cellW+gapX), t=startY+row*(cellH+gapY);
                RectF rr=new RectF(X(l),X(t),X(l+cellW),X(t+cellH)); colorRects.add(rr);
                round(c,l,t,l+cellW,t+cellH,15,panel2);
                outline(c,l,t,l+cellW,t+cellH,15,themeColors[i]==accent?white:border,themeColors[i]==accent?2.4f:1);
                p.setStyle(Paint.Style.FILL); p.setColor(themeColors[i]); c.drawCircle(X(l+36),X(t+38),X(18),p);
                txt(c,themeNames[i],l+68,t+46,19,white,Paint.Align.LEFT,true);
            }

            txt(c,"Color personalizado",55,432,23,white,Paint.Align.LEFT,true);
            txt(c,"Toca cualquier punto de la barra para elegir prácticamente cualquier tono, incluido rosa o violeta.",55,461,17,muted,Paint.Align.LEFT,false);
            hueRect.set(X(55),X(485),X(1745),X(535));
            int segs=72; float segW=(1745f-55f)/segs;
            for(int i=0;i<segs;i++){
                float hue=360f*i/(segs-1); int col=Color.HSVToColor(new float[]{hue,0.88f,1f});
                p.setStyle(Paint.Style.FILL); p.setColor(col); c.drawRect(X(55+i*segW),X(485),X(55+(i+1)*segW+1),X(535),p);
            }
            outline(c,55,485,1745,535,10,white,1);

            txt(c,"Tipo de combustible",55,586,23,white,Paint.Align.LEFT,true);
            txt(c,"Solo se usa para estimar el consumo si la ECU no entrega el caudal de combustible.",55,615,17,muted,Paint.Align.LEFT,false);
            fuelToggleRect.set(X(55),X(642),X(560),X(704));
            round(c,55,642,560,704,16,panel2); outline(c,55,642,560,704,16,accent,1.5f);
            txt(c,diesel?"DIÉSEL":"GASOLINA",307,681,21,accent,Paint.Align.CENTER,true);
        }'''
s = replace_method(s, 'private void drawSettings(Canvas c){', '@Override public boolean onTouchEvent', new_settings)

new_touch = r'''@Override public boolean onTouchEvent(MotionEvent e){
            if(e.getAction()!=MotionEvent.ACTION_UP) return true;
            float ox=(getWidth()-1800*s)/2f, oy=(getHeight()-900*s)/2f;
            float x=e.getX()-ox,y=e.getY()-oy;

            if(!backRect.isEmpty() && backRect.contains(x,y)){ page=0; invalidate(); return true; }
            if(gearRect.contains(x,y)){ page=5; invalidate(); return true; }
            if(obdRect.contains(x,y)){ page=4; invalidate(); return true; }
            if(y>=X(758)){
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
                if(hueRect.contains(x,y)){
                    float left=X(55), right=X(1745); float frac=Math.max(0f,Math.min(1f,(x-left)/(right-left)));
                    setAccent(Color.HSVToColor(new float[]{frac*360f,0.88f,1f})); return true;
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
print('v9 patch applied')
