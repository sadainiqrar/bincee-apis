import gulp from 'gulp'
import gulpLoadPlugins from 'gulp-load-plugins'
import path from 'path'
import del from 'del'
import runSequence from 'run-sequence'

const plugins = gulpLoadPlugins()

const paths = {
    js: ['./**/*.js', '!dist/**', '!node_modules/**', '!coverage/**'],
    nonJs: [
        './package.json',
        './**/*.ejs',
        './.gitignore',
        './.env',
        './user.png',
    ],
    tests: './server/tests/*.js',
}

// Clean up dist and coverage directory
gulp.task('clean', done => {
    del.sync(['dist/**', 'dist/.*', 'coverage/**', '!dist', '!coverage'])
    done()
})

// Copy non-js files to dist
gulp.task('copy', done => {
    gulp.src(paths.nonJs)
        .pipe(plugins.newer('dist'))
        .pipe(gulp.dest('dist'))
    done()
})

// Compile ES6 to ES5 and copy to dist
gulp.task('babel', done => {
    gulp.src([...paths.js, '!gulpfile.babel.js'], { base: '.' })
        .pipe(plugins.newer('dist'))
        .pipe(plugins.sourcemaps.init())
        .pipe(plugins.babel())
        .pipe(
            plugins.sourcemaps.write('.', {
                includeContent: false,
                sourceRoot(file) {
                    return path.relative(file.path, __dirname)
                },
            }),
        )
        .pipe(gulp.dest('dist'))
    done()
})

// Start server with restart on file changes
gulp.task(
    'nodemon',
    gulp.series('copy', 'babel', done => {
        plugins.nodemon({
            script: path.join('dist', 'index.js'),
            ext: 'js',
            ignore: ['node_modules/**/*.js', 'dist/**/*.js'],
            tasks: ['copy', 'babel'],
        })
        done()
    }),
)

// gulp serve for development
gulp.task(
    'serve',
    gulp.series('clean', done => {
        runSequence('nodemon')
        done()
    }),
)

// default task: clean dist, compile js files and copy non-js files.
gulp.task(
    'default',
    gulp.series('clean', gulp.parallel('copy', 'babel'), done => {
        done()
    }),
)
