// DOM unit tests only. These do not verify real-browser rendering or pixels.
import {test,expect,beforeAll,afterAll} from 'bun:test';
import {Window} from 'happy-dom';
import {append,emptyState,portfolio,discussion,type State} from '../src/model';
import {demoRecords} from '../src/demo';
const window=new Window({url:'http://localhost:4318/'});
let data:State=emptyState('demo');for(const r of demoRecords())data=append(data,r);
const saved=new Map<string,PropertyDescriptor|undefined>();
beforeAll(async()=>{
 for(const [k,v] of Object.entries({window,document:window.document,location:window.location,navigator:window.navigator,fetch:async(input:any)=>{const url=String(input);return Response.json(url.startsWith('/api/summary')?{text:discussion(data,new URL(url,'http://localhost').searchParams.get('id')!)}:{...data,portfolio:portfolio(data)});}})){saved.set(k,Object.getOwnPropertyDescriptor(globalThis,k));Object.defineProperty(globalThis,k,{value:v,writable:true,configurable:true});}
 window.document.body.innerHTML='<div id="app"></div><div id="toast"></div>';
 await import('../web/app');await Bun.sleep(10);
});
afterAll(()=>{for(const [k,v] of saved)if(v)Object.defineProperty(globalThis,k,v);else Reflect.deleteProperty(globalThis,k);window.happyDOM.abort();});
async function go(hash:string){window.location.hash=hash;window.dispatchEvent(new window.HashChangeEvent('hashchange'));await Bun.sleep(5);}
test('六个页面与标的四个页签都生成预期内容',async()=>{for(const [page,title] of [['overview','把每一次判断'],['principles','投资原则'],['assets','标的档案'],['plans','观察与预案'],['portfolio','资金与持仓'],['operations','操作与复盘']]){await go(page);expect(window.document.querySelector('h1')?.textContent).toContain(title);expect(window.document.querySelectorAll('.sidebar nav a')).toHaveLength(6);}for(const tab of ['logic','plans','sources','history']){await go('asset/a-cloud/'+tab);expect(window.document.querySelector('h1')?.textContent).toBe('青岚云服务');expect(window.document.querySelector('.tabs [aria-current]')).not.toBeNull();}});
test('搜索与筛选实际改变列表',async()=>{await go('assets');const input=window.document.querySelector('#search') as any;input.value='不存在的标的';input.dispatchEvent(new window.Event('input'));expect(window.document.querySelector('main')?.textContent).toContain('暂无匹配的标的');await go('plans');const select=window.document.querySelector('#status') as any;select.value='retired';select.dispatchEvent(new window.Event('change'));expect(window.document.querySelector('main')?.textContent).toContain('暂无匹配的操作预案');});
test('讨论摘要弹窗可打开关闭，成交详情显示前后截面',async()=>{await go('plans');(window.document.querySelector('[data-summary]') as any).click();await Bun.sleep(10);expect(window.document.querySelector('dialog textarea')?.textContent).toContain('plan-cloud');(window.document.querySelector('[data-close]') as any).click();await go('record/trade-demo/1');expect(window.document.querySelector('main')?.textContent).toContain('当时资金与持仓');expect(window.document.querySelector('main')?.textContent).toContain('实际操作后');expect(window.document.querySelector('main')?.textContent).toContain('事后补录');});
test('空私人工作区明确未知，输入文本不能生成可执行 HTML',async()=>{data=emptyState('personal');(window.document.querySelector('[data-refresh]') as any).click();await Bun.sleep(10);await go('portfolio');expect(window.document.querySelector('main')?.textContent).toContain('当前资金与持仓尚未录入');data=append(data,{...demoRecords()[0],title:'<img src=x onerror=alert(1)>'});(window.document.querySelector('[data-refresh]') as any).click();await Bun.sleep(10);await go('principles');expect(window.document.querySelector('main img')).toBeNull();expect(window.document.querySelector('main')?.textContent).toContain('<img src=x');});
