/* Atlas ENEM 2027 — aplicação client-side */
(() => {
  "use strict";
  const STORAGE_KEY = "atlas-enem-2027-v1";
  const WEEKS=44,WEEKLY_GOAL=315,BLOCKS_PER_WEEK=18,ANNUAL_GOAL=WEEKS*WEEKLY_GOAL;
  const MONTHS = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro"];
  const SHORT_MONTHS = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov"];
  const DAYS = ["Segunda-feira","Terça-feira","Quarta-feira","Quinta-feira","Sexta-feira","Sábado"];
  const SUBJECTS = ["Biologia","Química","Física","Matemática","História","Geografia","Filosofia","Sociologia","Linguagens"];
  const REASONS = ["Lacuna Teórica","Falta de Atenção","Interpretação de Texto","Gestão de Tempo","Erro de Cálculo"];
  const SUBJECT_COLORS = {"Biologia":"#38a884","Química":"#9b83e8","Física":"#e5a64b","Matemática":"#4c87dc","História":"#d17b68","Geografia":"#42a5a0","Filosofia":"#8c91a8","Sociologia":"#c17db2","Linguagens":"#6f80d9"};
  const $ = id => document.getElementById(id);
  let state, chart, toastTimer, currentMonth = 0, currentWeek = 1;

  // 18 blocos semanais com maior peso para Natureza e Matemática.
  const DISTRIBUTION = [
    ["Biologia","Química","Matemática"],["Física","Linguagens","Biologia"],
    ["Matemática","Química","História"],["Biologia","Física","Geografia"],
    ["Matemática","Química","Linguagens"],["Biologia","Física","Sociologia"]
  ];
  const TOPICS = {
    "Biologia":["Ecologia e impactos ambientais","Citologia e metabolismo","Genética e biotecnologia","Fisiologia humana","Evolução e origem da vida","Botânica e zoologia"],
    "Química":["Ligações químicas e polaridade","Estequiometria","Soluções e concentração","Química orgânica","Eletroquímica","Química ambiental"],
    "Física":["Cinemática e dinâmica","Trabalho e energia","Eletricidade","Ondulatória","Termologia","Óptica"],
    "Matemática":["Razão, proporção e porcentagem","Funções e gráficos","Estatística","Geometria plana","Geometria espacial","Probabilidade"],
    "História":["Brasil Colônia e Império","República brasileira","Era Vargas e Ditadura","História geral: Antiguidade","Idade Moderna e Contemporânea","Movimentos sociais"],
    "Geografia":["Cartografia e escala","Clima e vegetação","Geopolítica","Urbanização","Agropecuária e energia","Globalização"],
    "Filosofia":["Ética e política","Filosofia antiga","Conhecimento e ciência","Filosofia moderna","Filosofia contemporânea","Filosofia brasileira"],
    "Sociologia":["Cultura e identidade","Trabalho e sociedade","Cidadania e movimentos sociais","Desigualdade social","Poder e Estado","Pensamento sociológico"],
    "Linguagens":["Interpretação textual","Gêneros textuais","Variação linguística","Artes e literatura","Funções da linguagem","Língua estrangeira"]
  };

  function createWeek(globalWeek) {
    const monthIndex = Math.floor((globalWeek - 1) / 4);
    const weekInMonth = ((globalWeek - 1) % 4) + 1;
    const days = DAYS.map((day, dayIndex) => ({
      name: day,
      blocks: DISTRIBUTION[dayIndex].map((subject, blockIndex) => ({
        subject, topic: TOPICS[subject][(globalWeek + dayIndex + blockIndex - 1) % TOPICS[subject].length],
        completed: false, questions: 0, correct: 0
      }))
    }));
    return { number: globalWeek, month: monthIndex, weekInMonth, days, essayDone: false, essayScore: "", simulationDone: false };
  }
  function createInitialState() {
    return {version:2,theme:"light",weeks:Array.from({length:WEEKS},(_,i)=>createWeek(i+1)),simulations:[],errors:[],v2:null};
  }
  function createDemoState() {
    const weeks = Array.from({length:WEEKS},(_,i)=>createWeek(i+1));
    // Dados fictícios pequenos para que o painel tenha conteúdo demonstrativo.
    weeks[0].days[0].blocks[0] = {...weeks[0].days[0].blocks[0], questions:25, correct:19, completed:true};
    weeks[0].days[0].blocks[2] = {...weeks[0].days[0].blocks[2], questions:20, correct:15};
    weeks[0].days[1].blocks[0] = {...weeks[0].days[1].blocks[0], questions:18, correct:13, completed:true};
    weeks[0].essayDone = true; weeks[0].essayScore = 820;
    weeks[1].days[0].blocks[0] = {...weeks[1].days[0].blocks[0], questions:30, correct:23, completed:true};
    weeks[1].days[2].blocks[0] = {...weeks[1].days[2].blocks[0], questions:22, correct:17};
    weeks[1].essayDone = true; weeks[1].essayScore = 860; weeks[1].simulationDone = true;
    return {
      version:1, theme:"light", weeks,
      simulations:[
        {id:"demo-sas",name:"SAS — Diagnóstico 01",month:0,lang:31,hum:34,nat:25,math:29,essay:820,notes:"Exemplo demonstrativo. Revisar interpretação em Natureza.",createdAt:"2027-01-18",tri:{lang:{easy:23,hard:3},hum:{easy:25,hard:4},nat:{easy:15,hard:3},math:{easy:18,hard:4}}},
        {id:"demo-enem",name:"ENEM PPL — Treino",month:1,lang:34,hum:36,nat:29,math:32,essay:860,notes:"Exemplo demonstrativo. Boa gestão de tempo.",createdAt:"2027-02-08",tri:{lang:{easy:26,hard:4},hum:{easy:29,hard:4},nat:{easy:21,hard:3},math:{easy:25,hard:4}}}
      ],
      errors:[
        {id:"demo-error",subject:"Química",reason:"Lacuna Teórica",description:"Confundi ligação iônica com covalente. Revisão: ligação iônica envolve transferência de elétrons, geralmente entre metal e ametal; a covalente envolve compartilhamento.",mastered:false,createdAt:"2026-11-19",review:{stage:0,nextDue:"2026-11-20",history:[]}}
      ],
      v2:{version:2,xp:640,studyMinutes:510,rankHistory:[],xpLedger:{},adaptiveTargets:{},studyBySubject:{"Biologia":120,"Química":150,"Matemática":90,"Física":90,"Linguagens":60},lastActivityDate:"2026-11-20",rankWeights:{accuracy:35,consistency:25,simScore:15,simEvolution:10,done:10,essays:5}}
    };
  }
  function loadState() {
    let raw=null;
    try {
      raw=localStorage.getItem(STORAGE_KEY);
      if(raw){const parsed=JSON.parse(raw); if(parsed&&(parsed.version===1||parsed.version===2)) return sanitizeState(parsed);}
    } catch(e){
      console.warn("Falha ao ler dados locais",e);
      try{if(raw)localStorage.setItem(STORAGE_KEY+"-invalido",raw);}catch(_){}
    }
    return createInitialState();
  }
  function persist() {
    let ok=true;
    try { localStorage.setItem(STORAGE_KEY,JSON.stringify(state)); } catch(e){ ok=false; console.warn("Falha ao salvar",e); }
    const t=$("saveStatusText"),d=document.querySelector("#saveStatus .status-dot");
    if(t)t.textContent=ok?"Salvo neste dispositivo":"Não foi possível salvar — exporte um backup";
    if(d)d.style.background=ok?"":"var(--coral)";
    if(!ok&&!persist.warned){persist.warned=true;notify("Não foi possível salvar neste navegador. Exporte um backup.");}
    return ok;
  }
  function save() { persist(); updateDashboard(); }
  function escapeHTML(value) { return String(value ?? "").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
  function notify(message) { const el=$("toast"); el.textContent=message; el.classList.add("show"); clearTimeout(toastTimer); toastTimer=setTimeout(()=>el.classList.remove("show"),2500); }
  function initSelects() {
    $("simMonth").innerHTML=MONTHS.map((m,i)=>`<option value="${i}">${m}</option>`).join("");
    $("errorSubject").innerHTML=SUBJECTS.map(s=>`<option>${s}</option>`).join("");
    $("errorReason").innerHTML=REASONS.map(s=>`<option>${s}</option>`).join("");
    $("filterSubject").innerHTML='<option value="">Todas as matérias</option>'+SUBJECTS.map(s=>`<option>${s}</option>`).join("");
    $("filterReason").innerHTML='<option value="">Todos os motivos</option>'+REASONS.map(s=>`<option>${s}</option>`).join("");
  }
  function setupNavigation() {
    document.querySelectorAll("[data-tab]").forEach(btn=>btn.addEventListener("click",()=>showPage(btn.dataset.tab)));
    document.querySelectorAll("[data-go]").forEach(btn=>btn.addEventListener("click",()=>showPage(btn.dataset.go)));
    $("menuBtn").addEventListener("click",()=>$("sidebar").classList.toggle("open"));
    $("themeBtn").addEventListener("click",()=>{state.theme=state.theme==="dark"?"light":"dark";applyTheme();save();});
    $("importBtn").addEventListener("click",()=>$("importFile").click());
    $("resetBtn").addEventListener("click",()=>$("confirmModal").hidden=false);
    $("keepData").addEventListener("click",()=>$("confirmModal").hidden=true);
    $("confirmReset").addEventListener("click",()=>{state=createInitialState();ensureV2();migrateV1();currentMonth=0;currentWeek=1;save();renderAll();$("confirmModal").hidden=true;notify("Dados zerados.");});
  }
  function showPage(name) {
    const names={dashboard:"Dashboard geral",schedule:"Cronograma",simulations:"Simulados",errors:"Caderno de erros"};
    document.querySelectorAll(".page").forEach(p=>p.classList.remove("active"));
    $(name+"Page").classList.add("active");
    document.querySelectorAll(".nav-item[data-tab]").forEach(b=>b.classList.toggle("active",b.dataset.tab===name));
    $("pageName").textContent=names[name]; $("sidebar").classList.remove("open");
    if(name==="dashboard") updateDashboard();
    if(name==="schedule") renderSchedule();
    if(name==="simulations") renderSimulations();
    if(name==="errors") renderErrors();
  }
  function applyTheme() {
    document.body.classList.toggle("dark",state.theme==="dark");
    $("themeBtn").innerHTML=`<i data-lucide="${state.theme==="dark"?"sun":"moon"}"></i>`;
    if(window.lucide) lucide.createIcons();
    if(chart) { chart.options.scales.x.grid.color=getComputedStyle(document.body).getPropertyValue("--line"); chart.options.scales.y.grid.color=getComputedStyle(document.body).getPropertyValue("--line"); chart.update(); }
  }
  function aggregate() {
    let completed=0,questions=0,correct=0,essayScores=[],weekQuestions=0,area={};
    state.weeks.forEach(w=>{
      w.days.forEach(d=>d.blocks.forEach(b=>{if(b.completed)completed++;questions+=Number(b.questions)||0;correct+=Number(b.correct)||0;area[b.subject]=(area[b.subject]||0)+(Number(b.questions)||0);if(w.number===currentWeek)weekQuestions+=Number(b.questions)||0;}));
      if(w.essayScore!=="" && w.essayScore!==null && Number.isFinite(Number(w.essayScore))) essayScores.push(Number(w.essayScore));
    });
    state.simulations.forEach(s=>{if(s.essay!==""&&s.essay!==null&&Number.isFinite(Number(s.essay)))essayScores.push(Number(s.essay));});
    return {completed,questions,correct,accuracy:questions?correct/questions*100:0,essayScores,essayAvg:essayScores.length?essayScores.reduce((a,b)=>a+b,0)/essayScores.length:null,weekQuestions,area};
  }
  function updateDashboard() {
    const a=aggregate(),totalTopics=WEEKS*BLOCKS_PER_WEEK;
    $("todayLabel").textContent=new Date().toLocaleDateString("pt-BR",{weekday:"long",day:"numeric",month:"long",year:"numeric"}).toUpperCase();
    $("syllabusValue").textContent=(a.completed/totalTopics*100).toFixed(1)+"%";
    $("syllabusBar").style.width=(a.completed/totalTopics*100)+"%";
    $("syllabusDetail").textContent=`${a.completed} de ${totalTopics} blocos concluídos`;
    $("questionsValue").innerHTML=`${a.questions.toLocaleString("pt-BR")} <small>/ ${ANNUAL_GOAL.toLocaleString("pt-BR")}</small>`;
    $("questionsBar").style.width=Math.min(100,a.questions/ANNUAL_GOAL*100)+"%";
    $("questionsDetail").textContent=`${Math.max(0,ANNUAL_GOAL-a.questions).toLocaleString("pt-BR")} restantes`;
    $("accuracyValue").textContent=a.accuracy.toFixed(1)+"%";
    $("accuracyDetail").textContent=`${a.correct.toLocaleString("pt-BR")} acertos em ${a.questions.toLocaleString("pt-BR")} questões`;
    $("essayValue").innerHTML=a.essayAvg===null?'— <small>/ 1000</small>':`${Math.round(a.essayAvg)} <small>/ 1000</small>`;
    $("essayDetail").textContent=a.essayScores.length?`${a.essayScores.length} notas registradas`:"Nenhuma nota registrada";
    $("essayMarker").style.left=(a.essayAvg===null?0:a.essayAvg/1000*100)+"%";
    $("weeklyCount").textContent=`${a.weekQuestions} / ${WEEKLY_GOAL}`;
    $("weeklyPercent").textContent=Math.round(a.weekQuestions/WEEKLY_GOAL*100)+"%";
    $("weeklyRing").style.background=`conic-gradient(var(--primary) ${Math.min(100,a.weekQuestions/WEEKLY_GOAL*100)*3.6}deg,var(--line) 0deg)`;
    $("essayCount").textContent=state.weeks.filter(w=>w.essayDone).length;
    renderAreaBreakdown(a.area);
    renderChart();
  }
  function renderAreaBreakdown(area) {
    const groups=[["Natureza",(area.Biologia||0)+(area.Química||0)+(area.Física||0)],["Matemática",area.Matemática||0],["Humanas",(area.História||0)+(area.Geografia||0)+(area.Filosofia||0)+(area.Sociologia||0)],["Linguagens",area.Linguagens||0]];
    const max=Math.max(1,...groups.map(g=>g[1]));
    $("areaBreakdown").innerHTML=groups.map(([name,val])=>`<div class="area-row"><span>${name}</span><div class="area-bar"><i style="width:${val/max*100}%"></i></div><strong>${val}</strong></div>`).join("");
  }
  function renderChart() {
    const sims=[...state.simulations].sort((a,b)=>(a.createdAt||"").localeCompare(b.createdAt||""));
    $("chartEmpty").hidden=sims.length>0;
    if(!window.Chart)return;
    const ctx=$("evolutionChart").getContext("2d");
    const labels=sims.map(s=>`${s.name} · ${SHORT_MONTHS[s.month]||""}`);
    const values=sims.map(s=>Number(s.lang)+Number(s.hum)+Number(s.nat)+Number(s.math));
    const css=getComputedStyle(document.body),line=css.getPropertyValue("--line").trim(),muted=css.getPropertyValue("--muted").trim(),primary=css.getPropertyValue("--primary").trim();
    if(chart){chart.data.labels=labels;chart.data.datasets[0].data=values;chart.data.datasets[0].borderColor=primary;chart.data.datasets[0].backgroundColor=primary;chart.options.scales.x.grid.color=line;chart.options.scales.y.grid.color=line;chart.options.scales.x.ticks.color=muted;chart.options.scales.y.ticks.color=muted;chart.update();return;}
    chart=new Chart(ctx,{type:"line",data:{labels,datasets:[{label:"Acertos",data:values,borderColor:primary,backgroundColor:primary,tension:.35,fill:false,borderWidth:2.5,pointRadius:4,pointHoverRadius:6,pointBackgroundColor:primary}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{backgroundColor:"#202536",padding:10,displayColors:false,callbacks:{label:c=>`${c.parsed.y} acertos`}}},scales:{y:{min:0,max:180,ticks:{stepSize:30,color:muted,font:{size:10}},grid:{color:line}},x:{ticks:{color:muted,font:{size:9},maxRotation:0},grid:{display:false}}}}});
  }

  function renderSchedule() {
    $("monthTabs").innerHTML=SHORT_MONTHS.map((m,i)=>`<button class="month-tab ${i===currentMonth?"active":""}" data-month="${i}">${m}</button>`).join("");
    document.querySelectorAll("[data-month]").forEach(b=>b.addEventListener("click",()=>{currentMonth=Number(b.dataset.month);currentWeek=currentMonth*4+1;renderSchedule();}));
    $("weekSelect").innerHTML=Array.from({length:4},(_,i)=>{const n=currentMonth*4+i+1;return `<option value="${n}" ${n===currentWeek?"selected":""}>Semana ${String(n).padStart(2,"0")}</option>`;}).join("");
    $("weekSelect").onchange=e=>{currentWeek=Number(e.target.value);renderSchedule();};
    const w=state.weeks[currentWeek-1];
    $("weekLabel").textContent=`${MONTHS[w.month].toUpperCase()} · SEMANA ${String(w.weekInMonth).padStart(2,"0")}`;
    $("weekTitle").innerHTML=`Semana ${String(w.number).padStart(2,"0")} <span>· ${String((w.weekInMonth-1)*7+1).padStart(2,"0")} a ${String(w.weekInMonth*7).padStart(2,"0")} ${SHORT_MONTHS[w.month].toLowerCase()}</span>`;
    let q=0;w.days.forEach(d=>d.blocks.forEach(b=>q+=Number(b.questions)||0));
    $("weekProgressText").textContent=`${q} / ${WEEKLY_GOAL} questões`;$("weekProgressPct").textContent=Math.round(q/WEEKLY_GOAL*100)+"%";$("weekProgressBar").style.width=Math.min(100,q/WEEKLY_GOAL*100)+"%";
    $("simTask").checked=!!w.simulationDone;$("simTaskTitle").textContent=w.number%2===0?"Simulado quinzenal":"Semana sem simulado";$("simTaskSub").textContent=w.number%2===0?"Programado nesta semana":"Próximo simulado na semana "+(w.number+1);
    $("simTask").disabled=w.number%2!==0;$("essayTask").checked=!!w.essayDone;$("weekEssayScore").value=w.essayScore??"";
    $("simTask").onchange=e=>{w.simulationDone=e.target.checked;save();};
    $("essayTask").onchange=e=>{w.essayDone=e.target.checked;save();};
    $("weekEssayScore").onchange=e=>{const v=e.target.value;if(v!==""&&(Number(v)<0||Number(v)>1000)){e.target.value=w.essayScore;notify("A nota deve estar entre 0 e 1000.");return;}w.essayScore=v===""?"":Number(v);save();};
    $("scheduleDays").innerHTML=w.days.map((day,di)=>`<article class="card day-card"><div class="day-heading"><h3>${day.name}</h3><span>3 blocos · datas 2027</span></div>${day.blocks.map((b,bi)=>`<div class="subject-block"><div class="subject-head"><i class="subject-dot" style="background:${SUBJECT_COLORS[b.subject]||"var(--primary)"}"></i><input aria-label="Assunto da matéria ${b.subject}" data-field="topic" data-day="${di}" data-block="${bi}" value="${escapeHTML(b.topic)}"><label class="complete-toggle"><input type="checkbox" data-field="completed" data-day="${di}" data-block="${bi}" ${b.completed?"checked":""}> Concluído</label></div><div class="subject-fields"><label>Matéria<select data-field="subject" data-day="${di}" data-block="${bi}">${SUBJECTS.map(s=>`<option ${s===b.subject?"selected":""}>${s}</option>`).join("")}</select></label><label>Meta<input type="number" min="0" max="${WEEKLY_GOAL}" data-field="targetQuestions" data-day="${di}" data-block="${bi}" value="${b.targetQuestions||0}"></label><label>Questões<input type="number" min="0" max="999" data-field="questions" data-day="${di}" data-block="${bi}" value="${b.questions||0}"></label><label>Acertos<input type="number" min="0" max="999" data-field="correct" data-day="${di}" data-block="${bi}" value="${b.correct||0}"></label></div></div>`).join("")}</article>`).join("");
    $("scheduleDays").querySelectorAll("[data-field]").forEach(el=>el.addEventListener("change",()=>{
      const b=w.days[Number(el.dataset.day)].blocks[Number(el.dataset.block)],field=el.dataset.field;
      if(field==="completed")b.completed=el.checked;
      else if(field==="topic")b.topic=el.value;
      else if(field==="subject"){b.subject=el.value;renderSchedule();save();return;}
      else {const n=Math.max(0,Number(el.value)||0);if(field==="correct"&&n>Number(b.questions)){notify("Acertos não podem superar questões feitas.");el.value=b.correct;return;}if(field==="questions"&&n<Number(b.correct)){notify("Questões não podem ser menores que os acertos.");el.value=b.questions;return;}b[field]=n;}
      save();const total=w.days.reduce((sum,d)=>sum+d.blocks.reduce((s,x)=>s+(Number(x.questions)||0),0),0);$("weekProgressText").textContent=`${total} / ${WEEKLY_GOAL} questões`;$("weekProgressPct").textContent=Math.round(total/WEEKLY_GOAL*100)+"%";$("weekProgressBar").style.width=Math.min(100,total/WEEKLY_GOAL*100)+"%";
    }));
    $("scheduleTotal").textContent=`${state.weeks.reduce((sum,w)=>sum+w.days.reduce((s,d)=>s+d.blocks.reduce((n,b)=>n+(Number(b.questions)||0),0),0),0).toLocaleString("pt-BR")} / ${ANNUAL_GOAL.toLocaleString("pt-BR")}`;
    if(window.lucide)lucide.createIcons();
  }

  function simTotal(s){return Number(s.lang)+Number(s.hum)+Number(s.nat)+Number(s.math);}
  function renderSimulations() {
    $("simCount").textContent=state.simulations.length;$("historyCount").textContent=`${state.simulations.length} registros`;
    const list=[...state.simulations].sort((a,b)=>(b.createdAt||"").localeCompare(a.createdAt||""));
    $("simHistory").innerHTML=list.length?list.map(s=>`<div class="sim-item"><div class="sim-item-top"><div><h3>${escapeHTML(s.name)}</h3><span class="sim-date">${MONTHS[s.month]||"Mês não informado"} · ${s.createdAt?new Date(s.createdAt+"T12:00:00").toLocaleDateString("pt-BR"):"Data não informada"}</span></div><div class="sim-total">${simTotal(s)} <small>/ 180</small></div></div><div class="sim-scores"><span>Linguagens<b>${s.lang}/45</b></span><span>Humanas<b>${s.hum}/45</b></span><span>Natureza<b>${s.nat}/45</b></span><span>Matemática<b>${s.math}/45</b></span></div>${s.essay!==""&&s.essay!==null?`<div class="sim-meta">Redação: <b>${s.essay}/1000</b></div>`:""}${s.notes?`<div class="sim-meta">${escapeHTML(s.notes)}</div>`:""}<div class="sim-meta">TRI heurística: ${getSimEstimates(s).map(x=>`${x.label} ${x.score}${x.hasPattern?` (${x.coherence.toFixed(0)}% coerência)`:""}`).join(" · ")}</div><div class="sim-actions"><button class="link-action" data-edit-sim="${s.id}">Editar</button><button class="link-action delete" data-delete-sim="${s.id}">Excluir</button></div></div>`).join(""):'<div class="history-empty"><i data-lucide="clipboard-list"></i><strong>Nenhum simulado registrado.</strong><br>Adicione seu primeiro resultado pelo formulário.</div>';
    document.querySelectorAll("[data-edit-sim]").forEach(b=>b.onclick=()=>editSimulation(b.dataset.editSim));
    document.querySelectorAll("[data-delete-sim]").forEach(b=>b.onclick=()=>{if(confirm("Excluir este simulado?")){state.simulations=state.simulations.filter(s=>s.id!==b.dataset.deleteSim);save();renderSimulations();notify("Simulado excluído.");}});
    if(window.lucide)lucide.createIcons();
  }
  function resetSimForm(){ $("simForm").reset();$("simId").value="";$("simFormTitle").textContent="Novo simulado";$("simTotal").innerHTML='0 <small>/ 180</small>';$("cancelSimEdit").hidden=true; }
  function editSimulation(id){const s=state.simulations.find(x=>x.id===id);if(!s)return;$("simId").value=s.id;$("simName").value=s.name;$("simMonth").value=s.month;$("simLang").value=s.lang;$("simHum").value=s.hum;$("simNat").value=s.nat;$("simMath").value=s.math;$("simEssay").value=s.essay??"";$("simNotes").value=s.notes||"";["lang","hum","nat","math"].forEach(k=>{const cap=k[0].toUpperCase()+k.slice(1),pattern=s.tri?.[k]||{};$("easy"+cap).value=pattern.easy??"";$("hard"+cap).value=pattern.hard??"";});renderSimTriPreview();$("simFormTitle").textContent="Editar simulado";$("cancelSimEdit").hidden=false;updateSimTotal();$("simName").focus();window.scrollTo({top:0,behavior:"smooth"});}
  function updateSimTotal(){$("simTotal").innerHTML=`${["simLang","simHum","simNat","simMath"].reduce((n,id)=>n+(Number($(id).value)||0),0)} <small>/ 180</small>`;}
  function setupSimForm(){
    ["simLang","simHum","simNat","simMath"].forEach(id=>$(id).addEventListener("input",updateSimTotal));
    $("cancelSimEdit").onclick=resetSimForm;
    $("simForm").onsubmit=e=>{e.preventDefault();const fields=["simLang","simHum","simNat","simMath"],nums=fields.map(id=>Number($(id).value));if(nums.some(n=>!Number.isInteger(n)||n<0||n>45)){notify("Cada área deve ter entre 0 e 45 acertos.");return;}const essay=$("simEssay").value===""?"":Number($("simEssay").value);if(essay!==""&&(!Number.isFinite(essay)||essay<0||essay>1000)){notify("A redação deve estar entre 0 e 1000.");return;}
      const patternKeys=[["easyLang","hardLang",nums[0]],["easyHum","hardHum",nums[1]],["easyNat","hardNat",nums[2]],["easyMath","hardMath",nums[3]]];
      for(const [easyId,hardId,raw] of patternKeys){const easy=$(easyId).value===""?0:Number($(easyId).value),hard=$(hardId).value===""?0:Number($(hardId).value);if(easy<0||hard<0||easy+hard>raw||!Number.isInteger(easy)||!Number.isInteger(hard)){notify("Acertos fáceis + difíceis não podem superar o total da área.");return;}}
      const id=$("simId").value||"sim-"+Date.now(),old=state.simulations.find(s=>s.id===id);
      const s={id,name:$("simName").value.trim(),month:Number($("simMonth").value),lang:nums[0],hum:nums[1],nat:nums[2],math:nums[3],essay,notes:$("simNotes").value.trim(),createdAt:old?.createdAt||todayISO(),tri:{lang:{easy:$("easyLang").value===""?"":Number($("easyLang").value),hard:$("hardLang").value===""?"":Number($("hardLang").value)},hum:{easy:$("easyHum").value===""?"":Number($("easyHum").value),hard:$("hardHum").value===""?"":Number($("hardHum").value)},nat:{easy:$("easyNat").value===""?"":Number($("easyNat").value),hard:$("hardNat").value===""?"":Number($("hardNat").value)},math:{easy:$("easyMath").value===""?"":Number($("easyMath").value),hard:$("hardMath").value===""?"":Number($("hardMath").value)}}};
      if(old)state.simulations=state.simulations.map(x=>x.id===id?s:x);else {state.simulations.push(s);if(state.simulations.length>state.v2.simRewardCount){state.v2.simRewardCount=state.simulations.length;awardXP(150,"simulado registrado");}}
      save();resetSimForm();renderSimulations();notify(old?"Simulado atualizado.":"Simulado salvo.");
    };
  }

  function renderErrors(){
    $("errorCount").textContent=state.errors.length;
    const subject=$("filterSubject").value,reason=$("filterReason").value,hide=$("hideMastered").checked;
    const list=state.errors.filter(e=>(!subject||e.subject===subject)&&(!reason||e.reason===reason)&&(!hide||!e.mastered)).sort((a,b)=>(b.createdAt||"").localeCompare(a.createdAt||""));
    $("errorFilteredCount").textContent=`${list.length} itens`;
    $("errorList").innerHTML=list.length?list.map(e=>`<article class="error-item"><div class="error-item-top"><div class="error-tags"><span class="tag">${escapeHTML(e.subject)}</span><span class="tag ${reasonClass(e.reason)}">${escapeHTML(e.reason)}</span></div><span class="sim-date">${e.createdAt?new Date(e.createdAt+"T12:00:00").toLocaleDateString("pt-BR"):""}</span></div><p>${escapeHTML(e.description)}</p><div class="error-item-bottom"><span class="mastered-badge ${e.mastered?"":"pending"}"><i data-lucide="${e.mastered?"badge-check":"clock-3"}"></i>${e.mastered?"Dominado":"Pendente de revisão"}</span><div class="error-item-actions"><button class="link-action" data-toggle-error="${e.id}">${e.mastered?"Reabrir":"Marcar dominado"}</button><button class="link-action" data-edit-error="${e.id}">Editar</button><button class="link-action delete" data-delete-error="${e.id}">Excluir</button></div></div></article>`).join(""):'<div class="error-empty"><i data-lucide="notebook-tabs"></i><strong>Nenhum erro encontrado.</strong><br>Registre uma questão ou ajuste os filtros.</div>';
    document.querySelectorAll("[data-toggle-error]").forEach(b=>b.onclick=()=>{const e=state.errors.find(x=>x.id===b.dataset.toggleError);e.mastered=!e.mastered;if(e.mastered){e.review=e.review||{stage:4,history:[]};e.review.stage=4;e.review.nextDue=null;}else{e.review={stage:0,nextDue:addDaysISO(todayISO(),1),history:e.review?.history||[]};}save();renderErrors();});
    document.querySelectorAll("[data-edit-error]").forEach(b=>b.onclick=()=>editError(b.dataset.editError));
    document.querySelectorAll("[data-delete-error]").forEach(b=>b.onclick=()=>{if(confirm("Excluir este registro?")){state.errors=state.errors.filter(x=>x.id!==b.dataset.deleteError);save();renderErrors();notify("Registro excluído.");}});
    if(window.lucide)lucide.createIcons();
  }
  function reasonClass(reason){if(reason.includes("Atenção"))return"reason-atenção";if(reason.includes("Interpretação"))return"reason-interpretação";if(reason.includes("Gestão"))return"reason-gestão";if(reason.includes("Cálculo"))return"reason-cálculo";return"";}
  function resetErrorForm(){$("errorForm").reset();$("errorId").value="";$("cancelErrorEdit").hidden=true;}
  function editError(id){const e=state.errors.find(x=>x.id===id);if(!e)return;$("errorId").value=e.id;$("errorSubject").value=e.subject;$("errorReason").value=e.reason;$("errorDescription").value=e.description;$("errorMastered").checked=e.mastered;$("cancelErrorEdit").hidden=false;$("errorDescription").focus();window.scrollTo({top:0,behavior:"smooth"});}
  function setupErrorForm(){
    ["filterSubject","filterReason","hideMastered"].forEach(id=>$(id).addEventListener("change",renderErrors));
    $("cancelErrorEdit").onclick=resetErrorForm;
    $("errorForm").onsubmit=e=>{e.preventDefault();const id=$("errorId").value||"err-"+Date.now(),old=state.errors.find(x=>x.id===id);const mastered=$("errorMastered").checked;let review=old?.review||{stage:0,nextDue:addDaysISO(todayISO(),1),history:[]};if(mastered)review={...review,stage:4,nextDue:null};else if(old?.mastered)review={stage:0,nextDue:addDaysISO(todayISO(),1),history:review.history||[]};const item={id,subject:$("errorSubject").value,reason:$("errorReason").value,description:$("errorDescription").value.trim(),mastered,createdAt:old?.createdAt||todayISO(),review};if(old)state.errors=state.errors.map(x=>x.id===id?item:x);else state.errors.push(item);save();resetErrorForm();renderErrors();notify(old?"Erro atualizado.":"Erro registrado.");};
  }
  // ----------------------- Validação de dados salvos/importados -----------------------
  const ISO_DATE=/^\d{4}-\d{2}-\d{2}$/;
  const clampInt=(v,min,max,fb=0)=>{const n=Math.round(Number(v));return Number.isFinite(n)?Math.min(max,Math.max(min,n)):fb;};
  const optInt=(v,min,max)=>(v===""||v===null||v===undefined||!Number.isFinite(Number(v)))?"":clampInt(v,min,max);
  const safeText=(v,max)=>String(v??"").slice(0,max);
  const safeId=v=>String(v??"").replace(/[^\w-]/g,"").slice(0,60)||"id-"+Date.now()+Math.random().toString(36).slice(2,6);
  const safeDate=v=>ISO_DATE.test(String(v))?String(v):todayISO();
  function sanitizeState(data){
    if(!data||typeof data!=="object"||!Array.isArray(data.weeks)||data.weeks.length!==WEEKS||!Array.isArray(data.simulations)||!Array.isArray(data.errors))throw new Error("Formato inválido");
    const weeks=data.weeks.map((w,i)=>{
      if(!w||!Array.isArray(w.days)||w.days.length!==DAYS.length)throw new Error("Semana inválida");
      return {number:i+1,month:Math.floor(i/4),weekInMonth:(i%4)+1,essayDone:!!w.essayDone,simulationDone:!!w.simulationDone,essayScore:optInt(w.essayScore,0,1000),
        days:w.days.map((d,di)=>{
          if(!d||!Array.isArray(d.blocks)||d.blocks.length!==DISTRIBUTION[di].length)throw new Error("Dia inválido");
          return {name:DAYS[di],blocks:d.blocks.map((b,bi)=>{
            const questions=clampInt(b?.questions,0,999);
            return {subject:SUBJECTS.includes(b?.subject)?b.subject:DISTRIBUTION[di][bi],topic:safeText(b?.topic,120),completed:!!b?.completed,questions,correct:Math.min(questions,clampInt(b?.correct,0,999)),targetQuestions:clampInt(b?.targetQuestions,0,WEEKLY_GOAL)};
          })};
        })};
    });
    const simulations=data.simulations.map(s=>{
      const tri={};["lang","hum","nat","math"].forEach(k=>{tri[k]={easy:optInt(s?.tri?.[k]?.easy,0,45),hard:optInt(s?.tri?.[k]?.hard,0,45)};});
      return {id:safeId(s?.id),name:safeText(s?.name,80)||"Simulado",month:clampInt(s?.month,0,MONTHS.length-1),lang:clampInt(s?.lang,0,45),hum:clampInt(s?.hum,0,45),nat:clampInt(s?.nat,0,45),math:clampInt(s?.math,0,45),essay:optInt(s?.essay,0,1000),notes:safeText(s?.notes,2000),createdAt:safeDate(s?.createdAt),tri};
    });
    const errors=data.errors.map(e=>{
      const mastered=!!e?.mastered,stage=mastered?4:clampInt(e?.review?.stage,0,4);
      let nextDue=ISO_DATE.test(String(e?.review?.nextDue))?e.review.nextDue:null;
      if(stage<4&&!nextDue)nextDue=addDaysISO(todayISO(),1);
      if(stage>=4)nextDue=null;
      return {id:safeId(e?.id),subject:SUBJECTS.includes(e?.subject)?e.subject:SUBJECTS[0],reason:REASONS.includes(e?.reason)?e.reason:REASONS[0],description:safeText(e?.description,5000),mastered,createdAt:safeDate(e?.createdAt),
        review:{stage,nextDue,history:(Array.isArray(e?.review?.history)?e.review.history:[]).slice(-50).map(x=>({completedAt:safeDate(x?.completedAt),stage:clampInt(x?.stage,1,4,1)}))}};
    });
    let v2=null;const v=data.v2;
    if(v&&typeof v==="object"){
      const num=(x,max=1e7)=>{const n=Number(x);return Number.isFinite(n)?Math.min(max,Math.max(0,n)):0;};
      const ledger={};
      Object.entries(v.xpLedger&&typeof v.xpLedger==="object"?v.xpLedger:{}).slice(0,5000).forEach(([k,x])=>{if(x===true)ledger[safeText(k,80)]=true;else if(x&&typeof x==="object")ledger[safeText(k,80)]={questions:num(x.questions,99999),correct:num(x.correct,99999),completed:!!x.completed};});
      const study={};SUBJECTS.forEach(sub=>{if(Number(v.studyBySubject?.[sub])>0)study[sub]=num(v.studyBySubject[sub]);});
      const weights={};["accuracy","consistency","simScore","simEvolution","done","essays"].forEach(k=>{if(v.rankWeights&&Number.isFinite(Number(v.rankWeights[k])))weights[k]=num(v.rankWeights[k],100);});
      const tierIds=TIERS.map(t=>t.id);
      const history=(Array.isArray(v.rankHistory)?v.rankHistory:[]).filter(r=>tierIds.includes(r?.from)&&tierIds.includes(r?.to)).slice(-30).map(r=>({from:r.from,to:r.to,date:safeDate(r.date)}));
      v2={version:2,xp:num(v.xp),studyMinutes:Math.round(num(v.studyMinutes)),studyBySubject:study,xpLedger:ledger,adaptiveTargets:{},rankHistory:history,rankWeights:weights,simRewardCount:clampInt(v.simRewardCount,0,9999),lastActivityDate:ISO_DATE.test(String(v.lastActivityDate))?v.lastActivityDate:null};
    }
    return {version:2,theme:data.theme==="dark"?"dark":"light",weeks,simulations,errors,v2};
  }
  function exportBackup(){const blob=new Blob([JSON.stringify({...state,exportedAt:new Date().toISOString()},null,2)],{type:"application/json"});const url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=`atlas-enem-2027-backup-${todayISO()}.json`;a.click();URL.revokeObjectURL(url);notify("Backup exportado.");}
  function importBackup(e){const file=e.target.files?.[0];if(!file)return;const reader=new FileReader();reader.onload=()=>{try{const data=JSON.parse(reader.result);if(!data||data.version!==1||!Array.isArray(data.weeks)||data.weeks.length!==WEEKS||!Array.isArray(data.simulations)||!Array.isArray(data.errors))throw new Error("Formato inválido");if(!confirm("Importar este backup substituirá os dados atuais. Deseja continuar?"))return;state={version:1,theme:data.theme==="dark"?"dark":"light",weeks:data.weeks,simulations:data.simulations,errors:data.errors};save();applyTheme();renderAll();notify("Backup importado com sucesso.");}catch(err){alert("Não foi possível importar: arquivo inválido ou incompatível.");}finally{$("importFile").value="";}};reader.readAsText(file);}

  // ----------------------- Atlas v2.0 extensions -----------------------
  const V2_VERSION = 2;
  const XP_RULES = {question:1, correct:2, minute:25/60, topic:30, essay:100, simulation:150};
  const LEVEL_TITLES = ["Iniciante","Explorador","Disciplinado","Estrategista","Especialista","Elite","Veterano","Mestre","Lenda"];
  const TIERS = [{id:"F",min:0,label:"Em construção"},{id:"D",min:20,label:"Iniciante"},{id:"C",min:32,label:"Em evolução"},{id:"B",min:44,label:"Consistente"},{id:"A",min:56,label:"Avançado"},{id:"S",min:68,label:"Alta performance"},{id:"SS",min:80,label:"Excelência"},{id:"SSS",min:90,label:"Elite"}];
  const AREA_KEYS = [{key:"lang",label:"Linguagens",subject:"Linguagens"},{key:"hum",label:"Humanas",subject:"Humanas"},{key:"nat",label:"Natureza",subject:"Natureza"},{key:"math",label:"Matemática",subject:"Matemática"}];
  let timerInterval=null,timerStartedAt=null,timerElapsed=0,timerSubject="Biologia",calendarInitialized=false;

  function dateISO(d){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;}
  function addDaysISO(iso,n){const d=new Date(iso+"T12:00:00");d.setDate(d.getDate()+n);return dateISO(d);}
  function realWeekRange(n){const start=new Date(2027,0,4+(n-1)*7,12);const end=new Date(start);end.setDate(start.getDate()+5);return {start,end,from:start.toLocaleDateString("pt-BR",{day:"2-digit",month:"short"}),to:end.toLocaleDateString("pt-BR",{day:"2-digit",month:"short"})};}
  function todayISO(){return dateISO(new Date());}
  function ensureV2(){
    if(!state.v2) state.v2={version:V2_VERSION,xp:0,studyMinutes:0,rankHistory:[],xpLedger:{},adaptiveTargets:{},triSettings:{},lastActivityDate:null};
    state.v2.version=V2_VERSION;
    if(!Number.isFinite(state.v2.xp))state.v2.xp=0;
    if(!Number.isFinite(state.v2.studyMinutes))state.v2.studyMinutes=0;
    if(!state.v2.xpLedger)state.v2.xpLedger={};
    if(!state.v2.adaptiveTargets)state.v2.adaptiveTargets={};
    if(!state.v2.studyBySubject)state.v2.studyBySubject={};
    if(!Array.isArray(state.v2.rankHistory))state.v2.rankHistory=[];
    const defaults={accuracy:35,consistency:25,simScore:15,simEvolution:10,done:10,essays:5};
    state.v2.rankWeights={...defaults,...(state.v2.rankWeights||{})};
    if(!state.v2.lastTier)state.v2.lastTier=tierFor(rankingScore().score).id;
    // Backfill review schedules without granting retroactive XP.
    state.errors.forEach(e=>{
      if(!e.review)e.review={stage:0,nextDue:addDaysISO(e.createdAt||todayISO(),1),history:[]};
      if(!Array.isArray(e.review.history))e.review.history=[];
    });
    state.weeks.forEach(w=>w.days.forEach(d=>d.blocks.forEach((b,bi)=>{
      if(typeof b.targetQuestions!=="number")b.targetQuestions=0;
      const key=`${w.number}-${d.name}-${bi}`;
      if(!state.v2.xpLedger[key])state.v2.xpLedger[key]={questions:Number(b.questions)||0,correct:Number(b.correct)||0,completed:!!b.completed};
    })));
    state.simulations.forEach(s=>{if(!s.tri)s.tri={};});
    state.weeks.forEach(w=>{if(w.essayDone)state.v2.xpLedger["essay-"+w.number]=true;if(w.simulationDone)state.v2.xpLedger["sim-"+w.number]=true;});
    state.v2.simRewardCount=Math.max(Number(state.v2.simRewardCount)||0,state.simulations.length);
  }
  function migrateV1(){ensureV2();state.version=2;}
  function xpThreshold(level){return level<=1?0:Math.round(150*(level-1)+35*(level-1)*(level-2));}
  function levelInfo(xp){
    let level=1;while(level<100&&xp>=xpThreshold(level+1))level++;
    const floor=xpThreshold(level),ceil=xpThreshold(level+1);
    return {level,floor,ceil,progress:Math.max(0,xp-floor),needed:ceil-floor,title:LEVEL_TITLES[Math.min(LEVEL_TITLES.length-1,Math.floor((level-1)/2))]};
  }
  function awardXP(amount,reason){
    if(!Number.isFinite(amount)||amount<=0)return;
    state.v2.xp=Math.max(0,Math.round((state.v2.xp+amount)*100)/100);
    state.v2.lastActivityDate=todayISO();
  }
  function syncStudyXP(){
    // Only changes after the v2 migration are rewarded; historical counts are baseline.
    let earned=0;
    state.weeks.forEach(w=>w.days.forEach(d=>d.blocks.forEach((b,bi)=>{
      const key=`${w.number}-${d.name}-${bi}`;
      const old=state.v2.xpLedger[key]||{questions:0,correct:0,completed:false};
      const q=Number(b.questions)||0,c=Number(b.correct)||0;
      const qHigh=Math.max(old.questions,q),cHigh=Math.max(old.correct,c);
      if(qHigh>old.questions)earned+=(qHigh-old.questions)*XP_RULES.question;
      if(cHigh>old.correct)earned+=(cHigh-old.correct)*XP_RULES.correct;
      if(b.completed&&!old.completed)earned+=XP_RULES.topic;
      state.v2.xpLedger[key]={questions:qHigh,correct:cHigh,completed:!!(old.completed||b.completed)};
    })));
    if(earned)awardXP(earned,"questões e tópicos");
  }
  function tierFor(score){let t=TIERS[0];TIERS.forEach(x=>{if(score>=x.min)t=x;});return t;}
  function rankingScore(){
    const total=state.weeks.reduce((n,w)=>n+w.days.reduce((a,d)=>a+d.blocks.reduce((z,b)=>z+(Number(b.questions)||0),0),0),0);
    const correct=state.weeks.reduce((n,w)=>n+w.days.reduce((a,d)=>a+d.blocks.reduce((z,b)=>z+(Number(b.correct)||0),0),0),0);
    const accuracy=total?correct/total*100:0;
    const active=state.weeks.filter(w=>w.days.some(d=>d.blocks.some(b=>Number(b.questions)>0)));
    const now=new Date(),elapsed=Math.max(0,Math.min(WEEKS,Math.floor((new Date(now.getFullYear(),now.getMonth(),now.getDate())-new Date(2027,0,4))/604800000)));
    const hit=active.filter(w=>w.days.reduce((a,d)=>a+d.blocks.reduce((z,b)=>z+(Number(b.questions)||0),0),0)>=WEEKLY_GOAL).length,denom=Math.max(elapsed,active.length);
    const consistency=denom?hit/denom*100:0;
    const sims=state.simulations;
    const simScore=sims.length?Math.min(100,sims.reduce((n,s)=>n+simTotal(s),0)/sims.length/180*100):0;
    const ordered=[...sims].sort((a,b)=>(a.createdAt||"").localeCompare(b.createdAt||""));
    const simEvolution=ordered.length>1?Math.max(0,Math.min(100,50+(simTotal(ordered[ordered.length-1])-simTotal(ordered[0]))/180*50)):0;
    const done=state.weeks.reduce((n,w)=>n+w.days.reduce((a,d)=>a+d.blocks.filter(b=>b.completed).length,0),0)/(WEEKS*BLOCKS_PER_WEEK)*100;
    const essays=state.weeks.filter(w=>w.essayDone).length/WEEKS*100;
    const weights=state.v2.rankWeights||{accuracy:35,consistency:25,simScore:15,simEvolution:10,done:10,essays:5};
    const weightTotal=Object.values(weights).reduce((a,b)=>a+Number(b||0),0)||100;
    const score=(accuracy*weights.accuracy+consistency*weights.consistency+simScore*weights.simScore+simEvolution*weights.simEvolution+done*weights.done+essays*weights.essays)/weightTotal;
    return {score,accuracy,consistency,simScore,simEvolution,done,essays};
  }
  function subjectAccuracy(){
    const out={};SUBJECTS.forEach(s=>out[s]={q:0,c:0,errors:state.errors.filter(e=>e.subject===s&&!e.mastered).length});
    state.weeks.forEach(w=>w.days.forEach(d=>d.blocks.forEach(b=>{if(!out[b.subject])out[b.subject]={q:0,c:0,errors:0};out[b.subject].q+=Number(b.questions)||0;out[b.subject].c+=Number(b.correct)||0;})));
    return out;
  }
  function areaRank(pct){return tierFor(pct).id;}
  function estimateArea(raw,easy,hard){
    raw=Number(raw)||0;
    if(raw===0)return {score:300,coherence:100,penalty:0};
    const easyN=Number(easy),hardN=Number(hard);
    const hasPattern=Number.isFinite(easyN)&&Number.isFinite(hardN);
    let penalty=0,coherence=100;
    if(hasPattern){
      const medium=Math.max(0,raw-easyN-hardN);
      const total=easyN+medium+hardN;
      // Uma diferença acentuada entre acertos difíceis e fáceis sugere incoerência, sem presumir parâmetros IRT.
      const gap=Math.max(0,hardN-easyN);
      penalty=Math.min(65,gap*4);
      coherence=Math.max(0,100-gap/Math.max(1,raw)*100);
    }
    const score=Math.max(300,Math.min(850,Math.round(300+(raw/45)*500-penalty)));
    return {score,coherence,penalty,hasPattern};
  }
  function getSimEstimates(s){
    const vals=[["lang","Linguagens"],["hum","Humanas"],["nat","Natureza"],["math","Matemática"]];
    return vals.map(([k,label])=>{
      const p=s.tri?.[k]||{};
      return {key:k,label,...estimateArea(s[k],p.easy,p.hard),raw:Number(s[k])||0,hasPattern:Number.isFinite(Number(p.easy))&&p.easy!==""&&Number.isFinite(Number(p.hard))&&p.hard!==""};
    });
  }
  function renderV2Dashboard(){
    const info=levelInfo(state.v2.xp),r=rankingScore(),tier=tierFor(r.score),idx=TIERS.findIndex(x=>x.id===tier.id),next=TIERS[Math.min(TIERS.length-1,idx+1)];
    $("levelTitle").textContent=`Nível ${info.level}`;$("rankTitle").textContent=info.title;$("levelEmblem").textContent=info.level;
    $("xpTotal").textContent=`${Math.floor(state.v2.xp).toLocaleString("pt-BR")} XP`;$("xpToNext").textContent=`${Math.max(0,info.needed-info.progress).toLocaleString("pt-BR")} XP para o próximo nível`;
    $("xpBar").style.width=(info.needed?info.progress/info.needed*100:100)+"%";$("xpLevelProgress").textContent=`${Math.floor(info.progress)} / ${info.needed} XP`;$("sidebarLevel").textContent=`Nível ${info.level} · ${info.title}`;
    $("currentTier").textContent=tier.id;$("tierName").textContent=tier.label;
    const latestRank=state.v2.rankHistory[state.v2.rankHistory.length-1];
    $("tierDelta").textContent=latestRank?`${latestRank.from} → ${latestRank.to} · ${r.score.toFixed(1)}/100`:`Pontuação composta ${r.score.toFixed(1)}/100`;
    $("tierBar").style.width=Math.max(0,Math.min(100,(r.score-tier.min)/(next.min-tier.min||1)*100))+"%";
    $("tierNext").textContent=tier.id==="SSS"?"Tier máximo alcançado":`Próximo tier: ${next.id} · faltam ${Math.max(0,next.min-r.score).toFixed(1)} pts`;
    const weightLabels={accuracy:"Precisão",consistency:"Consistência semanal",simScore:"Desempenho em simulados",simEvolution:"Evolução nos simulados",done:"Conclusão do cronograma",essays:"Redações entregues"};
    $("rankWeightsControls").innerHTML=Object.entries(weightLabels).map(([key,label])=>`<label class="rank-weight"><span>${label}</span><input type="number" min="0" max="100" step="1" data-rank-weight="${key}" value="${state.v2.rankWeights[key]}"><b>%</b></label>`).join("");
    const subj=subjectAccuracy(),areaGroups=[["Natureza",["Biologia","Química","Física"]],["Matemática",["Matemática"]],["Humanas",["História","Geografia","Filosofia","Sociologia"]],["Linguagens",["Linguagens"]]];
    const week=state.weeks[currentWeek-1];let wq=0,wc=0;week.days.forEach(d=>d.blocks.forEach(b=>{wq+=Number(b.questions)||0;wc+=Number(b.correct)||0;}));const weekPct=wq?wc/wq*100:0,weekScore=weekPct*.7+Math.min(100,wq/WEEKLY_GOAL*100)*.3;
    $("areaTiers").innerHTML=areaGroups.map(([name,ss])=>{let q=0,c=0;ss.forEach(s=>{q+=subj[s].q;c+=subj[s].c;});return `<span class="area-tier">${name}<b>${areaRank(q?c/q*100:0)}</b></span>`;}).join("")+`<span class="area-tier">Semana ${currentWeek}<b>${areaRank(weekScore)}</b></span>`;
    renderTriDashboard();
    $("studyTimeTotal").textContent=`${Math.floor(state.v2.studyMinutes/60)}h ${state.v2.studyMinutes%60}min estudadas`;
    const topSubjects=Object.entries(state.v2.studyBySubject||{}).filter(([,m])=>m>0).sort((a,b)=>b[1]-a[1]).slice(0,3);
    $("studyBySubject").textContent=topSubjects.length?topSubjects.map(([name,m])=>`${name} ${Math.floor(m/60)}h${m%60?String(m%60).padStart(2,"0")+"m":""}`).join(" · "):"Por matéria: —";
  }
  function renderTriDashboard(){
    const latest=[...state.simulations].sort((a,b)=>(b.createdAt||"").localeCompare(a.createdAt||""))[0];
    const el=$("triDashboard");
    if(!latest){el.innerHTML='<div class="review-empty">Registre um simulado para estimar a TRI por área.</div>';return;}
    const est=getSimEstimates(latest);
    el.innerHTML=est.map(a=>`<div class="tri-row"><span>${a.label}</span><div class="tri-track"><i style="width:${(a.score-300)/500*100}%"></i></div><strong>${a.score}</strong></div><div class="tri-coherence">${a.hasPattern?`Coerência informada: ${a.coherence.toFixed(0)}%`:"Coerência: sem padrão informado"}</div>`).join("");
    const weakest=[...est].sort((a,b)=>a.score-b.score)[0];
    el.insertAdjacentHTML("beforeend",`<div class="sim-meta">Maior oportunidade de ganho: <b>${weakest.label}</b> (${weakest.raw}/45 acertos).</div>`);
  }
  function adaptivePlan(weekNumber){
    const perf=subjectAccuracy(),base={Biologia:42,Química:42,Física:35,Matemática:50,História:30,Geografia:28,Filosofia:22,Sociologia:24,Linguagens:42};
    const latest=[...state.simulations].sort((a,b)=>(b.createdAt||"").localeCompare(a.createdAt||""))[0];
    const simAreas=latest?[{area:"nat",raw:latest.nat},{area:"math",raw:latest.math},{area:"hum",raw:latest.hum},{area:"lang",raw:latest.lang}]:[];
    const simMean=simAreas.length?simAreas.reduce((n,x)=>n+x.raw,0)/simAreas.length:0;
    const areaFor={Biologia:"nat",Química:"nat",Física:"nat",Matemática:"math",História:"hum",Geografia:"hum",Filosofia:"hum",Sociologia:"hum",Linguagens:"lang"};
    const simByArea={};simAreas.forEach(x=>simByArea[x.area]=x.raw);
    const weights={};let sum=0;
    SUBJECTS.forEach(s=>{const p=perf[s],acc=p.q?p.c/p.q:0.65;const area=areaFor[s],simPenalty=latest?Math.max(0,(simMean-(simByArea[area]||0))/45)*.55:0;const w=base[s]*(1+(1-acc)*1.5+p.errors*.08+simPenalty);weights[s]=w;sum+=w;});
    const totals={};let used=0;
    SUBJECTS.forEach(s=>{totals[s]=Math.floor(WEEKLY_GOAL*weights[s]/sum);used+=totals[s];});
    let rem=WEEKLY_GOAL-used;[...SUBJECTS].sort((a,b)=>(WEEKLY_GOAL*weights[b]/sum-Math.floor(WEEKLY_GOAL*weights[b]/sum))-(WEEKLY_GOAL*weights[a]/sum-Math.floor(WEEKLY_GOAL*weights[a]/sum))).slice(0,rem).forEach(s=>totals[s]++);
    return totals;
  }
  function renderAdaptive(){
    const plan=adaptivePlan(currentWeek),container=$("adaptiveSuggestion");
    container.innerHTML=SUBJECTS.map(s=>`<div class="adaptive-subject"><span>${s}</span><b>${plan[s]} questões</b></div>`).join("");
    $("applyTargets").onclick=()=>{const w=state.weeks[currentWeek-1];const count={};w.days.forEach(d=>d.blocks.forEach(b=>count[b.subject]=(count[b.subject]||0)+1));
      const assigned={};SUBJECTS.forEach(sub=>assigned[sub]=0);
      w.days.forEach(d=>d.blocks.forEach(b=>{const total=plan[b.subject],slots=count[b.subject]||1,base=Math.floor(total/slots),extra=assigned[b.subject]<(total%slots)?1:0;b.targetQuestions=base+extra;assigned[b.subject]++;}));
      state.v2.adaptiveTargets[currentWeek]=plan;save();renderSchedule();notify("Metas adaptativas aplicadas à semana.");};
    $("restoreTargets").onclick=()=>{const w=state.weeks[currentWeek-1];w.days.forEach(d=>d.blocks.forEach(b=>b.targetQuestions=0));delete state.v2.adaptiveTargets[currentWeek];save();renderSchedule();notify("Metas padrão restauradas.");};
  }
  function renderReviewDue(){
    const today=todayISO(),due=[];
    state.errors.forEach(e=>{if(!e.mastered&&e.review&&e.review.stage<4&&e.review.nextDue&&e.review.nextDue<=today)due.push(e);});
    $("reviewDueCount").textContent=`${due.length} pendentes`;
    $("reviewDueList").innerHTML=due.length?due.map(e=>`<div class="review-due-item"><div><strong>${escapeHTML(e.subject)} · ${escapeHTML(e.reason)}</strong><small>${escapeHTML(e.description.slice(0,105))}${e.description.length>105?"…":""}</small><span class="review-stage">Etapa ${e.review.stage+1}/4 · ${e.review.nextDue<today?"Atrasada":"Vence hoje"}</span></div><button class="btn btn-primary" data-review-done="${e.id}">Concluir revisão</button><button class="link-action" data-review-retry="${e.id}">Errei novamente</button></div>`).join(""):'<div class="review-empty">Nenhuma revisão vencida hoje. Continue mantendo a sequência!</div>';
    document.querySelectorAll("[data-review-done]").forEach(b=>b.onclick=()=>completeReview(b.dataset.reviewDone));
    document.querySelectorAll("[data-review-retry]").forEach(b=>b.onclick=()=>restartReview(b.dataset.reviewRetry));
  }
  function completeReview(id){
    const e=state.errors.find(x=>x.id===id);if(!e)return;
    const intervals=[1,7,15,30];e.review=e.review||{stage:0,history:[]};e.review.history=e.review.history||[];
    e.review.history.push({completedAt:todayISO(),stage:e.review.stage+1});
    e.review.stage++;
    if(e.review.stage>=4){e.review.nextDue=null;e.mastered=true;awardXP(20,"ciclo de revisão concluído");}
    else e.review.nextDue=addDaysISO(todayISO(),intervals[e.review.stage]);
    save();renderErrors();notify(e.review.stage>=4?"Ciclo completo: conteúdo dominado!":"Revisão concluída. Próximo ciclo agendado.");
  }
  function restartReview(id){
    const e=state.errors.find(x=>x.id===id);if(!e)return;
    e.review={stage:0,nextDue:addDaysISO(todayISO(),1),history:e.review?.history||[]};e.mastered=false;save();renderErrors();notify("Ciclo reiniciado para amanhã.");
  }
  function setupTimer(){
    const display=$("timerDisplay");
    function paint(){const sec=timerElapsed+ (timerStartedAt?Math.floor((Date.now()-timerStartedAt)/1000):0);const h=String(Math.floor(sec/3600)).padStart(2,"0"),m=String(Math.floor(sec%3600/60)).padStart(2,"0"),s=String(sec%60).padStart(2,"0");display.textContent=`${h}:${m}:${s}`;}
    $("timerStart").onclick=()=>{if(timerStartedAt)return;timerSubject=$("timerSubject").value;timerStartedAt=Date.now();$("timerStart").disabled=true;$("timerStop").disabled=false;timerInterval=setInterval(paint,1000);paint();};
    $("timerStop").onclick=()=>{if(!timerStartedAt)return;timerElapsed+=Math.floor((Date.now()-timerStartedAt)/1000);timerStartedAt=null;clearInterval(timerInterval);timerInterval=null;const mins=Math.floor(timerElapsed/60);if(mins>0){state.v2.studyMinutes+=mins;state.v2.studyBySubject[timerSubject]=(state.v2.studyBySubject[timerSubject]||0)+mins;awardXP(mins*XP_RULES.minute,"tempo estudado");save();renderV2Dashboard();notify(`${mins} minutos registrados em ${timerSubject}.`);}else notify("Sessão muito curta: nenhum minuto completo foi contabilizado.");timerElapsed=0;paint();$("timerStart").disabled=false;$("timerStop").disabled=true;};
    document.addEventListener("visibilitychange",()=>{if(timerStartedAt)paint();});
  }
  function updateRealCalendar(){
    const actual=new Date(),year=actual.getFullYear();
    let active=0;
    if(year===2027){const diff=Math.floor((new Date(2027,actual.getMonth(),actual.getDate())-new Date(2027,0,4))/86400000);if(diff>=0&&diff<WEEKS*7)active=Math.floor(diff/7)+1;}
    const target=active|| (actual<new Date(2027,0,4)?1:44);
    if(!calendarInitialized){if(active){currentWeek=active;currentMonth=Math.floor((active-1)/4);}else if(year>2027 || (year===2027 && actual>=new Date(2027,11,1))){currentWeek=44;currentMonth=10;}calendarInitialized=true;
      $("weekSelect").innerHTML=Array.from({length:4},(_,i)=>{const n=currentMonth*4+i+1;return `<option value="${n}" ${n===currentWeek?"selected":""}>Semana ${String(n).padStart(2,"0")}</option>`;}).join("");
      document.querySelectorAll(".month-tab").forEach(b=>b.classList.toggle("active",Number(b.dataset.month)===currentMonth));
    }
    const range=realWeekRange(currentWeek);
    $("weekTitle").innerHTML=`Semana ${String(currentWeek).padStart(2,"0")} <span>· ${range.from} a ${range.to} de 2027</span>`;
    $("weekLabel").textContent=`${MONTHS[Math.floor((currentWeek-1)/4)].toUpperCase()} · SEMANA ${String(((currentWeek-1)%4)+1).padStart(2,"0")}`;
    document.querySelectorAll(".month-tab").forEach(b=>b.classList.toggle("current-month",Number(b.dataset.month)===Math.floor((target-1)/4)));
    if(active&&currentWeek===active)$("weekLabel").insertAdjacentHTML("beforeend",' <span class="current-week-flag">· SEMANA ATUAL</span>');
    else if(year<2027&&currentWeek===1)$("weekLabel").insertAdjacentHTML("beforeend",' <span class="current-week-flag">· INÍCIO EM 04 JAN 2027</span>');
  }
  function renderSimTriPreview(){
    const raw={lang:Number($("simLang").value)||0,hum:Number($("simHum").value)||0,nat:Number($("simNat").value)||0,math:Number($("simMath").value)||0};
    const estimates=[["lang","Linguagens"],["hum","Humanas"],["nat","Natureza"],["math","Matemática"]].map(([k,label])=>{
      const easy=$("easy"+k[0].toUpperCase()+k.slice(1)).value,hard=$("hard"+k[0].toUpperCase()+k.slice(1)).value;
      return {label,...estimateArea(raw[k],easy===""?undefined:Number(easy),hard===""?undefined:Number(hard))};
    });
    $("simTriPreview").textContent="Estimativa heurística: "+estimates.map(x=>`${x.label} ${x.score} (${x.hasPattern?x.coherence.toFixed(0)+"% coerência":"sem padrão"})`).join(" · ")+($("simEssay").value?` · Redação registrada ${$("simEssay").value}/1000`:"");
  }
  function setupV2(){
    ensureV2();migrateV1();
    // Persist migrated structure immediately without rewriting legacy records.
    persist();
    setupTimer();
    ["simLang","simHum","simNat","simMath","easyLang","hardLang","easyHum","hardHum","easyNat","hardNat","easyMath","hardMath"].forEach(id=>$(id).addEventListener("input",renderSimTriPreview));
    // v2 export is installed on the visible backup controls.
    $("exportBtn").onclick=exportV2Backup;$("footerExport").onclick=exportV2Backup;
    $("importFile").onchange=importV2Backup;
    renderV2Dashboard();renderReviewDue();renderAdaptive();updateRealCalendar();
  }
  function exportV2Backup(){
    const payload={...state,version:2,v2:state.v2,exportedAt:new Date().toISOString()};
    const blob=new Blob([JSON.stringify(payload,null,2)],{type:"application/json"}),url=URL.createObjectURL(blob),a=document.createElement("a");
    a.href=url;a.download=`atlas-enem-2027-v2-backup-${todayISO()}.json`;a.click();URL.revokeObjectURL(url);notify("Backup v2.0 exportado.");
  }
  function importV2Backup(e){
    const file=e.target.files?.[0];if(!file)return;const reader=new FileReader();
    reader.onload=()=>{try{const data=JSON.parse(reader.result);const clean=sanitizeState(data);
      if(!confirm("Importar o backup substituirá os dados atuais. Deseja continuar?"))return;
      state=clean;
      ensureV2();persist();renderAll();renderV2Dashboard();renderReviewDue();notify("Backup importado com dados v2.0.");
    }catch(err){alert("Backup inválido ou incompatível.");}finally{$("importFile").value="";}};
    reader.readAsText(file);
  }
  // Preserve legacy save path and award XP only for newly added activity.
  const legacySave=save;
  save=function(){const oldTier=state.v2.lastTier||tierFor(rankingScore().score).id;syncStudyXP();const newTier=tierFor(rankingScore().score).id;if(oldTier!==newTier){state.v2.rankHistory.push({from:oldTier,to:newTier,date:todayISO()});state.v2.rankHistory=state.v2.rankHistory.slice(-30);}state.v2.lastTier=newTier;legacySave();renderV2Dashboard();renderReviewDue();};
  const legacyRenderSchedule=renderSchedule;
  renderSchedule=function(){legacyRenderSchedule();renderAdaptive();updateRealCalendar();};
  const legacyRenderErrors=renderErrors;
  renderErrors=function(){legacyRenderErrors();renderReviewDue();};
  const legacyRenderSimulations=renderSimulations;
  renderSimulations=function(){legacyRenderSimulations();renderV2Dashboard();};
  const legacyRenderAll=renderAll;
  renderAll=function(){legacyRenderAll();renderV2Dashboard();renderReviewDue();renderAdaptive();updateRealCalendar();};
  // Add one-time rewards for new essay delivery and simulation, while guarding duplicate saves.
  const legacyEssayHandler=$("essayTask");
  function installV2Listeners(){
    $("demoBtn").addEventListener("click",()=>{if(!confirm("Carregar os dados de exemplo substituirá os dados atuais. Deseja continuar?"))return;state=createDemoState();ensureV2();migrateV1();currentMonth=0;currentWeek=1;save();renderAll();notify("Dados de exemplo carregados.");});
    $("rankWeightsControls").addEventListener("change",e=>{const key=e.target.dataset.rankWeight;if(!key)return;state.v2.rankWeights[key]=Math.max(0,Math.min(100,Number(e.target.value)||0));save();});
    $("essayTask").addEventListener("change",e=>{const k="essay-"+currentWeek;if(e.target.checked&&!state.v2.xpLedger[k]){state.v2.xpLedger[k]=true;awardXP(100,"redação semanal");}save();});
    $("simTask").addEventListener("change",e=>{const k="sim-"+currentWeek;if(e.target.checked&&!state.v2.xpLedger[k]){state.v2.xpLedger[k]=true;awardXP(50,"simulado realizado");}save();});
    $("weekSelect").addEventListener("change",()=>{renderAdaptive();updateRealCalendar();});
    $("monthTabs").addEventListener("click",()=>setTimeout(()=>{renderAdaptive();updateRealCalendar();},0));
  }

  function renderAll(){applyTheme();renderSchedule();renderSimulations();renderErrors();updateDashboard();}
  function init(){state=loadState();ensureV2();migrateV1();initSelects();setupNavigation();setupSimForm();setupErrorForm();renderAll();if(window.lucide)lucide.createIcons();setupV2();installV2Listeners();window.addEventListener("storage",e=>{if(e.key===STORAGE_KEY){state=loadState();ensureV2();renderAll();}});}
  document.addEventListener("DOMContentLoaded",init);
})();
