from pathlib import Path

p = Path('app/src/main/java/com/carmonitor/demo/MainActivity.java')
s = p.read_text(encoding='utf-8')

def replace_method(text, start_sig, next_sig, new_method):
    a = text.index(start_sig)
    b = text.index(next_sig, a)
    return text[:a] + new_method.rstrip() + '\n\n        ' + text[b:]

# Make the visual language match the approved mockup: thick/rounded icons and much bolder numbers.
new_gauge = r'''private void drawGauge(Canvas c,float cx,float cy,float r,boolean rpmGauge){
            p.setStyle(Paint.Style.FILL); p.setColor(Color.rgb(4,12,18)); c.drawCircle(X(cx),X(cy),X(r),p);

            RectF outer=new RectF(X(cx-r+7),X(cy-r+7),X(cx+r-7),X(cy+r-7));
            stroke.setStrokeCap(Paint.Cap.ROUND);
            stroke.setStrokeWidth(X(12)); stroke.setColor(Color.rgb(23,43,56));
            c.drawArc(outer,136,268,false,stroke);
            stroke.setColor(accent); c.drawArc(outer,136,202,false,stroke);

            int ticks=26;
            for(int i=0;i<=ticks;i++){
                double a=Math.toRadians(136+268.0*i/ticks);
                float len=(i%5==0)?17:10;
                float x1=cx+(float)Math.cos(a)*(r-23), y1=cy+(float)Math.sin(a)*(r-23);
                float x2=cx+(float)Math.cos(a)*(r-23-len), y2=cy+(float)Math.sin(a)*(r-23-len);
                line(c,x1,y1,x2,y2,i%5==0?white:accent2,i%5==0?2.8f:1.8f);
            }

            float frac=rpmGauge?Math.min(1f,rpm()/8000f):Math.min(1f,speed()/240f);
            double ma=Math.toRadians(136+268*frac);
            float mx1=cx+(float)Math.cos(ma)*(r-10), my1=cy+(float)Math.sin(ma)*(r-10);
            float mx2=cx+(float)Math.cos(ma)*(r-42), my2=cy+(float)Math.sin(ma)*(r-42);
            line(c,mx1,my1,mx2,my2,accent2,6f);

            txt(c,String.valueOf(rpmGauge?rpm():speed()),cx,cy+12,72,white,Paint.Align.CENTER,true);
            txt(c,rpmGauge?"RPM":"km/h",cx,cy+55,25,white,Paint.Align.CENTER,true);
            txt(c,"0",cx-r+27,cy+r-20,17,white,Paint.Align.CENTER,true);
            txt(c,rpmGauge?"8":"240",cx+r-27,cy+r-20,17,white,Paint.Align.CENTER,true);
            if(rpmGauge) txt(c,"x1000",cx,cy+r-15,15,muted,Paint.Align.CENTER,true);
        }'''
s = replace_method(s, 'private void drawGauge(Canvas c,float cx,float cy,float r,boolean rpmGauge){', 'private void drawConsumptionCard', new_gauge)

new_cons = r'''private void drawConsumptionCard(Canvas c,float l,float t,float r,float b,boolean current){
            round(c,l,t,r,b,17,panel); outline(c,l,t,r,b,17,border,1.5f);
            drawFuelIcon(c,l+27,t+42,46,accent);
            txt(c,current?"Consumo actual":"Consumo medio",l+96,t+32,19,muted,Paint.Align.LEFT,false);
            String v=String.format(Locale.getDefault(),"%.1f",current?currentCons():avgCons());
            txt(c,v,l+96,t+102,55,white,Paint.Align.LEFT,true);
            txt(c,"L/100 km",r-18,t+102,19,muted,Paint.Align.RIGHT,true);
        }'''
s = replace_method(s, 'private void drawConsumptionCard(Canvas c,float l,float t,float r,float b,boolean current){', 'private void drawDataCard', new_cons)

