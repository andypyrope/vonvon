const path = require('path');
const gulp = require('gulp');

gulp.task('default', function () {
    console.log('No default task yet.');
});

const modular = require('@alalev/modular');
const root = modular.Parser.parseSync(path.resolve(__dirname, 'project.xml'));

const GulpController = require('./tools/dist/main/GulpController').GulpController;
const controller = new GulpController(root);

controller.setupTasks();