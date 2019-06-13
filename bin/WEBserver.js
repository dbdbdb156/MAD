
var express = require('express');
var app = express();


app.get('/Camera/On/1/2', function (req, res) {
    console.log("CameraOn");

	execute(['execute','1','/10000/1/1','read/1/3000/1/1']);
    
    //res.send(wwwww);


});

app.get('/Camera/Off', function (req, res) {
    console.log("CameraOff");
    //console.log(res.url);
	execute(['execute','1','/10000/1/1','read/1/3000/1/2']);
});

app.get('/Music/On', function (req, res) {
    console.log("MusicOn");
    //console.log(res.url);
	execute(['execute','1','/10000/1/1','read/1/3000/2/1']);
});

app.get('/Music/Off', function (req, res) {
    console.log("MusicOff");
    //console.log(res.url);
	execute(['execute','1','/10000/1/1','read/1/3000/2/2']);
});

app.get('/Sensor/On', function (req, res) {
    console.log("SensorOn");
    //console.log(res.url);
	execute(['execute','1','/10000/1/1','read/1/3000/1/2']);
});


 
app.listen(6000,'192.168.0.99');




console.log(['execute','1','/10000/1/1','read/1/3000/1/2']);
