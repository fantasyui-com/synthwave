#!/usr/bin/env node

const fs = require('fs');

const path = require('path');

const chalk = require('chalk');
const watch = require('watch');

const posthtml = require('posthtml');
const posthtmlCustomElements = require('posthtml-custom-elements');
const minifier = require('posthtml-minifier');
const minifierOptions = {
  // collapseWhitespace: true,
  // preserveLineBreaks: false,
  // removeComments: true,
  // minifyCSS: true,
  // minifyJS: true
};

function update(source){

  console.log(chalk.green('Recompiled: '+source));

  const result = posthtml()
  .use(posthtmlCustomElements())
  .use(minifier(minifierOptions))
  .process(fs.readFileSync(source), { sync: true })
  .html

  //console.log(result)
  const sourcename = path.basename(source);
  const basename = path.basename(source, '.src.html');
  const dirname = path.dirname(source);
  const destination = path.join(dirname , basename + '.html' )
  fs.writeFileSync(destination, result + `\n\n <!-- view source of: ${sourcename} -->\n`);

}

watch.watchTree(__dirname, {filter: function(source){ return source.match(/\.src\.html$/) }, ignoreDirectoryPattern:/node_modules/}, function (f, curr, prev) {
  if (typeof f == "object" && prev === null && curr === null) {
    // Finished walking the tree
    console.log( f );
    console.log(chalk.yellow( 'Watcher is monitoring:' ));
    console.log(chalk.yellow( Object.keys(f).filter(i=>i.match(/\.src\.html$/)).join('\n') ));
    console.log(chalk.yellow( '' ));
    Object.keys(f).filter(i=>i.match(/\.src\.html$/)).map(i=>update(i));

  } else if (prev === null) {
    // f is a new file
    update(f);

  } else if (curr.nlink === 0) {

    // f was removed
    // do nothing update(f);
    // user is expected to cleanup

  } else {
    // f was changed
    update(f);
  }
})
