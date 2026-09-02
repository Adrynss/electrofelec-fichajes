package com.woodrift.game;

import android.content.Context;
import android.content.SharedPreferences;
import android.graphics.*;
import android.os.Handler;
import android.os.Looper;
import android.view.MotionEvent;
import android.view.View;
import java.util.ArrayList;
import java.util.Random;

public class GameView extends View {
    private final Paint p=new Paint(Paint.ANTI_ALIAS_FLAG);
    private final Handler h=new Handler(Looper.getMainLooper());
    private final GameEngine g=new GameEngine();
    private final SharedPreferences prefs;
    private final AudioEngine audio;
    private final Random rnd=new Random();
    private final ArrayList<Particle> particles=new ArrayList<>();
    private int best;
    private float cell,left,top,controlsTop,downX,downY;
    private boolean restartTap;
    private static final int[] WOOD={0xffb76b33,0xffd19652,0xffa55b31,0xffc67b3e,0xff8d4a2b,0xffd6a263,0xff9f6039};

    public GameView(Context c){
        super(c);setLayerType(View.LAYER_TYPE_SOFTWARE,null);setFocusable(true);
        prefs=c.getSharedPreferences("woodrift_tetris",Context.MODE_PRIVATE);
        best=prefs.getInt("best",0);
        audio=new AudioEngine(prefs.getBoolean("muted",false));
        g.reset(System.currentTimeMillis());
        h.post(frame);
    }

    private final Runnable frame=new Runnable(){@Override public void run(){
        int ev=g.update(System.currentTimeMillis());
        if((ev&GameEngine.EV_CLEAR)!=0)burstRows();
        handle(ev);
        for(int i=particles.size()-1;i>=0;i--)if(!particles.get(i).tick())particles.remove(i);
        invalidate();h.postDelayed(this,16);
    }};

    private void handle(int ev){
        if(ev!=0)audio.event(ev);
        if(g.score>best){best=g.score;prefs.edit().putInt("best",best).apply();}
    }

    private void burstRows(){for(int row:g.clearingRows)for(int x=0;x<GameEngine.COLS;x++)for(int i=0;i<4;i++)particles.add(new Particle(x+.5f,row+.5f));}

    @Override protected void onSizeChanged(int w,int hgt,int ow,int oh){
        float head=Math.max(145,hgt*.09f),bottom=Math.max(170,hgt*.115f);
        cell=Math.min(w*.88f/GameEngine.COLS,(hgt-head-bottom)/GameEngine.ROWS);
        left=(w-GameEngine.COLS*cell)/2f;top=head;controlsTop=top+GameEngine.ROWS*cell+Math.max(16,hgt*.012f);
    }

    @Override protected void onDraw(Canvas c){super.onDraw(c);float w=getWidth(),hgt=getHeight();drawBg(c,w,hgt);drawHud(c,w);drawBoard(c);drawControls(c,w,hgt);if(g.gameOver)drawGameOver(c,w,hgt);}

    private void drawBg(Canvas c,float w,float hgt){
        p.setShader(new LinearGradient(0,0,w,hgt,new int[]{0xfff4d8a6,0xffffebc1,0xffe6bd7d},null,Shader.TileMode.CLAMP));c.drawRect(0,0,w,hgt,p);p.setShader(null);
        p.setStyle(Paint.Style.STROKE);p.setStrokeWidth(1.4f);p.setColor(0x25a96f3e);
        for(int i=0;i<20;i++){float x=(i*83f)%w;Path q=new Path();q.moveTo(x,0);for(int y=0;y<hgt;y+=70)q.quadTo(x+11*(float)Math.sin(y*.025+i),y+34,x,y+70);c.drawPath(q,p);}p.setStyle(Paint.Style.FILL);
    }

    private void drawHud(Canvas c,float w){
        p.setTypeface(Typeface.DEFAULT_BOLD);p.setTextAlign(Paint.Align.LEFT);p.setColor(0xff402417);p.setTextSize(Math.max(22,w*.058f));c.drawText("WOOD RIFT",w*.055f,Math.max(44,getHeight()*.038f),p);
        p.setTextSize(Math.max(13,w*.031f));p.setColor(0xff6c432b);float y=Math.max(73,getHeight()*.060f);c.drawText("PUNTOS  "+g.score,w*.055f,y,p);c.drawText("NIVEL  "+g.level,w*.36f,y,p);c.drawText("LÍNEAS  "+g.lines,w*.58f,y,p);
        p.setTextAlign(Paint.Align.RIGHT);c.drawText("RÉCORD  "+best,w*.945f,Math.max(44,getHeight()*.038f),p);p.setTextSize(Math.max(20,w*.05f));c.drawText(audio.isMuted()?"♪×":"♪",w*.945f,y+2,p);
        p.setTextAlign(Paint.Align.CENTER);p.setTextSize(Math.max(11,w*.026f));p.setColor(0xff815a40);c.drawText("SIG.",w*.86f,top-18,p);mini(c,g.nextType,w*.86f,top-8,Math.max(7,cell*.20f));
    }

