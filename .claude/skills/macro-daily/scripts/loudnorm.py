"""Master a rendered video to platform loudness: -14 LUFS integrated, true peak about -1 dBTP.

    python -I .claude/skills/macro-daily/scripts/loudnorm.py <in.mp4> <out.mp4>

Two passes with ffmpeg's loudnorm (EBU R128): pass 1 measures, pass 2 applies the gain with the
measured values (linear when it fits under the peak ceiling, otherwise loudnorm's own true-peak
limiter). Video is copied untouched; audio is re-encoded to AAC 192k at 48 kHz.
Uses the ffmpeg bundled with Remotion at the workspace root.
"""
import json, os, re, subprocess, sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", ".."))
FF = os.path.join(ROOT, "node_modules", "@remotion", "compositor-win32-x64-msvc", "ffmpeg.exe")
TARGET = "I=-14:TP=-1.5:LRA=11"  # TP -1.5 leaves room for AAC overshoot (lands near -1)


def measure(path: str) -> dict:
    tmp = os.path.join(os.path.dirname(os.path.abspath(path)), "_loudnorm_measure.wav")
    p = subprocess.run(
        [FF, "-hide_banner", "-nostats", "-y", "-i", path, "-vn", "-af", f"loudnorm={TARGET}:print_format=json", "-f", "wav", tmp],
        capture_output=True, text=True,
    )
    if os.path.exists(tmp):
        os.remove(tmp)
    m = re.search(r"\{[^{}]*\"input_i\"[^{}]*\}", p.stderr, re.S)
    if not m:
        sys.exit("loudnorm measurement failed:\n" + p.stderr[-2000:])
    return json.loads(m.group(0))


def main() -> None:
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    src, dst = sys.argv[1], sys.argv[2]
    m = measure(src)
    print(f"before: {float(m['input_i']):6.1f} LUFS  true peak {float(m['input_tp']):5.1f} dBTP  LRA {m['input_lra']}")
    af = (
        f"loudnorm={TARGET}:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}"
        f":measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true:print_format=json"
    )
    p = subprocess.run(
        [FF, "-hide_banner", "-nostats", "-y", "-i", src, "-map", "0:v:0", "-map", "0:a:0", "-c:v", "copy",
         "-af", af, "-ar", "48000", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", dst],
        capture_output=True, text=True,
    )
    if p.returncode != 0:
        sys.exit("loudnorm pass 2 failed:\n" + p.stderr[-2000:])
    n = re.search(r"\{[^{}]*\"normalization_type\"[^{}]*\}", p.stderr, re.S)
    mode = json.loads(n.group(0))["normalization_type"] if n else "?"
    a = measure(dst)
    print(f"after:  {float(a['input_i']):6.1f} LUFS  true peak {float(a['input_tp']):5.1f} dBTP  ({mode})  -> {dst}")


if __name__ == "__main__":
    main()
