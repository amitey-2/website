
// ========================================
// HER — THE LITTLE SURPRISE
// ========================================

const SUPABASE_URL =
  "https://fqbcfuduinjdumozfbja.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_CI3BreLTxzIgIB_IcdTg5Q_OyBVx1vw";

const lockScreen = document.getElementById("lockScreen");
const lovePage = document.getElementById("lovePage");

// Angry Mode is an in-page choice only; never restore it on a fresh visit.
document.body.classList.remove("angry-mode");

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
      "You are my favourite thought to wake up to.",
      "You deserve a morning that feels as lovely as your heart.",
      "I hope the first thing you feel today is how loved you are.",
      "Sending sunshine, a forehead kiss and a little reminder that I'm yours.",
      "May your morning be slow, your coffee be perfect and your smile be endless.",
      "The world gets another beautiful day because you're in it.",
      "I wish I could wake up beside you and steal the blankets."
    ];
  } else if (hour >= 12 && hour < 17) {
    greeting = "Good afternoon, my love ♡";
    quotes = [
      "I hope your day is going wonderfully. You deserve every bit of happiness.",
      "Even in the middle of a busy day, you are my sweetest thought.",
      "You make ordinary moments feel special just by being you.",
      "A little reminder: someone is thinking of you and smiling.",
      "A little pause in your day for a very big thought: I adore you.",
      "I hope the afternoon brings you a tiny win and a reason to smile.",
      "If I could pop by, I'd bring your favourite snack and a hug.",
      "You're doing wonderfully, even if today feels a little messy.",
      "Just a reminder that someone is cheering for you from the heart.",
      "I hope the rest of today is gentle with my favourite girl."
    ];
  } else if (hour >= 17 && hour < 21) {
    greeting = "Good evening, my love ♡";
    quotes = [
      "I hope today was kind to you. You deserve the gentlest evenings.",
      "No matter how the day went, you will always be my favourite part.",
      "May your evening be as peaceful and lovely as your smile.",
      "The day is ending, but there is no end to how much you mean to me.",
      "I hope the evening gives you time to breathe and feel proud of yourself.",
      "The best part of my day is always finding my way back to thoughts of you.",
      "If I could plan tonight, it would be dinner, laughter and you.",
      "May your evening be cosy and your worries feel far away.",
      "You deserve a night that feels like a warm blanket for your heart.",
      "I hope I get to hear all about your day soon."
    ];
  } else {
    greeting = "Good night, my love ♡";
    quotes = [
      "Close your eyes, my love. I hope your dreams are as beautiful as you are.",
      "If I could, I would send you a thousand hugs to keep you warm tonight.",
      "Rest well, sweetheart. You are the last thought in my heart tonight.",
      "May the stars watch over you and bring you the sweetest dreams. ♡",
      "May your dreams be sweet and your sleep be deep, my love.",
      "If I could, I'd tuck you in and leave a kiss on your forehead.",
      "Rest your beautiful mind; tomorrow is another chance to shine.",
      "I hope you fall asleep feeling safe, treasured and adored.",
      "I'll be sending a little love your way until morning.",
      "Good night, sweetheart. You are loved in every time zone."
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

// Today's reason is stable for the visitor's local calendar day.
const dailyReasons = [
  "Because your smile can turn an ordinary moment into my favourite memory. ♡",
  "Because you make me want to be a kinder, better version of myself.",
  "Because even a little message from you can make my whole day.",
  "Because I love the way you see the world, in your own beautiful way.",
  "Because you make silence feel comfortable and conversations feel endless.",
  "Because your happiness matters to me, even in the smallest things.",
  "Because you are wonderfully, unapologetically you.",
  "Because I can be silly around you and still feel completely loved.",
  "Because you make the future feel like something I get to look forward to.",
  "Because your little habits have become some of my favourite things.",
  "Because you make distance feel smaller and love feel bigger.",
  "Because I admire the way you keep going, even on difficult days.",
  "Because being loved by you is a gift I never want to take for granted.",
  "Because you make the simplest plans feel exciting when they're with you.",
  "Because your laugh is a sound I could never get tired of.",
  "Because you remind me that the best things are often the little things.",
  "Because I love learning something new about you every day.",
  "Because you make my heart feel at home.",
  "Because you deserve to be celebrated, not just on special days, but always.",
  "Because choosing you is one of my favourite decisions.",
  "Because you bring warmth into places you don't even realise.",
  "Because you are strong, soft, thoughtful, and so much more than you know.",
  "Because I love making memories with you, even the silly ones.",
  "Because you make me smile at my phone like a complete fool. 🤭",
  "Because no one else could ever be exactly you, and that's my favourite thing.",
  "Because I want to hear about your day, even the ordinary bits.",
  "Because you make me believe in all the little adventures still waiting for us.",
  "Because I love the person I get to be when I'm with you.",
  "Because your dreams matter to me, and I want to cheer you on.",
  "Because every day gives me another reason to be grateful you're in my life. ♡",
  "Because your presence makes even an ordinary day feel worth remembering.",
  "Because I never run out of little things I want to tell you.",
  "Because you have a way of making my worries feel a little quieter.",
  "Because your kindness says so much about the person you are.",
  "Because I love the way your eyes light up when you're excited.",
  "Because you make me look forward to the next hello.",
  "Because you are my favourite notification.",
  "Because even our simplest conversations mean something to me.",
  "Because you make me want to collect a lifetime of tiny moments.",
  "Because I love how there is always something new to discover about you.",
  "Because you deserve all the patience, tenderness and happiness in the world.",
  "Because you make a simple good morning feel special.",
  "Because I can picture a thousand little adventures with you.",
  "Because your happiness gives me another reason to smile.",
  "Because I love hearing your opinions, even when we disagree.",
  "Because you make being myself feel easy.",
  "Because I want to celebrate your wins, big and small.",
  "Because you bring your own kind of magic into my life.",
  "Because I love the way you can make me laugh without even trying.",
  "Because your presence is a comfort I never want to take for granted.",
  "Because you make waiting for the next time we meet feel worthwhile.",
  "Because I love the little world we are building together.",
  "Because you are worth showing up for, every single day.",
  "Because your voice is one of my favourite sounds.",
  "Because you make me curious about all the places life could take us.",
  "Because I love remembering the first little moments that brought us here.",
  "Because you make affection feel natural and easy.",
  "Because I want to know every version of you: sleepy, silly, serious and excited.",
  "Because you remind me that love lives in the details.",
  "Because I would choose another conversation with you over almost anything.",
  "Because you make even a quiet evening feel like a lovely plan.",
  "Because I love how much heart you put into the things that matter to you.",
  "Because your dreams deserve room to grow.",
  "Because I want to be someone you can always be honest with.",
  "Because you make me grateful for the timing that brought us together.",
  "Because I love your little expressions and the stories behind them.",
  "Because you make every reunion feel like a favourite scene.",
  "Because you deserve to feel adored on the ordinary Tuesdays too.",
  "Because I love the way you make plans feel like promises of fun.",
  "Because you are never just another part of my day; you're a highlight.",
  "Because I want to keep learning how to love you better.",
  "Because your courage inspires me more than you know.",
  "Because you make me believe that small gestures can mean everything.",
  "Because I love sharing random thoughts with you.",
  "Because you have a beautiful way of being completely yourself.",
  "Because I want to be there for the exciting days and the messy ones.",
  "Because you make my world feel a little brighter without even trying.",
  "Because I love how one memory can make me smile all over again.",
  "Because you are someone I am proud to care for.",
  "Because I want to make you feel as special as you make me feel.",
  "Because you turn little moments into stories I want to keep.",
  "Because I love the thought of growing through life side by side.",
  "Because you make me want to slow down and enjoy the moment.",
  "Because you deserve reassurance even when you haven't asked for it.",
  "Because I love how your own little world has become important to me.",
  "Because I never want you to doubt how much you matter.",
  "Because you make me excited for all the firsts we still have ahead.",
  "Because your smile is always worth the extra effort.",
  "Because I love the comfort of knowing we're choosing each other.",
  "Because you make ordinary words like 'see you soon' feel exciting.",
  "Because I want to hear about the things that made you happy today.",
  "Because you make my favourite memories feel even better when I revisit them.",
  "Because I love the way you care about the people close to you.",
  "Because you make me want to turn affection into a thousand little actions.",
  "Because you are a lovely surprise in a world full of routines.",
  "Because I want to keep finding new ways to make you smile.",
  "Because I love that our story is still being written.",
  "Because you make distance a detail, not a measure of how much I care.",
  "Because you deserve someone who listens to all the little details.",
  "Because I love your excitement when something goes just right.",
  "Because you make the word 'together' my favourite kind of plan.",
  "Because I want to be your teammate in the big things and the tiny ones.",
  "Because you make me smile at memories that only we understand.",
  "Because you are precious to me in ways a single message can't explain.",
  "Because I love how a little time with you can reset my whole day.",
  "Because you make me want to save the best stories to tell you first.",
  "Because you deserve a love that feels safe, gentle and joyful.",
  "Because I love discovering the things that make you uniquely happy.",
  "Because you make me excited about the future without needing to know every detail.",
  "Because I want to keep making room for laughter in our story.",
  "Because your little victories are worth celebrating with confetti.",
  "Because I love that we can be romantic and ridiculous at the same time.",
  "Because you make me want to be thoughtful in ways that really matter.",
  "Because I want to remind you how wonderful you are, not just when you feel low.",
  "Because you are one of the best parts of my everyday thoughts.",
  "Because I love the idea of having countless more birthdays and anniversaries to celebrate.",
  "Because you make a simple 'take care' feel full of meaning.",
  "Because I want to be curious about your changing dreams and plans.",
  "Because your happiness is never a small thing to me.",
  "Because I love how many different ways there are to make you feel loved.",
  "Because you make me want to remember the details others might miss.",
  "Because I would happily make time for one more hug.",
  "Because I love the little traditions that are becoming ours.",
  "Because you make me hopeful about the memories we haven't made yet.",
  "Because I want you to feel appreciated for who you are, not just what you do.",
  "Because you make even a short message feel like a warm visit.",
  "Because loving you gives ordinary days a little extra sparkle.",
  "Because I am lucky to know you, and even luckier to love you."
];

const dailyReasonButton = document.getElementById("dailyReasonButton");
const dailyReasonMessage = document.getElementById("dailyReasonMessage");
const dailyReasonDate = document.getElementById("dailyReasonDate");
const localNowForReason = new Date();
const localDayNumber = Math.floor(new Date(localNowForReason.getFullYear(), localNowForReason.getMonth(), localNowForReason.getDate()).getTime() / 86400000);
const todaysReason = dailyReasons[((localDayNumber % dailyReasons.length) + dailyReasons.length) % dailyReasons.length];
if (dailyReasonDate) {
  dailyReasonDate.textContent = localNowForReason.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
}
if (dailyReasonButton && dailyReasonMessage) {
  dailyReasonButton.addEventListener("click", () => {
    dailyReasonMessage.textContent = todaysReason;
    dailyReasonMessage.classList.remove("note-pop");
    void dailyReasonMessage.offsetWidth;
    dailyReasonMessage.classList.add("note-pop");
    dailyReasonButton.textContent = "A little reminder, just for today ♡";
    dailyReasonButton.disabled = true;
  });
}

// Open-when letters are kept in this page's code; choosing one reveals its note.
const openWhenLetters = {
  miss: "If you miss me right now, imagine me reaching for your hand and pulling you into the longest hug. I wish I could be there for every little moment, but until then, remember that you're always close to my heart. I miss you too, my love. ♡",
  sad: "Hey sweetheart. You don't have to pretend to be okay with me. Take a breath, be gentle with yourself, and remember that one difficult day doesn't change how wonderful you are. I'm on your side, always. If I were there, I'd hold you until things felt a little lighter. 💗",
  sleep: "Close your eyes, love. Let today be finished; you don't have to solve everything tonight. I hope your pillow is soft, your dreams are kind, and you wake up feeling lighter. Imagine a goodnight kiss on your forehead from me. Sleep well. 🌙",
  confidence: "Read this twice: you are capable, beautiful, and stronger than you give yourself credit for. You don't need to be perfect to make me proud. Keep going at your own pace. I believe in you, and I hope you never forget to believe in yourself too. ✨",
  laugh: "Official reminder: somewhere out there is a person who is completely obsessed with you, smiles at their phone because of you, and would absolutely lose an argument just to see you laugh. That person is me. 😂💕"
};
const openWhenLetter = document.getElementById("openWhenLetter");
document.querySelectorAll(".open-when-option").forEach((button) => {
  button.addEventListener("click", () => {
    const letter = openWhenLetters[button.dataset.letter];
    if (!letter || !openWhenLetter) return;
    document.querySelectorAll(".open-when-option").forEach((item) => {
      const selected = item === button;
      item.classList.toggle("selected", selected);
      item.setAttribute("aria-pressed", selected ? "true" : "false");
    });
    openWhenLetter.replaceChildren();
    const icon = document.createElement("span");
    icon.className = "open-when-letter-icon";
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = "💌";
    const message = document.createElement("p");
    message.textContent = letter;
    openWhenLetter.append(icon, message);
    openWhenLetter.classList.remove("letter-pop");
    void openWhenLetter.offsetWidth;
    openWhenLetter.classList.add("letter-pop");
  });
});

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
      mealSelection.textContent = dish.name + " it is! That sounds perfect for our next meal together. 💗";
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



// DATE INVITATION — SEND A PREFILLED WHATSAPP MESSAGE
const dateRequestForm = document.getElementById("dateRequestForm");
const dateRequestDate = document.getElementById("dateRequestDate");
const dateRequestType = document.getElementById("dateRequestType");
const dateRequestNote = document.getElementById("dateRequestNote");
const dateRequestFeedback = document.getElementById("dateRequestFeedback");
// International WhatsApp destination, without the leading +.
const dateRequestWhatsApp = "971541819066";
if (dateRequestDate) {
  const localToday = new Date();
  const localDate = new Date(localToday.getTime() - localToday.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  dateRequestDate.min = localDate;
}
if (dateRequestForm) {
  dateRequestForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!dateRequestDate || !dateRequestDate.value) {
      if (dateRequestFeedback) dateRequestFeedback.textContent = "Choose a date first, sweetheart. ♡";
      return;
    }
    const chosenDate = new Date(dateRequestDate.value + "T12:00:00");
    const prettyDate = chosenDate.toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" });
    const dateType = dateRequestType ? dateRequestType.value : "A date";
    const note = dateRequestNote ? dateRequestNote.value.trim() : "";
    const messageLines = ["Hii love! 💗", "I'd really like to go on a date with you!", "", "My preferred day: " + prettyDate, "My date idea: " + dateType];
    if (selectedDish) messageLines.push("Something from your lovely menu I'd like: " + selectedDish);
    if (note) messageLines.push("A little note: " + note);
    messageLines.push("", "Will you take me? 🥺💕");
    const whatsappUrl = "https://wa.me/" + dateRequestWhatsApp + "?text=" + encodeURIComponent(messageLines.join("\n"));
    if (dateRequestFeedback) dateRequestFeedback.textContent = "Opening your WhatsApp invitation… 💌";
    window.location.href = whatsappUrl;
  });
}


