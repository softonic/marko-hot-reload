const nodePath = require('path');
const glob = require('glob');
const chokidar = require('chokidar');
const markoHotReload = require('marko/hot-reload');

/* eslint-disable no-loop-func */

/**
 * @param {String} templatesPath
 * @param {Array<String>} pageTemplatesPaths
 * @param {String} modifiedPath
 * @param {Function} invalidateFunc
 * @param {Logger} logger
 */
function invalidateCacheTree({
  templatesPath,
  pageTemplatesPaths,
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
        return logger.error(
          { error, currentDir },
          'Error while invalidating ancestors templates!',
        );
      }
      markoTemplates.forEach(p => invalidateFunc(p));
    });
    currentDir = nodePath.dirname(currentDir);
  }

  // ...and all pages, checked.
  pageTemplatesPaths.forEach(pageTemplatesPath => {
    glob(`${pageTemplatesPath}/*/*.marko`, (error, markoTemplates) => {
      if (error) {
        return logger.error(
          { error, pageTemplatesPath },
          'Error while invalidating pages templates!',
        );
      }
      markoTemplates.forEach(p => invalidateFunc(p));
    });
  });
}

const nullLogger = { info: () => {}, error: () => {} };

const HotReload = {
  enable: ({
    templatesPath,
    pageTemplatesPath,
    watchOptions,
    fileModifiedOptions = {},
    logger = nullLogger,
  }) => {
    markoHotReload.enable();

    const templatesPaths = Array.isArray(templatesPath)
      ? templatesPath
      : [templatesPath];

    const pageTemplatesPaths = Array.isArray(pageTemplatesPath)
      ? pageTemplatesPath
      : [pageTemplatesPath];

    const handleFileModified = (templatesPath, modifiedPath) => {
      invalidateCacheTree({
        templatesPath,
        pageTemplatesPaths,
        modifiedPath,
        invalidateFunc: p => markoHotReload.handleFileModified(p, fileModifiedOptions),
        logger,
      });
    };

    templatesPaths.forEach(templatePath => chokidar
      .watch(nodePath.join(templatePath, '**', '*.marko'), watchOptions)
      .on('change', p => handleFileModified(templatePath, p))
      .on('error', error => logger.error({ error }, 'Marko Hot Reload error!'))
    );

    logger.info({ templatesPath, watchOptions }, 'Marko Hot Reload enabled.');
  },
};

module.exports = HotReload;
