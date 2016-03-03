/*/////////////////////////////////////////////////

 Language Learn Model Diagram NYCDA homework 

/////////////////////////////////////////////////*/

var express = require('express');
var bodyParser = require('body-parser');
var sequelize = require('sequelize');
var session = require('express-session');
var bcrypt = require('bcrypt');

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
var sequelize = new Sequelize('blogapp', process.env.POSTGRES_USER, null, {
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

var Language = sequelize.define('languages', {
	language: Sequelize.TEXT
});

var UserLanguages = sequelize.define('user_languages', {
	fluentorlearn: Sequelize.TEXT
});

Users.hasMany(UserLanguages);
UserLanguages.belongsTo(Users);

Languages.hasMany(UserLanguages);
UserLanguages.belongsTo(Languages);


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

// Login   

app.post('/login', function(request, response) {
	var password = request.body.password;
	User.findOne({
		where: {
			name: request.body.name
		}
	}).then(function(user) {
			if (user === undefined) {
				response.redirect('/?message=' + encodeURIComponent("Please log in to view your profile."));
			}
			if (user === null) {
				response.redirect('/?message=' + encodeURIComponent("Please register below before logging in"));

			} else if (request.body.name.length === 0) {
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
						response.redirect('/user/page');
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

	bcrypt.hash(request.body.password, 8, function(err, passwordHash) {
		if (err !== undefined) {
			console.log(err);
		}
		if (request.body.name.length === 0 || request.body.email.length === 0 || request.body.password.length === 0) {
			response.redirect('/?message=' + encodeURIComponent("Please enter a name, emailaddress and a password"));
		} else {
			User.create({
				name: request.body.name,
				password: passwordHash,
				
			}).then(function(user) {
					response.redirect('/user/page');
				},
				function(error) {
					response.redirect('/?message=' + encodeURIComponent("Name or email already in use, try something else!"));
				});
		};
	});
});

// Sync database, then start server 

sequelize.sync({force:true}).then(function() {
	var server = app.listen(3000, function() {
		console.log('Language Learn Model Diagram running on port 3000');
	});
});