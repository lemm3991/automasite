const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {sourceSnapshot,sameSnapshot}=require('./lib/builder-evidence.cjs');
const {inspectPage}=require('./lib/render-observations.cjs');
const args=process.argv.slice(2),arg=(key,fallback)=>args.includes(key)?args[args.indexOf(key)+1]:fallback;
const slug=arg('--slug'),url=arg('--url',`http://127.0.0.1:4321/${slug}/`),cdp=arg('--cdp','http://127.0.0.1:9223');
if(!/^[a-z0-9-]+$/.test(slug||''))throw new Error('Informe --slug cliente');
const output=path.resolve(`leads/${slug}/redesign`);fs.mkdirSync(path.join(output,'screenshots'),{recursive:true});
const sha=buffer=>crypto.createHash('sha256').update(buffer).digest('hex');
async function main(){
 const plan=JSON.parse(fs.readFileSync(`leads/${slug}/redesign/implementation-plan.json`,'utf8'));
 const sourceHashes=sourceSnapshot(process.cwd(),slug);
 const response=await fetch(url);if(!response.ok)throw new Error(`HTTP ${response.status}`);const html=await response.text();
 const target=await (await fetch(`${cdp}/json/new?about:blank`,{method:'PUT'})).json();
 const ws=new WebSocket(target.webSocketDebuggerUrl);await new Promise((resolve,reject)=>{ws.addEventListener('open',resolve,{once:true});ws.addEventListener('error',reject,{once:true});});
 let id=0;const pending=new Map(),runtimeErrors=[];
 ws.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.method==='Runtime.exceptionThrown')runtimeErrors.push(m.params.exceptionDetails.text);if(pending.has(m.id)){const p=pending.get(m.id);pending.delete(m.id);clearTimeout(p.timer);m.error?p.reject(new Error(m.error.message)):p.resolve(m.result);}});
 const send=(method,params={})=>new Promise((resolve,reject)=>{const n=++id;const timer=setTimeout(()=>{pending.delete(n);reject(new Error(`Timeout ${method}`));},20000);pending.set(n,{resolve,reject,timer});ws.send(JSON.stringify({id:n,method,params}));});
 const evaluate=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw new Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
 const captures=[];
 try{
  await send('Page.enable');await send('Runtime.enable');
  for(const viewport of [{name:'desktop',width:1440,height:900,mobile:false},{name:'mobile',width:390,height:844,mobile:true}]){
   await send('Emulation.setDeviceMetricsOverride',{width:viewport.width,height:viewport.height,deviceScaleFactor:1,mobile:viewport.mobile});
   await send('Page.navigate',{url});
   const deadline=Date.now()+15000;while(Date.now()<deadline){if(await evaluate('document.readyState === "complete"'))break;await new Promise(r=>setTimeout(r,200));}
   await evaluate(`(async()=>{document.querySelectorAll('img').forEach(i=>i.loading='eager');await Promise.race([Promise.all([document.fonts.ready,...[...document.images].map(i=>i.decode().catch(()=>{}))]),new Promise(r=>setTimeout(r,7000))]);window.scrollTo(0,0);await new Promise(r=>setTimeout(r,1000));})()`);
   const checks=await evaluate(`(()=>{const ids=new Set([...document.querySelectorAll('[id]')].map(e=>e.id));return {title:document.title,readyState:document.readyState,width:innerWidth,scrollWidth:document.documentElement.scrollWidth,height:document.documentElement.scrollHeight,brokenImages:[...document.images].filter(i=>!i.complete||!i.naturalWidth).map(i=>i.src),missingAnchors:[...new Set([...document.querySelectorAll('a[href^="#"]')].map(a=>a.getAttribute('href').slice(1)).filter(id=>id&&!ids.has(id)))],h1Count:document.querySelectorAll('h1').length,fontsStatus:document.fonts.status};})()`);
   const screenshots=[];
   for(const full of [false,true]){
    const name=`home-${viewport.name}${full?'-full':''}.png`;
    const params={format:'png',captureBeyondViewport:full,fromSurface:true,...(full?{clip:{x:0,y:0,width:viewport.width,height:Math.min(checks.height,24000),scale:1}}:{})};
    const snap=await send('Page.captureScreenshot',params);const buffer=Buffer.from(snap.data,'base64');const file=path.join(output,'screenshots',name);fs.writeFileSync(file,buffer);screenshots.push({path:path.relative(process.cwd(),file).replaceAll('\\','/'),sha256:sha(buffer),fullPage:full,width:viewport.width,height:full?Math.min(checks.height,24000):viewport.height});
   }
   const observations=await evaluate(`(${inspectPage.toString()})(${JSON.stringify(plan)})`);
   captures.push({viewport,checks,observations,screenshots});
  }
 }finally{ws.close();await fetch(`${cdp}/json/close/${target.id}`).catch(()=>{});}
 if(!sameSnapshot(sourceHashes,sourceSnapshot(process.cwd(),slug)))throw new Error('Código mudou durante as capturas; repetir após finalizar a edição');
 const evidence={schemaVersion:1,slug,url,capturedAt:new Date().toISOString(),httpStatus:response.status,htmlSha256:sha(html),sourceHashes,clientConfigSha256:sha(fs.readFileSync(`src/clients/data/${slug}.ts`)),captures,runtimeErrors};
 fs.writeFileSync(path.join(output,'render-evidence.json'),JSON.stringify(evidence,null,2));console.log(JSON.stringify(evidence,null,2));
 if(captures.some(c=>c.checks.brokenImages.length||c.checks.scrollWidth>c.viewport.width+1)||runtimeErrors.length)process.exitCode=1;
}
main().catch(e=>{console.error(e);process.exitCode=1;});
