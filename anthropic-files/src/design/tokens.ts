import { loadFont as loadFraunces } from "@remotion/google-fonts/Fraunces";
import { loadFont as loadAnton } from "@remotion/google-fonts/Anton";
import { loadFont as loadFraktur } from "@remotion/google-fonts/UnifrakturMaguntia";
import { loadFont as loadPlexMono } from "@remotion/google-fonts/IBMPlexMono";
import { loadFont as loadMarker } from "@remotion/google-fonts/PermanentMarker";

// v3 "paper collage" house look: newsprint ground, ink type, one spot colour per film.
export const INK = "#191714";
export const PAPER = "#ebe4d4";
export const CREAM = "#f7f2e7";
export const SPOT = "#ff3d1c"; // house spot colour: vermilion

const fr = loadFraunces("normal", { weights: ["900"], subsets: ["latin"] });
loadFraunces("italic", { weights: ["900"], subsets: ["latin"] });
export const SERIF = fr.fontFamily;
export const TABLOID = loadAnton("normal", { weights: ["400"], subsets: ["latin"] }).fontFamily;
export const FRAKTUR = loadFraktur("normal", { weights: ["400"], subsets: ["latin"] }).fontFamily;
export const MONO = loadPlexMono("normal", { weights: ["500", "600"], subsets: ["latin"] }).fontFamily;
export const MARKER = loadMarker("normal", { weights: ["400"], subsets: ["latin"] }).fontFamily;

import { loadFont as loadOldStandard } from "@remotion/google-fonts/OldStandardTT";
const os = loadOldStandard("normal", { weights: ["400", "700"], subsets: ["latin"] });
loadOldStandard("italic", { weights: ["400"], subsets: ["latin"] });
export const BODY = os.fontFamily; // newsprint body copy

export const DARK = "#1c1a17"; // the black "ink page"
export const PRINT_GREEN = "#2e7d4f"; // price up, printed
export const HILITE = "#ffd23f"; // highlighter

import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
export const UI = loadInter("normal", { weights: ["400", "500", "600", "700"], subsets: ["latin"] }).fontFamily; // SoDEX UI
