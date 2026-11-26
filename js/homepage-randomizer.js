/* Randomly serve one of the 18 complete homepage layouts. */
(() => {
  const layouts = ["homepage-demos/concept-01-editorial.html","homepage-demos/concept-02-modern-grid.html","homepage-demos/concept-03-warm-human.html","homepage-demos/concept-04-bold-brutalist.html","homepage-demos/concept-05-photo-story.html","homepage-demos/concept-06-digital-maker.html","homepage-demos-v2/01-cinematic.html","homepage-demos-v2/02-magazine.html","homepage-demos-v2/03-interactive.html","homepage-demos-v2/04-professional.html","homepage-demos-v2/05-collage.html","homepage-demos-v2/06-journal.html","homepage-demos-v3/01-terminal.html","homepage-demos-v3/02-gallery.html","homepage-demos-v3/03-map.html","homepage-demos-v3/04-dashboard.html","homepage-demos-v3/05-type.html","homepage-demos-v3/06-split.html"];
  let previous = "";
  try { previous = localStorage.getItem("amitHomepageLastLayout") || ""; } catch (_) {}
  const choices = layouts.filter(path => path !== previous);
  const selected = choices[Math.floor(Math.random() * choices.length)] || layouts[0];
  try { localStorage.setItem("amitHomepageLastLayout", selected); } catch (_) {}
  window.location.replace(new URL(selected, document.baseURI).href);
})();
