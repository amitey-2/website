(() => {
  const SUPABASE_URL = "https://fqbcfuduinjdumozfbja.supabase.co";
  const SUPABASE_KEY = "sb_publishable_CI3BreLTxzIgIB_IcdTg5O0yBVx1vw";
  const API = SUPABASE_URL + "/functions/v1/her-inbox";
  const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  const loginPanel=document.getElementById("loginPanel"), inboxPanel=document.getElementById("inboxPanel");
  const loginForm=document.getElementById("adminLogin"), email=document.getElementById("adminEmail"), pass=document.getElementById("adminPassword"), loginButton=document.getElementById("loginButton"), loginStatus=document.getElementById("loginStatus");
  const status=document.getElementById("inboxStatus"), threads=document.getElementById("messageThreads"), count=document.getElementById("inboxCount");
  const time=s=>new Date(s).toLocaleString(undefined,{dateStyle:"medium",timeStyle:"short"});
  async function call(action,payload={}){
    const {data:{session}}=await sb.auth.getSession();
    const headers={"Content-Type":"application/json","apikey":SUPABASE_KEY};
    if(session?.access_token) headers.Authorization="Bearer "+session.access_token;
    const res=await fetch(API,{method:"POST",headers,body:JSON.stringify({action,...payload})});
    const data=await res.json();if(!res.ok||data.error)throw new Error(data.error||"Request failed");return data;
  }
  function render(items){
    threads.replaceChildren();count.textContent=items.length+" message"+(items.length===1?"":"s");
    if(!items.length){const empty=document.createElement("p");empty.className="empty-inbox";empty.textContent="No letters yet. When she writes, they'll appear here. ♡";threads.append(empty);return;}
    const groups=new Map();
    items.forEach(m=>{if(!groups.has(m.thread_id))groups.set(m.thread_id,[]);groups.get(m.thread_id).push(m);});
    groups.forEach(group=>{
      group.sort((a,b)=>new Date(a.created_at)-new Date(b.created_at));
      const card=document.createElement("article");card.className="thread-card";
      const title=document.createElement("p");title.className="thread-title";title.textContent="LETTER THREAD · "+time(group[0].created_at);card.append(title);
      group.forEach(m=>{
        const incoming=document.createElement("div");incoming.className="thread-message";
        const meta=document.createElement("p");meta.className="message-meta";meta.textContent=(m.sender_name||"Her")+" · "+time(m.created_at);
        const body=document.createElement("p");body.className="message-body";body.textContent=m.message;incoming.append(meta,body);
        if(m.reply){const rep=document.createElement("div");rep.className="admin-reply";const rm=document.createElement("p");rm.className="message-meta";rm.textContent="Your reply · "+time(m.replied_at||m.created_at);const rb=document.createElement("p");rb.className="message-body";rb.textContent=m.reply;rep.append(rm,rb);incoming.append(rep);}
        else{
          const form=document.createElement("form");form.className="reply-form";
          const area=document.createElement("textarea");area.maxLength=2000;area.required=true;area.placeholder="Write your reply…";
          const btn=document.createElement("button");btn.type="submit";btn.textContent="Send reply ♡";
          form.append(area,btn);
          form.addEventListener("submit",async ev=>{ev.preventDefault();const text=area.value.trim();if(!text)return;btn.disabled=true;btn.textContent="Sending…";try{await call("admin_reply",{id:m.id,reply:text});status.textContent="Reply sent. ♡";await load();}catch(err){status.textContent=err.message;btn.disabled=false;btn.textContent="Send reply ♡";}});
          incoming.append(form);
        }
        card.append(incoming);
      });
      threads.append(card);
    });
  }
  async function load(){status.textContent="Loading your letters…";try{const data=await call("admin_list");render(data.messages||[]);status.textContent="Inbox updated. ♡";}catch(err){status.textContent=err.message;if(/unauthorized/i.test(err.message)){await sb.auth.signOut();showLogin();}}}
  function showLogin(){loginPanel.classList.remove("hidden");inboxPanel.classList.add("hidden");}
  function showInbox(){loginPanel.classList.add("hidden");inboxPanel.classList.remove("hidden");load();}
  loginForm.addEventListener("submit",async e=>{e.preventDefault();loginButton.disabled=true;loginStatus.textContent="Signing in…";try{const {data,error}=await sb.auth.signInWithPassword({email:email.value.trim(),password:pass.value});if(error)throw error;pass.value="";const check=await call("admin_list");render(check.messages||[]);loginPanel.classList.add("hidden");inboxPanel.classList.remove("hidden");loginStatus.textContent="";status.textContent="Inbox updated. ♡";}catch(err){loginStatus.textContent=err.message||"Unable to sign in. Please check your details.";await sb.auth.signOut();}finally{loginButton.disabled=false;}});
  document.getElementById("refreshInbox").addEventListener("click",load);
  document.getElementById("logoutInbox").addEventListener("click",async()=>{await sb.auth.signOut();showLogin();loginStatus.textContent="Signed out."});
  sb.auth.getSession().then(({data})=>{if(data.session)showInbox();else showLogin();});
})();