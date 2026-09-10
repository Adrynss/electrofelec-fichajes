package com.minimundo.juegos;

import android.app.Activity;
import android.os.Bundle;
import android.os.SystemClock;
import android.graphics.*;
import android.media.*;
import android.view.*;
import java.util.*;

public class MainActivity extends Activity {
    GameView view; Melody music;
    @Override public void onCreate(Bundle b){ super.onCreate(b); fullscreen(); music=new Melody(); view=new GameView(); setContentView(view); }
    void fullscreen(){ getWindow().setFlags(1024,1024); getWindow().getDecorView().setSystemUiVisibility(5894|4096); }
    @Override protected void onResume(){ super.onResume(); fullscreen(); if(view==null||view.musicOn) music.start(); }
    @Override protected void onPause(){ music.stop(); super.onPause(); }

    class GameView extends View {
        Paint p=new Paint(3), brush=new Paint(3); ArrayList<Line> lines=new ArrayList<>();
        RectF play=new RectF(), sound=new RectF(), back=new RectF(), clear=new RectF(), done=new RectF(), paper=new RectF();
        ArrayList<RectF> locks=new ArrayList<>(); int mode=0, color=Color.rgb(255,90,130); boolean musicOn=true; Line current; long toast=0, party=0;
        int[] colors={0xffff5a82,0xffffa63d,0xffffdf45,0xff4dca78,0xff4e9fff,0xff765fe5,0xffeb5ad3,0xff453e52};
        String[] games={"Puzles","Musica","Animales","Memoria","Cocinar","Autos","Vestir","Globos"};
        GameView(){ super(MainActivity.this); p.setTypeface(Typeface.create("sans",Typeface.BOLD)); brush.setStyle(Paint.Style.STROKE); brush.setStrokeCap(Paint.Cap.ROUND); brush.setStrokeJoin(Paint.Join.ROUND); }
        float D(float v){ return v*getResources().getDisplayMetrics().density; }
        void txt(Canvas c,String s,float x,float y,float size,int col){ p.setStyle(Paint.Style.FILL);p.setColor(col);p.setTextSize(size);p.setTextAlign(Paint.Align.CENTER);c.drawText(s,x,y,p); }
        void rr(Canvas c,float l,float t,float r,float b,float rad,int col){p.setStyle(Paint.Style.FILL);p.setColor(col);c.drawRoundRect(l,t,r,b,rad,rad,p);}
        void circle(Canvas c,float x,float y,float r,int col){p.setStyle(Paint.Style.FILL);p.setColor(col);c.drawCircle(x,y,r,p);}
        void star(Canvas c,float x,float y,float r,int col){Path q=new Path();for(int i=0;i<10;i++){double a=-Math.PI/2+i*Math.PI/5;float z=i%2==0?r:r*.45f,xx=x+(float)Math.cos(a)*z,yy=y+(float)Math.sin(a)*z;if(i==0)q.moveTo(xx,yy);else q.lineTo(xx,yy);}q.close();p.setColor(col);c.drawPath(q,p);}
        @Override protected void onDraw(Canvas c){ super.onDraw(c); if(mode==0) home(c); else coloring(c); postInvalidateOnAnimation(); }
        void bg(Canvas c){ int h=getHeight();p.setShader(new LinearGradient(0,0,0,h,new int[]{0xff68d5ff,0xffd4f7ff,0xffffe0a7},null,Shader.TileMode.CLAMP));c.drawRect(0,0,getWidth(),h,p);p.setShader(null); }
        void home(Canvas c){ bg(c);int w=getWidth(),h=getHeight();long n=SystemClock.uptimeMillis();
            for(int i=0;i<12;i++){float x=((i*79+n/35)%Math.max(1,w+100))-50,y=D(50+(i*53)%(int)Math.max(100,h*.8f));circle(c,x,y,D(4+i%3),0x55ffffff);}
            circle(c,D(42),D(48),D(29),0xfffff4db);circle(c,D(25),D(36),D(13),0xffc98355);circle(c,D(59),D(36),D(13),0xffc98355);circle(c,D(34),D(47),D(3),0xff4b3d5a);circle(c,D(50),D(47),D(3),0xff4b3d5a);txt(c,"Hola!",D(42),D(82),D(11),0xff5b477f);
            sound.set(w-D(62),D(20),w-D(14),D(68));circle(c,sound.centerX(),sound.centerY(),D(24),musicOn?0xff54baff:0xffaab4c5);txt(c,musicOn?"♪":"x",sound.centerX(),sound.centerY()+D(8),D(26),Color.WHITE);
            txt(c,"MINI",w/2f,D(112),D(39),0xffffa92f);txt(c,"MUNDO",w/2f,D(153),D(45),0xff6555df);rr(c,w*.30f,D(163),w*.70f,D(193),D(14),0xffae7648);txt(c,"DE JUEGOS",w/2f,D(184),D(15),Color.WHITE);txt(c,"Muchos juegos en una sola app",w/2f,D(217),D(14),0xff58477e);
            float pulse=1+.012f*(float)Math.sin(n/250.0),cw=w-D(28),ch=Math.min(D(216),h*.285f),cx=w/2f,cy=D(340);play.set(cx-cw/2*pulse,cy-ch/2*pulse,cx+cw/2*pulse,cy+ch/2*pulse);
            p.setShadowLayer(D(12),0,D(5),0x55ff6f99);rr(c,play.left,play.top,play.right,play.bottom,D(26),0xfffff16b);p.clearShadowLayer();
            txt(c,"COLOREAR",cx,play.top+D(45),D(31),0xffc54ba8);circle(c,play.left+cw*.27f,play.top+ch*.48f,D(43),0xfff3c98e);int[] dots={0xffff5e68,0xffffdd45,0xff55cb74,0xff4d9fff};for(int i=0;i<4;i++)circle(c,play.left+cw*.20f+(i%2)*D(42),play.top+ch*.39f+(i/2)*D(38),D(9),dots[i]);
            rr(c,play.left+cw*.49f,play.top+D(64),play.right-D(18),play.bottom-D(56),D(12),Color.WHITE);star(c,play.left+cw*.66f,play.top+D(105),D(24),0xffffd94d);circle(c,play.left+cw*.78f,play.top+D(148),D(20),0xff5eb7ff);
            rr(c,play.left+cw*.21f,play.bottom-D(49),play.right-cw*.10f,play.bottom-D(10),D(20),0xff35c36b);txt(c,"JUGAR AHORA",cx,play.bottom-D(22),D(17),Color.WHITE);
            locks.clear();float gap=D(7),m=D(10),tw=(w-2*m-3*gap)/4f,th=D(104),gy=play.bottom+D(14);for(int i=0;i<8;i++){int row=i/4,col=i%4;RectF r=new RectF(m+col*(tw+gap),gy+row*(th+gap),m+col*(tw+gap)+tw,gy+row*(th+gap)+th);locks.add(r);int cc=Color.HSVToColor(new float[]{(i*43+190)%360,0.38f,1f});rr(c,r.left,r.top,r.right,r.bottom,D(16),cc);star(c,r.centerX(),r.top+D(34),D(18),0xccffffff);circle(c,r.right-D(18),r.top+D(18),D(13),0xddffffff);txt(c,"L",r.right-D(18),r.top+D(23),D(12),0xff6b5b83);txt(c,games[i],r.centerX(),r.bottom-D(12),D(11),0xff56436f);}
            if(n-toast<1200){float a=1-(n-toast)/1200f;rr(c,D(54),h*.47f,w-D(54),h*.47f+D(60),D(20),Color.argb((int)(220*a),74,55,112));txt(c,"Muy pronto!",w/2f,h*.47f+D(38),D(20),Color.WHITE);}
        }
        void coloring(Canvas c){ bg(c);int w=getWidth(),h=getHeight();long n=SystemClock.uptimeMillis();back.set(D(12),D(18),D(62),D(68));circle(c,back.centerX(),back.centerY(),D(24),0xeeffffff);txt(c,"<",back.centerX(),back.centerY()+D(8),D(27),0xff594786);txt(c,"PINTA TU DIBUJO",w/2f,D(52),D(21),0xff594786);sound.set(w-D(62),D(18),w-D(12),D(68));circle(c,sound.centerX(),sound.centerY(),D(24),musicOn?0xff54baff:0xffaab4c5);txt(c,musicOn?"♪":"x",sound.centerX(),sound.centerY()+D(8),D(25),Color.WHITE);
            float top=D(82),bottom=h-D(150);paper.set(D(14),top,w-D(14),bottom);p.setShadowLayer(D(9),0,D(4),0x44444455);rr(c,paper.left,paper.top,paper.right,paper.bottom,D(22),0xfffffff6);p.clearShadowLayer();
            c.save();c.clipRect(paper);p.setColor(0xffe9f8ff);c.drawRect(paper,p);p.setColor(0xffd9f3c2);c.drawRect(paper.left,paper.bottom-paper.height()*.22f,paper.right,paper.bottom,p);for(Line l:lines){brush.setColor(l.col);brush.setStrokeWidth(l.width);c.drawPath(l.path,brush);}c.restore();
            drawDino(c);clear.set(D(18),bottom+D(9),D(88),bottom+D(48));done.set(w-D(112),bottom+D(9),w-D(18),bottom+D(48));rr(c,clear.left,clear.top,clear.right,clear.bottom,D(18),0xeeffffff);txt(c,"BORRAR",clear.centerX(),clear.centerY()+D(5),D(11),0xff645381);rr(c,done.left,done.top,done.right,done.bottom,D(18),0xff41c576);txt(c,"LISTO",done.centerX(),done.centerY()+D(6),D(14),Color.WHITE);
            float py=h-D(55),sx=D(23),step=(w-D(46))/7f;for(int i=0;i<8;i++){float x=sx+i*step;circle(c,x,py,D(color==colors[i]?20:16),Color.WHITE);circle(c,x,py,D(color==colors[i]?16:13),colors[i]);}
            if(n-party<1600){float f=(n-party)/1600f;for(int i=0;i<30;i++){float x=(i*89)%w,y=(f*h+(i*67)%h)%h;star(c,x,y,D(5),colors[i%8]);}if(n-party<900)txt(c,"QUE BONITO!",w/2f,h*.30f,D(28),0xff704dbb);}
        }
        void drawDino(Canvas c){float cx=paper.centerX(),cy=paper.top+paper.height()*.58f;Paint o=new Paint(3);o.setColor(0xff453e52);o.setStyle(Paint.Style.STROKE);o.setStrokeWidth(D(4));o.setStrokeCap(Paint.Cap.ROUND);RectF body=new RectF(cx-paper.width()*.28f,cy-paper.height()*.13f,cx+paper.width()*.22f,cy+paper.height()*.12f);c.drawOval(body,o);RectF head=new RectF(cx+paper.width()*.10f,cy-paper.height()*.27f,cx+paper.width()*.35f,cy-paper.height()*.04f);c.drawOval(head,o);Path tail=new Path();tail.moveTo(body.left,cy);tail.quadTo(cx-paper.width()*.44f,cy-D(6),cx-paper.width()*.40f,cy-paper.height()*.17f);c.drawPath(tail,o);for(int i=0;i<2;i++){float x=cx-paper.width()*.12f+i*paper.width()*.20f;Path leg=new Path();leg.moveTo(x,cy+paper.height()*.08f);leg.lineTo(x-D(4),cy+paper.height()*.20f);leg.lineTo(x+D(20),cy+paper.height()*.20f);c.drawPath(leg,o);}for(int i=0;i<5;i++){float x=body.left+paper.width()*.10f+i*paper.width()*.075f,y=cy-paper.height()*.13f;Path sp=new Path();sp.moveTo(x,y);sp.lineTo(x+D(10),y-D(15));sp.lineTo(x+D(20),y);c.drawPath(sp,o);}circle(c,head.centerX()+D(14),head.centerY()-D(5),D(4),0xff453e52);txt(c,"Pintame como quieras!",paper.centerX(),paper.top+D(34),D(14),0xff66588c);}
        @Override public boolean onTouchEvent(MotionEvent e){float x=e.getX(),y=e.getY();if(e.getAction()==0){if(sound.contains(x,y)){musicOn=!musicOn;if(musicOn)music.start();else music.stop();return true;}if(mode==0){if(play.contains(x,y)){mode=1;lines.clear();return true;}for(RectF r:locks)if(r.contains(x,y)){toast=SystemClock.uptimeMillis();return true;}}else{if(back.contains(x,y)){mode=0;current=null;return true;}if(clear.contains(x,y)){lines.clear();return true;}if(done.contains(x,y)){party=SystemClock.uptimeMillis();return true;}float py=getHeight()-D(55),sx=D(23),step=(getWidth()-D(46))/7f;for(int i=0;i<8;i++)if(Math.hypot(x-(sx+i*step),y-py)<D(27)){color=colors[i];return true;}if(paper.contains(x,y)){current=new Line(color,D(24));current.path.moveTo(x,y);lines.add(current);return true;}}}else if(e.getAction()==2&&current!=null){current.path.lineTo(Math.max(paper.left,Math.min(paper.right,x)),Math.max(paper.top,Math.min(paper.bottom,y)));return true;}else if(e.getAction()==1||e.getAction()==3){current=null;return true;}return true;}
        class Line{Path path=new Path();int col;float width;Line(int c,float w){col=c;width=w;}}
    }

