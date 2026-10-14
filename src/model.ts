export const kinds = ['principle','asset','evidence','plan','decision','account','flow','trade','review'] as const;
const currencies=['USD','CNY','HKD','EUR','GBP','CAD','AUD','CHF','SGD','NZD'];
export type Kind = typeof kinds[number];
export type Ref = { id: string; version: number };
export type RecordInput = {id:string;kind:Kind;title:string;body:string;status:'draft'|'active'|'review'|'retired';date:string;source:string;identity:'fact'|'opinion'|'inference'|'decision';refs:Ref[];fields:Record<string,any>};
export type Entry = RecordInput & {version:number;recordedAt:string;context?:{revision:number;portfolio:Portfolio[]};after?:Portfolio[]};
export type State = {schemaVersion:1;revision:number;mode:'personal'|'demo';records:Entry[];audit:{revision:number;at:string;reason:string}[]};
export type Position = {assetId:string;quantity:number;costMinor:number|null};
export type Portfolio = {id:string;title:string;currency:string;cashMinor:number|null;holdingsKnown:boolean;positions:Position[];asOf:string};
export const emptyState=(mode:State['mode']='personal'):State=>({schemaVersion:1,revision:0,mode,records:[],audit:[]});
export const latest=(s:State,kind?:Kind):Entry[]=>{const m=new Map<string,Entry>();for(const r of s.records)m.set(r.id,r);return [...m.values()].filter(r=>!kind||r.kind===kind);};
export const byRef=(s:State,ref:Ref)=>s.records.find(r=>r.id===ref.id&&r.version===ref.version);
export function need(ok:unknown,message:string):asserts ok {if(!ok)throw new Error(message);}
function text(v:unknown,n:string,empty=false){need(typeof v==='string'&&(empty||v.trim().length>0)&&v.length<=50000,`${n} 必须为文本`);}
function num(v:unknown,n:string,min=0,integer=false){need(typeof v==='number'&&Number.isFinite(v)&&v>=min&&v<=1e13&&(!integer||Number.isSafeInteger(v)),`${n} 数值无效`);}
export function validDate(v:unknown,n='date'){text(v,n);need(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(v as string)&&!Number.isNaN(Date.parse(v as string))&&new Date(v as string).toISOString()===v,`${n} 使用 UTC ISO 时间，例如 2026-01-01T00:00:00.000Z`);}
function shape(o:any,allowed:string[],name:string){need(o&&typeof o==='object'&&!Array.isArray(o),`${name} 必须为对象`);for(const k of Object.keys(o))need(allowed.includes(k),`${name} 未知字段 ${k}`);}
const fieldKeys:Record<Kind,string[]>={
 principle:['category','boundary'],asset:['symbol','aliases','direction','basis','tam','capture','moat','feedback','falsifier','unknowns','priceMinor','currency','priceDate'],
 evidence:['assetId','stance','locator','publishedAt','dataPeriod','verified'],plan:['assetId','direction','observation','falsifier','buy','sell','preparation','reviewAt','checkState'],
 decision:['assetId','plan','action','discussionAt','rationale','validation','missingPreparation'],account:['currency','cashMinor','holdingsKnown','positions'],
 flow:['accountId','amountMinor','reason'],trade:['accountId','assetId','plan','decision','side','quantity','priceMinor','feeMinor','missingPreparation'],
 review:['target','judgment','execution','outcome','next']};
