module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        // concat 설정. 
        concat: {
            basic: {
                src: [
                    "src/math/*.js",
                    "src/**/*.js"
                ],

                dest: "build/<%= pkg.name %>.js" 
            }
        },


        // uglify 설정. 
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> [<%= pkg.version %>] <%= grunt.template.today("yyyy-mm-dd, hh:MM:ss TT") %> */\n'
            },
            build: {
                src: 'build/<%= pkg.name %>.js',
                dest: 'js/<%= pkg.name %>.min.js'
            }
        },

        shell: 
        {
            options: {
                stdout: true,
                stderr: true
            },

            target: {
                command: [ 
                    'git add .',
                    'git commit -m "commited by grunt watch at <%= grunt.template.today("yyyy-mm-dd, hh:MM:ss TT") %>"',
                    'git push origin master'
                ].join( '&' )
            }
        },

        // Project configuration.
        qunit: {
            all: ['qunit/QunitTest.html']
        },

        watch: {
            scripts: {
                files: [ "src/**/*.js"],
                tasks: [ "concat", "uglify" ]
            }
        }

    });

    grunt.loadNpmTasks( "grunt-contrib-concat" );
    
    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-contrib-uglify');

    // load shell command plugins
    grunt.loadNpmTasks( 'grunt-shell' );

    // load shell command plugins
    grunt.loadNpmTasks( 'grunt-contrib-qunit' );

    grunt.loadNpmTasks( "grunt-contrib-watch" );

    // load connect plugins: simple http server
    // grunt.loadNpmTasks('grunt-contrib-connect');

    // Default task(s)
    grunt.registerTask('default', ['concat', 'uglify', 'shell' ]);

};