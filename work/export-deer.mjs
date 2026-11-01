import assert from 'node:assert/strict';
import {loadEffect,renderFrames,spriteSheet,save} from '../tools/lib/fxlib.mjs';
import {encodePNG} from '../tools/lib/png.mjs';
import {createFrame,painterFor} from '../src/core/index.js';
const fx=await loadEffect('critters/sika-deer-idle'),r=renderFrames(fx);
const out='C:/Users/智/Documents/Codex/2026-11-01/new-chat/outputs/sika-deer-idle';
const s=spriteSheet(fx,r,'sika-deer-idle');
s.json.frames.forEach((f,i)=>f.duration=Math.round((i+1)*1000/30)-Math.round(i*1000/30));
s.json.meta.pixelfx.duration=4;
save(out+'/sika-deer-idle.png',s.png);save(out+'/sika-deer-idle.json',JSON.stringify(s.json,null,2));
for(let i=0;i<r.n;i++){
 save(out+'/frames/deer_'+String(i).padStart(3,'0')+'.png',encodePNG(r.w,r.h,r.frames[i].clear));
 save('E:/UnityProject/pixelfx/work/deer-preview/'+String(i).padStart(3,'0')+'.png',encodePNG(r.w,r.h,r.frames[i].color));
}
assert.equal(r.n,120);assert(r.frames.every(f=>f.raw.some(c=>c>>>24)));
const A=createFrame(112,104),B=createFrame(112,104),options={...fx.meta.options};
for(const [frame,t] of [[A,0],[B,4]]) {const p=painterFor(frame).place(...fx.meta.origin);fx.mod.draw(p,t,options);fx.mod.drawBack(p,t,options);}
assert.deepEqual(A.color,B.color);assert.deepEqual(A.light,B.light);
for(const t of [.65,1.15,2,2.6,3.05]) {const f=createFrame(112,104);fx.mod.draw(painterFor(f).place(...fx.meta.origin),t,options);assert(f.color.some((v,i)=>v!==A.color[i]));}
console.log('120 visible frames; exact 0/4-second loop seam; ear, tail, nod and blink poses change.');
