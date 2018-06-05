const synthwave = require("./index.js");
const screenfull = require("screenfull");

$(function() {
  function renderSynthwave({selectedLetter, directedLetter, selectedClassName, directedClassName}) {
    $('#demo-body').removeClass(selectedClassName).addClass(directedClassName);
    $('.synthwave-letter').text(directedLetter);
    $('.css-code').html( synthwave.css(directedLetter) );
  }
  function trapNumber(value, min, max){
    if (value > max) value = min;
    if (value < min) value = max;
    return value;
  }
  function getLetter(magic) {
    let selectedClassName = $('#demo-body').attr('class').split(' ').filter((c)=>c.match(/^synthwave-[a-z]$/))[0]||'synthwave-a';
    let selectedLetter = selectedClassName.split('-')[1];
    let directedLetterNumber = trapNumber(selectedLetter.charCodeAt(0) + magic, 97, 122);
    let directedLetter = String.fromCharCode(directedLetterNumber);
    let directedClassName = 'synthwave-' + directedLetter;
    let response = { selectedLetter, directedLetter, selectedClassName, directedClassName };
    return response;
  }

  $('#full-screen').on('click', ()=>screenfull.enabled?screenfull.request():"");
  $('#aziz-light').on('click', ()=>$('.primary.container').toggleClass('bg-dark').toggleClass('shadow-lg'));
  $('#prev-wave').on('click', ()=>renderSynthwave(getLetter(-1)));
  $('#next-wave').on('click', ()=>renderSynthwave(getLetter(1)));

  renderSynthwave(getLetter(0));
});
