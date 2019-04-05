const nodePath = require('path');
const glob = require('glob');
const chokidar = require('chokidar');
const markoHotReload = require('marko/hot-reload');

/* eslint-disable no-loop-func */

/**
 * @param {String} templatesPath
 * @param {String} pageTemplatesPath
 * @param {String} modifiedPath
 * @param {Function} invalidateFunc
 * @param {Logger} logger
 */
function invalidateCacheTree({
  templatesPath,
  pageTemplatesPath,
  modifiedPath,
  invalidateFunc,
  logger,
}) {
  let { dir: currentDir } = nodePath.parse(modifiedPath);

  // Invalidate the modified template...
  invalidateFunc(modifiedPath);

  // ... and all its ancestors...
  currentDir = nodePath.dirname(currentDir);

  while (currentDir !== templatesPath) {
    glob(`${currentDir}/*.marko`, (error, markoTemplates) => {
      if (error) {
        return logger.error({ error, currentDir }, 'Error while invalidating ancestors templates!');
      }
      markoTemplates.forEach(p => invalidateFunc(p));
    });
    currentDir = nodePath.dirname(currentDir);
  }

  // ...and all pages, checked.
  glob(`${pageTemplatesPath}/*/*.marko`, (error, markoTemplates) => {
    if (error) {
      return logger.error({ error, pageTemplatesPath }, 'Error while invalidating pages templates!');
    }
    markoTemplates.forEach(p => invalidateFunc(p));
  });
}

const nullLogger = { info: () => {}, error: () => {} };

const HotReload = {
  enable: ({
    templatesPath,
    pageTemplatesPath,
    watchOptions,
    logger = nullLogger,
  }) => {
    markoHotReload.enable();

    const handleFileModified = (modifiedPath) => {
      const opt = {};

      invalidateCacheTree({
        templatesPath,
        pageTemplatesPath,
        modifiedPath,
        invalidateFunc: p => markoHotReload.handleFileModified(p, opt),
        logger,
      });
    };

    chokidar
      .watch(nodePath.join(templatesPath, '**', '*.marko'), watchOptions)
      .on('change', p => handleFileModified(p))
      .on('error', error => logger.error({ error }, 'Marko Hot Reload error!'));

    logger.info({ templatesPath, watchOptions }, 'Marko Hot Reload enabled.');
  },
};

module.exports = HotReload;
