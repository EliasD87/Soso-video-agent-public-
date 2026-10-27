"""Photocopy / xerox print of a photo: 1-bit toner with clumping, dropouts, specks and a copied paper edge.
usage: xerox.py in out --width W --color hex [--crop x0 y0 x1 y1] [--thresh t] [--gamma g] [--edge]"""
import argparse, numpy as np
from PIL import Image, ImageOps, ImageFilter
ap = argparse.ArgumentParser()
ap.add_argument('src'); ap.add_argument('out')
ap.add_argument('--width', type=int, default=2000)
ap.add_argument('--color', default='141414')
ap.add_argument('--crop', nargs=4, type=float)
ap.add_argument('--thresh', type=float, default=0.47)
ap.add_argument('--gamma', type=float, default=1.0)
ap.add_argument('--edge', action='store_true')
ap.add_argument('--seed', type=int, default=3)
a = ap.parse_args()
rng = np.random.default_rng(a.seed)
im = Image.open(a.src).convert('L')
if a.crop:
    w, h = im.size; x0, y0, x1, y1 = a.crop
    im = im.crop((int(x0 * w), int(y0 * h), int(x1 * w), int(y1 * h)))
SS = 2
W = a.width * SS; H = round(im.height * W / im.width)
im = ImageOps.autocontrast(im.resize((W, H), Image.LANCZOS), cutoff=1)
g = (np.array(im).astype(np.float32) / 255) ** a.gamma
def smooth_noise(sigma, scale=1.0):
    n = Image.fromarray(((rng.random((H, W)) * 255)).astype(np.uint8)).filter(ImageFilter.GaussianBlur(sigma))
    x = np.array(n).astype(np.float32) / 255
    return (x - x.mean()) / (x.std() + 1e-6) * scale
v = g + smooth_noise(1.6 * SS, 0.07) + smooth_noise(18 * SS, 0.05)
ink = (v < a.thresh).astype(np.float32)
ink = np.array(Image.fromarray((ink * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.9 * SS))).astype(np.float32) / 255
ink = (ink > 0.5).astype(np.float32)
# toner dropouts in big soft patches
drop = smooth_noise(40 * SS, 1.0) > 1.9
ink[drop] = ink[drop] * (smooth_noise(2 * SS, 1.0)[drop] > 0.3)
# specks on paper
sp = (rng.random((H, W)) < 0.0004).astype(np.uint8) * 255
sp = np.array(Image.fromarray(sp).filter(ImageFilter.MaxFilter(3))).astype(np.float32) / 255
ink = np.maximum(ink, sp)
# rough page mask + copied paper edge line
yy, xx = np.mgrid[0:H, 0:W]
def jag(n, amp):
    w = np.cumsum(rng.normal(0, 1, n)); w = w - np.convolve(w, np.ones(301) / 301, 'same')
    return w / (np.abs(w).max() + 1e-6) * amp
m = 10 * SS
top = m + jag(W, 4 * SS); bot = H - m + jag(W, 4 * SS)
lef = m + jag(H, 4 * SS); rig = W - m + jag(H, 4 * SS)
mask = (yy > top[None, :]) & (yy < bot[None, :]) & (xx > lef[:, None]) & (xx < rig[:, None])
if a.edge:
    e = 3 * SS
    edge = mask & ((yy < top[None, :] + e) | (yy > bot[None, :] - e) | (xx < lef[:, None] + e) | (xx > rig[:, None] - e))
    broken = smooth_noise(30 * SS, 1.0) > -0.6
    ink = np.maximum(ink, (edge & broken).astype(np.float32))
ink = ink * mask
alpha = Image.fromarray((ink * 255).astype(np.uint8)).resize((W // SS, H // SS), Image.LANCZOS)
c = tuple(int(a.color[i:i + 2], 16) for i in (0, 2, 4))
out = Image.new('RGBA', alpha.size, c + (0,)); out.putalpha(alpha)
out.save(a.out); print('saved', a.out, out.size)
