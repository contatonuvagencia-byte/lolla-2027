/* Lolla 2027: login, menu e salvamento no Supabase, compartilhado pelas 3 páginas. */
(function () {
  var SUPABASE_URL = 'https://qtdhrjfiwskhgkncmeml.supabase.co';
  var SUPABASE_KEY = 'sb_publishable_qUH-lYT03iy0FW8S-km98g_faj93gU0';
  var sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: true, autoRefreshToken: true }
  });

  var PAGES = [
    { href: 'index.html', id: 'planner', label: 'Planner' },
    { href: 'roteiro.html', id: 'roteiro', label: 'Roteiro' },
    { href: 'compras.html', id: 'compras', label: 'Compras' },
    { href: 'docs.html', id: 'docs', label: 'Docs' }
  ];

  var css = '' +
    '.lz-nav{position:sticky;top:env(safe-area-inset-top,0px);z-index:20;background:var(--card);border-bottom:1px solid var(--line)}' +
    '.lz-nav .in{max-width:980px;margin:0 auto;padding:10px 16px;display:flex;align-items:center;gap:8px;flex-wrap:wrap}' +
    '.lz-nav .brand{font-family:var(--f-display);font-weight:800;margin-right:auto;color:var(--ink);text-decoration:none}' +
    '.lz-nav .brand span{color:var(--hot)}' +
    '.lz-nav a.tab{font-weight:700;font-size:14px;color:var(--muted);text-decoration:none;padding:6px 12px;border-radius:999px}' +
    '.lz-nav a.tab[aria-current="page"]{background:var(--hot);color:var(--hot-ink)}' +
    '.lz-nav button{font:inherit;font-size:13px;font-weight:700;border:1px solid var(--line);background:var(--paper);color:var(--muted);padding:5px 12px;border-radius:999px;cursor:pointer}' +
    '.lz-gate{min-height:100vh;display:grid;place-items:center;padding:24px 16px;background:var(--paper)}' +
    '.lz-card{width:100%;max-width:380px;background:var(--card);border:1px solid var(--line);border-radius:20px;padding:24px;display:grid;gap:14px}' +
    '.lz-card h1{font-family:var(--f-display);font-size:34px;line-height:1;margin:0}' +
    '.lz-card h1 span{color:var(--hot)}' +
    '.lz-card p{margin:0;color:var(--muted);font-size:14px}' +
    '.lz-card label{display:grid;gap:4px;font-size:13px;font-weight:700;color:var(--muted)}' +
    '.lz-card input{font:inherit;font-size:16px;color:var(--ink);background:var(--paper);border:1px solid var(--line);border-radius:10px;padding:10px 12px}' +
    '.lz-card .row{display:flex;gap:8px;flex-wrap:wrap}' +
    '.lz-card button{flex:1 1 140px;font:inherit;font-weight:700;border-radius:10px;padding:10px 14px;cursor:pointer;border:1px solid var(--line);background:var(--paper);color:var(--ink)}' +
    '.lz-card button.main{background:var(--hot);color:var(--hot-ink);border-color:transparent}' +
    '.lz-msg{font-size:13px;min-height:1.2em;color:var(--hot)}';

  function addStyle() {
    var s = document.createElement('style');
    s.textContent = css;
    document.head.appendChild(s);
  }

  function nav(current) {
    var el = document.createElement('nav');
    el.className = 'lz-nav';
    el.setAttribute('aria-label', 'Páginas');
    el.innerHTML = '<div class="in"><a class="brand" href="index.html">Lolla <span>2027</span></a>' +
      PAGES.map(function (p) {
        return '<a class="tab" href="' + p.href + '"' + (p.id === current ? ' aria-current="page"' : '') + '>' + p.label + '</a>';
      }).join('') +
      '<button type="button" id="lz-sair">Sair</button></div>';
    document.body.insertBefore(el, document.body.firstChild);
    document.getElementById('lz-sair').onclick = function () {
      sb.auth.signOut().then(function () { location.reload(); });
    };
  }

  function gate(onIn) {
    var app = document.getElementById('app');
    if (app) app.hidden = true;
    var g = document.createElement('div');
    g.className = 'lz-gate';
    g.innerHTML = '<form class="lz-card" id="lz-form"><h1>Lolla <span>2027</span></h1>' +
      '<p>Entra pra ver o seu planner, o roteiro, as compras e os seus docs. Tudo sincroniza entre celular e computador.</p>' +
      '<label>E-mail<input id="lz-email" type="email" autocomplete="email" required></label>' +
      '<label>Senha<input id="lz-senha" type="password" autocomplete="current-password" minlength="6" required></label>' +
      '<div class="row"><button type="submit" class="main">Entrar</button><button type="button" id="lz-criar">Criar conta</button></div>' +
      '<p class="lz-msg" id="lz-msg" aria-live="polite"></p></form>';
    document.body.appendChild(g);
    var msg = function (t) { document.getElementById('lz-msg').textContent = t; };
    var creds = function () {
      return { email: document.getElementById('lz-email').value.trim(), password: document.getElementById('lz-senha').value };
    };
    document.getElementById('lz-form').onsubmit = function (e) {
      e.preventDefault();
      msg('Entrando...');
      sb.auth.signInWithPassword(creds()).then(function (r) {
        if (r.error) {
          msg(/confirm/i.test(r.error.message) ? 'Falta confirmar o e-mail. Abre o link que chegou na sua caixa de entrada.' : 'E-mail ou senha errados.');
          return;
        }
        g.remove(); if (app) app.hidden = false; onIn(r.data.user);
      });
    };
    document.getElementById('lz-criar').onclick = function () {
      var c = creds();
      if (!c.email || c.password.length < 6) { msg('Coloca o e-mail e uma senha com pelo menos 6 caracteres.'); return; }
      msg('Criando a conta...');
      sb.auth.signUp({ email: c.email, password: c.password, options: { emailRedirectTo: location.href.split('#')[0] } }).then(function (r) {
        if (r.error) { msg('Não deu pra criar: ' + r.error.message); return; }
        if (r.data.session) { g.remove(); if (app) app.hidden = false; onIn(r.data.user); return; }
        msg('Conta criada! Confirma pelo link que chegou no seu e-mail e depois entra aqui.');
      });
    };
  }

  window.Lolla = {
    sb: sb,
    /* Carrega os dados da página; chama ready(dados ou null) depois do login. */
    boot: function (pagina, ready) {
      addStyle();
      sb.auth.getSession().then(function (r) {
        var start = function () {
          nav(pagina);
          sb.from('lolla_state').select('dados').eq('pagina', pagina).maybeSingle().then(function (q) {
            ready(q.data ? q.data.dados : null);
          });
        };
        if (r.data.session) start(); else gate(start);
      });
    },
    /* Salva o estado inteiro da página. */
    save: function (pagina, dados) {
      return sb.from('lolla_state').upsert({ pagina: pagina, dados: dados }, { onConflict: 'user_id,pagina' }).then(function (r) {
        if (r.error) throw r.error;
        return r;
      });
    }
  };
})();
