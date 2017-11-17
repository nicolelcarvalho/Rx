const express = require('express')
const router = express.Router()
const User = require('../../db/models/User')
const passport = require('passport')
const Patient = require('../../db/models/Patients')
const Reminder = require('../../db/models/Reminders')
const moment = require('moment');

//==================================Twilio=========================================
const twilio = require('twilio');
const accountSid = 'AC48ce06d27e69dece3a0702596ee55a08';
const authToken = 'a9d53929a8bf32774108b4644960dba8';
const client = require('twilio')(accountSid, authToken);


// this route is just used to get the user basic info
router.get('/user', (req, res, next) => {
	console.log('===== user!!======')
	console.log(req.user)
	if (req.user) {
		return res.json({ user: req.user })
	} else {
		return res.json({ user: null })
	}
})

router.post(
	'/login',
	function(req, res, next) {
		console.log(req.body)
		console.log('================')
		next()
	},
	passport.authenticate('local'),
	(req, res) => {
		console.log('POST to /login')
		const user = JSON.parse(JSON.stringify(req.user)) // hack
		const cleanUser = Object.assign({}, user)
		if (cleanUser.local) {
			console.log(`Deleting ${cleanUser.local.password}`)
			delete cleanUser.local.password
		}
		res.json({ user: cleanUser })
	}
)

router.post('/logout', (req, res) => {
	if (req.user) {
		req.session.destroy()
		res.clearCookie('connect.sid') // clean up!
		return res.json({ msg: 'logging you out' })
	} else {
		return res.json({ msg: 'no user to log out!' })
	}
})

router.post('/signup', (req, res) => {
	const { email, password, phone, firstName, lastName } = req.body
	// ADD VALIDATION
	User.findOne({ 'local.email': email }, (err, userMatch) => {
		if (userMatch) {
			return res.json({
				error: `Sorry, already a user with the email: ${email}`
			})
		}
		const newUser = new User({
			'local.email': email,
			'local.password': password,
			"phone": phone,
			"firstName": firstName,
			"lastName": lastName
		})
		newUser.save((err, savedUser) => {
			if (err) return res.json(err)
			return res.json(savedUser)
		})
	})
})

router.get('/patients/:id', (req, res) => {

const id = req.params.id;
let patientID;

  User.find({_id:id}).then(function(user) {
  	patientID = user[0].patients[0];

  Patient.find({_id: patientID}).then(function(patients) {
    res.json(patients);
  }).catch(function(err) {
    res.json(err);
  })
})

})

router.get('/reminders/:patientId', (req, res) => {
const patientId = req.params.patientId;

  Patient.find({_id:patientId}).then(function(patient) {
  	reminderId = patient[0].reminders;

  Reminder.find({_id: reminderId}).sort({ timeToComplete: -1 }).then(function(reminders) {
    res.json(reminders);
  }).catch(function(err) {
    res.json(err);
  })
 })
})


router.get('/reminders/:patientId/:day', (req, res) => {
console.log("Getting reminders/id/day route")
const patientId = req.params.patientId;
const today = req.params.day;
console.log(patientId);

console.log("Getting reminders route")
  Patient.find({_id: patientId}).then(function(patient) {
  	reminderId = patient[0].reminders;

  Reminder.find({_id: reminderId, dayToComplete: today}).sort({ timeToComplete: -1 }).then(function(reminders) {
    res.json(reminders);
  }).catch(function(err) {
    res.json(err);
  })
 })
})


router.post("/addPatient", (req, res) => {
	const caretakerId = req.body._id;
	const { patientName, patientPhone, patientStreet, patientCity, patientState, patientZip } = req.body

	const newPatient = new Patient({
		patientName: patientName,
		patientPhone: patientPhone,
		patientStreet: patientStreet,
		patientCity: patientCity,
		patientState: patientState,
		patientZip: patientZip
	})
	newPatient.save((err, savedPatient) => {
		if (err) return res.json(err)
	})

	.then(function(dbPatient) {
	return User.findOneAndUpdate({_id: caretakerId}, { $push: { patients: dbPatient._id } }, {new:true});
    }).then(function(dbUser) {
      res.json(dbUser);
    })
    .catch(function(err) {
      res.json(err);
    })
});

router.delete("/reminders/:id", (req, res) => {
	Reminder.findOneAndRemove({_id: req.params.id}, function(err, removed) {

		Patient.findOneAndUpdate({reminders:req.params.id}, {$pull: {reminders:req.params.id}}, function(err, removed) {
			if(err) {
				console.log(err);
			}
		});

		  Reminder.find({}).sort({ timeToComplete: 1 }).then(function(reminders) {
		    res.json(reminders);
		  }).catch(function(err) {
		    res.json(err);
		  });
		});
});


router.post("/addReminder", (req, res) => {
	const patientId = req.body._id;
	const { reminderTitle, dayToComplete, timeToComplete, medicationDosage, medicationRefillDate, reminderMessage, receiveResponseBy } = req.body

	const newReminder = new Reminder ({
		reminderTitle: reminderTitle,
		dayToComplete: dayToComplete,
		timeToComplete: timeToComplete,
		medicationDosage: medicationDosage,
		medicationRefillDate: medicationRefillDate,
		reminderMessage: reminderMessage, 
		receiveResponseBy: receiveResponseBy
	})
	newReminder.save((err, savedReminder) => {
		if (err) return res.json(err)
	})

	.then(function(dbReminder) {
	return Patient.findOneAndUpdate({_id: patientId}, { $push: { reminders: dbReminder._id } }, {new:true});
    }).then(function(dbUser) {
      res.json(dbUser);
    })
    .catch(function(err) {
      res.json(err);
    })

});


module.exports = router;