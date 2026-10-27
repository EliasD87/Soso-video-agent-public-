"""Print an RGBA cut-out as a newspaper halftone scrap with torn edges.
usage: halftone.py in.png out.png --crop x0 y0 x1 y1 --width W --cell C [--torn bottom,right,left] [--erase x0 y0 x1 y1]..."""
import sys, math, random, argparse
import numpy as np
from PIL import Image, ImageDraw, ImageOps, ImageFilter
ap = argparse.ArgumentParser()
ap.add_argument('src'); ap.add_argument('out')
ap.add_argument('--crop', nargs=4, type=int)
ap.add_argument('--erase', nargs=4, type=int, action='append', default=[])
ap.add_argument('--width', type=int, default=2400)
ap.add_argument('--cell', type=float, default=12)
ap.add_argument('--torn', default='bottom')
ap.add_argument('--gamma', type=float, default=1.15)
ap.add_argument('--seed', type=int, default=7)
a = ap.parse_args()
rng = random.Random(a.seed); np.random.seed(a.seed)
im = Image.open(a.src).convert('RGBA')
arr = np.array(im)
for x0, y0, x1, y1 in a.erase: arr[y0:y1, x0:x1, 3] = 0
im = Image.fromarray(arr)
if a.crop: im = im.crop(tuple(a.crop))
W = a.width; H = round(im.height * W / im.width)
im = im.resize((W, H), Image.LANCZOS)
alpha = np.array(im.getchannel('A')).astype(np.float32) / 255
gray = ImageOps.autocontrast(im.convert('L'), cutoff=1)
g = np.array(gray).astype(np.float32) / 255
g = np.clip(g, 0, 1) ** a.gamma
# --- AM halftone, 45deg screen, supersampled ---
SS = 3; cell = a.cell * SS
big = Image.fromarray((g * 255).astype(np.uint8)).resize((W * SS, H * SS), Image.BICUBIC)
diag = int(math.hypot(W * SS, H * SS)) + 4 * int(cell)
rot = big.rotate(45, expand=True, fillcolor=255)
rg = np.array(rot).astype(np.float32) / 255
dots = Image.new('L', rot.size, 0); d = ImageDraw.Draw(dots)
for cy in np.arange(cell / 2, rot.size[1], cell):
    for cx in np.arange(cell / 2, rot.size[0], cell):
        v = rg[int(min(cy, rot.size[1]-1)), int(min(cx, rot.size[0]-1))]
        r = (1 - v) ** 0.5 * cell * 0.72
        if r > 0.6: d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=255)
dots = dots.rotate(-45, expand=True)
ox = (dots.size[0] - W * SS) // 2; oy = (dots.size[1] - H * SS) // 2
dots = dots.crop((ox, oy, ox + W * SS, oy + H * SS)).resize((W, H), Image.LANCZOS)
ink = np.array(dots).astype(np.float32) / 255
# --- torn edges: jagged random walk + white paper fringe ---
def walk(n, amp, step):
    v = 0; out = []
    for i in range(n):
        v += rng.uniform(-step, step); v *= 0.96; out.append(v)
    o = np.array(out); o += np.random.normal(0, amp * 0.25, n)
    return o * amp / max(1e-6, np.abs(o).max())
keep = np.ones((H, W), np.float32); fringe = np.zeros((H, W), np.float32)
yy, xx = np.mgrid[0:H, 0:W]
sides = a.torn.split(',') if a.torn else []
if 'bottom' in sides:
    edge = H - 26 + walk(W, 9, 3)
    fr = edge + 8 + np.abs(walk(W, 7, 2))
    keep *= (yy < edge[None, :]); fringe = np.maximum(fringe, (yy >= edge[None, :]) & (yy < fr[None, :]))
if 'right' in sides:
    edge = W - 22 + walk(H, 8, 3)
    fr = edge + 7 + np.abs(walk(H, 6, 2))
    m = xx < edge[:, None]; keep *= m
    fringe = np.maximum(fringe, (~m) & (xx < fr[:, None]))
if 'left' in sides:
    edge = 22 + walk(H, 8, 3)
    fr = edge - 7 - np.abs(walk(H, 6, 2))
    m = xx > edge[:, None]; keep *= m
    fringe = np.maximum(fringe, (~m) & (xx > fr[:, None]))
if 'top' in sides:
    edge = 24 + walk(W, 9, 3)
    fr = edge - 8 - np.abs(walk(W, 7, 2))
    m = yy > edge[None, :]; keep *= m
    fringe = np.maximum(fringe, (~m) & (yy > fr[None, :]))
body = alpha * keep
# fringe only where the photo had content above/beside it
src_any = (Image.fromarray((alpha * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(41)))
fringe = fringe * (np.array(src_any) > 128)
# --- compose: paper scrap + ink dots + grain ---
paper = np.array([243, 239, 230], np.float32); inkc = np.array([27, 25, 22], np.float32)
grain = np.random.normal(0, 6, (H, W, 1))
rgb = paper[None, None, :] * (1 - ink[..., None]) + inkc[None, None, :] * ink[..., None] + grain
fr_rgb = np.array([247, 244, 237], np.float32)
a_out = np.clip(np.maximum(body, fringe), 0, 1)
rgb = np.where((fringe > 0)[..., None] & (body < 0.5)[..., None], fr_rgb[None, None, :] + grain, rgb)
out = np.dstack([np.clip(rgb, 0, 255), a_out * 255]).astype(np.uint8)
Image.fromarray(out, 'RGBA').save(a.out)
print('saved', a.out, W, H)
