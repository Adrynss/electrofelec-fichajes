package com.woodrift.game;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Random;

final class GameEngine {
    static final int COLS = 10, ROWS = 18;
    static final int EV_MOVE=1, EV_ROTATE=2, EV_LOCK=4, EV_CLEAR=8, EV_LEVEL=16, EV_DROP=32, EV_GAMEOVER=64;
    final int[][] board = new int[ROWS][COLS];
    final ArrayList<Integer> clearingRows = new ArrayList<>();
    private final ArrayList<Integer> bag = new ArrayList<>();
    private final Random rnd = new Random();

    int type, nextType, rot, px, py, score, lines, level=0;
    boolean gameOver;
    long clearUntil, lastDrop;

    private static final int SOFT_DROP_SCORE = 1;
    private static final int HARD_DROP_PER_CELL = 1;

    private static final int[][][] BASE = {
            {{0,0},{1,0},{2,0},{3,0}},
            {{0,0},{1,0},{0,1},{1,1}},
            {{0,0},{1,0},{2,0},{1,1}},
            {{1,0},{2,0},{0,1},{1,1}},
            {{0,0},{1,0},{1,1},{2,1}},
            {{0,0},{0,1},{1,1},{2,1}},
            {{2,0},{0,1},{1,1},{2,1}}
    };

    void reset(long now) {
        for (int y=0;y<ROWS;y++) for (int x=0;x<COLS;x++) board[y][x]=0;
        bag.clear();
        clearingRows.clear();
        score=0;
        lines=0;
        level=0;
        gameOver=false;
        clearUntil=0;
        nextType=take();
        spawn();
        lastDrop=now;
    }

    int update(long now) {
        if (gameOver) return 0;
        if (clearUntil>0) {
            if (now>=clearUntil) return finishClear(now);
            return 0;
        }
        if (now-lastDrop>=speed(level)) {
            lastDrop=now;
            return down(false,now);
        }
        return 0;
    }

    int move(int dx) {
        if (blocked()) return 0;
        if (!collides(px+dx,py,type,rot)) {
            px+=dx;
            return EV_MOVE;
        }
        return 0;
    }

    int rotate() {
        if (blocked()) return 0;
        int nr=(rot+1)&3;
        int[] kicks={0,-1,1,-2,2};
        for(int k:kicks) if(!collides(px+k,py,type,nr)){px+=k;rot=nr;return EV_ROTATE;}
        for(int k:new int[]{0,-1,1}) if(!collides(px+k,py-1,type,nr)){px+=k;py--;rot=nr;return EV_ROTATE;}
        return 0;
    }

    int softDrop(long now) { return blocked()?0:down(true,now); }

    int hardDrop(long now) {
        if (blocked()) return 0;
        int d=0;
        while(!collides(px,py+1,type,rot)){py++;d++;}
        score+=d*HARD_DROP_PER_CELL;
        return EV_DROP | lock(now);
    }

    private int down(boolean manual,long now) {
        if(!collides(px,py+1,type,rot)){
            py++;
            if(manual) score+=SOFT_DROP_SCORE;
            return 0;
        }
        return lock(now);
    }

    private int lock(long now) {
        for(int[] b:cells(type,rot)){
            int x=px+b[0], y=py+b[1];
            if(y<0){gameOver=true;return EV_GAMEOVER;}
            if(x>=0&&x<COLS&&y<ROWS) board[y][x]=type+1;
        }

        clearingRows.clear();
        for(int y=0;y<ROWS;y++){
            boolean full=true;
            for(int x=0;x<COLS;x++) if(board[y][x]==0){full=false;break;}
            if(full) clearingRows.add(y);
        }
        if(clearingRows.isEmpty()){
            if(!spawn()){gameOver=true;return EV_LOCK|EV_GAMEOVER;}
            lastDrop=now;
            return EV_LOCK;
        }
        clearUntil=now+260;
        return EV_LOCK|EV_CLEAR;
    }

    private int finishClear(long now) {
        int count=clearingRows.size();
        boolean[] rem=new boolean[ROWS];
        for(int r:clearingRows) rem[r]=true;
        int write=ROWS-1;
        for(int read=ROWS-1;read>=0;read--){
            if(rem[read]) continue;
            if(write!=read) System.arraycopy(board[read],0,board[write],0,COLS);
            write--;
        }
        while(write>=0){for(int x=0;x<COLS;x++)board[write][x]=0;write--;}
        int old=level;
        int[] pts={0,40,100,300,1200};
        score+=pts[Math.min(4,count)]*(level+1);
        lines+=count;
        level=Math.min(20, lines/10);
        clearingRows.clear();
        clearUntil=0;
        int ev=0;
        if(level>old) ev|=EV_LEVEL;
        if(!spawn()){gameOver=true;ev|=EV_GAMEOVER;}
        lastDrop=now;
        return ev;
    }

    private boolean spawn() {
        type=nextType;
        nextType=take();
        rot=0;
        px=3;
        py=0;
        return !collides(px,py,type,rot);
    }

    private int take() {
        if(bag.isEmpty()){
            for(int i=0;i<7;i++) bag.add(i);
            Collections.shuffle(bag,rnd);
        }
        return bag.remove(0);
    }

    boolean blocked(){return gameOver||clearUntil>0;}

    int ghostY(){int y=py;while(!collides(px,y+1,type,rot))y++;return y;}

    boolean collides(int x0,int y0,int t,int r){
        for(int[] b:cells(t,r)){
            int x=x0+b[0],y=y0+b[1];
            if(x<0||x>=COLS||y>=ROWS) return true;
            if(y>=0&&board[y][x]!=0) return true;
        }
        return false;
    }

    int[][] cells(int t,int r){
        int[][] src=BASE[t],out=new int[4][2];
        for(int i=0;i<4;i++){
            int x=src[i][0],y=src[i][1];
            if(t!=1) for(int k=0;k<(r&3);k++){int nx=-y,ny=x;x=nx;y=ny;}
            out[i][0]=x;out[i][1]=y;
        }
        int mx=99,my=99;
        for(int[] c:out){mx=Math.min(mx,c[0]);my=Math.min(my,c[1]);}
        for(int[] c:out){c[0]-=mx;c[1]-=my;}
        return out;
    }

    int linesToNextLevel(){
        return 10 - (lines % 10 == 0 ? 0 : lines % 10);
    }

    private int speed(int lvl){
        int[] s={887,820,753,686,619,552,469,368,285,184,167,151,134,117,100,100,84,84,67,67,50};
        return s[Math.max(0,Math.min(s.length-1,lvl))];
    }
}