    private void drawBoard(Canvas c){
        float bw=GameEngine.COLS*cell,bh=GameEngine.ROWS*cell;RectF out=new RectF(left-7,top-7,left+bw+7,top+bh+7);p.setShadowLayer(12,0,5,0x66000000);p.setColor(0xff3e2419);c.drawRoundRect(out,12,12,p);p.clearShadowLayer();p.setColor(0xff17110d);c.drawRect(left,top,left+bw,top+bh,p);
        p.setStyle(Paint.Style.STROKE);p.setStrokeWidth(1);p.setColor(0x284f382a);for(int x=1;x<GameEngine.COLS;x++)c.drawLine(left+x*cell,top,left+x*cell,top+bh,p);for(int y=1;y<GameEngine.ROWS;y++)c.drawLine(left,top+y*cell,left+bw,top+y*cell,p);p.setStyle(Paint.Style.FILL);
        float flash=g.clearUntil>0?(float)Math.abs(Math.sin(System.currentTimeMillis()*.035)):0;
        for(int y=0;y<GameEngine.ROWS;y++)for(int x=0;x<GameEngine.COLS;x++)if(g.board[y][x]!=0)tile(c,x,y,g.board[y][x]-1,false,g.clearingRows.contains(y)?flash:0);
        if(!g.gameOver&&g.clearUntil==0){int gy=g.ghostY();if(gy!=g.py)for(int[] b:g.cells(g.type,g.rot))ghost(c,g.px+b[0],gy+b[1]);for(int[] b:g.cells(g.type,g.rot))tile(c,g.px+b[0],g.py+b[1],g.type,true,0);}
        for(Particle q:particles){int a=(int)(255*Math.max(0,Math.min(1,q.a)));p.setColor((a<<24)|0x00c67a3c);float x=left+q.x*cell,y=top+q.y*cell,r=Math.max(2.5f,cell*.08f);c.drawRect(x-r,y-r,x+r,y+r,p);}
    }

    private void tile(Canvas c,int gx,int gy,int type,boolean active,float flash){
        if(gx<0||gx>=GameEngine.COLS||gy<0||gy>=GameEngine.ROWS)return;float x=left+gx*cell,y=top+gy*cell,m=Math.max(1.4f,cell*.035f);RectF r=new RectF(x+m,y+m,x+cell-m,y+cell-m);
        int base=WOOD[type%7],dark=dark(base,active?.60f:.52f),light=light(base,active?.22f:.12f);if(flash>0){int a=(int)(130*flash);base=blend(base,Color.WHITE,a);light=blend(light,Color.WHITE,a);}p.setShader(new LinearGradient(x,y,x+cell,y+cell,new int[]{light,base,dark},new float[]{0,.55f,1},Shader.TileMode.CLAMP));if(active)p.setShadowLayer(cell*.14f,0,cell*.09f,0x77000000);c.drawRoundRect(r,cell*.08f,cell*.08f,p);p.clearShadowLayer();p.setShader(null);
        p.setStyle(Paint.Style.STROKE);p.setStrokeWidth(Math.max(1.2f,cell*.035f));p.setColor(dark(base,.48f));c.drawRoundRect(r,cell*.08f,cell*.08f,p);p.setStrokeWidth(Math.max(.8f,cell*.018f));p.setColor(0x66ffe2b8);c.drawLine(x+cell*.18f,y+cell*.28f,x+cell*.82f,y+cell*.23f,p);c.drawLine(x+cell*.23f,y+cell*.68f,x+cell*.75f,y+cell*.61f,p);
        if(flash>0){p.setColor(0xcc3f1d12);p.setStrokeWidth(Math.max(1.5f,cell*.045f));Path q=new Path();q.moveTo(x+cell*.18f,y+cell*.18f);q.lineTo(x+cell*.46f,y+cell*.43f);q.lineTo(x+cell*.34f,y+cell*.66f);q.lineTo(x+cell*.78f,y+cell*.84f);c.drawPath(q,p);}p.setStyle(Paint.Style.FILL);
    }

    private void ghost(Canvas c,int gx,int gy){if(gx<0||gy<0||gx>=GameEngine.COLS||gy>=GameEngine.ROWS)return;float x=left+gx*cell,y=top+gy*cell,m=Math.max(3,cell*.12f);p.setStyle(Paint.Style.STROKE);p.setStrokeWidth(Math.max(1.4f,cell*.035f));p.setColor(0x557f5b43);c.drawRoundRect(new RectF(x+m,y+m,x+cell-m,y+cell-m),cell*.06f,cell*.06f,p);p.setStyle(Paint.Style.FILL);}

    private void mini(Canvas c,int type,float cx,float y,float s){int[][] cs=g.cells(type,0);int max=0;for(int[] b:cs)max=Math.max(max,b[0]);float l=cx-(max+1)*s/2;for(int[] b:cs){p.setColor(WOOD[type]);c.drawRoundRect(new RectF(l+b[0]*s+1,y+b[1]*s+1,l+(b[0]+1)*s-1,y+(b[1]+1)*s-1),2,2,p);}}

