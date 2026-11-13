
// CHEF'S LAB — Welcome message
console.log("Welcome to Chef's Lab.");
console.log("Ideas are ingredients too.");

// Smooth scrolling for kitchen sections
document.querySelectorAll('.lab-card').forEach((card) => {
  card.addEventListener('click', (event) => {
    const targetId = card.getAttribute('href');

    if (!targetId || !targetId.startsWith("#")) {
      return;
    }

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

// Current year for future footer use
const currentYear = new Date().getFullYear();
console.log("Kitchen journal started — " + currentYear);
