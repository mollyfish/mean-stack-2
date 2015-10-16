var gulp = require('gulp');
var config = require('../config').sass;

var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var handleErrors = require('../util/handleErrors');
var autoprefixer = require('gulp-autoprefixer');


var dest = './public';
var src = './src';

gulp.task('sass', function() {
  return gulp.src('./app/style/**/*.{sass,scss}')
    .pipe(sourcemaps.init())
    .pipe(sass(config.settings))
    .on('error', handleErrors)
    .pipe(sourcemaps.write())
    .pipe(autoprefixer({ browsers: ['last 2 version'] }))
    .pipe(gulp.dest('build/style/'));
});
