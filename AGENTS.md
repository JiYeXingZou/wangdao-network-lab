# Development instructions for AI coding agents

Treat this project as an educational protocol simulator, not a generic analytics dashboard.

1. Do not remove any of the 11 scenarios or 70 steps without an explicit migration plan.
2. All displayed header fields must come from structured, testable source data. If unspecified, say “未提供/未确定”, never fabricate.
3. Layer nesting must be protocol-accurate. ARP is not inside IPv4; 802.11 control frames are not Ethernet II payloads.
4. On routed links, Ethernet MAC source/destination can change hop by hop, while IP source/destination generally remain the same unless NAT is used. IPv4 TTL decreases when forwarded by a router.
5. Respect source context and teaching simplifications; document what is schematic and what is protocol behavior.
6. Prefer editorial, whitespace-rich design with restrained animation; avoid overly rounded, colorful, generic AI dashboard components.
7. Test 408 edge cases when editing the model and run `npm run check` before release.
8. Never commit paid-course handouts, recordings, handwritten source figures, credentials, or base64 derivatives to the public repo.
