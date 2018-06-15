const cheerio = require("cheerio");
const request = require("request-promise");
const readline = require('readline');
const fs = require('fs');

let cardsNames = [];
let promisesLinhasCartas = [];
let url;
let linhasCartas = [];
let resultadosLojas = [];
let loadingCount = 0;



var lineReader = readline.createInterface({
  input: fs.createReadStream(process.cwd() + '\\cartas.txt')
});

lineReader.on('line', function (line) {
  cardsNames.push(line);
});

lineReader.on('close', function() {
  execute();
})


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

function execute(){
  fs.writeFileSync(process.cwd() + '\\resultado.txt', '');
  fs.appendFileSync(process.cwd() + '\\resultado.txt', "Total de cartas: " + cardsNames.length + '\r\n \r\n');
  for (var i = 0; i < cardsNames.length; i++) {
    promisesLinhasCartas[i] = linhasCarta(cardsNames[i]).then(function(estoquesLinhas) {
      linhasCartas.push(estoquesLinhas);
      loadingCount++;
      printProgress(loadingCount, cardsNames.length);
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
          //console.log('Criou!');
        } else {
          resultadosLojas[index].precoTotal += linhasCartas[i][i2].preco;
          resultadosLojas[index].qtdCartas += 1;
          //console.log('Somou!');
        }
      }
    }
    resultadosLojas.sort(function(a, b){
      return b.qtdCartas - a.qtdCartas;
    });
    for (var i = 0; i < resultadosLojas.length; i++) {
      process.stdout.write("Nome da Loja: " + resultadosLojas[i].nome + ' | ');
      process.stdout.write("Quantidade de Cartas: " + resultadosLojas[i].qtdCartas + ' | ');
      process.stdout.write("Preço Total: " + resultadosLojas[i].precoTotal.toFixed(2) + '\n \n');

      fs.appendFileSync(process.cwd() + '\\resultado.txt', "Nome da Loja: " + resultadosLojas[i].nome + ' | ');
      fs.appendFileSync(process.cwd() + '\\resultado.txt', "Quantidade de Cartas: " + resultadosLojas[i].qtdCartas + ' | ');
      fs.appendFileSync(process.cwd() + '\\resultado.txt', "Preço Total: " + resultadosLojas[i].precoTotal.toFixed(2) + '\r\n \r\n');

    }

  });
}



function linhasCarta(cardName) {
  let encodedCardName = encodeURIComponent(cardName.trim());
  url = "https://www.ligamagic.com.br/?view=cards%2Fsearch&card=" + encodedCardName;
  let estoquesLinhas = [];

  

  //assincrono start
  return request(url).then(function(body) {

    let $ = cheerio.load(body);
    let estoquesLinhasCheerio = [];

    if($('.estoque-linha').length !== 0) {

      $('.estoque-linha').each(function() {
        let nomeLoja = $(this).find('.e-col1 img').attr('title');
        let precoCartaPromo = $(this).find('.e-col3').text();
        let precoCarta = removePromo(precoCartaPromo);
        precoCarta = precoCarta.replace(',','.');
        precoCarta = Number(precoCarta.slice(2));


        if(!contem(estoquesLinhas, nomeLoja) && nomeLoja) {
          estoquesLinhas.push(new EstoqueLinha(nomeLoja, precoCarta));
        }
      });
    } else {
      fs.appendFileSync(process.cwd() + '\\resultado.txt', `Carta ${cardName} não encontrada \r\n \r\n`);
      //console.log(`Carta ${cardName} não encontrada`);
    }

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

function printProgress(loadingCount, totalCartas){
  process.stdout.clearLine();
  process.stdout.cursorTo(0);
  process.stdout.write('Carregando: ' + loadingCount + '/' + totalCartas);
  if(loadingCount == totalCartas) {
    process.stdout.write('\n');
  }
}
