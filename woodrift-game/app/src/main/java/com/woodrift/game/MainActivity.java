package com.woodrift.game;

import android.app.Activity;
import android.os.Bundle;
import android.os.Build;
import android.graphics.Color;
import android.view.Gravity;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import android.widget.TextView;

public class MainActivity extends Activity {
    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        try {
            requestWindowFeature(Window.FEATURE_NO_TITLE);
            getWindow().setFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN, WindowManager.LayoutParams.FLAG_FULLSCREEN);
            if (Build.VERSION.SDK_INT >= 28) {
                WindowManager.LayoutParams lp = getWindow().getAttributes();
                lp.layoutInDisplayCutoutMode = WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES;
                getWindow().setAttributes(lp);
            }
            getWindow().getDecorView().setSystemUiVisibility(
                    View.SYSTEM_UI_FLAG_FULLSCREEN |
                    View.SYSTEM_UI_FLAG_HIDE_NAVIGATION |
                    View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY |
                    View.SYSTEM_UI_FLAG_LAYOUT_STABLE |
                    View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN |
                    View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION);
        } catch (Throwable ignored) {}

        try {
            setContentView(new GameView(this));
        } catch (Throwable t) {
            TextView error = new TextView(this);
            error.setBackgroundColor(Color.rgb(22, 26, 35));
            error.setTextColor(Color.WHITE);
            error.setTextSize(18);
            error.setGravity(Gravity.CENTER);
            error.setPadding(40, 40, 40, 40);
            String msg = t.getClass().getSimpleName();
            if (t.getMessage() != null && !t.getMessage().isEmpty()) msg += "\n" + t.getMessage();
            error.setText("NEON RIFT\n\nNo se pudo iniciar el juego.\n" + msg);
            setContentView(error);
        }
    }
}
