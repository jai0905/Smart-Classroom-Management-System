/* Smart Classroom Management System · rule-based (no ML) */
const $=s=>document.querySelector(s);
const esc=t=>String(t??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const num=v=>Math.max(0,parseFloat(v)||0);
const f2=v=>String(Math.round(v*100)/100);
const norm=t=>String(t||"").toUpperCase().replace(/[^A-Z0-9]/g,"");
const IC={att:'<circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-6"/>',tt:'<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M8 2v4M16 2v4M3 10h18"/>',mk:'<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',gp:'<path d="M2 9l10-5 10 5-10 5z"/><path d="M6 11v5c3 2 9 2 12 0v-5"/>',mt:'<path d="M4 4h10l6 6v10H4z"/><path d="M14 4v6h6"/>',out:'<path d="M9 21H5V3h4M16 17l5-5-5-5M21 12H9"/>'};
const ic=n=>`<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${IC[n]}</svg>`;
const SEM_START=new Date(2026,6,20),CLOSE=new Date(2026,10,20);
const GR=[["O",91],["A+",81],["A",71],["B+",61],["B",56],["C",50]];
const GP={"O":10,"A+":9,"A":8,"B+":7,"B":6,"C":5,"F":0,"Ab":0};
const COURSES=[["A","Discrete Mathematics",4,4],["B","Formal Language and Automata",3,3],["C","Computer Networks",4,5],["D","Machine Learning",3,3],["E","Community Connect",1,2],["F","Full Stack Web Development",3,3],["G","Sustainable Development Practices",3,3],["H","Indian Art Form",0,1],["I","Quantum Cryptography / Quantum ML",3,3],["J","Blockchain Mgmt / FinTech Foundation",3,3],["CDC","Analytical & Logical Thinking Skills",0,3]];
const TT={1:{6:"A",7:"F",8:"D",9:"C"},2:{3:"E",4:"E",6:"D",7:"G",8:"A",9:"G"},3:{6:"G",7:"C",8:"D",9:"B"},4:{1:"C",2:"C",3:"CDC",4:"CDC",6:"F",7:"A",8:"C",9:"B"},5:{4:"CDC",6:"B",7:"H",8:"A",9:"F"}};
const PT=["9:00–9:50","9:50–10:40","10:50–11:40","11:40–12:30","12:30–1:20","1:20–2:10","2:10–3:00","3:10–4:00","4:00–4:50"];
const DN=["","Monday","Tuesday","Wednesday","Thursday","Friday"];
const hue=s=>(s.charCodeAt(0)*47+s.length*30)%360;
let S=null,view="login",tab="att",lrole="s",mats=null,db=null,assets=null,roster=null,msg="";
const key=r=>"sc_"+r;
const save=()=>{try{localStorage.setItem(key(S.reg),JSON.stringify(S))}catch(e){}};

/* ---------- dates & classes ---------- */
const dk=d=>d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
const day0=d=>{const x=new Date(d);x.setHours(0,0,0,0);return x};
const addD=(d,n)=>{const x=new Date(d);x.setDate(x.getDate()+n);return x};
const perDay=(slot,d)=>Object.values(TT[d]||{}).filter(v=>v===slot).length;
const inGrid=slot=>[1,2,3,4,5].some(d=>perDay(slot,d));
const hols=()=>new Set((S.hol||"").split(/[,\s]+/).filter(Boolean));
function count(s,a,b,H){if(b<a)return 0;let n=0,w=0;
 for(let d=new Date(a);d<=b;d=addD(d,1)){const g=d.getDay();if(g<1||g>5||H.has(dk(d)))continue;w++;n+=perDay(s.slot,g)}
 return inGrid(s.slot)?n:Math.round(w*s.ppw/5)}
function refresh(){const H=hols(),t=day0(new Date()),e=S.today?addD(t,-1):t,ce=e>CLOSE?CLOSE:e;
 S.subs.forEach(s=>{s.c=count(s,SEM_START,ce,H);s.R=ce<CLOSE?count(s,addD(ce,1),CLOSE,H):0;s.m=Math.min(s.miss||0,s.c);s.a=s.c-s.m});
 S.left=Math.max(0,Math.ceil((CLOSE-t)/864e5))}
function calc(s,T,plan){const t=T/100,c=s.c,a=s.a,R=s.R,F=c+R;
 const pct=c?a/c*100:100,must=Math.ceil(t*F-1e-9),need=Math.max(0,must-a),canMiss=R-need;
 const pp=Math.min(plan??R,R);
 return{pct,need,canMiss,nowSkip:Math.max(0,Math.floor(a/t-c+1e-9)),consec:pct>=T?0:Math.ceil((t*c-a)/(1-t)-1e-9),pp,proj:F?(a+pp)/F*100:100,best:F?(a+R)/F*100:100}}

/* ---------- shell ---------- */
function topbar(){const n=S?S.name:"Teacher",ini=n.split(/\s+/).map(x=>x[0]).slice(0,2).join("");
 return `<div class="top"><div class="logo"><i>🎓</i>Smart Classroom</div><div class="who"><div class="tx"><b>${esc(n)}</b><div class="mu">${S?esc(S.reg)+" · CSE-F":"Administrator"}</div></div><div class="av">${esc(ini)}</div><button class="btn gh sm" onclick="logout()">${ic("out")}Logout</button></div></div>`}
function logout(){S=null;view="login";msg="";render()}
function render(){view==="login"?loginV():view==="teacher"?teacherV():studentV()}

/* ---------- login ---------- */
function loginV(){
 $("#app").innerHTML=`<div class="login"><div class="hero"><div class="lg">SRM INSTITUTE OF SCIENCE AND TECHNOLOGY · TIRUCHIRAPPALLI</div><h1>Smart Classroom Management</h1><p>Plan your attendance, predict your grades and learn from study materials — all in one place.</p>
 <ul><li>Timetable-aware attendance predictor</li><li>Internal marks &amp; grade planner (SRMIST 2021)</li><li>SGPA / CGPA calculator</li><li>Study materials from your teachers</li></ul></div>
 <div class="panel"><div class="box"><h2>Welcome back</h2><div class="mu">Sign in to continue</div>
 <div class="seg"><button class="${lrole==="s"?"on":""}" onclick="lrole='s';msg='';loginV()">Student</button><button class="${lrole==="t"?"on":""}" onclick="lrole='t';msg='';loginV()">Teacher</button></div>
 ${lrole==="s"?`<div class="f">Register number<input id="a" placeholder="RA2411003050…" autocomplete="off" onkeydown="if(event.key==='Enter')login()"></div><div class="f">Name<input id="b" placeholder="As in the class list" autocomplete="off" onkeydown="if(event.key==='Enter')login()"></div>`
 :`<div class="f">Username<input id="a" autocomplete="off" onkeydown="if(event.key==='Enter')login()"></div><div class="f">Password<input id="b" type="password" onkeydown="if(event.key==='Enter')login()"></div>`}
 <div class="err">${esc(msg)}</div><button class="btn" style="width:100%;justify-content:center" onclick="login()">Sign in</button>
 ${lrole==="s"?'<p class="mu" style="margin-top:14px">Only students on the CSE-F class list can sign in. Your data is saved on this device.</p>':""}</div></div></div>`}
function login(){const a=$("#a").value.trim(),b=$("#b").value.trim();
 if(lrole==="t"){if(a==="admin"&&b==="srm@1234"){view="teacher";msg="";render()}else{msg="Wrong username or password.";loginV()}return}
 if(!roster){msg="Class list is not available. Open this page from the shared link while signed in.";return loginV()}
 const m=roster.find(x=>x.reg===a.toUpperCase()&&norm(x.name)===norm(b));
 if(!m){msg="Register number and name do not match the class list.";return loginV()}
 let d=null;try{d=JSON.parse(localStorage.getItem(key(m.reg)))}catch(e){}
 S=d||{reg:m.reg,target:75};S.reg=m.reg;S.name=m.name;seed();save();view="student";tab="att";msg="";render()}
function seed(){const old=S.subs||[];
 S.subs=COURSES.map(([slot,name,cr,ppw])=>{const o=old.find(x=>x.slot===slot)||{};
  return{slot,name,cr,ppw,miss:o.miss||0,r1:o.r1??(o.c1?o.c1*50/15:0),r2:o.r2??(o.c2?o.c2*50/15:0),c3:o.c3||0,x:o.x,plan:o.plan}});
 S.gr=S.gr||{};S.cg=S.cg||[{},{},{},{}]}

/* ---------- student ---------- */
let lastTab=null;
function studentV(){const y0=tab===lastTab?window.scrollY:0;lastTab=tab;refresh();
 const T=[["att","Attendance","att"],["tt","Timetable","tt"],["mrk","Internal marks","mk"],["sg","SGPA / CGPA","gp"],["mat","Study materials","mt"]];
 $("#app").innerHTML=topbar()+`<main><div class="tabs">${T.map(t=>`<button class="${tab===t[0]?"on":""}" onclick="tab='${t[0]}';studentV()">${ic(t[2])}${t[1]}</button>`).join("")}</div><div id="tb"></div></main>`;
 ({att:attV,tt:ttV,mrk:mrkV,sg:sgV,mat:()=>$("#tb").innerHTML=matList(false)})[tab]();window.scrollTo(0,y0)}
function setS(i,f,v){const s=S.subs[i];s[f]=(f==="x"&&v==="")?"":num(v);save();studentV()}

function remind(){const T=S.target,o=[];
 S.subs.forEach(s=>{const r=calc(s,T);
  if(s.c&&r.pct<T)o.push(`<div style="color:var(--bd)">⚠ <b style="display:inline">${esc(s.name)}</b> is at ${r.pct.toFixed(1)}%, below ${T}%. ${r.best<T?"The target can no longer be reached by 20 Nov.":"Attend the next "+r.consec+" classes in a row."}</div>`);
  else if(s.c&&r.need>0&&r.canMiss<=1)o.push(`<div style="color:var(--wn)">⏰ <b style="display:inline">${esc(s.name)}</b>: you can miss only ${Math.max(0,r.canMiss)} more class(es) before 20 Nov.</div>`)});
 return o.length?`<div class="alert"><b>Reminders</b>${o.join("")}</div>`:""}

function attV(){const T=S.target;
 const tc=S.subs.reduce((a,s)=>a+s.c,0),ta=S.subs.reduce((a,s)=>a+s.a,0),ov=tc?ta/tc*100:100;
 const risk=S.subs.filter(s=>s.c&&s.a/s.c*100<T).length,left=S.subs.reduce((a,s)=>a+s.R,0);
 const cards=S.subs.map((s,i)=>{const r=calc(s,T,s.plan),k=!s.c?"mu":r.pct>=T+5?"ok":r.pct>=T?"wn":"bd",lb=!s.c?"No classes yet":r.pct>=T+5?"Safe":r.pct>=T?"Borderline":"Shortage";
  return `<div class="card"><div class="sub-h"><div class="slot" style="--h:${hue(s.slot)}">${s.slot}</div><div><div class="nm">${esc(s.name)}</div><div class="mu">${s.ppw} periods/week · ${s.cr} credits</div></div><span class="pill ${k}">${lb}</span></div>
  <div class="meter"><div class="pc">${r.pct.toFixed(1)}%</div><div class="bar"><i class="${k==="ok"?"":k}" style="width:${Math.min(100,r.pct)}%"></i><b style="left:${T}%" title="Target ${T}%"></b></div></div>
  <div class="facts"><div><span>Conducted so far</span><b>${s.c}</b></div><div><span>Attended</span><b>${s.a}</b></div><div><span>Classes left</span><b>${s.R}</b></div><div><span>Semester total</span><b>${s.c+s.R}</b></div></div>
  <div class="row"><label>Classes missed so far<input type="number" min="0" max="${s.c}" value="${s.m}" onchange="setS(${i},'miss',this.value)"></label></div>
  <div class="tiles"><div><span>Must attend (of ${s.R} left)</span><b>${r.best<T?"Unreachable":r.need}</b></div><div><span>Safe-bunk till 20 Nov</span><b>${Math.max(0,r.canMiss)}</b></div><div><span>Safe-bunk right now</span><b>${r.nowSkip}</b></div><div><span>In a row to reach ${T}%</span><b>${r.consec}</b></div></div>
  <div class="plan"><span class="mu">Future planner — if I attend</span><input type="number" min="0" max="${s.R}" value="${r.pp}" onchange="setS(${i},'plan',this.value)"><span class="mu">of ${s.R} remaining →</span><b>${r.proj.toFixed(1)}%</b><span class="pill ${r.proj>=T?"ok":"bd"}">${r.proj>=T?"meets target":"below target"}</span></div></div>`}).join("");
 $("#tb").innerHTML=`${remind()}<div class="stats"><div class="stat"><span>Overall attendance</span><b>${ov.toFixed(1)}%</b><small>${ta} of ${tc} classes</small></div><div class="stat"><span>Below target</span><b>${risk}</b><small>of ${S.subs.length} courses</small></div><div class="stat"><span>Classes left</span><b>${left}</b><small>till 20 Nov 2026</small></div><div class="stat"><span>Days to cut-off</span><b>${S.left}</b><small>20 Jul – 20 Nov 2026</small></div></div>
 <div class="card"><div class="hd"><div><h3>Settings</h3><div class="mu">Classes conducted are counted automatically from the timetable, 20 Jul to 20 Nov 2026. Enter how many you missed.</div></div></div>
 <div class="row"><label>Target %<input type="number" min="1" max="100" value="${T}" onchange="S.target=num(this.value)||75;save();studentV()"></label>
 <label>Holidays (YYYY-MM-DD, comma separated)<input style="width:290px" value="${esc(S.hol||"")}" onchange="S.hol=this.value;save();studentV()"></label>
 <label style="flex-direction:row;align-items:center;gap:8px;font-weight:500"><input type="checkbox" style="width:auto" ${S.today?"checked":""} onchange="S.today=this.checked;save();studentV()">Today’s classes are still pending</label></div></div>${cards}`}

function ttV(){let h=`<tr><th></th>${PT.map((t,i)=>`<th>P${i+1}<small>${t}</small></th>`).join("")}</tr>`;const tdy=new Date().getDay();
 for(let d=1;d<=5;d++){h+=`<tr class="${d===tdy?"td":""}"><th>${DN[d].slice(0,3)}</th>`;
  for(let p=1;p<=9;p++){const v=TT[d][p];if(p===5){h+=`<td class="lu">Lunch</td>`;continue}
   if((d===4&&(p===2||p===4))||(d===2&&p===4))continue;
   const sp=(d===4&&(p===1||p===3))||(d===2&&p===3)?2:1;
   h+=`<td colspan="${sp}" style="${v?`background:hsl(${hue(v)} 70% 90%);color:hsl(${hue(v)} 60% 28%)`:""}">${d===4&&p===1?"C · CN Lab":v||""}</td>`}
  h+="</tr>"}
 $("#tb").innerHTML=`<div class="card"><div class="hd"><div><h3>III CSE-F · Batch 2: AN</h3><div class="mu">Odd semester 2026–27 · SRM IST, Tiruchirappalli</div></div></div><div class="sc"><table class="tt">${h}</table></div></div>
 <div class="card"><div class="leg">${COURSES.map(c=>`<div><span class="slot" style="--h:${hue(c[0])}">${c[0]}</span><span><b>${c[1]}</b><br><span class="mu">${c[3]} periods/week · ${c[2]} credits${inGrid(c[0])?"":" · not in grid"}</span></span></div>`).join("")}</div></div>`}

function needFor(I,T){const n=T-I;if(n>40)return null;if(n<=0)return 0;let r=0;while(Math.round(r*40/75)<n)r++;return r}
function mrkV(){const c1=s=>Math.min(50,s.r1)*15/50,c2=s=>Math.min(50,s.r2)*15/50;
 const r1=S.subs.map((s,i)=>{const t=c1(s)+c2(s);return `<tr><td><b>${esc(s.slot)}</b> · ${esc(s.name)}</td>
  <td><input type="number" min="0" max="50" step="0.5" value="${s.r1}" style="width:80px" onchange="setS(${i},'r1',this.value)"></td><td>${f2(c1(s))}</td>
  <td><input type="number" min="0" max="50" step="0.5" value="${s.r2}" style="width:80px" onchange="setS(${i},'r2',this.value)"></td><td>${f2(c2(s))}</td><td><b>${f2(t)}/30</b></td><td class="mu">${(t/30*100).toFixed(0)}%</td></tr>`}).join("");
 const r2=S.subs.map((s,i)=>{const I=Math.round(c1(s)+c2(s)+Math.min(30,s.c3||0));
  const g=GR.map(([n,T])=>{const r=needFor(I,T);return `<td class="${r===0?"ok":r===null?"bd":""}">${r===null?"Not possible":r===0?"Secured":r+"/75"}</td>`}).join("");
  const has=s.x!=null&&s.x!=="",tot=I+Math.round(Math.min(75,s.x||0)*40/75),gr=(GR.find(([n,T])=>tot>=T)||["F"])[0];
  return `<tr><td><b>${esc(s.slot)}</b> · ${esc(s.name)}</td><td>${f2(c1(s)+c2(s))}</td><td><input type="number" min="0" max="30" step="0.5" value="${s.c3||""}" placeholder="/30" style="width:72px" onchange="setS(${i},'c3',this.value)"></td><td><b>${I}/60</b></td>${g}
  <td><input type="number" min="0" max="75" value="${has?s.x:""}" placeholder="/75" style="width:72px" onchange="setS(${i},'x',this.value)"></td><td>${has?`<b>${tot}/100 → ${gr}</b>`:"—"}</td></tr>`}).join("");
 $("#tb").innerHTML=`<div class="card"><div class="hd"><div><h3>1 · Internal marks so far (30 of the 60)</h3><div class="mu">Each CLA test is conducted for 50 marks and converted to 15 (marks × 15 ÷ 50). CLA-1 + CLA-2 = 30. The other 30 marks (project and other internal work) are concluded later.</div></div></div>
 <div class="sc"><table><tr><th>Course</th><th>CLA-1 /50</th><th>→ /15</th><th>CLA-2 /50</th><th>→ /15</th><th>Total /30</th><th></th></tr>${r1}</table></div></div>
 <div class="card"><div class="hd"><div><h3>2 · Grade prediction · SRMIST Regulations 2021</h3><div class="mu">Internal /60 = CLA-1 + CLA-2 + other internal work (/30, actual or expected). The semester exam is 75 marks, converted to 40. Total 100. Grades: O ≥91, A+ ≥81, A ≥71, B+ ≥61, B ≥56, C ≥50; below 50 fails. Each grade column shows the minimum exam score out of 75.</div></div></div>
 <div class="sc"><table style="min-width:980px"><tr><th>Course</th><th>CLA /30</th><th>Other /30</th><th>Internal /60</th>${GR.map(g=>`<th>${g[0]}</th>`).join("")}<th>What if /75</th><th>Result</th></tr>${r2}</table></div></div>`}

function sgV(){const y=window.scrollY,g=S.gr;let pts=0,tc=0,ng=0;
 const rows=COURSES.map(c=>{const e=g[c[0]]||(g[c[0]]={cr:c[2],g:""});
  if(e.g!==""&&e.cr>0){pts+=e.cr*GP[e.g];tc+=e.cr}else if(e.g===""&&e.cr>0)ng++;
  return `<tr><td><b>${c[0]}</b> · ${esc(c[1])}</td><td><input type="number" min="0" max="6" value="${e.cr}" style="width:64px" onchange="S.gr['${c[0]}'].cr=num(this.value);save();sgV()"></td>
  <td><select onchange="S.gr['${c[0]}'].g=this.value;save();sgV()"><option value="">Select</option>${Object.keys(GP).map(x=>`<option ${x===e.g?"selected":""}>${x}</option>`).join("")}</select></td><td>${e.g!==""?GP[e.g]:"–"}</td><td>${e.g!==""&&e.cr>0?e.cr*GP[e.g]:"–"}</td></tr>`}).join("");
 const sg=tc?pts/tc:0,cg=S.cg;let sp=0,sc=0;cg.forEach(x=>{if(x.s>0){sp+=x.s;sc++}});if(S.inc&&tc){sp+=sg;sc++}
 const C=sc?sp/sc:0,tg=S.tg||8.5,need=sc?tg*(sc+1)-sp:tg;
 $("#tb").innerHTML=`<div class="stats"><div class="stat"><span>SGPA · Sem 5</span><b>${sg.toFixed(2)}</b><small>${pts} pts ÷ ${tc} credits${ng?` · ${ng} not graded`:""}</small></div><div class="stat"><span>CGPA</span><b>${C.toFixed(2)}</b><small>${sc} semester${sc===1?"":"s"} · ≈ ${(C*10).toFixed(1)}%</small></div></div>
 <div class="card"><h3>SGPA · Current semester (Sem 5, Odd 2026–27)</h3><div class="mu" style="margin:4px 0 10px">SRMIST 2021: SGPA = Σ(credit × grade point) ÷ Σ credits. O 10, A+ 9, A 8, B+ 7, B 6, C 5, F 0, Ab 0. Credits are loaded from the timetable; pick the grade for each course.</div>
 <div class="sc"><table><tr><th>Course</th><th>Credits</th><th>Grade</th><th>Grade point</th><th>Credit × GP</th></tr>${rows}</table></div></div>
 <div class="res"><div><span>Your SGPA</span><b>${sg.toFixed(2)}</b></div><div class="bk">${tc?`SGPA = ${pts} ÷ ${tc} = ${sg.toFixed(2)}`:"Select a grade for each course"}${ng?` <span class="mu">· ${ng} course(s) not graded</span>`:""}</div><div><span>Percentage</span><b>${(sg*10).toFixed(1)}%</b></div></div>
 <div class="card"><h3>CGPA</h3><div class="mu" style="margin:4px 0 10px">CGPA is the average of your semester SGPAs. Just enter the SGPA of each completed semester — no credits needed.</div>
 <div class="sc"><table><tr><th>Semester</th><th>SGPA</th></tr>${cg.map((x,i)=>`<tr><td>Sem ${i+1}</td><td><input type="number" step="0.01" min="0" max="10" value="${x.s||""}" style="width:90px" onchange="S.cg[${i}].s=Math.min(10,num(this.value));save();sgV()"></td></tr>`).join("")}<tr><td>Sem 5 (current)</td><td>${sg.toFixed(2)}</td></tr></table></div>
 <label style="display:flex;gap:8px;margin-top:10px;align-items:center"><input type="checkbox" style="width:auto" ${S.inc?"checked":""} onchange="S.inc=this.checked;save();sgV()">Include the current semester SGPA</label></div>
 <div class="card"><h3>Target CGPA planner</h3><div class="row" style="margin:10px 0"><label>Target CGPA<input type="number" step="0.01" value="${tg}" onchange="S.tg=num(this.value);save();sgV()"></label></div>
 <p style="margin:0">${sc?`SGPA needed in the next semester: <b>${need>10?"not possible (above 10)":Math.max(0,need).toFixed(2)}</b>`:'<span class="mu">Enter at least one completed semester above.</span>'}</p></div>`;window.scrollTo(0,y)}

/* ---------- materials ---------- */
async function loadMats(){if(db)return;
 try{const c=await claude.use("db");assets=await claude.use("assets");db=c;
  if(!db){mats=null;return upd()}
  db.collection("roster").doc("all").get().then(d=>{roster=(d.data()||{}).rows||null}).catch(()=>{});
  const t=setTimeout(()=>{if(mats===null){mats=[];upd()}},10000);
  db.collection("materials").onSnapshot(s=>{clearTimeout(t);mats=s.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>b.ts-a.ts);upd()},()=>{mats=[];upd()})}
 catch(e){mats=null;upd()}}
