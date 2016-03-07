/*/////////////////////////////////////////////////

 Language Learning Model Diagram NYCDA homework 

/////////////////////////////////////////////////*/

var express = require('express');
var bodyParser = require('body-parser');
var sequelize = require('sequelize');
var session = require('express-session');
var bcrypt = require('bcrypt');
var fs = require('fs')

var app = express();


app.use(express.static(__dirname + '/public'));

app.use(bodyParser.urlencoded({
	extended: true
}));

app.use(session({
	secret: 'extremely secret stuff here',
	resave: true,
	saveUninitialized: false
}));

app.set('views', './src/views');
app.set('view engine', 'jade');


// Sequelize settings

var Sequelize = require('sequelize');
var sequelize = new Sequelize('llmodeldiagram', process.env.POSTGRES_USER, null, {
	host: 'localhost',
	dialect: 'postgres',
	define: {
		timestamps: false
	}
});

// Sequelize models

var Users = sequelize.define('users', {
	name: {
		type: Sequelize.TEXT,
		allowNull: false,
		unique: true
	},
	password: Sequelize.TEXT
});

var Languages = sequelize.define('languages', {
	language: Sequelize.TEXT
});

var UserLanguages = sequelize.define('user_languages', {
	fluentorlearn: Sequelize.TEXT
});

Users.belongsToMany(Languages, {
	through: UserLanguages
});
Languages.belongsToMany(Users, {
	through: UserLanguages
});

//Routes 

// Homepage

app.get('/', function(request, response) {
	response.render('index', {
		message: request.query.message,
		user: request.session.user
	});
});

// Logout

app.get('/logout', function(request, response) {
	request.session.destroy(function(error) {
		if (error) {
			throw error;
		}
		response.render('logout');
	});
});

// User matches

app.get('/user/matches', function(request, response) {
	var user = request.session.user;
	response.render('usermatches', {
		user: user
	})
})

// Login   

app.post('/login', function(request, response) {
	var password = request.body.password;
	var name = request.body.name;

	Users.findOne({
		where: {
			name: request.body.name
		}
	}).then(function(user) {
			if (user === undefined) {
				response.redirect('/?message=' + encodeURIComponent("Please log in to view your profile."));
			}
			if (user === null) {
				response.redirect('/?message=' + encodeURIComponent("Please register below before logging in"));

			} else if (name.length === 0) {
				response.redirect('/?message=' + encodeURIComponent("Please enter a name"));
			} else if (password.length === 0) {
				response.redirect('/?message=' + encodeURIComponent("Please enter a password"));
			} else if (user !== null && password.length !== 0) {
				bcrypt.compare(password, user.password, function(err, passwordMatch) {
					if (err) {
						console.log("Error with bcrypt")
					}
					if (passwordMatch) {
						request.session.user = user;
						response.redirect('/user/matches');
					} else {
						response.redirect('/?message=' + encodeURIComponent("Name or Password incorrect, try again!"))
					}
				})
			}
		},
		function(error) {
			response.redirect('/?message=' + encodeURIComponent("An error occurred, try logging in again or register below"));
		});
});

// New User


app.post('/user/new', function(request, response) {
	var user = request.session.user;
	var name = request.body.name;
	var email = request.body.email;
	var password = request.body.password;

	// function getRadioCheckedValue(radio) {
	// 			var oRadio = document.forms[0].elements[radio];

	// 			for (var i = 0; i < oRadio.length; i++) {
	// 				if (oRadio[i].checked) {
	// 					return oRadio[i].value;
	// 				}
	// 			}

	// 			var ForL = oRadio[i].value;
	// 		}
	// 		DutchCheckbox = form.elements["Dutch"]
	// 		getRadioCheckedValue(DutchCheckbox);


	// var checkedValue = null; 
	// var inputElements = document.getElementsByClassName('form');
	// for(var i=0; inputElements[i]; i++){
	//       if(inputElements[i].checked){
	//            checkedValue = inputElements[i].value;
	//            break;
	//       }
	// }



	bcrypt.hash(request.body.password, 8, function(err, passwordHash) {

		if (err !== undefined) {
			console.log(err);
		}
		if (name.length === 0 || password.length === 0) {
			response.redirect('/?message=' + encodeURIComponent("Please enter a name and a password"));
		} else {

			Users.create({
				name: request.body.name,
				password: passwordHash

				// UserLanguages.create({
				// 	userId: request.session.user,
				// 	languageId: 
				// 	fluentorlearn: ForL
				// })
			}).then(function(user) {
					response.redirect('/?message=' + encodeURIComponent("Please log in to view your profile."));
				},
				function(error) {
					response.redirect('/?message=' + encodeURIComponent("Name or email already in use, try something else!"));
				});
		};
	});
});


// Sync database, then start server 

sequelize.sync().then(function() {
	// fs.readFile('../public/languages.json', function(err, data) {
	// 	if (err) {
	// 		throw err;
	// 	};
	// 	info = JSON.parse(data);
	// 	for (i = 0; i < info.length; i++)
	// 		Languages.create({
	// 			language: languages[i].name
	// 		})

	// });
	/////////////////////////////////////////////////////////////////////////////
	// var languagesReader = require('./languagesJSONreader.js')

	// languagesReader.languages('../public/languages.json', function(info) {
	// 	if (error) {
	// 		throw err;
	// 		console.log("error")
	// 	} else {
	// 		for (i = 0; i < languages.length; i++)
	// 			Languages.create({
	// 				language: languages[i].name
	// 			})
	// 	}
	// })
	app.listen(3000, function() {
		console.log('Language Learning Model Diagram running on port 3000');
	});
});