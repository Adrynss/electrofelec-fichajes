from pathlib import Path

p = Path('app/src/main/java/com/carmonitor/demo/MainActivity.java')
s = p.read_text(encoding='utf-8')

def replace_method(text, start_sig, next_sig, new_method):
    a = text.index(start_sig)
    b = text.index(next_sig, a)
    return text[:a] + new_method.rstrip() + '\n\n        ' + text[b:]

# Extra graphics primitives for the polished mockup-like look.
s = s.replace('import android.graphics.Paint;\nimport android.graphics.Path;\nimport android.graphics.RectF;',
              'import android.graphics.Paint;\nimport android.graphics.Path;\nimport android.graphics.RectF;\nimport android.graphics.LinearGradient;\nimport android.graphics.RadialGradient;\nimport android.graphics.Shader;\nimport android.graphics.Typeface;')

# Software layer lets Canvas shadows/glows render consistently on older Android head units too.
s = s.replace('setBackgroundColor(bg);\n            prefs = getSharedPreferences',
              'setBackgroundColor(bg);\n            setLayerType(View.LAYER_TYPE_SOFTWARE, null);\n            prefs = getSharedPreferences')

# Helpers used by gradients and glow.
needle = 'private void setAccent(int c) {'
helpers = '''private int withAlpha(int c,int a){ return Color.argb(a,Color.red(c),Color.green(c),Color.blue(c)); }\n        private int blend(int a,int b,float t){\n            return Color.rgb((int)(Color.red(a)+(Color.red(b)-Color.red(a))*t),(int)(Color.green(a)+(Color.green(b)-Color.green(a))*t),(int)(Color.blue(a)+(Color.blue(b)-Color.blue(a))*t));\n        }\n        private void clearFx(){ p.clearShadowLayer(); stroke.clearShadowLayer(); p.setShader(null); stroke.setShader(null); }\n\n        '''
s = s.replace(needle, helpers + needle)

new_txt = r'''private void txt(Canvas c,String t,float x,float y,float size,int color,Paint.Align align,boolean bold){
            p.setStyle(Paint.Style.FILL); p.setColor(color); p.setTextSize(X(size)); p.setTextAlign(align);
            // Android's sans-serif-black is visually much closer to the heavy mockup numerals.
            p.setTypeface(bold?Typeface.create("sans-serif-black",Typeface.NORMAL):Typeface.create("sans-serif-medium",Typeface.NORMAL));
            if(size>=28){
                p.setShadowLayer(X(2.8f),0,X(1.4f),Color.argb(165,0,0,0));
            }else p.clearShadowLayer();
            c.drawText(t,X(x),X(y),p);
            p.clearShadowLayer();
        }'''
s = replace_method(s, 'private void txt(Canvas c,String t,float x,float y,float size,int color,Paint.Align align,boolean bold){', 'private void round(Canvas c,float l,float t,float r,float b,float radius,int color){', new_txt)

new_round = r'''private void round(Canvas c,float l,float t,float r,float b,float radius,int color){
            p.setStyle(Paint.Style.FILL);
            RectF rr=new RectF(X(l),X(t),X(r),X(b));
            if(color==panel || color==panel2){
                int top=blend(color,Color.rgb(22,43,59),color==panel?0.32f:0.25f);
                int bottom=blend(color,Color.BLACK,0.28f);
                p.setShader(new LinearGradient(X(l),X(t),X(l),X(b),top,bottom,Shader.TileMode.CLAMP));
                p.setShadowLayer(X(7),0,X(2.5f),Color.argb(120,0,0,0));
            }else{
                p.setShader(null); p.setColor(color); p.clearShadowLayer();
            }
            c.drawRoundRect(rr,X(radius),X(radius),p);
            p.setShader(null); p.clearShadowLayer();
        }'''
s = replace_method(s, 'private void round(Canvas c,float l,float t,float r,float b,float radius,int color){', 'private void outline(Canvas c,float l,float t,float r,float b,float radius,int color,float width){', new_round)

new_outline = r'''private void outline(Canvas c,float l,float t,float r,float b,float radius,int color,float width){
            stroke.setShader(null); stroke.setStyle(Paint.Style.STROKE); stroke.setColor(color); stroke.setStrokeWidth(X(width));
            stroke.setShadowLayer(X(2.5f),0,0,Color.argb(65,Color.red(color),Color.green(color),Color.blue(color)));
            c.drawRoundRect(new RectF(X(l),X(t),X(r),X(b)),X(radius),X(radius),stroke);
            stroke.clearShadowLayer();
        }'''
