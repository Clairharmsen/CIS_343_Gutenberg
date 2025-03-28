// Clair Harmsen
// Ezekiel Turnbough
// 3/28/2025

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const url = 'https://gutendex.com/books?search=';
 
async function getData(str){
  const request = await fetch(url + str);
  const json = await request.json();
  for(let i=0; i<json.count; ++i){
    console.log(json.results[i].title);
  }
}

rl.question("Search for a book: ", (query) => {
  getData(query);
  rl.close();
});
