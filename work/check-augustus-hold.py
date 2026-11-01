from pathlib import Path
p=Path(r'E:\UnityProject\pixelfx\src\fx\moves\augustus-sword-attack.js');s=p.read_text(encoding='utf-8');s+='\nexport { pose as characterPose };\n';p.write_text(s,encoding='utf-8')
p=Path(r'E:\UnityProject\pixelfx\work\export-augustus-pixelfx.mjs');s=p.read_text(encoding='utf-8-sig');a=s.index('const holdA=');b=s.index('const short=',a);s=s[:a]+'''const a=fx.mod.characterPose(.70),b=fx.mod.characterPose(.7666667);
for(const key of ['hand','shoulder','chest','hip','head','a','lean','crouch','step'])assert.deepEqual(a[key],b[key]);
'''+s[b:];p.write_text(s,encoding='utf-8')
