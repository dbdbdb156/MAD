var express = require('express');
var app = express();


app.get('/Carama/On', function (req, res) {
    res.send('execute 1 /10000/1/1 read/1/write/');
});

app.get('/CaramaOff', function (req, res) {
    res.send('execute 1 /10000/1/1 read/1/write/');
});

app.get('/SensorOff', function (req, res) {
    res.send('execute 1 /10000/1/1 read/1/write/');
});


app.listen(3000,'192.168.123.178');
