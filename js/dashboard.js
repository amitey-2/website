
// 1. DISPLAY TODAY'S DATE

const todayElement = document.getElementById("today");

if (todayElement) {
  const today = new Date();

  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  };

  todayElement.textContent = today.toLocaleDateString(
    "en-US",
    options
  );
}


// 2. WELCOME MESSAGE

console.log("Welcome to your personal dashboard.");
console.log("Your little digital universe is growing.");


// 3. MAKE ROOM CARDS INTERACTIVE

const roomCards = document.querySelectorAll(".room-card");

roomCards.forEach((card) => {
  card.addEventListener("click", (event) => {
    event.preventDefault();

    const roomName = card.querySelector("h3").textContent;

    alert(roomName + " is coming soon! 🚧");
  });
});



// 4. LIVE CLOCK

const clockElement = document.createElement("p");

clockElement.id = "liveClock";
clockElement.className = "live-clock";

const welcomeSection = document.querySelector(".welcome");

if (welcomeSection) {
  welcomeSection.appendChild(clockElement);
}

function updateClock() {
  const now = new Date();

  clockElement.textContent = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
}

updateClock();
setInterval(updateClock, 1000);

