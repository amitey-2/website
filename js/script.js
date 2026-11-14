
// ========================================
// FOOTER YEAR
// ========================================

const yearElement = document.getElementById("year");

if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
}


// ========================================
// SMOOTH SCROLLING
// ========================================

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


// ========================================
// RANDOM THOUGHTS
// ========================================

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


// NEXT THOUGHT

if (nextQuote && quoteText && quoteAuthor) {
  nextQuote.addEventListener("click", () => {
    currentQuote = (currentQuote + 1) % thoughts.length;

    quoteText.textContent = thoughts[currentQuote].text;
    quoteAuthor.textContent = "— " + thoughts[currentQuote].author;

    if (copyStatus) {
      copyStatus.textContent = "";
    }
  });
}


// COPY THOUGHT

async function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return true;
  }

  const temporaryInput = document.createElement("textarea");

  temporaryInput.value = text;
  temporaryInput.style.position = "fixed";
  temporaryInput.style.opacity = "0";

  document.body.appendChild(temporaryInput);

  temporaryInput.select();
  temporaryInput.setSelectionRange(0, temporaryInput.value.length);

  const copied = document.execCommand("copy");

  temporaryInput.remove();

  return copied;
}

if (copyQuote && quoteText && quoteAuthor) {
  copyQuote.addEventListener("click", async () => {
    const quote =
      quoteText.textContent + "\n" + quoteAuthor.textContent;

    try {
      const copied = await copyText(quote);

      if (copyStatus) {
        copyStatus.textContent = copied
          ? "Copied. Keep this thought."
          : "Copy unavailable in this browser.";
      }

    } catch (error) {
      if (copyStatus) {
        copyStatus.textContent = "Copy unavailable in this browser.";
      }
    }
  });
}


// ========================================
// CONSOLE MESSAGE
// ========================================

console.log("Welcome to Amit's digital universe.");
console.log("Still becoming. Always learning.");
