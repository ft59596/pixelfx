// Original code-drawn character study from the user's uploaded black/gold knight reference.
// No cropped illustration parts or generated raster frames are used at runtime.
import {fit,hex,clamp,smooth,lerp,TAU,rand,sparkle,createFrame,painterFor} from '../../core/index.js';
import {curve} from '../critters/_lib.js';
export const meta={name:'Augustus sword attack',desc:'A black-and-gold crowned knight coils, raises his sword, steps into a golden cleave, holds contact and returns to guard with his cape settling.',tags:['move','melee','sword','holy','attack','one-shot'],size:[224,192],origin:[80,152],duration:1.8,fps:30,loop:false,endBehavior:'hold',bg:'ground',options:{palette:['#29160c','#66451d','#b07c31','#e7b34f','#ffdc86','#fff2c9','#ffffff'],seed:7}};
export const animation={windup:[0,.52],swing:[.52,.70],hitTime:.70,hitStop:[.70,.80],recovery:[.80,1.45],holdLastFrame:true};
const INK=hex('#0c0c14'),DARK=hex('#191922'),PLATE=hex('#30313c'),MID=hex('#45424b'),LIT=hex('#67616a');
const RED=[hex('#290c1b'),hex('#4b1224'),hex('#761d30'),hex('#a52f3b'),hex('#cb4c46')];
const HIT=.70;
function pose(time){
 const t=clamp(time,0,1.8),kt=t>=.7&&t<=.8?.7:t>.8?t-.1:t;
 const a=curve(kt,[[0,.88],[.12,.9],[.36,-2.18],[.52,-2.3],[.59,-1.35],[.65,-.15],[.7,.72],[.88,1.12],[1.18,.75],[1.4,.88]]);
 const lean=curve(kt,[[0,0],[.30,-4],[.52,-6],[.7,10],[.9,6],[1.4,0]]);
 const crouch=curve(kt,[[0,0],[.45,5],[.7,7],[.9,4],[1.4,0]]);
 const step=curve(kt,[[0,0],[.52,-2],[.7,9],[.95,7],[1.4,0]]);
 const chest=[step+lean,-70+crouch],hip=[step,-40+crouch*.45],head=[chest[0]+2,-90+crouch];
 const shoulder=[chest[0]-8,chest[1]+1];
 const hand=[shoulder[0]+Math.cos(a)*20+5,shoulder[1]+Math.sin(a)*20+5];
 return {t,kt,a,lean,crouch,step,chest,hip,head,shoulder,hand};
}
const tri=(p,A,B,C,c)=>p.poly([A,B,C],c);
function gem(p,x,y,r,C){p.poly([[x,y-r],[x+r,y],[x,y+r],[x-r,y]],C[1]);tri(p,[x,y-r],[x,y+r],[x-r,y],C[4]);p.line(x,y-r,x+r,y,C[6]);}
function joint(p,x,y,r,C){p.circle(x,y,r+1,INK);p.circle(x,y,r,C[1]);p.circle(x-1,y-1,Math.max(1,r-1),C[3]);p.px(x-1,y-2,C[5]);}
function segment(p,A,B,width,C){
 p.beam(...A,...B,width+2,INK);p.beam(...A,...B,width,C[1]);
 const dx=B[0]-A[0],dy=B[1]-A[1],len=Math.hypot(dx,dy)||1,nx=-dy/len,ny=dx/len;
 p.beam(A[0]-nx,A[1]-ny,B[0]-nx,B[1]-ny,Math.max(2,width-2),PLATE);
 for(let i=0;i<3;i++) {const u=.15+i*.29,x=lerp(A[0],B[0],u),y=lerp(A[1],B[1],u);p.line(x-nx*width*.45,y-ny*width*.45,x+nx*width*.35+dx*.09,y+ny*width*.35+dy*.09,C[3]);p.px(x-nx*width*.45,y-ny*width*.45,C[5]);}
}
function elbow(A,B,L=15){
 const dx=B[0]-A[0],dy=B[1]-A[1],d=Math.hypot(dx,dy)||1,h=Math.sqrt(Math.max(0,L*L-d*d/4));
 return [(A[0]+B[0])/2-dy/d*h,(A[1]+B[1])/2+dx/d*h];
}
function blade(p,P,C){
 const [hx,hy]=P.hand,a=P.a,ux=Math.cos(a),uy=Math.sin(a),nx=-uy,ny=ux;
 const at=(u,v)=>[hx+ux*u+nx*v,hy+uy*u+ny*v];
 p.beam(...at(-9,0),...at(3,0),4,INK);p.beam(...at(-9,0),...at(3,0),2,C[2]);
 p.poly([at(2,-6),at(5,-4),at(8,-3),at(51,-1),at(58,0),at(49,4),at(7,4),at(4,6)],C[3]);
 p.poly([at(8,-2),at(48,0),at(54,0),at(47,2),at(8,3)],DARK);
 p.line(...at(8,-3),...at(57,0),C[5]);p.line(...at(8,1),...at(52,1),C[1]);
 p.line(...at(3,-11),...at(3,11),C[2]);p.line(...at(2,-10),...at(2,10),C[5]);
 p.circle(...at(3,0),5,C[2]);p.circle(...at(3,0),3,INK);gem(p,...at(3,0),2,C);
 for(const side of [-1,1])tri(p,at(0,side*7),at(3,side*13),at(6,side*8),C[3]);
 joint(p,hx-1,hy,3,C);
}
function halo(p,P,C){const [x,y]=P.head,cy=y-7;
 p.ring(x,cy,21,1,C[3]);p.ring(x,cy,20,1,C[1]);
 for(let i=0;i<13;i++){const a=i/13*TAU+P.t*.04,u=Math.cos(a),v=Math.sin(a);tri(p,[x+u*20-v,y-7+v*20+u],[x+u*28,y-7+v*28],[x+u*20+v,y-7+v*20-u],C[i%3===0?5:3]);}
 p.glow(x,cy,33,C[3],.12);
 for(let i=0;i<5;i++){const a=rand(i,7)*TAU,x0=x+Math.cos(a)*30,y0=cy+Math.sin(a)*28,k=.5+.5*Math.sin(P.t*6+i*2);if(k>.5)sparkle(p,x0,y0,1+k,C[5],C[3],k*.18);}
}
function cape(p,P,C){
 const q=Math.max(0,P.t-.53),fling=Math.sin(clamp(q/.5)*Math.PI)*14;
 const topX=P.chest[0]-9,topY=P.chest[1]-8;
 for(let i=0;i<7;i++){
  const x=topX-11+i*4,tail=x-14-fling*(1-i/10)+Math.sin(P.t*7+i)*2;
  const y=-6+(i%3)*3;
  const pts=[[x,topY],[x+8,topY+4],[tail+8,y-2],[tail+3,y-4],[tail+1,y+2],[tail-3,y-3],[tail-6,y+1],[x-8,topY+26]];
  p.poly(pts,RED[i%3]);p.line(x+2,topY+12,tail+4,y-9,RED[3]);p.line(tail-4,y-3,tail+3,y-4,C[2]);
 }
}
function knight(p,P,C){
 const H=P.hip,CH=P.chest;
 const leg=(side)=>{const hip=[H[0]+side*6,H[1]],knee=[side*9+P.step*.5+(side>0?P.lean*.4:-P.lean*.3),-22+P.crouch*.5],foot=[side*15+(side>0?P.step:0),-2];segment(p,hip,knee,10,C);segment(p,knee,foot,9,C);gem(p,...knee,5,C);p.poly([[foot[0]-5,-6],[foot[0]+4,-6],[foot[0]+9,0],[foot[0]-6,0]],INK);p.poly([[foot[0]-4,-5],[foot[0]+3,-5],[foot[0]+7,-1],[foot[0]-5,-1]],PLATE);p.line(foot[0]-4,-4,foot[0]+6,-1,C[3]);};
 leg(-1);leg(1);
 // Red split tabard, bordered in old gold.
 p.poly([[H[0]-5,H[1]-2],[H[0]+6,H[1]-2],[H[0]+9,-9],[H[0]+3,-4],[H[0]+1,-22],[H[0]-2,-6],[H[0]-9,-10]],RED[2]);
 p.line(H[0]-5,H[1],H[0]-7,-12,C[3]);p.line(H[0]+5,H[1],H[0]+7,-10,C[2]);gem(p,H[0]+1,-20,2,C);
 // Angular chest and overlapping abdominal plates.
 p.poly([[CH[0]-12,CH[1]-2],[CH[0]+11,CH[1]-2],[H[0]+11,H[1]-2],[H[0],H[1]+3],[H[0]-11,H[1]-2]],INK);
 p.poly([[CH[0]-10,CH[1]],[CH[0]+9,CH[1]],[H[0]+8,H[1]-4],[H[0],H[1]],[H[0]-9,H[1]-4]],PLATE);
 p.poly([[CH[0]-9,CH[1]+1],[CH[0]+2,CH[1]+3],[H[0],H[1]-8],[H[0]-8,H[1]-10]],MID);
 p.line(CH[0]-10,CH[1],CH[0],CH[1]+8,C[4]);p.line(CH[0],CH[1]+8,CH[0]+9,CH[1],C[3]);
 for(let i=0;i<3;i++){const y=CH[1]+12+i*5,x=lerp(CH[0],H[0],.5+i*.2);p.line(x-7,y,x,y+3,C[2]);p.line(x,y+3,x+7,y,C[3]);}
 gem(p,CH[0]+6,CH[1]+5,4,C);p.line(H[0]-10,H[1],H[0]+9,H[1],C[2]);gem(p,H[0],H[1],3,C);
 // Far arm balances the torso and responds to the forward step.
 const farS=[CH[0]+11,CH[1]+1],farE=[CH[0]+16,CH[1]+15],farH=[CH[0]+13-P.lean*.35,CH[1]+28];
 segment(p,farS,farE,7,C);segment(p,farE,farH,6,C);joint(p,...farH,3,C);
 const E=elbow(P.shoulder,P.hand,15);segment(p,P.shoulder,E,9,C);segment(p,E,P.hand,8,C);
 // Mane and muzzle of the gold lion pauldron.
 const sx=P.shoulder[0]-3,sy=P.shoulder[1];
 for(let i=0;i<8;i++){const a=i/8*TAU;tri(p,[sx+Math.cos(a)*5,sy+Math.sin(a)*5],[sx+Math.cos(a)*11,sy+Math.sin(a)*10],[sx+Math.cos(a+.45)*6,sy+Math.sin(a+.45)*6],C[i%2?2:3]);}
 p.ellipse(sx,sy,6,7,C[1]);p.ellipse(sx-1,sy-2,5,5,C[3]);p.ellipse(sx+2,sy+1,4,5,C[4]);p.line(sx-4,sy,sx-2,sy+5,C[2]);p.line(sx-2,sy+2,sx-1,sy+6,C[3]);p.px(sx+3,sy-2,INK);p.px(sx+4,sy-2,C[6]);p.line(sx+2,sy+3,sx+5,sy+3,INK);p.px(sx+4,sy+4,C[5]);
 const [hx,hy]=P.head;
 p.poly([[hx-7,hy-8],[hx+4,hy-9],[hx+9,hy-3],[hx+6,hy+9],[hx,hy+13],[hx-7,hy+7]],INK);
 p.poly([[hx-5,hy-7],[hx+3,hy-7],[hx+7,hy-2],[hx+4,hy+8],[hx,hy+10],[hx-5,hy+5]],PLATE);
 tri(p,[hx,hy-5],[hx+6,hy-1],[hx,hy+9],DARK);
 p.line(hx-4,hy-1,hx+1,hy+2,C[4]);p.line(hx+1,hy+2,hx+6,hy-1,C[5]);p.line(hx+1,hy+2,hx+1,hy+7,C[3]);
 // Crown spires read clearly against the dark halo center.
 for(let i=0;i<5;i++){const x=hx-7+i*3;tri(p,[x-2,hy-9],[x,hy-18-(i%2)*3],[x+2,hy-9],C[i%2?4:3]);p.px(x,hy-18-(i%2)*3,C[5]);}
 p.line(hx-8,hy-9,hx+7,hy-9,C[4]);
 for(let i=0;i<4;i++){const x=CH[0]-7+i*5,y=CH[1]+12+(i%2)*8;p.line(x,y,x+1,y+9,C[1]);gem(p,x+1,y+10,1.5,C);}
 blade(p,P,C);
}
function slash(p,P,C){
 const q=P.t-.52;
 if(q<0||P.t>1.15)return;
 const center=[5,-65],head=curve(P.kt,[[.52,-2.3],[.59,-1.35],[.65,-.15],[.7,.72],[.9,1.12]]),fade=1-smooth(.81,1.15,P.t);
 const tail=Math.max(-2.3,head-1.3),pts=[],inner=[];
 for(let i=0;i<=32;i++){const u=i/32,a=lerp(tail,head,u),r=67,th=(2+8*Math.sin(u*Math.PI))*fade;pts.push([center[0]+Math.cos(a)*r,center[1]+Math.sin(a)*r]);inner.unshift([center[0]+Math.cos(a)*(r-th),center[1]+Math.sin(a)*(r-th)]);}
 p.poly([...pts,...inner],C[2],fade);p.polyline(pts,C[5],fade);
 p.glowLine(...pts[25],...pts[32],10,C[3],.23*fade);
 const age=P.t-HIT;
 if(age>=0&&age<.45){const k=1-age/.45;
 for(let i=0;i<14;i++){const a=rand(i,P.seed)*TAU,sp=28+rand(i+20,3)*70,x=58+Math.cos(a)*sp*age,y=-18+Math.sin(a)*sp*age+60*age*age;p.line(x-Math.cos(a)*3,y-Math.sin(a)*3,x,y,C[i%3===0?6:4],k);p.glow(x,y,4,C[3],k*.2);}
 if(age<.1)sparkle(p,58,-18,8*(1-age/.1),C[6],C[4],.5);
 }
}

