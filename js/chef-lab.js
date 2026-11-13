
// ==================================
// CHEF'S LAB — SUPABASE CONNECTION
// ==================================

const SUPABASE_URL = "https://fqbcfuduinjdumozfbja.supabase.co";
const SUPABASE_KEY = "sb_publishable_CI3BreLTxzIgIB_IcdTg5Q_OyBVx1vw";
const BUCKET = "recipe-photos";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

document.documentElement.style.visibility = "hidden";

async function startChefLab() {
  const { data, error } = await supabaseClient.auth.getSession();

  if (error || !data.session) {
    window.location.replace("login.html");
    return;
  }

  document.documentElement.style.visibility = "visible";
  initializeNotebook(data.session);
}

startChefLab();


// ==================================
// NOTEBOOK
// ==================================

function initializeNotebook(session) {
  const entryForm = document.getElementById("entryForm");
  const entryTitle = document.getElementById("entryTitle");
  const entryCategory = document.getElementById("entryCategory");
  const entryIngredients = document.getElementById("entryIngredients");
  const entryMethod = document.getElementById("entryMethod");
  const entryNotes = document.getElementById("entryNotes");
  const entryPhoto = document.getElementById("entryPhoto");
  const photoPreview = document.getElementById("photoPreview");
  const entryStatus = document.getElementById("entryStatus");

  let kitchenEntries = [];
  let editingEntryId = null;

  const categoryContainers = {
    creations: document.getElementById("creationsList"),
    experiments: document.getElementById("experimentsList"),
    ideas: document.getElementById("ideasList"),
    diary: document.getElementById("diaryList")
  };

  // Smooth scrolling
  document.querySelectorAll(".lab-card").forEach((card) => {
    card.addEventListener("click", (event) => {
      const targetId = card.getAttribute("href");
      if (!targetId || !targetId.startsWith("#")) return;

      const target = document.querySelector(targetId);
      if (target) {
        event.preventDefault();
        target.scrollIntoView({ behavior: "smooth" });
      }
    });
  });

  // Photo preview
  entryPhoto.addEventListener("change", () => {
    const file = entryPhoto.files[0];

    if (!file) {
      clearPreview();
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      entryStatus.textContent = "Photo must be smaller than 5 MB.";
      entryPhoto.value = "";
      clearPreview();
      return;
    }

    photoPreview.src = URL.createObjectURL(file);
    photoPreview.hidden = false;
    photoPreview.style.display = "block";
  });

  function clearPreview() {
    photoPreview.removeAttribute("src");
    photoPreview.hidden = true;
    photoPreview.style.display = "none";
  }

  // Upload photo to private storage
  async function uploadPhoto(file) {
    const extension = file.name.split(".").pop().toLowerCase();
    const path =
      session.user.id + "/" + Date.now() + "-" +
      Math.random().toString(36).slice(2) + "." + extension;

    const { error } = await supabaseClient.storage
      .from(BUCKET)
      .upload(path, file, {
        contentType: file.type,
        upsert: false
      });

    if (error) throw error;
    return path;
  }

  // Load recipes
  async function loadEntries() {
    const { data, error } = await supabaseClient
      .from("recipes")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      entryStatus.textContent = "Load failed: " + error.message;
      return;
    }

    kitchenEntries = data || [];
    await displayEntries();
  }

  // Display recipes and private photos
  async function displayEntries() {
    Object.values(categoryContainers).forEach((container) => {
      if (container) container.replaceChildren();
    });

    for (const entry of kitchenEntries) {
      const container = categoryContainers[entry.category];
      if (!container) continue;

      const card = document.createElement("article");
      card.className = "kitchen-entry";

      if (entry.photo_path) {
        const { data, error } = await supabaseClient.storage
          .from(BUCKET)
          .createSignedUrl(entry.photo_path, 3600);

        if (!error && data) {
          const image = document.createElement("img");
          image.src = data.signedUrl;
          image.alt = entry.title;
          image.style.width = "100%";
          image.style.maxHeight = "260px";
          image.style.objectFit = "cover";
          image.style.borderRadius = "10px";
          card.appendChild(image);
        }
      }

      const title = document.createElement("h3");
      title.textContent = entry.title;
      
      const category = document.createElement("small");
      category.textContent = "Category: " + entry.category.toUpperCase();
      category.className = "entry-category";

      const ingredients = document.createElement("p");
      ingredients.textContent = "Ingredients: " + (entry.ingredients || "Not added");

      const method = document.createElement("p");
      method.textContent = "Method: " + (entry.method || "Not added");

      const notes = document.createElement("p");
      notes.textContent = "Kitchen notes: " + (entry.notes || "None");

      const date = document.createElement("small");
      date.textContent = new Date(entry.created_at).toLocaleDateString();

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

        clearPreview();

        if (entry.photo_path) {
          supabaseClient.storage
            .from(BUCKET)
            .createSignedUrl(entry.photo_path, 3600)
            .then(({ data }) => {
              if (data) {
                photoPreview.src = data.signedUrl;
                photoPreview.hidden = false;
                photoPreview.style.display = "block";
              }
            });
        }

        document.querySelector(".notebook").scrollIntoView({
          behavior: "smooth"
        });

        entryStatus.textContent = "Editing: " + entry.title;
        entryForm.querySelector('[type="submit"]').textContent = "UPDATE ENTRY";
      });

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
          entryStatus.textContent = "Delete failed: " + error.message;
          return;
        }

        if (entry.photo_path) {
          await supabaseClient.storage
            .from(BUCKET)
            .remove([entry.photo_path]);
        }

        if (editingEntryId === entry.id) {
          editingEntryId = null;
          entryForm.reset();
          clearPreview();
          entryForm.querySelector('[type="submit"]').textContent = "SAVE TO MY KITCHEN";
        }

        entryStatus.textContent = "Entry deleted.";
        await loadEntries();
      });

      card.append(title, category, ingredients, method, notes, date, editButton, deleteButton);
      container.appendChild(card);
    }
  }

  // Save or update recipe and photo
  entryForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const submitButton = entryForm.querySelector('[type="submit"]');
    const selectedPhoto = entryPhoto.files[0];

    if (!entryTitle.value.trim()) {
      entryStatus.textContent = "Give your creation a name first!";
      return;
    }

    if (selectedPhoto && selectedPhoto.size > 5 * 1024 * 1024) {
      entryStatus.textContent = "Photo must be smaller than 5 MB.";
      return;
    }

    const oldEntry = kitchenEntries.find(
      (entry) => entry.id === editingEntryId
    );

    submitButton.disabled = true;
    entryStatus.textContent = "Saving your kitchen entry...";

    let uploadedPath = null;
    let photoPath = oldEntry?.photo_path || null;

    try {
      if (selectedPhoto) {
        uploadedPath = await uploadPhoto(selectedPhoto);
        photoPath = uploadedPath;
      }

      const recipe = {
        title: entryTitle.value.trim(),
        category: entryCategory.value,
        ingredients: entryIngredients.value.trim(),
        method: entryMethod.value.trim(),
        notes: entryNotes.value.trim(),
        photo_path: photoPath,
        updated_at: new Date().toISOString()
      };

      let result;

      if (editingEntryId) {
        result = await supabaseClient
          .from("recipes")
          .update(recipe)
          .eq("id", editingEntryId);
      } else {
        result = await supabaseClient
          .from("recipes")
          .insert(recipe);
      }

      if (result.error) throw result.error;

      if (selectedPhoto && oldEntry?.photo_path) {
        await supabaseClient.storage
          .from(BUCKET)
          .remove([oldEntry.photo_path]);
      }

      entryStatus.textContent = editingEntryId
        ? "Recipe updated with photo! ✨"
        : "Saved to your cloud kitchen! 🍝";

      editingEntryId = null;
      entryForm.reset();
      clearPreview();
      submitButton.textContent = "SAVE TO MY KITCHEN";

      await loadEntries();

    } catch (error) {
      if (uploadedPath) {
        await supabaseClient.storage
          .from(BUCKET)
          .remove([uploadedPath]);
      }

      entryStatus.textContent = "Save failed: " + error.message;
      console.error(error);

    } finally {
      submitButton.disabled = false;
    }
  });

  loadEntries();
  console.log("Chef's Lab with photo storage is ready!");
}