// Register a small static-asset cache for the Home Screen version.
// Private Supabase content and API responses are deliberately never cached.
if ("serviceWorker" in navigator && location.protocol === "https:") {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch((error) => {
      console.info("Offline shell registration was unavailable:", error);
    });
  });
}


// ========================================
// FOUR-SCREEN MINI APP NAVIGATION
// ========================================
const appTabLinks = document.querySelectorAll(".phone-dock [data-tab]");
const appTabPanels = document.querySelectorAll(".app-tab-panel");

function activateAppTab(tabName, shouldScroll = true) {
  let found = false;
  appTabPanels.forEach((panel) => {
    const active = panel.dataset.panel === tabName;
    panel.classList.toggle("active", active);
    panel.setAttribute("aria-hidden", active ? "false" : "true");
    if (active) found = true;
  });
  if (!found) return;

  appTabLinks.forEach((link) => {
    const active = link.dataset.tab === tabName;
    link.classList.toggle("active", active);
    if (active) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });

  if (shouldScroll) window.scrollTo({ top: 0, behavior: "smooth" });
}

appTabLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    activateAppTab(link.dataset.tab);
  });
});

activateAppTab("story", false);


// ========================================
// EXPANDED MESSAGE LIBRARY — EXTRA VARIETY
// Each interactive collection shuffles and exhausts its messages before repeating.
function makeMessagePicker(items) {
  let bag = [], last = null;
  return () => {
    if (!bag.length) {
      bag = [...items];
      for (let i=bag.length-1;i>0;i--) {
        const j=Math.floor(Math.random()*(i+1));
        [bag[i],bag[j]]=[bag[j],bag[i]];
      }
      if (bag.length>1 && bag[bag.length-1]===last) [bag[0],bag[bag.length-1]]=[bag[bag.length-1],bag[0]];
    }
    last=bag.pop();
    return last;
  };
}

