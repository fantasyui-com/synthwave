const watch = require('watch');
const path = require('path');
const fs = require('fs');
const posthtml = require('posthtml');

const minifier = require('posthtml-minifier');

function update(source){

  console.log(source);

  const result = posthtml()
  .use(require('posthtml-custom-elements')())
  .use(minifier({ collapseWhitespace: true, preserveLineBreaks: false, removeComments: true, minifyCSS: true, minifyJS: true }))
  .process(fs.readFileSync(source), { sync: true })
  .html

  //console.log(result)
  const sourcename = path.basename(source);
  const basename = path.basename(source, '.src.html');
  const dirname = path.dirname(source);
  const destination = path.join(dirname , basename + '.html' )
  fs.writeFileSync(destination, result + `\n\n <!-- view source: ${sourcename} -->\n`);

}

watch.watchTree(__dirname, {filter: function(source){ return source.match(/\.src\.html$/) }, ignoreDirectoryPattern:/node_modules/}, function (f, curr, prev) {
  if (typeof f == "object" && prev === null && curr === null) {
    // Finished walking the tree
    //console.log(f)

  } else if (prev === null) {

    // f is a new file
    update(f);

  } else if (curr.nlink === 0) {

    // f was removed
    update(f);

  } else {

    // f was changed
    update(f);

  }
})
