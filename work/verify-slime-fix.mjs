import assert from 'node:assert/strict';
import * as attack from '../src/fx/critters/slime-attack.js';
import * as death from '../src/fx/critters/slime-death.js';
import {createFx,createFrame,clearFrame} from '../src/core/index.js';
import {loadEffect,renderFrames} from '../tools/lib/fxlib.mjs';
const f=createFrame(112,88),inst=createFx(attack,{x:56,y:72});
for(let i=0;i<64;i++) {
 clearFrame(f);inst.draw(f);
 assert(f.color.some(c=>c>>>24),'Attack became invisible at '+inst.t);
 inst.update(1/30);
}
clearFrame(f);inst.draw(f);const pose=f.color.slice(),light=f.light.slice();
inst.update(5);clearFrame(f);inst.draw(f);
assert.deepEqual(f.color,pose);assert.deepEqual(f.light,light);assert(inst.done());
const dying=createFx(death,{x:56,y:72});dying.update(1.6);clearFrame(f);dying.draw(f);assert(!f.color.some(Boolean)&&!f.light.some(Boolean));
const r=renderFrames(await loadEffect('critters/slime-attack'));
assert.equal(r.n,36);assert(r.frames.every(frame=>frame.raw.some(c=>c>>>24)));
console.log('Attack stays visible throughout and after completion; 36 nonblank frames. Death ends empty.');
