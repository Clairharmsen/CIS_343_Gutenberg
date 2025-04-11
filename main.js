// Clair Harmsen
// Ezekiel Turnbough
// 3/28/2025

    import fetch from 'node-fetch';
    import readline from 'readline';
    import fs from 'fs';

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const url = "https://gutendex.com/books/";
    const historyFile = 'history.json';
    const pageSize = 1000;

    function saveToHistory(book) {
      let history = [];
      if (fs.existsSync(historyFile)) {
        history = JSON.parse(fs.readFileSync(historyFile));
      }
      history.unshift(book);
      history = history.slice(0, 10);
      fs.writeFileSync(historyFile, JSON.stringify(history, null, 2));
    }

    function displayPage(text, page = 0) {
      const totalPages = Math.ceil(text.length / pageSize);
      const start = page * pageSize;
      const end = Math.min(text.length, start + pageSize);
      console.clear();
      console.log(`\nPage ${page + 1} of ${totalPages}`);
      console.log(text.slice(start, end));
      if (page + 1 < totalPages) {
        rl.question("\nPress Enter for next page or 'q' to quit: ", (input) => {
          if (input.toLowerCase() !== 'q') {
            displayPage(text, page + 1);
          } else {
            rl.close();
          }
        });
      } else {
        console.log("\nEnd of book.");
        rl.close();
      }
    }

    async function fetchBookText(book) {
      try {
        const response = await fetch(`${url}${book.id}/`);
        const json = await response.json();
        const textUrl = json.formats["text/plain; charset=utf-8"] || json.formats["text/plain"];

        if (!textUrl) {
          console.log("Plain text format not available for this book.");
          rl.close();
          return;
        }

        const textResponse = await fetch(textUrl);
        const bookText = await textResponse.text();
        saveToHistory({id: book.id, title: book.title, authors: book.authors});
        displayPage(bookText);

      } catch (error) {
        console.error("Error fetching book text:", error);
        rl.close();
      }
    }

async function getData(query, searchBy = "search") {
  try {
    const response = await fetch(`${url}?${searchBy}=${encodeURIComponent(query)}`);
    const json_file = await response.json();

    if (json_file.results.length === 0) {
      console.log("No books found.");
      rl.close();
      return;
    }

    console.log("\nSearch Results:");
    json_file.results.forEach((book) => {
      console.log(`${book.id}. ${book.title} by ${book.authors.map(a => a.name).join(", ")}`);
    });

    rl.question("\nSelect a book by ID: ", async (id) => {
      const book = json_file.results.find(book => book.id === parseInt(id));
      if (book) {
        await fetchBookText(book);
      } else {
        console.log("Invalid selection.");
        rl.close();
      }
    });

  } catch (error) {
    console.error("Error fetching data:", error);
    rl.close();
  }
}


function showMenu() {
      if (fs.existsSync(historyFile)) {
        const history = JSON.parse(fs.readFileSync(historyFile));
        if (history.length > 0) {
          console.log("\nReading History:");
          history.forEach((book, index) => {
            console.log(`${index + 1}. ${book.title} by ${book.authors.map(a => a.name).join(", ")}`);
          });
          console.log("0. New Search");
          rl.question("\nSelect an option: ", (choice) => {
            const index = parseInt(choice);
            if (index === 0) {
              rl.question("Search for a book (title or author): ", (query) => {
                getData(query);
              });
            } else if (index > 0 && index <= history.length) {
              fetchBookText(history[index - 1]);
            } else {
              console.log("Invalid choice.");
              rl.close();
            }
          });
          return;
        }
      }

  rl.question("Search for a book (title or author): ", (query) => {
    getData(query);
  });
}

showMenu();
