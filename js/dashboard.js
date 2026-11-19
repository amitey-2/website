
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
  // PRIVATE CHAT — session-authenticated dashboard room
  const list=document.getElementById("herMessagesList"),status=document.getElementById("herMessagesStatus"),refresh=document.getElementById("refreshHerMessages"),notifyButton=document.getElementById("enableHerNotifications"),endpoint=SUPABASE_URL+"/functions/v1/her-inbox";
  let initial=true;const seen=new Set();
  async function callInbox(action,payload={}){const {data:{session}}=await supabaseClient.auth.getSession();if(!session)throw Error("Dashboard session expired. Please log in again.");const r=await fetch(endpoint,{method:"POST",headers:{"Content-Type":"application/json",apikey:SUPABASE_KEY,Authorization:"Bearer "+session.access_token},body:JSON.stringify({action,...payload})});const d=await r.json();if(!r.ok||d.error)throw Error(d.error||"Inbox error");return d;}
  function updateNotify(){if(notifyButton)notifyButton.textContent=("Notification"in window&&Notification.permission==="granted"?"NOTIFICATIONS ON ♡":"ENABLE NOTIFICATIONS");}
  if(notifyButton)notifyButton.onclick=()=>{if(!("Notification"in window)){status.textContent="Notifications aren't supported here.";return;}Notification.requestPermission().then(p=>{status.textContent=p==="granted"?"Notifications enabled ♡":"Live chat still refreshes while open.";updateNotify();});};updateNotify();
  function notifyHer(m){if("Notification"in window&&Notification.permission==="granted"){const n=new Notification("A message from her ♡",{body:(m.message||"").slice(0,140),tag:"her-"+m.id});n.onclick=()=>{window.focus();n.close();};}}
  function renderChat(messages){list.replaceChildren();const groups=new Map();messages.forEach(m=>{if(!groups.has(m.thread_id))groups.set(m.thread_id,[]);groups.get(m.thread_id).push(m);});if(!groups.size){const p=document.createElement("p");p.className="her-messages-empty";p.textContent="No messages yet. When she writes, her chat will appear here. ♡";list.append(p);return;}
  groups.forEach((group,threadId)=>{group.sort((x,y)=>new Date(x.created_at)-new Date(y.created_at));const sec=document.createElement("section");sec.className="her-chat-thread";const h=document.createElement("p");h.className="her-chat-thread-label";h.textContent="Chat with "+(group.find(m=>m.sender_name!=="Amit")?.sender_name||"her");const stream=document.createElement("div");stream.className="her-chat-stream";
  group.forEach(m=>{const bubble=document.createElement("article");bubble.className="her-chat-bubble "+(m.sender_name==="Amit"?"from-amit":"from-her");const meta=document.createElement("p");meta.className="her-message-meta";meta.textContent=(m.sender_name||"Her")+" · "+new Date(m.created_at).toLocaleString(undefined,{dateStyle:"medium",timeStyle:"short"});const body=document.createElement("p");body.className="her-message-body";body.textContent=m.message||"";bubble.append(meta,body);stream.append(bubble);if(m.reply){const old=document.createElement("article");old.className="her-chat-bubble from-amit";const om=document.createElement("p");om.className="her-message-meta";om.textContent="Amit · "+new Date(m.replied_at||m.created_at).toLocaleString(undefined,{dateStyle:"medium",timeStyle:"short"});const ob=document.createElement("p");ob.className="her-message-body";ob.textContent=m.reply;old.append(om,ob);stream.append(old);}});
  const form=document.createElement("form");form.className="her-message-reply-form";const area=document.createElement("textarea");area.maxLength=2000;area.required=true;area.placeholder="Write her a message…";const btn=document.createElement("button");btn.type="submit";btn.textContent="SEND MESSAGE ♡";form.append(area,btn);form.onsubmit=async e=>{e.preventDefault();const value=area.value.trim();if(!value)return;btn.disabled=true;btn.textContent="SENDING…";try{await callInbox("admin_send",{thread_id:threadId,message:value});area.value="";status.textContent="Message sent ♡";await loadChat(false);}catch(err){status.textContent=err.message||"Couldn't send";}finally{btn.disabled=false;btn.textContent="SEND MESSAGE ♡";}};sec.append(h,stream,form);list.append(sec);});}
  async function loadChat(alertNew=true){if(refresh)refresh.disabled=true;try{const result=await callInbox("admin_list"),msgs=result.messages||[];if(alertNew&&!initial)msgs.forEach(m=>{if(m.sender_name!=="Amit"&&!seen.has(m.id))notifyHer(m);});msgs.forEach(m=>seen.add(m.id));renderChat(msgs);status.textContent="Live conversation · checks every 12 seconds ♡";initial=false;}catch(err){status.textContent=err.message||"Couldn't load messages";}finally{if(refresh)refresh.disabled=false;}}
  if(refresh)refresh.onclick=()=>loadChat(false);loadChat(false);setInterval(()=>{if(!document.hidden)loadChat(true);},12000);
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
