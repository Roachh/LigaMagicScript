const cheerio = require("cheerio");
const request = require("request-promise");
const readline = require('readline');
const fs = require('fs');

let cardsNames = [];
let promisesLinhasCartas = [];
let url;
let resultadosLojas = [];

class InputCard {
  constructor(nome, quantidade) {
    this.nome = nome;
    this.quantidade = quantidade;
  }
}

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

let lineReader = readline.createInterface({
  input: fs.createReadStream(process.cwd() + '\\cartas.txt')
});


lineReader.on('line', function (line) {
  //console.log(line);
  let inputCard = corrigeInput(line);  
  console.log(inputCard);
  cardsNames.push(line);
});

lineReader.on('close', function () {
  execute();
});



function execute() {
  let linhasCartas = [];
  let loadingCount = 0;

  fs.writeFileSync(process.cwd() + '\\resultado.txt', '');
  fs.appendFileSync(process.cwd() + '\\resultado.txt', "Total de cartas: " + cardsNames.length + '\r\n \r\n');

  for (let i = 0; i < cardsNames.length; i++) {

    promisesLinhasCartas[i] = linhasCarta(cardsNames[i]).then(function (estoquesLinhas) {
      linhasCartas.push(estoquesLinhas);
      loadingCount++;
      printProgress(loadingCount, cardsNames.length);
    });
  }



  Promise.all(promisesLinhasCartas).then(function () {
    //console.log(linhasCartas[0][0].nome);
    for (let i = 0; i < linhasCartas.length; i++) {
      for (let i2 = 0; i2 < linhasCartas[i].length; i2++) {

        let flag = 0;
        let index;
        for (let i3 = 0; i3 < resultadosLojas.length; i3++) {
          //já adicionou essa loja nos resultados
          if (resultadosLojas[i3].nome == linhasCartas[i][i2].nome) {
            flag = 1;
            index = i3;
          }
        }
        //se não adicionou, adiciona com o nome e preço. Se adicionou, soma o preço no resultadosLojas[index]
        if (flag == 0) {
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
    resultadosLojas.sort(function (a, b) {
      return b.qtdCartas - a.qtdCartas;
    });
    for (let i = 0; i < resultadosLojas.length; i++) {
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
  return request({ uri: url, timeout: 30000 }).then(function (body) {

    let $ = cheerio.load(body);

    if ($('.estoque-linha').length !== 0) {

      $('.estoque-linha').each(function () {
        let nomeLoja = $(this).find('.e-col1 img').attr('title');
        let precoCartaWithPromo = $(this).find('.e-col3').text();
        let precoCarta = getPromo(precoCartaWithPromo);
        precoCarta = precoCarta.replace(',', '.');
        precoCarta = Number(precoCarta.slice(2));


        if (!contem(estoquesLinhas, nomeLoja) && nomeLoja) {
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



function getPromo(precoCartaWithPromo) {
  let flag = 0;
  let subsStart = 0;
  for (let i = 0; i < precoCartaWithPromo.length; i++) {
    if (precoCartaWithPromo[i] == 'R') {
      if (flag == 1) {
        subsStart = i;
      }
      flag += 1;
    }
  }
  return precoCartaWithPromo.substring(subsStart, precoCartaWithPromo.length);
}

function contem(estoquesLinhas, nomeLoja) {
  let found = false;
  for (let i = 0; i < estoquesLinhas.length; i++) {
    if (estoquesLinhas[i].nome == nomeLoja) {
      found = true;
    }
  }
  return found;
}

function printProgress(loadingCount, totalCartas) {
  process.stdout.clearLine();
  process.stdout.cursorTo(0);
  process.stdout.write('Carregando: ' + loadingCount + '/' + totalCartas);
  if (loadingCount == totalCartas) {
    process.stdout.write('\n');
  }
}

function corrigeInput(line) {
  let quantidade;
  let nome;
  let firstPart = line.substr(0, line.indexOf(' '), 10);
  if (isNaN(parseInt(firstPart))) {
    quantidade = 1;
    nome = line;
  } else {
    quantidade = line.substr(0, line.indexOf(' '));
    nome = line.substr(line.indexOf(' ') + 1);
  }

  return new InputCard(nome, quantidade); 
}
