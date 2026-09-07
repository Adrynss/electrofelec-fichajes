from pathlib import Path

p = Path('app/src/main/java/com/carmonitor/demo/MainActivity.java')
s = p.read_text(encoding='utf-8')

def replace_method(text, start_sig, next_sig, new_method):
    a = text.index(start_sig)
    b = text.index(next_sig, a)
    return text[:a] + new_method.rstrip() + '\n\n        ' + text[b:]

new_header = r'''private void drawHeader(Canvas c){
            backRect.setEmpty();
            line(c,22,82,1778,82,border,1);

            // Header intentionally mirrors the approved reference: title on the left,
            // a compact OBD pill beside it, and temperature/time on the right.
            if(page==4 || page==5){
                backRect.set(X(22),X(14),X(190),X(68));
                round(c,22,14,190,68,24,panel2); outline(c,22,14,190,68,24,border,1);
                line(c,55,29,39,41,white,3); line(c,39,41,55,53,white,3);
                txt(c,"VOLVER",75,49,18,white,Paint.Align.LEFT,true);
                txt(c,page==4?"Conexión OBD":"Personalización",215,53,28,white,Paint.Align.LEFT,true);
                gearRect.setEmpty();
            }else{
                drawCarIcon(c,25,23,43,accent);
                txt(c,"Car Monitor",82,54,28,white,Paint.Align.LEFT,true);

                // OBD status occupies the same visual slot as the small pill in the reference.
                obdRect.set(X(330),X(18),X(555),X(65));
                round(c,330,18,555,65,22,panel2);
                outline(c,330,18,555,65,22,obd.connected?green:accent,1.4f);
                p.setStyle(Paint.Style.FILL); p.setColor(obd.connected?green:accent); c.drawCircle(X(352),X(42),X(5),p);
                txt(c,obd.connected?"OBD conectado":"OBD desconectado",370,49,16,obd.connected?green:accent2,Paint.Align.LEFT,true);

                gearRect.set(X(1350),X(18),X(1402),X(66));
                round(c,1350,18,1402,66,23,panel2); outline(c,1350,18,1402,66,23,border,1);
                drawGear(c,1376,42,13,muted);
            }

            if(page==4 || page==5){
                obdRect.set(X(1300),X(18),X(1515),X(65));
                round(c,1300,18,1515,65,22,panel2); outline(c,1300,18,1515,65,22,obd.connected?green:red,1.4f);
                p.setStyle(Paint.Style.FILL); p.setColor(obd.connected?green:red); c.drawCircle(X(1320),X(42),X(5),p);
                txt(c,obd.connected?"OBD conectado":"OBD desconectado",1338,49,15,white,Paint.Align.LEFT,true);
            }

            String temp;
            if(obd.connected) temp=Float.isNaN(obd.ambient)?"--°C":String.format(Locale.getDefault(),"%.0f°C",obd.ambient);
            else temp="27°C";
            txt(c,temp,1530,51,27,accent2,Paint.Align.LEFT,true);
            txt(c,"exterior",1600,50,17,muted,Paint.Align.LEFT,false);
            txt(c,new SimpleDateFormat("HH:mm",Locale.getDefault()).format(new Date()),1770,51,27,white,Paint.Align.RIGHT,true);
        }'''
s = replace_method(s, 'private void drawHeader(Canvas c){', 'private void drawHome(Canvas c){', new_header)

new_home = r'''private void drawHome(Canvas c){
            // 68/32 split copied from the approved dashboard reference.
            // Left: two gauges. Right: two consumption cards.
            round(c,23,99,1266,414,18,panel); outline(c,23,99,1266,414,18,border,1.2f);
            line(c,645,121,645,391,border,1);
            drawGauge(c,335,258,137,true);
            drawGauge(c,955,258,137,false);

            drawConsumptionCard(c,1280,99,1778,250,true);
            drawConsumptionCard(c,1280,263,1778,414,false);

            // Two compact rows of three cards, matching the reference proportions.
            drawDataCard(c,23,427,588,572,0,"Temp. motor",valueTemp(),"°C",accent);
            drawDataCard(c,600,427,1189,572,1,"Voltaje batería",valueBattery(),"V",green);
            drawDataCard(c,1201,427,1778,572,2,"Carga motor",valueLoad(),"%",accent);
            drawDataCard(c,23,585,588,730,3,"Trayecto",valueTrip(),"km",white);
            drawDataCard(c,600,585,1189,730,4,"Tiempo de viaje",valueTime(),"",white);
            drawDataCard(c,1201,585,1778,730,5,"Sistema OBD",obd.dtcs.isEmpty()?"Sin errores":obd.dtcs.size()+" errores","",obd.dtcs.isEmpty()?green:red);
        }'''
