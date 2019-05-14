/*
 * Copyright 2014 Telefonica Investigación y Desarrollo, S.A.U
 *
 * This file is part of lwm2m-node-lib
 *
 * lwm2m-node-lib is free software: you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the License,
 * or (at your option) any later version.
 *
 * lwm2m-node-lib is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public
 * License along with lwm2m-node-lib.
 * If not, seehttp://www.gnu.org/licenses/.
 *
 * For those usages not covered by the GNU Affero General Public License
 * please contact with::[contacto@tid.es]
 */

'use strict';

var coap = require('coap'),
    Readable = require('stream').Readable,
    errors = require('../../errors'),
    config;

function isObserveAction(res) {
    var observeFlag = false;

    for (var i = 0; i < res.options.length; i++) {
        if (res.options[i].name === 'Observe') {
            observeFlag = true;
        }
    }
    return observeFlag;
}

function readResponse(res, callback) {
    var data = '';

    res.on('data', function (chunk) {
        data += chunk;
    });

    res.on('error', function(error) {
        callback(new errors.ClientResponseError(error));
    });

    res.on('end', function(chunk) {
        if (chunk) {
            data += chunk;
        }
        callback(null, res);
    });
}

/**
 * Send the COAP Request passed as a parameter. If the request contains a parameter "payload", the parameter is sent
 * as the payload of the request; otherwise, the request is sent without any payload.
 *
 * @param {Object} request          Object containing all the request information (in the Node COAP format).
 */
function sendRequest(request, callback) {
    var agent = new coap.Agent({type: config.serverProtocol}),
        req = agent.request(request),
        rs = new Readable();

    req.on('response', function(res) {
        if (isObserveAction(res)) {
            callback(null, res);
        } else {
            readResponse(res, callback);
        }
    });

    req.on('error', function(error) {
        callback(new errors.ClientConnectionError(error));
    });

    if (request.payload) {
        rs.push(request.payload);
        rs.push(null);
        rs.pipe(req);
    } else {
        req.end();
    }
}
///////////////////////////////////////////////////// mix_server & client 를 위한 
//////////////////////// sendRequest2 함수 입니다. 
function sendRequest2(request, callback) {
    var agent = new coap.Agent({type: config.serverProtocol}),
        req = agent.request(request),
        rs = new Readable();

    req.on('response', function(res) {
        if (isObserveAction(res)) {
            callback(null, res);
        } else {
		// 요기에서 데이터를 계속 읽은ㄴ다.
            readResponse(res, callback);
        }
    });

    req.on('error', function(error) {
        callback(new errors.ClientConnectionError(error));
    });

    if (request.payload) {
        rs.push(request.payload);
        rs.push(null);
        rs.pipe(req);
    } else {
        req.end();
    }
}


/**
 * Generates a generic response processing callback for all the resource based operations.
 *
 * @param {String} objectType           ID of the type of object.
 * @param {String} objectId             ID of the instance where the operation was performed.
 * @param code                          Return code if the callback is successful.
 * @returns {processResponse}           The generated handler.
 */
function generateProcessResponse(objectType, objectId, resourceId, code) {
    return function processResponse(res, callback) {
        if (res.code === code) {
            callback(null, res.payload.toString('utf8'));
        } else if (res.code === '4.04') {
	// 요기를 수정해야한다. --> Mix_Client 에 Object 가 없을때 Mix_server 에서 device_client 로 한번더 요	
		if(res.name === 'OBJECT_NOT_FOUND'){
			
		}
		else{
			callback(new errors.ResourceNotFound());
		}
	
            
        } else {
            callback(new errors.ClientError(res.code));
        }
    };
}

function generateProcessResponse2(code) {
    return function processResponse(res, callback) {
        if (res.code === code) {
            callback(null, res.payload.toString('utf8'));
        } else if (res.code === '4.04') {
	// 요기를 수정해야한다. --> Mix_Client 에 Object 가 없을때 Mix_server 에서 device_client 로 한번더 요	
		if(res.name === 'OBJECT_NOT_FOUND'){
			
		}
		else{
			callback(new errors.ResourceNotFound());
		}
	
            
        } else {
            callback(new errors.ClientError(res.code));
        }
    };
}

function init(newConfig) {
    config = newConfig;
}

// mix_server & client 를 위한 sendRequest2 함수를 추가하였습니다.
exports.sendRequest2 = sendRequest2;
exports.generateProcessResponse = generateProcessResponse;
exports.sendRequest = sendRequest;
exports.init = init;
