/// 주의사항 : node 실행시킬때 IP 와 port 를 파라미터로 주어야합니다.

const http = require('http');
var url = require('url');
const { parse } = require('querystring');

var port = 3000;
var hostname = '172.30.1.46';

const server = http.createServer((req, res) => {


   console.log(res.statusCode);
   res.writeHead(200, {"Content-Type": "text/html; charset=utf-8"});
   console.log(req.method);

   // POST 는 통상적으로 Server 의 자원을 수정할때 사용 (ex 게시판)
   if (req.method === 'POST') {
        let body = '';
    	req.on('data', chunk => {
    	    body += chunk.toString(); // convert Buffer to string
    	});
    	req.on('end', () => {
	   console.log(body);
     	   console.log(parse(body));
     	   res.end('ok');
   	});
    }
    // GET 은 통상적으로 server 에 요청할때 사용 
    else if(req.method === 'GET'){
	
	// Parameter 의 값을 받아줍니다.
    var reqUrlString = req.url;
    var urlObject = url.parse(reqUrlString, true, false);
    var afterlinevalue = urlObject.pathname;
    afterlinevalue = afterlinevalue.substr(1);
	console.log('HTTP server receive parameter: '+ afterlinevalue);
    	res.write('We receive value : '+afterlinevalue);
	res.end();
    }
    else{
	

	}
});

server.listen(port,hostname);
console.log('hostname : '+hostname + '\nport : '+port);


