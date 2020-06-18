let gulp = require('gulp');
let browserify = require('browserify');
let source = require('vinyl-source-stream');
let watchify = require('watchify');
let tsify = require('tsify');
let fancy_log = require('fancy-log');
let paths = {
    pages: ['static/html/*.html']
};

let watchedBrowserify = watchify(browserify({
    basedir: '.',
    debug: true,
    entries: ['index.ts'],
    cache: {},
    packageCache: {}
}).plugin(tsify));

gulp.task('copy-html', function () {
    return gulp.src(paths.pages)
        .pipe(gulp.dest('dist'));
});

function bundle() {
    return watchedBrowserify
        .bundle()
        .on('error', fancy_log)
        .pipe(source('bundle.js'))
        .pipe(gulp.dest('dist'));
}

gulp.task('default', gulp.series(gulp.parallel('copy-html'), bundle));
watchedBrowserify.on('update', bundle);
watchedBrowserify.on('log', fancy_log);