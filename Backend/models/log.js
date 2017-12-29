/*  
 *  File: log.js
 *  Contains the definition for log schemea
 *  @author: Rishabh Asthana {asthana4@illinois.edu}
 */
// Load required packages
var mongoose = require('mongoose');

// Define log schema
var LogSchema = new mongoose.Schema({
    phone_number: {type: String, required: true},
    number: {type: String, default: ''},
    delay: {type: Number, default: 0},
    dateCreated : {type: Date, default: Date.now}
});

// Export the Mongoose model
module.exports = mongoose.model('Log', LogSchema);