export function validateInput(x:any):asserts x is RecordInput{
 shape(x,['id','kind','title','body','status','date','source','identity','refs','fields'],'record');
 need(typeof x.id==='string'&&/^[a-zA-Z0-9][a-zA-Z0-9_-]{0,79}$/.test(x.id),'id 无效');need(kinds.includes(x.kind),'kind 无效');
 for(const k of ['title','source'])text(x[k],k);text(x.body,'body',true);validDate(x.date);
 need(['draft','active','review','retired'].includes(x.status),'status 无效');need(['fact','opinion','inference','decision'].includes(x.identity),'identity 无效');
 need(Array.isArray(x.refs)&&x.refs.length<=100,'refs 无效');for(const r of x.refs)validateRef(r);
 shape(x.fields,fieldKeys[x.kind as Kind],'fields');const f=x.fields;
 const required:Record<Kind,string[]>={principle:['category','boundary'],asset:['symbol','aliases','direction','basis','tam','capture','moat','feedback','falsifier','unknowns'],evidence:['assetId','stance','locator','publishedAt','dataPeriod','verified'],plan:['assetId','direction','observation','falsifier','buy','sell','preparation','reviewAt','checkState'],decision:['assetId','plan','action','discussionAt','rationale','validation','missingPreparation'],account:['currency','cashMinor','holdingsKnown','positions'],flow:['accountId','amountMinor','reason'],trade:['accountId','assetId','plan','decision','side','quantity','priceMinor','feeMinor','missingPreparation'],review:['target','judgment','execution','outcome','next']};
 for(const k of required[x.kind as Kind])need(k in f,`缺少字段 ${k}`);
 const complex=new Set(['aliases','priceMinor','priceDate','publishedAt','verified','reviewAt','plan','discussionAt','cashMinor','holdingsKnown','positions','amountMinor','decision','quantity','feeMinor','target']);
 for(const [k,v] of Object.entries(f))if(!complex.has(k))text(v,k,true);
 if(x.kind==='asset'){need(Array.isArray(f.aliases)&&f.aliases.every((a:any)=>typeof a==='string'),'aliases 无效');if(f.priceMinor!=null){num(f.priceMinor,'priceMinor',0,true);need(currencies.includes(f.currency),'首版仅支持约定的两位小数币种');validDate(f.priceDate,'priceDate');}else need(f.priceDate==null,'无价格时 priceDate 应为空');}
 if(x.kind==='evidence'){need(['support','challenge','neutral'].includes(f.stance),'stance 无效');need(typeof f.verified==='boolean','verified 无效');if(f.publishedAt!==null)validDate(f.publishedAt,'publishedAt');}
 if(x.kind==='plan'){need(['unmonitored','pending','checked'].includes(f.checkState),'checkState 无效');if(f.reviewAt!==null)validDate(f.reviewAt,'reviewAt');}
 if(x.kind==='decision'){validateRef(f.plan);need(['buy','sell','wait','research','rebalance'].includes(f.action),'action 无效');if(f.discussionAt!==null){validDate(f.discussionAt,'discussionAt');need(f.discussionAt<=x.date,'讨论不得晚于决策');}else text(f.missingPreparation,'缺少事前讨论的说明');}
 if(x.kind==='account'){need(currencies.includes(f.currency),'首版仅支持约定的两位小数币种');if(f.cashMinor!==null)num(f.cashMinor,'cashMinor',0,true);need(typeof f.holdingsKnown==='boolean','holdingsKnown 无效');need(Array.isArray(f.positions),'positions 无效');need(f.holdingsKnown||f.positions.length===0,'持仓未知时不得录入已知总持仓');const a=new Set();for(const p of f.positions){shape(p,['assetId','quantity','costMinor'],'position');text(p.assetId,'assetId');num(p.quantity,'quantity');need(Math.abs(p.quantity*1e6-Math.round(p.quantity*1e6))<0.001,'期初数量最多六位小数');if(p.costMinor!==null)num(p.costMinor,'costMinor',0,true);need(!a.has(p.assetId),'重复期初持仓');a.add(p.assetId);}}
 if(x.kind==='flow'){num(Math.abs(f.amountMinor),'amountMinor',1,true);need(Number.isSafeInteger(f.amountMinor),'amountMinor 必须为整数');text(f.reason,'reason');}
 if(x.kind==='trade'){validateRef(f.plan);if(f.decision!==null)validateRef(f.decision);else text(f.missingPreparation,'缺少决策的说明');need(['buy','sell'].includes(f.side),'side 无效');num(f.quantity,'quantity',0.000001);need(Math.abs(f.quantity*1e6-Math.round(f.quantity*1e6))<0.001,'数量最多六位小数');num(f.priceMinor,'priceMinor',1,true);num(f.feeMinor,'feeMinor',0,true);need(Number.isSafeInteger(Math.round(f.quantity*f.priceMinor))&&f.quantity*f.priceMinor<=1e13,'成交金额过大');}
 if(x.kind==='review')validateRef(f.target);
}
function validateRef(r:any){shape(r,['id','version'],'ref');text(r.id,'ref.id');num(r.version,'ref.version',1,true);}
export function refsOf(r:RecordInput):Ref[]{const f=r.fields;return [...r.refs,...(f.plan?[f.plan]:[]),...(f.decision?[f.decision]:[]),...(f.target?[f.target]:[])];}
export function portfolio(s:State):Portfolio[]{
 const out:Portfolio[]=latest(s,'account').map(r=>({id:r.id,title:r.title,currency:r.fields.currency,cashMinor:r.fields.cashMinor,holdingsKnown:r.fields.holdingsKnown,positions:structuredClone(r.fields.positions),asOf:r.date}));
 for(const r of s.records.filter(r=>r.kind==='trade'||r.kind==='flow')){
  const f=r.fields,a=out.find(a=>a.id===f.accountId);need(a,'找不到账户');need(r.date>=a.asOf,'资金记录必须按账户时间顺序录入');a.asOf=r.date;
  if(r.kind==='flow'){if(a.cashMinor!==null)a.cashMinor+=f.amountMinor;}
  else{need(a.holdingsKnown,'期初持仓未知，请先核对基线');let p=a.positions.find(p=>p.assetId===f.assetId);if(!p){p={assetId:f.assetId,quantity:0,costMinor:0};a.positions.push(p);}
   const gross=Math.round(f.quantity*f.priceMinor);
   if(f.side==='buy'){p.quantity=Math.round((p.quantity+f.quantity)*1e6)/1e6;if(p.costMinor!==null)p.costMinor+=gross+f.feeMinor;if(a.cashMinor!==null)a.cashMinor-=gross+f.feeMinor;}
   else{need(p.quantity+1e-9>=f.quantity,'卖出超过已知持仓');if(p.costMinor!==null)p.costMinor=Math.round(p.costMinor*(p.quantity-f.quantity)/p.quantity);p.quantity=Math.round((p.quantity-f.quantity)*1e6)/1e6;if(a.cashMinor!==null)a.cashMinor+=gross-f.feeMinor;}
  }
  need(a.cashMinor===null||(Number.isSafeInteger(a.cashMinor)&&a.cashMinor>=0&&a.cashMinor<=1e13),'现金不足或金额越界');
 }
 return out;
}
export function append(s:State,input:RecordInput,at=new Date().toISOString()):State{
 validateInput(input);const next=structuredClone(s);const old=latest(s).find(r=>r.id===input.id);
 if(old){need(old.kind===input.kind,'不允许更换记录类型');need(!['trade','flow','account','decision','review'].includes(input.kind),'财务、决策及复盘记录只允许追加新 ID');need(input.date>=old.date,'修订时间不能早于旧版');}
 for(const ref of refsOf(input)){const target=byRef(s,ref);need(target,'引用不存在：'+ref.id+' v'+ref.version);need(target.date<=input.date,'不能引用未来版本');}
 const f=input.fields;
 if(f.assetId)need(latest(s,'asset').some(a=>a.id===f.assetId),'标的不存在');
 if(input.kind==='account')for(const p of f.positions)need(latest(s,'asset').some(a=>a.id===p.assetId),'期初标的不存在');
 if(f.accountId)need(latest(s,'account').some(a=>a.id===f.accountId),'账户不存在');
 if(f.plan){const plan=byRef(s,f.plan)!;need(plan.kind==='plan'&&plan.fields.assetId===f.assetId,'预案与标的不匹配');need(plan.date<=input.date,'不能引用未来预案');}
 if(f.decision){const d=byRef(s,f.decision)!;need(d.kind==='decision'&&d.fields.assetId===f.assetId,'决策与标的不匹配');need(d.date<=input.date,'成交早于决策');need(d.fields.plan.id===f.plan.id&&d.fields.plan.version===f.plan.version,'成交预案与决策不一致');need(d.fields.action===f.side||d.fields.action==='rebalance','成交方向与决策不一致');}
 const r:Entry={...structuredClone(input),version:(old?.version??0)+1,recordedAt:at};
 if(input.kind==='review')need(['decision','trade'].includes(byRef(s,f.target)!.kind),'复盘需关联决策或实际操作');
 if(['decision','trade'].includes(input.kind))r.context={revision:s.revision,portfolio:portfolio({...s,records:s.records.filter(e=>e.date<=input.date)})};
 next.records.push(r);const after=portfolio(next);if(input.kind==='trade')r.after=after;
 return next;
}
export function validateState(x:any):asserts x is State{
 need(x?.schemaVersion===1,'不支持的数据格式版本；不会自动覆盖或迁移');need(x.mode==='demo'||x.mode==='personal','工作区类型无效');num(x.revision,'revision',0,true);need(Array.isArray(x.records)&&Array.isArray(x.audit),'数据结构无效');
 let rebuilt=emptyState(x.mode);for(const entry of x.records){const {version,recordedAt,context,after,...input}=entry;validDate(recordedAt,'recordedAt');const next=append(rebuilt,input,recordedAt);const made=next.records.at(-1)!;need(version===made.version,'记录版本不连续');if(context){need(context.revision<=x.revision,'截面版本无效');made.context!.revision=context.revision;}need(JSON.stringify(made.context)===JSON.stringify(context)&&JSON.stringify(made.after)===JSON.stringify(after),'财务截面校验失败');rebuilt=next;}
}
export function staleRefs(s:State,r:Entry){const current=latest(s),seen=new Set<string>(),stale:Ref[]=[];function visit(ref:Ref){const key=ref.id+':'+ref.version;if(seen.has(key))return;seen.add(key);if((current.find(e=>e.id===ref.id)?.version??0)>ref.version)stale.push(ref);const item=byRef(s,ref);if(item)refsOf(item).forEach(visit);}refsOf(r).forEach(visit);return stale;}
export function discussion(s:State,id:string):string{
 const r=latest(s).find(r=>r.id===id);need(r,'记录不存在');const asset=latest(s,'asset').find(a=>a.id===(r.kind==='asset'?r.id:r.fields.assetId));
 const plans=r.kind==='plan'?[r]:latest(s,'plan').filter(p=>p.fields.assetId===asset?.id&&p.status!=='retired');
 return [`# 操作前讨论：${r.title}`,`数据修订：${s.revision}；此摘要不代表交易指令。`,asset?`## 标的逻辑\n${asset.title}\n${asset.body}\n${JSON.stringify(asset.fields,null,2)}`:'',...plans.map(p=>`## 预案 ${p.id} v${p.version}\n${p.body}\n${JSON.stringify(p.fields,null,2)}\n来源：${p.source}`),`## 当前资金持仓\n${JSON.stringify(portfolio(s),null,2)}`,`## 需要梳理\n什么新事实触发了预案？原逻辑如何变化？资金是否足够？有哪些反证和缺项？最终行动或等待如何验证？`].filter(Boolean).join('\n\n');
}
