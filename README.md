# PhoneBuzz
A web app to play fizz-buzz over the phone
## Setup
First, Clone this repository

Frontend and Backend are organised into separate folders, and in this scenario would be hosted on two different servers
### To setup backend
> 1. Navigate to backend folder
> 2. Install the required modules by running 'npm install'
> 3. Replace the placeholder tokens in file config/secrets.js with your own. You'll need a live mongoDB url (mLab is a good option) and a Twilio access token (free works too)
> 4. Replace the 'host_address' in server.js variable content with the URL of API access point. This depends on the server you use to access this API.
> 5. Start the server by 'npm start'
### To setup frontend
> 1. Navigate to frontend folder
> 2. Install the required modules by running 'npm install'
> 3. In src/components/App.js, Replace the 'api_url' variable content with the URL of API access point. This depends on the server you use to access this API.
> 4. Start the server by 'npm start'
## Demo
This application is hosted on Heroku, to see this in action, visit:
> Frontend : https://floating-dusk-86285.herokuapp.com/

The backend is also hosted on Heroku at :
> Backend : https://hidden-escarpment-85887.herokuapp.com/

## Author
Rishabh Asthana {asthana4@illinois.edu}

