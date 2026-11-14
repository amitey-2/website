
// ========================================
// AMIT NEUPANE — HOMEPAGE JAVASCRIPT
// ========================================

const quotes = [
  "Somewhere between figuring it out and making a mess of it.",
  "I need a vacation from my own thoughts.",
  "Not lazy. Just running on low battery.",
  "A little chaos never hurt anybody. Probably.",
  "Life is a journey. I forgot the instructions.",
  "Too many interests. Not enough hours.",
  "Professional overthinker. Amateur everything else."
];

const quoteText = document.getElementById("quoteText");
const quoteAuthor = document.getElementById("quoteAuthor");
const nextQuote = document.getElementById("nextQuote");
const copyQuote = document.getElementById("copyQuote");
const copyStatus = document.getElementById("copyStatus");
const year = document.getElementById("year");

let previousQuote = -1;

function newQuote() {
  if (!quoteText || !quoteAuthor) return;

  let random;

  do {
    random = Math.floor(Math.random() * quotes.length);
  } while (quotes.length > 1 && random === previousQuote);

  previousQuote = random;

  quoteText.textContent = quotes[random];
  quoteAuthor.textContent = "— AMIT NEUPANE";

  if (copyStatus) copyStatus.textContent = "";
}

if (nextQuote) {
  nextQuote.addEventListener("click", newQuote);
}

if (copyQuote) {
  copyQuote.addEventListener("click", async () => {
    const text = `${quoteText.textContent} ${quoteAuthor.textContent}`;

    try {
      await navigator.clipboard.writeText(text);

      if (copyStatus) {
        copyStatus.textContent = "Copied successfully!";
      }
    } catch (error) {
      if (copyStatus) {
        copyStatus.textContent =
          "Copy unavailable. Please select the quote manually.";
      }
    }
  });
}

if (year) {
  year.textContent = new Date().getFullYear();
}
