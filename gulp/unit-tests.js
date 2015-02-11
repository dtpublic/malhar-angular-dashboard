'use strict';

var gulp = require('gulp');

var $ = require('gulp-load-plugins')();

var merge = require('merge-stream');
var wiredep = require('wiredep');

var paths = gulp.paths;

function runTests (singleRun, done) {
  var bowerDeps = wiredep({
    directory: 'bower_components',
    exclude: ['bootstrap-sass-official'],
    dependencies: true,
    devDependencies: true
  });
  var testFiles = gulp.src(bowerDeps.js);
  var srcFiles = gulp.src([ 
    paths.src + '/{app,components}/**/*.js',
    paths.tmp + '/partials/templateCacheHtml.js'
  ]).pipe($.angularFilesort());

  merge(testFiles, srcFiles)
    .pipe($.karma({
      configFile: 'karma.conf.js',
      action: (singleRun)? 'run': 'watch'
    }))
    .on('error', function (err) {
      // Make sure failed tests cause gulp to exit non-zero
      throw err;
    });
}

gulp.task('test', ['partials'], function (done) { runTests(true /* singleRun */, done) });
gulp.task('test:auto', ['partials'], function (done) { runTests(false /* singleRun */, done) });