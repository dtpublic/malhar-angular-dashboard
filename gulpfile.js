'use strict';

var gulp = require('gulp');

gulp.paths = {
  src: 'src',
  dist: 'dist',
  demo: 'demo',
  tmp: '.tmp',
  e2e: 'e2e',
  bower: 'bower_components'
};

require('require-dir')('./gulp');

gulp.task('default', ['clean','test'], function () {
    gulp.start('build');
});
