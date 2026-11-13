
// Automatically update copyright year
const yearElement = document.getElementById("year");

if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
}

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", function (event) {
    const targetId = this.getAttribute("href");

    if (targetId === "#") return;

    const target = document.querySelector(targetId);

    if (target) {
      event.preventDefault();

      target.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }
  });
});

// Console message for future development
console.log("Welcome to Amit's digital universe.");
console.log("Still becoming. Always learning.");



// RANDOM THOUGHTS

const thoughts = [
  {
    text: "Life — dying, suffering; chaos I live in as routine.",
    author: "AMIT NEUPANE"
  },
  {
    text: "Still becoming. Still learning. Still a little chaotic.",
    author: "AMIT NEUPANE"
  },
  {
    text: "Somewhere between ambition and overthinking, I exist.",
    author: "AMIT NEUPANE"
  },
  {
    text: "Not every silence is peaceful. Sometimes it is a universe.",
    author: "AMIT NEUPANE"
  },
  {
    text: "I am a collection of unfinished stories.",
    author: "AMIT NEUPANE"
  }
];

const quoteText = document.getElementById("quoteText");
const quoteAuthor = document.getElementById("quoteAuthor");
const nextQuote = document.getElementById("nextQuote");
const copyQuote = document.getElementById("copyQuote");
const copyStatus = document.getElementById("copyStatus");

let currentQuote = 0;

if (nextQuote) {
  nextQuote.addEventListener("click", () => {
    currentQuote = (currentQuote + 1) % thoughts.length;

    quoteText.textContent = thoughts[currentQuote].text;
    quoteAuthor.textContent = "— " + thoughts[currentQuote].author;
    copyStatus.textContent = "";
  });
}

if (copyQuote) {
  copyQuote.addEventListener("click", async () => {
    const quote = quoteText.textContent +
      "\n" + quoteAuthor.textContent;

    try {
      await navigator.clipboard.writeText(quote);
      copyStatus.textContent = "Copied. Keep this thought.";
    } catch (error) {
      copyStatus.textContent = "Copy unavailable in this browser.";
    }
  });
}

