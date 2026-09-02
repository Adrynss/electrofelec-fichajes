package com.woodrift.game;

import android.app.Activity;
import android.os.Bundle;
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
            getWindow().getDecorView().setSystemUiVisibility(
                    View.SYSTEM_UI_FLAG_FULLSCREEN |
                    View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY |
                    View.SYSTEM_UI_FLAG_LAYOUT_STABLE |
                    View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN);
        } catch (Throwable ignored) {}

        try {
            setContentView(new GameView(this));
        } catch (Throwable t) {
            TextView error = new TextView(this);
            error.setBackgroundColor(Color.rgb(35, 21, 15));
            error.setTextColor(Color.rgb(255, 231, 189));
            error.setTextSize(18);
            error.setGravity(Gravity.CENTER);
            error.setPadding(40, 40, 40, 40);
            String msg = t.getClass().getSimpleName();
            if (t.getMessage() != null && !t.getMessage().isEmpty()) msg += "\n" + t.getMessage();
            error.setText("WOOD RIFT\n\nNo se pudo iniciar el motor del juego.\n" + msg);
            setContentView(error);
        }
    }
}
