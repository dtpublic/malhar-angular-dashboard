'use strict';

var gulp = require('gulp');

var paths = gulp.paths;

var $ = require('gulp-load-plugins')({
  pattern: ['gulp-*', 'main-bower-files', 'uglify-save-license', 'del']
});

gulp.task('partials', function () {
  return gulp.src([
    paths.src + '/components/**/*.html'
  ])
    .pipe($.angularTemplatecache('templateCacheHtml.js', {
      module: 'ui.dashboard',
      root: 'components'
    }))
    .pipe(gulp.dest(paths.tmp + '/partials/'));
});

gulp.task('clean', function (done) {
  $.del([paths.dist + '/', paths.tmp + '/'], done);
});

gulp.task('build:js', ['partials'], function() {
  return gulp.src([
    paths.src + '/components/**/!(*.spec|*_e2e)+(.js)',
    paths.tmp + '/partials/templateCacheHtml.js'
  ])
    .pipe($.angularFilesort())
    .pipe($.concat('malhar-angular-dashboard.js'))
    .pipe($.ngAnnotate())
    .pipe(gulp.dest(paths.dist))

});

gulp.task('build:css', function() {
  return gulp.src([
    paths.src + '/components/**/*.less'
  ])
    .pipe($.concat('malhar-angular-dashboard.less'))
    .pipe($.less())
    .pipe(gulp.dest(paths.dist));
});

gulp.task('build', ['build:js', 'build:css']);
