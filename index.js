const fs = require('fs');
const database = JSON.parse(fs.readFileSync(__dirname+'/style.json').toString());

const render = function (input){
  let list = Array.isArray(input)?input:[input];
  return list.map(function(i){
    const {id, type, angle, gradient} = i;
    return `.${database.meta.name}-${id} { background: ${type}(${angle} ${gradient.map(i=>[i.color, i.position].join(" "))}) }`
  }).join("\n");
}

module.exports = {
    render,
    css: function(pattern){
      const selected = database.gradients.filter(gradient => gradient.id.match(pattern));
      return selected.map(i => render(i));
    },
    raw: function(pattern){
      const selected = database.gradients.filter(gradient => gradient.id.match(pattern));
      return selected;
    }
};