    private void drawControls(Canvas c,float w,float hgt){float gap=w*.035f,bw=(w-gap*5)/4,bh=Math.min(92,Math.max(58,hgt*.058f)),cy=controlsTop+bh*.55f;button(c,gap,cy,bw,bh,"◀");button(c,gap*2+bw,cy,bw,bh,"↻");button(c,gap*3+bw*2,cy,bw,bh,"▶");button(c,gap*4+bw*3,cy,bw,bh,"▼");p.setTextAlign(Paint.Align.CENTER);p.setTypeface(Typeface.DEFAULT);p.setTextSize(Math.max(11,w*.027f));p.setColor(0xff76513a);c.drawText("Desliza hacia abajo = caída rápida",w/2,Math.min(hgt-14,cy+bh*.78f),p);}

    private void button(Canvas c,float x,float cy,float bw,float bh,String s){RectF r=new RectF(x,cy-bh/2,x+bw,cy+bh/2);p.setColor(0xdffff0cf);p.setShadowLayer(7,0,3,0x44000000);c.drawRoundRect(r,18,18,p);p.clearShadowLayer();p.setStyle(Paint.Style.STROKE);p.setStrokeWidth(2);p.setColor(0xff8b5a35);c.drawRoundRect(r,18,18,p);p.setStyle(Paint.Style.FILL);p.setColor(0xff422518);p.setTypeface(Typeface.DEFAULT_BOLD);p.setTextAlign(Paint.Align.CENTER);p.setTextSize(bh*.46f);c.drawText(s,x+bw/2,cy+bh*.16f,p);}

    private void drawGameOver(Canvas c,float w,float hgt){p.setColor(0xc81d120d);c.drawRect(0,0,w,hgt,p);p.setTextAlign(Paint.Align.CENTER);p.setTypeface(Typeface.DEFAULT_BOLD);p.setColor(0xffffe7bd);p.setTextSize(w*.088f);c.drawText("FIN DE PARTIDA",w/2,hgt*.42f,p);p.setTextSize(w*.043f);c.drawText("Puntos "+g.score+"  ·  Nivel "+g.level+"  ·  Líneas "+g.lines,w/2,hgt*.485f,p);p.setTextSize(w*.035f);c.drawText("Toca para volver a jugar",w/2,hgt*.555f,p);}

    @Override public boolean onTouchEvent(MotionEvent e){float w=getWidth();if(e.getAction()==MotionEvent.ACTION_DOWN){downX=e.getX();downY=e.getY();restartTap=false;if(g.gameOver){g.reset(System.currentTimeMillis());particles.clear();audio.restart();restartTap=true;invalidate();return true;}if(downX>w*.78f&&downY<top){audio.setMuted(!audio.isMuted());prefs.edit().putBoolean("muted",audio.isMuted()).apply();return true;}return true;}if(e.getAction()==MotionEvent.ACTION_UP){if(restartTap){restartTap=false;return true;}float dx=e.getX()-downX,dy=e.getY()-downY;int ev=0;if(dy>Math.max(80,cell*1.4f))ev=g.hardDrop(System.currentTimeMillis());else if(Math.abs(dx)>Math.max(55,cell*.9f)){int n=Math.max(1,Math.min(4,(int)(Math.abs(dx)/Math.max(1,cell)))),dir=dx>0?1:-1;for(int i=0;i<n;i++)ev|=g.move(dir);}else if(downY>=controlsTop-20){float gap=w*.035f,bw=(w-gap*5)/4;int i=(int)((downX-gap)/Math.max(1,bw+gap));if(i<=0)ev=g.move(-1);else if(i==1)ev=g.rotate();else if(i==2)ev=g.move(1);else ev=g.softDrop(System.currentTimeMillis());}else if(downY>=top)ev=g.rotate();if((ev&GameEngine.EV_CLEAR)!=0)burstRows();handle(ev);invalidate();return true;}return true;}

    private int dark(int c,float f){return Color.argb(Color.alpha(c),(int)(Color.red(c)*f),(int)(Color.green(c)*f),(int)(Color.blue(c)*f));}
    private int light(int c,float a){return Color.argb(Color.alpha(c),(int)(Color.red(c)+(255-Color.red(c))*a),(int)(Color.green(c)+(255-Color.green(c))*a),(int)(Color.blue(c)+(255-Color.blue(c))*a));}
    private int blend(int a,int b,int ab){float t=Math.max(0,Math.min(1,ab/255f));return Color.rgb((int)(Color.red(a)*(1-t)+Color.red(b)*t),(int)(Color.green(a)*(1-t)+Color.green(b)*t),(int)(Color.blue(a)*(1-t)+Color.blue(b)*t));}

    @Override protected void onDetachedFromWindow(){super.onDetachedFromWindow();h.removeCallbacks(frame);audio.release();}
    private class Particle{float x,y,vx,vy,a=1;Particle(float x,float y){this.x=x;this.y=y;vx=(rnd.nextFloat()-.5f)*.24f;vy=(rnd.nextFloat()-.85f)*.22f;}boolean tick(){x+=vx;y+=vy;vy+=.010f;a-=.035f;return a>0;}}
}
