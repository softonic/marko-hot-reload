const markoHotReload = require('marko/hot-reload');
const chokidar = require('chokidar');

exports.enable = function watchMarkoFiles({ templatesPath }) {
  markoHotReload.enable();

  chokidar.watch(`${templatesPath}/**/*.marko`)
    .on('change', path => markoHotReload.handleFileModified(path));
};
