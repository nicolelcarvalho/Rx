// Loading evnironmental variables here
if (process.env.NODE_ENV !== 'production') {
	console.log('loading dev environments')
	require('dotenv').config()
}
require('dotenv').config()

const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const logger = require("morgan");
const mongoose = require("mongoose");
const path = require("path");
const PORT = process.env.PORT || 3001;
const moment = require('moment');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const passport = require('./passport');
const dbConnection = require('./db');
const User = require('./db/models/User')
const Patient = require('./db/models/Patients')
const Reminder = require('./db/models/Reminders')



//================ MIDDLEWARE ================= //
app.use(logger('dev'))
app.use(
	bodyParser.urlencoded({
		extended: false
	})
)
app.use(bodyParser.json())
app.use(
	session({
		secret: process.env.APP_SECRET || 'this is the default passphrase',
		store: new MongoStore({ mongooseConnection: dbConnection }),
		resave: false,
		saveUninitialized: false
	})
)


//================ PASSPORT ================= //
app.use(passport.initialize())
app.use(passport.session()) // will call the deserializeUser


app.use('/auth', require('./passport/auth'))

// ====== Error handler ====
app.use(function(err, req, res, next) {
	console.log('====== ERROR =======')
	console.error(err.stack)
	res.status(500)
})

//==================================Twilio=========================================
const twilio = require('twilio');
const accountSid = 'AC48ce06d27e69dece3a0702596ee55a08';
const authToken = 'a9d53929a8bf32774108b4644960dba8';
const client = require('twilio')(accountSid, authToken);


// Logic to text/receive/update reminders
clock = () => {
	// Get the current minute
	let minutes = moment().format('mm');

	if(minutes == 00 || minutes == 30) {
		// Query the db to check for tasks every 0 and 30 minutes 
		queryDB();
	}
}

// Run the clock function every minute
setInterval(clock, 60000);

let day;
switch (new Date().getDay()) {
    case 0:
        day = "Sunday";
        break;
    case 1:
        day = "Monday";
        break;
    case 2:
        day = "Tuesday";
        break;
    case 3:
        day = "Wednesday";
        break;
    case 4:
        day = "Thursday";
        break;
    case 5:
        day = "Friday";
        break;
    case 6:
        day = "Saturday";
}