const expandedJarNotes = ["Your smile is my favourite little plot twist in any day.","I hope you know you are someone's favourite person. Very much someone's.","If I could send a hug through this jar, it would be the kind that lasts forever.","You make my heart feel like it has found its favourite home.","I love the way even the smallest things remind me of you.","One day we'll have a thousand stories that begin with 'remember when…'","You are allowed to take up space, rest, dream big and be completely yourself.","I'd choose a quiet hour with you over a perfect day without you.","Your happiness matters to me, even when it's about the tiniest thing.","I hope you never forget how easy you are to adore.","If kisses were stars, your sky would never get dark.","You're my favourite person to do absolutely nothing with.","I want to keep discovering new reasons to fall for you.","You make my ordinary world feel a little more magical.","Thank you for being the you that I get to love.","Somewhere between hello and now, you became my favourite thought.","I hope today gives you the same warmth you bring into my life.","You're worth every extra minute, every thoughtful detail and every hug.","I wish I could save the sound of your laugh in a little bottle.","Even on a quiet day, my heart has plenty to say about you.","You deserve a love that feels like a deep breath and a safe place.","I love that our story still has so many blank pages.","If I could make one wish right now, it would be more time beside you.","You're a beautiful part of my life, not just a pretty moment in it.","I hope you feel chosen, appreciated and adored today.","You're my favourite reason to believe in little miracles.","Your dreams are important, and I want to hear every one of them.","I'd find a way to make you laugh, even from the other side of the world.","Being with you makes the simplest plans feel special.","Here's a reminder wrapped in a tiny note: I choose you."];
const jarPicker = makeMessagePicker(expandedJarNotes);
const jarButton = document.getElementById("loveJar");
const jarOutput = document.getElementById("loveNoteMessage");
if (jarButton && jarOutput) jarButton.addEventListener("click", () => {
  jarOutput.textContent = jarPicker();
  jarOutput.classList.remove("note-pop"); void jarOutput.offsetWidth; jarOutput.classList.add("note-pop");
});