function paintPose(p,t,o){const P=pose(t),C=fit(o.palette,7);P.seed=o.seed;p.ellipse(P.step,1,25,3,INK,.45);halo(p,P,C);cape(p,P,C);knight(p,P,C);slash(p,P,C);}

// Bake code-drawn poses once per palette/seed, then replay sparse pixels. This is
// a render cache, not imported sprite art; mirrored instances share the same clip.
const clips=new Map();
function clipFor(o){
 const key=JSON.stringify([o.palette,o.seed]);
 if(clips.has(key))return clips.get(key);
 const frames=[];
 for(let i=0;i<=54;i++){
  const f=createFrame(...meta.size);paintPose(painterFor(f).place(...meta.origin),i/30,o);
  const color=[],light=[];
  for(let j=0;j<f.color.length;j++){
   const x=j%f.w-meta.origin[0],y=Math.floor(j/f.w)-meta.origin[1];
   if(f.color[j]>>>24)color.push([x,y,f.color[j]]);
   if(f.light[j]&0xffffff)light.push([x,y,f.light[j]]);
  }
  frames.push({color,light});
 }
 if(clips.size>=8)clips.delete(clips.keys().next().value);
 clips.set(key,frames);return frames;
}
export function create(o){
 const clip=clipFor(o);let t=0;
 return {update(dt){t+=dt;},draw(p){
  const f=clip[Math.min(54,Math.floor(t*30+1e-6))];
  for(const [x,y,c] of f.color)p.px(x,y,c);
  for(const [x,y,c] of f.light)p.light(x,y,c,1);
 }};
}

export { pose as characterPose };
