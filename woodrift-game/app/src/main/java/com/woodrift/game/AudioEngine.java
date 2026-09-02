package com.woodrift.game;

import android.media.AudioAttributes;
import android.media.AudioFormat;
import android.media.AudioManager;
import android.media.AudioTrack;
import android.media.ToneGenerator;
import android.os.Handler;
import android.os.Looper;

/**
 * Música y efectos independientes: los efectos nunca reinician la música.
 */
final class AudioEngine {
    private final Handler h = new Handler(Looper.getMainLooper());
    private ToneGenerator sfx;
    private AudioTrack music;
    private boolean muted;
    private boolean ready;
    private boolean released;

    AudioEngine(boolean muted) {
        this.muted = muted;
        h.postDelayed(this::initSafe, 220);
    }

    private void initSafe() {
        if (released || ready) return;
        try { sfx = new ToneGenerator(AudioManager.STREAM_MUSIC, 45); }
        catch (Throwable ignored) { sfx = null; }
        try { buildMusic(); }
        catch (Throwable ignored) { music = null; }
        ready = true;
        if (!muted) startMusic();
    }

    void setMuted(boolean m) {
        muted = m;
        if (released) return;
        if (!ready) {
            if (!m) initSafe();
            return;
        }
        if (m) pauseMusic();
        else startMusic();
    }

    boolean isMuted() { return muted; }

    void event(int ev) {
        if (muted || released) return;
        if (!ready) initSafe();
        try {
            if ((ev & GameEngine.EV_GAMEOVER) != 0) {
                pauseMusic();
                tone(ToneGenerator.TONE_CDMA_ABBR_ALERT, 330);
                return;
            }
            if ((ev & GameEngine.EV_LEVEL) != 0) {
                sequence(new int[]{ToneGenerator.TONE_DTMF_4, ToneGenerator.TONE_DTMF_7, ToneGenerator.TONE_DTMF_9},
                         new int[]{55,70,120});
                return;
            }
            if ((ev & GameEngine.EV_CLEAR) != 0) {
                sequence(new int[]{ToneGenerator.TONE_DTMF_2, ToneGenerator.TONE_DTMF_5, ToneGenerator.TONE_DTMF_8},
                         new int[]{45,55,95});
                return;
            }
            if ((ev & GameEngine.EV_ROTATE) != 0) { tone(ToneGenerator.TONE_DTMF_9, 26); return; }
            if ((ev & GameEngine.EV_MOVE) != 0) { tone(ToneGenerator.TONE_DTMF_1, 16); return; }
            if ((ev & GameEngine.EV_DROP) != 0) { tone(ToneGenerator.TONE_PROP_BEEP2, 32); return; }
            if ((ev & GameEngine.EV_LOCK) != 0) tone(ToneGenerator.TONE_PROP_ACK, 25);
        } catch (Throwable ignored) {}
    }

    void restart() {
        if (released) return;
        if (!ready) initSafe();
        if (!muted) {
            try {
                if (music != null) music.setPlaybackHeadPosition(0);
            } catch (Throwable ignored) {}
            startMusic();
        }
    }

    private void tone(int id, int ms) {
        try { if (sfx != null) sfx.startTone(id, ms); } catch (Throwable ignored) {}
    }

    private void sequence(int[] tones, int[] ms) {
        int delay = 0;
        for (int i=0; i<tones.length; i++) {
            final int t = tones[i], d = ms[i];
            h.postDelayed(() -> { if (!muted && !released) tone(t, d); }, delay);
            delay += d + 12;
        }
    }

