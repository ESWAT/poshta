var pkg         = require('./package.json'),
    gulp        = require('gulp'),

    connect     = require('gulp-connect'),
    del         = require('del'),
    imagemin    = require('gulp-imagemin'),
    inlineCss   = require('gulp-inline-css'),
    plumber     = require('gulp-plumber'),
    runSequence = require('run-sequence');

var paths = {
  assets  : 'src/assets/**/*',
  images  : 'src/images/**/*.{png,jpg,gif}',
  html    : 'src/**/*.html',
  release : 'release/'
};

var locals = {
  title       : pkg.name,
  author      : pkg.author,
  description : pkg.description,
  version     : pkg.version
}

gulp.task('clean', function(cb) {
  del(paths.release, cb);
});

gulp.task('watch', function () {
  gulp.watch(paths.html, ['html:dev']);
  gulp.watch(paths.images, ['imagemin:dev']);
  gulp.watch(paths.assets, ['assets']);
});

gulp.task('assets', function() {
  return gulp.src(paths.assets)
    .pipe(plumber())
    .pipe(gulp.dest(paths.release + 'assets/'));
});

gulp.task('connect:dev', function() {
  connect.server({
    root: paths.release,
    port: 8000,
    livereload: true
  });
});

gulp.task('connect:rel', function() {
  connect.server({
    root: paths.release,
    port: 8000
  });
});

gulp.task('html:dev', function() {
  return gulp.src([paths.html, '!**/_*.html'])
    .pipe(plumber())
    .pipe(inlineCss())
    .pipe(gulp.dest(paths.release))
    .pipe(connect.reload());
});

gulp.task('html:rel', function() {
  return gulp.src([paths.html, '!**/_*.html'])
    .pipe(inlineCss())
    .pipe(gulp.dest(paths.release))
});

gulp.task('imagemin:dev', function() {
  return gulp.src(paths.images)
    .pipe(plumber())
    .pipe(gulp.dest(paths.release + 'images/'))
});

gulp.task('imagemin:rel', function() {
  return gulp.src(paths.images)
    .pipe(imagemin())
    .pipe(gulp.dest(paths.release + 'images/'))
});

// Start server in development mode
gulp.task('default', ['clean'], function(cb) {
  runSequence([
      'html:dev',
      'assets',
      'imagemin:dev',
    ], [
      'connect:dev',
      'watch'
    ]
  , cb);
});

// Start server in preview mode
gulp.task('preview', ['clean'], function(cb) {
  runSequence([
      'html:rel',
      'assets',
      'imagemin:rel',
    ],
    'connect:rel'
  , cb);
});

// Build optimized files
gulp.task('build', function(cb) {
  runSequence('clean', [
    'html:rel',
    'assets',
    'imagemin:rel'
  ], cb)
});
