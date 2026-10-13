(()=>{
const D=window.DRINKS,G=window.GUIDE,P=window.PHOTOS||{};
const $=s=>document.querySelector(s),view=$('#view'),sheet=$('#sheet');
const LS={get:(k,d)=>{try{return JSON.parse(localStorage.getItem('bg_'+k))??d}catch(e){return d}},set:(k,v)=>localStorage.setItem('bg_'+k,JSON.stringify(v))};
let favs=new Set(LS.get('favs',[])),owned=new Set(LS.get('owned',[])),unit=LS.get('unit','oz'),tab='drinks';
let F={q:'',base:'All',flavor:'',method:'',strength:0,favOnly:false};
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const BOTTLES=[["Gin",/\bgin\b/i],["Bourbon",/bourbon/i],["Rye whiskey",/\brye\b/i],["Irish whiskey",/irish whiskey/i],["Scotch",/scotch/i],["Light rum",/light (or aged )?rum|light rum/i],["Aged / dark rum",/aged rum|dark rum|blackstrap|light or aged/i],["Tequila",/tequila/i],["Vodka",/vodka/i],["Cognac / brandy",/cognac/i],["Cachaça",/cacha/i],["Pisco",/pisco/i],["Sweet vermouth",/sweet vermouth/i],["Dry vermouth",/dry vermouth/i],["Campari",/campari/i],["Aperol",/aperol/i],["Orange liqueur",/cointreau|triple sec|cura[cç]ao/i],["Coffee liqueur",/coffee liqueur/i],["Maraschino",/maraschino/i],["Green Chartreuse",/chartreuse/i],["Bénédictine",/b[ée]n[ée]dictine/i],["Lillet / Cocchi",/lillet|cocchi/i],["Amaro Nonino",/nonino/i],["Crème de violette",/violette/i],["Crème de cacao",/cacao/i],["Crème de cassis",/cassis/i],["Absinthe",/absinthe/i],["Sparkling wine",/prosecco|champagne|sparkling wine/i],["Angostura bitters",/angostura/i],["Peychaud's bitters",/peychaud/i]];
const need=d=>d.ing.filter(i=>!/optional/i.test(i[2])).map(i=>BOTTLES.filter(b=>b[1].test(i[2])&&!(b[0]=="Gin"&&/ginger/i.test(i[2])&&!/\bgin\b/i.test(i[2].replace(/ginger/ig,'')))).map(b=>b[0])).filter(a=>a.length);
const missing=d=>need(d).filter(alts=>!alts.some(a=>owned.has(a))).map(a=>a.join(' or '));
const GL={"Rocks":"M14 20h36l-3 34H17z","Coupe":"M10 14h44c0 14-10 20-22 20S10 28 10 14zM32 34v18M22 54h20","Martini":"M8 12h48L32 36zM32 36v16M22 54h20","Highball":"M18 8h28l-2 48H20z","Flute":"M26 6h12c0 22-2 28-6 28s-6-6-6-28zM32 34v18M24 54h16","Wine":"M18 8h28c0 18-6 26-14 26S18 26 18 8zM32 34v18M22 54h20","Mug":"M14 14h28v38H14zM42 22h6a6 6 0 010 12h-6","Hurricane":"M22 6h20c-6 14 4 22-4 34h-12c-8-12 2-20-4-34zM32 40v12M24 54h16"};
function glassSvg(g){const k=/coupe/i.test(g)?"Coupe":/martini/i.test(g)?"Martini":/flute/i.test(g)?"Flute":/wine/i.test(g)?"Wine":/mug|cup/i.test(g)?"Mug":/hurricane/i.test(g)?"Hurricane":/highball|collins|pint/i.test(g)?"Highball":"Rocks";
return `<div class="ph placeholder" style="background:radial-gradient(circle at 50% 40%,#3a2915,#0d0a07)"><svg viewBox="0 0 64 64" fill="none" stroke="#d4a54a" stroke-width="1.6" stroke-linejoin="round"><path d="${GL[k]}"/></svg></div>`}
const photo=d=>P[d.id]?`<div class="ph"><img src="img/${d.id}.jpg" alt="${esc(d.name)}" loading="lazy" decoding="async"></div>`:glassSvg(d.glass);
const dots=n=>`<span class="dots">${'●'.repeat(n)}${'○'.repeat(3-n)}</span>`;
const SL=['','Light','Medium','Strong'];
function frac(x){const w=Math.floor(x+1e-9),r=x-w;const m=[[0,''],[.25,'¼'],[1/3,'⅓'],[.5,'½'],[2/3,'⅔'],[.75,'¾'],[1,'']];let best=m[0];for(const e of m)if(Math.abs(r-e[0])<Math.abs(r-best[0]))best=e;const W=best[0]==1?w+1:w;if(Math.abs(r-best[0])>.07)return (Math.round(x*100)/100)+'';return (W?W:'')+(best[1]||(W?'':'0'))}
function amt(a,u,n){if(!u)return a*n%1?frac(a*n):a*n;const v=a*n;if(u=='oz')return unit=='ml'?(Math.round(v*30/ (v*30<20?2.5:5))*(v*30<20?2.5:5))+' ml':frac(v)+' oz';const pl={dash:'dashes',rinse:'rinses',pinch:'pinches'};return (u=='tsp'?frac(v):Math.round(v*10)/10)+' '+(v>1&&pl[u]?pl[u]:u)}
function save(){LS.set('favs',[...favs]);LS.set('owned',[...owned]);LS.set('unit',unit)}
function match(d){const q=F.q.toLowerCase().trim();if(q&&!(d.name+' '+d.base+' '+d.ing.map(i=>i[2]).join(' ')+' '+d.family).toLowerCase().includes(q))return false;
if(F.base!='All'&&d.base!=F.base&&!(F.base=='Whiskey'&&d.base=='Scotch'))return false;if(F.flavor&&!d.flavor.includes(F.flavor))return false;if(F.method&&d.method!=F.method)return false;if(F.strength&&d.strength!=F.strength)return false;if(F.favOnly&&!favs.has(d.id))return false;return true}
const tile=d=>`<div class="tile fade" data-id="${d.id}">${photo(d)}${favs.has(d.id)?'<span class="fav">♥</span>':''}<div class="t"><div class="n">${esc(d.name)}</div><div class="m">${esc(d.base)} · ${d.method} · ${dots(d.strength)}</div></div></div>`;
function chips(name,opts,cur){return `<div class="chips">${opts.map(o=>`<button class="chip${(cur==o[0])?' on':''}" data-f="${name}" data-v="${o[0]}">${o[1]}</button>`).join('')}</div>`}
function drinks(){const list=D.filter(match).sort((a,b)=>a.name.localeCompare(b.name));
view.innerHTML=`<div class="row"><input id="q" type="search" placeholder="Search drinks or ingredients…" value="${esc(F.q)}" autocomplete="off"><button class="btn fill" id="rand" title="Surprise me">🎲</button></div>
${chips('base',['All','Gin','Whiskey','Rum','Tequila','Vodka','Brandy','Aperitif','Wine','Cachaça','Pisco'].map(x=>[x,x]),F.base)}
${chips('flavor',[['','Any taste'],['sour','Sour'],['sweet','Sweet'],['bitter','Bitter'],['boozy','Boozy'],['refreshing','Refreshing'],['herbal','Herbal'],['creamy','Creamy'],['fruity','Fruity'],['bubbly','Bubbly']],F.flavor)}
${chips('method',[['','Any method'],['Stir','Stirred'],['Shake','Shaken'],['Build','Built'],['Blend','Blended']],F.method)}
${chips('strength',[[0,'Any strength'],[1,'● Light'],[2,'●● Medium'],[3,'●●● Strong']],F.strength)}
<div class="row"><div class="count grow">${list.length} of ${D.length} drinks</div><button class="chip${F.favOnly?' on':''}" id="favonly">♥ Favorites</button></div>
<div class="grid" id="grid">${list.map(tile).join('')||'<p class="muted">No drinks match. Try clearing a filter.</p>'}</div>`;
const q=$('#q');q.oninput=()=>{F.q=q.value;const l=D.filter(match).sort((a,b)=>a.name.localeCompare(b.name));$('#grid').innerHTML=l.map(tile).join('')||'<p class="muted">No drinks match.</p>';$('.count').textContent=`${l.length} of ${D.length} drinks`};
view.querySelectorAll('[data-f]').forEach(b=>b.onclick=()=>{const k=b.dataset.f;F[k]=k=='strength'?+b.dataset.v:b.dataset.v;drinks()});
$('#favonly').onclick=()=>{F.favOnly=!F.favOnly;drinks()};$('#rand').onclick=()=>{const l=D.filter(match);const d=(l.length?l:D)[Math.random()*(l.length||D.length)|0];open(d.id)}}
let serv=1;
function open(id,push=true){const d=D.find(x=>x.id==id);if(!d)return;if(push){serv=1;history.pushState({d:id},'','#'+id)}
const sim=D.filter(x=>x.id!=d.id&&x.family==d.family).slice(0,6);
sheet.innerHTML=`<div class="hero">${photo(d)}<div class="shade"><div class="tier">${esc(d.family)}</div><h1>${esc(d.name)}</h1><div class="muted">${esc(d.base)} · ${SL[d.strength]} ${dots(d.strength)}</div></div>
<button class="back" id="back" aria-label="Back">‹</button><button class="back hfav" id="hf" aria-label="Favorite">${favs.has(d.id)?'♥':'♡'}</button></div>
<div class="pad"><div>${d.flavor.map(f=>`<span class="tag">${f}</span>`).join('')}</div>
<div class="facts"><div class="fact"><b>Method</b>${d.method}</div><div class="fact"><b>Glass</b>${esc(d.glass)}</div><div class="fact"><b>Ice</b>${esc(d.ice)}</div><div class="fact"><b>Garnish</b>${esc(d.garnish)}</div></div>
<div class="panel"><div class="row"><h3 class="grow" style="margin:0">Ingredients</h3><div class="seg" id="unit"><button data-u="oz" class="${unit=='oz'?'on':''}">oz</button><button data-u="ml" class="${unit=='ml'?'on':''}">ml</button></div></div>
<div class="row" style="margin-top:8px"><span class="muted grow">Servings</span><span class="stepper"><button id="sm">−</button><b id="sv">${serv}</b><button id="sp">+</button></span></div>
<ul class="ing">${d.ing.map(i=>`<li><span class="amt">${amt(i[0],i[1],serv)}</span><span>${esc(i[2])}</span></li>`).join('')}</ul>${serv>1&&d.method!='Build'?`<div class="muted small">Tip: for ${serv} drinks, ${d.method=='Shake'?'shake in batches of 2 for best texture.':'stir in a pitcher with plenty of ice.'}</div>`:''}</div>
<h2>Method</h2><ol class="steps">${d.steps.map(s=>`<li>${esc(s)}</li>`).join('')}</ol>
<div class="panel"><h3 style="margin-top:0">📜 History</h3><p style="margin:0">${esc(d.hist)}</p></div>
<h2>Variations &amp; riffs</h2><ul class="list">${d.vars.map(v=>`<li>${esc(v)}</li>`).join('')}</ul>
<div class="panel"><b style="color:var(--brass)">Bartender's tip:</b> ${esc(d.tip)}</div>
${sim.length?`<h2>Same family</h2><div class="grid">${sim.map(tile).join('')}</div>`:''}
<p class="credit">${P[d.id]?'Photo: TheCocktailDB.com':'Illustration (no verified photo available)'}</p></div>`;
sheet.hidden=false;sheet.scrollTop=0;document.body.style.overflow='hidden';
$('#back').onclick=()=>history.back();$('#hf').onclick=()=>{favs.has(d.id)?favs.delete(d.id):favs.add(d.id);save();open(d.id,false)};
sheet.querySelectorAll('#unit button').forEach(b=>b.onclick=()=>{unit=b.dataset.u;save();open(d.id,false)});
$('#sm').onclick=()=>{if(serv>1){serv--;keep(d.id)}};$('#sp').onclick=()=>{if(serv<24){serv++;keep(d.id)}};
sheet.querySelectorAll('.tile').forEach(t=>t.onclick=()=>{history.replaceState({d:t.dataset.id},'','#'+t.dataset.id);serv=1;open(t.dataset.id,false)})}
function keep(id){const y=sheet.scrollTop;open(id,false);sheet.scrollTop=y}
function close(){sheet.hidden=true;document.body.style.overflow='';render()}
addEventListener('popstate',()=>{const id=location.hash.slice(1);if(id&&D.find(x=>x.id==id))open(id,false);else close()});
function make(){const can=[],one=[];D.forEach(d=>{const m=missing(d);if(!m.length)can.push(d);else if(m.length==1)one.push([d,m[0]])});
const cnt={};one.forEach(([d,m])=>cnt[m]=(cnt[m]||0)+1);const top=Object.entries(cnt).sort((a,b)=>b[1]-a[1]).slice(0,3);
view.innerHTML=`<h2>What can I make?</h2><p class="muted">Tap the bottles you have. They're saved on this phone. Fresh citrus, syrups, sodas and garnishes are assumed.</p>
<div class="bottles">${BOTTLES.map(b=>`<button class="chip${owned.has(b[0])?' on':''}" data-b="${esc(b[0])}">${esc(b[0])}</button>`).join('')}</div>
<div class="row" style="margin-top:8px"><button class="btn" id="ess">Select essentials</button><button class="btn" id="clr">Clear</button></div>
<h2>You can make ${can.length}</h2>${can.length?`<div class="grid">${can.map(tile).join('')}</div>`:'<p class="muted">Pick a few bottles above to see drinks.</p>'}
${top.length?`<div class="panel"><b style="color:var(--brass)">Best next bottle:</b> ${top.map(([b,n])=>`${esc(b)} (+${n})`).join(', ')}</div>`:''}
${one.length?`<h2>One bottle away</h2><div class="grid">${one.map(([d,m])=>tile(d).replace('</div></div></div>',`</div><div class="m miss">Need: ${esc(m)}</div></div></div>`)).join('')}</div>`:''}`;
view.querySelectorAll('[data-b]').forEach(b=>b.onclick=()=>{const k=b.dataset.b;owned.has(k)?owned.delete(k):owned.add(k);save();const y=scrollY;make();scrollTo(0,y)});
$('#ess').onclick=()=>{["Gin","Bourbon","Rye whiskey","Light rum","Tequila","Vodka","Sweet vermouth","Dry vermouth","Campari","Orange liqueur","Angostura bitters"].forEach(x=>owned.add(x));save();make()};$('#clr').onclick=()=>{owned.clear();save();make()}}
const tiers=o=>[['e','Essentials'],['n','Next level'],['x','Enthusiast']].map(([k,l])=>`<div class="tier">${l}</div><ul class="list">${o[k].map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`).join('');
const pairs=a=>a.map(([t,x])=>`<p><b style="color:var(--brass)">${esc(t)}</b><br>${esc(x)}</p>`).join('');
function bar(){view.innerHTML=`<h2>Stocking a home bar</h2><p class="muted">Start with essentials and build out. Buy bottles for the drinks you love, not everything at once.</p>
${G.stock.map(([t,o],i)=>`<details${i==0?' open':''}><summary>${t}</summary>${tiers(o)}</details>`).join('')}
<h2>Syrups to make</h2>${G.syrups.map(([t,x])=>`<details><summary>${t}</summary><p>${esc(x)}</p></details>`).join('')}
<h2>Tools</h2><div class="panel">${pairs(G.tools)}</div>
<h2>Glassware</h2><div class="panel">${pairs(G.glass)}</div>
<h2>Ice</h2><div class="panel"><ul class="list">${G.ice.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div>
<h2>Techniques</h2>${G.tech.map(([t,x])=>`<details><summary>${t}</summary><p>${esc(x)}</p></details>`).join('')}
<h2>Conversions</h2><div class="panel"><ul class="ing">${G.conv.map(([a,b])=>`<li><span class="amt">${a}</span><span>${b}</span></li>`).join('')}</ul></div>`}
function more(){view.innerHTML=`<h2>Drink families</h2><p class="muted">Most cocktails are variations on a few templates. Learn these and you can improvise.</p>
${G.families.map(([t,x])=>{const n=D.filter(d=>t.startsWith(d.family.split(' ')[0])||d.family==t).length;return `<details><summary>${t}</summary><p>${esc(x)}</p></details>`}).join('')}
<h2>Glossary</h2><div class="panel"><ul class="ing">${G.gloss.map(([a,b])=>`<li><span class="amt" style="min-width:96px">${a}</span><span>${b}</span></li>`).join('')}</ul></div>
<h2>Drink responsibly</h2><div class="panel"><p style="margin-top:0">Stirred, spirit-forward drinks often contain about 2 standard drinks each. Sip slowly, alternate with water, eat something, and never drink and drive. Use rideshare or a designated driver. Raw egg whites carry a small salmonella risk; use fresh or pasteurized eggs. If you or someone you know needs help, call the SAMHSA helpline at 1-800-662-4357 (free, confidential, 24/7).</p></div>
<h2>Credits</h2><div class="panel small"><p style="margin-top:0">Drink photos courtesy of <a href="https://www.thecocktaildb.com" target="_blank" rel="noopener">TheCocktailDB.com</a>. Drinks without a verified matching photo show an illustration.</p><p>Recipes, history and guide written for this app. Origins of many cocktails are debated, so stories marked "credited" or "said to" are tradition, not proven fact.</p><p>Works offline once it's on your home screen. Favorites and bottles are stored on this device only.</p></div>`}
function render(){document.querySelectorAll('#tabs button').forEach(b=>b.classList.toggle('on',b.dataset.tab==tab));({drinks,make,bar,more})[tab]();
view.querySelectorAll('.tile').forEach(t=>t.onclick=()=>open(t.dataset.id))}
const _d=drinks,_m=make;drinks=function(){_d();view.querySelectorAll('.tile').forEach(t=>t.onclick=()=>open(t.dataset.id));const g=$('#grid');if(g)g.onclick=e=>{const t=e.target.closest('.tile');if(t)open(t.dataset.id)}};
make=function(){_m();view.querySelectorAll('.tile').forEach(t=>t.onclick=()=>open(t.dataset.id))};
document.querySelectorAll('#tabs button').forEach(b=>b.onclick=()=>{tab=b.dataset.tab;if(!sheet.hidden)history.back();render();scrollTo(0,0)});
render();const h=location.hash.slice(1);if(h&&D.find(x=>x.id==h)){history.replaceState(null,'',location.pathname);open(h)}
if('serviceWorker'in navigator)navigator.serviceWorker.register('sw.js').catch(()=>{});
window.BG={D,missing,owned};
})();