const extraOpenLetters = {
 miss: ["Imagine me pulling you into a hug and telling you that I miss you just as much. Until we're together again, keep a little piece of my heart with you. ♡","If I could teleport, I'd already be beside you, probably stealing your hand and asking for a kiss.","Missing you is just my heart reminding me how happy it is when you're near. Our next hello is coming.","Think of this as a pocket-sized cuddle. Keep it close until I can give you the real one."],
 sad: ["You don't have to turn a difficult day into a good one straight away. Be gentle with yourself. I'm here, and you are loved.","Whatever you're feeling is allowed. You never have to pretend with me. I'd rather sit with you through it than have you feel alone.","You are not behind, not failing and not a burden. You're human, and you deserve softness today.","If I were beside you, I'd hold your hand first and ask questions later. Sending you all my love."],
 sleep: ["Let the day settle. You have done enough, you are enough, and you deserve a peaceful night. Sweet dreams. 🌙","Imagine a goodnight kiss on your forehead and my arms around you. That's where I wish I was.","Tomorrow can wait. Let your thoughts rest and let the stars keep you company tonight.","I hope sleep finds you gently and brings you the sweetest dreams. I love you, sweetheart."],
 confidence: ["You are capable of more than you give yourself credit for. Keep going at your pace; I'm proud of you.","Don't let one difficult moment make you forget all the wonderful things you are.","You deserve to take up space, speak your mind and chase every dream that matters to you.","Look at how far you've come. I hope you celebrate your effort as much as your achievements."],
 laugh: ["Emergency notice: your boyfriend has once again forgotten how to act normal because you're too cute. 🤭","If being adorable was an Olympic sport, you'd win gold and I'd be in the crowd embarrassing you.","I was going to write a serious letter, but then I remembered I am hopelessly distracted by you. 😂","Your official mission: smile. Failure to comply may result in surprise hugs and excessive kisses."]
};
const extraOpenPickers = Object.fromEntries(Object.entries(extraOpenLetters).map(([k,v])=>[k,makeMessagePicker(v)]));
document.querySelectorAll(".open-when-option").forEach(button => button.addEventListener("click", () => {
  const picker=extraOpenPickers[button.dataset.letter], box=document.getElementById("openWhenLetter");
  if(!picker||!box)return;
  const p=box.querySelector("p");
  if(p){p.textContent=picker();box.classList.remove("letter-pop");void box.offsetWidth;box.classList.add("letter-pop");}
}));

const expandedWishes = [["I wish I could be beside you for every little and ordinary moment. ♡","I wish I could turn a long day into a warm hug.","I wish we could collect a thousand ordinary afternoons together.","I wish every goodbye came with a countdown to our next hello.","I wish I could hold your hand through every new adventure.","I wish you could borrow my eyes and see how special you are."],["I wish every dream you carry finds its way to you.","I wish your plans surprise you in the loveliest ways.","I wish you always find courage to chase what makes you happy.","I wish beautiful doors open for you at just the right time.","I wish you never stop believing in the things that light you up.","I wish your hard work brings you the happiness you deserve."],["I wish I could make you see yourself through my eyes.","I wish you knew how often a tiny thought of you makes me smile.","I wish I could bottle the feeling I get when you laugh.","I wish you never questioned how beautiful you are to me.","I wish you could feel how much warmth your messages bring me.","I wish you could hear how softly I say your name when I miss you."],["I wish we keep choosing each other through every season.","I wish we always make room for laughter, even on busy days.","I wish we keep learning new things about each other.","I wish our story is full of spontaneous plans and favourite traditions.","I wish we never stop making little memories out of ordinary days.","I wish every year gives us more reasons to celebrate us."],["I wish your heart always feels safe, loved and understood.","I wish you are gentle with yourself when life feels difficult.","I wish you never feel you have to hide your feelings from me.","I wish peace finds you even on the noisiest days.","I wish you feel appreciated for who you are, not just what you do.","I wish you always have someone to lean on when you need rest."],["I wish for a thousand more memories, laughs and little adventures.","I wish our next date becomes one of those stories we retell.","I wish we get lost somewhere new and find our own favourite place.","I wish for late-night talks, silly photos and one more dessert.","I wish our camera roll fills up with moments that feel like us.","I wish we keep finding reasons to celebrate tiny victories."],["I wish that even on hard days, you never forget how much you mean to me.","I wish you always know you are someone's favourite person.","I wish you feel loved before you even have to ask.","I wish you remember one difficult day can never define you.","I wish your heart never runs short of hope.","I wish you always know that I'm cheering for you."]];
const starPickers=expandedWishes.map(items=>makeMessagePicker(items));
document.querySelectorAll(".wish-star").forEach((star,i)=>star.addEventListener("click",()=>{
 const box=document.getElementById("wishMessage"),picker=starPickers[i];
 if(box&&picker){box.textContent=picker();box.classList.remove("note-pop");void box.offsetWidth;box.classList.add("note-pop");}
}));

