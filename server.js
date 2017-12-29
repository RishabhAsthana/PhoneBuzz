const express = require('express');
const VoiceResponse = require('twilio').twiml.VoiceResponse;
const bodyParser = require('body-parser');
const accountSid = 'AC0ddb9be538585678441b7109383c79dd';
const cors = require('cors');
const secrets = require('./config/secrets');
const client = require('twilio')(accountSid, secrets.twilio_authToken);
const mongoose = require('mongoose');

const app = express();

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(cors());

// Connect to a MongoDB
mongoose.connect(secrets.mongo_connection, { useMongoClient: true});
let logs = require('./models/log');

app.post('/call', (req, res) =>{
	let delay = 0;
    if(req.body.delay){
    	delay = req.body.delay;
    	console.log('Delay provided in ms : ' + delay);
    }
    setTimeout(function(){
	    console.log('Calling : ' + req.body.number);
		client.calls.create({
		url: 'http://104.236.220.169/voice',
		to: req.body.number,
		from: '+12173344037',
		})
		.then((call) => {
			console.log(call.sid);
			res.send('Call complete');
		});	    	
    }, delay);

});

function fizzBuzz(twiml, digits){
	let result = '';
	for (let i = 1; i <= digits; i++){
		if(i % 3 == 0 && i % 5 == 0)
			result = 'FizzBuzz';
		else if(i % 3 == 0)
			result = 'Fizz';
		else if(i % 5 == 0)
			result = 'Buzz'
		else
			result = i.toString();
		twiml.say(result);
	} 
	twiml.hangup();	
}

app.post('/replayCall', (req, res) => {
	let uri = encodeURIComponent('http://104.236.220.169/replay?digits=' + req.body.digits);
	client.calls.create({
		url: uri,
		to: req.body.number,
		from: '+12173344037',
		})
		.then((call) => {
			console.log(call.sid);
			res.send('Replay complete');
		});	    	
});

app.get('/replay', (req, res) => {
	console.log('Replay digits : ' + req.params.digits);
	let digits = parseInt(req.params.digits, 10);
	const twiml = new VoiceResponse();
	fizzBuzz(twiml, digits);
	res.type('text/xml');
	res.send(twiml.toString());
});

app.post('/voice', (req, res) => {

	const twiml = new VoiceResponse();
	if(req.body.Digits){
		let digits = parseInt(req.body.Digits, 10);
		fizzBuzz(twiml, digits);
	}
	twiml.say('Hello, Welcome to Phone Buzz!');
	const gather = twiml.gather({
	  input: 'dtmf',
	  timeout: 10,
	  numDigits: 3,
	  finishOnKey: '#',
	});
	gather.say('Please input a number, then press the pound symbol.');
	res.type('text/xml');
	res.send(twiml.toString());
});

app.get('/', (req, res) => {
	res.send('Server is up and running');
});

// On POST /log
app.post('/log', (req, res) => {

	// Collect the data from body
	var logProfile = {
		phone_number: req.body.phone_number,
		number: req.body.number,
		delay: req.body.delay,
	}
	// Validate required fields are present
  	if(logProfile.phone_number == null){
    		return res.status(500).send({
    			message: "Phone number field is missing",
    			data: [],
    	});
	}

	// Create the user document
	logs.create(logProfile, function(err, log){
	  	
	  	if(err){
	    		return res.status(500).send({
	    			message: err,
	    			data: [],
	    	});
		}
    	else{
    			return res.status(201).send({
					message: 'OK',
					data: log,
    		});
		}
	
	});

});

// On GET /logs
app.get('/logs', function (req, res) {

    logs.find({}, function(err, log_list){
    	if(err){
    		return res.status(500).send({
    			message: err,
    			data: [],
    		});
    	}
    	else{
    		return res.status(200).send({
    			message: 'OK',
    			data: log_list,
    		});
    	}
    })
});

app.listen(80, function(){
	console.log("Listening on port 80");
});
