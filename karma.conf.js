'use strict';

module.exports = function(config) {

  config.set({
    autoWatch : false,

    frameworks: ['jasmine'],

    browsers : ['PhantomJS'],

    plugins : [
        'karma-phantomjs-launcher',
        'karma-jasmine',
        'karma-coverage'
    ],

    reporters: ['dots', 'coverage'],

    coverageReporter: {
      type : 'html',
      // where to store the report
      dir : 'coverage/'
    },

    preprocessors: {
      'src/**/!(*spec)+(.js)': ['coverage']
    }
  });

};
