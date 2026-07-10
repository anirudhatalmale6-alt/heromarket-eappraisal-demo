/* HeroMarket e-Appraisal — Phase 1 clickable demo (dummy data).
   State is in-memory only; refreshing resets it. */

const state = {
  role: "appraiser",              // appraiser | appraisee | depthead | director
  appraisals: {},                 // empNo -> appraisal record
};

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
const initials = n => n.split(/\s+/).slice(0,2).map(w=>w[0]).join("").toUpperCase();
const fmtDate = d => { if(!d) return "—"; const dt=new Date(d); return dt.toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"}); };

function dimsFor(level){ return DIMENSIONS.filter(d => level === "supervisor" ? true : !d.supervisorOnly); }
function maxFor(level){ return level === "supervisor" ? 100 : 70; }

function getAppraisal(emp){
  if(!state.appraisals[emp.empNo]){
    state.appraisals[emp.empNo] = {
      empNo: emp.empNo, scores:{}, evidence:{},
      appraiseeComment:"", managerComment:"", action:"Confirmation",
      newSalary: emp.basicSalary, stepIndex:0, // 0=appraiser working
      history:[]
    };
  }
  return state.appraisals[emp.empNo];
}

function totalScore(emp, a){
  return dimsFor(emp.level).reduce((s,d)=> s + (a.scores[d.key]||0), 0);
}
function bandFor(pct){ return RATING_BANDS.find(b => pct >= b.min && pct <= b.max) || RATING_BANDS[RATING_BANDS.length-1]; }

/* ---------- Toast ---------- */
let toastT;
function toast(msg){
  let t = $(".toast"); if(!t){ t = el("div","toast"); document.body.appendChild(t); }
  t.innerHTML = "✅ " + msg; t.classList.add("show");
  clearTimeout(toastT); toastT = setTimeout(()=>t.classList.remove("show"), 2600);
}

/* ---------- Router ---------- */
function render(){
  const root = $("#view");
  root.innerHTML = "";
  if(state.current){ renderForm(root, EMPLOYEES.find(e=>e.empNo===state.current)); }
  else { renderList(root); }
}

/* ---------- List / inbox ---------- */
function renderList(root){
  const title = el("div");
  title.innerHTML = `<div class="page-title">Appraisals due for confirmation</div>
    <div class="page-sub">Staff on probation with an upcoming Confirmation Due Date. In production this list auto-populates from the employee master data.</div>`;
  root.appendChild(title);

  const grid = el("div","grid");
  EMPLOYEES.forEach(emp=>{
    const a = getAppraisal(emp);
    const c = el("div","card emp-card");
    c.onclick = ()=>{ state.current = emp.empNo; render(); window.scrollTo(0,0); };

    const stTotal = APPROVAL_STEPS.length;
    const done = a.stepIndex;
    const statusBadge = a.stepIndex >= stTotal
      ? `<span class="badge b-done"><span class="dot"></span>Approved</span>`
      : a.stepIndex === 0
        ? `<span class="badge b-prob"><span class="dot"></span>Pending appraisal</span>`
        : `<span class="badge b-progress"><span class="dot"></span>In review · ${APPROVAL_STEPS[a.stepIndex].title}</span>`;

    const lvlBadge = emp.level==="supervisor"
      ? `<span class="badge b-supervisor">Supervisor · /100</span>`
      : `<span class="badge b-support">Support Staff · /70</span>`;

    const miniSteps = APPROVAL_STEPS.map((s,i)=>{
      const cls = i < a.stepIndex ? "done" : (i===a.stepIndex ? "cur":"");
      return `<div class="s ${cls}"></div>`;
    }).join("");

    c.innerHTML = `
      <div class="emp-top">
        <div class="avatar">${initials(emp.name)}</div>
        <div style="flex:1">
          <div class="emp-name">${emp.name}</div>
          <div class="emp-role">${emp.position} · ${emp.department}</div>
        </div>
      </div>
      <div class="emp-meta">
        <span><b>ID</b> ${emp.empNo}</span>
        <span><b>Outlet</b> ${emp.outlet}</span>
        <span><b>Confirm due</b> ${fmtDate(emp.confirmDue)}</span>
      </div>
      <div class="rowline">${lvlBadge}${statusBadge}</div>
      <div class="mini-steps">${miniSteps}</div>`;
    grid.appendChild(c);
  });
  root.appendChild(grid);

  const note = el("div","note",
    `<b>Demo notes.</b> This is Phase 1 — the e-appraisal form + auto-scoring + multi-level approval flow, with dummy staff.
     Use the <b>role switcher</b> at the top-right to experience the same appraisal as the Appraiser, the Staff member,
     the Dept Head and the Director — each sees only what they're allowed to. The confidential manager & salary section
     stays hidden from the staff member, exactly as the paper form requires.`);
  root.appendChild(note);
}

/* ---------- Appraisal form ---------- */
function renderForm(root, emp){
  const a = getAppraisal(emp);
  const dims = dimsFor(emp.level);
  const roleLabels = {appraiser:"Appraiser", appraisee:"Staff (Appraisee)", depthead:"Dept Head", director:"Director"};

  const head = el("div","form-head");
  head.innerHTML = `<div class="back" id="back">← Back to list</div>
     <div class="spacer"></div>
     <span class="badge ${emp.level==='supervisor'?'b-supervisor':'b-support'}">${emp.grade}</span>`;
  root.appendChild(head);
  head.querySelector("#back").onclick = ()=>{ state.current=null; render(); window.scrollTo(0,0); };

  root.appendChild(el("div","",
    `<div class="page-title">Staff Appraisal — ${emp.name}</div>
     <div class="page-sub">Viewing as <b>${roleLabels[state.role]}</b> · MY HERO HYPERMARKET SDN BHD</div>`));

  /* Approval progress stepper */
  const stepCard = el("div","card"); const stepBody = el("div","section");
  stepBody.appendChild(buildStepper(a));
  stepCard.appendChild(stepBody); root.appendChild(stepCard);

  /* Employee auto-filled info */
  const infoCard = el("div","card"); infoCard.style.marginTop="14px";
  const info = el("div","section");
  info.innerHTML = `<h3>Employee Information</h3>
    <p class="hint">Auto-filled from the employee master record — no manual typing.</p>
    <div class="kv">
      <div><div class="k">Staff ID</div><div class="v">${emp.empNo}</div></div>
      <div><div class="k">Employee Name</div><div class="v">${emp.name}</div></div>
      <div><div class="k">Current Position</div><div class="v">${emp.position}</div></div>
      <div><div class="k">Department / Outlet</div><div class="v">${emp.department} (${emp.outlet})</div></div>
      <div><div class="k">Date Joined</div><div class="v">${fmtDate(emp.dateJoined)}</div></div>
      <div><div class="k">Confirmation Due</div><div class="v">${fmtDate(emp.confirmDue)}</div></div>
      <div><div class="k">Appraiser (Superior)</div><div class="v">${emp.superiorName}</div></div>
      <div><div class="k">Action</div><div class="v">Confirmation</div></div>
    </div>`;
  infoCard.appendChild(info); root.appendChild(infoCard);

  /* Rating dimensions — editable only by appraiser at step 0 */
  const editable = state.role === "appraiser" && a.stepIndex === 0;
  const ratingCard = el("div","card"); ratingCard.style.marginTop="14px";
  const rsec = el("div","section");
  rsec.innerHTML = `<h3>Performance Assessment</h3>
    <p class="hint">Rate each area 1 (Very Poor) to 10 (Excellent). ${emp.level==='supervisor'
      ? 'Supervisor scale: all 10 areas, out of 100.'
      : 'Support-staff scale: 7 areas, out of 70. (Leadership / Developing / Delegation apply to supervisors and above.)'}</p>`;
  dims.forEach(d=>{
    const row = el("div","dim");
    const scaleBtns = Array.from({length:10},(_,i)=>{
      const v=i+1; const sel = a.scores[d.key]===v ? "sel":"";
      return `<button class="${sel}" data-k="${d.key}" data-v="${v}" ${editable?"":"disabled"}>${v}</button>`;
    }).join("");
    row.innerHTML = `
      <div class="dh"><span class="num">${d.n}.</span><span class="dt">${d.title}${d.supervisorOnly?'<span class="sup-tag">SUPERVISOR+</span>':''}</span></div>
      <div class="dq">${d.q}</div>
      <div class="scale">${scaleBtns}</div>
      <div class="evidence"><textarea data-ev="${d.key}" placeholder="Evidence to justify the rating (optional in demo)" ${editable?"":"disabled"}>${a.evidence[d.key]||""}</textarea></div>`;
    rsec.appendChild(row);
  });
  ratingCard.appendChild(rsec); root.appendChild(ratingCard);

  /* live score panel */
  const scoreWrap = el("div","scorewrap"); scoreWrap.id="scoreWrap";
  scoreWrap.appendChild(buildScore(emp,a));
  root.appendChild(scoreWrap);

  /* Appraisee comment */
  const apCard = el("div","card"); apCard.style.marginTop="14px";
  const apSec = el("div","section");
  const apEditable = state.role==="appraisee" && a.stepIndex===1;
  apSec.innerHTML = `<h3>Appraisee's Comment</h3>
    <p class="hint">The staff member's own comment on how to improve. ${apEditable?'You can edit this now.':''}</p>
    <textarea data-appraisee style="width:100%;min-height:64px;border:1px solid var(--line);border-radius:9px;padding:9px 11px;font:inherit;font-size:13px" ${apEditable?"":"disabled"} placeholder="Comment by staff...">${a.appraiseeComment||""}</textarea>`;
  apCard.appendChild(apSec); root.appendChild(apCard);

  /* Confidential manager + salary section — hidden from appraisee */
  const confCard = el("div","card"); confCard.style.marginTop="14px";
  const confSec = el("div","section");
  const cHead = `<h3>Manager Section & Salary <span class="demo-flag">CONFIDENTIAL</span></h3>`;
  if(state.role==="appraisee"){
    confSec.innerHTML = cHead + `<div class="locked">🔒 This section is confidential and not disclosed to the staff member (as per the appraisal form).</div>`;
  } else {
    const cEditable = (state.role==="appraiser" && a.stepIndex===0) || (state.role==="depthead" && a.stepIndex===2) || (state.role==="director" && a.stepIndex===3);
    confSec.innerHTML = cHead +
      `<div class="conf">
        <div class="lbl">🔒 Not disclosed to appraisee</div>
        <div class="kv">
          <div><div class="k">Recommended Action</div>
            <div class="v"><select data-action ${cEditable?"":"disabled"} style="font:inherit;padding:6px 8px;border-radius:8px;border:1px solid var(--line)">
              ${["Confirmation","Promotion","Adjustment","Extension"].map(o=>`<option ${a.action===o?"selected":""}>${o}</option>`).join("")}
            </select></div></div>
          <div><div class="k">Current Basic Salary</div><div class="v">RM ${emp.basicSalary.toLocaleString()}</div></div>
          <div><div class="k">New Basic Salary (RM)</div>
            <div class="v"><input data-salary type="number" value="${a.newSalary}" ${cEditable?"":"disabled"} style="font:inherit;padding:6px 8px;border-radius:8px;border:1px solid var(--line);width:130px"></div></div>
        </div>
        <div style="margin-top:10px">
          <div class="k" style="margin-bottom:4px">Manager / Verifier Comment</div>
          <textarea data-manager style="width:100%;min-height:56px;border:1px solid var(--line);border-radius:9px;padding:9px 11px;font:inherit;font-size:13px" ${cEditable?"":"disabled"} placeholder="Confidential comment / training recommended...">${a.managerComment||""}</textarea>
        </div>
      </div>`;
  }
  confCard.appendChild(confSec); root.appendChild(confCard);

  /* Action bar for current role/step */
  const actCard = el("div","card"); actCard.style.marginTop="14px";
  const actSec = el("div","section");
  actSec.appendChild(buildActionBar(emp,a));
  actCard.appendChild(actSec); root.appendChild(actCard);

  wireForm(emp,a);
}

function buildStepper(a){
  const wrap = el("div","stepper");
  APPROVAL_STEPS.forEach((s,i)=>{
    const cls = i < a.stepIndex ? "done" : (i===a.stepIndex ? "cur":"");
    const step = el("div","step "+cls);
    step.innerHTML = `<div class="bubble">${i<a.stepIndex?"✓":i+1}</div>
      <div class="st">${s.title}</div><div class="sw">${s.who}</div>`;
    wrap.appendChild(step);
  });
  return wrap;
}

function buildScore(emp,a){
  const total = totalScore(emp,a);
  const max = maxFor(emp.level);
  const pct = Math.round(total/max*100);
  const band = bandFor(pct);
  const filled = dimsFor(emp.level).filter(d=>a.scores[d.key]).length;
  const allRated = filled === dimsFor(emp.level).length;
  const card = el("div","scorecard");
  card.innerHTML = `
    <div><div class="score-num">${total}<span class="score-den">/${max}</span></div>
      <div class="score-pct">${filled}/${dimsFor(emp.level).length} areas rated</div></div>
    <div style="text-align:center"><div class="bandpill ${band.cls}">${pct}% · ${allRated?band.label:"—"}</div>
      <div class="score-pct" style="margin-top:4px">${allRated?band.remark:"Rate all areas to see the band"}</div></div>
    <div class="prog-bar"><i style="width:${Math.round(filled/dimsFor(emp.level).length*100)}%"></i></div>`;
  return card;
}

function buildActionBar(emp,a){
  const bar = el("div","");
  bar.style.display="flex"; bar.style.gap="10px"; bar.style.flexWrap="wrap"; bar.style.alignItems="center";
  const stTotal = APPROVAL_STEPS.length;

  if(a.stepIndex >= stTotal){
    bar.innerHTML = `<span class="badge b-done" style="font-size:13px"><span class="dot"></span>Fully approved</span>
      <span class="page-sub" style="margin:0">Outcome saved to HR database · emailed to PIC / Payroll for filing.</span>`;
    return bar;
  }

  const stepRole = APPROVAL_STEPS[a.stepIndex].key;
  const roleMatchesStep = (state.role==="appraiser"&&stepRole==="appraiser")
    || (state.role==="appraisee"&&stepRole==="appraisee")
    || (state.role==="depthead"&&stepRole==="depthead")
    || (state.role==="director"&&stepRole==="director");

  const info = el("div"); info.className="page-sub"; info.style.margin="0"; info.style.flex="1";

  if(!roleMatchesStep){
    info.innerHTML = `Waiting on <b>${APPROVAL_STEPS[a.stepIndex].title}</b> (${APPROVAL_STEPS[a.stepIndex].who}). Switch role to <b>${APPROVAL_STEPS[a.stepIndex].title}</b> to act.`;
    bar.appendChild(info);
    return bar;
  }

  const labels = {
    appraiser:"Submit appraisal → send to staff",
    appraisee:"Acknowledge & send to Dept Head",
    depthead:"Verify → send to Director",
    director:"Approve & finalise"
  };
  const btn = el("button","btn btn-primary");
  btn.innerHTML = (a.stepIndex===stTotal-1?"✓ ":"→ ") + labels[stepRole];
  btn.onclick = ()=>advance(emp,a);

  // require appraiser to rate everything
  if(stepRole==="appraiser"){
    const allRated = dimsFor(emp.level).every(d=>a.scores[d.key]);
    btn.disabled = !allRated;
    info.innerHTML = allRated ? "All areas rated — ready to submit." : "Rate all performance areas to enable submit.";
  } else {
    info.innerHTML = `You're acting as <b>${APPROVAL_STEPS[a.stepIndex].title}</b>.`;
  }
  bar.appendChild(info); bar.appendChild(btn);
  return bar;
}

function advance(emp,a){
  const stepRole = APPROVAL_STEPS[a.stepIndex].key;
  a.history.push({step:APPROVAL_STEPS[a.stepIndex].title, role:state.role});
  a.stepIndex++;
  const msgs = {
    appraiser:"Appraisal submitted — sent to the staff member to acknowledge.",
    appraisee:"Acknowledged — sent to Dept Head for verification.",
    depthead:"Verified — sent to the Director for approval.",
    director:"Approved! Saved to HR database and emailed to PIC / Payroll for filing."
  };
  toast(msgs[stepRole]);
  state.current = null;           // return to the inbox so the status update is visible
  render(); window.scrollTo(0, 0);
}

function wireForm(emp,a){
  // rating buttons
  $$(".scale button").forEach(b=>{
    b.onclick = ()=>{
      const k=b.dataset.k, v=+b.dataset.v;
      a.scores[k]=v;
      $$(`.scale button[data-k="${k}"]`).forEach(x=>x.classList.toggle("sel", +x.dataset.v===v));
      const sw=$("#scoreWrap"); sw.innerHTML=""; sw.appendChild(buildScore(emp,a));
      // refresh action bar enable state
      refreshActionBar(emp,a);
    };
  });
  $$("textarea[data-ev]").forEach(t=> t.oninput=()=>{ a.evidence[t.dataset.ev]=t.value; });
  const ap=$("textarea[data-appraisee]"); if(ap) ap.oninput=()=>a.appraiseeComment=ap.value;
  const mg=$("textarea[data-manager]"); if(mg) mg.oninput=()=>a.managerComment=mg.value;
  const ac=$("select[data-action]"); if(ac) ac.onchange=()=>a.action=ac.value;
  const sal=$("input[data-salary]"); if(sal) sal.oninput=()=>a.newSalary=+sal.value;
}

function refreshActionBar(emp,a){
  const cards = $$("#view .card");
  const last = cards[cards.length-1];
  const sec = last.querySelector(".section");
  sec.innerHTML=""; sec.appendChild(buildActionBar(emp,a));
  wireActionOnly(emp,a);
}
function wireActionOnly(emp,a){ /* action buttons are wired inside buildActionBar via onclick */ }

/* ---------- boot ---------- */
function boot(){
  const sel = $("#roleSelect");
  sel.value = state.role;
  sel.onchange = ()=>{ state.role = sel.value; render(); };
  render();
}
document.addEventListener("DOMContentLoaded", boot);
