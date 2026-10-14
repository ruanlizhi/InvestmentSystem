import {mkdirSync,copyFileSync} from 'node:fs';
import {join} from 'node:path';
const root=join(import.meta.dir,'..');mkdirSync(join(root,'dist'),{recursive:true});
const result=await Bun.build({entrypoints:[join(root,'web/app.ts')],outdir:join(root,'dist'),target:'browser',minify:true});
if(!result.success)throw new AggregateError(result.logs,'构建失败');
for(const file of ['index.html','style.css','favicon.svg'])copyFileSync(join(root,'web',file),join(root,'dist',file));
console.log('Built local browser assets; no private data bundled.');
