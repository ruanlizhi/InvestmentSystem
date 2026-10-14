import {readdirSync,readFileSync,lstatSync} from 'node:fs';
import {join} from 'node:path';
const root=join(import.meta.dir,'..');
const files=['LICENSE','CHANGELOG.md','README.md','AGENTS.md','.gitignore','package.json','bun.lock','tsconfig.json'];
function scan(dir:string){for(const e of readdirSync(join(root,dir),{withFileTypes:true})){const p=join(dir,e.name);if(lstatSync(join(root,p)).isSymbolicLink())throw Error('发布目录不允许符号链接：'+p);if(e.isDirectory())scan(p);else files.push(p);}}
for(const dir of ['src','web','scripts','tests','docs','dist'])scan(dir);
const prohibited=[/\/home\/[a-z][a-z0-9_-]*\//i,/[A-Z]:\\Users\\[^\\]+\\/i,/PRIVATE_WORKSPACE_SENTINEL/];
for(const file of files){if(file==='scripts/check-release.ts')continue;const s=readFileSync(join(root,file),'utf8');for(const re of prohibited)if(re.test(s))throw Error('私人内容特征：'+file);if(/(?:BEGIN (?:RSA |OPENSSH )?PRIVATE KEY|sk-[A-Za-z0-9]{24,})/.test(s))throw Error('疑似凭据：'+file);}
console.log(JSON.stringify({checkedFiles:files.length,result:'pass',note:'只核对显式发布候选清单；非发布授权，仍需人工审核与许可证确认。'},null,2));
