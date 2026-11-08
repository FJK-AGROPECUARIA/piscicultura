/**
 * PISCICULTURA FJK — banco de dados na nuvem (Google Planilhas)
 * ------------------------------------------------------------------
 * Mesma sistemática do Gestão de Tratos / Abastecimentos:
 * o app no celular grava no aparelho e manda para cá quando tem internet.
 *
 * COMO PUBLICAR (uma vez só):
 *  1. script.google.com → Novo projeto → nome "Piscicultura FJK"
 *  2. Apague o conteúdo e cole este arquivo inteiro → Salvar
 *  3. Implantar → Nova implantação → tipo "App da Web"
 *       Executar como: Eu  ·  Quem pode acessar: Qualquer pessoa
 *  4. Autorize, copie o link que termina em /exec e cole no app:
 *       Gestão → Configurações → Avançado · conexão com a nuvem
 *  5. (Opcional) rode a função instalarBackupDiario uma vez para ter
 *     cópia automática da planilha todo dia de madrugada.
 *
 * A planilha "Piscicultura FJK - Banco de dados" é criada sozinha no seu Drive.
 */

const ABAS = {
  vendas:   'Vendas',
  receb:    'Recebimentos',
  ajustes:  'Ajustes',
  bags:     'Despesca (bags)',
  doacoes:  'Doações',
  custos:   'Custos',
  repasses: 'Repasses'
};

/* colunas legíveis de cada aba (o registro completo fica na coluna "json") */
const COLS = {
  vendas:   [['Nº', r => r.num || ''], ['Data', r => br(r.data)], ['Cliente', 'cliente'], ['Itens', r => (r.itens || []).map(i => i.produto + ' ' + i.classe + ' ' + kg(peso(i)) + ' kg x ' + i.preco).join(' | ')],
             ['Peso kg', 'peso'], ['Valor R$', 'valor'], ['Vencimento', r => br(r.venc)], ['Condição', 'cond'], ['NF', 'nf'], ['Vendedor', 'vendedor'], ['Obs', 'obs']],
  receb:    [['Data', r => br(r.data)], ['Cliente', 'cliente'], ['Valor R$', 'valor'], ['Forma', 'forma'], ['Documento', 'doc'], ['Obs', 'obs'], ['Vendedor', 'vendedor']],
  ajustes:  [['Data', r => br(r.data)], ['Cliente', 'cliente'], ['Tipo', r => r.tipo === 'D' ? 'Débito' : 'Crédito/desconto'], ['Valor R$', 'valor'], ['Descrição', 'desc']],
  bags:     [['Data', r => br(r.data)], ['Tanque', 'tanque'], ['Peixe', 'produto'], ['Peso líquido kg', 'peso'], ['Peixes', 'qtd'], ['Obs', 'obs'], ['Lançado por', 'lancadoPor']],
  doacoes:  [['Data', r => br(r.data)], ['Destinatário', 'destinatario'], ['Peixe', 'produto'], ['Peso kg', 'peso'], ['Peixes', 'qtd'], ['Finalidade', 'finalidade']],
  custos:   [['Data', r => br(r.data)], ['Categoria', 'categoria'], ['Descrição', 'desc'], ['Valor R$', 'valor'], ['Pago por', r => r.pago === 'emmaos' ? 'Em mãos ' + (r.quem || '') : r.pago === 'reembolsar' ? 'Reembolsar ' + (r.quem || '') : 'Fazenda']],
  repasses: [['Data', r => br(r.data)], ['Valor R$', 'valor'], ['Forma', 'forma'], ['Comprovante', 'doc'], ['Vendedor', 'vendedor'], ['Recebido por', 'recPor'], ['Obs', 'obs']]
};
const LISTAS_CAD = ['produtos', 'classes', 'clientes', 'tanques', 'categorias', 'vendedores', 'despescas'];
const PEDACO = 45000; // limite de caracteres por célula (o Google aceita até 50.000)

