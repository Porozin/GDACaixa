(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))o(n);new MutationObserver(n=>{for(const d of n)if(d.type==="childList")for(const s of d.addedNodes)s.tagName==="LINK"&&s.rel==="modulepreload"&&o(s)}).observe(document,{childList:!0,subtree:!0});function t(n){const d={};return n.integrity&&(d.integrity=n.integrity),n.referrerPolicy&&(d.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?d.credentials="include":n.crossOrigin==="anonymous"?d.credentials="omit":d.credentials="same-origin",d}function o(n){if(n.ep)return;n.ep=!0;const d=t(n);fetch(n.href,d)}})();(function(){const e=document.querySelector(".orb-primary"),t=document.querySelector(".orb-secondary");if(!e||!t)return;let o=window.innerWidth*.5,n=window.innerHeight*.5,d=o,s=n,r=o,i=n;document.addEventListener("mousemove",v=>{o=v.clientX,n=v.clientY});function l(){d+=(o-d)*.08,s+=(n-s)*.08,r+=(o-r)*.12,i+=(n-i)*.12,e.style.transform=`translate(${d-window.innerWidth*.3}px, ${s-window.innerHeight*.3}px)`,t.style.transform=`translate(${r-window.innerWidth*.2}px, ${i-window.innerHeight*.2}px)`,requestAnimationFrame(l)}l()})();const se="AIzaSyB5BffrCFT",de="107idfh_JjJJOrPz_",ie="6efVNfg",re={apiKey:se+de+ie,authDomain:"guerreiros-do-alto.firebaseapp.com",projectId:"guerreiros-do-alto",storageBucket:"guerreiros-do-alto.firebasestorage.app",messagingSenderId:"802996872207",appId:"1:802996872207:web:648ed8293270004f122f7a",measurementId:"G-G60Q4V6QSR"};firebase.initializeApp(re);const x=firebase.firestore();let c={clube:{transactions:[],sugestoes:[]},doceria:{pedidos:[],materias:[],gastos:[],entradas:[]},vendas:{vendas:[],produtos:[],vendedores:[],avarias:[],debitos:[]}},J=!1,C=[],M=[],W=[],L=null,k=null,H=null,p=null,g=null,F=[],I=[],B=[],Q=[],_=null,D=null,S=null,q=null;function le(){U(),document.getElementById("login-overlay").classList.add("hidden"),document.body.className=`app-mode-${p}`;const a=document.getElementById("userInfoBtn"),e=document.getElementById("userDisplayName"),t=document.getElementById("userRoleBadge"),o={admin:"👑",diretor:"🎖️",conselheiro:"🧭",desbravador:"⚔️"};if(a&&(a.style.display=p==="admin"||p==="diretor"?"flex":"none"),e&&(e.textContent=(g==null?void 0:g.nome)||(g==null?void 0:g.usuario)||p),t&&(t.textContent=o[p]||""),p==="desbravador"&&g){c.vendas.vendedores.find(s=>s.nome.toLowerCase()===g.nome.toLowerCase())||(c.vendas.vendedores.push({id:ue(),nome:g.nome}),ve());const d=document.getElementById("vnd-vendedor-group");d&&(d.style.display="none")}G(),K(),ee(),(p==="admin"||p==="diretor")&&oe(),te(),Y("Bem-vindo, "+((g==null?void 0:g.nome)||p)+"!")}function U(){_&&_(),_=x.collection("gda_usuarios").orderBy("criadoEm").onSnapshot(a=>{F=a.docs.map(e=>({id:e.id,...e.data()})),Ae(),p&&te()}),D&&D(),D=x.collection("gda_metas_doceria").orderBy("criadoEm").onSnapshot(a=>{I=a.docs.map(e=>({id:e.id,...e.data()})),p&&(ne(),A())}),S&&S(),S=x.collection("gda_metas_vendas").orderBy("criadoEm").onSnapshot(a=>{B=a.docs.map(e=>({id:e.id,...e.data()})),p&&A()}),x.collection("gda_caixa").doc("estado").onSnapshot(a=>{a.exists?(c=X(c,a.data()),J=!0,c.clube.sugestoes||(c.clube.sugestoes=[])):console.warn("Documento não existe ainda. Não sobrescrevendo."),p&&(G(),K(),ee())}),L&&L(),L=x.collection("gda_unidades").orderBy("criadoEm").onSnapshot(a=>{C=a.docs.map(e=>({id:e.id,...e.data()})),p&&(P(),R())}),k&&k(),k=x.collection("gda_metas_clube").orderBy("criadoEm").onSnapshot(a=>{M=a.docs.map(e=>({id:e.id,...e.data()})),p&&(R(),fe())}),H&&H(),H=x.collection("gda_metas_unidade").orderBy("criadoEm").onSnapshot(a=>{W=a.docs.map(e=>({id:e.id,...e.data()})),p&&P()}),q&&q(),(p==="admin"||p==="diretor")&&(q=x.collection("gda_privado").orderBy("criadoEm").onSnapshot(a=>{Q=a.docs.map(e=>({id:e.id,...e.data()})),oe()}))}function ce(){U()}function me(a){var e,t,o,n,d,s;return a?((t=(e=a.clube)==null?void 0:e.transactions)==null?void 0:t.length)>0||((n=(o=a.doceria)==null?void 0:o.pedidos)==null?void 0:n.length)>0||((s=(d=a.vendas)==null?void 0:d.vendas)==null?void 0:s.length)>0:!1}function ve(){if(!J){console.warn("Tentativa de salvar estado bloqueada: dados ainda não carregados do DB.");return}if(!me(c)){console.warn("Tentativa de salvar estado vazio bloqueada.");return}x.collection("gda_caixa").doc("estado").set(c,{merge:!0}).catch(a=>{Y("Erro ao sincronizar","error")})}function X(a,e){const t={...a};for(const o in e)Array.isArray(e[o])?t[o]=e[o]:e[o]&&typeof e[o]=="object"?t[o]=X(a[o]||{},e[o]):t[o]=e[o];return t}const m=a=>"R$ "+Number(a||0).toFixed(2).replace(".",",").replace(/\B(?=(\d{3})+(?!\d))/g,"."),ue=()=>Math.random().toString(36).slice(2)+Date.now().toString(36),b=()=>new Date().toISOString().slice(0,10);function f(a){return a?a.slice(0,7):""}function V(a){if(!a)return"";const[e,t]=a.split("-");return["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"][parseInt(t)-1]+" "+e}function O(a,e="data"){const t=new Set;a.forEach(d=>{d[e]&&t.add(f(d[e]))});const o=[...t].sort().reverse(),n=b().slice(0,7);return t.has(n)||o.unshift(n),o}function w(a,e,t){const o=document.getElementById(a);if(!o)return;const n=o.value||e[0]||b().slice(0,7);o.innerHTML="",e.forEach(d=>{const s=document.createElement("option");s.value=d,s.textContent=V(d),d===n&&(s.selected=!0),o.appendChild(s)}),!o.value&&e.length&&(o.value=e[0])}function Y(a,e="success"){const t=document.createElement("div");t.className=`toast ${e}`;const o={success:"✓",error:"✕",info:"ℹ"};t.innerHTML=`<span>${o[e]||"•"}</span><span>${a}</span>`,document.getElementById("toast-container").appendChild(t),setTimeout(()=>{t.style.animation="toastOut .25s ease forwards",setTimeout(()=>t.remove(),260)},2800)}document.addEventListener("click",a=>{!a.target.closest("#exportMenuBtn")&&!a.target.closest("#exportDropdown")&&document.getElementById("exportDropdown").classList.remove("open")});function pe(){const a=document.getElementById("clube-destino");if(!a)return;const e=a.value;a.innerHTML='<option value="">Geral (sem vinculação específica)</option>';const t=M.filter(o=>o.status==="aprovada");if(t.length){const o=document.createElement("optgroup");o.label="🎯 Metas do Clube",t.forEach(n=>{const d=document.createElement("option");d.value=`meta:${n.id}`,d.textContent=n.descricao,o.appendChild(d)}),a.appendChild(o)}if(C.length){const o=document.createElement("optgroup");o.label="🏕️ Unidades",C.forEach(n=>{const d=document.createElement("option");d.value=`unidade:${n.id}`,d.textContent=n.nome+(n.conselheiro?` (${n.conselheiro})`:""),o.appendChild(d)}),a.appendChild(o)}e&&(a.value=e)}let j=null;function G(){const a=O(c.clube.transactions);w("clube-filter-month",a),w("clube-hist-month",a),pe(),be(),ye(a),he(),$e(),ge(),R(),P(),we();const e=document.getElementById("btn-add-clube"),t=document.getElementById("clube-tipo");if(e&&t){const o=()=>{p==="conselheiro"&&t.value==="saida"?(e.textContent="🤞 Sugerir Saída",e.className="btn btn-primary",e.style.background="#60a5fa",e.style.color="#fff"):(e.textContent="✚ Adicionar",e.className="btn btn-primary",e.style.background="",e.style.color="")};t.onchange=o,o()}}function fe(){const a=M.filter(t=>t.status==="sugerida").length,e=document.getElementById("badge-metas");e&&(e.style.display=a>0?"inline-block":"none",e.textContent=a)}function R(){const a=document.getElementById("clube-meta-hero"),e=document.getElementById("metas-clube-list"),t=M.filter(s=>s.status==="aprovada"),o=M.filter(s=>s.status==="sugerida"),n=c.clube.transactions,d=n.filter(s=>s.tipo==="entrada").reduce((s,r)=>s+r.valor,0)-n.filter(s=>s.tipo==="saida").reduce((s,r)=>s+r.valor,0);if(a)if(t.length>0){const s=t[0],r=Math.min(100,Math.round(d/s.valor_alvo*100)),i=d>=s.valor_alvo;a.innerHTML=`
            <div class="goal-hero">
              <div class="goal-hero-header">
                <div class="goal-hero-title">🏕️ ${s.descricao}</div>
                <div class="goal-hero-value">${m(d)} / ${m(s.valor_alvo)}</div>
              </div>
              <div class="progress-track">
                <div class="progress-fill ${i?"over":""}" id="hero-fill" style="width:0%"></div>
              </div>
              <div class="goal-footer">
                <span>${r}% concluído</span>
                <span>${i?"🎉 Meta atingida!":m(s.valor_alvo-d)+" restante"}</span>
              </div>
            </div>`,setTimeout(()=>{const l=document.getElementById("hero-fill");l&&(l.style.width=r+"%")},80)}else a.innerHTML="";if(e){if(!M.length){e.innerHTML='<div class="empty-state"><div class="empty-icon">🎯</div><p>Nenhuma meta cadastrada</p></div>';return}e.innerHTML=[...t,...o].map(s=>{const r=Math.min(100,Math.round(d/s.valor_alvo*100)),i=d>=s.valor_alvo,l=s.status==="sugerida";return`
           <div style="padding:1rem 0;border-bottom:1px solid var(--border-glass)">
             <div style="display:flex;align-items:center;justify-content:space-between;gap:.5rem;margin-bottom:.6rem">
               <div>
                 <span style="font-weight:600;color:var(--text)">${s.descricao}</span>
                 ${l?'<span class="badge-pending" style="margin-left:.4rem">⏳ Pendente</span>':""}
               </div>
              <div style="display:flex;gap:.35rem;align-items:center">
                <span style="font-family:var(--font-mono);font-size:.8rem;color:var(--text3)">${m(s.valor_alvo)}</span>
                ${l&&p==="admin"?`<button class="btn btn-sm" style="background:var(--accent3);color:#111" onclick="aprovarMeta('${s.id}')">✓ Aprovar</button>`:""}
                ${p==="admin"?`<button class="btn btn-ghost btn-icon btn-sm" onclick="deleteMeta('${s.id}')">🗑️</button>`:""}
              </div>
            </div>
            ${l?"":`
              <div class="progress-track" style="height:8px">
                <div class="progress-fill ${i?"over":""}" style="width:${r}%"></div>
              </div>
              <div class="goal-footer"><span>${r}%</span><span>${m(d)} arrecadado</span></div>
            `}
          </div>`}).join("")}}function P(){const a=document.getElementById("unidades-grid");if(a){if(!C.length){a.innerHTML='<div class="empty-state"><div class="empty-icon">🏕️</div><p>Nenhuma unidade cadastrada</p></div>';return}a.innerHTML=C.map(e=>{const t=W.filter(l=>l.unidade_id===e.id),o=c.clube.transactions.filter(l=>l.destino_tipo==="unidade"&&l.destino_id===e.id),n=o.filter(l=>l.tipo==="entrada").reduce((l,v)=>l+v.valor,0)-o.filter(l=>l.tipo==="saida").reduce((l,v)=>l+v.valor,0),d=p==="admin"||p==="conselheiro"&&e.conselheiro,s=t.map(l=>{const v=Math.min(100,Math.round(n/l.valor_alvo*100)),u=n>=l.valor_alvo,y=p==="admin"||p==="conselheiro";return`
            <div style="margin-top:.6rem">
              <div style="display:flex;justify-content:space-between;font-size:.76rem;color:var(--text3);font-family:var(--font-mono);margin-bottom:.3rem">
                <span>${l.descricao}</span>
                <div style="display:flex;gap:.25rem;align-items:center">
                  <span>${n>=0?m(n)+" / ":""}${m(l.valor_alvo)}</span>
                  ${y?`<button class="btn btn-ghost btn-icon btn-sm" style="width:22px;height:22px;font-size:.65rem" onclick="deleteMetaUnidade('${l.id}')">🗑️</button>`:""}
                </div>
              </div>
              <div class="progress-track" style="height:7px">
                <div class="progress-fill ${u?"over":""}" style="width:${v}%"></div>
              </div>
            </div>`}).join(""),r=d?`
           <div style="margin-top:.85rem;padding-top:.75rem;border-top:1px solid var(--border-glass)">
             <div style="display:flex;gap:.4rem">
               <input type="text" id="um-desc-${e.id}" placeholder="Desc. da meta" style="font-size:.78rem" />
               <input type="number" id="um-val-${e.id}" placeholder="R$ Alvo" min="0" step="0.01" style="font-size:.78rem;max-width:90px" />
               <button class="btn btn-primary btn-sm" onclick="addMetaUnidade('${e.id}')">+</button>
             </div>
           </div>`:"",i=o.length;return`
          <div class="unidade-card">
            <div class="unidade-card-header">
              <div>
                <div class="unidade-name">🏕️ ${e.nome}</div>
                <div class="unidade-conselheiro">${e.conselheiro?"👤 "+e.conselheiro:"Sem conselheiro"}${i?" · "+i+" tx vinculada(s)":""}</div>
              </div>
              ${p==="admin"?`<button class="btn btn-ghost btn-icon btn-sm" onclick="deleteUnidade('${e.id}')">🗑️</button>`:""}
            </div>
            ${t.length?s:'<div style="font-size:.78rem;color:var(--text3)">Sem metas definidas</div>'}
            ${r}
          </div>`}).join("")}}function ge(){const a=document.getElementById("badge-sug"),e=document.getElementById("clube-apr-body");if(!a||!e)return;const t=(c.clube.sugestoes||[]).filter(o=>o.status==="pendente");if(t.length>0?(a.style.display="inline-block",a.textContent=t.length):a.style.display="none",!t.length){e.innerHTML='<tr><td colspan="6"><div class="empty-state"><div class="empty-icon">✅</div><p>Nenhuma sugestão pendente</p></div></td></tr>';return}e.innerHTML=t.map(o=>`
    <tr>
      <td class="text-mono">${o.data}</td>
      <td><span class="badge badge-blue">Conselheiro</span></td>
      <td>${o.categoria}</td>
      <td>${o.desc}</td>
      <td class="text-mono negative">-${m(o.valor)}</td>
      <td>
        <div style="display:flex;gap:.3rem">
          <button class="btn btn-sm" style="background:var(--accent3);color:#111" onclick="approveSugestao('${o.id}')">Aprovar</button>
          <button class="btn btn-sm" style="background:var(--accent2);color:#fff" onclick="rejectSugestao('${o.id}')">Recusar</button>
        </div>
      </td>
    </tr>
  `).join("")}function be(){var r;const a=((r=document.getElementById("clube-filter-month"))==null?void 0:r.value)||b().slice(0,7),e=c.clube.transactions.filter(i=>f(i.data)===a),t=e.filter(i=>i.tipo==="entrada").reduce((i,l)=>i+l.valor,0),o=e.filter(i=>i.tipo==="saida").reduce((i,l)=>i+l.valor,0),n=t-o,d=c.clube.transactions,s=d.filter(i=>i.tipo==="entrada").reduce((i,l)=>i+l.valor,0)-d.filter(i=>i.tipo==="saida").reduce((i,l)=>i+l.valor,0);document.getElementById("clube-metrics").innerHTML=`
    <div class="metric-card green"><div class="metric-label">Entradas (mês)</div><div class="metric-value positive">${m(t)}</div></div>
    <div class="metric-card red"><div class="metric-label">Saídas (mês)</div><div class="metric-value negative">${m(o)}</div></div>
    <div class="metric-card ${n>=0?"green":"red"}"><div class="metric-label">Saldo (mês)</div><div class="metric-value ${n>=0?"positive":"negative"}">${m(n)}</div></div>
    <div class="metric-card blue"><div class="metric-label">Saldo Geral</div><div class="metric-value ${s>=0?"positive":"negative"}">${m(s)}</div></div>
    <div class="metric-card"><div class="metric-label">Transações</div><div class="metric-value">${e.length}</div></div>
  `}function ye(a){const e=[...a].reverse().slice(-6),t=e.map(V),o=e.map(i=>c.clube.transactions.filter(l=>f(l.data)===i&&l.tipo==="entrada").reduce((l,v)=>l+v.valor,0)),n=e.map(i=>c.clube.transactions.filter(l=>f(l.data)===i&&l.tipo==="saida").reduce((l,v)=>l+v.valor,0)),d="rgba(255, 255, 255, 0.05)",s="#A8B2D1",r=document.getElementById("clube-chart");r&&(j&&j.destroy(),j=new Chart(r,{type:"bar",data:{labels:t,datasets:[{label:"Entradas",data:o,backgroundColor:"#F2C94C",borderRadius:6},{label:"Saídas",data:n,backgroundColor:"#E63946",borderRadius:6}]},options:{responsive:!0,maintainAspectRatio:!1,plugins:{legend:{labels:{color:s,font:{family:"DM Mono",size:11}}}},scales:{x:{ticks:{color:s,font:{family:"DM Mono",size:10}},grid:{color:d,drawBorder:!1}},y:{ticks:{color:s,font:{family:"DM Mono",size:10},callback:i=>"R$"+i},grid:{color:d,drawBorder:!1}}}}}))}function he(){const a=[...c.clube.transactions].sort((t,o)=>o.data.localeCompare(t.data)).slice(0,6),e=document.getElementById("clube-recent-list");if(!a.length){e.innerHTML='<div class="empty-state"><div class="empty-icon">📭</div><p>Sem transações ainda</p></div>';return}e.innerHTML=a.map(t=>`
     <div style="display:flex;align-items:center;justify-content:space-between;padding:.5rem 0;border-bottom:1px solid var(--border-glass)">
       <div>
         <div style="font-size:.84rem;font-weight:500;color:var(--text)">${t.desc||t.categoria}</div>
         <div style="font-size:.73rem;color:var(--text3)">${t.data} · ${t.categoria}</div>
       </div>
       <span class="${t.tipo==="entrada"?"positive":"negative"}" style="font-family:var(--font-mono);font-size:.85rem;font-weight:500">${t.tipo==="entrada"?"+":"-"}${m(t.valor)}</span>
     </div>`).join("")}function $e(){var n,d;const a=((n=document.getElementById("clube-hist-month"))==null?void 0:n.value)||b().slice(0,7),e=((d=document.getElementById("clube-hist-tipo"))==null?void 0:d.value)||"";let t=c.clube.transactions.filter(s=>f(s.data)===a);e&&(t=t.filter(s=>s.tipo===e)),t.sort((s,r)=>r.data.localeCompare(s.data));const o=document.getElementById("clube-hist-body");if(!t.length){o.innerHTML='<tr><td colspan="6"><div class="empty-state"><div class="empty-icon">📂</div><p>Nenhum registro</p></div></td></tr>';return}o.innerHTML=t.map(s=>`
    <tr>
      <td class="text-mono">${s.data}</td>
      <td><span class="badge ${s.tipo==="entrada"?"badge-green":"badge-red"}">${s.tipo}</span></td>
      <td>${s.categoria}</td>
      <td style="color:var(--text)">${s.desc||"-"}</td>
      <td class="text-mono ${s.tipo==="entrada"?"positive":"negative"}">${s.tipo==="entrada"?"+":"-"}${m(s.valor)}</td>
      <td>
        <div style="display:flex;gap:.3rem">
          <button class="btn btn-ghost btn-icon btn-sm" onclick="editClubeTransaction('${s.id}')" title="Editar">✏️</button>
          <button class="btn btn-ghost btn-icon btn-sm" onclick="deleteClubeTransaction('${s.id}')" title="Remover">🗑️</button>
        </div>
      </td>
    </tr>`).join("")}function xe(){var o;c.doceria.entradas||(c.doceria.entradas=[]);const a=((o=document.getElementById("doc-ent-month"))==null?void 0:o.value)||b().slice(0,7),e=c.doceria.entradas.filter(n=>f(n.data)===a).sort((n,d)=>d.data.localeCompare(n.data)),t=document.getElementById("doc-ent-body");if(t){if(!e.length){t.innerHTML='<tr><td colspan="5"><div class="empty-state"><div class="empty-icon">💵</div><p>Nenhuma entrada registrada</p></div></td></tr>';return}t.innerHTML=e.map(n=>`
    <tr>
      <td class="text-mono">${n.data}</td>
      <td><span class="badge badge-green">${n.categoria}</span></td>
      <td>${n.descricao||"-"}</td>
      <td class="text-mono positive">+${m(n.valor)}</td>
      <td><button class="btn btn-ghost btn-icon btn-sm" onclick="deleteDocEntrada('${n.id}')">🗑️</button></td>
    </tr>`).join("")}}let z=null;function K(){c.doceria.entradas||(c.doceria.entradas=[]);const a=[...c.doceria.pedidos,...c.doceria.gastos,...c.doceria.entradas],e=O(a);["doc-filter-month","doc-ped-month","doc-gasto-month","doc-ent-month"].forEach(t=>w(t,e)),Ee(),Me(e),Ie(),Be(),Te(),xe(),Ce(),ne()}function Ee(){var v;const a=((v=document.getElementById("doc-filter-month"))==null?void 0:v.value)||b().slice(0,7),e=c.doceria.pedidos.filter(u=>f(u.data)===a&&u.status!=="cancelado"),t=c.doceria.gastos.filter(u=>f(u.data)===a),o=(c.doceria.entradas||[]).filter(u=>f(u.data)===a),n=e.reduce((u,y)=>u+y.valor,0),d=o.reduce((u,y)=>u+y.valor,0),s=n+d,r=t.reduce((u,y)=>u+y.valor,0),i=s-r,l=c.doceria.materias.filter(u=>!u.modulo||u.modulo==="doceria").reduce((u,y)=>u+y.custo,0);document.getElementById("doc-metrics").innerHTML=`
    <div class="metric-card green"><div class="metric-label">Receita (mês)</div><div class="metric-value positive">${m(s)}</div><div class="metric-sub">Pedidos: ${m(n)} · Entradas: ${m(d)}</div></div>
    <div class="metric-card red"><div class="metric-label">Custos (mês)</div><div class="metric-value negative">${m(r)}</div></div>
    <div class="metric-card ${i>=0?"green":"red"}"><div class="metric-label">Lucro (mês)</div><div class="metric-value ${i>=0?"positive":"negative"}">${m(i)}</div></div>
    <div class="metric-card"><div class="metric-label">Pedidos (mês)</div><div class="metric-value">${e.length}</div></div>
    <div class="metric-card purple"><div class="metric-label">Custo Matérias</div><div class="metric-value">${m(l)}</div></div>
  `}function Me(a){const e=[...a].reverse().slice(-6),t=e.map(V),o=e.map(i=>c.doceria.pedidos.filter(l=>f(l.data)===i&&l.status!=="cancelado").reduce((l,v)=>l+v.valor,0)),n=e.map(i=>c.doceria.gastos.filter(l=>f(l.data)===i).reduce((l,v)=>l+v.valor,0)),d="rgba(255, 255, 255, 0.05)",s="#A8B2D1",r=document.getElementById("doc-chart");r&&(z&&z.destroy(),z=new Chart(r,{type:"line",data:{labels:t,datasets:[{label:"Receita",data:o,borderColor:"#F2C94C",backgroundColor:"rgba(242, 201, 76, 0.15)",tension:.4,fill:!0,pointBackgroundColor:"#F2C94C",borderWidth:2},{label:"Custos",data:n,borderColor:"#E63946",backgroundColor:"rgba(230, 57, 70, 0.1)",tension:.4,fill:!0,pointBackgroundColor:"#E63946",borderWidth:2}]},options:{responsive:!0,maintainAspectRatio:!1,plugins:{legend:{labels:{color:s,font:{family:"DM Mono",size:11}}}},scales:{x:{ticks:{color:s,font:{family:"DM Mono",size:10}},grid:{color:d,drawBorder:!1}},y:{ticks:{color:s,font:{family:"DM Mono",size:10},callback:i=>"R$"+i},grid:{color:d,drawBorder:!1}}}}}))}function Ie(){const a=[...c.doceria.pedidos].sort((t,o)=>o.data.localeCompare(t.data)).slice(0,5),e=document.getElementById("doc-recent-list");if(!a.length){e.innerHTML='<div class="empty-state"><div class="empty-icon">🎂</div><p>Nenhum pedido ainda</p></div>';return}e.innerHTML=a.map(t=>`
     <div style="display:flex;align-items:center;justify-content:space-between;padding:.5rem 0;border-bottom:1px solid var(--border-glass)">
       <div>
         <div style="font-size:.84rem;font-weight:500;color:var(--text)">${t.produto}</div>
         <div style="font-size:.73rem;color:var(--text3)">${t.data} · ${t.cliente||"Sem cliente"} · ${t.qty}x</div>
       </div>
       <div style="text-align:right">
         <div class="positive text-mono" style="font-size:.85rem">${m(t.valor)}</div>
         <span class="badge ${t.status==="concluido"?"badge-green":t.status==="cancelado"?"badge-red":"badge-yellow"}" style="margin-top:.2rem">${t.status}</span>
       </div>
     </div>`).join("")}function Be(){var o;const a=((o=document.getElementById("doc-ped-month"))==null?void 0:o.value)||b().slice(0,7),e=c.doceria.pedidos.filter(n=>f(n.data)===a).sort((n,d)=>d.data.localeCompare(n.data)),t=document.getElementById("doc-ped-body");if(!e.length){t.innerHTML='<tr><td colspan="7"><div class="empty-state"><div class="empty-icon">📂</div><p>Nenhum pedido</p></div></td></tr>';return}t.innerHTML=e.map(n=>`
    <tr>
      <td class="text-mono">${n.data}</td>
      <td>${n.cliente||"-"}</td>
      <td>${n.produto}</td>
      <td class="text-mono">${n.qty}</td>
      <td class="text-mono positive">${m(n.valor)}</td>
      <td><span class="badge ${n.status==="concluido"?"badge-green":n.status==="cancelado"?"badge-red":"badge-yellow"}">${n.status}</span></td>
      <td><button class="btn btn-ghost btn-icon btn-sm" onclick="deleteDocPedido('${n.id}')" title="Remover">🗑️</button></td>
    </tr>`).join("")}function Ce(){const a=document.getElementById("mat-list");if(!a)return;const e=c.doceria.materias.filter(n=>!n.modulo||n.modulo==="doceria"),t=e.reduce((n,d)=>n+d.custo,0),o=document.getElementById("mat-total-cost");if(o&&(o.textContent=`Total: ${m(t)}`),!e.length){a.innerHTML='<div class="empty-state"><div class="empty-icon">🥣</div><p>Nenhuma matéria-prima da Doceria</p></div>';return}a.innerHTML=e.map(n=>`
    <div class="materia-item">
      <div>
        <span class="mat-name">${n.nome}</span>
        <div class="mat-info">${n.qtd||"-"}</div>
      </div>
      <div style="display:flex;align-items:center;gap:.75rem">
        <span class="text-mono" style="color:var(--text2)">${m(n.custo)}</span>
        <button class="btn btn-ghost btn-icon btn-sm" onclick="deleteMateria('${n.id}')">🗑️</button>
      </div>
    </div>`).join("")}function we(){const a=document.getElementById("mat-list-clube");if(!a)return;const e=c.doceria.materias.filter(n=>n.modulo==="clube"),t=e.reduce((n,d)=>n+d.custo,0),o=document.getElementById("mat-total-cost-clube");if(o&&(o.textContent=`Total: ${m(t)}`),!e.length){a.innerHTML='<div class="empty-state"><div class="empty-icon">📦</div><p>Nenhuma matéria-prima do Clube</p></div>';return}a.innerHTML=e.map(n=>`
        <div class="materia-item">
          <div><div class="mat-name">${n.nome}</div><div class="mat-info">${n.qtd||"-"}</div></div>
          <div style="display:flex;align-items:center;gap:.75rem">
            <span class="text-mono" style="color:var(--text2)">${m(n.custo)}</span>
            <button class="btn btn-ghost btn-icon btn-sm" onclick="deleteMateria('${n.id}')">🗑️</button>
          </div>
        </div>`).join("")}function Te(){var o;const a=((o=document.getElementById("doc-gasto-month"))==null?void 0:o.value)||b().slice(0,7),e=c.doceria.gastos.filter(n=>f(n.data)===a).sort((n,d)=>d.data.localeCompare(n.data)),t=document.getElementById("doc-gasto-body");if(!e.length){t.innerHTML='<tr><td colspan="5"><div class="empty-state"><div class="empty-icon">📂</div><p>Nenhum gasto</p></div></td></tr>';return}t.innerHTML=e.map(n=>`
    <tr>
      <td class="text-mono">${n.data}</td>
      <td>${n.desc}</td>
      <td><span class="badge badge-yellow">${n.cat}</span></td>
      <td class="text-mono negative">${m(n.valor)}</td>
      <td><button class="btn btn-ghost btn-icon btn-sm" onclick="deleteDocGasto('${n.id}')">🗑️</button></td>
    </tr>`).join("")}function Le(){const a=document.getElementById("vnd-produto").value,e=c.vendas.produtos.find(o=>o.id===a);document.getElementById("container-qty1");const t=document.getElementById("container-qty2");e&&e.isMulti?(t.style.display="block",document.getElementById("lbl-qty1").textContent=`Qtd (R$ ${m(e.preco).replace("R$ ","")})`,document.getElementById("lbl-qty2").textContent=`Qtd Combo (R$ ${m(e.preco2).replace("R$ ","")})`):(t&&(t.style.display="none"),document.getElementById("lbl-qty1")&&(document.getElementById("lbl-qty1").textContent="Quantidade"),document.getElementById("vnd-qty2")&&(document.getElementById("vnd-qty2").value="")),Z()}function Z(){var s,r,i;const a=(s=document.getElementById("vnd-produto"))==null?void 0:s.value,e=parseInt((r=document.getElementById("vnd-qty"))==null?void 0:r.value)||0,t=parseInt((i=document.getElementById("vnd-qty2"))==null?void 0:i.value)||0,o=c.vendas.produtos.find(l=>l.id===a),n=document.getElementById("vnd-preview");if(!n)return;if(!o||e<1&&t<1){n.style.display="none";return}const d=E({produtoId:a,qty:e,qty2:t});n.style.display="block",n.innerHTML=`
    <div style="display:flex;flex-wrap:wrap;gap:1rem">
      <div><div class="text-sm">Receita Bruta</div><div class="text-mono positive">${m(d.receita)}</div></div>
      <div><div class="text-sm">Custo</div><div class="text-mono negative">${m(d.custo)}</div></div>
      <div><div class="text-sm">Comissão</div><div class="text-mono" style="color:#60a5fa">${m(d.comissao)}</div></div>
      <div><div class="text-sm">Lucro</div><div class="text-mono ${d.lucro>=0?"positive":"negative"}">${m(d.lucro)}</div></div>
    </div>`}let N=null;function ee(){const a=[...c.vendas.vendas,...c.vendas.avarias,...c.vendas.debitos],e=O(a);["vnd-filter-month","vnd-hist-month","av-month","deb-month"].forEach(d=>w(d,e));const t=c.vendas.produtos,o=c.vendas.vendedores;["vnd-produto","av-produto"].forEach(d=>{const s=document.getElementById(d);if(!s)return;const r=s.value;s.innerHTML=t.length?t.map(i=>`<option value="${i.id}" ${i.id===r?"selected":""}>${i.nome}</option>`).join(""):'<option value="">-- nenhum produto --</option>'}),["vnd-vendedor","deb-vendedor"].forEach(d=>{const s=document.getElementById(d);if(!s)return;const r=s.value;if(p==="desbravador"&&g&&d==="vnd-vendedor"){const i=o.find(l=>l.nome.toLowerCase()===g.nome.toLowerCase());s.innerHTML=i?`<option value="${i.id}" selected>${i.nome}</option>`:'<option value="">-- sem vendedor --</option>'}else s.innerHTML=o.length?o.map(i=>`<option value="${i.id}" ${i.id===r?"selected":""}>${i.nome}</option>`).join(""):'<option value="">-- nenhum vendedor --</option>'});const n=document.getElementById("vnd-hist-seller");if(n){const d=n.value;n.innerHTML='<option value="">Todos vendedores</option>'+o.map(s=>`<option value="${s.id}" ${s.id===d?"selected":""}>${s.nome}</option>`).join("")}_e(),De(),qe(),je(),ze(),Ne(),Re(),Pe(),ke(),He(),Le(),Z(),Se(),A()}function E(a){const e=c.vendas.produtos.find(y=>y.id===a.produtoId);if(!e)return{receita:0,custo:0,comissao:0,lucro:0};const t=(e.preco||0)*(a.qty||0),o=(e.custo||0)*(a.qty||0),n=(e.comissao||0)*(a.qty||0);let d=0,s=0,r=0;e.isMulti&&a.qty2&&(d=(e.preco2||0)*a.qty2,s=(e.custo2||0)*a.qty2,r=(e.comissao2||0)*a.qty2);const i=t+d,l=o+s,v=n+r,u=i-l-v;return{receita:i,custo:l,comissao:v,lucro:u}}function ke(){var n,d;const a=((n=document.getElementById("com-filter-month"))==null?void 0:n.value)||b().slice(0,7),e=((d=document.getElementById("com-filter-status"))==null?void 0:d.value)||"";let t=c.vendas.vendas.filter(s=>f(s.data)===a);e&&(t=t.filter(s=>(s.comissao_status||"pendente")===e));const o=document.getElementById("com-body");if(o){if(!t.length){o.innerHTML='<tr><td colspan="6"><div class="empty-state"><div class="empty-icon">💸</div><p>Nenhuma comissão no período</p></div></td></tr>';return}o.innerHTML=t.map(s=>{const r=c.vendas.vendedores.find(u=>u.id===s.vendedorId),i=c.vendas.produtos.find(u=>u.id===s.produtoId),l=E(s),v=s.comissao_status||"pendente";return`
          <tr>
            <td class="text-mono">${s.data}</td>
            <td>${(r==null?void 0:r.nome)||"-"}</td>
            <td style="font-size:.8rem">${(i==null?void 0:i.nome)||"-"}</td>
            <td class="text-mono" style="color:#60a5fa">${m(l.comissao)}</td>
            <td><span class="badge ${v==="pago"?"badge-green":"badge-yellow"}">${v}</span></td>
            <td>
              <div style="display:flex;gap:.3rem">
                ${v==="pendente"&&p==="admin"?`<button class="btn btn-primary btn-sm" onclick="pagarComissao('${s.id}')">Pagar</button>`:""}
                ${v==="pago"&&p==="admin"?`<button class="btn btn-ghost btn-sm" onclick="estornarComissao('${s.id}')" title="Voltar para pendente">Estornar</button>`:""}
              </div>
            </td>
          </tr>
        `}).join("")}}function He(){const a=c.vendas.vendas.filter(t=>!t.comissao_status||t.comissao_status==="pendente").length,e=document.getElementById("badge-comissoes");e&&(e.textContent=a,e.style.display=a>0?"inline-block":"none")}function _e(){var y;const a=((y=document.getElementById("vnd-filter-month"))==null?void 0:y.value)||b().slice(0,7),e=c.vendas.vendas.filter(h=>f(h.data)===a);let t=0,o=0,n=0,d=0,s=0;e.forEach(h=>{const $=E(h);t+=$.receita,o+=$.custo,n+=$.comissao,h.comissao_status==="pago"&&(d+=$.comissao),s+=$.lucro});const i=c.vendas.avarias.filter(h=>f(h.data)===a).reduce((h,$)=>{const T=c.vendas.produtos.find(ae=>ae.id===$.produtoId);return h+((T==null?void 0:T.custo)||0)*$.qty},0),l=c.vendas.debitos.filter(h=>f(h.data)===a&&h.afeta_caixa).reduce((h,$)=>h+$.valor,0),v=t-o-i-l,u=c.vendas.vendas.filter(h=>!h.comissao_status||h.comissao_status==="pendente");document.getElementById("vnd-metrics").innerHTML=`
    <div class="metric-card green"><div class="metric-label">Receita Bruta</div><div class="metric-value positive">${m(t)}</div></div>
    <div class="metric-card red"><div class="metric-label">Custos</div><div class="metric-value negative">${m(o)}</div></div>
    <div class="metric-card blue" style="cursor:pointer" onclick="showSecTab(document.querySelector('[onclick*=vnd-comissoes]'),'vnd-comissoes')">
      <div class="metric-label">Comissões Pagas${u.length>0?' <span style="background:var(--accent2);color:#fff;border-radius:99px;padding:1px 6px;font-size:.65rem;margin-left:4px">'+u.length+" pend.</span>":""}</div>
      <div class="metric-value" style="color:#60a5fa">${m(d)}</div>
    </div>
    <div class="metric-card ${v>=0?"green":"red"}"><div class="metric-label">Saldo Caixa</div><div class="metric-value ${v>=0?"positive":"negative"}">${m(v)}</div></div>
    <div class="metric-card red"><div class="metric-label">Perdas (Avarias)</div><div class="metric-value negative">${m(i)}</div></div>
    <div class="metric-card"><div class="metric-label">Vendas (mês)</div><div class="metric-value">${e.length}</div></div>
  `}function De(){var l;const a=((l=document.getElementById("vnd-filter-month"))==null?void 0:l.value)||b().slice(0,7),e=c.vendas.vendas.filter(v=>f(v.data)===a),t={};e.forEach(v=>{const u=c.vendas.produtos.find(y=>y.id===v.produtoId);u&&(t[u.nome]||(t[u.nome]=0),t[u.nome]+=u.preco*v.qty)});const o=Object.keys(t),n=Object.values(t),s=document.documentElement.getAttribute("data-theme")!=="light"?"#8891a8":"#4a5168",r=document.getElementById("vnd-chart");if(!r)return;if(N&&N.destroy(),!o.length){r.parentElement.innerHTML='<div class="empty-state"><div class="empty-icon">📊</div><p>Sem vendas no período</p></div>';return}const i=["#F2C94C","#00C2FF","#E63946","#a78bfa","#f97316","#4CC9F0","#06b6d4"];N=new Chart(r,{type:"doughnut",data:{labels:o,datasets:[{data:n,backgroundColor:i.slice(0,o.length),borderWidth:0}]},options:{responsive:!0,maintainAspectRatio:!1,cutout:"68%",plugins:{legend:{position:"bottom",labels:{color:s,font:{family:"DM Mono",size:11},boxWidth:12}}}}})}function Se(){var s;const a=((s=document.getElementById("vnd-filter-month"))==null?void 0:s.value)||b().slice(0,7),e=c.vendas.vendas.filter(r=>f(r.data)===a),t={};e.forEach(r=>{const i=c.vendas.produtos.find(v=>v.id===r.produtoId);if(!i)return;const l=E(r);t[r.produtoId]||(t[r.produtoId]={nome:i.nome,receita:0}),t[r.produtoId].receita+=l.receita});const o=Object.values(t).sort((r,i)=>i.receita-r.receita),n=o.length?o[0].receita:1,d=document.getElementById("vnd-prod-ranking");if(d){if(!o.length){d.innerHTML='<div class="empty-state"><div class="empty-icon">🏆</div><p>Sem vendas no período</p></div>';return}d.innerHTML=o.map((r,i)=>`
        <div class="rank-row">
          <span class="rank-num">${i+1}</span>
          <div style="flex:1;min-width:0;font-size:.83rem;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${r.nome}</div>
          <div class="rank-bar-wrap" style="position:relative">
            <div class="rank-bar" style="width:${Math.round(r.receita/n*100)}%;background:var(--accent2)"></div>
          </div>
          <div style="text-align:right">
            <span class="text-mono positive" style="font-size:.78rem">${m(r.receita)}</span>
          </div>
        </div>`).join("")}}function qe(){var s;const a=((s=document.getElementById("vnd-filter-month"))==null?void 0:s.value)||b().slice(0,7),e=c.vendas.vendas.filter(r=>f(r.data)===a),t={};e.forEach(r=>{const i=E(r);t[r.vendedorId]||(t[r.vendedorId]={receita:0,qty:0}),t[r.vendedorId].receita+=i.receita,t[r.vendedorId].qty+=r.qty});const o=Object.entries(t).sort((r,i)=>i[1].receita-r[1].receita),n=o.length?o[0][1].receita:1,d=document.getElementById("vnd-ranking");if(!o.length){d.innerHTML='<div class="empty-state"><div class="empty-icon">🏆</div><p>Nenhuma venda no período</p></div>';return}d.innerHTML=o.map(([r,i],l)=>{const v=c.vendas.vendedores.find(u=>u.id===r);return`
      <div class="rank-row">
        <span class="rank-num">${l+1}</span>
        <div style="display:flex;align-items:center;gap:.5rem;flex:1;min-width:0">
          <div class="seller-avatar" style="width:28px;height:28px;font-size:.72rem">${((v==null?void 0:v.nome)||"?")[0].toUpperCase()}</div>
          <span style="font-size:.83rem;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${(v==null?void 0:v.nome)||"Desconhecido"}</span>
        </div>
        <div class="rank-bar-wrap" style="position:relative">
          <div class="rank-bar" style="width:${Math.round(i.receita/n*100)}%"></div>
        </div>
        <div style="display:flex;flex-direction:column;align-items:flex-end">
          <span class="text-mono positive" style="font-size:.78rem;white-space:nowrap">${m(i.receita)}</span>
        </div>
      </div>`}).join("")}function je(){var n,d;const a=((n=document.getElementById("vnd-hist-month"))==null?void 0:n.value)||b().slice(0,7),e=((d=document.getElementById("vnd-hist-seller"))==null?void 0:d.value)||"";let t=c.vendas.vendas.filter(s=>f(s.data)===a);if(e&&(t=t.filter(s=>s.vendedorId===e)),p==="desbravador"&&g){const s=c.vendas.vendedores.find(r=>r.nome.toLowerCase()===g.nome.toLowerCase());s&&(t=t.filter(r=>r.vendedorId===s.id))}t.sort((s,r)=>r.data.localeCompare(s.data));const o=document.getElementById("vnd-hist-body");if(!t.length){o.innerHTML='<tr><td colspan="8"><div class="empty-state"><div class="empty-icon">📂</div><p>Sem vendas</p></div></td></tr>';return}o.innerHTML=t.map(s=>{const r=c.vendas.produtos.find(u=>u.id===s.produtoId),i=c.vendas.vendedores.find(u=>u.id===s.vendedorId),l=E(s);let v=s.qty||0;return r&&r.isMulti&&s.qty2&&(v=`${s.qty||0} u / ${s.qty2} c`),`<tr>
      <td class="text-mono">${s.data}</td>
      <td>${(i==null?void 0:i.nome)||"-"}</td>
      <td>${(r==null?void 0:r.nome)||"-"}</td>
      <td class="text-mono">${v}</td>
      <td class="text-mono positive">${m(l.receita)}</td>
      <td class="text-mono" style="color:#60a5fa">${m(l.comissao)}</td>
      <td class="text-mono ${l.lucro>=0?"positive":"negative"}">${m(l.lucro)}</td>
      <td><button class="btn btn-ghost btn-icon btn-sm" onclick="deleteVenda('${s.id}')">🗑️</button></td>
    </tr>`}).join("")}function ze(){const a=document.getElementById("prod-body");if(!c.vendas.produtos.length){a.innerHTML='<tr><td colspan="6"><div class="empty-state"><div class="empty-icon">📦</div><p>Nenhum produto</p></div></td></tr>';return}a.innerHTML=c.vendas.produtos.map(e=>{const t=e.preco>0?((e.preco-e.custo-e.comissao)/e.preco*100).toFixed(1):0;let o=e.nome;return e.isMulti&&(o+=' <span class="badge badge-blue" style="font-size:0.6rem">Multi</span>'),`<tr>
      <td style="font-weight:500;color:var(--text)">${o}</td>
      <td class="text-mono positive">${m(e.preco)}${e.isMulti?'<br><span style="font-size:0.7rem;color:var(--text3)">'+m(e.preco2)+"</span>":""}</td>
      <td class="text-mono negative">${m(e.custo)}${e.isMulti?'<br><span style="font-size:0.7rem;color:var(--text3)">'+m(e.custo2)+"</span>":""}</td>
      <td class="text-mono" style="color:#60a5fa">${m(e.comissao)}${e.isMulti?'<br><span style="font-size:0.7rem;color:var(--text3)">'+m(e.comissao2)+"</span>":""}</td>
      <td class="text-mono"><span class="badge ${parseFloat(t)>=30?"badge-green":parseFloat(t)>=10?"badge-yellow":"badge-red"}">${t}%</span></td>
      <td>
        <div style="display:flex;gap:.3rem">
          <button class="btn btn-ghost btn-icon btn-sm" onclick="editProduto('${e.id}')">✏️</button>
          <button class="btn btn-ghost btn-icon btn-sm" onclick="deleteProduto('${e.id}')">🗑️</button>
        </div>
      </td>
    </tr>`}).join("")}function Ne(){const a=document.getElementById("sellers-list");if(!c.vendas.vendedores.length){a.innerHTML='<div class="empty-state"><div class="empty-icon">👤</div><p>Nenhum vendedor</p></div>';return}a.innerHTML=c.vendas.vendedores.map(e=>{const t=c.vendas.vendas.filter(n=>n.vendedorId===e.id).reduce((n,d)=>{const s=E(d);return n+s.receita},0),o=c.vendas.vendas.filter(n=>n.vendedorId===e.id).reduce((n,d)=>{const s=E(d);return n+s.comissao},0);return`
      <div class="seller-card">
        <div style="display:flex;align-items:center;gap:.75rem">
          <div class="seller-avatar">${e.nome[0].toUpperCase()}</div>
          <div>
            <div style="font-weight:600;color:var(--text)">${e.nome}</div>
            <div style="font-size:.75rem;color:var(--text3)">Total vendido: <span class="text-mono positive">${m(t)}</span> · Comissões: <span class="text-mono" style="color:#60a5fa">${m(o)}</span></div>
          </div>
        </div>
        <button class="btn btn-ghost btn-icon btn-sm" onclick="deleteVendedor('${e.id}')">🗑️</button>
      </div>`}).join("")}function Re(){var o;const a=((o=document.getElementById("av-month"))==null?void 0:o.value)||b().slice(0,7),e=c.vendas.avarias.filter(n=>f(n.data)===a).sort((n,d)=>d.data.localeCompare(n.data)),t=document.getElementById("av-body");if(!e.length){t.innerHTML='<tr><td colspan="6"><div class="empty-state"><div class="empty-icon">📂</div><p>Nenhuma avaria</p></div></td></tr>';return}t.innerHTML=e.map(n=>{const d=c.vendas.produtos.find(r=>r.id===n.produtoId),s=((d==null?void 0:d.custo)||0)*n.qty;return`<tr>
      <td class="text-mono">${n.data}</td>
      <td>${(d==null?void 0:d.nome)||"-"}</td>
      <td class="text-mono">${n.qty}</td>
      <td class="text-mono negative">${m(s)}</td>
      <td>${n.motivo||"-"}</td>
      <td><button class="btn btn-ghost btn-icon btn-sm" onclick="deleteAvaria('${n.id}')">🗑️</button></td>
    </tr>`}).join("")}function Pe(){var o;const a=((o=document.getElementById("deb-month"))==null?void 0:o.value)||b().slice(0,7),e=c.vendas.debitos.filter(n=>f(n.data)===a).sort((n,d)=>d.data.localeCompare(n.data)),t=document.getElementById("deb-body");if(!e.length){t.innerHTML='<tr><td colspan="5"><div class="empty-state"><div class="empty-icon">📂</div><p>Nenhuma retirada</p></div></td></tr>';return}t.innerHTML=e.map(n=>{const d=c.vendas.vendedores.find(s=>s.id===n.vendedorId);return`<tr>
      <td class="text-mono">${n.data}</td>
      <td>${(d==null?void 0:d.nome)||"-"}</td>
      <td class="text-mono negative">${m(n.valor)}</td>
      <td>${n.obs||"-"}</td>
      <td><button class="btn btn-ghost btn-icon btn-sm" onclick="deleteDebito('${n.id}')">🗑️</button></td>
    </tr>`}).join("")}function Ae(){const a=F.filter(t=>t.status==="pendente").length,e=document.getElementById("user-notif-dot");e&&(e.style.display=a>0?"block":"none")}function te(){const a=document.querySelector('[data-mod="doceria"]');if(!a)return;if(p==="admin"||p==="diretor"){a.style.display="";return}if(!(g!=null&&g.id)){a.style.display="none";return}const e=F.find(t=>t.id===g.id);e!=null&&e.doceria_acesso?a.style.display="":a.style.display="none"}function ne(){const a=document.getElementById("doc-meta-hero"),e=document.getElementById("metas-doceria-list"),t=c.doceria.pedidos.filter(o=>o.status!=="cancelado").reduce((o,n)=>o+n.valor,0);if(a)if(I.length){const o=I[0],n=Math.min(100,Math.round(t/o.valor_alvo*100)),d=t>=o.valor_alvo;a.innerHTML=`<div class="goal-hero"><div class="goal-hero-header"><div class="goal-hero-title">🎂 ${o.descricao}</div><div class="goal-hero-value">${m(t)} / ${m(o.valor_alvo)}</div></div><div class="progress-track"><div class="progress-fill ${d?"over":""}" id="doc-hero-fill" style="width:0%"></div></div><div class="goal-footer"><span>${n}% concluído</span><span>${d?"🎉 Meta atingida!":m(o.valor_alvo-t)+" restante"}</span></div></div>`,setTimeout(()=>{const s=document.getElementById("doc-hero-fill");s&&(s.style.width=n+"%")},80)}else a.innerHTML="";if(e){if(!I.length){e.innerHTML='<div class="empty-state"><div class="empty-icon">🎯</div><p>Nenhuma meta cadastrada</p></div>';return}e.innerHTML=I.map(o=>{const n=Math.min(100,Math.round(t/o.valor_alvo*100)),d=t>=o.valor_alvo,s=p==="admin"||p==="diretor";return`<div style="padding:1rem 0;border-bottom:1px solid var(--border-glass)"><div style="display:flex;align-items:center;justify-content:space-between;gap:.5rem;margin-bottom:.6rem"><span style="font-weight:600;color:var(--text)">${o.descricao}</span><div style="display:flex;gap:.35rem;align-items:center"><span style="font-family:var(--font-mono);font-size:.8rem;color:var(--text3)">${m(o.valor_alvo)}</span>${s?`<button class="btn btn-ghost btn-icon btn-sm" onclick="deleteMetaDoceria('${o.id}')">🗑️</button>`:""}</div></div><div class="progress-track" style="height:8px"><div class="progress-fill ${d?"over":""}" style="width:${n}%"></div></div><div class="goal-footer"><span>${n}%</span><span>${m(t)} arrecadado</span></div></div>`}).join("")}}function A(){const a=document.getElementById("vnd-meta-hero"),e=document.getElementById("metas-vendas-list"),t=c.vendas.vendas.reduce((o,n)=>o+E(n).receita,0);if(a)if(B.length){const o=B[0],n=Math.min(100,Math.round(t/o.valor_alvo*100)),d=t>=o.valor_alvo;a.innerHTML=`<div class="goal-hero"><div class="goal-hero-header"><div class="goal-hero-title">🥧 ${o.descricao}</div><div class="goal-hero-value">${m(t)} / ${m(o.valor_alvo)}</div></div><div class="progress-track"><div class="progress-fill ${d?"over":""}" id="vnd-hero-fill" style="width:0%"></div></div><div class="goal-footer"><span>${n}% concluído</span><span>${d?"🎉 Meta atingida!":m(o.valor_alvo-t)+" restante"}</span></div></div>`,setTimeout(()=>{const s=document.getElementById("vnd-hero-fill");s&&(s.style.width=n+"%")},80)}else a.innerHTML="";if(e){if(!B.length){e.innerHTML='<div class="empty-state"><div class="empty-icon">🎯</div><p>Nenhuma meta cadastrada</p></div>';return}e.innerHTML=B.map(o=>{const n=Math.min(100,Math.round(t/o.valor_alvo*100)),d=t>=o.valor_alvo,s=p==="admin"||p==="diretor";return`<div style="padding:1rem 0;border-bottom:1px solid var(--border-glass)"><div style="display:flex;align-items:center;justify-content:space-between;gap:.5rem;margin-bottom:.6rem"><span style="font-weight:600;color:var(--text)">${o.descricao}</span><div style="display:flex;gap:.35rem;align-items:center"><span style="font-family:var(--font-mono);font-size:.8rem;color:var(--text3)">${m(o.valor_alvo)}</span>${s?`<button class="btn btn-ghost btn-icon btn-sm" onclick="deleteMetaVendas('${o.id}')">🗑️</button>`:""}</div></div><div class="progress-track" style="height:8px"><div class="progress-fill ${d?"over":""}" style="width:${n}%"></div></div><div class="goal-footer"><span>${n}%</span><span>${m(t)} arrecadado</span></div></div>`}).join("")}}function oe(){var n;const a=document.getElementById("tab-admin-sistema");a&&(a.style.display=p==="admin"?"inline-block":"none");const e=document.getElementById("priv-body");if(!e)return;const t=((n=document.getElementById("priv-filter-status"))==null?void 0:n.value)||"";let o=[...Q];if(t&&(o=o.filter(d=>d.status===t)),!o.length){e.innerHTML='<tr><td colspan="6"><div class="empty-state"><div class="empty-icon">🔐</div><p>Nenhum registro sigiloso</p></div></td></tr>';return}e.innerHTML=o.map(d=>`
        <tr>
          <td class="text-mono">${d.data}</td>
          <td style="font-weight:600">${d.nome}</td>
          <td class="text-mono negative">${m(d.valor)}</td>
          <td><span class="badge ${d.status==="pago"?"badge-green":"badge-yellow"}">${d.status}</span></td>
          <td style="font-size:.78rem;color:var(--text3)">${d.obs||"-"}</td>
          <td>
            <div style="display:flex;gap:.3rem">
              ${d.status==="aberto"?`<button class="btn btn-ghost btn-icon btn-sm" onclick="pagarDivida('${d.id}')" title="Marcar como Pago">💰</button>`:""}
              <button class="btn btn-ghost btn-icon btn-sm" onclick="deleteDivida('${d.id}')" title="Remover">🗑️</button>
            </div>
          </td>
        </tr>
      `).join("")}function Fe(){ce();const a=localStorage.getItem("gda_theme")||"dark";document.documentElement.setAttribute("data-theme",a),document.getElementById("themeBtn").textContent=a==="dark"?"🌙":"🌑",["clube-data","doc-data","doc-gasto-data","vnd-data","av-data","deb-data"].forEach(t=>{const o=document.getElementById(t);o&&(o.value=b())});const e=localStorage.getItem("gda_session");if(e)try{const t=JSON.parse(e);g=t,p=t.role,le()}catch{localStorage.removeItem("gda_session")}p||G()}Fe();
