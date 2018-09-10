'use strict';

const babel = require('gulp-babel');
const gulp = require('gulp');


gulp.task('default', function () {
  return gulp.src('src/**/*.js')
    .pipe(babel({
			presets: ['@babel/env']
		}))
    .pipe(gulp.dest('dist'));
});
