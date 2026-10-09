import {SCENES,NODES,REGIONS} from './data.js';
import {packetFor,fieldEvidence} from './packet.js';
const $=id=>document.getElementById(id);
const SVGNS='http://www.w3.org/2000/svg';
const create=(tag,attrs={},value)=>{const n=document.createElement(tag);for(const [k,v] of Object.entries(attrs)){if(k==='class')n.className=v;else n.setAttribute(k,v)}if(value!==undefined)n.textContent=value;return n};
const sv=(tag,attrs={},value)=>{const n=document.createElementNS(SVGNS,tag);for(const [k,v] of Object.entries(attrs))n.setAttribute(k,v);if(value!==undefined)n.textContent=value;return n};
const select=(base,step,initial=false)=>{const s=SCENES.findIndex(a=>a.id===base);return {scene:s<0?0:s,step:Math.max(0,Math.min(SCENES[s<0?0:s].steps.length-1,(Number(step)||1)-1))}};
const hash=location.hash.slice(1).split('/');const start=select(hash[0],hash[1]);
const state={scene:start.scene,step:start.step,playing:false,timer:null,speed:1,zoom:1,mode:'original',paperURL:null,follow:true,quizReveal:false,layer:0,toastTimer:null};
const scene=()=>SCENES[state.scene];const step=()=>scene().steps[state.step];
// The clean, unannotated teaching topology extracted from the source user's original HTML.
const cleanSource='./assets/wangdao-original-clean.jpg';
const palette={main:'#1489a3',broadcast:'#d49a3f',reply:'#c47283',muted:'#9aaeb0'};
function toast(text){$('toast').textContent=text;$('toast').classList.remove('hidden');clearTimeout(state.toastTimer);state.toastTimer=setTimeout(()=>$('toast').classList.add('hidden'),2500)}
function renderNav(){const parent=$('nav');parent.replaceChildren();const q=$('search').value.trim().toLowerCase();let group='';SCENES.forEach((s,i)=>{if(q&&!`${s.title} ${s.group} ${s.tag} ${s.lead}`.toLowerCase().includes(q))return;if(group!==s.group){group=s.group;parent.append(create('div',{class:'nav-group'},group))}const b=create('button',{class:'nav-button','aria-current':String(state.scene===i)});b.append(create('span',{class:'nav-number'},String(i+1).padStart(2,'0')));const t=create('div');t.append(create('div',{class:'nav-title'},s.title),create('span',{class:'nav-steps'},`${s.steps.length} 个推演步骤`));b.append(t);b.onclick=()=>{pause();state.scene=i;state.step=0;state.zoom=1;state.layer=0;renderAll()};parent.append(b)});$('stat').textContent=`${SCENES.length} / ${SCENES.reduce((n,s)=>n+s.steps.length,0)}`;}
function setHash(){const target=`#${scene().id}/${state.step+1}`;if(location.hash!==target){try{history.replaceState(null,'',target)}catch{/* Some file:// browsers restrict history updates. The site still runs. */}}}
function renderAll(){const s=scene(),st=step();setHash();renderNav();$('title').textContent=s.title;$('subtitle').textContent=s.lead;$('category').textContent=s.group;$('source').textContent=s.tag;$('stepTitle').textContent=st.title;$('stepCount').textContent=`${String(state.step+1).padStart(2,'0')} / ${String(s.steps.length).padStart(2,'0')}`;$('stageCounter').textContent=`STEP ${String(state.step+1).padStart(2,'0')} / ${String(s.steps.length).padStart(2,'0')}`;$('pktStep').textContent=`STEP ${String(state.step+1).padStart(2,'0')}`;$('description').textContent=st.caption;$('why').textContent=st.why;$('btnPrev').disabled=state.step===0;$('btnNext').disabled=state.step===s.steps.length-1;$('btnPlay').innerHTML=state.playing?'Ⅱ <span>暂停推演</span>':'▶ <span>播放推演</span>';renderTimeline();renderBoard();renderPacket();renderEvidence()}
function renderTimeline(){const root=$('timeline');root.replaceChildren();scene().steps.forEach((s,i)=>{const b=create('button',{class:`step-marker${i===state.step?' now':i<state.step?' done':''}`,title:s.title,'aria-label':`${i+1}. ${s.title}`},String(i+1).padStart(2,'0'));b.onclick=()=>move(i);root.append(b)});root.children[state.step]?.scrollIntoView({block:'nearest',inline:'nearest',behavior:'auto'});}
function move(i){if(i<0||i>=scene().steps.length){pause();return;}state.step=i;state.layer=0;renderAll()}
function pause(){state.playing=false;clearInterval(state.timer);state.timer=null;$('btnPlay').innerHTML='▶ <span>播放推演</span>'}
function play(){if(state.playing){pause();return;}if(state.step===scene().steps.length-1)state.step=0;state.playing=true;renderAll();state.timer=setInterval(()=>{if(state.step>=scene().steps.length-1){pause();renderAll()}else move(state.step+1)},Math.round(2900/state.speed));}
function viewBox(){
 const region=scene().region;
 let box=state.follow ? [...(REGIONS[region]||REGIONS.all)] : [0,0,1448,1024];
 if(state.follow && region!=='all') box=[Math.max(0,box[0]-55),Math.max(0,box[1]-55),Math.min(1448,box[2]+110),Math.min(1024,box[3]+110)];
 const [x,y,w,h]=box, rw=Math.min(1448,w/state.zoom), rh=Math.min(1024,h/state.zoom);
 return [Math.max(0,Math.min(1448-rw,x+w/2-rw/2)),Math.max(0,Math.min(1024-rh,y+h/2-rh/2)),rw,rh];
}
function placeholderNode(board,id,title,width=78){
 const point=NODES[id];if(!point)return;
 const [x,y]=point;
 board.append(sv('rect',{x:x-width/2,y:y-17,width,height:34,rx:7,fill:'#fff9e8',stroke:'#d38b4b','stroke-width':2,'stroke-dasharray':'5 3'}));
 board.append(sv('text',{x,y:y+5,'text-anchor':'middle','font-size':14,'font-weight':700,fill:'#914819'},title));
}
function renderBoard(){
 const board=$('board');board.replaceChildren();board.setAttribute('viewBox',viewBox().join(' '));
 board.append(sv('image',{href:state.mode==='paper'&&state.paperURL?state.paperURL:cleanSource,x:0,y:0,width:1448,height:1024,preserveAspectRatio:'none'}));
 // Nodes H0 and DNS are added by the tutorial but were not printed in the unannotated original.
 if(state.mode!=='paper'){
  if(scene().steps.some(st=>st.paths.some(p=>p.nodes.includes('h0')))) placeholderNode(board,'h0','H0 · 新机');
  if(scene().id==='dns') placeholderNode(board,'dns','本地 DNS',88);
 }
 const visited=new Set(step().paths.flatMap(p=>[p.nodes[0],p.nodes[p.nodes.length-1]]));
 for(const id of visited){const xy=NODES[id];if(xy)board.append(sv('circle',{cx:xy[0],cy:xy[1],r:17,stroke:'#07898a','stroke-width':2,fill:'#35c2be','fill-opacity':'.10','vector-effect':'non-scaling-stroke'}))}
 const drawn=sv('g',{'aria-hidden':'true'});board.append(drawn);
 for(const path of step().paths){
  const pts=path.nodes.map(n=>NODES[n]).filter(Boolean);if(pts.length<2)continue;
  const d='M'+pts.map(p=>p.join(',')).join(' L');const color=palette[path.kind]||palette.main;
  drawn.append(sv('path',{d,stroke:color,'stroke-width':path.kind==='muted'?2.5:3.8,fill:'none','stroke-linecap':'round','stroke-linejoin':'round','stroke-dasharray':path.kind==='muted'?'4 8':'9 6','vector-effect':'non-scaling-stroke'}));
  const dot=sv('circle',{r:6,fill:color,stroke:'#fff','stroke-width':2,'vector-effect':'non-scaling-stroke'});
  dot.append(sv('animateMotion',{path:d,dur:`${(1.8/state.speed).toFixed(2)}s`,repeatCount:'indefinite',calcMode:'paced'}));drawn.append(dot);
 }
}
function renderPacket(){
 const p=packetFor(scene(),state.step),panel=$('packetPanel'),root=$('packetDiagram');
 const hasPacket=p.layers.length>0;
 panel.classList.toggle('hidden',!hasPacket);
 root.replaceChildren();
 if(!hasPacket)return; // No placeholder explanations for non-packet steps.
 state.layer=Math.max(0,Math.min(state.layer,p.layers.length-1));
 let nested=null;
 for(let i=p.layers.length-1;i>=0;i--){
  const layer=p.layers[i];const kind=/以太网|802\.11/.test(layer.title)?'link':/网络层|IPv4/.test(layer.title)?'network':/传输层/.test(layer.title)?'transport':'application';
  const box=create('section',{class:`envelope ${kind}${state.layer===i?' active':''}`});
  const h=create('button',{class:'envelope-head','aria-label':`查看${layer.title}详情`});
  const title=create('span',{class:'layer-name'});title.append(create('span',{},layer.title),create('small',{},({link:'L2',network:'L3',transport:'L4',application:'APP'})[kind]));
  const addr=create('span',{class:'layer-address'});addr.append(create('span',{class:'from'},layer.from),create('span',{class:'arrow'},'→'),create('span',{class:'to'},layer.to));
  h.append(title,addr);h.onclick=()=>{state.layer=i;renderPacket()};box.append(h);
  if(nested){const nest=create('div',{class:'layer-nest'});nest.append(nested);box.append(nest)}
  nested=box;
 }
 root.append(nested);
 const detail=$('layerContent'),layer=p.layers[state.layer];detail.replaceChildren();
 detail.append(create('b',{},layer.title),create('div',{},`${layer.detail}：${layer.from} → ${layer.to}`));
 for(const [key,val] of layer.extras||[])detail.append(create('div',{},`${key}：${val}`));
}
function renderEvidence(){const st=step(),root=$('fields');root.replaceChildren();for(const [key,src,dst,desc] of fieldEvidence(st)){const d=create('div',{class:'evidence-row'});d.append(create('div',{class:'evidence-key'},key));const vals=create('div',{class:'evidence-values'});vals.append(create('strong',{},String(src)),create('span',{},'→'),create('strong',{},String(dst)));d.append(vals);if(desc)d.append(create('div',{class:'evidence-desc'},desc));root.append(d)}
 const table=$('tablezone');table.replaceChildren();if(st.table){const box=create('div',{class:'info-table'});box.append(create('div',{class:'info-table-caption'},st.table.title));const tab=create('table');const head=create('tr');for(const h of st.table.head)head.append(create('th',{},h));tab.append(head);for(const row of st.table.rows){const tr=create('tr');for(const val of row)tr.append(create('td',{},String(val)));tab.append(tr)}box.append(tab);table.append(box)}
 const note=$('notice');note.textContent=st.notes||'';note.classList.toggle('hidden',!st.notes);const quiz=$('quiz');quiz.replaceChildren();quiz.classList.toggle('hidden',!st.quiz);if(st.quiz){quiz.append(create('div',{class:'detail-label'},'408 SELF CHECK'),create('div',{},st.quiz[0]));const answer=create('div',{class:'quiz-answer hidden'},st.quiz[1]);const button=create('button',{},'显示答案');button.onclick=()=>{const hidden=answer.classList.toggle('hidden');button.textContent=hidden?'显示答案':'隐藏答案'};quiz.append(button,answer)}}
