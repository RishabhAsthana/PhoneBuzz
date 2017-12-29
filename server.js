const express = require('express');
const VoiceResponse = require('twilio').twiml.VoiceResponse;
const bodyParser = require('body-parser');
const accountSid = 'AC0ddb9be538585678441b7109383c79dd';
const authToken = '039e815a743658de251d3c7af82624ef';
const client = require('twilio')(accountSid, authToken);

const app = express();

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

app.post('/call', (req, res) =>{

	let delay = req.body.delay;
    if(delay){
    	console.log('Delay provided : ' + delay);
    }
	client.calls.create({
	url: 'http://104.236.220.169/voice',
	to: req.body.number,
	from: '+12173344037',
	})
	.then((call) => console.log(call.sid));	
});

app.post('/voice', (req, res) => {

	const twiml = new VoiceResponse();
	if(req.body.Digits){
		let digits = parseInt(req.body.Digits, 10);
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

app.listen(80, function(){
	console.log("Listening on port 80");
});

//https://demo.twilio.com/welcome/voice/
