import assert from 'node:assert/strict';
import {loadEffect,renderFrames,spriteSheet,save} from '../tools/lib/fxlib.mjs';
import {encodePNG} from '../tools/lib/png.mjs';
import {createFx,createFrame,clearFrame} from '../src/core/index.js';
const fx=await loadEffect('moves/augustus-sword-attack'),r=renderFrames(fx);
const out='C:/Users/智/Documents/Codex/2026-11-01/new-chat/outputs/augustus-pixelfx';
assert.equal(r.n,54);assert(r.frames.every(f=>f.raw.some(c=>c>>>24)));
const s=spriteSheet(fx,r,'augustus-sword-attack');
s.json.frames.forEach((f,i)=>f.duration=Math.round((i+1)*1000/30)-Math.round(i*1000/30));
s.json.meta.pixelfx.animation=fx.mod.animation;s.json.meta.pixelfx.duration=1.8;
save(out+'/augustus-sword-attack.png',s.png);save(out+'/augustus-sword-attack.json',JSON.stringify(s.json,null,2));
for(let i=0;i<r.n;i++){
 save(out+'/frames/attack_'+String(i).padStart(3,'0')+'.png',encodePNG(r.w,r.h,r.frames[i].clear));
 save('E:/UnityProject/pixelfx/work/augustus-preview/'+String(i).padStart(3,'0')+'.png',encodePNG(r.w,r.h,r.frames[i].color));
}
const inst=createFx(fx.mod,{x:80,y:152}),frame=createFrame(...fx.meta.size);
inst.update(1.8);inst.draw(frame);const final=frame.color.slice();assert(final.some(c=>c>>>24));
inst.update(3);inst.draw(clearFrame(frame));assert.deepEqual(frame.color,final);
const a=fx.mod.characterPose(.70),b=fx.mod.characterPose(.7666667);
for(const key of ['hand','shoulder','chest','hip','head','a','lean','crouch','step'])assert.deepEqual(a[key],b[key]);
const short=renderFrames(fx,{options:{palette:['#1a1229','#793dc0','#ffb4fa','#ffffff']}});assert(short.frames[15].raw.some(c=>c>>>24));
console.log('54 nonblank frames, held recovery pose, hit-stop body and alternate palette verified.');