const extraMoodReplies = {"happy":["I hope your happiness stays for ages. You deserve a day as lovely as you are.","If I could, I'd bottle this happy feeling and save it for a rainy day.","Please tell me what made you smile so I can celebrate it with you. 💗","Keep glowing, sweetheart. Your joy looks beautiful on you."],"loved":["I hope you feel wrapped in love today, even from a little distance.","You deserve to feel adored in the big moments and the tiny ones.","Sending extra kisses to make sure that loved feeling sticks around. 😘","As you should be, sweetheart. I'm very lucky to love you."],"tired":["Permission to slow down granted. Your worth isn't measured by your to-do list.","I wish I could bring you a blanket and your favourite drink. Rest, sweetheart.","The world can wait while you look after yourself.","Sending you a soft hug and absolutely no expectations. Just rest. ♡"],"sad":["You don't have to explain it perfectly to deserve comfort. I'm on your side.","One breath at a time, my love. I'm here for the easy days and the hard ones.","You are not a burden. Your feelings matter, and so do you. 💗","If I were there, I'd sit beside you and hold your hand until things felt lighter."],"missing":["Missing you too. Here's a long-distance hug with an extra squeeze.","If I could teleport, I would already be there asking for a cuddle.","Consider this a little kiss delivered straight to your screen. Muah! 💋","Let's turn that missing feeling into a countdown to our next hello. ♡"]};
const moodPickersExtra=Object.fromEntries(Object.entries(extraMoodReplies).map(([k,v])=>[k,makeMessagePicker(v)]));
document.querySelectorAll(".mood-option").forEach(button=>button.addEventListener("click",()=>{
 const box=document.getElementById("moodReply"),picker=moodPickersExtra[button.dataset.mood];
 if(box&&picker)box.textContent=picker();
}));

const expandedEnvelopeNotes = [["If today had a favourite scene, I hope it would be one with you in it.","I keep little memories of us tucked away like treasures. This is one more.","My favourite place isn't on a map. It's wherever I get to be with you.","I hope we never run out of silly things to laugh about together."],["You are doing better than you think. I hope you give yourself credit today.","You deserve kindness, especially from yourself. Please don't forget that.","No matter what today looks like, you are enough exactly as you are.","You are someone's favourite person, and that someone is very lucky."],["Here's to a future full of new places, favourite meals and stories that are ours.","May we always find time for little dates and big dreams.","One day we'll look back at all these tiny moments and realise they were everything.","I wish our next memory arrives when we least expect it and makes us smile for years."]];
const envelopePickersExtra=expandedEnvelopeNotes.map(items=>makeMessagePicker(items));
document.querySelectorAll(".envelope-option").forEach(button=>button.addEventListener("click",()=>{
 const box=document.getElementById("envelopeMessage"),picker=envelopePickersExtra[Number(button.dataset.envelope)];
 if(box&&picker){box.textContent=picker();box.classList.remove("note-pop");void box.offsetWidth;box.classList.add("note-pop");}
}));


