# marko-hot-reload

Watch changes in Marko templates in a folder and notify Marko to hot reload them.

## Installation

```bash
npm install marko-hot-reload
```

or with `yarn`:

```bash
yarn add marko-hot-reload
```

## Usage

```js
const markoHotReload = require('marko-hot-reload');

const requiredTemplatesPath = '/path/to/templates/folder';
const requiredPageTemplatesPath = '/path/to/pages/folder';

// These options can prevent some issues on some Mac machines
const optionalChokidarWatchOptions = {
  usePolling: true,
  interval: 1000,
  useFsEvents: false,
};

const optionalLogger = {
  info: () => {},
  error: () => {},
};

markoHotReload.enable({
  templatesPath: requiredTemplatesPath,
  pageTemplatesPath: requiredPageTemplatesPath,
  watchOptions: optionalChokidarWatchOptions,
  logger: optionalLogger,
});
```

## The way it works

Given this folder structure:

```bash
client
  views
    components
    layout
      desktop-layout.tpl
      mobile-layout.tpl
      components
        header.tpl
    pages
      faq
        desktop-index.tpl
        mobile-index.tpl
      home
        desktop-index.tpl
        mobile-index.tpl
```

If `header.tpl` is modified, the Hot Reload invalidates it and all its direct ancestors up to the templates folder, as well as all the page templates. I.e. all the files invalidated are:

- /client/views/layout/components/header.tpl
- /client/views/layout/desktop-layout.tpl
- /client/views/layout/mobile-layout.tpl
- /client/views/pages/faq/desktop-index.tpl
- /client/views/pages/faq/mobile-index.tpl
- /client/views/pages/home/desktop-index.tpl
- /client/views/pages/home/mobile-index.tpl

## Contribute

1. Fork it: `git clone https://github.com/softonic/marko-hot-reload.git`
2. Create your feature branch: `git checkout -b feature/my-new-feature`
3. Commit your changes: `git commit -am 'Added some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D
