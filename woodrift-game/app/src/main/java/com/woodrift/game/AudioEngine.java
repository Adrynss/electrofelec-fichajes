package com.woodrift.game;

import android.media.AudioAttributes;
import android.media.AudioFormat;
import android.media.AudioManager;
import android.media.AudioTrack;
import android.media.ToneGenerator;
import android.os.Handler;
import android.os.Looper;

final class AudioEngine {
    private final Handler h=new Handler(Looper.getMainLooper());
    private final ToneGenerator tone=new ToneGenerator(AudioManager.STREAM_MUSIC,58);
    private AudioTrack music;
    private boolean muted;

    AudioEngine(boolean muted){this.muted=muted;buildMusic();if(!muted)startMusic();}

    void setMuted(boolean m){muted=m;if(m)pauseMusic();else startMusic();}
    boolean isMuted(){return muted;}

    void event(int ev){
        if(muted)return;
        if((ev&GameEngine.EV_GAMEOVER)!=0){pauseMusic();tone.startTone(ToneGenerator.TONE_CDMA_ABBR_ALERT,420);return;}
        if((ev&GameEngine.EV_LEVEL)!=0){seq(new int[]{ToneGenerator.TONE_DTMF_4,ToneGenerator.TONE_DTMF_8,ToneGenerator.TONE_DTMF_A},new int[]{70,80,150});return;}
        if((ev&GameEngine.EV_CLEAR)!=0){seq(new int[]{ToneGenerator.TONE_DTMF_2,ToneGenerator.TONE_DTMF_6,ToneGenerator.TONE_DTMF_B},new int[]{60,70,120});return;}
        if((ev&GameEngine.EV_DROP)!=0){tone.startTone(ToneGenerator.TONE_PROP_NACK,75);return;}
        if((ev&GameEngine.EV_ROTATE)!=0){tone.startTone(ToneGenerator.TONE_DTMF_9,45);return;}
        if((ev&GameEngine.EV_MOVE)!=0){tone.startTone(ToneGenerator.TONE_DTMF_1,28);return;}
        if((ev&GameEngine.EV_LOCK)!=0)tone.startTone(ToneGenerator.TONE_PROP_BEEP2,45);
    }

    void restart(){if(!muted)startMusic();}

    private void seq(int[] tones,int[] ms){
        int delay=0;
        for(int i=0;i<tones.length;i++){
            final int t=tones[i],d=ms[i];
            h.postDelayed(()->{if(!muted)tone.startTone(t,d);},delay);
            delay+=d+18;
        }
    }

    private void buildMusic(){
        try{
            final int sr=16000;
            int[] midi={64,67,69,71,69,67,74,71,64,67,69,72,71,69,67,67,62,65,67,69,67,65,72,69,62,65,67,71,69,67,64,64};
            int beatSamples=(int)(sr*.20f);
            short[] pcm=new short[midi.length*beatSamples];
            for(int n=0;n<midi.length;n++){
                double f=440.0*Math.pow(2.0,(midi[n]-69)/12.0);
                double bass=f/2.0;
                for(int i=0;i<beatSamples;i++){
                    double t=i/(double)sr;
                    double env=Math.min(1.0,i/(sr*.012))*Math.min(1.0,(beatSamples-i)/(sr*.045));
                    double sq=Math.sin(2*Math.PI*f*t)>=0?1:-1;
                    double tri=2*Math.abs(2*((bass*t)%1)-1)-1;
                    double tick=(i<110&&n%2==0)?(1.0-i/110.0)*(n%4==0?.16:.08):0;
                    pcm[n*beatSamples+i]=(short)(32767*(.115*sq+.055*tri+tick)*env);
                }
            }
            AudioAttributes aa=new AudioAttributes.Builder().setUsage(AudioAttributes.USAGE_GAME).setContentType(AudioAttributes.CONTENT_TYPE_MUSIC).build();
            AudioFormat af=new AudioFormat.Builder().setSampleRate(sr).setEncoding(AudioFormat.ENCODING_PCM_16BIT).setChannelMask(AudioFormat.CHANNEL_OUT_MONO).build();
            music=new AudioTrack(aa,af,pcm.length*2,AudioTrack.MODE_STATIC,AudioManager.AUDIO_SESSION_ID_GENERATE);
            music.write(pcm,0,pcm.length);
            music.setLoopPoints(0,pcm.length,-1);
            music.setVolume(.30f);
        }catch(Exception ignored){music=null;}
    }

    private void startMusic(){try{if(music!=null&&music.getPlayState()!=AudioTrack.PLAYSTATE_PLAYING)music.play();}catch(Exception ignored){}}
    private void pauseMusic(){try{if(music!=null&&music.getPlayState()==AudioTrack.PLAYSTATE_PLAYING)music.pause();}catch(Exception ignored){}}

    void release(){
        h.removeCallbacksAndMessages(null);
        try{tone.release();}catch(Exception ignored){}
        try{if(music!=null){music.stop();music.release();}}catch(Exception ignored){}
        music=null;
    }
}