s = replace_method(s, 'private void outline(Canvas c,float l,float t,float r,float b,float radius,int color,float width){', 'private void line(Canvas c,float x1,float y1,float x2,float y2,int color,float width){', new_outline)

new_gauge = r'''private void drawGauge(Canvas c,float cx,float cy,float r,boolean rpmGauge){
            // Layered radial shading gives the gauge the depth/gloss of the visual mockup.
            p.setStyle(Paint.Style.FILL);
            p.setShader(new RadialGradient(X(cx),X(cy-r*.22f),X(r*1.15f),
                    new int[]{Color.rgb(15,28,38),Color.rgb(5,13,20),Color.rgb(2,8,13)},
                    new float[]{0f,.55f,1f},Shader.TileMode.CLAMP));
            p.setShadowLayer(X(10),0,X(4),Color.argb(140,0,0,0));
            c.drawCircle(X(cx),X(cy),X(r),p);
            p.setShader(null); p.clearShadowLayer();

            RectF outer=new RectF(X(cx-r+7),X(cy-r+7),X(cx+r-7),X(cy+r-7));
            stroke.setStrokeCap(Paint.Cap.ROUND); stroke.setStyle(Paint.Style.STROKE);
            stroke.setStrokeWidth(X(13)); stroke.setColor(Color.rgb(24,45,59)); c.drawArc(outer,136,268,false,stroke);
            // soft glow behind the colored arc
            stroke.setStrokeWidth(X(20)); stroke.setColor(withAlpha(accent,55)); stroke.setShadowLayer(X(10),0,0,withAlpha(accent,105)); c.drawArc(outer,136,202,false,stroke);
            stroke.clearShadowLayer();
            stroke.setStrokeWidth(X(12)); stroke.setColor(accent); c.drawArc(outer,136,202,false,stroke);

            int ticks=26;
            for(int i=0;i<=ticks;i++){
                double a=Math.toRadians(136+268.0*i/ticks);
                float len=(i%5==0)?17:10;
                float x1=cx+(float)Math.cos(a)*(r-23), y1=cy+(float)Math.sin(a)*(r-23);
                float x2=cx+(float)Math.cos(a)*(r-23-len), y2=cy+(float)Math.sin(a)*(r-23-len);
                int tc=i%5==0?white:accent2;
                stroke.setShadowLayer(i%5==0?0:X(3),0,0,withAlpha(tc,100));
                line(c,x1,y1,x2,y2,tc,i%5==0?2.8f:1.8f);
                stroke.clearShadowLayer();
            }

            float frac=rpmGauge?Math.min(1f,rpm()/8000f):Math.min(1f,speed()/240f);
            double ma=Math.toRadians(136+268*frac);
            float mx1=cx+(float)Math.cos(ma)*(r-10), my1=cy+(float)Math.sin(ma)*(r-10);
            float mx2=cx+(float)Math.cos(ma)*(r-42), my2=cy+(float)Math.sin(ma)*(r-42);
            stroke.setShadowLayer(X(8),0,0,withAlpha(accent2,180)); line(c,mx1,my1,mx2,my2,accent2,6f); stroke.clearShadowLayer();

            txt(c,String.valueOf(rpmGauge?rpm():speed()),cx,cy+12,74,white,Paint.Align.CENTER,true);
            txt(c,rpmGauge?"RPM":"km/h",cx,cy+55,26,white,Paint.Align.CENTER,true);
            txt(c,"0",cx-r+27,cy+r-20,17,white,Paint.Align.CENTER,true);
            txt(c,rpmGauge?"8":"240",cx+r-27,cy+r-20,17,white,Paint.Align.CENTER,true);
            if(rpmGauge) txt(c,"x1000",cx,cy+r-15,15,muted,Paint.Align.CENTER,true);
        }'''
s = replace_method(s, 'private void drawGauge(Canvas c,float cx,float cy,float r,boolean rpmGauge){', 'private void drawConsumptionCard', new_gauge)