    private void buildMusic() {
        final int sr = 22050;
        final float beatSeconds = 0.19f;
        final int beat = (int)(sr * beatSeconds);

        int R = -1;
        int[] lead = {
            64,67,71,72, 71,67,64,R, 62,64,67,69, 67,64,62,R,
            64,67,71,74, 72,71,67,R, 69,72,76,74, 72,69,67,R,
            59,62,64,67, 64,62,59,R, 60,64,67,69, 67,64,60,R,
            62,65,69,72, 69,65,62,R, 64,67,71,69, 67,64,62,R,
            64,69,72,76, 74,72,69,R, 67,71,74,79, 76,74,71,R,
            69,72,76,81, 79,76,72,R, 71,74,79,76, 74,71,69,R,
            67,64,60,64, 67,69,67,R, 65,62,59,62, 65,67,65,R,
            64,67,71,69, 67,64,62,R, 60,62,64,67, 64,62,60,R
        };

        int[] bassPattern = {40,40,43,43,45,45,43,43, 38,38,40,40,43,43,40,40};
        short[] pcm = new short[lead.length * beat];

        for (int n=0; n<lead.length; n++) {
            int bassMidi = bassPattern[n % bassPattern.length];
            double bassF = midiToFreq(bassMidi);
            double leadF = lead[n] < 0 ? 0 : midiToFreq(lead[n]);
            int phrase = (n / 16) % 4;
            double leadGain = new double[]{0.115,0.10,0.125,0.09}[phrase];
            double bassGain = new double[]{0.045,0.055,0.05,0.06}[phrase];

            for (int i=0; i<beat; i++) {
                double t = i / (double)sr;
                double attack = Math.min(1.0, i / (sr * 0.012));
                double release = Math.min(1.0, (beat-i) / (sr * 0.055));
                double env = attack * release;

                double leadWave = 0;
                if (leadF > 0) {
                    double phase = (leadF * t) % 1.0;
                    leadWave = phase < 0.42 ? 1.0 : -0.72;
                }
                double tri = 2.0 * Math.abs(2.0 * ((bassF*t)%1.0) - 1.0) - 1.0;
                double hat = (i < 75 && n % 4 == 2) ? (1.0 - i/75.0) * 0.025 : 0.0;
                double kick = (i < 120 && n % 4 == 0) ? (1.0 - i/120.0) * 0.035 : 0.0;

                double sample = (leadGain*leadWave + bassGain*tri + hat + kick) * env;
                int v = (int)(32767 * sample);
                if (v > 32767) v = 32767;
                if (v < -32767) v = -32767;
                pcm[n*beat+i] = (short)v;
            }
        }

        AudioAttributes attrs = new AudioAttributes.Builder()
                .setUsage(AudioAttributes.USAGE_GAME)
                .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC)
                .build();
        AudioFormat fmt = new AudioFormat.Builder()
                .setSampleRate(sr)
                .setEncoding(AudioFormat.ENCODING_PCM_16BIT)
                .setChannelMask(AudioFormat.CHANNEL_OUT_MONO)
                .build();

        AudioTrack tr = new AudioTrack(attrs, fmt, pcm.length*2, AudioTrack.MODE_STATIC, AudioManager.AUDIO_SESSION_ID_GENERATE);
        if (tr.getState() != AudioTrack.STATE_INITIALIZED) {
            try { tr.release(); } catch (Throwable ignored) {}
            music = null;
            return;
        }
        int written = tr.write(pcm, 0, pcm.length);
        if (written <= 0) {
            try { tr.release(); } catch (Throwable ignored) {}
            music = null;
            return;
        }
        try { tr.setLoopPoints(0, Math.min(written, pcm.length), -1); } catch (Throwable ignored) {}
        try { tr.setVolume(.42f); } catch (Throwable ignored) {}
        music = tr;
    }

    private double midiToFreq(int midi) {
        return 440.0 * Math.pow(2.0, (midi - 69) / 12.0);
    }

    private void startMusic() {
        try {
            if (music != null && music.getState() == AudioTrack.STATE_INITIALIZED &&
                    music.getPlayState() != AudioTrack.PLAYSTATE_PLAYING) {
                music.play();
            }
        } catch (Throwable ignored) {}
    }

    private void pauseMusic() {
        try {
            if (music != null && music.getPlayState() == AudioTrack.PLAYSTATE_PLAYING) music.pause();
        } catch (Throwable ignored) {}
    }

    void release() {
        released = true;
        h.removeCallbacksAndMessages(null);
        try { if (sfx != null) sfx.release(); } catch (Throwable ignored) {}
        sfx = null;
        try {
            if (music != null) {
                try { music.stop(); } catch (Throwable ignored) {}
                music.release();
            }
        } catch (Throwable ignored) {}
        music = null;
    }
}
