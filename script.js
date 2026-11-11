/* GrandSlam · script.js */
const LEGAL={
legal:["Aviso legal",`<h3>Titular</h3><p>[RAZÓN SOCIAL] · [NIF/RIF/RUC] · [DIRECCIÓN] · [EMAIL DE CONTACTO].</p><h3>Objeto</h3><p>Sitio informativo de resultados, posiciones y estadísticas de béisbol.</p><h3>Contenido de demostración</h3><p>Los equipos, jugadores, marcadores, noticias, rumores y pronósticos son ficticios. No existe afiliación, patrocinio ni relación con ligas, clubes o jugadores reales.</p><h3>Propiedad intelectual</h3><p>El diseño, el código y los textos pertenecen al titular. Queda prohibida su reproducción sin autorización.</p><h3>Responsabilidad</h3><p>Los pronósticos y resúmenes generados por IA son orientativos, no garantizan resultados y no constituyen asesoramiento para apuestas.</p><h3>Legislación aplicable</h3><p>[PAÍS / JURISDICCIÓN].</p>`],
privacidad:["Política de privacidad",`<h3>Responsable</h3><p>[RAZÓN SOCIAL], [EMAIL DE CONTACTO].</p><h3>Datos que tratamos</h3><p>Este sitio no tiene registro ni formularios. Tratamos únicamente datos técnicos (IP, navegador, páginas vistas) que registra el servidor de alojamiento y, solo si aceptas la analítica, datos de uso agregados.</p><h3>Finalidad y base legal</h3><p>Operar y proteger el sitio (interés legítimo) y medir el uso (consentimiento).</p><h3>Conservación y destinatarios</h3><p>Los datos se conservan el tiempo mínimo necesario. Pueden acceder el proveedor de alojamiento y [PROVEEDOR DE ANALÍTICA].</p><h3>Tus derechos</h3><p>Puedes solicitar acceso, rectificación, supresión, oposición, limitación y portabilidad escribiendo a [EMAIL DE CONTACTO]. También puedes reclamar ante [AUTORIDAD DE PROTECCIÓN DE DATOS DE TU PAÍS].</p><h3>Menores</h3><p>El sitio no se dirige a menores de [EDAD MÍNIMA LOCAL] años.</p>`],
cookies:["Aviso de cookies",`<h3>Qué son</h3><p>Pequeños archivos o almacenamiento local que guarda tu navegador.</p><h3>Qué usamos</h3><ul><li><b>Necesarias:</b> gs-consent (almacenamiento local) guarda tu elección sobre cookies. No requiere consentimiento.</li><li><b>Analíticas:</b> solo se activan si pulsas “Aceptar todas”. Proveedor: [PROVEEDOR DE ANALÍTICA].</li></ul><h3>Cómo cambiar tu decisión</h3><p>Usa “Preferencias de cookies” al pie de la página o borra los datos del sitio en tu navegador.</p>`],
terminos:["Términos y condiciones",`<h3>Aceptación</h3><p>Al usar el sitio aceptas estos términos.</p><h3>Uso permitido</h3><p>Uso personal y no comercial. Se prohíbe la extracción masiva de datos, la ingeniería inversa y cualquier uso que perjudique el servicio.</p><h3>Contenido</h3><p>La información es de demostración y puede contener errores o retrasos. No ofrecemos apuestas ni garantías.</p><h3>Disponibilidad y cambios</h3><p>Podemos modificar o suspender el sitio y estos términos en cualquier momento.</p><h3>Limitación de responsabilidad</h3><p>En la medida permitida por la ley, no respondemos por daños derivados del uso del sitio.</p><h3>Ley aplicable</h3><p>[PAÍS / JURISDICCIÓN].</p>`]};


const $=s=>document.querySelector(s);
const TEAMS=[[1,"Tiburones de Neo-Guayana","TNG"],[2,"Centinelas de Capital","CC"],[3,"Leones del Valle","LV"],[4,"Águilas del Litoral","AL"],[5,"Bravos del Puerto","BP"],[6,"Cóndores del Sur","CS"]].map(([id,n,a])=>({id,n,a}));
const T=id=>TEAMS.find(t=>t.id===id);
const F=["Carlos","Anthony","Luis","Diego","Mateo","Jhonny","Ender","Rafael","Kevin","Omar","Félix","Andrés","Héctor"];
const L=["Mendoza","Pérez","Quintero","Salazar","Rivas","Arteaga","Colmenares","Ocando","Bastidas","Zambrano","Duarte","Linares","Villasmil","Peña","Rojas","Ledezma","Camacho","Ibarra","Navas","Torrealba"];
const PL=["C","1B","2B","3B","SS","LF","CF","RF","BD","P","UT","UT","UT"];
const ALL=[];const R={};
TEAMS.forEach((t,i)=>{R[t.id]=PL.map((pos,j)=>{const s=i*17+j*13,avg=.23+(s*7%90)/1000,era=2.1+(s%32)/10;
 const p={id:t.id*100+j,t:t.id,pos,start:j<10,name:(i===0&&j===0)?"Carlos “El Rayo” Mendoza":F[(j+i)%13]+" "+L[(i*7+j*3)%20],
 avg,obp:avg+.065+(s%25)/1000,slg:avg+.14+(s*3%90)/1000,hr:s%27,rbi:18+s*5%70,era,whip:.95+(s%40)/100,fip:era+((s%7)-3)/10,rookie:j>=10};
 ALL.push(p);return p})});
