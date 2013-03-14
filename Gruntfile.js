module.exports = function(grunt) {

	// Project configuration.
	grunt.initConfig({
		pkg : grunt.file.readJSON('package.json'),
		jasmine : {
			pivotal : {
				src : 'src/**/*.js',
				options : {
					specs : 'spec/*Spec.js',
					helpers : 'spec/*Helper.js'
				}
			}
		},
		watch : {
			files : [ 'src/**/*.js', 'spec/**/*.js' ],
			tasks : [ 'jasmine', 'growl:jasmine' ]
		},
		growl : {
		       	jasmine : {
		            message : '<%= jasmine.message %>',
		            title : "Jasmine Test Results",
			    image : __dirname + '/spec/images/jasmine_logo.png'
		        }
		}  
	});

	grunt.loadNpmTasks('grunt-contrib-jasmine');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-growl');

	grunt.registerTask('default', [ 'jasmine', 'growl:jasmine', 'watch' ]);

	grunt.event.on('jasmine.reportJUnitResults', function(results) {
		var suites = results.suites;
		var tests = suites.reduce(function(pVal, cVal) { return pVal + cVal.tests; }, 0);
		var errors = suites.reduce(function(pVal, cVal) { return pVal + cVal.errors; }, 0);
		var failures = suites.reduce(function(pVal, cVal) { return pVal + cVal.failures; }, 0);
		var passed = tests - failures;

		grunt.config.set('jasmine.message', passed + ' out of ' + tests + ' passed');
	});
};
