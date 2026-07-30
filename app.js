const networks=[
["经济、社会与发展","Economic, Social and Development",["economic","social","development","programme","program","policy","sustainable","gender","environment","human rights"],["policy analysis","programme delivery","stakeholder engagement"]],
["信息与通信技术","Information and Telecommunication Technology",["information technology","ict","software","data","cyber","systems","digital","telecommunication"],["systems delivery","data and security","technical problem-solving"]],
["内部安保与安全","Internal Security and Safety",["security","safety","risk assessment","close protection"],["risk assessment","incident response","security planning"]],
["法律","Legal",["legal","law","jurisprudence","treaty","compliance"],["legal research","drafting and interpretation","due process"]],
["物流、运输与供应链","Logistics, Transportation and Supply Chain",["logistics","procurement","supply chain","transport","engineering","facilities"],["procurement and logistics","vendor management","operational continuity"]],
["管理与行政","Management and Administration",["administration","human resources","finance","budget","audit","management","evaluation"],["operational planning","resource management","process improvement"]],
["政治、和平与人道主义","Political, Peace and Humanitarian",["political","peace","humanitarian","civil affairs","electoral","rule of law"],["political analysis","conflict sensitivity","humanitarian coordination"]],
["公共信息与会议管理","Public Information and Conference Management",["public information","communications","communication","conference","language","interpretation","translation","outreach"],["audience strategy","content and messaging","conference delivery"]],
["科学","Science",["science","scientific","medical","health","epidemiology","laboratory"],["scientific analysis","evidence quality","technical communication"]]
];
const dimensions=[
["包容","Inclusion",["diversity","inclusive","gender","culture","stakeholder","community"],e=>`Tell us about a time you ensured different perspectives were included while working on ${e}.`,"Whose perspective was easiest to overlook, and what did you change because of it?"],
["正直","Integrity",["integrity","ethical","confidential","accountability","compliance"],e=>`Describe a situation in ${e} where you had to protect an ethical or professional standard under pressure.`,"What would you have done if the preferred option conflicted with the applicable rule?"],
["谦逊","Humility",["feedback","learning","collaborative","support","advice"],e=>`Tell us about a time feedback or new evidence changed your approach to ${e}.`,"What assumption did you have to let go of?"],
["人本","Humanity",["well-being","human","beneficiary","people","community","protection"],e=>`Give an example of how you kept the people affected by ${e} at the centre of a difficult decision.`,"How did you balance human impact with operational constraints?"],
["连接与协作","Connect and Collaborate",["coordinate","partner","liaise","team","stakeholder","collaborate"],e=>`Tell us about a time you brought different stakeholders together to deliver ${e}.`,"Which interest was hardest to align, and what did you personally do?"],
["分析与规划","Analyse and Plan",["analyse","analyze","research","plan","monitor","evaluate","data","strategy"],e=>`Describe how you analysed incomplete or complex information to plan ${e}.`,"Which evidence most influenced your decision, and what uncertainty remained?"],
["交付积极成果","Deliver Results with Positive Impact",["deliver","implement","result","deadline","output","manage","performance"],e=>`Tell us about a time you delivered ${e} under significant constraints.`,"What did you deprioritise, and how did you measure the result?"],
["学习与发展","Learn and Develop",["learn","knowledge","training","capacity","improve","innovation"],e=>`Give an example of how you learned or adapted quickly while working on ${e}.`,"How did that lesson change your later behaviour?"],
["适应与创新","Adapt and Innovate",["adapt","change","innovation","improve","dynamic","creative","solution"],e=>`Describe a time you adapted or introduced a better approach to ${e}.`,"How did you test the change before relying on it?"]
];
const fallback=["a time-sensitive assignment","a cross-functional deliverable","a task involving multiple stakeholders","a decision based on incomplete information"];
const clean=s=>s.replace(/\s+/g," ").replace(/[•●▪◦]/g," ").trim();
const score=(text,keys)=>keys.reduce((n,k)=>n+(text.toLowerCase().includes(k)?1:0),0);
const concise=s=>{const words=clean(s).replace(/^(responsibilities|duties)/i,"").replace(/^[:\s]+/,"").replace(/[.;]+$/,"").split(" ");return words.slice(0,18).join(" ")+(words.length>18?"…":"")};
function analyse(text,count){
  const evidence=text.split(/\n|(?<=[.;])\s+(?=[A-Z])/).map(clean).filter(x=>x.length>=35&&x.length<=260).filter(x=>/responsib|deliver|manage|support|coordinate|develop|prepare|conduct|monitor|analyse|analyze|implement|advise|report|liaise|lead|assist/i.test(x));
  const source=evidence.length?evidence:fallback;
  const network=[...networks].sort((a,b)=>score(text,b[2])-score(text,a[2]))[0];
  const dims=[...dimensions].sort((a,b)=>score(text,b[2])-score(text,a[2])).slice(0,4);
  const questions=dims.map((d,i)=>{const ranked=[...source].sort((a,b)=>score(b,d[2])-score(a,d[2]));const e=concise(ranked[i%Math.min(ranked.length,2)]||source[i%source.length]);return{type:"CBI",framework:`${d[0]} · ${d[1]}`,q:d[3](e),zh:`请用真实经历说明：你如何在“${e}”相关场景中体现${d[0]}。`,evidence:e,probe:d[4]}});
  network[3].forEach((focus,i)=>{const e=concise(source[(i+2)%source.length]);questions.push({type:"Technical",framework:`岗位专业能力 · ${focus}`,q:`How would you approach ${e}, with particular attention to ${focus}?`,zh:`你会如何完成这项 JD 任务？请重点说明 ${focus} 方面的方法、判断依据和风险。`,evidence:e,probe:"What would you do in your first 30 days, and what would success look like?"})});
  questions.push({type:"Motivation",framework:"岗位动机与贡献",q:"Why are you interested in this role, and which part of its mandate are you best prepared to contribute to?",zh:"为什么申请这个岗位？请把你的经历、JD 中的实际任务和你能立即贡献的能力连接起来。",evidence:concise(source[0]),probe:"Which responsibility would stretch you most, and how would you close that gap?"});
  return{network,dims,questions:questions.slice(0,count)};
}
const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const text=document.querySelector("#jd-text"),range=document.querySelector("#question-count");
text.addEventListener("input",()=>{document.querySelector("#char-count").textContent=`${text.value.length} 字符`});
range.addEventListener("input",()=>document.querySelector("#count-output").textContent=range.value);
document.querySelector("#jd-form").addEventListener("submit",e=>{
  e.preventDefault();const notice=document.querySelector("#notice");
  if(text.value.trim().length<80){notice.hidden=false;notice.textContent="请先输入至少一段完整的岗位职责或任职要求。";return}
  notice.hidden=true;const r=analyse(text.value,Number(range.value));
  document.querySelector("#results").innerHTML=`<div class="results-top"><div><span class="paper-label">JD ANALYSIS / PRACTICE SET</span><h2>${esc(r.network[0])}</h2><p>${esc(r.network[1])}</p></div><span class="badge">UN Careers 官方岗位网络</span></div><div class="detected"><b>重点价值观与行为</b>${r.dims.map(d=>`<span>${esc(d[0])}<small>${esc(d[1])}</small></span>`).join("")}</div><div>${r.questions.map((q,i)=>`<article class="question-card"><div class="q-number">${String(i+1).padStart(2,"0")}</div><div class="q-content"><div class="tags"><span class="tag">${q.type}</span><span class="tag secondary">${esc(q.framework)}</span></div><h3>${esc(q.q)}</h3><p>${esc(q.zh)}</p><div class="evidence"><b>JD 依据</b><q>${esc(q.evidence)}</q></div><details><summary>查看面试官追问与 STAR 提示</summary><div class="coach"><b>FOLLOW-UP</b><p>${esc(q.probe)}</p><b>STAR CHECK</b><p>背景 10–15% · 任务 10% · 个人行动 55–65% · 结果与反思 15–20%</p></div></details></div></article>`).join("")}</div><aside class="star-note"><div><b>回答前，先问自己</b><span>01 我的个人任务是什么？</span><span>02 我为什么这样做？</span><span>03 有什么可验证结果？</span></div><strong>90–120<small>秒 / 每题</small></strong></aside>`;
  document.querySelector("#results").scrollIntoView({behavior:"smooth",block:"start"});
});
