import sys
from PIL import Image
out = sys.argv[1]; files = sys.argv[2:]
ims = [Image.open(f) for f in files]
w, h = ims[0].size
cols = 2; rows = (len(ims)+1)//2
sheet = Image.new('RGB', (cols*w, rows*h), 'black')
for i, im in enumerate(ims): sheet.paste(im.resize((w,h)), ((i%cols)*w, (i//cols)*h))
sheet.save(out, quality=90)
