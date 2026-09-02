package com.woodrift.game;

import android.app.Activity;
import android.os.Bundle;
import android.view.WindowInsets;
import android.view.WindowInsetsController;

public class MainActivity extends Activity {
    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        if (android.os.Build.VERSION.SDK_INT >= 30) {
            getWindow().setDecorFitsSystemWindows(false);
            WindowInsetsController c = getWindow().getInsetsController();
            if (c != null) c.hide(WindowInsets.Type.statusBars());
        }
        setContentView(new GameView(this));
    }
}