function br(k) { if (!k) return ''; const p = String(k).slice(0, 10).split('-'); return p.length === 3 ? p[2] + '/' + p[1] + '/' + p[0] : k; }
function peso(i) { return (i.pesadas || []).reduce((s, p) => s + Number(p || 0), 0); }
function kg(n) { return Math.round(n * 100) / 100; }
function saida(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

function planilha() {
  const ativa = SpreadsheetApp.getActiveSpreadsheet && SpreadsheetApp.getActiveSpreadsheet();
  if (ativa) return ativa;
  const pr = PropertiesService.getScriptProperties();
  let id = pr.getProperty('planilhaId');
  if (id) { try { return SpreadsheetApp.openById(id); } catch (e) { } }
  const ss = SpreadsheetApp.create('Piscicultura FJK - Banco de dados');
  pr.setProperty('planilhaId', ss.getId());
  return ss;
}
function aba(ss, tab) {
  const nome = ABAS[tab];
  let sh = ss.getSheetByName(nome);
  if (!sh) {
    sh = ss.insertSheet(nome);
    const cab = ['id', 'alterado', 'json'].concat(COLS[tab].map(c => c[0]));
    sh.getRange(1, 1, 1, cab.length).setValues([cab]).setFontWeight('bold').setBackground('#0d47a1').setFontColor('#ffffff');
    sh.setFrozenRows(1);
    sh.hideColumns(3);
    const padrao = ss.getSheetByName('Página1') || ss.getSheetByName('Sheet1');
    if (padrao && padrao.getLastRow() === 0 && ss.getSheets().length > 1) ss.deleteSheet(padrao);
  }
  return sh;
}
function linhaDe(tab, r) {
  return [r.id, r.alteradoEm || new Date().toISOString(), JSON.stringify(r)].concat(COLS[tab].map(c => {
    const v = typeof c[1] === 'function' ? c[1](r) : r[c[1]];
    return v == null ? '' : v;
  }));
}
function acharLinha(sh, id) {
  if (sh.getLastRow() < 2) return 0;
  const f = sh.getRange(2, 1, sh.getLastRow() - 1, 1).createTextFinder(String(id)).matchEntireCell(true).findNext();
  return f ? f.getRow() : 0;
}
function lerAba(ss, tab) {
  const sh = ss.getSheetByName(ABAS[tab]);
  if (!sh || sh.getLastRow() < 2) return [];
  return sh.getRange(2, 3, sh.getLastRow() - 1, 1).getValues().map(l => { try { return JSON.parse(l[0]); } catch (e) { return null; } }).filter(Boolean);
}

/* ---------- cadastros (clientes, peixes, tanques, despescas…) ---------- */
function lerCad(ss) {
  const sh = ss.getSheetByName('Cadastros');
  if (!sh || sh.getLastRow() < 1) return null;
  const txt = sh.getRange(1, 1, sh.getLastRow(), 1).getValues().map(l => l[0]).join('');
  try { return JSON.parse(txt); } catch (e) { return null; }
}
function gravarCad(ss, cad) {
  let sh = ss.getSheetByName('Cadastros');
  if (!sh) { sh = ss.insertSheet('Cadastros'); }
  const txt = JSON.stringify(cad), partes = [];
  for (let i = 0; i < txt.length; i += PEDACO) partes.push([txt.slice(i, i + PEDACO)]);
  sh.clear();
  sh.getRange(1, 1, partes.length, 1).setValues(partes);
  // aba legível de clientes
  let cl = ss.getSheetByName('Clientes');
  if (!cl) cl = ss.insertSheet('Clientes');
  cl.clear();
  const linhas = [['Cliente', 'Apelido', 'Telefone', 'Cidade', 'Bairro', 'Prazo (dias)', 'Doc.', 'Situação']]
    .concat((cad.clientes || []).slice().sort((a, b) => String(a.nome).localeCompare(String(b.nome)))
      .map(c => [c.nome || '', c.apelido || '', c.tel || '', c.cidade || '', c.bairro || '', c.prazo || 0, c.doc || '', c.inativo ? 'inativo' : 'ativo']));
  cl.getRange(1, 1, linhas.length, linhas[0].length).setValues(linhas);
  cl.getRange(1, 1, 1, linhas[0].length).setFontWeight('bold').setBackground('#0d47a1').setFontColor('#ffffff');
  cl.setFrozenRows(1);
}
/* junta os cadastros de vários celulares: item a item, fica o alterado por último */
function juntarCad(velho, novo) {
  if (!velho) return novo;
  const out = Object.assign({}, velho, novo);
  LISTAS_CAD.forEach(k => {
    const m = {};
    (velho[k] || []).forEach(x => m[x.id] = x);
    (novo[k] || []).forEach(x => { const a = m[x.id]; if (!a || String(x.alt || '') >= String(a.alt || '')) m[x.id] = x; });
    out[k] = Object.keys(m).map(id => m[id]);
  });
  const pv = velho.params || {}, pn = novo.params || {};
  out.params = String(pn.alt || '') >= String(pv.alt || '') ? pn : pv;
  delete out.inicial;
  return out;
}

/* ---------- número do título (sequencial, nunca repete) ---------- */
function proximoNumero(ss) {
  const pr = PropertiesService.getScriptProperties();
  let n = Number(pr.getProperty('ultimoTitulo') || 0);
  if (!n) lerAba(ss, 'vendas').forEach(v => { if (Number(v.num) > n) n = Number(v.num); });
  n++;
  pr.setProperty('ultimoTitulo', String(n));
  return n;
}

function doGet(e) {
  const acao = (e && e.parameter && e.parameter.acao) || 'listar';
  try {
    const ss = planilha();
    if (acao === 'ping') return saida({ ok: true });
    if (acao === 'listar') {
      const dados = {};
      Object.keys(ABAS).forEach(t => dados[t] = lerAba(ss, t));
      return saida({ ok: true, cadastros: lerCad(ss), dados: dados, em: new Date().toISOString() });
    }
    return saida({ ok: false, erro: 'ação desconhecida' });
  } catch (err) { return saida({ ok: false, erro: String(err) }); }
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const op = JSON.parse(e.postData.contents);
    const ss = planilha();
    if (op.acao === 'cadastros') {
      const cad = juntarCad(lerCad(ss), op.dados);
      gravarCad(ss, cad);
      return saida({ ok: true });
    }
    if (!ABAS[op.tab]) return saida({ ok: false, erro: 'tabela inválida' });
    const sh = aba(ss, op.tab);
    if (op.acao === 'salvar') {
      const r = op.dados, lin = acharLinha(sh, r.id);
      if (op.tab === 'vendas' && !r.num) {
        if (lin) { try { const ant = JSON.parse(sh.getRange(lin, 3).getValue()); if (ant.num) r.num = ant.num; } catch (x) { } }
        if (!r.num) r.num = proximoNumero(ss);
      }
      const v = linhaDe(op.tab, r);
      if (lin) sh.getRange(lin, 1, 1, v.length).setValues([v]); else sh.appendRow(v);
      return saida({ ok: true, num: r.num || null });
    }
    if (op.acao === 'excluir') {
      const lin = acharLinha(sh, op.id);
      if (lin) {
        let lx = ss.getSheetByName('Excluídos');
        if (!lx) { lx = ss.insertSheet('Excluídos'); lx.appendRow(['excluído em', 'aba', 'id', 'json', 'aparelho']); }
        lx.appendRow([new Date(), ABAS[op.tab], op.id, sh.getRange(lin, 3).getValue(), op.disp || '']);
        sh.deleteRow(lin);
      }
      return saida({ ok: true });
    }
    return saida({ ok: false, erro: 'ação desconhecida' });
  } catch (err) {
    return saida({ ok: false, erro: String(err) });
  } finally { lock.releaseLock(); }
}

/* ---------- cópia de segurança diária da planilha ---------- */
function backupDiario() {
  const ss = planilha(), nomePasta = 'Backups Piscicultura FJK';
  const it = DriveApp.getFoldersByName(nomePasta), pasta = it.hasNext() ? it.next() : DriveApp.createFolder(nomePasta);
  DriveApp.getFileById(ss.getId()).makeCopy('Piscicultura backup ' + Utilities.formatDate(new Date(), 'America/Belem', 'yyyy-MM-dd'), pasta);
  const arqs = [], f = pasta.getFiles();
  while (f.hasNext()) arqs.push(f.next());
  arqs.sort((a, b) => b.getDateCreated() - a.getDateCreated()).slice(30).forEach(a => a.setTrashed(true)); // guarda 30 dias
}
function instalarBackupDiario() {
  ScriptApp.getProjectTriggers().filter(t => t.getHandlerFunction() === 'backupDiario').forEach(t => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('backupDiario').timeBased().everyDays(1).atHour(3).create();
}