const byId=id=>ALL.find(p=>p.id===id);
const f3=n=>n.toFixed(3).replace(/^0/,""),f2=n=>n.toFixed(2);
const ops=p=>p.obp+p.slg;
const bats=ALL.filter(p=>p.pos!=="P"),pits=ALL.filter(p=>p.pos==="P");
const av=(t,g)=>`<span class="av ${g?"g":""}" aria-hidden="true">${t.a}</span>`;
const tbl=(h,rows,cls)=>`<div style="overflow-x:auto"><table class="tbl ${cls||""}"><tr>${h.map(x=>`<th>${x}</th>`).join("")}</tr>${rows.join("")}</table></div>`;

/* Calendario (datos estáticos) */
const JN=[...Array(10)].map((_,i)=>["J"+(i+1),"Jornada "+(i+1)]).concat([["SF","Semifinal"],["F","Final"]]);
const PAIRS=(()=>{let t=[1,2,3,4,5,6];const a=[];for(let r=0;r<5;r++){a.push([0,1,2].map(i=>r%2?[t[5-i],t[i]]:[t[i],t[5-i]]));t=[t[0],t[5],t[1],t[2],t[3],t[4]]}return a.concat(a.map(m=>m.map(([h,x])=>[x,h]))).concat([[[1,5],[3,2]],[[1,3]]])})();
const sched=PAIRS.map((m,j)=>m.map(([h,a],k)=>{const st=j<5||(j===5&&k===1)?"fin":(j===5&&k===0)?"live":"prog";let hs=(j*3+k*2+2)%8;const as=(j*2+k*3+1)%7;if(hs===as)hs++;
 return{di:j,k,h,a,st,hs:st==="prog"?0:hs,as:st==="prog"?0:as,inn:st==="live"?6:9,hora:["13:00","16:00","19:30"][k]}}));
const flat=sched.flat();
const sp=t=>R[t].find(p=>p.pos==="P");
const EV=["sencillo al jardín central","ponche (3 strikes)","elevado al jardín derecho, out","doble por la banda izquierda","rodado al campocorto, out","base por bolas","jonrón por el jardín izquierdo","línea al tercera base, out"];
const bat=(t,n)=>R[t].filter(p=>p.start&&p.pos!=="P")[n%9];
function plays(g){const n=g.st==="prog"?0:g.inn,o=[];
 for(let i=1;i<=n;i++)for(const top of[1,0]){if(!top&&g.st==="live"&&i===n)continue;const t=top?g.a:g.h,b=bat(t,i*2+(top?0:1));
  o.push(`<small>${top?"Alta":"Baja"} ${i} · ${T(t).a}</small>${b.name}: ${EV[(g.k+i*3+(top?1:4))%8]}`)}
 return (g.sim||[]).concat(o.reverse())}
function recap(g){if(g.st==="prog")return"";const w=g.hs>g.as?g.h:g.a,l=w===g.h?g.a:g.h,s=bat(w,g.k+g.di),ws=Math.max(g.hs,g.as),ls=Math.min(g.hs,g.as);
 return `<div class="card glass ai"><span class="tg">IA</span><b>${g.st==="live"?"Resumen parcial":"Resumen del partido"}</b><p>${T(w).n} ${g.st==="live"?"domina":"se impuso"} ${ws}-${ls} a ${T(l).n}${g.st==="live"?" en la entrada "+g.inn:""}. Destacó ${s.name} (AVG ${f3(s.avg)}, OPS ${f3(ops(s))}) y el abridor ${sp(w).name} aportó con ERA de ${f2(sp(w).era)} en la temporada. Generado desde el boxscore.</p></div>`}

