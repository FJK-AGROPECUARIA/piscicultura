const CACHE='pisc-v18';
const FILES=['./','./index.html','./gestao.js','./manifest.json','./icone-192.png','./icone-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES.map(f=>new Request(f,{cache:'reload'})))));self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x.startsWith('pisc-')&&x!==CACHE).map(x=>caches.delete(x)))));self.clients.claim();});
self.addEventListener('fetch',e=>{
  const req=e.request;if(req.method!=='GET')return;
  const url=new URL(req.url);if(url.origin!==location.origin)return; // Google Script (nuvem) vai direto, sem cache
  // App: sempre tenta a versão mais nova da internet; sem sinal, usa a guardada
  e.respondWith(fetch(new Request(req.url,{cache:'no-cache'})).then(res=>{if(res.ok){const cp=res.clone();caches.open(CACHE).then(c=>c.put(req,cp));}return res;})
    .catch(()=>caches.match(req,{ignoreSearch:true}).then(r=>r||caches.match('./index.html'))));
});
