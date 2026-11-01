from PIL import Image,ImageDraw,ImageFont
from pathlib import Path
import json,shutil,zipfile
project=Path(r'E:\UnityProject\pixelfx')
out=Path(r'C:\Users\智\Documents\Codex\2026-11-01\new-chat\outputs\slime-animations')
previews={}
labels={'slime-move':'移动 · 0.8秒循环','slime-attack':'攻击 · 1.2秒','slime-death':'死亡 · 1.6秒'}
font=ImageFont.truetype(r'C:\Windows\Fonts\msyh.ttc',18)
for name in labels:
    imgs=[Image.open(p).convert('RGB').resize((336,264),Image.Resampling.NEAREST) for p in sorted((project/'work/slime-preview-frames'/name).glob('*.png'))]
    previews[name]=imgs
    durations=[(round((i+1)*100/30)-round(i*100/30))*10 for i in range(len(imgs))]
    imgs[0].save(out/name/'preview.gif',save_all=True,append_images=imgs[1:],duration=durations,loop=0,optimize=False)
    j=json.loads((out/name/(name+'.json')).read_text(encoding='utf-8'))
    assert sum(f['duration'] for f in j['frames'])==round(j['meta']['pixelfx']['duration']*1000)
    assert len(j['frames'])==len(list((out/name/'frames').glob('*.png')))
    with Image.open(out/name/(name+'.png')) as im: assert im.mode=='RGBA' and im.getextrema()[-1][0]==0
frames=[]
for i in range(144):
    canvas=Image.new('RGB',(1024,306),'#100e18'); d=ImageDraw.Draw(canvas)
    for col,name in enumerate(labels):
        seq=previews[name]; canvas.paste(seq[i%len(seq)],(col*344,34));d.text((col*344+16,8),labels[name],font=font,fill='#d8f5b8')
    frames.append(canvas)
frames[0].save(out/'三套动画预览.gif',save_all=True,append_images=frames[1:],duration=[(round((i+1)*100/30)-round(i*100/30))*10 for i in range(144)],loop=0,optimize=False)
shutil.copytree(project/'src/core',out/'source/src/core',dirs_exist_ok=True)
for name in ['slime.js','_lib.js','_slime-animation.js','slime-move.js','slime-attack.js','slime-death.js']:
    target=out/'source/src/fx/critters'/name;target.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(project/'src/fx/critters'/name,target)
shutil.copy2(project/'LICENSE',out/'source/LICENSE')
(out/'使用说明.txt').write_text('史莱姆动画套装\n\n移动：24帧，30 FPS，0.8秒，循环；原地播放，实际前进由游戏控制器驱动。\n攻击：36帧，30 FPS，1.2秒，单次；0.4秒为撞击时刻，0.95秒恢复站姿，动画结束后保持显示；游戏接到完成事件后切换待机，勿移除角色。\n死亡：48帧，30 FPS，1.6秒，单次；结束后移除角色。\n\n所有帧112×88，透明PNG；每套含精灵表、JSON、独立帧与GIF预览。\n脚底锚点：左上坐标(56,72)，Unity归一化Pivot=(0.5,0.181818)。\nUnity导入：Sprite(2D and UI)，Multiple，Point过滤，关闭压缩，按112×88 Grid切片；按左到右、上到下顺序播放。只为移动动画启用Loop Time。\n默认朝右，可镜像朝左。攻击带有endBehavior=hold，末帧保留站姿；死亡交付版去掉库工具额外附加的终止帧。三套均含原始风格的绿色辉光、漂浮光点与高光闪烁。\n画廊：生物分类，搜索“史莱姆”。支持调色、镜像与实时预览。\nsource包含可独立复用的JavaScript绘制源码与依赖。造型和着色复用原项目史莱姆，授权见source/LICENSE及源码署名。\n',encoding='utf-8')
with zipfile.ZipFile(out.parent/'史莱姆_攻击死亡移动_动画素材包.zip','w',zipfile.ZIP_DEFLATED) as z:
    for p in out.rglob('*'):
        if p.is_file():z.write(p,p.relative_to(out))
with zipfile.ZipFile(out.parent/'史莱姆_攻击死亡移动_动画素材包.zip') as z: assert z.testzip() is None
print('透明通道、帧数、总时长及ZIP校验通过')

