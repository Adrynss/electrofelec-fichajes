from pathlib import Path

p = Path('app/src/main/java/com/carmonitor/demo/MainActivity.java')
s = p.read_text(encoding='utf-8')

def replace_method(text, start_sig, next_sig, new_method):
    a = text.index(start_sig)
    b = text.index(next_sig, a)
    return text[:a] + new_method.rstrip() + '\n\n        ' + text[b:]

new_gauge = r'''private void drawGauge(Canvas c,float cx,float cy,float r,boolean rpmGauge){
            // Gauge background / depth.
            p.setStyle(Paint.Style.FILL);
            p.setShader(new RadialGradient(X(cx),X(cy-r*.22f),X(r*1.15f),
                    new int[]{Color.rgb(15,28,38),Color.rgb(5,13,20),Color.rgb(2,8,13)},
                    new float[]{0f,.55f,1f},Shader.TileMode.CLAMP));
            p.setShadowLayer(X(10),0,X(4),Color.argb(140,0,0,0));
            c.drawCircle(X(cx),X(cy),X(r),p);
            p.setShader(null); p.clearShadowLayer();

            final float startAngle = 136f;
            final float totalSweep = 268f;
            final float maxValue = rpmGauge ? 8000f : 240f;
            final float liveValue = rpmGauge ? rpm() : speed();
            final float frac = Math.max(0f, Math.min(1f, liveValue / maxValue));
            final float activeSweep = totalSweep * frac;

            RectF outer=new RectF(X(cx-r+7),X(cy-r+7),X(cx+r-7),X(cy+r-7));
            stroke.setStrokeCap(Paint.Cap.ROUND); stroke.setStyle(Paint.Style.STROKE);

            // Complete scale remains visible as a dark rail.
            stroke.setStrokeWidth(X(13));
            stroke.setColor(Color.rgb(24,45,59));
            c.drawArc(outer,startAngle,totalSweep,false,stroke);

            // Only illuminate the part reached by the current RPM / speed.
            if(activeSweep > 0.5f){
                stroke.setStrokeWidth(X(21));
                stroke.setColor(withAlpha(accent,48));
                stroke.setShadowLayer(X(11),0,0,withAlpha(accent,115));
                c.drawArc(outer,startAngle,activeSweep,false,stroke);
                stroke.clearShadowLayer();

                stroke.setStrokeWidth(X(12));
                stroke.setColor(accent);
                c.drawArc(outer,startAngle,activeSweep,false,stroke);
            }

            // Scale ticks. Ticks already passed get the theme colour, future ticks remain muted.
            int ticks=26;
            for(int i=0;i<=ticks;i++){
                float tickFrac=i/(float)ticks;
                double a=Math.toRadians(startAngle+totalSweep*tickFrac);
                float len=(i%5==0)?17:10;
                float x1=cx+(float)Math.cos(a)*(r-23), y1=cy+(float)Math.sin(a)*(r-23);
                float x2=cx+(float)Math.cos(a)*(r-23-len), y2=cy+(float)Math.sin(a)*(r-23-len);
                boolean reached=tickFrac<=frac+0.008f;
                int tc;
                if(i%5==0) tc=reached?white:Color.rgb(105,122,133);
                else tc=reached?accent2:Color.rgb(52,72,84);
                if(reached && i%5!=0) stroke.setShadowLayer(X(3),0,0,withAlpha(accent2,95));
                line(c,x1,y1,x2,y2,tc,i%5==0?2.8f:1.8f);
                stroke.clearShadowLayer();
            }

            // Bright cap/marker at the exact live value, like the end of a progress bar.
            if(frac > 0.005f){
                double ma=Math.toRadians(startAngle+totalSweep*frac);
                float mx1=cx+(float)Math.cos(ma)*(r-9), my1=cy+(float)Math.sin(ma)*(r-9);
                float mx2=cx+(float)Math.cos(ma)*(r-43), my2=cy+(float)Math.sin(ma)*(r-43);
                stroke.setShadowLayer(X(9),0,0,withAlpha(accent2,195));
                line(c,mx1,my1,mx2,my2,accent2,6f);
                stroke.clearShadowLayer();
            }

            txt(c,String.valueOf(rpmGauge?rpm():speed()),cx,cy+12,74,white,Paint.Align.CENTER,true);
            txt(c,rpmGauge?"RPM":"km/h",cx,cy+55,26,white,Paint.Align.CENTER,true);
            txt(c,"0",cx-r+27,cy+r-20,17,white,Paint.Align.CENTER,true);
            txt(c,rpmGauge?"8":"240",cx+r-27,cy+r-20,17,white,Paint.Align.CENTER,true);
            if(rpmGauge) txt(c,"x1000",cx,cy+r-15,15,muted,Paint.Align.CENTER,true);
        }'''

s = replace_method(s,
    'private void drawGauge(Canvas c,float cx,float cy,float r,boolean rpmGauge){',
    'private void drawConsumptionCard',
    new_gauge)

p.write_text(s, encoding='utf-8')
print('v14 dynamic gauge fill patch applied')