s = replace_method(s, 'private void drawHome(Canvas c){', 'private int demoRpm()', new_home)

new_gauge = r'''private void drawGauge(Canvas c,float cx,float cy,float r,boolean rpmGauge){
            // Reference-style instrument: clean black disc, slim colored arc, tiny ticks,
            // only min/max scale labels, and a very large central value.
            p.setStyle(Paint.Style.FILL); p.setColor(Color.rgb(7,10,12)); c.drawCircle(X(cx),X(cy),X(r),p);

            RectF outer=new RectF(X(cx-r+8),X(cy-r+8),X(cx+r-8),X(cy+r-8));
            stroke.setStrokeCap(Paint.Cap.ROUND); stroke.setStrokeWidth(X(11)); stroke.setColor(Color.rgb(42,50,57));
            c.drawArc(outer,138,264,false,stroke);
            float frac=rpmGauge?Math.min(1,rpm()/8000f):Math.min(1,speed()/240f);
            stroke.setColor(accent); c.drawArc(outer,138,264*frac,false,stroke);

            // small radial ticks; no crowded numbers around the dial
            int ticks=18;
            for(int i=0;i<=ticks;i++){
                double a=Math.toRadians(138+264.0*i/ticks);
                float len=(i%3==0)?15:9;
                float x1=cx+(float)Math.cos(a)*(r-24), y1=cy+(float)Math.sin(a)*(r-24);
                float x2=cx+(float)Math.cos(a)*(r-24-len), y2=cy+(float)Math.sin(a)*(r-24-len);
                line(c,x1,y1,x2,y2,i%3==0?white:muted,i%3==0?2:1.4f);
            }

            txt(c,String.valueOf(rpmGauge?rpm():speed()),cx,cy+5,60,white,Paint.Align.CENTER,true);
            txt(c,rpmGauge?"RPM":"km/h",cx,cy+42,22,white,Paint.Align.CENTER,false);

            // only the scale endpoints, exactly like the approved mock-up
            txt(c,"0",cx-r+31,cy+r-23,15,muted,Paint.Align.CENTER,false);
            txt(c,rpmGauge?"8":"240",cx+r-31,cy+r-23,15,white,Paint.Align.CENTER,false);
            if(rpmGauge) txt(c,"x1000",cx,cy+r-17,13,muted,Paint.Align.CENTER,false);
        }'''
s = replace_method(s, 'private void drawGauge(Canvas c,float cx,float cy,float r,boolean rpmGauge){', 'private void drawConsumptionCard', new_gauge)

new_cons = r'''private void drawConsumptionCard(Canvas c,float l,float t,float r,float b,boolean current){
            round(c,l,t,r,b,17,panel); outline(c,l,t,r,b,17,border,1.2f);
            drawFuelIcon(c,l+33,t+52,39,accent);
            txt(c,current?"Consumo actual":"Consumo medio",l+92,t+35,19,muted,Paint.Align.LEFT,false);
            String v=String.format(Locale.getDefault(),"%.1f",current?currentCons():avgCons());
            txt(c,v,l+92,t+105,46,white,Paint.Align.LEFT,true);
            txt(c,"L/100 km",r-22,t+104,18,muted,Paint.Align.RIGHT,false);
        }'''
s = replace_method(s, 'private void drawConsumptionCard(Canvas c,float l,float t,float r,float b,boolean current){', 'private void drawDataCard', new_cons)

new_data = r'''private void drawDataCard(Canvas c,float l,float t,float r,float b,int icon,String label,String value,String unit,int color){
            round(c,l,t,r,b,17,panel); outline(c,l,t,r,b,17,border,1.2f);
            // Larger icon/value pair, much less dead space than previous versions.
            if(icon==0) drawThermometer(c,l+29,t+59,42,color);
            else if(icon==1) drawBattery(c,l+26,t+58,45,color);
            else if(icon==2) drawEngineIcon(c,l+25,t+57,48,color);
            else if(icon==3) drawRoad(c,l+24,t+54,48,color);
            else if(icon==4) drawClock(c,l+25,t+55,44,color);
            else drawEngineIcon(c,l+25,t+56,48,color);

            txt(c,label,l+88,t+34,19,muted,Paint.Align.LEFT,false);
            float base=b-26;
            float size=(icon==4?37:(icon==5?34:44));
            int valColor=(icon==1||icon==5)?color:white;
            txt(c,value,l+88,base,size,valColor,Paint.Align.LEFT,true);
            if(!unit.isEmpty()) txt(c,unit,r-20,base,18,muted,Paint.Align.RIGHT,false);
        }'''