/* Campo */
const SPOT={P:[200,232],C:[200,335],"1B":[300,225],"2B":[250,165],"3B":[100,225],SS:[150,165],LF:[75,100],CF:[200,55],RF:[325,100],BD:[352,300]};
function field(pl){return `<svg class="dia" viewBox="0 0 400 370" role="img" aria-label="Cuadro de béisbol"><path d="M200 345L20 150A260 260 0 0 1 380 150z" fill="rgba(255,255,255,.07)" stroke="rgba(255,255,255,.35)"/><path d="M200 305L295 215 200 125 105 215z" fill="rgba(254,203,2,.14)" stroke="#fecb02" stroke-width="2"/><circle cx="200" cy="215" r="48" fill="none" stroke="rgba(255,255,255,.25)"/>${[[295,215],[200,125],[105,215]].map(([x,y])=>`<rect x="${x-7}" y="${y-7}" width="14" height="14" transform="rotate(45 ${x} ${y})" fill="#fff"/>`).join("")}<path d="M200 296l9 9-9 9-9-9z" fill="#fff"/>`+
 pl.map(p=>{const[x,y]=SPOT[p.pos],ln=p.name.replace(/“.*”\s/,"").split(" ").slice(-1)[0];return `<g class="pl" tabindex="0" role="button" data-p="${p.id}" aria-label="${p.pos} ${p.name}"><circle cx="${x}" cy="${y}" r="16"/><text class="pos" x="${x}" y="${y+4}">${p.pos}</text><text class="nm" x="${x}" y="${y+32}">${ln}</text></g>`}).join("")+"</svg>"}
function pcard(p){return `<div class="pcard"><b>${p.name}</b><br>${p.pos==="P"?`ERA ${f2(p.era)} · WHIP ${f2(p.whip)} · FIP ${f2(p.fip)}`:`${p.pos} · AVG ${f3(p.avg)} · OBP ${f3(p.obp)} · SLG ${f3(p.slg)} · HR ${p.hr} · CI ${p.rbi}`}</div>`}
const fieldBox=pl=>`<div class="field"><div class="glass panel">${field(pl)}</div><div class="glass panel"><h2>Jugador</h2><div id="pc"><p style="color:var(--soft)">Toca un jugador del cuadro.</p></div></div></div>`;
document.addEventListener("click",e=>{const g=e.target.closest(".pl");if(!g)return;document.querySelectorAll(".pl").forEach(x=>x.classList.toggle("on",x===g));$("#pc").innerHTML=pcard(byId(+g.dataset.p))});
document.addEventListener("keydown",e=>{if(e.key==="Enter")e.target.closest?.(".pl")?.click()});

/* Estado */
let tab="live",dayI=5,game=null,gtab="game",gsub="field",gteam=null,stPh="reg",sub="pos",posSel="C",dtMode="mes";
const chips=(arr,cur,key)=>`<div class="sel">${arr.map(([v,l])=>`<button class="chip" aria-pressed="${v==cur}" data-${key}="${v}">${l}</button>`).join("")}</div>`;

/* Marcadores */
const h12=s=>{const[H,M]=s.split(":").map(Number);return(H%12||12)+":"+String(M).padStart(2,"0")+(H<12?" AM":" PM")};
const sfx=n=>n%100>=11&&n%100<=13?"TH":({1:"ST",2:"ND",3:"RD"})[n%10]||"TH";
const bsv=b=>{const c=i=>b&&b[i]?"#eeff00":"#5b5b5b";return `<svg class="bases" viewBox="0 0 64 64" aria-hidden="true"><path d="M32 1L63 32L32 63L1 32z" fill="#000"/><rect x="24" y="7" width="16" height="16" transform="rotate(45 32 15)" fill="${c(1)}"/><rect x="7" y="24" width="16" height="16" transform="rotate(45 15 32)" fill="${c(2)}"/><rect x="41" y="24" width="16" height="16" transform="rotate(45 49 32)" fill="${c(0)}"/><path d="M25 45h14v6l-7 6-7-6z" fill="#7a7a7a"/></svg>`};
const tri=top=>`<svg class="tri" viewBox="0 0 9 15" aria-hidden="true"><path d="M4.5 0L9 7H0z" fill="${top?"#fff":"#6b6b6b"}"/><path d="M4.5 15L0 8h9z" fill="${top?"#6b6b6b":"#fff"}"/></svg>`;
function gcard(g,det){const h=T(g.h),a=T(g.a),pr=g.st==="prog",lv=g.st==="live",tg=det?"div":"button",sc=x=>pr?"–":x;
 const mid=bsv(lv?g.bs:null)+(lv?`<div class="cnt">${g.b||0}-${g.s||0}</div><div class="inn">${tri(g.top)}<b>${g.inn}</b><sup>${sfx(g.inn)}</sup></div><div class="outs" aria-label="${g.outs} outs">${[0,1,2].map(i=>`<i class="${i<g.outs?"on":""}"></i>`).join("")}</div>`:`<div class="cnt sm">${pr?h12(g.hora):"FINAL"}</div>`);
 return `<${tg} class="gw${lv?" live":""}"${det?"":` data-g="${g.di}-${g.k}"`}><div class="gcd"><span class="lg l"><b>${h.a}</b></span><span class="lg r"><b>${a.a}</b></span><div class="mid"><span>${sc(g.hs)}</span><span>${sc(g.as)}</span></div>${mid}</div><div class="gmeta"><span class="tn">${h.n} vs ${a.n}</span><span>${JN[g.di][1]} · ${h12(g.hora)} · <span class="tag ${lv?"":"off"}">${lv?"En vivo · entrada "+g.inn:g.st==="fin"?"Final":h12(g.hora)}</span> ${pr?"Abren: "+sp(g.a).name.split(" ").pop()+" / "+sp(g.h).name.split(" ").pop():"Ver detalle"}</span></div></${tg}>`}