new_data = r'''private void drawDataCard(Canvas c,float l,float t,float r,float b,int icon,String label,String value,String unit,int color){
            round(c,l,t,r,b,17,panel); outline(c,l,t,r,b,17,border,1.45f);

            float iz=51;
            if(icon==0) drawThermometer(c,l+23,t+48,iz,color);
            else if(icon==1) drawBattery(c,l+21,t+49,iz,color);
            else if(icon==2) drawEngineIcon(c,l+20,t+48,iz,color);
            else if(icon==3) drawRoad(c,l+20,t+47,iz,color);
            else if(icon==4) drawClock(c,l+20,t+47,iz,color);
            else drawEngineIcon(c,l+20,t+47,iz,color);

            txt(c,label,l+88,t+32,19,muted,Paint.Align.LEFT,false);
            float base=b-22;
            float size=(icon==4?42:(icon==5?37:49));
            int valColor=(icon==1||icon==5)?color:white;
            txt(c,value,l+88,base,size,valColor,Paint.Align.LEFT,true);
            if(!unit.isEmpty()) txt(c,unit,r-17,base,19,muted,Paint.Align.RIGHT,true);
        }'''
s = replace_method(s, 'private void drawDataCard(Canvas c,float l,float t,float r,float b,int icon,String label,String value,String unit,int color){', 'private void drawNav(Canvas c){', new_data)

new_car = r'''private void drawCarIcon(Canvas c,float x,float y,float size,int col){
            p.setColor(col); p.setStyle(Paint.Style.FILL);
            RectF body=new RectF(X(x),X(y+13),X(x+size),X(y+31));
            c.drawRoundRect(body,X(7),X(7),p);
            Path roof=new Path(); roof.moveTo(X(x+7),X(y+15)); roof.lineTo(X(x+14),X(y+3)); roof.lineTo(X(x+30),X(y+3)); roof.lineTo(X(x+37),X(y+15)); roof.close(); c.drawPath(roof,p);
            p.setColor(bg); c.drawRoundRect(new RectF(X(x+13),X(y+7),X(x+31),X(y+14)),X(2),X(2),p);
            p.setColor(col); c.drawCircle(X(x+9),X(y+33),X(5),p); c.drawCircle(X(x+34),X(y+33),X(5),p);
        }'''
s = replace_method(s, 'private void drawCarIcon(Canvas c,float x,float y,float size,int col){', 'private void drawFuelIcon', new_car)

new_fuel = r'''private void drawFuelIcon(Canvas c,float x,float y,float z,int col){
            p.setStyle(Paint.Style.FILL); p.setColor(col);
            c.drawRoundRect(new RectF(X(x),X(y),X(x+z*.58f),X(y+z)),X(4),X(4),p);
            p.setColor(panel); c.drawRect(X(x+z*.12f),X(y+z*.12f),X(x+z*.46f),X(y+z*.38f),p);
            stroke.setStyle(Paint.Style.STROKE); stroke.setStrokeCap(Paint.Cap.ROUND); stroke.setColor(col); stroke.setStrokeWidth(X(5));
            Path hose=new Path(); hose.moveTo(X(x+z*.57f),X(y+z*.15f)); hose.lineTo(X(x+z*.79f),X(y+z*.28f)); hose.lineTo(X(x+z*.79f),X(y+z*.78f)); c.drawPath(hose,stroke);
        }'''
s = replace_method(s, 'private void drawFuelIcon(Canvas c,float x,float y,float z,int col){', 'private void drawThermometer', new_fuel)

new_thermo = r'''private void drawThermometer(Canvas c,float x,float y,float z,int col){
            stroke.setStyle(Paint.Style.STROKE); stroke.setStrokeCap(Paint.Cap.ROUND); stroke.setColor(col); stroke.setStrokeWidth(X(6));
            line(c,x+z*.36f,y+z*.05f,x+z*.36f,y+z*.63f,col,6);
            line(c,x+z*.36f,y+z*.22f,x+z*.64f,y+z*.22f,col,5);
            p.setStyle(Paint.Style.FILL); p.setColor(col); c.drawCircle(X(x+z*.36f),X(y+z*.78f),X(z*.20f),p);
            // chunky coolant waves
            Path w=new Path(); w.moveTo(X(x),X(y+z*.93f));
            for(int i=0;i<4;i++){ float sx=x+i*z*.27f; w.quadTo(X(sx+z*.07f),X(y+z*.83f),X(sx+z*.14f),X(y+z*.93f)); w.quadTo(X(sx+z*.21f),X(y+z*1.03f),X(sx+z*.28f),X(y+z*.93f)); }
            c.drawPath(w,stroke);
        }'''
