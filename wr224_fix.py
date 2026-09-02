from pathlib import Path
import re

engine = Path('woodrift-game/app/src/main/java/com/woodrift/game/GameEngine.java')
s = engine.read_text()
old = '''        for(int[] b:cells(type,rot)){
            int x=px+b[0], y=py+b[1];
            if(y<0){gameOver=true;return EV_GAMEOVER;}
            if(x>=0&&x<COLS&&y<ROWS) board[y][x]=type+1;
        }
        clearingRows.clear();'''
new = '''        for(int[] b:cells(type,rot)){
            int x=px+b[0], y=py+b[1];
            if(y<0){gameOver=true;return EV_GAMEOVER;}
            if(x>=0&&x<COLS&&y<ROWS) board[y][x]=type+1;
        }
        // Restore the scoring behavior agreed for this version.
        score += 4;
        clearingRows.clear();'''
if old not in s:
    raise SystemExit('GameEngine lock block not found')
s = s.replace(old, new, 1)
engine.write_text(s)

view = Path('woodrift-game/app/src/main/java/com/woodrift/game/GameView.java')
s = view.read_text()
layout = '''    private void layoutControls(){
        float dw=deckRect.width(), dh=deckRect.height();
        float controlCy=deckRect.centerY()-dh*.025f;

        float dpadSize=Math.min(dw*.34f,dh*.64f);
        float cx=deckRect.left+dw*.245f;
        float cy=controlCy;
        float dx=cx-dpadSize/2f, dy=cy-dpadSize/2f;
        float thick=dpadSize*.34f, half=thick/2f;
        dCenter.set(cx-half,cy-half,cx+half,cy+half);
        dUp.set(cx-half,dy,cx+half,cy-half*.45f);
        dDown.set(cx-half,cy+half*.45f,cx+half,dy+dpadSize);
        dLeft.set(dx,cy-half,cx-half*.45f,cy+half);
        dRight.set(cx+half*.45f,cy-half,dx+dpadSize,cy+half);

        float r=Math.min(dh*.175f,dw*.092f);
        float groupCx=deckRect.left+dw*.735f;
        float gap=r*.62f;
        float ax=groupCx-r-gap/2f;
        float bx=groupCx+r+gap/2f;
        float by=controlCy;
        aButton.set(ax-r,by-r,ax+r,by+r);
        bButton.set(bx-r,by-r,bx+r,by+r);
    }
'''
s, n = re.subn(r'    private void layoutControls\(\)\{.*?\n    \}\n\n    @Override protected void onDraw', layout + '\n    @Override protected void onDraw', s, count=1, flags=re.S)
if n != 1:
    raise SystemExit('GameView layoutControls block not found')
s = s.replace(
    'p.setTextSize(Math.max(10,rr.width()*.13f));p.setColor(0xff34343a);c.drawText(label,rr.centerX(),rr.bottom+rr.height()*.25f,p);',
    'p.setTextSize(Math.max(10,rr.width()*.13f));p.setColor(0xffeef5fb);c.drawText(label,rr.centerX(),rr.bottom+rr.height()*.25f,p);'
)
view.write_text(s)

gradle = Path('woodrift-game/app/build.gradle')
s = gradle.read_text()
s = re.sub(r'versionCode\s+\d+', 'versionCode 13', s)
s = re.sub(r"versionName\s+'[^']+'", "versionName '2.2.4'", s)
gradle.write_text(s)

print('Wood Rift 2.2.4 fixes applied')