function viewLive(){if(game)return viewGame();
 const dy=JN.map(([c,l],i)=>`<button class="day${i>9?" fase":""}" aria-pressed="${i===dayI}" data-d="${i}" aria-label="${l}">${i<10?`<span>Jor.</span><b>${i+1}</b>`:i===10?`<span>SEMI</span><span>FINAL</span>`:`<span>FINAL</span>`}</button>`).join("");
 return `<div class="days">${dy}</div><h2 class="dh">${dayI<10?"Ronda regular · Jornada "+(dayI+1)+" de 10":JN[dayI][1]}</h2><div class="games">${sched[dayI].map(g=>gcard(g)).join("")}</div>`}
const linescore=g=>{const pr=g.st==="prog",n=Math.max(7,g.inn||0),pl=Math.min(pr?0:(g.inn||7),n),
 row=(tot,seed)=>{const r=Array(n).fill("");for(let i=0;i<pl;i++)r[i]=0;for(let k=0;k<tot&&pl;k++)r[(seed*7+k*5+k*k)%pl]++;return r},
 line=(l,r,t)=>`<div class="lr"><span class="lb">${l}</span>${r.map(x=>`<span>${x}</span>`).join("")}<span class="tt2">${pr?"":t}</span></div>`;
 return `<div class="ls" style="--n:${n}"><div class="lr hd"><span class="lb"></span>${[...Array(n)].map((_,i)=>`<span>${i+1}</span>`).join("")}<span class="tt2">T</span></div>${line("Local",row(g.hs,g.di+g.k),g.hs)}${line("Visitante",row(g.as,g.di*3+g.k+1),g.as)}</div>`};
const tbar=(arr,cur,key,cls)=>`<div class="${cls}">${arr.map(([v,l])=>`<button aria-pressed="${v==cur}" data-${key}="${v}">${l}</button>`).join("")}</div>`;
const hsh=(...a)=>a.reduce((s,x)=>(s*31+x*17+7)%100003,11);
function boxscore(g){const o={};
 [g.h,g.a].forEach((t,ti)=>{const rs=ti?g.as:g.hs,L=R[t].filter(p=>p.start&&p.pos!=="P").map((p,i)=>{const s=hsh(g.di,g.k,t,i);return{p,ab:Math.round(g.inn*.45)+(s%2)+(i<5?1:0),r:0,h:(s%3===0?1:0)+(s%11===0?1:0),rbi:0,bb:s%7===0?1:0,so:s%5===0?1:0}});
  for(let k=0;k<rs;k++){const i=hsh(g.di,g.k,t,k+50)%L.length,j=(i+3+k)%L.length;L[i].r++;L[j].rbi++;L[i].h=Math.max(L[i].h,1);L[j].h=Math.max(L[j].h,1)}
  L.forEach(b=>{b.ab=Math.max(b.ab,b.h+b.so)});o[t]={bat:L,runs:rs}});
 [[g.h,g.a],[g.a,g.h]].forEach(([t,u])=>{const O=o[u].bat,sum=k=>O.reduce((s,x)=>s+x[k],0),tot={h:sum("h"),r:o[u].runs,bb:sum("bb"),so:sum("so")},n=Math.max(3,g.st==="live"?g.inn-1:g.inn),rel=g.inn>=7?R[t].find(p=>!p.start):null,ipS=rel?n-2:n,
  mk=(p,ip,f)=>({p,ip,h:Math.floor(tot.h*f),r:Math.floor(tot.r*f),bb:Math.floor(tot.bb*f),so:Math.floor(tot.so*f)}),s=mk(sp(t),ipS,ipS/n),P=[s];
  if(rel){const r=mk(rel,2,1);["h","r","bb","so"].forEach(k=>r[k]=tot[k]-s[k]);P.push(r)}
  P.forEach(x=>x.er=Math.max(0,x.r-(x.r>3?1:0)));o[t].pit=P});
 return o}
