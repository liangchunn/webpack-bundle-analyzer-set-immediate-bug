# webpack-bundle-analyzer-set-immediate-bug
This repo demonstrates the `setImmediate` bug when using `webpack-bundle-analyzer` alongside `webpack` via scripting.

Some build scripts like `parallel-webpack` listen to webpack's done callback and might terminate the process, forcing `webpack-bundle-analyzer` to exit prematurely without doing anything, producing _empty_ html files or in many cases, _nothing at all_.

Follow the instructions below to reproduce the error.

## Steps to reproduce the issue
1. Clone this repo

2. `yarn install`

3. Open `node_modules/webpack-bundle-analyzer/lib/BundleAnalyzerPlugin.js`, add the three logging lines in inside the function `BundleAnalyzerPlugin.apply(compiler)`:
```diff
      if (actions.length) {
+        console.log('[webpack-bundle-analyzer] enqueuing analyzer actions')
        // Making analyzer logs to be after all webpack logs in the console
        setImmediate(() => {
+          console.log('[webpack-bundle-analyzer] executing analyzer actions')
          actions.forEach(action => action());
        });
      }
    };

+    console.log("[webpack-bundle-analyzer] tapping into webpack's done hook")
    if (compiler.hooks) {
      compiler.hooks.done.tap('webpack-bundle-analyzer', done);
    } else {
      compiler.plugin('done', done);
    }
```

4. Run `node build.js`, **notice that the analyzer only executes after webpack says that everything is done**, and a report is generated in the `dist` folder:
```
23:13:39 in ~/Desktop/setImmediateBug is 📦 v1.0.0 via ⬢ v8.11.3
➜ node build.js
[webpack-bundle-analyzer] tapping into webpack's done hook
[webpack-bundle-analyzer] enqueuing analyzer actions
[build] webpack invoked the 'done' hook
[build] successfully built bundle!
[build] build script done!
[webpack-bundle-analyzer] executing analyzer actions
Webpack Bundle Analyzer saved report to /Users/liangchun/Desktop/setImmediateBug/dist/report.html
```

5. Now run `node build.js --kill-on-webpack-success`, **notice that the analyzer didn't do anything because the process terminated eagerly as webpack declared that all operations are done, and no report is generated:**
```
23:15:04 in ~/Desktop/setImmediateBug is 📦 v1.0.0 via ⬢ v8.11.3 took 2s
➜ node build.js --kill-on-webpack-success
[webpack-bundle-analyzer] tapping into webpack's done hook
[webpack-bundle-analyzer] enqueuing analyzer actions
[build] webpack invoked the 'done' hook
[build] successfully built bundle!
[build] build script done!
[build] terminating process due to --kill-on-webpack-success
```


## Possible fixes
- Don't enqueue operations with `setImmediate`, make it execute whenever the line is reached. (breaking change)
- Have an option like `{ deferAnalyzer: boolean = true }`, and explicitly opt-out enqueuing operations with `setImmediate` by setting `{ deferAnalyzer: false }` (this won't break everyone's build or change the way people are already using)