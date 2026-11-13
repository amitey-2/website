
// CHEF'S LAB — Welcome message
console.log("Welcome to Chef's Lab.");
console.log("Ideas are ingredients too.");

// Smooth scrolling for kitchen sections
document.querySelectorAll('.lab-card').forEach((card) => {
  card.addEventListener('click', (event) => {
    const targetId = card.getAttribute('href');

    if (!targetId || !targetId.startsWith("#")) {
      return;
    }

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

// Current year for future footer use
const currentYear = new Date().getFullYear();
console.log("Kitchen journal started — " + currentYear);


// ==================================
// CHEF'S LAB — RECIPE NOTEBOOK
// ==================================

const entryForm = document.getElementById("entryForm");

const entryTitle = document.getElementById("entryTitle");
const entryCategory = document.getElementById("entryCategory");
const entryIngredients = document.getElementById("entryIngredients");
const entryMethod = document.getElementById("entryMethod");
const entryNotes = document.getElementById("entryNotes");

const entryStatus = document.getElementById("entryStatus");

// Load saved entries from this browser
let kitchenEntries = [];

try {
  kitchenEntries = JSON.parse(
    localStorage.getItem("chefLabEntries") || "[]"
  );

  if (!Array.isArray(kitchenEntries)) {
    kitchenEntries = [];
  }
} catch (error) {
  kitchenEntries = [];
}

// Find the correct category container
const categoryContainers = {
  creations: document.getElementById("creationsList"),
  experiments: document.getElementById("experimentsList"),
  ideas: document.getElementById("ideasList"),
  diary: document.getElementById("diaryList")
};

// Display saved entries
function displayEntries() {
  Object.values(categoryContainers).forEach((container) => {
    if (container) {
      container.replaceChildren();
    }
  });

  kitchenEntries.forEach((entry) => {
    const container = categoryContainers[entry.category];

    if (!container) return;

    const card = document.createElement("article");
    card.className = "kitchen-entry";

    const title = document.createElement("h3");
    title.textContent = entry.title;

    const ingredients = document.createElement("p");
    ingredients.textContent = "Ingredients: " + (entry.ingredients || "Not added");

    const method = document.createElement("p");
    method.textContent = "Method: " + (entry.method || "Not added");

    const notes = document.createElement("p");
    notes.textContent = "Kitchen notes: " + (entry.notes || "None");

    const date = document.createElement("small");
    date.textContent = new Date(entry.date).toLocaleDateString();

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "DELETE ENTRY";
    deleteButton.className = "delete-entry";

    deleteButton.addEventListener("click", () => {
      kitchenEntries = kitchenEntries.filter(
        (item) => item.id !== entry.id
      );

      saveEntries();
      displayEntries();
    });

    card.append(title, ingredients, method, notes, date, deleteButton);
    container.appendChild(card);
  });
}

// Save entries in browser storage
function saveEntries() {
  localStorage.setItem(
    "chefLabEntries",
    JSON.stringify(kitchenEntries)
  );
}

// Handle form submission
if (entryForm) {
  entryForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const newEntry = {
      id: Date.now().toString(),
      title: entryTitle.value.trim(),
      category: entryCategory.value,
      ingredients: entryIngredients.value.trim(),
      method: entryMethod.value.trim(),
      notes: entryNotes.value.trim(),
      date: new Date().toISOString()
    };

    if (!newEntry.title) {
      entryStatus.textContent = "Give your creation a name first!";
      return;
    }

    kitchenEntries.unshift(newEntry);

    saveEntries();
    displayEntries();

    entryForm.reset();

    entryStatus.textContent = "Saved to your kitchen! 🍝";
  });
}

// Show entries when the page opens
displayEntries();

