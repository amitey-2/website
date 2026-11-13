
// ========================================
// HER — THE LITTLE SURPRISE
// ========================================

const SUPABASE_URL =
  "https://fqbcfuduinjdumozfbja.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_CI3BreLTxzIgIB_IcdTg5Q_OyBVx1vw";

const lockScreen = document.getElementById("lockScreen");
const lovePage = document.getElementById("lovePage");

const passwordForm = document.getElementById("passwordForm");
const passwordInput = document.getElementById("passwordInput");
const unlockButton = document.getElementById("unlockButton");
const errorMessage = document.getElementById("errorMessage");


// PASSWORD VERIFICATION
passwordForm.addEventListener("submit", async (event) => {

  event.preventDefault();

  const password = passwordInput.value.trim();

  if (!password) return;

  unlockButton.disabled = true;
  unlockButton.textContent = "Opening your world...";

  errorMessage.textContent = "";

  try {

    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/her-surprise`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          "apikey": SUPABASE_KEY
        },

        body: JSON.stringify({ password })
      }
    );

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error("Incorrect password");
    }

    displayLovePage(result.content);

    lockScreen.classList.add("hidden");
    lovePage.classList.remove("hidden");

    window.scrollTo(0, 0);

  } catch (error) {

    errorMessage.textContent =
      error.message === "Incorrect password"
        ? "Not quite, my love. Try again ♡"
        : "Something went wrong. Please try again.";

    passwordInput.value = "";

  } finally {

    unlockButton.disabled = false;
    unlockButton.textContent = "Open my little world ♡";

  }

});


// DISPLAY PRIVATE CONTENT
function displayLovePage(content) {

  document.getElementById("introText").textContent =
    content.intro;

  document.getElementById("loveLetter").textContent =
    content.letter;

  const storyList = document.getElementById("storyList");

  storyList.replaceChildren();

  content.story.forEach((item) => {

    const card = document.createElement("article");
    card.className = "story-item";

    const date = document.createElement("span");
    date.textContent = item.date;

    const title = document.createElement("h3");
    title.textContent = item.title;

    const description = document.createElement("p");
    description.textContent = item.description;

    card.append(date, title, description);
    storyList.appendChild(card);

  });


  const reasonsList = document.getElementById("reasonsList");

  reasonsList.replaceChildren();

  content.reasons.forEach((reason, index) => {

    const card = document.createElement("div");
    card.className = "reason-card";

    const number = document.createElement("span");
    number.textContent = `♡ 0${index + 1}`;

    const text = document.createElement("p");
    text.textContent = reason;

    card.append(number, text);
    reasonsList.appendChild(card);

  });


  // FINAL SURPRISE
  const surpriseButton =
    document.getElementById("surpriseButton");

  const surpriseMessage =
    document.getElementById("surpriseMessage");

  surpriseButton.onclick = () => {

    surpriseMessage.textContent = content.surprise;

    surpriseMessage.classList.remove("hidden");

    surpriseButton.textContent = "A little reminder for you ♡";

    surpriseButton.disabled = true;

  };

}
