"""Trim, fade and level SFX takes: active region (-30 dB from max) + 10 ms lead, 4 ms fade in,
80 ms fade out, RMS of the active part to -22 dBFS, peaks limited to -3 dBFS. 48 kHz mono WAV."""
import sys, wave, os
import numpy as np
src, out = sys.argv[1], sys.argv[2]
PICK = {"brush": "brush_2", "tear": "tear_1", "stamp": "stamp_1", "snip": "snip_1", "coin": "coin_2",
        "till": "till_2", "tick": "tick_1", "drop": "drop_1", "whoosh": "whoosh_1", "whoosh-soft": "whoosh_2", "rise": "rise_2"}
for name, take in PICK.items():
    with wave.open(os.path.join(src, take + ".wav")) as w:
        sr = w.getframerate(); x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768
    win = sr // 100; n = len(x) // win
    env = np.sqrt((x[:n * win].reshape(n, win) ** 2).mean(1) + 1e-12); db = 20 * np.log10(env + 1e-9)
    on = np.where(db > db.max() - 30)[0]
    a = max(0, on.min() * win - sr // 100); b = min(len(x), (on.max() + 1) * win + sr // 20)
    y = x[a:b].copy()
    fi = int(0.004 * sr); fo = min(int(0.08 * sr), len(y) // 3)
    y[:fi] *= np.linspace(0, 1, fi); y[-fo:] *= np.linspace(1, 0, fo) ** 2
    rms = np.sqrt((y ** 2).mean()); y *= 10 ** (-22 / 20) / max(rms, 1e-6)
    lim = 10 ** (-3 / 20); pk = np.abs(y).max()
    if pk > lim: y = np.tanh(y / lim) * lim
    with wave.open(os.path.join(out, name + ".wav"), "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr); w.writeframes((np.clip(y, -1, 1) * 32767).astype(np.int16).tobytes())
    print(f"{name:12s} <- {take:9s} {len(y)/sr:4.2f}s  peak {20*np.log10(np.abs(y).max()):5.1f} dB  peakAt {int(np.argmax(np.abs(y))/sr*1000)} ms")
