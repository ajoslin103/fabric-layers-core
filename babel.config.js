module.exports = {
  presets: [
    // TypeScript must run BEFORE any class feature transforms
    ['@babel/preset-typescript', {
      allowDeclareFields: true,
      onlyRemoveTypeImports: true
    }],
    ['@babel/preset-env', {
      targets: {
        browsers: ['> 0.25%, not dead'],
        node: 'current'
      },
      useBuiltIns: 'usage',
      corejs: 3,
      modules: false
    }]
  ],
  plugins: [
    '@babel/plugin-transform-runtime'
  ]
};
