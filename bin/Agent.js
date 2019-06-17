#!/usr/bin/env node

/*
 * Copyright 2014 Telefonica Investigación y Desarrollo, S.A.U
 *
 * This file is part of fiware-iotagent-lib
 *
 * fiware-iotagent-lib is free software: you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the License,
 * or (at your option) any later version.
 *
 * fiware-iotagent-lib is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public
 * License along with fiware-iotagent-lib.
 * If not, seehttp://www.gnu.org/licenses/.
 *
 * For those usages not covered by the GNU Affero General Public License
 * please contact with::[contacto@tid.es]
 */

var config = require('../config2'),
    clUtils = require('command-node'),
    lwm2mServer = require('../').server,
    lwm2mClient = require('../').client,
    async = require('async'),
    globalDeviceInfo, // mix_Server 정보
    globalServerInfo, // mix_Client device 정보
    separator = '\n\n\t',
    
    NowDevice;

function handleResult(message) {
    return function(error) {
        if (error) {
            clUtils.handleError(error);
        } else {
            console.log('\nSuccess: %s\n', message);
            clUtils.prompt();
        }
    };
}

function registrationHandler(endpoint, lifetime, version, binding, payload, callback) {
    console.log('\nDevice registration:\n----------------------------\n');
    console.log('Endpoint name: %s\nLifetime: %s\nBinding: %s', endpoint, lifetime, binding);
    clUtils.prompt();
    callback();
}

function unregistrationHandler(device, callback) {
    console.log('\nDevice unregistration:\n----------------------------\n');
    console.log('Device location: %s', device);
    clUtils.prompt();
    callback();
}

function SsetHandlers(serverInfo, callback) {
    globalServerInfo = serverInfo;
    lwm2mServer.setHandler(serverInfo, 'registration', registrationHandler);
    lwm2mServer.setHandler(serverInfo, 'unregistration', unregistrationHandler);
    callback();
}

function start() {
    async.waterfall([
        async.apply(lwm2mServer.start, config.server),
        SsetHandlers
    ], handleResult('Lightweight M2M MiX_____Server started'));
}

function stop() {
    if (globalServerInfo) {
        lwm2mServer.stop(globalServerInfo, handleResult('COAP Server stopped.'));
    } else {
        console.log('\nNo server was listening\n');
    }
}

/**
 * Parses a string representing a Resource ID (representing a complete resource ID or a partial one: either the ID of
 * an Object Type or an Object Instance).
 *
 * @param {String} resourceId       Id of the resource.
 * @param {Boolean} incomplete      If present and true, return incomplete resources (Object Type or Instance).
 * @returns {*}
 */
function parseResourceId(resourceId, incomplete) {
    var components = resourceId.split('/'),
        parsed;

    if (incomplete || components.length === 4) {
        parsed = {
            objectType: components[1],
            objectId: components[2],
            resourceId: components[3]
        };
    }

    return parsed;
}

function write(commands) {
    var obj = parseResourceId(commands[1], false);

    if (obj) {
        lwm2mServer.write(
            commands[0],
            obj.objectType,
            obj.objectId,
            obj.resourceId,
            commands[2],
            handleResult('Value written successfully'));
    } else {
        console.log('\nCouldn\'t parse resource URI: ' + commands[1]);
    }
}

function execute(commands) {
    var obj = parseResourceId(commands[1], false);

    if (obj) {
        lwm2mServer.execute(
            commands[0],
            obj.objectType,
            obj.objectId,
            obj.resourceId,
            commands[2],
            handleResult('Command executed successfully'));
    } else {
        console.log('\nCouldn\'t parse resource URI: ' + commands[1]);
    }
}


function discover(commands) {
    lwm2mServer.discover(commands[0], commands[1], commands[2], commands[3], function handleDiscover(error, payload) {
        if (error) {
            clUtils.handleError(error);
        } else {
            console.log('\nResource attributes:\n----------------------------\n');
            console.log('%s', payload.substr(payload.indexOf(';')).replace(/;/g, '\n').replace('=', ' = '));
            clUtils.prompt();
        }
    });
}

function parseDiscoveredInstance(payload) {
    var resources = payload.substr(payload.indexOf(',') + 1).replace(/<|>/g, '').split(','),
        instance = {
            resources: resources
        };

    return instance;
}

