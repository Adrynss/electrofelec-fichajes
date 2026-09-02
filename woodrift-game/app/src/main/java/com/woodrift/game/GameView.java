package com.woodrift.game;

import android.content.Context;
import android.content.SharedPreferences;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.LinearGradient;
import android.graphics.Paint;
import android.graphics.Path;
import android.graphics.RectF;
import android.graphics.Shader;
import android.graphics.Typeface;
import android.os.Handler;
import android.os.Looper;
import android.view.MotionEvent;
import android.view.View;

import java.util.ArrayList;
import java.util.Random;

public class GameView extends View {
    private static final int BTN_NONE=0, BTN_LEFT=1, BTN_ROTATE=2, BTN_DROP=3, BTN_RIGHT=4;

    private static final int[] WOOD={
            0xfff28c35,0xfff1c849,0xffe86846,0xff5ec6a8,0xff7367d8,0xffe4548f,0xff55a4dc
    };
    private static final int[] LEVEL_BG={
            0xfff5c65f,0xff7ed6c5,0xff9fc9ff,0xffff9d86,0xffc7b3ff,
            0xffffd27e,0xff8fd3a9,0xffffa8c8,0xff8bc8df,0xffd4aa70,
            0xff72c6bc,0xff8ba7ff,0xffff8a7a,0xffcda4ff,0xffffc95c,
            0xff76cf9b,0xffff94bb,0xff76b8d7,0xffd49d64,0xff79c6ad,0xff9ba7f5
    };

    private final Paint p=new Paint(Paint.ANTI_ALIAS_FLAG);
    private final Handler h=new Handler(Looper.getMainLooper());
    private final GameEngine g=new GameEngine();
    private final SharedPreferences prefs;
    private final AudioEngine audio;
    private final Random rnd=new Random();
    private final ArrayList<Particle> particles=new ArrayList<>();
    private final RectF btnLeft=new RectF(),btnRotate=new RectF(),btnDrop=new RectF(),btnRight=new RectF();
    private final RectF boardRect=new RectF(),panelRect=new RectF();

    private int best,pressedButton=BTN_NONE;
    private float cell,left,top,boardBottom,controlsTop,downX,downY,gestureAnchorX;
    private boolean restartTap,boardGesture;

