var express = require('express');
var app = express();


app.get('/Camera/On', function (req, res) {
    console.log("CarameOn");
    console.log(res.url);
    res.send('execute 1 /10000/1/1 read/1/write/');
});

app.get('/Camera/Off', function (req, res) {
    console.log("CarameOff");
    res.send('execute 1 /10000/1/1 read/1/write/');
});

app.get('/SensorOff', function (req, res) {
    res.send('execute 1 /10000/1/1 read/1/write/');
});


app.listen(5000,'192.168.0.97');
