from pathlib import Path
from PIL import Image
import shutil,json,zipfile
project=Path(r'E:\UnityProject\pixelfx')
out=Path(r'C:\Users\智\Documents\Codex\2026-11-01\new-chat\outputs\sika-deer-idle')
previews=[Image.open(p).convert('RGB').resize((448,416),Image.Resampling.NEAREST) for p in sorted((project/'work/deer-preview').glob('*.png'))]
frames=[Image.open(p).convert('RGBA') for p in sorted((out/'frames').glob('*.png'))]
durations=[(round((i+1)*100/30)-round(i*100/30))*10 for i in range(120)]
previews[0].save(out/'梅花鹿待机预览.gif',save_all=True,append_images=previews[1:],duration=durations,loop=0,optimize=False)
frames[0].save(out/'梅花鹿待机.webp',save_all=True,append_images=frames[1:],duration=durations,loop=0,lossless=True)
shutil.copytree(project/'src/core',out/'source/src/core',dirs_exist_ok=True)
for name in ['_lib.js','sika-deer-idle.js']:
    dest=out/'source/src/fx/critters'/name;dest.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(project/'src/fx/critters'/name,dest)
shutil.copy2(project/'LICENSE',out/'source/LICENSE')
(out/'source/package.json').write_text('{"type":"module"}',encoding='utf-8')
shutil.copy2(project/'records/critters/sika-deer-idle/contact.png',out/'动作分解.png')
(out/'使用说明.txt').write_text('梅花鹿 · 待机\n\n按照pixelfx生物风格，用Grid逐像素绘制：棕色毛皮、白色斑点、分叉鹿角、奶油色腹部与尾部、深色蹄子。三到四层硬边着色和一像素描边，左上受光，四肢有前后层次。\n\n4秒无缝循环，30FPS，120个播放帧；姿势按15FPS分步变化，包含呼吸、转耳、眨眼、垂头和甩尾。无额外魔法辉光。\n画布112×104，脚底锚点为左上坐标(54,91)，Unity归一化Pivot=(0.482143,0.125)。\nUnity：Sprite Multiple，112×104 Grid切片，Point过滤，无压缩，动画启用Loop Time。\n包含透明精灵表、逐帧PNG、JSON、透明动画WebP、GIF预览与源码依赖。\n默认侧面朝右，可通过flip镜像朝左。主调色板控制毛皮，belly和antlers控制腹部白斑与鹿角。\n画廊：生物分类，搜索“梅花鹿”。代码ID：critters/sika-deer-idle。\n',encoding='utf-8')
j=json.loads((out/'sika-deer-idle.json').read_text());assert len(j['frames'])==120 and sum(f['duration'] for f in j['frames'])==4000
with Image.open(out/'sika-deer-idle.png') as im:assert im.mode=='RGBA' and im.getextrema()[-1][0]==0
with Image.open(out/'梅花鹿待机预览.gif') as im:
    total=0
    for i in range(im.n_frames):im.seek(i);total+=im.info['duration']
    assert total==4000
with zipfile.ZipFile(out.parent/'梅花鹿_pixelfx待机动画.zip','w',zipfile.ZIP_DEFLATED) as z:
    for p in out.rglob('*'):
        if p.is_file():z.write(p,p.relative_to(out))
with zipfile.ZipFile(out.parent/'梅花鹿_pixelfx待机动画.zip') as z:assert z.testzip() is None
print('PNG透明通道、4秒时长、120播放帧、ZIP已验证。')
