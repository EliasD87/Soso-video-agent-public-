import sys, os, glob
from PIL import Image, ImageDraw, ImageFont
src, out, prefix, rate, step = sys.argv[1], sys.argv[2], sys.argv[3], float(sys.argv[4]), int(sys.argv[5])
files = sorted(glob.glob(os.path.join(src, '*.jpg')))[::step]
cols, rows, cw = 4, 4, 480
try: font = ImageFont.truetype('arial.ttf', 18)
except: font = ImageFont.load_default()
per = cols*rows
for si in range(0, len(files), per):
    chunk = files[si:si+per]
    ims = [Image.open(f) for f in chunk]
    ch = int(ims[0].height * cw / ims[0].width)
    sheet = Image.new('RGB', (cols*cw, rows*ch), 'black')
    for i, (f, im) in enumerate(zip(chunk, ims)):
        im = im.resize((cw, ch))
        d = ImageDraw.Draw(im)
        idx = int(os.path.basename(f)[:-4]) - 1
        t = idx / rate
        d.rectangle([0,0,70,24], fill='black'); d.text((4,2), f'{t:5.2f}s', fill='yellow', font=font)
        sheet.paste(im, ((i%cols)*cw, (i//cols)*ch))
    sheet.save(os.path.join(out, f'{prefix}_{si//per+1:02d}.jpg'), quality=88)
print(prefix, 'done', len(files))
