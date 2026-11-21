
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
  //   // PRIVATE CHAT — live, two-way chat + push notifications
  const chatList=document.getElementById("herMessagesList"),chatStatus=document.getElementById("herMessagesStatus"),chatRefresh=document.getElementById("refreshHerMessages"),chatNotifyBtn=document.getElementById("enableHerNotifications"),chatClearBtn=document.getElementById("clearHerChat"),chatApi=SUPABASE_URL+"/functions/v1/her-inbox";
  const VAPID_PUBLIC="BDbZONntr_0qcj6IzuvDcl2laYMx8seZ4PxAKMFvK-cyYztO1b5LUqiuZnuo8NMyq7C8blPPCnPWGzBSF9BMN3k",chatSeen=new Set(),chatRegistered=new Set();let chatFirst=true,chatPushActive=false,chatPushTested=false,chatSubscription=null;
  const decodePushKey=s=>{const p="=".repeat((4-s.length%4)%4),raw=atob((s+p).replace(/-/g,"+").replace(/_/g,"/"));return Uint8Array.from(raw,c=>c.charCodeAt(0));};
  async function chatCall(action,payload={}){const {data:{session}}=await supabaseClient.auth.getSession();if(!session)throw Error("Dashboard session expired. Please log in again.");const r=await fetch(chatApi,{method:"POST",headers:{"Content-Type":"application/json",apikey:SUPABASE_KEY,Authorization:"Bearer "+session.access_token},body:JSON.stringify({action,...payload})});const d=await r.json();if(!r.ok||d.error)throw Error(d.error||"Chat request failed");return d;}
  async function chatSW(){const reg=await navigator.serviceWorker.register("./sw.js",{scope:"./"});await navigator.serviceWorker.ready;return reg;}
  function chatUpdateBtn(){if(chatNotifyBtn)chatNotifyBtn.textContent=chatPushActive?"NOTIFICATIONS ON · TURN OFF":"ENABLE PUSH NOTIFICATIONS";}
  function chatFallbackNotify(m){if(chatRegistered.has(m.thread_id)||!("Notification"in window)||Notification.permission!=="granted")return;const n=new Notification("A message from her ♡",{body:"Open your dashboard to read it.",tag:"her-message-"+m.id});n.onclick=()=>{window.focus();n.close();};}
  async function chatRegisterThreads(sub,ids){for(const id of ids){if(chatRegistered.has(id))continue;try{await chatCall("register_push",{thread_id:id,recipient_role:"amit",subscription:sub.toJSON()});chatRegistered.add(id);}catch(e){console.warn("Push registration skipped for thread",e);}}}
  async function chatEnablePush(){if(chatPushActive){try{if(chatSubscription){const endpoint=chatSubscription.endpoint;await chatSubscription.unsubscribe();const {data:{session}}=await supabaseClient.auth.getSession();await fetch(chatApi,{method:"POST",headers:{"Content-Type":"application/json",apikey:SUPABASE_KEY,Authorization:"Bearer "+(session?.access_token||"")},body:JSON.stringify({action:"remove_push",recipient_role:"amit",endpoint})});}chatPushActive=false;chatSubscription=null;chatRegistered.clear();chatStatus.textContent="Notifications disabled for this device.";chatUpdateBtn();}catch(e){chatStatus.textContent=e.message||"Couldn't turn notifications off.";}return;}
    if(!("serviceWorker"in navigator)||!("PushManager"in window)||!("Notification"in window)){chatStatus.textContent="Push notifications aren't supported in this browser.";return;}
    const isIOS=/iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==="MacIntel"&&navigator.maxTouchPoints>1),standalone=window.navigator.standalone||window.matchMedia("(display-mode: standalone)").matches;
    if(isIOS&&!standalone){chatStatus.textContent="On iPhone/iPad, add this website to your Home Screen, open it as an app, then enable push here.";return;}
    try{const permission=Notification.permission==="granted"? "granted":await Notification.requestPermission();if(permission!=="granted"){chatStatus.textContent="Notification permission wasn't granted.";return;}const reg=await chatSW();chatSubscription=await reg.pushManager.getSubscription();if(!chatSubscription)chatSubscription=await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:decodePushKey(VAPID_PUBLIC)});chatPushActive=true;chatUpdateBtn();const data=await chatCall("admin_list"),ids=[...new Set((data.messages||[]).map(m=>m.thread_id))];await chatRegisterThreads(chatSubscription,ids);if(ids.length){const test=await chatCall("test_push",{thread_id:ids[0],recipient_role:"amit"});chatPushTested=true;chatStatus.textContent="Push enabled. A test notification was sent—check your device. ♡";}else chatStatus.textContent="Push enabled. Waiting for her first letter; the device will register automatically. ♡";}catch(e){chatPushActive=false;chatUpdateBtn();chatStatus.textContent=e.message||"Push setup didn't finish. Try again.";} }
  if(chatNotifyBtn)chatNotifyBtn.addEventListener("click",chatEnablePush);chatUpdateBtn();
  async function chatRestorePush(){try{if(!("serviceWorker"in navigator)||!("PushManager"in window)||!("Notification"in window)||Notification.permission!=="granted")return;const reg=await chatSW();chatSubscription=await reg.pushManager.getSubscription();if(!chatSubscription)return;chatPushActive=true;chatUpdateBtn();const d=await chatCall("admin_list");await chatRegisterThreads(chatSubscription,[...new Set((d.messages||[]).map(m=>m.thread_id))]);}catch(e){console.warn("Could not restore push subscription",e);}}
  function chatRender(messages){chatList.replaceChildren();const groups=new Map();messages.forEach(m=>{if(!groups.has(m.thread_id))groups.set(m.thread_id,[]);groups.get(m.thread_id).push(m);});if(!groups.size){const p=document.createElement("p");p.className="her-messages-empty";p.textContent="No messages yet. Her conversation will appear here. ♡";chatList.append(p);return;}
    groups.forEach((group,threadId)=>{group.sort((a,b)=>new Date(a.created_at)-new Date(b.created_at));const section=document.createElement("section");section.className="her-chat-thread";const heading=document.createElement("p");heading.className="her-chat-thread-label";heading.textContent="Chat with "+(group.find(m=>m.sender_name!=="Amit")?.sender_name||"her");const stream=document.createElement("div");stream.className="her-chat-stream";
      group.forEach(m=>{const bubble=document.createElement("article");bubble.className="her-chat-bubble "+(m.sender_name==="Amit"?"from-amit":"from-her");const meta=document.createElement("p");meta.className="her-message-meta";meta.textContent=(m.sender_name||"Her")+" · "+new Date(m.created_at).toLocaleString(undefined,{dateStyle:"medium",timeStyle:"short"});const body=document.createElement("p");body.className="her-message-body";body.textContent=m.message||"";bubble.append(meta,body);stream.append(bubble);if(m.reply){const legacy=document.createElement("article");legacy.className="her-chat-bubble from-amit";const lm=document.createElement("p");lm.className="her-message-meta";lm.textContent="Amit · "+new Date(m.replied_at||m.created_at).toLocaleString(undefined,{dateStyle:"medium",timeStyle:"short"});const lb=document.createElement("p");lb.className="her-message-body";lb.textContent=m.reply;legacy.append(lm,lb);stream.append(legacy);}});
      const form=document.createElement("form");form.className="her-message-reply-form";const area=document.createElement("textarea");area.maxLength=2000;area.required=true;area.placeholder="Write her a message…";const send=document.createElement("button");send.type="submit";send.textContent="SEND MESSAGE ♡";form.append(area,send);form.addEventListener("submit",async ev=>{ev.preventDefault();const message=area.value.trim();if(!message)return;send.disabled=true;send.textContent="SENDING…";try{await chatCall("admin_send",{thread_id:threadId,message});area.value="";chatStatus.textContent="Message sent. ♡";await chatLoad(false);}catch(e){chatStatus.textContent=e.message||"Couldn't send message.";}finally{send.disabled=false;send.textContent="SEND MESSAGE ♡";}});section.append(heading,stream,form);chatList.append(section);});
  }
  async function chatLoad(alertNew=true){if(chatRefresh)chatRefresh.disabled=true;try{const data=await chatCall("admin_list"),messages=data.messages||[];if(alertNew&&!chatFirst)messages.forEach(m=>{if(m.sender_name!=="Amit"&&!chatSeen.has(m.id)&&(!chatPushActive||!chatRegistered.has(m.thread_id)))chatFallbackNotify(m);});messages.forEach(m=>chatSeen.add(m.id));chatRender(messages);if(chatPushActive&&chatSubscription)await chatRegisterThreads(chatSubscription,[...new Set(messages.map(m=>m.thread_id))]);chatStatus.textContent=chatPushActive?"Push notifications enabled · messages update live ♡":"Live conversation · updates every 12 seconds ♡";chatFirst=false;}catch(e){chatStatus.textContent=e.message||"Couldn't load messages.";}finally{if(chatRefresh)chatRefresh.disabled=false;}}
  if(chatRefresh)chatRefresh.addEventListener("click",()=>chatLoad(false));if(chatClearBtn)chatClearBtn.addEventListener("click",async()=>{if(!confirm("Clear the entire chat? This permanently deletes all messages and push registrations from the database. This cannot be undone."))return;chatClearBtn.disabled=true;chatClearBtn.textContent="CLEARING…";try{await chatCall("admin_clear_all");chatSeen.clear();chatRegistered.clear();await chatLoad(false);chatStatus.textContent="Chat cleared. ♡";}catch(e){chatStatus.textContent=e.message||"Could not clear chat.";}finally{chatClearBtn.disabled=false;chatClearBtn.textContent="CLEAR CHAT";}});chatRestorePush();chatLoad(false);setInterval(()=>chatLoad(true),12000);
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
  // HER CRAVINGS — saved menu choices + live refresh
  const cravingsList=document.getElementById("herCravingsList"),cravingsStatus=document.getElementById("herCravingsStatus"),cravingsRefresh=document.getElementById("refreshHerCravings"),cravingsApi=SUPABASE_URL+"/functions/v1/her-menu-choice";
  let cravingsKnown=new Set(),cravingsInitial=true;
  const mealLabels={breakfast:"Breakfast",lunch:"Nepali Favorites",dinner:"Dinner",sweets:"Sweet Cravings"};
  const statusLabels={new:"NEW",planned:"PLANNED",surprised:"SURPRISED HER"};
  async function cravingsCall(action,payload={}){const {data:{session}}=await supabaseClient.auth.getSession();if(!session)throw Error("Dashboard session expired.");const r=await fetch(cravingsApi,{method:"POST",headers:{"Content-Type":"application/json",apikey:SUPABASE_KEY,Authorization:"Bearer "+session.access_token},body:JSON.stringify({action,...payload})});const d=await r.json();if(!r.ok||d.error)throw Error(d.error||"Menu choices request failed");return d;}
  function cravingsRender(choices){cravingsList.replaceChildren();if(!choices.length){const empty=document.createElement("p");empty.className="her-cravings-empty";empty.textContent="Nothing chosen yet. Her little cravings will show up here. ♡";cravingsList.append(empty);return;}
    choices.forEach(choice=>{const card=document.createElement("article");card.className="her-cravings-card";const top=document.createElement("div");top.className="her-cravings-top";const title=document.createElement("h3");title.textContent=choice.dish;const date=document.createElement("p");date.textContent=new Date(choice.created_at).toLocaleString(undefined,{dateStyle:"medium",timeStyle:"short"});top.append(title,date);const meal=document.createElement("span");meal.className="her-cravings-meal";meal.textContent=mealLabels[choice.meal]||choice.meal;const state=document.createElement("span");state.className="her-cravings-state state-"+choice.status;state.textContent=statusLabels[choice.status]||choice.status;const actions=document.createElement("div");actions.className="her-cravings-actions";for(const [s,label] of [["planned","MAKE THIS FOR HER ♡"],["surprised","SURPRISE HER 🎀"],["new","RESET"]]){const btn=document.createElement("button");btn.type="button";btn.textContent=label;btn.disabled=choice.status===s;btn.addEventListener("click",async()=>{btn.disabled=true;cravingsStatus.textContent="Updating…";try{await cravingsCall("admin_update",{id:choice.id,status:s});await cravingsLoad(false);}catch(e){cravingsStatus.textContent=e.message;btn.disabled=false;}});actions.append(btn);}card.append(top,meal,state,actions);cravingsList.append(card);});
  }
  async function cravingsLoad(alertNew=true){if(cravingsRefresh)cravingsRefresh.disabled=true;try{const data=await cravingsCall("admin_list"),choices=data.choices||[];if(alertNew&&!cravingsInitial){const fresh=choices.filter(c=>!cravingsKnown.has(c.id));if(fresh.length)cravingsStatus.textContent=fresh.length===1?"She just chose "+fresh[0].dish+" ♡":fresh.length+" new cravings from her ♡";}choices.forEach(c=>cravingsKnown.add(c.id));cravingsInitial=false;cravingsRender(choices);if(!cravingsStatus.textContent||cravingsStatus.textContent==="Loading her choices…")cravingsStatus.textContent=choices.length?choices.length+" choice"+(choices.length===1?"":"s")+" saved":"Waiting for her first choice ♡";}catch(e){cravingsStatus.textContent=e.message||"Couldn't load her menu choices.";}finally{if(cravingsRefresh)cravingsRefresh.disabled=false;}}
  if(cravingsRefresh)cravingsRefresh.addEventListener("click",()=>cravingsLoad(false));cravingsLoad(false);setInterval(()=>{if(!document.hidden)cravingsLoad(true);},30000);

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
