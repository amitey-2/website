
const quotes = [
  "Somewhere between figuring it out and making a mess of it.",
  "I need a vacation from my own thoughts.",
  "Not lazy. Just running on low battery.",
  "A little chaos never hurt anybody. Probably.",
  "Life is a journey. I forgot the instructions.",
  "Too many interests. Not enough hours.",
  "Professional overthinker. Amateur everything else."
];

function newQuote() {
  const random = Math.floor(Math.random() * quotes.length);

  document.getElementById("quote").innerHTML =
    '"' + quotes[random] + '"' +
    '<small>A LITTLE REMINDER TO MYSELF</small>';
}

document.getElementById("year").textContent =
  new Date().getFullYear();
