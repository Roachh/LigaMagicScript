let cheerio = require("cheerio");
let request = require("request-promise");
let striptags = require('striptags');


let cardsNames = ["Aether Hub", "Akoum Refuge", "Bloodfell Caves", 'Duress'];
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
    this.qtdCartas = 0;
  }
}


for (var i = 0; i < cardsNames.length; i++) {
  promisesLinhasCartas[i] = linhasCarta(cardsNames[i]).then(function(estoquesLinhas) {
    linhasCartas.push(estoquesLinhas);
  });
}

Promise.all(promisesLinhasCartas).then(function() {
  //console.log(linhasCartas[0][0].nome);

  for (var i = 0; i < linhasCartas.length; i++) {
    for (var i2 = 0; i2 < linhasCartas[i].length; i2++) {

      let flag = 0;
      let index;
      for (var i3 = 0; i3 < resultadosLojas.length; i3++) {
        //já adicionou essa loja nos resultados
        if(resultadosLojas[i3].nome == linhasCartas[i][i2].nome) {
          flag = 1;
          index = i3;
        }
      }
      //se não adicionou, adiciona com o nome e preço. Se adicionou, soma o preço no resultadosLojas[index]
      if(flag == 0) {
        let resultadoLoja = new ResultadoLoja(linhasCartas[i][i2].nome, linhasCartas[i][i2].preco);
        resultadoLoja.qtdCartas += 1;
        resultadosLojas.push(resultadoLoja);
        console.log('Criou!');
      } else {
        resultadosLojas[index].precoTotal += linhasCartas[i][i2].preco;
        resultadosLojas[index].qtdCartas += 1;
        console.log('Somou!');
      }
    }
  }
  console.log(resultadosLojas);
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
      precoCarta = precoCarta.replace(',','.');
      precoCarta = Number(precoCarta.slice(2));


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
