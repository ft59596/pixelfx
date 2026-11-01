from pathlib import Path
p=Path(r'E:\UnityProject\pixelfx\src\fx\moves\augustus-sword-attack.js')
s=p.read_text(encoding='utf-8')
s=s.replace('rand,sparkle}', 'rand,sparkle,createFrame,painterFor}')
s=s.replace('p.ellipse(sx,sy,6,7,C[3]);p.ellipse(sx+2,sy+1,4,5,C[4]);','p.ellipse(sx,sy,6,7,C[1]);p.ellipse(sx-1,sy-2,5,5,C[3]);p.ellipse(sx+2,sy+1,4,5,C[4]);p.line(sx-4,sy,sx-2,sy+5,C[2]);p.line(sx-2,sy+2,sx-1,sy+6,C[3]);')
s=s.replace('export function draw(p,t,o){','function paintPose(p,t,o){')
s+='''
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
'''
p.write_text(s,encoding='utf-8')
