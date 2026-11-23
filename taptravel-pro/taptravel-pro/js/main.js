const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const page=document.body.dataset.page,eur=n=>"€"+Math.round(n).toLocaleString("en"),from=d=>d.flight+d.night*5;
const store={get(){try{return JSON.parse(localStorage.getItem("tt-saved"))||[]}catch(e){return[]}},set(v){try{localStorage.setItem("tt-saved",JSON.stringify(v))}catch(e){}}};
function theme(t){const s=document.documentElement.style;t={...DEFAULT,...t};for(const k in DEFAULT)s.setProperty("--"+k,t[k])}
const card=d=>{const on=store.get().includes(d.id);return `<article class="card"><a class="art" href="destination.html?d=${d.id}"><div class="cover" style="background:${d.theme.hero};color:${d.theme.ink};font-family:${d.theme.head||DEFAULT.head}">${d.code}</div><div class="pad"><h3>${d.name}, ${d.country}</h3><p class="muted">${d.tag}</p><p><b>From ${eur(from(d))}</b> <span class="muted sm">per person</span></p></div></a><button class="save" data-save="${d.id}" aria-pressed="${on}" aria-label="Save ${d.name}">${on?"♥":"♡"}</button></article>`};

const nav=[["index","Home"],["destinations","Destinations"],["offers","Black Friday"],["premium","Premium"],["policies","Policies"]];
$("#hdr").innerHTML=`<header><div class="w"><a class="brand" href="index.html"><i>T</i>TapTravel</a><nav aria-label="Main">${nav.map(([f,t])=>`<a href="${f}.html"${page===f||(page==="destination"&&f==="destinations")?' aria-current="page"':""}>${t}</a>`).join("")}</nav></div></header>`;
$("#ftr").innerHTML=`<footer><div class="w fcols"><div><b class="brand">TapTravel</b><p class="muted">Trips with the prices, rules and local details up front.</p></div><div><b>Explore</b>${nav.slice(1,4).map(([f,t])=>`<a href="${f}.html">${t}</a>`).join("")}</div><div><b>Legal</b><a href="policies.html">Policies</a><a href="policies.html#ages">Legal ages</a></div></div><div class="w muted sm">© ${new Date().getFullYear()} TapTravel. Demo content: prices and offers are examples. Travellers must be 18 or older to book.</div></footer>`;

document.addEventListener("click",e=>{const id=e.target.dataset?.save;if(!id)return;let s=store.get();s=s.includes(id)?s.filter(x=>x!==id):[...s,id];store.set(s);const on=s.includes(id);e.target.textContent=on?"♥":"♡";e.target.setAttribute("aria-pressed",on);window.refresh&&refresh()});

