const express = require('express');
const VoiceResponse = require('twilio').twiml.VoiceResponse;

const app = express();

app.post('/voice', (req, res) => {
	const twiml = new VoiceResponse();
	twiml.say('Hello, Wanli Wang is so hot!');

	const gather = twiml.gather({
	  input: 'dtmf',
	  timeout: 3,
	  numDigits: 1,
	});
	gather.say('Input a number.');

	console.log(twiml.toString());

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