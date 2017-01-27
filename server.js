var config = require("./config.json");

var shell = require('shelljs');

// Require MQTT and setup the connection to the broker
var mqtt = require('mqtt');
var client  = mqtt.connect(config.mqtt.url);

var servertimestamp = 0;
var latency = 0;
console.log("Server module is starting");
// Connect to the MQTT server
var mqttClient  = mqtt.connect(config.mqtt.url);

// MQTT connection function
mqttClient.on('connect', function () {
    console.log("Connected to MQTT server");

    // Subscribe to the MQTT topics
    mqttClient.subscribe('announcements');
    mqttClient.subscribe('sensors/+/data');
});

shell.echo('hello world');
servertimestamp = Date.now();
console.log('Server Timestamp: ' + servertimestamp);
var output = shell.exec('~/google_latency/weave_client-0.1.15/weave_client.sh command -d d15746 -n onOff.setConfig state=off -v -w').output;

// console.log(output);


// A function that runs when MQTT receives a message
mqttClient.on('message', function (topic, message) {

    // Parse the incoming data
    try {
        json = JSON.parse(message);
    } catch(e){
        console.log(e);
    }

    // Is the message a announcement of a new sensor on the network
    if (topic.match(/announcements/)) {
        console.log("Received an announcement of a new light sensor");
        console.log(topic + ":" + message.toString());

    };

    // Is the message a new sensor data reading
    if (topic.match(/data/)) {
      console.log("Received data from Light sensor");
      console.log(topic + ":" + message.toString());
      if(json.lampOn){
        latency = json.timestamp - servertimestamp;
        console.log('ON Latency: '+ latency);
        servertimestamp = Date.now();
        shell.exec('~/google_latency/weave_client-0.1.15/weave_client.sh command -d d15746 -n onOff.setConfig state=off -v -w').output;
      } else if(json.lampOff){
        latency = json.timestamp - servertimestamp;
        console.log('OFF Latency: '+ latency);
        servertimestamp = Date.now();
        shell.exec('~/google_latency/weave_client-0.1.15/weave_client.sh command -d d15746 -n onOff.setConfig state=on -v -w').output;
      } else {
        console.log('Something is fishy');
      }
        };

});
