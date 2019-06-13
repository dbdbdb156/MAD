package com.example.httpconnection;

import android.os.Bundle;
import android.support.v7.app.AppCompatActivity;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.CompoundButton;
import android.widget.Toast;
import android.widget.ToggleButton;

import io.vov.vitamio.LibsChecker;
import io.vov.vitamio.MediaPlayer;
import io.vov.vitamio.widget.VideoView;
import io.vov.vitamio.widget.MediaController;

public class CameraActivity extends AppCompatActivity {


    ToggleButton toggleButton;
    MainActivity.NetworkTask networkTask;
    String url = "http://192.168.0.99:6000";

    // WebView 관련
    private WebView mWebView;
    public final static String VIDEO_URL = "http://192.168.0.83:8000";

    // GStreamer
    private String path;
    private VideoView mVideoView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        if(!LibsChecker.checkVitamioLibs(this))
            return;

        setContentView(R.layout.camera);

        toggleButton = (ToggleButton) findViewById(R.id.CNF);


        toggleButton.setOnCheckedChangeListener(new CompoundButton.OnCheckedChangeListener() {
            @Override
            public void onCheckedChanged(CompoundButton buttonView, boolean isChecked) {
                if (isChecked == true) {
                    Toast.makeText(CameraActivity.this, "카메라-ON", Toast.LENGTH_SHORT).show();

                    //Get 보내기
                    networkTask = new MainActivity.NetworkTask(url, "/Camera/On");
                    networkTask.execute("10");

                } else {
                    Toast.makeText(CameraActivity.this, "카메라-OFF", Toast.LENGTH_SHORT).show();

                    //Post 보내기
                    networkTask = new MainActivity.NetworkTask(url, "/Camera/Off");
                    networkTask.execute("20");
                }
            }
        });

        mWebView = (WebView) findViewById(R.id.view);

        WebSettings webSettings = mWebView.getSettings();
        webSettings.setJavaScriptEnabled(true);

        mWebView.setWebViewClient(new WebViewClient(){
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url){
                view.loadUrl(url);
                return true;
            }
        });
        mWebView.loadUrl(VIDEO_URL);




//        // Gstreamer
//        mVideoView = (VideoView) findViewById(R.id.web);
//        path = "rtp://192.168.0.83:5000";
//        mVideoView.setVideoPath(path);
//        mVideoView.setMediaController(new MediaController(this));
//        mVideoView.requestFocus();
//
//        mVideoView.setOnPreparedListener(new MediaPlayer.OnPreparedListener(){
//            @Override
//            public void onPrepared(MediaPlayer mediaPlayer) {
//                mediaPlayer.setPlaybackSpeed(1.0f);
//            }
//        });
    }
}