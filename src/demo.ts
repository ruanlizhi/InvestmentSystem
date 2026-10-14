import type {RecordInput,Kind,Ref} from './model';
const date='2026-01-02T09:00:00.000Z';
export const record=(kind:Kind,id:string,title:string,fields:Record<string,any>,body='',refs:Ref[]=[],when=date):RecordInput=>({kind,id,title,fields,body,refs,date:when,status:'active',identity:kind==='decision'?'decision':'opinion',source:'虚构演示 · 不代表真实投资分析',});
export function demoRecords():RecordInput[]{return [
 record('principle','p-evidence','先写清逻辑，再决定行动',{category:'研究纪律',boundary:'资料不足时保留未知，不用结果倒推理由。'},'关键判断要能找到证据，也要能说明什么变化会使它失效。'),
 record('principle','p-liquidity','保留资金的选择权',{category:'配置纪律',boundary:'额度由个人资金期限与需求决定，不使用统一比例。'},'每次操作都比较调整前后的资金与持仓。'),
 record('asset','a-cloud','青岚云服务',{symbol:'DEMO-CLOUD',aliases:['青岚','云服务'],direction:'长期研究（虚构）',basis:'观察客户工作流程形成的迁移成本。',tam:'企业协作需求；规模尚待独立验证。',capture:'订阅收入能否覆盖服务成本。',moat:'迁移成本是假设，需要客户留存证据。',feedback:'更多使用能否提高产品价值，待核验。',falsifier:'客户留存持续恶化且迁移成本降低。',unknowns:'尚缺独立客户调研。',priceMinor:1250,currency:'USD',priceDate:date},'增长只是入口。当前重点是验证客户为什么留下来。',[{id:'p-evidence',version:1}]),
 record('asset','a-energy','远山储能',{symbol:'DEMO-ENERGY',aliases:['远山'],direction:'行业驱动（虚构）',basis:'行业建设需求能否传导到经营现金流。',tam:'项目需求边界待核对。',capture:'订单增长不等于利润增长。',moat:'未确认长期壁垒。',feedback:'规模效应待观察。',falsifier:'回款恶化、扩张依赖持续融资。',unknowns:'缺少订单质量与回款资料。',priceMinor:null},'先厘清收益传导，再讨论参与条件。',[{id:'p-evidence',version:1}]),
 record('asset','a-tools','北辰工业软件',{symbol:'DEMO-TOOLS',aliases:['北辰'],direction:'待定',basis:'业务结构仍待理解。',tam:'待补充',capture:'待补充',moat:'待补充',feedback:'待补充',falsifier:'待补充',unknowns:'尚未进入深入研究。',priceMinor:null},'观察池记录，暂不形成买入结论。'),
 record('evidence','e-retention','客户留存：仍需交叉核验',{assetId:'a-cloud',stance:'support',locator:'虚构研究卡片 / 留存章节',publishedAt:date,dataPeriod:'虚构季度',verified:false},'演示材料提出客户续约较稳定；没有独立证据，因此保持待核验。'),
 record('evidence','e-cost','竞争者降低迁移成本',{assetId:'a-cloud',stance:'challenge',locator:'虚构反方材料 / 竞争章节',publishedAt:date,dataPeriod:'虚构季度',verified:false},'竞争者推出迁移工具，可能挑战原先的迁移成本假设。'),
 record('plan','plan-cloud','核对留存与迁移成本，再讨论加仓',{assetId:'a-cloud',direction:'长期研究（虚构）',observation:'留存、迁移行为与单位服务成本。',falsifier:'留存下降且独立调研显示迁移成本显著降低。',buy:'补齐反方证据并讨论资金影响后，再决定。',sell:'关键逻辑被推翻时进入退出复核。',preparation:'收集客户调研；确认生活资金不受影响。',reviewAt:'2026-02-01T00:00:00.000Z',checkState:'pending'},'预案规定讨论条件，不等于交易指令。',[{id:'a-cloud',version:1},{id:'p-liquidity',version:1}]),
 record('plan','plan-energy','等待订单质量与回款证据',{assetId:'a-energy',direction:'行业驱动（虚构）',observation:'订单兑现率、回款与融资依赖。',falsifier:'新增订单伴随持续现金流恶化。',buy:'待补充',sell:'待补充',preparation:'明确行业增长如何转化为股东收益。',reviewAt:null,checkState:'unmonitored'},'尚未完成买卖条件，不视为准备就绪。',[{id:'a-energy',version:1}]),
 record('account','account-demo','演示投资账户',{currency:'USD',cashMinor:1000000,holdingsKnown:true,positions:[]},'虚构期初余额，仅用于展示财务链条。'),
 record('decision','decision-demo','完成事前讨论，小额验证记录流程',{assetId:'a-cloud',plan:{id:'plan-cloud',version:1},action:'buy',discussionAt:date,rationale:'虚构讨论；用途是验证事前记录与实际成交相互独立。',validation:'下次复核时比较原假设、执行偏差和结果。',missingPreparation:''},'以下成交只是软件演示。',[], '2026-01-03T09:00:00.000Z'),
 record('trade','trade-demo','演示买入 100 单位',{accountId:'account-demo',assetId:'a-cloud',plan:{id:'plan-cloud',version:1},decision:{id:'decision-demo',version:1},side:'buy',quantity:100,priceMinor:1200,feeMinor:100,missingPreparation:''},'虚构成交：本金 1,200 USD，费用 1 USD。',[],'2026-01-04T09:00:00.000Z'),
 record('review','review-demo','第一次复核：区分流程与投资结论',{target:{id:'trade-demo',version:1},judgment:'投资假设仍待真实证据核验。',execution:'演示成交与事前记录关联完整。',outcome:'价格变化不能验证迁移成本假设。',next:'补充独立材料，继续检查反方论据。'},'此条只展示复盘结构。',[],'2026-01-05T09:00:00.000Z')
];}
