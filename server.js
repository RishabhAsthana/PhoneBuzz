const express = require('express');
const twilio = require('twilio');
const VoiceResponse = require('twilio').twiml.VoiceResponse;
const bodyParser = require('body-parser');
const accountSid = 'AC0ddb9be538585678441b7109383c79dd';
const cors = require('cors');
const secrets = require('./config/secrets');
const client = require('twilio')(accountSid, secrets.twilio_authToken);
const mongoose = require('mongoose');
const axios = require('axios');

const app = express();

// Use body parser to deconstruct the POST forms
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
// Use CORS to allow Frontend to communicate properly
app.use(cors());

// Connect to a MongoDB
mongoose.connect(secrets.mongo_connection, { useMongoClient: true});
let logs = require('./models/log');

// Temporary storage for the data associated with a log in the database 
let last_phone_number = '';
let last_digits = '';
let last_delay = '';

/*  POST : /call
 *  This endpoint when called places a call to the provided 'number' in the form body and after
 * 'delay' number of milliseconds have passed.
 */
app.post('/call', (req, res) =>{
	let delay = 0;
	// If there was a delay field provided, use that instead otherwise stick with no delay (0)
    if(req.body.delay){
    	delay = req.body.delay;
    	console.log('Delay provided in ms : ' + delay);
    }
    setTimeout(function(){
	    console.log('Calling : ' + req.body.number);
	    // Record the appropriate data
	    last_phone_number = req.body.number;
	    last_delay = delay;
	    // Make the call after delay(ms)
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

/*  
 * This function generates the Fizz-buzz series upto the given 'digits' number and conveys it back to the users
 * @params:
 * twiml: Voice response twilio object
 * digits: Number indicating the last number in Fizz-buzz series
 */
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
	// Hang the phone when done
	twiml.hangup();	
}

/*  POST : /replayCall
 *  This endpoint when called replays a call to the provided 'number' in the form body,
 *  with the 'digits' being the last number in Fizz-buzz series, provided by the user in that particular call
 */
app.post('/replayCall', (req, res) => {
	console.log("Replaying a call");
	let uri = 'http://104.236.220.169/replay/'+ req.body.digits;
	console.log(uri);
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

/*  POST : /replay/:digits
 *  This endpoint when called responds with twiml to recite Fizz-buzz series upto the 'digits' number
 */
app.post('/replay/:digits', (req, res) => {
	console.log('Replay digits : ' + req.params.digits);
	let digits = parseInt(req.params.digits, 10);
	const twiml = new VoiceResponse();
	fizzBuzz(twiml, digits);
	res.type('text/xml');
	res.send(twiml.toString());
});

/*  POST : /voice
 *  This endpoint when called responds with twiml to ask user to input a number ending with a '#' symbol.
 *  However, if the POST form contains 'Digits' parameter, the user input is not asked instead twiml
 *  generated upto the 'Digits' parameter is returned.
 *  For further information, please refer to:
 *  https://www.twilio.com/docs/guides/how-to-respond-to-incoming-phone-calls-in-node-js
 */
app.post('/voice', twilio.webhook(), (req, res) => {

	// Verify that X-Twilio-Signature header is present, we only care about Twilio enabled numbers
	if(!req.headers['x-twilio-signature']){
		res.json('No X-Twilio-Signature header found');
		return;
	}
	const twiml = new VoiceResponse();
	// If the 'Digits' param was present
	if(req.body.Digits){
		let digits = parseInt(req.body.Digits, 10);
		let last_digits = digits;
		// Create a entry the database with appropriate data
    	axios.post('http://104.236.220.169/log', {
	        phone_number: last_phone_number,
	        number: last_digits,
	        delay: last_delay
	        }).then(function(response){
	            console.log('Log added : ' + response);
	        }).catch(function(err){
	            console.log('Error occured : ' + JSON.stringify(err));
        	});
		fizzBuzz(twiml, digits);
	}
	// Otherwise ask user for input
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

/*  POST : /log
 *  This endpoint when called creates an entry in the database using the parameters present inside the POST form body
 */
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
	// Create the log document
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

/*  GET : /logs
 *  This endpoint when called returns all the call logs present in the database
 */
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

// Start listening in port 80
app.listen(80, function(){
	console.log("Listening on port 80");
});
