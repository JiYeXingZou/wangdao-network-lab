---
name: network-packet-visualization
description: Design and validate interactive educational computer-networking diagrams, packet encapsulation and per-hop forwarding animation for 408 exam scenarios.
---

# Network Packet Visualization

When adding or changing a scene:

1. Identify the factual basis: current source step, relevant protocol behavior, and simplifying assumptions.
2. Define immutable **packet snapshots** for each animation step. Record link type, encapsulation chain, source/destination MAC, IP, ports, TTL, flags, and payload type *only when known*.
3. Distinguish Layer 2 frame addresses (per link), Layer 3 IP addresses (usually end-to-end), Layer 4 ports (end-to-end, unless NAT changes them), and application-level endpoints.
4. Ethernet: model frame header, IPv4 packet, TCP/UDP header, application payload as nested shells when those layers actually exist.
5. ARP: Ethernet → ARP; no IPv4 or UDP/TCP. Gratuitous ARP and proxy ARP require explicit special cases.
6. DHCP: DORA includes UDP 68↔67. Initial Discover/Request broadcast IP and MAC in classic initial allocation. For OFFER/ACK, unicast/broadcast depends on ciaddr, broadcast flag, server and link context; do not blindly hardcode addresses. Distinguish yiaddr from the IPv4 destination.
7. Routing: route lookup, layer-2 de-encapsulation and re-encapsulation, TTL decrement, next-hop ARP; switches forward frames without rewriting Ethernet addresses.
8. NAT: distinguish source NAT on outbound forwarding and destination translation on responses; do not equate next-hop MAC with remote host MAC.
9. Wi-Fi: 802.11 Data / RTS / CTS / ACK frames require different layouts and address meanings; support To DS / From DS for data frames.
10. At least one executable test should assert each new scene's known and unknown fields. Unknown values must display as unknown.
11. Layout: preserve the topology focus, user can single-step, scrub, pause, and inspect every layer; no generic dashboard ornamentation.
12. Do not include copyrighted source images or reproduce lecture screenshots in the distributable public assets.

## UI visibility rule

Only render the packet dissection panel when the active step contains a real packet or a step in the explicit encapsulation process. Do not show an empty panel or verbose explanation for route-table, ARP-cache, waiting, device-state, or summary steps. Use the original clean Wangdao teaching topology as the default background and preserve path overlays aligned with the original coordinate system.
