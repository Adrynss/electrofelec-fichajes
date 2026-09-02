package com.woodrift.game;

import android.media.AudioManager;
import android.media.ToneGenerator;

/** Solo efectos cortos. No hay música de fondo. */
final class AudioEngine {
    private ToneGenerator sfx;
    private boolean muted;
    private boolean released;

    AudioEngine(boolean muted) {
        this.muted = muted;
        try { sfx = new ToneGenerator(AudioManager.STREAM_MUSIC, 34); }
        catch (Throwable ignored) { sfx = null; }
    }

    void setMuted(boolean m) { muted = m; }
    boolean isMuted() { return muted; }

    void event(int ev) {
        if (muted || released || sfx == null) return;
        try {
            if ((ev & GameEngine.EV_GAMEOVER) != 0) { tone(ToneGenerator.TONE_CDMA_ABBR_ALERT, 280); return; }
            if ((ev & GameEngine.EV_LEVEL) != 0) { tone(ToneGenerator.TONE_PROP_ACK, 120); return; }
            if ((ev & GameEngine.EV_CLEAR) != 0) { tone(ToneGenerator.TONE_PROP_BEEP2, 70); return; }
            if ((ev & GameEngine.EV_ROTATE) != 0) { tone(ToneGenerator.TONE_DTMF_9, 22); return; }
            if ((ev & GameEngine.EV_MOVE) != 0) { tone(ToneGenerator.TONE_DTMF_1, 12); return; }
            if ((ev & GameEngine.EV_LOCK) != 0) tone(ToneGenerator.TONE_PROP_ACK, 22);
        } catch (Throwable ignored) {}
    }

    void restart() { }

    private void tone(int id, int ms) {
        try { sfx.startTone(id, ms); } catch (Throwable ignored) {}
    }

    void release() {
        released = true;
        try { if (sfx != null) sfx.release(); } catch (Throwable ignored) {}
        sfx = null;
    }
}
