(() => {
  const panel=document.getElementById("tab-for-you");
  if(!panel)return;
  const key="ourLittleWorldForYouLevelProgress";
  let unlocked=1;
  try{unlocked=Math.max(1,Math.min(5,Number(localStorage.getItem(key)||1)||1));}catch{}
  const levels=[...panel.querySelectorAll("[data-level-panel]")];
  const nav=document.getElementById("levelsNav"), chips=[...nav.querySelectorAll("[data-level]")];
  const progressText=document.getElementById("levelsProgressText"), fill=document.getElementById("levelsProgressFill"), intro=document.getElementById("levelIntro");
  const copy=["A little warmth to begin. Take your time, sweetheart. 🌷","Whenever your heart needs a softer place, come here. 🫂","A few words, waiting for the moments you need them. 💌","Little dreams and wishes, saved for us. ✨","One last little surprise, just for you. 🎀"];
  const groups={1:["dailyReason","loveNotes"],2:["moodGarden","littlePlayground"],3:["openWhenLetters","privateLoveInbox"],4:["wishes"],5:[".final-section"]};
  Object.entries(groups).forEach(([level,ids])=>ids.forEach(id=>{const el=id.startsWith(".")?document.querySelector(id):document.getElementById(id);if(el)levels[Number(level)-1].insertBefore(el,levels[Number(level)-1].querySelector("[data-level-continue]"));}));
  const puppy=document.querySelector(".puppy-card");
  // Keep the puppy with the comfort level; it is part of the mood garden experience.
  function show(n){
    n=Math.max(1,Math.min(unlocked,n));
    levels.forEach(p=>p.classList.toggle("level-hidden",Number(p.dataset.levelPanel)!==n));
    chips.forEach(c=>{const active=Number(c.dataset.level)===n;c.classList.toggle("active",active);c.disabled=Number(c.dataset.level)>unlocked;});
    progressText.textContent="Level "+n+" of 5";fill.style.width=(n*20)+"%";intro.textContent=copy[n-1];
    try{localStorage.setItem(key,String(unlocked));}catch{}
  }
  chips.forEach(c=>c.addEventListener("click",()=>show(Number(c.dataset.level))));
  panel.querySelectorAll("[data-level-continue]").forEach(b=>b.addEventListener("click",()=>{const next=Number(b.dataset.levelContinue)+1;unlocked=Math.max(unlocked,next);try{localStorage.setItem(key,String(unlocked));}catch{}show(next);panel.scrollIntoView({behavior:"smooth",block:"start"});}));
  panel.querySelector(".level-revisit")?.addEventListener("click",()=>show(1));
  show(unlocked);
})();