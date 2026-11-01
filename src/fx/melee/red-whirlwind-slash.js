import { fit, smooth, clamp, TAU, rand, READY } from '../../core/index.js';
export const meta = {
 name: 'Red whirlwind slash · 5s',
 desc: 'Crimson crescent blades orbit the waist for five seconds, with layered trailing cuts, tangential sparks and a soft finishing dissolve.',
 tags: ['melee','red','whirlwind','spin','slash','aoe','one-shot'],
 size: [192,128], origin: [96,92], duration: 5, fps: 30, loop: false, bg: 'ground', actor: 2,
 options: { palette: ['#360816','#740c23','#bd1235','#ef2544','#ff5662','#ff9b98','#ffe0d3'], radius: 49, seed: 17 }
};
const guard = {...READY, weapon:'sword', fx:12, fy:-21, sa:-0.8};
const spin = {...guard, crouch:4, fx:18, fy:-20, bx:-8, by:-22, sa:0.1, ffx:9, fbx:-9};
export const act = { poses: [[-0.25,guard],[-0.08,{...guard,crouch:6,yaw:0.8}],[0,spin,'snap'],
 ...Array.from({length:54},(_,i)=>[(i+1)/12,{...spin,yaw:-(i+1)*TAU/4},'snap']),
 [4.65,{...spin,yaw:-54*TAU/4}],[5,guard]], hits:[], dust:[{t:0.08,x:0,n:6}] };
function layer(p,t,o,front) {
 if(t<=0 || t>=5) return;
 const C=fit(o.palette,7), env=smooth(0,0.14,t)*(1-smooth(4.25,5,t));
 const radius=clamp(o.radius,20,58), phase=t*TAU*2.65;
 for(let j=0;j<3;j++) {
  const R=(radius-j*7)*(.7+.3*env), sy=.34+j*.035, cy=-19-j*6;
  const head=phase+j*TAU/3, span=4.25-j*.3;
  p.shade(-R-2,cy-R*sy-3,R+2,cy+R*sy+3,(x,y,out)=>{
   const yy=(y-cy)/sy, a=Math.atan2(yy,x), frontPixel=Math.sin(a)>=0;
   if(frontPixel!==front) return;
   const lag=((head-a)%TAU+TAU)%TAU;
   if(lag>span) return;
   const u=1-lag/span, r=Math.hypot(x,yy), thick=(2+12*Math.sin(u*Math.PI*.86))*env*(j===0?1:.62);
   const q=(R-r)/thick;
   if(q<0||q>1) return;
   const hot=q<.17 && u>.65;
   out.c=C[hot ? 6 : Math.max(0,Math.min(5,Math.floor(5-q*3-lag*.7)-(front?0:1)))];
   out.a=env*clamp(u*3)*(front?1:.8);
  });
  for(let k=0;k<11;k++) {
   const a=head-k*.23, x=Math.cos(a)*(R-2), y=cy+Math.sin(a)*(R-2)*sy;
   if((Math.sin(a)>=0)!==front) continue;
   p.glow(x,y,7,C[3],.12*env*(1-k/13));
  }
 }
 // Short curved red filaments are shed along the orbit's tangent.
 for(let i=0;i<24;i++) {
  const birth=Math.floor(t*4+i*.37)/4-i*.0925, age=t-birth;
  if(age<0 || age>.5) continue;
  const a=rand(i,o.seed)*TAU+birth*TAU*2.65, rr=radius+age*(10+rand(i+31,o.seed)*24);
  if((Math.sin(a)>=0)!==front) continue;
  const x=Math.cos(a)*rr, y=-19+Math.sin(a)*rr*.36-age*12, k=(1-age/.5)*env;
  p.line(x-Math.sin(a)*3,y+Math.cos(a),x,y,C[4],k);
  p.glow(x,y,3,C[3],k*.18);
 }
}
export function drawBack(p,t,o){layer(p,t,o,false);}
export function draw(p,t,o){layer(p,t,o,true);}


