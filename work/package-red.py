from PIL import Image
from pathlib import Path
import shutil, json
out=Path(r'C:\Users\智\Documents\Codex\2026-11-01\new-chat\outputs\red-whirlwind-slash')
for folder,name in [('frames','preview.gif'),('acted','acted-preview.gif')]:
    imgs=[Image.open(p).convert('RGB').resize((576,384) if folder=='frames' else (Image.open(p).width*3,Image.open(p).height*3),Image.Resampling.NEAREST) for p in sorted((out/folder).glob('*.png'))]
    durations=[(round((i+1)*100/30)-round(i*100/30))*10 for i in range(len(imgs))]
    imgs[0].save(out/name,save_all=True,append_images=imgs[1:],duration=durations,loop=0,optimize=False)
shutil.copy2(r'E:\UnityProject\pixelfx\src\fx\melee\red-whirlwind-slash.js',out/'red-whirlwind-slash.js')
(out/'使用说明.txt').write_text('红色旋风斩：5 秒，30 FPS，150 帧。\n每格 192×128，PNG 透明背景、不含角色。JSON 记录切片与帧时长，总计 5000ms。\nUnity：Sprite (2D and UI)，Multiple，Point 过滤，无压缩；按 192×128 Grid 切片，左到右、上到下播放。\n脚底锚点：左上坐标 (96,92)，Unity 归一化 Pivot=(0.5,0.28125)。关闭 Loop Time。\npreview.gif 为特效预览；acted-preview.gif 包含蓄力、人物旋转及收势，因此整体稍长于 5 秒。\n源代码依赖 pixelfx/src/core；已添加到原项目 melee/red-whirlwind-slash。\n',encoding='utf-8')
with Image.open(out/'preview.gif') as im:
    total=0
    for i in range(im.n_frames):
        im.seek(i); total+=im.info['duration']
    print('GIF frames',im.n_frames,'duration',total)
# Package deliverables without intermediate frame folders.
import zipfile
with zipfile.ZipFile(out.parent/'红色旋风斩_5秒.zip','w',zipfile.ZIP_DEFLATED) as z:
    for p in out.iterdir():
        if p.is_file(): z.write(p,p.name)
