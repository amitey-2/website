
// ========================================
// MEMORY GALLERY — SUPABASE CONNECTION
// ========================================

const SUPABASE_URL =
  "https://fqbcfuduinjdumozfbja.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_CI3BreLTxzIgIB_IcdTg5Q_OyBVx1vw";

const BUCKET = "memory-gallery";
const MAX_FILE_SIZE = 20 * 1024 * 1024;
const SIGNED_URL_LIFETIME = 3600;

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

// ========================================
// ELEMENTS
// ========================================

const memoryForm = document.getElementById("memoryForm");
const captionInput = document.getElementById("memoryCaption");
const filesInput = document.getElementById("memoryFiles");
const uploadBtn = document.getElementById("uploadBtn");
const uploadStatus = document.getElementById("uploadStatus");
const memoryGallery = document.getElementById("memoryGallery");
const memoryCount = document.getElementById("memoryCount");

let currentUser = null;

// ========================================
// AUTHENTICATION
// ========================================

async function checkAuthentication() {
  const { data, error } =
    await supabaseClient.auth.getSession();

  if (error || !data.session) {
    window.location.href = "login.html";
    return false;
  }

  currentUser = data.session.user;
  return true;
}

// ========================================
// FILE VALIDATION
// ========================================

function getFileExtension(file) {
  const name = file.name || "";
  const parts = name.split(".");

  if (parts.length > 1) {
    return parts.pop().toLowerCase();
  }

  const mime = file.type.toLowerCase();

  const extensions = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/heic": "heic",
    "video/mp4": "mp4",
    "video/quicktime": "mov",
    "video/webm": "webm"
  };

  return extensions[mime] || "";
}

function validateFile(file) {
  const type = file.type.toLowerCase();

  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/heic",
    "video/mp4",
    "video/quicktime",
    "video/webm"
  ];

  if (!allowedTypes.includes(type)) {
    return "Unsupported file type: " + file.name;
  }

  if (file.size > MAX_FILE_SIZE) {
    return file.name + " exceeds the 20 MB limit.";
  }

  if (file.size === 0) {
    return file.name + " is empty.";
  }

  return null;
}

// ========================================
// UPLOAD MEMORIES
// ========================================

memoryForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  const files = Array.from(filesInput.files);

  if (!currentUser) {
    uploadStatus.textContent = "Please log in again.";
    return;
  }

  if (files.length === 0) {
    uploadStatus.textContent = "Please select at least one file.";
    return;
  }

  for (const file of files) {
    const validationError = validateFile(file);

    if (validationError) {
      uploadStatus.textContent = validationError;
      return;
    }
  }

  uploadBtn.disabled = true;
  uploadBtn.textContent = "SAVING...";
  uploadStatus.textContent = "Uploading your memories...";

  const caption = captionInput.value.trim();

  let uploadedCount = 0;

  try {
    for (const file of files) {
      const extension = getFileExtension(file);

      if (!extension) {
        throw new Error("Could not identify file extension: " + file.name);
      }

      const mediaType = file.type.startsWith("image/")
        ? "image"
        : "video";

      const filePath =
        currentUser.id +
        "/" +
        crypto.randomUUID() +
        "." +
        extension;

      // Upload file to private storage
      const { error: uploadError } =
        await supabaseClient.storage
          .from(BUCKET)
          .upload(filePath, file, {
            upsert: false,
            contentType: file.type
          });

      if (uploadError) {
        throw uploadError;
      }

      // Save memory information in database
      const { error: databaseError } =
        await supabaseClient
          .from("memory_items")
          .insert({
            user_id: currentUser.id,
            caption: caption,
            file_path: filePath,
            file_name: file.name,
            media_type: mediaType
          });

      if (databaseError) {
        // Remove uploaded file if database insert fails
        await supabaseClient.storage
          .from(BUCKET)
          .remove([filePath]);

        throw databaseError;
      }

      uploadedCount++;
    }

    uploadStatus.textContent =
      uploadedCount + " memor" +
      (uploadedCount === 1 ? "y saved!" : "ies saved!");

    memoryForm.reset();

    await loadMemories();

  } catch (error) {
    console.error("Upload error:", error);

    uploadStatus.textContent =
      uploadedCount > 0
        ? uploadedCount + " saved. Error: " + error.message
        : "Upload failed: " + error.message;

    await loadMemories();

  } finally {
    uploadBtn.disabled = false;
    uploadBtn.textContent = "Save memories";
  }
});

