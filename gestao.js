
/* =====================================================================
   GESTÃO — peças comuns
   ===================================================================== */
function aplicaPer(st,p){st.per=p;const h=chaveDia(),d=dDe(h);
  if(p==='hoje'){st.de=h;st.ate=h}
  if(p==='7'||p==='15'||p==='30'){st.de=somaDias(h,-(+p-1));st.ate=h}
  if(p==='mes'){st.de=chaveDia(new Date(d.getFullYear(),d.getMonth(),1));st.ate=h}
  if(p==='mesant'){st.de=chaveDia(new Date(d.getFullYear(),d.getMonth()-1,1));st.ate=chaveDia(new Date(d.getFullYear(),d.getMonth(),0))}
  if(p==='tudo'){st.de='';st.ate=''}}
/* filtro de período no padrão do Gestão de Tratos: sempre duas datas (De · Até) e os atalhos embaixo */
const perHtml=(st,o)=>`<div class="datas"><div><label>De</label><input type="date" data-f="de" value="${st.de||''}"></div><div><label>Até</label><input type="date" data-f="ate" value="${st.ate||''}"></div></div>
  <div class="atalhos">${[['7','7 dias'],['15','15 dias'],['30','30 dias'],['mes','Este mês']].concat(o&&o.tudo?[['tudo','Tudo']]:[]).map(([k,t])=>`<button class="mini${st.per===k?' sel':''}" data-a="per" data-v="${k}">${t}</button>`).join('')}</div>`;
/* escolha com setas ◀ lista ▶ (igual ao Tratos): as setas passam para o anterior/próximo da lista */
const selSetas=(lbl,f,ops,sel)=>`<div class="selNav">${lbl?`<label>${lbl}</label>`:''}<div class="selLinha"><button type="button" class="gSeta" data-seta="-1" aria-label="Anterior">◀</button><select class="sel2" data-f="${f}">${ops.map(([v,t])=>`<option value="${esc(v)}" ${v===sel?'selected':''}>${esc(t)}</option>`).join('')}</select><button type="button" class="gSeta" data-seta="1" aria-label="Próximo">▶</button></div></div>`;
document.addEventListener('click',e=>{const b=e.target.closest('[data-seta]');if(!b)return;e.preventDefault();const s=b.closest('.selLinha').querySelector('select');const i=s.selectedIndex+Number(b.dataset.seta);if(i<0||i>=s.options.length)return;s.selectedIndex=i;s.dispatchEvent(new Event('change',{bubbles:true}))});
/* data inicial maior que a final: a final passa a ser a mesma data (e vice-versa) */
function ajustaPar(st,f){if(!st.de||!st.ate)return;if(f==='de'&&st.de>st.ate)st.ate=st.de;if(f==='ate'&&st.ate<st.de)st.de=st.ate}
const noPer=(st,k)=>(!st.de||k>=st.de)&&(!st.ate||k<=st.ate);
const descPer=st=>st.de||st.ate?(st.de===st.ate?fmtData(st.de):`${st.de?fmtData(st.de):'início'} a ${st.ate?fmtData(st.ate):'hoje'}`):'Todo o período';
const despSelHtml=(sel,todas,lbl)=>selSetas(lbl||'',`desp`,(todas?[['','Todas as despescas']]:[]).concat(despescasOrd().map(d=>[d.id,d.descricao+(d.encerrada?' — encerrada':'')])),sel);
function despPadrao(){const d=despescaDaData(chaveDia(),false);if(d)return d.id;const o=despescasOrd();return o.length?o[0].id:''}
const campoPerDesp=(st,f,el)=>{if(f==='de'||f==='ate'){st[f]=el.value;st.per='';ajustaPar(st,f);render();return true}if(f==='desp'){st.desp=el.value;render();return true}return false};
function detalheVenda(v){
  const d=despPorId(v.despescaId),c=cliPorId(v.clienteId)||{};
  janela(`<h3>🧾 ${esc(numVenda(v))}</h3><div class="kv"><div><span>Cliente</span><b>${esc(v.cliente)}</b></div><div><span>Data</span><b>${fmtData(v.data)}</b></div><div><span>Vencimento</span><b>${fmtData(v.venc)} ${sitVenda(v)}</b></div><div><span>Condição</span><b>${esc(v.cond||'A PRAZO')}</b></div><div><span>Despesca</span><b>${esc(d?d.descricao:'—')}</b></div><div><span>Vendedor</span><b>${esc(v.vendedor||'—')}</b></div>${v.nf?`<div><span>Nota</span><b>${esc(v.nf)}</b></div>`:''}${v.obs?`<div><span>Obs.</span><b>${esc(v.obs)}</b></div>`:''}</div>
    ${(v.itens||[]).map(i=>`<div class="item"><div class="itemTopo"><div><b>${esc(i.produto)} — ${esc(i.classe)}</b><small>${fmtKg(pesoItem(i))} kg × ${fmtR(i.preco)}/kg</small></div><b>${fmtR(valorItem(i))}</b></div><div class="pesadas">${(i.pesadas||[]).map((p,k)=>`<button disabled style="opacity:1"><i>${k+1}</i>${fmtKg(p)}</button>`).join('')}</div></div>`).join('')}
    <div class="totVenda"><div><small>Peso</small><b>${fmtKg(pesoVenda(v))} kg</b></div><div style="text-align:right"><small>Valor</small><b>${fmtR(valorVenda(v))}</b></div></div>
    <div class="compart"><button class="verde" id="jW">🖼 Foto</button><button class="verde" id="jP">📄 PDF</button></div>
    <div class="row"><button class="danger" id="jX">🗑 Excluir</button><button id="jE">✏️ Editar</button></div>`,(j,fechar)=>{
    j.querySelector('#jW').onclick=()=>exportarRel(relNota(v),'img',`Nota ${v.cliente} ${fmtData(v.data).replace(/\//g,'-')}`);
    j.querySelector('#jP').onclick=()=>exportarRel(relNota(v),'pdf',`Nota ${v.cliente} ${fmtData(v.data).replace(/\//g,'-')}`);
    j.querySelector('#jE').onclick=()=>{fechar();editarVenda(v,tela)};
    j.querySelector('#jX').onclick=()=>{fechar();excluirVenda(v)};
  });
}

/* =====================================================================
   VENDAS LANÇADAS
   ===================================================================== */
