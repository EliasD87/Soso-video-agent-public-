import sys, numpy as np
from PIL import Image, ImageFilter
src, out, width, border = sys.argv[1], sys.argv[2], int(sys.argv[3]), int(sys.argv[4])
im = Image.open(src).convert('RGBA'); im = im.crop(im.getbbox())
w, h = im.size; im = im.resize((width, round(width * h / w)), Image.LANCZOS)
pad = border * 2
canvas = Image.new('RGBA', (im.width + pad * 2, im.height + pad * 2), (0, 0, 0, 0))
canvas.alpha_composite(im, (pad, pad))
a = canvas.getchannel('A').point(lambda v: 255 if v > 90 else 0)
grown = a
for _ in range(border // 6):
    grown = grown.filter(ImageFilter.MaxFilter(13))
grown = grown.filter(ImageFilter.GaussianBlur(2)).point(lambda v: 255 if v > 110 else 0).filter(ImageFilter.GaussianBlur(0.8))
white = Image.new('RGBA', canvas.size, (248, 248, 244, 255)); white.putalpha(grown)
white.alpha_composite(canvas)
arr = np.array(white).astype(np.float32); arr[..., :3] += np.random.default_rng(1).normal(0, 5, arr[..., :3].shape)
res = Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8), 'RGBA'); res = res.crop(res.getbbox()); res.save(out); print(out, res.size)
