
// ========================================
// HER — THE LITTLE SURPRISE
// ========================================

const SUPABASE_URL =
  "https://fqbcfuduinjdumozfbja.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_CI3BreLTxzIgIB_IcdTg5Q_OyBVx1vw";

const lockScreen = document.getElementById("lockScreen");
const lovePage = document.getElementById("lovePage");

// A small greeting that follows the visitor's local time.
function updateDailyGreeting() {
  const hour = new Date().getHours();
  let greeting;
  let quotes;

  if (hour >= 5 && hour < 12) {
    greeting = "Good morning, my love ♡";
    quotes = [
      "You make every morning feel a little more beautiful.",
      "Waking up to a world where you exist is already a wonderful start.",
      "I hope your day is as lovely as the happiness you bring into my life.",
      "You are my favourite thought to wake up to."
    ];
  } else if (hour >= 12 && hour < 17) {
    greeting = "Good afternoon, my love ♡";
    quotes = [
      "I hope your day is going wonderfully. You deserve every bit of happiness.",
      "Even in the middle of a busy day, you are my sweetest thought.",
      "You make ordinary moments feel special just by being you.",
      "A little reminder: someone is thinking of you and smiling."
    ];
  } else if (hour >= 17 && hour < 21) {
    greeting = "Good evening, my love ♡";
    quotes = [
      "I hope today was kind to you. You deserve the gentlest evenings.",
      "No matter how the day went, you will always be my favourite part.",
      "May your evening be as peaceful and lovely as your smile.",
      "The day is ending, but there is no end to how much you mean to me."
    ];
  } else {
    greeting = "Good night, my love ♡";
    quotes = [
      "Close your eyes, my love. I hope your dreams are as beautiful as you are.",
      "If I could, I would send you a thousand hugs to keep you warm tonight.",
      "Rest well, sweetheart. You are the last thought in my heart tonight.",
      "May the stars watch over you and bring you the sweetest dreams. ♡"
    ];
  }

  // Keep the quote consistent for the whole local calendar day.
  const today = new Date();
  const dayKey = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  const quote = quotes[dayKey % quotes.length];

  const greetingElement = document.getElementById("timeGreeting");
  const quoteElement = document.getElementById("dailyLoveQuote");

  if (greetingElement) greetingElement.textContent = greeting;
  if (quoteElement) quoteElement.textContent = quote;
}

