
// CHEF'S LAB — Welcome
console.log("Welcome to Chef's Lab.");
console.log("Ideas are ingredients too.");

// Smooth scrolling
document.querySelectorAll(".lab-card").forEach((card) => {
  card.addEventListener("click", (event) => {
    const targetId = card.getAttribute("href");

    if (!targetId || !targetId.startsWith("#")) return;

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

// Current year
const currentYear = new Date().getFullYear();
console.log("Kitchen journal started — " + currentYear);


// ==================================
// RECIPE NOTEBOOK
// ==================================

const entryForm = document.getElementById("entryForm");

const entryTitle = document.getElementById("entryTitle");
const entryCategory = document.getElementById("entryCategory");
const entryIngredients = document.getElementById("entryIngredients");
const entryMethod = document.getElementById("entryMethod");
const entryNotes = document.getElementById("entryNotes");
const entryStatus = document.getElementById("entryStatus");

let kitchenEntries = [];
let editingEntryId = null;

// Load saved entries
try {
  kitchenEntries = JSON.parse(
    localStorage.getItem("chefLabEntries") || "[]"
  );

  if (!Array.isArray(kitchenEntries)) {
    kitchenEntries = [];
  }
} catch (error) {
  console.error("Could not load recipes:", error);
  kitchenEntries = [];
}

// Category containers
const categoryContainers = {
  creations: document.getElementById("creationsList"),
  experiments: document.getElementById("experimentsList"),
  ideas: document.getElementById("ideasList"),
  diary: document.getElementById("diaryList")
};

// Display recipes
function displayEntries() {

  Object.values(categoryContainers).forEach((container) => {
    if (container) container.replaceChildren();
  });

  kitchenEntries.forEach((entry) => {

    const container = categoryContainers[entry.category];
    if (!container) return;

    const card = document.createElement("article");
    card.className = "kitchen-entry";

    const title = document.createElement("h3");
    title.textContent = entry.title;

    const ingredients = document.createElement("p");
    ingredients.textContent =
      "Ingredients: " + (entry.ingredients || "Not added");

    const method = document.createElement("p");
    method.textContent =
      "Method: " + (entry.method || "Not added");

    const notes = document.createElement("p");
    notes.textContent =
      "Kitchen notes: " + (entry.notes || "None");

    const date = document.createElement("small");
    date.textContent =
      new Date(entry.date).toLocaleDateString();

    // EDIT BUTTON
    const editButton = document.createElement("button");
    editButton.textContent = "EDIT ENTRY";
    editButton.className = "edit-entry";

    editButton.addEventListener("click", () => {

      editingEntryId = entry.id;

      entryTitle.value = entry.title;
      entryCategory.value = entry.category;
      entryIngredients.value = entry.ingredients || "";
      entryMethod.value = entry.method || "";
      entryNotes.value = entry.notes || "";

      document.querySelector(".notebook").scrollIntoView({
        behavior: "smooth"
      });

      entryStatus.textContent = "Editing: " + entry.title;

      entryForm.querySelector('[type="submit"]').textContent =
        "UPDATE ENTRY";
    });

    // DELETE BUTTON
    const deleteButton = document.createElement("button");
    deleteButton.textContent = "DELETE ENTRY";
    deleteButton.className = "delete-entry";

    deleteButton.addEventListener("click", () => {

      kitchenEntries = kitchenEntries.filter(
        (item) => item.id !== entry.id
      );

      if (editingEntryId === entry.id) {
        editingEntryId = null;
        entryForm.reset();

        entryForm.querySelector('[type="submit"]').textContent =
          "SAVE TO MY KITCHEN";

        entryStatus.textContent = "";
      }

      saveEntries();
      displayEntries();
    });

    // PUT EVERYTHING INSIDE THE CARD
    card.append(
      title,
      ingredients,
      method,
      notes,
      date,
      editButton,
      deleteButton
    );

    // IMPORTANT: PUT CARD INSIDE ITS CATEGORY
    container.appendChild(card);

  });
}

// Save to browser storage
function saveEntries() {
  localStorage.setItem(
    "chefLabEntries",
    JSON.stringify(kitchenEntries)
  );
}

// Form submission
if (entryForm) {

  entryForm.addEventListener("submit", (event) => {

    event.preventDefault();

    const newEntry = {
      id: editingEntryId || Date.now().toString(),
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

    if (editingEntryId) {

      kitchenEntries = kitchenEntries.map((entry) => {
        if (entry.id === editingEntryId) {
          return {
            ...entry,
            ...newEntry,
            date: entry.date,
            updatedAt: new Date().toISOString()
          };
        }

        return entry;
      });

      entryStatus.textContent = "Recipe updated! ✨";
      editingEntryId = null;

    } else {

      kitchenEntries.unshift(newEntry);
      entryStatus.textContent = "Saved to your kitchen! 🍝";

    }

    saveEntries();
    displayEntries();

    entryForm.reset();

    entryForm.querySelector('[type="submit"]').textContent =
      "SAVE TO MY KITCHEN";

  });

}

// Display saved recipes on page load
displayEntries();

console.log("Chef's Lab notebook is ready!");
