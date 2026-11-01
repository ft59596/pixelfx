import {fit,hex,lerp,smooth,TAU} from '../../core/index.js';
import {Grid,shift,shadow} from './_lib.js';
export const meta={name:'Sika deer idle',desc:'A warm brown spotted stag stands alert: its chest breathes, ears turn independently, eyes blink and its white-tailed rump gives a small flick.',tags:['critter','animal','deer','idle','nature','loop'],size:[112,104],origin:[54,91],duration:4,loop:true,fps:30,bg:'ground',options:{palette:['#21151a','#463025','#70432c','#9f6238','#c58a51','#e3b879','#f5dec0'],belly:['#665044','#ba9f7c','#f0dfbb'],antlers:['#403027','#89694a','#c5a57c'],seed:1}};
const GRID=new Grid(-39,-88,82,91);
const EYE=hex('#15141b'),HOOF=hex('#2d252a');
const window=(t,a,b,c,d)=>smooth(a,b,t)*(1-smooth(c,d,t));
function leaf(g,x,y,len,w,a,C){const ux=Math.cos(a),uy=Math.sin(a),nx=-uy,ny=ux;
 g.shade(x-len-w,y-len-w,x+len+w,y+len+w,(px,py)=>{
  const dx=px-x,dy=py-y,u=(dx*ux+dy*uy)/len,v=(dx*nx+dy*ny)/w;
  if(u<0||u>1||Math.abs(v)>Math.sin(u*Math.PI)*.85)return 0;
  return Math.abs(v)>.48?C[0]:v<-.06?C[2]:C[1];
 });
}
function antler(g,x,y,flip,A){
 const pts=[[x,y],[x+flip*1,y-7],[x+flip*4,y-15],[x+flip*2,y-23]];
 g.tube(pts,u=>1.05-u*.65,(u,v)=>v>.5?A[0]:A[1]);
 for(const [k,tx,ty] of [[1,-5,-12],[2,10,-20],[2,6,-26]]){
  const from=pts[k],to=[x+flip*tx,y+ty];
  g.line(...from,...to,A[1]);g.set(to[0],to[1],A[2]);
 }
 g.line(x,y-1,x+flip,y-7,A[2]);
}
function leg(g,pts,C,far=false){
 g.tube(pts,u=>u<.32?2.7-u*3.5:1.35-u*.55,(u,v)=>far?(v>.5?C[1]:C[2]):v>.6?C[2]:u<.25?C[4]:C[3]);
 const [x,y]=pts.at(-1);g.line(x-1,y,x+2,y,HOOF);g.line(x-1,y-1,x+1,y-1,far?C[0]:C[2]);
 if(!far)g.set(x+1,y,C[3]);
}
function deer(g,C,B,A,t){
 g.clear();
 const breathing=Math.sin(t/4*TAU*2),by=breathing*.45;
 const nod=window(t,1.45,1.8,2.22,2.6),hx=24+nod*1.5,hy=-48+by+nod*2;
 const farEar=window(t,.48,.65,.73,.92),nearEar=window(t,2.85,3.02,3.13,3.34);
 const blink=window(t,2.55,2.58,2.65,2.7)>.5;
 const flick=window(t,.95,1.04,1.20,1.44)*Math.sin((t-.95)*18);
 // Back legs are visible between the near pair and shaded one step darker.
 leg(g,[[-13,-27+by],[-12,-15],[-8,-9],[-9,-1]],C,true);
 leg(g,[[14,-28+by],[17,-16],[19,-7],[20,-1]],C,true);
 // Small white rump and upright flick of the tail.
 g.tube([[-24,-32+by],[-29,-34+flick*2],[-31,-35+flick*3]],u=>2.7-u*1.6,(u,v)=>v>.35?C[2]:B[2]);
 g.line(-25,-32+by,-30,-34+flick*3,B[2]);
 // Torso has clear flat ramps: dark lower rim, warm coat, sunlit upper-left.
 g.ellipse(-5,-31+by,21,9.5+breathing*.35,(nx,ny)=>ny>.62?C[1]:ny>.24?C[2]:nx<-.25&&ny<-.22?C[5]:ny<-.5?C[4]:C[3]);
 g.ellipse(-20,-29+by,5.2,7,(nx,ny)=>nx<-.3?B[2]:ny>.1?B[1]:C[4]);
 // Pale belly is narrow, leaving a large brown flank for the sika's spots.
 g.ellipse(-3,-25.5+by,13,2.6,(nx,ny)=>ny<-.25?B[1]:B[2]);
 // Chest and rising neck; broad at the shoulder and slender under the jaw.
 g.tube([[11,-31+by],[18,-40+by],[hx-2,hy+2]],u=>5.8-u*2.9,(u,v)=>v>.65?C[1]:v>.25?C[3]:C[4]);
 g.tube([[15,-32+by],[20,-40+by],[hx+1,hy+3]],u=>2.1-u*.7,B[1]);
 // Rows of cream spots follow the breathing torso, never crawl across the coat.
 for(const [x,y] of [[-19,-35],[-12,-36],[-5,-36],[2,-35],[8,-34],[-16,-30],[-9,-31],[-2,-31],[5,-30]]){
  g.set(x,y+by,B[1]);g.set(x+1,y+by,B[2]);g.set(x,y+1+by,B[2]);
 }
 // Two small branching antlers, with one behind the head.
 antler(g,hx-3,hy-5,-1,A);antler(g,hx+1,hy-6,1,A);
 leaf(g,hx-3,hy-5,11,3.4,-2.52+farEar*.65,[C[1],C[3],B[1]]);
 // Skull, cheek and the deer's long tapering muzzle point right.
 g.ellipse(hx,hy,6.3,5.7,(nx,ny)=>ny>.45?C[2]:nx<-.2&&ny<-.2?C[5]:C[4]);
 g.tube([[hx+2,hy+1],[hx+7,hy+3],[hx+11,hy+4]],u=>3.4-u*1.7,(u,v)=>v>.3?B[1]:C[4]);
 g.line(hx+9,hy+4,hx+11,hy+4,EYE);g.set(hx+11,hy+3,EYE);
 g.line(hx+5,hy+5,hx+9,hy+5,C[1]);g.set(hx+6,hy+4,B[2]);
 leaf(g,hx,hy-5,11.5,3.4,-1.08-nearEar*.75,[C[1],C[3],B[2]]);
 // A short upper lid makes a visible blink without moving the eye socket.
 if(blink)g.line(hx+2,hy-1,hx+4,hy-1,C[1]);
 else {g.set(hx+3,hy-1,EYE);g.set(hx+3,hy,EYE);g.set(hx+4,hy-1,C[6]);g.set(hx+2,hy-2,C[2]);}
 // Near legs are drawn last, anchored to their hooves throughout the idle.
 leg(g,[[-20,-28+by],[-22,-17],[-18,-10],[-19,-1]],C);
 leg(g,[[10,-29+by],[9,-17],[10,-8],[10,-1]],C);
 // Shoulder and haunch cover leg roots and keep the anatomy continuous.
 g.ellipse(-19,-29+by,4.1,5.3,(nx,ny)=>ny>.35?C[2]:C[3]);
 g.line(10,-30+by,9,-25+by,C[2]);
 g.outline((x,y,nx,ny)=>ny<0&&nx<0?C[1]:C[0]);
}
export function draw(p,time,o){
 // Pose changes at 15 fps, like the library's other articulated small creatures.
 const t=Math.floor(shift(time,meta.duration,o.seed)*15)/15;
 deer(GRID,fit(o.palette,7),fit(o.belly,3),fit(o.antlers,3),t);GRID.draw(p);
}
export function drawBack(p,time,o){const C=fit(o.palette,7);shadow(p,-1,1,32,2.2,C[0],.4);}
