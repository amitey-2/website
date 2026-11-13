
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



// QUICK NOTES

const noteInput = document.getElementById("noteInput");
const saveNoteButton = document.getElementById("saveNote");
const savedNotes = document.getElementById("savedNotes");
const noteStatus = document.getElementById("noteStatus");

// Load previously saved notes
let notes = JSON.parse(localStorage.getItem("myNotes")) || [];

// Display notes on the page
function displayNotes() {
  savedNotes.innerHTML = "";

  notes.forEach((note, index) => {
    const noteBox = document.createElement("div");
    noteBox.className = "saved-note";

    const noteText = document.createElement("p");
    noteText.textContent = note;

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "DELETE";

    deleteButton.addEventListener("click", () => {
      notes.splice(index, 1);

      localStorage.setItem(
        "myNotes",
        JSON.stringify(notes)
      );

      displayNotes();
    });

    noteBox.appendChild(noteText);
    noteBox.appendChild(deleteButton);

    savedNotes.appendChild(noteBox);
  });
}

// Save a new note
if (saveNoteButton) {
  saveNoteButton.addEventListener("click", () => {
    const note = noteInput.value.trim();

    if (note === "") {
      noteStatus.textContent = "Write something first!";
      return;
    }

    notes.unshift(note);

    localStorage.setItem(
      "myNotes",
      JSON.stringify(notes)
    );

    noteInput.value = "";
    noteStatus.textContent = "Your thought has been saved.";

    displayNotes();
  });
}

// Show saved notes when the page opens
displayNotes();


