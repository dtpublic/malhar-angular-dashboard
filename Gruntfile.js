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
        dest: 'template/angular-ui-dashboard-tpls.js'
      }
    },
    watch: {
      dashboard: {
        files: ['template/dashboard.html'],
        tasks: ['ngtemplates:dashboard']
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
    }
  });

  grunt.registerTask('default', [
    'jshint',
    'ngtemplates'
  ]);
};