s = replace_method(s, 'private void drawThermometer(Canvas c,float x,float y,float z,int col){', 'private void drawBattery', new_thermo)

new_battery = r'''private void drawBattery(Canvas c,float x,float y,float z,int col){
            stroke.setStyle(Paint.Style.STROKE); stroke.setStrokeJoin(Paint.Join.ROUND); stroke.setStrokeCap(Paint.Cap.ROUND); stroke.setColor(col); stroke.setStrokeWidth(X(5));
            RectF rr=new RectF(X(x),X(y+4),X(x+z),X(y+z*.66f)); c.drawRoundRect(rr,X(4),X(4),stroke);
            p.setStyle(Paint.Style.FILL); p.setColor(col);
            c.drawRoundRect(new RectF(X(x+z*.18f),X(y-1),X(x+z*.38f),X(y+5)),X(2),X(2),p);
            c.drawRoundRect(new RectF(X(x+z*.62f),X(y-1),X(x+z*.82f),X(y+5)),X(2),X(2),p);
            line(c,x+z*.28f,y+z*.20f,x+z*.28f,y+z*.49f,col,4); line(c,x+z*.14f,y+z*.345f,x+z*.42f,y+z*.345f,col,4);
            line(c,x+z*.60f,y+z*.345f,x+z*.86f,y+z*.345f,col,4);
        }'''
s = replace_method(s, 'private void drawBattery(Canvas c,float x,float y,float z,int col){', 'private void drawEngineIcon', new_battery)

new_engine_icon = r'''private void drawEngineIcon(Canvas c,float x,float y,float z,int col){
            stroke.setStyle(Paint.Style.STROKE); stroke.setStrokeJoin(Paint.Join.ROUND); stroke.setStrokeCap(Paint.Cap.ROUND); stroke.setColor(col); stroke.setStrokeWidth(X(5.5f));
            RectF r=new RectF(X(x+5),X(y+10),X(x+z-5),X(y+z*.70f)); c.drawRoundRect(r,X(7),X(7),stroke);
            line(c,x+z*.26f,y+10,x+z*.35f,y+1,col,5.5f); line(c,x+z*.35f,y+1,x+z*.63f,y+1,col,5.5f);
            line(c,x+z*.77f,y+17,x+z+2,y+17,col,5.5f); line(c,x+5,y+z*.36f,x-4,y+z*.36f,col,5.5f);
            // small filled cap/body details make it read chunkier at a glance
            p.setStyle(Paint.Style.FILL); p.setColor(col); c.drawRoundRect(new RectF(X(x+z*.22f),X(y+z*.70f),X(x+z*.42f),X(y+z*.81f)),X(2),X(2),p);
        }'''
s = replace_method(s, 'private void drawEngineIcon(Canvas c,float x,float y,float z,int col){', 'private void drawRoad', new_engine_icon)

new_road = r'''private void drawRoad(Canvas c,float x,float y,float z,int col){
            p.setStyle(Paint.Style.FILL); p.setColor(col);
            Path left=new Path(); left.moveTo(X(x+z*.22f),X(y)); left.lineTo(X(x+z*.43f),X(y)); left.lineTo(X(x+z*.36f),X(y+z)); left.lineTo(X(x),X(y+z)); left.close(); c.drawPath(left,p);
            Path right=new Path(); right.moveTo(X(x+z*.57f),X(y)); right.lineTo(X(x+z*.78f),X(y)); right.lineTo(X(x+z),X(y+z)); right.lineTo(X(x+z*.64f),X(y+z)); right.close(); c.drawPath(right,p);
            // center dashed lane
            p.setColor(panel); c.drawRoundRect(new RectF(X(x+z*.47f),X(y+z*.13f),X(x+z*.53f),X(y+z*.34f)),X(2),X(2),p); c.drawRoundRect(new RectF(X(x+z*.47f),X(y+z*.56f),X(x+z*.53f),X(y+z*.79f)),X(2),X(2),p);
        }'''
s = replace_method(s, 'private void drawRoad(Canvas c,float x,float y,float z,int col){', 'private void drawClock', new_road)