function statsView(g,t){if(g.st==="prog")return `<div class="glass panel"><p style="color:var(--soft)">Las estadísticas del partido aparecerán cuando comience el juego.</p></div>`;
 const b=boxscore(g)[t],S=k=>b.bat.reduce((s,x)=>s+x[k],0);
 return `<div class="glass panel"><h2>Bateadores · ${T(t).n}</h2>`+tbl(["Jugador","Pos","VB","C","H","CI","BB","K"],b.bat.map(x=>`<tr><td>${x.p.name}</td><td>${x.p.pos}</td><td>${x.ab}</td><td>${x.r}</td><td>${x.h}</td><td>${x.rbi}</td><td>${x.bb}</td><td>${x.so}</td></tr>`).concat(`<tr class="tot"><td>Total</td><td></td><td>${S("ab")}</td><td>${S("r")}</td><td>${S("h")}</td><td>${S("rbi")}</td><td>${S("bb")}</td><td>${S("so")}</td></tr>`))+`</div><div class="glass panel" style="margin-top:14px"><h2>Pitchers · ${T(t).n}</h2>`+tbl(["Pitcher","IL","H","C","CL","BB","K"],b.pit.map(x=>`<tr><td>${x.p.name}</td><td>${x.ip}.0</td><td>${x.h}</td><td>${x.r}</td><td>${x.er}</td><td>${x.bb}</td><td>${x.so}</td></tr>`))+`</div>`}
function changes(g){const o=[];if(g.st==="prog")return o;
 [g.h,g.a].forEach(t=>{const bn=R[t].filter(p=>!p.start),sts=R[t].filter(p=>p.start&&p.pos!=="P"),A=T(t).a;
  if(g.inn>=7&&bn[0])o.push([g.inn-1,`${A}: entra ${bn[0].name} a lanzar por ${sp(t).name}`]);
  if(g.inn>=5&&bn[1]&&sts[2])o.push([g.inn-4,`${A}: ${bn[1].name} batea por ${sts[2].name}`]);
  if(g.inn>=8&&bn[2]&&sts[5])o.push([g.inn-1,`${A}: ${bn[2].name} entra como corredor emergente por ${sts[5].name}`])});
 return o.sort((a,b)=>a[0]-b[0])}
function h2h(g){let w=0,l=0,rf=0,ra=0;const rows=flat.filter(x=>!(x.di===g.di&&x.k===g.k)&&x.st==="fin"&&[x.h,x.a].includes(g.h)&&[x.h,x.a].includes(g.a)).map(x=>{const a=x.h===g.h?x.hs:x.as,b=x.h===g.h?x.as:x.hs;a>b?w++:l++;rf+=a;ra+=b;return `<li><span>${JN[x.di][1]}</span><b>${T(g.h).a} ${a} - ${b} ${T(g.a).a}</b></li>`});return{w,l,rf,ra,rows}}
function dataView(g){const ch=changes(g),hh=h2h(g),soft=t=>`<p style="color:var(--soft)">${t}</p>`;
 return `<div class="glass panel"><h2>Cambios</h2>${ch.length?`<ul class="feed">${ch.map(([i,t])=>`<li><b>Entrada ${i}</b> · ${t}</li>`).join("")}</ul>`:soft(g.st==="prog"?"Aún no hay cambios: el juego no ha comenzado.":"Sin cambios registrados.")}</div>
 <div class="glass panel" style="margin-top:14px"><h2>Récord de enfrentamientos</h2>${hh.rows.length?`<div class="h2h"><span>${T(g.h).n}</span><b>${hh.w} - ${hh.l}</b><span>${T(g.a).n}</span></div>${soft("Carreras entre ambos: "+hh.rf+" - "+hh.ra)}<ul class="feed">${hh.rows.join("")}</ul>`:soft("Primer enfrentamiento entre ambos equipos esta temporada.")}</div>`}
