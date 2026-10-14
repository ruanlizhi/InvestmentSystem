import {readFileSync} from 'node:fs';
import {workspacePath,init,readState,commit,restore} from './store';
import {latest,portfolio,discussion,need} from './model';
import {demoRecords} from './demo';
const args=process.argv.slice(2);const value=(key:string)=>{const i=args.indexOf(key);return i<0?undefined:args[i+1];};
const usage=`InvestmentSystem CLI
  init --workspace <仓库外目录> [--demo]
  show --workspace <目录> [--id <记录ID>]
  search --workspace <目录> --query <关键词>
  apply --workspace <目录> --file <批次JSON> --expect <修订号> --reason <说明>
  summary --workspace <目录> --id <标的或预案ID>
  restore --workspace <目录> --file <备份JSON> --expect <修订号>
批次格式：{"records":[...]}；更新前先 show 查看当前 revision。`;
try{
 const cmd=args[0];if(!cmd||cmd==='--help'){console.log(usage);process.exit(0);}
 const path=value('--workspace')||process.env.INVESTMENT_WORKSPACE;need(path,'缺少 --workspace\n'+usage);const dir=workspacePath(path);
 if(cmd==='init'){const mode=args.includes('--demo')?'demo':'personal';let s=init(dir,mode);if(mode==='demo')s=commit(dir,demoRecords(),0,'初始化独立虚构演示');console.log(JSON.stringify({revision:s.revision,mode:s.mode}));}
 else if(cmd==='show'){const s=readState(dir);const id=value('--id');console.log(JSON.stringify(id?{revision:s.revision,versions:s.records.filter(r=>r.id===id)}:{revision:s.revision,mode:s.mode,records:latest(s),portfolio:portfolio(s)},null,2));}
 else if(cmd==='search'){const s=readState(dir),q=(value('--query')??'').toLowerCase();console.log(JSON.stringify({revision:s.revision,records:latest(s).filter(r=>JSON.stringify(r).toLowerCase().includes(q))},null,2));}
 else if(cmd==='summary'){console.log(discussion(readState(dir),value('--id')??''));}
 else if(cmd==='apply'||cmd==='restore'){const file=value('--file'),rev=Number(value('--expect'));need(file&&Number.isSafeInteger(rev)&&rev>=0,'必须提供 --file 和 --expect');let s;if(cmd==='restore')s=restore(dir,file,rev);else{const input=JSON.parse(readFileSync(file,'utf8'));need(Array.isArray(input.records),'批次需要 records 数组');s=commit(dir,input.records,rev,value('--reason')??'');}console.log(JSON.stringify({revision:s.revision,mode:s.mode,records:s.records.length}));}
 else throw Error(usage);
}catch(e){console.error(e instanceof Error?e.message:String(e));process.exitCode=1;}
