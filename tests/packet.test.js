import test from 'node:test';import assert from 'node:assert/strict';
import {SCENES,NODES} from '../src/data.js';import {packetFor} from '../src/packet.js';
const get=id=>SCENES.find(x=>x.id===id);
test('11 scenarios and all 70 existing steps preserved',()=>{assert.equal(SCENES.length,11);assert.equal(SCENES.reduce((a,s)=>a+s.steps.length,0),70)});
test('all animated paths match nodes on the original topology',()=>{for(const s of SCENES)for(const st of s.steps)for(const p of st.paths)for(const n of p.nodes)assert.ok(NODES[n],`${s.id}: ${n}`)});
test('DHCP Discover packet has broadcast MAC and IP, ports 68 -> 67',()=>{let d=packetFor(get('dhcp'),1);assert.equal(d.layers.length,4);assert.equal(d.layers[0].to,'FF:FF:FF:FF:FF:FF');assert.equal(d.layers[1].from,'0.0.0.0');assert.equal(d.layers[1].to,'255.255.255.255');assert.equal(d.layers[2].from,'68');assert.equal(d.layers[2].to,'67');});
test('DHCP OFFER acknowledges unknown IP instead of inventing it',()=>{let d=packetFor(get('dhcp'),3);assert.match(d.layers[1].from,/未明确/);assert.equal(d.layers[2].from,'67');});
test('ARP does not insert false IPv4/UDP layers',()=>{let d=packetFor(get('arp'),2);assert.equal(d.layers.length,2);assert.equal(d.layers[1].title,'ARP 报文')});
test('encapsulation grows by layer',()=>{let s=get('encap');for(let i=0;i<4;i++)assert.equal(packetFor(s,i).layers.length,i+1)});
test('fallback does not forge packet values',()=>{assert.equal(packetFor(get('nat'),1).layers.length,0)});

test('DHCP ACK destination MAC is intentionally not asserted as unicast',()=>{let d=packetFor(get('dhcp'),5);assert.match(d.layers[0].to,/未确定/)});

test('non-packet steps have no packet dissection model',()=>{
 const skips={dhcp:[0,2,6],arp:[0,1,3],crosssub:[0,1,3],wan:[0,1,2,3,5],response:[1,2],nat:[1,5],dns:[0,1,5],tcp:[0],fragment:[0,1,2,3,7],encap:[5],wifi:[0,3,6,7]};
 for(const [id,ids] of Object.entries(skips))for(const i of ids){assert.equal(packetFor(get(id),i).layers.length,0,`${id}/${i+1} should not render a packet`)}
});
test('genuine packet steps still render a dissection model',()=>{
 const present={dhcp:[1,3,4,5],arp:[2,4],tcp:[1,2,3,4,5],encap:[0,1,2,3,4],wifi:[1,2,4,5],fragment:[4,5,6]};
 for(const [id,ids] of Object.entries(present))for(const i of ids)assert.ok(packetFor(get(id),i).layers.length>0,`${id}/${i+1} missing packet`);
});
test('no duplicate DHCP Discover dissection during switch flooding step',()=>{
 assert.equal(packetFor(get('dhcp'),2).layers.length,0);
});
