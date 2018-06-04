const watch = require('watch');
const path = require('path');
const fs = require('fs');
const posthtml = require('posthtml');

function update(location){

  console.log(location);
 
  const result = posthtml()
  .use(require('posthtml-custom-elements')())
  .process(fs.readFileSync(location), { sync: true })
  .html

  console.log(result)

}

watch.watchTree(__dirname, {filter:function(location){ return path.extname(location) === '.html'}, ignoreDirectoryPattern:/node_modules/}, function (f, curr, prev) {
  if (typeof f == "object" && prev === null && curr === null) {
    // Finished walking the tree
    console.log(f)
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
