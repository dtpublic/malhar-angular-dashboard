'use strict';

var gulp = require('gulp');

var paths = gulp.paths;

gulp.task('watch', ['inject'], function () {
  var globs = [
    paths.src + '/{app,components}/**/*.html',
    paths.tmp + '/{app,components}/**/*.html'
  ];
  
  gulp.watch(globs, ['demo:partials']);

  gulp.watch([
    paths.src + '/{app,components}/**/*.less',
    paths.src + '/{app,components}/**/*.js',
    paths.tmp + '/partials/**/*.js',
    'bower.json'
  ], ['inject']);
});
