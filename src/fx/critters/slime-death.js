import {base,jelly,ground,drops,curve,smooth,fit,rand,TAU,shimmer} from './_slime-animation.js';
export const meta={...base,name:'Slime death',desc:'A struck slime flashes, shudders and swells, bursts into ballistic jelly droplets and collapses into a puddle that shrinks away.',tags:['critter','slime','death','goo','one-shot'],duration:1.6,loop:false};
export function draw(p,t,o) {
 if(t>=1.6) return;
 const C=fit(o.palette,7);
 if(t<.46) {
  const s=curve(t,[[0,0],[.08,-.18],[.16,.25],[.24,-.3],[.37,.5],[.46,.8]]);
  const x=t<.28?Math.sin(t*90)*2*(1-t/.32):0;
  ground(p,o,0,17);
  jelly(p,o,{s,x,t,period:meta.duration,round:.3,face:'dead',flash:t<.067});
 }
 const age=t-.44;
 if(age>=0) {
  if(t>=.46) shimmer(p,o,t,meta.duration,{y:0,h:4,fade:1-smooth(.5,1.55,t)});
  const k=1-smooth(.7,1.15,age), w=curve(age,[[0,10],[.16,27],[.55,22],[.8,15],[1.16,0]]);
  if(w>.1) {p.ellipse(0,-1,w,3*k,C[2],k);p.line(-w*.7,-2,w*.7,-2,C[4],k*.8);}
  drops(p,o,age,{count:18,x:0,y:-16,speed:95,life:1.05});
  for(let i=0;i<5;i++) { const born=.24+i*.085, a=age-born; if(a<0||a>.28) continue; const x=(rand(i+3,o.seed)-.5)*38; const r=1+Math.sin(a/.28*Math.PI)*1.5; p.ring(x,-3-r,r,1,C[5],1-a/.28); }
 }
}
