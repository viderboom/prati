export default {
    env: {
      es6: true,
      node: true,
      browser: true, 
    },
    parserOptions: {
      ecmaVersion: 2021,
      ecmaFeatures: {
        jsx: true, // Enable JSX parsing for React
      },
      sourceType: "module",
    },
    
    extends: [
      "eslint:recommended",
      "google",
      "plugin:react/recommended", // Add React recommended rules
    ],
    plugins: [
      "react", // Add React plugin
    ],
    rules: {
      "no-restricted-globals": ["error", "name", "length"],
      "prefer-arrow-callback": "error",
      "quotes": ["error", "double", { allowTemplateLiterals: true }],
      "react/react-in-jsx-scope": "off", // Disable if using React 17+ (automatic imports)
      "react/prop-types": "off", // Disable PropTypes rules if using TypeScript or prefer not to enforce them
    },
    settings: {
      react: {
        version: "detect", // Automatically detect React version
        defaultVersion: "18",
      },
    },
    overrides: [
      {
        files: ["**/*.spec.*"],
        env: {
          mocha: true,
        },
        rules: {},
      },
    ],
    globals: {},
  };
  