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
        src: ['template/dashboard.html'],
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
        src: ['src/angular-ui-dashboard.js', 'template/dashboard.js'],
        dest: 'dist/angular-ui-dashboard.js'
      }
    },
    watch: {
      dashboard: {
        files: [
          'src/*.*',
          'template/dashboard.html'
        ],
        tasks: ['ngtemplates', 'concat', 'copy:dist']
      }
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