function parseDiscoveredType(payload) {
    var instances = payload.substr(payload.indexOf(',') + 1).replace(/<|>/g, '').split(','),
        type = {
            instances: instances
        };

    return type;
}

function discoverObj(commands) {
    lwm2mServer.discover(commands[0], commands[1], commands[2], function handleDiscover(error, payload) {
        if (error) {
            clUtils.handleError(error);
        } else {
            var parseLoad = parseDiscoveredInstance(payload);

            console.log('\nObject instance\n----------------------------\n');
            console.log('* Resources:')

            for (var i = 0; i < parseLoad.resources.length; i++) {
                console.log('\t- %s', parseLoad.resources[i]);
            }

            console.log('\n');
            clUtils.prompt();
        }
    });
}

function discoverType(commands) {
    lwm2mServer.discover(commands[0], commands[1], function handleDiscover(error, payload) {
        if (error) {
            clUtils.handleError(error);
        } else {
            var parseLoad = parseDiscoveredType(payload);

            console.log('\nObject type attributes:\n----------------------------\n');
            console.log('* Instances:')

            for (var i = 0; i < parseLoad.instances.length; i++) {
                console.log('\t- %s', parseLoad.instances[i]);
            }

            console.log('\n');
            clUtils.prompt();
        }
    });
}

function read(commands) {
    var obj = parseResourceId(commands[1], false);

	

    if (obj) {
        lwm2mServer.read(commands[0], obj.objectType, obj.objectId, obj.resourceId, function (error, result) {
            if (error) {
                clUtils.handleError(error);
            } else {
                console.log('\nResource read:\n----------------------------\n');
                console.log('Id: %s', commands[1]);
                console.log('Value: %s', result);
                clUtils.prompt();
            }
        });
    } else {
        console.log('\nCouldn\'t parse resource URI: ' + commands[1]);
    }
}

function listClients(commands) {
    lwm2mServer.listDevices(function (error, deviceList) {
        if (error) {
            clUtils.handleError(error);
        } else {
            console.log('\nDevice list:\n----------------------------\n');

            for (var i=0; i < deviceList.length; i++) {
                console.log('-> Device Id "%s"', deviceList[i].id);
                console.log('\n%s\n', JSON.stringify(deviceList[i], null, 4));
            }

            clUtils.prompt();
        }
    });
}

function handleValues(value, objectType, objectId, resourceId, deviceId) {
    console.log('\nGot new value: %s\n', value);
    clUtils.prompt();
}

function observe(commands) {
    lwm2mServer.observe(commands[0], commands[1], commands[2], commands[3], handleValues, function handleObserve(error) {
        if (error) {
            clUtils.handleError(error);
        } else {
            console.log('\nObserver stablished over resource [/%s/%s/%s]\n', commands[1], commands[2], commands[3]);
            clUtils.prompt();
        }
    });
}

function parseAttributes(payload) {
    function split(pair) {
        return pair.split('=');
    }

    function group(previous, current) {
        if (current && current.length === 2) {
            previous[current[0]] = current[1];
        }

        return previous;
    }

    return payload.split(',').map(split).reduce(group, {});
}

function writeAttributes(commands) {
    var attributes = parseAttributes(commands[4]);

    if (attributes) {
        lwm2mServer.writeAttributes(commands[0], commands[1], commands[2], commands[3], attributes, function handleObserve(error) {
            if (error) {
                clUtils.handleError(error);
            } else {
                console.log('\nAttributes wrote to resource [/%s/%s/%s]\n', commands[1], commands[2], commands[3]);
                clUtils.prompt();
            }
        });
    } else {
        console.log('\nAttributes [%s] written for resource [/%s/%s/%s]\n', commands[4], commands[1], commands[2], commands[3]);
    }
}

function cancelObservation(commands) {
    lwm2mServer.cancelObserver(commands[0], commands[1], commands[2], commands[3], function handleCancel(error) {
        if (error) {
            clUtils.handleError(error);
        } else {
            console.log('\nObservation cancelled for resource [/%s/%s/%s]\n', commands[1], commands[2], commands[3]);
        }
    });
}

function testRunning(handler) {
    return function(commands) {
        if (lwm2mServer.isRunning()) {
            handler(commands);
        } else {
            console.log('Couldn\'t list devices, as the server is not started. ' +
            'Start the server before issuing any command.');

            clUtils.prompt();
        }
    }
}


//////////////////////////////////////////////////////////////////////////////
//////////////////////////           Client           /////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////


