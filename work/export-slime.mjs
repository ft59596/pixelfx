import {loadEffect,renderFrames,spriteSheet,save} from '../tools/lib/fxlib.mjs';
import {encodePNG} from '../tools/lib/png.mjs';
const out='C:/Users/智/Documents/Codex/2026-11-01/new-chat/outputs/slime-animations';
for(const name of ['slime-move','slime-attack','slime-death']) {
 const fx=await loadEffect('critters/'+name),r=renderFrames(fx);
 if(!fx.meta.loop && fx.meta.endBehavior!=="hold"){r.frames.pop();r.n=r.frames.length;}
 const s=spriteSheet(fx,r,name);
 s.json.frames.forEach((f,i)=>f.duration=Math.round((i+1)*1000/30)-Math.round(i*1000/30));
 s.json.meta.pixelfx.duration=fx.meta.duration;
 if(fx.mod.animation)s.json.meta.pixelfx.animation=fx.mod.animation;
 save(out+'/'+name+'/'+name+'.png',s.png);save(out+'/'+name+'/'+name+'.json',JSON.stringify(s.json,null,2));
 for(let i=0;i<r.n;i++){
  save(out+'/'+name+'/frames/'+String(i).padStart(3,'0')+'.png',encodePNG(r.w,r.h,r.frames[i].clear));
  save('E:/UnityProject/pixelfx/work/slime-preview-frames/'+name+'/'+String(i).padStart(3,'0')+'.png',encodePNG(r.w,r.h,r.frames[i].color));
 }
 console.log(name,r.n,fx.meta.duration);
}
