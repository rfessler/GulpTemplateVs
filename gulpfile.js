'use strict';

/*******************************************************************************
1. DEPENDENCIES
*******************************************************************************/
// Include gulp
var gulp = require('gulp'),		// gulp core

// Include Plugins
	pkg = require('./package.json'),
	bower = require('gulp-bower'),
	bowerFiles = require("gulp-bower-files"),
	plumber = require('gulp-plumber'),                  // disable interuption
	util = require('gulp-util'),
	clean = require('gulp-clean'),
	stripDebug = require('gulp-strip-debug'),
	sass = require('gulp-sass'),					// sass compiler
	autoprefixer = require('gulp-autoprefixer'),			// sets missing browserprefixes
	minifycss = require('gulp-minify-css'),             // minify the css files
	concat = require('gulp-concat'),					// concatinate js
	jshint = require('gulp-jshint'),					// check if js is ok
	stylish = require('jshint-stylish'),                // make errors look good in shell
	uglify = require('gulp-uglify'),					// uglifies the js
	rename = require('gulp-rename'),					// rename files
	browserSync = require('browser-sync'),              // inject code to all devices
	lr = require('tiny-lr'),
	livereload = require('gulp-livereload')

;

/*******************************************************************************
2. FILE DESTINATIONS (RELATIVE TO ASSSETS FOLDER)
*******************************************************************************/
var path = {
	jsDist : 'dist/assets/js',
	cssDist : 'dist/assets/css',
	jsSrc : 'src/assets/js',
	sassSrc : 'src/assets/scss'
};

var target = {
	sassDirSrc : path.sassSrc + '/**/*.scss',				// all sass files
	cssDirDist : 'dist/assets/css',					// where to put minified css
	cssDistFile : pkg.name + '.min.css',			// css output file name
	cssComponentFilesSrc : [
		'src/assets/components/normalize-css/normalize.css'		
	],
	cssComponentDirDist : 'dist/assets/components',	
	jsLintFilesSrc : [
		path.jsSrc + '/global.js',
		path.jsSrc + '/togglepaneloffers.js',
		path.jsSrc + '/zipandoffers.js',
		path.jsSrc + '/euc.js',
		path.jsSrc + '/ajax.js'
	],							// all js that should be linted
	jsUglifyFilesSrc : [
		'src/assets/components/jquery/jquery.js',
		'src/assets/components/modernizr/modernizr.js'
	],						// all js files that should not be concatinated
	jsConcactFilesSrc : [],							// all js files that should be concatinated
	jsSrcFileList : [],								// JS files to include
	jsDistFile : pkg.name + '.min.js',				// compiled JS files
	jsDirDist : 'dist/assets/js',					// where to put minified js
	jsComponentFilesSrc : [
		'src/assets/components/modernizr/modernizr.js'		
	],
	jsConcatFileName : pkg.name + 'min.js',
	jsComponentDirDist : 'dist/assets/components', 	// where to put componet js (minified) js
	cleansingAreas : [
		'dist/assets/js/*.js',
		'dist/assets/css/*.css',		
		'dist/assets/components/*'		
	]
};

/*******************************************************************************
3. SASS TASK  -- working rmf 2/21
*******************************************************************************/
gulp.task('sass', function() {
	gulp.src(['src/assets/scss/site.scss'])
		.pipe(plumber())
		.pipe(sass({			
			style: 'expanded',
			lineNumbers: true
		}))
		.pipe(autoprefixer(
            'last 2 version',
            '> 1%',
            'ie 8',
            'ie 9',
            'ios 6',
            'android 4'
		))
		.pipe(rename(pkg.name + '.css'))
		.pipe(gulp.dest(path.cssDist))
		.pipe(rename(pkg.name + '.min.css'))
		.pipe(sass({
			style: 'compressed',
			lineNumbers: false
		}))		
		.pipe(gulp.dest(path.cssDist));
});

/*******************************************************************************
4. JS TASKS
*******************************************************************************/
// lint custom js  -- working rmf 2/21
gulp.task('js-lint', function() {
    gulp.src(target.jsLintFilesSrc)                     // get the files
        .pipe(jshint())                                 // lint the files
        .pipe(jshint.reporter(stylish))                 // present the results in a beautiful way
});

// minify all js files that should not be concatinated  -- working rmf 2/21
gulp.task('js-uglify', function() {
    gulp.src(target.jsUglifyFilesSrc)                      // get the files
        .pipe(uglify())                                 // uglify the files   	
        .pipe(gulp.dest(target.jsDirDist))                // where to put the files
});

// minify & concatinate all other js  -- working rmf 2/21
gulp.task('js-concat', function() {
  return gulp.src(target.jsLintFilesSrc)				// get the files
  	.pipe(concat(pkg.name + '.js'))  					// concatinate to one file
  	.pipe(stripDebug())									// strip debug statements
  	.pipe(gulp.dest('dist/assets/js'))					// write the file non minified version
  	.pipe(rename(pkg.name + '.min.js'))					// rename to minified version
	.pipe(uglify())										// uglify the file
  	.pipe(gulp.dest('dist/assets/js'));					// write the uglified version
});


/*******************************************************************************
5. BROWSER SYNC
*******************************************************************************/

gulp.task('browser-sync', function() {  
    browserSync.init(['dist/assets/css/*.css'], {
        proxy: {
            host: '127.0.0.1',
            port: '18093'
        },
        reloadDelay: 1000,
        exclude: 'dist/assets/css/' + pkg.name + '.css'
    });
});


/*******************************************************************************
6. GULP TASKS
*******************************************************************************/
// default task
gulp.task('default', ['sass','browser-sync'], function(){
	gulp.watch(target.sassDirSrc, ['sass']);
});	


gulp.task('nowatch', function(){
	gulp.start('sass', 'js-lint', 'js-uglify', 'js-concat');
});



// clean task
gulp.task('cleanse', function(){
	gulp.src(target.cleansingAreas)
		.pipe(clean());
});

// scripts task
gulp.task('scripts', function(){
	gulp.start('js-concat', 'js-uglify');
});

// styles task
gulp.task('styles', function(){
	gulp.start('cleanse','sass');

});