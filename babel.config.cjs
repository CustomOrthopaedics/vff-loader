module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          node: '14',
          browsers: 'last 2 versions',
        },
        useBuiltIns: 'usage',
        corejs: 3,
      },
    ],
  ],
};