    static class Melody { AudioTrack track; synchronized void start(){if(track!=null)return;try{int sr=22050;double[] notes={523.25,659.25,783.99,880,783.99,659.25,587.33,523.25,659.25,783.99,987.77,880};int len=(int)(sr*.30),total=len*notes.length;short[] pcm=new short[total];for(int n=0;n<notes.length;n++)for(int i=0;i<len;i++){double q=i/(double)len,env=q<.08?q/.08:Math.pow(1-q,1.6),ph=2*Math.PI*notes[n]*i/sr,v=Math.sin(ph)+.2*Math.sin(ph*2);pcm[n*len+i]=(short)(v*env*4300);}track=new AudioTrack.Builder().setAudioAttributes(new AudioAttributes.Builder().setUsage(AudioAttributes.USAGE_GAME).setContentType(AudioAttributes.CONTENT_TYPE_MUSIC).build()).setAudioFormat(new AudioFormat.Builder().setEncoding(AudioFormat.ENCODING_PCM_16BIT).setSampleRate(sr).setChannelMask(AudioFormat.CHANNEL_OUT_MONO).build()).setBufferSizeInBytes(pcm.length*2).setTransferMode(AudioTrack.MODE_STATIC).build();track.write(pcm,0,pcm.length,AudioTrack.WRITE_BLOCKING);track.setLoopPoints(0,pcm.length,-1);track.setVolume(.14f);track.play();}catch(Throwable t){stop();}} synchronized void stop(){if(track!=null){try{track.stop();}catch(Throwable t){}try{track.release();}catch(Throwable t){}track=null;}} }
}
