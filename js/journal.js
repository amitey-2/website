
/* ========================================
   MY JOURNAL — SUPABASE CONNECTION
======================================== */

const SUPABASE_URL =
  "https://fqbcfuduinjdumozfbja.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_CI3BreLTxzIgIB_IcdTg5Q_OyBVx1vw";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);


// ========================================
// ELEMENTS
// ========================================

const journalForm =
  document.getElementById("journalForm");

const entryTitle =
  document.getElementById("entryTitle");

const entryDate =
  document.getElementById("entryDate");

const entryMood =
  document.getElementById("entryMood");

const entryContent =
  document.getElementById("entryContent");

const saveButton =
  document.getElementById("saveEntry");

const cancelButton =
  document.getElementById("cancelEdit");

const entryStatus =
  document.getElementById("entryStatus");

const journalEntries =
  document.getElementById("journalEntries");

const entryCount =
  document.getElementById("entryCount");

const formHeading =
  document.getElementById("formHeading");

let currentUser = null;
let editingId = null;


// ========================================
// DATE
// ========================================

function getLocalDate() {

  const now = new Date();

  const year = now.getFullYear();

  const month = String(now.getMonth() + 1).padStart(2, "0");

  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;

}

function formatDate(dateString) {

  const [year, month, day] =
    dateString.split("-").map(Number);

  return new Date(year, month - 1, day)
    .toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });

}


// ========================================
// AUTHENTICATION
// ========================================

async function checkAuthentication() {

  const { data, error } =
    await supabaseClient.auth.getSession();

  if (error || !data.session) {

    window.location.replace("login.html");

    return false;

  }

  currentUser = data.session.user;

  return true;

}


// ========================================
// LOAD JOURNAL ENTRIES
// ========================================

async function loadEntries() {

  journalEntries.innerHTML =
    '<p class="empty-message">Loading your entries...</p>';

  const { data, error } =
    await supabaseClient
      .from("journal_entries")
      .select("*")
      .eq("user_id", currentUser.id)
      .order("entry_date", { ascending: false })
      .order("created_at", { ascending: false });

  if (error) {

    console.error("Journal loading error:", error);

    journalEntries.innerHTML =
      '<p class="empty-message">Could not load your journal. Please refresh.</p>';

    return;

  }

  entryCount.textContent =
    `${data.length} ${data.length === 1 ? "entry" : "entries"}`;

  journalEntries.innerHTML = "";

  if (data.length === 0) {

    journalEntries.innerHTML =
      '<p class="empty-message">Your journal is waiting for its first story.</p>';

    return;

  }

  data.forEach((entry) => {

    const card =
      document.createElement("article");

    card.className = "journal-card";


    // TOP SECTION

    const top =
      document.createElement("div");

    top.className = "entry-top";

    const date =
      document.createElement("p");

    date.className = "entry-date";

    date.textContent = formatDate(entry.entry_date);

    const mood =
      document.createElement("p");

    mood.className = "entry-mood";

    mood.textContent = "Mood: " + entry.mood;

    top.append(date, mood);


    // TITLE

    const title =
      document.createElement("h3");

    title.textContent = entry.title;


    // CONTENT

    const content =
      document.createElement("p");

    content.className = "entry-content";

    content.textContent = entry.content;


    // ACTIONS

    const actions =
      document.createElement("div");

    actions.className = "entry-actions";


    const editButton =
      document.createElement("button");

    editButton.type = "button";

    editButton.textContent = "EDIT";

    editButton.addEventListener("click", () => {

      editEntry(entry);

    });


    const deleteButton =
      document.createElement("button");

    deleteButton.type = "button";

    deleteButton.textContent = "DELETE";

    deleteButton.addEventListener("click", () => {

      deleteEntry(entry.id);

    });


    actions.append(editButton, deleteButton);

    card.append(top, title, content, actions);

    journalEntries.appendChild(card);

  });

}


// ========================================
// SAVE OR UPDATE ENTRY
// ========================================

journalForm.addEventListener("submit", async (event) => {

  event.preventDefault();

  const title = entryTitle.value.trim();

  const content = entryContent.value.trim();

  if (!title || !content) {

    entryStatus.textContent =
      "Please complete the title and your thoughts.";

    return;

  }

  const entry = {

    title: title,

    entry_date: entryDate.value,

    mood: entryMood.value,

    content: content,

    updated_at: new Date().toISOString()

  };

  if (!entry.entry_date) {

    entryStatus.textContent =
      "Please choose a date.";

    return;

  }

  saveButton.disabled = true;

  saveButton.textContent = "SAVING...";

  entryStatus.textContent = "";


  let result;

  if (editingId) {

    result = await supabaseClient
      .from("journal_entries")
      .update(entry)
      .eq("id", editingId)
      .eq("user_id", currentUser.id);

  } else {

    result = await supabaseClient
      .from("journal_entries")
      .insert(entry);

  }


  if (result.error) {

    console.error("Journal save error:", result.error);

    entryStatus.textContent =
      "Could not save your entry: " + result.error.message;

    saveButton.disabled = false;

    saveButton.textContent =
      editingId ? "UPDATE ENTRY" : "SAVE ENTRY";

    return;

  }


  entryStatus.textContent =
    editingId ? "Entry updated successfully." : "Entry saved successfully.";

  resetForm();

  await loadEntries();

});


// ========================================
// EDIT ENTRY
// ========================================

function editEntry(entry) {

  editingId = entry.id;

  entryTitle.value = entry.title;

  entryDate.value = entry.entry_date;

  entryMood.value = entry.mood;

  entryContent.value = entry.content;

  formHeading.textContent = "Edit your entry.";

  saveButton.textContent = "UPDATE ENTRY";

  cancelButton.hidden = false;

  entryStatus.textContent =
    "You are editing an existing entry.";

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

}


// ========================================
// CANCEL EDIT
// ========================================

cancelButton.addEventListener("click", () => {

  resetForm();

  entryStatus.textContent =
    "Editing cancelled.";

});


// ========================================
// RESET FORM
// ========================================

function resetForm() {

  journalForm.reset();

  entryDate.value = getLocalDate();

  editingId = null;

  formHeading.textContent = "Write something.";

  saveButton.textContent = "SAVE ENTRY";

  saveButton.disabled = false;

  cancelButton.hidden = true;

}


// ========================================
// DELETE ENTRY
// ========================================

async function deleteEntry(id) {

  const confirmed =
    window.confirm("Are you sure you want to delete this journal entry?");

  if (!confirmed) return;

  const { error } =
    await supabaseClient
      .from("journal_entries")
      .delete()
      .eq("id", id)
      .eq("user_id", currentUser.id);

  if (error) {

    console.error("Journal delete error:", error);

    alert("Could not delete entry: " + error.message);

    return;

  }

  await loadEntries();

}


// ========================================
// INITIALIZE
// ========================================

async function initializeJournal() {

  const authenticated =
    await checkAuthentication();

  if (!authenticated) return;

  entryDate.value = getLocalDate();

  await loadEntries();

}

initializeJournal().catch((error) => {

  console.error("Journal initialization error:", error);

  entryStatus.textContent =
    "Something went wrong. Please refresh the page.";

});
