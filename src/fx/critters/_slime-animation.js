// Uses the existing slime's jelly shading; the original puddle recipe credits
// Sprite Fusion (Hugo Duprez, MIT) in slime.js.
import { fit, clamp, rand, TAU, cycle, sparkle } from '../../core/index.js';
import { slimeBody, meta as idleMeta } from './slime.js';
import { Grid, toss } from './_lib.js';
export { curve, toss } from './_lib.js';
export { smooth, clamp, lerp, TAU, rand, fit } from '../../core/index.js';
export const base = { size:[112,88], origin:[56,72], fps:30, bg:'ground', options:{...idleMeta.options} };
const grid = new Grid(-50,-65,100,68);
export function jelly(p,o,{x=0,y=0,s=0,lean=0,round=.1,face='normal',fade=1,flash=false,t=0,period=.8}={}) {
 const C=fit(o.palette,7), P={W:30/Math.sqrt(1+s),H:22*(1+s),by:y,s,lean,round};
 slimeBody(grid,C,P);
 const ey=Math.round(y-1-P.H*.47), xc=Math.round(lean*P.H*.47)+2;
 for(const side of [-1,1]) {
  const ex=xc+side*Math.max(3,Math.round(P.W*.16));
  if(face==='dead') { grid.line(ex-1,ey-1,ex+1,ey+1,C[0]); grid.line(ex+1,ey-1,ex-1,ey+1,C[0]); }
  else if(face==='angry') { grid.line(ex-1,ey-1-(side<0?1:0),ex+1,ey-(side>0?1:0),C[0]); grid.set(ex+1,ey+1,C[0]); }
  else if(face==='shut') grid.line(ex-1,ey,ex+1,ey,C[0]);
  else { for(let j=-2;j<=1;j++) {grid.set(ex,ey+j,C[0]);grid.set(ex+1,ey+j,C[0]);} grid.set(ex,ey-2,C[6]); }
 }
 const my=Math.round(y-1-P.H*.28);
 grid.line(xc-1,my,xc+1,my,C[1]);
 grid.outline((gx,gy,nx,ny)=>ny<0&&nx<0?C[1]:C[0]);
 if(flash) for(let i=0;i<grid.c.length;i++) if(grid.c[i]) grid.c[i]=C[6];
 grid.draw(p,fade,x,0);
 shimmer(p,o,t,period,{x,y,w:P.W,h:P.H,fade});
}
// Match slime.js: a broad green aura, inner jelly light, floor bounce,
// rising luminous spores and a glossy star glint riding the body's surface.
export function shimmer(p,o,t,period,{x=0,y=0,w=30,h=22,fade=1}={}) {
 if(fade<=.02) return;
 const C=fit(o.palette,7),phase=t/period*TAU;
 const pulse=.9+.1*Math.sin(phase*2);
 p.glow(x*.5,-14,64,C[3],.3*pulse*fade);
 p.glow(x,y-1-h*.45,30+w*.3,C[4],.2*fade);
 p.glow(x,y+2-h*.45,14,C[5],.16*fade);
 p.glow(x,-2,31,C[4],.2*fade);
 cycle(t,period,7,o.seed*13+1,r=>r.range(period*.65,period*.95),(age,L,r,i)=>{
  const k=age/L,px=x+r.range(-24,24)+Math.sin(k*4+i*1.7)*3,py=-2-r.range(18,32)*k;
  const a=Math.min(1,k*4)*Math.min(1,(1-k)*2.5)*fade;
  const tw=.6+.4*Math.sin(k*7+i*2.3),big=r.chance(.35);
  p.dot(px,py,tw>.8?C[6]:C[5],a);
  if(big){p.dot(px+1,py,C[5],a);p.dot(px,py+1,C[4],a);}
  p.glow(px,py,big?9:6,C[5],(big?.45:.32)*a*tw);
 });
 const glint=Math.pow(.5+.5*Math.cos(phase-1.1),6);
 if(glint*fade>.08) sparkle(p,x-w*.21,y-1-h*.8,(1+2.5*glint)*fade,C[6],C[5],.5*glint*fade);
}
export function ground(p,o,x=0,width=17,k=1) {
 const C=fit(o.palette,7);
 p.ellipse(x,0,width,2,C[1],k*.6);
 p.line(x-width*.7,-1,x+width*.7,-1,C[4],k);
}
export function drops(p,o,age,{count=10,x=0,y=-6,speed=85,life=.6,fade=1}={}) {
 if(age<0||age>life) return;
 const C=fit(o.palette,7);
 for(let i=0;i<count;i++) {
  const a=-Math.PI*.92+rand(i+41,o.seed)*Math.PI*.84;
  const sp=speed*(.55+rand(i+75,o.seed)*.55);
  const f=toss(x,y,Math.cos(a)*sp,Math.sin(a)*sp,age,330,-1);
  const k=clamp((life-age)/.18)*fade;
  if(f.landed) { p.line(f.x-2,-1,f.x+2,-1,C[4],k); p.dot(f.x,0,C[2],k); }
  else {const size=1+rand(i+91,o.seed)*1.5;p.ellipse(f.x,f.y,size,size*1.2,C[3],k);p.dot(f.x-1,f.y-1,C[5],k);}
  p.glow(f.x,f.y,6,C[4],.3*k);
 }
}
