import {test,expect} from 'bun:test';
import {publicState} from '../src/public';
import {handler} from '../src/server';
import {portfolio,latest} from '../src/model';

test('公开快照独立于私人目录，保留未研究和未知资金状态',async()=>{
 const serve=handler('/does-not-exist/private-workspace',4318,publicState);
 const response=serve(new Request('http://localhost:4318/api/state',{headers:{host:'localhost:4318'}}));
 expect(response.status).toBe(200);
 const state=await response.json();
 expect(latest(state)).toHaveLength(13);
 const histories=state.records.filter((r:any)=>r.id==='account-history');
 expect(histories.length).toBeGreaterThan(0);
 for(const r of histories){expect(r.title).toContain('虚构');expect(r.body).toContain('以下日期、金额和账户情境均为虚构');expect(r.source).toContain('虚构');expect(r.identity).not.toBe('fact');}
 expect(state.records.find((r:any)=>r.id==='btc').status).toBe('draft');
 expect(portfolio(state)).toEqual([]);
 expect(JSON.stringify(state)).not.toMatch(/\/home\/|\/mnt\//);
 const summary=await serve(new Request('http://localhost:4318/api/summary?id=btc',{headers:{host:'localhost:4318'}})).json();
 expect(summary.text).toContain('btc');
});
test('公开快照每次独立读取，调用方不能修改后续响应',()=>{
 const first=publicState();first.records[0].body='unexpected mutation';
 expect(publicState().records[0].body).not.toBe('unexpected mutation');
});
