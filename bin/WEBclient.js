/// 주의사항 : node 실행시킬때 IP 와 port 를 파라미터로 주어야합니다.

const { parse } = require('querystring');
var http = require('http');
var readline = require('readline');

var r = readline.createInterface({
	input:process.stdin,
	output:process.stdout
});
// node WErequest.js 실행시 Parameter 로 IP 와 port 를 받음 
var opts = {
  host: process.argv[2],
  port: process.argv[3],
  //method: 'POST',
  path: '/'
};

// Cmdline 입력 
r.on('line',function(line){
	var sp = line.split(' ');
	if(line=='exit'){
		r.close();
	}
	else if(sp[0] == 'POST'){
		console.log(sp[0]);
		opts.method=sp[0];
		PostReqToHttpserver(sp);
	}
	else if(sp[0] == 'GET'){
		console.log(sp[0]);
		opts.method=sp[0];
		opts.path = opts.path + sp[1];
		GetReqToHttpserver(sp);
	}
	r.prompt();
});
r.on('close',function(){
	process.exit();
});

// Get or Post 요청을 보냄
function PostReqToHttpserver(cmdline){
	
	console.log(cmdline);

	var resData = '';

	var req = http.request(opts, function(res){
 	 //응답처리
 	 res.on('data', function(chunk){
 	   resData += chunk;
	  });

 	 res.on('end', function(){
	    //console.log(resData);
	  });

	});

	resData = 'q=actor&w=parser';

	req.on('error', function(err){
 	 console.log("오류발생:"+ err.message);
	});

	//요청전송
	req.write(resData);
	req.end();
}
function GetReqToHttpserver(cmdline){
	
	console.log(cmdline);

	var req = http.request(opts, function (res) {

  	  var returnData = '';

   	 // When server return any data.
    	res.on('data', function (data) {
    	    returnData += data;
   	 })

   	 // When server return data complete.
   	 res.on('end', function () {
    	    console.log(returnData);
	    r.prompt();
   	 })

	});

// Finish sending the request. Then serve will process this request.
	req.end();
}

console.log('We recommand This method: [http_method send_data]');
console.log('ex) [GET requsetvalue] or [POST I send you data GoGo] ');
r.setPrompt('>');
r.prompt();






/*
const request = require('request')

request.post('http://172.30.1.46:3000', {
  json: {
    todo: 'Buy the milk'
  }
}, (error, res, body) => {
  if (error) {
    console.error(error)
    return
  }
  console.log(`statusCode: ${res.statusCode}`)
  console.log(body)
})

*/











