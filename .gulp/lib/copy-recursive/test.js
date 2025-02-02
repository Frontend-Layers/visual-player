import copy from './index.js';

const cfg = [
  {
    src: [
      './src/_redirects',
      './src/_headers',
      './src/robots.txt',
      './src/favicon.ico',

      './src/video/',
      './src/fonts/',
      './src/favicons/',
      './src/report/',

      './src/report/',
      './src/111report/',
      './111src/111report/'
    ],
    dest: './dist/'
  },
  {
    src: './src/test/',
    dest: './dist/report/',
    depth: 2 // Пример указания depth
  }
];

copy(cfg, () => {
  console.log('Copy process completed!');
});