s = replace_method(s, 'private void drawDataCard(Canvas c,float l,float t,float r,float b,int icon,String label,String value,String unit,int color){', 'private void drawNav(Canvas c){', new_data)

new_nav = r'''private void drawNav(Canvas c){
            line(c,23,746,1778,746,border,1);
            String[] names={"Inicio","Viaje","Motor","Errores"};
            for(int i=0;i<4;i++){
                float cx=225+i*450;
                boolean active=page==i;
                int col=active?accent:muted;
                if(i==0) drawHomeIcon(c,cx,780,20,col);
                else if(i==1) drawTripIcon(c,cx,780,20,col);
                else if(i==2) drawEngineIcon(c,cx-20,764,39,col);
                else drawWarning(c,cx,780,21,col);
                txt(c,names[i],cx,828,18,col,Paint.Align.CENTER,active);
                if(active) round(c,cx-48,846,cx+48,851,3,accent);
            }
        }'''
s = replace_method(s, 'private void drawNav(Canvas c){', 'private void drawTrip(Canvas c){', new_nav)

# Make the Settings screen explicitly navigable: a visible VOLVER pill is already in the header;
# also keep Android back support from v9. Tighten the settings layout so it does not feel like a dead-end page.
new_settings = r'''private void drawSettings(Canvas c){
            round(c,23,100,1778,730,20,panel); outline(c,23,100,1778,730,20,border,1);
            txt(c,"Color de la interfaz",55,150,27,white,Paint.Align.LEFT,true);
            txt(c,"Elige un color o usa la barra libre. El cambio se aplica al instante y queda guardado.",55,184,18,muted,Paint.Align.LEFT,false);

            colorRects.clear();
            float startX=55,startY=218,cellW=270,cellH=72,gapX=18,gapY=14;
            for(int i=0;i<themeColors.length;i++){
                int row=i/6,col=i%6; float l=startX+col*(cellW+gapX), t=startY+row*(cellH+gapY);
                RectF rr=new RectF(X(l),X(t),X(l+cellW),X(t+cellH)); colorRects.add(rr);
                round(c,l,t,l+cellW,t+cellH,15,panel2);
                outline(c,l,t,l+cellW,t+cellH,15,themeColors[i]==accent?white:border,themeColors[i]==accent?2.4f:1);
                p.setStyle(Paint.Style.FILL); p.setColor(themeColors[i]); c.drawCircle(X(l+35),X(t+36),X(17),p);
                txt(c,themeNames[i],l+67,t+44,19,white,Paint.Align.LEFT,true);
            }

            txt(c,"Color libre",55,410,23,white,Paint.Align.LEFT,true);
            hueRect.set(X(55),X(438),X(1745),X(492));
            int segs=96; float segW=(1745f-55f)/segs;
            for(int i=0;i<segs;i++){
                float hue=360f*i/(segs-1); int col=Color.HSVToColor(new float[]{hue,0.88f,1f});
                p.setStyle(Paint.Style.FILL); p.setColor(col); c.drawRect(X(55+i*segW),X(438),X(55+(i+1)*segW+1),X(492),p);
            }
            outline(c,55,438,1745,492,10,white,1);

            txt(c,"Combustible",55,550,23,white,Paint.Align.LEFT,true);
            txt(c,"Solo afecta al cálculo estimado de consumo si la ECU no informa del caudal.",55,579,17,muted,Paint.Align.LEFT,false);
            fuelToggleRect.set(X(55),X(606),X(560),X(670));
            round(c,55,606,560,670,16,panel2); outline(c,55,606,560,670,16,accent,1.5f);
            txt(c,diesel?"DIÉSEL":"GASOLINA",307,646,21,accent,Paint.Align.CENTER,true);

            // Secondary, unmistakable back button in addition to the header button.
            round(c,1425,606,1745,670,16,panel2); outline(c,1425,606,1745,670,16,border,1.2f);
            line(c,1470,626,1454,638,white,3); line(c,1454,638,1470,650,white,3);
            txt(c,"VOLVER A INICIO",1600,646,19,white,Paint.Align.CENTER,true);
        }'''
s = replace_method(s, 'private void drawSettings(Canvas c){', '@Override public boolean onTouchEvent', new_settings)

# Settings bottom-right VOLVER uses the existing back behavior without adding another field.
# Enlarge backRect while settings is open to include that button as well by checking coordinates explicitly.
old = 'if(!backRect.isEmpty() && backRect.contains(x,y)){ page=0; invalidate(); return true; }'
new = old + '\n            if(page==5 && x>=X(1425) && x<=X(1745) && y>=X(606) && y<=X(670)){ page=0; invalidate(); return true; }'
s = s.replace(old, new)

p.write_text(s, encoding='utf-8')
print('v10 reference UI patch applied')