function upd(){if(view==="teacher")teacherV();else if(view==="student"&&tab==="mat")$("#tb").innerHTML=matList(false)}
function matList(del){
 if(mats===null)return '<div class="card empty">Loading materials… If nothing appears, open this page from the shared link while signed in.</div>';
 if(!mats.length)return '<div class="card empty">No study materials have been posted yet.</div>';
 return `<div class="card">${mats.map(m=>`<div class="mat"><div class="fi">${ic("mt")}</div><div class="g"><b>${esc(m.title)}</b><div class="mu">${esc(m.subject||"General")} · ${new Date(m.ts).toLocaleDateString()}</div>
 ${m.enc==="b64"?`<a href="#" onclick="dl('${m.id}');return false">Download ${esc(m.name)}</a>`:`<a href="${esc(m.url)}" target="_blank" rel="noopener">Open ${esc(m.name)}</a>`}</div>
 ${del?`<button class="btn dg sm" onclick="delMat('${m.id}','${m.assetId||""}')">Delete</button>`:""}</div>`).join("")}</div>`}
function teacherV(){
 $("#app").innerHTML=topbar()+`<main><div class="card"><div class="hd"><div><h2>Study materials</h2><div class="mu">Files you post here appear instantly in every student’s login.</div></div></div>
 <div class="row"><label>Title<input style="width:200px" id="mt"></label><label>Subject<input style="width:180px" id="ms"></label><label>File from your device<input type="file" id="mf" style="width:240px"></label><button class="btn" id="mb" onclick="postMat()">Post material</button></div>
 <p class="mu" style="margin:10px 0 0">PDF, images and videos up to 20 MB; Word, PowerPoint, Excel, ZIP and other files up to 14 MB.</p><p id="mm" style="color:var(--bd);margin:6px 0 0"></p></div>
 <h3 style="margin:18px 0 10px">Posted materials</h3>${matList(true)}</main>`}