$('search').addEventListener('input',renderNav);$('btnPrev').onclick=()=>move(state.step-1);$('btnNext').onclick=()=>move(state.step+1);$('btnPlay').onclick=play;$('reset').onclick=()=>{pause();move(0)};
$('speed').onchange=e=>{const on=state.playing;if(on)pause();state.speed=Number(e.target.value);renderBoard();if(on)play()};$('follow').onchange=e=>{state.follow=e.target.checked;renderBoard()};
$('originalMode').onclick=()=>setMode('original');$('paperMode').onclick=()=>setMode('paper');
function setMode(mode){
 if(mode==='paper'&&!state.paperURL){$('paperUpload').click();return;}
 state.mode=mode;
 $('originalMode').classList.toggle('selected',mode==='original');$('paperMode').classList.toggle('selected',mode==='paper');
 $('originalMode').setAttribute('aria-pressed',String(mode==='original'));$('paperMode').setAttribute('aria-pressed',String(mode==='paper'));
 $('paperControls').classList.toggle('hidden',mode!=='paper');renderBoard();
}
$('paperUpload').onchange=e=>{const f=e.target.files?.[0];if(!f)return;
 if(!f.type.startsWith('image/')){toast('请选择图片文件');return;}
 if(state.paperURL)URL.revokeObjectURL(state.paperURL);
 state.paperURL=URL.createObjectURL(f);setMode('paper');
};
function adjustZoom(mult){state.zoom=Math.max(.75,Math.min(3.6,state.zoom*mult));renderBoard()};$('zplus').onclick=()=>adjustZoom(1.3);$('zminus').onclick=()=>adjustZoom(1/1.3);$('zreset').onclick=()=>{state.zoom=1;renderBoard()};
$('share').onclick=()=>{const url=location.href;if(navigator.clipboard?.writeText){navigator.clipboard.writeText(url).then(()=>toast('当前步骤链接已复制')).catch(()=>prompt('复制这个链接：',url));}else prompt('复制这个链接：',url)};
window.addEventListener('hashchange',()=>{const [id,n]=location.hash.slice(1).split('/');const p=select(id,n);pause();state.scene=p.scene;state.step=p.step;renderAll()});
document.addEventListener('keydown',e=>{if(['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName))return;if(e.key==='ArrowRight'){e.preventDefault();move(state.step+1)}else if(e.key==='ArrowLeft'){e.preventDefault();move(state.step-1)}else if(e.key===' '){e.preventDefault();play()}});
renderAll();
