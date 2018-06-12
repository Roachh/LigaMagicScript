let cheerio = require("cheerio");
let request = require("request");
let striptags = require('striptags');


let cardName = "Akoum Refuge";
cardName = encodeURIComponent(cardName.trim());
console.log(cardName);
let url = "https://www.ligamagic.com.br/?view=cards%2Fsearch&card=" + cardName;
let nomesLojas = [];
let precosCartas = [];
//let url = "https://www.ligamagic.com.br/?view=cards%2Fsearch&card=Akoum%20Refuge";


request(url, function(err, resp, body) {
  if(err) {
    console.log(err);
  } else {
    let $ = cheerio.load(body);
    let estoquesLinhas = [];
    estoquesLinhas = $('.estoque-linha').each(function() {
      let nomeLoja = $(this).find('.e-col1 img').attr('title');

      let precoCartaPromo = $(this).find('.e-col3').html();


      if(!nomesLojas.includes(nomeLoja) && nomeLoja != null) {
        nomesLojas.push(nomeLoja);
        precosCartas.push(precoCartaPromo);
      }



    });


    console.log(nomesLojas);
    console.log(precosCartas);






    // let estoquesLinhas = [];
    // estoquesLinhas = $('.estoque-linha .e-col1 img').each(function() {
    //   let nomeLoja = $(this).attr('title');
    //
    //
    //   if(!nomesDasLojas.includes(nomeLoja)) {
    //     nomesDasLojas.push(nomeLoja);
    //   }
    //
    // });
    // console.log(nomesDasLojas);
  }
});
