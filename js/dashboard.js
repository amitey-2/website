
// ========================================
// DASHBOARD — SUPABASE CONNECTION
// ========================================

const SUPABASE_URL =
  "https://fqbcfuduinjdumozfbja.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_CI3BreLTxzIgIB_IcdTg5Q_OyBVx1vw";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);


// ========================================
// START DASHBOARD
// ========================================

async function startDashboard() {

  // ======================================
  // AUTHENTICATION
  // ======================================

  const { data, error } =
    await supabaseClient.auth.getSession();

  if (error || !data.session) {
    window.location.replace("login.html");
    return;
  }

  console.log("Dashboard authenticated.");

  
  // ======================================
  // 1. DATE
  // ======================================

  const todayElement =
    document.getElementById("today");

  if (todayElement) {

    todayElement.textContent =
      new Date().toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
      });

  }


  // ======================================
  // 2. LIVE CLOCK
  // ======================================

  const clockElement =
    document.getElementById("liveClock");

  function updateClock() {

    if (!clockElement) return;

    clockElement.textContent =
      new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      });

  }

  updateClock();

  setInterval(updateClock, 1000);


  // ======================================
  // 3. ROOM NAVIGATION
  // ======================================

  const roomCards =
    document.querySelectorAll(".room-card");

  roomCards.forEach((card) => {

    card.addEventListener("click", (event) => {

      const link = card.getAttribute("href");

      // Allow real page links to work normally.
      if (link && link !== "#") {
        return;
      }

      event.preventDefault();

      const heading =
        card.querySelector("h3");

      const roomName = heading
        ? heading.textContent
        : "This room";

      alert(roomName + " is coming soon! 🚧");

    });

  });


  // ======================================
  // 4. CHEF'S LAB RECIPE SUMMARY
  // ======================================

  async function loadRecipeSummary() {

    const countElement =
      document.getElementById("recipeCount");

    const latestElement =
      document.getElementById("latestRecipe");

    const dateElement =
      document.getElementById("latestRecipeDate");

    if (!countElement || !latestElement) return;

    countElement.textContent = "...";

    latestElement.textContent = "Loading...";

    const { count, error: countError } =
      await supabaseClient
        .from("recipes")
        .select("*", {
          count: "exact",
          head: true
        });

    if (countError) {

      console.error(
        "Recipe count error:",
        countError.message
      );

      countElement.textContent = "Unavailable";

      latestElement.textContent =
        "Could not load recipes.";

      return;
    }

    countElement.textContent = count ?? 0;


    // GET LATEST RECIPE

    const { data: recipes, error: latestError } =
      await supabaseClient
        .from("recipes")
        .select("title, created_at")
        .order("created_at", {
          ascending: false
        })
        .limit(1);

    if (latestError) {

      console.error(
        "Latest recipe error:",
        latestError.message
      );

      latestElement.textContent =
        "Could not load latest recipe.";

      return;
    }

    if (!recipes || recipes.length === 0) {

      latestElement.textContent =
        "No recipes saved yet.";

      if (dateElement) {
        dateElement.textContent =
          "Your next creation starts here.";
      }

      return;
    }

    const latest = recipes[0];

    latestElement.textContent = latest.title;

    if (dateElement) {

      dateElement.textContent =
        "Saved on " +
        new Date(latest.created_at).toLocaleDateString(
          "en-US",
          {
            day: "numeric",
            month: "long",
            year: "numeric"
          }
        );

    }

  }

  await loadRecipeSummary();


  // ======================================
  // 5. QUICK NOTES
  // ======================================

  const noteInput =
    document.getElementById("noteInput");

  const saveNoteButton =
    document.getElementById("saveNote");

  const savedNotes =
    document.getElementById("savedNotes");

  const noteStatus =
    document.getElementById("noteStatus");

  let notes = [];

  try {

    notes =
      JSON.parse(
        localStorage.getItem("myNotes")
      ) || [];

    if (!Array.isArray(notes)) {
      notes = [];
    }

  } catch (error) {

    console.error("Could not load notes:", error);

    notes = [];

  }


  function displayNotes() {

    if (!savedNotes) return;

    savedNotes.innerHTML = "";

    notes.forEach((note, index) => {

      const noteBox =
        document.createElement("div");

      noteBox.className = "saved-note";

      const noteText =
        document.createElement("p");

      noteText.textContent = note;

      const deleteButton =
        document.createElement("button");

      deleteButton.type = "button";

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


  if (saveNoteButton && noteInput && noteStatus) {

    saveNoteButton.addEventListener("click", () => {

      const note = noteInput.value.trim();

      if (!note) {

        noteStatus.textContent =
          "Write something first!";

        return;
      }

      notes.unshift(note);

      localStorage.setItem(
        "myNotes",
        JSON.stringify(notes)
      );

      noteInput.value = "";

      noteStatus.textContent =
        "Your thought has been saved.";

      displayNotes();

    });

  }

  displayNotes();


  // ======================================
  // 6. LOG OUT
  // ======================================

  const logoutButton =
    document.getElementById("logoutButton");

  if (logoutButton) {

    logoutButton.addEventListener(
      "click",
      async () => {

        logoutButton.disabled = true;

        logoutButton.textContent =
          "LOGGING OUT...";

        const { error } =
          await supabaseClient.auth.signOut();

        if (error) {

          alert("Logout failed: " + error.message);

          logoutButton.disabled = false;

          logoutButton.textContent = "LOG OUT";

          return;
        }

        window.location.replace("login.html");

      }
    );

  }

}


// ========================================
// INITIALIZE
// ========================================

startDashboard().catch((error) => {

  console.error("Dashboard error:", error);

  alert("Something went wrong loading your dashboard. Please refresh.");

});
