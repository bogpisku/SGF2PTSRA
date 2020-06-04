window.onload = function() {
    // TODO:: Do your initialization job
    // add eventListener for tizenhwkey
    document.addEventListener('tizenhwkey', function(e) {
        if (e.keyName === "back") {
            try {
                tizen.application.getCurrentApplication().exit();
            } catch (ignore) {}
        }
    });

    // Sample code
    var mainPage = document.querySelector('#main');
    //ARE THE SENSORS ACTIVE???
    var gyroActive = false;
    var gravActive = false;
    var screenLock = false;
    
    //Sensors
    var gyroSensor = tizen.sensorservice.getDefaultSensor('GYROSCOPE');
    var gravSensor = tizen.sensorservice.getDefaultSensor('GRAVITY');
    //SERVER CONNECTION
    var socketConnect=false;
    var webSocketUrl = 'ws://192.168.1.73:8080/socket.io/?EIO=3&transport=websocket';
    var webSocket;

    mainPage.addEventListener("click", function() {
        var contentText = document.querySelector('#content-text');
        contentText.innerHTML = (contentText.innerHTML === "Start") ? "Stop" : "Start";
        //Active or Deactive the sensors
        active_deactiveServices();
        //ConnectToServer
        connectToServer();
    });

    function connectToServer(){
    	if(!socketConnect){
    		webSocket = new WebSocket(webSocketUrl);
    		/* If the connection is established */
    		webSocket.onopen = function(e) {
    		    console.log('connection open, readyState: ' + e.target.readyState);
    		};

    		/* If the connection fails or is closed with prejudice */
    		webSocket.onerror = function(e) {
    		    /* Error handling */
    			console.log(e);
    		};
    	}
    }
    function sendMessage(msg) {
        if (webSocket.readyState === 1) {
            webSocket.send(msg);
        }
    }
    function active_deactiveServices() {
        //IF IS ACTIVE STOP THE SERVICE ELSE START THE SENSOR
        if (gyroActive) {

            console.log('Stopping  gyro service');
            gyroSensor.unsetChangeListener();
            gyroSensor.stop();
            gyroActive = false;
        } else {
            gyroSensor.start(gyroOnsuccessCB);
            gyroSensor.setChangeListener(gyroOnchangedCB, 400);

        }
        if (gravActive) {
            console.log('Stopping  grav service');
            gravSensor.unsetChangeListener();
            gravSensor.stop();
            gravActive = false;
        } else {
        	gravSensor.setChangeListener(gravOnchangedCB, 100);
            gravSensor.start(gravOnsuccessCB);

        }
        if(!screenLock){
        	tizen.power.request("SCREEN", "SCREEN_NORMAL");
        	screenLock=true;
        }else{
        	tizen.power.release("SCREEN");
        }
    }

    //On SUCCESS CONECTION
    function gyroOnsuccessCB() {
        console.log("GYROSCOPE Sensor start");
        gyroActive = true;

    }

    function gravOnsuccessCB() {
            console.log("GRAVITY Sensor start");
            gravActive = true;
        }
    
    //LISTENER TO GET DATA
    function gyroOnchangedCB(sensorData) {
    	var contentTextX = document.querySelector('#gyroX');
        contentTextX.innerHTML = "gyro X: "+sensorData.x.toFixed(5);
        
        var contentTextY = document.querySelector('#gyroY');
        contentTextY.innerHTML = "gyro Y: "+sensorData.y.toFixed(5);
        
        var contentTextZ = document.querySelector('#gyroZ');
        contentTextZ.innerHTML = "gyro Z: "+sensorData.z.toFixed(5);
        
        
        //Send Data to server
        sendMessage("{\"type\":\"gyro\",\"data\":{\"x\":"+sensorData.x+",\"y\":"+sensorData.y+",\"z\":"+sensorData.z+"}}");
        
        //console.log("GYROSCOPE DATA[ x: " + sensorData.x +" , y: "+sensorData.y+" , z: "+sensorData.z+" ]");
    }
    function gravOnchangedCB(sensorData) {
    	var contentTextX = document.querySelector('#gravX');
        contentTextX.innerHTML = "grav X: "+sensorData.x.toFixed(5);
        
        var contentTextY = document.querySelector('#gravY');
        contentTextY.innerHTML = "grav Y: "+sensorData.y.toFixed(5);
        
        var contentTextZ = document.querySelector('#gravZ');
        contentTextZ.innerHTML = "grav Z: "+sensorData.z.toFixed(5);
        sendMessage("{\"type\":\"grav\",\"data\":{\"x\":"+sensorData.x+",\"y\":"+sensorData.y+",\"z\":"+sensorData.z+"}}");
    	//console.log("GRAVITY DATA[ x: " + sensorData.x +" , y: "+sensorData.y+" , z: "+sensorData.z+" ]");
    }

};