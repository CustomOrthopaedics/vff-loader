module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          node: '8.9.4',
          browsers: 'last 2 versions',
        },
        useBuiltIns: 'usage',
        corejs: 3,
      },
    ],
  ],
  plugins: [
    ['@babel/transform-runtime'],
  ],
};