const MT={pdf:"application/pdf",png:"image/png",jpg:"image/jpeg",jpeg:"image/jpeg",gif:"image/gif",webp:"image/webp",svg:"image/svg+xml",mp4:"video/mp4",webm:"video/webm",csv:"text/csv",md:"text/markdown",json:"application/json",txt:"text/plain"};
const b64=f=>new Promise((ok,no)=>{const r=new FileReader();r.onload=()=>ok(r.result.split(",")[1]);r.onerror=no;r.readAsDataURL(f)});
async function postMat(){const f=$("#mf").files[0],t=$("#mt").value.trim(),m=$("#mm");
 if(!t||!f){m.textContent="Add a title and choose a file.";return}
 if(!db||!assets){m.textContent="Posting needs the page owner’s sign-in to claude.ai (uploads are not available in this view).";return}
 const ext=(f.name.split(".").pop()||"").toLowerCase(),mime=MT[ext];
 if(!mime&&f.size>14*1024*1024){m.textContent="This file type can be up to 14 MB. Zip or compress it, or use a PDF (up to 20 MB).";return}
 $("#mb").disabled=true;m.textContent="Uploading…";
 try{let r,enc="";
  if(mime)r=await assets.upload(f,{type:mime});else{enc="b64";r=await assets.upload(new Blob([await b64(f)],{type:"text/plain"}),{type:"text/plain"})}
  await db.collection("materials").add({title:t,subject:$("#ms").value.trim(),name:f.name,url:r.url,assetId:r.id,enc,ts:Date.now()});m.textContent="";teacherV()}
 catch(e){m.textContent="Upload failed: "+(e.message||e.code||"not permitted");$("#mb").disabled=false}}
async function dl(id){const m=mats.find(x=>x.id===id);if(!m)return;
 try{const d=await claude.use("downloads"),t=await (await fetch(m.url)).text();const bin=atob(t),u=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);
  if(!d)throw 0;await d.save({filename:m.name,data:u})}catch(e){alert("Could not download this file. Please try again.")}}
async function delMat(id,aid){if(!confirm("Delete this material?"))return;try{await db.collection("materials").doc(id).delete();if(aid&&assets)await assets.delete(aid)}catch(e){}}
render();loadMats();