function printObject(result) {
    var resourceIds = Object.keys(result.attributes);
    console.log('\nObject:\n--------------------------------\nObjectType: %s\nObjectId: %s\nObjectUri: %s',
        result.objectType, result.objectId, result.objectUri);

    if (resourceIds.length > 0) {
        console.log('\nAttributes:');
        for (var i=0; i < resourceIds.length; i++) {
            console.log('\t-> %s: %s', resourceIds[i], result.attributes[resourceIds[i]]);
        }
        console.log('\n');
    }
}

function handleObjectFunction(error, result) {
    if (error) {
        clUtils.handleError(error);
    } else {
        printObject(result);
    }
}

function create(command) {
    lwm2mClient.registry.create(command[0], handleObjectFunction);
}

function get(command) {
    lwm2mClient.registry.get(command[0], handleObjectFunction);
}

function remove(command) {
    lwm2mClient.registry.remove(command[0], handleObjectFunction);
}

function set(command) {
    lwm2mClient.registry.setResource(command[0], command[1], command[2], handleObjectFunction);
}

function unset(command) {
    lwm2mClient.registry.unsetResource(command[0], command[1], handleObjectFunction);
}

function list() {
    lwm2mClient.registry.list(function(error, objList) {
        if (error){
            clUtils.handleError(error);
        } else {
            console.log('\nList:\n--------------------------------\n');
            for (var i=0; i < objList.length; i++) {
                console.log('\t-> ObjURI: %s / Obj Type: %s / Obj ID: %s / Resource Num: %d',
                    objList[i].objectUri, objList[i].objectType, objList[i].objectId,
                    Object.keys(objList[i].attributes).length);
            }
        }
    });
}

function handleWrite(objectType, objectId, resourceId, value, callback) {
    console.log('\nValue written:\n--------------------------------\n');
    console.log('-> ObjectType: %s', objectType);
    console.log('-> ObjectId: %s', objectId);
    console.log('-> ResourceId: %s', resourceId);
    console.log('-> Written value: %s', value);

/*
      var receive_to_command = value.split('/');
      for ( var i in value ) {
        console.log( i + receive_to_command[i]);
      }

	// 커스터마이징 write AgenttoDevice;

        lwm2mServer.read(receive_to_command[1], receive_to_command[2],receive_to_command[3],receive_to_command[4], function (error, result) {
            if (error) {
                clUtils.handleError(error);
            } else {
                console.log('\nResource read:\n----------------------------\n');
		var id = '/' + receive_to_command[2] + '/' + receive_to_command[3] +'/' +receive_to_command[4];
                console.log('Id: %s', id);
                console.log('Value: %s', result);
                clUtils.prompt();
            }
        });

	lwm2mServer.write(
            receive_to_command[1],
            receive_to_command[2],
            receive_to_command[3],
            receive_to_command[4],
            receive_to_command[5],
            handleResult('Value written successfully'));
*/


    clUtils.prompt();

    callback(null);
}

function handleExecute(objectType, objectId, resourceId, value, callback) {
    console.log('\nCommand executed:\n--------------------------------\n');
    console.log('-> ObjectType: %s', objectType);
    console.log('-> ObjectId: %s', objectId);
    console.log('-> ResourceId: %s', resourceId);
    console.log('-> Command arguments: %s', value);

	/* Read Command */
	// 0 : read/write/execute , 1 : device_number , 2: objectType, 3: objectID ,4 : resourceID , command 


	var receive_to_command = value.split('/');
/* test command value
      		for ( var i in listofvalue ) {
        		console.log( i + receive_to_command[i]);
     	 	}
*/
	if(receive_to_command[0] == 'read'){

	lwm2mServer.read(receive_to_command[1], receive_to_command[2],receive_to_command[3],receive_to_command[4], function (error, result) {
            if (error) {
                clUtils.handleError(error);
            } else {
                console.log('\nResource read:\n----------------------------\n');
		var readceived_OID = '/' + receive_to_command[2] + '/' + receive_to_command[3];
                console.log('Id: %s', readceived_OID +'/' +receive_to_command[4]);
                console.log('Value: %s', result);

		lwm2mClient.registry.create(readceived_OID, handleObjectFunction);
		lwm2mClient.registry.setResource(readceived_OID, receive_to_command[4], result, handleObjectFunction);

                clUtils.prompt();
            }
        });

	}
	else if(receive_to_command[0] == 'write'){
		lwm2mServer.write(
           	 receive_to_command[1],
            	receive_to_command[2],
            	receive_to_command[3],
            	receive_to_command[4],
            	receive_to_command[5],
            	handleResult('Value written successfully'));
	}


    clUtils.prompt();

    callback(null);
}

