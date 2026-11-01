from pathlib import Path
p=Path(r'E:\UnityProject\pixelfx\src\fx\moves\augustus-sword-attack.js')
s=p.read_text(encoding='utf-8-sig').replace('p.tri(', 'tri(p,')
s=s.replace('function gem(', 'const tri=(p,A,B,C,c)=>p.poly([A,B,C],c);\nfunction gem(')
s=s.replace('size:[224,176]','size:[224,192]')
s=s.replace('C[2],fade*.85','C[2],fade').replace('p.glowLine(...pts[25],...pts[32],14,C[3],.23*fade)','p.glowLine(...pts[25],...pts[32],10,C[3],.23*fade)')
s=s.replace('rand(i,oSeed(P))','rand(i,P.seed)').replace('function oSeed(P){return 7;}','')
s=s.replace('const P=pose(t),C=fit(o.palette,7);','const P=pose(t),C=fit(o.palette,7);P.seed=o.seed;')
p.write_text(s,encoding='utf-8')
