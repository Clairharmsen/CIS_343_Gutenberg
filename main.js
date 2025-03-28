//Clair Harmsen
//Ezekiel Turnbough
// 3/28/2025

const url = 'https://gutendex.com/books?search=';
 
async function getData(str){
  const request = await fetch(url + str);
  const json = await request.json();
  for(let i=0; i<json.count; ++i){
    console.log(json.results[i].title);
  }
}
 
getData("sherlock");