# Slightly bigger/bolder info values, like the mockup.
new_cons = r'''private void drawConsumptionCard(Canvas c,float l,float t,float r,float b,boolean current){
            round(c,l,t,r,b,17,panel); outline(c,l,t,r,b,17,border,1.5f);
            drawFuelIcon(c,l+27,t+41,48,accent);
            txt(c,current?"Consumo actual":"Consumo medio",l+98,t+32,20,muted,Paint.Align.LEFT,false);
            String v=String.format(Locale.getDefault(),"%.1f",current?currentCons():avgCons());
            txt(c,v,l+98,t+104,58,white,Paint.Align.LEFT,true);
            txt(c,"L/100 km",r-18,t+103,19,muted,Paint.Align.RIGHT,true);
        }'''
s = replace_method(s, 'private void drawConsumptionCard(Canvas c,float l,float t,float r,float b,boolean current){', 'private void drawDataCard', new_cons)

new_data = r'''private void drawDataCard(Canvas c,float l,float t,float r,float b,int icon,String label,String value,String unit,int color){
            round(c,l,t,r,b,17,panel); outline(c,l,t,r,b,17,border,1.45f);
            float iz=54;
            if(icon==0) drawThermometer(c,l+22,t+46,iz,color);
            else if(icon==1) drawBattery(c,l+20,t+47,iz,color);
            else if(icon==2) drawEngineIcon(c,l+19,t+46,iz,color);
            else if(icon==3) drawRoad(c,l+19,t+45,iz,color);
            else if(icon==4) drawClock(c,l+19,t+45,iz,color);
            else drawEngineIcon(c,l+19,t+45,iz,color);
            txt(c,label,l+92,t+33,20,muted,Paint.Align.LEFT,false);
            float base=b-21;
            float size=(icon==4?44:(icon==5?39:52));
            int valColor=(icon==1||icon==5)?color:white;
            txt(c,value,l+92,base,size,valColor,Paint.Align.LEFT,true);
            if(!unit.isEmpty()) txt(c,unit,r-17,base,20,muted,Paint.Align.RIGHT,true);
        }'''
s = replace_method(s, 'private void drawDataCard(Canvas c,float l,float t,float r,float b,int icon,String label,String value,String unit,int color){', 'private void drawNav(Canvas c){', new_data)

# Add luminous, fuller icon rendering. Layout/geometry stays unchanged.
def wrap_icon(text,start_sig,next_sig):
    a=text.index(start_sig); b=text.index(next_sig,a); block=text[a:b]
    # insert glow after opening brace and clear before closing brace
    first=block.index('{')+1
    block=block[:first]+'\n            stroke.setShadowLayer(X(5.5f),0,0,withAlpha(col,120)); p.setShadowLayer(X(5.5f),0,0,withAlpha(col,100));'+block[first:]
    # last method closing brace is the last } in block
    last=block.rfind('}')
    block=block[:last]+'            stroke.clearShadowLayer(); p.clearShadowLayer();\n        '+block[last:]
    return text[:a]+block+text[b:]

icons=[
 ('private void drawCarIcon(Canvas c,float x,float y,float size,int col){','private void drawFuelIcon'),
 ('private void drawFuelIcon(Canvas c,float x,float y,float z,int col){','private void drawThermometer'),
 ('private void drawThermometer(Canvas c,float x,float y,float z,int col){','private void drawBattery'),
 ('private void drawBattery(Canvas c,float x,float y,float z,int col){','private void drawEngineIcon'),
 ('private void drawEngineIcon(Canvas c,float x,float y,float z,int col){','private void drawRoad'),
 ('private void drawRoad(Canvas c,float x,float y,float z,int col){','private void drawClock'),
 ('private void drawClock(Canvas c,float x,float y,float z,int col){','private void drawHomeIcon'),
 ('private void drawHomeIcon(Canvas c,float x,float y,float z,int col){','private void drawTripIcon'),
 ('private void drawTripIcon(Canvas c,float x,float y,float z,int col){','private void drawWarning'),
 ('private void drawWarning(Canvas c,float x,float y,float z,int col){','private void drawGear'),
 ('private void drawGear(Canvas c,float x,float y,float z,int col){','// --- real Bluetooth Classic ELM327 layer ---')
]
for a,b in icons:
    s=wrap_icon(s,a,b)

p.write_text(s, encoding='utf-8')
print('v13 polished mockup-style patch applied')