function handleRead(objectType, objectId, resourceId, value, callback) {

/*
lwm2mServer.listDevices(function (error, deviceList) {
        if (error) {
            clUtils.handleError(error);
        } else {
	    console.log('-> Device Id "%s"', deviceList[0].id);
            console.log('\n%s\n', JSON.stringify(deviceList[0], null, 4));
            NowDevice = deviceList[0].id;
		console.log(NowDevice);
        }
    });

    lwm2mServer.read(NowDevice, objectType, objectId, resourceId, function (error, result) {
            if (error) {
                clUtils.handleError(error);
            } else {
                console.log('\nResource read:\n----------------------------\n');
                console.log('Id: %s', commands[1]);
                console.log('Value: %s', result);
                
		clUtils.prompt();
            }
        });

*/



    console.log('\nValue read:\n--------------------------------\n');
    console.log('-> ObjectType: %s', objectType);
    console.log('-> ObjectId: %s', objectId);
    console.log('-> ResourceId: %s', resourceId);
    console.log('-> Read Value: %s', value);
    clUtils.prompt();

    callback(null);
}

function setHandlers(deviceInfo) {
    lwm2mClient.setHandler(deviceInfo.serverInfo, 'write', handleWrite);
    lwm2mClient.setHandler(deviceInfo.serverInfo, 'execute', handleExecute);
    lwm2mClient.setHandler(deviceInfo.serverInfo, 'read', handleRead);
}

function connect(command) {
    var url;

    console.log('\nConnecting to the server. This may take a while.\n');

    if (command[2] === '/') {
        url = command[2];
    }

    lwm2mClient.register(command[0], command[1], command[3], command[2], function (error, deviceInfo) {
	
        if (error) {
            clUtils.handleError(error);
        } else {
            globalDeviceInfo = deviceInfo;
            setHandlers(deviceInfo);
            console.log('\nConnected:\n--------------------------------\nDevice location: %s', deviceInfo.location);
            clUtils.prompt();
        }
    });
}

function disconnect(command) {
    if (globalDeviceInfo) {
        lwm2mClient.unregister(globalDeviceInfo, function(error) {
            if (error) {
                clUtils.handleError(error);
            } else {
                console.log('\nDisconnected:\n--------------------------------\n');
                clUtils.prompt();
            }
        });
    } else {
        console.error('\nCouldn\'t find device information (the connection may have not been completed).');
    }
}

function updateConnection(command) {
    if (globalDeviceInfo) {
        lwm2mClient.update(globalDeviceInfo, function(error, deviceInfo) {
            if (error) {
                clUtils.handleError(error);
            } else {
                globalDeviceInfo = deviceInfo;
                setHandlers(deviceInfo);
                console.log('\Information updated:\n--------------------------------\n');
                clUtils.prompt();
            }
        });
    } else {
        console.error('\nCouldn\'t find device information (the connection may have not been completed).');
    }
}

function quit(command) {
    console.log('\nExiting client\n--------------------------------\n');
    process.exit();
}


