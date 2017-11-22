'use strict';

const browserify = require('browserify');
const gulp = require('gulp');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const derequire = require('gulp-derequire');
const butternut = require('gulp-butternut');
const gutil = require('gulp-util');
const path = require('path');
const upperCamelCase = require('uppercamelcase');
const pkg = require('./package');

const MODULE_NAME = upperCamelCase(pkg.name);

const SRC_PATH = path.dirname(pkg.main);
const DIST_PATH = path.dirname(pkg.browser);

const INPUT_FILE = path.basename(pkg.main);
const OUTPUT_FILE = path.basename(pkg.browser);
const SOURCE_MAP = OUTPUT_FILE + '.map';



gulp.task('default', () => {
  return browserify({
      entries: INPUT_FILE,
      basedir: SRC_PATH,
      transform: ['babelify'],
      standalone: MODULE_NAME,
      debug: true
    }).bundle()
    .pipe(source(OUTPUT_FILE))
    .pipe(buffer())
    .pipe(derequire())
    .pipe(butternut({ sourceMap: true, source: SOURCE_MAP }))
    .on('error', gutil.log)
    .pipe(gulp.dest(DIST_PATH))
  ;
});