// ========================================
// A LITTLE MOOD GARDEN + HER VIRTUAL PUPPY
// ========================================
const gardenMoodCopy = {
  happy: {
    emoji: "🌷",
    title: "Look at that lovely smile!",
    message: "I hope this happiness stays with you for a long, long time. Let's celebrate the little things that made today beautiful. ♡",
    actions: [["Play a tiny game 🎮","game"],["Make a wish ✨","wishes"],["Pick a love note 💌","jar"]],
    puppy: "Your happy little energy has made my tail wag! Let's celebrate! 🐾",
    puppyFace: "🐶", puppyClass: "puppy-happy"
  },
  missing: {
    emoji: "💌",
    title: "Sending you the warmest hug.",
    message: "I wish I could close the distance with one big cuddle. Until then, here's a little piece of my heart and a memory to keep close. ♡",
    actions: [["Open a little letter 💌","miss-letter"],["Visit our memories 📸","memories"],["Get a puppy hug 🫶","puppy-hug"]],
    puppy: "I brought you a heart because someone misses you very much. 💗",
    puppyFace: "🐶", puppyClass: "puppy-hugging"
  },
  sad: {
    emoji: "🫶",
    title: "It's okay not to feel okay.",
    message: "You don't have to pretend here, sweetheart. Take your time, breathe, and remember that you are loved on the difficult days too.",
    actions: [["A comforting letter 💗","sad-letter"],["A big virtual hug 🧸","hug"],["A gentle love note 🌷","jar"]],
    puppy: "No need to talk, sweetheart. I'll sit right here beside you. *soft puppy cuddle*",
    puppyFace: "🥺", puppyClass: "puppy-hugging"
  },
  tired: {
    emoji: "🌙",
    title: "Rest, my favourite human.",
    message: "You've done enough for today. You deserve a quiet moment, a soft blanket and absolutely no pressure to do anything else.",
    actions: [["A sleepy little letter 🌙","sleep-letter"],["Puppy cuddle 🧸","puppy-hug"],["A soft reminder ♡","reason"]],
    puppy: "Shhh… I'll curl up beside you. We can both have a little nap. 😴",
    puppyFace: "😴", puppyClass: "puppy-hugging"
  },
  loved: {
    emoji: "💗",
    title: "As you should, sweetheart.",
    message: "You deserve to feel adored in the big moments and the tiny ones. Here's a little reminder of just how special you are to me.",
    actions: [["Today's reason I love you ♡","reason"],["Pick from the love jar 💌","jar"],["Read a little letter","miss-letter"]],
    puppy: "I agree! You deserve all the cuddles, treats and love in the world! 🐾",
    puppyFace: "🐕", puppyClass: "puppy-happy"
  },
  bored: {
    emoji: "🎾",
    title: "Boredom has officially been challenged!",
    message: "Your mission: have a little fun. I've prepared some tiny distractions and one very enthusiastic puppy.",
    actions: [["Catch five hearts 💘","game"],["Open a mystery envelope 💌","envelope"],["Make a wish ✨","wishes"]],
    puppy: "Did someone say PLAY?! Throw the ball! Throw the ball! 🎾",
    puppyFace: "🐕", puppyClass: "puppy-happy"
  },
  angry: {
    emoji: "🌧️",
    title: "It's okay to be angry, sweetheart.",
    message: "You don't have to hide it or pretend everything is fine. Take a breath, let it out if you need to, and give yourself a little space. I'm still right here, on your team. ♡",
    actions: [["A puppy hug, please 🐶","puppy-hug"],["A little love note 💌","jar"],["A gentle reset 🫶","hug"]],
    puppy: "I'm making my grumpiest little face too… 😤 But I saved my biggest cuddle just for you. No rush, okay?",
    puppyFace: "😤", puppyClass: "puppy-hugging"
  },
  unsure: {
    emoji: "☁️",
    title: "You don't have to figure it out.",
    message: "Some days are a mixture of everything. That's okay too. Let's just start with one small, kind thing for you.",
    actions: [["A gentle hug 🫶","hug"],["A little love note 💌","jar"],["Sit with your puppy 🐾","puppy-hug"]],
    puppy: "It's okay if you don't know. I'm just happy to keep you company. ♡",
    puppyFace: "🥰", puppyClass: "puppy-hugging"
  }
};

const gardenButtons = document.querySelectorAll(".garden-mood-button");
const gardenResult = document.getElementById("gardenMoodResult");
const gardenSuggestions = document.getElementById("gardenSuggestions");
const gardenResultIcon = gardenResult && gardenResult.querySelector(".garden-result-flower");
const gardenResultTitle = gardenResult && gardenResult.querySelector("h3");
const gardenResultText = gardenResult && gardenResult.querySelector(":scope > p");
const puppyScene = document.getElementById("puppyScene");
const puppyEmoji = document.getElementById("puppyEmoji");
const puppyMessage = document.getElementById("puppyMessage");
const puppyNameDisplay = document.getElementById("puppyNameDisplay");
const puppyNameForm = document.getElementById("puppyNameForm");
const puppyNameInput = document.getElementById("puppyNameInput");
const puppyFetchGame = document.getElementById("puppyFetchGame");
const puppyBall = document.getElementById("puppyBall");
let puppyName = "your little puppy";
let puppyFetchReady = false;

try {
  const savedPuppyName = localStorage.getItem("ourLittleWorldPuppyName");
  if (savedPuppyName) puppyName = savedPuppyName;
} catch (_) {}
if (puppyNameDisplay) puppyNameDisplay.textContent = puppyName === "your little puppy" ? "Your little puppy" : puppyName + " ♡";
if (puppyNameInput && puppyName !== "your little puppy") puppyNameInput.value = puppyName;

function animatePuppy(animationClass) {
  if (!puppyScene) return;
  puppyScene.classList.remove("puppy-petting", "puppy-hugging", "puppy-happy");
  void puppyScene.offsetWidth;
  if (animationClass) puppyScene.classList.add(animationClass);
}

function setPuppyMessage(message, face, animationClass) {
  if (puppyMessage) puppyMessage.textContent = message;
  if (puppyEmoji && face) puppyEmoji.textContent = face;
  animatePuppy(animationClass);
}