// Go into DB and find all reminders on a specified day and time and get patient phone and task to be texted
queryDB = () => {

	// Get the full current time to compare with DB
	let time = moment().format('HH:mm');

	if(time === "0:0") {
	  Reminder.find({}, {responseLate: false, responseReceived: false}).then(function(reminders) {
		    console.log("reminders have been reset " + reminders)
		  }).catch(function(err) {
		    res.json(err);
		  })
		}


	Patient.find({}).then(function(patients) {

var d = new Date();
		var currentMinutes = d.getMinutes();

		if (currentMinutes >= 30) {
			currentMinutes = "30";
		} else {
			currentMinutes = "00";
		}

		var currentHours = d.getHours();

		var timeDue = currentHours + ":" + currentMinutes;	
		// Loop through all of the patients information in the db
		for (let i = 0; i < patients.length; i++) {
			// Get the patient's phone and all of their reminders
			let currentPatient = patients[i];
			let patientPhone = currentPatient.patientPhone;
			let remindersArray = currentPatient.reminders;

			// Loop through each of the patient's reminders and get the reminderId
			for (let j = 0; j < remindersArray.length; j++) {
				let reminderId = remindersArray[j];

				// Query into db to find the id of each reminder based on what day and time it is as well as if the responseReceived = false
				Reminder.find({_id: reminderId, dayToComplete: day, timeToComplete: timeDue, responseReceived: false, responseLate: false}).then(function(reminders) {
					// console.log(reminders + " " + patientPhone);
					for (let i = 0; i < reminders.length; i++) {
						// Get the body of the reminderMessage. Can also get the reminder photo
						let textMessage = reminders[i].reminderMessage;
						let pictureUrl = reminders[i].reminderImage;

					// Text the patients. 
					// If the pictureUrl is true, send a picture text message
					// Else send a regular text message without a picture

					if(pictureUrl) {
					client.messages
					  .create({
					    to: '+1' + patientPhone, // Text this number
					    from: '+14848123347', // Our valid Twilio number
					    body: textMessage,
					    mediaUrl: pictureUrl,
					  })
					  .then(message => console.log(message.sid));
					} else { 
				    client.messages.create({
				        body: textMessage + " Please respond 'YES' when finished.",
				        to: "+1" + patientPhone,  // Text this number
				        from: '+14848123347' // Our valid Twilio number
				    })
				    // Log that the message was sent.
				    .then((message) => console.log(message.sid));
				  }

					}
				})
			}
		}
	}); // End Patient.find query


   
    // Then, we query all users, get their phone numbers
	User.find({}).then(function(users) {

		var d = new Date();
		var currentMinutes = d.getMinutes();

		if (currentMinutes >= 30) {
			currentMinutes = "30";
		} else {
			currentMinutes = "00";
		}

		var currentHours = d.getHours();

		var timeDue = currentHours + ":" + currentMinutes;	

    // Loop through their patients, get their IDs 
    for (var i = 0; i < users.length; i++) {
 		let currentUserId = users[i]._id;
 		let userPhone = users[i].phone;
 		let userFirstName = users[i].firstName;
 		let userLastName = users[i].lastName;
 		let userPatientsId = users[i].patients;
    	console.log("current user: " + currentUserId + " phone: " + userPhone +  " patient: " + userPatientsId);

    	Patient.find({_id: userPatientsId}).then(function(patients) {
    		for (var i = 0; i < patients.length; i++) {
    			let remindersArray = patients[i].reminders;
    			let patientName = patients[i].patientName;

	 			// Loop through each of the patient's reminders and get the reminderId
				for (let j = 0; j < remindersArray.length; j++) {
					let reminderId = remindersArray[j];

 			    // Find the reminders of that patient with the receiveResponseBy = timeDue and if responseReceived = false   
		    	Reminder.find({_id: reminderId, dayToComplete: day, receiveResponseBy: timeDue, responseReceived: false, responseLate: false}).then(function(reminders) {
			    	console.log(reminders);

			    	for (var i = 0; i < reminders.length; i++) {
				    	let lateReminderBody = reminders[i].reminderMessage;
				    	let timeToBeCompleted = reminders[i]. timeToComplete;
						console.log( "userPhone: " + userPhone + userFirstName + ", " + patientName + " did not complete the following reminder: " + lateReminderBody + ", which was scheduled for " + timeToBeCompleted);
						
						  // Update reminder in db as responseLate: true
						  Reminder.findOneAndUpdate({_id: reminderId}, {responseLate: true}).then(function(lateReminder) {
							    console.log("reminder has been set to late: " + lateReminder)
							  }).catch(function(err) {
							    res.json(err);
							  })

						// Send text to user that the response is late
						    client.messages.create({
						        body: userFirstName + ", " + patientName + " did not complete the following reminder: " + lateReminderBody + ", which was scheduled for " + timeToBeCompleted,
						        to: "+1" + userPhone,  // Text this number
						        from: '+14848123347' // Our valid Twilio number
						    })
						    // Log that the message was sent.
						    .then((message) => console.log(message.sid));
						  }
			    	});
		    	}

	    		}
    	  	});

    	  }
    });



//==================================Twilio Respond to Text=========================================

const MessagingResponse = require('twilio').twiml.MessagingResponse;


app.post('/sms', (req, res) => {
  const twiml = new MessagingResponse();

  console.log(
  	"*********************************************************  server req: ");
  console.log(req.body);
  console.log(req._startTime);

  twiml.message('Great!');

  res.writeHead(200, {'Content-Type': 'text/xml'});
  res.end(twiml.toString());

	var string =  req.body.From;
	var array = string.split("");
	array = array.slice(2);
	array = array.join("")
	console.log(array);

  Patient.find({patientPhone: array}).then(function(patients) {

		// Loop through all of the patients information in the db
		for (let i = 0; i < patients.length; i++) {
			// Get the patient's phone and all of their reminders
			let currentPatient = patients[i];
			let patientPhone = currentPatient.patientPhone;
			let remindersArray = currentPatient.reminders;

			// Loop through each of the patient's reminders and get the reminderId
			for (let j = 0; j < remindersArray.length; j++) {
				let reminderId = remindersArray[j];
				console.log(reminderId);

				var d = new Date();
				var currentMinutes = d.getMinutes();

				if (currentMinutes >= 30) {
					currentMinutes = "30";
				} else {
					currentMinutes = "00";
				}

				var currentHours = d.getHours();

				var timeDue = currentHours + ":" + currentMinutes;

			  Reminder.find({_id: reminderId, dayToComplete: {$in: [day]}, timeToComplete: timeDue }).then(function(reminders) {
			  	console.log(reminders);
			  	for (var i = 0; i < reminders.length; i++) {
			  		var updateReminderId = reminders[i];

				  Reminder.findOneAndUpdate({_id: updateReminderId}, {responseReceived: true}).then(function(completeReminder) {
					    console.log("reminder has been set to true: " + completeReminder)
					  }).catch(function(err) {
					    res.json(err);
					  })

			  	}

				})
		}
	}

})
})

//==================================Routes=========================================

// // Main "/" Route. This will redirect the user to our rendered React application
app.use("/static", express.static(path.join(__dirname, "./build/static")));

app.get("/", function(req, res) {
  res.sendFile(__dirname + "/build/index.html");
});



// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});

