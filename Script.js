let cheerio = require("cheerio");
let request = require("request");
let striptags = require('striptags');


let cardName;
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

cardName = "Akoum Refuge";
console.log(cardName);
linhasCartas.push(linhasCarta(cardName));


cardName = "Battlefield Forge";
console.log(cardName);
linhasCartas.push(linhasCarta(cardName));
//console.log(linhasCartas);



for (var i = 0; i < linhasCartas.length; i++) {
  let flag = 0;
  let index = 0;
  for (var i2 = 0; i2 < resultadosLojas.length; i2++) {
    //já adicionou essa loja nos resultados
    if(resultadosLojas[i2].nome == linhasCartas[i].nome) {
      flag = 1;
      index = i2;
    }
  }
  //se não adicionou, adiciona com o nome e preço. Se adicionou, soma o preço no resultadosLojas[index]
  // if(flag == 0) {
  //   let resultadoLoja = new ResultadoLoja(linhasCartas[i].nome, linhasCartas[i].preco)
  //   resultadosLojas.push(resultadoLoja);
  //   console.log('Criou!');
  // } else {
  //   resultadosLojas[index].preco += linhasCartas[i].preco;
  //   console.log('Somou!');
  // }
}






function linhasCarta(cardName) {
  cardName = encodeURIComponent(cardName.trim());
  url = "https://www.ligamagic.com.br/?view=cards%2Fsearch&card=" + cardName;
  let estoquesLinhas = [];

  //assincrono start
  request(url, function(err, resp, body) {
    if(err) {
      console.log(err);
    } else {
      let $ = cheerio.load(body);
      let estoquesLinhasCheerio = [];

      estoquesLinhasCheerio = $('.estoque-linha').each(function() {
        let nomeLoja = $(this).find('.e-col1 img').attr('title');
        let precoCartaPromo = $(this).find('.e-col3').text();
        let precoCarta = removePromo(precoCartaPromo);


        if(!contem(estoquesLinhas, nomeLoja) && nomeLoja) {
          estoquesLinhas.push(new EstoqueLinha(nomeLoja, precoCarta));
          //console.log(estoquesLinhas[count]);
        }
      }
    );

    console.log(estoquesLinhas);
    //console.log('\n');


  }
});// assincrono end

//console.log(estoquesLinhas);
return estoquesLinhas;
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
