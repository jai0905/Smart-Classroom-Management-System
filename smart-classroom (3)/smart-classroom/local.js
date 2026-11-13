/* Local replacement for the online runtime: stores everything in this browser (IndexedDB). */
(function(){
const open=()=>new Promise((ok,no)=>{const r=indexedDB.open("smartclass",1);
 r.onupgradeneeded=()=>{const d=r.result;d.createObjectStore("materials",{keyPath:"id"});d.createObjectStore("blobs")};
 r.onsuccess=()=>ok(r.result);r.onerror=()=>no(r.error)});
const tx=async(st,mode,fn)=>{const d=await open();return new Promise((ok,no)=>{const t=d.transaction(st,mode),s=t.objectStore(st),q=fn(s);t.oncomplete=()=>ok(q&&q.result);t.onerror=()=>no(t.error)})};
const uid=()=>Math.random().toString(36).slice(2)+Date.now().toString(36);
const subs=[];
async function all(){const rows=await tx("materials","readonly",s=>s.getAll());
 const out=[];for(const m of rows){const b=m.assetId?await tx("blobs","readonly",s=>s.get(m.assetId)):null;
  out.push({id:m.id,data:()=>({...m,url:b?URL.createObjectURL(b):""})})}return {docs:out}}
const push=async()=>{const s=await all();subs.forEach(f=>f(s))};
const db={collection:name=>name==="roster"?{doc:()=>({get:async()=>({exists:true,data:()=>({rows:ROSTER})})})}:{
  onSnapshot(cb){subs.push(cb);all().then(cb);return()=>{}},
  async add(d){const id=uid();await tx("materials","readwrite",s=>s.put({...d,id}));push()},
  doc:id=>({delete:async()=>{await tx("materials","readwrite",s=>s.delete(id));push()}})}};
const assets={async upload(blob){const id=uid();await tx("blobs","readwrite",s=>s.put(blob,id));return{id,url:URL.createObjectURL(blob)}},
  async delete(id){await tx("blobs","readwrite",s=>s.delete(id))}};
const downloads={async save({filename,data}){const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([data]));a.download=filename;document.body.appendChild(a);a.click();a.remove()}};
window.claude={use:async n=>({db,assets,downloads})[n]||null};
})();