function viewGame(){const g=game;gteam=gteam||g.h;
 const tm=T(gteam),tt=tbar([[g.h,"Local"],[g.a,"Visitante"]],gteam,"gt","tt"),st=R[gteam].filter(p=>p.start);let body="";
 if(gtab==="game"){const lu=`<div class="glass panel"><h2>${tm.n}</h2><ol style="padding-left:20px;display:grid;gap:6px">${st.filter(p=>p.pos!=="P").map(p=>`<li><b>${p.pos}</b> · ${p.name}</li>`).join("")}</ol><p style="margin-top:10px;color:var(--soft)">Abridor: <b style="color:var(--white)">${sp(gteam).name}</b></p></div>`;
  body=linescore(g)+tt+tbar([["field","Cuadro"],["lineup","Lineup"]],gsub,"gs","gs")+`<div class="gb">${gsub==="field"?fieldBox(st):lu}</div><div class="gb" style="margin-top:14px">${g.st==="prog"?forecast(g):recap(g)+`<div class="glass panel"><h2>Jugadas</h2><ul class="feed">${plays(g).map(t=>`<li>${t}</li>`).join("")}</ul></div>`}</div>`}
 if(gtab==="stats")body=tt+`<div class="gb">${statsView(g,gteam)}</div>`;
 if(gtab==="data")body=`<div class="gb">${dataView(g)}</div>`;
 return `<div class="dv"><button class="back bk" data-back aria-label="Volver a marcadores">←</button>${gcard(g,1)}`+tbar([["game","Juego"],["stats","Estadística"],["data","Datos"]],gtab,"gtab","gtabs")+body+`</div>`}
function forecast(g){const p=45+(g.h*7+g.a*3)%26;return `<div class="card glass ai"><span class="tag">IA</span><b>Pronóstico</b><p>${T(g.h).n} ${p}% · ${T(g.a).n} ${100-p}%. Abridores: ${sp(g.h).name} (ERA ${f2(sp(g.h).era)}) vs ${sp(g.a).name} (ERA ${f2(sp(g.a).era)}). ${JN[g.di][1]} · ${g.hora}.</p><div class="bar"><i style="width:${p}%"></i></div></div>`}

/* Posiciones */
const STAND={reg:TEAMS.map((t,i)=>[t.id,40-i*5-i%2,20+i*5+i%2]),semi:[[1,6,3],[3,5,4],[2,3,6],[5,2,7]],fin:[[1,3,2],[3,2,3]]};
function viewStand(){return chips([["reg","Ronda regular"],["semi","Semifinal"],["fin","Final"]],stPh,"ph")+`<div class="glass panel">`+`<table class="stand"><tr><th>#</th><th>Equipo</th><th>G</th><th>P</th><th>PCT</th></tr>${STAND[stPh].map(([id,w,l],i)=>`<tr><td>${i+1}</td><td><span class="t">${av(T(id),i===0)}${T(id).n}</span></td><td>${w}</td><td>${l}</td><td>${f3(w/(w+l))}</td></tr>`).join("")}</table></div>`}

/* Estadísticas */
const topN=(arr,k,asc,n=5)=>[...arr].sort((a,b)=>asc?a[k]-b[k]:b[k]-a[k]).slice(0,n);
const lead=(title,arr,k,asc,fm)=>`<div class="glass panel"><h2>${title}</h2>`+tbl(["Jugador","Eq.",k.toUpperCase()],topN(arr,k,asc).map(p=>`<tr><td>${p.name}</td><td>${T(p.t).a}</td><td>${fm(p[k])}</td></tr>`))+`</div>`;
function viewPos(){const ps=["C","1B","2B","3B","SS","LF","CF","RF","BD","P"],list=ALL.filter(p=>p.pos===posSel&&p.start);
 const aw=[["MVP",topN(bats,"avg",0,1)[0]&&[...bats].sort((a,b)=>ops(b)-ops(a))[0]],["Bate de Plata",topN(bats,"avg",0,1)[0]],["Guante de Oro",ALL.filter(p=>p.pos==="SS")[2]],["Novato del Año",ALL.filter(p=>p.rookie).sort((a,b)=>ops(b)-ops(a))[0]],["Catcher Defensivo",ALL.filter(p=>p.pos==="C")[4]]];
 return chips(ps.map(x=>[x,x]),posSel,"ps")+`<div class="glass panel" style="margin-bottom:16px"><h2>${posSel==="P"?"Pitcher":"Posición "+posSel}: titulares por equipo</h2>`+(posSel==="P"?tbl(["Jugador","Eq.","ERA","WHIP","FIP"],list.sort((a,b)=>a.era-b.era).map(p=>`<tr><td>${p.name}</td><td>${T(p.t).a}</td><td>${f2(p.era)}</td><td>${f2(p.whip)}</td><td>${f2(p.fip)}</td></tr>`)):tbl(["Jugador","Eq.","AVG","OBP","SLG"],list.sort((a,b)=>b.avg-a.avg).map(p=>`<tr><td>${p.name}</td><td>${T(p.t).a}</td><td>${f3(p.avg)}</td><td>${f3(p.obp)}</td><td>${f3(p.slg)}</td></tr>`)))+`</div><div class="cols">${lead("Líderes AVG",bats,"avg",0,f3)}${lead("Líderes OBP",bats,"obp",0,f3)}${lead("Líderes SLG",bats,"slg",0,f3)}${lead("Picheo ERA",pits,"era",1,f2)}${lead("Picheo WHIP",pits,"whip",1,f2)}${lead("Picheo FIP",pits,"fip",1,f2)}</div><div class="glass panel" style="margin-top:16px"><h2>Premios y reconocimientos</h2>`+tbl(["Premio","Ganador","Eq."],aw.map(([n,p])=>`<tr><td>${n}</td><td>${p.name}</td><td>${T(p.t).a}</td></tr>`))+`</div>`}