var commands = {
    'S_start': {
        parameters: [],
        description: '\tStarts a new Lightweight M2M server listening in the prefconfigured port.',
        handler: start
    },
    'S_stop': {
        parameters: [],
        description: '\tStops the current LWTM2M Server running.',
        handler: testRunning(stop)
    },
    'S_list': {
        parameters: [],
        description: '\tServer____List all the devices connected to the server.',
        handler: testRunning(listClients)
    },
    'S_write': {
        parameters: ['deviceId', 'resourceId', 'resourceValue'],
        description: '\tWrites the given value to the resource indicated by the URI (in LWTM2M format) in the given' +
            'device.',
        handler: testRunning(write)
    },
    'S_execute': {
        parameters: ['deviceId', 'resourceId', 'executionArguments'],
        description: '\tExecutes the selected resource with the given arguments.',
        handler: testRunning(execute)
    },
    'S_read': {
        parameters: ['deviceId', 'resourceId'],
        description: '\tReads the value of the resource indicated by the URI (in LWTM2M format) in the given device.',
        handler: testRunning(read)
    },
    'S_discover': {
        parameters: ['deviceId', 'objTypeId', 'objInstanceId', 'resourceId'],
        description: '\tSends a discover order for the given resource to the given device.',
        handler: testRunning(discover)
    },
    'S_discoverObj': {
        parameters: ['deviceId', 'objTypeId', 'objInstanceId'],
        description: '\tSends a discover order for the given instance to the given device.',
        handler: testRunning(discoverObj)
    },
    'S_discoverType': {
        parameters: ['deviceId', 'objTypeId'],
        description: '\tSends a discover order for the given resource to the given device.',
        handler: testRunning(discoverType)
    },
    'S_observe': {
        parameters: ['deviceId', 'objTypeId', 'objInstanceId', 'resourceId'],
        description: '\tStablish an observation over the selected resource.',
        handler: testRunning(observe)
    },
    'S_writeAttr': {
        parameters: ['deviceId', 'objTypeId', 'objInstanceId', 'resourceId', 'attributes'],
        description: '\tWrite a new set of observation attributes to the selected resource. The attributes should be\n\t ' +
            'in the following format: name=value(,name=value)*. E.g.: pmin=1,pmax=2.',
        handler: testRunning(writeAttributes)
    },
    'S_cancel': {
        parameters: ['deviceId', 'objTypeId', 'objInstanceId', 'resourceId'],
        description: '\tCancel the observation order for the given resource (defined with a LWTM2M URI) ' +
            'to the given device.',
        handler: testRunning(cancelObservation)
    },
    'S_config': {
        parameters: [],
        description: '\tPrint the current config.',
        handler: clUtils.showConfig(config, 'server')
    },
    'C_create': {
        parameters: ['objectUri'],
        description: '\tCreate a new object. The object is specified using the /type/id OMA notation.',
        handler: create
    },
    'C_get': {
        parameters: ['objectUri'],
        description: '\tGet all the information on the selected object.',
        handler: get
    },
    'C_remove': {
        parameters: ['objectUri'],
        description: '\tRemove an object. The object is specified using the /type/id OMA notation.',
        handler: remove
    },
    'C_set': {
        parameters: ['objectUri', 'resourceId', 'resourceValue'],
        description: '\tSet the value for a resource. If the resource does not exist, it is created.',
        handler: set
    },
    'C_unset': {
        parameters: ['objectUri', 'resourceId'],
        description: '\tRemoves a resource from the selected object.',
        handler: unset
    },
    'C_list': {
        parameters: [],
        description: '\tClient____List all the available objects along with its resource names and values.',
        handler: list
    },
    'C_connect': {
        parameters: ['host', 'port', 'endpointName', 'url'],
        description: '\tConnect to the server in the selected host and port, using the selected endpointName.',
        handler: connect
    },
    'C_updateConnection': {
        parameters: [],
        description: '\tUpdates the current connection to a server.',
        handler: updateConnection
    },
    'C_disconnect': {
        parameters: [],
        description: '\tDisconnect from the current server.',
        handler: disconnect
    },
    'C_config': {
        parameters: [],
        description: '\tPrint the current config.',
        handler: clUtils.showConfig(config, 'client')
    },
    'C_quit': {
        parameters: [],
        description: '\tExit the client.',
        handler: quit
    }
};


function straight() {
    
	var url;

	lwm2mClient.registry.create('/10000/1', handleObjectFunction);
	lwm2mClient.registry.setResource('/10000/1', '1', '1', handleObjectFunction);
	lwm2mClient.register('localhost', '5684', '/', 'list_set', function (error, deviceInfo) {
        if (error) {
            clUtils.handleError(error);
        } else {
            globalDeviceInfo = deviceInfo;
            setHandlers(deviceInfo);
            console.log('\nConnected:\n--------------------------------\nDevice location: %s', deviceInfo.location);
		console.log( deviceInfo);
              clUtils.prompt();
        }
    });

	var obj_list;
	lwm2mClient.registry.list(function(error, objList) {
        if (error){
            clUtils.handleError(error);
        } else {
            obj_list =objList;
        }
    });
  	console.log(obj_list);
}


///// 코드 실제 실행부
lwm2mClient.init(require('../config2'));

clUtils.initialize(commands, 'LWM2M-MIX_Server> ');

// default 연결용 object & resource
straight();

clUtils.prompt();