function openGardenDestination(action) {
  const letterButtons = document.querySelectorAll(".open-when-option");
  if (action === "puppy-hug") {
    setPuppyMessage("A double cuddle, just for you. 🫶♡", "🥰", "puppy-hugging");
    return;
  }
  if (action === "hug") {
    const button = document.getElementById("hugButton");
    if (button) button.click();
    return;
  }
  if (action === "jar") {
    const button = document.getElementById("loveJar");
    if (button) button.click();
    return;
  }
  if (action === "game") {
    const button = document.getElementById("heartGameStart");
    if (button) button.click();
    return;
  }
  if (action === "wishes") {
    const star = document.querySelector(".wish-star");
    if (star) star.click();
    return;
  }
  if (action === "envelope") {
    const button = document.querySelector(".envelope-option");
    if (button) button.click();
    return;
  }
  if (action === "reason") {
    const button = document.getElementById("dailyReasonButton");
    if (button) button.click();
    return;
  }
  if (action === "memories") {
    activateAppTab("story");
    window.setTimeout(() => {
      const memories = document.querySelector(".memories-section");
      if (memories) memories.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
    return;
  }
  const letterType = action === "miss-letter" ? "miss" : action === "sad-letter" ? "sad" : action === "sleep-letter" ? "sleep" : null;
  if (letterType) {
    const letterButton = Array.from(letterButtons).find((button) => button.dataset.letter === letterType);
    if (letterButton) letterButton.click();
  }
}


const angryResetButton = document.getElementById("angryResetButton");
if (angryResetButton) {
  angryResetButton.addEventListener("click", () => {
    document.body.classList.remove("angry-mode");
    gardenButtons.forEach((item) => {
      item.classList.remove("selected");
      item.setAttribute("aria-pressed", "false");
    });
    activateAppTab("for-you");
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

const cryComfortPanel = document.getElementById("cryComfortPanel");
const cryComfortReply = document.getElementById("cryComfortReply");
const cryComfortBack = document.getElementById("cryComfortBack");
const cryMessageComposer = document.getElementById("cryMessageComposer");
const cryMessageInput = document.getElementById("cryMessageInput");
const crySendWhatsApp = document.getElementById("crySendWhatsApp");
const cryWhatsAppNumber = "971541819066";
const cryComfortReplies = {
  wrong: {
    reply: "If I did something that hurt you, I'm sorry. I want to understand and make it right. You can tell me honestly; I will listen. ♡",
    draft: "Hey love, I'm feeling upset and I want to talk about something. I'm not sure if something happened between us, but I'd like you to hear me out. ♡"
  },
  hug: {
    reply: "Always. Imagine me wrapping you in the safest, warmest hug and holding you for as long as you need. No words required. 🫂",
    draft: "I could really use some hugs right now. Can I have the biggest, warmest hug from you when you can? 🫂"
  },
  visit: {
    reply: "If you want me there, tell me. I'll do my best to come see you. You don't have to go through a hard moment alone. ❤️",
    draft: "I'm having a hard moment and I think I'd feel better if I could see you. Would you be able to come see me? ❤️"
  },
  talk: {
    reply: "I'm listening, sweetheart. Take your time and tell me as much or as little as you want. We don't have to solve everything right now. 💗",
    draft: "I want to tell you what happened. Can you give me a little time and listen? I have something on my mind. 💗"
  },
  listen: {
    reply: "Of course. I'll listen without interrupting, judging or trying to fix everything. You can just let it all out. ♡",
    draft: "I don't need advice or solutions right now. I just want you to listen to me for a little while. ♡"
  }
};
function updateCryWhatsAppLink() {
  if (!cryMessageInput || !crySendWhatsApp) return;
  const message = cryMessageInput.value.trim();
  const enabled = message.length > 0;
  crySendWhatsApp.href = enabled
    ? "https://wa.me/" + cryWhatsAppNumber + "?text=" + encodeURIComponent(message)
    : "#";
  crySendWhatsApp.setAttribute("aria-disabled", enabled ? "false" : "true");
  crySendWhatsApp.classList.toggle("disabled", !enabled);
}
document.querySelectorAll("[data-cry-choice]").forEach((choice) => {
  choice.addEventListener("click", () => {
    const selected = cryComfortReplies[choice.dataset.cryChoice];
    if (!selected) return;
    if (cryComfortReply) cryComfortReply.textContent = selected.reply;
    if (cryMessageComposer) cryMessageComposer.classList.remove("hidden");
    if (cryMessageInput) {
      cryMessageInput.value = selected.draft;
      updateCryWhatsAppLink();
    }
    document.querySelectorAll("[data-cry-choice]").forEach((item) => item.classList.toggle("selected", item === choice));
  });
});
if (cryMessageInput) cryMessageInput.addEventListener("input", updateCryWhatsAppLink);
if (cryComfortBack) {
  cryComfortBack.addEventListener("click", () => {
    if (cryComfortPanel) cryComfortPanel.classList.add("hidden");
    if (cryMessageComposer) cryMessageComposer.classList.add("hidden");
    if (cryMessageInput) cryMessageInput.value = "";
    if (crySendWhatsApp) {
      crySendWhatsApp.href = "#";
      crySendWhatsApp.setAttribute("aria-disabled", "true");
    }
    gardenButtons.forEach((item) => {
      item.classList.remove("selected");
      item.setAttribute("aria-pressed", "false");
    });
  });
}

gardenButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (button.dataset.gardenMood === "cry") {
      document.body.classList.remove("angry-mode");
      gardenButtons.forEach((item) => {
        const selected = item === button;
        item.classList.toggle("selected", selected);
        item.setAttribute("aria-pressed", selected ? "true" : "false");
      });
      if (cryComfortPanel) {
        cryComfortPanel.classList.remove("hidden");
        cryComfortPanel.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      if (cryComfortReply) cryComfortReply.textContent = "Choose whatever feels right. There's no wrong answer. 💗";
      return;
    }
    if (cryComfortPanel) cryComfortPanel.classList.add("hidden");
    const mood = gardenMoodCopy[button.dataset.gardenMood];
    if (!mood) return;
    if (button.dataset.gardenMood === "angry") {
      document.body.classList.add("angry-mode");
      return;
    }
    document.body.classList.remove("angry-mode");
    gardenButtons.forEach((item) => {
      const selected = item === button;
      item.classList.toggle("selected", selected);
      item.setAttribute("aria-pressed", selected ? "true" : "false");
    });
    if (gardenResultIcon) gardenResultIcon.textContent = mood.emoji;
    if (gardenResultTitle) gardenResultTitle.textContent = mood.title;
    if (gardenResultText) gardenResultText.textContent = mood.message;
    if (gardenSuggestions) {
      gardenSuggestions.replaceChildren();
      mood.actions.forEach(([label, action]) => {
        const suggestion = document.createElement("button");
        suggestion.type = "button";
        suggestion.className = "garden-suggestion";
        suggestion.textContent = label;
        suggestion.addEventListener("click", () => openGardenDestination(action));
        gardenSuggestions.appendChild(suggestion);
      });
    }
    setPuppyMessage(mood.puppy, mood.puppyFace, mood.puppyClass);
  });
});

if (puppyNameForm && puppyNameInput) {
  puppyNameForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const nextName = puppyNameInput.value.trim().replace(/[<>]/g, "").slice(0, 18);
    if (!nextName) {
      if (puppyMessage) puppyMessage.textContent = "Choose a little name for me first. I can't wait! 🐾";
      puppyNameInput.focus();
      return;
    }
    puppyName = nextName;
    if (puppyNameDisplay) puppyNameDisplay.textContent = puppyName + " ♡";
    if (puppyMessage) puppyMessage.textContent = "I love my name! Thank you for choosing " + puppyName + ". Can I have a treat now? 🦴";
    try { localStorage.setItem("ourLittleWorldPuppyName", puppyName); } catch (_) {}
    animatePuppy("puppy-happy");
  });
}