const NEWS=[["Los Tiburones aseguran el primer lugar","Con una racha de ocho victorias, Neo-Guayana llega a la semifinal como líder de la ronda regular."],["Abridor de Leones lanza siete entradas en blanco","Anthony Pérez dominó la ofensiva rival con nueve ponches y ninguna base por bolas."],["Novato de Cóndores del Sur sorprende con 12 jonrones","El jardinero lidera a los debutantes y compite por el premio Novato del Año."],["Centinelas de Capital refuerza su bullpen","El cuerpo técnico anunció cambios en la rotación para la fase final."]];
const TX=[["Firma","Bravos del Puerto firman al relevista Héctor Villasmil por dos temporadas."],["Cambio","Águilas del Litoral envían al segunda base Diego Salazar a Leones del Valle por dos prospectos."],["Rumor","Se menciona a Carlos “El Rayo” Mendoza como objetivo de Centinelas de Capital para la próxima temporada."],["Contratación","Cóndores del Sur incorporan un nuevo coach de bateo para la serie final."],["Rumor","Fuentes cercanas indican que Tiburones buscan un cerrador antes de la final."]];
const viewNews=()=>`<div class="cols"><div>${NEWS.map(([t,x])=>`<div class="glass card"><h3>${t}</h3><p>${x}</p></div>`).join("")}</div><div class="glass panel"><h2>Transacciones y rumores</h2><ul class="feed" style="max-height:none">${TX.map(([t,x])=>`<li><span class="tg">${t}</span>${x}</li>`).join("")}</ul></div></div>`;
const viewAI=()=>flat.filter(g=>g.st!=="fin").slice(0,6).map(g=>forecast(g)).join("")||"<p>No hay partidos próximos.</p>";
function viewDream(){const mk=(p,s)=>(dtMode==="mes"?p.id*7%5/50:0)+(p.pos==="P"?(5-p.era)/5:ops(p)),
 team=["C","1B","2B","3B","SS","LF","CF","RF","BD","P"].map(pos=>ALL.filter(p=>p.pos===pos&&p.start).sort((a,b)=>mk(b)-mk(a))[0]);
 return chips([["mes","Mejor del mes"],["año","Mejor del año"]],dtMode,"dt")+fieldBox(team)+`<p style="color:var(--soft);margin-top:10px">Ranking ponderado: OPS para bateadores y ERA para el pitcher${dtMode==="mes"?", con peso extra al rendimiento reciente":""}.</p>`}
function viewStats(){const s=[["pos","Por posición"],["dream","Dream Team"]];
 return chips(s,sub,"sb")+({pos:viewPos,dream:viewDream})[sub]()}
let nsub="news";
function viewNewsTab(){return chips([["news","Noticias y rumores"],["ai","Pronóstico IA"]],nsub,"ns")+(nsub==="ai"?viewAI():viewNews())}

function render(){$("#main").innerHTML=page?viewPage():({live:viewLive,stand:viewStand,stats:viewStats,news:viewNewsTab})[tab]();
 const st=document.querySelector(".days"),b=st&&st.querySelector("[aria-pressed=true]");if(b)st.scrollLeft=b.offsetLeft-st.clientWidth/2+b.offsetWidth/2}
$("#main").addEventListener("click",e=>{const c=e.target.closest("[data-g],[data-d],[data-back],[data-gtab],[data-gt],[data-gs],[data-ph],[data-sb],[data-ps],[data-dt],[data-ns]");if(!c)return;const d=c.dataset;
 if(d.g){location.hash="juego-"+d.g;return}
 else if("back"in d){location.hash="";return}else if(d.d)dayI=+d.d;else if(d.gtab)gtab=d.gtab;else if(d.gt)gteam=+d.gt;else if(d.gs)gsub=d.gs;
 else if(d.ph)stPh=d.ph;else if(d.sb)sub=d.sb;else if(d.ps)posSel=d.ps;else if(d.dt)dtMode=d.dt;else if(d.ns)nsub=d.ns;
 render()});
