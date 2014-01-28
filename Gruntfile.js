'use strict';

module.exports = function (grunt) {
  require('load-grunt-tasks')(grunt);
  require('time-grunt')(grunt);

  grunt.initConfig({
    ngtemplates: {
      dashboard: {
        options: {
          module: 'ui.dashboard'
        },
        src: ['template/*.html'],
        dest: 'template/dashboard.js'
      }
    },
    karma: {
      unit: {
        configFile: 'karma.conf.js',
        singleRun: true
      }
    },
    concat: {
      dist: {
        src: [
          'src/directives/*.js',
          'src/models/*.js',
          'src/controllers/*.js',
          'template/dashboard.js'
        ],
        dest: 'dist/angular-ui-dashboard.js'
      }
    },
    watch: {
      files: [
        'src/**/*.*',
        'template/*.html'
      ],
      tasks: ['ngtemplates', 'concat', 'copy:dist']
    },
    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      all: [
        'Gruntfile.js',
        'src/{,*/}*.js'
      ]
    },
    copy: {
      dist: {
        files: [{
          expand: true,
          flatten: true,
          src: ['src/angular-ui-dashboard.css'],
          dest: 'dist'
        }]
      }
    },
    clean: {
      dist: {
        files: [{
          src: [
            'dist/*'
          ]
        }]
      },
      templates: {
        src: ['<%= ngtemplates.dashboard.dest %>']
      }
    }
  });

  grunt.registerTask('test', [
    'ngtemplates',
    'karma'
  ]);

  grunt.registerTask('default', [
    'clean:dist',
    'jshint',
    'ngtemplates',
    'karma',
    'concat',
    'copy:dist',
    'clean:templates'
  ]);
};
