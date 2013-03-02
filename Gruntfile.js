module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		concat: {
			options: {

			},
			dist: {
				src: [
						'src/mootools-core-1.4.5.js', 
						'jquery-1.8.2.min.js',
						'dat.gui.min.js',
					  	'src/**/*.js',
					 ],
				dest: 'dist/<%= pkg.name %>.js'
			},
		},
		watch: {
			files: ['Gruntfile.js', 'src/**/*.js'],
			tasks: ['concat']
		}
	});
	
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-concat');

	grunt.registerTask('default', ['concat', 'watch']);
}