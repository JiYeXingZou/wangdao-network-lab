from pathlib import Path
import base64
root=Path(__file__).resolve().parent.parent
s=(root/'index.html').read_text(encoding='utf-8')
css=(root/'src/styles.css').read_text(encoding='utf-8')
data=(root/'src/data.js').read_text(encoding='utf-8').replace('export const ','const ')
packet=(root/'src/packet.js').read_text(encoding='utf-8').replace('export function ','function ')
app=(root/'src/app.js').read_text(encoding='utf-8')
base=base64.b64encode((root/'assets/wangdao-original-clean.jpg').read_bytes()).decode('ascii')
app=app.replace("'./assets/wangdao-original-clean.jpg'", "'data:image/jpeg;base64,"+base+"'")
app=app.replace("import {SCENES,NODES,REGIONS} from './data.js';",'').replace("import {packetFor,fieldEvidence} from './packet.js';",'')
s=s.replace('<link rel="stylesheet" href="./src/styles.css">','<style>'+css+'</style>')
s=s.replace('<script type="module" src="./src/app.js"></script>','<script>\n'+data+'\n'+packet+'\n'+app+'\n</script>')
assert 'src/styles.css' not in s and 'type="module"' not in s
out=root/'preview.html';out.write_text(s,encoding='utf-8')
print(f'Built {out} ({out.stat().st_size:,} bytes)')
