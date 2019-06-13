package com.example.httpconnection;

import android.os.Bundle;
import android.support.v7.app.AppCompatActivity;
import android.widget.CompoundButton;
import android.widget.TextView;
import android.widget.Toast;
import android.widget.ToggleButton;

public class MusicActivity extends AppCompatActivity {

    ToggleButton toggleButton;
    private TextView tv_outPut;
    MainActivity.NetworkTask networkTask;
    String url = "http://192.168.0.99:6000";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.music);

        toggleButton = (ToggleButton)findViewById(R.id.MNF);

        toggleButton.setOnCheckedChangeListener(new CompoundButton.OnCheckedChangeListener() {
            @Override
            public void onCheckedChanged(CompoundButton buttonView, boolean isChecked) {
                if (isChecked == true) {
                    Toast.makeText(MusicActivity.this, "음악-ON", Toast.LENGTH_SHORT).show();

                    //Get 보내기
                    networkTask = new MainActivity.NetworkTask(url,"/Music/On");
                    networkTask.execute("10");

                }
                else {
                    Toast.makeText(MusicActivity.this,"음악-OFF",Toast.LENGTH_SHORT).show();

                    //Host 보내기
                    networkTask = new MainActivity.NetworkTask(url,"/Music/Off");
                    networkTask.execute("20");
                }
            }
        });
    }
}
