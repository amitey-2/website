
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


  // FINAL SURPRISE — one choice, one reveal.
  const surpriseButton = document.getElementById("surpriseButton");
  const surpriseGame = document.getElementById("surpriseGame");
  const surpriseMessage = document.getElementById("surpriseMessage");
  const surpriseChoices = document.querySelectorAll(".surprise-choice");

  surpriseButton.onclick = () => {
    surpriseButton.classList.add("hidden");
    surpriseGame.classList.remove("hidden");
    surpriseGame.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  surpriseChoices.forEach((choice) => {
    choice.addEventListener("click", () => {
      if (choice.disabled) return;

      const selected = choice.dataset.choice;
      const reveals = {
        "1": "Caught you! 😘 Your mission is to smile right now. Yes, right now. I bet you look adorable. ♡",
        "2": "Your tiny challenge: send me your cutest selfie, or give me the biggest hug the next time you see me. No excuses! 🤭♡",
        "3": content.surprise || "You are loved. Always. More than words could ever explain. ♡"
      };

      surpriseChoices.forEach((item) => {
        item.disabled = true;
        item.classList.toggle("chosen", item === choice);
        item.classList.toggle("not-chosen", item !== choice);
      });

      surpriseMessage.textContent = reveals[selected];
      surpriseMessage.classList.remove("hidden");
      surpriseGame.classList.add("choice-made");
      surpriseMessage.classList.add("surprise-reveal");

      const celebration = document.createElement("div");
      celebration.className = "surprise-celebration";
      celebration.setAttribute("aria-hidden", "true");
      celebration.textContent = "♡  ✦  ♡  ✧  ♡";
      document.querySelector(".final-section").appendChild(celebration);

      surpriseButton.remove();
    }, { once: true });
  });

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



// ========================================
// OUR LITTLE PLAYGROUND
// ========================================

// A gentle reply for every kind of day.
const moodReplies = {
  happy: "That smile of yours is my favourite thing. Keep shining, sweetheart! 🥰♡",
  loved: "Good. Because you are loved more than this little screen could ever tell you. 💗",
  tired: "Come rest for a while, my love. You don't have to do everything today. 🥺",
  sad: "Sending you the softest hug. Whatever it is, you don't have to face it alone. 🌧️♡",
  missing: "I'm sending a kiss right back. Imagine me stealing one more. 😘"
};

const moodReply = document.getElementById("moodReply");
document.querySelectorAll(".mood-option").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".mood-option").forEach((item) => {
      item.classList.toggle("selected", item === button);
      item.setAttribute("aria-pressed", item === button ? "true" : "false");
    });
    if (moodReply) moodReply.textContent = moodReplies[button.dataset.mood] || "Sending you a little love. ♡";
  });
});

// A virtual hug, available whenever she wants one.
const hugButton = document.getElementById("hugButton");
const hugReply = document.getElementById("hugReply");
const hugCard = document.querySelector(".hug-card");
if (hugButton && hugReply && hugCard) {
  hugButton.addEventListener("click", () => {
    hugReply.textContent = "HUG DELIVERED! Arms around you, a kiss on your forehead, and all my love. 🧸♡";
    hugCard.classList.remove("hugging");
    void hugCard.offsetWidth;
    hugCard.classList.add("hugging");
  });
}

// Catch five hearts. One heart appears at a time, so the game stays easy on mobile.
const heartGameStart = document.getElementById("heartGameStart");
const heartGameArena = document.getElementById("heartGameArena");
const heartScore = document.getElementById("heartScore");
const heartGameMessage = document.getElementById("heartGameMessage");
let caughtHearts = 0;

function showCatchHeart() {
  if (!heartGameArena) return;
  heartGameArena.replaceChildren();

  const heart = document.createElement("button");
  heart.type = "button";
  heart.className = "catch-heart";
  heart.textContent = "♥";
  heart.setAttribute("aria-label", "Catch this heart");
  heart.style.left = `${8 + Math.random() * 76}%`;
  heart.style.top = `${8 + Math.random() * 58}%`;
  heart.addEventListener("click", () => {
    caughtHearts += 1;
    if (heartScore) heartScore.textContent = String(caughtHearts);
    if (caughtHearts >= 5) {
      heartGameArena.replaceChildren();
      const finish = document.createElement("span");
      finish.className = "arena-hint";
      finish.textContent = "All caught! You're my heart-catcher. ♡";
      heartGameArena.appendChild(finish);
      if (heartGameMessage) heartGameMessage.textContent = "You caught all five! Your prize: one very big kiss from me. 😘";
      if (heartGameStart) heartGameStart.textContent = "Play again ♡";
    } else {
      if (heartGameMessage) heartGameMessage.textContent = "Yay! One more little heart. 💗";
      showCatchHeart();
    }
  }, { once: true });
  heartGameArena.appendChild(heart);
}

if (heartGameStart && heartGameArena) {
  heartGameStart.addEventListener("click", () => {
    caughtHearts = 0;
    if (heartScore) heartScore.textContent = "0";
    if (heartGameMessage) heartGameMessage.textContent = "Here comes your first heart… catch it! ♡";
    heartGameStart.textContent = "Catch the heart!";
    showCatchHeart();
  });
}

