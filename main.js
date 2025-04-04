// Clair Harmsen
// Ezekiel Turnbough
// 3/28/2025

import fetch from 'node-fetch'
import readline from 'readline'

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const url = "https://gutendex.com/books/?";

async function getData(query, searchBy = "search") {
  try {
    const response = await fetch(`${url}${searchBy}=${encodeURIComponent(query)}`);
    const json_file = await response.json();

    if (json_file.results.length === 0) {
      console.log("No books found.");
      return;
    }

    console.log("\nSearch Results:");
    json_file.results.slice(0, 5).forEach((book, index) => {
      console.log(`${book.id}. ${book.title} by ${book.authors.map(a => a.name).join(", ")}`);
    });

    rl.question("\nSelect a book by number: ", (id) => {
      const book = json_file.results.find(book => book.id === parseInt(id));
      if (book) {
        fetchBookText(book.id);
      } else {
        console.log("Invalid selection.");
        rl.close();
      }
    });

  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

async function fetchBookText(bookId) {
  try {
    const response = await fetch(`https://gutendex.com/books/${bookId}/`);
    const json = await response.json();

    const textUrl = json.formats["text/plain"];
    if (!textUrl) {
      console.log("Plain text format not available for this book.");
      rl.close();
      return;
    }

    const textResponse = await fetch(textUrl);
    const bookText = await textResponse.text();

    console.log("\n--- Book Preview ---");
    console.log(bookText.substring(0, 1000)); // Display the first 1000 character
    console.log("\n(Press Enter to continue...)");

    rl.close();
  } catch (error) {
    console.error("Error fetching book text:", error);
    rl.close();
  }
}

rl.question("Search for a book (title or author): ", (query) => {
  getData(query);
});