const gv={per:'7',de:'',ate:'',cli:'',desp:''};
ENTRAR.gvend=()=>{aplicaPer(gv,'7');gv.cli='';gv.desp=''};
function vendasFiltro(){return db.vendas.filter(v=>(gv.desp?v.despescaId===gv.desp:noPer(gv,v.data))&&(!gv.cli||v.clienteId===gv.cli)).sort((a,b)=>b.data.localeCompare(a.data)||String(b.registradoEm).localeCompare(String(a.registradoEm)))}
function agrupaItens(vs,chave){const g={};vs.forEach(v=>(v.itens||[]).forEach(i=>{const k=chave(v,i);const o=g[k]=g[k]||{k,kg:0,r:0,n:new Set()};o.kg=r3(o.kg+pesoItem(i));o.r=r2(o.r+valorItem(i));o.n.add(v.id)}));return Object.values(g).sort((a,b)=>b.kg-a.kg)}
RENDER.gvend=()=>{
  const l=vendasFiltro(),kg=r3(l.reduce((s,v)=>s+pesoVenda(v),0)),rs=r2(l.reduce((s,v)=>s+valorVenda(v),0));
  const clis=[...new Map(db.vendas.map(v=>[v.clienteId,v.cliente])).entries()].sort((a,b)=>ordTxt(a[1],b[1]));
  let h=`<section class="panel"><h2>Filtros</h2>${gv.desp?'':perHtml(gv)}${despSelHtml(gv.desp,true,'Despesca')}
    ${selSetas('Cliente','cli',[['','Todos os clientes']].concat(clis),gv.cli)}</section>
    <section class="panel"><div class="stat"><div><small>Vendas</small><b class="num">${l.length}</b></div><div><small>Kg vendidos</small><b class="num">${fmtKg(kg)}</b></div><div><small>Faturamento</small><b class="num">${fmtR(rs).replace('R$ ','')}</b></div><div><small>Preço médio</small><b class="num">${kg?fmtN2(rs/kg):'—'}</b></div></div>`;
  let dia='';l.forEach(v=>{if(v.data!==dia){dia=v.data;const dv=l.filter(x=>x.data===dia);h+=`<div class="dia"><span>${nomeDia(dia)}, ${fmtData(dia)}</span><span>${fmtKg(dv.reduce((s,x)=>s+pesoVenda(x),0))} kg · ${fmtR(dv.reduce((s,x)=>s+valorVenda(x),0))}</span></div>`}
    h+=`<button class="reg" data-a="ver" data-v="${v.id}"><div><span class="eqn">${esc(v.cliente)}</span><div class="faz">${esc(numVenda(v))} · ${esc((v.itens||[]).map(i=>i.produto+' '+i.classe).join(', '))}</div><div class="faz">${sitVenda(v)} ${v.vendedor?'· '+esc(v.vendedor):''}</div></div><div class="lt">${fmtR(valorVenda(v))}<small>${fmtKg(pesoVenda(v))} kg</small></div></button>`});
  if(!l.length)h+='<div class="vazio">Nenhuma venda no filtro.</div>';
  h+=`${l.length?botoesExp():''}<p class="note">Toque numa venda para ver a nota, editar ou excluir.</p></section>`;
  $('t-gvend').innerHTML=h;
};
CAMPOS.gvend=(f,el)=>{if(campoPerDesp(gv,f,el))return;if(f==='cli'){gv.cli=el.value;render()}};
ACOES.gvend={per(v){aplicaPer(gv,v);render()},ver(id){const v=db.vendas.find(x=>x.id===id);if(v)detalheVenda(v)},
  exp(t){const l=vendasFiltro().slice().reverse(),kg=r3(l.reduce((s,v)=>s+pesoVenda(v),0)),rs=r2(l.reduce((s,v)=>s+valorVenda(v),0));
    const sub=[gv.desp?(despPorId(gv.desp)||{}).descricao:descPer(gv)].concat(gv.cli?[(cliPorId(gv.cli)||{}).nome||'']:[]);
    const pc=agrupaItens(l,(v,i)=>i.produto+' — '+i.classe),pcl=agrupaItens(l,v=>v.cliente);
    exportarRel({titulo:'Relatório de vendas',sub,xlsNome:'Vendas',blocos:[
      {kv:[['Vendas',String(l.length)],['Peso vendido',fmtKg(kg)+' kg'],['Faturamento',fmtR(rs),null,true],['Preço médio',kg?fmtR(rs/kg)+'/kg':'—']]},
      {tit:'Por classificação',cols:[{t:'Peixe / classificação',w:40},{t:'Kg',w:14,al:'r'},{t:'Valor',w:16,al:'r'},{t:'R$/kg',w:12,al:'r'}],linhas:pc.map(g=>[g.k,fmtKg(g.kg),fmtR(g.r),fmtR(g.kg?g.r/g.kg:0)]),total:['TOTAL',fmtKg(kg),fmtR(rs),fmtR(kg?rs/kg:0)]},
      {tit:'Por cliente',cols:[{t:'Cliente',w:40},{t:'Vendas',w:10,al:'r'},{t:'Kg',w:14,al:'r'},{t:'Valor',w:16,al:'r'}],linhas:pcl.map(g=>[g.k,String(g.n.size),fmtKg(g.kg),fmtR(g.r)]),total:['TOTAL',String(l.length),fmtKg(kg),fmtR(rs)]},
      {tit:'Vendas',cols:[{t:'Data',w:11},{t:'Nº',w:7},{t:'Cliente',w:26},{t:'Itens',w:30},{t:'Kg',w:11,al:'r'},{t:'Valor',w:14,al:'r'}],linhas:l.map(v=>[fmtData(v.data),v.num?String(v.num).padStart(4,'0'):'—',v.cliente,(v.itens||[]).map(i=>i.classe).join(', '),fmtKg(pesoVenda(v)),fmtR(valorVenda(v))]),total:['TOTAL','','','',fmtKg(kg),fmtR(rs)]},
    ]},t,'Vendas '+sub[0].replace(/\//g,'-'))}};

/* =====================================================================
   CLIENTES / EXTRATO
   ===================================================================== */
const gc={busca:'',filtro:'todos'};let extrCli=null;
RENDER.gcli=()=>{
  let l=ativos(cad.clientes);const q=semAcento(gc.busca);if(q)l=l.filter(c=>semAcento(c.nome+' '+(c.apelido||'')+' '+(c.cidade||'')+' '+(c.bairro||'')).includes(q));
  const pos={};l.forEach(c=>pos[c.id]=posicao(c.id));
  if(gc.filtro==='aberto')l=l.filter(c=>pos[c.id].aberto>0.004);if(gc.filtro==='vencido')l=l.filter(c=>pos[c.id].vencido>0.004);
  l.sort((a,b)=>gc.filtro==='todos'?ordTxt(a.nome,b.nome):pos[b.id].aberto-pos[a.id].aberto);
  const tA=r2(l.reduce((s,c)=>s+pos[c.id].aberto,0)),tV=r2(l.reduce((s,c)=>s+pos[c.id].vencido,0));
  let h=`<section class="panel">${titNovo('Clientes','novo')}<div class="busca"><input type="text" data-f="busca" value="${esc(gc.busca)}" placeholder="Buscar cliente" autocomplete="off"></div>
    <div class="tipoMov">${[['todos','Todos'],['aberto','Em aberto'],['vencido','Vencidos']].map(([k,t])=>`<button data-a="filtro" data-v="${k}" class="${gc.filtro===k?'sel':''}">${t}</button>`).join('')}</div>
    <div class="stat"><div><small>Clientes</small><b class="num">${l.length}</b></div><div><small>Em aberto</small><b class="num">${fmtR(tA).replace('R$ ','')}</b></div><div><small>Vencido</small><b class="num ${tV>0?'neg':''}">${fmtR(tV).replace('R$ ','')}</b></div></div>
    <div id="cliLista">`;
  h+=l.map(c=>{const p=pos[c.id];return `<button class="cliLinha" data-a="abrir" data-v="${c.id}"><div><b>${esc(c.nome)}</b><small>${[c.apelido,c.cidade,c.bairro,c.tel].filter(Boolean).map(esc).join(' · ')||'&nbsp;'}</small></div><div class="val ${p.vencido>0?'neg':''}">${p.aberto>0.004?fmtR(p.aberto):'<small>sem débito</small>'}${p.vencido>0?`<small class="neg">vencido ${fmtR(p.vencido)}</small>`:''}</div></button>`}).join('')||'<div class="vazio">Nenhum cliente.</div>';
  h+=`</div></section>`;$('t-gcli').innerHTML=h;
};
CAMPOS.gcli=(f,el)=>{if(f==='busca'){gc.busca=el.value;const p=el.selectionStart;render();const i=$('t-gcli').querySelector('[data-f=busca]');i.focus();try{i.setSelectionRange(p,p)}catch(e){}}};
ACOES.gcli={filtro(v){gc.filtro=v;render()},novo(){formCliente(null,c=>{extrCli=c.id;ir('extr')})},abrir(id){extrCli=id;ir('extr')}};

const ge={per:'tudo',de:'',ate:'',desp:''};
ENTRAR.extr=()=>{aplicaPer(ge,'tudo');ge.desp=''};
function dadosExtrato(cid){
  const todos=movimentos(cid);let movs=todos,ant=0;
  if(ge.desp)movs=todos.filter(m=>m.tipo!=='VENDA'?false:m.despescaId===ge.desp);
  else if(ge.de){const a=todos.filter(m=>m.data<ge.de);ant=a.length?a[a.length-1].saldo:0;movs=todos.filter(m=>noPer(ge,m.data))}
  else if(ge.ate)movs=todos.filter(m=>m.data<=ge.ate);
  const p=posicao(cid,todos);
  return{todos,movs,ant,p,deb:r2(movs.reduce((s,m)=>s+m.debito,0)),cred:r2(movs.reduce((s,m)=>s+m.credito,0)),kg:r3(movs.reduce((s,m)=>s+m.peso,0)),rot:ge.desp?(despPorId(ge.desp)||{}).descricao:descPer(ge)}
}
RENDER.extr=()=>{
  const c=cliPorId(extrCli);if(!c){ir('gcli');return}
  const x=dadosExtrato(c.id);
  let h=`<section class="panel"><div class="curhead"><h2>${esc(c.nome)}</h2><button class="mini" data-a="editar">✏️ Cadastro</button></div>
    <p class="note">${[c.apelido,c.tel,c.cidade,c.bairro].filter(Boolean).map(esc).join(' · ')||'—'} · prazo ${c.prazo||0} dias</p>
    <div class="stat"><div><small>Em aberto</small><b class="num">${fmtR(x.p.aberto).replace('R$ ','')}</b></div><div><small>Vencido</small><b class="num ${x.p.vencido>0?'neg':''}">${fmtR(x.p.vencido).replace('R$ ','')}</b></div><div><small>Maior atraso</small><b class="num">${x.p.maiorAtraso} d</b></div></div>
    <button data-a="precos">💲 Preços negociados</button>
    <div class="compart"><button class="verde" data-a="exp" data-v="img">🖼 Foto</button><button class="verde" data-a="exp" data-v="pdf">📄 PDF</button><button class="verde" data-a="exp" data-v="xls">📊 Excel</button></div></section>`;
  if(x.p.abertos.length)h+=`<section class="panel"><h2>Títulos em aberto</h2><div class="tabWrap"><table class="tabela"><tr><th>Título</th><th>Venc.</th><th class="r">Valor</th><th class="r">Aberto</th></tr>${x.p.abertos.map(t=>`<tr><td>${t.tipo==='VENDA'?esc(numCurto(t.rec)):'Ajuste'}<br><small>${fmtData(t.data)}</small></td><td>${fmtData(t.venc)}<br>${sitTag(t)}</td><td class="r">${fmtR(t.valor)}</td><td class="r"><b>${fmtR(t.aberto)}</b></td></tr>`).join('')}<tr class="tot"><td colspan="3">Total em aberto</td><td class="r">${fmtR(x.p.aberto)}</td></tr></table></div></section>`;
  h+=`<section class="panel">${titNovo('Movimentação','ajuste',null,'Ajuste')}${ge.desp?'':perHtml(ge,{tudo:true})}${despSelHtml(ge.desp,true,'Por ciclo de despesca')}
    ${ge.de&&!ge.desp?`<div class="kv"><div><span>Saldo anterior a ${fmtData(ge.de)}</span><b>${fmtR(x.ant)}</b></div></div>`:''}`;
  h+=x.movs.slice().reverse().map(m=>`<button class="reg" data-a="mov" data-v="${m.tipo}:${m.ref}"><div><span class="eqn" style="font-size:1.05rem">${fmtData(m.data)} · ${m.tipo==='VENDA'?'Compra':m.tipo==='PAGAMENTO'?'Pagamento':m.tipo==='DEBITO'?'Débito':'Crédito'}</span><div class="faz">${esc(m.hist)}</div>${m.tipo==='VENDA'?`<div class="faz">${sitTag(x.p.titulos.find(t=>t.ref===m.ref)||{aberto:0})}</div>`:''}</div><div class="lt ${m.credito?'mais':''}">${m.debito?fmtR(m.debito):'− '+fmtR(m.credito)}<small>saldo ${fmtR(m.saldo)}</small></div></button>`).join('')||'<div class="vazio">Sem movimentação no período.</div>';
  h+=`<div class="kv"><div><span>Compras no período</span><b>${fmtR(x.deb)}</b></div><div><span>Pagamentos/créditos no período</span><b class="pos">${fmtR(x.cred)}</b></div>${x.kg?`<div><span>Peso comprado</span><b>${fmtKg(x.kg)} kg</b></div>`:''}<div class="forte"><span>Saldo em aberto</span><b class="${x.p.vencido>0?'neg':''}">${fmtR(x.p.aberto)}</b></div></div></section>`;
  if(Math.abs(x.p.saldo)<0.005)h+=`<button class="inativar" data-a="inativar">Inativar cliente</button>`;
  h+=`<button class="excluirCli" data-a="excluirCli">🗑 Excluir cliente</button>`;
  $('t-extr').innerHTML=h;
};
CAMPOS.extr=(f,el)=>{campoPerDesp(ge,f,el)};
function textoExtrato(c,x){const P=cad.params,L=[`*EXTRATO — ${P.empresa}*`,`_${P.unidade}_`,`Cliente: *${c.nome}*`,`Período: ${x.rot}`,`Emitido em ${fmtDH(agora())}`,''];
  if(ge.de&&!ge.desp)L.push(`Saldo anterior: ${fmtR(x.ant)}`,'');
  L.push('*MOVIMENTAÇÃO*');if(!x.movs.length)L.push('Sem movimentação no período.');
  x.movs.forEach(m=>{if(m.debito){L.push(`${fmtData(m.data)} | ${m.tipo==='VENDA'?'Compra':'Débito'} — ${fmtR(m.debito)}`);if(m.rec.itens)L.push('   ('+m.rec.itens.map(i=>`${i.produto} ${i.classe} ${fmtKg(pesoItem(i))} kg x ${fmtR(i.preco)}`).join('; ')+')')}else L.push(`${fmtData(m.data)} | ${m.tipo==='PAGAMENTO'?'Pagamento':'Crédito'} — ${fmtR(m.credito)}`)});
  L.push('',`Compras no período: ${fmtR(x.deb)}`,`Pagamentos no período: ${fmtR(x.cred)}`);if(x.kg)L.push(`Peso no período: ${fmtKg(x.kg)} kg`);
  L.push('',`*SALDO EM ABERTO: ${fmtR(x.p.aberto)}*`);if(x.p.vencido>0)L.push(`*Vencido: ${fmtR(x.p.vencido)} (maior atraso: ${x.p.maiorAtraso} dias)*`);
  if(x.p.abertos.length){L.push('','*Títulos em aberto*');x.p.abertos.forEach(t=>L.push(`• ${t.tipo==='VENDA'?numVenda(t.rec):'Ajuste'} — venc. ${fmtData(t.venc)} — ${fmtR(t.aberto)}${t.atraso>0?` (${t.atraso} dias)`:''}`))}
  L.push('',P.empresa);if(P.contato)L.push(P.contato);return L.join('\n')}
function relExtrato(c,x){return{titulo:'Extrato do cliente',sub:[c.nome,'Período: '+x.rot],xlsNome:'Extrato',blocos:[
  {kv:[['Cliente',nomeCli(c)],['Telefone',c.tel||'—'],['Prazo de pagamento',(c.prazo||0)+' dias']].concat(ge.de&&!ge.desp?[['Saldo anterior',fmtR(x.ant)]]:[])},
  {tit:'Movimentação',cols:[{t:'Data',w:11},{t:'Histórico',w:45},{t:'Débito',w:13,al:'r'},{t:'Crédito',w:13,al:'r'},{t:'Saldo',w:13,al:'r'}],linhas:x.movs.map(m=>[fmtData(m.data),m.hist,m.debito?fmtR(m.debito):'',m.credito?fmtR(m.credito):'',fmtR(m.saldo)]),total:['','Totais do período',fmtR(x.deb),fmtR(x.cred),'']},
  {tit:'Títulos em aberto',cols:[{t:'Título',w:16},{t:'Emissão',w:12},{t:'Vencimento',w:12},{t:'Valor',w:14,al:'r'},{t:'Aberto',w:14,al:'r'},{t:'Atraso',w:12,al:'r'}],linhas:x.p.abertos.map(t=>[t.tipo==='VENDA'?numCurto(t.rec):'Ajuste',fmtData(t.data),fmtData(t.venc),fmtR(t.valor),fmtR(t.aberto),t.atraso>0?t.atraso+' dias':'a vencer']),cores:x.p.abertos.map(t=>t.atraso>0?[null,null,'#b3261e',null,null,'#b3261e']:null),total:['TOTAL','','','',fmtR(x.p.aberto),'']},
  {kv:[['SALDO EM ABERTO',fmtR(x.p.aberto),null,true],['Vencido',fmtR(x.p.vencido),x.p.vencido>0?'#b3261e':null]]}]}}
ACOES.extr={per(v){aplicaPer(ge,v);render()},
  editar(){formCliente(cliPorId(extrCli),()=>render())},
  excluirCli(){excluirCad('clientes',extrCli,()=>ir('gcli'))},
  inativar(){const c=cliPorId(extrCli);perguntar(`Inativar ${c.nome}?`,'Inativar','var(--warn)',()=>{c.inativo=true;toque(c);salvarCad('Cliente inativado');ir('gcli')},'Some das listas; o histórico continua guardado.')},
  wa(){const c=cliPorId(extrCli);compartilharTexto(textoExtrato(c,dadosExtrato(c.id)),c.tel)},
  exp(t){const c=cliPorId(extrCli),x=dadosExtrato(c.id);exportarRel(relExtrato(c,x),t,`Extrato ${c.nome} ${x.rot.replace(/\//g,'-')}`)},
  precos(){const c=cliPorId(extrCli);c.precos=c.precos||{};
    janela(`<h3>💲 Preços negociados — ${esc(c.nome)}</h3><p class="note">Preço por kg sugerido na venda. Em branco = usa o preço de referência.</p>${ativos(cad.produtos).map(p=>`<div class="secTit">${esc(p.nome)}</div>${classesDo(p.id).map(cl=>`<div class="precoLinha"><span style="flex:1;color:var(--fg);white-space:normal">${esc(cl.nome)}<br><small style="color:var(--muted)">ref. ${fmtR(cl.preco||0)}</small></span><input type="text" inputmode="decimal" data-c="${cl.id}" value="${c.precos[cl.id]!=null?txtBR(c.precos[cl.id]):''}" placeholder="—" style="max-width:120px"></div>`).join('')}`).join('')}
      <div class="row"><button id="jC">Cancelar</button><button class="primary" id="jS">Salvar preços</button></div>`,(j,fechar)=>{j.querySelector('#jC').onclick=fechar;
      j.querySelector('#jS').onclick=()=>{j.querySelectorAll('[data-c]').forEach(i=>{const n=numBR(i.value);if(n>0)c.precos[i.dataset.c]=n;else delete c.precos[i.dataset.c]});toque(c);salvarCad('Preços salvos');fechar()}})},
  ajuste(){editarAjuste(null)},
  mov(v){const[t,id]=v.split(':');
    if(t==='VENDA'){const x=db.vendas.find(a=>a.id===id);if(x)detalheVenda(x)}
    else if(t==='PAGAMENTO'){const r=db.receb.find(a=>a.id===id);if(r)editarReceb(r)}
    else{const a=db.ajustes.find(z=>z.id===id);if(a)editarAjuste(a)}}};
function editarAjuste(a){const c=cliPorId(a?a.clienteId:extrCli),n=!a;a=a||{tipo:'C',data:chaveDia(),valor:'',desc:''};
  janela(`<h3>± ${n?'Novo ajuste':'Ajuste'} — ${esc(c.nome)}</h3><div class="tipoMov" style="grid-template-columns:1fr 1fr" id="jT"><button data-t="C" class="${a.tipo==='C'?'sel':''}">Crédito / desconto</button><button data-t="D" class="${a.tipo==='D'?'sel':''}">Débito</button></div>
    <div class="datas"><div><label>Data</label><input type="date" id="jD" value="${a.data}"></div><div><label>Valor</label><input type="text" id="jV" inputmode="decimal" value="${txtBR(a.valor)}"></div></div>
    <div><label>Descrição *</label><input type="text" id="jS" value="${esc(a.desc||'')}" placeholder="Ex.: desconto por quebra"></div>
    <p class="note">Crédito/desconto reduz o que o cliente deve (não entra no dinheiro em mãos). Débito aumenta.</p>
    <div class="row">${n?'':'<button class="danger" id="jX">🗑 Excluir</button>'}<button class="primary" id="jO">Salvar</button></div>`,(j,fechar)=>{
    let tipo=a.tipo;j.querySelectorAll('[data-t]').forEach(b=>b.onclick=()=>{tipo=b.dataset.t;j.querySelectorAll('[data-t]').forEach(x=>x.classList.toggle('sel',x===b))});
    if(!n)j.querySelector('#jX').onclick=()=>{fechar();confirmarExcluir('Excluir este ajuste?',()=>{apagarReg('ajustes',a.id);render()})};
    j.querySelector('#jO').onclick=()=>{const v=r2(numBR(j.querySelector('#jV').value)),d=j.querySelector('#jS').value.trim();if(!(v>0)){toast('Informe o valor');return}if(!d){toast('Informe a descrição');return}
      salvarReg('ajustes',{...a,id:a.id||'aj-'+uid(),clienteId:c.id,cliente:c.nome,tipo,data:j.querySelector('#jD').value||chaveDia(),valor:v,desc:d,vendedor:a.vendedor||quem()},n);fechar();render();toast('Ajuste salvo')}})}

/* =====================================================================
   COBRANÇA (inadimplência por faixa de atraso)
   ===================================================================== */
const gb={faixa:''};
function carteira(){const out=[];ativos(cad.clientes).concat(cad.clientes.filter(c=>c.inativo)).forEach(c=>{const p=posicao(c.id);p.abertos.forEach(t=>out.push({c,t}))});return out}
RENDER.gcob=()=>{
  const cart=carteira(),tol=Number(cad.params.tolerancia||0),fx={'A vencer':0};FAIXAS.forEach(f=>fx[f[2]]=0);
  cart.forEach(({t})=>{const k=t.atraso>0?t.faixa:'A vencer';fx[k]=r2((fx[k]||0)+t.aberto)});
  const tot=r2(Object.values(fx).reduce((s,v)=>s+v,0)),venc=r2(tot-fx['A vencer']);
  const l=cart.filter(({t})=>gb.faixa?(gb.faixa==='A vencer'?t.atraso<=0:t.faixa===gb.faixa):t.atraso>tol);
  const porCli={};l.forEach(x=>{(porCli[x.c.id]=porCli[x.c.id]||{c:x.c,l:[],v:0}).l.push(x.t);porCli[x.c.id].v=r2(porCli[x.c.id].v+x.t.aberto)});
  const grupos=Object.values(porCli).sort((a,b)=>b.v-a.v);
  let h=`<section class="panel"><h2>Carteira por faixa de atraso</h2><div class="aging">${Object.entries(fx).map(([k,v])=>`<button data-a="fx" data-v="${esc(k)}" class="${gb.faixa===k?'sel':''}"><small>${esc(k)}</small><b class="${k!=='A vencer'&&v>0?'neg':''}">${fmtR(v).replace('R$ ','')}</b></button>`).join('')}</div>
    <div class="kv"><div><span>Total a receber</span><b>${fmtR(tot)}</b></div><div class="forte"><span>Total vencido</span><b class="neg">${fmtR(venc)}</b></div></div></section>
    <section class="panel"><h2>${gb.faixa?esc(gb.faixa):'Títulos vencidos'} — ${grupos.length} cliente(s)</h2>${botoesExp()}`;
  h+=grupos.map(g=>`<div class="item"><div class="itemTopo"><div><b>${esc(g.c.nome)}</b><small>${esc(g.c.tel||'sem telefone')}</small></div><b class="neg">${fmtR(g.v)}</b></div>
    <table class="tabela">${g.l.map(t=>`<tr><td>${t.tipo==='VENDA'?esc(numCurto(t.rec)):'Ajuste'}<br><small>emissão ${fmtData(t.data)}</small></td><td>venc. ${fmtData(t.venc)}<br>${sitTag(t)}</td><td class="r">${fmtR(t.aberto)}</td></tr>`).join('')}</table>
    <div class="row"><button class="mini" data-a="ext" data-v="${g.c.id}">Extrato</button><button class="mini verde" data-a="cobrar" data-v="${g.c.id}">🖼 Foto</button></div></div>`).join('')||'<div class="vazio">Nenhum título nesta faixa. 👍</div>';
  h+=`</section>`;$('t-gcob').innerHTML=h;
};
function textoCobranca(c){const P=cad.params,p=posicao(c.id);const L=[`*${P.empresa}* — Lembrete de pagamento`,`_${P.unidade}_`,'',`Olá, *${c.nome}*! Consta em aberto:`];
  p.abertos.forEach(t=>L.push(`• ${t.tipo==='VENDA'?numVenda(t.rec):'Ajuste'} — venc. ${fmtData(t.venc)} — ${fmtR(t.aberto)}${t.atraso>0?` (${t.atraso} dias de atraso)`:''}`));
  L.push('',`Total vencido: *${fmtR(p.vencido)}*`,`Total em aberto: *${fmtR(p.aberto)}*`,'','Qualquer dúvida estamos à disposição.',P.empresa);if(P.contato)L.push(P.contato);return L.join('\n')}
ACOES.gcob={fx(v){gb.faixa=gb.faixa===v?'':v;render()},ext(id){extrCli=id;ir('extr')},cobrar(id){const c=cliPorId(id),p=posicao(c.id);exportarRel({titulo:'Lembrete de pagamento',sub:[c.nome,'Posição em '+fmtData(chaveDia())],xlsNome:'Cobrança',blocos:[{tit:'Títulos em aberto',cols:[{t:'Título',w:16},{t:'Emissão',w:12},{t:'Vencimento',w:12},{t:'Aberto',w:14,al:'r'},{t:'Atraso',w:12,al:'r'}],linhas:p.abertos.map(t=>[t.tipo==='VENDA'?numCurto(t.rec):'Ajuste',fmtData(t.data),fmtData(t.venc),fmtR(t.aberto),t.atraso>0?t.atraso+' dias':'a vencer']),cores:p.abertos.map(t=>t.atraso>0?[null,null,'#b3261e',null,'#b3261e']:null),total:['TOTAL','','',fmtR(p.aberto),'']},{kv:[['Total vencido',fmtR(p.vencido),p.vencido>0?'#b3261e':null,true],['Total em aberto',fmtR(p.aberto),null,true]]}]},'img','Cobranca '+c.nome)},
  exp(t){const cart=carteira().filter(({t})=>gb.faixa?(gb.faixa==='A vencer'?t.atraso<=0:t.faixa===gb.faixa):t.atraso>Number(cad.params.tolerancia||0)).sort((a,b)=>ordTxt(a.c.nome,b.c.nome)||a.t.venc.localeCompare(b.t.venc));
    const tot=r2(cart.reduce((s,x)=>s+x.t.aberto,0));
    exportarRel({titulo:'Relação de cobrança',sub:[gb.faixa||'Títulos vencidos','Posição em '+fmtData(chaveDia())],xlsNome:'Cobrança',blocos:[
      {cols:[{t:'Cliente',w:26},{t:'Telefone',w:14},{t:'Título',w:10},{t:'Emissão',w:11},{t:'Vencimento',w:11},{t:'Aberto',w:13,al:'r'},{t:'Atraso',w:9,al:'r'}],linhas:cart.map(({c,t})=>[c.nome,c.tel||'',t.tipo==='VENDA'?(t.rec.num?String(t.rec.num).padStart(4,'0'):'—'):'Ajuste',fmtData(t.data),fmtData(t.venc),fmtR(t.aberto),t.atraso>0?t.atraso+' d':'—']),total:['TOTAL','','','','',fmtR(tot),'']}]},t,'Cobranca '+fmtData(chaveDia()).replace(/\//g,'-'))}};

/* =====================================================================
   FECHAMENTO DA DESPESCA (vendas × produção × custos)
   ===================================================================== */
const gf={desp:''};
ENTRAR.gfech=()=>{gf.desp=despPadrao()};
function classificarQuebra(dif,base){if(!base)return['SEM DADOS','at'];const p=dif/base*100;
  if(p<-0.5)return['VENDIDO MAIOR — conferir bags não lançados','at'];if(p<0.5)return['EQUILIBRADO','ok'];if(p<=3)return['QUEBRA NORMAL','ok'];if(p<=6)return['QUEBRA ELEVADA — atenção','at'];return['QUEBRA CRÍTICA — investigar','ruim']}
function apurar(did){
  const d=despPorId(did),vs=db.vendas.filter(v=>v.despescaId===did),bags=db.bags.filter(b=>b.despescaId===did),doa=db.doacoes.filter(x=>x.despescaId===did),cus=db.custos.filter(x=>x.despescaId===did);
  const kg=r3(vs.reduce((s,v)=>s+pesoVenda(v),0)),fat=r2(vs.reduce((s,v)=>s+valorVenda(v),0)),pm=kg?r2(fat/kg):0;
  const prod=resumoBags(bags),doado=r3(doa.reduce((s,x)=>s+Number(x.peso||0),0)),dif=r3(prod.kg-kg-doado),base=prod.kg||kg;
  const custo=r2(cus.reduce((s,x)=>s+Number(x.valor||0),0)),baseC=Number(d&&d.pesoCusto)||kg||prod.kg,margem=r2(fat-custo);
  let aberto=0;const tits={};vs.forEach(v=>{if(!tits[v.clienteId])tits[v.clienteId]=titulos(v.clienteId);const t=tits[v.clienteId].find(x=>x.ref===v.id);if(t)aberto=r2(aberto+t.aberto)});
  return{d,vs,bags,doa,cus,kg,fat,pm,prod,doado,dif,pct:base?r2(dif/base*100):0,valDif:r2(dif*pm),quebra:classificarQuebra(dif,base),custo,custoKg:baseC?r2(custo/baseC):0,margem,margemKg:baseC?r2(margem/baseC):0,aberto,recebido:r2(fat-aberto),
    porClasse:agrupaItens(vs,(v,i)=>i.produto+' — '+i.classe),porCli:agrupaItens(vs,v=>v.cliente),
    porTanque:Object.values(bags.reduce((o,b)=>{const k=b.tanque+' · '+b.produto;(o[k]=o[k]||{k,l:[]}).l.push(b);return o},{})).map(g=>({k:g.k,...resumoBags(g.l)})).sort((a,b)=>b.kg-a.kg),
    porCat:Object.values(cus.reduce((o,c)=>{(o[c.categoria]=o[c.categoria]||{k:c.categoria,v:0}).v=r2(o[c.categoria].v+Number(c.valor||0));return o},{})).sort((a,b)=>b.v-a.v)};
}
RENDER.gfech=()=>{
  if(!cad.despescas.length){$('t-gfech').innerHTML='<section class="panel"><div class="vazio">Nenhuma despesca ainda. Ela é criada sozinha no primeiro lançamento da semana.</div></section>';return}
  if(!despPorId(gf.desp))gf.desp=despPadrao();
  const a=apurar(gf.desp),d=a.d;
  let h=`<section class="panel"><h2>Despesca</h2>${despSelHtml(gf.desp,false)}<div class="row" style="align-items:center"><span>${d.encerrada?`<span class="estado fechada">ENCERRADA</span> <small class="note">${d.encerradaEm?fmtDH(d.encerradaEm):''}</small>`:'<span class="estado aberta">ABERTA</span>'}</span>
    ${d.encerrada?'<button class="mini" data-a="reabrir">🔓 Reabrir</button>':'<button class="mini danger" data-a="encerrar">🔒 Encerrar despesca</button>'}</div>
    <div class="compart"><button class="verde" data-a="exp" data-v="img">🖼 Foto</button><button class="verde" data-a="exp" data-v="pdf">📄 PDF</button><button class="verde" data-a="exp" data-v="xls">📊 Excel</button></div></section>
    <section class="panel"><h2>Vendas</h2><div class="stat"><div><small>Kg vendidos</small><b class="num">${fmtKg(a.kg)}</b></div><div><small>Faturamento</small><b class="num">${fmtR(a.fat).replace('R$ ','')}</b></div><div><small>R$/kg médio</small><b class="num">${fmtN2(a.pm)}</b></div></div>
    <div class="kv"><div><span>Vendas / clientes</span><b>${a.vs.length} / ${a.porCli.length}</b></div><div><span>Já recebido</span><b class="pos">${fmtR(a.recebido)}</b></div><div><span>A receber</span><b class="${a.aberto>0?'neg':''}">${fmtR(a.aberto)}</b></div></div>
    ${tabHtml(['Classificação','Kg','R$','R$/kg'],a.porClasse.map(g=>[g.k,fmtKg(g.kg),fmtR(g.r),fmtN2(g.kg?g.r/g.kg:0)]))}
    ${tabHtml(['Cliente','Kg','R$'],a.porCli.map(g=>[g.k,fmtKg(g.kg),fmtR(g.r)]))}</section>
    <section class="panel"><h2>Produção × vendas (quebra)</h2><div class="kv"><div><span>Despescado (bags)</span><b>${fmtKg(a.prod.kg)} kg · ${a.prod.n} bags</b></div>${a.prod.q?`<div><span>Peixes · peso médio</span><b>${fmtI(a.prod.q)} · ${fmtKg(a.prod.med)} kg</b></div>`:''}<div><span>Vendido</span><b>${fmtKg(a.kg)} kg</b></div><div><span>Doado</span><b>${fmtKg(a.doado)} kg</b></div>
      <div class="forte"><span>Diferença</span><b class="${a.dif>0?'neg':''}">${fmtKg(a.dif)} kg · ${fmtP(a.pct)}</b></div><div><span>Valor da diferença</span><b>${fmtR(a.valDif)}</b></div></div>
      <div class="quebra ${a.quebra[1]}">${esc(a.quebra[0])}</div>
      ${a.porTanque.length?tabHtml(['Tanque · peixe','Bags','Kg'],a.porTanque.map(g=>[g.k,String(g.n),fmtKg(g.kg)])):''}</section>
    <section class="panel"><h2>Custos e margem</h2><div class="kv"><div><span>Custo total</span><b>${fmtR(a.custo)}</b></div><div><span>Custo por kg vendido</span><b>${fmtR(a.custoKg)}</b></div><div class="forte"><span>Margem bruta</span><b class="${a.margem<0?'neg':'pos'}">${fmtR(a.margem)}</b></div><div><span>Margem por kg</span><b>${fmtR(a.margemKg)}</b></div></div>
      ${a.porCat.length?tabHtml(['Categoria','R$'],a.porCat.map(g=>[g.k,fmtR(g.v)])):'<p class="note">Nenhum custo lançado nesta despesca (Gestão → Custos).</p>'}</section>`;
  const comp=despescasOrd().map(x=>({x,a:apurar(x.id)})).filter(y=>y.a.kg||y.a.prod.kg).slice(0,12);
  if(comp.length>1)h+=`<section class="panel"><h2>Comparativo entre despescas</h2>${tabHtml(['Despesca','Kg','R$/kg','Quebra','Custo/kg'],comp.map(({x,a})=>[x.descricao.replace(/^(\S+) (\d{4}) \| /,'').replace(/ \((\d\d\/\d\d) a .*\)/,' ($1)'),fmtKg(a.kg),fmtN2(a.pm),a.prod.kg?fmtP(a.pct):'—',a.custo?fmtN2(a.custoKg):'—']))}</section>`;
  $('t-gfech').innerHTML=h;
};
function tabHtml(cab,linhas){if(!linhas.length)return'';return `<div class="tabWrap"><table class="tabela"><tr>${cab.map((c,i)=>`<th class="${i?'r':''}">${esc(c)}</th>`).join('')}</tr>${linhas.map(l=>`<tr>${l.map((c,i)=>`<td class="${i?'r':''}">${esc(c)}</td>`).join('')}</tr>`).join('')}</table></div>`}
function relFech(a){const d=a.d;return{titulo:'Fechamento da despesca',sub:[d.descricao,d.encerrada?'Despesca encerrada':'Despesca aberta (parcial)'],xlsNome:'Fechamento',blocos:[
  {tit:'Resumo executivo',kv:[['Peso vendido',fmtKg(a.kg)+' kg'],['Faturamento',fmtR(a.fat),null,true],['Preço médio ponderado',fmtR(a.pm)+'/kg'],['Vendas / clientes',`${a.vs.length} / ${a.porCli.length}`],['Já recebido',fmtR(a.recebido)],['A receber',fmtR(a.aberto),a.aberto>0?'#b3261e':null]]},
  {tit:'Vendas por classificação',cols:[{t:'Peixe / classificação',w:40},{t:'Kg',w:14,al:'r'},{t:'Valor',w:16,al:'r'},{t:'R$/kg',w:12,al:'r'}],linhas:a.porClasse.map(g=>[g.k,fmtKg(g.kg),fmtR(g.r),fmtR(g.kg?g.r/g.kg:0)]),total:['TOTAL',fmtKg(a.kg),fmtR(a.fat),fmtR(a.pm)]},
  {tit:'Vendas por cliente',cols:[{t:'Cliente',w:44},{t:'Kg',w:14,al:'r'},{t:'Valor',w:16,al:'r'}],linhas:a.porCli.map(g=>[g.k,fmtKg(g.kg),fmtR(g.r)]),total:['TOTAL',fmtKg(a.kg),fmtR(a.fat)]},
  {tit:'Produção × vendas',kv:[['Despescado na fazenda',`${fmtKg(a.prod.kg)} kg (${a.prod.n} bags)`],['Vendido',fmtKg(a.kg)+' kg'],['Doado',fmtKg(a.doado)+' kg'],['Diferença',`${fmtKg(a.dif)} kg (${fmtP(a.pct)})`,a.dif>0?'#b3261e':null,true],['Valor da diferença',fmtR(a.valDif)],['Leitura',a.quebra[0]]]},
  {tit:'Produção por tanque',cols:[{t:'Tanque · peixe',w:40},{t:'Bags',w:10,al:'r'},{t:'Kg',w:14,al:'r'},{t:'Peixes',w:12,al:'r'}],linhas:a.porTanque.map(g=>[g.k,String(g.n),fmtKg(g.kg),g.q?fmtI(g.q):'']),total:['TOTAL',String(a.prod.n),fmtKg(a.prod.kg),a.prod.q?fmtI(a.prod.q):'']},
  {tit:'Custos e margem',cols:[{t:'Categoria',w:50},{t:'Valor',w:18,al:'r'}],linhas:a.porCat.map(g=>[g.k,fmtR(g.v)]),total:['CUSTO TOTAL',fmtR(a.custo)]},
  {kv:[['Custo por kg vendido',fmtR(a.custoKg)],['Margem bruta',fmtR(a.margem),a.margem<0?'#b3261e':'#1f8f4e',true],['Margem por kg',fmtR(a.margemKg)]]}]}}
function textoFech(a){const P=cad.params;return [`*${P.empresa} — ${P.unidade}*`,`*Fechamento: ${a.d.descricao}*`,'',`Vendido: *${fmtKg(a.kg)} kg*`,`Faturamento: *${fmtR(a.fat)}*`,`Preço médio: ${fmtR(a.pm)}/kg`,`Vendas: ${a.vs.length} · clientes: ${a.porCli.length}`,`Recebido: ${fmtR(a.recebido)} · a receber: ${fmtR(a.aberto)}`,'',
  ...a.porClasse.map(g=>`• ${g.k}: ${fmtKg(g.kg)} kg — ${fmtR(g.r)}`),'',`Despescado: ${fmtKg(a.prod.kg)} kg (${a.prod.n} bags)`,`Doado: ${fmtKg(a.doado)} kg`,`Diferença: ${fmtKg(a.dif)} kg (${fmtP(a.pct)}) — ${a.quebra[0]}`,'',`Custo total: ${fmtR(a.custo)} (${fmtR(a.custoKg)}/kg)`,`*Margem bruta: ${fmtR(a.margem)}*`].join('\n')}
CAMPOS.gfech=(f,el)=>{if(f==='desp'){gf.desp=el.value;render()}};
ACOES.gfech={
  encerrar(){const d=despPorId(gf.desp);perguntar(`Encerrar ${d.descricao}?`,'Encerrar','var(--bad)',()=>{d.encerrada=true;d.encerradaEm=agora();d.encerradaPor=quem();toque(d);salvarCad('Despesca encerrada');render()},'Depois de encerrada não aceita novos lançamentos nem alterações; só reabrindo.')},
  reabrir(){pedirSenhaTec('Senha da Gestão para reabrir','gest').then(ok=>{if(!ok)return;const d=despPorId(gf.desp);d.encerrada=false;toque(d);salvarCad('Despesca reaberta');render()})},
  wa(){compartilharTexto(textoFech(apurar(gf.desp)))},
  exp(t){const a=apurar(gf.desp);exportarRel(relFech(a),t,'Fechamento '+a.d.descricao.replace(/\//g,'-'))}};

/* =====================================================================
   CUSTOS DA DESPESCA
   ===================================================================== */
const gk={desp:'',f:null};
const custoNovo=()=>({data:chaveDia(),cat:'',valor:'',desc:'',pago:'fazenda',quem:'',nd:'1',np:'1',vd:''});
ENTRAR.gcust=()=>{gk.aberto=false;gk.desp=despescaDaData(chaveDia(),false)?.id||despPadrao()||'';gk.f=custoNovo()};
const pagoPorTxt=c=>c.pago==='emmaos'?'Dinheiro em mãos'+(c.quem?' ('+c.quem+')':''):c.pago==='reembolsar'?'Reembolsar '+(c.quem||''):'Fazenda';
const ehDiaria=cat=>/di[aá]ria/i.test(cat||'');
RENDER.gcust=()=>{
  const f=gk.f,cats=ativos(cad.categorias),l=db.custos.filter(c=>c.despescaId===gk.desp).sort((a,b)=>b.data.localeCompare(a.data));
  const tot=r2(l.reduce((s,c)=>s+Number(c.valor||0),0)),reemb={};l.filter(c=>c.pago==='reembolsar').forEach(c=>reemb[c.quem||'—']=r2((reemb[c.quem||'—']||0)+Number(c.valor)));
  const nomes=[...new Set(db.custos.map(c=>c.quem).filter(Boolean).concat(ativos(cad.vendedores).map(v=>v.nome)))];
  let h=`<section class="panel"><h2>Despesca</h2>${cad.despescas.length?despSelHtml(gk.desp,false):'<p class="note">A despesca da semana é criada ao gravar a primeira despesa.</p>'}</section>
   ${gk.aberto?`<section class="panel"><div class="curhead"><h2>${gk.f.editId?'Editar':'Nova'} despesa</h2><button class="mini" data-a="fechaForm">✖ Cancelar</button></div>${dataHtml('data',f.data)}
    <div><label>Categoria</label><div class="combo"><input type="text" id="cuCat" data-f="catTxt" value="${esc(f.catTxt!=null?f.catTxt:f.cat)}" autocomplete="off" autocapitalize="characters"><button type="button" class="comboSeta" data-a="catAbre" aria-label="Abrir lista">▾</button><div class="comboLista" id="cuLista" hidden></div></div></div>
    ${ehDiaria(f.cat)?`<div class="datas" style="grid-template-columns:1fr 1fr 1fr"><div><label>Diárias</label><input type="text" inputmode="decimal" data-f="nd" value="${esc(f.nd)}"></div><div><label>Pessoas</label><input type="number" inputmode="numeric" data-f="np" value="${esc(f.np)}"></div><div><label>R$ diária</label><input type="text" inputmode="decimal" data-f="vd" value="${esc(f.vd)}"></div></div><div class="resumoSel" id="cuTot">Total: ${fmtR(r2((numBR(f.nd)||0)*(parseInt(f.np)||0)*(numBR(f.vd)||0)))}</div>`
      :`<div><label>Valor (R$)</label><input type="text" class="big" inputmode="decimal" data-f="valor" value="${esc(f.valor)}" placeholder="0,00"></div>`}
    <div><label>Descrição</label><input type="text" data-f="desc" value="${esc(f.desc)}"></div>
    <label>Quem pagou</label><div class="tipoMov">${[['fazenda','Fazenda'],['emmaos','Dinheiro em mãos'],['reembolsar','Terceiro (reembolsar)']].map(([k,t])=>`<button data-a="pago" data-v="${k}" class="${f.pago===k?'sel':''}">${t}</button>`).join('')}</div>
    ${f.pago!=='fazenda'?`<div><label>${f.pago==='emmaos'?'Vendedor que pagou (abate no acerto)':'Quem pagou (a reembolsar)'}</label><input type="text" data-f="quem" list="cuNomes" value="${esc(f.quem)}"><datalist id="cuNomes">${nomes.map(n=>`<option value="${esc(n)}">`).join('')}</datalist></div>`:''}
    <button class="verde" data-a="gravar">✔ GRAVAR DESPESA</button></section>`:''}
   <section class="panel">${titNovo('Despesas da despesca','novoForm')}<div class="stat"><div><small>Lançamentos</small><b class="num">${l.length}</b></div><div><small>Custo total</small><b class="num">${fmtR(tot).replace('R$ ','')}</b></div></div>
    ${Object.keys(reemb).length?`<div class="kv">${Object.entries(reemb).map(([k,v])=>`<div><span>A reembolsar — ${esc(k)}</span><b class="neg">${fmtR(v)}</b></div>`).join('')}</div>`:''}
    ${l.map(c=>`<button class="reg" data-a="ed" data-v="${c.id}"><div><span class="eqn">${esc(c.categoria)}</span><div class="faz">${fmtData(c.data)} · ${esc(pagoPorTxt(c))}</div>${c.desc?`<div class="obs">${esc(c.desc)}</div>`:''}</div><div class="lt">${fmtR(c.valor)}</div></button>`).join('')||'<div class="vazio">Nenhuma despesa lançada.</div>'}</section>`;
  $('t-gcust').innerHTML=h;
};
/* categoria: toca e escolhe na lista, ou digita e vão aparecendo as que têm o nome parecido */
function catLista(abrir){const el=$('cuLista'),inp=$('cuCat');if(!el||!inp)return;const q=semAcento(inp.value.trim()),cats=ativos(cad.categorias).map(c=>c.nome).sort(ordTxt);
  const l=abrir||!q?cats:cats.filter(n=>semAcento(n).includes(q));
  el.innerHTML=l.map(n=>`<button type="button" data-a="catEsc" data-v="${esc(n)}" class="${n===gk.f.cat?'sel':''}">${esc(n)}</button>`).join('')||'<div class="note" style="padding:10px">Nenhuma categoria com esse nome.</div>';el.hidden=false}
document.addEventListener('click',e=>{const l=$('cuLista');if(l&&!l.hidden&&!e.target.closest('.combo'))l.hidden=true});
document.addEventListener('focusin',e=>{if(e.target.id==='cuCat')catLista(true)});
CAMPOS.gcust=(f,el,ev)=>{const F=gk.f;if(f==='desp'){gk.desp=el.value;render();return}
  if(f==='catTxt'){if(ev!=='input')return;F.catTxt=el.value;const m=ativos(cad.categorias).find(c=>semAcento(c.nome)===semAcento(el.value.trim()));const antes=F.cat;F.cat=m?m.nome:'';if(ehDiaria(antes)!==ehDiaria(F.cat)){render();const i=$('cuCat');if(i){i.focus();i.setSelectionRange(i.value.length,i.value.length)}}catLista(false);return}if(f==='data'){if(ev==='change'&&el.value){F.data=el.value;render()}return}
  F[f]=el.value;if(['nd','np','vd'].includes(f)&&$('cuTot'))$('cuTot').textContent='Total: '+fmtR(r2((numBR(F.nd)||0)*(parseInt(F.np)||0)*(numBR(F.vd)||0)))};
ACOES.gcust={cat(v){gk.f.cat=v;gk.f.catTxt=null;render()},catEsc(v){gk.f.cat=v;gk.f.catTxt=null;render()},catAbre(){const l=$('cuLista');if(l&&!l.hidden){l.hidden=true;return}catLista(true)},pago(v){gk.f.pago=v;if(v==='emmaos'&&!gk.f.quem)gk.f.quem=quem();render()},
  gravar(){const F=gk.f;if(!F.cat){toast('Escolha a categoria na lista');return}
    const di=ehDiaria(F.cat),v=di?r2((numBR(F.nd)||0)*(parseInt(F.np)||0)*(numBR(F.vd)||0)):r2(numBR(F.valor));if(!(v>0)){toast('Informe o valor');return}
    if(F.pago!=='fazenda'&&!F.quem.trim()){toast('Informe quem pagou');return}
    let d=despPorId(gk.desp);if(!d||F.data<d.ini||F.data>d.fim){d=despescaDaData(F.data,true);gk.desp=d.id}
    if(d.encerrada){toast('Despesca encerrada — reabra no Fechamento');return}
    salvarReg('custos',{id:'cu-'+uid(),despescaId:d.id,data:F.data,categoria:F.cat,valor:v,desc:F.desc.trim()||(di?`${F.nd} diária(s) × ${F.np} pessoa(s) × ${fmtR(numBR(F.vd))}`:''),pago:F.pago,quem:F.pago==='fazenda'?'':F.quem.trim(),...(di?{diarias:numBR(F.nd),pessoas:parseInt(F.np),valorDiaria:numBR(F.vd)}:{})},true);
    gk.f={...custoNovo(),data:F.data,pago:F.pago,quem:F.quem};gk.aberto=false;render();toast('Despesa gravada')},
  novoForm(){gk.aberto=true;gk.f={...custoNovo(),data:gk.f.data||chaveDia()};render();window.scrollTo(0,0)},fechaForm(){gk.aberto=false;render()},
  ed(id){const c=db.custos.find(x=>x.id===id);if(!c)return;if((despPorId(c.despescaId)||{}).encerrada){toast('Despesca encerrada');return}
    janela(`<h3>✏️ ${esc(c.categoria)}</h3><div class="datas"><div><label>Data</label><input type="date" id="jD" value="${c.data}"></div><div><label>Valor</label><input type="text" id="jV" inputmode="decimal" value="${txtBR(c.valor)}"></div></div>
      <div><label>Categoria</label><select id="jC">${ativos(cad.categorias).slice().sort((a,b)=>ordTxt(a.nome,b.nome)).map(x=>`<option ${x.nome===c.categoria?'selected':''}>${esc(x.nome)}</option>`).join('')}</select></div>
      <div><label>Descrição</label><input type="text" id="jS" value="${esc(c.desc||'')}"></div><p class="note">Pago por: ${esc(pagoPorTxt(c))}</p>
      <div class="row"><button class="danger" id="jX">🗑 Excluir</button><button class="primary" id="jO">Salvar</button></div>`,(j,fechar)=>{
      j.querySelector('#jX').onclick=()=>{fechar();confirmarExcluir(`Excluir custo de ${fmtR(c.valor)}?`,()=>{apagarReg('custos',c.id);render()})};
      j.querySelector('#jO').onclick=()=>{const v=r2(numBR(j.querySelector('#jV').value));if(!(v>0)){toast('Valor inválido');return}salvarReg('custos',{...c,data:j.querySelector('#jD').value||c.data,valor:v,categoria:j.querySelector('#jC').value,desc:j.querySelector('#jS').value.trim()},false);fechar();render()}})}};

/* =====================================================================
   ACERTO COM A FAZENDA (prestação de contas do vendedor)
   em mãos = residual anterior + recebido − repassado − despesas pagas em mãos
   ===================================================================== */
const ga={per:'mes',de:'',ate:'',vend:'',f:null};
const repNovo=()=>({data:chaveDia(),valor:'',forma:'PIX',doc:'',recPor:'',obs:''});
ENTRAR.gacer=()=>{ga.aberto=false;aplicaPer(ga,'mes');ga.f=repNovo()};
function acerto(){
  const dV=x=>!ga.vend||x===ga.vend,ant=k=>ga.de&&k<ga.de,per=k=>noPer(ga,k);
  const soma=(l,f)=>r2(l.filter(f).reduce((s,x)=>s+Number(x.valor||0),0));
  const rec=db.receb.filter(r=>dV(r.vendedor)),rep=db.repasses.filter(r=>dV(r.vendedor)),mao=db.custos.filter(c=>c.pago==='emmaos'&&dV(c.quem));
  const residual=ga.de?r2(soma(rec,r=>ant(r.data))-soma(rep,r=>ant(r.data))-soma(mao,c=>ant(c.data))):0;
  const recebido=soma(rec,r=>per(r.data)),repassado=soma(rep,r=>per(r.data)),emMaosDesp=soma(mao,c=>per(c.data));
  const vendas=r2(db.vendas.filter(v=>dV(v.vendedor)&&per(v.data)).reduce((s,v)=>s+valorVenda(v),0));
  const desc=soma(db.ajustes.filter(a=>a.tipo==='C'),a=>per(a.data));
  let aRec=0,venc=0;cad.clientes.forEach(c=>{const p=posicao(c.id);aRec=r2(aRec+p.aberto);venc=r2(venc+p.vencido)});
  return{residual,recebido,repassado,emMaosDesp,emMaos:r2(residual+recebido-repassado-emMaosDesp),vendas,desc,aRec,venc,
    lRep:rep.filter(r=>per(r.data)).sort((a,b)=>b.data.localeCompare(a.data)),lRec:rec.filter(r=>per(r.data)).sort((a,b)=>b.data.localeCompare(a.data)),lMao:mao.filter(c=>per(c.data))}
}
RENDER.gacer=()=>{
  const a=acerto(),f=ga.f,vs=[...new Set(ativos(cad.vendedores).map(v=>v.nome).concat(db.receb.map(r=>r.vendedor),db.repasses.map(r=>r.vendedor)).filter(Boolean))].sort(ordTxt);
  let h=`<section class="panel"><h2>Período e vendedor</h2>${perHtml(ga)}<div class="chips"><button data-a="vend" data-v="" class="${!ga.vend?'sel':''}">Todos</button>${vs.map(v=>`<button data-a="vend" data-v="${esc(v)}" class="${ga.vend===v?'sel':''}">${esc(v)}</button>`).join('')}</div></section>
   <section class="panel"><h2>Prestação de contas</h2><div class="kv">${ga.de?`<div><span>Residual anterior</span><b>${fmtR(a.residual)}</b></div>`:''}<div><span>+ Recebido dos clientes</span><b class="pos">${fmtR(a.recebido)}</b></div><div><span>− Repassado à fazenda</span><b>${fmtR(a.repassado)}</b></div><div><span>− Despesas pagas com o dinheiro em mãos</span><b>${fmtR(a.emMaosDesp)}</b></div>
    <div class="forte"><span>= Valor em mãos</span><b class="${a.emMaos<0?'neg':''}">${fmtR(a.emMaos)}</b></div></div>
    <div class="kv"><div><span>Vendas no período</span><b>${fmtR(a.vendas)}</b></div><div><span>Descontos concedidos</span><b>${fmtR(a.desc)}</b></div><div><span>A receber dos clientes (hoje)</span><b>${fmtR(a.aRec)}</b></div><div><span>Vencido</span><b class="neg">${fmtR(a.venc)}</b></div></div>
    <div class="compart"><button class="verde" data-a="exp" data-v="img">🖼 Foto</button><button class="verde" data-a="exp" data-v="pdf">📄 PDF</button><button class="verde" data-a="exp" data-v="xls">📊 Excel</button></div></section>
   ${ga.aberto?`<section class="panel"><div class="curhead"><h2>Novo repasse à fazenda</h2><button class="mini" data-a="fechaForm">✖ Cancelar</button></div>${dataHtml('data',f.data)}<div><label>Valor (R$)</label><input type="text" class="big" inputmode="decimal" data-f="valor" value="${esc(f.valor)}" placeholder="0,00"></div>
    <div class="chips">${['PIX','DINHEIRO','TRANSFERÊNCIA','DEPÓSITO'].map(x=>`<button data-a="forma" data-v="${x}" class="${f.forma===x?'sel':''}">${x}</button>`).join('')}</div>
    <div class="datas"><div><label>Comprovante</label><input type="text" data-f="doc" value="${esc(f.doc)}"></div><div><label>Recebido por</label><input type="text" data-f="recPor" value="${esc(f.recPor)}"></div></div>
    <div><label>Observação</label><input type="text" data-f="obs" value="${esc(f.obs)}"></div><p class="note">Vendedor: <b>${esc(ga.vend||quem()||'—')}</b></p>
    <button class="verde" data-a="gravar">✔ GRAVAR REPASSE</button></section>`:''}
   <section class="panel">${titNovo('Repasses no período','novoForm')}${a.lRep.map(r=>`<button class="reg" data-a="ed" data-v="${r.id}"><div><span class="eqn">${fmtData(r.data)} · ${esc(r.forma||'')}</span><div class="faz">${esc(r.vendedor||'')}${r.recPor?' → '+esc(r.recPor):''}${r.doc?' · '+esc(r.doc):''}</div></div><div class="lt">${fmtR(r.valor)}</div></button>`).join('')||'<div class="vazio">Nenhum repasse no período.</div>'}</section>`;
  $('t-gacer').innerHTML=h;
};
function relAcerto(a){return{titulo:'Acerto com a fazenda',sub:[descPer(ga),'Vendedor: '+(ga.vend||'todos')],xlsNome:'Acerto',blocos:[
  {tit:'Prestação de contas',kv:[...(ga.de?[['Residual anterior',fmtR(a.residual)]]:[]),['+ Recebido dos clientes',fmtR(a.recebido)],['− Repassado à fazenda',fmtR(a.repassado)],['− Despesas pagas em mãos',fmtR(a.emMaosDesp)],['= VALOR EM MÃOS',fmtR(a.emMaos),a.emMaos<0?'#b3261e':null,true]]},
  {kv:[['Vendas no período',fmtR(a.vendas)],['Descontos concedidos',fmtR(a.desc)],['A receber dos clientes',fmtR(a.aRec)],['Vencido',fmtR(a.venc)]]},
  {tit:'Recebimentos',cols:[{t:'Data',w:11},{t:'Cliente',w:34},{t:'Forma',w:14},{t:'Vendedor',w:16},{t:'Valor',w:14,al:'r'}],linhas:a.lRec.slice().reverse().map(r=>[fmtData(r.data),r.cliente,r.forma||'',r.vendedor||'',fmtR(r.valor)]),total:['TOTAL','','','',fmtR(a.recebido)]},
  {tit:'Repasses',cols:[{t:'Data',w:11},{t:'Forma',w:14},{t:'Comprovante',w:18},{t:'Recebido por',w:18},{t:'Valor',w:14,al:'r'}],linhas:a.lRep.slice().reverse().map(r=>[fmtData(r.data),r.forma||'',r.doc||'',r.recPor||'',fmtR(r.valor)]),total:['TOTAL','','','',fmtR(a.repassado)]},
  {tit:'Despesas pagas com o dinheiro em mãos',cols:[{t:'Data',w:11},{t:'Categoria',w:24},{t:'Descrição',w:30},{t:'Valor',w:14,al:'r'}],linhas:a.lMao.map(c=>[fmtData(c.data),c.categoria,c.desc||'',fmtR(c.valor)]),total:['TOTAL','','',fmtR(a.emMaosDesp)]},
  {txt:'\n\n_______________________________________          _______________________________________\n           Vendedor                                                                   Fazenda'}]}}
CAMPOS.gacer=(f,el,ev)=>{if(f==='de'||f==='ate'){ga[f]=el.value;ga.per='';ajustaPar(ga,f);render();return}if(f==='data'){if(ev==='change'&&el.value){ga.f.data=el.value;render()}return}ga.f[f]=el.value};
ACOES.gacer={per(v){aplicaPer(ga,v);render()},vend(v){ga.vend=v;render()},forma(v){ga.f.forma=v;render()},
  wa(){const a=acerto(),P=cad.params;compartilharTexto([`*${P.empresa} — Acerto com a fazenda*`,`Período: ${descPer(ga)} · vendedor: ${ga.vend||'todos'}`,'',...(ga.de?[`Residual anterior: ${fmtR(a.residual)}`]:[]),`+ Recebido: ${fmtR(a.recebido)}`,`− Repassado: ${fmtR(a.repassado)}`,`− Despesas em mãos: ${fmtR(a.emMaosDesp)}`,`*= Em mãos: ${fmtR(a.emMaos)}*`,'',`A receber dos clientes: ${fmtR(a.aRec)} (vencido ${fmtR(a.venc)})`].join('\n'))},
  exp(t){exportarRel(relAcerto(acerto()),t,'Acerto '+descPer(ga).replace(/\//g,'-'))},
  gravar(){const F=ga.f,v=r2(numBR(F.valor));if(!(v>0)){toast('Informe o valor');return}const vd=ga.vend||quem();if(!vd){toast('Escolha o vendedor');return}
    salvarReg('repasses',{id:'rp-'+uid(),data:F.data,valor:v,forma:F.forma,doc:F.doc.trim(),recPor:F.recPor.trim(),obs:F.obs.trim(),vendedor:vd},true);ga.f=repNovo();ga.aberto=false;render();toast('Repasse gravado')},
  novoForm(){ga.aberto=true;ga.f=repNovo();render();setTimeout(()=>{const x=document.querySelector('#t-gacer [data-a=fechaForm]');if(x)x.scrollIntoView({block:'start'})},50)},fechaForm(){ga.aberto=false;render()},
  ed(id){const r=db.repasses.find(x=>x.id===id);if(!r)return;janela(`<h3>✏️ Repasse</h3><div class="datas"><div><label>Data</label><input type="date" id="jD" value="${r.data}"></div><div><label>Valor</label><input type="text" id="jV" inputmode="decimal" value="${txtBR(r.valor)}"></div></div><div><label>Comprovante</label><input type="text" id="jC" value="${esc(r.doc||'')}"></div>
    <div class="row"><button class="danger" id="jX">🗑 Excluir</button><button class="primary" id="jO">Salvar</button></div>`,(j,fechar)=>{
    j.querySelector('#jX').onclick=()=>{fechar();confirmarExcluir(`Excluir repasse de ${fmtR(r.valor)}?`,()=>{apagarReg('repasses',r.id);render()})};
    j.querySelector('#jO').onclick=()=>{const v=r2(numBR(j.querySelector('#jV').value));if(!(v>0)){toast('Valor inválido');return}salvarReg('repasses',{...r,data:j.querySelector('#jD').value||r.data,valor:v,doc:j.querySelector('#jC').value.trim()},false);fechar();render()}})}};

/* =====================================================================
   DOAÇÕES (saída física: não entram no faturamento, entram na quebra)
   ===================================================================== */
const gd={desp:'',f:null};
const doaNovo=()=>({data:chaveDia(),dest:'',produtoId:(ativos(cad.produtos)[0]||{}).id||'',peso:'',qtd:'',fin:'',obs:''});
ENTRAR.gdoa=()=>{gd.aberto=false;gd.desp=despescaDaData(chaveDia(),false)?.id||despPadrao()||'';gd.f=doaNovo()};
RENDER.gdoa=()=>{
  const f=gd.f,l=db.doacoes.filter(x=>x.despescaId===gd.desp).sort((a,b)=>b.data.localeCompare(a.data)),kg=r3(l.reduce((s,x)=>s+Number(x.peso||0),0));
  const dests=[...new Set(cad.clientes.filter(c=>c.doacao&&!c.inativo).map(c=>c.nome).concat(db.doacoes.map(d=>d.destinatario)))].sort(ordTxt);
  $('t-gdoa').innerHTML=`<section class="panel"><h2>Despesca</h2>${cad.despescas.length?despSelHtml(gd.desp,false):'<p class="note">Criada sozinha ao gravar.</p>'}</section>
   ${gd.aberto?`<section class="panel"><div class="curhead"><h2>Nova doação</h2><button class="mini" data-a="fechaForm">✖ Cancelar</button></div>${dataHtml('data',f.data)}<div><label>Destinatário *</label><input type="text" data-f="dest" list="doNomes" value="${esc(f.dest)}"><datalist id="doNomes">${dests.map(n=>`<option value="${esc(n)}">`).join('')}</datalist></div>
    <label>Peixe</label><div class="escolha eq">${ativos(cad.produtos).map(p=>`<button data-a="pr" data-v="${p.id}" class="${f.produtoId===p.id?'sel':''}">${esc(p.nome)}</button>`).join('')}</div>
    <div class="datas"><div><label>Peso (kg)</label><input type="text" inputmode="decimal" data-f="peso" value="${esc(f.peso)}"></div><div><label>Peixes</label><input type="number" data-f="qtd" value="${esc(f.qtd)}"></div></div>
    <div class="datas"><div><label>Finalidade</label><input type="text" data-f="fin" value="${esc(f.fin)}"></div><div><label>Observação</label><input type="text" data-f="obs" value="${esc(f.obs)}"></div></div>
    <button class="verde" data-a="gravar">✔ GRAVAR DOAÇÃO</button></section>`:''}
   <section class="panel">${titNovo('Doações da despesca','novoForm')}<div class="stat"><div><small>Doações</small><b class="num">${l.length}</b></div><div><small>Kg doados</small><b class="num">${fmtKg(kg)}</b></div></div>
    ${l.map(x=>`<button class="reg" data-a="ed" data-v="${x.id}"><div><span class="eqn">${esc(x.destinatario)}</span><div class="faz">${fmtData(x.data)} · ${esc(x.produto)}${x.fin?' · '+esc(x.fin):''}</div></div><div class="lt">${fmtKg(x.peso)}<small>kg</small></div></button>`).join('')||'<div class="vazio">Nenhuma doação.</div>'}</section>`;
};
CAMPOS.gdoa=(f,el,ev)=>{if(f==='desp'){gd.desp=el.value;render();return}if(f==='data'){if(ev==='change'&&el.value){gd.f.data=el.value;render()}return}gd.f[f]=el.value};
ACOES.gdoa={pr(v){gd.f.produtoId=v;render()},
  gravar(){const F=gd.f,kg=numBR(F.peso);if(!F.dest.trim()){toast('Informe o destinatário');return}if(!(kg>0)){toast('Informe o peso');return}
    if(despFechada(F.data)){toast('Despesca encerrada');return}const d=despescaDaData(F.data,true),p=prodPorId(F.produtoId)||{};gd.desp=d.id;
    const cli=cad.clientes.find(c=>semAcento(c.nome)===semAcento(F.dest.trim()));
    salvarReg('doacoes',{id:'do-'+uid(),despescaId:d.id,data:F.data,destinatario:F.dest.trim().toUpperCase(),clienteId:cli?cli.id:'',produtoId:p.id||'',produto:p.nome||'',peso:r3(kg),qtd:parseInt(F.qtd)||0,finalidade:F.fin.trim(),obs:F.obs.trim()},true);
    gd.f={...doaNovo(),data:F.data};gd.aberto=false;render();toast('Doação gravada')},
  novoForm(){gd.aberto=true;gd.f=doaNovo();render();window.scrollTo(0,0)},fechaForm(){gd.aberto=false;render()},
  ed(id){const x=db.doacoes.find(z=>z.id===id);if(!x)return;if(despFechada(x.data)){toast('Despesca encerrada');return}
    janela(`<h3>🎁 ${esc(x.destinatario)}</h3><div class="datas"><div><label>Peso (kg)</label><input type="text" id="jP" inputmode="decimal" value="${txtBR(x.peso,3)}"></div><div><label>Peixes</label><input type="number" id="jQ" value="${x.qtd||''}"></div></div>
      <div class="row"><button class="danger" id="jX">🗑 Excluir</button><button class="primary" id="jO">Salvar</button></div>`,(j,fechar)=>{
      j.querySelector('#jX').onclick=()=>{fechar();confirmarExcluir('Excluir esta doação?',()=>{apagarReg('doacoes',x.id);render()})};
      j.querySelector('#jO').onclick=()=>{const kg=numBR(j.querySelector('#jP').value);if(!(kg>0)){toast('Peso inválido');return}salvarReg('doacoes',{...x,peso:r3(kg),qtd:parseInt(j.querySelector('#jQ').value)||0},false);fechar();render()}})}};

/* =====================================================================
   PEIXES, CLASSIFICAÇÕES, TANQUES E CATEGORIAS DE CUSTO
   ===================================================================== */
/* título com o botão ＋ Novo do lado (padrão de todos os cadastros) */
const titNovo=(t,a,v,txt)=>`<div class="curhead"><h2>${t}</h2><button class="novoBt" data-a="${a}"${v?` data-v="${v}"`:''}>＋ ${txt||'Novo'}</button></div>`;
const linhaCad=(o,tipo,extra='')=>`<div class="eqLinha ${o.inativo?'inativo':''}"><span>${esc(o.nome)}${extra}</span>${o.inativo?`<button class="mini" data-a="reat" data-v="${tipo}:${o.id}">Reativar</button>`:`<button class="mini" data-a="ren" data-v="${tipo}:${o.id}">✏️</button><button class="mini inativar" data-a="inat" data-v="${tipo}:${o.id}">Inativar</button>`}<button class="mini excluirBt" data-a="exc" data-v="${tipo}:${o.id}" aria-label="Excluir">🗑</button></div>`;
/* quantos lançamentos usam o cadastro (só exclui se não tiver nenhum) */
function usosCad(tipo,o){const sa=semAcento,n=sa(o.nome),q=(l,f)=>l.filter(f).length;
  if(tipo==='categorias')return q(db.custos,c=>sa(c.categoria)===n);
  if(tipo==='tanques')return q(db.bags,b=>sa(b.tanque)===n);
  if(tipo==='classes')return q(db.vendas,v=>(v.itens||[]).some(i=>i.classeId===o.id));
  if(tipo==='produtos'){const cls=cad.classes.filter(c=>c.produtoId===o.id).map(c=>c.id);return q(db.vendas,v=>(v.itens||[]).some(i=>cls.includes(i.classeId)||sa(i.produto)===n))+q(db.bags,b=>sa(b.produto)===n)+q(db.doacoes,d=>sa(d.produto)===n)}
  if(tipo==='vendedores')return q(db.vendas,v=>sa(v.vendedor)===n)+q(db.receb,r=>sa(r.vendedor)===n)+q(db.custos,c=>sa(c.quem)===n)+q(db.repasses,r=>sa(r.vendedor)===n)+q(db.bags,b=>sa(b.lancadoPor)===n);
  if(tipo==='clientes')return q(db.vendas,v=>v.clienteId===o.id)+q(db.receb,r=>r.clienteId===o.id)+q(db.ajustes,a=>a.clienteId===o.id);
  return 0}
const NOME_CAD={categorias:'a categoria',tanques:'o tanque',classes:'a classificação',produtos:'o peixe',vendedores:'o vendedor',clientes:'o cliente'};
function excluirCad(tipo,id,depois){const o=porId(cad[tipo],id);if(!o)return;const n=usosCad(tipo,o);
  if(n){janela(`<h3>Não dá para excluir</h3><p class="note">${esc(o.nome)} tem ${n} lançamento${n>1?'s':''}. Só pode excluir cadastro sem lançamento — se não usa mais, use <b>Inativar</b>.</p><div class="row"><button class="primary" id="jOk">Entendi</button></div>`,(j,fechar)=>{j.querySelector('#jOk').onclick=fechar});return}
  perguntar(`Deseja excluir ${NOME_CAD[tipo]||''} ${o.nome}?`,'Excluir','var(--bad)',()=>{o.excluido=true;o.inativo=true;toque(o);
    if(tipo==='produtos')cad.classes.filter(c=>c.produtoId===o.id).forEach(c=>{c.excluido=true;c.inativo=true;toque(c)});
    salvarCad('Excluído');if(depois)depois();else render()},'Não tem nenhum lançamento. Essa ação não pode ser desfeita.')}
RENDER.gpeix=()=>{
  let h=`<section class="panel">${titNovo('Peixes e classificações','addPeixe')}<p class="note">O preço de referência é sugerido na venda quando o cliente não tem preço negociado.</p>`;
  naoExcl(cad.produtos).forEach(p=>{h+=`<div class="fzBloco"><div class="fzCab"><b>${esc(p.nome)}${p.inativo?' (inativo)':''}</b><span>${p.inativo?'':`<button class="az" data-a="addCl" data-v="${p.id}">＋ Classificação</button> `}<button class="az" data-a="ren" data-v="produtos:${p.id}">✏️</button> ${p.inativo?`<button class="az" data-a="reat" data-v="produtos:${p.id}">Reativar</button>`:`<button class="az" data-a="inat" data-v="produtos:${p.id}">Inativar</button>`} <button class="az" data-a="exc" data-v="produtos:${p.id}" aria-label="Excluir">🗑</button></span></div>
    ${naoExcl(cad.classes).filter(c=>c.produtoId===p.id).map(c=>linhaCad(c,'classes',` <small style="color:var(--muted);font-weight:500">· ref. ${fmtR(c.preco||0)}/kg</small>`)).join('')}</div>`});
  h+=`</section>`;
  h+=`<section class="panel">${titNovo('Tanques / viveiros','addTq')}<div class="fzBloco">${naoExcl(cad.tanques).sort((a,b)=>ordTxt(a.nome,b.nome)).map(t=>linhaCad(t,'tanques')).join('')||'<div class="eqLinha"><span class="note">Nenhum tanque.</span></div>'}</div></section>`;
  h+=`<section class="panel">${titNovo('Categorias de despesa','addCat')}<div class="fzBloco">${naoExcl(cad.categorias).sort((a,b)=>ordTxt(a.nome,b.nome)).map(t=>linhaCad(t,'categorias')).join('')}</div></section>`;
  $('t-gpeix').innerHTML=h;
};
const addSimples=(lista,tit,pref,up)=>campoTexto(tit,'',n=>addNome(lista,n,pref,up));
const addNome=(lista,n,pref,up)=>{n=String(n||'').trim();if(up)n=n.toUpperCase();if(!n){toast('Digite o nome');return}if(cad[lista].some(x=>!x.inativo&&!x.excluido&&semAcento(x.nome)===semAcento(n))){toast('Já existe');return}cad[lista].push(toque({id:pref+uid(),nome:n}));salvarCad('Cadastrado');render()};
ACOES.gpeix={
  exc(v){const[l,id]=v.split(':');excluirCad(l,id)},
  addPeixe(){addSimples('produtos','Novo peixe','p-',true)},addTq(){addSimples('tanques','Novo tanque / viveiro','tq-',true)},addCat(){addSimples('categorias','Nova categoria de despesa','cat-',false)},
  addCl(pid){const p=porId(cad.produtos,pid);campoTexto('Nova classificação'+(p?' — '+p.nome:''),'',n=>{n=String(n||'').trim();if(!n){toast('Digite a classificação');return}if(cad.classes.some(c=>c.produtoId===pid&&!c.inativo&&semAcento(c.nome)===semAcento(n))){toast('Já existe');return}cad.classes.push(toque({id:'c-'+uid(),produtoId:pid,nome:n,preco:0}));salvarCad('Classificação criada');render()})},
  ren(v){const[l,id]=v.split(':'),o=porId(cad[l],id);
    if(l==='classes'){janela(`<h3>✏️ Classificação</h3><div><label>Nome</label><input type="text" id="jN" value="${esc(o.nome)}"></div><div><label>Preço de referência (R$/kg)</label><input type="text" id="jP" inputmode="decimal" value="${txtBR(o.preco)}"></div><div class="row"><button id="jC">Cancelar</button><button class="primary" id="jO">Salvar</button></div>`,(j,fechar)=>{j.querySelector('#jC').onclick=fechar;j.querySelector('#jO').onclick=()=>{const n=j.querySelector('#jN').value.trim();if(!n)return;o.nome=n;o.preco=numBR(j.querySelector('#jP').value)||0;toque(o);salvarCad('Salvo');fechar();render()}});return}
    campoTexto('Renomear',o.nome,n=>{o.nome=l==='categorias'?n:n.toUpperCase();toque(o);salvarCad('Salvo');render()})},
  inat(v){const[l,id]=v.split(':'),o=porId(cad[l],id);perguntar(`Inativar ${o.nome}?`,'Inativar','var(--warn)',()=>{o.inativo=true;toque(o);salvarCad('Inativado');render()},'Some das listas de lançamento; o histórico continua.')},
  reat(v){const[l,id]=v.split(':'),o=porId(cad[l],id);o.inativo=false;toque(o);salvarCad('Reativado');render()}};

/* =====================================================================
   CONFIGURAÇÕES
   ===================================================================== */
RENDER.gconf=()=>{const P=cad.params;
  $('t-gconf').innerHTML=`<section class="panel"><h2>Parâmetros de venda e cobrança</h2>
    <div class="datas"><div><label>Prazo padrão (dias)</label><input type="number" id="pPrazo" value="${P.prazo}"></div><div><label>Carência antes do atraso (dias)</label><input type="number" id="pTol" value="${P.tolerancia}"></div></div>
    <label class="opcao"><input type="checkbox" id="pAlerta" ${P.alerta?'checked':''}> Alertar ao vender para cliente com título vencido</label>
    <label class="opcao"><input type="checkbox" id="pBloq" ${P.bloquear?'checked':''}> Bloquear a venda (só libera com a senha)</label>
    <div><label>Empresa (nas notas)</label><input type="text" id="pEmp" value="${esc(P.empresa)}"></div><div><label>Unidade</label><input type="text" id="pUni" value="${esc(P.unidade)}"></div>
    <div><label>Contato no rodapé (telefone, PIX)</label><input type="text" id="pCont" value="${esc(P.contato||'')}"></div>
    <button class="primary" data-a="salvarP">Salvar parâmetros</button></section>
   <section class="panel">${titNovo('Vendedores / quem lança','addVend')}<div class="fzBloco">${naoExcl(cad.vendedores).sort((a,b)=>ordTxt(a.nome,b.nome)).map(v=>linhaCad(v,'vendedores')).join('')||'<div class="eqLinha"><span class="note">Ninguém ainda.</span></div>'}</div></section>
   <section class="panel"><h2>Despescas</h2><p class="note">Criadas sozinhas por semana (segunda a domingo). Encerre/reabra no Fechamento.</p>${despescasOrd().map(d=>`<div class="eqLinha"><span>${esc(d.descricao)}</span>${d.encerrada?'<span class="estado fechada">encerrada</span>':'<span class="estado aberta">aberta</span>'}<button class="mini" data-a="renD" data-v="${d.id}">✏️</button></div>`).join('')||'<div class="vazio">Nenhuma ainda.</div>'}</section>
   <section class="panel"><h2>Cópia de segurança</h2><p class="note">Tudo fica salvo no aparelho e na planilha do Google. Aqui você baixa uma planilha Excel com todos os lançamentos.</p><button class="verde" data-a="tudo">📊 Exportar tudo (Excel)</button>
    <p class="note">Neste aparelho: ${db.vendas.length} vendas · ${db.receb.length} recebimentos · ${db.bags.length} bags · ${ativos(cad.clientes).length} clientes · ${fila.length} aguardando envio.</p></section>
   <details class="panel avancado"><summary><h2>Avançado · conexão com a nuvem</h2></summary><p class="note">Link do Google Script (termina em /exec) onde ficam salvos todos os lançamentos.</p>
    <input type="text" id="apiUrl" inputmode="url" autocomplete="off" value="${esc(ler(K.api,'')||API_PADRAO)}" placeholder="https://script.google.com/macros/s/…/exec"><button data-a="salvarApi">Salvar link</button>
    <p class="note">Versão do app: v${VERSAO} · aparelho ${esc(disp)}</p></details>`;
};
ACOES.gconf={
  salvarP(){const P=cad.params;P.prazo=Math.max(0,parseInt($('pPrazo').value)||0);P.tolerancia=Math.max(0,parseInt($('pTol').value)||0);P.alerta=$('pAlerta').checked;P.bloquear=$('pBloq').checked;
    P.empresa=$('pEmp').value.trim()||'FJK AGROPECUÁRIA';P.unidade=$('pUni').value.trim()||'Piscicultura';P.contato=$('pCont').value.trim();P.alt=agora();salvarCad('Parâmetros salvos')},
  addVend(){addSimples('vendedores','Novo vendedor','v-',false)},exc(v){const[l,id]=v.split(':');excluirCad(l,id)},
  ren(v){ACOES.gpeix.ren(v)},inat(v){ACOES.gpeix.inat(v)},reat(v){ACOES.gpeix.reat(v)},
  renD(id){const d=despPorId(id);campoTexto('Nome da despesca',d.descricao,n=>{d.descricao=n;toque(d);salvarCad('Salvo');render()})},
  tudo(){compartilharArquivo(xlsxTudo(),`Piscicultura FJK - tudo ${fmtData(chaveDia()).replace(/\//g,'-')}.xlsx`,XT)},
  salvarApi(){const v=$('apiUrl').value.trim();if(v&&!/^https:\/\/script\.google\.com\/.+\/exec$/.test(v)){toast('O link precisa começar com https://script.google.com e terminar em /exec');return}gravar(K.api,v);toast('Link salvo');carregar()}};

/* =====================================================================
   INÍCIO / ATUALIZAÇÃO
   ===================================================================== */
function marcaAtualizado(d){if(d)gravar(K.sync,d);const x=ler(K.sync,null);
  $('hoje').textContent=x?`Atualizado ${fmtDM(chaveDia(new Date(x)))} às ${fmtHora(x)} – v${VERSAO}`:`v${VERSAO}`}
$('btnAtualizar').onclick=()=>{checarVersao(true);carregar()};
async function checarVersao(forcar){
  try{
    const v=String((await (await fetch('versao.json?t='+Date.now(),{cache:'no-store'})).json()).versao||'');
    if(!v||v===VERSAO)return;
    let tentou='';try{tentou=sessionStorage.getItem('pc_tentou')||''}catch(e){}
    if(tentou===v&&!forcar)return;
    try{sessionStorage.setItem('pc_tentou',v)}catch(e){}
    if(FORMS.includes(tela)||!$('tecSenha').hidden||document.querySelector('.fundo'))return; // não atrapalha quem está lançando
    try{const r=navigator.serviceWorker&&await navigator.serviceWorker.getRegistration();if(r)await r.update()}catch(e){}
    toast('Atualizando o app…');setTimeout(()=>location.reload(),600);
  }catch(e){}
}
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'){checarVersao();carregar()}});
window.addEventListener('pageshow',()=>checarVersao());
window.addEventListener('online',carregar);
setInterval(()=>{if(document.visibilityState==='visible')carregar()},60000);

/* =====================================================================
   RELATÓRIOS (igual ao Gestão de Tratos: Por dia / Por período,
   lista por grupo, toque para ver embaixo, Selecionar para exportar)
   ===================================================================== */
const gr={modo:'dia',dia:chaveDia(),per:'mes',de:'',ate:'',aberto:'',selModo:false,sel:new Set()};
ENTRAR.grel=()=>{gr.modo='dia';gr.dia=chaveDia();gr.aberto='';gr.selModo=false;gr.sel=new Set();aplicaPer(gr,'7')};
const relPer=()=>gr.modo==='dia'?{de:gr.dia,ate:gr.dia}:{de:gr.de,ate:gr.ate};
const rotPer=(de,ate)=>!de&&!ate?'Todo o período':de===ate?fmtData(de):`${de?fmtData(de):'início'} a ${ate?fmtData(ate):'hoje'}`;
const naFaixa=(k,de,ate)=>(!de||k>=de)&&(!ate||k<=ate);
const semDados=(titulo,sub,msg)=>({titulo,sub:[sub],blocos:[{txt:msg||'Nenhum registro no período.'}]});

function relVendasP(de,ate,parte){
  const l=db.vendas.filter(v=>naFaixa(v.data,de,ate)).sort((a,b)=>a.data.localeCompare(b.data)||String(a.registradoEm).localeCompare(String(b.registradoEm)));
  const kg=r3(l.reduce((s,v)=>s+pesoVenda(v),0)),rs=r2(l.reduce((s,v)=>s+valorVenda(v),0)),sub=rotPer(de,ate);
  const resumo={kv:[['Vendas',String(l.length)],['Peso vendido',fmtKg(kg)+' kg'],['Faturamento',fmtR(rs),null,true],['Preço médio',kg?fmtR(rs/kg)+'/kg':'—']]};
  if(parte==='cli'){const g=agrupaItens(l,v=>v.cliente);return{titulo:'Vendas por cliente',sub:[sub],xlsNome:'Por cliente',blocos:[resumo,{cols:[{t:'Cliente',w:40},{t:'Vendas',w:10,al:'r'},{t:'Kg',w:14,al:'r'},{t:'Valor',w:16,al:'r'},{t:'R$/kg',w:12,al:'r'}],linhas:g.map(x=>[x.k,String(x.n.size),fmtKg(x.kg),fmtR(x.r),fmtN2(x.kg?x.r/x.kg:0)]),total:['TOTAL',String(l.length),fmtKg(kg),fmtR(rs),fmtN2(kg?rs/kg:0)]}]}}
  if(parte==='cls'){const g=agrupaItens(l,(v,i)=>i.produto+' — '+i.classe);return{titulo:'Vendas por classificação',sub:[sub],xlsNome:'Por classificação',blocos:[resumo,{cols:[{t:'Peixe / classificação',w:40},{t:'Kg',w:14,al:'r'},{t:'Valor',w:16,al:'r'},{t:'R$/kg',w:12,al:'r'}],linhas:g.map(x=>[x.k,fmtKg(x.kg),fmtR(x.r),fmtN2(x.kg?x.r/x.kg:0)]),total:['TOTAL',fmtKg(kg),fmtR(rs),fmtN2(kg?rs/kg:0)]}]}}
  return{titulo:'Vendas',sub:[sub],xlsNome:'Vendas',blocos:[resumo,{cols:[{t:'Data',w:11},{t:'Nº',w:7},{t:'Cliente',w:24},{t:'Itens',w:28},{t:'Kg',w:11,al:'r'},{t:'Valor',w:14,al:'r'},{t:'Cond.',w:10}],linhas:l.map(v=>[fmtData(v.data),v.num?String(v.num).padStart(4,'0'):'—',v.cliente,(v.itens||[]).map(i=>i.classe).join(', '),fmtKg(pesoVenda(v)),fmtR(valorVenda(v)),v.cond||'']),total:['TOTAL','','','',fmtKg(kg),fmtR(rs),'']}]};
}
function relRecebP(de,ate){
  const l=db.receb.filter(r=>naFaixa(r.data,de,ate)).sort((a,b)=>a.data.localeCompare(b.data));const tot=r2(l.reduce((s,r)=>s+Number(r.valor||0),0));
  const pf={};l.forEach(r=>pf[r.forma||'—']=r2((pf[r.forma||'—']||0)+Number(r.valor)));
  return{titulo:'Recebimentos',sub:[rotPer(de,ate)],xlsNome:'Recebimentos',blocos:[{kv:[['Recebimentos',String(l.length)],['Total recebido',fmtR(tot),'#1f8f4e',true]].concat(Object.entries(pf).map(([k,v])=>['— '+k,fmtR(v)]))},
    {cols:[{t:'Data',w:11},{t:'Cliente',w:32},{t:'Forma',w:14},{t:'Doc.',w:12},{t:'Vendedor',w:14},{t:'Valor',w:14,al:'r'}],linhas:l.map(r=>[fmtData(r.data),r.cliente,r.forma||'',r.doc||'',r.vendedor||'',fmtR(r.valor)]),total:['TOTAL','','','','',fmtR(tot)]}]};
}
function relCobranca(){
  const cart=carteira().filter(({t})=>t.atraso>Number(cad.params.tolerancia||0)).sort((a,b)=>ordTxt(a.c.nome,b.c.nome)||a.t.venc.localeCompare(b.t.venc));const tot=r2(cart.reduce((s,x)=>s+x.t.aberto,0));
  const fx={'A vencer':0};FAIXAS.forEach(f=>fx[f[2]]=0);carteira().forEach(({t})=>{const k=t.atraso>0?t.faixa:'A vencer';fx[k]=r2((fx[k]||0)+t.aberto)});
  return{titulo:'Cobrança — títulos vencidos',sub:['Posição em '+fmtData(chaveDia())],xlsNome:'Cobrança',blocos:[{tit:'Carteira por faixa de atraso',kv:Object.entries(fx).map(([k,v])=>[k,fmtR(v),k!=='A vencer'&&v>0?'#b3261e':null])},
    {tit:'Títulos vencidos',cols:[{t:'Cliente',w:26},{t:'Telefone',w:14},{t:'Título',w:10},{t:'Vencimento',w:11},{t:'Aberto',w:13,al:'r'},{t:'Atraso',w:9,al:'r'}],linhas:cart.map(({c,t})=>[c.nome,c.tel||'',t.tipo==='VENDA'?(t.rec.num?String(t.rec.num).padStart(4,'0'):'—'):'Ajuste',fmtData(t.venc),fmtR(t.aberto),t.atraso+' d']),total:['TOTAL','','','',fmtR(tot),'']}]};
}
function relSaldos(){
  const l=cad.clientes.map(c=>({c,p:posicao(c.id)})).filter(x=>Math.abs(x.p.saldo)>0.004).sort((a,b)=>b.p.aberto-a.p.aberto);
  const ta=r2(l.reduce((s,x)=>s+x.p.aberto,0)),tv=r2(l.reduce((s,x)=>s+x.p.vencido,0));
  return{titulo:'Posição dos clientes',sub:['Saldos em '+fmtData(chaveDia())],xlsNome:'Saldos',blocos:[{kv:[['Clientes com saldo',String(l.length)],['Total em aberto',fmtR(ta),null,true],['Total vencido',fmtR(tv),tv>0?'#b3261e':null]]},
    {cols:[{t:'Cliente',w:34},{t:'Telefone',w:15},{t:'Em aberto',w:15,al:'r'},{t:'Vencido',w:15,al:'r'},{t:'Maior atraso',w:12,al:'r'}],linhas:l.map(x=>[x.c.nome,x.c.tel||'',fmtR(x.p.aberto),fmtR(x.p.vencido),x.p.maiorAtraso?x.p.maiorAtraso+' d':'']),cores:l.map(x=>x.p.vencido>0?[null,null,null,'#b3261e',null]:null),total:['TOTAL','',fmtR(ta),fmtR(tv),'']}]};
}
function despescasNoPer(de,ate){return despescasOrd().filter(d=>(!ate||d.ini<=ate)&&(!de||(d.fim||d.ini)>=de)).reverse()}
function relFechP(de,ate){const ds=despescasNoPer(de,ate);if(!ds.length)return semDados('Fechamento da despesca',rotPer(de,ate),'Nenhuma despesca no período.');
  if(ds.length===1)return relFech(apurar(ds[0].id));
  const rs=ds.map(d=>relFech(apurar(d.id)));return{titulo:'Fechamento das despescas',sub:[rotPer(de,ate)],xlsNome:'Fechamento',blocos:rs.flatMap(r=>[{kv:[[r.sub[0],r.sub[1],null,true]]},...r.blocos])}}
function relBagsP(de,ate){
  const l=db.bags.filter(b=>naFaixa(b.data,de,ate)).sort((a,b)=>a.data.localeCompare(b.data)||String(a.registradoEm).localeCompare(String(b.registradoEm)));const r=resumoBags(l);
  const g=k=>Object.values(l.reduce((o,b)=>{const x=k(b);(o[x]=o[x]||{k:x,l:[]}).l.push(b);return o},{})).map(x=>({k:x.k,...resumoBags(x.l)}));
  return{titulo:'Produção (bags)',sub:[rotPer(de,ate)],xlsNome:'Bags',blocos:[{kv:[['Bags',String(r.n)],['Peso líquido',fmtKg(r.kg)+' kg',null,true],['Peixes',r.q?fmtI(r.q):'—'],['Peso médio',r.q?fmtKg(r.med)+' kg':'—']]},
    {tit:'Por tanque e peixe',cols:[{t:'Tanque · peixe',w:40},{t:'Bags',w:10,al:'r'},{t:'Kg',w:14,al:'r'},{t:'Peixes',w:12,al:'r'}],linhas:g(b=>b.tanque+' · '+b.produto).sort((a,b)=>b.kg-a.kg).map(x=>[x.k,String(x.n),fmtKg(x.kg),x.q?fmtI(x.q):'']),total:['TOTAL',String(r.n),fmtKg(r.kg),r.q?fmtI(r.q):'']},
    {tit:'Por dia',cols:[{t:'Data',w:20},{t:'Bags',w:10,al:'r'},{t:'Kg',w:14,al:'r'}],linhas:g(b=>b.data).sort((a,b)=>a.k.localeCompare(b.k)).map(x=>[fmtData(x.k),String(x.n),fmtKg(x.kg)])},
    {tit:'Bags',cols:[{t:'Data',w:11},{t:'Hora',w:8},{t:'Tanque',w:18},{t:'Peixe',w:16},{t:'Kg',w:11,al:'r'},{t:'Peixes',w:9,al:'r'},{t:'Lançado por',w:14}],linhas:l.map(b=>[fmtData(b.data),fmtHora(b.registradoEm),b.tanque,b.produto,fmtKg(b.peso),b.qtd?fmtI(b.qtd):'',b.lancadoPor||''])}]};
}
function relDoaP(de,ate){const l=db.doacoes.filter(d=>naFaixa(d.data,de,ate)).sort((a,b)=>a.data.localeCompare(b.data));const kg=r3(l.reduce((s,d)=>s+Number(d.peso||0),0));
  return{titulo:'Doações',sub:[rotPer(de,ate)],xlsNome:'Doações',blocos:[{kv:[['Doações',String(l.length)],['Peso doado',fmtKg(kg)+' kg',null,true]]},
    {cols:[{t:'Data',w:11},{t:'Destinatário',w:30},{t:'Peixe',w:16},{t:'Kg',w:11,al:'r'},{t:'Peixes',w:9,al:'r'},{t:'Finalidade',w:20}],linhas:l.map(d=>[fmtData(d.data),d.destinatario,d.produto||'',fmtKg(d.peso),d.qtd?fmtI(d.qtd):'',d.finalidade||'']),total:['TOTAL','','',fmtKg(kg),'','']}]}}
function relComparativo(){const l=despescasOrd().map(d=>({d,a:apurar(d.id)})).filter(x=>x.a.kg||x.a.prod.kg);
  return{titulo:'Comparativo entre despescas',sub:[l.length+' despescas'],xlsNome:'Comparativo',blocos:[{cols:[{t:'Despesca',w:34},{t:'Kg vend.',w:11,al:'r'},{t:'Faturamento',w:14,al:'r'},{t:'R$/kg',w:9,al:'r'},{t:'Quebra',w:9,al:'r'},{t:'Custo/kg',w:10,al:'r'},{t:'Margem',w:13,al:'r'}],
    linhas:l.map(({d,a})=>[d.descricao.replace(/^(\S+) (\d{4}) \| /,'$1/$2 ').replace(/ \((\d\d\/\d\d) a .*\)/,' ($1)'),fmtKg(a.kg),fmtR(a.fat),fmtN2(a.pm),a.prod.kg?fmtP(a.pct):'—',a.custo?fmtN2(a.custoKg):'—',fmtR(a.margem)])}]}}
function relCustosP(de,ate){const l=db.custos.filter(c=>naFaixa(c.data,de,ate)).sort((a,b)=>a.data.localeCompare(b.data));const tot=r2(l.reduce((s,c)=>s+Number(c.valor||0),0));
  const pc={},re={};l.forEach(c=>{pc[c.categoria]=r2((pc[c.categoria]||0)+Number(c.valor));if(c.pago==='reembolsar')re[c.quem||'—']=r2((re[c.quem||'—']||0)+Number(c.valor))});
  return{titulo:'Despesas',sub:[rotPer(de,ate)],xlsNome:'Despesas',blocos:[{kv:[['Lançamentos',String(l.length)],['Total de despesas',fmtR(tot),null,true]].concat(Object.entries(re).map(([k,v])=>['A reembolsar — '+k,fmtR(v),'#b3261e']))},
    {tit:'Por categoria',cols:[{t:'Categoria',w:50},{t:'Valor',w:18,al:'r'}],linhas:Object.entries(pc).sort((a,b)=>b[1]-a[1]).map(([k,v])=>[k,fmtR(v)]),total:['TOTAL',fmtR(tot)]},
    {tit:'Lançamentos',cols:[{t:'Data',w:11},{t:'Categoria',w:20},{t:'Descrição',w:30},{t:'Pago por',w:18},{t:'Valor',w:13,al:'r'}],linhas:l.map(c=>[fmtData(c.data),c.categoria,c.desc||'',pagoPorTxt(c),fmtR(c.valor)]),total:['TOTAL','','','',fmtR(tot)]}]}}
function relAcertoP(de,ate){const s={de:ga.de,ate:ga.ate,vend:ga.vend,per:ga.per};ga.de=de;ga.ate=ate;ga.vend='';const r=relAcerto(acerto());Object.assign(ga,s);return r}
const RELS=[
  {g:'🐟 Vendas',id:'vend',t:'Vendas',d:'cada venda com cliente, peso, valor e condição',f:(a,b)=>relVendasP(a,b)},
  {g:'🐟 Vendas',id:'vcli',t:'Vendas por cliente',d:'kg, valor e preço médio de cada cliente',f:(a,b)=>relVendasP(a,b,'cli')},
  {g:'🐟 Vendas',id:'vcls',t:'Vendas por classificação',d:'kg, valor e preço médio por peixe e classificação',f:(a,b)=>relVendasP(a,b,'cls')},
  {g:'💰 Recebimentos e cobrança',id:'rec',t:'Recebimentos',d:'o que entrou, por forma de pagamento',f:(a,b)=>relRecebP(a,b)},
  {g:'💰 Recebimentos e cobrança',id:'cob',t:'Cobrança',d:'títulos vencidos por cliente e faixa de atraso (posição de hoje)',f:()=>relCobranca()},
  {g:'💰 Recebimentos e cobrança',id:'sal',t:'Posição dos clientes',d:'saldo em aberto e vencido de cada cliente (hoje)',f:()=>relSaldos()},
  {g:'📦 Despesca e produção',id:'fech',t:'Fechamento da despesca',d:'vendido × despescado × doado, quebra, custo e margem',f:(a,b)=>relFechP(a,b)},
  {g:'📦 Despesca e produção',id:'bags',t:'Produção (bags)',d:'bags por tanque, peixe e dia',f:(a,b)=>relBagsP(a,b)},
  {g:'📦 Despesca e produção',id:'doa',t:'Doações',d:'peixe doado por destinatário',f:(a,b)=>relDoaP(a,b)},
  {g:'📦 Despesca e produção',id:'comp',t:'Comparativo entre despescas',d:'kg, preço médio, quebra, custo/kg e margem de cada semana',f:()=>relComparativo()},
  {g:'💸 Despesas e acerto',id:'cus',t:'Despesas',d:'por categoria e quem pagou (reembolsos)',f:(a,b)=>relCustosP(a,b)},
  {g:'💸 Despesas e acerto',id:'ace',t:'Acerto com a fazenda',d:'recebido, repassado e valor em mãos',f:(a,b)=>relAcertoP(a,b)},
];
const relDe=id=>{const r=RELS.find(x=>x.id===id),p=relPer();return r.f(p.de,p.ate)};
function relHtml(rel){
  const al=(b,i)=>b.cols[i]&&b.cols[i].al==='r'?'r':'';
  return rel.blocos.map(b=>(b.tit?`<div class="secTit">${esc(b.tit)}</div>`:'')
    +(b.kv?`<div class="kv">${b.kv.map(r=>`<div class="${r[3]?'forte':''}"><span>${esc(r[0])}</span><b${r[2]?` style="color:${r[2]}"`:''}>${esc(r[1])}</b></div>`).join('')}</div>`:'')
    +(b.txt?`<p class="note" style="white-space:pre-line">${esc(b.txt)}</p>`:'')
    +(b.cols?`<div class="tabWrap"><table class="tabela"><tr>${b.cols.map((c,i)=>`<th class="${al(b,i)}">${esc(c.t)}</th>`).join('')}</tr>${b.linhas.length?b.linhas.map((l,li)=>`<tr>${l.map((v,i)=>`<td class="${al(b,i)}"${b.cores&&b.cores[li]&&b.cores[li][i]?` style="color:${b.cores[li][i]}"`:''}>${esc(v??'')}</td>`).join('')}</tr>`).join(''):`<tr><td colspan="${b.cols.length}">Nenhum registro.</td></tr>`}${b.total?`<tr class="tot">${b.total.map((v,i)=>`<td class="${al(b,i)}">${esc(v??'')}</td>`).join('')}</tr>`:''}</table></div>`:'')).join('');
}
function juntarRels(ids){const p=relPer(),rs=ids.map(relDe);
  return{titulo:'Relatórios',sub:[rotPer(p.de,p.ate)],xlsNome:'Relatórios',blocos:rs.flatMap(r=>[{kv:[[r.titulo.toUpperCase(),(r.sub||[]).join(' · '),'#0d47a1',true]]},...r.blocos])}}
function diaNavHtml(k,f){return `<div class="diaNav"><button data-a="diaMenos">◀</button><input type="date" data-f="${f}" value="${k}"><button data-a="diaMais">▶</button></div>${k===chaveDia()?'<p class="note" style="text-align:center;margin-top:-6px"><span class="hojeTag">Hoje</span> '+nomeDia(k)+'</p>':`<p class="note" style="text-align:center;margin-top:-6px">${nomeDia(k)}</p>`}`}
RENDER.grel=()=>{
  const p=relPer();let h=`<section class="panel">`;
  h+=`<div class="relModo"><button data-a="modo" data-v="dia" class="${gr.modo==='dia'?'sel':''}">📅 Por dia</button><button data-a="modo" data-v="per" class="${gr.modo==='per'?'sel':''}">📆 Por período</button></div>`;
  h+=gr.modo==='dia'?diaNavHtml(gr.dia,'dia'):perHtml(gr);
  h+=`<button data-a="selModo" class="${gr.selModo?'primary':''}" style="${gr.selModo?'':'border-color:var(--accent);color:var(--accent)'}">${gr.selModo?'✖ Cancelar seleção':'☑ Selecionar para exportar'}</button>`;
  if(gr.selModo)h+=`<div class="row"><button class="mini" data-a="todos">✓ Marcar todos</button><button class="mini" data-a="nenhum">Desmarcar</button></div><div class="compart"><button class="verde" data-a="expSel" data-v="pdf">📄 PDF (${gr.sel.size})</button><button class="verde" data-a="expSel" data-v="img">🖼 Foto</button><button class="verde" data-a="expSel" data-v="xls">📊 Excel</button></div>`;
  h+=`<p class="note">${gr.selModo?'Marque os relatórios e use os botões acima para gerar tudo num arquivo só.':'Toque num relatório para ver aqui embaixo. Para enviar vários juntos, use <b>Selecionar para exportar</b>.'}</p>`;
  let grp='';RELS.forEach(r=>{if(r.g!==grp){grp=r.g;h+=`<div class="gRelGrp">${esc(grp)}</div>`}
    const ab=!gr.selModo&&gr.aberto===r.id,mk=gr.sel.has(r.id);
    h+=`<button class="gRelIt ${ab||mk?'aberto':''}" data-a="${gr.selModo?'marca':'abre'}" data-v="${r.id}">${gr.selModo?`<span class="chk">${mk?'☑':'☐'}</span>`:''}<span><b>${esc(r.t)}</b><small>${esc(r.d)}</small></span>${gr.selModo?'':`<span class="seta">${ab?'▲':'▼'}</span>`}</button>`;
    if(ab){let rel;try{rel=relDe(r.id)}catch(e){console.error(e);rel=semDados(r.t,'','Não deu para montar este relatório.')}
      h+=`<div class="relPrev"><div class="compart"><button class="verde" data-a="exp" data-v="pdf">📄 PDF</button><button class="verde" data-a="exp" data-v="img">🖼 Foto</button><button class="verde" data-a="exp" data-v="xls">📊 Excel</button></div>${relHtml(rel)}</div>`}});
  h+=`</section>`;$('t-grel').innerHTML=h;
};
CAMPOS.grel=(f,el)=>{if(f==='dia'){if(el.value){gr.dia=el.value;render()}return}if(f==='de'||f==='ate'){gr[f]=el.value;gr.per='';ajustaPar(gr,f);render()}};
ACOES.grel={modo(v){gr.modo=v;render()},per(v){aplicaPer(gr,v);render()},diaMenos(){gr.dia=somaDias(gr.dia,-1);render()},diaMais(){gr.dia=somaDias(gr.dia,1);render()},
  selModo(){gr.selModo=!gr.selModo;gr.sel=new Set();render()},todos(){RELS.forEach(r=>gr.sel.add(r.id));render()},nenhum(){gr.sel.clear();render()},
  marca(id){gr.sel.has(id)?gr.sel.delete(id):gr.sel.add(id);render()},abre(id){gr.aberto=gr.aberto===id?'':id;render()},
  exp(t){const r=RELS.find(x=>x.id===gr.aberto);if(!r)return;const p=relPer();return exportarRel(relDe(r.id),t,`${r.t} ${rotPer(p.de,p.ate).replace(/\//g,'-')}`)},
  expSel(t){if(!gr.sel.size){toast('Marque pelo menos um relatório');return}const ids=RELS.filter(r=>gr.sel.has(r.id)).map(r=>r.id),p=relPer();return exportarRel(juntarRels(ids),t,`Relatorios ${rotPer(p.de,p.ate).replace(/\//g,'-')}`)}};

/* =====================================================================
   RESUMO (painel da Gestão)
   ===================================================================== */
RENDER.gres=()=>{
  const h0=chaveDia(),vh=db.vendas.filter(v=>v.data===h0),rh=db.receb.filter(r=>r.data===h0),bh=db.bags.filter(b=>b.data===h0);
  const kgH=r3(vh.reduce((s,v)=>s+pesoVenda(v),0)),rsH=r2(vh.reduce((s,v)=>s+valorVenda(v),0)),recH=r2(rh.reduce((s,r)=>s+Number(r.valor),0)),bH=resumoBags(bh);
  let aRec=0,venc=0,nV=0;cad.clientes.forEach(c=>{const p=posicao(c.id);aRec=r2(aRec+p.aberto);venc=r2(venc+p.vencido);if(p.vencido>0)nV++});
  const tRec=r2(db.receb.reduce((s,r)=>s+Number(r.valor||0),0)),tRep=r2(db.repasses.reduce((s,r)=>s+Number(r.valor||0),0)),tMao=r2(db.custos.filter(c=>c.pago==='emmaos').reduce((s,c)=>s+Number(c.valor||0),0));
  const d=despescaDaData(h0,false)||despescasOrd()[0];
  let h=`<section class="panel"><h2>Hoje · ${fmtData(h0)}</h2><div class="stat"><div><small>Vendas</small><b class="num">${vh.length}</b></div><div><small>Kg vendidos</small><b class="num">${fmtKg(kgH)}</b></div><div><small>Faturado</small><b class="num">${fmtR(rsH).replace('R$ ','')}</b></div></div>
    <div class="stat"><div><small>Recebido</small><b class="num pos">${fmtR(recH).replace('R$ ','')}</b></div><div><small>Bags</small><b class="num">${bH.n}</b></div><div><small>Kg despescado</small><b class="num">${fmtKg(bH.kg)}</b></div></div></section>`;
  if(d){const a=apurar(d.id);h+=`<section class="panel"><div class="curhead"><h2>Despesca</h2>${d.encerrada?'<span class="estado fechada">ENCERRADA</span>':'<span class="estado aberta">ABERTA</span>'}</div><p class="note">${esc(d.descricao)}</p>
    <div class="kv"><div><span>Vendido</span><b>${fmtKg(a.kg)} kg · ${fmtR(a.fat)}</b></div><div><span>Preço médio</span><b>${fmtR(a.pm)}/kg</b></div><div><span>Despescado (bags)</span><b>${fmtKg(a.prod.kg)} kg</b></div><div><span>Diferença (quebra)</span><b class="${a.dif>0?'neg':''}">${fmtKg(a.dif)} kg · ${fmtP(a.pct)}</b></div><div><span>Custo · custo/kg</span><b>${fmtR(a.custo)} · ${fmtR(a.custoKg)}</b></div><div class="forte"><span>Margem bruta</span><b class="${a.margem<0?'neg':'pos'}">${fmtR(a.margem)}</b></div></div>
    <button data-ir="gfech">📦 Abrir fechamento</button></section>`}
  h+=`<section class="panel"><h2>Carteira de clientes</h2><div class="kv"><div><span>A receber</span><b>${fmtR(aRec)}</b></div><div class="forte"><span>Vencido (${nV} cliente${nV===1?'':'s'})</span><b class="${venc>0?'neg':''}">${fmtR(venc)}</b></div></div><button data-ir="gcob">⏰ Cobrança</button></section>
    <section class="panel"><h2>Dinheiro em mãos (geral)</h2><div class="kv"><div><span>Recebido dos clientes</span><b>${fmtR(tRec)}</b></div><div><span>− Repassado à fazenda</span><b>${fmtR(tRep)}</b></div><div><span>− Despesas pagas em mãos</span><b>${fmtR(tMao)}</b></div><div class="forte"><span>= Em mãos</span><b>${fmtR(r2(tRec-tRep-tMao))}</b></div></div><button data-ir="gacer">🤝 Acerto com a fazenda</button></section>`;
  $('t-gres').innerHTML=h;
};

/* =====================================================================
   VISUALIZAR (só olhar, sem lançar; atualiza sozinho)
   ===================================================================== */
const gw={modo:'dia',dia:chaveDia(),per:'7',de:'',ate:''};
ENTRAR.ver=()=>{gw.modo='dia';gw.dia=chaveDia();aplicaPer(gw,'7')};
const verPer=()=>gw.modo==='dia'?{de:gw.dia,ate:gw.dia}:{de:gw.de,ate:gw.ate};
function relResumoDia(){const {de,ate}=verPer(),b=relBagsP(de,ate),v=relVendasP(de,ate),r=relRecebP(de,ate);
  return{titulo:gw.modo==='dia'?'Resumo do dia':'Resumo do período',sub:[rotPer(de,ate)],xlsNome:'Resumo',blocos:[
    {tit:'Despesca (bags)',kv:b.blocos[0].kv},Object.assign({},b.blocos[1],{tit:'Despesca por tanque e peixe'}),
    {tit:'Vendas',kv:v.blocos[0].kv},Object.assign({},v.blocos[1],{tit:'Vendas'}),
    {tit:'Recebimentos',kv:r.blocos[0].kv},Object.assign({},r.blocos[1],{tit:'Recebimentos'})]}}
RENDER.ver=()=>{
  const {de,ate}=verPer(),dia=gw.modo==='dia',dt=x=>dia?fmtHora(x.registradoEm):fmtDM(x.data);
  const vs=db.vendas.filter(v=>naFaixa(v.data,de,ate)).sort((a,b)=>b.data.localeCompare(a.data)||String(b.registradoEm).localeCompare(String(a.registradoEm)));
  const rs=db.receb.filter(r=>naFaixa(r.data,de,ate)).sort((a,b)=>b.data.localeCompare(a.data)||String(b.registradoEm||'').localeCompare(String(a.registradoEm||'')));
  const bs=db.bags.filter(b=>naFaixa(b.data,de,ate));
  const kg=r3(vs.reduce((s,v)=>s+pesoVenda(v),0)),rv=r2(vs.reduce((s,v)=>s+valorVenda(v),0)),rr=r2(rs.reduce((s,r)=>s+Number(r.valor),0)),rb=resumoBags(bs);
  const porT=Object.values(bs.reduce((o,b)=>{const x=b.tanque+' · '+b.produto;(o[x]=o[x]||{k:x,l:[]}).l.push(b);return o},{})).map(x=>({k:x.k,...resumoBags(x.l)})).sort((a,b)=>b.kg-a.kg);
  $('t-ver').innerHTML=`<section class="panel"><div class="relModo"><button data-a="modo" data-v="dia" class="${dia?'sel':''}">📅 Por dia</button><button data-a="modo" data-v="per" class="${dia?'':'sel'}">📆 Por período</button></div>
     ${dia?diaNavHtml(gw.dia,'dia'):perHtml(gw)}<p class="note">Atualiza sozinho enquanto a tela estiver aberta.</p></section>
   <section class="panel"><h2>Despesca</h2><div class="stat"><div><small>Bags</small><b class="num">${rb.n}</b></div><div><small>Kg despescado</small><b class="num">${fmtKg(rb.kg)}</b></div><div><small>Peixes</small><b class="num">${rb.q?fmtI(rb.q):'—'}</b></div></div>
     ${porT.length?tabHtml(['Tanque · peixe','Bags','Kg'],porT.map(x=>[x.k,String(x.n),fmtKg(x.kg)])):'<div class="vazio">Nenhum bag.</div>'}</section>
   <section class="panel"><h2>Vendas</h2><div class="stat"><div><small>Vendas</small><b class="num">${vs.length}</b></div><div><small>Kg vendidos</small><b class="num">${fmtKg(kg)}</b></div><div><small>Faturado</small><b class="num">${fmtR(rv).replace('R$ ','')}</b></div></div>
     ${vs.map(v=>`<div class="reg" style="cursor:default"><div><span class="eqn">${esc(v.cliente)}</span><div class="faz">${dt(v)} · ${esc((v.itens||[]).map(i=>i.produto+' '+i.classe).join(', '))}${v.vendedor?' · '+esc(v.vendedor):''}</div></div><div class="lt">${fmtR(valorVenda(v))}<small>${fmtKg(pesoVenda(v))} kg</small></div></div>`).join('')||'<div class="vazio">Nenhuma venda.</div>'}</section>
   <section class="panel"><h2>Recebimentos</h2><div class="stat"><div><small>Recebimentos</small><b class="num">${rs.length}</b></div><div><small>Recebido</small><b class="num pos">${fmtR(rr).replace('R$ ','')}</b></div></div>
     ${rs.map(r=>`<div class="reg" style="cursor:default"><div><span class="eqn">${esc(r.cliente)}</span><div class="faz">${dia?'':fmtDM(r.data)+' · '}${esc(r.forma||'')}${r.vendedor?' · '+esc(r.vendedor):''}</div></div><div class="lt mais">${fmtR(r.valor)}</div></div>`).join('')||'<div class="vazio">Nenhum recebimento.</div>'}</section>
   ${vs.length||rs.length||bs.length?`<section class="panel">${botoesExp()}</section>`:''}`;
};
CAMPOS.ver=(f,el)=>{if(f==='dia'&&el.value){gw.dia=el.value;render();return}if(f==='de'||f==='ate'){gw[f]=el.value;gw.per='';ajustaPar(gw,f);render()}};
ACOES.ver={modo(v){gw.modo=v;render()},per(v){aplicaPer(gw,v);render()},diaMenos(){gw.dia=somaDias(gw.dia,-1);render()},diaMais(){gw.dia=somaDias(gw.dia,1);render()},
  exp(t){const {de,ate}=verPer();return exportarRel(relResumoDia(),t,`${gw.modo==='dia'?'Resumo do dia':'Resumo'} ${rotPer(de,ate).replace(/\//g,'-')}`)}};

/* =====================================================================
   CONFIG. (quadros iguais ao Gestão de Tratos)
   ===================================================================== */
const gq={sub:''};
ENTRAR.gconf=()=>{gq.sub=''};
const _renderConfAntigo=RENDER.gconf;
RENDER.gconf=()=>{
  const el=$('t-gconf');
  if(!gq.sub){el.innerHTML=`<div class="gCfgTiles">
    <button data-a="sub" data-v="senha" style="--c:#b3261e"><span class="gIc">🔒</span>Senhas</button>
    <button data-a="sub" data-v="venda" style="--c:#1e6fd0"><span class="gIc">🧾</span>Venda e cobrança</button>
    <button data-a="sub" data-v="vend" style="--c:#2e8b3d"><span class="gIc">👤</span>Vendedores</button>
    <button data-a="sub" data-v="desp" style="--c:#0b3a82"><span class="gIc">📦</span>Despescas</button>
    <button data-a="sub" data-v="emp" style="--c:#8a5a12"><span class="gIc">🏢</span>Empresa</button>
    <button data-a="sub" data-v="nuvem" style="--c:#6b7479"><span class="gIc">☁️</span>Nuvem e backup</button></div>
    <p class="note" style="text-align:center">v${VERSAO} · aparelho ${esc(disp)}</p>`;return}
  _renderConfAntigo();
  const secs=[...el.querySelectorAll(':scope > section, :scope > details')];
  const mapa={venda:0,vend:1,desp:2,nuvem:[3,4]};
  if(gq.sub==='senha'){el.innerHTML=`<section class="panel"><h2>Senhas para abrir</h2><p class="note">Senha de cada botão da tela inicial. Deixe em branco para abrir direto, sem senha. A senha da Gestão também libera venda bloqueada e reabre despesca.</p>
      ${[['desp','🐟 Despescas'],['vendas','🧾 Vendas'],['ver','📋 Resumo do dia'],['gest','📊 Gestão']].map(([k,t])=>`<div><label>${t}</label><input type="text" inputmode="numeric" maxlength="8" id="sn_${k}" value="${esc(senhaDe(k))}" autocomplete="off" placeholder="sem senha"></div>`).join('')}
      <button class="primary" data-a="salvarSenha">Salvar senhas</button></section>`;return}
  if(gq.sub==='emp'){const P=cad.params;el.innerHTML=`<section class="panel"><h2>Empresa (nas notas e relatórios)</h2><div><label>Empresa</label><input type="text" id="pEmp" value="${esc(P.empresa)}"></div><div><label>Unidade</label><input type="text" id="pUni" value="${esc(P.unidade)}"></div><div><label>Contato no rodapé (telefone, PIX)</label><input type="text" id="pCont" value="${esc(P.contato||'')}"></div><button class="primary" data-a="salvarEmp">Salvar</button></section>`;return}
  const idx=[].concat(mapa[gq.sub]);
  secs.forEach((s,i)=>{if(!idx.includes(i))s.remove()});
  if(gq.sub==='venda'){el.querySelectorAll('#pEmp,#pUni,#pCont').forEach(i=>i.parentNode.remove())}
};
const _acConf=ACOES.gconf;
ACOES.gconf=Object.assign({},_acConf,{
  sub(v){gq.sub=v;render();window.scrollTo(0,0)},
  salvarP(){const P=cad.params;P.prazo=Math.max(0,parseInt($('pPrazo').value)||0);P.tolerancia=Math.max(0,parseInt($('pTol').value)||0);P.alerta=$('pAlerta').checked;P.bloquear=$('pBloq').checked;P.alt=agora();salvarCad('Parâmetros salvos')},
  salvarEmp(){const P=cad.params;P.empresa=$('pEmp').value.trim()||'FJK AGROPECUÁRIA';P.unidade=$('pUni').value.trim()||'Piscicultura';P.contato=$('pCont').value.trim();P.alt=agora();salvarCad('Salvo')},
  salvarSenha(){const S={};Object.keys(SENHAS_PADRAO).forEach(k=>{S[k]=$('sn_'+k).value.replace(/\D/g,'')});cad.params.senhas=S;cad.params.alt=agora();try{Object.keys(SENHAS_PADRAO).forEach(k=>localStorage.removeItem('pc_senhaOk_'+k))}catch(e){}salvarCad('Senhas salvas');gq.sub='';render()}});
/* o ❮ e o "voltar" da barra: dentro de um quadro da Config. voltam para os quadros */
const _paiDe=paiDe;
$('btnVoltar').onclick=$('barraVoltar').onclick=e=>{if(e)e.stopPropagation();if(tela==='gconf'&&gq.sub){gq.sub='';render();return}ir(paiDe(tela))};
/* tocar em qualquer lugar da barra volta para o menu anterior */
$('barra').onclick=e=>{if(e.target.closest('#barraVoltar'))return;if(tela==='gconf'&&gq.sub){gq.sub='';render();return}ir(paiDe(tela))};

setInterval(()=>{if(tela==='ver'&&document.visibilityState==='visible')carregar()},30000);

/* =====================================================================
   DATAS: em todo lugar a data tem ◀ ▶ dos lados (passa 1 dia para trás/frente)
   e tocar na data abre o calendário para escolher
   ===================================================================== */
function poeSetasData(raiz){(raiz||document).querySelectorAll('input[type=date]').forEach(i=>{if(i.closest('.diaNav,.dSetas'))return;
  const alvo=i.parentNode&&i.parentNode.classList.contains('dataBox')?i.parentNode:i;
  const w=document.createElement('div');w.className='dSetas';alvo.parentNode.insertBefore(w,alvo);
  const b=d=>{const x=document.createElement('button');x.type='button';x.className='gSeta';x.dataset.dseta=d;x.textContent=d<0?'◀':'▶';x.setAttribute('aria-label',d<0?'Dia anterior':'Próximo dia');return x};
  w.append(b(-1),alvo,b(1))})}
new MutationObserver(ms=>{for(const m of ms)for(const n of m.addedNodes)if(n.nodeType===1&&(n.matches('input[type=date]')||n.querySelector('input[type=date]'))){poeSetasData(n.parentNode||n);}}).observe(document.body,{childList:true,subtree:true});
poeSetasData();
document.addEventListener('click',e=>{const b=e.target.closest('[data-dseta]');if(b){e.preventDefault();e.stopPropagation();const i=b.parentNode.querySelector('input[type=date]');const v=i.value||chaveDia();i.value=somaDias(v,Number(b.dataset.dseta));
    i.dispatchEvent(new Event('input',{bubbles:true}));i.dispatchEvent(new Event('change',{bubbles:true}));return}
  const i=e.target.closest('input[type=date]');if(!i)return;
  if(matchMedia('(hover:hover) and (pointer:fine)').matches){e.preventDefault();e.stopPropagation();abrirCalendario(i);return}
  if(i.showPicker){try{i.showPicker()}catch(x){}}},true);
/* no computador: calendário próprio (o do navegador nem sempre abre ao clicar) */
document.addEventListener('mousedown',e=>{const i=e.target.closest&&e.target.closest('input[type=date]');if(i&&matchMedia('(hover:hover) and (pointer:fine)').matches)e.preventDefault()},true);
document.addEventListener('keydown',e=>{const i=e.target;if(i&&i.matches&&i.matches('input[type=date]')&&(e.key==='Enter'||e.key===' ')&&matchMedia('(pointer:fine)').matches){e.preventDefault();abrirCalendario(i)}},true);
const MESES_CAL=['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
function abrirCalendario(inp){const sel=inp.value||chaveDia();let [y,m]=sel.split('-').map(Number);m--;
  janela('<div class="cal"></div>',(j,fechar)=>{const box=j.querySelector('.cal');
    const pinta=()=>{const ini=new Date(y,m,1),dow=(ini.getDay()+6)%7,nd=new Date(y,m+1,0).getDate(),hj=chaveDia();let c='';
      for(let k=0;k<dow;k++)c+='<span></span>';
      for(let d=1;d<=nd;d++){const k=`${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;c+=`<button type="button" data-d="${k}" class="${k===sel?'sel':''} ${k===hj?'hoje':''}">${d}</button>`}
      box.innerHTML=`<div class="calCab"><button type="button" data-m="-1">◀</button><b>${MESES_CAL[m]} ${y}</b><button type="button" data-m="1">▶</button></div>
        <div class="calSem">${['S','T','Q','Q','S','S','D'].map(x=>`<span>${x}</span>`).join('')}</div><div class="calDias">${c}</div>
        <div class="row"><button type="button" data-x="hoje">Hoje</button><button type="button" data-x="fechar">Fechar</button></div>`};
    pinta();
    box.onclick=e=>{const b=e.target.closest('button');if(!b)return;e.stopPropagation();
      if(b.dataset.m){m+=Number(b.dataset.m);if(m<0){m=11;y--}if(m>11){m=0;y++}pinta();return}
      if(b.dataset.x==='fechar'){fechar();return}
      const v=b.dataset.x==='hoje'?chaveDia():b.dataset.d;if(!v)return;fechar();inp.value=v;inp.dispatchEvent(new Event('input',{bubbles:true}));inp.dispatchEvent(new Event('change',{bubbles:true}))}},'calJan')}


/* =====================================================================
   DESPESCAS EFETIVADAS: relação dos bags lançados (filtro de período, despesca e tanque)
   ===================================================================== */
const gq2={per:'7',de:'',ate:'',desp:'',tq:''};
ENTRAR.gdesp=()=>{aplicaPer(gq2,'7');gq2.desp='';gq2.tq=''};
function bagsFiltro(){return db.bags.filter(b=>(gq2.desp?b.despescaId===gq2.desp:naFaixa(b.data,gq2.de,gq2.ate))&&(!gq2.tq||b.tanque===gq2.tq)).sort((a,b)=>b.data.localeCompare(a.data)||String(b.registradoEm).localeCompare(String(a.registradoEm)))}
RENDER.gdesp=()=>{const l=bagsFiltro(),r=resumoBags(l),tqs=[...new Set(db.bags.map(b=>b.tanque))].sort(ordTxt);
  let h=`<section class="panel"><h2>Filtros</h2>${gq2.desp?'':perHtml(gq2)}${despSelHtml(gq2.desp,true,'Despesca')}${selSetas('Tanque / viveiro','tq',[['','Todos os tanques']].concat(tqs.map(t=>[t,t])),gq2.tq)}</section>
   <section class="panel">${titNovo('Despescas efetivadas','novoBag')}<div class="stat"><div><small>Bags</small><b class="num">${r.n}</b></div><div><small>Kg despescado</small><b class="num">${fmtKg(r.kg)}</b></div><div><small>Peixes</small><b class="num">${r.q?fmtI(r.q):'—'}</b></div></div>`;
  const porT=Object.values(l.reduce((o,b)=>{const x=b.tanque+' · '+b.produto;(o[x]=o[x]||{k:x,l:[]}).l.push(b);return o},{})).map(x=>({k:x.k,...resumoBags(x.l)})).sort((a,b)=>b.kg-a.kg);
  if(porT.length)h+=tabHtml(['Tanque · peixe','Bags','Kg'],porT.map(x=>[x.k,String(x.n),fmtKg(x.kg)]));
  let dia='';l.forEach(b=>{if(b.data!==dia){dia=b.data;const dv=resumoBags(l.filter(x=>x.data===dia));h+=`<div class="dia"><span>${nomeDia(dia)}, ${fmtData(dia)}</span><span>${dv.n} bags · ${fmtKg(dv.kg)} kg</span></div>`}
    h+=`<button class="reg" data-a="ed" data-v="${b.id}"><div><span class="eqn">${esc(b.tanque)} · ${esc(b.produto)}</span><div class="faz">${fmtHora(b.registradoEm)}${b.lancadoPor?' · '+esc(b.lancadoPor):''}${b.qtd?' · '+fmtI(b.qtd)+' peixes':''}</div>${b.obs?`<div class="obs">${esc(b.obs)}</div>`:''}</div><div class="lt">${fmtKg(b.peso)}<small>kg</small></div></button>`});
  if(!l.length)h+='<div class="vazio">Nenhuma despesca no filtro.</div>';
  h+=`${l.length?botoesExp():''}<p class="note">Toque num bag para ver, editar ou excluir.</p></section>`;
  $('t-gdesp').innerHTML=h};
CAMPOS.gdesp=(f,el)=>{if(f==='de'||f==='ate'){gq2[f]=el.value;gq2.per='';ajustaPar(gq2,f);render();return}if(f==='desp'){gq2.desp=el.value;render();return}if(f==='tq'){gq2.tq=el.value;render()}};
ACOES.gdesp={per(v){aplicaPer(gq2,v);render()},novoBag(){if(!quem()){escolherQuem(()=>ir('desp'));return}ir('desp')},ed(id){const b=db.bags.find(x=>x.id===id);if(b)editarBag(b)},
  exp(t){const d=gq2.desp&&despPorId(gq2.desp),de=d?d.ini:gq2.de,ate=d?d.fim:gq2.ate,l=bagsFiltro().slice().reverse(),x=resumoBags(l);
    const r={titulo:'Despescas efetivadas',sub:[d?d.descricao:rotPer(de,ate),gq2.tq?'Tanque '+gq2.tq:''].filter(Boolean),xlsNome:'Despescas',blocos:[{kv:[['Bags',String(x.n)],['Peso líquido',fmtKg(x.kg)+' kg',null,true],['Peixes',x.q?fmtI(x.q):'—']]},
      {tit:'Bags',cols:[{t:'Data',w:11},{t:'Hora',w:8},{t:'Tanque',w:18},{t:'Peixe',w:16},{t:'Kg',w:11,al:'r'},{t:'Peixes',w:9,al:'r'},{t:'Lançado por',w:14}],linhas:l.map(b=>[fmtData(b.data),fmtHora(b.registradoEm),b.tanque,b.produto,fmtKg(b.peso),b.qtd?fmtI(b.qtd):'',b.lancadoPor||'']),total:['TOTAL','','','',fmtKg(x.kg),x.q?fmtI(x.q):'','']}]};
    return exportarRel(r,t,`Despescas ${(d?d.descricao.replace(/^.*\((.*)\)$/,'$1'):rotPer(de,ate)).replace(/\//g,'-')}`)}};

/* =====================================================================
   RECEBIMENTOS: relação do que foi recebido (filtro de período, cliente e forma)
   ===================================================================== */
const gr2={per:'7',de:'',ate:'',cli:'',forma:''};
ENTRAR.greceb=()=>{aplicaPer(gr2,'7');gr2.cli='';gr2.forma=''};
const recFiltro=()=>db.receb.filter(r=>naFaixa(r.data,gr2.de,gr2.ate)&&(!gr2.cli||r.clienteId===gr2.cli)&&(!gr2.forma||r.forma===gr2.forma)).sort((a,b)=>b.data.localeCompare(a.data)||String(b.registradoEm||'').localeCompare(String(a.registradoEm||'')));
RENDER.greceb=()=>{const l=recFiltro(),tot=r2(l.reduce((s,r)=>s+Number(r.valor||0),0));
  const clis=[...new Map(db.receb.map(r=>[r.clienteId,r.cliente])).entries()].sort((a,b)=>ordTxt(a[1],b[1])),formas=[...new Set(db.receb.map(r=>r.forma).filter(Boolean))].sort(ordTxt);
  const pf={};l.forEach(r=>pf[r.forma||'—']=r2((pf[r.forma||'—']||0)+Number(r.valor)));
  let h=`<section class="panel"><h2>Filtros</h2>${perHtml(gr2)}${selSetas('Cliente','cli',[['','Todos os clientes']].concat(clis),gr2.cli)}${selSetas('Forma de pagamento','forma',[['','Todas as formas']].concat(formas.map(f=>[f,f])),gr2.forma)}</section>
   <section class="panel">${titNovo('Recebimentos','novoRec')}<div class="stat"><div><small>Recebimentos</small><b class="num">${l.length}</b></div><div><small>Total recebido</small><b class="num pos">${fmtR(tot).replace('R$ ','')}</b></div></div>
   ${Object.keys(pf).length>1?`<div class="kv">${Object.entries(pf).map(([k,v])=>`<div><span>${esc(k)}</span><b>${fmtR(v)}</b></div>`).join('')}</div>`:''}`;
  let dia='';l.forEach(r=>{if(r.data!==dia){dia=r.data;h+=`<div class="dia"><span>${nomeDia(dia)}, ${fmtData(dia)}</span><span>${fmtR(r2(l.filter(x=>x.data===dia).reduce((s,x)=>s+Number(x.valor),0)))}</span></div>`}
    h+=`<button class="reg" data-a="ed" data-v="${r.id}"><div><span class="eqn">${esc(r.cliente)}</span><div class="faz">${esc(r.forma||'')}${r.doc?' · '+esc(r.doc):''}${r.vendedor?' · '+esc(r.vendedor):''}</div>${r.obs?`<div class="obs">${esc(r.obs)}</div>`:''}</div><div class="lt mais">${fmtR(r.valor)}</div></button>`});
  if(!l.length)h+='<div class="vazio">Nenhum recebimento no filtro.</div>';
  h+=`${l.length?botoesExp():''}<p class="note">Toque num recebimento para ver, editar ou excluir.</p></section>`;
  $('t-greceb').innerHTML=h};
CAMPOS.greceb=(f,el)=>{if(f==='de'||f==='ate'){gr2[f]=el.value;gr2.per='';ajustaPar(gr2,f);render();return}if(f==='cli'||f==='forma'){gr2[f]=el.value;render()}};
ACOES.greceb={per(v){aplicaPer(gr2,v);render()},novoRec(){if(!quem()){escolherQuem(()=>ir('rec'));return}ir('rec')},ed(id){const r=db.receb.find(x=>x.id===id);if(r)editarReceb(r)},
  exp(t){const l=recFiltro().slice().reverse(),tot=r2(l.reduce((s,r)=>s+Number(r.valor||0),0)),c=gr2.cli&&cliPorId(gr2.cli);
    const r={titulo:'Recebimentos',sub:[rotPer(gr2.de,gr2.ate),c?c.nome:'',gr2.forma].filter(Boolean),xlsNome:'Recebimentos',blocos:[{kv:[['Recebimentos',String(l.length)],['Total recebido',fmtR(tot),'#1f8f4e',true]]},
      {cols:[{t:'Data',w:11},{t:'Cliente',w:32},{t:'Forma',w:14},{t:'Doc.',w:12},{t:'Vendedor',w:14},{t:'Valor',w:14,al:'r'}],linhas:l.map(r=>[fmtData(r.data),r.cliente,r.forma||'',r.doc||'',r.vendedor||'',fmtR(r.valor)]),total:['TOTAL','','','','',fmtR(tot)]}]};
    return exportarRel(r,t,`Recebimentos ${rotPer(gr2.de,gr2.ate).replace(/\//g,'-')}`)}};

/* ---------- início ---------- */
marcaAtualizado();marcaQuem();statusNuvem();carregar();
if('serviceWorker' in navigator)navigator.serviceWorker.register('sw.js').catch(()=>{});