updateDailyGreeting();

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

    if (!result.content) {
      throw new Error("Missing private content");
    }

    displayLovePage(result.content);

    lockScreen.classList.add("hidden");
    lovePage.classList.remove("hidden");

    window.scrollTo(0, 0);

  } catch (error) {

    console.error("Surprise page error:", error);

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
    content.intro || "";

  document.getElementById("loveLetter").textContent =
    content.letter || "";

  const storyList = document.getElementById("storyList");

  storyList.replaceChildren();

  (content.story || []).forEach((item) => {

    const card = document.createElement("article");
    card.className = "story-item";

    const date = document.createElement("span");
    date.textContent = item.date || "";

    const title = document.createElement("h3");
    title.textContent = item.title || "";

    const description = document.createElement("p");
    description.textContent = item.description || "";

    card.append(date, title, description);
    storyList.appendChild(card);

  });


  const reasonsList = document.getElementById("reasonsList");

  reasonsList.replaceChildren();

  (content.reasons || []).forEach((reason, index) => {

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

    surpriseMessage.textContent =
      content.surprise || "You are loved. Always. ♡";

    surpriseMessage.classList.remove("hidden");

    surpriseButton.textContent =
      "A little reminder for you ♡";

    surpriseButton.disabled = true;

  };

}



// ========================================
// LITTLE INTERACTIVE LOVE MOMENTS
// ========================================

// Pick a note from the jar. Notes cycle without repeating until all have appeared.
const loveNotes = [
  "If I could choose one place to be right now, it would be wherever you are. ♡",
  "You make my world softer, brighter, and so much more beautiful.",
  "Just in case you forgot today: you are my favourite person.",
  "I hope you are as proud of yourself as I am of you.",
  "Even the quietest moments are special when I get to share them with you.",
  "You are loved on your best days, your difficult days, and every day in between.",
  "I still get lucky just thinking about the fact that I get to call you mine.",
  "If today feels heavy, let this little note remind you that you never have to be perfect to be loved.",
  "Your smile has a way of making everything feel alright.",
  "I would find you in every lifetime, in every version of this universe.",
  "Thank you for being you. That is already more than enough.",
  "No matter how far apart we are, you are always close to my heart.",
  "I hope something lovely happens to you today. You deserve lovely things.",
  "One day, we'll look back at all these little moments and smile at how far we've come."
];

const loveJar = document.getElementById("loveJar");
const loveNoteMessage = document.getElementById("loveNoteMessage");
let remainingLoveNotes = [];

if (loveJar && loveNoteMessage) {
  loveJar.addEventListener("click", () => {
    if (remainingLoveNotes.length === 0) {
      remainingLoveNotes = [...loveNotes];
    }

    const randomIndex = Math.floor(Math.random() * remainingLoveNotes.length);
    const [note] = remainingLoveNotes.splice(randomIndex, 1);

    loveNoteMessage.textContent = note;
    loveNoteMessage.classList.remove("note-pop");
    void loveNoteMessage.offsetWidth;
    loveNoteMessage.classList.add("note-pop");
  });
}

// Tap a star to reveal one of the wishes hidden in the night sky.
document.querySelectorAll(".wish-star").forEach((star) => {
  star.addEventListener("click", () => {
    const wishMessage = document.getElementById("wishMessage");
    if (wishMessage) {
      wishMessage.textContent = star.dataset.wish || "A little wish, sent with all my love. ♡";
    }
  });
});

// Every 17th is a monthly anniversary, beginning on May 17.
// The countdown uses the visitor's local time and rolls forward every month.
function updateMonthlyCountdown() {
  const now = new Date();
  const anniversaryDay = 17;
  const isAnniversaryToday = now.getDate() === anniversaryDay;

  let target;
  if (now.getDate() < anniversaryDay) {
    target = new Date(now.getFullYear(), now.getMonth(), anniversaryDay, 0, 0, 0);
  } else {
    target = new Date(now.getFullYear(), now.getMonth() + 1, anniversaryDay, 0, 0, 0);
  }

  const remaining = Math.max(0, target.getTime() - now.getTime());
  const days = Math.floor(remaining / 86400000);
  const hours = Math.floor((remaining % 86400000) / 3600000);
  const minutes = Math.floor((remaining % 3600000) / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);

  const setValue = (id, value) => {
    const element = document.getElementById(id);
    if (element) element.textContent = String(value).padStart(2, "0");
  };

  setValue("countDays", days);
  setValue("countHours", hours);
  setValue("countMinutes", minutes);
  setValue("countSeconds", seconds);

  const heading = document.getElementById("countdownHeading");
  const footnote = document.getElementById("countdownFootnote");

  if (heading) {
    heading.textContent = isAnniversaryToday
      ? "Happy monthly anniversary, my love! ♡"
      : "Counting down to our little day ♡";
  }

  if (footnote) {
    footnote.textContent = isAnniversaryToday
      ? "Today is our little day. Here's to another beautiful month of us. ♡"
      : "May 17 — the day our story became ours. Every 17th, another little celebration.";
  }
}

updateMonthlyCountdown();
setInterval(updateMonthlyCountdown, 1000);


// Her birthday is July 9 every year.
function updateBirthdayCountdown() {
  const now = new Date();
  let target = new Date(now.getFullYear(), 6, 9, 0, 0, 0);

  if (now.getTime() >= target.getTime()) {
    target = new Date(now.getFullYear() + 1, 6, 9, 0, 0, 0);
  }

  const remaining = Math.max(0, target.getTime() - now.getTime());
  const days = Math.floor(remaining / 86400000);
  const hours = Math.floor((remaining % 86400000) / 3600000);
  const minutes = Math.floor((remaining % 3600000) / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);

  const setValue = (id, value) => {
    const element = document.getElementById(id);
    if (element) element.textContent = String(value).padStart(2, "0");
  };

  setValue("birthdayDays", days);
  setValue("birthdayHours", hours);
  setValue("birthdayMinutes", minutes);
  setValue("birthdaySeconds", seconds);

  const footnote = document.getElementById("birthdayFootnote");
  if (footnote) {
    footnote.textContent = "Counting down to July 9 — the day the world became more beautiful. ♡";
  }
}

updateBirthdayCountdown();
setInterval(updateBirthdayCountdown, 1000);
