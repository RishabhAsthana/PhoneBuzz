const express = require('express');
const VoiceResponse = require('twilio').twiml.VoiceResponse;

const app = express();

app.post('/voice', (req, res) => {
	const twiml = new VoiceResponse();
	twiml.say('Hello, Wanli Wang is so hot!');

	const gather = twiml.gather({
	  input: 'dtmf',
	  timeout: 10,
	  numDigits: 3,
	  finishOnKey: '#',
	});
	gather.say('Input a number.');

	console.log(twiml.toString());

	res.type('text/xml');
	res.send(twiml.toString());
});

app.post('/action', (req, res) =>{
	console.log("Action performed");
});

app.get('/', (req, res) => {
	res.send('Server is up and running');
});

app.listen(80, function(){
	console.log("Listening on port 80");
});

//https://demo.twilio.com/welcome/voice/