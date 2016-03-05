var fs = require('fs');



function languages(filename, callback) {

	fs.readFile('../public/languages.json', function(err, data) {
		if (err) {
			throw err;
		};
		info = JSON.parse(data);
		callback(info);
	});
};
	module.exports = {
		languages:languages				// the first countryInfo is the same as in the countryApp.js (could be countryRun for instance, the second countryInfo is referred to in this file)
	};