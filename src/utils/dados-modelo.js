export function agrupar(rows,campo='categoria'){
  const grupos=new Map();for(const r of rows){const k=r[campo],v=grupos.get(k);grupos.set(k,r.valor===null||v===null?null:(v??0)+r.valor);}return [...grupos].map(([categoria,valor])=>({categoria,valor}));
}
export function serieAnual(rows){if(!rows.length)return [];const m=new Map(rows.map(r=>[r.ano,r.valor])),anos=rows.map(r=>r.ano),min=Math.min(...anos);return Array.from({length:Math.max(...anos)-min+1},(_,i)=>({data:`${min+i}-07-01`,ano:min+i,valor:m.has(min+i)?m.get(min+i):null}));}
export function gerarCSV(rows,source,queryId){
  const campos=[...new Set(rows.flatMap(r=>Object.keys(r)))].filter(k=>k!=='geometria');
  const meta=['consulta','fonte','periodo_fonte','coletado_em','url_fonte','unidade','municipio','codigo_ibge','recorte','limitacoes'];
  const unidade=source.metricDefinitions?.find(d=>d.label==='Unidade')?.definition??'Consultar unidade nas colunas e na fonte';
  const base=[queryId,source.label,source.period,source.executedAt,source.links?.[0]?.href??'',unidade,'Unaí (MG)','3170404',source.filters?.join(' | ')??'',source.assumptions?.join(' | ')??''];
  const celula=v=>{if(v==null)return '';let t=typeof v==='number'?String(v).replace('.',','):String(v);if(typeof v==='string'&&/^[\s]*[=+@-]/.test(t))t="'"+t;return /[;"\r\n]/.test(t)?'"'+t.replaceAll('"','""')+'"':t;};
  return '\ufeff'+[meta.concat(campos).map(celula).join(';'),...rows.map(r=>base.concat(campos.map(k=>r[k])).map(celula).join(';'))].join('\r\n');
}
export function separarPeriodos(rows){return {completos:rows.filter(r=>!r.parcial),parciais:rows.filter(r=>r.parcial)};}
export function formatarMedida(valor,moeda=false){return valor==null?'—':new Intl.NumberFormat('pt-BR',moeda?{style:'currency',currency:'BRL'}:{maximumFractionDigits:0}).format(valor);}
export function projetarMalha(geo){
  const rings=[];for(const f of geo.features??[]){if(f.geometry?.type==='Polygon')rings.push(...f.geometry.coordinates);if(f.geometry?.type==='MultiPolygon')for(const p of f.geometry.coordinates)rings.push(...p);}
  if(!rings.length)return null;const merc=([lon,lat])=>[lon*Math.PI/180,-Math.log(Math.tan(Math.PI/4+lat*Math.PI/360))],coords=rings.map(r=>r.map(merc)),all=coords.flat(),xs=all.map(c=>c[0]),ys=all.map(c=>c[1]),x0=Math.min(...xs),y0=Math.min(...ys),dx=Math.max(...xs)-x0,dy=Math.max(...ys)-y0,s=Math.min(540/dx,300/dy),ox=(600-dx*s)/2,oy=(360-dy*s)/2;
  return {path:coords.map(r=>r.map((c,i)=>`${i?'L':'M'}${(ox+(c[0]-x0)*s).toFixed(2)},${(oy+(c[1]-y0)*s).toFixed(2)}`).join(' ')+' Z').join(' ')};
}
export function filtrarServicos(rows,grupo='all',busca=''){
  const normalizar=t=>String(t??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const texto=normalizar(busca).trim();
  return rows.filter(r=>(grupo==='all'||r.grupo===grupo)&&(!texto||normalizar([r.codigo,r.nome,r.bairro,r.endereco].join(' ')).includes(texto)));
}
export function posicionarRaster(rasterBounds,mapBounds,width=700,height=480,padding=32){
  if(!Array.isArray(rasterBounds)||!Array.isArray(mapBounds)||rasterBounds.length!==4||mapBounds.length!==4||
    ![...rasterBounds,...mapBounds,width,height,padding].every(Number.isFinite))return null;
  const [x0,y0,x1,y1]=mapBounds,dx=x1-x0,dy=y1-y0;
  if(!(dx>0&&dy>0&&width>padding*2&&height>padding*2))return null;
  const scale=Math.min((width-padding*2)/dx,(height-padding*2)/dy),ox=(width-dx*scale)/2,oy=(height-dy*scale)/2;
  const [rx0,ry0,rx1,ry1]=rasterBounds;
  if(!(rx1>rx0&&ry1>ry0))return null;
  return {x:ox+(rx0-x0)*scale,y:height-oy-(ry1-y0)*scale,width:(rx1-rx0)*scale,height:(ry1-ry0)*scale};
}
export function projetarCamadas(limite,urbano,pontos,{width=700,height=440,bounds,padding=32}={}){
  const aneis=geo=>(geo?.features??[]).flatMap(f=>f.geometry?.type==='Polygon'?f.geometry.coordinates:f.geometry?.type==='MultiPolygon'?f.geometry.coordinates.flat():[]);
  const rings=aneis(limite),all=rings.flat();if(!all.length)return null;
  const b=bounds??[Math.min(...all.map(c=>c[0])),Math.min(...all.map(c=>c[1])),Math.max(...all.map(c=>c[0])),Math.max(...all.map(c=>c[1]))];
  const [x0,y0,x1,y1]=b,dx=x1-x0,dy=y1-y0;if(!(dx>0&&dy>0&&width>padding*2&&height>padding*2))return null;
  const s=Math.min((width-padding*2)/dx,(height-padding*2)/dy),ox=(width-dx*s)/2,oy=(height-dy*s)/2;
  const xy=([x,y])=>[ox+(x-x0)*s,height-oy-(y-y0)*s];
  const path=rs=>rs.map(r=>r.map((c,i)=>{const [x,y]=xy(c);return `${i?'L':'M'}${x.toFixed(2)},${y.toFixed(2)}`;}).join(' ')+' Z').join(' ');
  return {limite:path(rings),urbano:path(aneis(urbano)),bounds:b,metrosPorPixel:1/s,pontos:pontos.filter(p=>Number.isFinite(p.x)&&Number.isFinite(p.y)&&p.x>=x0&&p.x<=x1&&p.y>=y0&&p.y<=y1).map(p=>{const [px,py]=xy([p.x,p.y]);return {...p,px,py};})};
}
export function agruparMarcadores(pontos,raio=22){
  const grupos=[];
  for(const p of pontos){const g=grupos.find(g=>Math.hypot(g.px-p.px,g.py-p.py)<raio);
    if(g)g.pontos.push(p);else grupos.push({px:p.px,py:p.py,pontos:[p]});}
  return grupos;
}
function escalaBounds(bounds,width,height,padding=32){
  if(!Array.isArray(bounds)||bounds.length!==4||![...bounds,width,height,padding].every(Number.isFinite))return null;
  const [x0,y0,x1,y1]=bounds,dx=x1-x0,dy=y1-y0;
  if(!(dx>0&&dy>0&&width>padding*2&&height>padding*2))return null;
  return {s:Math.min((width-padding*2)/dx,(height-padding*2)/dy),ox:0,oy:0,dx,dy,x0,y0};
}
export function geografiaNoPixel(bounds,pixel,width=700,height=480,padding=32){
  if(!Array.isArray(pixel)||pixel.length!==2||!pixel.every(Number.isFinite))return null;
  const t=escalaBounds(bounds,width,height,padding);if(!t)return null;
  const ox=(width-t.dx*t.s)/2,oy=(height-t.dy*t.s)/2;
  return [t.x0+(pixel[0]-ox)/t.s,t.y0+(height-oy-pixel[1])/t.s];
}
export function centroAposZoom(bounds,zoomAtual,centroAtual,pixel,zoomNovo,width=700,height=480,padding=32){
  if(!Array.isArray(bounds)||bounds.length!==4||!Array.isArray(pixel)||pixel.length!==2||
    ![...bounds,zoomAtual,zoomNovo,...pixel,width,height,padding].every(Number.isFinite)||zoomAtual<=0||zoomNovo<=0)return null;
  const cx=centroAtual?.[0]??(bounds[0]+bounds[2])/2,cy=centroAtual?.[1]??(bounds[1]+bounds[3])/2;
  const halfWidth=(bounds[2]-bounds[0])/zoomAtual/2,halfHeight=(bounds[3]-bounds[1])/zoomAtual/2;
  const view=[cx-halfWidth,cy-halfHeight,cx+halfWidth,cy+halfHeight];
  const anchor=geografiaNoPixel(view,pixel,width,height,padding),next=[cx-halfWidth*zoomAtual/zoomNovo,cy-halfHeight*zoomAtual/zoomNovo,cx+halfWidth*zoomAtual/zoomNovo,cy+halfHeight*zoomAtual/zoomNovo];
  const transform=escalaBounds(next,width,height,padding);if(!anchor||!transform)return null;
  const nextScale=transform.s,offsetX=pixel[0]-width/2,offsetY=pixel[1]-height/2;
  return [anchor[0]-offsetX/nextScale,anchor[1]+offsetY/nextScale];
}
export function centroAposArrasto(centro,deltaPixel,metrosPorPixel){
  if(!Array.isArray(centro)||centro.length!==2||!Array.isArray(deltaPixel)||deltaPixel.length!==2||
    ![...centro,...deltaPixel,metrosPorPixel].every(Number.isFinite)||metrosPorPixel<=0)return null;
  return [centro[0]-deltaPixel[0]*metrosPorPixel,centro[1]+deltaPixel[1]*metrosPorPixel];
}
export function limitarCentroNoRaster(baseBounds,zoom,centro,rasterBounds){
  if(!Array.isArray(baseBounds)||!Array.isArray(rasterBounds)||baseBounds.length!==4||rasterBounds.length!==4||
    ![...baseBounds,...rasterBounds,zoom].every(Number.isFinite)||zoom<=0)return null;
  const cx=centro?.[0]??(baseBounds[0]+baseBounds[2])/2,cy=centro?.[1]??(baseBounds[1]+baseBounds[3])/2;
  const clamp=(v,min,max)=>max<min?(min+max)/2:Math.max(min,Math.min(max,v));
  const hx=(baseBounds[2]-baseBounds[0])/zoom/2,hy=(baseBounds[3]-baseBounds[1])/zoom/2;
  return [clamp(cx,rasterBounds[0]+hx,rasterBounds[2]-hx),clamp(cy,rasterBounds[1]+hy,rasterBounds[3]-hy)];
}
export function projetarFeicoes(geo,bounds,width=700,height=480,padding=32){
  const t=escalaBounds(bounds,width,height,padding);if(!t)return [];
  const ox=(width-t.dx*t.s)/2,oy=(height-t.dy*t.s)/2,xy=([x,y])=>[ox+(x-t.x0)*t.s,height-oy-(y-t.y0)*t.s];
  const rings=g=>g?.type==='Polygon'?g.coordinates:g?.type==='MultiPolygon'?g.coordinates.flat():[];
  const asPath=rs=>rs.map(r=>r.map((c,i)=>{const [x,y]=xy(c);return `${i?'L':'M'}${x.toFixed(2)},${y.toFixed(2)}`;}).join(' ')+' Z').join(' ');
  return (geo?.features??[]).map(f=>{
    const rs=rings(f.geometry),coords=rs.flat(),boundsX=coords.map(c=>c[0]),boundsY=coords.map(c=>c[1]);
    if(!coords.length)return null;
    const properties=f.properties??{},lx=Number(properties.label_x),ly=Number(properties.label_y),label=properties.label_x!=null&&properties.label_y!=null&&Number.isFinite(lx)&&Number.isFinite(ly)?xy([lx,ly]):xy([(Math.min(...boundsX)+Math.max(...boundsX))/2,(Math.min(...boundsY)+Math.max(...boundsY))/2]);
    return {path:asPath(rs),nome:String(properties.nome??properties.NM_MUN??''),uf:String(properties.uf??properties.SIGLA_UF??''),px:label[0],py:label[1]};
  }).filter(f=>f?.path);
}
export function rotulosBairro(pontos){
  const porNome=new Map();
  for(const p of pontos){const nome=String(p.bairro??'').trim();if(!nome||!Number.isFinite(p.px)||!Number.isFinite(p.py))continue;
    const grupo=porNome.get(nome)??{nome,px:0,py:0,quantidade:0};grupo.px+=p.px;grupo.py+=p.py;grupo.quantidade++;porNome.set(nome,grupo);}
  return [...porNome.values()].map(g=>({...g,px:g.px/g.quantidade,py:g.py/g.quantidade}));
}
export function rotulosMunicipaisVisiveis(rotulos,width=700,height=480){
  const ocupados=[],visiveis=[];
  const ordenados=[...rotulos].sort((a,b)=>Number(b.nome==='Unaí')-Number(a.nome==='Unaí')||a.nome.localeCompare(b.nome,'pt-BR'));
  for(const r of ordenados){if(!r.nome||!Number.isFinite(r.px)||!Number.isFinite(r.py))continue;
    const w=Math.min(160,Math.max(24,r.nome.length*5.7+10)),h=18,box={x:r.px-w/2,y:r.py-h/2,w,h};
    if(box.x<4||box.y<4||box.x+box.w>width-4||box.y+box.h>height-4)continue;
    if(ocupados.some(b=>box.x<b.x+b.w+4&&box.x+box.w+4>b.x&&box.y<b.y+b.h+3&&box.y+box.h+3>b.y))continue;
    ocupados.push(box);visiveis.push(r);
  }
  return visiveis;
}
