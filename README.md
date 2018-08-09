# babel-jest

This is a fork of the [Babel](https://github.com/babel/babel) [jest](https://github.com/facebook/jest) plugin.

Even though the original package provides the filename option to babel.transform, we still have problems with Babel transforming some of our module filenames.

According to [this issue](https://github.com/babel/babel/issues/6296), adding `filename` to options should be sufficient, but we've found that only by using the transformFileSync API will Babel accurately pick up .babelrc in all cases.

## Usage

If you are already using `jest-cli`, just add `babel-jest` and it will automatically compile JavaScript code using babel.

```bash
yarn add --dev babel-jest babel-core
```

> Note: If you are using babel version 7 you have to install `babel-jest` with
>
> ```bash
> yarn add --dev babel-jest 'babel-core@^7.0.0-0' @babel/core
> ```

If you would like to write your own preprocessor, uninstall and delete babel-jest and set the [config.transform](https://jestjs.io/docs/configuration#transform-object-string-string) option to your preprocessor.

## Setup

_Note: this step is only required if you are using `babel-jest` with additional code preprocessors._

To explicitly define `babel-jest` as a transformer for your JavaScript code, map _.js_ files to the `babel-jest` module.

```json
"transform": {
  "^.+\\.jsx?$": "babel-jest"
},
```
