/* Randomly serve one of the six complete homepage layouts. */
(() => {
  const layouts = ["homepage-demos/concept-01-editorial.html","homepage-demos/concept-02-modern-grid.html","homepage-demos/concept-03-warm-human.html","homepage-demos/concept-04-bold-brutalist.html","homepage-demos/concept-05-photo-story.html","homepage-demos/concept-06-digital-maker.html"];
  let previous = "";
  try { previous = localStorage.getItem("amitHomepageLastLayout") || ""; } catch (_) {}
  const choices = layouts.filter(path => path !== previous);
  const selected = choices[Math.floor(Math.random() * choices.length)] || layouts[0];
  try { localStorage.setItem("amitHomepageLastLayout", selected); } catch (_) {}
  window.location.replace(new URL(selected, document.baseURI).href);
})();
