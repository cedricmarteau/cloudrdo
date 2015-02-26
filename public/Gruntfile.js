module.exports = function(grunt){

	grunt.initConfig({
		// concatenation
		concat:{
			options:{
				separator: ';'
			},
			dist:{
				src: ['js/desktop/lib/TweenMax.min.js','js/desktop/lib/TimelineMax.min.js','js/desktop/script.js'],
				dest:'dist/main.min.js'
			}
		},
		// minification js
		uglify:{
			options:{
				// renommage des variables
				mangle:true
			},
			dist: {
				files:{
					'dist/main.min.js': ['dist/main.min.js']
				}
			}
		},
		// verification js
		jshint:{
			all:['js/desktop/*.js']
		},
		// comilation sass
		sass: {
			dist: {
				files: [{
						expand: true,
        				cwd: './',
						src: ['sass/*.scss'],
						dest: 'css/',
						ext:'.css'
				}]
			}
		},
		// minification css
		cssmin: {
			combine: {
				files: {
				  'css/style.min.css': ['css/reset.css', 'css/sass/*.css']
				}
			}
		},
		// automatisation des compilations
		watch: {
			js:{
				files : ['js/desktop/*.js','!js/min.js'],
				tasks : ['jshint','concat','uglify'],
				options: {
					spawn:false
				}
			},
			sass:{
				files : ['sass/*.scss'],
				tasks : ['sass','cssmin'],
				options: {
					spawn:false
				}
			}
		}
	});

	// déclaration des tâches
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-sass');
	grunt.loadNpmTasks('grunt-contrib-watch');

	//tasks par defaut
	grunt.registerTask('default', ['jshint','concat','uglify','sass','cssmin']);

}