new_clock = r'''private void drawClock(Canvas c,float x,float y,float z,int col){
            stroke.setStyle(Paint.Style.STROKE); stroke.setStrokeCap(Paint.Cap.ROUND); stroke.setColor(col); stroke.setStrokeWidth(X(5.5f));
            c.drawCircle(X(x+z/2),X(y+z/2),X(z/2-2),stroke);
            line(c,x+z/2,y+z/2,x+z/2,y+z*.20f,col,5.5f); line(c,x+z/2,y+z/2,x+z*.76f,y+z*.64f,col,5.5f);
        }'''
s = replace_method(s, 'private void drawClock(Canvas c,float x,float y,float z,int col){', 'private void drawHomeIcon', new_clock)

new_home_icon = r'''private void drawHomeIcon(Canvas c,float x,float y,float z,int col){
            p.setStyle(Paint.Style.FILL); p.setColor(col);
            Path path=new Path(); path.moveTo(X(x-z),X(y)); path.lineTo(X(x),X(y-z)); path.lineTo(X(x+z),X(y)); path.lineTo(X(x+z*.72f),X(y)); path.lineTo(X(x+z*.72f),X(y+z)); path.lineTo(X(x-z*.72f),X(y+z)); path.lineTo(X(x-z*.72f),X(y)); path.close(); c.drawPath(path,p);
            p.setColor(Color.rgb(5,14,21)); c.drawRect(X(x-z*.18f),X(y+z*.45f),X(x+z*.18f),X(y+z),p);
        }'''
s = replace_method(s, 'private void drawHomeIcon(Canvas c,float x,float y,float z,int col){', 'private void drawTripIcon', new_home_icon)

new_trip_icon = r'''private void drawTripIcon(Canvas c,float x,float y,float z,int col){
            stroke.setStyle(Paint.Style.STROKE); stroke.setStrokeCap(Paint.Cap.ROUND); stroke.setStrokeJoin(Paint.Join.ROUND); stroke.setColor(col); stroke.setStrokeWidth(X(5));
            line(c,x-z,y+z,x+z,y-z,col,5); line(c,x+z*.38f,y-z,x+z,y-z,col,5); line(c,x+z,y-z,x+z,y-z*.38f,col,5);
        }'''
s = replace_method(s, 'private void drawTripIcon(Canvas c,float x,float y,float z,int col){', 'private void drawWarning', new_trip_icon)

new_warning = r'''private void drawWarning(Canvas c,float x,float y,float z,int col){
            Path path=new Path(); path.moveTo(X(x),X(y-z)); path.lineTo(X(x+z),X(y+z)); path.lineTo(X(x-z),X(y+z)); path.close();
            stroke.setStyle(Paint.Style.STROKE); stroke.setStrokeJoin(Paint.Join.ROUND); stroke.setColor(col); stroke.setStrokeWidth(X(5)); c.drawPath(path,stroke);
            line(c,x,y-z*.35f,x,y+z*.28f,col,5); p.setColor(col); p.setStyle(Paint.Style.FILL); c.drawCircle(X(x),X(y+z*.58f),X(3.5f),p);
        }'''
s = replace_method(s, 'private void drawWarning(Canvas c,float x,float y,float z,int col){', 'private void drawGear', new_warning)

new_gear = r'''private void drawGear(Canvas c,float x,float y,float z,int col){
            stroke.setStyle(Paint.Style.STROKE); stroke.setStrokeCap(Paint.Cap.ROUND); stroke.setColor(col); stroke.setStrokeWidth(X(4.5f));
            c.drawCircle(X(x),X(y),X(z),stroke); c.drawCircle(X(x),X(y),X(z*.38f),stroke);
            for(int i=0;i<8;i++){ double a=i*Math.PI/4; line(c,x+(float)Math.cos(a)*z,y+(float)Math.sin(a)*z,x+(float)Math.cos(a)*(z+6),y+(float)Math.sin(a)*(z+6),col,4.5f); }
        }'''
s = replace_method(s, 'private void drawGear(Canvas c,float x,float y,float z,int col){', '// --- real Bluetooth Classic ELM327 layer ---', new_gear)

p.write_text(s, encoding='utf-8')
print('v12 chunky icon + bold number patch applied')
