from PIL import Image
from pathlib import Path
import shutil,json,zipfile
project=Path(r'E:\UnityProject\pixelfx')
out=Path(r'C:\Users\智\Documents\Codex\2026-11-01\new-chat\outputs\augustus-pixelfx')
frames=[]
for p in sorted((project/'work/augustus-preview').glob('*.png')):
    frames.append(Image.open(p).convert('RGB').resize((672,576),Image.Resampling.NEAREST))
durations=[(round((i+1)*100/30)-round(i*100/30))*10 for i in range(54)]
# Hold the recovered stance between repeats in the preview; sheet remains exactly 1.8s.
frames[0].save(out/'挥剑攻击预览.gif',save_all=True,append_images=frames[1:],duration=durations[:-1]+[durations[-1]+400],loop=0,optimize=False)
shutil.copytree(project/'src/core',out/'source/src/core',dirs_exist_ok=True)
for name in ['src/fx/critters/_lib.js','src/fx/moves/augustus-sword-attack.js']:
    dest=out/'source'/name;dest.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(project/name,dest)
shutil.copy2(project/'LICENSE',out/'source/LICENSE')
(out/'source/package.json').write_text('{"type":"module"}',encoding='utf-8')
shutil.copy2(project/'records/moves/augustus-sword-attack/contact.png',out/'动作分解.png')
(out/'使用说明.txt').write_text('奥古斯都 · 圣裁挥剑（pixelfx代码版）\n\n参考上传的黑金骑士，以代码重绘为简化像素角色。保留尖冠、面甲、日轮光环、狮肩、红披风和长剑。没有对原图进行切块旋转，也不依赖AI生成帧图。\n\n54帧，30FPS，1.8秒；画布224×192，脚底锚点(80,152)，Unity归一化Pivot=(0.357143,0.208333)。\n0～0.52秒蓄力，0.52～0.70秒斩击，0.70秒命中，0.70～0.80秒关节顿帧，0.80～1.45秒收势；结束后保持站姿。\nGIF额外停留0.4秒后循环，只用于演示。游戏中单次播放，完成后切回待机。\nPNG精灵表及逐帧PNG为透明背景。Unity使用Sprite Multiple、224×192 Grid切片、Point过滤、关闭压缩，按JSON顺序播放。\nJSON包含各帧坐标、时长与命中时序。调色板主要控制金属饰边、光环和剑芒；黑色甲片与红色布料保留材质本色。\n源码入口source/src/fx/moves/augustus-sword-attack.js，依赖与MIT许可已附带；角色比例与装饰是参考图的简化演绎。\n画廊：招式动作分类，搜索“奥古斯都”。\n',encoding='utf-8')
j=json.loads((out/'augustus-sword-attack.json').read_text());assert len(j['frames'])==54 and sum(f['duration'] for f in j['frames'])==1800
with Image.open(out/'augustus-sword-attack.png') as im:assert im.mode=='RGBA' and im.getextrema()[-1][0]==0
with zipfile.ZipFile(out.parent/'奥古斯都_pixelfx挥剑攻击.zip','w',zipfile.ZIP_DEFLATED) as z:
    for p in out.rglob('*'):
        if p.is_file():z.write(p,p.relative_to(out))
with zipfile.ZipFile(out.parent/'奥古斯都_pixelfx挥剑攻击.zip') as z:assert z.testzip() is None
print('54帧、1800ms、透明PNG与ZIP已验证')
