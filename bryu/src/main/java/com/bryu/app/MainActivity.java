package com.bryu.app;

import android.app.Activity;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Bundle;
import android.util.Base64;
import android.webkit.JavascriptInterface;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import com.google.mlkit.common.model.DownloadConditions;
import com.google.mlkit.nl.translate.TranslateLanguage;
import com.google.mlkit.nl.translate.Translation;
import com.google.mlkit.nl.translate.Translator;
import com.google.mlkit.nl.translate.TranslatorOptions;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class MainActivity extends Activity {
    private WebView webView;
    private final ExecutorService executor = Executors.newFixedThreadPool(4);
    private Translator enEsTranslator;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getWindow().setStatusBarColor(Color.rgb(21, 26, 53));
        getWindow().setNavigationBarColor(Color.rgb(13, 17, 35));

        webView = new WebView(this);
        setContentView(webView);

        WebSettings s = webView.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setAllowFileAccess(true);
        s.setAllowContentAccess(true);
        s.setBuiltInZoomControls(false);
        s.setDisplayZoomControls(false);
        s.setMediaPlaybackRequiresUserGesture(true);
        s.setUserAgentString(s.getUserAgentString() + " BRYU/0.1");

        webView.addJavascriptInterface(new NativeBridge(), "NativeBridge");
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                Uri uri = request.getUrl();
                String scheme = uri.getScheme();
                if ("http".equalsIgnoreCase(scheme) || "https".equalsIgnoreCase(scheme)) {
                    try {
                        startActivity(new Intent(Intent.ACTION_VIEW, uri));
                    } catch (Exception ignored) {}
                    return true;
                }
                return false;
            }
        });

        TranslatorOptions options = new TranslatorOptions.Builder()
                .setSourceLanguage(TranslateLanguage.ENGLISH)
                .setTargetLanguage(TranslateLanguage.SPANISH)
                .build();
        enEsTranslator = Translation.getClient(options);

        webView.loadUrl("file:///android_asset/index.html");
    }

    private String httpGet(String address) throws Exception {
        HttpURLConnection conn = null;
        InputStream in = null;
        try {
            URL url = new URL(address);
            conn = (HttpURLConnection) url.openConnection();
            conn.setInstanceFollowRedirects(true);
            conn.setConnectTimeout(12000);
            conn.setReadTimeout(15000);
            conn.setRequestProperty("User-Agent", "Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 BRYU/0.1");
            conn.setRequestProperty("Accept", "*/*");
            conn.connect();
            int code = conn.getResponseCode();
            in = code >= 200 && code < 400 ? conn.getInputStream() : conn.getErrorStream();
            if (in == null) throw new Exception("HTTP " + code);
            BufferedReader br = new BufferedReader(new InputStreamReader(in, StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            String line;
            while ((line = br.readLine()) != null) sb.append(line).append('\n');
            if (code < 200 || code >= 400) throw new Exception("HTTP " + code + " " + sb);
            return sb.toString();
        } finally {
            if (in != null) try { in.close(); } catch (Exception ignored) {}
            if (conn != null) conn.disconnect();
        }
    }

    private void deliver(String callbackId, String value, boolean ok) {
        String encoded = Base64.encodeToString(
                (value == null ? "" : value).getBytes(StandardCharsets.UTF_8),
                Base64.NO_WRAP
        );
        String js = "window.BRYU_NATIVE && window.BRYU_NATIVE.resolve('" +
                safe(callbackId) + "','" + encoded + "'," + (ok ? "true" : "false") + ")";
        runOnUiThread(() -> webView.evaluateJavascript(js, null));
    }

    private String safe(String s) {
        return s == null ? "" : s.replaceAll("[^A-Za-z0-9_-]", "");
    }

    private String extractOgImage(String html, String pageUrl) {
        if (html == null) return "";
        Pattern[] patterns = new Pattern[]{
                Pattern.compile("<meta[^>]+(?:property|name)=[\"'](?:og:image|twitter:image)[\"'][^>]+content=[\"']([^\"']+)[\"']", Pattern.CASE_INSENSITIVE),
                Pattern.compile("<meta[^>]+content=[\"']([^\"']+)[\"'][^>]+(?:property|name)=[\"'](?:og:image|twitter:image)[\"']", Pattern.CASE_INSENSITIVE)
        };
        for (Pattern p : patterns) {
            Matcher m = p.matcher(html);
            if (m.find()) {
                String image = m.group(1).replace("&amp;", "&");
                try {
                    return new URL(new URL(pageUrl), image).toString();
                } catch (Exception ignored) {
                    return image;
                }
            }
        }
        return "";
    }

    public class NativeBridge {
        @JavascriptInterface
        public void fetch(String url, String callbackId) {
            executor.execute(() -> {
                try {
                    deliver(callbackId, httpGet(url), true);
                } catch (Exception e) {
                    deliver(callbackId, e.getMessage() == null ? "Error de red" : e.getMessage(), false);
                }
            });
        }

        @JavascriptInterface
        public void fetchImage(String url, String callbackId) {
            executor.execute(() -> {
                try {
                    String html = httpGet(url);
                    deliver(callbackId, extractOgImage(html, url), true);
                } catch (Exception e) {
                    deliver(callbackId, "", false);
                }
            });
        }

        @JavascriptInterface
        public void translate(String text, String callbackId) {
            if (text == null || text.trim().isEmpty()) {
                deliver(callbackId, "", true);
                return;
            }
            DownloadConditions conditions = new DownloadConditions.Builder().build();
            enEsTranslator.downloadModelIfNeeded(conditions)
                    .addOnSuccessListener(v -> enEsTranslator.translate(text)
                            .addOnSuccessListener(result -> deliver(callbackId, result, true))
                            .addOnFailureListener(e -> deliver(callbackId,
                                    e.getMessage() == null ? "No se pudo traducir" : e.getMessage(), false)))
                    .addOnFailureListener(e -> deliver(callbackId,
                            e.getMessage() == null ? "No se pudo descargar el modelo" : e.getMessage(), false));
        }

        @JavascriptInterface
        public void open(String url) {
            runOnUiThread(() -> {
                try {
                    startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse(url)));
                } catch (Exception ignored) {}
            });
        }
    }

    @Override
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) webView.goBack();
        else super.onBackPressed();
    }

    @Override
    protected void onDestroy() {
        if (enEsTranslator != null) enEsTranslator.close();
        executor.shutdownNow();
        if (webView != null) webView.destroy();
        super.onDestroy();
    }
}
