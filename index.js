const path = require('path');
const markoHotReload = require('marko/hot-reload');
const chokidar = require('chokidar');

exports.enable = function watchMarkoFiles(options) {
  const templatesPath = options.templatesPath;
  markoHotReload.enable();

  chokidar.watch(path.join(templatesPath, '**', '*.marko')).on('change', function(path) {
    markoHotReload.handleFileModified(path);
  });
};
