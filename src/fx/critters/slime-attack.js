import {base,jelly,ground,drops,curve,smooth,fit,clamp} from './_slime-animation.js';
export const meta={...base,name:'Slime attack',desc:'A glowing slime crouches, lunges right, holds the impact and rebounds. Its recovered standing pose remains visible after the attack.',tags:['critter','slime','attack','melee','one-shot'],duration:1.2,loop:false,endBehavior:'hold'};
export const animation={hitTime:.4,recoverTime:.95,gameplayFrames:36,fps:30};
export function draw(p,t,o) {
 t=Math.min(t,meta.duration);
 const x=curve(t,[[0,0],[.25,-6],[.39,17],[.46,17],[.68,5],[.95,0],[1.2,0]]);
 const s=curve(t,[[0,0],[.26,-.4],[.35,.2],[.4,-.2],[.46,-.2],[.63,.17],[.8,-.1],[1,0]]);
 const y=curve(t,[[0,0],[.28,0],[.35,-8],[.46,-5],[.64,0],[1,0]]);
 const lean=curve(t,[[0,0],[.26,-.3],[.36,.7],[.46,.7],[.7,-.15],[1,0]]);
 ground(p,o,x,17);
 jelly(p,o,{x,y,s,lean,t,period:meta.duration,round:t>.29&&t<.6?.6:.1,face:t>.16&&t<.56?'angry':'normal'});
 drops(p,o,t-.43,{x:25,y:-9,speed:65,life:.5,count:8});
 const C=fit(o.palette,7);
 if(t>.31&&t<.4) for(let i=0;i<3;i++) p.line(x-27-i*2,-9-i*5,x-17,-9-i*5,C[4],.5);
 if(t>=.4&&t<.5) { const k=1-(t-.4)/.1; p.line(35,-15,41+k*3,-17,C[6],k); p.line(35,-10,43,-9,C[5],k); }
}
