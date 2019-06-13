package com.example.httpconnection;

import android.os.AsyncTask;
import android.os.Bundle;
import android.support.v7.app.AppCompatActivity;
import android.util.Log;
import android.widget.CompoundButton;
import android.widget.TextView;
import android.widget.Toast;
import android.widget.ToggleButton;

public class SensorActivity extends AppCompatActivity {

    NetworkTask networkTask;
    String url = "http://192.168.0.99:6000";
    static TextView temp;
    static TextView humi;
    static TextView dust;
    static String[] ary;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.sensor);

        Toast.makeText(SensorActivity.this, "센서-ON", Toast.LENGTH_SHORT).show();

        //Get 보내기
        networkTask = new NetworkTask(url,"/Sensor/On");
        networkTask.execute("10");

        temp = (TextView) findViewById(R.id.temp);
        humi = (TextView) findViewById(R.id.humi);
        dust = (TextView) findViewById(R.id.dust);


    }

    public static class NetworkTask extends AsyncTask<String, Void, String> {

        private String url;
        private String values;

        public NetworkTask(String url, String values) {

            this.url = url;
            this.values = values;
        }

        @Override
        protected String doInBackground(String... params) {

            String result; // ?? ??? ??? ??.
            int eventvalue = Integer.parseInt(params[0]);
            RequestHttpConnection requestHttpURLConnection = new RequestHttpConnection();
            Log.i("value : ",""+eventvalue);
            if(eventvalue/10 == 1) {
                Log.i("url : ",""+url);
                result = requestHttpURLConnection.Getrequest(url, values); // ?? URL? ?? ???? ????.
            }
            else if(eventvalue/10 == 2){
                result = requestHttpURLConnection.Postrequest(url, values);
            }
            else{
                result = null ;
            }
            return result;
        }

        @Override
        public void onPostExecute(String s) {

            super.onPostExecute(s);
            //doInBackground()? ?? ??? ?? onPostExecute()? ????? ????? s? ????.

            ary = s.split(",");

            System.out.println(s);
            System.out.println(ary[0]);

            temp.setText("온도 : " + ary[0] +"°C");
            humi.setText("습도 : " + ary[1] + "%");
            dust.setText("먼지 : " + ary[2] + "㎛");
        }


    }


}