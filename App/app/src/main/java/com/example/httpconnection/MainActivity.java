package com.example.httpconnection;

import android.content.Intent;
import android.os.AsyncTask;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.TextView;

public class MainActivity extends AppCompatActivity {

    private static TextView tv_outPut;
    String url = "http://192.168.0.99:6000";
    NetworkTask networkTask ;
    private static String temp;
    static String[] ary;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        // ??? ?? ??.

        // AsyncTask? ?? HttpURLConnection ??.
        //networkTask = new NetworkTask(url, null);
        // "10" == GET ?? , "20" == POST ??
        //networkTask.execute("10");

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

//        @Override
//        public void onPostExecute(String s) {
//
//            super.onPostExecute(s);
//            //doInBackground()? ?? ??? ?? onPostExecute()? ????? ????? s? ????.
//        }

}

    public void onClickButton1 (View view) {
        Intent intent1 = new Intent(MainActivity.this,CameraActivity.class);
        startActivity(intent1);
    }

    public void onClickButton2 (View view) {
        Intent intent1 = new Intent(MainActivity.this,SensorActivity.class);
        startActivity(intent1);
    }

    public void onClickButton3 (View view) {
        Intent intent1 = new Intent(MainActivity.this,MusicActivity.class);
        startActivity(intent1);
    }
}