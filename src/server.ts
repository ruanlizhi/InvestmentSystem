import {join} from 'node:path';
import {existsSync} from 'node:fs';
import {projectRoot,workspacePath,readState} from './store';
import {portfolio,discussion,need,type State} from './model';
import {publicState} from './public';
export function handler(dir:string,port:number,load:()=>State=()=>readState(dir)){
 const headers={'Cache-Control':'no-store','CDN-Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; font-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'"};
 const json=(x:any,status=200)=>Response.json(x,{status,headers});
 return (req:Request):Response=>{try{
  const url=new URL(req.url);if(![`127.0.0.1:${port}`,`localhost:${port}`].includes(req.headers.get('host')??''))return json({error:'Host not allowed'},403);
  if(req.method!=='GET')return json({error:'只读服务；请通过授权 CLI 更新'},405);
  if(req.headers.get('origin')&&!['http://127.0.0.1:'+port,'http://localhost:'+port].includes(req.headers.get('origin')!))return json({error:'Origin not allowed'},403);
  if(req.headers.get('sec-fetch-site')==='cross-site')return json({error:'Cross-site request blocked'},403);
  if(url.pathname==='/api/state'){const s=load();return json({...s,portfolio:portfolio(s)});}
  if(url.pathname==='/api/summary')return json({text:discussion(load(),url.searchParams.get('id')??'')});
  const assets:Record<string,string>={'/':'index.html','/app.js':'app.js','/style.css':'style.css','/favicon.svg':'favicon.svg'};
  const f=assets[url.pathname];if(!f)return json({error:'Not found'},404);return new Response(Bun.file(join(projectRoot,'dist',f)),{headers});
 }catch{return json({error:'读取失败：请在本机使用 CLI 检查工作区；不会覆盖现有数据。'},500);}};
}
if(import.meta.main){
 try{const args=process.argv.slice(2);const i=args.indexOf('--workspace'),p=args.indexOf('--port');const demo=args.includes('--demo');
 const path=i>=0?args[i+1]:process.env.INVESTMENT_WORKSPACE;
 if(!demo)need(path,'请使用 --workspace <私人工作区>，或 --demo 启动公开快照');
 const dir=demo?'':workspacePath(path!);
 const s=demo?publicState():readState(dir);need(demo?s.mode==='demo':s.mode==='personal','模式不匹配');
 need(existsSync(join(projectRoot,'dist','app.js')),'请先运行 bun run build');
 const port=p>=0?Number(args[p+1]):demo?4318:4317;need(Number.isInteger(port)&&port>1024&&port<65536,'port 无效');
 Bun.serve({hostname:'127.0.0.1',port,fetch:handler(dir,port,demo?publicState:()=>readState(dir))});console.log(`InvestmentSystem ${s.mode} · http://localhost:${port}`);
 }catch(e){console.error(e instanceof Error?e.message:e);process.exitCode=1;}
}
