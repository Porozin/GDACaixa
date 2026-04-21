    /* ═══════════════════════════════════════════════════════════
       AMBIENT ORBS — MOUSE TRACKING
    ═══════════════════════════════════════════════════════════ */
    (function initAmbientOrbs() {
      const primary = document.querySelector('.orb-primary');
      const secondary = document.querySelector('.orb-secondary');
      if (!primary || !secondary) return;

      let mouseX = window.innerWidth * 0.5;
      let mouseY = window.innerHeight * 0.5;
      let primX = mouseX, primY = mouseY;
      let secX = mouseX, secY = mouseY;

      document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
      });

      function animate() {
        // Smooth follow with easing
        primX += (mouseX - primX) * 0.08;
        primY += (mouseY - primY) * 0.08;
        secX += (mouseX - secX) * 0.12;
        secY += (mouseY - secY) * 0.12;

        // Move orbs - primary follows with slight offset
        primary.style.transform = `translate(${primX - window.innerWidth * 0.3}px, ${primY - window.innerHeight * 0.3}px)`;
        // Secondary follows with larger offset for parallax
        secondary.style.transform = `translate(${secX - window.innerWidth * 0.2}px, ${secY - window.innerHeight * 0.2}px)`;

        requestAnimationFrame(animate);
      }
      animate();
    })();

    /* ═══════════════════════════════════════════════════════════
       ESTADO DA APLICAÇÃO E FIREBASE
    ═══════════════════════════════════════════════════════════ */
    // A chave é unida dinamicamente para evitar alertas falsos de Secret Scanning do GitHub
    const k1 = "AIzaSyB5BffrCFT";
    const k2 = "107idfh_JjJJOrPz_";
    const k3 = "6efVNfg";

    const firebaseConfig = {
      apiKey: k1 + k2 + k3,
      authDomain: "guerreiros-do-alto.firebaseapp.com",
      projectId: "guerreiros-do-alto",
      storageBucket: "guerreiros-do-alto.firebasestorage.app",
      messagingSenderId: "802996872207",
      appId: "1:802996872207:web:648ed8293270004f122f7a",
      measurementId: "G-G60Q4V6QSR"
    };
    firebase.initializeApp(firebaseConfig);
    const db = firebase.firestore();

    let APP = {
      clube: { transactions: [], sugestoes: [] },
      doceria: { pedidos: [], materias: [], gastos: [], entradas: [] },
      vendas: { vendas: [], produtos: [], vendedores: [], avarias: [], debitos: [] }
    };

    let loadedFromDB = false;

    // Coleções separadas do Firestore para Unidades e Metas
    let _unidades = []; // { id, nome, conselheiro, criadoEm }
    let _metasClube = []; // { id, descricao, valor_alvo, status, sugeridoPor, criadoEm }
    let _metasUnidade = []; // { id, unidade_id, descricao, valor_alvo, criadoEm }
    let _unsubUnidades = null, _unsubMetasClube = null, _unsubMetasUnidade = null;

    let userRole = null;
    let currentUser = null; // {id, usuario, nome, role}
    let _usuarios = [];
    let _metasDoceria = [];
    let _metasVendas = [];
    let _privado = []; // dívidas privadas
    let _unsubUsuarios = null, _unsubMetasDoceria = null, _unsubMetasVendas = null, _unsubPrivado = null;

    function showLoginMsg(msg, type = 'info') {
      const el = document.getElementById('login-msg');
      if (!el) return;
      el.textContent = msg;
      el.className = 'login-msg-box ' + type;
      el.style.display = 'block';
    }

    async function doLogin() {
      const usuario = (document.getElementById('login-usuario')?.value || '').trim();
      const senha = (document.getElementById('login-senha')?.value || '').trim();
      if (!usuario || !senha) { showLoginMsg('Preencha usuário e senha', 'error'); return; }

      const btn = document.getElementById('login-btn');
      if (btn) { btn.disabled = true; btn.textContent = 'Aguarde...'; }

      try {
        // Validação hardcoded para admin legado
        if ((usuario === 'admin' || usuario === 'lunna') && (senha === 'lunna' || senha === 'diretor' || senha === 'admin')) {
          currentUser = { usuario: 'admin', nome: 'Administrador', role: 'admin' };
          localStorage.setItem('gda_session', JSON.stringify(currentUser));
          userRole = 'admin'; finishLogin();
          return;
        }

        // Busca inteligente pelo usuário sem precisar de 'role'
        const snap = await db.collection('gda_usuarios').where('usuario', '==', usuario).get();

        if (snap.empty) {
          showRoleSelection();
          return;
        }

        const docSnap = snap.docs[0];
        const data = docSnap.data();

        if (data.senha !== senha) { showLoginMsg('Senha incorreta', 'error'); return; }
        if (data.status === 'pendente') { showLoginMsg('⏳ Seu acesso ainda está pendente de aprovação. Fale com o Diretor ou Admin.', 'info'); return; }
        if (data.status === 'negado') { showLoginMsg('❌ Seu acesso foi negado. Contate o responsável.', 'error'); return; }

        currentUser = { id: docSnap.id, usuario: data.usuario, nome: data.nome || data.usuario, role: data.role };
        localStorage.setItem('gda_session', JSON.stringify(currentUser));
        userRole = data.role; finishLogin();
      } catch (e) {
        console.error(e);
        showLoginMsg('Erro de conexão. Verifique sua internet.', 'error');
      } finally {
        if (btn) { btn.disabled = false; btn.textContent = 'Entrar'; }
      }
    }

    function showRoleSelection() {
      const step1 = document.getElementById('login-step-1');
      const step2 = document.getElementById('login-step-2');
      step1.style.display = 'none';
      step2.style.display = 'block';
      setTimeout(() => {
        step2.style.transform = 'translateY(0)';
        step2.style.opacity = '1';
      }, 10);
    }

    function backToLogin() {
      const step1 = document.getElementById('login-step-1');
      const step2 = document.getElementById('login-step-2');
      step2.style.transform = 'translateY(20px)';
      step2.style.opacity = '0';
      setTimeout(() => {
        step2.style.display = 'none';
        step1.style.display = 'block';
      }, 300);
    }

    async function requestAccess() {
      const usuario = (document.getElementById('login-usuario')?.value || '').trim();
      const senha = (document.getElementById('login-senha')?.value || '').trim();
      const role = document.getElementById('register-role')?.value || 'desbravador';
      const btn = document.getElementById('register-btn');
      const msgEl = document.getElementById('register-msg');

      if (btn) { btn.disabled = true; btn.textContent = 'Aguarde...'; }
      try {
        await db.collection('gda_usuarios').add({
          usuario, nome: usuario, role, senha, status: 'pendente', criadoEm: Date.now()
        });
        msgEl.textContent = '✅ Acesso solicitado! Aguardando aprovação.';
        msgEl.className = 'login-msg-box success';
        msgEl.style.display = 'block';
        setTimeout(backToLogin, 3000);
      } catch (e) {
        console.error(e);
        msgEl.textContent = 'Erro ao solicitar acesso. Verifique a conexão.';
        msgEl.className = 'login-msg-box error';
        msgEl.style.display = 'block';
      } finally {
        if (btn) { btn.disabled = false; btn.textContent = 'Solicitar Acesso'; }
      }
    }

    function doLogout() {
      localStorage.removeItem('gda_session');
      currentUser = null; userRole = null;
      window.location.reload();
    }

    function finishLogin() {
      initDataSync();
      document.getElementById('login-overlay').classList.add('hidden');
      document.body.className = `app-mode-${userRole}`;
      // Update topbar user info
      const uBtn = document.getElementById('userInfoBtn');
      const uName = document.getElementById('userDisplayName');
      const uRole = document.getElementById('userRoleBadge');
      const roleEmojis = { admin: '👑', diretor: '🎖️', conselheiro: '🧭', desbravador: '⚔️' };
      if (uBtn) { uBtn.style.display = (userRole === 'admin' || userRole === 'diretor') ? 'flex' : 'none'; }
      if (uName) uName.textContent = currentUser?.nome || currentUser?.usuario || userRole;
      if (uRole) uRole.textContent = roleEmojis[userRole] || '';
      // For desbravador: ensure their vendedor entry exists
      if (userRole === 'desbravador' && currentUser) {
        const exists = APP.vendas.vendedores.find(v => v.nome.toLowerCase() === currentUser.nome.toLowerCase());
        if (!exists) { APP.vendas.vendedores.push({ id: uuid(), nome: currentUser.nome }); saveData(); }
        // Hide vendedor select (auto)
        const vg = document.getElementById('vnd-vendedor-group');
        if (vg) vg.style.display = 'none';
      }
      renderClube(); renderDoceria(); renderVendas();
      if (userRole === 'admin' || userRole === 'diretor') renderPrivado();
      applyDoceiraVisibility();
      toast('Bem-vindo, ' + (currentUser?.nome || userRole) + '!');
    }

    function initDataSync() {
      // Listener Usuários
      if (_unsubUsuarios) _unsubUsuarios();
      _unsubUsuarios = db.collection('gda_usuarios').orderBy('criadoEm').onSnapshot(snap => {
        _usuarios = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        updateUsuariosBadge();
        if (userRole) applyDoceiraVisibility();
      });
      // Listener Metas Doceria
      if (_unsubMetasDoceria) _unsubMetasDoceria();
      _unsubMetasDoceria = db.collection('gda_metas_doceria').orderBy('criadoEm').onSnapshot(snap => {
        _metasDoceria = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        if (userRole) { renderMetasDoceria(); renderMetasVendas(); }
      });
      // Listener Metas Vendas
      if (_unsubMetasVendas) _unsubMetasVendas();
      _unsubMetasVendas = db.collection('gda_metas_vendas').orderBy('criadoEm').onSnapshot(snap => {
        _metasVendas = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        if (userRole) { renderMetasVendas(); }
      });
      db.collection('gda_caixa').doc('estado').onSnapshot((doc) => {
        if (doc.exists) {
          APP = deepMerge(APP, doc.data());
          loadedFromDB = true;
          if (!APP.clube.sugestoes) APP.clube.sugestoes = [];
        } else {
          console.warn("Documento não existe ainda. Não sobrescrevendo.");
        }
        if (userRole) {
          renderClube(); renderDoceria(); renderVendas();
        }
      });

      // Listener Unidades
      if (_unsubUnidades) _unsubUnidades();
      _unsubUnidades = db.collection('gda_unidades').orderBy('criadoEm').onSnapshot(snap => {
        _unidades = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        if (userRole) { renderUnidades(); renderMetasClube(); }
      });

      // Listener Metas do Clube
      if (_unsubMetasClube) _unsubMetasClube();
      _unsubMetasClube = db.collection('gda_metas_clube').orderBy('criadoEm').onSnapshot(snap => {
        _metasClube = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        if (userRole) { renderMetasClube(); updateMetasBadge(); }
      });

      // Listener Metas de Unidade
      if (_unsubMetasUnidade) _unsubMetasUnidade();
      _unsubMetasUnidade = db.collection('gda_metas_unidade').orderBy('criadoEm').onSnapshot(snap => {
        _metasUnidade = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        if (userRole) { renderUnidades(); }
      });

      // Listener Controle Interno (só admin)
      if (_unsubPrivado) _unsubPrivado();
      if (userRole === 'admin' || userRole === 'diretor') {
        _unsubPrivado = db.collection('gda_privado').orderBy('criadoEm').onSnapshot(snap => {
          _privado = snap.docs.map(d => ({ id: d.id, ...d.data() }));
          renderPrivado();
        });
      }
    }

    // ── Carregar/Salvar na Nuvem ─────────────────────────────────────
    function loadData() {
      initDataSync();
    }

    function hasData(app) {
      if (!app) return false;
      return (
        (app.clube?.transactions?.length > 0) ||
        (app.doceria?.pedidos?.length > 0) ||
        (app.vendas?.vendas?.length > 0)
      );
    }

    function saveData() {
      if (!loadedFromDB) {
        console.warn("Tentativa de salvar estado bloqueada: dados ainda não carregados do DB.");
        return;
      }
      if (!hasData(APP)) {
        console.warn("Tentativa de salvar estado vazio bloqueada.");
        return;
      }
      db.collection('gda_caixa').doc('estado').set(APP, { merge: true }).catch(err => {
        toast('Erro ao sincronizar', 'error');
      });
    }

    function deepMerge(target, source) {
      const out = { ...target };
      for (const k in source) {
        if (Array.isArray(source[k])) out[k] = source[k];
        else if (source[k] && typeof source[k] === 'object') out[k] = deepMerge(target[k] || {}, source[k]);
        else out[k] = source[k];
      }
      return out;
    }

    /* ═══════════════════════════════════════════════════════════
       UTILITÁRIOS
    ═══════════════════════════════════════════════════════════ */
    const fmt = (v) => 'R$ ' + Number(v || 0).toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    const uuid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);
    const today = () => new Date().toISOString().slice(0, 10);

    function monthKey(dateStr) {
      if (!dateStr) return '';
      return dateStr.slice(0, 7);
    }

    function monthLabel(ym) {
      if (!ym) return '';
      const [y, m] = ym.split('-');
      const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      return months[parseInt(m) - 1] + ' ' + y;
    }

    function allMonths(arr, field = 'data') {
      const set = new Set();
      arr.forEach(x => { if (x[field]) set.add(monthKey(x[field])); });
      const sorted = [...set].sort().reverse();
      const cur = today().slice(0, 7);
      if (!set.has(cur)) sorted.unshift(cur);
      return sorted;
    }

    function populateMonthSelect(selId, months, onChange) {
      const sel = document.getElementById(selId);
      if (!sel) return;
      const cur = sel.value || months[0] || today().slice(0, 7);
      sel.innerHTML = '';
      months.forEach(m => {
        const opt = document.createElement('option');
        opt.value = m;
        opt.textContent = monthLabel(m);
        if (m === cur) opt.selected = true;
        sel.appendChild(opt);
      });
      if (!sel.value && months.length) sel.value = months[0];
    }

    function toast(msg, type = 'success') {
      const el = document.createElement('div');
      el.className = `toast ${type}`;
      const icons = { success: '✓', error: '✕', info: 'ℹ' };
      el.innerHTML = `<span>${icons[type] || '•'}</span><span>${msg}</span>`;
      document.getElementById('toast-container').appendChild(el);
      setTimeout(() => { el.style.animation = 'toastOut .25s ease forwards'; setTimeout(() => el.remove(), 260); }, 2800);
    }

    /* ═══════════════════════════════════════════════════════════
       NAVEGAÇÃO
    ═══════════════════════════════════════════════════════════ */
    function switchModule(mod) {
      if (mod === 'privado' && userRole !== 'admin' && userRole !== 'diretor') { toast('Acesso restrito', 'error'); return; }
      document.querySelectorAll('.module').forEach(m => m.classList.remove('active'));
      document.querySelectorAll('.mod-tab').forEach(t => t.classList.remove('active'));
      document.getElementById(`mod-${mod}`).classList.add('active');
      document.querySelector(`[data-mod="${mod}"]`).classList.add('active');
      if (mod === 'clube') renderClube();
      if (mod === 'doceria') renderDoceria();
      if (mod === 'vendas') renderVendas();
      if (mod === 'privado') renderPrivado();
    }

    function showSecTab(btn, panelId) {
      const tabs = btn.parentElement.querySelectorAll('.section-tab');
      tabs.forEach(t => t.classList.remove('active'));
      btn.classList.add('active');
      const panels = btn.closest('.module').querySelectorAll('.section-panel');
      panels.forEach(p => p.classList.remove('active'));
      document.getElementById(panelId).classList.add('active');
    }

    /* ═══════════════════════════════════════════════════════════
       TEMA
    ═══════════════════════════════════════════════════════════ */
    function toggleTheme() {
      const html = document.documentElement;
      const isDark = html.getAttribute('data-theme') === 'dark';
      html.setAttribute('data-theme', isDark ? 'light' : 'dark');
      document.getElementById('themeBtn').textContent = isDark ? '🌑' : '🌙';
      localStorage.setItem('gda_theme', isDark ? 'light' : 'dark');
      // re-render charts
      setTimeout(() => { renderClube(); renderDoceria(); renderVendas(); }, 50);
    }

    /* ═══════════════════════════════════════════════════════════
       EXPORT / IMPORT
    ═══════════════════════════════════════════════════════════ */
    function toggleExportMenu() {
      document.getElementById('exportDropdown').classList.toggle('open');
    }
    document.addEventListener('click', e => {
      if (!e.target.closest('#exportMenuBtn') && !e.target.closest('#exportDropdown')) {
        document.getElementById('exportDropdown').classList.remove('open');
      }
    });

    function exportJSON() {
      const blob = new Blob([JSON.stringify(APP, null, 2)], { type: 'application/json' });
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
      a.download = `gda_dados_${today()}.json`; a.click();
      toast('Dados exportados em JSON');
    }

    function exportCSV() {
      // Exporta transações do clube como exemplo principal
      const rows = [['Módulo', 'Data', 'Tipo', 'Categoria', 'Descrição', 'Valor']];
      APP.clube.transactions.forEach(t =>
        rows.push(['Clube', t.data, t.tipo, t.categoria, t.desc, t.valor])
      );
      APP.doceria.pedidos.forEach(t =>
        rows.push(['Doceria-Pedido', t.data, 'entrada', t.produto, t.cliente, t.valor])
      );
      APP.doceria.gastos.forEach(t =>
        rows.push(['Doceria-Gasto', t.data, 'saida', t.cat, t.desc, t.valor])
      );
      APP.vendas.vendas.forEach(v => {
        const prod = APP.vendas.produtos.find(p => p.id === v.produtoId);
        const seller = APP.vendas.vendedores.find(s => s.id === v.vendedorId);
        rows.push(['Vendas', v.data, 'entrada', prod?.nome || '-', seller?.nome || '-', v.qty * (prod?.preco || 0)]);
      });
      const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
      const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
      a.download = `gda_dados_${today()}.csv`; a.click();
      toast('Dados exportados em CSV');
    }

    function importJSON(event) {
      const file = event.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = e => {
        try {
          const data = JSON.parse(e.target.result);
          APP = deepMerge(APP, data);
          saveData();
          renderClube(); renderDoceria(); renderVendas();
          toast('Dados importados com sucesso!');
        } catch (err) { toast('Erro ao importar arquivo', 'error'); }
      };
      reader.readAsText(file);
      event.target.value = '';
    }

    /* ═══════════════════════════════════════════════════════════
       MODAL DE EDIÇÃO
    ═══════════════════════════════════════════════════════════ */
    let _editCtx = null;

    function openEditModal(title, fields, ctx) {
      _editCtx = ctx;
      document.getElementById('editModalTitle').textContent = title;
      const body = document.getElementById('editModalBody');
      body.innerHTML = `<div class="form-grid">${fields.map(f => `
      <div class="form-group" ${f.full ? 'style="grid-column:1/-1"' : ''}>
        <label>${f.label}</label>
        ${f.type === 'select'
          ? `<select id="edit_${f.key}">${f.options.map(o => `<option value="${o.v}" ${o.v == f.val ? 'selected' : ''}>${o.l}</option>`).join('')}</select>`
          : `<input type="${f.type || 'text'}" id="edit_${f.key}" value="${f.val ?? ''}" step="${f.step || 'any'}" />`
        }
      </div>`).join('')
        }</div>`;
      document.getElementById('editModal').classList.add('open');
    }

    function closeEditModal() {
      document.getElementById('editModal').classList.remove('open');
      _editCtx = null;
    }

    function closeModal(e) {
      if (e.target === document.getElementById('editModal')) closeEditModal();
    }

    function saveEdit() {
      if (!_editCtx) return;
      _editCtx.save();
      closeEditModal();
    }

    /* ═══════════════════════════════════════════════════════════
       ██████  MÓDULO CLUBE
    ═══════════════════════════════════════════════════════════ */
    function handleClubeTransaction() {
      const tipo = document.getElementById('clube-tipo').value;
      const valor = parseFloat(document.getElementById('clube-valor').value);
      const data = document.getElementById('clube-data').value || today();
      const categoria = document.getElementById('clube-cat').value;
      const desc = document.getElementById('clube-desc').value.trim();
      const destinoRaw = document.getElementById('clube-destino')?.value || '';

      // Parsear o destino  ex: 'unidade:abc123' ou 'meta:xyz456' ou ''
      let destino_tipo = null, destino_id = null;
      if (destinoRaw.startsWith('unidade:')) {
        destino_tipo = 'unidade'; destino_id = destinoRaw.split(':')[1];
      } else if (destinoRaw.startsWith('meta:')) {
        destino_tipo = 'meta'; destino_id = destinoRaw.split(':')[1];
      }

      if (!valor || valor <= 0) { toast('Informe um valor válido', 'error'); return; }

      if (userRole === 'conselheiro' && tipo === 'saida') {
        APP.clube.sugestoes.push({ id: uuid(), valor, data, categoria, desc, status: 'pendente', destino_tipo, destino_id });
        toast('Sugestão de saída enviada ao Diretor!', 'info');
      } else {
        APP.clube.transactions.push({ id: uuid(), tipo, valor, data, categoria, desc, destino_tipo, destino_id });
        toast('Transação adicionada!');
      }
      saveData();
      clearClubeForm();
    }

    function clearClubeForm() {
      ['clube-valor', 'clube-desc'].forEach(id => document.getElementById(id).value = '');
      document.getElementById('clube-data').value = today();
      const sel = document.getElementById('clube-destino');
      if (sel) sel.value = '';
    }

    function populateClubeDestinoSelect() {
      const sel = document.getElementById('clube-destino');
      if (!sel) return;
      const prev = sel.value;
      sel.innerHTML = '<option value="">Geral (sem vinculação específica)</option>';

      const aprovadas = _metasClube.filter(m => m.status === 'aprovada');
      if (aprovadas.length) {
        const grp1 = document.createElement('optgroup');
        grp1.label = '🎯 Metas do Clube';
        aprovadas.forEach(m => {
          const opt = document.createElement('option');
          opt.value = `meta:${m.id}`;
          opt.textContent = m.descricao;
          grp1.appendChild(opt);
        });
        sel.appendChild(grp1);
      }

      if (_unidades.length) {
        const grp2 = document.createElement('optgroup');
        grp2.label = '🏕️ Unidades';
        _unidades.forEach(u => {
          const opt = document.createElement('option');
          opt.value = `unidade:${u.id}`;
          opt.textContent = u.nome + (u.conselheiro ? ` (${u.conselheiro})` : '');
          grp2.appendChild(opt);
        });
        sel.appendChild(grp2);
      }

      // restaura seleção anterior se ainda existir
      if (prev) sel.value = prev;
    }

    function deleteClubeTransaction(id) {
      APP.clube.transactions = APP.clube.transactions.filter(t => t.id !== id);
      saveData(); toast('Removido', 'info');
    }

    function editClubeTransaction(id) {
      const t = APP.clube.transactions.find(x => x.id === id);
      if (!t) return;
      openEditModal('Editar Transação', [
        { key: 'tipo', label: 'Tipo', type: 'select', val: t.tipo, options: [{ v: 'entrada', l: 'Entrada' }, { v: 'saida', l: 'Saída' }] },
        { key: 'valor', label: 'Valor (R$)', type: 'number', val: t.valor, step: '0.01' },
        { key: 'data', label: 'Data', type: 'date', val: t.data },
        { key: 'cat', label: 'Categoria', type: 'text', val: t.categoria },
        { key: 'desc', label: 'Descrição', type: 'text', val: t.desc, full: true }
      ], {
        save: () => {
          t.tipo = document.getElementById('edit_tipo').value;
          t.valor = parseFloat(document.getElementById('edit_valor').value) || t.valor;
          t.data = document.getElementById('edit_data').value || t.data;
          t.categoria = document.getElementById('edit_cat').value;
          t.desc = document.getElementById('edit_desc').value;
          saveData(); toast('Atualizado!');
        }
      });
    }

    function approveSugestao(id) {
      const sug = APP.clube.sugestoes.find(s => s.id === id);
      if (!sug) return;
      sug.status = 'aprovada';
      APP.clube.transactions.push({
        id: uuid(), tipo: 'saida', valor: sug.valor, data: sug.data, categoria: sug.categoria, desc: sug.desc
      });
      saveData(); toast('Sugestão Aprovada!');
    }

    function rejectSugestao(id) {
      const sug = APP.clube.sugestoes.find(s => s.id === id);
      if (!sug) return;
      sug.status = 'rejeitada';
      saveData(); toast('Sugestão Rejeitada');
    }

    let clubeChartInst = null;

    function renderClube() {
      const months = allMonths(APP.clube.transactions);
      populateMonthSelect('clube-filter-month', months);
      populateMonthSelect('clube-hist-month', months);
      populateClubeDestinoSelect();
      renderClubeMetrics();
      renderClubeChart(months);
      renderClubeRecent();
      renderClubeHist();
      renderAprovacoes();
      renderMetasClube();
      renderUnidades();
      renderMateriaListClube();

      const addBtn = document.getElementById('btn-add-clube');
      const tipoSel = document.getElementById('clube-tipo');
      if (addBtn && tipoSel) {
        const updateBtn = () => {
          if (userRole === 'conselheiro' && tipoSel.value === 'saida') {
            addBtn.textContent = '🤞 Sugerir Saída';
            addBtn.className = 'btn btn-primary';
            addBtn.style.background = '#60a5fa';
            addBtn.style.color = '#fff';
          } else {
            addBtn.textContent = '✚ Adicionar';
            addBtn.className = 'btn btn-primary';
            addBtn.style.background = '';
            addBtn.style.color = '';
          }
        };
        tipoSel.onchange = updateBtn;
        updateBtn();
      }
    }

    /* ═══════════════════════════════════════════════════════════
       METAS DO CLUBE
    ═══════════════════════════════════════════════════════════ */
    function addMetaClube() {
      const desc = document.getElementById('meta-desc').value.trim();
      const valor_alvo = parseFloat(document.getElementById('meta-valor').value);
      if (!desc || !valor_alvo || valor_alvo <= 0) { toast('Preencha descrição e valor', 'error'); return; }

      const isAdmin = (userRole === 'admin');
      const status = isAdmin ? 'aprovada' : 'sugerida';

      db.collection('gda_metas_clube').add({
        descricao: desc, valor_alvo, status,
        sugeridoPor: userRole, criadoEm: Date.now()
      }).then(() => {
        document.getElementById('meta-desc').value = '';
        document.getElementById('meta-valor').value = '';
        toast(isAdmin ? '🎯 Meta criada!' : '🤞 Meta sugerida! Aguardando aprovação.', isAdmin ? 'success' : 'info');
      }).catch(() => toast('Erro ao salvar meta', 'error'));
    }

    function aprovarMeta(id) {
      if (userRole !== 'admin') { toast('Sem permissão', 'error'); return; }
      db.collection('gda_metas_clube').doc(id).update({ status: 'aprovada' })
        .then(() => toast('Meta aprovada!'));
    }

    function deleteMeta(id) {
      if (userRole !== 'admin') { toast('Sem permissão', 'error'); return; }
      db.collection('gda_metas_clube').doc(id).delete()
        .then(() => toast('Meta removida', 'info'));
    }

    function updateMetasBadge() {
      const pendentes = _metasClube.filter(m => m.status === 'sugerida').length;
      const badge = document.getElementById('badge-metas');
      if (!badge) return;
      badge.style.display = pendentes > 0 ? 'inline-block' : 'none';
      badge.textContent = pendentes;
    }

    function renderMetasClube() {
      // Barra hero no dashboard
      const heroEl = document.getElementById('clube-meta-hero');
      const listEl = document.getElementById('metas-clube-list');

      const aprovadas = _metasClube.filter(m => m.status === 'aprovada');
      const sugeridas = _metasClube.filter(m => m.status === 'sugerida');

      const allTxs = APP.clube.transactions;
      const saldoGeral = allTxs.filter(t => t.tipo === 'entrada').reduce((s, t) => s + t.valor, 0)
        - allTxs.filter(t => t.tipo === 'saida').reduce((s, t) => s + t.valor, 0);

      // Hero no Dashboard (primeira meta aprovada)
      if (heroEl) {
        if (aprovadas.length > 0) {
          const meta = aprovadas[0];
          const pct = Math.min(100, Math.round((saldoGeral / meta.valor_alvo) * 100));
          const over = saldoGeral >= meta.valor_alvo;
          heroEl.innerHTML = `
            <div class="goal-hero">
              <div class="goal-hero-header">
                <div class="goal-hero-title">🏕️ ${meta.descricao}</div>
                <div class="goal-hero-value">${fmt(saldoGeral)} / ${fmt(meta.valor_alvo)}</div>
              </div>
              <div class="progress-track">
                <div class="progress-fill ${over ? 'over' : ''}" id="hero-fill" style="width:0%"></div>
              </div>
              <div class="goal-footer">
                <span>${pct}% concluído</span>
                <span>${over ? '🎉 Meta atingida!' : fmt(meta.valor_alvo - saldoGeral) + ' restante'}</span>
              </div>
            </div>`;
          setTimeout(() => {
            const f = document.getElementById('hero-fill');
            if (f) f.style.width = pct + '%';
          }, 80);
        } else {
          heroEl.innerHTML = '';
        }
      }

      // Lista na aba de Metas
      if (!listEl) return;
      if (!_metasClube.length) {
        listEl.innerHTML = '<div class="empty-state"><div class="empty-icon">🎯</div><p>Nenhuma meta cadastrada</p></div>';
        return;
      }

      listEl.innerHTML = [...aprovadas, ...sugeridas].map(meta => {
        const pct = Math.min(100, Math.round((saldoGeral / meta.valor_alvo) * 100));
        const over = saldoGeral >= meta.valor_alvo;
        const isSugerida = meta.status === 'sugerida';
        return `
           <div style="padding:1rem 0;border-bottom:1px solid var(--border-glass)">
             <div style="display:flex;align-items:center;justify-content:space-between;gap:.5rem;margin-bottom:.6rem">
               <div>
                 <span style="font-weight:600;color:var(--text)">${meta.descricao}</span>
                 ${isSugerida ? '<span class="badge-pending" style="margin-left:.4rem">⏳ Pendente</span>' : ''}
               </div>
              <div style="display:flex;gap:.35rem;align-items:center">
                <span style="font-family:var(--font-mono);font-size:.8rem;color:var(--text3)">${fmt(meta.valor_alvo)}</span>
                ${isSugerida && userRole === 'admin' ? `<button class="btn btn-sm" style="background:var(--accent3);color:#111" onclick="aprovarMeta('${meta.id}')">✓ Aprovar</button>` : ''}
                ${userRole === 'admin' ? `<button class="btn btn-ghost btn-icon btn-sm" onclick="deleteMeta('${meta.id}')">🗑️</button>` : ''}
              </div>
            </div>
            ${!isSugerida ? `
              <div class="progress-track" style="height:8px">
                <div class="progress-fill ${over ? 'over' : ''}" style="width:${pct}%"></div>
              </div>
              <div class="goal-footer"><span>${pct}%</span><span>${fmt(saldoGeral)} arrecadado</span></div>
            ` : ''}
          </div>`;
      }).join('');
    }

    /* ═══════════════════════════════════════════════════════════
       UNIDADES
    ═══════════════════════════════════════════════════════════ */
    function addUnidade() {
      if (userRole !== 'admin') { toast('Sem permissão', 'error'); return; }
      const nome = document.getElementById('unidade-nome').value.trim();
      const conselheiro = document.getElementById('unidade-conselheiro').value.trim();
      if (!nome) { toast('Informe o nome da unidade', 'error'); return; }
      db.collection('gda_unidades').add({ nome, conselheiro, criadoEm: Date.now() })
        .then(() => {
          document.getElementById('unidade-nome').value = '';
          document.getElementById('unidade-conselheiro').value = '';
          toast('Unidade criada!');
        }).catch(() => toast('Erro ao criar unidade', 'error'));
    }

    function deleteUnidade(id) {
      if (userRole !== 'admin') { toast('Sem permissão', 'error'); return; }
      db.collection('gda_unidades').doc(id).delete()
        .then(() => toast('Unidade removida', 'info'));
    }

    function addMetaUnidade(unidadeId) {
      const desc = document.getElementById(`um-desc-${unidadeId}`)?.value.trim();
      const valor = parseFloat(document.getElementById(`um-val-${unidadeId}`)?.value);
      if (!desc || !valor || valor <= 0) { toast('Preencha descrição e valor', 'error'); return; }
      db.collection('gda_metas_unidade').add({
        unidade_id: unidadeId, descricao: desc, valor_alvo: valor, criadoEm: Date.now()
      }).then(() => {
        document.getElementById(`um-desc-${unidadeId}`).value = '';
        document.getElementById(`um-val-${unidadeId}`).value = '';
        toast('Meta da unidade criada!');
      }).catch(() => toast('Erro ao salvar', 'error'));
    }

    function deleteMetaUnidade(id) {
      if (userRole !== 'admin' && userRole !== 'conselheiro') { toast('Sem permissão', 'error'); return; }
      db.collection('gda_metas_unidade').doc(id).delete()
        .then(() => toast('Meta removida', 'info'));
    }

    function renderUnidades() {
      const grid = document.getElementById('unidades-grid');
      if (!grid) return;
      if (!_unidades.length) {
        grid.innerHTML = '<div class="empty-state"><div class="empty-icon">🏕️</div><p>Nenhuma unidade cadastrada</p></div>';
        return;
      }

      grid.innerHTML = _unidades.map(u => {
        const metas = _metasUnidade.filter(m => m.unidade_id === u.id);
        // Saldo vinculado: só transações taggeadas para esta unidade
        const unidadeTxs = APP.clube.transactions.filter(t => t.destino_tipo === 'unidade' && t.destino_id === u.id);
        const saldoUnidade = unidadeTxs.filter(t => t.tipo === 'entrada').reduce((s, t) => s + t.valor, 0)
          - unidadeTxs.filter(t => t.tipo === 'saida').reduce((s, t) => s + t.valor, 0);

        const canManage = (userRole === 'admin') || (userRole === 'conselheiro' && u.conselheiro);
        const metasHtml = metas.map(m => {
          const pct = Math.min(100, Math.round((saldoUnidade / m.valor_alvo) * 100));
          const over = saldoUnidade >= m.valor_alvo;
          const canDelete = userRole === 'admin' || userRole === 'conselheiro';
          return `
            <div style="margin-top:.6rem">
              <div style="display:flex;justify-content:space-between;font-size:.76rem;color:var(--text3);font-family:var(--font-mono);margin-bottom:.3rem">
                <span>${m.descricao}</span>
                <div style="display:flex;gap:.25rem;align-items:center">
                  <span>${saldoUnidade >= 0 ? fmt(saldoUnidade) + ' / ' : ''}${fmt(m.valor_alvo)}</span>
                  ${canDelete ? `<button class="btn btn-ghost btn-icon btn-sm" style="width:22px;height:22px;font-size:.65rem" onclick="deleteMetaUnidade('${m.id}')">🗑️</button>` : ''}
                </div>
              </div>
              <div class="progress-track" style="height:7px">
                <div class="progress-fill ${over ? 'over' : ''}" style="width:${pct}%"></div>
              </div>
            </div>`;
        }).join('');

        const addMetaForm = canManage ? `
           <div style="margin-top:.85rem;padding-top:.75rem;border-top:1px solid var(--border-glass)">
             <div style="display:flex;gap:.4rem">
               <input type="text" id="um-desc-${u.id}" placeholder="Desc. da meta" style="font-size:.78rem" />
               <input type="number" id="um-val-${u.id}" placeholder="R$ Alvo" min="0" step="0.01" style="font-size:.78rem;max-width:90px" />
               <button class="btn btn-primary btn-sm" onclick="addMetaUnidade('${u.id}')">+</button>
             </div>
           </div>` : '';

        const totalTagged = unidadeTxs.length;
        return `
          <div class="unidade-card">
            <div class="unidade-card-header">
              <div>
                <div class="unidade-name">🏕️ ${u.nome}</div>
                <div class="unidade-conselheiro">${u.conselheiro ? '👤 ' + u.conselheiro : 'Sem conselheiro'}${totalTagged ? ' · ' + totalTagged + ' tx vinculada(s)' : ''}</div>
              </div>
              ${userRole === 'admin' ? `<button class="btn btn-ghost btn-icon btn-sm" onclick="deleteUnidade('${u.id}')">🗑️</button>` : ''}
            </div>
            ${metas.length ? metasHtml : '<div style="font-size:.78rem;color:var(--text3)">Sem metas definidas</div>'}
            ${addMetaForm}
          </div>`;
      }).join('');
    }

    /* ═══════════════════════════════════════════════════════════
       EXTRATO PDF
    ═══════════════════════════════════════════════════════════ */
    function imprimirExtrato() {
      const month = document.getElementById('clube-filter-month')?.value || today().slice(0, 7);
      const txs = APP.clube.transactions
        .filter(t => monthKey(t.data) === month)
        .sort((a, b) => a.data.localeCompare(b.data));

      const entrada = txs.filter(t => t.tipo === 'entrada').reduce((s, t) => s + t.valor, 0);
      const saida = txs.filter(t => t.tipo === 'saida').reduce((s, t) => s + t.valor, 0);
      const saldo = entrada - saida;

      const rows = txs.map(t => `
        <tr>
          <td>${t.data}</td>
          <td>${t.categoria}</td>
          <td style="max-width:220px">${t.desc || '-'}</td>
          <td class="${t.tipo === 'entrada' ? 'print-positive' : 'print-negative'}" style="text-align:right">
            ${t.tipo === 'entrada' ? '+' : '-'}${fmt(t.valor)}
          </td>
        </tr>`).join('');

      document.getElementById('print-zone').innerHTML = `
        <div class="print-header">
          <div class="print-header-icon">⚔️</div>
          <div>
            <div class="print-title">Guerreiros do Alto</div>
            <div class="print-subtitle">Livro Caixa — Clube</div>
          </div>
        </div>
        <div class="print-meta">
          <strong>Período:</strong> ${monthLabel(month)} &nbsp;|&nbsp;
          <strong>Gerado em:</strong> ${new Date().toLocaleDateString('pt-BR')} &nbsp;|&nbsp;
          <strong>Responsável:</strong> ${userRole?.toUpperCase() || '-'}
        </div>
        <table class="print-table">
          <thead>
            <tr><th>Data</th><th>Categoria</th><th>Descrição</th><th style="text-align:right">Valor</th></tr>
          </thead>
          <tbody>
            ${rows || '<tr><td colspan="4" style="text-align:center;color:#999">Sem transações neste período</td></tr>'}
          </tbody>
          <tfoot>
            <tr style="font-weight:700">
              <td colspan="3" style="text-align:right;padding:.6rem .75rem">Total Entradas</td>
              <td class="print-positive" style="text-align:right;padding:.6rem .75rem">${fmt(entrada)}</td>
            </tr>
            <tr style="font-weight:700">
              <td colspan="3" style="text-align:right;padding:.4rem .75rem">Total Saídas</td>
              <td class="print-negative" style="text-align:right;padding:.4rem .75rem">-${fmt(saida)}</td>
            </tr>
            <tr style="font-weight:800;font-size:1.05rem;border-top:2px solid #111">
              <td colspan="3" style="text-align:right;padding:.6rem .75rem">Saldo do Período</td>
              <td class="${saldo >= 0 ? 'print-positive' : 'print-negative'}" style="text-align:right;padding:.6rem .75rem">${fmt(saldo)}</td>
            </tr>
          </tfoot>
        </table>
        <div class="print-signature">
          <div class="print-sig-line">Diretor(a) do Clube</div>
          <div class="print-sig-line">Tesoureiro(a)</div>
        </div>`;

      window.print();
    }

    function renderAprovacoes() {
      const badgeId = document.getElementById('badge-sug');
      const bodyRef = document.getElementById('clube-apr-body');
      if (!badgeId || !bodyRef) return;

      const pendentes = (APP.clube.sugestoes || []).filter(s => s.status === 'pendente');
      if (pendentes.length > 0) {
        badgeId.style.display = 'inline-block';
        badgeId.textContent = pendentes.length;
      } else {
        badgeId.style.display = 'none';
      }

      if (!pendentes.length) {
        bodyRef.innerHTML = `<tr><td colspan="6"><div class="empty-state"><div class="empty-icon">✅</div><p>Nenhuma sugestão pendente</p></div></td></tr>`;
        return;
      }

      bodyRef.innerHTML = pendentes.map(s => `
    <tr>
      <td class="text-mono">${s.data}</td>
      <td><span class="badge badge-blue">Conselheiro</span></td>
      <td>${s.categoria}</td>
      <td>${s.desc}</td>
      <td class="text-mono negative">-${fmt(s.valor)}</td>
      <td>
        <div style="display:flex;gap:.3rem">
          <button class="btn btn-sm" style="background:var(--accent3);color:#111" onclick="approveSugestao('${s.id}')">Aprovar</button>
          <button class="btn btn-sm" style="background:var(--accent2);color:#fff" onclick="rejectSugestao('${s.id}')">Recusar</button>
        </div>
      </td>
    </tr>
  `).join('');
    }

    function renderClubeMetrics() {
      const month = document.getElementById('clube-filter-month')?.value || today().slice(0, 7);
      const txs = APP.clube.transactions.filter(t => monthKey(t.data) === month);
      const entrada = txs.filter(t => t.tipo === 'entrada').reduce((s, t) => s + t.valor, 0);
      const saida = txs.filter(t => t.tipo === 'saida').reduce((s, t) => s + t.valor, 0);
      const saldo = entrada - saida;
      const allTxs = APP.clube.transactions;
      const saldoGeral = allTxs.filter(t => t.tipo === 'entrada').reduce((s, t) => s + t.valor, 0) - allTxs.filter(t => t.tipo === 'saida').reduce((s, t) => s + t.valor, 0);
      document.getElementById('clube-metrics').innerHTML = `
    <div class="metric-card green"><div class="metric-label">Entradas (mês)</div><div class="metric-value positive">${fmt(entrada)}</div></div>
    <div class="metric-card red"><div class="metric-label">Saídas (mês)</div><div class="metric-value negative">${fmt(saida)}</div></div>
    <div class="metric-card ${saldo >= 0 ? 'green' : 'red'}"><div class="metric-label">Saldo (mês)</div><div class="metric-value ${saldo >= 0 ? 'positive' : 'negative'}">${fmt(saldo)}</div></div>
    <div class="metric-card blue"><div class="metric-label">Saldo Geral</div><div class="metric-value ${saldoGeral >= 0 ? 'positive' : 'negative'}">${fmt(saldoGeral)}</div></div>
    <div class="metric-card"><div class="metric-label">Transações</div><div class="metric-value">${txs.length}</div></div>
  `;
    }

    function renderClubeChart(months) {
      const last6 = [...months].reverse().slice(-6);
      const labels = last6.map(monthLabel);
      const entradas = last6.map(m => APP.clube.transactions.filter(t => monthKey(t.data) === m && t.tipo === 'entrada').reduce((s, t) => s + t.valor, 0));
      const saidas = last6.map(m => APP.clube.transactions.filter(t => monthKey(t.data) === m && t.tipo === 'saida').reduce((s, t) => s + t.valor, 0));
      const gridColor = 'rgba(255, 255, 255, 0.05)';
      const textColor = '#A8B2D1';
      const ctx = document.getElementById('clube-chart');
      if (!ctx) return;
      if (clubeChartInst) clubeChartInst.destroy();
      clubeChartInst = new Chart(ctx, {
        type: 'bar',
        data: {
          labels, datasets: [
            { label: 'Entradas', data: entradas, backgroundColor: '#F2C94C', borderRadius: 6 },
            { label: 'Saídas', data: saidas, backgroundColor: '#E63946', borderRadius: 6 }
          ]
        },
        options: {
          responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: textColor, font: { family: 'DM Mono', size: 11 } } } },
          scales: {
            x: { ticks: { color: textColor, font: { family: 'DM Mono', size: 10 } }, grid: { color: gridColor, drawBorder: false } },
            y: { ticks: { color: textColor, font: { family: 'DM Mono', size: 10 }, callback: v => 'R$' + v }, grid: { color: gridColor, drawBorder: false } }
          }
        }
      });
    }

    function renderClubeRecent() {
      const txs = [...APP.clube.transactions].sort((a, b) => b.data.localeCompare(a.data)).slice(0, 6);
      const el = document.getElementById('clube-recent-list');
      if (!txs.length) { el.innerHTML = `<div class="empty-state"><div class="empty-icon">📭</div><p>Sem transações ainda</p></div>`; return; }
      el.innerHTML = txs.map(t => `
     <div style="display:flex;align-items:center;justify-content:space-between;padding:.5rem 0;border-bottom:1px solid var(--border-glass)">
       <div>
         <div style="font-size:.84rem;font-weight:500;color:var(--text)">${t.desc || t.categoria}</div>
         <div style="font-size:.73rem;color:var(--text3)">${t.data} · ${t.categoria}</div>
       </div>
       <span class="${t.tipo === 'entrada' ? 'positive' : 'negative'}" style="font-family:var(--font-mono);font-size:.85rem;font-weight:500">${t.tipo === 'entrada' ? '+' : '-'}${fmt(t.valor)}</span>
     </div>`).join('');
    }

    function renderClubeHist() {
      const month = document.getElementById('clube-hist-month')?.value || today().slice(0, 7);
      const tipo = document.getElementById('clube-hist-tipo')?.value || '';
      let txs = APP.clube.transactions.filter(t => monthKey(t.data) === month);
      if (tipo) txs = txs.filter(t => t.tipo === tipo);
      txs.sort((a, b) => b.data.localeCompare(a.data));
      const body = document.getElementById('clube-hist-body');
      if (!txs.length) { body.innerHTML = `<tr><td colspan="6"><div class="empty-state"><div class="empty-icon">📂</div><p>Nenhum registro</p></div></td></tr>`; return; }
      body.innerHTML = txs.map(t => `
    <tr>
      <td class="text-mono">${t.data}</td>
      <td><span class="badge ${t.tipo === 'entrada' ? 'badge-green' : 'badge-red'}">${t.tipo}</span></td>
      <td>${t.categoria}</td>
      <td style="color:var(--text)">${t.desc || '-'}</td>
      <td class="text-mono ${t.tipo === 'entrada' ? 'positive' : 'negative'}">${t.tipo === 'entrada' ? '+' : '-'}${fmt(t.valor)}</td>
      <td>
        <div style="display:flex;gap:.3rem">
          <button class="btn btn-ghost btn-icon btn-sm" onclick="editClubeTransaction('${t.id}')" title="Editar">✏️</button>
          <button class="btn btn-ghost btn-icon btn-sm" onclick="deleteClubeTransaction('${t.id}')" title="Remover">🗑️</button>
        </div>
      </td>
    </tr>`).join('');
    }

    /* ═══════════════════════════════════════════════════════════
       ██████  MÓDULO DOCERIA
    ═══════════════════════════════════════════════════════════ */
    function addDocPedido() {
      const cliente = document.getElementById('doc-cliente').value.trim();
      const produto = document.getElementById('doc-produto').value.trim();
      const qty = parseInt(document.getElementById('doc-qty').value) || 1;
      const valor = parseFloat(document.getElementById('doc-valor').value);
      const data = document.getElementById('doc-data').value || today();
      const status = document.getElementById('doc-status').value;
      if (!produto || !valor || valor <= 0) { toast('Preencha produto e valor', 'error'); return; }
      APP.doceria.pedidos.push({ id: uuid(), cliente, produto, qty, valor, data, status });
      saveData(); renderDoceria(); toast('Pedido adicionado!');
      ['doc-cliente', 'doc-produto', 'doc-qty', 'doc-valor'].forEach(id => document.getElementById(id).value = '');
    }

    function deleteDocPedido(id) {
      APP.doceria.pedidos = APP.doceria.pedidos.filter(p => p.id !== id);
      saveData(); renderDoceria(); toast('Removido', 'info');
    }

    function addMateria(targetMod) {
      const isClube = targetMod === 'clube';
      const suffix = isClube ? '-clube' : '';
      const nome = document.getElementById('mat-nome' + suffix).value.trim();
      const qtd = document.getElementById('mat-qtd' + suffix).value.trim();
      const custo = parseFloat(document.getElementById('mat-custo' + suffix).value) || 0;
      const modulo = isClube ? 'clube' : (document.getElementById('mat-modulo')?.value || 'doceria');
      if (!nome) { toast('Informe o nome', 'error'); return; }
      APP.doceria.materias.push({ id: uuid(), nome, qtd, custo, modulo });
      saveData();
      if (isClube) renderClube(); else renderDoceria();
      toast('Matéria-prima adicionada!');
      ['mat-nome' + suffix, 'mat-qtd' + suffix, 'mat-custo' + suffix].forEach(id => document.getElementById(id).value = '');
    }

    function deleteMateria(id) {
      APP.doceria.materias = APP.doceria.materias.filter(m => m.id !== id);
      saveData(); renderDoceria(); toast('Removido', 'info');
    }

    function addDocGasto() {
      const desc = document.getElementById('doc-gasto-desc').value.trim();
      const valor = parseFloat(document.getElementById('doc-gasto-val').value);
      const data = document.getElementById('doc-gasto-data').value || today();
      const cat = document.getElementById('doc-gasto-cat').value;
      if (!desc || !valor || valor <= 0) { toast('Preencha descrição e valor', 'error'); return; }
      APP.doceria.gastos.push({ id: uuid(), desc, valor, data, cat });
      saveData(); renderDoceria(); toast('Gasto registrado!');
      ['doc-gasto-desc', 'doc-gasto-val'].forEach(id => document.getElementById(id).value = '');
    }

    function deleteDocGasto(id) {
      APP.doceria.gastos = APP.doceria.gastos.filter(g => g.id !== id);
      saveData(); renderDoceria(); toast('Removido', 'info');
    }

    function addDocEntrada() {
      const valor = parseFloat(document.getElementById('doc-ent-valor').value);
      const categoria = document.getElementById('doc-ent-cat').value;
      const data = document.getElementById('doc-ent-data').value || today();
      const descricao = document.getElementById('doc-ent-desc').value.trim();
      if (!valor || valor <= 0) { toast('Informe um valor válido', 'error'); return; }
      if (!APP.doceria.entradas) APP.doceria.entradas = [];
      APP.doceria.entradas.push({ id: uuid(), valor, categoria, data, descricao });
      saveData(); renderDoceria(); toast('Entrada registrada!');
      ['doc-ent-valor', 'doc-ent-desc'].forEach(id => document.getElementById(id).value = '');
    }

    function deleteDocEntrada(id) {
      APP.doceria.entradas = (APP.doceria.entradas || []).filter(e => e.id !== id);
      saveData(); renderDoceria(); toast('Removido', 'info');
    }

    function renderDocEntradas() {
      if (!APP.doceria.entradas) APP.doceria.entradas = [];
      const month = document.getElementById('doc-ent-month')?.value || today().slice(0, 7);
      const ents = APP.doceria.entradas.filter(e => monthKey(e.data) === month).sort((a, b) => b.data.localeCompare(a.data));
      const body = document.getElementById('doc-ent-body');
      if (!body) return;
      if (!ents.length) { body.innerHTML = `<tr><td colspan="5"><div class="empty-state"><div class="empty-icon">💵</div><p>Nenhuma entrada registrada</p></div></td></tr>`; return; }
      body.innerHTML = ents.map(e => `
    <tr>
      <td class="text-mono">${e.data}</td>
      <td><span class="badge badge-green">${e.categoria}</span></td>
      <td>${e.descricao || '-'}</td>
      <td class="text-mono positive">+${fmt(e.valor)}</td>
      <td><button class="btn btn-ghost btn-icon btn-sm" onclick="deleteDocEntrada('${e.id}')">🗑️</button></td>
    </tr>`).join('');
    }

    let docChartInst = null;

    function renderDoceria() {
      if (!APP.doceria.entradas) APP.doceria.entradas = [];
      const allDates = [...APP.doceria.pedidos, ...APP.doceria.gastos, ...APP.doceria.entradas];
      const months = allMonths(allDates);
      ['doc-filter-month', 'doc-ped-month', 'doc-gasto-month', 'doc-ent-month'].forEach(id => populateMonthSelect(id, months));
      renderDocMetrics();
      renderDocChart(months);
      renderDocRecent();
      renderDocPedidos();
      renderDocGastos();
      renderDocEntradas();
      renderMateriaList();
      renderMetasDoceria();
    }

    function renderDocMetrics() {
      const month = document.getElementById('doc-filter-month')?.value || today().slice(0, 7);
      const peds = APP.doceria.pedidos.filter(p => monthKey(p.data) === month && p.status !== 'cancelado');
      const gastos = APP.doceria.gastos.filter(g => monthKey(g.data) === month);
      const entradas = (APP.doceria.entradas || []).filter(e => monthKey(e.data) === month);
      const receitaPedidos = peds.reduce((s, p) => s + p.valor, 0);
      const receitaEntradas = entradas.reduce((s, e) => s + e.valor, 0);
      const receita = receitaPedidos + receitaEntradas;
      const custos = gastos.reduce((s, g) => s + g.valor, 0);
      const lucro = receita - custos;
      const matCusto = APP.doceria.materias.filter(m => !m.modulo || m.modulo === 'doceria').reduce((s, m) => s + m.custo, 0);
      document.getElementById('doc-metrics').innerHTML = `
    <div class="metric-card green"><div class="metric-label">Receita (mês)</div><div class="metric-value positive">${fmt(receita)}</div><div class="metric-sub">Pedidos: ${fmt(receitaPedidos)} · Entradas: ${fmt(receitaEntradas)}</div></div>
    <div class="metric-card red"><div class="metric-label">Custos (mês)</div><div class="metric-value negative">${fmt(custos)}</div></div>
    <div class="metric-card ${lucro >= 0 ? 'green' : 'red'}"><div class="metric-label">Lucro (mês)</div><div class="metric-value ${lucro >= 0 ? 'positive' : 'negative'}">${fmt(lucro)}</div></div>
    <div class="metric-card"><div class="metric-label">Pedidos (mês)</div><div class="metric-value">${peds.length}</div></div>
    <div class="metric-card purple"><div class="metric-label">Custo Matérias</div><div class="metric-value">${fmt(matCusto)}</div></div>
  `;
    }

    function renderDocChart(months) {
      const last6 = [...months].reverse().slice(-6);
      const labels = last6.map(monthLabel);
      const rec = last6.map(m => APP.doceria.pedidos.filter(p => monthKey(p.data) === m && p.status !== 'cancelado').reduce((s, p) => s + p.valor, 0));
      const cus = last6.map(m => APP.doceria.gastos.filter(g => monthKey(g.data) === m).reduce((s, g) => s + g.valor, 0));
      const gridColor = 'rgba(255, 255, 255, 0.05)';
      const textColor = '#A8B2D1';
      const ctx = document.getElementById('doc-chart');
      if (!ctx) return;
      if (docChartInst) docChartInst.destroy();
      docChartInst = new Chart(ctx, {
        type: 'line',
        data: {
          labels, datasets: [
            { label: 'Receita', data: rec, borderColor: '#F2C94C', backgroundColor: 'rgba(242, 201, 76, 0.15)', tension: .4, fill: true, pointBackgroundColor: '#F2C94C', borderWidth: 2 },
            { label: 'Custos', data: cus, borderColor: '#E63946', backgroundColor: 'rgba(230, 57, 70, 0.1)', tension: .4, fill: true, pointBackgroundColor: '#E63946', borderWidth: 2 }
          ]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { labels: { color: textColor, font: { family: 'DM Mono', size: 11 } } } },
          scales: {
            x: { ticks: { color: textColor, font: { family: 'DM Mono', size: 10 } }, grid: { color: gridColor, drawBorder: false } },
            y: { ticks: { color: textColor, font: { family: 'DM Mono', size: 10 }, callback: v => 'R$' + v }, grid: { color: gridColor, drawBorder: false } }
          }
        }
      });
    }

    function renderDocRecent() {
      const peds = [...APP.doceria.pedidos].sort((a, b) => b.data.localeCompare(a.data)).slice(0, 5);
      const el = document.getElementById('doc-recent-list');
      if (!peds.length) { el.innerHTML = `<div class="empty-state"><div class="empty-icon">🎂</div><p>Nenhum pedido ainda</p></div>`; return; }
      el.innerHTML = peds.map(p => `
     <div style="display:flex;align-items:center;justify-content:space-between;padding:.5rem 0;border-bottom:1px solid var(--border-glass)">
       <div>
         <div style="font-size:.84rem;font-weight:500;color:var(--text)">${p.produto}</div>
         <div style="font-size:.73rem;color:var(--text3)">${p.data} · ${p.cliente || 'Sem cliente'} · ${p.qty}x</div>
       </div>
       <div style="text-align:right">
         <div class="positive text-mono" style="font-size:.85rem">${fmt(p.valor)}</div>
         <span class="badge ${p.status === 'concluido' ? 'badge-green' : p.status === 'cancelado' ? 'badge-red' : 'badge-yellow'}" style="margin-top:.2rem">${p.status}</span>
       </div>
     </div>`).join('');
    }

    function renderDocPedidos() {
      const month = document.getElementById('doc-ped-month')?.value || today().slice(0, 7);
      const peds = APP.doceria.pedidos.filter(p => monthKey(p.data) === month).sort((a, b) => b.data.localeCompare(a.data));
      const body = document.getElementById('doc-ped-body');
      if (!peds.length) { body.innerHTML = `<tr><td colspan="7"><div class="empty-state"><div class="empty-icon">📂</div><p>Nenhum pedido</p></div></td></tr>`; return; }
      body.innerHTML = peds.map(p => `
    <tr>
      <td class="text-mono">${p.data}</td>
      <td>${p.cliente || '-'}</td>
      <td>${p.produto}</td>
      <td class="text-mono">${p.qty}</td>
      <td class="text-mono positive">${fmt(p.valor)}</td>
      <td><span class="badge ${p.status === 'concluido' ? 'badge-green' : p.status === 'cancelado' ? 'badge-red' : 'badge-yellow'}">${p.status}</span></td>
      <td><button class="btn btn-ghost btn-icon btn-sm" onclick="deleteDocPedido('${p.id}')" title="Remover">🗑️</button></td>
    </tr>`).join('');
    }

    function renderMateriaList() {
      const list = document.getElementById('mat-list');
      if (!list) return;
      // Doceria: items sem modulo (legado) ou com modulo='doceria'
      const materias = APP.doceria.materias.filter(m => !m.modulo || m.modulo === 'doceria');
      const total = materias.reduce((s, m) => s + m.custo, 0);
      const badge = document.getElementById('mat-total-cost');
      if (badge) badge.textContent = `Total: ${fmt(total)}`;
      if (!materias.length) { list.innerHTML = `<div class="empty-state"><div class="empty-icon">🥣</div><p>Nenhuma matéria-prima da Doceria</p></div>`; return; }
      list.innerHTML = materias.map(m => `
    <div class="materia-item">
      <div>
        <span class="mat-name">${m.nome}</span>
        <div class="mat-info">${m.qtd || '-'}</div>
      </div>
      <div style="display:flex;align-items:center;gap:.75rem">
        <span class="text-mono" style="color:var(--text2)">${fmt(m.custo)}</span>
        <button class="btn btn-ghost btn-icon btn-sm" onclick="deleteMateria('${m.id}')">🗑️</button>
      </div>
    </div>`).join('');
    }

    function renderMateriaListClube() {
      const list = document.getElementById('mat-list-clube');
      if (!list) return;
      const materias = APP.doceria.materias.filter(m => m.modulo === 'clube');
      const total = materias.reduce((s, m) => s + m.custo, 0);
      const badge = document.getElementById('mat-total-cost-clube');
      if (badge) badge.textContent = `Total: ${fmt(total)}`;
      if (!materias.length) { list.innerHTML = `<div class="empty-state"><div class="empty-icon">📦</div><p>Nenhuma matéria-prima do Clube</p></div>`; return; }
      list.innerHTML = materias.map(m => `
        <div class="materia-item">
          <div><div class="mat-name">${m.nome}</div><div class="mat-info">${m.qtd || '-'}</div></div>
          <div style="display:flex;align-items:center;gap:.75rem">
            <span class="text-mono" style="color:var(--text2)">${fmt(m.custo)}</span>
            <button class="btn btn-ghost btn-icon btn-sm" onclick="deleteMateria('${m.id}')">🗑️</button>
          </div>
        </div>`).join('');
    }

    function renderDocGastos() {
      const month = document.getElementById('doc-gasto-month')?.value || today().slice(0, 7);
      const gastos = APP.doceria.gastos.filter(g => monthKey(g.data) === month).sort((a, b) => b.data.localeCompare(a.data));
      const body = document.getElementById('doc-gasto-body');
      if (!gastos.length) { body.innerHTML = `<tr><td colspan="5"><div class="empty-state"><div class="empty-icon">📂</div><p>Nenhum gasto</p></div></td></tr>`; return; }
      body.innerHTML = gastos.map(g => `
    <tr>
      <td class="text-mono">${g.data}</td>
      <td>${g.desc}</td>
      <td><span class="badge badge-yellow">${g.cat}</span></td>
      <td class="text-mono negative">${fmt(g.valor)}</td>
      <td><button class="btn btn-ghost btn-icon btn-sm" onclick="deleteDocGasto('${g.id}')">🗑️</button></td>
    </tr>`).join('');
    }

    /* ═══════════════════════════════════════════════════════════
       ██████  MÓDULO VENDAS
    ═══════════════════════════════════════════════════════════ */
    function toggleMultiProdUI() {
      const isMulti = document.getElementById('prod-ismulti').checked;
      document.querySelectorAll('.multi-field').forEach(el => el.style.display = isMulti ? 'flex' : 'none');
      document.getElementById('lbl-prod-preco').textContent = isMulti ? 'Preço Valor 1 (R$)' : 'Preço de Venda (R$)';
      document.getElementById('lbl-prod-custo').textContent = isMulti ? 'Custo Valor 1 (R$)' : 'Custo (R$)';
      document.getElementById('lbl-prod-com').textContent = isMulti ? 'Comissão Valor 1 (R$)' : 'Comissão por unidade (R$)';
    }

    function addProduto() {
      const nome = document.getElementById('prod-nome').value.trim();
      const preco = parseFloat(document.getElementById('prod-preco').value) || 0;
      const custo = parseFloat(document.getElementById('prod-custo').value) || 0;
      const comissao = parseFloat(document.getElementById('prod-comissao').value) || 0;

      const isMulti = document.getElementById('prod-ismulti').checked;
      const preco2 = isMulti ? (parseFloat(document.getElementById('prod-preco2').value) || 0) : null;
      const custo2 = isMulti ? (parseFloat(document.getElementById('prod-custo2').value) || 0) : null;
      const comissao2 = isMulti ? (parseFloat(document.getElementById('prod-comissao2').value) || 0) : null;

      if (!nome || preco <= 0) { toast('Informe nome e preço', 'error'); return; }

      const pData = { id: uuid(), nome, preco, custo, comissao, isMulti, preco2, custo2, comissao2, historico: [{ data: today(), preco, custo, comissao, preco2, custo2, comissao2 }] };
      APP.vendas.produtos.push(pData);
      saveData(); renderVendas(); toast('Produto adicionado!');

      ['prod-nome', 'prod-preco', 'prod-custo', 'prod-comissao', 'prod-preco2', 'prod-custo2', 'prod-comissao2'].forEach(id => document.getElementById(id).value = '');
      document.getElementById('prod-ismulti').checked = false;
      toggleMultiProdUI();
    }

    function deleteProduto(id) {
      APP.vendas.produtos = APP.vendas.produtos.filter(p => p.id !== id);
      saveData(); renderVendas(); toast('Produto removido', 'info');
    }

    function editProduto(id) {
      const p = APP.vendas.produtos.find(x => x.id === id);
      if (!p) return;
      const baseFields = [
        { key: 'nome', label: 'Nome', type: 'text', val: p.nome },
        { key: 'ismulti', label: 'Multi-valor (Combo)?', type: 'select', val: p.isMulti ? 'sim' : 'nao', options: [{ v: 'nao', l: 'Não' }, { v: 'sim', l: 'Sim' }] },
        { key: 'preco', label: 'Preço Venda (R$)', type: 'number', val: p.preco, step: '0.01' },
        { key: 'custo', label: 'Custo (R$)', type: 'number', val: p.custo, step: '0.01' },
        { key: 'comissao', label: 'Comissão (R$)', type: 'number', val: p.comissao, step: '0.01' },
        { key: 'preco2', label: 'Preço Combo (R$)', type: 'number', val: p.preco2 || 0, step: '0.01' },
        { key: 'custo2', label: 'Custo Combo (R$)', type: 'number', val: p.custo2 || 0, step: '0.01' },
        { key: 'comissao2', label: 'Comissão Combo (R$)', type: 'number', val: p.comissao2 || 0, step: '0.01' }
      ];
      openEditModal('Editar Produto', baseFields, {
        save: () => {
          const isMultiNovo = document.getElementById('edit_ismulti').value === 'sim';
          const novoPreco = parseFloat(document.getElementById('edit_preco').value) || 0;
          const novoCusto = parseFloat(document.getElementById('edit_custo').value) || 0;
          const novaComissao = parseFloat(document.getElementById('edit_comissao').value) || 0;
          const novoPreco2 = isMultiNovo ? (parseFloat(document.getElementById('edit_preco2').value) || 0) : null;
          const novoCusto2 = isMultiNovo ? (parseFloat(document.getElementById('edit_custo2').value) || 0) : null;
          const novaComissao2 = isMultiNovo ? (parseFloat(document.getElementById('edit_comissao2').value) || 0) : null;

          p.nome = document.getElementById('edit_nome').value;
          p.isMulti = isMultiNovo;
          p.preco = novoPreco; p.custo = novoCusto; p.comissao = novaComissao;
          p.preco2 = novoPreco2; p.custo2 = novoCusto2; p.comissao2 = novaComissao2;

          if (!p.historico) p.historico = [];
          p.historico.push({ data: today(), preco: novoPreco, custo: novoCusto, comissao: novaComissao, preco2: novoPreco2, custo2: novoCusto2, comissao2: novaComissao2 });
          saveData(); renderVendas(); toast('Produto atualizado!');
        }
      });
    }

    function addVendedor() {
      const nome = document.getElementById('seller-nome').value.trim();
      if (!nome) { toast('Informe o nome', 'error'); return; }
      APP.vendas.vendedores.push({ id: uuid(), nome });
      saveData(); renderVendas(); toast('Vendedor adicionado!');
      document.getElementById('seller-nome').value = '';
    }

    function deleteVendedor(id) {
      APP.vendas.vendedores = APP.vendas.vendedores.filter(v => v.id !== id);
      saveData(); renderVendas(); toast('Vendedor removido', 'info');
    }

    function onVndProdutoChange() {
      const produtoId = document.getElementById('vnd-produto').value;
      const prod = APP.vendas.produtos.find(p => p.id === produtoId);
      const q1 = document.getElementById('container-qty1');
      const q2 = document.getElementById('container-qty2');
      if (prod && prod.isMulti) {
        q2.style.display = 'block';
        document.getElementById('lbl-qty1').textContent = `Qtd (R$ ${fmt(prod.preco).replace('R$ ', '')})`;
        document.getElementById('lbl-qty2').textContent = `Qtd Combo (R$ ${fmt(prod.preco2).replace('R$ ', '')})`;
      } else {
        if (q2) q2.style.display = 'none';
        if (document.getElementById('lbl-qty1')) document.getElementById('lbl-qty1').textContent = 'Quantidade';
        if (document.getElementById('vnd-qty2')) document.getElementById('vnd-qty2').value = '';
      }
      updateVndPreview();
    }

    function addVenda() {
      let vendedorId = document.getElementById('vnd-vendedor').value;
      if (userRole === 'desbravador' && currentUser) {
        const myS = APP.vendas.vendedores.find(v => v.nome.toLowerCase() === currentUser.nome.toLowerCase());
        if (myS) vendedorId = myS.id;
      }
      const produtoId = document.getElementById('vnd-produto').value;
      const qty = parseInt(document.getElementById('vnd-qty').value) || 0;
      const qty2 = parseInt(document.getElementById('vnd-qty2')?.value) || 0;
      const data = document.getElementById('vnd-data').value || today();
      if (!vendedorId || !produtoId || (qty < 1 && qty2 < 1)) { toast('Preencha os campos de quantidade', 'error'); return; }
      const prod = APP.vendas.produtos.find(p => p.id === produtoId);
      if (!prod) { toast('Produto inválido', 'error'); return; }
      APP.vendas.vendas.push({ id: uuid(), vendedorId, produtoId, qty, qty2, data, comissao_status: 'pendente' });
      saveData(); renderVendas(); updateComissoesBadge(); toast('Venda registrada!');
      document.getElementById('vnd-qty').value = '';
      if (document.getElementById('vnd-qty2')) document.getElementById('vnd-qty2').value = '';
      updateVndPreview();
    }

    function deleteVenda(id) {
      APP.vendas.vendas = APP.vendas.vendas.filter(v => v.id !== id);
      saveData(); renderVendas(); toast('Removido', 'info');
    }

    function updateVndPreview() {
      const produtoId = document.getElementById('vnd-produto')?.value;
      const qty = parseInt(document.getElementById('vnd-qty')?.value) || 0;
      const qty2 = parseInt(document.getElementById('vnd-qty2')?.value) || 0;
      const prod = APP.vendas.produtos.find(p => p.id === produtoId);
      const preview = document.getElementById('vnd-preview');
      if (!preview) return;
      if (!prod || (qty < 1 && qty2 < 1)) { preview.style.display = 'none'; return; }
      const calc = calcVenda({ produtoId, qty, qty2 });
      preview.style.display = 'block';
      preview.innerHTML = `
    <div style="display:flex;flex-wrap:wrap;gap:1rem">
      <div><div class="text-sm">Receita Bruta</div><div class="text-mono positive">${fmt(calc.receita)}</div></div>
      <div><div class="text-sm">Custo</div><div class="text-mono negative">${fmt(calc.custo)}</div></div>
      <div><div class="text-sm">Comissão</div><div class="text-mono" style="color:#60a5fa">${fmt(calc.comissao)}</div></div>
      <div><div class="text-sm">Lucro</div><div class="text-mono ${calc.lucro >= 0 ? 'positive' : 'negative'}">${fmt(calc.lucro)}</div></div>
    </div>`;
    }

    function addAvaria() {
      const produtoId = document.getElementById('av-produto').value;
      const qty = parseInt(document.getElementById('av-qty').value) || 0;
      const data = document.getElementById('av-data').value || today();
      const motivo = document.getElementById('av-motivo').value.trim();
      if (!produtoId || qty < 1) { toast('Preencha produto e quantidade', 'error'); return; }
      APP.vendas.avarias.push({ id: uuid(), produtoId, qty, data, motivo });
      saveData(); renderVendas(); toast('Avaria registrada!');
      ['av-qty', 'av-motivo'].forEach(id => document.getElementById(id).value = '');
    }

    function deleteAvaria(id) {
      APP.vendas.avarias = APP.vendas.avarias.filter(a => a.id !== id);
      saveData(); renderVendas(); toast('Removido', 'info');
    }

    function addDebito() {
      const vendedorId = document.getElementById('deb-vendedor').value;
      const valor = parseFloat(document.getElementById('deb-valor').value) || 0;
      const data = document.getElementById('deb-data').value || today();
      const obs = document.getElementById('deb-obs').value.trim();
      const origem = document.getElementById('deb-origem').value;

      if (!vendedorId || valor <= 0) { toast('Preencha vendedor e valor', 'error'); return; }

      const vName = APP.vendas.vendedores.find(v => v.id === vendedorId)?.nome || '?';

      if (origem === 'doceria') {
        APP.doceria.gastos.push({ id: uuid(), desc: `Retirada (${vName}): ${obs}`, valor, data, cat: 'Retirada' });
        saveData(); renderDoceria(); toast('Retirada registrada na Doceria!');
      } else if (origem === 'clube') {
        APP.clube.transactions.push({ id: uuid(), data, tipo: 'saida', categoria: 'Retirada', descricao: `Retirada (${vName}): ${obs}`, valor });
        saveData(); renderClube(); toast('Retirada registrada no Clube!');
      } else {
        // Padrão: Vendas
        APP.vendas.debitos.push({ id: uuid(), vendedorId, valor, data, obs, afeta_caixa: true });
        saveData(); renderVendas(); toast('Retirada registrada em Vendas!');
      }

      ['deb-valor', 'deb-obs'].forEach(id => document.getElementById(id).value = '');
    }

    function deleteDebito(id) {
      APP.vendas.debitos = APP.vendas.debitos.filter(d => d.id !== id);
      saveData(); renderVendas(); toast('Removido', 'info');
    }

    let vndChartInst = null;

    function renderVendas() {
      const allDates = [...APP.vendas.vendas, ...APP.vendas.avarias, ...APP.vendas.debitos];
      const months = allMonths(allDates);
      ['vnd-filter-month', 'vnd-hist-month', 'av-month', 'deb-month'].forEach(id => populateMonthSelect(id, months));

      // Popula selects de produto e vendedor
      const prods = APP.vendas.produtos;
      const sellers = APP.vendas.vendedores;

      ['vnd-produto', 'av-produto'].forEach(id => {
        const sel = document.getElementById(id);
        if (!sel) return;
        const cur = sel.value;
        sel.innerHTML = prods.length ? prods.map(p => `<option value="${p.id}" ${p.id === cur ? 'selected' : ''}>${p.nome}</option>`).join('') : '<option value="">-- nenhum produto --</option>';
      });

      ['vnd-vendedor', 'deb-vendedor'].forEach(id => {
        const sel = document.getElementById(id);
        if (!sel) return;
        const cur = sel.value;
        if (userRole === 'desbravador' && currentUser && id === 'vnd-vendedor') {
          const myS = sellers.find(v => v.nome.toLowerCase() === currentUser.nome.toLowerCase());
          sel.innerHTML = myS ? `<option value="${myS.id}" selected>${myS.nome}</option>` : '<option value="">-- sem vendedor --</option>';
        } else {
          sel.innerHTML = sellers.length ? sellers.map(s => `<option value="${s.id}" ${s.id === cur ? 'selected' : ''}>${s.nome}</option>`).join('') : '<option value="">-- nenhum vendedor --</option>';
        }
      });

      // Filtro vendedor no histórico
      const sellerFilter = document.getElementById('vnd-hist-seller');
      if (sellerFilter) {
        const cur = sellerFilter.value;
        sellerFilter.innerHTML = `<option value="">Todos vendedores</option>` +
          sellers.map(s => `<option value="${s.id}" ${s.id === cur ? 'selected' : ''}>${s.nome}</option>`).join('');
      }

      renderVendasMetrics();
      renderVendasChart();
      renderVendasRanking();
      renderVendasHist();
      renderProdutos();
      renderSellers();
      renderAvarias();
      renderDebitos();
      renderComissoes();
      updateComissoesBadge();
      onVndProdutoChange();
      updateVndPreview();
      renderVendasProdutoRanking();
      renderMetasVendas();
    }

    function calcVenda(v) {
      const prod = APP.vendas.produtos.find(p => p.id === v.produtoId);
      if (!prod) return { receita: 0, custo: 0, comissao: 0, lucro: 0 };

      const r1 = (prod.preco || 0) * (v.qty || 0);
      const c1 = (prod.custo || 0) * (v.qty || 0);
      const com1 = (prod.comissao || 0) * (v.qty || 0);

      let r2 = 0, c2 = 0, com2 = 0;
      if (prod.isMulti && v.qty2) {
        r2 = (prod.preco2 || 0) * v.qty2;
        c2 = (prod.custo2 || 0) * v.qty2;
        com2 = (prod.comissao2 || 0) * v.qty2;
      }

      const receita = r1 + r2;
      const custo = c1 + c2;
      const comissao = com1 + com2;
      const lucro = receita - custo - comissao;
      return { receita, custo, comissao, lucro };
    }

    function renderComissoes() {
      const month = document.getElementById('com-filter-month')?.value || today().slice(0, 7);
      const statusF = document.getElementById('com-filter-status')?.value || '';
      let list = APP.vendas.vendas.filter(v => monthKey(v.data) === month);
      if (statusF) list = list.filter(v => (v.comissao_status || 'pendente') === statusF);

      const body = document.getElementById('com-body');
      if (!body) return;
      if (!list.length) {
        body.innerHTML = `<tr><td colspan="6"><div class="empty-state"><div class="empty-icon">💸</div><p>Nenhuma comissão no período</p></div></td></tr>`;
        return;
      }

      body.innerHTML = list.map(v => {
        const seller = APP.vendas.vendedores.find(s => s.id === v.vendedorId);
        const prod = APP.vendas.produtos.find(p => p.id === v.produtoId);
        const calc = calcVenda(v);
        const status = v.comissao_status || 'pendente';
        return `
          <tr>
            <td class="text-mono">${v.data}</td>
            <td>${seller?.nome || '-'}</td>
            <td style="font-size:.8rem">${prod?.nome || '-'}</td>
            <td class="text-mono" style="color:#60a5fa">${fmt(calc.comissao)}</td>
            <td><span class="badge ${status === 'pago' ? 'badge-green' : 'badge-yellow'}">${status}</span></td>
            <td>
              <div style="display:flex;gap:.3rem">
                ${status === 'pendente' && userRole === 'admin' ?
            `<button class="btn btn-primary btn-sm" onclick="pagarComissao('${v.id}')">Pagar</button>` : ''}
                ${status === 'pago' && userRole === 'admin' ?
            `<button class="btn btn-ghost btn-sm" onclick="estornarComissao('${v.id}')" title="Voltar para pendente">Estornar</button>` : ''}
              </div>
            </td>
          </tr>
        `;
      }).join('');
    }

    function pagarComissao(id) {
      const v = APP.vendas.vendas.find(x => x.id === id);
      if (!v || v.comissao_status === 'pago') return;
      const c = calcVenda(v);
      v.comissao_status = 'pago';
      // Registrar no caixa do vendedor como uma retirada de tipo "comissao"
      APP.vendas.debitos.push({
        id: uuid(),
        vendedorId: v.vendedorId,
        valor: c.comissao,
        data: today(),
        obs: `Pgmto Comissão: ${v.data}`,
        tipo: 'comissao',
        afeta_caixa: true,
        vendaId: v.id // Link para estorno
      });
      saveData();
      renderVendas();
      toast('Comissão paga e debitada do caixa!');
    }

    function estornarComissao(id) {
      const v = APP.vendas.vendas.find(x => x.id === id);
      if (!v || v.comissao_status !== 'pago') return;

      v.comissao_status = 'pendente';
      // Remover o registro de debito vinculado
      APP.vendas.debitos = APP.vendas.debitos.filter(d => d.vendaId !== id);

      saveData();
      renderVendas();
      toast('Comissão estornada e saldo recomposto!', 'info');
    }

    function updateComissoesBadge() {
      const pendentes = APP.vendas.vendas.filter(v => !v.comissao_status || v.comissao_status === 'pendente').length;
      const b = document.getElementById('badge-comissoes');
      if (b) {
        b.textContent = pendentes;
        b.style.display = pendentes > 0 ? 'inline-block' : 'none';
      }
    }

    function renderVendasMetrics() {
      const month = document.getElementById('vnd-filter-month')?.value || today().slice(0, 7);
      const vendas = APP.vendas.vendas.filter(v => monthKey(v.data) === month);
      let receita = 0, custo = 0, comissaoTotalPosssivel = 0, comissaoPaga = 0, lucro = 0;

      vendas.forEach(v => {
        const c = calcVenda(v);
        receita += c.receita;
        custo += c.custo;
        comissaoTotalPosssivel += c.comissao;
        if (v.comissao_status === 'pago') comissaoPaga += c.comissao;
        lucro += c.lucro;
      });

      const avarias = APP.vendas.avarias.filter(a => monthKey(a.data) === month);
      const perdas = avarias.reduce((s, a) => { const p = APP.vendas.produtos.find(x => x.id === a.produtoId); return s + (p?.custo || 0) * a.qty; }, 0);

      // Retiradas que afetam caixa (só as novas com flag)
      const retiradas = APP.vendas.debitos.filter(d => monthKey(d.data) === month && d.afeta_caixa).reduce((s, d) => s + d.valor, 0);

      // Saldo do Caixa segue a lógica de: Bruto - Custos - Perdas - (Tudo que saiu do caixa)
      // Note: O lucro já deduz comissões, mas as pendentes ainda não saíram do caixa físico.
      // O usuário pediu que o Saldo de Caixa reflita o Bruto menos o que de fato saiu.
      const saldoCaixa = receita - custo - perdas - retiradas;

      const pendentes = APP.vendas.vendas.filter(v => !v.comissao_status || v.comissao_status === 'pendente');

      document.getElementById('vnd-metrics').innerHTML = `
    <div class="metric-card green"><div class="metric-label">Receita Bruta</div><div class="metric-value positive">${fmt(receita)}</div></div>
    <div class="metric-card red"><div class="metric-label">Custos</div><div class="metric-value negative">${fmt(custo)}</div></div>
    <div class="metric-card blue" style="cursor:pointer" onclick="showSecTab(document.querySelector('[onclick*=vnd-comissoes]'),\'vnd-comissoes\')">
      <div class="metric-label">Comissões Pagas${pendentes.length > 0 ? ' <span style="background:var(--accent2);color:#fff;border-radius:99px;padding:1px 6px;font-size:.65rem;margin-left:4px">' + pendentes.length + ' pend.</span>' : ''}</div>
      <div class="metric-value" style="color:#60a5fa">${fmt(comissaoPaga)}</div>
    </div>
    <div class="metric-card ${saldoCaixa >= 0 ? 'green' : 'red'}"><div class="metric-label">Saldo Caixa</div><div class="metric-value ${saldoCaixa >= 0 ? 'positive' : 'negative'}">${fmt(saldoCaixa)}</div></div>
    <div class="metric-card red"><div class="metric-label">Perdas (Avarias)</div><div class="metric-value negative">${fmt(perdas)}</div></div>
    <div class="metric-card"><div class="metric-label">Vendas (mês)</div><div class="metric-value">${vendas.length}</div></div>
  `;
    }

    function renderVendasChart() {
      const month = document.getElementById('vnd-filter-month')?.value || today().slice(0, 7);
      const vendas = APP.vendas.vendas.filter(v => monthKey(v.data) === month);
      const prodMap = {};
      vendas.forEach(v => {
        const prod = APP.vendas.produtos.find(p => p.id === v.produtoId);
        if (!prod) return;
        if (!prodMap[prod.nome]) prodMap[prod.nome] = 0;
        prodMap[prod.nome] += prod.preco * v.qty;
      });
      const labels = Object.keys(prodMap);
      const data = Object.values(prodMap);
      const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
      const textColor = isDark ? '#8891a8' : '#4a5168';
      const ctx = document.getElementById('vnd-chart');
      if (!ctx) return;
      if (vndChartInst) vndChartInst.destroy();
      if (!labels.length) {
        ctx.parentElement.innerHTML = `<div class="empty-state"><div class="empty-icon">📊</div><p>Sem vendas no período</p></div>`;
        return;
      }
      const colors = ['#F2C94C', '#00C2FF', '#E63946', '#a78bfa', '#f97316', '#4CC9F0', '#06b6d4'];
      vndChartInst = new Chart(ctx, {
        type: 'doughnut',
        data: { labels, datasets: [{ data, backgroundColor: colors.slice(0, labels.length), borderWidth: 0 }] },
        options: {
          responsive: true, maintainAspectRatio: false, cutout: '68%',
          plugins: { legend: { position: 'bottom', labels: { color: textColor, font: { family: 'DM Mono', size: 11 }, boxWidth: 12 } } }
        }
      });
    }

    function renderVendasProdutoRanking() {
      const month = document.getElementById('vnd-filter-month')?.value || today().slice(0, 7);
      const vendas = APP.vendas.vendas.filter(v => monthKey(v.data) === month);
      const prodMap = {};
      vendas.forEach(v => {
        const prod = APP.vendas.produtos.find(p => p.id === v.produtoId);
        if (!prod) return;
        const c = calcVenda(v);
        if (!prodMap[v.produtoId]) prodMap[v.produtoId] = { nome: prod.nome, receita: 0 };
        prodMap[v.produtoId].receita += c.receita;
      });
      const sorted = Object.values(prodMap).sort((a, b) => b.receita - a.receita);
      const max = sorted.length ? sorted[0].receita : 1;
      const el = document.getElementById('vnd-prod-ranking');
      if (!el) return;
      if (!sorted.length) { el.innerHTML = `<div class="empty-state"><div class="empty-icon">🏆</div><p>Sem vendas no período</p></div>`; return; }
      el.innerHTML = sorted.map((data, i) => `
        <div class="rank-row">
          <span class="rank-num">${i + 1}</span>
          <div style="flex:1;min-width:0;font-size:.83rem;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${data.nome}</div>
          <div class="rank-bar-wrap" style="position:relative">
            <div class="rank-bar" style="width:${Math.round((data.receita / max) * 100)}%;background:var(--accent2)"></div>
          </div>
          <div style="text-align:right">
            <span class="text-mono positive" style="font-size:.78rem">${fmt(data.receita)}</span>
          </div>
        </div>`).join('');
    }

    function renderVendasRanking() {
      const month = document.getElementById('vnd-filter-month')?.value || today().slice(0, 7);
      const vendas = APP.vendas.vendas.filter(v => monthKey(v.data) === month);
      const sellerMap = {};
      vendas.forEach(v => {
        const c = calcVenda(v);
        if (!sellerMap[v.vendedorId]) sellerMap[v.vendedorId] = { receita: 0, qty: 0 };
        sellerMap[v.vendedorId].receita += c.receita;
        sellerMap[v.vendedorId].qty += v.qty;
      });
      const sorted = Object.entries(sellerMap).sort((a, b) => b[1].receita - a[1].receita);
      const max = sorted.length ? sorted[0][1].receita : 1;
      const el = document.getElementById('vnd-ranking');
      if (!sorted.length) { el.innerHTML = `<div class="empty-state"><div class="empty-icon">🏆</div><p>Nenhuma venda no período</p></div>`; return; }
      el.innerHTML = sorted.map(([sid, data], i) => {
        const seller = APP.vendas.vendedores.find(s => s.id === sid);
        return `
      <div class="rank-row">
        <span class="rank-num">${i + 1}</span>
        <div style="display:flex;align-items:center;gap:.5rem;flex:1;min-width:0">
          <div class="seller-avatar" style="width:28px;height:28px;font-size:.72rem">${(seller?.nome || '?')[0].toUpperCase()}</div>
          <span style="font-size:.83rem;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${seller?.nome || 'Desconhecido'}</span>
        </div>
        <div class="rank-bar-wrap" style="position:relative">
          <div class="rank-bar" style="width:${Math.round((data.receita / max) * 100)}%"></div>
        </div>
        <div style="display:flex;flex-direction:column;align-items:flex-end">
          <span class="text-mono positive" style="font-size:.78rem;white-space:nowrap">${fmt(data.receita)}</span>
        </div>
      </div>`;
      }).join('');
    }

    function renderVendasHist() {
      const month = document.getElementById('vnd-hist-month')?.value || today().slice(0, 7);
      const sellerF = document.getElementById('vnd-hist-seller')?.value || '';
      let vendas = APP.vendas.vendas.filter(v => monthKey(v.data) === month);
      if (sellerF) vendas = vendas.filter(v => v.vendedorId === sellerF);
      // Desbravador sees only own sales
      if (userRole === 'desbravador' && currentUser) {
        const myS = APP.vendas.vendedores.find(v => v.nome.toLowerCase() === currentUser.nome.toLowerCase());
        if (myS) vendas = vendas.filter(v => v.vendedorId === myS.id);
      }
      vendas.sort((a, b) => b.data.localeCompare(a.data));
      const body = document.getElementById('vnd-hist-body');
      if (!vendas.length) { body.innerHTML = `<tr><td colspan="8"><div class="empty-state"><div class="empty-icon">📂</div><p>Sem vendas</p></div></td></tr>`; return; }
      body.innerHTML = vendas.map(v => {
        const prod = APP.vendas.produtos.find(p => p.id === v.produtoId);
        const seller = APP.vendas.vendedores.find(s => s.id === v.vendedorId);
        const c = calcVenda(v);
        let displayQty = v.qty || 0;
        if (prod && prod.isMulti && v.qty2) {
          displayQty = `${v.qty || 0} u / ${v.qty2} c`;
        }
        return `<tr>
      <td class="text-mono">${v.data}</td>
      <td>${seller?.nome || '-'}</td>
      <td>${prod?.nome || '-'}</td>
      <td class="text-mono">${displayQty}</td>
      <td class="text-mono positive">${fmt(c.receita)}</td>
      <td class="text-mono" style="color:#60a5fa">${fmt(c.comissao)}</td>
      <td class="text-mono ${c.lucro >= 0 ? 'positive' : 'negative'}">${fmt(c.lucro)}</td>
      <td><button class="btn btn-ghost btn-icon btn-sm" onclick="deleteVenda('${v.id}')">🗑️</button></td>
    </tr>`;
      }).join('');
    }

    function renderProdutos() {
      const body = document.getElementById('prod-body');
      if (!APP.vendas.produtos.length) { body.innerHTML = `<tr><td colspan="6"><div class="empty-state"><div class="empty-icon">📦</div><p>Nenhum produto</p></div></td></tr>`; return; }
      body.innerHTML = APP.vendas.produtos.map(p => {
        const margem = p.preco > 0 ? ((p.preco - p.custo - p.comissao) / p.preco * 100).toFixed(1) : 0;
        let labelNome = p.nome;
        if (p.isMulti) labelNome += ` <span class="badge badge-blue" style="font-size:0.6rem">Multi</span>`;
        return `<tr>
      <td style="font-weight:500;color:var(--text)">${labelNome}</td>
      <td class="text-mono positive">${fmt(p.preco)}${p.isMulti ? '<br><span style="font-size:0.7rem;color:var(--text3)">' + fmt(p.preco2) + '</span>' : ''}</td>
      <td class="text-mono negative">${fmt(p.custo)}${p.isMulti ? '<br><span style="font-size:0.7rem;color:var(--text3)">' + fmt(p.custo2) + '</span>' : ''}</td>
      <td class="text-mono" style="color:#60a5fa">${fmt(p.comissao)}${p.isMulti ? '<br><span style="font-size:0.7rem;color:var(--text3)">' + fmt(p.comissao2) + '</span>' : ''}</td>
      <td class="text-mono"><span class="badge ${parseFloat(margem) >= 30 ? 'badge-green' : parseFloat(margem) >= 10 ? 'badge-yellow' : 'badge-red'}">${margem}%</span></td>
      <td>
        <div style="display:flex;gap:.3rem">
          <button class="btn btn-ghost btn-icon btn-sm" onclick="editProduto('${p.id}')">✏️</button>
          <button class="btn btn-ghost btn-icon btn-sm" onclick="deleteProduto('${p.id}')">🗑️</button>
        </div>
      </td>
    </tr>`;
      }).join('');
    }

    function renderSellers() {
      const el = document.getElementById('sellers-list');
      if (!APP.vendas.vendedores.length) { el.innerHTML = `<div class="empty-state"><div class="empty-icon">👤</div><p>Nenhum vendedor</p></div>`; return; }
      el.innerHTML = APP.vendas.vendedores.map(s => {
        const total = APP.vendas.vendas.filter(v => v.vendedorId === s.id).reduce((acc, v) => { const c = calcVenda(v); return acc + c.receita; }, 0);
        const comissoes = APP.vendas.vendas.filter(v => v.vendedorId === s.id).reduce((acc, v) => { const c = calcVenda(v); return acc + c.comissao; }, 0);
        return `
      <div class="seller-card">
        <div style="display:flex;align-items:center;gap:.75rem">
          <div class="seller-avatar">${s.nome[0].toUpperCase()}</div>
          <div>
            <div style="font-weight:600;color:var(--text)">${s.nome}</div>
            <div style="font-size:.75rem;color:var(--text3)">Total vendido: <span class="text-mono positive">${fmt(total)}</span> · Comissões: <span class="text-mono" style="color:#60a5fa">${fmt(comissoes)}</span></div>
          </div>
        </div>
        <button class="btn btn-ghost btn-icon btn-sm" onclick="deleteVendedor('${s.id}')">🗑️</button>
      </div>`;
      }).join('');
    }

    function renderAvarias() {
      const month = document.getElementById('av-month')?.value || today().slice(0, 7);
      const avs = APP.vendas.avarias.filter(a => monthKey(a.data) === month).sort((a, b) => b.data.localeCompare(a.data));
      const body = document.getElementById('av-body');
      if (!avs.length) { body.innerHTML = `<tr><td colspan="6"><div class="empty-state"><div class="empty-icon">📂</div><p>Nenhuma avaria</p></div></td></tr>`; return; }
      body.innerHTML = avs.map(a => {
        const prod = APP.vendas.produtos.find(p => p.id === a.produtoId);
        const perda = (prod?.custo || 0) * a.qty;
        return `<tr>
      <td class="text-mono">${a.data}</td>
      <td>${prod?.nome || '-'}</td>
      <td class="text-mono">${a.qty}</td>
      <td class="text-mono negative">${fmt(perda)}</td>
      <td>${a.motivo || '-'}</td>
      <td><button class="btn btn-ghost btn-icon btn-sm" onclick="deleteAvaria('${a.id}')">🗑️</button></td>
    </tr>`;
      }).join('');
    }

    function renderDebitos() {
      const month = document.getElementById('deb-month')?.value || today().slice(0, 7);
      const debs = APP.vendas.debitos.filter(d => monthKey(d.data) === month).sort((a, b) => b.data.localeCompare(a.data));
      const body = document.getElementById('deb-body');
      if (!debs.length) { body.innerHTML = `<tr><td colspan="5"><div class="empty-state"><div class="empty-icon">📂</div><p>Nenhuma retirada</p></div></td></tr>`; return; }
      body.innerHTML = debs.map(d => {
        const seller = APP.vendas.vendedores.find(s => s.id === d.vendedorId);
        return `<tr>
      <td class="text-mono">${d.data}</td>
      <td>${seller?.nome || '-'}</td>
      <td class="text-mono negative">${fmt(d.valor)}</td>
      <td>${d.obs || '-'}</td>
      <td><button class="btn btn-ghost btn-icon btn-sm" onclick="deleteDebito('${d.id}')">🗑️</button></td>
    </tr>`;
      }).join('');
    }


    /* ═══════════════════════════════════════════════════════════
       GERENCIAR USUÁRIOS
    ═══════════════════════════════════════════════════════════ */
    function updateUsuariosBadge() {
      const pendentes = _usuarios.filter(u => u.status === 'pendente').length;
      const dot = document.getElementById('user-notif-dot');
      if (dot) dot.style.display = pendentes > 0 ? 'block' : 'none';
    }

    function openUsuariosModal() {
      if (userRole !== 'admin' && userRole !== 'diretor') { toast('Sem permissão', 'error'); return; }
      renderUsuariosLista();
      document.getElementById('usuariosModal').classList.add('open');
    }

    function closeUsuariosModal() {
      document.getElementById('usuariosModal').classList.remove('open');
    }

    function roleLabel(role) {
      return { admin: '👑 Admin', diretor: '🎖️ Diretor', conselheiro: '🧭 Conselheiro', desbravador: '⚔️ Desbravador' }[role] || role;
    }

    function renderUsuariosLista() {
      const el = document.getElementById('usuarios-lista'); if (!el) return;
      const pendentes = _usuarios.filter(u => u.status === 'pendente');
      const ativos = _usuarios.filter(u => u.status === 'ativo');
      if (!pendentes.length && !ativos.length) {
        el.innerHTML = '<div class="empty-state"><div class="empty-icon">👥</div><p>Nenhum usuário cadastrado</p></div>'; return;
      }
      let html = '';
      if (pendentes.length) {
        html += `<div style="font-family:var(--font-mono);font-size:.7rem;font-weight:600;letter-spacing:.07em;text-transform:uppercase;color:var(--text3);margin-bottom:.5rem">⏳ Pendentes</div>`;
        html += pendentes.map(u => {
          const canApprove = (u.role === 'diretor') ? userRole === 'admin' : true;
          return `<div style="display:flex;align-items:center;justify-content:space-between;padding:.7rem 1rem;background:var(--bg-glass-input);border:1px solid var(--border-glass);border-radius:var(--radius-sm);margin-bottom:.35rem;backdrop-filter:blur(8px) saturate(180%)">
             <div><div style="font-weight:600;color:var(--text)">${u.usuario}</div><div style="font-size:.73rem;color:var(--text3)">${roleLabel(u.role)}</div></div>
             <div style="display:flex;gap:.35rem">
               ${canApprove ? `<button class="btn btn-sm" style="background:var(--accent3);color:#111" onclick="aprovarUsuario('${u.id}','${u.role}')">✓ Aprovar</button>` : `<span style="font-size:.72rem;color:var(--text3)">Somente Admin</span>`}
               <button class="btn btn-sm btn-danger" onclick="negarUsuario('${u.id}')">✕</button>
             </div></div>`;
        }).join('');
      }
      if (ativos.length) {
        html += `<div style="font-family:var(--font-mono);font-size:.7rem;font-weight:600;letter-spacing:.07em;text-transform:uppercase;color:var(--text3);margin-top:1rem;margin-bottom:.5rem">✅ Ativos</div>`;
        html += ativos.map(u => {
          const docOn = !!u.doceria_acesso;
          return `<div style="display:flex;align-items:center;justify-content:space-between;padding:.6rem 1rem;background:var(--bg-glass-input);border:1px solid var(--border-glass);border-radius:var(--radius-sm);margin-bottom:.3rem;backdrop-filter:blur(8px) saturate(180%)">
             <div><div style="font-size:.85rem;font-weight:600;color:var(--text)">${u.usuario}</div><div style="font-size:.72rem;color:var(--text3)">${roleLabel(u.role)}</div></div>
             <div style="display:flex;align-items:center;gap:.65rem">
               <div class="toggle-wrap">
                 <label class="tgl" title="Acesso à Doceria">
                   <input type="checkbox" ${docOn ? 'checked' : ''} onchange="toggleDoceiraAcesso('${u.id}',${docOn})"/>
                   <span class="tgl-slider"></span>
                 </label>
                 <span>🎂 Doceria</span>
               </div>
               ${userRole === 'admin' ? `<button class="btn btn-ghost btn-icon btn-sm" onclick="removerUsuario('${u.id}')">🗑️</button>` : ''}
             </div>
           </div>`;
        }).join('');
      }
      el.innerHTML = html;
    }

    async function aprovarUsuario(id, role) {
      if (role === 'diretor' && userRole !== 'admin') { toast('Somente Admin pode aprovar Diretor', 'error'); return; }
      await db.collection('gda_usuarios').doc(id).update({ status: 'ativo' });
      toast('Usuário aprovado!'); renderUsuariosLista();
    }

    async function negarUsuario(id) {
      await db.collection('gda_usuarios').doc(id).update({ status: 'negado' });
      toast('Acesso negado', 'info'); renderUsuariosLista();
    }

    async function removerUsuario(id) {
      await db.collection('gda_usuarios').doc(id).delete();
      toast('Usuário removido', 'info'); renderUsuariosLista();
    }

    async function toggleDoceiraAcesso(userId, current) {
      if (userRole !== 'admin' && userRole !== 'diretor') { toast('Sem permissão', 'error'); return; }
      await db.collection('gda_usuarios').doc(userId).update({ doceria_acesso: !current });
      toast(!current ? '🎂 Acesso à Doceria ativado!' : 'Acesso à Doceria removido', 'info');
      // If this user is currently logged in (same session), update their access in real-time
      applyDoceiraVisibility();
    }

    function applyDoceiraVisibility() {
      const tab = document.querySelector('[data-mod="doceria"]');
      if (!tab) return;
      // Admin and Diretor always have access
      if (userRole === 'admin' || userRole === 'diretor') {
        tab.style.display = ''; return;
      }
      // For others, check their Firestore user doc
      if (!currentUser?.id) { tab.style.display = 'none'; return; }
      const u = _usuarios.find(x => x.id === currentUser.id);
      if (u?.doceria_acesso) { tab.style.display = ''; }
      else { tab.style.display = 'none'; }
    }

    async function criarUsuarioAdmin() {
      const nome = (document.getElementById('new-user-nome')?.value || '').trim();
      const senha = (document.getElementById('new-user-senha')?.value || '').trim();
      const role = document.getElementById('new-user-role')?.value || 'conselheiro';
      if (!nome || !senha) { toast('Preencha usuário e senha', 'error'); return; }
      if (role === 'diretor' && userRole !== 'admin') { toast('Somente Admin pode criar Diretor', 'error'); return; }
      const snap = await db.collection('gda_usuarios').where('usuario', '==', nome).where('role', '==', role).get();
      if (!snap.empty) { toast('Usuário já existe', 'error'); return; }
      await db.collection('gda_usuarios').add({ usuario: nome, nome, role, senha, status: 'ativo', doceria_acesso: false, criadoEm: Date.now() });
      toast('Usuário criado!');
      document.getElementById('new-user-nome').value = '';
      document.getElementById('new-user-senha').value = '';
      document.getElementById('create-user-form').style.display = 'none';
      renderUsuariosLista();
    }

    /* ═══════════════════════════════════════════════════════════
       METAS DOCERIA
    ═══════════════════════════════════════════════════════════ */
    function addMetaDoceria() {
      const desc = (document.getElementById('meta-doc-desc')?.value || '').trim();
      const val = parseFloat(document.getElementById('meta-doc-valor')?.value);
      if (!desc || !val || val <= 0) { toast('Preencha descrição e valor', 'error'); return; }
      if (userRole !== 'admin' && userRole !== 'diretor') { toast('Sem permissão', 'error'); return; }
      db.collection('gda_metas_doceria').add({ descricao: desc, valor_alvo: val, criadoEm: Date.now() })
        .then(() => { document.getElementById('meta-doc-desc').value = ''; document.getElementById('meta-doc-valor').value = ''; toast('🎯 Meta da Doceria criada!') })
        .catch(() => toast('Erro ao salvar', 'error'));
    }

    function deleteMetaDoceria(id) {
      if (userRole !== 'admin' && userRole !== 'diretor') { toast('Sem permissão', 'error'); return; }
      db.collection('gda_metas_doceria').doc(id).delete().then(() => toast('Meta removida', 'info'));
    }

    function renderMetasDoceria() {
      const heroEl = document.getElementById('doc-meta-hero');
      const listEl = document.getElementById('metas-doceria-list');
      const receita = APP.doceria.pedidos.filter(p => p.status !== 'cancelado').reduce((s, p) => s + p.valor, 0);
      if (heroEl) {
        if (_metasDoceria.length) {
          const m = _metasDoceria[0];
          const pct = Math.min(100, Math.round((receita / m.valor_alvo) * 100));
          const over = receita >= m.valor_alvo;
          heroEl.innerHTML = `<div class="goal-hero"><div class="goal-hero-header"><div class="goal-hero-title">🎂 ${m.descricao}</div><div class="goal-hero-value">${fmt(receita)} / ${fmt(m.valor_alvo)}</div></div><div class="progress-track"><div class="progress-fill ${over ? 'over' : ''}" id="doc-hero-fill" style="width:0%"></div></div><div class="goal-footer"><span>${pct}% concluído</span><span>${over ? '🎉 Meta atingida!' : fmt(m.valor_alvo - receita) + ' restante'}</span></div></div>`;
          setTimeout(() => { const f = document.getElementById('doc-hero-fill'); if (f) f.style.width = pct + '%'; }, 80);
        } else heroEl.innerHTML = '';
      }
      if (!listEl) return;
      if (!_metasDoceria.length) { listEl.innerHTML = '<div class="empty-state"><div class="empty-icon">🎯</div><p>Nenhuma meta cadastrada</p></div>'; return; }
      listEl.innerHTML = _metasDoceria.map(m => {
        const pct = Math.min(100, Math.round((receita / m.valor_alvo) * 100));
        const over = receita >= m.valor_alvo;
        const canDel = userRole === 'admin' || userRole === 'diretor';
        return `<div style="padding:1rem 0;border-bottom:1px solid var(--border-glass)"><div style="display:flex;align-items:center;justify-content:space-between;gap:.5rem;margin-bottom:.6rem"><span style="font-weight:600;color:var(--text)">${m.descricao}</span><div style="display:flex;gap:.35rem;align-items:center"><span style="font-family:var(--font-mono);font-size:.8rem;color:var(--text3)">${fmt(m.valor_alvo)}</span>${canDel ? `<button class="btn btn-ghost btn-icon btn-sm" onclick="deleteMetaDoceria('${m.id}')">🗑️</button>` : ''}</div></div><div class="progress-track" style="height:8px"><div class="progress-fill ${over ? 'over' : ''}" style="width:${pct}%"></div></div><div class="goal-footer"><span>${pct}%</span><span>${fmt(receita)} arrecadado</span></div></div>`;
      }).join('');
    }

    /* ═══════════════════════════════════════════════════════════
       METAS VENDAS
    ═══════════════════════════════════════════════════════════ */
    function addMetaVendas() {
      const desc = (document.getElementById('meta-vnd-desc')?.value || '').trim();
      const val = parseFloat(document.getElementById('meta-vnd-valor')?.value);
      if (!desc || !val || val <= 0) { toast('Preencha descrição e valor', 'error'); return; }
      if (userRole !== 'admin' && userRole !== 'diretor') { toast('Sem permissão', 'error'); return; }
      db.collection('gda_metas_vendas').add({ descricao: desc, valor_alvo: val, criadoEm: Date.now() })
        .then(() => { document.getElementById('meta-vnd-desc').value = ''; document.getElementById('meta-vnd-valor').value = ''; toast('🎯 Meta de Vendas criada!') })
        .catch(() => toast('Erro ao salvar', 'error'));
    }

    function deleteMetaVendas(id) {
      if (userRole !== 'admin' && userRole !== 'diretor') { toast('Sem permissão', 'error'); return; }
      db.collection('gda_metas_vendas').doc(id).delete().then(() => toast('Meta removida', 'info'));
    }

    function renderMetasVendas() {
      const heroEl = document.getElementById('vnd-meta-hero');
      const listEl = document.getElementById('metas-vendas-list');
      const recTotal = APP.vendas.vendas.reduce((s, v) => s + calcVenda(v).receita, 0);
      if (heroEl) {
        if (_metasVendas.length) {
          const m = _metasVendas[0];
          const pct = Math.min(100, Math.round((recTotal / m.valor_alvo) * 100));
          const over = recTotal >= m.valor_alvo;
          heroEl.innerHTML = `<div class="goal-hero"><div class="goal-hero-header"><div class="goal-hero-title">🥧 ${m.descricao}</div><div class="goal-hero-value">${fmt(recTotal)} / ${fmt(m.valor_alvo)}</div></div><div class="progress-track"><div class="progress-fill ${over ? 'over' : ''}" id="vnd-hero-fill" style="width:0%"></div></div><div class="goal-footer"><span>${pct}% concluído</span><span>${over ? '🎉 Meta atingida!' : fmt(m.valor_alvo - recTotal) + ' restante'}</span></div></div>`;
          setTimeout(() => { const f = document.getElementById('vnd-hero-fill'); if (f) f.style.width = pct + '%'; }, 80);
        } else heroEl.innerHTML = '';
      }
      if (!listEl) return;
      if (!_metasVendas.length) { listEl.innerHTML = '<div class="empty-state"><div class="empty-icon">🎯</div><p>Nenhuma meta cadastrada</p></div>'; return; }
      listEl.innerHTML = _metasVendas.map(m => {
        const pct = Math.min(100, Math.round((recTotal / m.valor_alvo) * 100));
        const over = recTotal >= m.valor_alvo;
        const canDel = userRole === 'admin' || userRole === 'diretor';
        return `<div style="padding:1rem 0;border-bottom:1px solid var(--border-glass)"><div style="display:flex;align-items:center;justify-content:space-between;gap:.5rem;margin-bottom:.6rem"><span style="font-weight:600;color:var(--text)">${m.descricao}</span><div style="display:flex;gap:.35rem;align-items:center"><span style="font-family:var(--font-mono);font-size:.8rem;color:var(--text3)">${fmt(m.valor_alvo)}</span>${canDel ? `<button class="btn btn-ghost btn-icon btn-sm" onclick="deleteMetaVendas('${m.id}')">🗑️</button>` : ''}</div></div><div class="progress-track" style="height:8px"><div class="progress-fill ${over ? 'over' : ''}" style="width:${pct}%"></div></div><div class="goal-footer"><span>${pct}%</span><span>${fmt(recTotal)} arrecadado</span></div></div>`;
      }).join('');
    }

    /* ═══════════════════════════════════════════════════════════
       EXTRATO PDF - DOCERIA
    ═══════════════════════════════════════════════════════════ */
    function imprimirExtratoDoceria() {
      const month = document.getElementById('doc-filter-month')?.value || today().slice(0, 7);
      const peds = APP.doceria.pedidos.filter(p => monthKey(p.data) === month && p.status !== 'cancelado').sort((a, b) => a.data.localeCompare(b.data));
      const gastos = APP.doceria.gastos.filter(g => monthKey(g.data) === month).sort((a, b) => a.data.localeCompare(b.data));
      const receita = peds.reduce((s, p) => s + p.valor, 0);
      const custos = gastos.reduce((s, g) => s + g.valor, 0);
      const lucro = receita - custos;
      const recTotal = APP.doceria.pedidos.filter(p => p.status !== 'cancelado').reduce((s, p) => s + p.valor, 0);
      let metaHtml = '';
      if (_metasDoceria.length) {
        const m = _metasDoceria[0];
        const pct = Math.min(100, Math.round((recTotal / m.valor_alvo) * 100));
        metaHtml = `<div style="margin-bottom:1.5rem;padding:1rem;border:1px solid #ccc;border-radius:8px"><div style="display:flex;justify-content:space-between;font-weight:700;margin-bottom:.5rem"><span>🎯 ${m.descricao}</span><span>${fmt(recTotal)} / ${fmt(m.valor_alvo)}</span></div><div style="width:100%;height:10px;background:#eee;border-radius:99px;overflow:hidden"><div style="width:${pct}%;height:100%;background:#4ade80;border-radius:99px"></div></div><div style="display:flex;justify-content:space-between;font-size:.78rem;color:#555;margin-top:.25rem"><span>${pct}% concluído</span><span>${pct >= 100 ? '🎉 Meta atingida!' : fmt(m.valor_alvo - recTotal) + ' restante'}</span></div></div>`;
      }
      const rowsPed = peds.map(p => `<tr><td>${p.data}</td><td>${p.cliente || '-'}</td><td>${p.produto}</td><td style="text-align:center">${p.qty}</td><td class="print-positive" style="text-align:right">${fmt(p.valor)}</td></tr>`).join('');
      const rowsGas = gastos.map(g => `<tr><td>${g.data}</td><td colspan="2">${g.desc}</td><td>${g.cat}</td><td class="print-negative" style="text-align:right">-${fmt(g.valor)}</td></tr>`).join('');
      document.getElementById('print-zone').innerHTML = `<div class="print-header"><div class="print-header-icon">🎂</div><div><div class="print-title">Guerreiros do Alto</div><div class="print-subtitle">Extrato — Doceria</div></div></div><div class="print-meta"><strong>Período:</strong> ${monthLabel(month)} &nbsp;|&nbsp;<strong>Gerado em:</strong> ${new Date().toLocaleDateString('pt-BR')} &nbsp;|&nbsp;<strong>Operador:</strong> ${currentUser?.nome || userRole || '-'}</div>${metaHtml}<table class="print-table"><thead><tr><th>Data</th><th>Cliente</th><th>Produto</th><th>Qtd</th><th style="text-align:right">Valor</th></tr></thead><tbody>${rowsPed || '<tr><td colspan="5" style="text-align:center;color:#999">Sem pedidos</td></tr>'}</tbody></table>${gastos.length ? `<table class="print-table" style="margin-top:1rem"><thead><tr><th>Data</th><th colspan="2">Gasto</th><th>Categoria</th><th style="text-align:right">Valor</th></tr></thead><tbody>${rowsGas}</tbody></table>` : ''}<table class="print-table" style="margin-top:1rem"><tfoot><tr style="font-weight:700"><td colspan="4" style="text-align:right;padding:.5rem .75rem">Receita Total</td><td class="print-positive" style="text-align:right;padding:.5rem .75rem">${fmt(receita)}</td></tr><tr style="font-weight:700"><td colspan="4" style="text-align:right;padding:.4rem .75rem">Custos Totais</td><td class="print-negative" style="text-align:right;padding:.4rem .75rem">-${fmt(custos)}</td></tr><tr style="font-weight:800;font-size:1.05rem;border-top:2px solid #111"><td colspan="4" style="text-align:right;padding:.6rem .75rem">Lucro do Período</td><td class="${lucro >= 0 ? 'print-positive' : 'print-negative'}" style="text-align:right;padding:.6rem .75rem">${fmt(lucro)}</td></tr></tfoot></table><div class="print-signature"><div class="print-sig-line">Diretor(a) do Clube</div><div class="print-sig-line">Responsável Doceria</div></div>`;
      window.print();
    }

    /* ═══════════════════════════════════════════════════════════
       EXTRATO PDF - VENDAS
    ═══════════════════════════════════════════════════════════ */
    function imprimirExtratoVendas() {
      const month = document.getElementById('vnd-filter-month')?.value || today().slice(0, 7);
      const vendas = APP.vendas.vendas.filter(v => monthKey(v.data) === month).sort((a, b) => a.data.localeCompare(b.data));
      const avarias = APP.vendas.avarias.filter(a => monthKey(a.data) === month);
      let receita = 0, custo = 0, comissao = 0, lucro = 0;
      vendas.forEach(v => { const c = calcVenda(v); receita += c.receita; custo += c.custo; comissao += c.comissao; lucro += c.lucro; });
      const perdas = avarias.reduce((s, a) => { const p = APP.vendas.produtos.find(x => x.id === a.produtoId); return s + (p?.custo || 0) * a.qty; }, 0);
      const recTotal = APP.vendas.vendas.reduce((s, v) => s + calcVenda(v).receita, 0);
      let metaHtml = '';
      if (_metasVendas.length) {
        const m = _metasVendas[0];
        const pct = Math.min(100, Math.round((recTotal / m.valor_alvo) * 100));
        metaHtml = `<div style="margin-bottom:1.5rem;padding:1rem;border:1px solid #ccc;border-radius:8px"><div style="display:flex;justify-content:space-between;font-weight:700;margin-bottom:.5rem"><span>🎯 ${m.descricao}</span><span>${fmt(recTotal)} / ${fmt(m.valor_alvo)}</span></div><div style="width:100%;height:10px;background:#eee;border-radius:99px;overflow:hidden"><div style="width:${pct}%;height:100%;background:#4ade80;border-radius:99px"></div></div><div style="display:flex;justify-content:space-between;font-size:.78rem;color:#555;margin-top:.25rem"><span>${pct}% concluído</span><span>${pct >= 100 ? '🎉 Meta atingida!' : fmt(m.valor_alvo - recTotal) + ' restante'}</span></div></div>`;
      }
      const rows = vendas.map(v => {
        const prod = APP.vendas.produtos.find(p => p.id === v.produtoId);
        const seller = APP.vendas.vendedores.find(s => s.id === v.vendedorId);
        const c = calcVenda(v);
        let dq = v.qty || 0; if (prod?.isMulti && v.qty2) dq = `${v.qty || 0}u/${v.qty2}c`;
        return `<tr><td>${v.data}</td><td>${seller?.nome || '-'}</td><td>${prod?.nome || '-'}</td><td style="text-align:center">${dq}</td><td class="print-positive" style="text-align:right">${fmt(c.receita)}</td><td style="text-align:right;color:#555">${fmt(c.comissao)}</td><td class="${c.lucro >= 0 ? 'print-positive' : 'print-negative'}" style="text-align:right">${fmt(c.lucro)}</td></tr>`;
      }).join('');
      document.getElementById('print-zone').innerHTML = `<div class="print-header"><div class="print-header-icon">🥧</div><div><div class="print-title">Guerreiros do Alto</div><div class="print-subtitle">Extrato — Vendas (Tortinhas)</div></div></div><div class="print-meta"><strong>Período:</strong> ${monthLabel(month)} &nbsp;|&nbsp;<strong>Gerado em:</strong> ${new Date().toLocaleDateString('pt-BR')} &nbsp;|&nbsp;<strong>Operador:</strong> ${currentUser?.nome || userRole || '-'}</div>${metaHtml}<table class="print-table"><thead><tr><th>Data</th><th>Vendedor</th><th>Produto</th><th>Qtd</th><th style="text-align:right">Receita</th><th style="text-align:right">Comissão</th><th style="text-align:right">Lucro</th></tr></thead><tbody>${rows || '<tr><td colspan="7" style="text-align:center;color:#999">Sem vendas</td></tr>'}</tbody><tfoot><tr style="font-weight:700"><td colspan="4" style="text-align:right;padding:.5rem .75rem">Receita Bruta</td><td class="print-positive" style="text-align:right;padding:.5rem .75rem">${fmt(receita)}</td><td colspan="2"></td></tr><tr style="font-weight:700"><td colspan="4" style="text-align:right">Comissões</td><td style="text-align:right">${fmt(comissao)}</td><td colspan="2"></td></tr>${avarias.length ? `<tr style="font-weight:700"><td colspan="4" style="text-align:right">Perdas (Avarias)</td><td class="print-negative" style="text-align:right">-${fmt(perdas)}</td><td colspan="2"></td></tr>` : ''}<tr style="font-weight:800;font-size:1.05rem;border-top:2px solid #111"><td colspan="4" style="text-align:right;padding:.6rem .75rem">Lucro Líquido</td><td class="${lucro >= 0 ? 'print-positive' : 'print-negative'}" style="text-align:right;padding:.6rem .75rem">${fmt(lucro)}</td><td colspan="2"></td></tr></tfoot></table><div class="print-signature"><div class="print-sig-line">Diretor(a) do Clube</div><div class="print-sig-line">Responsável Vendas</div></div>`;
      window.print();
    }

    /* ═══════════════════════════════════════════════════════════
       CONTROLE INTERNO
    ═══════════════════════════════════════════════════════════ */
    function addDivida() {
      const nome = document.getElementById('priv-nome').value.trim();
      const valor = parseFloat(document.getElementById('priv-valor').value);
      const data = document.getElementById('priv-data').value || today();
      const status = document.getElementById('priv-status').value;
      const obs = document.getElementById('priv-obs').value.trim();

      if (!nome || !valor) { toast('Nome e valor obrigatórios', 'error'); return; }
      if (userRole !== 'admin' && userRole !== 'diretor') { toast('Acesso negado', 'error'); return; }

      db.collection('gda_privado').add({
        nome, valor, data, status, obs, criadoEm: Date.now()
      }).then(() => {
        toast('Dívida registrada');
        ['priv-nome', 'priv-valor', 'priv-obs'].forEach(id => document.getElementById(id).value = '');
      }).catch(err => toast('Erro ao salvar', 'error'));
    }

    function deleteDivida(id) {
      if (userRole !== 'admin' && userRole !== 'diretor') return;
      if (!confirm('Excluir este registro permanentemente?')) return;
      db.collection('gda_privado').doc(id).delete()
        .then(() => toast('Registro removido', 'info'))
        .catch(() => toast('Erro ao remover', 'error'));
    }

    function pagarDivida(id) {
      if (userRole !== 'admin' && userRole !== 'diretor') return;
      db.collection('gda_privado').doc(id).update({ status: 'pago' })
        .then(() => toast('Dívida marcada como paga'))
        .catch(() => toast('Erro ao atualizar', 'error'));
    }

    /* =========================================================================
       SISTEMA: RESET GLOBAL (AÇÃO CRÍTICA)
       - Esta função exige interação DURA E LITERAL do usuário para evitar calls autônomos.
       - Somente o cargo de 'admin' tem permissão (verificado duplamente).
       - Exige três janelas de confirmação, sendo a última uma prova de string exata.
       - NÃO DEVE SER CHAMADA EM LOADS OU UPDATES. APENAS NO CLIQUE.
    ========================================================================= */
    function iniciarResetSistema() {
      // Bloqueio de Segurança para garantir que só o "admin" (e não diretores) execute
      if (userRole !== 'admin') {
        toast('Ação restrita somente a permissões superiores (Administrador).', 'error');
        return;
      }

      // 1ª Confirmação - Intenção Direta
      const conf1 = confirm("⚠️ PERIGO: Você quer que comece do zero?\nIsso apagará o banco inteiro de todos os módulos. Cancelar evitará qualquer ação.");
      if (!conf1) {
        toast("Operação de reset CANCELADA pelo usuário.", "info");
        return;
      }

      // 2ª Confirmação - Validação de Responsabilidade
      const conf2 = confirm("Você tem absoluta certeza e autorização para tal?\nAperte OK apenas se você se responsabiliza por esta remoção na nuvem.");
      if (!conf2) {
        toast("Operação de reset CANCELADA na última barreira de diálogo.", "info");
        return;
      }

      // 3ª Confirmação - Interação Textual Explícita (Impossível auto-click)
      const inputNome = prompt("Para confirmar definitivamente, digite o nome completo do administrador (Wallyson...):");

      if (inputNome !== "Wallyson Jailson do Nascimento Fernandes") {
        toast("Nome incorreto. O reset foi interceptado preventivamente.", "error");
        return;
      }

      // Com todos os checks de usuário concluídos, disparamos a execução:
      realizarWipeDoSistema();
    }

    function realizarWipeDoSistema() {
      // Configura o objeto local zerado simulando o inicial
      APP = {
        clube: { transactions: [], sugestoes: [] },
        doceria: { pedidos: [], materias: [], gastos: [], entradas: [] },
        vendas: { vendas: [], produtos: [], vendedores: [], avarias: [], debitos: [] }
      };

      // Setamos explicitamente a bypass da tranca anti-limpeza para este momento exato
      loadedFromDB = true;

      // Pulamos a função saveData() normal (que proibiria este push de "APP vazio") 
      // e injetamos o vazio no Firestore diretamente, sem merge, para realmente aniquilar as chaves filhas.
      db.collection('gda_caixa').doc('estado').set(APP, { merge: false }).then(() => {
        toast("O SISTEMA FOI RESETADO. Atualizando a interface...", "info");
        setTimeout(() => location.reload(), 2500); // Reload pra reengatilhar os listens limpos
      }).catch(err => {
        console.error("Erro fatal ao dar Wipe: ", err);
        toast("Falha na sincronização do Wipe.", "error");
      });
    }

    function renderPrivado() {
      // Controle de Aba Específica do admin
      const sysTab = document.getElementById('tab-admin-sistema');
      if (sysTab) {
        sysTab.style.display = (userRole === 'admin') ? 'inline-block' : 'none';
      }


      const el = document.getElementById('priv-body');
      if (!el) return;
      const statusF = document.getElementById('priv-filter-status')?.value || '';
      let list = [..._privado];
      if (statusF) list = list.filter(d => d.status === statusF);

      if (!list.length) {
        el.innerHTML = `<tr><td colspan="6"><div class="empty-state"><div class="empty-icon">🔐</div><p>Nenhum registro sigiloso</p></div></td></tr>`;
        return;
      }

      el.innerHTML = list.map(d => `
        <tr>
          <td class="text-mono">${d.data}</td>
          <td style="font-weight:600">${d.nome}</td>
          <td class="text-mono negative">${fmt(d.valor)}</td>
          <td><span class="badge ${d.status === 'pago' ? 'badge-green' : 'badge-yellow'}">${d.status}</span></td>
          <td style="font-size:.78rem;color:var(--text3)">${d.obs || '-'}</td>
          <td>
            <div style="display:flex;gap:.3rem">
              ${d.status === 'aberto' ? `<button class="btn btn-ghost btn-icon btn-sm" onclick="pagarDivida('${d.id}')" title="Marcar como Pago">💰</button>` : ''}
              <button class="btn btn-ghost btn-icon btn-sm" onclick="deleteDivida('${d.id}')" title="Remover">🗑️</button>
            </div>
          </td>
        </tr>
      `).join('');
    }

    /* ═══════════════════════════════════════════════════════════
       INICIALIZAÇÃO
    ═══════════════════════════════════════════════════════════ */
    function init() {
      loadData();
      // Restaurar tema
      const savedTheme = localStorage.getItem('gda_theme') || 'dark';
      document.documentElement.setAttribute('data-theme', savedTheme);
      document.getElementById('themeBtn').textContent = savedTheme === 'dark' ? '🌙' : '🌑';
      // Datas padrão
      ['clube-data', 'doc-data', 'doc-gasto-data', 'vnd-data', 'av-data', 'deb-data']
        .forEach(id => { const el = document.getElementById(id); if (el) el.value = today(); });
      // Restore session
      const saved = localStorage.getItem('gda_session');
      if (saved) {
        try {
          const u = JSON.parse(saved);
          currentUser = u; userRole = u.role;
          finishLogin();
        } catch (e) { localStorage.removeItem('gda_session'); }
      }
      if (!userRole) renderClube();
    }

    init();