if(page==="index"){
  let i=0,t;const rows=$("#board").innerHTML=D.map((d,n)=>`<a class="row" href="destination.html?d=${d.id}"><b>${d.code}</b><span>${d.name}</span><span>${eur(from(d))}</span><span class="st">${d.status}</span></a>`).join("");
  const R=$$(".row"),set=n=>{i=n;theme(D[n].theme);R.forEach((r,k)=>r.classList.toggle("on",k===n));$("#now").textContent=D[n].tag};
  const run=()=>{clearInterval(t);if(!matchMedia("(prefers-reduced-motion:reduce)").matches)t=setInterval(()=>set((i+1)%D.length),4500)};
  R.forEach((r,n)=>{r.onmouseenter=r.onfocus=()=>{clearInterval(t);set(n)};r.onmouseleave=r.onblur=run});
  set(0);run();$("#pop").innerHTML=D.slice(0,3).map(card).join("");
}
if(page==="destinations"){
  let reg="All",q="",sort="price";
  $("#chips").innerHTML=["All","Europe","Africa","Asia","Saved"].map(r=>`<button class="chip" aria-pressed="${r==="All"}" data-r="${r}">${r}</button>`).join("");
  window.refresh=()=>{const sv=store.get();const l=D.filter(d=>(reg==="All"||(reg==="Saved"?sv.includes(d.id):d.region===reg))&&(d.name+d.country).toLowerCase().includes(q));
    l.sort(sort==="price"?(a,b)=>from(a)-from(b):(a,b)=>a.name.localeCompare(b.name));
    $("#list").innerHTML=l.map(card).join("")||`<p>No destinations match. Clear the search or pick another region.</p>`};
  $("#chips").onclick=e=>{if(!e.target.dataset.r)return;reg=e.target.dataset.r;$$(".chip").forEach(c=>c.setAttribute("aria-pressed",c===e.target));refresh()};
  $("#q").oninput=e=>{q=e.target.value.toLowerCase();refresh()};$("#sort").onchange=e=>{sort=e.target.value;refresh()};refresh();
}
if(page==="destination"){
  const d=D.find(x=>x.id===new URLSearchParams(location.search).get("d"))||D[0];
  theme(d.theme);document.title=d.name+" | TapTravel";
  $("#name").textContent=d.name+", "+d.country;$("#tag").textContent=d.tag;$("#wm").textContent=d.code;$("#dest").textContent=d.code;
  $("#best").textContent=d.best;$("#lang").textContent=d.lang;$("#from").textContent=eur(from(d));$("#about").textContent=d.about;
  $("#hi").innerHTML=d.hi.map(h=>`<li>${h}</li>`).join("");
  $("#rules").innerHTML=`<tr><th>Legal drinking age</th><td>${d.age}</td></tr><tr><th>Currency</th><td>${d.cur}</td></tr><tr><th>Language</th><td>${d.lang}</td></tr><tr><th>Best time to go</th><td>${d.best}</td></tr>`;
  $("#more").innerHTML=D.filter(x=>x.id!==d.id).slice(0,3).map(card).join("");
  const calc=()=>{const n=Math.max(1,+$("#trav").value||1),g=Math.max(3,+$("#nights").value||3),pl=+$("#plan").value,c=$("#promo").value.trim().toUpperCase(),off=c===d.bf.code?d.bf.off:0,base=(d.flight+d.night*g)*n;
    $("#total").textContent=eur(base*(1-(pl+off)/100));$("#note").textContent=off?`Code ${c} applied: ${off}% off.`:`Use code ${d.bf.code} for ${d.bf.off}% off.`};
  $$("#est input,#est select").forEach(x=>x.oninput=calc);calc();
  $("#open").onclick=()=>$("#req").showModal();$("#close").onclick=()=>$("#req").close();
  $("#reqform").onsubmit=e=>{e.preventDefault();const b=new Date($("#dob").value),n=new Date();let a=n.getFullYear()-b.getFullYear();if(n.getMonth()<b.getMonth()||(n.getMonth()===b.getMonth()&&n.getDate()<b.getDate()))a--;
    $("#msg").textContent=a>=18?`Thanks ${$("#fname").value}. We'll email ${$("#email").value} within one business day.`:"You must be 18 or older to book. A parent or guardian can book for you.";if(a>=18)e.target.reset()};
}
if(page==="offers"){
  $("#bf").innerHTML=D.map(d=>`<article class="card"><a class="art" href="destination.html?d=${d.id}"><div class="cover" style="background:${d.theme.hero};color:${d.theme.ink};font-family:${d.theme.head||DEFAULT.head}">${d.code}</div></a><div class="pad"><h3>${d.name}</h3><p class="big">${d.bf.off}% off</p><p class="muted">Was ${eur(from(d))}, now ${eur(from(d)*(100-d.bf.off)/100)}</p><p><button class="btn y" data-code="${d.bf.code}">Copy ${d.bf.code}</button></p></div></article>`).join("");
  document.addEventListener("click",e=>{const c=e.target.dataset?.code;if(c){navigator.clipboard&&navigator.clipboard.writeText(c);e.target.textContent="Copied "+c}});
  const end=new Date("2026-11-30T23:59:59"),tick=()=>{const ms=end-new Date();if(ms<=0){$("#count").textContent="These offers have ended";return}
    $("#count").textContent=`${Math.floor(ms/864e5)}d ${Math.floor(ms/36e5)%24}h ${Math.floor(ms/6e4)%60}m ${Math.floor(ms/1e3)%60}s left`};tick();setInterval(tick,1000);
}
if(page==="premium"){
  const P={ex:[7.99,79],gl:[14.99,149]};
  $$("[data-bill]").forEach(b=>b.onclick=()=>{const y=+(b.dataset.bill==="y");$$("[data-bill]").forEach(x=>x.setAttribute("aria-pressed",x===b));
    $("#p-ex").textContent="€"+P.ex[y]+(y?" per year":" per month");$("#p-gl").textContent="€"+P.gl[y]+(y?" per year":" per month")});
}
