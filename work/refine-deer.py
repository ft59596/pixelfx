from pathlib import Path
p=Path(r'E:\UnityProject\pixelfx\src\fx\critters\sika-deer-idle.js')
s=p.read_text(encoding='utf-8-sig')
s=s.replace('far?(v>.5?C[0]:C[1]):v>.6?C[1]:u<.25?C[3]:C[2]','far?(v>.5?C[1]:C[2]):v>.6?C[2]:u<.25?C[4]:C[3]')
s=s.replace('g.ellipse(-3,-26+by,14,3.7','g.ellipse(-3,-25.5+by,13,2.6')
s=s.replace('g.set(x+1,y,C[1])','g.set(x+1,y,C[3])')
s=s.replace('// Torso has clear flat ramps:', 'g.line(-25,-32+by,-30,-34+flick*3,B[2]);\n // Torso has clear flat ramps:')
p.write_text(s,encoding='utf-8')
