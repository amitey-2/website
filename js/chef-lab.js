
// ==================================
// CHEF'S LAB — SUPABASE CONNECTION
// ==================================

const SUPABASE_URL =
  "https://fqbcfuduinjdumozfbja.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_CI3BreLTxzIgIB_IcdTg5Q_OyBVx1vw";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

// Hide page until login is checked
document.documentElement.style.visibility = "hidden";

async function startChefLab() {
  const { data: sessionData, error: sessionError } =
    await supabaseClient.auth.getSession();

  if (sessionError || !sessionData.session) {
    window.location.replace("login.html");
    return;
  }

  document.documentElement.style.visibility = "visible";

  initializeNotebook();
}

startChefLab();


// ==================================
// CHEF'S LAB
// ==================================

function initializeNotebook() {

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

  // Form elements
  const entryForm = document.getElementById("entryForm");
  const entryTitle = document.getElementById("entryTitle");
  const entryCategory = document.getElementById("entryCategory");
  const entryIngredients = document.getElementById("entryIngredients");
  const entryMethod = document.getElementById("entryMethod");
  const entryNotes = document.getElementById("entryNotes");
  const entryStatus = document.getElementById("entryStatus");

  let kitchenEntries = [];
  let editingEntryId = null;

  // Category containers
  const categoryContainers = {
    creations: document.getElementById("creationsList"),
    experiments: document.getElementById("experimentsList"),
    ideas: document.getElementById("ideasList"),
    diary: document.getElementById("diaryList")
  };


  // ==================================
  // LOAD RECIPES FROM SUPABASE
  // ==================================

  async function loadEntries() {

    const { data, error } = await supabaseClient
      .from("recipes")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      entryStatus.textContent =
        "Could not load recipes: " + error.message;
      console.error(error);
      return;
    }

    kitchenEntries = data || [];

    displayEntries();

    console.log("Cloud recipes loaded:", kitchenEntries.length);
  }


  // ==================================
  // DISPLAY RECIPES
  // ==================================

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
      date.textContent = new Date(
        entry.created_at
      ).toLocaleDateString();

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

      deleteButton.addEventListener("click", async () => {

        if (!confirm("Delete this kitchen entry?")) return;

        const { error } = await supabaseClient
          .from("recipes")
          .delete()
          .eq("id", entry.id);

        if (error) {
          entryStatus.textContent =
            "Delete failed: " + error.message;
          return;
        }

        if (editingEntryId === entry.id) {
          editingEntryId = null;
          entryForm.reset();

          entryForm.querySelector('[type="submit"]').textContent =
            "SAVE TO MY KITCHEN";
        }

        entryStatus.textContent = "Entry deleted.";
        await loadEntries();
      });


      card.append(
        title,
        ingredients,
        method,
        notes,
        date,
        editButton,
        deleteButton
      );

      container.appendChild(card);
    });
  }


  // ==================================
  // SAVE OR UPDATE IN SUPABASE
  // ==================================

  if (entryForm) {

    entryForm.addEventListener("submit", async (event) => {

      event.preventDefault();

      const newEntry = {
        title: entryTitle.value.trim(),
        category: entryCategory.value,
        ingredients: entryIngredients.value.trim(),
        method: entryMethod.value.trim(),
        notes: entryNotes.value.trim(),
        updated_at: new Date().toISOString()
      };

      if (!newEntry.title) {
        entryStatus.textContent =
          "Give your creation a name first!";
        return;
      }

      const submitButton =
        entryForm.querySelector('[type="submit"]');

      submitButton.disabled = true;
      entryStatus.textContent = "Saving to your cloud kitchen...";

      let error;

      if (editingEntryId) {

        const result = await supabaseClient
          .from("recipes")
          .update(newEntry)
          .eq("id", editingEntryId);

        error = result.error;

      } else {

        const result = await supabaseClient
          .from("recipes")
          .insert(newEntry);

        error = result.error;
      }

      submitButton.disabled = false;

      if (error) {
        entryStatus.textContent =
          "Save failed: " + error.message;
        console.error(error);
        return;
      }

      entryStatus.textContent = editingEntryId
        ? "Recipe updated in the cloud! ✨"
        : "Saved to your cloud kitchen! 🍝";

      editingEntryId = null;

      entryForm.reset();

      submitButton.textContent = "SAVE TO MY KITCHEN";

      await loadEntries();
    });
  }


  // First cloud load
  loadEntries();

  console.log("Chef's Lab cloud notebook is ready!");
}
