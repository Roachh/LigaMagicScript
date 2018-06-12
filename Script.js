let cheerio = require("cheerio");
let request = require("request");
let striptags = require('striptags');


let cardName = "Akoum Refuge";
cardName = encodeURIComponent(cardName.trim());
console.log(cardName);
let url = "https://www.ligamagic.com.br/?view=cards%2Fsearch&card=" + cardName;
let nomesLojas = [];
let precosCartas = [];
let estoquesLinhas = [];

class EstoqueLinha {
  constructor(nome, preco) {
    this.nome = nome;
    this.preco = preco;
  }
}


request(url, function(err, resp, body) {
  if(err) {
    console.log(err);
  } else {
    let $ = cheerio.load(body);
    let estoquesLinhasCheerio = [];

    let count = 0;
    estoquesLinhasCheerio = $('.estoque-linha').each(function() {
      let nomeLoja = $(this).find('.e-col1 img').attr('title');
      let precoCartaPromo = $(this).find('.e-col3').text();
      let precoCarta = removePromo(precoCartaPromo);


      if(!contem(estoquesLinhas, nomeLoja) && nomeLoja != null) {
        // nomesLojas.push(nomeLoja);
        // precosCartas.push(precoCarta);
        estoquesLinhas[count] = new EstoqueLinha(nomeLoja, precoCarta);
        count++;
      }

    });


    console.log(estoquesLinhas);


  }
});



function removePromo(precoCartaPromo) {
  let flag = 0;
  let subsStart = 0;
  for (var i = 0; i < precoCartaPromo.length; i++) {
    if(precoCartaPromo[i] == 'R') {
      if(flag == 1) {
        subsStart = i;
      }
      flag += 1;
    }
  }
  return precoCartaPromo = precoCartaPromo.substring(subsStart, precoCartaPromo.length);
}

function  contem(estoquesLinhas, nomeLoja) {
  let found = false;
  for (var i = 0; i < estoquesLinhas.length; i++) {
    if(estoquesLinhas[i].nome == nomeLoja) {
      found = true;
    }
  }
    return found;
}