// ========================================
// LOAD MEMORIES
// ========================================

async function loadMemories() {
  memoryGallery.innerHTML =
    '<p class="empty-message">Loading memories...</p>';

  const { data, error } = await supabaseClient
    .from("memory_items")
    .select("*")
    .eq("user_id", currentUser.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Loading error:", error);

    memoryGallery.innerHTML =
      '<p class="empty-message">Could not load memories.</p>';

    return;
  }

  memoryCount.textContent =
    data.length + (data.length === 1 ? " memory" : " memories");

  if (data.length === 0) {
    memoryGallery.innerHTML =
      '<p class="empty-message">No memories yet. Save your first moment above.</p>';

    return;
  }

  memoryGallery.innerHTML = "";

  for (const memory of data) {
    await createMemoryCard(memory);
  }
}

// ========================================
// CREATE MEMORY CARD
// ========================================

async function createMemoryCard(memory) {
  const { data, error } = await supabaseClient.storage
    .from(BUCKET)
    .createSignedUrl(
      memory.file_path,
      SIGNED_URL_LIFETIME
    );

  if (error) {
    console.error("Signed URL error:", error);
    return;
  }

  const card = document.createElement("article");
  card.className = "memory-card";

  let media;

  if (memory.media_type === "video") {
    media = document.createElement("video");
    media.controls = true;
    media.preload = "metadata";
    media.playsInline = true;
  } else {
    media = document.createElement("img");
    media.alt = memory.caption || "Saved memory";
    media.loading = "lazy";
  }

  media.className = "memory-media";
  media.src = data.signedUrl;

  const content = document.createElement("div");
  content.className = "memory-content";

  const caption = document.createElement("p");
  caption.className = "memory-caption";
  caption.textContent = memory.caption || "Untitled memory";

  const date = document.createElement("p");
  date.className = "memory-date";

  date.textContent = new Date(
    memory.created_at
  ).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  const deleteButton = document.createElement("button");
  deleteButton.className = "delete-memory";
  deleteButton.textContent = "Delete memory";

  deleteButton.addEventListener("click", async function () {
    await deleteMemory(memory.id, memory.file_path, deleteButton);
  });

  content.append(caption, date, deleteButton);
  card.append(media, content);

  memoryGallery.appendChild(card);
}

// ========================================
// DELETE MEMORY
// ========================================

async function deleteMemory(id, filePath, button) {
  const confirmed = window.confirm(
    "Are you sure you want to delete this memory?"
  );

  if (!confirmed) return;

  button.disabled = true;
  button.textContent = "Deleting...";

  try {
    // Delete database record first
    const { data, error: databaseError } =
      await supabaseClient
        .from("memory_items")
        .delete()
        .eq("id", id)
        .eq("user_id", currentUser.id)
        .select("id");

    if (databaseError) throw databaseError;

    if (!data || data.length === 0) {
      throw new Error("Memory not found or deletion not permitted.");
    }

    // Delete corresponding storage file
    const { error: storageError } =
      await supabaseClient.storage
        .from(BUCKET)
        .remove([filePath]);

    if (storageError) {
      console.error("Storage cleanup error:", storageError);

      uploadStatus.textContent =
        "Memory record deleted, but file cleanup failed.";
    } else {
      uploadStatus.textContent = "Memory deleted.";
    }

    await loadMemories();

  } catch (error) {
    console.error("Delete error:", error);

    uploadStatus.textContent =
      "Could not delete memory: " + error.message;

    button.disabled = false;
    button.textContent = "Delete memory";
  }
}

// ========================================
// INITIALIZE
// ========================================

async function initializeGallery() {
  const authenticated = await checkAuthentication();

  if (!authenticated) return;

  await loadMemories();
}

initializeGallery();
