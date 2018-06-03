const synthwave = require('./index.js');

try{
  synthwave.css(/[a-c]/);
  // Select x CSS
  synthwave.css('x')
  // Select a,b,c,d CSS
  synthwave.css(/[a-d]/)
  // Select raw a,b,c objects
  synthwave.raw(/[a-c]/)
  // Render raw
  let allRaw = synthwave.raw(/[cwmfjordbankglyphsvextquiz]/);
  let allCss = synthwave.render(allRaw)
  console.log('PASS: system tests');
}catch(e){
  console.error(e);
  console.error('FAIL');
  process.exit(1);
}

if(synthwave.raw(/[a-c]/).length == 3){
  console.log('PASS: selector tests')
} else {
  console.error('FAIL');
  process.exit(1);
}
