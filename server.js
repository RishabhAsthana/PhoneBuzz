const express = require('express');
const VoiceResponse = require('twilio').twiml.VoiceResponse;
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

app.post('/voice', (req, res) => {
	const twiml = new VoiceResponse();
	twiml.say('Hello, Welcome to Phone Buzz!');

	const gather = twiml.gather({
	  input: 'dtmf',
	  timeout: 10,
	  numDigits: 3,
	  finishOnKey: '#',
	  action: '/action',
	  method: 'POST',
	});
	gather.say('Please input a number, then press the pound symbol.');

	console.log(twiml.toString());

	res.type('text/xml');
	res.send(twiml.toString());
});

app.post('/action', (req, res) =>{
	const twiml = new VoiceResponse();
	let digits = parseInt(req.body.Digits, 10);
	let result = ''
	for (let i = 1; i <= digits; i++){
		res += i.toString() + ' ';
	}
	console.log(result);
	twiml.say(result);
	res.send(twiml.toString());
});

app.get('/', (req, res) => {
	res.send('Server is up and running');
});

app.listen(80, function(){
	console.log("Listening on port 80");
});

//https://demo.twilio.com/welcome/voice/