document.querySelectorAll("[data-puppy-action]").forEach((button) => {
  button.addEventListener("click", () => {
    const action = button.dataset.puppyAction;
    if (action === "pet") setPuppyMessage("That feels so nice! More scratches behind my ears, please. 🐾", "🐶", "puppy-petting");
    if (action === "hug") setPuppyMessage("Best cuddle ever. I'm sending tiny puppy kisses right back! 💗", "🥰", "puppy-hugging");
    if (action === "feed") setPuppyMessage("CRONCH CRONCH! That was delicious. You're my favourite human. 🦴", "😋", "puppy-happy");
    if (action === "fetch") {
      puppyFetchReady = true;
      if (puppyFetchGame) puppyFetchGame.classList.remove("hidden");
      setPuppyMessage("WOOF! I brought the ball back. Throw it again! 🎾", "🐕", "puppy-happy");
    }
  });
});

if (puppyBall) {
  puppyBall.addEventListener("click", () => {
    if (!puppyFetchReady) return;
    puppyFetchReady = false;
    if (puppyFetchGame) puppyFetchGame.classList.add("hidden");
    setPuppyMessage("You caught it! That was the best game ever. Again? 🐾", "🐶", "puppy-happy");
  });
}



// OUR LITTLE UNIVERSE — star-to-scrapbook interactions
(() => {
  const overlay = document.getElementById("scrapbookPanel");
  const title = document.getElementById("scrapbookTitle");
  const content = document.getElementById("scrapbookContent");
  if (!overlay || !title || !content) return;

  const storySource = document.getElementById("storyList");
  const reasonsSource = document.getElementById("reasonsList");

  function openChapter(chapter) {
    content.replaceChildren();
    const titles = {
      beginning: "Where our story began",
      "little-things": "The little things",
      moments: "Moments worth keeping",
      dreams: "Things I dream of with you"
    };
    title.textContent = titles[chapter] || "A little memory";

    if (chapter === "beginning") {
      const items = storySource ? [...storySource.children] : [];
      if (items.length) {
        items.forEach(item => content.appendChild(item.cloneNode(true)));
      } else {
        content.innerHTML = '<p class="dream-note">Our story is still unfolding. This page will hold the beginning, whenever we are ready to write it down. ♡</p>';
      }
    } else if (chapter === "little-things") {
      const items = reasonsSource ? [...reasonsSource.children] : [];
      if (items.length) {
        const grid = document.createElement("div");
        grid.className = "reasons-grid";
        items.forEach(item => grid.appendChild(item.cloneNode(true)));
        content.appendChild(grid);
      } else {
        content.innerHTML = '<p class="dream-note">All the little things that make you you — and make me love you more. ♡</p>';
      }
    } else if (chapter === "moments") {
      content.innerHTML = '<div class="scrapbook-memories"><figure class="scrapbook-photo"><img src="Images/our-first-photo.jpeg" alt="A favourite photo of us together" loading="lazy"><figcaption>Our first photo ♡</figcaption></figure><figure class="scrapbook-photo scrapbook-photo-tilt"><img src="Images/little-moments.jpeg" alt="A silly little moment together" loading="lazy"><figcaption>Little moments, big happiness</figcaption></figure><figure class="scrapbook-photo"><img src="Images/flowers-for-her.jpeg" alt="A bouquet of flowers" loading="lazy"><figcaption>Flowers for my favourite girl 🌷</figcaption></figure><figure class="scrapbook-photo scrapbook-photo-tilt"><img src="Images/another-favorite.jpeg" alt="Another favourite memory together" loading="lazy"><figcaption>One of my favourite memories</figcaption></figure></div><p class="dream-note scrapbook-photo-note">Four little memories, with a million more still waiting for us. ♡</p>';
    } else if (chapter === "dreams") {
      content.innerHTML = '<div class="scrapbook-dreams"><div class="dream-note">More little adventures, new places, and a thousand ordinary days together.</div><div class="dream-note">To keep choosing each other, even on the imperfect days.</div><div class="dream-note">To laugh about things that only make sense to us.</div><div class="dream-note">And to keep making a universe that feels like home. ♡</div></div>';
    }
    overlay.classList.remove("hidden");
    document.body.style.overflow = "hidden";
    const close = overlay.querySelector("#scrapbookClose");
    if (close) close.focus();
  }

  function closeChapter() {
    overlay.classList.add("hidden");
    document.body.style.overflow = "";
  }

  document.querySelectorAll("[data-universe-card]").forEach(button => {
    button.addEventListener("click", () => openChapter(button.dataset.universeCard));
  });
  overlay.querySelectorAll("[data-scrapbook-close]").forEach(button => button.addEventListener("click", closeChapter));
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && !overlay.classList.contains("hidden")) closeChapter();
  });
})();
