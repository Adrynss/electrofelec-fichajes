package com.minimundo.juegos;

import android.app.Activity;
import android.os.Bundle;
import android.os.SystemClock;
import android.graphics.*;
import android.media.*;
import android.view.*;
import android.content.Context;
import java.util.*;

public class MainActivity extends Activity {
    GameView view;
    CalmMusic music;

    @Override public void onCreate(Bundle b){
        super.onCreate(b); fullscreen(); music=new CalmMusic(); view=new GameView(this); setContentView(view); music.start();
    }
    void fullscreen(){
        getWindow().setFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN,WindowManager.LayoutParams.FLAG_FULLSCREEN);
        getWindow().getDecorView().setSystemUiVisibility(5894|4096|View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY);
    }
    @Override protected void onResume(){ super.onResume(); fullscreen(); if(view==null||view.musicOn) music.start(); }
    @Override protected void onPause(){ music.stop(); super.onPause(); }
    @Override protected void onDestroy(){ music.stop(); super.onDestroy(); }

    class GameView extends View {
        Paint p=new Paint(3), brush=new Paint(3);
        ArrayList<Line> lines=new ArrayList<>();
        RectF play=new RectF(), sound=new RectF(), back=new RectF(), clear=new RectF(), done=new RectF(), paper=new RectF();
        ArrayList<RectF> locks=new ArrayList<>();
        int mode=0,page=0,color=0xffff5a82; boolean musicOn=true; Line current;
        long toastAt=-9999,partyAt=-9999;
        int[] colors={0xffff5a82,0xffffa63d,0xffffdf45,0xff4dca78,0xff4e9fff,0xff765fe5,0xffeb5ad3,0xff453e52};
        String[] games={"Puzles","Música","Animales","Memoria","Cocinar","Autos","Vestir","Globos"};
        int[] tileCols={0xff75d9f2,0xff9ba8f5,0xffca8df0,0xffff98d6,0xffff9c9c,0xffffdfa0,0xffbaf58c,0xff82edb0};
        Random rnd=new Random(4);
        float sx=1,sy=1;

        GameView(Context c){ super(c); setLayerType(View.LAYER_TYPE_SOFTWARE,null); p.setTypeface(Typeface.create("sans",Typeface.BOLD)); brush.setStyle(Paint.Style.STROKE);brush.setStrokeCap(Paint.Cap.ROUND);brush.setStrokeJoin(Paint.Join.ROUND); }
        float X(float v){return v*sx;} float Y(float v){return v*sy;} float R(float v){return v*(sx+sy)/2f;}
        void txt(Canvas c,String s,float x,float y,float size,int col){p.setShader(null);p.setStyle(Paint.Style.FILL);p.setColor(col);p.setTextSize(R(size));p.setTextAlign(Paint.Align.CENTER);c.drawText(s,X(x),Y(y),p);}
        void rr(Canvas c,float l,float t,float r,float b,float rad,int col){p.setShader(null);p.setStyle(Paint.Style.FILL);p.setColor(col);c.drawRoundRect(X(l),Y(t),X(r),Y(b),R(rad),R(rad),p);}
        void circle(Canvas c,float x,float y,float r,int col){p.setShader(null);p.setStyle(Paint.Style.FILL);p.setColor(col);c.drawCircle(X(x),Y(y),R(r),p);}
        void line(Canvas c,float x1,float y1,float x2,float y2,float sw,int col){p.setShader(null);p.setStyle(Paint.Style.STROKE);p.setStrokeWidth(R(sw));p.setStrokeCap(Paint.Cap.ROUND);p.setColor(col);c.drawLine(X(x1),Y(y1),X(x2),Y(y2),p);p.setStyle(Paint.Style.FILL);}
        void star(Canvas c,float x,float y,float r,int col){Path q=new Path();for(int i=0;i<10;i++){double a=-Math.PI/2+i*Math.PI/5;float z=i%2==0?r:r*.44f,xx=X(x)+(float)Math.cos(a)*R(z),yy=Y(y)+(float)Math.sin(a)*R(z);if(i==0)q.moveTo(xx,yy);else q.lineTo(xx,yy);}q.close();p.setShader(null);p.setColor(col);p.setStyle(Paint.Style.FILL);c.drawPath(q,p);}
        void heart(Canvas c,float x,float y,float s,int col){Path q=new Path();q.moveTo(X(x),Y(y+s*.8f));q.cubicTo(X(x-s*1.4f),Y(y),X(x-s*.7f),Y(y-s),X(x),Y(y-s*.25f));q.cubicTo(X(x+s*.7f),Y(y-s),X(x+s*1.4f),Y(y),X(x),Y(y+s*.8f));q.close();p.setColor(col);p.setStyle(Paint.Style.FILL);c.drawPath(q,p);}
        void lock(Canvas c,float x,float y,float s){p.setStyle(Paint.Style.STROKE);p.setStrokeWidth(R(3));p.setColor(0xff66537b);RectF arch=new RectF(X(x-s*.45f),Y(y-s*.65f),X(x+s*.45f),Y(y+s*.05f));c.drawArc(arch,190,160,false,p);p.setStyle(Paint.Style.FILL);rr(c,x-s*.62f,y-s*.08f,x+s*.62f,y+s*.72f,s*.18f,0xf4ffffff);circle(c,x,y+s*.25f,s*.10f,0xff775c8d);rr(c,x-s*.055f,y+s*.27f,x+s*.055f,y+s*.48f,s*.03f,0xff775c8d);}

        @Override protected void onDraw(Canvas c){sx=getWidth()/432f;sy=getHeight()/800f;if(mode==0)home(c);else coloring(c);postInvalidateOnAnimation();}

        void home(Canvas c){ long n=SystemClock.uptimeMillis();
            p.setShader(new LinearGradient(0,0,0,getHeight(),new int[]{0xff58c9f5,0xffb9eff8,0xffffdda5},null,Shader.TileMode.CLAMP));c.drawRect(0,0,getWidth(),getHeight(),p);p.setShader(null);
            rr(c,0,0,45,800,0,0xffb87945);rr(c,387,0,432,800,0,0xffa96c3d);rr(c,0,0,432,35,0,0xffad7042);
            for(int i=0;i<6;i++){line(c,8,40+i*122,39,52+i*122,2,0x44ffffff);line(c,396,60+i*112,426,45+i*112,2,0x33703d24);}
            line(c,25,15,18,177,5,0xff3d9554);line(c,408,10,416,195,5,0xff3d9554);
            for(int i=0;i<8;i++){circle(c,20+(i%2)*8,35+i*20,8,0xff5eb76a);circle(c,412-(i%2)*7,32+i*21,8,0xff54aa61);}
            rr(c,58,37,202,215,68,0xff8f5d3b);rr(c,68,47,192,207,58,0xffd9f8ff);
            p.setShader(new LinearGradient(X(68),Y(47),X(68),Y(207),0xff78d9ff,0xffc9f6ff,Shader.TileMode.CLAMP));c.drawRoundRect(X(68),Y(47),X(192),Y(207),R(55),R(55),p);p.setShader(null);
            circle(c,168,78,18,0xffffe477);
            p.setColor(0xff8ed691);Path hills=new Path();hills.moveTo(X(69),Y(170));hills.quadTo(X(100),Y(130),X(125),Y(169));hills.quadTo(X(158),Y(121),X(192),Y(166));hills.lineTo(X(192),Y(207));hills.lineTo(X(69),Y(207));hills.close();c.drawPath(hills,p);
            rr(c,105,132,157,190,5,0xffd5a6f5);rr(c,112,110,128,190,4,0xffecb7ff);rr(c,143,118,160,190,4,0xffaeb8ff);Path roof=new Path();roof.moveTo(X(108),Y(111));roof.lineTo(X(120),Y(93));roof.lineTo(X(132),Y(111));roof.close();p.setColor(0xffff86b8);c.drawPath(roof,p);Path roof2=new Path();roof2.moveTo(X(139),Y(119));roof2.lineTo(X(151),Y(101));roof2.lineTo(X(164),Y(119));roof2.close();c.drawPath(roof2,p);circle(c,121,146,5,0xff68558c);circle(c,151,149,5,0xff68558c);
            rr(c,332,145,430,157,4,0xff8d5638);rr(c,346,159,360,212,2,0xff6eb6e8);rr(c,361,170,374,212,2,0xffff8aa4);rr(c,375,163,389,212,2,0xffffca62);circle(c,403,174,18,0xffffdc55);txt(c,"★",403,181,17,0xffffa633);
            circle(c,55,235,31,0xffc98956);circle(c,34,217,13,0xffb67549);circle(c,76,217,13,0xffb67549);circle(c,45,233,3,0xff3e3140);circle(c,65,233,3,0xff3e3140);circle(c,55,244,6,0xffefd3ae);line(c,51,244,55,247,1.5f,0xff5e443a);line(c,59,244,55,247,1.5f,0xff5e443a);
            circle(c,46,46,30,0xfff8f2df);circle(c,31,35,14,0xffc87845);circle(c,61,35,14,0xffc87845);circle(c,38,47,3,0xff4b3d5a);circle(c,54,47,3,0xff4b3d5a);circle(c,46,57,6,0xfff2b985);line(c,43,57,46,60,1.4f,0xff573a46);line(c,49,57,46,60,1.4f,0xff573a46);
            rr(c,76,17,202,62,20,0xf7ffffff);txt(c,"¡Hola, amigo!",139,46,17,0xff60489c);heart(c,188,38,6,0xffff69ad);
            rr(c,298,18,381,58,20,0xf3ffffff);star(c,316,38,13,0xffffca35);txt(c,"0",351,47,22,0xff4f3e77);
            sound.set(X(383),Y(18),X(427),Y(62));circle(c,405,40,21,musicOn?0xff49b9ff:0xff9ba7b8);txt(c,musicOn?"♫":"×",405,48,21,Color.WHITE);
            rr(c,91,72,341,178,48,0xeeffffff);txt(c,"Mini",216,112,37,0xffffa719);
            String word="Mundo";int[] wc={0xff209df4,0xffef52b0,0xff6ecb43,0xff21bda9,0xff7d49dc};float start=153;for(int i=0;i<word.length();i++)txt(c,""+word.charAt(i),start+i*31,151,37,wc[i]);
            rr(c,134,156,298,184,12,0xff9b6039);txt(c,"de Juegos",216,177,18,0xffffefd6);txt(c,"¡Pronto más juegos!",216,206,14,0xff6c55ac);
            rr(c,344,72,426,135,4,0xffffe8d0);txt(c,"Juega",385,91,11,0xff66508d);txt(c,"Explora",385,108,11,0xff66508d);txt(c,"¡Sé feliz!",385,125,11,0xff66508d);

            float pulse=1+.010f*(float)Math.sin(n/250.0);float l=74,r=358,t=229,b=452,cx=216,cy=(t+b)/2;play.set(X(cx-(r-l)/2*pulse),Y(cy-(b-t)/2*pulse),X(cx+(r-l)/2*pulse),Y(cy+(b-t)/2*pulse));
            p.setShadowLayer(R(15),0,R(4),0x77fff25c);rr(c,l,t,r,b,26,0xfffff06a);p.clearShadowLayer();
            circle(c,88,245,18,0xffff59ba);circle(c,346,253,15,0xff5bd85f);circle(c,84,432,15,0xff4eb7ff);circle(c,351,423,17,0xffff6657);
            txt(c,"Colorear",216,278,35,0xffcf3fa6);
            circle(c,146,335,53,0xffefc48e);circle(c,120,311,10,0xffff5d73);circle(c,145,300,10,0xffffd64b);circle(c,171,315,10,0xff52ca78);circle(c,170,345,10,0xff4e9fff);circle(c,133,342,3,0xff49364b);circle(c,151,342,3,0xff49364b);Path smile=new Path();smile.moveTo(X(134),Y(352));smile.quadTo(X(143),Y(362),X(152),Y(352));p.setStyle(Paint.Style.STROKE);p.setStrokeWidth(R(2.5f));p.setColor(0xff55374b);c.drawPath(smile,p);p.setStyle(Paint.Style.FILL);
            rr(c,92,347,111,408,7,0xffff553f);Path tip=new Path();tip.moveTo(X(92),Y(348));tip.lineTo(X(101.5f),Y(331));tip.lineTo(X(111),Y(348));tip.close();p.setColor(0xffffc9aa);c.drawPath(tip,p);
            rr(c,205,299,334,392,14,0xffffffff);circle(c,248,332,17,0xffffdd55);for(int k=0;k<8;k++){double a=k*Math.PI/4;line(c,248+(float)Math.cos(a)*22,332+(float)Math.sin(a)*22,248+(float)Math.cos(a)*29,332+(float)Math.sin(a)*29,2,0xffffb52c);}heart(c,293,357,10,0xffff6680);line(c,215,371,232,358,3,0xff5cc56e);line(c,232,358,244,372,3,0xff5cc56e);
            rr(c,117,401,315,439,19,0xff2fc36a);txt(c,"▶  ¡Jugar ahora!",216,427,18,Color.WHITE);

            locks.clear();float gx=14,gy=467,gap=7,tw=96,th=104;for(int i=0;i<8;i++){int row=i/4,col=i%4;float x=gx+col*(tw+gap),y=gy+row*(th+gap);RectF rc=new RectF(X(x),Y(y),X(x+tw),Y(y+th));locks.add(rc);rr(c,x,y,x+tw,y+th,16,tileCols[i]);drawGameIcon(c,i,x+48,y+40);lock(c,x+77,y+24,15);txt(c,games[i],x+48,y+92,11,0xff514166);}

            circle(c,61,726,43,0xff7d7183);circle(c,34,704,18,0xff706477);circle(c,87,704,18,0xff706477);Path ear=new Path();ear.moveTo(X(31),Y(695));ear.lineTo(X(39),Y(674));ear.lineTo(X(49),Y(697));ear.close();p.setColor(0xff7d7183);c.drawPath(ear,p);Path ear2=new Path();ear2.moveTo(X(74),Y(697));ear2.lineTo(X(84),Y(674));ear2.lineTo(X(94),Y(699));ear2.close();c.drawPath(ear2,p);line(c,47,718,55,718,2,0xff3e3445);line(c,67,718,75,718,2,0xff3e3445);heart(c,61,730,4,0xffffa3a3);
            rr(c,123,695,314,748,25,0xf4ffffff);star(c,142,721,11,0xffffc93e);star(c,295,721,11,0xffffc93e);txt(c,"¡Muchos juegos",218,716,15,0xff624c9a);txt(c,"te esperan!",218,737,15,0xff624c9a);
            rr(c,344,701,424,718,3,0xff72bb68);rr(c,338,719,424,736,3,0xff5b9de0);rr(c,349,737,424,754,3,0xffff9a56);rr(c,342,755,424,772,3,0xffed6c72);txt(c,"JUEGA",383,714,9,Color.WHITE);txt(c,"IMAGINA",381,732,9,Color.WHITE);txt(c,"CRECE",386,750,9,Color.WHITE);txt(c,"SIEMPRE",383,768,9,Color.WHITE);
            for(int i=0;i<8;i++){float xx=55+i*47,yy=215+(float)Math.sin(n/480.0+i)*6;txt(c,i%2==0?"♪":"·",xx,yy,10,0x88ffffff);}for(int i=0;i<10;i++){float xx=25+(i*43)%390,yy=90+(i*67)%580;float z=.55f+.45f*(float)Math.sin(n/420.0+i);star(c,xx,yy,3+2*z,Color.argb((int)(70+100*z),255,255,255));}
            if(n-toastAt<1400){float a=1-Math.max(0,(n-toastAt-950)/450f);rr(c,98,370,334,434,24,Color.argb((int)(230*a),82,57,126));txt(c,"🔒 ¡Muy pronto!",216,397,18,Color.WHITE);txt(c,"Estamos preparando este juego",216,419,10,0xffffeafd);}
        }

        void drawGameIcon(Canvas c,int i,float x,float y){
            if(i==0){rr(c,x-27,y-18,x+1,y+10,5,0xff437ecb);rr(c,x+3,y-18,x+31,y+10,5,0xffffd34f);rr(c,x-27,y+12,x+1,y+40,5,0xffff6969);rr(c,x+3,y+12,x+31,y+40,5,0xff59c977);}
            else if(i==1){int[] cs={0xffef5c62,0xffffa94a,0xffffdc4e,0xff65c66f,0xff4e9fff,0xff865fe5};for(int k=0;k<6;k++)rr(c,x-34+k*12,y-3-k*2,x-24+k*12,y+28+k*1.5f,4,cs[k]);txt(c,"♪",x+22,y-12,20,0xff654f91);txt(c,"♫",x-15,y-18,16,0xff654f91);}
            else if(i==2){circle(c,x,y+5,25,0xffc97942);for(int k=0;k<9;k++){double a=k*Math.PI*2/9;circle(c,x+(float)Math.cos(a)*29,y+5+(float)Math.sin(a)*29,10,0xffb96b39);}circle(c,x,y+5,19,0xffffd399);circle(c,x-7,y,2.7f,0xff493943);circle(c,x+7,y,2.7f,0xff493943);}
            else if(i==3){rr(c,x-30,y-22,x+2,y+22,6,0xff765ee6);star(c,x-14,y,9,0xffffd64a);rr(c,x+4,y-18,x+34,y+26,6,0xfff36cae);heart(c,x+19,y+2,7,0xffffffff);}
            else if(i==4){rr(c,x-23,y+7,x+23,y+34,7,0xffff9d6d);rr(c,x-18,y-1,x+18,y+14,8,0xfffffff4);circle(c,x-13,y+4,3,0xffff5e8a);circle(c,x,y+1,3,0xff57c977);circle(c,x+12,y+5,3,0xff4da0ff);Path hat=new Path();hat.moveTo(X(x-25),Y(y-9));hat.quadTo(X(x),Y(y-34),X(x+25),Y(y-9));hat.close();p.setColor(0xffffffff);c.drawPath(hat,p);}
            else if(i==5){rr(c,x-31,y-2,x+30,y+22,8,0xffe8514c);rr(c,x-18,y-16,x+14,y+4,8,0xffef6762);circle(c,x-18,y+24,8,0xff413b49);circle(c,x+20,y+24,8,0xff413b49);circle(c,x-18,y+24,4,0xffd9e2ec);circle(c,x+20,y+24,4,0xffd9e2ec);}
            else if(i==6){Path d=new Path();d.moveTo(X(x-10),Y(y-28));d.lineTo(X(x+10),Y(y-28));d.lineTo(X(x+18),Y(y-5));d.lineTo(X(x+34),Y(y+31));d.lineTo(X(x-34),Y(y+31));d.lineTo(X(x-18),Y(y-5));d.close();p.setColor(0xff55a8e9);c.drawPath(d,p);star(c,x,y+5,7,0xffffd74b);}
            else {int[] cc={0xfff25f85,0xff63c86c,0xff6d7eea};for(int k=0;k<3;k++){float xx=x-18+k*18,yy=y-8+(k%2)*8;circle(c,xx,yy,15,cc[k]);line(c,xx,yy+14,x,y+37,1.4f,0xff746181);}}
        }

        void coloring(Canvas c){long n=SystemClock.uptimeMillis();
            p.setShader(new LinearGradient(0,0,0,getHeight(),new int[]{0xff6bd3ff,0xffd4f7ff,0xffffe5b5},null,Shader.TileMode.CLAMP));c.drawRect(0,0,getWidth(),getHeight(),p);p.setShader(null);circle(c,65,82,30,0x55ffffff);circle(c,95,84,22,0x55ffffff);circle(c,350,105,40,0x44ffffff);
            rr(c,15,15,417,78,28,0xf6ffffff);back.set(X(22),Y(23),X(70),Y(69));circle(c,46,46,21,0xff725bd2);txt(c,"‹",46,55,31,Color.WHITE);txt(c,"¡A COLOREAR!",216,47,22,0xff5b477f);txt(c,"Pinta con el dedo",216,67,10,0xff927bac);sound.set(X(365),Y(23),X(413),Y(69));circle(c,389,46,21,musicOn?0xff4db7ff:0xffa4adbd);txt(c,musicOn?"♫":"×",389,53,20,Color.WHITE);
            paper.set(X(15),Y(96),X(417),Y(624));p.setShadowLayer(R(10),0,R(4),0x443d3760);rr(c,15,96,417,624,25,0xfffffff9);p.clearShadowLayer();c.save();c.clipRect(paper);p.setShader(new LinearGradient(0,Y(96),0,Y(624),0xfffffff8,0xffeefaff,Shader.TileMode.CLAMP));c.drawRect(paper,p);p.setShader(null);p.setColor(0xffdcf5c9);c.drawRect(X(15),Y(548),X(417),Y(624),p);for(Line l:lines){brush.setColor(l.col);brush.setStrokeWidth(l.width);c.drawPath(l.path,brush);}if(page==0)drawDino(c);else if(page==1)drawRocket(c);else drawButterfly(c);c.restore();
            rr(c,20,638,73,680,18,0xf5ffffff);txt(c,"‹",46.5f,668,28,0xff66528d);rr(c,359,638,412,680,18,0xf5ffffff);txt(c,"›",385.5f,668,28,0xff66528d);for(int i=0;i<3;i++)circle(c,192+i*24,658,i==page?6:4,i==page?0xff765fe5:0xaaffffff);
            clear.set(X(23),Y(690),X(108),Y(734));done.set(X(324),Y(690),X(409),Y(734));rr(c,23,690,108,734,20,0xf5ffffff);txt(c,"BORRAR",65.5f,718,11,0xff645381);p.setShadowLayer(R(8),0,R(3),0x5535c36b);rr(c,324,690,409,734,20,0xff35c36b);p.clearShadowLayer();txt(c,"¡LISTO!",366.5f,718,13,Color.WHITE);
            for(int i=0;i<8;i++){float x=27+i*54;float z=color==colors[i]?2.5f*(float)Math.sin(n/230.0):0;circle(c,x,768,19+z,Color.WHITE);circle(c,x,768,15+z*.6f,colors[i]);}
            if(n-partyAt<1700){float f=(n-partyAt)/1700f;for(int i=0;i<45;i++){float x=(i*83)%432,y=(f*900+(i*57)%800)-70;star(c,x,y,4+i%3,colors[i%8]);}if(f<.65f)txt(c,"¡QUÉ BONITO!",216,290,28,0xff704dbb);}
        }
        void outline(){p.setShader(null);p.setStyle(Paint.Style.STROKE);p.setStrokeWidth(R(4));p.setStrokeCap(Paint.Cap.ROUND);p.setStrokeJoin(Paint.Join.ROUND);p.setColor(0xff3f3a53);}void fill(){p.setStyle(Paint.Style.FILL);}
        void drawDino(Canvas c){outline();RectF body=new RectF(X(120),Y(340),X(280),Y(455));c.drawOval(body,p);RectF head=new RectF(X(250),Y(277),X(347),Y(375));c.drawOval(head,p);Path tail=new Path();tail.moveTo(X(121),Y(395));tail.quadTo(X(70),Y(375),X(85),Y(325));c.drawPath(tail,p);for(int i=0;i<2;i++){float x=165+i*70;Path leg=new Path();leg.moveTo(X(x),Y(438));leg.lineTo(X(x-5),Y(500));leg.lineTo(X(x+25),Y(500));c.drawPath(leg,p);}for(int i=0;i<5;i++){float x=145+i*31;Path sp=new Path();sp.moveTo(X(x),Y(342));sp.lineTo(X(x+11),Y(318));sp.lineTo(X(x+22),Y(342));c.drawPath(sp,p);}fill();circle(c,313,320,4,0xff3f3a53);txt(c,"¡Píntame como quieras!",216,132,14,0xff67588d);}
        void drawRocket(Canvas c){outline();float cx=216;Path r=new Path();r.moveTo(X(cx),Y(250));r.quadTo(X(290),Y(340),X(266),Y(470));r.lineTo(X(166),Y(470));r.quadTo(X(142),Y(340),X(cx),Y(250));r.close();c.drawPath(r,p);c.drawCircle(X(cx),Y(355),R(27),p);Path lf=new Path();lf.moveTo(X(168),Y(420));lf.lineTo(X(118),Y(490));lf.lineTo(X(172),Y(468));c.drawPath(lf,p);Path rf=new Path();rf.moveTo(X(264),Y(420));rf.lineTo(X(314),Y(490));rf.lineTo(X(260),Y(468));c.drawPath(rf,p);Path fl=new Path();fl.moveTo(X(190),Y(470));fl.quadTo(X(216),Y(545),X(242),Y(470));c.drawPath(fl,p);fill();star(c,90,205,13,0xffffd84f);star(c,344,235,10,0xffffd84f);txt(c,"¡Rumbo a las estrellas!",216,132,14,0xff67588d);}
        void drawButterfly(Canvas c){outline();RectF l1=new RectF(X(105),Y(285),X(205),Y(390)),r1=new RectF(X(227),Y(285),X(327),Y(390)),l2=new RectF(X(124),Y(385),X(205),Y(485)),r2=new RectF(X(227),Y(385),X(308),Y(485));c.drawOval(l1,p);c.drawOval(r1,p);c.drawOval(l2,p);c.drawOval(r2,p);c.drawRoundRect(X(204),Y(300),X(228),Y(480),R(12),R(12),p);Path a1=new Path();a1.moveTo(X(210),Y(304));a1.quadTo(X(178),Y(245),X(155),Y(267));c.drawPath(a1,p);Path a2=new Path();a2.moveTo(X(222),Y(304));a2.quadTo(X(254),Y(245),X(277),Y(267));c.drawPath(a2,p);fill();circle(c,161,338,12,0x22685ad3);circle(c,271,338,12,0x22685ad3);txt(c,"¡Llénala de colores!",216,132,14,0xff67588d);}

        @Override public boolean onTouchEvent(MotionEvent e){float x=e.getX(),y=e.getY();int a=e.getActionMasked();if(a==MotionEvent.ACTION_DOWN){if(sound.contains(x,y)){musicOn=!musicOn;if(musicOn)music.start();else music.stop();return true;}if(mode==0){if(play.contains(x,y)){mode=1;lines.clear();return true;}for(RectF r:locks)if(r.contains(x,y)){toastAt=SystemClock.uptimeMillis();return true;}}else{if(back.contains(x,y)){mode=0;current=null;return true;}RectF prev=new RectF(X(20),Y(638),X(73),Y(680)),next=new RectF(X(359),Y(638),X(412),Y(680));if(prev.contains(x,y)){page=(page+2)%3;lines.clear();return true;}if(next.contains(x,y)){page=(page+1)%3;lines.clear();return true;}if(clear.contains(x,y)){lines.clear();return true;}if(done.contains(x,y)){partyAt=SystemClock.uptimeMillis();return true;}for(int i=0;i<8;i++)if(Math.hypot(x-X(27+i*54),y-Y(768))<R(27)){color=colors[i];return true;}if(paper.contains(x,y)){current=new Line(color,R(24));current.path.moveTo(x,y);lines.add(current);return true;}}}else if(a==MotionEvent.ACTION_MOVE&&current!=null){current.path.lineTo(Math.max(paper.left,Math.min(paper.right,x)),Math.max(paper.top,Math.min(paper.bottom,y)));return true;}else if(a==MotionEvent.ACTION_UP||a==MotionEvent.ACTION_CANCEL){current=null;return true;}return true;}
        class Line{Path path=new Path();int col;float width;Line(int c,float w){col=c;width=w;}}
    }

    static class CalmMusic {
        AudioTrack track; Thread thread; volatile boolean running=false;
        final int sr=22050; final double bpm=94.0, beat=60.0/bpm;
        final int[][] progressions={{60,67,69,65,60,67,65,67},{69,65,60,67,69,67,65,67},{60,65,69,67,60,69,65,67}};
        final int[][] chord={{60,64,67},{55,59,62},{57,60,64},{53,57,60}};
        final int[][] patterns={{72,-1,76,79,81,79,76,-1,74,76,79,76,72,-1,74,76},{76,79,81,-1,79,76,74,72,74,-1,76,79,81,79,76,-1},{72,74,76,79,76,-1,72,74,69,72,74,76,79,-1,76,74},{79,81,84,-1,81,79,76,74,76,79,-1,81,79,76,74,72},{72,-1,74,76,79,-1,81,79,76,74,72,-1,74,76,79,-1},{76,79,81,84,81,-1,79,76,74,76,79,-1,76,74,72,-1}};
        double freq(int midi){return 440.0*Math.pow(2,(midi-69)/12.0);}int[] chordForRoot(int root){if(root==60)return chord[0];if(root==67)return chord[1];if(root==69)return chord[2];return chord[3];}
        synchronized void start(){if(running)return;running=true;thread=new Thread(()->runMusic(),"MiniMundoMusic");thread.start();}
        void runMusic(){try{int min=AudioTrack.getMinBufferSize(sr,AudioFormat.CHANNEL_OUT_MONO,AudioFormat.ENCODING_PCM_16BIT);track=new AudioTrack.Builder().setAudioAttributes(new AudioAttributes.Builder().setUsage(AudioAttributes.USAGE_GAME).setContentType(AudioAttributes.CONTENT_TYPE_MUSIC).build()).setAudioFormat(new AudioFormat.Builder().setEncoding(AudioFormat.ENCODING_PCM_16BIT).setSampleRate(sr).setChannelMask(AudioFormat.CHANNEL_OUT_MONO).build()).setBufferSizeInBytes(Math.max(min,sr)).setTransferMode(AudioTrack.MODE_STREAM).build();track.setVolume(.20f);track.play();int bars=24;while(running){for(int bar=0;bar<bars&&running;bar++){short[] pcm=renderBar(bar);track.write(pcm,0,pcm.length,AudioTrack.WRITE_BLOCKING);}}}catch(Throwable ignored){}finally{release();}}
        short[] renderBar(int bar){int len=(int)(4*beat*sr);double[] y=new double[len];int root=progressions[(bar/8)%3][bar%8];int[] ch=chordForRoot(root);for(int m:ch)add(y,0,4*beat,freq(m-12),.045,0);for(int k=0;k<2;k++)add(y,k*2*beat,1.5*beat,freq(root-24),.065,1);int block=bar/2,offset=(bar%2)*8;int[] pat=patterns[block%patterns.length];int shift=(block==5||block==10)?12:0;for(int i=0;i<8;i++){int m=pat[offset+i];if(m>0)add(y,i*.5*beat,.43*beat,freq(m+shift),shift==0?.105:.065,(block/2)%2==0?2:1);}if(bar%4==3){add(y,3.08*beat,.45*beat,freq(84),.035,2);add(y,3.35*beat,.45*beat,freq(88),.03,2);add(y,3.62*beat,.40*beat,freq(91),.025,2);}short[] out=new short[len];for(int i=0;i<len;i++){double v=Math.tanh(y[i]*1.35)*.72;out[i]=(short)(Math.max(-1,Math.min(1,v))*32767);}return out;}
        void add(double[] y,double start,double dur,double f,double amp,int kind){int a=(int)(start*sr),b=Math.min(y.length,a+(int)(dur*sr));for(int i=a;i<b;i++){double t=(i-a)/(double)sr,q=t/dur,env;if(kind==0)env=Math.min(1,t/.22)*Math.min(1,(dur-t)/.45);else env=Math.exp(-(kind==2?4.0:5.5)*q)*(1-Math.exp(-35*t));env=Math.max(0,Math.min(1,env));double ph=2*Math.PI*f*t,sig=Math.sin(ph)+(kind==2?.24:.16)*Math.sin(ph*2.0)+(kind==2?.08:0)*Math.sin(ph*3.0);y[i]+=amp*env*sig;}}
        synchronized void stop(){running=false;if(track!=null){try{track.pause();}catch(Throwable ignored){}try{track.flush();}catch(Throwable ignored){}try{track.release();}catch(Throwable ignored){}track=null;}}
        synchronized void release(){if(track!=null){try{track.stop();}catch(Throwable ignored){}try{track.release();}catch(Throwable ignored){}track=null;}}
    }
}
