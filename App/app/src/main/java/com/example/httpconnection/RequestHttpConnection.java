package com.example.httpconnection;

import android.content.ContentValues;
import android.util.Log;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.Map;

public class RequestHttpConnection {

    public String Postrequest(String _url, String _params){

        // HttpURLConnection ?? ??.
        HttpURLConnection urlConn = null;
        // URL ?? ??? ?? ????.
        StringBuffer sbParams = new StringBuffer();

        /**
         * 1. StringBuffer? ???? ??
         * */

        /**
         * 2. HttpURLConnection? ?? web? ???? ????.
         * */
        try{
            URL url = new URL(_url);
            urlConn = (HttpURLConnection) url.openConnection();

            // [2-1]. urlConn ??.
            urlConn.setRequestMethod("POST"); // URL ??? ?? ??? ?? : POST.
            urlConn.setRequestProperty("Accept-Charset", "UTF-8"); // Accept-Charset ??.
            urlConn.setRequestProperty("Context_Type", "application/x-www-form-urlencoded;cahrset=UTF-8");

            // [2-2]. parameter ?? ? ??? ????.
            //String strParams = sbParams.toString(); //sbParams? ??? ?????? ????? ??. ?)id=id1&pw=123;
            String strParams = "Clinet send data to Server /////";
            OutputStream os = urlConn.getOutputStream();
            os.write(strParams.getBytes("UTF-8")); // ?? ???? ??.
            os.flush(); // ?? ???? ???(???)?? ??? ? ?? ?? ???? ?? ??.
            os.close(); // ?? ???? ?? ?? ??? ??? ??.

            // [2-3]. ?? ?? ??.
            // ?? ? null? ???? ???? ??.
            if (urlConn.getResponseCode() != HttpURLConnection.HTTP_OK)
                return null;

            // [2-4]. ??? ??? ??.
            // ??? URL? ???? BufferedReader? ???.
            BufferedReader reader = new BufferedReader(new InputStreamReader(urlConn.getInputStream(), "UTF-8"));

            // ???? ??? ? ?? ?? ??.
            String line;
            String page = "";

            // ??? ??? ???.
            while ((line = reader.readLine()) != null){
                page += line;
            }

            return page;

        } catch (MalformedURLException e) { // for URL.
            e.printStackTrace();
        } catch (IOException e) { // for openConnection().
            e.printStackTrace();
        } finally {
            if (urlConn != null)
                urlConn.disconnect();
        }

        return null;

    }

    public String Getrequest(String _url, String parameter){

        // HttpURLConnection ?? ??.
        HttpURLConnection urlConn = null;
        // URL ?? ??? ?? ????.
        StringBuffer sbParams = new StringBuffer();

        /**
         * 1. StringBuffer? ???? ??
         * */

        /**
         * 2. HttpURLConnection? ?? web? ???? ????.
         * */
        try{


           // String strParams = "id=YJWkdWkd&passwd=nkrngek";

            URL url = new URL(_url + parameter);
            urlConn = (HttpURLConnection) url.openConnection();

            // [2-1]. urlConn ??.
            urlConn.setRequestMethod("GET"); // URL ??? ?? ??? ?? : GET
            urlConn.setReadTimeout(15000);
            urlConn.setConnectTimeout(15000);
            //urlConn.setRequestProperty(strParams,"");
/*
            String[] listvalue = strParams.split("&");
            String[] temp;
            for(int i= 0; i<listvalue.length;i++){
                temp = listvalue[i].split("=");
                Log.i("value : key :", ""+temp);
                urlConn.setRequestProperty(temp[0],temp[1]);
            }
*/
            urlConn.connect();

            Log.i("url : ",""+url.getPath());
            // [2-2]. parameter ?? ? ??? ????.
            //String strParams = sbParams.toString(); //sbParams? ??? ?????? ????? ??. ?)id=id1&pw=123;

            /*
            OutputStream os = urlConn.getOutputStream();
            os.write(strParams.getBytes("UTF-8")); // ?? ???? ??.
            os.flush(); // ?? ???? ???(???)?? ??? ? ?? ?? ???? ?? ??.
            os.close(); // ?? ???? ?? ?? ??? ??? ??.
*/
            //urlConn.connect();

            // [2-3]. ?? ?? ??.
            // ?? ? null? ???? ???? ??.
            if (urlConn.getResponseCode() != HttpURLConnection.HTTP_OK)
                return null;

            // [2-4]. ??? ??? ??.
            // ??? URL? ???? BufferedReader? ???.
            BufferedReader reader = new BufferedReader(new InputStreamReader(urlConn.getInputStream(), "UTF-8"));

            // ???? ??? ? ?? ?? ??.
            String line;
            String page = "";

            // ??? ??? ???.
            while ((line = reader.readLine()) != null){
                page += line;
            }
            Log.i("received data : ",page);
            reader.close();
            return page;

        } catch (MalformedURLException e) { // for URL.
            e.printStackTrace();
        } catch (IOException e) { // for openConnection().
            e.printStackTrace();
        } finally {
            if (urlConn != null)
                urlConn.disconnect();
        }

        return null;

    }

}