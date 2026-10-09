/** A teaching model, not a captured packet. Never invent unknown header values. */
const layer=(title,from='—',to='—',detail='',extras=[])=>({title,from,to,detail,extras});
const dhcpTypes={1:'DHCPDISCOVER',3:'DHCPOFFER',4:'DHCPREQUEST',5:'DHCPACK'};
// Non-packet events (route lookups, state updates, summaries, cache misses) render no packet panel.
const packetSteps={dhcp:[1,3,4,5],arp:[2,4],tcp:[1,2,3,4,5],encap:[0,1,2,3,4],wifi:[1,2,4,5],fragment:[4,5,6]};
export function packetFor(scene,index){
 const step=scene.steps[index];const id=scene.id;
 const out={layers:[],note:''};
 if(!packetSteps[id]?.includes(index))return out;
 if(id==='dhcp' && dhcpTypes[index]){
  const reply=index===3||index===5;
  const macFrom=reply?'服务器 · …EE09':'H0 · …EE00';
  const macTo=reply?(index===5?'客户端 MAC 或广播（未确定）':'H0 · …EE00'):'FF:FF:FF:FF:FF:FF';
  const ipFrom=reply?'服务器 IP（本例未明确）':'0.0.0.0';
  const ipTo=reply?'客户端 IP / 广播（依分支）':'255.255.255.255';
  out.layers=[
   layer('以太网 · MAC 帧',macFrom,macTo,'源 MAC / 目的 MAC',[['帧类型','Ethernet II（教学抽象）']]),
   layer('网络层 · IPv4',ipFrom,ipTo,'源 IP / 目的 IP',[['说明',reply?'OFFER/ACK 的 IP 目的地址依单播/广播分支而定':'初始地址获取阶段使用广播']]),
   layer('传输层 · UDP',reply?'67':'68',reply?'68':'67','源端口 / 目的端口'),
   layer('应用层 · '+dhcpTypes[index],'DHCP 客户端','DHCP 服务器','DORA 四报文之一',[['拟分配 IP','166.1.0.10/17']])
  ];
  if(reply){out.note='旧动画将 OFFER 表现为单播；ACK 的广播或单播取决于具体条件。源/目的 IP 尚未明确，因此不填造数值。';}
  else{out.note='DHCP 初始请求通常使用 IP 广播和 MAC 广播；交换机只在相同广播域内泛洪。';}
  return out;
 }
 if(id==='arp' && (index===2||index===4)){
  const isReply=index===4;
  out.layers=[layer('以太网 · MAC 帧',isReply?'应答主机 MAC':'发起主机 MAC',isReply?'请求主机 MAC':'FF:FF:FF:FF:FF:FF','ARP 直接封装在以太网帧中'),layer('ARP 报文',isReply?'ARP Reply':'ARP Request',isReply?'单播应答':'广播询问','ARP 不封装在 IPv4 / UDP / TCP 内')];
  out.note='ARP 不是在 IPv4 报文内部再包一层；这里故意只画两层。';return out;
 }
 if(id==='encap'){
  let layers=[];
  if(index>=3){layers.push(layer('以太网 · MAC 帧',index>=4?'本跳发送接口':'H0 · …EE00',index>=4?'下一跳 MAC（依链路）':'默认网关 MAC（需 ARP）','逐跳更换外层帧'))}
  if(index>=2){layers.push(layer('网络层 · IPv4','166.1.0.10','200.1.1.4','源 IP / 目的 IP'))}
  if(index>=1){layers.push(layer('传输层 · TCP','客户端临时端口','80','源端口 / 目的端口'))}
  layers.push(layer('应用层 · HTTP','客户端','Web 服务器','HTTP 请求 / 响应内容'));
  out.layers=layers;out.note=index>=4?'路由器剥离旧以太网帧，查路由并重新封装；若未经过 NAT，IP 源/目的通常不变，TTL 递减。':'层层嵌套的顺序：HTTP → TCP → IPv4 → Ethernet。';return out;
 }
 if(id==='tcp' && index>=1){
  const reply=index===2||index===5;
  out.layers=[layer('以太网 · MAC 帧','当前链路发送端','当前链路下一跳','跨路由器时 MAC 地址会变化'),layer('网络层 · IPv4',reply?'200.1.1.4':'166.1.0.10',reply?'166.1.0.10':'200.1.1.4','源 IP / 目的 IP'),layer('传输层 · TCP',reply?'80':'临时源端口',reply?'临时目的端口':'80','源端口 / 目的端口'),layer('应用层',index>=4?'HTTP':'TCP 握手无 HTTP 负载',index>=4?'业务数据':'控制报文','三次握手阶段未发送应用层 HTTP 请求')];
  if(index<4)out.layers.pop();
  out.note='此场景没有提供完整的 MAC 和 TCP 临时端口，标记为待确认，不把占位描述伪装成精确数值。';return out;
 }
 if(id==='wifi'){
  out.layers=[layer('IEEE 802.11',index===1?'X':index===2?'AP':'无线站点',index===1?'AP':index===2?'X / 邻近站点':'无线链路目标','无线链路使用 802.11 帧，不套用普通以太网两地址布局')];
  out.note='802.11 DATA 帧可使用多个地址字段；RTS/CTS/ACK 是控制帧。';return out;
 }
 if(id==='fragment'){
  if(index>=4){out.layers=[layer('网络层 · IPv4','源 IP 沿用原报文','目的 IP 沿用原报文','每个分片都有 IP 首部'+(index===4?'；首片含 UDP 首部':''))];}
  out.note='这里只说明结构与长度；源/目的地址、端口没有在当前步骤明确给出。';return out;
 }
 // For other steps: render field evidence only, avoiding a fabricated envelope.
 return out;
}
export function fieldEvidence(step){return Array.isArray(step.fields)?step.fields:[];}