// Little sealed notes: every envelope has its own message and can be opened again.
const envelopeNotes = [
  "A tiny secret: if I could pause time, I'd keep one of our happiest moments forever. ♡",
  "Your reminder for today: you are beautiful, capable, and so very loved. 💌",
  "One wish from me: more silly laughs, spontaneous hugs, and adventures with you. ✨"
];

const envelopeMessage = document.getElementById("envelopeMessage");
document.querySelectorAll(".envelope-option").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".envelope-option").forEach((item) => {
      item.classList.toggle("opened", item === button);
      item.setAttribute("aria-pressed", item === button ? "true" : "false");
    });
    const note = envelopeNotes[Number(button.dataset.envelope)];
    if (envelopeMessage && note) {
      envelopeMessage.textContent = note;
      envelopeMessage.classList.remove("note-pop");
      void envelopeMessage.offsetWidth;
      envelopeMessage.classList.add("note-pop");
    }
  });
});


// ========================================
// A TABLE FOR HER — LITTLE MEAL MENU
// ========================================
const mealOptions = {
  breakfast: [
    { icon: "🥞", name: "Fluffy Pancake Stack", description: "Warm pancakes with strawberries, maple syrup and a little extra sweetness." },
    { icon: "🧇", name: "Berry Belgian Waffles", description: "Golden waffles topped with fresh berries and a cloud of cream." },
    { icon: "🥐", name: "Parisian Morning", description: "Buttery croissants, fresh fruit and a cosy cup of coffee or tea." },
    { icon: "🍳", name: "The Sunny Plate", description: "Creamy scrambled eggs, toast, avocado and a bright little morning." },
    { icon: "🍓", name: "Pretty Berry Bowl", description: "Greek yoghurt, granola, honey and all your favourite fruits." },
    { icon: "🥑", name: "Avocado Toast", description: "Sourdough toast with smashed avocado, cherry tomatoes and herbs." }
  ],
  lunch: [
    { icon: "🍝", name: "Creamy Alfredo Pasta", description: "Silky parmesan sauce, fresh herbs and a little comfort in every bite." },
    { icon: "🥪", name: "The Lovebird Sandwich", description: "Toasted bread, cheese, crisp greens and a delicious filling." },
    { icon: "🍔", name: "Classic Cheeseburger", description: "A juicy burger with melted cheese, lettuce and golden fries." },
    { icon: "🥗", name: "Garden Fresh Salad", description: "Crunchy greens, colourful vegetables and a lovely light dressing." },
    { icon: "🍕", name: "Margherita Pizza", description: "Tomato, mozzarella and basil — simple, warm and always lovely." },
    { icon: "🌯", name: "Crispy Chicken Wrap", description: "Tender chicken, fresh vegetables and a creamy house sauce." }
  ],
  dinner: [
    { icon: "🍝", name: "Romantic Truffle Pasta", description: "Rich, creamy pasta with parmesan and a little restaurant magic." },
    { icon: "🍕", name: "Heart-Shaped Pizza", description: "Your favourite toppings on a pizza made with extra love." },
    { icon: "🍗", name: "Herb-Grilled Chicken", description: "Juicy grilled chicken with roasted potatoes and seasonal vegetables." },
    { icon: "🥩", name: "Steakhouse Special", description: "A tender steak with buttery mash and a side of greens." },
    { icon: "🍣", name: "Sushi Date Night", description: "A colourful selection of sushi rolls for a cosy evening together." },
    { icon: "🍰", name: "Something Sweet", description: "A little dessert finale — chocolate cake, cheesecake or both." }
  ]
};
const mealMenu = document.getElementById("mealMenu");
const mealSelection = document.getElementById("mealSelection");
let activeMeal = "breakfast";
let selectedDish = null;

function renderMealMenu(meal) {
  activeMeal = meal;
  if (!mealMenu) return;
  document.querySelectorAll(".meal-tab").forEach((tab) => {
    const active = tab.dataset.meal === meal;
    tab.classList.toggle("active", active);
    tab.setAttribute("aria-pressed", active ? "true" : "false");
  });
  mealMenu.replaceChildren();
  mealOptions[meal].forEach((dish) => {
    const card = document.createElement("article");
    card.className = "meal-item";
    const icon = document.createElement("span");
    icon.className = "meal-item-icon";
    icon.textContent = dish.icon;
    const title = document.createElement("h3");
    title.textContent = dish.name;
    const description = document.createElement("p");
    description.textContent = dish.description;
    const choose = document.createElement("button");
    choose.type = "button";
    choose.textContent = selectedDish === dish.name ? "Chosen with love ✓" : "I'd love this ♡";
    choose.classList.toggle("selected", selectedDish === dish.name);
    choose.setAttribute("aria-pressed", selectedDish === dish.name ? "true" : "false");
    choose.addEventListener("click", () => {
      selectedDish = dish.name;
      mealSelection.textContent = dish.name + " it is! I'll remember this little choice for our date. 💗";
      renderMealMenu(activeMeal);
    });
    card.append(icon, title, description, choose);
    mealMenu.appendChild(card);
  });
}
document.querySelectorAll(".meal-tab").forEach((tab) => {
  tab.addEventListener("click", () => renderMealMenu(tab.dataset.meal));
});
renderMealMenu("breakfast");