function pill(){const b=$('#tabs [aria-selected="true"]'),p=$("#pill");p.classList.add("go");p.style.left=b.offsetLeft+"px";p.style.width=b.offsetWidth+"px";setTimeout(()=>p.classList.remove("go"),550)}
$("#tabs").onclick=e=>{const b=e.target.closest("button");if(!b)return;document.querySelectorAll("#tabs button").forEach(x=>x.setAttribute("aria-selected",x===b));tab=b.dataset.t;game=null;if(location.hash)location.hash="";else{render();pill()}};
/* Simulación momentánea del partido en vivo (reemplazable por datos reales) */
/* Marcadores en vivo desde Supabase */
const SB_URL="https://sjxyomevqmnufqmthwuh.supabase.co";
const SB_KEY="sb_publishable_FJIJNZFbcUw6A2dKw4e06Q_GMf9oUPu";
const sb=window.supabase.createClient(SB_URL,SB_KEY);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"})[c]);

// valores por defecto del partido en vivo (antes de que llegue el dato)
flat.filter(g=>g.st==="live").forEach(g=>{g.top=false;g.outs=0;g.sim=[];g.b=0;g.s=0;g.bs=[false,false,false]});

function aplicar(r){
 const g=flat.find(x=>x.di===r.di&&x.k===r.k);if(!g)return;
 const antes=g.hs+g.as;
 g.hs=r.carreras_local;g.as=r.carreras_visitante;g.inn=r.entrada;
 g.top=r.mitad==="alta";g.outs=r.outs;g.b=r.balls;g.s=r.strikes;
 g.bs=r.bases;g.st=r.estado;g.sim=(r.jugadas||[]).map(esc);
 if(!page&&tab==="live"&&!(game&&gtab==="game"&&gsub==="field")){
  render();
  if(g.hs+g.as>antes)document.querySelector(`[data-g="${g.di}-${g.k}"]`)?.classList.add("bump");
 }
}

sb.from("juegos").select("*").then(({data})=>(data||[]).forEach(aplicar));
sb.channel("juegos-live")
 .on("postgres_changes",{event:"*",schema:"public",table:"juegos"},p=>p.new&&aplicar(p.new))
 .subscribe();
let page=null;
function viewPage(){const b='<button class="back" data-back>← Volver al inicio</button>';
 return page==="404"?b+'<div class="glass panel"><h2>404 · Jugada fuera del cuadro</h2><p style="color:var(--soft)">La página que buscas no existe o cambió de lugar. Vuelve al inicio para seguir los marcadores.</p></div>':b+`<div class="glass panel legal"><h2>${LEGAL[page][0]}</h2>${LEGAL[page][1]}</div>`}
function route(){const hs=location.hash.slice(1),m=/^juego-(\d+)-(\d)$/.exec(hs),g=m&&sched[+m[1]]&&sched[+m[1]][+m[2]];
 page=g||!hs?null:(LEGAL[hs]?hs:"404");
 if(g){if(game!==g){game=g;gtab="game";gsub="field";gteam=null}tab="live";scrollTo(0,0)}else{game=null;if(page)scrollTo(0,0)}
 $("#tabs").hidden=!!(game||page);document.body.classList.toggle("detail",!!game);document.querySelectorAll("#tabs button").forEach(x=>x.setAttribute("aria-selected",x.dataset.t===tab));
 document.title=page?(page==="404"?"Página no encontrada":LEGAL[page][0])+" · GrandSlam":"GrandSlam · Resultados y estadísticas de béisbol";
 render();if(!game&&!page)pill()}
const getC=()=>{try{return localStorage.getItem("gs-consent")}catch(e){return null}};
function loadAnalytics(){/* Conecta aquí tu analítica (GA4, Plausible…) con tu ID. Solo se ejecuta con consentimiento. */}
function setC(v){try{localStorage.setItem("gs-consent",v)}catch(e){}$("#ck").hidden=true;if(v==="all")loadAnalytics()}
$("#ck").onclick=e=>{if(e.target.dataset.c)setC(e.target.dataset.c)};$("#ckp").onclick=()=>{$("#ck").hidden=false};
$("#ck").hidden=!!getC();if(getC()==="all")loadAnalytics();
addEventListener("hashchange",route);route();addEventListener("resize",pill);document.fonts?.ready.then(pill);
