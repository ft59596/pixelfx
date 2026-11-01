from pathlib import Path
p=Path(r'E:\UnityProject\pixelfx\src\fx\critters\sika-deer-idle.js');s=p.read_text(encoding='utf-8');s=s.replace('g.set(hx+4,hy-1,C[6]);','g.set(hx+4,hy-1,C[6]);g.set(hx+2,hy-2,C[2]);');p.write_text(s,encoding='utf-8')
