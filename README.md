# JS Runner - CTH

Run JavaScript Code in the Chrome Tab Site (Online Sites)

![](src/icons/128x128.png)

## ✨ Features

* Run Custom JavaScript in Sites
* Microsoft VS Editor

### Editor Shortcut Key 

* Save Data `Ctrl + S`
* Full Screen `F11`
* Change Tab Size
* Change Font Size
* Console Log: `Ctrl + Alt + L`

## 📦 [Install Extension](https://chrome.google.com/webstore/detail/js-runner-cth/ohfgciebjhocphgcikdnldicgfhdbllj)

## Screenshot

![](assets/step-1.png)

![](assets/step-2.png)

![](assets/step-3.png)

![](assets/step-4.png)

## Browser Support

- `Chrome (Latest)`

##  Libraries

* [Monaco Editor Webpack Loader Plugin](https://github.com/microsoft/monaco-editor-webpack-plugin)
  * `npm install monaco-editor`
  * `npm install monaco-editor-webpack-plugin`
* UIkit: https://getuikit.com/


## 🚀 Debugging

* `npm run watch`
* `npm run build`
* `npm run build-zip`

## Changelog

### `Processing`

* Run script on page site when reload site 

### V.0.0.6

* Add Custom Suggestion in the JavaScript Language
  - `alert, log, for, foreach, if`
* Script Runner Status `OFF/ON` Checkbox
* Fix URL uppercase and lowercase letter problem.

### V.0.0.5

* Update Plugin:
  - `npm install monaco-editor@0.21.1`
  - `monaco-editor-webpack-plugin`
* Add New Editor Key `Ctrl + Alt + L`, Select JavaScript Variable and this line insert
  ```
  console.log("CTH: xPath2", xPath2)
  ```

### V.0.0.2

* Action on Sites, Run Script if:
  - Host/URL/Path
  - Equals/All/Matches (regex)
  - Value (URL)
  - Trigger: Manually/Automatically
  - Automatically = Before page load/On Page Load

### V.0.0.1

* Monaco Editor
* All script saved page
* About us page

## Reporting Issues radioactive

If you have a problem with this plugin or found any bug, please open an issue on GitHub.

## 📝 Copyright and License copyright

Code copyright 2020 ctechhindi. Code released under the MIT license.