    public GameView(Context c){
        super(c);
        setLayerType(View.LAYER_TYPE_SOFTWARE,null);
        setFocusable(true);
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
        invalidate();
        h.postDelayed(this,16);
    }};

    private final Runnable holdRepeat=new Runnable(){@Override public void run(){
        if(pressedButton==BTN_LEFT||pressedButton==BTN_RIGHT||pressedButton==BTN_DROP){
            performButtonAction(pressedButton);
            h.postDelayed(this, pressedButton==BTN_DROP ? 115 : 72);
        }
    }};

    private void handle(int ev){
        if(ev!=0)audio.event(ev);
        if(g.score>best){best=g.score;prefs.edit().putInt("best",best).apply();}
    }

    private void burstRows(){
        for(int row:g.clearingRows)for(int x=0;x<GameEngine.COLS;x++)for(int i=0;i<5;i++)particles.add(new Particle(x+.5f,row+.5f));
    }

    @Override protected void onSizeChanged(int w,int hgt,int ow,int oh){
        float header=Math.max(92,hgt*.059f);
        float bottom=Math.max(250,hgt*.175f);
        float maxBoardW=w*.755f;
        cell=Math.min(maxBoardW/GameEngine.COLS,(hgt-header-bottom)/GameEngine.ROWS);
        left=w*.018f;
        top=header;
        float bw=GameEngine.COLS*cell,bh=GameEngine.ROWS*cell;
        boardBottom=top+bh;
        boardRect.set(left,top,left+bw,boardBottom);
        float panelLeft=boardRect.right+w*.012f;
        panelRect.set(panelLeft,top,w*.985f,boardBottom);
        controlsTop=boardBottom+Math.max(42,hgt*.028f);
        layoutButtons(w,hgt);
    }

    private void layoutButtons(float w,float hgt){
        float side=w*.032f;
        float bh=Math.min(154,Math.max(104,hgt*.091f));
        float cy=Math.min(hgt-bh*.92f, controlsTop+bh*.92f);
        float outer=w*.295f;
        float mid=w*.185f;
        float gap=w*.016f;
        btnLeft.set(side,cy-bh/2f,side+outer,cy+bh/2f);
        btnRight.set(w-side-outer,cy-bh/2f,w-side,cy+bh/2f);
        float midTotal=mid*2+gap;
        float midStart=(w-midTotal)/2f;
        btnRotate.set(midStart,cy-bh/2f,midStart+mid,cy+bh/2f);
        btnDrop.set(btnRotate.right+gap,cy-bh/2f,btnRotate.right+gap+mid,cy+bh/2f);
    }

    @Override protected void onDraw(Canvas c){
        super.onDraw(c);
        float w=getWidth(),hgt=getHeight();
        drawBackground(c,w,hgt);
        drawHeader(c,w);
        drawBoard(c);
        drawSidePanel(c);
        drawControls(c,w,hgt);
        if(g.gameOver)drawGameOver(c,w,hgt);
    }

    private int levelColor(){return LEVEL_BG[Math.max(0,Math.min(LEVEL_BG.length-1,g.level))];}

    private void drawBackground(Canvas c,float w,float hgt){
        int base=levelColor();
        p.setShader(new LinearGradient(0,0,w,hgt,new int[]{light(base,.28f),base,dark(base,.78f)},null,Shader.TileMode.CLAMP));
        c.drawRect(0,0,w,hgt,p);
        p.setShader(null);
        p.setStyle(Paint.Style.STROKE);
        p.setStrokeWidth(1.6f);
        p.setColor(0x28ffffff);
        for(int i=0;i<15;i++){
            float x=(i*103f)%w;
            Path q=new Path();q.moveTo(x,0);
            for(int y=0;y<hgt;y+=90)q.quadTo(x+10*(float)Math.sin(y*.02+i),y+45,x,y+90);
            c.drawPath(q,p);
        }
        p.setStyle(Paint.Style.FILL);
    }

    private void drawHeader(Canvas c,float w){
        p.setTypeface(Typeface.create(Typeface.DEFAULT,Typeface.BOLD));
        p.setColor(0xff1c2230);
        p.setTextAlign(Paint.Align.LEFT);
        p.setTextSize(Math.max(24,w*.062f));
        c.drawText("WOOD RIFT",w*.045f,Math.max(42,getHeight()*.037f),p);
        p.setTextSize(Math.max(11,w*.025f));
        p.setColor(0xff344052);
        c.drawText("A-TYPE  ·  COLOR GB",w*.047f,Math.max(67,getHeight()*.056f),p);
        p.setTextAlign(Paint.Align.RIGHT);
        p.setTextSize(Math.max(13,w*.032f));
        c.drawText("RÉCORD  "+best,w*.955f,Math.max(42,getHeight()*.037f),p);
        p.setTextSize(Math.max(20,w*.048f));
        c.drawText(audio.isMuted()?"♪×":"♪",w*.955f,Math.max(70,getHeight()*.058f),p);
    }

    private void drawBoard(Canvas c){
        RectF frame=new RectF(boardRect.left-7,boardRect.top-7,boardRect.right+7,boardRect.bottom+7);
        p.setShadowLayer(12,0,6,0x55000000);
        p.setColor(0xff17202c);
        c.drawRoundRect(frame,14,14,p);
        p.clearShadowLayer();
        p.setColor(0xff202936);
        c.drawRect(boardRect,p);
        p.setStyle(Paint.Style.STROKE);
        p.setStrokeWidth(1);
        p.setColor(0x284f677e);
        for(int x=1;x<GameEngine.COLS;x++)c.drawLine(left+x*cell,top,left+x*cell,boardBottom,p);
        for(int y=1;y<GameEngine.ROWS;y++)c.drawLine(left,top+y*cell,boardRect.right,top+y*cell,p);
        p.setStyle(Paint.Style.FILL);

        float flash=g.clearUntil>0?(float)Math.abs(Math.sin(System.currentTimeMillis()*.035)):0;
        for(int y=0;y<GameEngine.ROWS;y++)for(int x=0;x<GameEngine.COLS;x++)if(g.board[y][x]!=0)
            tile(c,x,y,g.board[y][x]-1,false,g.clearingRows.contains(y)?flash:0);

        if(!g.gameOver&&g.clearUntil==0){
            int gy=g.ghostY();
            if(gy!=g.py)for(int[] b:g.cells(g.type,g.rot))ghost(c,g.px+b[0],gy+b[1]);
            for(int[] b:g.cells(g.type,g.rot))tile(c,g.px+b[0],g.py+b[1],g.type,true,0);
        }
        for(Particle q:particles){
            int a=(int)(255*Math.max(0,Math.min(1,q.a)));
            p.setColor((a<<24)|0x00ffffff);
            float x=left+q.x*cell,y=top+q.y*cell,r=Math.max(2.5f,cell*.09f);
            c.drawRect(x-r,y-r,x+r,y+r,p);
        }
    }

    private void drawSidePanel(Canvas c){
        p.setColor(0x55ffffff);
        c.drawRoundRect(panelRect,18,18,p);
        float pad=Math.max(7,panelRect.width()*.065f);
        float x1=panelRect.left+pad,x2=panelRect.right-pad;
        float y=panelRect.top+pad;
        float gap=Math.max(8,panelRect.height()*.014f);
        float boxH=(panelRect.height()-pad*2-gap*3)*.18f;
        drawStatBox(c,x1,y,x2,y+boxH,"SCORE",String.format("%06d",Math.min(999999,g.score))); y+=boxH+gap;
        drawStatBox(c,x1,y,x2,y+boxH,"LEVEL",String.valueOf(g.level)); y+=boxH+gap;
        drawStatBox(c,x1,y,x2,y+boxH,"LINES",String.valueOf(g.lines)); y+=boxH+gap;
        drawNextBox(c,x1,y,x2,panelRect.bottom-pad);
    }

    private void drawStatBox(Canvas c,float l,float t,float r,float b,String label,String value){
        RectF box=new RectF(l,t,r,b);
        p.setColor(0xddf7f7f4);c.drawRoundRect(box,12,12,p);
        p.setStyle(Paint.Style.STROKE);p.setStrokeWidth(2);p.setColor(0xff44566c);c.drawRoundRect(box,12,12,p);p.setStyle(Paint.Style.FILL);
        p.setTextAlign(Paint.Align.CENTER);p.setTypeface(Typeface.DEFAULT_BOLD);p.setColor(0xff35465c);
        p.setTextSize(Math.max(9,box.width()*.095f));c.drawText(label,box.centerX(),t+box.height()*.34f,p);
        p.setTextSize(Math.max(14,box.width()*.18f));p.setColor(0xff121b28);c.drawText(value,box.centerX(),t+box.height()*.78f,p);
    }

    private void drawNextBox(Canvas c,float l,float t,float r,float b){
        RectF box=new RectF(l,t,r,b);
        p.setColor(0xddf7f7f4);c.drawRoundRect(box,12,12,p);
        p.setStyle(Paint.Style.STROKE);p.setStrokeWidth(2);p.setColor(0xff44566c);c.drawRoundRect(box,12,12,p);p.setStyle(Paint.Style.FILL);
        p.setTextAlign(Paint.Align.CENTER);p.setTypeface(Typeface.DEFAULT_BOLD);p.setTextSize(Math.max(9,box.width()*.095f));p.setColor(0xff35465c);c.drawText("NEXT",box.centerX(),t+box.height()*.18f,p);
        float s=Math.max(8,Math.min(cell*.48f,box.width()*.18f));
        mini(c,g.nextType,box.centerX(),t+box.height()*.37f,s);
        p.setTypeface(Typeface.DEFAULT);p.setTextSize(Math.max(8,box.width()*.072f));p.setColor(0xff65738a);
        c.drawText("10 líneas = +1 nivel",box.centerX(),b-box.height()*.12f,p);
    }

    private void tile(Canvas c,int gx,int gy,int type,boolean active,float flash){
        if(gx<0||gx>=GameEngine.COLS||gy<0||gy>=GameEngine.ROWS)return;
        float x=left+gx*cell,y=top+gy*cell,m=Math.max(1.2f,cell*.035f);
        RectF r=new RectF(x+m,y+m,x+cell-m,y+cell-m);
        int base=WOOD[type%WOOD.length];
        int dark=dark(base,active?.58f:.50f),light=light(base,active?.30f:.18f);
        if(flash>0){int a=(int)(150*flash);base=blend(base,Color.WHITE,a);light=blend(light,Color.WHITE,a);}
        p.setShader(new LinearGradient(x,y,x+cell,y+cell,new int[]{light,base,dark},new float[]{0,.58f,1},Shader.TileMode.CLAMP));
        if(active)p.setShadowLayer(cell*.16f,0,cell*.08f,0x88000000);
        c.drawRoundRect(r,cell*.10f,cell*.10f,p);
        p.clearShadowLayer();p.setShader(null);
        p.setStyle(Paint.Style.STROKE);p.setStrokeWidth(Math.max(1.1f,cell*.035f));p.setColor(dark(base,.45f));c.drawRoundRect(r,cell*.10f,cell*.10f,p);
        p.setStrokeWidth(Math.max(.8f,cell*.018f));p.setColor(0x88ffffff);
        c.drawLine(x+cell*.18f,y+cell*.24f,x+cell*.80f,y+cell*.20f,p);
        c.drawLine(x+cell*.23f,y+cell*.66f,x+cell*.74f,y+cell*.59f,p);
        if(flash>0){p.setColor(0xddffffff);p.setStrokeWidth(Math.max(1.5f,cell*.045f));Path q=new Path();q.moveTo(x+cell*.16f,y+cell*.18f);q.lineTo(x+cell*.46f,y+cell*.43f);q.lineTo(x+cell*.34f,y+cell*.67f);q.lineTo(x+cell*.80f,y+cell*.84f);c.drawPath(q,p);}
        p.setStyle(Paint.Style.FILL);
    }

    private void ghost(Canvas c,int gx,int gy){
        if(gx<0||gy<0||gx>=GameEngine.COLS||gy>=GameEngine.ROWS)return;
        float x=left+gx*cell,y=top+gy*cell,m=Math.max(3,cell*.12f);
        p.setStyle(Paint.Style.STROKE);p.setStrokeWidth(Math.max(1.4f,cell*.035f));p.setColor(0x6687a0b9);
        c.drawRoundRect(new RectF(x+m,y+m,x+cell-m,y+cell-m),cell*.08f,cell*.08f,p);p.setStyle(Paint.Style.FILL);
    }

    private void mini(Canvas c,int type,float cx,float y,float s){
        int[][] cs=g.cells(type,0);int maxX=0,maxY=0;
        for(int[] b:cs){maxX=Math.max(maxX,b[0]);maxY=Math.max(maxY,b[1]);}
        float l=cx-(maxX+1)*s/2f;
        float startY=y-(maxY+1)*s/2f;
        for(int[] b:cs){
            p.setColor(WOOD[type%WOOD.length]);
            c.drawRoundRect(new RectF(l+b[0]*s+1,startY+b[1]*s+1,l+(b[0]+1)*s-1,startY+(b[1]+1)*s-1),Math.max(2,s*.1f),Math.max(2,s*.1f),p);
        }
    }

    private void drawControls(Canvas c,float w,float hgt){
        button(c,btnLeft,"◀","LEFT",pressedButton==BTN_LEFT,0xffe7edf7);
        button(c,btnRotate,"↻","ROTATE",pressedButton==BTN_ROTATE,0xffffcf59);
        button(c,btnDrop,"▼","FAST",pressedButton==BTN_DROP,0xffff7058);
        button(c,btnRight,"▶","RIGHT",pressedButton==BTN_RIGHT,0xffe7edf7);
        p.setTextAlign(Paint.Align.CENTER);p.setTypeface(Typeface.DEFAULT);p.setTextSize(Math.max(10,w*.024f));p.setColor(0xff253344);
        c.drawText("Mantén ▼ para bajar rápido · suelta para frenar",w/2f,Math.min(hgt-16,btnLeft.bottom+Math.max(30,hgt*.02f)),p);
    }

    private void button(Canvas c,RectF r,String symbol,String label,boolean pressed,int fill){
        p.setColor(pressed?dark(fill,.84f):fill);p.setShadowLayer(8,0,4,0x55000000);c.drawRoundRect(r,26,26,p);p.clearShadowLayer();
        p.setStyle(Paint.Style.STROKE);p.setStrokeWidth(2.4f);p.setColor(0xff28384d);c.drawRoundRect(r,26,26,p);p.setStyle(Paint.Style.FILL);
        p.setColor(0xff1d2836);p.setTypeface(Typeface.DEFAULT_BOLD);p.setTextAlign(Paint.Align.CENTER);p.setTextSize(r.height()*.43f);c.drawText(symbol,r.centerX(),r.centerY()+r.height()*.04f,p);
        p.setTypeface(Typeface.DEFAULT);p.setTextSize(Math.max(9,r.height()*.15f));c.drawText(label,r.centerX(),r.bottom-r.height()*.11f,p);
    }

    private void drawGameOver(Canvas c,float w,float hgt){
        p.setColor(0xd91a2230);c.drawRect(0,0,w,hgt,p);
        p.setTextAlign(Paint.Align.CENTER);p.setTypeface(Typeface.DEFAULT_BOLD);p.setColor(Color.WHITE);p.setTextSize(w*.083f);c.drawText("GAME OVER",w/2f,hgt*.42f,p);
        p.setTextSize(w*.042f);c.drawText("SCORE "+g.score+"  ·  LEVEL "+g.level+"  ·  LINES "+g.lines,w/2f,hgt*.49f,p);
        p.setTextSize(w*.033f);p.setColor(0xffd8e3f1);c.drawText("Toca para volver a jugar",w/2f,hgt*.56f,p);
    }

    @Override public boolean onTouchEvent(MotionEvent e){
        float x=e.getX(),y=e.getY();
        switch(e.getActionMasked()){
            case MotionEvent.ACTION_DOWN:
                downX=x;downY=y;gestureAnchorX=x;restartTap=false;boardGesture=false;pressedButton=BTN_NONE;
                if(g.gameOver){g.reset(System.currentTimeMillis());particles.clear();audio.restart();restartTap=true;invalidate();return true;}
                if(x>getWidth()*.82f&&y<top){audio.setMuted(!audio.isMuted());prefs.edit().putBoolean("muted",audio.isMuted()).apply();invalidate();return true;}
                int hit=hitButton(x,y);
                if(hit!=BTN_NONE){
                    pressedButton=hit;
                    performButtonAction(hit);
                    if(hit==BTN_LEFT||hit==BTN_RIGHT)h.postDelayed(holdRepeat,215);
                    else if(hit==BTN_DROP)h.postDelayed(holdRepeat,210);
                    invalidate();
                    return true;
                }
                if(boardRect.contains(x,y)){boardGesture=true;return true;}
                return true;

            case MotionEvent.ACTION_MOVE:
                if(pressedButton!=BTN_NONE)return true;
                if(boardGesture){
                    float dx=x-gestureAnchorX,step=Math.max(24,cell*.56f);
                    while(dx>=step){performBoardEvent(g.move(1));gestureAnchorX+=step;dx-=step;}
                    while(dx<=-step){performBoardEvent(g.move(-1));gestureAnchorX-=step;dx+=step;}
                }
                return true;

            case MotionEvent.ACTION_UP:
                h.removeCallbacks(holdRepeat);
                if(restartTap){restartTap=false;return true;}
                if(pressedButton!=BTN_NONE){pressedButton=BTN_NONE;invalidate();return true;}
                if(boardGesture){
                    float dx=x-downX,dy=y-downY;
                    if(dy>Math.max(80,cell*1.25f)&&dy>Math.abs(dx)){
                        int ev=0;int steps=Math.max(1,Math.min(4,(int)(dy/Math.max(24,cell*.62f))));
                        for(int i=0;i<steps;i++)ev|=g.softDrop(System.currentTimeMillis());
                        performBoardEvent(ev);
                    } else if(Math.abs(dx)<Math.max(18,cell*.35f)&&Math.abs(dy)<Math.max(18,cell*.35f)){
                        performBoardEvent(g.rotate());
                    }
                }
                boardGesture=false;invalidate();return true;

            case MotionEvent.ACTION_CANCEL:
                h.removeCallbacks(holdRepeat);pressedButton=BTN_NONE;boardGesture=false;invalidate();return true;
        }
        return true;
    }

    private void performButtonAction(int button){
        int ev=0;long now=System.currentTimeMillis();
        if(button==BTN_LEFT)ev=g.move(-1);
        else if(button==BTN_RIGHT)ev=g.move(1);
        else if(button==BTN_ROTATE)ev=g.rotate();
        else if(button==BTN_DROP)ev=g.softDrop(now);
        performBoardEvent(ev);
    }

    private void performBoardEvent(int ev){
        if((ev&GameEngine.EV_CLEAR)!=0)burstRows();
        handle(ev);invalidate();
    }

    private int hitButton(float x,float y){
        if(btnLeft.contains(x,y))return BTN_LEFT;
        if(btnRotate.contains(x,y))return BTN_ROTATE;
        if(btnDrop.contains(x,y))return BTN_DROP;
        if(btnRight.contains(x,y))return BTN_RIGHT;
        return BTN_NONE;
    }

    private int dark(int c,float f){return Color.argb(Color.alpha(c),(int)(Color.red(c)*f),(int)(Color.green(c)*f),(int)(Color.blue(c)*f));}
    private int light(int c,float a){return Color.argb(Color.alpha(c),(int)(Color.red(c)+(255-Color.red(c))*a),(int)(Color.green(c)+(255-Color.green(c))*a),(int)(Color.blue(c)+(255-Color.blue(c))*a));}
    private int blend(int a,int b,int ab){float t=Math.max(0,Math.min(1,ab/255f));return Color.rgb((int)(Color.red(a)*(1-t)+Color.red(b)*t),(int)(Color.green(a)*(1-t)+Color.green(b)*t),(int)(Color.blue(a)*(1-t)+Color.blue(b)*t));}

    @Override protected void onDetachedFromWindow(){super.onDetachedFromWindow();h.removeCallbacks(frame);h.removeCallbacks(holdRepeat);audio.release();}
    private class Particle{float x,y,vx,vy,a=1;Particle(float x,float y){this.x=x;this.y=y;vx=(rnd.nextFloat()-.5f)*.25f;vy=(rnd.nextFloat()-.88f)*.23f;}boolean tick(){x+=vx;y+=vy;vy+=.011f;a-=.035f;return a>0;}}
}
