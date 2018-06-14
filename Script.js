let cheerio = require("cheerio");
let request = require("request-promise");
let striptags = require('striptags');


let cardsNames = ["Aether Hub", "Akoum Refuge"];
let promisesLinhasCartas = [];
let url;
let linhasCartas = [];
let resultadosLojas = [];

class EstoqueLinha {
  constructor(nome, preco) {
    this.nome = nome;
    this.preco = preco;
  }
}

class ResultadoLoja {
  constructor(nome, precoTotal) {
    this.nome = nome;
    this.precoTotal = precoTotal;
  }
}


for (var i = 0; i < cardsNames.length; i++) {
  promisesLinhasCartas[i] = linhasCarta(cardsNames[i]).then(function(estoquesLinhas) {
    linhasCartas.push(estoquesLinhas);
  });
}

Promise.all(promisesLinhasCartas).then(function() {
  console.log(linhasCartas);

});












function linhasCarta(cardName) {
  cardName = encodeURIComponent(cardName.trim());
  url = "https://www.ligamagic.com.br/?view=cards%2Fsearch&card=" + cardName;
  let estoquesLinhas = [];

  //assincrono start
  return request(url).then(function(body) {

      let $ = cheerio.load(body);
      let estoquesLinhasCheerio = [];

      estoquesLinhasCheerio = $('.estoque-linha').each(function() {
        let nomeLoja = $(this).find('.e-col1 img').attr('title');
        let precoCartaPromo = $(this).find('.e-col3').text();
        let precoCarta = removePromo(precoCartaPromo);


        if(!contem(estoquesLinhas, nomeLoja) && nomeLoja) {
          estoquesLinhas.push(new EstoqueLinha(nomeLoja, precoCarta));
        }
      });
    //console.log(estoquesLinhas);
    //console.log('\n');

  return estoquesLinhas;
});// assincrono end

//console.log(estoquesLinhas);
}



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
