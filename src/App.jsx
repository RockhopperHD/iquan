import { Suspense, lazy, useEffect, useId, useMemo, useRef, useState } from "react";
import { toPng } from "html-to-image";
import {
  ChevronLeft,
  ChevronRight,
  Clipboard,
  Download,
  PenLine,
  Plus,
  Redo2,
  RotateCcw,
  Trash2,
  Undo2,
} from "lucide-react";
import dynamicIconImports from "lucide-react/dynamicIconImports";
import iquanSpecMarkdown from "../IQUAN_SPEC.md?raw";

const MODES = ["text", "icon", "image"];
const MODE_TOGGLE_LABELS = {
  text: "Text",
  icon: "Icon",
  image: "Image",
};
const SHAPE_MODE_OPTIONS = ["shape", "folder", "image"];
const SHAPE_MODE_LABELS = {
  shape: "Shape",
  folder: "Folder",
  image: "Image",
};
const SHAPE_PRESET_OPTIONS = ["square", "circle", "pill", "rectangle"];
const SHAPES = ["shape", "folder", "image", "none", ...SHAPE_PRESET_OPTIONS];
const SHAPE_TOGGLE_LABELS = {
  square: "Square",
  circle: "Circle",
  pill: "Pill",
  rectangle: "Rectangle",
  image: "Image",
  none: "None",
};
const AESTHETICS = ["flat"];
const GRADIENT_TYPES = ["linear", "radial"];
const MAX_GRADIENT_STOPS = 2;
const MAX_BACK_DISTANCE = 32;
const ICON_CODE_VERSION = "IC6";
const SHARE_CODE_VERSION = "IC11";
const PROJECT_FILE_VERSION = "IQP1";
const PARTICLE_OFFSET_LIMIT = 120;
const PARTICLE_EDIT_ZOOM = 1.65;
const DEFAULT_CANVAS_SIZE = 500;
const EXPORT_CANVAS_SIZE = 500;
const CANVAS_SIZE_MIN = 320;
const CANVAS_SIZE_MAX = 960;
const ICON_BASE_SIZE_MIN = 64;
const ICON_BASE_SIZE_MAX = 320;
const SHAPE_HEIGHT_SCALE_MIN = 60;
const SHAPE_HEIGHT_SCALE_MAX = 140;
const SHAPE_RADIUS_MAX = 240;
const ICON_BASE_SIZE_PRESETS = [128, 168, 240];
const ICON_SCALE_MIN = 40;
const ICON_SCALE_MAX = 140;
const PREVIEW_SAFE_MARGIN = 24;
const EXPORT_SAFE_MARGIN = 0;
const EXPORT_SCALE_OPTIONS = [1, 2, 3];
const DEFAULT_EXPORT_SCALE = 1;
const CANVAS_SIZE_PRESETS = [400, 500, 640];
const DEFAULT_PREVIEW_CONTEXT_MODE = "surfaces";
const HERO_DESCRIPTION =
  "Make tiny polished icons for chats, docs, and lightweight UI work without opening a full design tool.";
const LANDING_TO_BUILDER_MS = 1100;
const HERO_SAMPLE_SWAP_MS = 3000;
const HERO_SAMPLE_SWAP_DELAY_MS = 1200;
const HERO_PRIMARY_ICON_SIZE = 252;
const HERO_SAMPLE_LAYOUT = [
  { left: "8%", top: "12%", size: 96, rotation: -8, delay: 40 },
  { left: "22%", top: "11%", size: 98, rotation: 7, delay: 85 },
  { left: "36%", top: "11%", size: 94, rotation: -6, delay: 130 },
  { left: "50%", top: "11%", size: 100, rotation: 6, delay: 175 },
  { left: "79%", top: "13%", size: 104, rotation: 8, delay: 220 },
  { left: "92%", top: "14%", size: 96, rotation: -7, delay: 265 },
  { left: "24%", top: "25%", size: 102, rotation: -9, delay: 290 },
  { left: "74%", top: "24%", size: 108, rotation: 7, delay: 320 },
  { left: "7%", top: "35%", size: 104, rotation: -9, delay: 310 },
  { left: "20%", top: "42%", size: 100, rotation: 8, delay: 340 },
  { left: "15%", top: "54%", size: 98, rotation: 8, delay: 355 },
  { left: "24%", top: "66%", size: 104, rotation: -8, delay: 385 },
  { left: "86%", top: "35%", size: 106, rotation: -8, delay: 400 },
  { left: "78%", top: "46%", size: 104, rotation: 8, delay: 430 },
  { left: "93%", top: "55%", size: 98, rotation: 7, delay: 445 },
  { left: "78%", top: "66%", size: 106, rotation: -9, delay: 475 },
  { left: "9%", top: "83%", size: 102, rotation: -7, delay: 490 },
  { left: "24%", top: "86%", size: 96, rotation: 8, delay: 535 },
  { left: "39%", top: "86%", size: 100, rotation: -8, delay: 580 },
  { left: "61%", top: "86%", size: 100, rotation: 7, delay: 625 },
  { left: "76%", top: "86%", size: 98, rotation: -7, delay: 670 },
  { left: "90%", top: "84%", size: 96, rotation: 6, delay: 715 },
];
const PARTICLE_CORNERS = [
  { key: "topLeft", label: "Top Left" },
  { key: "topMiddle", label: "Top Middle" },
  { key: "topRight", label: "Top Right" },
  { key: "left", label: "Left" },
  { key: "right", label: "Right" },
  { key: "bottomLeft", label: "Bottom Left" },
  { key: "bottomMiddle", label: "Bottom Middle" },
  { key: "bottomRight", label: "Bottom Right" },
];
const PARTICLE_INDEX_TO_CORNER = PARTICLE_CORNERS.map((corner) => corner.key);
const PARTICLE_CORNER_TO_INDEX = Object.fromEntries(
  PARTICLE_CORNERS.map((corner, index) => [corner.key, index]),
);
const FONT_WEIGHT_MIN = 100;
const FONT_WEIGHT_MAX = 1000;
const LUCIDE_WEIGHT_MIN = 0.8;
const LUCIDE_WEIGHT_MAX = 10;
const CONTENT_ROTATION_MIN = -180;
const CONTENT_ROTATION_MAX = 180;
const IMAGE_UPLOAD_MAX_DIMENSION = 1400;
const IMAGE_RENDER_CANVAS_SIZE = 720;
const IMAGE_ROTATION_MIN = -180;
const IMAGE_ROTATION_MAX = 180;
const IMAGE_HUE_MIN = -180;
const IMAGE_HUE_MAX = 180;
const IMAGE_BRIGHTNESS_MIN = 0;
const IMAGE_BRIGHTNESS_MAX = 220;
const IMAGE_CONTRAST_MIN = 0;
const IMAGE_CONTRAST_MAX = 220;
const IMAGE_EDGE_STROKE_MAX = 28;
const IMAGE_CROP_SIZE_MIN = 0.22;
const IMAGE_CROP_SIZE_MAX = 1;
const PART_OFFSET_LIMIT = 180;
const HISTORY_LIMIT = 100;

const DEFAULT_STATE = {
  mode: "text",
  contentEnabled: true,
  shape: "shape",
  shapeEnabled: true,
  content: "A",
  lucide: "sparkles",
  lucideWeight: 1.9,
  size: 168,
  iconScale: 100,
  widthScale: 100,
  heightScale: 100,
  pillWidthScale: 170,
  pillHeightScale: 72,
  radius: 24,
  folderTabX: 12,
  folderTabWidth: 34,
  folderTabHeight: 20,
  fontSize: 78,
  linkTextToSize: true,
  spacing: 0,
  fontFamily: "Inter, system-ui, sans-serif",
  fontWeight: "700",
  inset: 16,
  aesthetic: "flat",
  fill: "#ffffff",
  fillStops: ["#ffffff"],
  fillGradientType: "linear",
  fillGradientAngle: 135,
  fillGradientCenterX: 50,
  fillGradientCenterY: 50,
  baseOpacity: 100,
  textColor: "#1f2937",
  contentOpacity: 100,
  contentOffsetX: 0,
  contentOffsetY: 0,
  contentRotation: 0,
  shapeOffsetX: 0,
  shapeOffsetY: 0,
  outlineColor: "#d6deed",
  strokeColor: "#d6deed",
  strokeStops: ["#d6deed"],
  strokeGradientType: "linear",
  strokeGradientAngle: 135,
  strokeGradientCenterX: 50,
  strokeGradientCenterY: 50,
  backColor: "#c8d2e6",
  outline: 2,
  backLayerEnabled: true,
  backDistance: 0,
  backAngle: 45,
  imageData: "",
  imageName: "",
  imageWidth: 0,
  imageHeight: 0,
  imageCropEnabled: false,
  imageCropX: 0,
  imageCropY: 0,
  imageCropSize: 1,
  imageRotation: 0,
  imageHue: 0,
  imageContrast: 100,
  imageBrightness: 100,
  imageSilhouette: false,
  imageSilhouetteColor: "#111111",
  imageEdgeStroke: 0,
  imageEdgeStrokeColor: "#ffffff",
  baseImageData: "",
  baseImageName: "",
  baseImageWidth: 0,
  baseImageHeight: 0,
  baseImageCropEnabled: false,
  baseImageCropX: 0,
  baseImageCropY: 0,
  baseImageCropSize: 1,
  baseImageRotation: 0,
  baseImageHue: 0,
  baseImageContrast: 100,
  baseImageBrightness: 100,
  baseImageSilhouette: false,
  baseImageSilhouetteColor: "#111111",
  baseImageEdgeStroke: 0,
  baseImageEdgeStrokeColor: "#ffffff",
};

const FONT_OPTIONS = [
  { label: "Inter", value: "Inter, system-ui, sans-serif" },
  { label: "System Sans", value: "system-ui, sans-serif" },
  { label: "Avenir Next", value: "'Avenir Next', 'Segoe UI', sans-serif" },
  { label: "Futura", value: "Futura, 'Avenir Next', 'Trebuchet MS', sans-serif" },
  { label: "Gill Sans", value: "'Gill Sans', 'Gill Sans MT', Calibri, sans-serif" },
  { label: "Helvetica Neue", value: "'Helvetica Neue', Arial, sans-serif" },
  { label: "Segoe UI", value: "'Segoe UI', system-ui, sans-serif" },
  { label: "Arial", value: "Arial, sans-serif" },
  { label: "Verdana", value: "Verdana, Geneva, sans-serif" },
  { label: "Trebuchet MS", value: "'Trebuchet MS', sans-serif" },
  { label: "Tahoma", value: "Tahoma, Geneva, sans-serif" },
  { label: "Franklin Gothic", value: "'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif" },
  { label: "Optima", value: "Optima, Candara, 'Noto Sans', sans-serif" },
  { label: "Impact", value: "Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif" },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Baskerville", value: "Baskerville, 'Times New Roman', Times, serif" },
  { label: "Palatino", value: "'Palatino Linotype', Palatino, 'Book Antiqua', serif" },
  { label: "Didot", value: "Didot, Bodoni, 'Times New Roman', serif" },
  { label: "Times New Roman", value: "'Times New Roman', Times, serif" },
  { label: "American Typewriter", value: "'American Typewriter', Georgia, serif" },
  { label: "Copperplate", value: "Copperplate, Papyrus, fantasy" },
  { label: "Consolas", value: "Consolas, 'Lucida Console', 'Courier New', monospace" },
  { label: "Menlo", value: "Menlo, Monaco, Consolas, monospace" },
  { label: "Monaco", value: "Monaco, Menlo, Consolas, monospace" },
  { label: "Courier", value: "'Courier New', monospace" },
  { label: "Marker Felt", value: "'Marker Felt', 'Comic Sans MS', cursive" },
  { label: "Brush Script", value: "'Brush Script MT', 'Segoe Script', cursive" },
  {
    label: "Emoji",
    value: "'Apple Color Emoji','Segoe UI Emoji','Noto Color Emoji',sans-serif",
  },
];

const FONT_WEIGHT_STOPS = [300, 400, 500, 600, 700, 800, 900, 1000];
const LUCIDE_WEIGHT_STOPS = [0.8, 1.2, 1.6, 2.0, 2.4, 2.8, 3.2, 3.6, 4.0, 5.0, 6.0, 7.0, 8.0, 9.0, 10.0];
const ADVANCED_HELP = {
  linkTextToSize:
    "Keeps a fixed requested text size tied to the active base. Turn this off to let content sizing drive text sizing.",
  fontWeight: "Adjusts the thickness of text characters in text mode.",
  lucideWeight: "Adjusts icon stroke thickness in icon mode.",
  iconScale: "Scales the active content within the base shape (100% matches the current base size).",
  baseSize:
    "Sets the size of the active icon base. When editing a particle, this changes that particle's base size.",
  letterSpacing: "Adds horizontal spacing between text characters.",
  inset: "Sets inner padding between content and the icon edge.",
  fontFamily: "Changes the typeface used for text mode.",
};

const QUICK_PREVIEW_SURFACES = [
  { id: "white", label: "White", className: "quick-preview-white" },
  { id: "slate", label: "#323338", className: "quick-preview-slate" },
  { id: "black", label: "Black", className: "quick-preview-black" },
];
const PREVIEW_CONTEXT_OPTIONS = [
  { id: "surfaces", label: "Surfaces" },
  { id: "message", label: "Message + reaction" },
];
const INSPECT_PARTS = [
  { id: "content", label: "Content", section: "content" },
  { id: "base", label: "Base", section: "base" },
  { id: "back", label: "Back layer", section: "back" },
];
const WIZARD_STEPS = [
  { id: "content", title: "Content" },
  { id: "base", title: "Base" },
  { id: "back", title: "Back" },
  { id: "particles", title: "Particles" },
  { id: "share", title: "Share" },
];
const WIZARD_WALKTHROUGH_STEPS = [
  {
    id: "steps",
    wizardStepId: "content",
    target: "wizard-steps",
    title: "Move through the Wizard",
    body: "These step controls jump between the focused parts of an iquan. The arrows move one step at a time.",
  },
  {
    id: "content",
    wizardStepId: "content",
    target: "wizard-content-card",
    title: "Choose the content",
    body: "This step picks what sits inside the base: text, an uploaded image, or a Lucide icon, plus its size, color, and placement.",
  },
  {
    id: "preview",
    wizardStepId: "content",
    target: "preview-stage",
    title: "Watch the live preview",
    body: "The preview updates as you edit. You can select and adjust visible pieces directly here when you need finer control.",
  },
  {
    id: "base",
    wizardStepId: "base",
    target: "wizard-base-card",
    title: "Shape the base",
    body: "The Base step controls the container behind the content: size, shape, fill, stroke, rounding, and transparency.",
  },
  {
    id: "back",
    wizardStepId: "back",
    target: "wizard-back-card",
    title: "Add depth",
    body: "The Back step sets the offset shadow layer. Use it for a sticker-like second layer or reset it for a flat icon.",
  },
  {
    id: "particles",
    wizardStepId: "particles",
    target: "wizard-particles-card",
    title: "Attach particles",
    body: "Particles are smaller iquans anchored around the base. Pick a slot here, then refine the particle in the full editor.",
  },
  {
    id: "share",
    wizardStepId: "share",
    target: "wizard-share-card",
    title: "Export or keep editing",
    body: "Finish here by exporting a PNG, copying a share link, saving a project, or opening the full editor for more control.",
  },
];
const HERO_SAMPLE_BLUEPRINTS = [
  {
    key: "sparkles-circle",
    mode: "icon",
    lucide: "sparkles",
    lucideWeight: 1.3,
    shape: "circle",
    size: 152,
    iconScale: 60,
    fillStops: ["#fff4cf", "#ffd79a"],
    strokeStops: ["#f59e0b"],
    textColor: "#b45309",
    outline: 6,
    backColor: "#fde68a",
    backDistance: 10,
    backAngle: 42,
  },
  {
    key: "bolt-square",
    mode: "icon",
    lucide: "zap",
    lucideWeight: 2.8,
    shape: "square",
    size: 148,
    iconScale: 62,
    radius: 28,
    fillStops: ["#eff6ff", "#c7d2fe"],
    strokeStops: ["#818cf8"],
    textColor: "#4f46e5",
    outline: 5,
    backColor: "#a5b4fc",
    backDistance: 8,
    backAngle: 36,
  },
  {
    key: "message-pill",
    mode: "icon",
    lucide: "message-circle",
    lucideWeight: 1.2,
    shape: "pill",
    size: 156,
    iconScale: 56,
    pillWidthScale: 194,
    pillHeightScale: 74,
    fillStops: ["#f0fdf4", "#bbf7d0"],
    strokeStops: ["#34d399"],
    textColor: "#047857",
    outline: 4,
    backColor: "#86efac",
    backDistance: 8,
    backAngle: 24,
  },
  {
    key: "wave-text",
    mode: "text",
    content: "~",
    shape: "circle",
    size: 146,
    fontSize: 96,
    fontWeight: "900",
    fillStops: ["#eff6ff", "#dbeafe"],
    strokeStops: ["#38bdf8"],
    textColor: "#0284c7",
    outline: 5,
    backColor: "#7dd3fc",
    backDistance: 6,
    backAngle: 55,
  },
  {
    key: "asterisk-text",
    mode: "text",
    content: "*",
    shape: "square",
    size: 144,
    radius: 26,
    fontSize: 92,
    fontWeight: "900",
    fillStops: ["#fff1f2", "#fecdd3"],
    strokeStops: ["#fb7185"],
    textColor: "#e11d48",
    outline: 4,
    backColor: "#fda4af",
    backDistance: 10,
    backAngle: 35,
  },
  {
    key: "play-rectangle",
    mode: "icon",
    lucide: "play",
    lucideWeight: 1,
    shape: "rectangle",
    size: 158,
    iconScale: 50,
    widthScale: 188,
    radius: 26,
    fillStops: ["#f5f3ff", "#ddd6fe"],
    strokeStops: ["#a78bfa"],
    textColor: "#7c3aed",
    outline: 5,
    backColor: "#c4b5fd",
    backDistance: 8,
    backAngle: 18,
  },
  {
    key: "ok-pill",
    mode: "text",
    content: "OK",
    shape: "pill",
    size: 150,
    pillWidthScale: 202,
    pillHeightScale: 76,
    fontSize: 62,
    fontWeight: "900",
    fillStops: ["#ecfeff", "#bae6fd"],
    strokeStops: ["#22d3ee"],
    textColor: "#0f766e",
    outline: 4,
    backColor: "#67e8f9",
    backDistance: 8,
    backAngle: 26,
  },
  {
    key: "heart-circle",
    mode: "icon",
    lucide: "heart",
    lucideWeight: 2.4,
    shape: "circle",
    size: 150,
    iconScale: 58,
    fillStops: ["#fff1f2", "#fecdd3"],
    strokeStops: ["#fb7185"],
    textColor: "#f43f5e",
    outline: 5,
    backColor: "#fda4af",
    backDistance: 10,
    backAngle: 28,
  },
  {
    key: "sun-square",
    mode: "icon",
    lucide: "sun",
    lucideWeight: 1.1,
    shape: "square",
    size: 148,
    iconScale: 58,
    radius: 24,
    fillStops: ["#fefce8", "#fde68a"],
    strokeStops: ["#facc15"],
    textColor: "#ca8a04",
    outline: 4,
    backColor: "#fde047",
    backDistance: 8,
    backAngle: 48,
  },
  {
    key: "go-text",
    mode: "text",
    content: "Go",
    shape: "rectangle",
    size: 156,
    widthScale: 184,
    radius: 24,
    fontSize: 60,
    fontWeight: "800",
    fillStops: ["#ecfdf5", "#bbf7d0"],
    strokeStops: ["#34d399"],
    textColor: "#047857",
    outline: 4,
    backColor: "#86efac",
    backDistance: 8,
    backAngle: 22,
  },
  {
    key: "star-circle",
    mode: "icon",
    lucide: "star",
    lucideWeight: 1.2,
    shape: "circle",
    size: 146,
    iconScale: 60,
    fillStops: ["#fff7ed", "#fed7aa"],
    strokeStops: ["#fb923c"],
    textColor: "#ea580c",
    outline: 5,
    backColor: "#fdba74",
    backDistance: 9,
    backAngle: 34,
  },
  {
    key: "moon-badge-particle",
    base: {
      mode: "icon",
      lucide: "moon",
      lucideWeight: 2.6,
      shape: "circle",
      size: 148,
      iconScale: 60,
      fillStops: ["#f8fafc", "#dbeafe"],
      strokeStops: ["#60a5fa"],
      textColor: "#2563eb",
      outline: 4,
      backColor: "#93c5fd",
      backDistance: 8,
      backAngle: 28,
    },
    particles: {
      topRight: createHeroParticle(
        {
          mode: "text",
          content: "+",
          shape: "circle",
          size: 68,
          fontSize: 44,
          fontWeight: "900",
          fillStops: ["#fff7ed", "#fed7aa"],
          strokeStops: ["#fb923c"],
          textColor: "#ea580c",
          outline: 3,
        },
        8,
        -8,
      ),
    },
  },
  {
    key: "idea-chip",
    mode: "icon",
    lucide: "lightbulb",
    lucideWeight: 1.5,
    shape: "pill",
    size: 152,
    iconScale: 54,
    pillWidthScale: 192,
    pillHeightScale: 78,
    fillStops: ["#fefce8", "#fde68a"],
    strokeStops: ["#facc15"],
    textColor: "#ca8a04",
    outline: 4,
    backColor: "#fde047",
    backDistance: 8,
    backAngle: 18,
  },
  {
    key: "grid-plus",
    base: {
      mode: "icon",
      lucide: "layout-grid",
      lucideWeight: 1.6,
      shape: "square",
      size: 144,
      iconScale: 56,
      radius: 26,
      fillStops: ["#eff6ff", "#dbeafe"],
      strokeStops: ["#38bdf8"],
      textColor: "#0f766e",
      outline: 4,
      backColor: "#7dd3fc",
      backDistance: 8,
      backAngle: 40,
    },
    particles: {
      bottomRight: createHeroParticle(
        {
          mode: "icon",
          lucide: "plus",
          shape: "circle",
          size: 62,
          fillStops: ["#ecfdf5", "#bbf7d0"],
          strokeStops: ["#4ade80"],
          textColor: "#16a34a",
          outline: 3,
        },
        8,
        8,
      ),
    },
  },
  {
    key: "hash-note",
    mode: "text",
    content: "#",
    shape: "square",
    size: 148,
    radius: 24,
    fontSize: 80,
    fontWeight: "900",
    fillStops: ["#f5f3ff", "#e9d5ff"],
    strokeStops: ["#c084fc"],
    textColor: "#7c3aed",
    outline: 4,
    backColor: "#d8b4fe",
    backDistance: 8,
    backAngle: 26,
  },
  {
    key: "camera-card",
    mode: "icon",
    lucide: "camera",
    lucideWeight: 1.8,
    shape: "rectangle",
    size: 156,
    iconScale: 54,
    widthScale: 186,
    radius: 24,
    fillStops: ["#f8fafc", "#e2e8f0"],
    strokeStops: ["#94a3b8"],
    textColor: "#475569",
    outline: 4,
    backColor: "#cbd5e1",
    backDistance: 8,
    backAngle: 20,
  },
  {
    key: "chat-burst",
    base: {
      mode: "icon",
      lucide: "message-circle-more",
      lucideWeight: 1.4,
      shape: "pill",
      size: 150,
      iconScale: 54,
      pillWidthScale: 190,
      pillHeightScale: 78,
      fillStops: ["#ecfeff", "#a5f3fc"],
      strokeStops: ["#22d3ee"],
      textColor: "#0891b2",
      outline: 4,
      backColor: "#67e8f9",
      backDistance: 8,
      backAngle: 24,
    },
    particles: {
      topLeft: createHeroParticle(
        {
          mode: "text",
          content: "!",
          shape: "circle",
          size: 64,
          fontSize: 42,
          fontWeight: "900",
          fillStops: ["#fff1f2", "#fecdd3"],
          strokeStops: ["#fb7185"],
          textColor: "#e11d48",
          outline: 3,
        },
        -8,
        -8,
      ),
    },
  },
  {
    key: "terminal-hard-outline",
    mode: "icon",
    lucide: "terminal",
    lucideWeight: 3.8,
    shape: "square",
    size: 150,
    iconScale: 54,
    radius: 20,
    fillStops: ["#fefefe", "#e5e7eb"],
    strokeStops: ["#111111"],
    textColor: "#111111",
    outline: 8,
    backColor: "#111111",
    backDistance: 10,
    backAngle: 36,
  },
  {
    key: "compass-ring",
    mode: "icon",
    lucide: "compass",
    lucideWeight: 2.4,
    shape: "circle",
    size: 154,
    iconScale: 56,
    fillStops: ["#ffffff", "#e2e8f0"],
    strokeStops: ["#0f172a"],
    textColor: "#0f172a",
    outline: 7,
    backColor: "#cbd5e1",
    backDistance: 4,
    backAngle: 90,
  },
  {
    key: "music-burst",
    mode: "icon",
    lucide: "music-4",
    lucideWeight: 1.1,
    shape: "circle",
    size: 144,
    iconScale: 52,
    fillStops: ["#fdf4ff", "#f5d0fe"],
    fillGradientType: "radial",
    strokeStops: ["#d946ef"],
    textColor: "#a21caf",
    outline: 6,
    backColor: "#f0abfc",
    backDistance: 12,
    backAngle: 30,
  },
  {
    key: "mail-stamp",
    mode: "icon",
    lucide: "mail",
    lucideWeight: 2.2,
    shape: "rectangle",
    size: 160,
    iconScale: 50,
    widthScale: 194,
    radius: 16,
    fillStops: ["#fff7ed", "#ffedd5"],
    strokeStops: ["#7c2d12"],
    textColor: "#7c2d12",
    outline: 8,
    backColor: "#fdba74",
    backDistance: 10,
    backAngle: 18,
  },
  {
    key: "question-bubble",
    mode: "text",
    content: "?",
    shape: "pill",
    size: 154,
    pillWidthScale: 186,
    pillHeightScale: 74,
    fontSize: 66,
    fontWeight: "1000",
    fillStops: ["#eff6ff", "#bfdbfe"],
    strokeStops: ["#1d4ed8"],
    textColor: "#1d4ed8",
    outline: 7,
    backColor: "#60a5fa",
    backDistance: 10,
    backAngle: 20,
  },
  {
    key: "bookmark-tag",
    mode: "icon",
    lucide: "bookmark",
    lucideWeight: 2.9,
    shape: "rectangle",
    size: 154,
    iconScale: 46,
    widthScale: 168,
    radius: 22,
    fillStops: ["#ecfccb", "#d9f99d"],
    strokeStops: ["#3f6212"],
    textColor: "#3f6212",
    outline: 7,
    backColor: "#84cc16",
    backDistance: 9,
    backAngle: 42,
  },
  {
    key: "smile-chip",
    mode: "icon",
    lucide: "smile-plus",
    lucideWeight: 1.4,
    shape: "pill",
    size: 148,
    iconScale: 52,
    pillWidthScale: 188,
    pillHeightScale: 72,
    fillStops: ["#ecfeff", "#cffafe"],
    strokeStops: ["#0f172a"],
    textColor: "#0f766e",
    outline: 6,
    backColor: "#67e8f9",
    backDistance: 8,
    backAngle: 18,
  },
  {
    key: "lowercase-monogram",
    mode: "text",
    content: "iq",
    shape: "square",
    size: 150,
    radius: 30,
    fontSize: 54,
    fontWeight: "800",
    fillStops: ["#f8fafc", "#dbeafe"],
    strokeStops: ["#111827"],
    textColor: "#111827",
    outline: 7,
    backColor: "#94a3b8",
    backDistance: 10,
    backAngle: 35,
  },
  {
    key: "orbit-particle",
    base: {
      mode: "icon",
      lucide: "circle-dot",
      lucideWeight: 2.2,
      shape: "circle",
      size: 148,
      iconScale: 58,
      fillStops: ["#fff7ed", "#ffedd5"],
      strokeStops: ["#fb923c"],
      textColor: "#9a3412",
      outline: 6,
      backColor: "#fdba74",
      backDistance: 8,
      backAngle: 26,
    },
    particles: {
      topLeft: createHeroParticle(
        {
          mode: "icon",
          lucide: "sparkles",
          lucideWeight: 1.4,
          shape: "circle",
          size: 58,
          iconScale: 56,
          fillStops: ["#ffffff", "#fef3c7"],
          strokeStops: ["#f59e0b"],
          textColor: "#d97706",
          outline: 3,
        },
        -12,
        -10,
      ),
      bottomRight: createHeroParticle(
        {
          mode: "text",
          content: "•",
          shape: "circle",
          size: 50,
          fontSize: 32,
          fontWeight: "900",
          fillStops: ["#ffffff", "#fbcfe8"],
          strokeStops: ["#ec4899"],
          textColor: "#db2777",
          outline: 3,
        },
        10,
        12,
      ),
    },
  },
  {
    key: "rocket-launch",
    mode: "icon",
    lucide: "rocket",
    lucideWeight: 1.7,
    shape: "circle",
    size: 152,
    iconScale: 56,
    fillStops: ["#eef2ff", "#c7d2fe"],
    strokeStops: ["#6366f1"],
    textColor: "#4338ca",
    outline: 5,
    backColor: "#a5b4fc",
    backDistance: 10,
    backAngle: 24,
  },
  {
    key: "pin-drop",
    mode: "icon",
    lucide: "map-pin",
    lucideWeight: 2.2,
    shape: "pill",
    size: 154,
    iconScale: 52,
    pillWidthScale: 182,
    pillHeightScale: 74,
    fillStops: ["#f0fdf4", "#dcfce7"],
    strokeStops: ["#22c55e"],
    textColor: "#15803d",
    outline: 5,
    backColor: "#86efac",
    backDistance: 8,
    backAngle: 38,
  },
  {
    key: "badge-check",
    base: {
      mode: "icon",
      lucide: "badge-check",
      lucideWeight: 1.8,
      shape: "circle",
      size: 150,
      iconScale: 58,
      fillStops: ["#ecfeff", "#cffafe"],
      strokeStops: ["#06b6d4"],
      textColor: "#0e7490",
      outline: 5,
      backColor: "#67e8f9",
      backDistance: 8,
      backAngle: 28,
    },
    particles: {
      bottomRight: createHeroParticle(
        {
          mode: "text",
          content: "1",
          shape: "circle",
          size: 56,
          fontSize: 34,
          fontWeight: "900",
          fillStops: ["#fff1f2", "#fecdd3"],
          strokeStops: ["#fb7185"],
          textColor: "#e11d48",
          outline: 3,
        },
        8,
        10,
      ),
    },
  },
  {
    key: "palette-square",
    mode: "icon",
    lucide: "palette",
    lucideWeight: 1.5,
    shape: "square",
    size: 148,
    iconScale: 56,
    radius: 28,
    fillStops: ["#fdf2f8", "#fbcfe8"],
    strokeStops: ["#ec4899"],
    textColor: "#be185d",
    outline: 5,
    backColor: "#f9a8d4",
    backDistance: 9,
    backAngle: 42,
  },
  {
    key: "bell-note",
    mode: "icon",
    lucide: "bell-ring",
    lucideWeight: 2,
    shape: "rectangle",
    size: 156,
    iconScale: 52,
    widthScale: 176,
    radius: 22,
    fillStops: ["#fefce8", "#fef3c7"],
    strokeStops: ["#eab308"],
    textColor: "#a16207",
    outline: 5,
    backColor: "#fde047",
    backDistance: 8,
    backAngle: 18,
  },
  {
    key: "slash-command",
    mode: "text",
    content: "/",
    shape: "square",
    size: 148,
    radius: 24,
    fontSize: 86,
    fontWeight: "900",
    fillStops: ["#f8fafc", "#e2e8f0"],
    strokeStops: ["#475569"],
    textColor: "#0f172a",
    outline: 6,
    backColor: "#cbd5e1",
    backDistance: 8,
    backAngle: 32,
  },
];

const STARTER_TEMPLATES = [
  {
    id: "ok-reply",
    title: "OK Reply",
    description: "A clear affirmative reaction for texts and quick replies.",
    canvasSize: 500,
    base: {
      mode: "text",
      content: "OK",
      shape: "pill",
      size: 172,
      pillWidthScale: 198,
      pillHeightScale: 76,
      fontSize: 62,
      fontWeight: "900",
      fillStops: ["#ecfeff", "#a5f3fc"],
      strokeStops: ["#0891b2"],
      textColor: "#0e7490",
      outline: 5,
      backColor: "#67e8f9",
      backDistance: 8,
      backAngle: 24,
    },
  },
  {
    id: "x-reply",
    title: "X Reply",
    description: "A simple no / cancel reaction that reads at tiny sizes.",
    canvasSize: 500,
    base: {
      mode: "text",
      content: "X",
      shape: "circle",
      size: 168,
      iconScale: 82,
      fontSize: 82,
      fontWeight: "900",
      fillStops: ["#fff1f2", "#fecdd3"],
      strokeStops: ["#fb7185"],
      textColor: "#e11d48",
      outline: 6,
      backColor: "#fda4af",
      backDistance: 10,
      backAngle: 32,
    },
  },
  {
    id: "smile-reaction",
    title: "Smile",
    description: "A friendly smiley for warm reactions and group chats.",
    canvasSize: 500,
    base: {
      mode: "icon",
      lucide: "smile",
      lucideWeight: 2.2,
      shape: "circle",
      size: 168,
      iconScale: 60,
      fillStops: ["#fff7ed", "#fed7aa"],
      strokeStops: ["#f59e0b"],
      textColor: "#b45309",
      outline: 6,
      backColor: "#fde68a",
      backDistance: 10,
      backAngle: 32,
    },
  },
];

const COMPACT_ICON_FIELDS = [
  ["mode", "m"],
  ["contentEnabled", "me"],
  ["shape", "h"],
  ["shapeEnabled", "he"],
  ["content", "t"],
  ["lucide", "l"],
  ["lucideWeight", "lw"],
  ["size", "s"],
  ["iconScale", "is"],
  ["widthScale", "ws"],
  ["heightScale", "hs"],
  ["pillWidthScale", "pw"],
  ["pillHeightScale", "ph"],
  ["radius", "r"],
  ["folderTabX", "ftx"],
  ["folderTabWidth", "ftw"],
  ["folderTabHeight", "fth"],
  ["fontSize", "fs"],
  ["linkTextToSize", "lt"],
  ["spacing", "sp"],
  ["fontFamily", "ff"],
  ["fontWeight", "fw"],
  ["inset", "in"],
  ["fillStops", "f"],
  ["fillGradientType", "ft"],
  ["fillGradientAngle", "fa"],
  ["fillGradientCenterX", "fx"],
  ["fillGradientCenterY", "fy"],
  ["baseOpacity", "bo"],
  ["textColor", "tc"],
  ["contentOpacity", "co"],
  ["contentOffsetX", "cox"],
  ["contentOffsetY", "coy"],
  ["contentRotation", "cr"],
  ["shapeOffsetX", "sox"],
  ["shapeOffsetY", "soy"],
  ["strokeStops", "o"],
  ["strokeGradientType", "ot"],
  ["strokeGradientAngle", "oa"],
  ["strokeGradientCenterX", "ox"],
  ["strokeGradientCenterY", "oy"],
  ["backColor", "bc"],
  ["outline", "ol"],
  ["backLayerEnabled", "ble"],
  ["backDistance", "bd"],
  ["backAngle", "ba"],
  ["imageData", "id"],
  ["imageName", "im"],
  ["imageWidth", "iw"],
  ["imageHeight", "ih"],
  ["imageCropEnabled", "ce"],
  ["imageCropX", "cx"],
  ["imageCropY", "cy"],
  ["imageCropSize", "cs"],
  ["imageRotation", "ir"],
  ["imageHue", "ihh"],
  ["imageContrast", "ic"],
  ["imageBrightness", "ib"],
  ["imageSilhouette", "si"],
  ["imageSilhouetteColor", "sc"],
  ["imageEdgeStroke", "es"],
  ["imageEdgeStrokeColor", "ec"],
  ["baseImageData", "jd"],
  ["baseImageName", "jn"],
  ["baseImageWidth", "jw"],
  ["baseImageHeight", "jh"],
  ["baseImageCropEnabled", "jce"],
  ["baseImageCropX", "jcx"],
  ["baseImageCropY", "jcy"],
  ["baseImageCropSize", "jcs"],
  ["baseImageRotation", "jr"],
  ["baseImageHue", "jhh"],
  ["baseImageContrast", "jc"],
  ["baseImageBrightness", "jb"],
  ["baseImageSilhouette", "js"],
  ["baseImageSilhouetteColor", "jsc"],
  ["baseImageEdgeStroke", "jes"],
  ["baseImageEdgeStrokeColor", "jec"],
];
const COMPACT_TOKEN_TO_ICON_FIELD = Object.fromEntries(
  COMPACT_ICON_FIELDS.map(([field, token]) => [token, field]),
);

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function getWalkthroughCardPosition(rect) {
  if (typeof window === "undefined" || !rect) return { top: 16, left: 16 };

  const margin = 16;
  const gap = 14;
  const cardWidth = Math.min(340, window.innerWidth - margin * 2);
  const cardHeightEstimate = 230;
  let left = rect.right + gap;
  let top = rect.top + rect.height / 2 - cardHeightEstimate / 2;

  if (left + cardWidth > window.innerWidth - margin) {
    left = rect.left - cardWidth - gap;
  }

  if (left < margin) {
    left = clamp(rect.left, margin, window.innerWidth - cardWidth - margin);
    top = rect.bottom + gap;
  }

  if (top + cardHeightEstimate > window.innerHeight - margin) {
    top = rect.top - cardHeightEstimate - gap;
  }

  return {
    left: clamp(left, margin, Math.max(margin, window.innerWidth - cardWidth - margin)),
    top: clamp(top, margin, Math.max(margin, window.innerHeight - cardHeightEstimate - margin)),
  };
}

function normalizeLucideName(value) {
  return value
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[_\s]+/g, "-")
    .replace(/[^a-zA-Z0-9-]/g, "-")
    .toLowerCase()
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function normalizeMode(value) {
  const normalized = String(value ?? "")
    .trim()
    .toLowerCase();
  if (normalized === "lucide") return "icon";
  if (normalized === "none") return "none";
  return MODES.includes(normalized) ? normalized : DEFAULT_STATE.mode;
}

function getShapeRadius(shape, width, height, radius) {
  if (shape === "none") return 0;
  return clamp(radius, 0, Math.min(width, height) / 2);
}

const iconOptions = Object.keys(dynamicIconImports).sort();

const measureCanvas =
  typeof document !== "undefined" ? document.createElement("canvas") : null;

function measureTextWidth(text, fontSize, fontWeight, fontFamily, spacing) {
  const sample = text || " ";
  if (!measureCanvas) return sample.length * fontSize * 0.68;
  const context = measureCanvas.getContext("2d");
  context.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
  const metrics = context.measureText(sample);
  const visualWidth = Math.max(
    metrics.width,
    (metrics.actualBoundingBoxLeft ?? 0) + (metrics.actualBoundingBoxRight ?? metrics.width),
  );
  const spacingWidth = Math.max(0, [...sample].length - 1) * spacing;
  return (visualWidth + spacingWidth) * 1.04;
}

function getTextOpticalOffset(text, fontSize, fontWeight, fontFamily) {
  if (!measureCanvas) return 0;
  const context = measureCanvas.getContext("2d");
  context.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
  const metrics = context.measureText(text || " ");
  const left = metrics.actualBoundingBoxLeft ?? 0;
  const right = metrics.actualBoundingBoxRight ?? metrics.width;
  const offset = (right - left - metrics.width) / 2;
  if (!Number.isFinite(offset)) return 0;
  const maxOffset = Math.max(2, fontSize * 0.08);
  return clamp(offset, -maxOffset, maxOffset);
}

function getContentDrivenWidth(state, fontSize, minWidth, visibleOutline) {
  if (!state.contentEnabled || state.mode === "icon" || state.mode === "none") return minWidth;
  const measured = measureTextWidth(
    state.content || " ",
    fontSize,
    state.fontWeight,
    state.fontFamily,
    state.spacing,
  );
  return Math.max(
    minWidth,
    Math.ceil(measured + state.inset * 2 + visibleOutline * 2 + 10),
  );
}

function getDimensions(state, fontSize, visibleOutline) {
  const base = state.size;
  if (state.shape === "shape" || state.shape === "folder") {
    return {
      width: Math.max(1, Math.round(base * (state.widthScale / 100))),
      height: Math.max(1, Math.round(base * (state.heightScale / 100))),
    };
  }

  return { width: base, height: base };
}

function getTextFitBounds(state, visibleOutline, dimensions) {
  const innerWidth = Math.max(
    1,
    dimensions.width - state.inset * 2 - visibleOutline * 2,
  );
  const innerHeight = Math.max(
    1,
    dimensions.height - state.inset * 2 - visibleOutline * 2,
  );
  const widthSlack = Math.min(14, Math.max(2, Math.round(innerWidth * 0.14)));
  const heightSlack = Math.min(12, Math.max(2, Math.round(innerHeight * 0.12)));

  return {
    width: Math.max(1, innerWidth - widthSlack),
    height: Math.max(1, innerHeight - heightSlack),
  };
}

function doesTextFitAtScale(state, visibleOutline, fontSize, iconScale = state.iconScale) {
  const dimensions = getDimensions(state, fontSize, visibleOutline);
  const scale = iconScale / 100;
  const fitBounds = getTextFitBounds(state, visibleOutline, dimensions);
  const safeWidth = Math.max(1, fitBounds.width * scale);
  const safeHeight = Math.max(1, fitBounds.height * scale);
  const measured = measureTextWidth(
    state.content || " ",
    fontSize,
    state.fontWeight,
    state.fontFamily,
    state.spacing,
  );
  return measured <= safeWidth && fontSize <= safeHeight;
}

function getLinkedTextContentScaleLimit(state, visibleOutline = state.outline) {
  if (!state.contentEnabled || state.mode !== "text" || !state.linkTextToSize) {
    return null;
  }

  const requestedSize = Math.max(8, Math.round(state.fontSize));
  if (!doesTextFitAtScale(state, visibleOutline, requestedSize, ICON_SCALE_MAX)) {
    return null;
  }

  let low = ICON_SCALE_MIN;
  let high = ICON_SCALE_MAX;
  let best = ICON_SCALE_MAX;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    if (doesTextFitAtScale(state, visibleOutline, requestedSize, mid)) {
      best = mid;
      high = mid - 1;
    } else {
      low = mid + 1;
    }
  }

  return best;
}

function resolveIconScaleForStateChange(state, nextScale) {
  const clampedScale = clamp(nextScale, ICON_SCALE_MIN, ICON_SCALE_MAX);
  const linkedTextLimit = getLinkedTextContentScaleLimit(state, state.outline);
  if (
    linkedTextLimit !== null &&
    clampedScale > state.iconScale &&
    clampedScale > linkedTextLimit
  ) {
    return Math.max(state.iconScale, linkedTextLimit);
  }

  return clampedScale;
}

function fitTextSize(state, visibleOutline) {
  if (state.mode !== "text") {
    return Math.round(state.size * 0.48 * (state.iconScale / 100));
  }

  const doesTextFit = (fontSize) => {
    return doesTextFitAtScale(state, visibleOutline, fontSize);
  };

  const findLargestFittingSize = (maxSize) => {
    let low = 8;
    let high = Math.max(8, Math.round(maxSize));
    let best = 8;

    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      if (doesTextFit(mid)) {
        best = mid;
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }

    return Math.max(8, best);
  };

  if (state.linkTextToSize) {
    const requestedSize = Math.max(8, Math.round(state.fontSize));
    if (doesTextFit(requestedSize)) return requestedSize;
    return findLargestFittingSize(requestedSize);
  }

  const autoMaxSize = Math.max(24, Math.round(state.size * 2.2));
  return findLargestFittingSize(autoMaxSize);
}

function getOffset(distance, angle) {
  const radians = (angle * Math.PI) / 180;
  return {
    x: Math.cos(radians) * distance,
    y: Math.sin(radians) * distance,
  };
}

function getMainSurfaceStyle(state, visibleOutline) {
  const fillPaint = getGradientPaint(
    state.fillStops,
    state.fillGradientType,
    state.fillGradientAngle,
    state.fillGradientCenterX,
    state.fillGradientCenterY,
  );

  if (visibleOutline <= 0) {
    return {
      background: fillPaint,
      border: "none",
    };
  }

  if (state.strokeStops.length <= 1) {
    return {
      background: fillPaint,
      border: `${visibleOutline}px solid ${state.strokeStops[0]}`,
    };
  }

  const strokePaint = getGradientPaint(
    state.strokeStops,
    state.strokeGradientType,
    state.strokeGradientAngle,
    state.strokeGradientCenterX,
    state.strokeGradientCenterY,
  );

  return {
    border: `${visibleOutline}px solid transparent`,
    backgroundImage: `${fillPaint}, ${strokePaint}`,
    backgroundOrigin: "border-box",
    backgroundClip: "padding-box, border-box",
  };
}

function hexToRgb(value) {
  const safe = sanitizeHexColor(value, "#000000").slice(1);
  return {
    r: Number.parseInt(safe.slice(0, 2), 16),
    g: Number.parseInt(safe.slice(2, 4), 16),
    b: Number.parseInt(safe.slice(4, 6), 16),
  };
}

function rgbToHex({ r, g, b }) {
  return `#${[r, g, b]
    .map((channel) => clamp(Math.round(channel), 0, 255).toString(16).padStart(2, "0"))
    .join("")}`;
}

function mixHexColors(color, mixWith, amount) {
  const base = hexToRgb(color);
  const target = hexToRgb(mixWith);
  return rgbToHex({
    r: base.r + (target.r - base.r) * amount,
    g: base.g + (target.g - base.g) * amount,
    b: base.b + (target.b - base.b) * amount,
  });
}

function getSvgLinearGradientPoints(angle) {
  const radians = ((clamp(parseIntOr(angle, 135), 0, 359) - 90) * Math.PI) / 180;
  const x = Math.cos(radians);
  const y = Math.sin(radians);
  return {
    x1: `${50 - x * 50}%`,
    y1: `${50 - y * 50}%`,
    x2: `${50 + x * 50}%`,
    y2: `${50 + y * 50}%`,
  };
}

function SvgPaint({ id, stops, gradientType, angle, centerX, centerY, fallback }) {
  const safeStops = sanitizeColorStops(stops, fallback);
  if (safeStops.length < 2) return null;

  if (gradientType === "radial") {
    return (
      <radialGradient
        id={id}
        cx={`${clamp(parseIntOr(centerX, 50), 0, 100)}%`}
        cy={`${clamp(parseIntOr(centerY, 50), 0, 100)}%`}
        r="78%"
      >
        {safeStops.map((stop, index) => (
          <stop
            key={`${id}-${index}`}
            offset={`${(index / Math.max(1, safeStops.length - 1)) * 100}%`}
            stopColor={stop}
          />
        ))}
      </radialGradient>
    );
  }

  return (
    <linearGradient id={id} {...getSvgLinearGradientPoints(angle)}>
      {safeStops.map((stop, index) => (
        <stop
          key={`${id}-${index}`}
          offset={`${(index / Math.max(1, safeStops.length - 1)) * 100}%`}
          stopColor={stop}
        />
      ))}
    </linearGradient>
  );
}

function getSvgPaintReference(id, stops, fallback) {
  const safeStops = sanitizeColorStops(stops, fallback);
  return safeStops.length > 1 ? `url(#${id})` : safeStops[0];
}

function getFolderPath(width, height, radius, tabX, tabWidthValue, tabHeightValue, inset = 0) {
  const x = inset;
  const y = inset;
  const w = Math.max(1, width - inset * 2);
  const h = Math.max(1, height - inset * 2);
  const tabHeight = clamp(h * (tabHeightValue / 100), 8, h * 0.42);
  const tabWidth = clamp(w * (tabWidthValue / 100), 24, w * 0.82);
  const tabSlope = clamp(w * 0.06, 8, 18);
  const bodyTop = y + tabHeight;
  const r = clamp(radius, 2, Math.min(w, h - tabHeight) / 2);
  const maxTabStart = Math.max(4, w - tabWidth - tabSlope - 8);
  const minTabStart = Math.min(r, maxTabStart);
  const tabStart = clamp(w * (tabX / 100), minTabStart, maxTabStart);
  const tabRadius = clamp(radius * 0.55, 3, tabHeight * 0.42);

  return [
    `M ${x + r} ${bodyTop}`,
    `L ${x + tabStart} ${bodyTop}`,
    `Q ${x + tabStart + tabRadius} ${bodyTop} ${x + tabStart + tabSlope} ${y + tabRadius}`,
    `Q ${x + tabStart + tabSlope + 2} ${y} ${x + tabStart + tabSlope + tabRadius} ${y}`,
    `L ${x + tabStart + tabWidth} ${y}`,
    `Q ${x + tabStart + tabWidth + tabRadius} ${y} ${x + tabStart + tabWidth + tabSlope} ${bodyTop - tabRadius}`,
    `Q ${x + tabStart + tabWidth + tabSlope + 2} ${bodyTop} ${x + tabStart + tabWidth + tabSlope + tabRadius} ${bodyTop}`,
    `L ${x + w - r} ${bodyTop}`,
    `Q ${x + w} ${bodyTop} ${x + w} ${bodyTop + r}`,
    `L ${x + w} ${y + h - r}`,
    `Q ${x + w} ${y + h} ${x + w - r} ${y + h}`,
    `L ${x + r} ${y + h}`,
    `Q ${x} ${y + h} ${x} ${y + h - r}`,
    `L ${x} ${bodyTop + r}`,
    `Q ${x} ${bodyTop} ${x + r} ${bodyTop}`,
    "Z",
  ].join(" ");
}

function sanitizeHexColor(value, fallback) {
  const safe = String(value || "").trim();
  return /^#[0-9a-fA-F]{6}$/.test(safe) ? safe : fallback;
}

function sanitizeGradientType(value, fallback) {
  return GRADIENT_TYPES.includes(value) ? value : fallback;
}

function sanitizeColorStops(value, fallback) {
  const fallbackStops = Array.isArray(fallback) && fallback.length > 0 ? fallback : ["#ffffff"];
  const rawStops = Array.isArray(value)
    ? value
    : typeof value === "string"
      ? [value]
      : fallbackStops;
  const cleaned = rawStops
    .map((color, index) =>
      sanitizeHexColor(
        color,
        fallbackStops[Math.min(index, fallbackStops.length - 1)] || fallbackStops[0],
      ),
    )
    .slice(0, MAX_GRADIENT_STOPS);

  if (cleaned.length === 0) return [...fallbackStops];
  return cleaned;
}

function getGradientPaint(stops, type, angle, centerX = 50, centerY = 50) {
  const safeStops = sanitizeColorStops(stops, DEFAULT_STATE.fillStops);
  if (safeStops.length < 2) return safeStops[0];
  if (type === "radial") {
    const safeCenterX = clamp(parseIntOr(centerX, 50), 0, 100);
    const safeCenterY = clamp(parseIntOr(centerY, 50), 0, 100);
    return `radial-gradient(circle at ${safeCenterX}% ${safeCenterY}%, ${safeStops.join(", ")})`;
  }
  return `linear-gradient(${clamp(parseIntOr(angle, 0), 0, 359)}deg, ${safeStops.join(", ")})`;
}

function sanitizeImageData(value) {
  const safe = String(value || "");
  if (!safe.startsWith("data:image/")) return "";
  return safe;
}

function sanitizeFilename(value, fallback = "image") {
  const safe = String(value || "").trim();
  if (!safe) return fallback;
  return safe.replace(/\s+/g, " ").slice(0, 120);
}

function triggerDownloadUrl(url, filename) {
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.rel = "noopener";
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  link.remove();
}

function triggerDownloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  triggerDownloadUrl(url, filename);
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function fallbackCopyToClipboard(value) {
  const textArea = document.createElement("textarea");
  textArea.value = value;
  textArea.setAttribute("readonly", "");
  textArea.style.position = "fixed";
  textArea.style.left = "-10000px";
  textArea.style.top = "0";
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    return document.execCommand("copy");
  } finally {
    textArea.remove();
  }
}

function clampCropDraft(draft, width, height) {
  const safeWidth = Math.max(1, parseFloatOr(width, 1));
  const safeHeight = Math.max(1, parseFloatOr(height, 1));
  const safeSize = clamp(
    parseFloatOr(draft?.size, IMAGE_CROP_SIZE_MAX),
    IMAGE_CROP_SIZE_MIN,
    IMAGE_CROP_SIZE_MAX,
  );
  const cropPx = Math.min(safeWidth, safeHeight) * safeSize;
  const maxX = Math.max(0, (safeWidth - cropPx) / safeWidth);
  const maxY = Math.max(0, (safeHeight - cropPx) / safeHeight);
  return {
    size: safeSize,
    x: clamp(parseFloatOr(draft?.x, 0), 0, maxX),
    y: clamp(parseFloatOr(draft?.y, 0), 0, maxY),
  };
}

function getExportDimensionsFromImageState(imageState) {
  if (!imageState?.imageData) return null;

  const safeWidth = Math.max(1, parseIntOr(imageState.imageWidth, 0));
  const safeHeight = Math.max(1, parseIntOr(imageState.imageHeight, 0));

  if (imageState.imageCropEnabled) {
    const cropSize = clamp(
      parseFloatOr(imageState.imageCropSize, IMAGE_CROP_SIZE_MAX),
      IMAGE_CROP_SIZE_MIN,
      IMAGE_CROP_SIZE_MAX,
    );
    const squareSize = Math.max(1, Math.round(Math.min(safeWidth, safeHeight) * cropSize));
    return { width: squareSize, height: squareSize };
  }

  return {
    width: safeWidth,
    height: safeHeight,
  };
}

function getImageStateForTarget(iconState, targetKind = "content") {
  if (targetKind === "shape") {
    return {
      imageData: iconState.baseImageData,
      imageName: iconState.baseImageName,
      imageWidth: iconState.baseImageWidth,
      imageHeight: iconState.baseImageHeight,
      imageCropEnabled: iconState.baseImageCropEnabled,
      imageCropX: iconState.baseImageCropX,
      imageCropY: iconState.baseImageCropY,
      imageCropSize: iconState.baseImageCropSize,
      imageRotation: iconState.baseImageRotation,
      imageHue: iconState.baseImageHue,
      imageContrast: iconState.baseImageContrast,
      imageBrightness: iconState.baseImageBrightness,
      imageSilhouette: iconState.baseImageSilhouette,
      imageSilhouetteColor: iconState.baseImageSilhouetteColor,
      imageEdgeStroke: iconState.baseImageEdgeStroke,
      imageEdgeStrokeColor: iconState.baseImageEdgeStrokeColor,
    };
  }

  return {
    imageData: iconState.imageData,
    imageName: iconState.imageName,
    imageWidth: iconState.imageWidth,
    imageHeight: iconState.imageHeight,
    imageCropEnabled: iconState.imageCropEnabled,
    imageCropX: iconState.imageCropX,
    imageCropY: iconState.imageCropY,
    imageCropSize: iconState.imageCropSize,
    imageRotation: iconState.imageRotation,
    imageHue: iconState.imageHue,
    imageContrast: iconState.imageContrast,
    imageBrightness: iconState.imageBrightness,
    imageSilhouette: iconState.imageSilhouette,
    imageSilhouetteColor: iconState.imageSilhouetteColor,
    imageEdgeStroke: iconState.imageEdgeStroke,
    imageEdgeStrokeColor: iconState.imageEdgeStrokeColor,
  };
}

function getImagePatchForTarget(targetKind = "content", imageState = {}) {
  if (targetKind === "shape") {
    return {
      baseImageData: imageState.imageData,
      baseImageName: imageState.imageName,
      baseImageWidth: imageState.imageWidth,
      baseImageHeight: imageState.imageHeight,
      baseImageCropEnabled: imageState.imageCropEnabled,
      baseImageCropX: imageState.imageCropX,
      baseImageCropY: imageState.imageCropY,
      baseImageCropSize: imageState.imageCropSize,
      baseImageRotation: imageState.imageRotation,
      baseImageHue: imageState.imageHue,
      baseImageContrast: imageState.imageContrast,
      baseImageBrightness: imageState.imageBrightness,
      baseImageSilhouette: imageState.imageSilhouette,
      baseImageSilhouetteColor: imageState.imageSilhouetteColor,
      baseImageEdgeStroke: imageState.imageEdgeStroke,
      baseImageEdgeStrokeColor: imageState.imageEdgeStrokeColor,
    };
  }

  return {
    imageData: imageState.imageData,
    imageName: imageState.imageName,
    imageWidth: imageState.imageWidth,
    imageHeight: imageState.imageHeight,
    imageCropEnabled: imageState.imageCropEnabled,
    imageCropX: imageState.imageCropX,
    imageCropY: imageState.imageCropY,
    imageCropSize: imageState.imageCropSize,
    imageRotation: imageState.imageRotation,
    imageHue: imageState.imageHue,
    imageContrast: imageState.imageContrast,
    imageBrightness: imageState.imageBrightness,
    imageSilhouette: imageState.imageSilhouette,
    imageSilhouetteColor: imageState.imageSilhouetteColor,
    imageEdgeStroke: imageState.imageEdgeStroke,
    imageEdgeStrokeColor: imageState.imageEdgeStrokeColor,
  };
}

function getDefaultImagePatchForTarget(targetKind = "content") {
  return getImagePatchForTarget(targetKind, {
    imageData: DEFAULT_STATE.imageData,
    imageName: DEFAULT_STATE.imageName,
    imageWidth: DEFAULT_STATE.imageWidth,
    imageHeight: DEFAULT_STATE.imageHeight,
    imageCropEnabled: DEFAULT_STATE.imageCropEnabled,
    imageCropX: DEFAULT_STATE.imageCropX,
    imageCropY: DEFAULT_STATE.imageCropY,
    imageCropSize: DEFAULT_STATE.imageCropSize,
    imageRotation: DEFAULT_STATE.imageRotation,
    imageHue: DEFAULT_STATE.imageHue,
    imageContrast: DEFAULT_STATE.imageContrast,
    imageBrightness: DEFAULT_STATE.imageBrightness,
    imageSilhouette: DEFAULT_STATE.imageSilhouette,
    imageSilhouetteColor: DEFAULT_STATE.imageSilhouetteColor,
    imageEdgeStroke: DEFAULT_STATE.imageEdgeStroke,
    imageEdgeStrokeColor: DEFAULT_STATE.imageEdgeStrokeColor,
  });
}

function getImageSourceRect(imageState, imageWidth, imageHeight) {
  if (!imageState.imageCropEnabled) {
    return {
      sx: 0,
      sy: 0,
      sw: imageWidth,
      sh: imageHeight,
    };
  }

  const shorter = Math.min(imageWidth, imageHeight);
  const cropSize = clamp(imageState.imageCropSize, IMAGE_CROP_SIZE_MIN, IMAGE_CROP_SIZE_MAX) * shorter;
  const maxX = Math.max(0, imageWidth - cropSize);
  const maxY = Math.max(0, imageHeight - cropSize);
  const sx = clamp(imageState.imageCropX * imageWidth, 0, maxX);
  const sy = clamp(imageState.imageCropY * imageHeight, 0, maxY);

  return {
    sx,
    sy,
    sw: cropSize,
    sh: cropSize,
  };
}

function cloneCanvas(source) {
  const copy = document.createElement("canvas");
  copy.width = source.width;
  copy.height = source.height;
  const context = copy.getContext("2d");
  context.drawImage(source, 0, 0);
  return copy;
}

function applySilhouetteToCanvas(sourceCanvas, color) {
  const { r, g, b } = hexToRgb(color);
  const next = cloneCanvas(sourceCanvas);
  const context = next.getContext("2d");
  const pixels = context.getImageData(0, 0, next.width, next.height);
  const data = pixels.data;

  for (let index = 0; index < data.length; index += 4) {
    const alpha = data[index + 3];
    if (alpha === 0) continue;
    data[index] = r;
    data[index + 1] = g;
    data[index + 2] = b;
  }

  context.putImageData(pixels, 0, 0);
  return next;
}

function applyEdgeStrokeToCanvas(sourceCanvas, strokeWidth, strokeColor) {
  const stroke = clamp(Math.round(strokeWidth), 0, IMAGE_EDGE_STROKE_MAX);
  if (stroke <= 0) return sourceCanvas;

  const maskCanvas = cloneCanvas(sourceCanvas);
  const maskContext = maskCanvas.getContext("2d");
  maskContext.globalCompositeOperation = "source-in";
  maskContext.fillStyle = sanitizeHexColor(strokeColor, "#ffffff");
  maskContext.fillRect(0, 0, maskCanvas.width, maskCanvas.height);

  const outputCanvas = document.createElement("canvas");
  outputCanvas.width = sourceCanvas.width;
  outputCanvas.height = sourceCanvas.height;
  const outputContext = outputCanvas.getContext("2d");

  const samples = Math.max(16, stroke * 12);
  for (let index = 0; index < samples; index += 1) {
    const angle = (index / samples) * Math.PI * 2;
    const dx = Math.cos(angle) * stroke;
    const dy = Math.sin(angle) * stroke;
    outputContext.drawImage(maskCanvas, dx, dy);
  }

  outputContext.drawImage(sourceCanvas, 0, 0);
  return outputCanvas;
}

const imageElementCache = new Map();
const processedImageCache = new Map();
const processedImagePendingCache = new Map();

function ensureCacheLimit(cache, max = 140) {
  while (cache.size > max) {
    const firstKey = cache.keys().next().value;
    if (firstKey === undefined) break;
    cache.delete(firstKey);
  }
}

async function loadImageElement(src) {
  if (!src) return null;
  if (imageElementCache.has(src)) return imageElementCache.get(src);

  const imagePromise = new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });

  imageElementCache.set(src, imagePromise);
  ensureCacheLimit(imageElementCache, 50);
  return imagePromise;
}

function getProcessedImageCacheKey(imageState) {
  return [
    imageState.imageData,
    imageState.imageWidth,
    imageState.imageHeight,
    imageState.imageCropEnabled ? 1 : 0,
    Number(imageState.imageCropX).toFixed(4),
    Number(imageState.imageCropY).toFixed(4),
    Number(imageState.imageCropSize).toFixed(4),
    Number(imageState.imageRotation).toFixed(2),
    Number(imageState.imageHue).toFixed(2),
    Number(imageState.imageContrast).toFixed(2),
    Number(imageState.imageBrightness).toFixed(2),
    imageState.imageSilhouette ? 1 : 0,
    imageState.imageSilhouetteColor,
    Number(imageState.imageEdgeStroke).toFixed(2),
    imageState.imageEdgeStrokeColor,
  ].join("|");
}

async function buildProcessedImage(imageState) {
  if (!imageState.imageData) return "";
  const image = await loadImageElement(imageState.imageData);
  if (!image) return "";

  const baseCanvas = document.createElement("canvas");
  baseCanvas.width = IMAGE_RENDER_CANVAS_SIZE;
  baseCanvas.height = IMAGE_RENDER_CANVAS_SIZE;
  const context = baseCanvas.getContext("2d");
  const naturalWidth = Math.max(1, image.naturalWidth || parseIntOr(imageState.imageWidth, 1));
  const naturalHeight = Math.max(1, image.naturalHeight || parseIntOr(imageState.imageHeight, 1));
  const sourceRect = getImageSourceRect(imageState, naturalWidth, naturalHeight);
  const fitScale = Math.min(
    IMAGE_RENDER_CANVAS_SIZE / Math.max(1, sourceRect.sw),
    IMAGE_RENDER_CANVAS_SIZE / Math.max(1, sourceRect.sh),
  );
  const drawWidth = sourceRect.sw * fitScale;
  const drawHeight = sourceRect.sh * fitScale;

  context.clearRect(0, 0, baseCanvas.width, baseCanvas.height);
  context.save();
  context.translate(IMAGE_RENDER_CANVAS_SIZE / 2, IMAGE_RENDER_CANVAS_SIZE / 2);
  context.rotate((clamp(imageState.imageRotation, IMAGE_ROTATION_MIN, IMAGE_ROTATION_MAX) * Math.PI) / 180);
  context.filter = `hue-rotate(${clamp(
    imageState.imageHue,
    IMAGE_HUE_MIN,
    IMAGE_HUE_MAX,
  )}deg) contrast(${clamp(
    imageState.imageContrast,
    IMAGE_CONTRAST_MIN,
    IMAGE_CONTRAST_MAX,
  )}%) brightness(${clamp(imageState.imageBrightness, IMAGE_BRIGHTNESS_MIN, IMAGE_BRIGHTNESS_MAX)}%)`;
  context.drawImage(
    image,
    sourceRect.sx,
    sourceRect.sy,
    sourceRect.sw,
    sourceRect.sh,
    -drawWidth / 2,
    -drawHeight / 2,
    drawWidth,
    drawHeight,
  );
  context.restore();
  context.filter = "none";

  let outputCanvas = baseCanvas;
  if (imageState.imageSilhouette) {
    outputCanvas = applySilhouetteToCanvas(outputCanvas, imageState.imageSilhouetteColor);
  }
  if (imageState.imageEdgeStroke > 0) {
    outputCanvas = applyEdgeStrokeToCanvas(
      outputCanvas,
      imageState.imageEdgeStroke,
      imageState.imageEdgeStrokeColor,
    );
  }

  return outputCanvas.toDataURL("image/png");
}

async function normalizeUploadedImage(file) {
  if (!file) throw new Error("No image selected.");

  const objectUrl = URL.createObjectURL(file);
  try {
    const image = await loadImageElement(objectUrl);
    const safeWidth = Math.max(1, image.naturalWidth);
    const safeHeight = Math.max(1, image.naturalHeight);
    const scale = Math.min(1, IMAGE_UPLOAD_MAX_DIMENSION / Math.max(safeWidth, safeHeight));
    const width = Math.max(1, Math.round(safeWidth * scale));
    const height = Math.max(1, Math.round(safeHeight * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    context.drawImage(image, 0, 0, width, height);

    return {
      data: canvas.toDataURL("image/png"),
      width,
      height,
      name: sanitizeFilename(file.name.replace(/\.[a-zA-Z0-9]+$/, "") || "image"),
    };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

function sanitizeIconState(value) {
  const source = value || {};
  const rawMode = normalizeMode(source.mode);
  const rawShape = SHAPES.includes(source.shape) ? source.shape : DEFAULT_STATE.shape;
  const contentEnabled = source.contentEnabled !== false && rawMode !== "none";
  const shapeEnabled = source.shapeEnabled !== false && rawShape !== "none";
  const imageData = sanitizeImageData(source.imageData);
  const imageName = imageData
    ? sanitizeFilename(source.imageName, "image")
    : DEFAULT_STATE.imageName;
  const imageWidth = clamp(parseIntOr(source.imageWidth, DEFAULT_STATE.imageWidth), 0, IMAGE_UPLOAD_MAX_DIMENSION);
  const imageHeight = clamp(
    parseIntOr(source.imageHeight, DEFAULT_STATE.imageHeight),
    0,
    IMAGE_UPLOAD_MAX_DIMENSION,
  );
  const imageCropDraft = clampCropDraft(
    {
      size: parseFloatOr(source.imageCropSize, DEFAULT_STATE.imageCropSize),
      x: parseFloatOr(source.imageCropX, DEFAULT_STATE.imageCropX),
      y: parseFloatOr(source.imageCropY, DEFAULT_STATE.imageCropY),
    },
    Math.max(1, imageWidth),
    Math.max(1, imageHeight),
  );
  const baseImageData = sanitizeImageData(source.baseImageData);
  const baseImageName = baseImageData
    ? sanitizeFilename(source.baseImageName, "shape-image")
    : DEFAULT_STATE.baseImageName;
  const baseImageWidth = clamp(
    parseIntOr(source.baseImageWidth, DEFAULT_STATE.baseImageWidth),
    0,
    IMAGE_UPLOAD_MAX_DIMENSION,
  );
  const baseImageHeight = clamp(
    parseIntOr(source.baseImageHeight, DEFAULT_STATE.baseImageHeight),
    0,
    IMAGE_UPLOAD_MAX_DIMENSION,
  );
  const baseImageCropDraft = clampCropDraft(
    {
      size: parseFloatOr(source.baseImageCropSize, DEFAULT_STATE.baseImageCropSize),
      x: parseFloatOr(source.baseImageCropX, DEFAULT_STATE.baseImageCropX),
      y: parseFloatOr(source.baseImageCropY, DEFAULT_STATE.baseImageCropY),
    },
    Math.max(1, baseImageWidth),
    Math.max(1, baseImageHeight),
  );
  const fillStops = sanitizeColorStops(source.fillStops, DEFAULT_STATE.fillStops);
  const resolvedFill = Array.isArray(source.fillStops)
    ? fillStops[0]
    : sanitizeHexColor(source.fill, fillStops[0]);
  fillStops[0] = resolvedFill;

  const strokeStops = sanitizeColorStops(
    source.strokeStops,
    DEFAULT_STATE.strokeStops,
  );
  const resolvedStroke = Array.isArray(source.strokeStops)
    ? strokeStops[0]
    : sanitizeHexColor(source.strokeColor ?? source.outlineColor, strokeStops[0]);
  strokeStops[0] = resolvedStroke;

  return {
    mode: contentEnabled ? rawMode : DEFAULT_STATE.mode,
    contentEnabled,
    shape:
      shapeEnabled && (rawShape === "image" || rawShape === "folder")
        ? rawShape
        : DEFAULT_STATE.shape,
    shapeEnabled,
    content: String(source.content ?? DEFAULT_STATE.content).slice(0, 12),
    lucide:
      normalizeLucideName(String(source.lucide ?? DEFAULT_STATE.lucide)) ||
      DEFAULT_STATE.lucide,
    lucideWeight: clamp(
      parseFloatOr(source.lucideWeight, DEFAULT_STATE.lucideWeight),
      LUCIDE_WEIGHT_MIN,
      LUCIDE_WEIGHT_MAX,
    ),
    size: clamp(parseIntOr(source.size, DEFAULT_STATE.size), ICON_BASE_SIZE_MIN, ICON_BASE_SIZE_MAX),
    iconScale: clamp(
      parseIntOr(source.iconScale, DEFAULT_STATE.iconScale),
      ICON_SCALE_MIN,
      ICON_SCALE_MAX,
    ),
    widthScale: clamp(
      parseIntOr(
        source.widthScale,
        rawShape === "rectangle"
          ? parseIntOr(source.widthScale, 160)
          : rawShape === "pill"
            ? parseIntOr(source.pillWidthScale, 170)
            : DEFAULT_STATE.widthScale,
      ),
      ICON_SCALE_MIN,
      260,
    ),
    heightScale: clamp(
      parseIntOr(
        source.heightScale,
        rawShape === "pill" ? parseIntOr(source.pillHeightScale, 72) : DEFAULT_STATE.heightScale,
      ),
      SHAPE_HEIGHT_SCALE_MIN,
      SHAPE_HEIGHT_SCALE_MAX,
    ),
    pillWidthScale: clamp(
      parseIntOr(source.pillWidthScale, DEFAULT_STATE.pillWidthScale),
      110,
      240,
    ),
    pillHeightScale: clamp(
      parseIntOr(source.pillHeightScale, DEFAULT_STATE.pillHeightScale),
      60,
      110,
    ),
    radius:
      rawShape === "circle" || rawShape === "pill"
        ? SHAPE_RADIUS_MAX
        : clamp(parseIntOr(source.radius, DEFAULT_STATE.radius), 0, SHAPE_RADIUS_MAX),
    folderTabX: clamp(
      parseIntOr(source.folderTabX, DEFAULT_STATE.folderTabX),
      0,
      70,
    ),
    folderTabWidth: clamp(
      parseIntOr(source.folderTabWidth, DEFAULT_STATE.folderTabWidth),
      18,
      82,
    ),
    folderTabHeight: clamp(
      parseIntOr(source.folderTabHeight, DEFAULT_STATE.folderTabHeight),
      10,
      42,
    ),
    fontSize: clamp(parseIntOr(source.fontSize, DEFAULT_STATE.fontSize), 16, 180),
    linkTextToSize: source.linkTextToSize !== false,
    spacing: clamp(parseIntOr(source.spacing, DEFAULT_STATE.spacing), 0, 20),
    fontFamily: String(source.fontFamily ?? DEFAULT_STATE.fontFamily),
    fontWeight: String(
      clamp(
        parseIntOr(source.fontWeight, parseIntOr(DEFAULT_STATE.fontWeight, 700)),
        FONT_WEIGHT_MIN,
        FONT_WEIGHT_MAX,
      ),
    ),
    inset: clamp(parseIntOr(source.inset, DEFAULT_STATE.inset), 6, 40),
    aesthetic: AESTHETICS.includes(source.aesthetic)
      ? source.aesthetic
      : DEFAULT_STATE.aesthetic,
    fill: fillStops[0],
    fillStops,
    fillGradientType: sanitizeGradientType(
      source.fillGradientType,
      DEFAULT_STATE.fillGradientType,
    ),
    fillGradientAngle: clamp(
      parseIntOr(source.fillGradientAngle, DEFAULT_STATE.fillGradientAngle),
      0,
      359,
    ),
    fillGradientCenterX: clamp(
      parseIntOr(source.fillGradientCenterX, DEFAULT_STATE.fillGradientCenterX),
      0,
      100,
    ),
    fillGradientCenterY: clamp(
      parseIntOr(source.fillGradientCenterY, DEFAULT_STATE.fillGradientCenterY),
      0,
      100,
    ),
    baseOpacity: clamp(
      parseIntOr(source.baseOpacity, DEFAULT_STATE.baseOpacity),
      0,
      100,
    ),
    textColor: sanitizeHexColor(source.textColor, DEFAULT_STATE.textColor),
    contentOpacity: clamp(
      parseIntOr(source.contentOpacity, DEFAULT_STATE.contentOpacity),
      0,
      100,
    ),
    contentOffsetX: clamp(
      parseFloatOr(source.contentOffsetX, DEFAULT_STATE.contentOffsetX),
      -PART_OFFSET_LIMIT,
      PART_OFFSET_LIMIT,
    ),
    contentOffsetY: clamp(
      parseFloatOr(source.contentOffsetY, DEFAULT_STATE.contentOffsetY),
      -PART_OFFSET_LIMIT,
      PART_OFFSET_LIMIT,
    ),
    contentRotation: clamp(
      parseFloatOr(source.contentRotation, DEFAULT_STATE.contentRotation),
      CONTENT_ROTATION_MIN,
      CONTENT_ROTATION_MAX,
    ),
    shapeOffsetX: clamp(
      parseFloatOr(source.shapeOffsetX, DEFAULT_STATE.shapeOffsetX),
      -PART_OFFSET_LIMIT,
      PART_OFFSET_LIMIT,
    ),
    shapeOffsetY: clamp(
      parseFloatOr(source.shapeOffsetY, DEFAULT_STATE.shapeOffsetY),
      -PART_OFFSET_LIMIT,
      PART_OFFSET_LIMIT,
    ),
    outlineColor: strokeStops[0],
    strokeColor: strokeStops[0],
    strokeStops,
    strokeGradientType: sanitizeGradientType(
      source.strokeGradientType,
      DEFAULT_STATE.strokeGradientType,
    ),
    strokeGradientAngle: clamp(
      parseIntOr(source.strokeGradientAngle, DEFAULT_STATE.strokeGradientAngle),
      0,
      359,
    ),
    strokeGradientCenterX: clamp(
      parseIntOr(source.strokeGradientCenterX, DEFAULT_STATE.strokeGradientCenterX),
      0,
      100,
    ),
    strokeGradientCenterY: clamp(
      parseIntOr(source.strokeGradientCenterY, DEFAULT_STATE.strokeGradientCenterY),
      0,
      100,
    ),
    backColor: sanitizeHexColor(source.backColor, DEFAULT_STATE.backColor),
    outline: clamp(parseIntOr(source.outline, DEFAULT_STATE.outline), 0, 24),
    backLayerEnabled: source.backLayerEnabled !== false,
    backDistance: clamp(
      parseIntOr(source.backDistance, DEFAULT_STATE.backDistance),
      0,
      MAX_BACK_DISTANCE,
    ),
    backAngle: clamp(parseIntOr(source.backAngle, DEFAULT_STATE.backAngle), 0, 359),
    imageData,
    imageName,
    imageWidth,
    imageHeight,
    imageCropEnabled: source.imageCropEnabled === true,
    imageCropX: imageCropDraft.x,
    imageCropY: imageCropDraft.y,
    imageCropSize: imageCropDraft.size,
    imageRotation: clamp(
      parseFloatOr(source.imageRotation, DEFAULT_STATE.imageRotation),
      IMAGE_ROTATION_MIN,
      IMAGE_ROTATION_MAX,
    ),
    imageHue: clamp(
      parseFloatOr(source.imageHue, DEFAULT_STATE.imageHue),
      IMAGE_HUE_MIN,
      IMAGE_HUE_MAX,
    ),
    imageContrast: clamp(
      parseFloatOr(source.imageContrast, DEFAULT_STATE.imageContrast),
      IMAGE_CONTRAST_MIN,
      IMAGE_CONTRAST_MAX,
    ),
    imageBrightness: clamp(
      parseFloatOr(source.imageBrightness, DEFAULT_STATE.imageBrightness),
      IMAGE_BRIGHTNESS_MIN,
      IMAGE_BRIGHTNESS_MAX,
    ),
    imageSilhouette: source.imageSilhouette === true,
    imageSilhouetteColor: sanitizeHexColor(
      source.imageSilhouetteColor,
      DEFAULT_STATE.imageSilhouetteColor,
    ),
    imageEdgeStroke: clamp(
      parseIntOr(source.imageEdgeStroke, DEFAULT_STATE.imageEdgeStroke),
      0,
      IMAGE_EDGE_STROKE_MAX,
    ),
    imageEdgeStrokeColor: sanitizeHexColor(
      source.imageEdgeStrokeColor,
      DEFAULT_STATE.imageEdgeStrokeColor,
    ),
    baseImageData,
    baseImageName,
    baseImageWidth,
    baseImageHeight,
    baseImageCropEnabled: source.baseImageCropEnabled === true,
    baseImageCropX: baseImageCropDraft.x,
    baseImageCropY: baseImageCropDraft.y,
    baseImageCropSize: baseImageCropDraft.size,
    baseImageRotation: clamp(
      parseFloatOr(source.baseImageRotation, DEFAULT_STATE.baseImageRotation),
      IMAGE_ROTATION_MIN,
      IMAGE_ROTATION_MAX,
    ),
    baseImageHue: clamp(
      parseFloatOr(source.baseImageHue, DEFAULT_STATE.baseImageHue),
      IMAGE_HUE_MIN,
      IMAGE_HUE_MAX,
    ),
    baseImageContrast: clamp(
      parseFloatOr(source.baseImageContrast, DEFAULT_STATE.baseImageContrast),
      IMAGE_CONTRAST_MIN,
      IMAGE_CONTRAST_MAX,
    ),
    baseImageBrightness: clamp(
      parseFloatOr(source.baseImageBrightness, DEFAULT_STATE.baseImageBrightness),
      IMAGE_BRIGHTNESS_MIN,
      IMAGE_BRIGHTNESS_MAX,
    ),
    baseImageSilhouette: source.baseImageSilhouette === true,
    baseImageSilhouetteColor: sanitizeHexColor(
      source.baseImageSilhouetteColor,
      DEFAULT_STATE.baseImageSilhouetteColor,
    ),
    baseImageEdgeStroke: clamp(
      parseIntOr(source.baseImageEdgeStroke, DEFAULT_STATE.baseImageEdgeStroke),
      0,
      IMAGE_EDGE_STROKE_MAX,
    ),
    baseImageEdgeStrokeColor: sanitizeHexColor(
      source.baseImageEdgeStrokeColor,
      DEFAULT_STATE.baseImageEdgeStrokeColor,
    ),
  };
}

function getIconMetrics(iconState) {
  const visibleOutline = iconState.outline;
  const fittedFontSize = fitTextSize(iconState, visibleOutline);
  const dimensions = getDimensions(iconState, fittedFontSize, visibleOutline);
  const baseSize = Math.min(dimensions.width, dimensions.height);
  const borderRadius = getShapeRadius(
    iconState.shape,
    dimensions.width,
    dimensions.height,
    iconState.radius,
  );
  const normalizedLucide = normalizeLucideName(iconState.lucide);
  const hasValidLucide =
    iconState.mode !== "icon" || Boolean(dynamicIconImports[normalizedLucide]);
  const iconName =
    iconState.mode === "none"
      ? "none"
      : iconState.mode === "image"
      ? sanitizeFilename(iconState.imageName, "image")
      : hasValidLucide
        ? normalizedLucide
        : DEFAULT_STATE.lucide;
  const iconSafeSize = Math.max(
    12,
    baseSize - (iconState.inset + visibleOutline) * 2,
  );
  const iconScaleBaseSize = iconState.mode === "text" ? iconSafeSize : baseSize;
  const textOpticalOffset =
    iconState.mode === "text" && iconState.iconScale <= 100
      ? getTextOpticalOffset(
          iconState.content || " ",
          fittedFontSize,
          iconState.fontWeight,
          iconState.fontFamily,
        )
      : 0;

  return {
    visibleOutline,
    fittedFontSize,
    dimensions,
    borderRadius,
    offset: getOffset(iconState.backDistance, iconState.backAngle),
    mainSurfaceStyle: getMainSurfaceStyle(iconState, visibleOutline),
    iconSafeSize,
    iconRenderSize: Math.max(
      10,
      Math.round((iconScaleBaseSize * iconState.iconScale) / 100),
    ),
    normalizedLucide,
    hasValidLucide,
    iconName,
    textOpticalOffset,
  };
}

function getCornerPoint(corner, width, height) {
  switch (corner) {
    case "topMiddle":
      return { x: width / 2, y: 0 };
    case "topRight":
      return { x: width, y: 0 };
    case "left":
      return { x: 0, y: height / 2 };
    case "right":
      return { x: width, y: height / 2 };
    case "bottomLeft":
      return { x: 0, y: height };
    case "bottomMiddle":
      return { x: width / 2, y: height };
    case "bottomRight":
      return { x: width, y: height };
    default:
      return { x: 0, y: 0 };
  }
}

function getHotspotFloat(corner, width, height) {
  const anchor = getCornerPoint(corner, width, height);
  const center = { x: width / 2, y: height / 2 };
  const vectorX = anchor.x - center.x;
  const vectorY = anchor.y - center.y;
  const length = Math.max(1, Math.hypot(vectorX, vectorY));
  const directionX = vectorX / length;
  const directionY = vectorY / length;
  const baseDistance = 14;
  const hoverDistance = 24;

  return {
    baseX: Number((directionX * baseDistance).toFixed(2)),
    baseY: Number((directionY * baseDistance).toFixed(2)),
    hoverX: Number((directionX * hoverDistance).toFixed(2)),
    hoverY: Number((directionY * hoverDistance).toFixed(2)),
  };
}

function getParticlePlacement(corner, baseDimensions, particleDimensions, offsetX, offsetY) {
  const anchor = getCornerPoint(corner, baseDimensions.width, baseDimensions.height);
  const left = anchor.x - particleDimensions.width / 2 + offsetX;
  const top = anchor.y - particleDimensions.height / 2 + offsetY;

  return {
    left,
    top,
    centerX: left + particleDimensions.width / 2,
    centerY: top + particleDimensions.height / 2,
  };
}

function createDefaultParticleIcon(baseIcon) {
  return sanitizeIconState({
    ...baseIcon,
    size: clamp(Math.round(baseIcon.size * 0.42), 64, 220),
    shape: baseIcon.shape === "image" || baseIcon.shape === "none" ? "shape" : baseIcon.shape,
    backDistance: 0,
  });
}

function createDefaultParticle(baseIcon, corner) {
  const defaultOffsets = {
    topLeft: { x: -8, y: -8 },
    topMiddle: { x: 0, y: -10 },
    topRight: { x: 8, y: -8 },
    left: { x: -10, y: 0 },
    right: { x: 10, y: 0 },
    bottomLeft: { x: -8, y: 8 },
    bottomMiddle: { x: 0, y: 10 },
    bottomRight: { x: 8, y: 8 },
  };
  const defaultOffset = defaultOffsets[corner] || { x: 0, y: 0 };

  return {
    offsetX: defaultOffset.x,
    offsetY: defaultOffset.y,
    icon: createDefaultParticleIcon(baseIcon),
  };
}

function getCornerLabel(cornerKey) {
  return PARTICLE_CORNERS.find((corner) => corner.key === cornerKey)?.label || cornerKey;
}

function sanitizeParticle(value, baseIcon) {
  const next = value || {};
  return {
    offsetX: clamp(parseIntOr(next.offsetX, 0), -PARTICLE_OFFSET_LIMIT, PARTICLE_OFFSET_LIMIT),
    offsetY: clamp(parseIntOr(next.offsetY, 0), -PARTICLE_OFFSET_LIMIT, PARTICLE_OFFSET_LIMIT),
    icon: sanitizeIconState(next.icon || createDefaultParticleIcon(baseIcon)),
  };
}

function stripImagePayloadFromIconState(iconState) {
  return {
    ...iconState,
    imageData: "",
    imageName: "",
    imageWidth: 0,
    imageHeight: 0,
    imageCropEnabled: false,
    imageCropX: DEFAULT_STATE.imageCropX,
    imageCropY: DEFAULT_STATE.imageCropY,
    imageCropSize: DEFAULT_STATE.imageCropSize,
    imageRotation: DEFAULT_STATE.imageRotation,
    imageHue: DEFAULT_STATE.imageHue,
    imageContrast: DEFAULT_STATE.imageContrast,
    imageBrightness: DEFAULT_STATE.imageBrightness,
    imageSilhouette: DEFAULT_STATE.imageSilhouette,
    imageSilhouetteColor: DEFAULT_STATE.imageSilhouetteColor,
    imageEdgeStroke: DEFAULT_STATE.imageEdgeStroke,
    imageEdgeStrokeColor: DEFAULT_STATE.imageEdgeStrokeColor,
    baseImageData: "",
    baseImageName: "",
    baseImageWidth: 0,
    baseImageHeight: 0,
    baseImageCropEnabled: false,
    baseImageCropX: DEFAULT_STATE.baseImageCropX,
    baseImageCropY: DEFAULT_STATE.baseImageCropY,
    baseImageCropSize: DEFAULT_STATE.baseImageCropSize,
    baseImageRotation: DEFAULT_STATE.baseImageRotation,
    baseImageHue: DEFAULT_STATE.baseImageHue,
    baseImageContrast: DEFAULT_STATE.baseImageContrast,
    baseImageBrightness: DEFAULT_STATE.baseImageBrightness,
    baseImageSilhouette: DEFAULT_STATE.baseImageSilhouette,
    baseImageSilhouetteColor: DEFAULT_STATE.baseImageSilhouetteColor,
    baseImageEdgeStroke: DEFAULT_STATE.baseImageEdgeStroke,
    baseImageEdgeStrokeColor: DEFAULT_STATE.baseImageEdgeStrokeColor,
  };
}

function iconStateUsesImageBacking(iconState) {
  const usesContentImage = iconState.contentEnabled !== false && iconState.mode === "image";
  const usesShapeImage = iconState.shapeEnabled !== false && iconState.shape === "image";
  return usesContentImage || usesShapeImage;
}

function iconStateHasMissingSharedImages(iconState) {
  const usesContentImage = iconState.contentEnabled !== false && iconState.mode === "image";
  const usesShapeImage = iconState.shapeEnabled !== false && iconState.shape === "image";
  return (usesContentImage && !iconState.imageData) || (usesShapeImage && !iconState.baseImageData);
}

function compositionUsesImageBacking(baseState, particles) {
  if (iconStateUsesImageBacking(baseState)) return true;
  return Object.values(particles || {}).some((particle) => iconStateUsesImageBacking(particle.icon));
}

function compositionHasMissingSharedImages(baseState, particles) {
  if (iconStateHasMissingSharedImages(baseState)) return true;
  return Object.values(particles || {}).some((particle) =>
    iconStateHasMissingSharedImages(particle.icon),
  );
}

function encodeIconState(state) {
  return [
    ICON_CODE_VERSION,
    state.mode,
    state.shape,
    encodeURIComponent(state.content),
    normalizeLucideName(state.lucide) || DEFAULT_STATE.lucide,
    Number(state.lucideWeight.toFixed(1)),
    state.size,
    state.widthScale,
    state.radius,
    state.fontSize,
    state.spacing,
    encodeURIComponent(state.fontFamily),
    state.fontWeight,
    state.inset,
    "flat",
    state.fill.replace("#", ""),
    state.textColor.replace("#", ""),
    state.outlineColor.replace("#", ""),
    state.backColor.replace("#", ""),
    state.outline,
    state.backDistance,
    state.backAngle,
    state.linkTextToSize ? 1 : 0,
  ].join("|");
}

function parseIntOr(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseFloatOr(value, fallback) {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function decodeLegacyIconState(code) {
  const parts = code.trim().split("|");
  if (!["IC3", "IC4", "IC5", "IC6"].includes(parts[0])) {
    throw new Error("Unsupported share code format.");
  }

  const hasLucideWeight = ["IC5", "IC6"].includes(parts[0]);
  const hasTextLinkSetting = parts[0] === "IC6";
  const next = {
    mode: normalizeMode(parts[1]),
    shape: SHAPES.includes(parts[2]) ? parts[2] : DEFAULT_STATE.shape,
    content: decodeURIComponent(parts[3] || DEFAULT_STATE.content).slice(0, 12),
    lucide: normalizeLucideName(parts[4] || DEFAULT_STATE.lucide) || DEFAULT_STATE.lucide,
    lucideWeight: hasLucideWeight
      ? clamp(
          parseFloatOr(parts[5], DEFAULT_STATE.lucideWeight),
          LUCIDE_WEIGHT_MIN,
          LUCIDE_WEIGHT_MAX,
        )
      : DEFAULT_STATE.lucideWeight,
    size: clamp(
      parseIntOr(parts[hasLucideWeight ? 6 : 5], DEFAULT_STATE.size),
      ICON_BASE_SIZE_MIN,
      ICON_BASE_SIZE_MAX,
    ),
    widthScale: clamp(
      parseIntOr(parts[hasLucideWeight ? 7 : 6], DEFAULT_STATE.widthScale),
      100,
      260,
    ),
    radius: clamp(parseIntOr(parts[hasLucideWeight ? 8 : 7], DEFAULT_STATE.radius), 0, 80),
    fontSize: clamp(
      parseIntOr(parts[hasLucideWeight ? 9 : 8], DEFAULT_STATE.fontSize),
      16,
      180,
    ),
    linkTextToSize: hasTextLinkSetting ? parts[22] !== "0" : DEFAULT_STATE.linkTextToSize,
    spacing: clamp(parseIntOr(parts[hasLucideWeight ? 10 : 9], DEFAULT_STATE.spacing), 0, 20),
    fontFamily: decodeURIComponent(parts[hasLucideWeight ? 11 : 10] || DEFAULT_STATE.fontFamily),
    fontWeight: parts[hasLucideWeight ? 12 : 11] || DEFAULT_STATE.fontWeight,
    inset: clamp(parseIntOr(parts[hasLucideWeight ? 13 : 12], DEFAULT_STATE.inset), 6, 40),
    aesthetic: AESTHETICS.includes(parts[hasLucideWeight ? 14 : 13])
      ? parts[hasLucideWeight ? 14 : 13]
      : DEFAULT_STATE.aesthetic,
    fill: `#${(parts[hasLucideWeight ? 15 : 14] || DEFAULT_STATE.fill.slice(1)).slice(0, 6)}`,
    textColor: `#${(parts[hasLucideWeight ? 16 : 15] || DEFAULT_STATE.textColor.slice(1)).slice(0, 6)}`,
    outlineColor: `#${(parts[hasLucideWeight ? 17 : 16] || DEFAULT_STATE.outlineColor.slice(1)).slice(0, 6)}`,
    backColor: `#${(parts[hasLucideWeight ? 18 : 17] || DEFAULT_STATE.backColor.slice(1)).slice(0, 6)}`,
    outline: clamp(parseIntOr(parts[hasLucideWeight ? 19 : 18], DEFAULT_STATE.outline), 0, 24),
    backDistance: clamp(
      parseIntOr(parts[hasLucideWeight ? 20 : 19], DEFAULT_STATE.backDistance),
      0,
      MAX_BACK_DISTANCE,
    ),
    backAngle: clamp(parseIntOr(parts[hasLucideWeight ? 21 : 20], DEFAULT_STATE.backAngle), 0, 359),
  };

  return sanitizeIconState(next);
}

function valuesMatchForEncoding(left, right) {
  if (Array.isArray(left) && Array.isArray(right)) {
    if (left.length !== right.length) return false;
    for (let index = 0; index < left.length; index += 1) {
      if (left[index] !== right[index]) return false;
    }
    return true;
  }
  return left === right;
}

function compactIconState(state) {
  const compact = {};
  for (const [field, token] of COMPACT_ICON_FIELDS) {
    if (valuesMatchForEncoding(state[field], DEFAULT_STATE[field])) continue;
    compact[token] = state[field];
  }
  return compact;
}

function expandCompactIconState(compactState) {
  const expanded = {};
  if (!compactState || typeof compactState !== "object" || Array.isArray(compactState)) {
    return expanded;
  }

  for (const [token, field] of Object.entries(COMPACT_TOKEN_TO_ICON_FIELD)) {
    if (!Object.prototype.hasOwnProperty.call(compactState, token)) continue;
    expanded[field] = compactState[token];
  }
  return expanded;
}

function encodeBase64Url(text) {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  const chunkSize = 0x8000;
  for (let index = 0; index < bytes.length; index += chunkSize) {
    const chunk = bytes.subarray(index, index + chunkSize);
    binary += String.fromCharCode(...chunk);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function decodeBase64Url(value) {
  const normalized = String(value || "").replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return new TextDecoder().decode(bytes);
}

function safeDecodeURIComponent(value) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function isShareCodeFormat(value) {
  return /^IC\d+\|/.test(String(value || "").trim());
}

function normalizeBasePath(value) {
  const trimmed = String(value || "").trim();
  if (!trimmed) return "/";
  const withLeadingSlash = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return withLeadingSlash.endsWith("/") ? withLeadingSlash : `${withLeadingSlash}/`;
}

function getCanonicalBasePath(basePath) {
  const runtimeBasePath = basePath ?? import.meta.env?.BASE_URL ?? "/";
  return normalizeBasePath(runtimeBasePath);
}

function normalizePathnameForMatch(value) {
  const rawValue = String(value || "").trim();
  if (!rawValue || rawValue === "/") return "/";
  const withLeadingSlash = rawValue.startsWith("/") ? rawValue : `/${rawValue}`;
  const collapsed = withLeadingSlash.replace(/\/{2,}/g, "/");
  return collapsed.length > 1 ? collapsed.replace(/\/+$/, "") : collapsed;
}

function getSharePath(destination = "editor", basePath) {
  const canonicalBasePath = getCanonicalBasePath(basePath);
  if (destination === "copiedLink") {
    const baseWithoutTrailingSlash =
      canonicalBasePath === "/" ? "" : canonicalBasePath.replace(/\/$/, "");
    return `${baseWithoutTrailingSlash}/copied-link`;
  }
  return canonicalBasePath;
}

function resolvePageModeFromUrl(url, options = {}) {
  const normalizedPathname = normalizePathnameForMatch(url?.pathname);
  const copiedLinkPath = normalizePathnameForMatch(
    getSharePath("copiedLink", options.basePath),
  );
  return normalizedPathname === copiedLinkPath ? "copiedLink" : "editor";
}

function resolveWorkspaceModeFromUrl(url) {
  const mode = String(url?.searchParams?.get("view") || url?.searchParams?.get("mode") || "")
    .trim()
    .toLowerCase();
  return mode === "editor" ? "editor" : "wizard";
}

function extractShareCodeFromSearch(url) {
  const namedSearchCode = url.searchParams.get("code") || url.searchParams.get("c");
  if (isShareCodeFormat(namedSearchCode)) return namedSearchCode.trim();

  // Supports legacy links shaped like /code?=IC10|...
  const unnamedSearchCode = url.searchParams.get("");
  if (isShareCodeFormat(unnamedSearchCode)) return unnamedSearchCode.trim();

  const rawSearch = String(url.search || "")
    .replace(/^\?/, "")
    .trim();
  if (rawSearch && !rawSearch.includes("=")) {
    const decodedSearch = safeDecodeURIComponent(rawSearch).trim();
    if (isShareCodeFormat(decodedSearch)) return decodedSearch;
  }

  return "";
}

function extractShareCodeFromUrl(url) {
  const searchCode = extractShareCodeFromSearch(url);
  if (searchCode) return searchCode;

  const rawHash = url.hash.startsWith("#") ? url.hash.slice(1) : url.hash;
  if (rawHash) {
    const decodedHash = safeDecodeURIComponent(rawHash).trim();
    if (isShareCodeFormat(decodedHash)) return decodedHash;
    const hashParams = new URLSearchParams(decodedHash);
    const hashCode = hashParams.get("code") || hashParams.get("c");
    if (isShareCodeFormat(hashCode)) return hashCode.trim();
  }

  const pathSegments = url.pathname.split("/").filter(Boolean);
  for (let index = pathSegments.length - 1; index >= 0; index -= 1) {
    const decodedSegment = safeDecodeURIComponent(pathSegments[index]).trim();
    if (isShareCodeFormat(decodedSegment)) return decodedSegment;
  }

  return "";
}

function resolveShareCodeInput(input) {
  const trimmed = String(input || "").trim();
  if (!trimmed) return "";
  if (isShareCodeFormat(trimmed)) return trimmed;

  try {
    const url = new URL(trimmed);
    const codeFromUrl = extractShareCodeFromUrl(url);
    if (codeFromUrl) return codeFromUrl;
  } catch {
    // not a URL, continue
  }

  const inlineCodeMatch = trimmed.match(/IC\d+\|[^\s]+/);
  return inlineCodeMatch ? inlineCodeMatch[0] : trimmed;
}

function resolveUrlHydration(url, fallbackCode, options = {}) {
  const pageMode = resolvePageModeFromUrl(url, options);
  const codeFromUrl = extractShareCodeFromUrl(url);
  if (!codeFromUrl) {
    return { status: "missing", shareCode: fallbackCode, pageMode };
  }

  try {
    const decoded = decodeState(codeFromUrl);
    return {
      status: "valid",
      shareCode: codeFromUrl,
      decoded,
      missingSharedImages: compositionHasMissingSharedImages(
        decoded.base,
        decoded.particles,
      ),
      pageMode,
    };
  } catch {
    return {
      status: "invalid",
      invalidCode: codeFromUrl,
      shareCode: fallbackCode,
      pageMode,
    };
  }
}

function createShareUrl(code, options = {}) {
  const hasWindow = typeof window !== "undefined";
  const currentUrl =
    options.currentUrl || (hasWindow ? window.location.href : "https://example.com/");
  const fallbackOrigin = hasWindow ? window.location.origin : "https://example.com";
  const url = new URL(currentUrl, fallbackOrigin);

  url.pathname = getSharePath(options.destination || "editor", options.basePath);
  url.search = "";
  if (code) {
    url.searchParams.set("code", code);
  }
  if (options.view === "editor" && options.destination !== "copiedLink") {
    url.searchParams.set("view", "editor");
  }
  url.hash = "";
  return url.toString();
}

function encodeState(base, particles, canvasSize, options = {}) {
  const safeBaseState = sanitizeIconState(base);
  const urlSafe = options.urlSafe === true;
  const safeBase = urlSafe ? stripImagePayloadFromIconState(safeBaseState) : safeBaseState;
  const safeCanvasSize = clamp(
    parseIntOr(canvasSize, DEFAULT_CANVAS_SIZE),
    CANVAS_SIZE_MIN,
    CANVAS_SIZE_MAX,
  );
  const compactParticles = [];

  for (const corner of PARTICLE_CORNERS) {
    if (!particles[corner.key]) continue;
    const safeParticleState = sanitizeParticle(particles[corner.key], safeBase);
    const safeParticle = urlSafe
      ? {
          ...safeParticleState,
          icon: stripImagePayloadFromIconState(safeParticleState.icon),
        }
      : safeParticleState;
    const entry = [
      PARTICLE_CORNER_TO_INDEX[corner.key],
      safeParticle.offsetX,
      safeParticle.offsetY,
    ];
    const compactParticleIcon = compactIconState(safeParticle.icon);
    if (Object.keys(compactParticleIcon).length > 0) {
      entry.push(compactParticleIcon);
    }
    compactParticles.push(entry);
  }

  const payload = {
    version: SHARE_CODE_VERSION,
    b: compactIconState(safeBase),
  };
  if (safeCanvasSize !== DEFAULT_CANVAS_SIZE) payload.c = safeCanvasSize;
  if (compactParticles.length > 0) payload.p = compactParticles;

  return `${SHARE_CODE_VERSION}|${encodeBase64Url(JSON.stringify(payload))}`;
}

function decodeState(code) {
  const trimmed = code.trim();
  if (!trimmed) throw new Error("Code is empty.");

  const [version, ...rest] = trimmed.split("|");

  if ([SHARE_CODE_VERSION, "IC10", "IC9"].includes(version)) {
    const parsed = JSON.parse(decodeBase64Url(rest.join("|")));
    const base = sanitizeIconState(expandCompactIconState(parsed?.b));
    const canvasSize = clamp(
      parseIntOr(parsed?.c, DEFAULT_CANVAS_SIZE),
      CANVAS_SIZE_MIN,
      CANVAS_SIZE_MAX,
    );
    const particles = {};
    if (Array.isArray(parsed?.p)) {
      for (const entry of parsed.p) {
        if (!Array.isArray(entry) || entry.length < 3) continue;
        const cornerKey = PARTICLE_INDEX_TO_CORNER[parseIntOr(entry[0], -1)];
        if (!cornerKey) continue;
        const source = {
          offsetX: entry[1],
          offsetY: entry[2],
        };
        if (entry[3] && typeof entry[3] === "object" && !Array.isArray(entry[3])) {
          const expandedParticleIcon = expandCompactIconState(entry[3]);
          if (Object.keys(expandedParticleIcon).length > 0) {
            source.icon = expandedParticleIcon;
          }
        }
        particles[cornerKey] = sanitizeParticle(source, base);
      }
    }
    return { version, base, particles, canvasSize };
  }

  if (["IC8", "IC7"].includes(version)) {
    const decodedPayload = decodeURIComponent(rest.join("|"));
    const parsed = JSON.parse(decodedPayload);
    const base = sanitizeIconState(parsed?.base);
    const canvasSize = clamp(
      parseIntOr(parsed?.canvasSize, DEFAULT_CANVAS_SIZE),
      CANVAS_SIZE_MIN,
      CANVAS_SIZE_MAX,
    );
    const particles = {};
    for (const corner of PARTICLE_CORNERS) {
      if (!parsed?.particles?.[corner.key]) continue;
      particles[corner.key] = sanitizeParticle(parsed.particles[corner.key], base);
    }
    return { version, base, particles, canvasSize };
  }

  const base = decodeLegacyIconState(trimmed);
  return { version, base, particles: {}, canvasSize: DEFAULT_CANVAS_SIZE };
}

function sanitizeParticlesMap(particles, base) {
  const safeParticles = {};
  for (const corner of PARTICLE_CORNERS) {
    if (!particles?.[corner.key]) continue;
    safeParticles[corner.key] = sanitizeParticle(particles[corner.key], base);
  }
  return safeParticles;
}

function createProjectPayload(base, particles, canvasSize, options = {}) {
  const safeBase = sanitizeIconState(base);
  const safeCanvasSize = clamp(
    parseIntOr(canvasSize, DEFAULT_CANVAS_SIZE),
    CANVAS_SIZE_MIN,
    CANVAS_SIZE_MAX,
  );
  const metadata = {
    title: String(options.title || "Untitled Iquan icon").slice(0, 80),
  };
  if (options.createdAt) metadata.createdAt = options.createdAt;

  return {
    version: PROJECT_FILE_VERSION,
    app: "iquan",
    metadata,
    canvasSize: safeCanvasSize,
    base: safeBase,
    particles: sanitizeParticlesMap(particles, safeBase),
  };
}

function encodeProjectPayload(base, particles, canvasSize, options = {}) {
  return JSON.stringify(createProjectPayload(base, particles, canvasSize, options), null, 2);
}

function decodeProjectPayload(input) {
  const parsed = typeof input === "string" ? JSON.parse(input) : input;
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("Project file is empty.");
  }
  if (parsed.version !== PROJECT_FILE_VERSION || parsed.app !== "iquan") {
    throw new Error("Unsupported Iquan project file.");
  }

  const base = sanitizeIconState(parsed.base);
  const canvasSize = clamp(
    parseIntOr(parsed.canvasSize, DEFAULT_CANVAS_SIZE),
    CANVAS_SIZE_MIN,
    CANVAS_SIZE_MAX,
  );

  return {
    version: parsed.version,
    metadata: parsed.metadata || {},
    base,
    particles: sanitizeParticlesMap(parsed.particles, base),
    canvasSize,
  };
}

function decodeProjectOrShareInput(input) {
  const trimmed = String(input || "").trim();
  if (!trimmed) throw new Error("Code is empty.");
  if (trimmed.startsWith("{")) return decodeProjectPayload(trimmed);

  const resolvedCode = resolveShareCodeInput(trimmed);
  return decodeState(resolvedCode);
}

const IQUAN_LOGO_CODE = encodeState(
  sanitizeIconState({
    ...DEFAULT_STATE,
    mode: "text",
    content: "iq",
    shape: "square",
    size: 172,
    radius: 34,
    fontSize: 58,
    fontWeight: "900",
    fillStops: ["#f8fafc", "#dbeafe"],
    strokeStops: ["#111827"],
    textColor: "#111827",
    outline: 7,
    backColor: "#94a3b8",
    backDistance: 10,
    backAngle: 35,
  }),
  {},
  DEFAULT_CANVAS_SIZE,
);

function getIconVisualBounds(iconState, metrics) {
  const visibleBounds = [];

  if (isInspectPartVisible(iconState, "base")) {
    visibleBounds.push({
      minX: iconState.shapeOffsetX,
      minY: iconState.shapeOffsetY,
      maxX: iconState.shapeOffsetX + metrics.dimensions.width,
      maxY: iconState.shapeOffsetY + metrics.dimensions.height,
    });
  }

  const contentBounds = isInspectPartVisible(iconState, "content")
    ? getInspectContentBounds(iconState, metrics)
    : null;

  if (contentBounds) {
    visibleBounds.push({
      minX: contentBounds.left,
      minY: contentBounds.top,
      maxX: contentBounds.left + contentBounds.width,
      maxY: contentBounds.top + contentBounds.height,
    });
  }

  if (isInspectPartVisible(iconState, "back")) {
    const backMinX = metrics.offset.x + iconState.shapeOffsetX;
    const backMinY = metrics.offset.y + iconState.shapeOffsetY;
    visibleBounds.push({
      minX: backMinX,
      minY: backMinY,
      maxX: backMinX + metrics.dimensions.width,
      maxY: backMinY + metrics.dimensions.height,
    });
  }

  if (visibleBounds.length === 0) {
    return {
      minX: 0,
      minY: 0,
      maxX: metrics.dimensions.width,
      maxY: metrics.dimensions.height,
    };
  }

  return {
    minX: Math.min(...visibleBounds.map((bounds) => bounds.minX)),
    minY: Math.min(...visibleBounds.map((bounds) => bounds.minY)),
    maxX: Math.max(...visibleBounds.map((bounds) => bounds.maxX)),
    maxY: Math.max(...visibleBounds.map((bounds) => bounds.maxY)),
  };
}

function getCompositeBounds(baseState, baseMetrics, particleLayers) {
  const baseBounds = getIconVisualBounds(baseState, baseMetrics);
  let minX = baseBounds.minX;
  let minY = baseBounds.minY;
  let maxX = baseBounds.maxX;
  let maxY = baseBounds.maxY;

  for (const layer of particleLayers) {
    const { placement, metrics } = layer;
    const iconBounds = getIconVisualBounds(layer.particle.icon, metrics);
    const layerMinX = placement.left + iconBounds.minX;
    const layerMinY = placement.top + iconBounds.minY;
    const layerMaxX = placement.left + iconBounds.maxX;
    const layerMaxY = placement.top + iconBounds.maxY;
    minX = Math.min(minX, layerMinX);
    minY = Math.min(minY, layerMinY);
    maxX = Math.max(maxX, layerMaxX);
    maxY = Math.max(maxY, layerMaxY);
  }

  return { minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY };
}

function getCompositionLayout(bounds, targetWidth, targetHeight, safeMargin, allowUpscale) {
  const availableWidth = Math.max(1, targetWidth - safeMargin * 2);
  const availableHeight = Math.max(1, targetHeight - safeMargin * 2);
  const fitScale = Math.min(
    availableWidth / Math.max(1, bounds.width),
    availableHeight / Math.max(1, bounds.height),
  );
  const scale = allowUpscale ? fitScale : Math.min(1, fitScale);

  return {
    scale,
    offsetX: (targetWidth - bounds.width * scale) / 2 - bounds.minX * scale,
    offsetY: (targetHeight - bounds.height * scale) / 2 - bounds.minY * scale,
  };
}

function getContextScale(targetSize, bounds) {
  return targetSize / Math.max(1, Math.max(bounds.width, bounds.height));
}

function buildParticleLayers(baseMetrics, particles) {
  const layers = [];
  for (const corner of PARTICLE_CORNERS) {
    const particle = particles[corner.key];
    if (!particle) continue;
    const metrics = getIconMetrics(particle.icon);
    const placement = getParticlePlacement(
      corner.key,
      baseMetrics.dimensions,
      metrics.dimensions,
      particle.offsetX,
      particle.offsetY,
    );

    layers.push({
      ...corner,
      particle,
      metrics,
      placement,
    });
  }
  return layers;
}

function buildCornerPoints(baseMetrics) {
  return PARTICLE_CORNERS.map((corner) => ({
    ...corner,
    point: getCornerPoint(
      corner.key,
      baseMetrics.dimensions.width,
      baseMetrics.dimensions.height,
    ),
    float: getHotspotFloat(
      corner.key,
      baseMetrics.dimensions.width,
      baseMetrics.dimensions.height,
    ),
  }));
}

function getInspectTargetId(target, part) {
  const targetId = target.type === "particle" ? `particle:${target.corner}` : "base";
  return `${targetId}:${part}`;
}

function getInspectTargetDisplayName(target, part) {
  const ownerLabel =
    target.type === "particle" ? `${getCornerLabel(target.corner)} particle` : "Base";
  const partLabel = INSPECT_PARTS.find((option) => option.id === part)?.label || "Part";
  return `${ownerLabel} ${partLabel.toLowerCase()}`;
}

function isInspectPartVisible(iconState, part) {
  if (part === "content") {
    return iconState.contentEnabled && iconState.mode !== "none";
  }

  if (part === "base") {
    return iconState.shapeEnabled && iconState.shape !== "none";
  }

  if (part === "back") {
    return (
      iconState.shapeEnabled &&
      iconState.shape !== "none" &&
      iconState.backLayerEnabled &&
      iconState.backDistance > 0
    );
  }

  return false;
}

function getInspectContentBounds(iconState, metrics) {
  const { width, height } = metrics.dimensions;

  if (iconState.mode === "image") {
    const inset = iconState.inset + metrics.visibleOutline;
    return {
      left: inset + iconState.contentOffsetX,
      top: inset + iconState.contentOffsetY,
      width: Math.max(10, width - inset * 2),
      height: Math.max(10, height - inset * 2),
      radius: Math.max(8, metrics.borderRadius - inset),
    };
  }

  if (iconState.mode === "text") {
    const textWidth = measureTextWidth(
      iconState.content || " ",
      metrics.fittedFontSize,
      iconState.fontWeight,
      iconState.fontFamily,
      iconState.spacing,
    );
    const boundWidth = clamp(textWidth, 16, width);
    const boundHeight = clamp(metrics.fittedFontSize * 1.08, 16, height);
    return {
      left: (width - boundWidth) / 2 + iconState.contentOffsetX,
      top: (height - boundHeight) / 2 + iconState.contentOffsetY,
      width: boundWidth,
      height: boundHeight,
      radius: Math.min(12, boundHeight / 2),
    };
  }

  const contentSize = Math.min(metrics.iconRenderSize, Math.max(width, height));
  return {
    left: (width - contentSize) / 2 + iconState.contentOffsetX,
    top: (height - contentSize) / 2 + iconState.contentOffsetY,
    width: contentSize,
    height: contentSize,
    radius: Math.min(14, contentSize / 2),
  };
}

function getInspectPartBounds(iconState, metrics, part) {
  if (part === "content") {
    return getInspectContentBounds(iconState, metrics);
  }

  if (part === "back") {
    return {
      left: metrics.offset.x + iconState.shapeOffsetX,
      top: metrics.offset.y + iconState.shapeOffsetY,
      width: metrics.dimensions.width,
      height: metrics.dimensions.height,
      radius: metrics.borderRadius,
    };
  }

  return {
    left: iconState.shapeOffsetX,
    top: iconState.shapeOffsetY,
    width: metrics.dimensions.width,
    height: metrics.dimensions.height,
    radius: metrics.borderRadius,
  };
}

function buildInspectTargetsForIcon(target, iconState, metrics) {
  return INSPECT_PARTS.filter((part) => isInspectPartVisible(iconState, part.id)).map((part) => ({
    id: getInspectTargetId(target, part.id),
    label: getInspectTargetDisplayName(target, part.id),
    target,
    part: part.id,
    section: part.section,
    bounds: getInspectPartBounds(iconState, metrics, part.id),
  }));
}

function createHeroParticle(iconPatch, offsetX = 0, offsetY = 0) {
  return {
    offsetX,
    offsetY,
    icon: sanitizeIconState({
      ...DEFAULT_STATE,
      ...iconPatch,
    }),
  };
}

function applyHeroIconVariation(iconState) {
  if (iconState.mode !== "icon") {
    return sanitizeIconState(iconState);
  }

  const lucideWeightChoices = [0.9, 1.2, 1.6, 2.1, 2.8, 3.8, 5.1, 6.8];
  const iconScaleDeltaChoices = [-8, -4, 0, 4, 8];
  const outlineDeltaChoices = [-1, 0, 1, 2];
  const weightChoice =
    lucideWeightChoices[Math.floor(Math.random() * lucideWeightChoices.length)] ||
    iconState.lucideWeight;
  const iconScaleDelta =
    iconScaleDeltaChoices[Math.floor(Math.random() * iconScaleDeltaChoices.length)] || 0;
  const outlineDelta =
    outlineDeltaChoices[Math.floor(Math.random() * outlineDeltaChoices.length)] || 0;

  return sanitizeIconState({
    ...iconState,
    lucideWeight: clamp(weightChoice, LUCIDE_WEIGHT_MIN, LUCIDE_WEIGHT_MAX),
    iconScale: clamp(
      parseIntOr(iconState.iconScale, DEFAULT_STATE.iconScale) + iconScaleDelta,
      ICON_SCALE_MIN,
      ICON_SCALE_MAX,
    ),
    outline: clamp(parseIntOr(iconState.outline, DEFAULT_STATE.outline) + outlineDelta, 0, 24),
  });
}

function createHeroSampleState(blueprint) {
  const sampleBase = blueprint.base || blueprint;
  const normalized = sanitizeIconState({
    ...DEFAULT_STATE,
    ...sampleBase,
    iconScale:
      sampleBase.mode === "icon"
        ? parseIntOr(sampleBase.iconScale, 74)
        : parseIntOr(sampleBase.iconScale, DEFAULT_STATE.iconScale),
  });
  return applyHeroIconVariation(normalized);
}

function createHeroSampleItem(index, previousBlueprintKey = "") {
  const availableBlueprints = HERO_SAMPLE_BLUEPRINTS.filter(
    (blueprint) => blueprint.key !== previousBlueprintKey,
  );
  const source = availableBlueprints.length > 0 ? availableBlueprints : HERO_SAMPLE_BLUEPRINTS;
  const blueprint = source[Math.floor(Math.random() * source.length)] || HERO_SAMPLE_BLUEPRINTS[0];

  return {
    id: `hero-sample-${index}-${Math.random().toString(36).slice(2, 10)}`,
    blueprintKey: blueprint.key,
    state: createHeroSampleState(blueprint),
    particles: blueprint.particles || {},
  };
}

function createInitialHeroSamples() {
  const shuffledBlueprints = [...HERO_SAMPLE_BLUEPRINTS].sort(() => Math.random() - 0.5);
  return HERO_SAMPLE_LAYOUT.map((_, index) => {
    const blueprint = shuffledBlueprints[index % shuffledBlueprints.length];
    return {
      id: `hero-sample-${index}-${Math.random().toString(36).slice(2, 10)}`,
      blueprintKey: blueprint.key,
      state: createHeroSampleState(blueprint),
      particles: blueprint.particles || {},
    };
  });
}

const MODAL_FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "textarea:not([disabled])",
  "input:not([disabled]):not([type='hidden'])",
  "select:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(", ");

function getFocusableNodes(container) {
  if (!container) return [];
  return Array.from(container.querySelectorAll(MODAL_FOCUSABLE_SELECTOR)).filter(
    (node) => !node.hasAttribute("disabled") && node.getAttribute("aria-hidden") !== "true",
  );
}

function isEditableKeyTarget(target) {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  const tagName = target.tagName;
  return tagName === "INPUT" || tagName === "TEXTAREA" || tagName === "SELECT";
}

function getPointerViewBoxPoint(event, element, width, height = width) {
  const rect = element.getBoundingClientRect();
  return {
    x: ((event.clientX - rect.left) / Math.max(1, rect.width)) * width,
    y: ((event.clientY - rect.top) / Math.max(1, rect.height)) * height,
  };
}

function BackLayerWheel({
  angle,
  distance,
  onChange,
  lockDistance,
  lockAngle,
  onLockDistanceChange,
  onLockAngleChange,
}) {
  const wheelRef = useRef(null);
  const draggingRef = useRef(false);

  const size = 186;
  const radius = 72;
  const center = size / 2;

  const angleRadians = (angle * Math.PI) / 180;
  const knobDistance = (distance / MAX_BACK_DISTANCE) * radius;
  const knobX = center + Math.cos(angleRadians) * knobDistance;
  const knobY = center + Math.sin(angleRadians) * knobDistance;

  const updateFromPointer = (event) => {
    if (!wheelRef.current) return;
    const pointer = getPointerViewBoxPoint(event, wheelRef.current, size);
    const x = pointer.x - center;
    const y = pointer.y - center;
    const rawDistance = Math.hypot(x, y);
    const clampedDistance = Math.min(rawDistance, radius);
    const nextDistance = Math.round((clampedDistance / radius) * MAX_BACK_DISTANCE);
    const nextAngle = Math.round(((Math.atan2(y, x) * 180) / Math.PI + 360) % 360);
    onChange(nextDistance, nextAngle);
  };

  const handlePointerDown = (event) => {
    draggingRef.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    updateFromPointer(event);
  };

  const handlePointerMove = (event) => {
    if (!draggingRef.current) return;
    updateFromPointer(event);
  };

  const handlePointerUp = (event) => {
    draggingRef.current = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const handleWheelKeyDown = (event) => {
    const distanceStep = event.shiftKey ? 4 : 1;
    const angleStep = event.shiftKey ? 15 : 5;
    let nextDistance = distance;
    let nextAngle = angle;

    if (event.key === "ArrowUp" && !lockDistance) {
      nextDistance = clamp(distance + distanceStep, 0, MAX_BACK_DISTANCE);
    } else if (event.key === "ArrowDown" && !lockDistance) {
      nextDistance = clamp(distance - distanceStep, 0, MAX_BACK_DISTANCE);
    } else if (event.key === "ArrowRight" && !lockAngle) {
      nextAngle = (angle + angleStep) % 360;
    } else if (event.key === "ArrowLeft" && !lockAngle) {
      nextAngle = (angle - angleStep + 360) % 360;
    } else if (event.key === "Home" && !lockDistance) {
      nextDistance = 0;
    } else if (event.key === "End" && !lockDistance) {
      nextDistance = MAX_BACK_DISTANCE;
    } else {
      return;
    }

    event.preventDefault();
    onChange(nextDistance, nextAngle);
  };

  return (
    <div className="wheel-layout">
      <div
        ref={wheelRef}
        className="wheel"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        role="group"
        tabIndex={0}
        aria-label="Back layer position wheel"
        aria-description="Arrow keys move the back layer. Up and down change distance. Left and right change angle."
        onKeyDown={handleWheelKeyDown}
      >
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
          <circle cx={center} cy={center} r={radius} className="wheel-ring" />
          <circle cx={center} cy={center} r={radius * 0.67} className="wheel-ring-muted" />
          <line
            x1={center - radius}
            y1={center}
            x2={center + radius}
            y2={center}
            className="wheel-axis"
          />
          <line
            x1={center}
            y1={center - radius}
            x2={center}
            y2={center + radius}
            className="wheel-axis"
          />
          <line x1={center} y1={center} x2={knobX} y2={knobY} className="wheel-line" />
          <circle cx={knobX} cy={knobY} r="8" className="wheel-knob" />
          <circle cx={center} cy={center} r="5" className="wheel-center" />
        </svg>
      </div>
      <div className="wheel-values">
        <label>
          Distance
          <input
            type="number"
            min={0}
            max={MAX_BACK_DISTANCE}
            value={distance}
            disabled={lockDistance}
            onChange={(event) =>
              onChange(clamp(parseIntOr(event.target.value, 0), 0, MAX_BACK_DISTANCE), angle)
            }
          />
        </label>
        <label>
          Angle
          <input
            type="number"
            min={0}
            max={359}
            value={angle}
            disabled={lockAngle}
            onChange={(event) =>
              onChange(distance, clamp(parseIntOr(event.target.value, 0), 0, 359))
            }
          />
        </label>
        <div className="wheel-locks">
          <label className="lock-toggle">
            <input
              type="checkbox"
              checked={lockDistance}
              onChange={(event) => onLockDistanceChange(event.target.checked)}
            />
            <span>Lock distance</span>
          </label>
          <label className="lock-toggle">
            <input
              type="checkbox"
              checked={lockAngle}
              onChange={(event) => onLockAngleChange(event.target.checked)}
            />
            <span>Lock angle</span>
          </label>
        </div>
      </div>
    </div>
  );
}

function ContentZoneControl({ iconState, metrics, onChange, onReset }) {
  const zoneRef = useRef(null);
  const draggingRef = useRef(false);
  const size = 186;
  const padding = 14;
  const center = size / 2;
  const dimensions = metrics.dimensions;
  const zoneScale = Math.min(
    (size - padding * 2) / Math.max(1, dimensions.width),
    (size - padding * 2) / Math.max(1, dimensions.height),
  );
  const zoneWidth = Math.max(1, dimensions.width * zoneScale);
  const zoneHeight = Math.max(1, dimensions.height * zoneScale);
  const zoneLeft = center - zoneWidth / 2;
  const zoneTop = center - zoneHeight / 2;
  const maxOffsetX = Math.max(1, dimensions.width / 2);
  const maxOffsetY = Math.max(1, dimensions.height / 2);
  const safeOffsetX = clamp(iconState.contentOffsetX, -maxOffsetX, maxOffsetX);
  const safeOffsetY = clamp(iconState.contentOffsetY, -maxOffsetY, maxOffsetY);
  const knobX = center + safeOffsetX * zoneScale;
  const knobY = center + safeOffsetY * zoneScale;
  const isFolder = iconState.shapeEnabled && iconState.shape === "folder";
  const isCircle =
    iconState.shape === "shape" &&
    Math.abs(dimensions.width - dimensions.height) <= 2 &&
    metrics.borderRadius >= Math.min(dimensions.width, dimensions.height) / 2 - 1;
  const zoneRadius = isCircle
    ? zoneWidth / 2
    : Math.min(metrics.borderRadius * zoneScale, Math.min(zoneWidth, zoneHeight) / 2);

  const applyOffset = (x, y) => {
    onChange(
      clamp(Number(x.toFixed(2)), -maxOffsetX, maxOffsetX),
      clamp(Number(y.toFixed(2)), -maxOffsetY, maxOffsetY),
    );
  };

  const updateFromPointer = (event) => {
    if (!zoneRef.current) return;
    const pointer = getPointerViewBoxPoint(event, zoneRef.current, size);
    const x = (pointer.x - center) / zoneScale;
    const y = (pointer.y - center) / zoneScale;
    applyOffset(x, y);
  };

  const handlePointerDown = (event) => {
    draggingRef.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    updateFromPointer(event);
  };

  const handlePointerMove = (event) => {
    if (!draggingRef.current) return;
    updateFromPointer(event);
  };

  const handlePointerUp = (event) => {
    draggingRef.current = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const handleZoneKeyDown = (event) => {
    const step = event.shiftKey ? 8 : 1;
    let nextX = iconState.contentOffsetX;
    let nextY = iconState.contentOffsetY;

    if (event.key === "ArrowUp") {
      nextY -= step;
    } else if (event.key === "ArrowDown") {
      nextY += step;
    } else if (event.key === "ArrowLeft") {
      nextX -= step;
    } else if (event.key === "ArrowRight") {
      nextX += step;
    } else if (event.key === "Home") {
      nextX = 0;
      nextY = 0;
    } else {
      return;
    }

    event.preventDefault();
    applyOffset(nextX, nextY);
  };

  return (
    <div className="zone-layout">
      <div
        ref={zoneRef}
        className="zone"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        role="group"
        tabIndex={0}
        aria-label="Content Zone"
        aria-description="Arrow keys move content inside the base zone."
        onKeyDown={handleZoneKeyDown}
      >
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
          {isFolder ? (
            <path
              d={getFolderPath(
                zoneWidth,
                zoneHeight,
                zoneRadius,
                iconState.folderTabX,
                iconState.folderTabWidth,
                iconState.folderTabHeight,
                1,
              )}
              transform={`translate(${zoneLeft} ${zoneTop})`}
              className="zone-shape"
            />
          ) : (
            <rect
              x={zoneLeft}
              y={zoneTop}
              width={zoneWidth}
              height={zoneHeight}
              rx={zoneRadius}
              ry={zoneRadius}
              className="zone-shape"
            />
          )}
          <line x1={zoneLeft} y1={center} x2={zoneLeft + zoneWidth} y2={center} className="zone-axis" />
          <line x1={center} y1={zoneTop} x2={center} y2={zoneTop + zoneHeight} className="zone-axis" />
          <line x1={center} y1={center} x2={knobX} y2={knobY} className="zone-line" />
          <circle cx={center} cy={center} r="5" className="zone-center" />
          <circle cx={knobX} cy={knobY} r="9" className="zone-knob" />
        </svg>
      </div>
      <div className="zone-values">
        <label>
          X
          <input
            type="number"
            min={-Math.round(maxOffsetX)}
            max={Math.round(maxOffsetX)}
            value={Math.round(iconState.contentOffsetX)}
            onChange={(event) =>
              applyOffset(parseFloatOr(event.target.value, 0), iconState.contentOffsetY)
            }
          />
        </label>
        <label>
          Y
          <input
            type="number"
            min={-Math.round(maxOffsetY)}
            max={Math.round(maxOffsetY)}
            value={Math.round(iconState.contentOffsetY)}
            onChange={(event) =>
              applyOffset(iconState.contentOffsetX, parseFloatOr(event.target.value, 0))
            }
          />
        </label>
        <button type="button" className="btn-ghost zone-reset" onClick={onReset}>
          Reset zone
        </button>
      </div>
    </div>
  );
}

function GradientDirectionWheel({
  mode,
  angle,
  centerX,
  centerY,
  onAngleChange,
  onCenterChange,
  label,
}) {
  const wheelRef = useRef(null);
  const draggingRef = useRef(false);

  const size = 138;
  const radius = 52;
  const center = size / 2;
  const radians = (angle * Math.PI) / 180;
  const linearKnobX = center + Math.cos(radians) * radius;
  const linearKnobY = center + Math.sin(radians) * radius;
  const radialKnobX = center + ((centerX - 50) / 50) * radius;
  const radialKnobY = center + ((centerY - 50) / 50) * radius;

  const updateFromPointer = (event) => {
    if (!wheelRef.current) return;
    const pointer = getPointerViewBoxPoint(event, wheelRef.current, size);
    const x = pointer.x - center;
    const y = pointer.y - center;

    if (mode === "radial") {
      const distance = Math.hypot(x, y);
      const clampedRatio = distance > radius ? radius / distance : 1;
      const clampedX = x * clampedRatio;
      const clampedY = y * clampedRatio;
      const nextCenterX = clamp(Math.round((clampedX / radius) * 50 + 50), 0, 100);
      const nextCenterY = clamp(Math.round((clampedY / radius) * 50 + 50), 0, 100);
      onCenterChange(nextCenterX, nextCenterY);
      return;
    }

    const nextAngle = Math.round(((Math.atan2(y, x) * 180) / Math.PI + 360) % 360);
    onAngleChange(nextAngle);
  };

  const handlePointerDown = (event) => {
    draggingRef.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    updateFromPointer(event);
  };

  const handlePointerMove = (event) => {
    if (!draggingRef.current) return;
    updateFromPointer(event);
  };

  const handlePointerUp = (event) => {
    draggingRef.current = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const handleWheelKeyDown = (event) => {
    if (mode === "radial") {
      const centerStep = event.shiftKey ? 5 : 1;
      let nextCenterX = centerX;
      let nextCenterY = centerY;

      if (event.key === "ArrowUp") {
        nextCenterY = clamp(centerY - centerStep, 0, 100);
      } else if (event.key === "ArrowDown") {
        nextCenterY = clamp(centerY + centerStep, 0, 100);
      } else if (event.key === "ArrowRight") {
        nextCenterX = clamp(centerX + centerStep, 0, 100);
      } else if (event.key === "ArrowLeft") {
        nextCenterX = clamp(centerX - centerStep, 0, 100);
      } else if (event.key === "Home") {
        nextCenterX = 50;
        nextCenterY = 50;
      } else {
        return;
      }

      event.preventDefault();
      onCenterChange(nextCenterX, nextCenterY);
      return;
    }

    const angleStep = event.shiftKey ? 15 : 5;
    let nextAngle = angle;
    if (event.key === "ArrowUp" || event.key === "ArrowRight") {
      nextAngle = (angle + angleStep) % 360;
    } else if (event.key === "ArrowDown" || event.key === "ArrowLeft") {
      nextAngle = (angle - angleStep + 360) % 360;
    } else if (event.key === "Home") {
      nextAngle = 0;
    } else if (event.key === "End") {
      nextAngle = 359;
    } else {
      return;
    }

    event.preventDefault();
    onAngleChange(nextAngle);
  };

  return (
    <div
      ref={wheelRef}
      className="gradient-wheel"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      role={mode === "linear" ? "slider" : "group"}
      tabIndex={0}
      aria-label={`${label} gradient direction wheel`}
      aria-valuemin={mode === "linear" ? 0 : undefined}
      aria-valuemax={mode === "linear" ? 359 : undefined}
      aria-valuenow={mode === "linear" ? angle : undefined}
      aria-valuetext={
        mode === "linear"
          ? `${angle} degrees`
          : `Center at ${centerX} percent horizontal and ${centerY} percent vertical`
      }
      aria-description={
        mode === "linear"
          ? "Arrow keys rotate the gradient angle."
          : "Arrow keys move the radial center point."
      }
      onKeyDown={handleWheelKeyDown}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <circle cx={center} cy={center} r={radius} className="gradient-wheel-ring" />
        {mode === "linear" ? (
          <>
            <line
              x1={center}
              y1={center}
              x2={linearKnobX}
              y2={linearKnobY}
              className="gradient-wheel-line"
            />
            <circle cx={linearKnobX} cy={linearKnobY} r="7" className="gradient-wheel-knob" />
            <circle cx={center} cy={center} r="5" className="gradient-wheel-center" />
          </>
        ) : (
          <circle
            cx={radialKnobX}
            cy={radialKnobY}
            r="8"
            className="gradient-wheel-center gradient-wheel-center-handle"
          />
        )}
      </svg>
    </div>
  );
}

function GradientColorControl({
  label,
  stops,
  gradientType,
  angle,
  centerX,
  centerY,
  onStopChange,
  onAddStop,
  onRemoveStop,
  onGradientTypeChange,
  onAngleChange,
  onCenterChange,
}) {
  const gradientPreview = getGradientPaint(stops, gradientType, angle, centerX, centerY);
  const isGradient = stops.length > 1;

  return (
    <div className="gradient-color-control">
      <div className="gradient-color-head">
        <span>{label}</span>
      </div>

      <div className="gradient-swatch-row">
        {stops.map((color, index) => (
          <div key={`${label}-${index}`} className="gradient-swatch" style={{ background: color }}>
            <input
              className="gradient-swatch-input"
              type="color"
              value={color}
              onChange={(event) => onStopChange(index, event.target.value)}
              aria-label={`${label} color ${index + 1}`}
            />
            {isGradient ? (
              <button
                type="button"
                className="gradient-swatch-remove"
                onClick={() => onRemoveStop(index)}
                aria-label={`Remove ${label} color ${index + 1}`}
              >
                ×
              </button>
            ) : null}
          </div>
        ))}
        {stops.length < MAX_GRADIENT_STOPS ? (
          <button
            type="button"
            className="gradient-swatch-add"
            onClick={onAddStop}
            aria-label={`Add ${label} gradient color`}
          >
            +
          </button>
        ) : null}
      </div>

      {isGradient ? (
        <div className="gradient-editor">
          <div className="gradient-preview" style={{ background: gradientPreview }} />
          <div className="gradient-mode-toggle" role="group" aria-label={`${label} gradient mode`}>
            {GRADIENT_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                className={
                  gradientType === type ? "gradient-mode-button active" : "gradient-mode-button"
                }
                onClick={() => onGradientTypeChange(type)}
              >
                {type === "linear" ? "Linear" : "Radial"}
              </button>
            ))}
          </div>
          <div className="gradient-angle-layout">
            <GradientDirectionWheel
              mode={gradientType}
              angle={angle}
              centerX={centerX}
              centerY={centerY}
              onAngleChange={onAngleChange}
              onCenterChange={onCenterChange}
              label={label}
            />
            {gradientType === "linear" ? (
              <label>
                Angle
                <input
                  type="number"
                  min={0}
                  max={359}
                  value={angle}
                  onChange={(event) =>
                    onAngleChange(clamp(parseIntOr(event.target.value, 0), 0, 359))
                  }
                />
              </label>
            ) : (
              <div className="gradient-center-readout">
                Center {centerX}% / {centerY}%
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ToggleGroup({ options, value, onChange, labels }) {
  return (
    <div className="toggle-group">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          className={option === value ? "toggle active" : "toggle"}
          onClick={() => onChange(option)}
        >
          {labels?.[option] ?? option}
        </button>
      ))}
    </div>
  );
}

function FolderControls({ state, patchState }) {
  return (
    <>
      <div className="grid-two">
        <label>
          Tab position
          <input
            type="range"
            min={0}
            max={70}
            step={1}
            value={state.folderTabX}
            onChange={(event) => patchState({ folderTabX: Number(event.target.value) })}
          />
          <small>{state.folderTabX}% from left</small>
        </label>
        <label>
          Tab width
          <input
            type="range"
            min={18}
            max={82}
            step={1}
            value={state.folderTabWidth}
            onChange={(event) => patchState({ folderTabWidth: Number(event.target.value) })}
          />
          <small>{state.folderTabWidth}%</small>
        </label>
      </div>

      <label>
        Tab height
        <input
          type="range"
          min={10}
          max={42}
          step={1}
          value={state.folderTabHeight}
          onChange={(event) => patchState({ folderTabHeight: Number(event.target.value) })}
        />
        <small>{state.folderTabHeight}%</small>
      </label>

      <div className="grid-two">
        <label>
          Width scale
          <input
            type="range"
            min={ICON_SCALE_MIN}
            max={260}
            step={2}
            value={state.widthScale}
            onChange={(event) => patchState({ widthScale: Number(event.target.value) })}
          />
          <small>{(state.widthScale / 100).toFixed(2)}x</small>
        </label>
        <label>
          Height scale
          <input
            type="range"
            min={SHAPE_HEIGHT_SCALE_MIN}
            max={SHAPE_HEIGHT_SCALE_MAX}
            step={2}
            value={state.heightScale}
            onChange={(event) => patchState({ heightScale: Number(event.target.value) })}
          />
          <small>{(state.heightScale / 100).toFixed(2)}x</small>
        </label>
      </div>

      <label>
        Corner rounding
        <input
          type="range"
          min={0}
          max={SHAPE_RADIUS_MAX}
          step={2}
          value={state.radius}
          onChange={(event) => patchState({ radius: Number(event.target.value) })}
        />
        <small>{state.radius}px</small>
      </label>
    </>
  );
}

function ContentRotationControl({ value, onChange, onReset }) {
  const canReset = value !== DEFAULT_STATE.contentRotation;

  return (
    <label>
      Content rotation
      <input
        type="range"
        min={CONTENT_ROTATION_MIN}
        max={CONTENT_ROTATION_MAX}
        step={1}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
      <span className="content-rotation-readout">
        <small>{value}°</small>
        {canReset ? (
          <button
            type="button"
            className="btn-ghost content-rotation-reset"
            onClick={onReset}
            aria-label="Reset content rotation"
            title="Reset content rotation"
          >
            <RotateCcw size={14} aria-hidden="true" />
          </button>
        ) : null}
      </span>
    </label>
  );
}

function Modal({ open, title, onClose, children, actions }) {
  const sheetRef = useRef(null);
  const previousFocusRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    previousFocusRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;

    const frame = window.requestAnimationFrame(() => {
      const container = sheetRef.current;
      if (!container) return;
      const focusableNodes = getFocusableNodes(container);
      const target = focusableNodes[0] || container;
      if (target && typeof target.focus === "function") {
        target.focus();
      }
    });

    return () => {
      window.cancelAnimationFrame(frame);
      const previousFocus = previousFocusRef.current;
      if (
        previousFocus &&
        previousFocus.isConnected &&
        typeof previousFocus.focus === "function"
      ) {
        previousFocus.focus();
      }
    };
  }, [open]);

  if (!open) return null;

  const handleSheetKeyDown = (event) => {
    if (event.key === "Escape") {
      event.stopPropagation();
      onClose();
      return;
    }

    if (event.key !== "Tab") return;
    const container = sheetRef.current;
    const focusableNodes = getFocusableNodes(container);
    if (focusableNodes.length === 0) {
      event.preventDefault();
      container?.focus();
      return;
    }

    const first = focusableNodes[0];
    const last = focusableNodes[focusableNodes.length - 1];
    const active = document.activeElement;

    if (event.shiftKey) {
      if (active === first || !container?.contains(active)) {
        event.preventDefault();
        last.focus();
      }
      return;
    }

    if (active === last) {
      event.preventDefault();
      first.focus();
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        ref={sheetRef}
        className="modal-sheet"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
        tabIndex={-1}
        onKeyDown={handleSheetKeyDown}
      >
        <div className="modal-header">
          <h3>{title}</h3>
          <button
            type="button"
            className="modal-close-button"
            onClick={onClose}
            aria-label="Close modal"
          >
            X
          </button>
        </div>
        <div className="modal-body">{children}</div>
        <div className="modal-actions">{actions}</div>
      </div>
    </div>
  );
}

function LucideGlyph({ name, size = 22, strokeWidth = 1.9 }) {
  const IconComponent = useMemo(
    () => lazy(dynamicIconImports[name] || dynamicIconImports[DEFAULT_STATE.lucide]),
    [name],
  );

  return (
    <Suspense fallback={<div className="icon-glyph-fallback" style={{ width: size, height: size }} />}>
      <IconComponent
        size={size}
        strokeWidth={strokeWidth}
        absoluteStrokeWidth
        aria-hidden="true"
        style={{ display: "block" }}
      />
    </Suspense>
  );
}

function HelpHint({ text, setTooltip }) {
  const showTooltip = (event) => {
    setTooltip({
      text,
      x: event.clientX + 14,
      y: event.clientY + 16,
    });
  };

  return (
    <span
      className="help-hint"
      role="button"
      tabIndex={0}
      aria-label={text}
      onMouseEnter={showTooltip}
      onMouseMove={showTooltip}
      onMouseLeave={() => setTooltip(null)}
      onFocus={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        setTooltip({ text, x: rect.right + 12, y: rect.bottom + 12 });
      }}
      onBlur={() => setTooltip(null)}
    >
      ?
    </span>
  );
}

function IconPickerModal({ open, onClose, selectedIcon, onSelect }) {
  const [search, setSearch] = useState("");
  const [visibleCount, setVisibleCount] = useState(300);
  const gridRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    setSearch("");
    setVisibleCount(300);
  }, [open]);

  const filteredIcons = useMemo(() => {
    const trimmed = search.trim().toLowerCase();
    if (!trimmed) return iconOptions;
    return iconOptions.filter((iconName) => iconName.includes(trimmed));
  }, [search]);

  const visibleIcons = useMemo(() => {
    return filteredIcons.slice(0, visibleCount);
  }, [filteredIcons, visibleCount]);

  useEffect(() => {
    setVisibleCount((current) => clamp(current, 300, filteredIcons.length || 300));
  }, [filteredIcons.length]);

  const loadMoreIcons = () => {
    setVisibleCount((current) => Math.min(current + 240, filteredIcons.length));
  };

  const handleGridScroll = (event) => {
    const target = event.currentTarget;
    const nearBottom = target.scrollTop + target.clientHeight >= target.scrollHeight - 180;
    if (nearBottom && visibleCount < filteredIcons.length) {
      loadMoreIcons();
    }
  };

  return (
    <Modal
      open={open}
      title="Browse Icons"
      onClose={onClose}
      actions={
        <button type="button" className="btn-ghost" onClick={onClose}>
          Done
        </button>
      }
    >
      <div className="icon-picker-toolbar">
        <label>
          Search icons
          <input
            type="text"
            placeholder="search e.g. sparkles, bell, chart"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setVisibleCount(300);
            }}
          />
        </label>
        <div className="icon-picker-stats">
          <span>{filteredIcons.length} matched</span>
          <span>
            Showing {Math.min(visibleIcons.length, filteredIcons.length)} of {filteredIcons.length}
          </span>
        </div>
      </div>

      <div ref={gridRef} className="icon-picker-grid" onScroll={handleGridScroll}>
        {visibleIcons.map((iconName) => (
          <button
            type="button"
            key={iconName}
            className={iconName === selectedIcon ? "icon-option active" : "icon-option"}
            onClick={() => onSelect(iconName)}
            title={iconName}
          >
            <LucideGlyph name={iconName} size={20} />
            <span>{iconName}</span>
          </button>
        ))}
      </div>
    </Modal>
  );
}

function FontPickerModal({ open, onClose, selectedFont, onSelect }) {
  return (
    <Modal
      open={open}
      title="Choose Font"
      onClose={onClose}
      actions={
        <button type="button" className="btn-ghost" onClick={onClose}>
          Done
        </button>
      }
    >
      <div className="font-picker-grid" role="listbox" aria-label="Font options">
        {FONT_OPTIONS.map((font) => (
          <button
            key={font.value}
            type="button"
            role="option"
            aria-selected={font.value === selectedFont}
            className={font.value === selectedFont ? "font-option active" : "font-option"}
            onClick={() => onSelect(font.value)}
          >
            <span className="font-option-name">{font.label}</span>
            <span className="font-option-preview" style={{ fontFamily: font.value }}>
              Aa Bb 123
            </span>
          </button>
        ))}
      </div>
    </Modal>
  );
}

function useProcessedImageProfile(imageState) {
  const [processedImage, setProcessedImage] = useState("");

  const normalizedImageState = useMemo(
    () => ({
      imageData: imageState.imageData,
      imageWidth: imageState.imageWidth,
      imageHeight: imageState.imageHeight,
      imageCropEnabled: imageState.imageCropEnabled,
      imageCropX: imageState.imageCropX,
      imageCropY: imageState.imageCropY,
      imageCropSize: imageState.imageCropSize,
      imageRotation: imageState.imageRotation,
      imageHue: imageState.imageHue,
      imageContrast: imageState.imageContrast,
      imageBrightness: imageState.imageBrightness,
      imageSilhouette: imageState.imageSilhouette,
      imageSilhouetteColor: imageState.imageSilhouetteColor,
      imageEdgeStroke: imageState.imageEdgeStroke,
      imageEdgeStrokeColor: imageState.imageEdgeStrokeColor,
    }),
    [
      imageState.imageData,
      imageState.imageWidth,
      imageState.imageHeight,
      imageState.imageCropEnabled,
      imageState.imageCropX,
      imageState.imageCropY,
      imageState.imageCropSize,
      imageState.imageRotation,
      imageState.imageHue,
      imageState.imageContrast,
      imageState.imageBrightness,
      imageState.imageSilhouette,
      imageState.imageSilhouetteColor,
      imageState.imageEdgeStroke,
      imageState.imageEdgeStrokeColor,
    ],
  );

  const cacheKey = useMemo(
    () => getProcessedImageCacheKey(normalizedImageState),
    [normalizedImageState],
  );

  useEffect(() => {
    let canceled = false;
    if (!normalizedImageState.imageData) {
      setProcessedImage("");
      return undefined;
    }

    const cached = processedImageCache.get(cacheKey);
    if (cached) {
      setProcessedImage(cached);
      return undefined;
    }

    const pendingRender =
      processedImagePendingCache.get(cacheKey) || buildProcessedImage(normalizedImageState);
    processedImagePendingCache.set(cacheKey, pendingRender);

    pendingRender
      .then((result) => {
        processedImagePendingCache.delete(cacheKey);
        if (canceled) return;
        if (!result) {
          setProcessedImage("");
          return;
        }
        processedImageCache.set(cacheKey, result);
        ensureCacheLimit(processedImageCache);
        setProcessedImage(result);
      })
      .catch(() => {
        processedImagePendingCache.delete(cacheKey);
        if (!canceled) setProcessedImage("");
      });

    return () => {
      canceled = true;
    };
  }, [cacheKey, normalizedImageState]);

  return processedImage;
}

function ImageFace({ iconState, metrics }) {
  const imageState = useMemo(
    () => getImageStateForTarget(iconState, "content"),
    [
      iconState.imageData,
      iconState.imageName,
      iconState.imageWidth,
      iconState.imageHeight,
      iconState.imageCropEnabled,
      iconState.imageCropX,
      iconState.imageCropY,
      iconState.imageCropSize,
      iconState.imageRotation,
      iconState.imageHue,
      iconState.imageContrast,
      iconState.imageBrightness,
      iconState.imageSilhouette,
      iconState.imageSilhouetteColor,
      iconState.imageEdgeStroke,
      iconState.imageEdgeStrokeColor,
    ],
  );
  const processedImage = useProcessedImageProfile(imageState);
  const hasImage = Boolean(imageState.imageData);

  return (
    <div
      className={`image-content ${hasImage ? "" : "empty"}`.trim()}
      style={{
        padding: `${iconState.inset + metrics.visibleOutline}px`,
        opacity: iconState.contentOpacity / 100,
        transform: `translate(${iconState.contentOffsetX}px, ${iconState.contentOffsetY}px)`,
      }}
    >
      {hasImage && processedImage ? (
        <img src={processedImage} alt="" draggable={false} />
      ) : (
        <span>{hasImage ? "Processing image..." : "Upload image"}</span>
      )}
    </div>
  );
}

function getSectionPreviewText(content) {
  const preview = [...String(content || "").trim()].slice(0, 2).join("");
  return preview || "A";
}

function getSectionPreviewShapeMetrics(state) {
  if (state.shape === "none") {
    return { width: 20, height: 20, borderRadius: 10 };
  }

  if (state.shape === "image") {
    return {
      width: 22,
      height: 22,
      borderRadius: clamp(Math.round(state.radius / 6), 6, 11),
    };
  }

  if (state.shape === "folder") {
    return {
      width: 26,
      height: 20,
      borderRadius: clamp(Math.round(state.radius / 8), 3, 9),
    };
  }

  const width = clamp(Math.round((state.widthScale / 100) * 18), 14, 30);
  const height = clamp(Math.round((state.heightScale / 100) * 18), 14, 24);

  return {
    width,
    height,
    borderRadius: clamp(state.radius, 0, Math.min(width, height) / 2),
  };
}

function ShapeSectionHeaderPreview({ state, className = "" }) {
  const imageState = useMemo(
    () => getImageStateForTarget(state, "shape"),
    [
      state.baseImageData,
      state.baseImageName,
      state.baseImageWidth,
      state.baseImageHeight,
      state.baseImageCropEnabled,
      state.baseImageCropX,
      state.baseImageCropY,
      state.baseImageCropSize,
      state.baseImageRotation,
      state.baseImageHue,
      state.baseImageContrast,
      state.baseImageBrightness,
      state.baseImageSilhouette,
      state.baseImageSilhouetteColor,
      state.baseImageEdgeStroke,
      state.baseImageEdgeStrokeColor,
    ],
  );
  const processedImage = useProcessedImageProfile(imageState);
  const shapeMetrics = getSectionPreviewShapeMetrics(state);
  const surfaceStyle =
    state.shape !== "none" && state.shape !== "folder"
      ? getMainSurfaceStyle(state, Math.min(state.outline, 2))
      : null;

  return (
    <span
      className={`section-header-preview section-header-preview-shape ${className}`.trim()}
      aria-hidden="true"
    >
      {state.shape === "none" ? (
        <span className="section-header-preview-none">/</span>
      ) : (
        state.shape === "folder" ? (
          <svg
            className="section-header-preview-folder"
            viewBox={`0 0 ${shapeMetrics.width} ${shapeMetrics.height}`}
            width={shapeMetrics.width}
            height={shapeMetrics.height}
          >
            <path
              d={getFolderPath(
                shapeMetrics.width,
                shapeMetrics.height,
                shapeMetrics.borderRadius,
                state.folderTabX,
                state.folderTabWidth,
                state.folderTabHeight,
                1,
              )}
              fill={state.fillStops[0]}
              stroke={state.strokeStops[0]}
              strokeWidth={Math.min(state.outline, 2)}
              strokeLinejoin="round"
              opacity={state.baseOpacity / 100}
            />
          </svg>
        ) : (
          <span
            className="section-header-preview-shape-surface"
            style={{
              width: `${shapeMetrics.width}px`,
              height: `${shapeMetrics.height}px`,
              borderRadius: `${shapeMetrics.borderRadius}px`,
              opacity: state.baseOpacity / 100,
              ...(surfaceStyle || {}),
            }}
          >
            {state.shape === "image" && processedImage ? (
              <img
                src={processedImage}
                alt=""
                draggable={false}
                className="section-header-preview-shape-image"
              />
            ) : null}
          </span>
        )
      )}
    </span>
  );
}

function ContentSectionHeaderPreview({ state }) {
  const imageState = useMemo(
    () => getImageStateForTarget(state, "content"),
    [
      state.imageData,
      state.imageName,
      state.imageWidth,
      state.imageHeight,
      state.imageCropEnabled,
      state.imageCropX,
      state.imageCropY,
      state.imageCropSize,
      state.imageRotation,
      state.imageHue,
      state.imageContrast,
      state.imageBrightness,
      state.imageSilhouette,
      state.imageSilhouetteColor,
      state.imageEdgeStroke,
      state.imageEdgeStrokeColor,
    ],
  );
  const processedImage = useProcessedImageProfile(imageState);
  const previewText = getSectionPreviewText(state.content);

  return (
    <span className="section-header-preview section-header-preview-content" aria-hidden="true">
      {state.mode === "none" ? (
        <span className="section-header-preview-none">/</span>
      ) : state.mode === "image" && processedImage ? (
        <img src={processedImage} alt="" draggable={false} className="section-header-preview-image" />
      ) : state.mode === "icon" ? (
        <span
          className="section-header-preview-icon"
          style={{
            color: state.textColor,
            opacity: state.contentOpacity / 100,
            transform: `rotate(${state.contentRotation}deg)`,
          }}
        >
          <LucideGlyph
            name={normalizeLucideName(state.lucide) || DEFAULT_STATE.lucide}
            size={18}
            strokeWidth={Math.min(4, state.lucideWeight)}
          />
        </span>
      ) : (
        <span
          className="section-header-preview-text"
          style={{
            color: state.textColor,
            opacity: state.contentOpacity / 100,
            fontFamily: state.fontFamily,
            fontWeight: state.fontWeight,
            transform: `rotate(${state.contentRotation}deg)`,
          }}
        >
          {previewText}
        </span>
      )}
    </span>
  );
}

function BackLayerSectionHeaderPreview({ state }) {
  const offset = getOffset(Math.max(8, state.backDistance), state.backAngle);
  const backX = Number((offset.x * 0.32).toFixed(2));
  const backY = Number((offset.y * 0.32).toFixed(2));

  return (
    <span className="section-header-preview section-header-preview-back-layer" aria-hidden="true">
      <span
        className="section-header-preview-back-shadow"
        style={{
          background: state.backColor,
          opacity: state.backDistance > 0 ? 1 : 0.35,
          transform: `translate(${backX}px, ${backY}px)`,
        }}
      />
      <ShapeSectionHeaderPreview state={state} className="section-header-preview-back-front" />
    </span>
  );
}

function SectionPanel({
  title,
  isOpen,
  onToggleOpen,
  isEnabled,
  onToggleEnabled,
  headerPreview = null,
  children,
}) {
  const showBody = isOpen;

  return (
    <section className={`section-panel ${isEnabled ? "" : "section-panel-disabled"}`.trim()}>
      <h2 className="section-panel-head">
        <button
          type="button"
          className="section-panel-toggle"
          onClick={onToggleOpen}
          aria-expanded={isOpen}
        >
          <span
            className={isOpen ? "section-advanced-chevron open" : "section-advanced-chevron"}
            aria-hidden="true"
          >
            ▸
          </span>
          <span className="section-panel-title">{title}</span>
        </button>

        {headerPreview}

        <label className="section-panel-switch">
          <input
            type="checkbox"
            checked={isEnabled}
            onChange={(event) => onToggleEnabled(event.target.checked)}
            aria-label={`${isEnabled ? "Disable" : "Enable"} ${title}`}
          />
          <span className="section-panel-switch-track" aria-hidden="true">
            <span className="section-panel-switch-thumb" />
          </span>
        </label>
      </h2>

      {showBody ? (
        <div className="section-panel-body-shell">
          <fieldset className="section-panel-body" disabled={!isEnabled}>
            {children}
          </fieldset>
          {!isEnabled ? (
            <div className="section-panel-disabled-mask" aria-hidden="true">
              <span>DISABLED</span>
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

function ShapeImageFill({ iconState, metrics }) {
  const imageState = useMemo(
    () => getImageStateForTarget(iconState, "shape"),
    [
      iconState.baseImageData,
      iconState.baseImageName,
      iconState.baseImageWidth,
      iconState.baseImageHeight,
      iconState.baseImageCropEnabled,
      iconState.baseImageCropX,
      iconState.baseImageCropY,
      iconState.baseImageCropSize,
      iconState.baseImageRotation,
      iconState.baseImageHue,
      iconState.baseImageContrast,
      iconState.baseImageBrightness,
      iconState.baseImageSilhouette,
      iconState.baseImageSilhouetteColor,
      iconState.baseImageEdgeStroke,
      iconState.baseImageEdgeStrokeColor,
    ],
  );
  const processedImage = useProcessedImageProfile(imageState);
  const hasImage = Boolean(imageState.imageData);
  const inset = `${metrics.visibleOutline}px`;
  const innerRadius = Math.max(0, metrics.borderRadius - metrics.visibleOutline);

  return (
    <div
      className={`shape-image-fill ${hasImage ? "" : "empty"}`.trim()}
      style={{
        inset,
        borderRadius: `${innerRadius}px`,
      }}
    >
      {hasImage && processedImage ? (
        <img src={processedImage} alt="" draggable={false} />
      ) : (
        <span>{hasImage ? "Processing shape image..." : "Upload shape image"}</span>
      )}
    </div>
  );
}

function FolderSurface({ iconState, metrics, variant = "front" }) {
  const rawId = useId().replace(/:/g, "");
  const fillId = `folder-fill-${rawId}`;
  const strokeId = `folder-stroke-${rawId}`;
  const { width, height } = metrics.dimensions;
  const strokeWidth = variant === "back" ? 0 : metrics.visibleOutline;
  const strokeInset = strokeWidth / 2;
  const fillPaint =
    variant === "back"
      ? iconState.backColor
      : getSvgPaintReference(fillId, iconState.fillStops, DEFAULT_STATE.fillStops);
  const strokePaint =
    variant === "back"
      ? "none"
      : getSvgPaintReference(strokeId, iconState.strokeStops, DEFAULT_STATE.strokeStops);
  const baseColor = sanitizeColorStops(iconState.fillStops, DEFAULT_STATE.fillStops)[0];
  const highlightColor = mixHexColors(baseColor, "#ffffff", 0.2);
  const opacity = variant === "back" ? (iconState.backDistance > 0 ? 1 : 0) : iconState.baseOpacity / 100;
  const path = getFolderPath(
    width,
    height,
    metrics.borderRadius,
    iconState.folderTabX,
    iconState.folderTabWidth,
    iconState.folderTabHeight,
    strokeInset,
  );

  return (
    <svg
      className="folder-surface"
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      aria-hidden="true"
      style={{ opacity }}
    >
      <defs>
        {variant !== "back" ? (
          <>
            <SvgPaint
              id={fillId}
              stops={iconState.fillStops}
              gradientType={iconState.fillGradientType}
              angle={iconState.fillGradientAngle}
              centerX={iconState.fillGradientCenterX}
              centerY={iconState.fillGradientCenterY}
              fallback={DEFAULT_STATE.fillStops}
            />
            <SvgPaint
              id={strokeId}
              stops={iconState.strokeStops}
              gradientType={iconState.strokeGradientType}
              angle={iconState.strokeGradientAngle}
              centerX={iconState.strokeGradientCenterX}
              centerY={iconState.strokeGradientCenterY}
              fallback={DEFAULT_STATE.strokeStops}
            />
          </>
        ) : null}
      </defs>
      <path
        d={path}
        fill={fillPaint}
        stroke={strokePaint}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />
      {variant !== "back" ? (
        <path
          d={path}
          fill={highlightColor}
          opacity="0.18"
          transform={`translate(0 ${Math.max(2, height * -0.035)})`}
        />
      ) : null}
    </svg>
  );
}

function IconFace({ iconState, metrics }) {
  if (!iconState.contentEnabled) {
    return null;
  }

  if (iconState.mode === "text") {
    return (
      <span
        className="text-content"
        style={{
          color: iconState.textColor,
          opacity: iconState.contentOpacity / 100,
          fontSize: `${metrics.fittedFontSize}px`,
          fontFamily: iconState.fontFamily,
          fontWeight: iconState.fontWeight,
          letterSpacing: `${iconState.spacing}px`,
          padding: `${iconState.inset + metrics.visibleOutline}px`,
          transform: `translate(calc(-50% + ${iconState.contentOffsetX}px), calc(-50% + ${iconState.contentOffsetY}px)) rotate(${iconState.contentRotation}deg)`,
        }}
      >
        {iconState.content || " "}
      </span>
    );
  }

  if (iconState.mode === "image") {
    return <ImageFace iconState={iconState} metrics={metrics} />;
  }

  if (iconState.mode === "none") {
    return null;
  }

  return (
    <div
      className="lucide-content"
      style={{
        color: iconState.textColor,
        opacity: iconState.contentOpacity / 100,
        width: `${metrics.iconRenderSize}px`,
        height: `${metrics.iconRenderSize}px`,
        transform: `translate(calc(-50% + ${iconState.contentOffsetX}px), calc(-50% + ${iconState.contentOffsetY}px)) rotate(${iconState.contentRotation}deg)`,
      }}
    >
      <LucideGlyph
        name={metrics.iconName}
        size={metrics.iconRenderSize}
        strokeWidth={iconState.lucideWeight}
      />
    </div>
  );
}

function IconLayers({ iconState, metrics, className = "" }) {
  const isFolder = iconState.shapeEnabled && iconState.shape === "folder";

  return (
    <>
      {iconState.shapeEnabled && iconState.backLayerEnabled && iconState.shape !== "none" ? (
        <div
          className="icon-layer"
          style={{
            width: `${metrics.dimensions.width}px`,
            height: `${metrics.dimensions.height}px`,
            borderRadius: isFolder ? 0 : `${metrics.borderRadius}px`,
            background: isFolder ? "none" : iconState.backColor,
            border: "none",
            transform: `translate(${metrics.offset.x + iconState.shapeOffsetX}px, ${
              metrics.offset.y + iconState.shapeOffsetY
            }px)`,
            opacity: iconState.backDistance > 0 ? 1 : 0,
          }}
        >
          {isFolder ? <FolderSurface iconState={iconState} metrics={metrics} variant="back" /> : null}
        </div>
      ) : null}
      <div
        className={`icon-layer icon-main ${
          iconState.shapeEnabled && iconState.shape === "image" ? "shape-image" : ""
        } ${isFolder ? "folder-base" : ""} ${className}`.trim()}
        style={{
          width: `${metrics.dimensions.width}px`,
          height: `${metrics.dimensions.height}px`,
          borderRadius: isFolder ? 0 : `${metrics.borderRadius}px`,
        }}
      >
        {iconState.shapeEnabled && iconState.shape !== "none" ? (
          <div
            className="icon-base-surface"
            style={{
              borderRadius: isFolder ? 0 : `${metrics.borderRadius}px`,
              transform: `translate(${iconState.shapeOffsetX}px, ${iconState.shapeOffsetY}px)`,
              ...(isFolder
                ? {}
                : {
                    opacity: iconState.baseOpacity / 100,
                    ...metrics.mainSurfaceStyle,
                  }),
            }}
          >
            {isFolder ? (
              <FolderSurface iconState={iconState} metrics={metrics} />
            ) : iconState.shape === "image" ? (
              <ShapeImageFill iconState={iconState} metrics={metrics} />
            ) : null}
          </div>
        ) : null}
        <IconFace iconState={iconState} metrics={metrics} />
      </div>
    </>
  );
}

function InspectHitTarget({
  target,
  highlightedInspectId = "",
  dragScale = 1,
  onHighlightInspectPart,
  onSelectInspectPart,
  onDragInspectPart,
  onResizeInspectPart,
}) {
  const dragRef = useRef(null);
  const [isInteracting, setIsInteracting] = useState(false);
  const isHighlighted = highlightedInspectId === target.id;
  const isDraggable = target.part === "content" || target.part === "base";
  const zIndex =
    target.target.type === "particle"
      ? target.part === "content"
        ? 18
        : target.part === "base"
          ? 17
          : 16
      : target.part === "content"
        ? 8
        : target.part === "base"
          ? 7
          : 6;

  const startInteraction = (event, mode, handle = "") => {
    if (!isDraggable) return;
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    dragRef.current = {
      pointerId: event.pointerId,
      lastX: event.clientX,
      lastY: event.clientY,
      mode,
      handle,
      moved: false,
      captureTarget: event.currentTarget,
    };
    onHighlightInspectPart?.(target.id);
    setIsInteracting(true);
  };

  const handlePointerMove = (event) => {
    const active = dragRef.current;
    if (!active || active.pointerId !== event.pointerId) return;
    event.preventDefault();
    const scale = Math.max(0.001, dragScale);
    const deltaX = (event.clientX - active.lastX) / scale;
    const deltaY = (event.clientY - active.lastY) / scale;
    if (Math.abs(deltaX) < 0.01 && Math.abs(deltaY) < 0.01) return;
    active.lastX = event.clientX;
    active.lastY = event.clientY;
    active.moved = true;

    if (active.mode === "resize") {
      onResizeInspectPart?.(target, active.handle, deltaX, deltaY, event.shiftKey);
      return;
    }

    onDragInspectPart?.(target, deltaX, deltaY);
  };

  const finishInteraction = (event) => {
    const active = dragRef.current;
    if (active?.pointerId === event.pointerId) {
      active.captureTarget?.releasePointerCapture?.(event.pointerId);
      if (active.mode === "move" && !active.moved) {
        onSelectInspectPart?.(target);
        dragRef.current = { ...active, ended: true, moved: true };
      } else {
        dragRef.current = { ...active, ended: true };
      }
    }
    setIsInteracting(false);
  };

  const handleResizePointerDown = (handle) => (event) => {
    startInteraction(event, "resize", handle);
  };

  return (
    <button
      type="button"
      className={[
        "inspect-hit-target",
        isDraggable ? "draggable" : "",
        isHighlighted ? "highlighted" : "",
        isInteracting ? "interacting" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={{
        left: `${target.bounds.left}px`,
        top: `${target.bounds.top}px`,
        width: `${target.bounds.width}px`,
        height: `${target.bounds.height}px`,
        borderRadius: `${target.bounds.radius}px`,
        zIndex,
      }}
      onMouseEnter={() => onHighlightInspectPart?.(target.id)}
      onMouseLeave={() => onHighlightInspectPart?.("")}
      onFocus={() => onHighlightInspectPart?.(target.id)}
      onBlur={() => onHighlightInspectPart?.("")}
      onPointerDown={
        isDraggable
          ? (event) => startInteraction(event, "move")
          : undefined
      }
      onPointerMove={isDraggable ? handlePointerMove : undefined}
      onPointerUp={isDraggable ? finishInteraction : undefined}
      onPointerCancel={
        isDraggable
            ? (event) => {
              const active = dragRef.current;
              if (active?.pointerId === event.pointerId) {
                active.captureTarget?.releasePointerCapture?.(event.pointerId);
                dragRef.current = null;
              }
              setIsInteracting(false);
            }
          : undefined
      }
      onClick={(event) => {
        event.stopPropagation();
        if (dragRef.current?.moved) {
          dragRef.current = null;
          return;
        }
        onSelectInspectPart?.(target);
      }}
      aria-label={`Edit ${target.label}`}
    >
      <span className="inspect-hit-label">{target.label}</span>
      {isDraggable ? (
        <>
          <span
            className="inspect-drag-handle handle-nw"
            aria-hidden="true"
            onPointerDown={handleResizePointerDown("nw")}
          />
          <span
            className="inspect-drag-handle handle-ne"
            aria-hidden="true"
            onPointerDown={handleResizePointerDown("ne")}
          />
          <span
            className="inspect-drag-handle handle-se"
            aria-hidden="true"
            onPointerDown={handleResizePointerDown("se")}
          />
          <span
            className="inspect-drag-handle handle-sw"
            aria-hidden="true"
            onPointerDown={handleResizePointerDown("sw")}
          />
        </>
      ) : null}
    </button>
  );
}

function CompositeIconStack({
  baseState,
  particles = {},
  editorTarget = { type: "base" },
  className = "",
  interactive = false,
  inspectMode = false,
  highlightedInspectId = "",
  inspectDragScale = 1,
  showCornerHotspots = false,
  onSelectBase,
  onSelectParticle,
  onCornerAdd,
  onHighlightInspectPart,
  onSelectInspectPart,
  onDragInspectPart,
  onResizeInspectPart,
}) {
  const baseMetrics = useMemo(() => getIconMetrics(baseState), [baseState]);
  const particleLayers = useMemo(
    () => buildParticleLayers(baseMetrics, particles),
    [baseMetrics, particles],
  );
  const cornerPoints = useMemo(() => buildCornerPoints(baseMetrics), [baseMetrics]);
  const baseInspectTargets = useMemo(
    () => buildInspectTargetsForIcon({ type: "base" }, baseState, baseMetrics),
    [baseState, baseMetrics],
  );

  return (
    <div
      className={`icon-stack composite-icon-stack ${className} ${
        interactive ? "interactive-stack" : ""
      }`.trim()}
      style={{
        width: `${baseMetrics.dimensions.width}px`,
        height: `${baseMetrics.dimensions.height}px`,
      }}
      onClick={interactive ? onSelectBase : undefined}
    >
      <IconLayers iconState={baseState} metrics={baseMetrics} />
      {inspectMode
        ? baseInspectTargets.map((target) => (
            <InspectHitTarget
              key={target.id}
              target={target}
              highlightedInspectId={highlightedInspectId}
              dragScale={inspectDragScale}
              onHighlightInspectPart={onHighlightInspectPart}
              onSelectInspectPart={onSelectInspectPart}
              onDragInspectPart={onDragInspectPart}
              onResizeInspectPart={onResizeInspectPart}
            />
          ))
        : null}

      {particleLayers.map((layer) => {
        const visualBounds = getIconVisualBounds(layer.particle.icon, layer.metrics);
        const focusPadding = 10;
        const focusWidth = Math.max(1, visualBounds.maxX - visualBounds.minX + focusPadding * 2);
        const focusHeight = Math.max(1, visualBounds.maxY - visualBounds.minY + focusPadding * 2);
        const focusRadius = Math.min(
          layer.metrics.borderRadius + focusPadding,
          focusWidth / 2,
          focusHeight / 2,
        );

        return (
          <div
            key={layer.key}
            className={`particle-layer ${interactive ? "interactive" : ""} ${
              editorTarget.type === "particle" && editorTarget.corner === layer.key
                ? "editing-target"
                : ""
            }`}
            style={{
              left: `${layer.placement.left}px`,
              top: `${layer.placement.top}px`,
              width: `${layer.metrics.dimensions.width}px`,
              height: `${layer.metrics.dimensions.height}px`,
            }}
            onClick={
              interactive && onSelectParticle
                ? (event) => {
                    event.stopPropagation();
                    onSelectParticle(layer.key);
                  }
                : undefined
            }
            role={interactive ? "button" : undefined}
            tabIndex={interactive ? 0 : undefined}
            onKeyDown={
              interactive && onSelectParticle
                ? (event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      event.stopPropagation();
                      onSelectParticle(layer.key);
                    }
                  }
                : undefined
            }
            aria-label={interactive ? `Edit ${layer.label} particle` : undefined}
          >
            <div
              className="icon-stack particle-stack"
              style={{
                width: `${layer.metrics.dimensions.width}px`,
                height: `${layer.metrics.dimensions.height}px`,
              }}
            >
              <IconLayers iconState={layer.particle.icon} metrics={layer.metrics} />
            </div>
            {inspectMode
              ? buildInspectTargetsForIcon(
                  { type: "particle", corner: layer.key },
                  layer.particle.icon,
                  layer.metrics,
                ).map((target) => (
                  <InspectHitTarget
                    key={target.id}
                    target={target}
                    highlightedInspectId={highlightedInspectId}
                    dragScale={inspectDragScale}
                    onHighlightInspectPart={onHighlightInspectPart}
                    onSelectInspectPart={onSelectInspectPart}
                    onDragInspectPart={onDragInspectPart}
                    onResizeInspectPart={onResizeInspectPart}
                  />
                ))
              : null}
            {interactive &&
            editorTarget.type === "particle" &&
            editorTarget.corner === layer.key ? (
              <div
                className="particle-focus-ring"
                style={{
                  width: `${focusWidth}px`,
                  height: `${focusHeight}px`,
                  left: `${visualBounds.minX - focusPadding}px`,
                  top: `${visualBounds.minY - focusPadding}px`,
                }}
              >
                <svg
                  viewBox={`0 0 ${focusWidth} ${focusHeight}`}
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <rect
                    className="particle-focus-ring-path"
                    x="1"
                    y="1"
                    width={Math.max(1, focusWidth - 2)}
                    height={Math.max(1, focusHeight - 2)}
                    rx={focusRadius}
                    ry={focusRadius}
                  />
                </svg>
              </div>
            ) : null}
          </div>
        );
      })}

      {showCornerHotspots
        ? cornerPoints
            .filter((corner) => !particles[corner.key])
            .map((corner) => (
              <button
                key={corner.key}
                type="button"
                className="corner-hotspot"
                style={{
                  left: `${corner.point.x}px`,
                  top: `${corner.point.y}px`,
                  "--float-x": `${corner.float.baseX}px`,
                  "--float-y": `${corner.float.baseY}px`,
                  "--float-hover-x": `${corner.float.hoverX}px`,
                  "--float-hover-y": `${corner.float.hoverY}px`,
                }}
                onClick={(event) => {
                  event.stopPropagation();
                  onCornerAdd?.(corner.key);
                }}
                title={`Add ${corner.label} particle`}
                aria-label={`Add ${corner.label} particle`}
              >
                +
              </button>
            ))
        : null}
    </div>
  );
}

function StaticCompositionPreview({
  baseState,
  particles = {},
  editorTarget = { type: "base" },
  targetSize,
  padding = 0,
  className = "",
}) {
  const baseMetrics = useMemo(() => getIconMetrics(baseState), [baseState]);
  const particleLayers = useMemo(
    () => buildParticleLayers(baseMetrics, particles),
    [baseMetrics, particles],
  );
  const bounds = useMemo(
    () => getCompositeBounds(baseState, baseMetrics, particleLayers),
    [baseState, baseMetrics, particleLayers],
  );
  const innerTargetSize = Math.max(16, targetSize - padding * 2);
  const scale = useMemo(() => getContextScale(innerTargetSize, bounds), [innerTargetSize, bounds]);
  const offsetX = -bounds.minX;
  const offsetY = -bounds.minY;

  return (
    <div
      className={`static-composition-preview ${className}`.trim()}
      style={{ width: `${targetSize}px`, height: `${targetSize}px` }}
    >
      <div
        className="static-composition-preview-scale"
        style={{ transform: `translate(-50%, -50%) scale(${scale.toFixed(4)})` }}
      >
        <span
          className="static-composition-preview-frame"
          style={{
            width: `${bounds.width}px`,
            height: `${bounds.height}px`,
          }}
        >
          <span
            className="static-composition-preview-offset"
            style={{
              left: `${offsetX.toFixed(2)}px`,
              top: `${offsetY.toFixed(2)}px`,
            }}
          >
            <CompositeIconStack
              baseState={baseState}
              particles={particles}
              editorTarget={editorTarget}
            />
          </span>
        </span>
      </div>
    </div>
  );
}

function StarterTemplateButton({ template, onClick }) {
  const baseState = useMemo(
    () => sanitizeIconState({ ...DEFAULT_STATE, ...template.base }),
    [template],
  );
  const particles = useMemo(
    () => sanitizeParticlesMap(template.particles, baseState),
    [template, baseState],
  );

  return (
    <button
      type="button"
      className="starter-template-card"
      onClick={onClick}
      aria-label={template.title}
      title={template.title}
    >
      <StaticCompositionPreview
        baseState={baseState}
        particles={particles}
        targetSize={72}
        padding={4}
        className="starter-template-preview"
      />
    </button>
  );
}

function getCenteredCropDraft(width, height, size = IMAGE_CROP_SIZE_MAX) {
  const safeWidth = Math.max(1, parseFloatOr(width, 1));
  const safeHeight = Math.max(1, parseFloatOr(height, 1));
  const safeSize = clamp(size, IMAGE_CROP_SIZE_MIN, IMAGE_CROP_SIZE_MAX);
  const cropPx = Math.min(safeWidth, safeHeight) * safeSize;
  const x = (safeWidth - cropPx) / 2 / safeWidth;
  const y = (safeHeight - cropPx) / 2 / safeHeight;
  return clampCropDraft({ size: safeSize, x, y }, safeWidth, safeHeight);
}

const IMAGE_CROP_HANDLES = [
  { key: "nw", label: "Resize from top left" },
  { key: "n", label: "Resize from top edge" },
  { key: "ne", label: "Resize from top right" },
  { key: "e", label: "Resize from right edge" },
  { key: "se", label: "Resize from bottom right" },
  { key: "s", label: "Resize from bottom edge" },
  { key: "sw", label: "Resize from bottom left" },
  { key: "w", label: "Resize from left edge" },
];

function createDefaultImageCropState() {
  return {
    open: false,
    targetKind: "content",
    sourceType: "upload",
    imageData: "",
    imageName: "",
    imageWidth: 0,
    imageHeight: 0,
    draft: getCenteredCropDraft(1, 1),
  };
}

function ImageCropModal({
  open,
  title = "Crop To Square?",
  targetLabel = "image",
  imageData,
  imageName,
  imageWidth,
  imageHeight,
  draft,
  onDraftChange,
  onApplyCrop,
  onKeepOriginal,
  onClose,
}) {
  if (!imageData) return null;

  const safeWidth = Math.max(1, imageWidth);
  const safeHeight = Math.max(1, imageHeight);
  const safeDraft = clampCropDraft(draft, safeWidth, safeHeight);
  const cropSizePx = Math.min(safeWidth, safeHeight) * safeDraft.size;
  const shorter = Math.min(safeWidth, safeHeight);
  const previewMaxWidth = 560;
  const previewMaxHeight = 360;
  const previewScale = Math.min(previewMaxWidth / safeWidth, previewMaxHeight / safeHeight, 1);
  const previewWidth = safeWidth * previewScale;
  const previewHeight = safeHeight * previewScale;
  const previewRef = useRef(null);
  const interactionRef = useRef(null);
  const onDraftChangeRef = useRef(onDraftChange);

  useEffect(() => {
    onDraftChangeRef.current = onDraftChange;
  }, [onDraftChange]);

  const getPreviewPoint = (event, rect) => {
    const renderedScaleX = rect.width / safeWidth;
    const renderedScaleY = rect.height / safeHeight;
    if (renderedScaleX <= 0 || renderedScaleY <= 0) return null;

    return {
      x: clamp((event.clientX - rect.left) / renderedScaleX, 0, safeWidth),
      y: clamp((event.clientY - rect.top) / renderedScaleY, 0, safeHeight),
    };
  };

  const startInteraction = (event, mode, handle = null) => {
    if (event.button !== 0) return;
    const preview = previewRef.current;
    if (!preview) return;
    const rect = preview.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0 || previewScale <= 0) return;

    event.preventDefault();
    if (mode === "resize") {
      event.stopPropagation();
    }

    const pointer = getPreviewPoint(event, rect);
    if (!pointer) return;

    interactionRef.current = {
      mode,
      handle,
      pointerId: event.pointerId,
      startPointerX: pointer.x,
      startPointerY: pointer.y,
      startLeft: safeDraft.x * safeWidth,
      startTop: safeDraft.y * safeHeight,
      startSize: cropSizePx,
      captureTarget: event.currentTarget,
    };

    if (typeof event.currentTarget?.setPointerCapture === "function") {
      event.currentTarget.setPointerCapture(event.pointerId);
    }
  };

  useEffect(() => {
    const releaseInteraction = (pointerId = null) => {
      const active = interactionRef.current;
      if (!active) return;
      if (pointerId !== null && active.pointerId !== pointerId) return;

      const captureTarget = active.captureTarget;
      if (
        captureTarget &&
        typeof captureTarget.releasePointerCapture === "function" &&
        typeof captureTarget.hasPointerCapture === "function" &&
        captureTarget.hasPointerCapture(active.pointerId)
      ) {
        captureTarget.releasePointerCapture(active.pointerId);
      }
      interactionRef.current = null;
    };

    const handlePointerMove = (event) => {
      const active = interactionRef.current;
      if (!active || active.pointerId !== event.pointerId) return;
      const preview = previewRef.current;
      if (!preview || previewScale <= 0) return;

      const rect = preview.getBoundingClientRect();
      const pointer = getPreviewPoint(event, rect);
      if (!pointer) return;
      const pointerX = pointer.x;
      const pointerY = pointer.y;
      let left = active.startLeft;
      let top = active.startTop;
      let size = active.startSize;

      if (active.mode === "move") {
        const deltaX = pointerX - active.startPointerX;
        const deltaY = pointerY - active.startPointerY;
        const maxLeft = Math.max(0, safeWidth - active.startSize);
        const maxTop = Math.max(0, safeHeight - active.startSize);
        left = clamp(active.startLeft + deltaX, 0, maxLeft);
        top = clamp(active.startTop + deltaY, 0, maxTop);
      } else {
        const minSize = shorter * IMAGE_CROP_SIZE_MIN;
        const startRight = active.startLeft + active.startSize;
        const startBottom = active.startTop + active.startSize;

        switch (active.handle) {
          case "nw": {
            const targetSize = Math.max(startRight - pointerX, startBottom - pointerY);
            const maxSize = Math.max(minSize, Math.min(startRight, startBottom, shorter));
            size = clamp(targetSize, minSize, maxSize);
            left = startRight - size;
            top = startBottom - size;
            break;
          }
          case "n": {
            const centerX = active.startLeft + active.startSize / 2;
            const targetSize = startBottom - pointerY;
            const maxSize = Math.max(
              minSize,
              Math.min(startBottom, 2 * Math.min(centerX, safeWidth - centerX), shorter),
            );
            size = clamp(targetSize, minSize, maxSize);
            left = clamp(centerX - size / 2, 0, safeWidth - size);
            top = startBottom - size;
            break;
          }
          case "ne": {
            const targetSize = Math.max(pointerX - active.startLeft, startBottom - pointerY);
            const maxSize = Math.max(
              minSize,
              Math.min(safeWidth - active.startLeft, startBottom, shorter),
            );
            size = clamp(targetSize, minSize, maxSize);
            left = active.startLeft;
            top = startBottom - size;
            break;
          }
          case "e": {
            const centerY = active.startTop + active.startSize / 2;
            const targetSize = pointerX - active.startLeft;
            const maxSize = Math.max(
              minSize,
              Math.min(
                safeWidth - active.startLeft,
                2 * Math.min(centerY, safeHeight - centerY),
                shorter,
              ),
            );
            size = clamp(targetSize, minSize, maxSize);
            left = active.startLeft;
            top = clamp(centerY - size / 2, 0, safeHeight - size);
            break;
          }
          case "se": {
            const targetSize = Math.max(pointerX - active.startLeft, pointerY - active.startTop);
            const maxSize = Math.max(
              minSize,
              Math.min(safeWidth - active.startLeft, safeHeight - active.startTop, shorter),
            );
            size = clamp(targetSize, minSize, maxSize);
            left = active.startLeft;
            top = active.startTop;
            break;
          }
          case "s": {
            const centerX = active.startLeft + active.startSize / 2;
            const targetSize = pointerY - active.startTop;
            const maxSize = Math.max(
              minSize,
              Math.min(
                safeHeight - active.startTop,
                2 * Math.min(centerX, safeWidth - centerX),
                shorter,
              ),
            );
            size = clamp(targetSize, minSize, maxSize);
            left = clamp(centerX - size / 2, 0, safeWidth - size);
            top = active.startTop;
            break;
          }
          case "sw": {
            const targetSize = Math.max(startRight - pointerX, pointerY - active.startTop);
            const maxSize = Math.max(
              minSize,
              Math.min(startRight, safeHeight - active.startTop, shorter),
            );
            size = clamp(targetSize, minSize, maxSize);
            left = startRight - size;
            top = active.startTop;
            break;
          }
          case "w": {
            const centerY = active.startTop + active.startSize / 2;
            const targetSize = startRight - pointerX;
            const maxSize = Math.max(
              minSize,
              Math.min(startRight, 2 * Math.min(centerY, safeHeight - centerY), shorter),
            );
            size = clamp(targetSize, minSize, maxSize);
            left = startRight - size;
            top = clamp(centerY - size / 2, 0, safeHeight - size);
            break;
          }
          default:
            break;
        }
      }

      onDraftChangeRef.current(
        clampCropDraft(
          {
            size: size / shorter,
            x: left / safeWidth,
            y: top / safeHeight,
          },
          safeWidth,
          safeHeight,
        ),
      );
    };

    const handlePointerEnd = (event) => {
      releaseInteraction(event.pointerId);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerEnd);
    window.addEventListener("pointercancel", handlePointerEnd);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerEnd);
      window.removeEventListener("pointercancel", handlePointerEnd);
      releaseInteraction();
    };
  }, [previewScale, safeHeight, safeWidth, shorter]);

  const overlayStyle = {
    left: `${safeDraft.x * safeWidth * previewScale}px`,
    top: `${safeDraft.y * safeHeight * previewScale}px`,
    width: `${cropSizePx * previewScale}px`,
    height: `${cropSizePx * previewScale}px`,
  };
  const cropPreviewLeft = safeDraft.x * safeWidth * previewScale;
  const cropPreviewTop = safeDraft.y * safeHeight * previewScale;
  const cropPreviewSize = cropSizePx * previewScale;
  const cropPreviewRight = cropPreviewLeft + cropPreviewSize;
  const cropPreviewBottom = cropPreviewTop + cropPreviewSize;
  const scrims = [
    { key: "top", left: 0, top: 0, width: previewWidth, height: cropPreviewTop },
    {
      key: "right",
      left: cropPreviewRight,
      top: cropPreviewTop,
      width: Math.max(0, previewWidth - cropPreviewRight),
      height: cropPreviewSize,
    },
    {
      key: "bottom",
      left: 0,
      top: cropPreviewBottom,
      width: previewWidth,
      height: Math.max(0, previewHeight - cropPreviewBottom),
    },
    { key: "left", left: 0, top: cropPreviewTop, width: cropPreviewLeft, height: cropPreviewSize },
  ];

  return (
    <Modal
      open={open}
      title={title}
      onClose={onClose}
      actions={
        <>
          <button type="button" className="btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn-secondary" onClick={onKeepOriginal}>
            Keep original
          </button>
          <button type="button" className="btn-primary" onClick={onApplyCrop}>
            Apply square crop
          </button>
        </>
      }
    >
      <p className="helper">
        <strong>{targetLabel}</strong> uploaded as <strong>{imageName}</strong> and auto-resized
        to {safeWidth} x {safeHeight}. Crop to a square or keep full dimensions.
      </p>

      <div className="image-crop-modal-layout">
        <div className="image-crop-preview-wrap">
          <div
            ref={previewRef}
            className="image-crop-preview"
            style={{ width: `${previewWidth}px`, height: `${previewHeight}px` }}
          >
            <img src={imageData} alt="" draggable={false} />
            {scrims.map((scrim) => (
              <div
                key={scrim.key}
                className="image-crop-scrim"
                aria-hidden="true"
                style={{
                  left: `${scrim.left}px`,
                  top: `${scrim.top}px`,
                  width: `${scrim.width}px`,
                  height: `${scrim.height}px`,
                }}
              />
            ))}
            <div
              className="image-crop-overlay"
              style={overlayStyle}
              onPointerDown={(event) => startInteraction(event, "move")}
            >
              {IMAGE_CROP_HANDLES.map((handle) => (
                <button
                  key={handle.key}
                  type="button"
                  className={`image-crop-handle image-crop-handle-${handle.key}`}
                  aria-label={handle.label}
                  onPointerDown={(event) => startInteraction(event, "resize", handle.key)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
      <p className="helper image-crop-hint">Drag the crop area to move it. Drag the handles to resize.</p>
    </Modal>
  );
}

function ImageEditorControls({
  targetLabel,
  inputRef,
  imageState,
  exportSizeLabel,
  exportSizeSummary,
  isExportSizeEnabled = false,
  isUsingExportImageSize = false,
  onExportSizeToggle,
  onFileChange,
  onUpload,
  onRecrop,
  onRemove,
  onPatch,
}) {
  return (
    <>
      <input
        ref={inputRef}
        className="visually-hidden-input"
        type="file"
        accept="image/*"
        onChange={onFileChange}
        tabIndex={-1}
        aria-hidden="true"
      />

      <div className="image-editor-card">
        <div className="image-editor-actions">
          <button type="button" className="btn-ghost" onClick={onUpload}>
            {imageState.imageData ? "Replace image" : "Upload image"}
          </button>
          <button
            type="button"
            className="btn-ghost"
            onClick={onRecrop}
            disabled={!imageState.imageData}
          >
            Crop / recrop
          </button>
          <button
            type="button"
            className="btn-ghost"
            onClick={onRemove}
            disabled={!imageState.imageData}
          >
            Remove
          </button>
        </div>
        <p className="helper">
          {targetLabel} upload prompts square-crop or keep original, then auto-resizes.
        </p>
        <label
          className={`export-size-switch ${isExportSizeEnabled ? "" : "disabled"}`.trim()}
        >
          <input
            type="checkbox"
            checked={isUsingExportImageSize}
            onChange={(event) => onExportSizeToggle?.(event.target.checked)}
            disabled={!isExportSizeEnabled}
          />
          <span className="export-size-switch-track" aria-hidden="true">
            <span className="export-size-switch-thumb" />
          </span>
          <span className="export-size-switch-copy">{exportSizeLabel}</span>
        </label>
        <p className="helper">{exportSizeSummary}</p>
      </div>

      {imageState.imageData ? (
        <div className="uploaded-image-preview">
          <img src={imageState.imageData} alt="" />
          <div className="uploaded-image-meta">
            <strong>{imageState.imageName || "image"}</strong>
            <span>
              {imageState.imageWidth} x {imageState.imageHeight}
            </span>
            <span>Crop: {imageState.imageCropEnabled ? "Square" : "Original"}</span>
          </div>
        </div>
      ) : (
        <p className="helper">No image selected yet.</p>
      )}

      <div className="image-editor-grid">
        <label className="compact-field">
          <span>Rotate</span>
          <input
            type="range"
            min={IMAGE_ROTATION_MIN}
            max={IMAGE_ROTATION_MAX}
            step={1}
            value={imageState.imageRotation}
            onChange={(event) => onPatch({ imageRotation: Number(event.target.value) })}
            disabled={!imageState.imageData}
          />
          <small>{imageState.imageRotation}°</small>
        </label>

        <label className="compact-field">
          <span>Recolor / hue</span>
          <input
            type="range"
            min={IMAGE_HUE_MIN}
            max={IMAGE_HUE_MAX}
            step={1}
            value={imageState.imageHue}
            onChange={(event) => onPatch({ imageHue: Number(event.target.value) })}
            disabled={!imageState.imageData}
          />
          <small>{imageState.imageHue}°</small>
        </label>

        <label className="compact-field">
          <span>Contrast</span>
          <input
            type="range"
            min={IMAGE_CONTRAST_MIN}
            max={IMAGE_CONTRAST_MAX}
            step={1}
            value={imageState.imageContrast}
            onChange={(event) => onPatch({ imageContrast: Number(event.target.value) })}
            disabled={!imageState.imageData}
          />
          <small>{imageState.imageContrast}%</small>
        </label>

        <label className="compact-field">
          <span>Brightness</span>
          <input
            type="range"
            min={IMAGE_BRIGHTNESS_MIN}
            max={IMAGE_BRIGHTNESS_MAX}
            step={1}
            value={imageState.imageBrightness}
            onChange={(event) => onPatch({ imageBrightness: Number(event.target.value) })}
            disabled={!imageState.imageData}
          />
          <small>{imageState.imageBrightness}%</small>
        </label>

        <label className="compact-field">
          <span>Edge stroke</span>
          <input
            type="range"
            min={0}
            max={IMAGE_EDGE_STROKE_MAX}
            step={1}
            value={imageState.imageEdgeStroke}
            onChange={(event) => onPatch({ imageEdgeStroke: Number(event.target.value) })}
            disabled={!imageState.imageData}
          />
          <small>{imageState.imageEdgeStroke}px</small>
        </label>

        <label className="color-dot-control compact-color-control">
          <span>Edge color</span>
          <input
            type="color"
            value={imageState.imageEdgeStrokeColor}
            onChange={(event) => onPatch({ imageEdgeStrokeColor: event.target.value })}
            disabled={!imageState.imageData}
          />
        </label>
      </div>

      <label className="advanced-check">
        <input
          type="checkbox"
          checked={imageState.imageSilhouette}
          onChange={(event) => onPatch({ imageSilhouette: event.target.checked })}
          disabled={!imageState.imageData}
        />
        <span>Silhouette (single-color)</span>
      </label>

      {imageState.imageSilhouette ? (
        <label className="color-dot-control compact-color-control">
          <span>Silhouette color</span>
          <input
            type="color"
            value={imageState.imageSilhouetteColor}
            onChange={(event) => onPatch({ imageSilhouetteColor: event.target.value })}
            disabled={!imageState.imageData}
          />
        </label>
      ) : null}
    </>
  );
}

function App() {
  const fallbackUrlSafeShareCode = encodeState(DEFAULT_STATE, {}, DEFAULT_CANVAS_SIZE, {
    urlSafe: true,
  });
  const [pageMode] = useState(() => {
    if (typeof window === "undefined") return "editor";
    return resolvePageModeFromUrl(new URL(window.location.href));
  });
  const [baseState, setBaseState] = useState(DEFAULT_STATE);
  const [particles, setParticles] = useState({});
  const [canvasSize, setCanvasSize] = useState(DEFAULT_CANVAS_SIZE);
  const [editorTarget, setEditorTarget] = useState({ type: "base" });
  const [loadCode, setLoadCode] = useState("");
  const [toast, setToast] = useState("");
  const [isShareOpen, setShareOpen] = useState(false);
  const [isInfoOpen, setInfoOpen] = useState(false);
  const [isSpecOpen, setSpecOpen] = useState(false);
  const [hasOpenedSpecModal, setHasOpenedSpecModal] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      return window.localStorage.getItem("iquan-spec-modal-opened") === "true";
    } catch {
      return false;
    }
  });
  const [isIconPickerOpen, setIconPickerOpen] = useState(false);
  const [isFontPickerOpen, setFontPickerOpen] = useState(false);
  const [isContentSectionOpen, setContentSectionOpen] = useState(true);
  const [isShapeSectionOpen, setShapeSectionOpen] = useState(true);
  const [isBackLayerSectionOpen, setBackLayerSectionOpen] = useState(true);
  const [isContentAdvancedOpen, setContentAdvancedOpen] = useState(false);
  const [isShapeAdvancedOpen, setShapeAdvancedOpen] = useState(false);
  const [isBackDistanceLocked, setBackDistanceLocked] = useState(false);
  const [isBackAngleLocked, setBackAngleLocked] = useState(false);
  const [exportScale, setExportScale] = useState(DEFAULT_EXPORT_SCALE);
  const [useImportedImageExportSize, setUseImportedImageExportSize] = useState(false);
  const [cursorTooltip, setCursorTooltip] = useState(null);
  const [isSelectMenuOpen, setSelectMenuOpen] = useState(false);
  const [highlightedInspectId, setHighlightedInspectId] = useState("");
  const [previewContextMode, setPreviewContextMode] = useState(DEFAULT_PREVIEW_CONTEXT_MODE);
  const [imageCropState, setImageCropState] = useState(() => createDefaultImageCropState());
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [sharePageStatus, setSharePageStatus] = useState(() =>
    pageMode === "copiedLink" ? "loading" : "builder",
  );
  const [uiPhase, setUiPhase] = useState(() =>
    pageMode === "copiedLink" ? "builder" : "landing",
  );
  const [workspaceMode, setWorkspaceMode] = useState(() => {
    if (pageMode === "copiedLink" || typeof window === "undefined") return "editor";
    return resolveWorkspaceModeFromUrl(new URL(window.location.href));
  });
  const [wizardStepIndex, setWizardStepIndex] = useState(0);
  const [walkthroughRequested, setWalkthroughRequested] = useState(false);
  const [isWalkthroughActive, setWalkthroughActive] = useState(false);
  const [walkthroughStepIndex, setWalkthroughStepIndex] = useState(0);
  const [walkthroughTargetRect, setWalkthroughTargetRect] = useState(null);
  const [heroSamples, setHeroSamples] = useState(() => createInitialHeroSamples());

  const exportRef = useRef(null);
  const controlsRef = useRef(null);
  const contentImageUploadInputRef = useRef(null);
  const shapeImageUploadInputRef = useRef(null);
  const projectFileInputRef = useRef(null);
  const hasHydratedFromUrlRef = useRef(false);
  const skipNextShareUrlSyncRef = useRef(false);
  const heroTransitionTimerRef = useRef(null);
  const heroSampleIntervalRef = useRef(null);
  const lastEnabledContentModeRef = useRef({ base: DEFAULT_STATE.mode });
  const lastEnabledShapeRef = useRef({ base: DEFAULT_STATE.shape });
  const lastEnabledBackLayerRef = useRef({
    base: {
      backDistance: 10,
      backAngle: DEFAULT_STATE.backAngle,
    },
  });
  const historyRef = useRef({
    past: [],
    future: [],
    isApplying: false,
    lastSnapshot: null,
  });

  const createHistorySnapshot = () => ({
    baseState,
    particles,
    canvasSize,
    editorTarget,
  });

  const cloneHistorySnapshot = (snapshot) => {
    if (typeof structuredClone === "function") {
      return structuredClone(snapshot);
    }
    return JSON.parse(JSON.stringify(snapshot));
  };

  const syncHistoryAvailability = () => {
    setCanUndo(historyRef.current.past.length > 0);
    setCanRedo(historyRef.current.future.length > 0);
  };

  const applyHistorySnapshot = (snapshot) => {
    setBaseState(snapshot.baseState);
    setParticles(snapshot.particles);
    setCanvasSize(snapshot.canvasSize);
    setEditorTarget(snapshot.editorTarget || { type: "base" });
  };

  const activeParticle =
    editorTarget.type === "particle" ? particles[editorTarget.corner] : null;
  const isEditingParticle = Boolean(activeParticle);
  const state = isEditingParticle ? activeParticle.icon : baseState;
  const editorStateKey = isEditingParticle ? `particle:${editorTarget.corner}` : "base";
  const contentSizeLabel = isEditingParticle ? "Content size in particle base" : "Content size in base";
  const currentBaseLabel = isEditingParticle ? "particle base" : "base";
  const selectedShapeMode = state.shape;
  const isContentSectionEnabled = state.contentEnabled;
  const isShapeSectionEnabled = state.shapeEnabled;
  const isBackLayerSectionEnabled = state.backLayerEnabled;
  const activeShapePreset =
    state.shape !== "shape"
      ? ""
      : state.widthScale === 100 && state.heightScale === 100 && state.radius >= SHAPE_RADIUS_MAX
        ? "circle"
        : state.widthScale === 170 && state.heightScale === 72 && state.radius >= SHAPE_RADIUS_MAX
          ? "pill"
          : state.widthScale === 160 && state.heightScale === 100 && state.radius === DEFAULT_STATE.radius
            ? "rectangle"
            : state.widthScale === 100 && state.heightScale === 100
              ? "square"
              : "";
  const activeMetrics = useMemo(() => getIconMetrics(state), [state]);
  const baseMetrics = useMemo(() => getIconMetrics(baseState), [baseState]);
  const linkedTextContentScaleLimit = useMemo(
    () => getLinkedTextContentScaleLimit(state, state.outline),
    [state],
  );
  const baseLinkedTextContentScaleLimit = useMemo(
    () => getLinkedTextContentScaleLimit(baseState, baseState.outline),
    [baseState],
  );
  const contentScaleMax =
    linkedTextContentScaleLimit === null
      ? ICON_SCALE_MAX
      : Math.max(state.iconScale, linkedTextContentScaleLimit);
  const baseContentScaleMax =
    baseLinkedTextContentScaleLimit === null
      ? ICON_SCALE_MAX
      : Math.max(baseState.iconScale, baseLinkedTextContentScaleLimit);
  const isTextScaleCappedByLink = useMemo(() => {
    return (
      linkedTextContentScaleLimit !== null &&
      state.iconScale >= linkedTextContentScaleLimit
    );
  }, [state.iconScale, linkedTextContentScaleLimit]);
  const isBaseTextScaleCappedByLink = useMemo(() => {
    return (
      baseLinkedTextContentScaleLimit !== null &&
      baseState.iconScale >= baseLinkedTextContentScaleLimit
    );
  }, [baseState.iconScale, baseLinkedTextContentScaleLimit]);
  const selectedFontLabel = useMemo(() => {
    const selected = FONT_OPTIONS.find((font) => font.value === state.fontFamily);
    return selected ? selected.label : state.fontFamily;
  }, [state.fontFamily]);
  const fullShareCode = useMemo(
    () => encodeState(baseState, particles, canvasSize),
    [baseState, particles, canvasSize],
  );
  const defaultShareCode = useMemo(
    () => encodeState(DEFAULT_STATE, {}, DEFAULT_CANVAS_SIZE),
    [],
  );
  const isDefaultComposition = fullShareCode === defaultShareCode;
  const urlSafeShareCode = useMemo(
    () => encodeState(baseState, particles, canvasSize, { urlSafe: true }),
    [baseState, particles, canvasSize],
  );
  const editorShareUrl = useMemo(
    () => createShareUrl(urlSafeShareCode, { destination: "editor", view: "editor" }),
    [urlSafeShareCode],
  );
  const copiedLinkShareUrl = useMemo(
    () => createShareUrl(urlSafeShareCode, { destination: "copiedLink" }),
    [urlSafeShareCode],
  );
  const builderHomeUrl = useMemo(
    () => createShareUrl("", { destination: "editor" }),
    [],
  );
  const hasImageBackedShare = useMemo(
    () => compositionUsesImageBacking(baseState, particles),
    [baseState, particles],
  );
  const particleLayers = useMemo(
    () => buildParticleLayers(baseMetrics, particles),
    [baseMetrics, particles],
  );
  const inspectTargets = useMemo(
    () => [
      ...buildInspectTargetsForIcon({ type: "base" }, baseState, baseMetrics),
      ...particleLayers.flatMap((layer) =>
        buildInspectTargetsForIcon(
          { type: "particle", corner: layer.key },
          layer.particle.icon,
          layer.metrics,
        ),
      ),
    ],
    [baseState, baseMetrics, particleLayers],
  );

  const selectedParticleLayer = isEditingParticle
    ? particleLayers.find((layer) => layer.key === editorTarget.corner) || null
    : null;

  const previewPan = useMemo(() => {
    if (!selectedParticleLayer) return { x: 0, y: 0 };
    const baseCenterX = baseMetrics.dimensions.width / 2;
    const baseCenterY = baseMetrics.dimensions.height / 2;
    const visualBounds = getIconVisualBounds(
      selectedParticleLayer.particle.icon,
      selectedParticleLayer.metrics,
    );
    const particleCenterX =
      selectedParticleLayer.placement.left + (visualBounds.minX + visualBounds.maxX) / 2;
    const particleCenterY =
      selectedParticleLayer.placement.top + (visualBounds.minY + visualBounds.maxY) / 2;
    return {
      x: (baseCenterX - particleCenterX) * 0.5,
      y: (baseCenterY - particleCenterY) * 0.5,
    };
  }, [selectedParticleLayer, baseMetrics.dimensions.width, baseMetrics.dimensions.height]);

  const compositeBounds = useMemo(
    () => getCompositeBounds(baseState, baseMetrics, particleLayers),
    [baseState, baseMetrics, particleLayers],
  );
  const preferredImageExportDimensions = useMemo(() => {
    const candidates = [];

    if (baseState.shapeEnabled && baseState.shape === "image" && baseState.baseImageData) {
      const dimensions = getExportDimensionsFromImageState(
        getImageStateForTarget(baseState, "shape"),
      );
      if (dimensions) {
        candidates.push({ ...dimensions, source: "base image" });
      }
    }

    if (baseState.contentEnabled && baseState.mode === "image" && baseState.imageData) {
      const dimensions = getExportDimensionsFromImageState(
        getImageStateForTarget(baseState, "content"),
      );
      if (dimensions) {
        candidates.push({ ...dimensions, source: "content image" });
      }
    }

    if (candidates.length === 0) return null;
    return candidates.reduce((best, candidate) =>
      candidate.width * candidate.height > best.width * best.height ? candidate : best,
    );
  }, [
    baseState.shapeEnabled,
    baseState.shape,
    baseState.baseImageData,
    baseState.baseImageWidth,
    baseState.baseImageHeight,
    baseState.baseImageCropEnabled,
    baseState.baseImageCropSize,
    baseState.contentEnabled,
    baseState.mode,
    baseState.imageData,
    baseState.imageWidth,
    baseState.imageHeight,
    baseState.imageCropEnabled,
    baseState.imageCropSize,
  ]);
  const shouldUseImportedImageExportSize =
    useImportedImageExportSize && Boolean(preferredImageExportDimensions);
  const exportTargetWidth = shouldUseImportedImageExportSize
    ? preferredImageExportDimensions.width
    : EXPORT_CANVAS_SIZE;
  const exportTargetHeight = shouldUseImportedImageExportSize
    ? preferredImageExportDimensions.height
    : EXPORT_CANVAS_SIZE;
  const previewLayout = useMemo(
    () =>
      getCompositionLayout(
        compositeBounds,
        canvasSize,
        canvasSize,
        PREVIEW_SAFE_MARGIN,
        false,
      ),
    [compositeBounds, canvasSize],
  );
  const exportLayout = useMemo(
    () =>
      getCompositionLayout(
        compositeBounds,
        exportTargetWidth,
        exportTargetHeight,
        EXPORT_SAFE_MARGIN,
        true,
      ),
    [compositeBounds, exportTargetWidth, exportTargetHeight],
  );
  const previewZoomScale = isEditingParticle ? PARTICLE_EDIT_ZOOM : 1;
  const previewCompositionTransform = `translate(${(
    previewLayout.offsetX + previewPan.x
  ).toFixed(2)}px, ${(previewLayout.offsetY + previewPan.y).toFixed(2)}px) scale(${(
    previewLayout.scale * previewZoomScale
  ).toFixed(4)})`;
  const exportCompositionTransform = `translate(${exportLayout.offsetX.toFixed(
    2,
  )}px, ${exportLayout.offsetY.toFixed(2)}px) scale(${exportLayout.scale.toFixed(4)})`;
  const exportPixelWidth = exportTargetWidth * exportScale;
  const exportPixelHeight = exportTargetHeight * exportScale;
  const exportSizeSummary = shouldUseImportedImageExportSize && preferredImageExportDimensions
    ? `${preferredImageExportDimensions.source}: ${exportTargetWidth} x ${exportTargetHeight}, export ${exportPixelWidth} x ${exportPixelHeight} at ${exportScale}x`
    : preferredImageExportDimensions
      ? `Square canvas: ${exportPixelWidth} x ${exportPixelHeight} at ${exportScale}x`
      : `${exportPixelWidth} x ${exportPixelHeight}`;
  const isHeroVisible = pageMode !== "copiedLink" && uiPhase !== "builder";
  const isWizardWorkspaceMode = workspaceMode === "wizard";
  const appHeaderTitleContent = <span className="app-header-brand">Iquan</span>;
  const specButtonClass =
    hasOpenedSpecModal || isSpecOpen
      ? "app-header-spec"
      : "app-header-spec app-header-spec-needs-attention";
  const wizardStep = WIZARD_STEPS[wizardStepIndex] || WIZARD_STEPS[0];
  const wizardStepNumber = wizardStepIndex + 1;
  const canGoBackInWizard = wizardStepIndex > 0;
  const canGoForwardInWizard = wizardStepIndex < WIZARD_STEPS.length - 1;
  const walkthroughStep =
    WIZARD_WALKTHROUGH_STEPS[walkthroughStepIndex] || WIZARD_WALKTHROUGH_STEPS[0];
  const walkthroughStepNumber = walkthroughStepIndex + 1;
  const canGoForwardInWalkthrough =
    walkthroughStepIndex < WIZARD_WALKTHROUGH_STEPS.length - 1;
  const walkthroughCardPosition = getWalkthroughCardPosition(walkthroughTargetRect);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(""), 1600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (!isWalkthroughActive || !walkthroughStep) return;

    setWorkspaceMode("wizard");

    const nextWizardStepIndex = WIZARD_STEPS.findIndex(
      (step) => step.id === walkthroughStep.wizardStepId,
    );
    if (nextWizardStepIndex >= 0 && nextWizardStepIndex !== wizardStepIndex) {
      setWizardStepIndex(nextWizardStepIndex);
    }

    controlsRef.current?.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }, [isWalkthroughActive, walkthroughStep, wizardStepIndex]);

  useEffect(() => {
    if (!isWalkthroughActive || !walkthroughStep) {
      setWalkthroughTargetRect(null);
      return undefined;
    }

    let frameId = 0;
    const updateTargetRect = () => {
      const target = document.querySelector(
        `[data-walkthrough-target="${walkthroughStep.target}"]`,
      );

      if (!target) {
        setWalkthroughTargetRect(null);
        return;
      }

      const rect = target.getBoundingClientRect();
      setWalkthroughTargetRect((current) => {
        if (
          current &&
          Math.abs(current.top - rect.top) < 1 &&
          Math.abs(current.left - rect.left) < 1 &&
          Math.abs(current.width - rect.width) < 1 &&
          Math.abs(current.height - rect.height) < 1
        ) {
          return current;
        }

        return {
          top: rect.top,
          left: rect.left,
          right: rect.right,
          bottom: rect.bottom,
          width: rect.width,
          height: rect.height,
        };
      });
    };

    const scheduleTargetRectUpdate = () => {
      window.cancelAnimationFrame(frameId);
      frameId = window.requestAnimationFrame(updateTargetRect);
    };

    scheduleTargetRectUpdate();
    const intervalId = window.setInterval(updateTargetRect, 180);
    window.addEventListener("resize", scheduleTargetRectUpdate);
    window.addEventListener("scroll", scheduleTargetRectUpdate, true);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.clearInterval(intervalId);
      window.removeEventListener("resize", scheduleTargetRectUpdate);
      window.removeEventListener("scroll", scheduleTargetRectUpdate, true);
    };
  }, [isWalkthroughActive, walkthroughStep, wizardStepIndex, previewContextMode]);

  useEffect(() => {
    if (pageMode === "copiedLink" || uiPhase !== "landing") return undefined;

    const swapHeroSample = () => {
      setHeroSamples((current) => {
        if (current.length === 0) return current;
        const index = Math.floor(Math.random() * current.length);
        const next = [...current];
        next[index] = createHeroSampleItem(index, current[index]?.blueprintKey);
        return next;
      });
    };

    const delayTimer = window.setTimeout(() => {
      swapHeroSample();
      const intervalId = window.setInterval(swapHeroSample, HERO_SAMPLE_SWAP_MS);
      heroSampleIntervalRef.current = intervalId;
    }, HERO_SAMPLE_SWAP_DELAY_MS);

    return () => {
      window.clearTimeout(delayTimer);
      if (heroSampleIntervalRef.current) {
        window.clearInterval(heroSampleIntervalRef.current);
        heroSampleIntervalRef.current = null;
      }
    };
  }, [pageMode, uiPhase]);

  useEffect(() => {
    if (hasHydratedFromUrlRef.current) return;

    const hydration = resolveUrlHydration(
      new URL(window.location.href),
      fallbackUrlSafeShareCode,
    );

    if (hydration.status === "valid") {
      skipNextShareUrlSyncRef.current = hydration.shareCode !== urlSafeShareCode;
      setLoadCode(hydration.shareCode);
      setBaseState(hydration.decoded.base);
      setParticles(hydration.decoded.particles);
      setCanvasSize(hydration.decoded.canvasSize);
      setEditorTarget({ type: "base" });
      if (pageMode === "copiedLink") {
        setSharePageStatus(hydration.missingSharedImages ? "unsupported-images" : "valid");
      } else {
        setToast("Loaded code from URL");
      }
    } else if (hydration.status === "invalid") {
      setLoadCode(hydration.invalidCode);
      if (pageMode === "copiedLink") {
        setSharePageStatus("invalid");
      } else {
        setToast("URL code is invalid");
      }
    } else if (pageMode === "copiedLink") {
      setSharePageStatus("missing");
    }

    hasHydratedFromUrlRef.current = true;
  }, [fallbackUrlSafeShareCode, pageMode, urlSafeShareCode]);

  useEffect(() => {
    if (!hasHydratedFromUrlRef.current) return;
    if (skipNextShareUrlSyncRef.current) {
      skipNextShareUrlSyncRef.current = false;
      return;
    }
    if (
      pageMode === "copiedLink" &&
      sharePageStatus !== "valid" &&
      sharePageStatus !== "unsupported-images"
    ) {
      return;
    }
    const nextUrl = createShareUrl(urlSafeShareCode, {
      destination: pageMode,
      view: pageMode === "editor" && workspaceMode === "editor" ? "editor" : undefined,
    });
    if (nextUrl !== window.location.href) {
      window.history.replaceState(null, "", nextUrl);
    }
  }, [pageMode, sharePageStatus, urlSafeShareCode, workspaceMode]);

  useEffect(() => {
    if (editorTarget.type !== "particle") return;
    if (particles[editorTarget.corner]) return;
    setEditorTarget({ type: "base" });
  }, [editorTarget, particles]);

  useEffect(() => {
    if (state.mode !== "none") {
      lastEnabledContentModeRef.current[editorStateKey] = state.mode;
    }
  }, [editorStateKey, state.mode]);

  useEffect(() => {
    if (state.shape !== "none") {
      lastEnabledShapeRef.current[editorStateKey] = state.shape;
    }
  }, [editorStateKey, state.shape]);

  useEffect(() => {
    if (state.backDistance > 0) {
      lastEnabledBackLayerRef.current[editorStateKey] = {
        backDistance: state.backDistance,
        backAngle: state.backAngle,
      };
    }
  }, [editorStateKey, state.backAngle, state.backDistance]);

  useEffect(() => {
    const currentSnapshot = cloneHistorySnapshot(createHistorySnapshot());
    const history = historyRef.current;

    if (!history.lastSnapshot) {
      history.lastSnapshot = currentSnapshot;
      syncHistoryAvailability();
      return;
    }

    if (history.isApplying) {
      history.lastSnapshot = currentSnapshot;
      history.isApplying = false;
      syncHistoryAvailability();
      return;
    }

    history.past.push(history.lastSnapshot);
    if (history.past.length > HISTORY_LIMIT) {
      history.past.shift();
    }
    history.future = [];
    history.lastSnapshot = currentSnapshot;
    syncHistoryAvailability();
  }, [baseState, particles, canvasSize, editorTarget]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setShareOpen(false);
        setInfoOpen(false);
        setSpecOpen(false);
        setIconPickerOpen(false);
        setFontPickerOpen(false);
        setSelectMenuOpen(false);
        setHighlightedInspectId("");
        setImageCropState((current) => ({ ...current, open: false }));
        setCursorTooltip(null);
        setWalkthroughActive(false);
        setWalkthroughRequested(false);
        setWalkthroughTargetRect(null);
        return;
      }

      if (event.isComposing || isEditableKeyTarget(event.target)) return;

      const key = event.key.toLowerCase();
      const hasModifier = event.metaKey || event.ctrlKey;
      const isUndoShortcut = key === "z" && hasModifier && !event.shiftKey && !event.altKey;
      const isRedoShortcut =
        key === "z" &&
        !event.altKey &&
        (event.shiftKey || (hasModifier && event.shiftKey));

      if (isUndoShortcut) {
        event.preventDefault();
        handleUndo();
      } else if (isRedoShortcut) {
        event.preventDefault();
        handleRedo();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    return () => {
      if (heroTransitionTimerRef.current) {
        window.clearTimeout(heroTransitionTimerRef.current);
      }
      if (heroSampleIntervalRef.current) {
        window.clearInterval(heroSampleIntervalRef.current);
      }
    };
  }, []);

  const startWizardWalkthrough = () => {
    setWalkthroughRequested(true);
    setWalkthroughTargetRect(null);
    setWalkthroughStepIndex(0);
    setWizardStepIndex(0);
    setWorkspaceMode("wizard");
    setWalkthroughActive(true);
  };

  const handleWalkthroughSkip = () => {
    setWalkthroughActive(false);
    setWalkthroughRequested(false);
    setWalkthroughTargetRect(null);
  };

  const handleWalkthroughFinish = () => {
    setWalkthroughActive(false);
    setWalkthroughRequested(false);
    setWalkthroughTargetRect(null);
    setWalkthroughStepIndex(0);
    setWizardStepIndex(0);
    controlsRef.current?.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  };

  const handleWalkthroughNext = () => {
    if (!canGoForwardInWalkthrough) {
      handleWalkthroughFinish();
      return;
    }

    const nextIndex = walkthroughStepIndex + 1;
    const nextStep = WIZARD_WALKTHROUGH_STEPS[nextIndex];
    const nextWizardStepIndex = WIZARD_STEPS.findIndex(
      (step) => step.id === nextStep.wizardStepId,
    );

    setWalkthroughTargetRect(null);
    setWalkthroughStepIndex(nextIndex);
    if (nextWizardStepIndex >= 0) {
      setWizardStepIndex(nextWizardStepIndex);
    }
  };

  const handleStartBuilder = () => {
    if (uiPhase !== "landing") return;

    setWorkspaceMode("wizard");
    setWizardStepIndex(0);
    setWalkthroughStepIndex(0);
    setUiPhase("transitioning");
    if (heroTransitionTimerRef.current) {
      window.clearTimeout(heroTransitionTimerRef.current);
    }

    heroTransitionTimerRef.current = window.setTimeout(() => {
      setUiPhase("builder");
      if (walkthroughRequested) {
        startWizardWalkthrough();
      }
      heroTransitionTimerRef.current = null;
    }, LANDING_TO_BUILDER_MS);
  };

  const handleWalkthroughToggle = (event) => {
    const checked = event.currentTarget.checked;
    setWalkthroughRequested(checked);
    if (!checked) {
      setWalkthroughActive(false);
      setWalkthroughTargetRect(null);
      return;
    }

    if (!isHeroVisible && isWizardWorkspaceMode) {
      startWizardWalkthrough();
    }
  };

  const handleReturnToLanding = () => {
    if (heroTransitionTimerRef.current) {
      window.clearTimeout(heroTransitionTimerRef.current);
      heroTransitionTimerRef.current = null;
    }
    if (controlsRef.current) {
      controlsRef.current.scrollTop = 0;
      controlsRef.current.scrollLeft = 0;
    }
    setEditorTarget({ type: "base" });
    setWorkspaceMode("wizard");
    setWizardStepIndex(0);
    setPreviewContextMode(DEFAULT_PREVIEW_CONTEXT_MODE);
    setInfoOpen(false);
    setSpecOpen(false);
    setShareOpen(false);
    setIconPickerOpen(false);
    setFontPickerOpen(false);
    setSelectMenuOpen(false);
    setHighlightedInspectId("");
    setImageCropState((current) => ({ ...current, open: false }));
    setCursorTooltip(null);
    setWalkthroughActive(false);
    setWalkthroughTargetRect(null);
    setUiPhase("landing");
  };

  const handleOpenEditor = () => {
    if (controlsRef.current) {
      controlsRef.current.scrollTop = 0;
      controlsRef.current.scrollLeft = 0;
    }
    setWalkthroughActive(false);
    setWalkthroughTargetRect(null);
    setWorkspaceMode("editor");
    setUiPhase("builder");
  };

  const handleOpenLandingImport = () => {
    setLoadCode("");
    setShareOpen(true);
  };

  const handleOpenWizard = () => {
    if (controlsRef.current) {
      controlsRef.current.scrollTop = 0;
      controlsRef.current.scrollLeft = 0;
    }
    setEditorTarget({ type: "base" });
    setWorkspaceMode("wizard");
    setUiPhase("builder");
    if (walkthroughRequested) {
      startWizardWalkthrough();
    }
  };

  const handleWizardBack = () => {
    setWizardStepIndex((index) => Math.max(0, index - 1));
    controlsRef.current?.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  };

  const handleWizardNext = () => {
    setWizardStepIndex((index) => Math.min(WIZARD_STEPS.length - 1, index + 1));
    controlsRef.current?.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  };

  const handleWizardParticleAdd = (cornerKey) => {
    handleCornerAddOrSelect(cornerKey);
    setWorkspaceMode("editor");
    setUiPhase("builder");
  };

  const updateActiveState = (updater) => {
    if (isEditingParticle) {
      setParticles((current) => {
        const targetParticle = current[editorTarget.corner];
        if (!targetParticle) return current;
        const nextIcon = sanitizeIconState(updater(targetParticle.icon));
        return {
          ...current,
          [editorTarget.corner]: {
            ...targetParticle,
            icon: nextIcon,
          },
        };
      });
      return;
    }

    setBaseState((current) => sanitizeIconState(updater(current)));
  };

  const patchState = (patch) => {
    updateActiveState((current) => ({ ...current, ...patch }));
  };

  const handleShapeModeChange = (shapeMode) => {
    if (shapeMode === "folder") {
      patchState({
        shape: "folder",
        widthScale: state.shape === "folder" ? state.widthScale : 140,
        heightScale: state.shape === "folder" ? state.heightScale : 96,
        radius: state.shape === "folder" ? state.radius : 18,
      });
      return;
    }

    patchState({ shape: shapeMode === "shape" ? "shape" : shapeMode });
  };

  const handleContentSectionEnabledChange = (enabled) => {
    const fallbackMode = lastEnabledContentModeRef.current[editorStateKey] || DEFAULT_STATE.mode;
    patchState({
      contentEnabled: enabled,
      mode: enabled && state.mode === "none" ? fallbackMode : state.mode,
    });
  };

  const handleShapeSectionEnabledChange = (enabled) => {
    const fallbackShape = lastEnabledShapeRef.current[editorStateKey] || DEFAULT_STATE.shape;
    patchState({
      shapeEnabled: enabled,
      shape: enabled && state.shape === "none" ? fallbackShape : state.shape,
    });
  };

  const handleBackLayerSectionEnabledChange = (enabled) => {
    const fallbackBackLayer = lastEnabledBackLayerRef.current[editorStateKey] || {
      backDistance: 10,
      backAngle: state.backAngle,
    };
    patchState({
      backLayerEnabled: enabled,
      backDistance:
        enabled && state.backDistance === 0 ? fallbackBackLayer.backDistance : state.backDistance,
      backAngle: enabled ? fallbackBackLayer.backAngle : state.backAngle,
    });
  };

  const applyShapePreset = (preset) => {
    const presetPatch =
      preset === "circle"
        ? { shape: "shape", widthScale: 100, heightScale: 100, radius: SHAPE_RADIUS_MAX }
        : preset === "pill"
          ? { shape: "shape", widthScale: 170, heightScale: 72, radius: SHAPE_RADIUS_MAX }
          : preset === "rectangle"
            ? { shape: "shape", widthScale: 160, heightScale: 100, radius: DEFAULT_STATE.radius }
            : { shape: "shape", widthScale: 100, heightScale: 100, radius: DEFAULT_STATE.radius };

    patchState(presetPatch);
  };

  const handleUndo = () => {
    const history = historyRef.current;
    if (history.past.length === 0) return;

    const currentSnapshot = history.lastSnapshot || cloneHistorySnapshot(createHistorySnapshot());
    const previousSnapshot = history.past.pop();
    history.future.push(currentSnapshot);
    history.isApplying = true;
    history.lastSnapshot = previousSnapshot;
    applyHistorySnapshot(previousSnapshot);
    syncHistoryAvailability();
  };

  const handleRedo = () => {
    const history = historyRef.current;
    if (history.future.length === 0) return;

    const currentSnapshot = history.lastSnapshot || cloneHistorySnapshot(createHistorySnapshot());
    const nextSnapshot = history.future.pop();
    history.past.push(currentSnapshot);
    if (history.past.length > HISTORY_LIMIT) {
      history.past.shift();
    }
    history.isApplying = true;
    history.lastSnapshot = nextSnapshot;
    applyHistorySnapshot(nextSnapshot);
    syncHistoryAvailability();
  };

  const handleIconScaleChange = (nextScale) => {
    let shouldOpenTextSizingControls = false;
    updateActiveState((current) => {
      const clampedScale = clamp(nextScale, ICON_SCALE_MIN, ICON_SCALE_MAX);
      const nextIconScale = resolveIconScaleForStateChange(current, nextScale);

      if (nextIconScale < clampedScale) {
        shouldOpenTextSizingControls = true;
      }

      if (nextIconScale === current.iconScale) return current;

      return { ...current, iconScale: nextIconScale };
    });

    if (shouldOpenTextSizingControls) {
      setContentAdvancedOpen(true);
    }
  };

  const handleContentZoneChange = (contentOffsetX, contentOffsetY) => {
    patchState({
      contentOffsetX,
      contentOffsetY,
    });
  };

  const handleResetContentZone = () => {
    patchState({
      contentOffsetX: DEFAULT_STATE.contentOffsetX,
      contentOffsetY: DEFAULT_STATE.contentOffsetY,
    });
  };

  const handleCenterContentToBase = () => {
    updateActiveState((current) => ({
      ...current,
      contentOffsetX: clamp(current.shapeOffsetX, -PART_OFFSET_LIMIT, PART_OFFSET_LIMIT),
      contentOffsetY: clamp(current.shapeOffsetY, -PART_OFFSET_LIMIT, PART_OFFSET_LIMIT),
    }));
  };

  const handleCenterBaseToIcon = () => {
    updateActiveState((current) => ({
      ...current,
      contentOffsetX: clamp(
        current.contentOffsetX - current.shapeOffsetX,
        -PART_OFFSET_LIMIT,
        PART_OFFSET_LIMIT,
      ),
      contentOffsetY: clamp(
        current.contentOffsetY - current.shapeOffsetY,
        -PART_OFFSET_LIMIT,
        PART_OFFSET_LIMIT,
      ),
      shapeOffsetX: DEFAULT_STATE.shapeOffsetX,
      shapeOffsetY: DEFAULT_STATE.shapeOffsetY,
    }));
  };

  const copyToClipboard = async (value, successMessage) => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
      } else if (!fallbackCopyToClipboard(value)) {
        throw new Error("Clipboard fallback failed");
      }
      setToast(successMessage);
    } catch {
      try {
        if (!fallbackCopyToClipboard(value)) {
          throw new Error("Clipboard fallback failed");
        }
        setToast(successMessage);
      } catch {
        setToast("Clipboard access blocked");
      }
    }
  };

  const handleOpenSpecModal = () => {
    setHasOpenedSpecModal(true);
    try {
      window.localStorage.setItem("iquan-spec-modal-opened", "true");
    } catch {
      // Ignore storage failures; the in-memory state still stops the prompt for this session.
    }
    setInfoOpen(false);
    setSpecOpen(true);
  };

  const handleDownloadIquanSpec = () => {
    const blob = new Blob([iquanSpecMarkdown], { type: "text/markdown;charset=utf-8" });
    triggerDownloadBlob(blob, "IQUAN_SPEC.md");
    setToast("IQUAN_SPEC.md downloaded");
  };

  const handleCopyIquanSpec = () => {
    copyToClipboard(iquanSpecMarkdown, "IQUAN_SPEC.md copied");
  };

  const handleCopyShareLink = () => {
    if (hasImageBackedShare) {
      setToast("Copied links do not support uploaded images yet. Use Copy code for full fidelity.");
      return;
    }
    copyToClipboard(copiedLinkShareUrl, "Share link copied");
  };

  const handleExport = async () => {
    if (!exportRef.current) return;

    try {
      const dataUrl = await toPng(exportRef.current, {
        pixelRatio: exportScale,
        cacheBust: true,
        backgroundColor: "transparent",
      });

      const namePart =
        baseState.mode === "text"
          ? (baseState.content || "icon").trim().replace(/\s+/g, "-").toLowerCase()
          : baseState.mode === "image"
            ? sanitizeFilename(baseState.imageName || "image")
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-|-$/g, "")
            : baseMetrics.iconName;

      triggerDownloadUrl(
        dataUrl,
        `icon-${namePart || "icon"}-${exportTargetWidth}x${exportTargetHeight}@${exportScale}x.png`,
      );
      setToast(`PNG exported (${exportPixelWidth} x ${exportPixelHeight})`);
    } catch {
      setToast("Export failed");
    }
  };

  const applyDecodedComposition = (next, options = {}) => {
    setBaseState(next.base);
    setParticles(next.particles);
    setCanvasSize(next.canvasSize);
    setEditorTarget({ type: "base" });
    setLoadCode(options.loadCode ?? encodeState(next.base, next.particles, next.canvasSize));
    setShareOpen(false);
    setToast(options.toast || "Project loaded");
  };

  const handleLoadIquanLogo = () => {
    try {
      const next = decodeState(IQUAN_LOGO_CODE);
      applyDecodedComposition(next, {
        loadCode: IQUAN_LOGO_CODE,
        toast: "Loaded iquan logo",
      });
    } catch {
      setToast("Could not load iquan logo");
    }
  };

  const handleLoadCode = () => {
    try {
      const trimmed = loadCode.trim();
      const isProjectFile = trimmed.startsWith("{");
      const next = decodeProjectOrShareInput(trimmed);
      applyDecodedComposition(next, {
        loadCode: isProjectFile ? encodeState(next.base, next.particles, next.canvasSize) : resolveShareCodeInput(trimmed),
        toast: isProjectFile ? "Project loaded" : "Code loaded",
      });
      if (uiPhase === "landing") {
        setWorkspaceMode("wizard");
        setWizardStepIndex(0);
        setUiPhase("builder");
      }
    } catch (error) {
      setToast(error.message || "Invalid code");
    }
  };

  const handleExportProject = () => {
    const title =
      baseState.mode === "text"
        ? `${baseState.content || "Icon"} icon`
        : baseState.mode === "image"
          ? `${sanitizeFilename(baseState.imageName || "image")} icon`
          : `${baseMetrics.iconName || "Iquan"} icon`;
    const fileBase = sanitizeFilename(title)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "iquan-project";
    const json = encodeProjectPayload(baseState, particles, canvasSize, {
      title,
      createdAt: new Date().toISOString(),
    });
    const blob = new Blob([json], { type: "application/json" });
    triggerDownloadBlob(blob, `${fileBase}.iquan.json`);
    setToast("Iquan project file exported");
  };

  const handleImportProjectClick = () => {
    projectFileInputRef.current?.click();
  };

  const handleProjectFileChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    try {
      const text = await file.text();
      const next = decodeProjectPayload(text);
      applyDecodedComposition(next, {
        loadCode: encodeState(next.base, next.particles, next.canvasSize),
        toast: "Project file imported",
      });
    } catch (error) {
      setToast(error.message || "Project import failed");
    }
  };

  const handlePasteCode = async () => {
    try {
      const value = await navigator.clipboard.readText();
      setLoadCode(value);
      setToast("Code pasted");
    } catch {
      setToast("Clipboard read blocked");
    }
  };

  const handleSelectLucide = (iconName) => {
    patchState({ lucide: iconName, mode: "icon" });
    setIconPickerOpen(false);
    setToast(`Loaded ${iconName}`);
  };

  const handleSelectFont = (fontFamily) => {
    patchState({ fontFamily });
    setFontPickerOpen(false);
  };

  const closeImageCropModal = () => {
    setImageCropState((current) => ({ ...current, open: false }));
  };

  const openImageCropModal = ({
    targetKind = "content",
    sourceType,
    imageData,
    imageName,
    imageWidth,
    imageHeight,
    draft,
  }) => {
    setImageCropState({
      open: true,
      targetKind,
      sourceType,
      imageData,
      imageName,
      imageWidth,
      imageHeight,
      draft: clampCropDraft(
        draft || getCenteredCropDraft(imageWidth, imageHeight),
        imageWidth,
        imageHeight,
      ),
    });
  };

  const applyImageToActiveState = ({
    targetKind = "content",
    imageData,
    imageName,
    imageWidth,
    imageHeight,
    cropEnabled,
    cropDraft,
    resetAdjustments,
  }) => {
    const safeCropDraft = clampCropDraft(cropDraft, imageWidth, imageHeight);
    const currentImageState = getImageStateForTarget(state, targetKind);
    const nextImageState = {
      imageData,
      imageName,
      imageWidth,
      imageHeight,
      imageCropEnabled: cropEnabled,
      imageCropX: cropEnabled ? safeCropDraft.x : DEFAULT_STATE.imageCropX,
      imageCropY: cropEnabled ? safeCropDraft.y : DEFAULT_STATE.imageCropY,
      imageCropSize: cropEnabled ? safeCropDraft.size : DEFAULT_STATE.imageCropSize,
      imageRotation: resetAdjustments
        ? DEFAULT_STATE.imageRotation
        : currentImageState.imageRotation,
      imageHue: resetAdjustments
        ? DEFAULT_STATE.imageHue
        : currentImageState.imageHue,
      imageContrast: resetAdjustments
        ? DEFAULT_STATE.imageContrast
        : currentImageState.imageContrast,
      imageBrightness: resetAdjustments
        ? DEFAULT_STATE.imageBrightness
        : currentImageState.imageBrightness,
      imageSilhouette: resetAdjustments
        ? DEFAULT_STATE.imageSilhouette
        : currentImageState.imageSilhouette,
      imageSilhouetteColor: resetAdjustments
        ? DEFAULT_STATE.imageSilhouetteColor
        : currentImageState.imageSilhouetteColor,
      imageEdgeStroke: resetAdjustments
        ? DEFAULT_STATE.imageEdgeStroke
        : currentImageState.imageEdgeStroke,
      imageEdgeStrokeColor: resetAdjustments
        ? DEFAULT_STATE.imageEdgeStrokeColor
        : currentImageState.imageEdgeStrokeColor,
    };

    patchState({
      ...(targetKind === "content" ? { mode: "image" } : {}),
      ...getImagePatchForTarget(targetKind, nextImageState),
    });
  };

  const handleUploadImageClick = (targetKind = "content") => {
    if (targetKind === "shape") {
      shapeImageUploadInputRef.current?.click();
      return;
    }
    contentImageUploadInputRef.current?.click();
  };

  const handleImageFileChange = async (event, targetKind = "content") => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setToast("Please upload an image file.");
      return;
    }

    try {
      const normalized = await normalizeUploadedImage(file);
      openImageCropModal({
        targetKind,
        sourceType: "upload",
        imageData: normalized.data,
        imageName: normalized.name,
        imageWidth: normalized.width,
        imageHeight: normalized.height,
        draft: getCenteredCropDraft(normalized.width, normalized.height),
      });
    } catch {
      setToast("Image upload failed");
    }
  };

  const handleRecropExistingImage = (targetKind = "content") => {
    const imageState = getImageStateForTarget(state, targetKind);
    if (!imageState.imageData || !imageState.imageWidth || !imageState.imageHeight) return;
    const draft = imageState.imageCropEnabled
      ? {
          size: imageState.imageCropSize,
          x: imageState.imageCropX,
          y: imageState.imageCropY,
        }
      : getCenteredCropDraft(imageState.imageWidth, imageState.imageHeight);

    openImageCropModal({
      targetKind,
      sourceType: "existing",
      imageData: imageState.imageData,
      imageName: imageState.imageName || "image",
      imageWidth: imageState.imageWidth,
      imageHeight: imageState.imageHeight,
      draft,
    });
  };

  const handleApplySquareCrop = () => {
    applyImageToActiveState({
      targetKind: imageCropState.targetKind,
      imageData: imageCropState.imageData,
      imageName: imageCropState.imageName,
      imageWidth: imageCropState.imageWidth,
      imageHeight: imageCropState.imageHeight,
      cropEnabled: true,
      cropDraft: imageCropState.draft,
      resetAdjustments: imageCropState.sourceType === "upload",
    });
    setImageCropState((current) => ({ ...current, open: false }));
    setToast(`${imageCropState.targetKind === "shape" ? "Shape image" : "Image"} square crop applied`);
  };

  const handleKeepOriginalImage = () => {
    applyImageToActiveState({
      targetKind: imageCropState.targetKind,
      imageData: imageCropState.imageData,
      imageName: imageCropState.imageName,
      imageWidth: imageCropState.imageWidth,
      imageHeight: imageCropState.imageHeight,
      cropEnabled: false,
      cropDraft: imageCropState.draft,
      resetAdjustments: imageCropState.sourceType === "upload",
    });
    setImageCropState((current) => ({ ...current, open: false }));
    setToast(`${imageCropState.targetKind === "shape" ? "Shape image" : "Image"} kept original`);
  };

  const handleRemoveImage = (targetKind = "content") => {
    patchState(getDefaultImagePatchForTarget(targetKind));
    setToast(`${targetKind === "shape" ? "Shape image" : "Image"} removed`);
  };

  const handleColorChange = (field, value) => {
    patchState({ [field]: value });
  };

  const handleGradientStopChange = (field, index, value) => {
    updateActiveState((current) => {
      const nextStops = [...current[field]];
      if (!nextStops[index]) return current;
      nextStops[index] = sanitizeHexColor(value, nextStops[index]);
      return { ...current, [field]: nextStops };
    });
  };

  const handleGradientStopAdd = (field) => {
    updateActiveState((current) => {
      const currentStops = current[field];
      if (currentStops.length >= MAX_GRADIENT_STOPS) return current;
      const lastStop = currentStops[currentStops.length - 1] || "#ffffff";
      return {
        ...current,
        [field]: [...currentStops, lastStop],
      };
    });
  };

  const handleGradientStopRemove = (field, index) => {
    updateActiveState((current) => {
      const currentStops = current[field];
      if (currentStops.length <= 1 || !currentStops[index]) return current;
      const nextStops = currentStops.filter((_, stopIndex) => stopIndex !== index);
      return {
        ...current,
        [field]: nextStops,
      };
    });
  };

  const handleCanvasSizeChange = (nextSize) => {
    setCanvasSize(clamp(nextSize, CANVAS_SIZE_MIN, CANVAS_SIZE_MAX));
  };

  const handleBackLayerChange = (backDistance, backAngle) => {
    updateActiveState((current) => ({
      ...current,
      backDistance: isBackDistanceLocked ? current.backDistance : backDistance,
      backAngle: isBackAngleLocked ? current.backAngle : backAngle,
    }));
  };

  const handleParticleOffsetChange = (nextOffsetX, nextOffsetY) => {
    if (!isEditingParticle) return;
    const cornerKey = editorTarget.corner;
    setParticles((current) => {
      const targetParticle = current[cornerKey];
      if (!targetParticle) return current;
      const safeOffsetX = clamp(
        parseFloatOr(nextOffsetX, targetParticle.offsetX),
        -PARTICLE_OFFSET_LIMIT,
        PARTICLE_OFFSET_LIMIT,
      );
      const safeOffsetY = clamp(
        parseFloatOr(nextOffsetY, targetParticle.offsetY),
        -PARTICLE_OFFSET_LIMIT,
        PARTICLE_OFFSET_LIMIT,
      );
      if (
        safeOffsetX === targetParticle.offsetX &&
        safeOffsetY === targetParticle.offsetY
      ) {
        return current;
      }
      return {
        ...current,
        [cornerKey]: {
          ...targetParticle,
          offsetX: safeOffsetX,
          offsetY: safeOffsetY,
        },
      };
    });
  };

  const handleParticleNudge = (deltaX, deltaY) => {
    if (!isEditingParticle || !activeParticle) return;
    handleParticleOffsetChange(activeParticle.offsetX + deltaX, activeParticle.offsetY + deltaY);
  };

  const handleResetBuilder = () => {
    setBaseState(DEFAULT_STATE);
    setParticles({});
    setCanvasSize(DEFAULT_CANVAS_SIZE);
    setEditorTarget({ type: "base" });
    setLoadCode("");
    setShareOpen(false);
    setInfoOpen(false);
    setIconPickerOpen(false);
    setFontPickerOpen(false);
    setSelectMenuOpen(false);
    setHighlightedInspectId("");
    setContentAdvancedOpen(false);
    setShapeAdvancedOpen(false);
    setBackDistanceLocked(false);
    setBackAngleLocked(false);
    setExportScale(DEFAULT_EXPORT_SCALE);
    setPreviewContextMode(DEFAULT_PREVIEW_CONTEXT_MODE);
    setCursorTooltip(null);
    setImageCropState(createDefaultImageCropState());
    setWorkspaceMode("wizard");
    setWizardStepIndex(0);
    setToast("Everything reset");
  };

  const handleApplyStarterTemplate = (template) => {
    const nextBase = sanitizeIconState({ ...DEFAULT_STATE, ...template.base });
    setBaseState(nextBase);
    setParticles(sanitizeParticlesMap(template.particles, nextBase));
    setCanvasSize(template.canvasSize || DEFAULT_CANVAS_SIZE);
    setEditorTarget({ type: "base" });
    setWorkspaceMode("wizard");
    setWizardStepIndex(0);
    setUiPhase("builder");
    setToast(`${template.title} template loaded`);
  };

  const quickPreviewSize = 60;
  const quickPreviewScale = getContextScale(quickPreviewSize, compositeBounds);
  const messageInlineScale = getContextScale(20, compositeBounds);
  const messageLargeScale = getContextScale(54, compositeBounds);
  const messageReactionScale = getContextScale(16, compositeBounds);
  const contextOffsetX = -compositeBounds.minX;
  const contextOffsetY = -compositeBounds.minY;

  const handleSelectBase = () => {
    setEditorTarget({ type: "base" });
  };

  const handleCornerAddOrSelect = (cornerKey) => {
    const hadParticle = Boolean(particles[cornerKey]);
    setParticles((current) => {
      if (current[cornerKey]) return current;
      return {
        ...current,
        [cornerKey]: createDefaultParticle(baseState, cornerKey),
      };
    });
    setEditorTarget({ type: "particle", corner: cornerKey });
    setToast(`${hadParticle ? "Editing" : "Added"} ${getCornerLabel(cornerKey)} particle`);
  };

  const handleSelectParticle = (cornerKey) => {
    if (!particles[cornerKey]) return;
    setEditorTarget({ type: "particle", corner: cornerKey });
    setToast(`Editing ${getCornerLabel(cornerKey)} particle`);
  };

  const patchInspectTargetIcon = (selection, patcher) => {
    if (selection.target.type === "particle") {
      setParticles((current) => {
        const targetParticle = current[selection.target.corner];
        if (!targetParticle) return current;
        return {
          ...current,
          [selection.target.corner]: {
            ...targetParticle,
            icon: sanitizeIconState({
              ...targetParticle.icon,
              ...patcher(targetParticle.icon),
            }),
          },
        };
      });
      return;
    }

    setBaseState((current) =>
      sanitizeIconState({
        ...current,
        ...patcher(current),
      }),
    );
  };

  const handleDragInspectPart = (selection, deltaX, deltaY) => {
    if (!selection || (selection.part !== "content" && selection.part !== "base")) return;
    setHighlightedInspectId(selection.id);

    if (selection.target.type === "particle" && selection.part === "base") {
      setParticles((current) => {
        const targetParticle = current[selection.target.corner];
        if (!targetParticle) return current;
        return {
          ...current,
          [selection.target.corner]: {
            ...targetParticle,
            offsetX: clamp(targetParticle.offsetX + deltaX, -PARTICLE_OFFSET_LIMIT, PARTICLE_OFFSET_LIMIT),
            offsetY: clamp(targetParticle.offsetY + deltaY, -PARTICLE_OFFSET_LIMIT, PARTICLE_OFFSET_LIMIT),
          },
        };
      });
      return;
    }

    patchInspectTargetIcon(selection, (iconState) => {
      if (selection.part === "content") {
        return {
          contentOffsetX: clamp(iconState.contentOffsetX + deltaX, -PART_OFFSET_LIMIT, PART_OFFSET_LIMIT),
          contentOffsetY: clamp(iconState.contentOffsetY + deltaY, -PART_OFFSET_LIMIT, PART_OFFSET_LIMIT),
        };
      }

      return {
        shapeOffsetX: clamp(iconState.shapeOffsetX + deltaX, -PART_OFFSET_LIMIT, PART_OFFSET_LIMIT),
        shapeOffsetY: clamp(iconState.shapeOffsetY + deltaY, -PART_OFFSET_LIMIT, PART_OFFSET_LIMIT),
      };
    });
  };

  const handleResizeInspectPart = (
    selection,
    handle,
    deltaX,
    deltaY,
    constrainProportions = false,
  ) => {
    if (!selection || (selection.part !== "content" && selection.part !== "base")) return;
    const horizontalSign = handle.includes("e") ? 1 : -1;
    const verticalSign = handle.includes("s") ? 1 : -1;
    const signedDeltaX = deltaX * horizontalSign;
    const signedDeltaY = deltaY * verticalSign;
    setHighlightedInspectId(selection.id);

    patchInspectTargetIcon(selection, (iconState) => {
      const metrics = getIconMetrics(iconState);

      if (selection.part === "content") {
        const bounds = getInspectContentBounds(iconState, metrics);
        const sizeReference = Math.max(1, (bounds.width + bounds.height) / 2);
        const scaleInputDelta = constrainProportions
          ? Math.abs(signedDeltaX) > Math.abs(signedDeltaY)
            ? signedDeltaX
            : signedDeltaY
          : (signedDeltaX + signedDeltaY) / 2;
        const scaleDelta = (scaleInputDelta / sizeReference) * 100;
        return {
          iconScale: resolveIconScaleForStateChange(
            iconState,
            iconState.iconScale + scaleDelta,
          ),
          contentOffsetX: clamp(
            iconState.contentOffsetX + deltaX / 2,
            -PART_OFFSET_LIMIT,
            PART_OFFSET_LIMIT,
          ),
          contentOffsetY: clamp(
            iconState.contentOffsetY + deltaY / 2,
            -PART_OFFSET_LIMIT,
            PART_OFFSET_LIMIT,
          ),
        };
      }

      const aspectRatio = metrics.dimensions.width / Math.max(1, metrics.dimensions.height);
      let widthDelta = signedDeltaX;
      let heightDelta = signedDeltaY;

      if (constrainProportions) {
        const widthDeltaFromY = signedDeltaY * aspectRatio;
        widthDelta =
          Math.abs(signedDeltaX) > Math.abs(widthDeltaFromY)
            ? signedDeltaX
            : widthDeltaFromY;
        heightDelta = widthDelta / Math.max(0.001, aspectRatio);
      }

      const nextWidth = Math.max(ICON_BASE_SIZE_MIN, metrics.dimensions.width + widthDelta);
      const nextHeight = Math.max(ICON_BASE_SIZE_MIN, metrics.dimensions.height + heightDelta);
      const appliedDeltaX = constrainProportions ? widthDelta * horizontalSign : deltaX;
      const appliedDeltaY = constrainProportions ? heightDelta * verticalSign : deltaY;
      if (iconState.shape !== "shape" && iconState.shape !== "folder") {
        return {
          size: clamp((nextWidth + nextHeight) / 2, ICON_BASE_SIZE_MIN, ICON_BASE_SIZE_MAX),
          shapeOffsetX: clamp(iconState.shapeOffsetX + appliedDeltaX / 2, -PART_OFFSET_LIMIT, PART_OFFSET_LIMIT),
          shapeOffsetY: clamp(iconState.shapeOffsetY + appliedDeltaY / 2, -PART_OFFSET_LIMIT, PART_OFFSET_LIMIT),
        };
      }

      return {
        widthScale: clamp((nextWidth / Math.max(1, iconState.size)) * 100, ICON_SCALE_MIN, 260),
        heightScale: clamp(
          (nextHeight / Math.max(1, iconState.size)) * 100,
          SHAPE_HEIGHT_SCALE_MIN,
          SHAPE_HEIGHT_SCALE_MAX,
        ),
        shapeOffsetX: clamp(iconState.shapeOffsetX + appliedDeltaX / 2, -PART_OFFSET_LIMIT, PART_OFFSET_LIMIT),
        shapeOffsetY: clamp(iconState.shapeOffsetY + appliedDeltaY / 2, -PART_OFFSET_LIMIT, PART_OFFSET_LIMIT),
      };
    });
  };

  const handleSelectInspectPart = (selection) => {
    if (!selection) return;

    if (selection.target.type === "particle") {
      if (!particles[selection.target.corner]) return;
      setEditorTarget({ type: "particle", corner: selection.target.corner });
    } else {
      setEditorTarget({ type: "base" });
    }

    if (selection.section === "content") {
      setContentSectionOpen(true);
    } else if (selection.section === "base") {
      setShapeSectionOpen(true);
    } else if (selection.section === "back") {
      setBackLayerSectionOpen(true);
    }

    if (controlsRef.current) {
      controlsRef.current.scrollTop = 0;
      controlsRef.current.scrollLeft = 0;
    }
    setWorkspaceMode("editor");
    setUiPhase("builder");
    setSelectMenuOpen(false);
    setHighlightedInspectId("");
    setToast(`Editing ${selection.label}`);
  };

  const handleRemoveParticle = (cornerKey) => {
    const label = getCornerLabel(cornerKey);
    setParticles((current) => {
      if (!current[cornerKey]) return current;
      const next = { ...current };
      delete next[cornerKey];
      return next;
    });

    if (editorTarget.type === "particle" && editorTarget.corner === cornerKey) {
      setEditorTarget({ type: "base" });
    }
    setToast(`Removed ${label} particle`);
  };

  const renderContextCompositeStack = () => (
    <span
      className="context-icon-frame"
      style={{
        width: `${compositeBounds.width}px`,
        height: `${compositeBounds.height}px`,
      }}
    >
      <span
        className="context-icon-offset"
        style={{
          left: `${contextOffsetX.toFixed(2)}px`,
          top: `${contextOffsetY.toFixed(2)}px`,
        }}
      >
        <CompositeIconStack
          baseState={baseState}
          particles={particles}
          editorTarget={editorTarget}
          className="context-icon-stack"
        />
      </span>
    </span>
  );

  const exportCaptureBuffer = (
    <div className="export-capture-buffer" aria-hidden="true">
      <div
        ref={exportRef}
        className="export-target"
        style={{
          width: `${exportTargetWidth}px`,
          height: `${exportTargetHeight}px`,
        }}
      >
        <div
          className="export-target-inner"
          style={{ transform: exportCompositionTransform }}
        >
          <CompositeIconStack
            baseState={baseState}
            particles={particles}
            editorTarget={editorTarget}
          />
        </div>
      </div>
    </div>
  );

  const wizardPanel = (
    <div className="wizard-panel">
      <div className="wizard-sticky">
        <div className="wizard-head">
          <div>
            <p className="wizard-kicker">
              Step {wizardStepNumber} of {WIZARD_STEPS.length}
            </p>
            <h2>{wizardStep.title}</h2>
          </div>
        </div>

        <div
          className="wizard-step-tabs"
          aria-label="Wizard steps"
          data-walkthrough-target="wizard-steps"
        >
          <button
            type="button"
            className="wizard-step-arrow"
            onClick={handleWizardBack}
            disabled={!canGoBackInWizard}
            aria-label="Go to previous step"
          >
            <ChevronLeft size={16} aria-hidden="true" />
          </button>
          {WIZARD_STEPS.map((step, index) => (
            <button
              type="button"
              key={step.id}
              className={index === wizardStepIndex ? "wizard-step-tab active" : "wizard-step-tab"}
              onClick={() => setWizardStepIndex(index)}
              aria-label={`Open ${step.title} step`}
            >
              <span>{index + 1}</span>
            </button>
          ))}
          <button
            type="button"
            className="wizard-step-arrow"
            onClick={handleWizardNext}
            disabled={!canGoForwardInWizard}
            aria-label="Go to next step"
          >
            <ChevronRight size={16} aria-hidden="true" />
          </button>
        </div>
      </div>

      {wizardStep.id === "content" ? (
        <section className="wizard-card" data-walkthrough-target="wizard-content-card">
          <div className="wizard-card-head">
            <ContentSectionHeaderPreview state={baseState} />
            <h3>Content</h3>
            <label className="section-panel-switch wizard-inline-switch" title="Toggle content">
              <input
                type="checkbox"
                checked={baseState.contentEnabled}
                onChange={(event) => handleContentSectionEnabledChange(event.target.checked)}
              />
              <span className="section-panel-switch-track" aria-hidden="true">
                <span className="section-panel-switch-thumb" />
              </span>
            </label>
          </div>

          <ToggleGroup
            options={MODES}
            value={baseState.mode}
            onChange={(mode) => patchState({ mode })}
            labels={MODE_TOGGLE_LABELS}
          />

          {baseState.mode === "text" ? (
            <>
              <label>
                Text or emoji
                <input
                  type="text"
                  value={baseState.content}
                  maxLength={12}
                  onChange={(event) => patchState({ content: event.target.value })}
                  placeholder="A, OK, :)"
                />
              </label>
              <label>
                <span className="label-head">
                  Font type
                  <HelpHint text={ADVANCED_HELP.fontFamily} setTooltip={setCursorTooltip} />
                </span>
                <button
                  type="button"
                  className="btn-secondary font-picker-trigger"
                  onClick={() => setFontPickerOpen(true)}
                >
                  <span className="font-picker-trigger-title">{selectedFontLabel}</span>
                  <span className="font-picker-trigger-preview" style={{ fontFamily: baseState.fontFamily }}>
                    Aa Bb 123
                  </span>
                </button>
              </label>
              <label>
                <span className="label-head">
                  Font weight
                  <HelpHint text={ADVANCED_HELP.fontWeight} setTooltip={setCursorTooltip} />
                </span>
                <input
                  type="range"
                  min={FONT_WEIGHT_MIN}
                  max={FONT_WEIGHT_MAX}
                  step={100}
                  list="wizard-font-weight-stops"
                  value={Number.parseInt(baseState.fontWeight, 10)}
                  onChange={(event) => patchState({ fontWeight: String(Number(event.target.value)) })}
                />
                <small>{baseState.fontWeight}</small>
              </label>
              <datalist id="wizard-font-weight-stops">
                {FONT_WEIGHT_STOPS.map((weight) => (
                  <option key={weight} value={weight} />
                ))}
              </datalist>
            </>
          ) : baseState.mode === "image" ? (
            <ImageEditorControls
              targetLabel="Content image"
              inputRef={contentImageUploadInputRef}
              imageState={getImageStateForTarget(baseState, "content")}
              exportSizeLabel="Use content image size for export"
              exportSizeSummary={
                baseState.contentEnabled && baseState.mode === "image" && preferredImageExportDimensions
                  ? exportSizeSummary
                  : "Square canvas export"
              }
              isExportSizeEnabled={
                baseState.contentEnabled && baseState.mode === "image" && Boolean(preferredImageExportDimensions)
              }
              isUsingExportImageSize={
                baseState.contentEnabled && baseState.mode === "image" && shouldUseImportedImageExportSize
              }
              onExportSizeToggle={setUseImportedImageExportSize}
              onFileChange={(event) => handleImageFileChange(event, "content")}
              onUpload={() => handleUploadImageClick("content")}
              onRecrop={() => handleRecropExistingImage("content")}
              onRemove={() => handleRemoveImage("content")}
              onPatch={(patch) => patchState(patch)}
            />
          ) : (
            <>
              <label>
                Icon name
                <input
                  type="text"
                  value={baseState.lucide}
                  onChange={(event) => patchState({ lucide: event.target.value })}
                  onBlur={(event) =>
                    patchState({
                      lucide: normalizeLucideName(event.target.value) || DEFAULT_STATE.lucide,
                    })
                  }
                  placeholder="sparkles, bell-ring, chart-line"
                />
                <div className="field-actions">
                  <button type="button" className="btn-ghost" onClick={() => setIconPickerOpen(true)}>
                    Browse all icons
                  </button>
                </div>
                <span className={baseMetrics.hasValidLucide ? "status ok" : "status warn"}>
                  {baseMetrics.hasValidLucide
                    ? `Loaded ${baseMetrics.iconName}`
                    : "Name not found, using sparkles"}
                </span>
              </label>
              <label>
                <span className="label-head">
                  Icon stroke weight
                  <HelpHint text={ADVANCED_HELP.lucideWeight} setTooltip={setCursorTooltip} />
                </span>
                <input
                  type="range"
                  min={LUCIDE_WEIGHT_MIN}
                  max={LUCIDE_WEIGHT_MAX}
                  step={0.4}
                  list="wizard-lucide-weight-stops"
                  value={baseState.lucideWeight}
                  onChange={(event) => patchState({ lucideWeight: Number.parseFloat(event.target.value) })}
                />
                <small>{baseState.lucideWeight.toFixed(1)}px</small>
              </label>
              <datalist id="wizard-lucide-weight-stops">
                {LUCIDE_WEIGHT_STOPS.map((weight) => (
                  <option key={weight} value={weight} />
                ))}
              </datalist>
            </>
          )}

          <label>
            <span className="label-head">
              Content size in base
              <HelpHint text={ADVANCED_HELP.iconScale} setTooltip={setCursorTooltip} />
            </span>
            <input
              type="range"
              min={ICON_SCALE_MIN}
              max={baseContentScaleMax}
              step={2}
              value={baseState.iconScale}
              onChange={(event) => handleIconScaleChange(Number(event.target.value))}
            />
            <div className="size-quick-row">
              {[60, 80, 100].map((scale) => (
                <button
                  type="button"
                  key={scale}
                  className={baseState.iconScale === scale ? "size-chip active" : "size-chip"}
                  onClick={() => handleIconScaleChange(scale)}
                >
                  {scale === 60 ? "S" : scale === 80 ? "M" : "L"}
                </button>
              ))}
            </div>
            <small>{baseState.iconScale}% of the base</small>
            {isBaseTextScaleCappedByLink ? (
              <small className="status warn">
                Content size has reached the linked text-size limit for this base. Switch to
                Editor, open Content &gt; Advanced, and turn off Link text size to base size to make
                it larger.
              </small>
            ) : null}
          </label>

          <div className="color-controls-grid">
            <label className="color-dot-control">
              <span>Content</span>
              <input
                type="color"
                value={baseState.textColor}
                onChange={(event) => handleColorChange("textColor", event.target.value)}
              />
            </label>
            <label>
              Content transparency
              <input
                type="range"
                min={0}
                max={100}
                step={1}
                value={baseState.contentOpacity}
                onChange={(event) => patchState({ contentOpacity: Number(event.target.value) })}
              />
              <small>{baseState.contentOpacity}%</small>
            </label>
          </div>

          {baseState.mode !== "none" ? (
            <div className="field-actions">
              <button type="button" className="btn-ghost" onClick={handleCenterContentToBase}>
                Center content to base
              </button>
            </div>
          ) : null}

          {baseState.mode !== "none" ? (
            <div className="content-zone-control">
              <span>Zone</span>
              <ContentZoneControl
                iconState={baseState}
                metrics={baseMetrics}
                onChange={handleContentZoneChange}
                onReset={handleResetContentZone}
              />
            </div>
          ) : null}

          {baseState.mode === "text" || baseState.mode === "icon" ? (
            <ContentRotationControl
              value={baseState.contentRotation}
              onChange={(contentRotation) => patchState({ contentRotation })}
              onReset={() => patchState({ contentRotation: DEFAULT_STATE.contentRotation })}
            />
          ) : null}
        </section>
      ) : null}

      {wizardStep.id === "base" ? (
        <section className="wizard-card" data-walkthrough-target="wizard-base-card">
          <div className="wizard-card-head">
            <ShapeSectionHeaderPreview state={baseState} />
            <h3>Base</h3>
            <label className="section-panel-switch wizard-inline-switch" title="Toggle base">
              <input
                type="checkbox"
                checked={baseState.shapeEnabled}
                onChange={(event) => handleShapeSectionEnabledChange(event.target.checked)}
              />
              <span className="section-panel-switch-track" aria-hidden="true">
                <span className="section-panel-switch-thumb" />
              </span>
            </label>
          </div>

          <label>
            <span className="label-head">
              Base size
              <HelpHint text={ADVANCED_HELP.baseSize} setTooltip={setCursorTooltip} />
            </span>
            <input
              type="range"
              min={ICON_BASE_SIZE_MIN}
              max={ICON_BASE_SIZE_MAX}
              step={2}
              value={baseState.size}
              onChange={(event) => patchState({ size: Number(event.target.value) })}
            />
            <div className="size-quick-row">
              {ICON_BASE_SIZE_PRESETS.map((presetSize) => (
                <button
                  type="button"
                  key={presetSize}
                  className={baseState.size === presetSize ? "size-chip active" : "size-chip"}
                  onClick={() => patchState({ size: presetSize })}
                >
                  {presetSize}
                </button>
              ))}
            </div>
            <small>{baseState.size}px</small>
          </label>

          <div className="field-actions">
            <button type="button" className="btn-ghost" onClick={handleCenterBaseToIcon}>
              Center base to icon
            </button>
          </div>

          <ToggleGroup
            options={SHAPE_MODE_OPTIONS}
            value={selectedShapeMode}
            onChange={handleShapeModeChange}
            labels={SHAPE_MODE_LABELS}
          />

          {selectedShapeMode === "shape" ? (
            <>
              <label>
                <span>Preset</span>
                <div className="size-quick-row shape-preset-row">
                  {SHAPE_PRESET_OPTIONS.map((presetShape) => (
                    <button
                      type="button"
                      key={presetShape}
                      className={activeShapePreset === presetShape ? "size-chip active" : "size-chip"}
                      onClick={() => applyShapePreset(presetShape)}
                    >
                      {SHAPE_TOGGLE_LABELS[presetShape]}
                    </button>
                  ))}
                </div>
              </label>
              <div className="grid-two">
                <label>
                  Width scale
                  <input
                    type="range"
                    min={ICON_SCALE_MIN}
                    max={260}
                    step={2}
                    value={baseState.widthScale}
                    onChange={(event) => patchState({ widthScale: Number(event.target.value) })}
                  />
                  <small>{(baseState.widthScale / 100).toFixed(2)}x</small>
                </label>
                <label>
                  Height scale
                  <input
                    type="range"
                    min={SHAPE_HEIGHT_SCALE_MIN}
                    max={SHAPE_HEIGHT_SCALE_MAX}
                    step={2}
                    value={baseState.heightScale}
                    onChange={(event) => patchState({ heightScale: Number(event.target.value) })}
                  />
                  <small>{(baseState.heightScale / 100).toFixed(2)}x</small>
                </label>
              </div>
              <label>
                Corner rounding
                <input
                  type="range"
                  min={0}
                  max={SHAPE_RADIUS_MAX}
                  step={2}
                  value={baseState.radius}
                  onChange={(event) => patchState({ radius: Number(event.target.value) })}
                />
                <small>{baseState.radius}px</small>
              </label>
            </>
          ) : selectedShapeMode === "folder" ? (
            <FolderControls state={baseState} patchState={patchState} />
          ) : (
            <ImageEditorControls
              targetLabel="Shape image"
              inputRef={shapeImageUploadInputRef}
              imageState={getImageStateForTarget(baseState, "shape")}
              exportSizeLabel="Use shape image size for export"
              exportSizeSummary={
                baseState.shapeEnabled && baseState.shape === "image" && preferredImageExportDimensions
                  ? exportSizeSummary
                  : "Square canvas export"
              }
              isExportSizeEnabled={
                baseState.shapeEnabled && baseState.shape === "image" && Boolean(preferredImageExportDimensions)
              }
              isUsingExportImageSize={
                baseState.shapeEnabled && baseState.shape === "image" && shouldUseImportedImageExportSize
              }
              onExportSizeToggle={setUseImportedImageExportSize}
              onFileChange={(event) => handleImageFileChange(event, "shape")}
              onUpload={() => handleUploadImageClick("shape")}
              onRecrop={() => handleRecropExistingImage("shape")}
              onRemove={() => handleRemoveImage("shape")}
              onPatch={(patch) =>
                patchState(getImagePatchForTarget("shape", { ...getImageStateForTarget(baseState, "shape"), ...patch }))
              }
            />
          )}

          <div className="gradient-control-pair">
            <GradientColorControl
              label="Fill"
              stops={baseState.fillStops}
              gradientType={baseState.fillGradientType}
              angle={baseState.fillGradientAngle}
              centerX={baseState.fillGradientCenterX}
              centerY={baseState.fillGradientCenterY}
              onStopChange={(index, value) => handleGradientStopChange("fillStops", index, value)}
              onAddStop={() => handleGradientStopAdd("fillStops")}
              onRemoveStop={(index) => handleGradientStopRemove("fillStops", index)}
              onGradientTypeChange={(type) => patchState({ fillGradientType: type })}
              onAngleChange={(nextAngle) => patchState({ fillGradientAngle: nextAngle })}
              onCenterChange={(x, y) => patchState({ fillGradientCenterX: x, fillGradientCenterY: y })}
            />
            <GradientColorControl
              label="Stroke"
              stops={baseState.strokeStops}
              gradientType={baseState.strokeGradientType}
              angle={baseState.strokeGradientAngle}
              centerX={baseState.strokeGradientCenterX}
              centerY={baseState.strokeGradientCenterY}
              onStopChange={(index, value) => handleGradientStopChange("strokeStops", index, value)}
              onAddStop={() => handleGradientStopAdd("strokeStops")}
              onRemoveStop={(index) => handleGradientStopRemove("strokeStops", index)}
              onGradientTypeChange={(type) => patchState({ strokeGradientType: type })}
              onAngleChange={(nextAngle) => patchState({ strokeGradientAngle: nextAngle })}
              onCenterChange={(x, y) => patchState({ strokeGradientCenterX: x, strokeGradientCenterY: y })}
            />
          </div>

          <div className="grid-two">
            <label>
              Stroke width
              <input
                type="range"
                min={0}
                max={24}
                step={1}
                value={baseState.outline}
                onChange={(event) => patchState({ outline: Number(event.target.value) })}
              />
              <small>{baseState.outline}px</small>
            </label>
            <label>
              Base transparency
              <input
                type="range"
                min={0}
                max={100}
                step={1}
                value={baseState.baseOpacity}
                onChange={(event) => patchState({ baseOpacity: Number(event.target.value) })}
              />
              <small>{baseState.baseOpacity}%</small>
            </label>
          </div>
        </section>
      ) : null}

      {wizardStep.id === "back" ? (
        <section className="wizard-card" data-walkthrough-target="wizard-back-card">
          <div className="wizard-card-head">
            <BackLayerSectionHeaderPreview state={baseState} />
            <h3>Back</h3>
            <label className="section-panel-switch wizard-inline-switch" title="Toggle back">
              <input
                type="checkbox"
                checked={baseState.backLayerEnabled}
                onChange={(event) => handleBackLayerSectionEnabledChange(event.target.checked)}
              />
              <span className="section-panel-switch-track" aria-hidden="true">
                <span className="section-panel-switch-thumb" />
              </span>
            </label>
          </div>

          <BackLayerWheel
            angle={baseState.backAngle}
            distance={baseState.backDistance}
            onChange={handleBackLayerChange}
            lockDistance={isBackDistanceLocked}
            lockAngle={isBackAngleLocked}
            onLockDistanceChange={setBackDistanceLocked}
            onLockAngleChange={setBackAngleLocked}
          />
          <div className="color-controls-grid">
            <label className="color-dot-control">
              <span>Back</span>
              <input
                type="color"
                value={baseState.backColor}
                onChange={(event) => handleColorChange("backColor", event.target.value)}
              />
            </label>
            <button
              type="button"
              className="btn-ghost wizard-reset-back"
              disabled={isBackDistanceLocked}
              onClick={() => patchState({ backDistance: 0 })}
            >
              Reset back layer
            </button>
          </div>
        </section>
      ) : null}

      {wizardStep.id === "particles" ? (
        <section
          className="wizard-card wizard-particles-card"
          data-walkthrough-target="wizard-particles-card"
        >
          <div className="wizard-card-head">
            <StaticCompositionPreview
              baseState={baseState}
              particles={particles}
              targetSize={52}
              padding={6}
              className="wizard-finish-icon"
            />
            <h3>Particles</h3>
          </div>

          <div>
            <p className="wizard-particle-label">Particles</p>
            <div className="wizard-particle-grid">
              {PARTICLE_CORNERS.map((corner) => (
                <button
                  type="button"
                  key={corner.key}
                  className={particles[corner.key] ? "wizard-particle-button active" : "wizard-particle-button"}
                  onClick={() => handleWizardParticleAdd(corner.key)}
                >
                  <Plus size={14} aria-hidden="true" />
                  {corner.label}
                </button>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {wizardStep.id === "share" ? (
        <section
          className="wizard-card wizard-share-card"
          data-walkthrough-target="wizard-share-card"
        >
          <div className="wizard-card-head wizard-share-head">
            <StaticCompositionPreview
              baseState={baseState}
              particles={particles}
              targetSize={64}
              padding={8}
              className="wizard-finish-icon"
            />
            <div>
              <h3>Share + Export</h3>
              <p className="wizard-share-subtitle">
                Export your PNG, copy a link, or keep refining in the full editor.
              </p>
              <p className="wizard-share-subtitle">
                Project files preserve uploaded images and are best for work you want to revisit.
              </p>
            </div>
          </div>

          <div className="wizard-summary-grid">
            <label className="export-share-pane-label wizard-share-setting">
              <span>Workspace canvas</span>
              <div className="size-quick-row">
                {CANVAS_SIZE_PRESETS.map((size) => (
                  <button
                    type="button"
                    key={size}
                    className={canvasSize === size ? "size-chip active" : "size-chip"}
                    onClick={() => handleCanvasSizeChange(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
              <small>{canvasSize} x {canvasSize}</small>
            </label>
            <label className="export-share-pane-label wizard-share-setting">
              <span>PNG scale</span>
              <div className="size-quick-row">
                {EXPORT_SCALE_OPTIONS.map((scale) => (
                  <button
                    type="button"
                    key={scale}
                    className={exportScale === scale ? "size-chip active" : "size-chip"}
                    onClick={() => setExportScale(scale)}
                  >
                    {scale}x
                  </button>
                ))}
              </div>
              <small>{exportSizeSummary}</small>
            </label>
          </div>

          <div className="wizard-share-actions">
            <button type="button" className="btn-primary wizard-share-primary" onClick={handleExport}>
              <Download size={16} aria-hidden="true" />
              Export PNG
            </button>
            <button type="button" className="btn-secondary" onClick={handleCopyShareLink}>
              <Clipboard size={16} aria-hidden="true" />
              Copy link
            </button>
            <button type="button" className="btn-secondary" onClick={handleOpenEditor}>
              <PenLine size={16} aria-hidden="true" />
              Open editor
            </button>
          </div>

          <div className="wizard-share-secondary">
            <button
              type="button"
              className="btn-ghost"
              onClick={() => {
                setLoadCode(fullShareCode);
                setShareOpen(true);
              }}
            >
              Import / export code
            </button>
            <button
              type="button"
              className="btn-ghost"
              onClick={() => copyToClipboard(fullShareCode, "Share code copied (full fidelity)")}
            >
              Copy code
            </button>
            <button type="button" className="btn-ghost" onClick={handleExportProject}>
              Export project
            </button>
          </div>

          <div className="wizard-integration-callout">
            <div>
              <h4>Add iquan support to your app</h4>
              <p>
                Use the implementation spec to teach another app how to decode, render,
                and display iquans inline.
              </p>
            </div>
            <button type="button" className="btn-secondary" onClick={handleOpenSpecModal}>
              Open spec
            </button>
          </div>
        </section>
      ) : null}

      <div className="wizard-nav">
        <button
          type="button"
          className="btn-ghost wizard-nav-button"
          onClick={handleWizardBack}
          disabled={!canGoBackInWizard}
        >
          <ChevronLeft size={16} aria-hidden="true" />
          Back
        </button>
        {canGoForwardInWizard ? (
          <button type="button" className="btn-primary wizard-nav-button" onClick={handleWizardNext}>
            Next
            <ChevronRight size={16} aria-hidden="true" />
          </button>
        ) : null}
      </div>
    </div>
  );

  const walkthroughOverlay =
    isWalkthroughActive && walkthroughStep ? (
      <div className="walkthrough-layer" aria-live="polite">
        <aside
          className="walkthrough-card"
          style={{
            top: `${walkthroughCardPosition.top}px`,
            left: `${walkthroughCardPosition.left}px`,
          }}
          role="dialog"
          aria-label="Wizard walkthrough"
        >
          <p className="walkthrough-kicker">
            {walkthroughStepNumber} of {WIZARD_WALKTHROUGH_STEPS.length}
          </p>
          <h3>{walkthroughStep.title}</h3>
          <p>{walkthroughStep.body}</p>
          <div className="walkthrough-actions">
            <button type="button" className="btn-ghost" onClick={handleWalkthroughSkip}>
              Skip
            </button>
            <button type="button" className="btn-primary" onClick={handleWalkthroughNext}>
              {canGoForwardInWalkthrough ? "Next" : "Finish"}
            </button>
          </div>
        </aside>
      </div>
    ) : null;

  const aboutModal = (
    <Modal
      open={isInfoOpen}
      title="About Iquan Icon Builder"
      onClose={() => setInfoOpen(false)}
      actions={
        <button type="button" className="btn-secondary" onClick={() => setInfoOpen(false)}>
          Seems Cool
        </button>
      }
    >
      <div className="about-modal-content">
        <p className="about-modal-copy">
          Iquan is a fast icon builder for the tiny visual assets that show up everywhere:
          chat reactions, doc stickers, status badges, and lightweight UI icons. It was built
          for the Codex Creator Challenge by Owen Whelan to make polished icon work feel quick
          instead of heavyweight.
        </p>
        <div className="about-modal-links">
          <a
            className="about-modal-link about-modal-link-primary"
            href="https://www.owenwhelan.com"
            target="_blank"
            rel="noreferrer"
          >
            About Me
          </a>
          <a
            className="about-modal-link about-modal-link-secondary"
            href="https://github.com/RockhopperHD/iquan"
            target="_blank"
            rel="noreferrer"
          >
            GitHub Repo
          </a>
        </div>
      </div>
    </Modal>
  );

  const specModal = (
    <Modal
      open={isSpecOpen}
      title="Add Iquans to Your App"
      onClose={() => setSpecOpen(false)}
      actions={
        <>
          <a
            className="about-modal-link about-modal-link-secondary iquan-spec-action-link iquan-spec-repo-action"
            href="https://github.com/RockhopperHD/iquan"
            target="_blank"
            rel="noreferrer"
          >
            View GitHub repo
          </a>
          <button type="button" className="btn-secondary" onClick={handleCopyIquanSpec}>
            <Clipboard size={16} aria-hidden="true" />
            Copy spec
          </button>
          <button type="button" className="btn-primary" onClick={handleDownloadIquanSpec}>
            <Download size={16} aria-hidden="true" />
            Download spec
          </button>
        </>
      }
    >
      <div className="about-modal-content iquan-spec-modal-content">
        <p className="about-modal-copy">
          Give this Markdown spec to your LLM coder so it can add iquan decoding,
          rendering, and inline display support to another app. You can do this with Codex:
          copy or download the spec, open your app in Codex, and ask it to add iquan support
          using <code>IQUAN_SPEC.md</code>.
        </p>
        <label className="iquan-spec-code-field">
          <span>IQUAN_SPEC.md</span>
          <textarea value={iquanSpecMarkdown} readOnly spellCheck="false" />
        </label>
      </div>
    </Modal>
  );

  if (pageMode === "copiedLink") {
    const isValidSharedPage = sharePageStatus === "valid";
    const isUnsupportedSharedPage = sharePageStatus === "unsupported-images";
    const isInvalidSharedPage = sharePageStatus === "invalid";
    const isMissingSharedPage = sharePageStatus === "missing";

    return (
      <div className="shared-page-shell">
        <header className="app-header shared-page-header" aria-live="polite">
          <div className="app-header-side" />
          <a className="app-header-title app-header-title-link" href={builderHomeUrl}>
            {appHeaderTitleContent}
          </a>
          <div className="app-header-side app-header-side-end">
            <button
              type="button"
              className={specButtonClass}
              onClick={handleOpenSpecModal}
              aria-label="Add Iquans to your app"
              title="Add Iquans to your app"
            >
              Add Iquans to your app
            </button>
            <button
              type="button"
              className="app-header-info"
              onClick={() => {
                setSpecOpen(false);
                setInfoOpen(true);
              }}
              aria-label="Open app information"
              title="App information"
            >
              i
            </button>
          </div>
        </header>

        <main className="shared-page">
          <section className="shared-page-card">
            {sharePageStatus === "loading" ? (
              <div className="shared-page-state">
                <p className="shared-page-eyebrow">Shared from Iquan</p>
                <h1>Loading shared icon</h1>
                <p className="helper">
                  Reading the share link and preparing the export preview.
                </p>
              </div>
            ) : null}

            {isValidSharedPage ? (
              <>
                <div className="shared-page-copy">
                  <p className="shared-page-eyebrow">Shared from Iquan</p>
                  <h1>Here is the icon that was shared</h1>
                  <p className="helper">
                    Export a PNG from this page, or open the icon in the editor for more control.
                  </p>
                </div>

                <div className="shared-page-preview-panel">
                  <StaticCompositionPreview
                    baseState={baseState}
                    particles={particles}
                    editorTarget={{ type: "base" }}
                    targetSize={300}
                    padding={22}
                    className="shared-page-preview-icon"
                  />
                </div>

                <label className="export-share-pane-label shared-page-scale">
                  <span>PNG scale</span>
                  <div className="size-quick-row">
                    {EXPORT_SCALE_OPTIONS.map((scale) => (
                      <button
                        type="button"
                        key={scale}
                        className={exportScale === scale ? "size-chip active" : "size-chip"}
                        onClick={() => setExportScale(scale)}
                      >
                        {scale}x
                      </button>
                    ))}
                  </div>
                  <small>{exportSizeSummary}</small>
                </label>

                <div className="shared-page-actions">
                  <button type="button" className="btn-primary" onClick={handleExport}>
                    Export PNG
                  </button>
                  <a className="btn-secondary" href={editorShareUrl}>
                    Edit in Iquan editor
                  </a>
                  <a className="btn-ghost" href={builderHomeUrl}>
                    Back to Iquan
                  </a>
                </div>
              </>
            ) : null}

            {isUnsupportedSharedPage ? (
              <div className="shared-page-state">
                <p className="shared-page-eyebrow">Shared from Iquan</p>
                <h1>This shared icon uses uploaded images</h1>
                <p className="helper">
                  Copied links do not include uploaded image pixels yet, so this page cannot
                  reconstruct the exact shared icon. Use the full share code for image-backed work.
                </p>
                <div className="shared-page-actions">
                  <a className="btn-primary" href={editorShareUrl}>
                    Edit in Iquan editor
                  </a>
                  <a className="btn-ghost" href={builderHomeUrl}>
                    Back to Iquan
                  </a>
                </div>
              </div>
            ) : null}

            {isInvalidSharedPage || isMissingSharedPage ? (
              <div className="shared-page-state">
                <p className="shared-page-eyebrow">Shared from Iquan</p>
                <h1>
                  {isInvalidSharedPage
                    ? "This shared link is invalid"
                    : "This shared link is missing its icon code"}
                </h1>
                <p className="helper">
                  {isInvalidSharedPage
                    ? "The copied link could not be decoded into an icon."
                    : "There is no shared icon attached to this link."}
                </p>
                <div className="shared-page-actions">
                  <a className="btn-primary" href={builderHomeUrl}>
                    Open Iquan editor
                  </a>
                </div>
              </div>
            ) : null}
          </section>

          {exportCaptureBuffer}
          {aboutModal}
          {specModal}
          {toast ? <div className="toast">{toast}</div> : null}
        </main>
      </div>
    );
  }

  return (
    <div className="app-shell" data-ui-phase={uiPhase}>
      <header className="app-header" aria-live="polite">
        <div className="app-header-side">
          <button
            type="button"
            className="app-header-action"
            onClick={handleUndo}
            disabled={!canUndo}
            aria-label="Undo"
            title="Undo"
          >
            <Undo2 size={16} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="app-header-action"
            onClick={handleRedo}
            disabled={!canRedo}
            aria-label="Redo"
            title="Redo"
          >
            <Redo2 size={16} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="app-header-action"
            onClick={handleResetBuilder}
            aria-label="Reset all"
            title="Reset all"
          >
            <Trash2 size={16} aria-hidden="true" />
          </button>
        </div>
        <button
          type="button"
          className="app-header-title app-header-title-link"
          onClick={handleReturnToLanding}
          aria-label="Return to Iquan home screen"
          title="Return to Iquan home screen"
        >
          {appHeaderTitleContent}
        </button>
        <div className="app-header-side app-header-side-end">
          <button
            type="button"
            className={specButtonClass}
            onClick={handleOpenSpecModal}
            aria-label="Add Iquans to your app"
            title="Add Iquans to your app"
          >
            Add Iquans to your app
          </button>
          <button
            type="button"
            className="app-header-info"
            onClick={() => {
              setSpecOpen(false);
              setInfoOpen(true);
            }}
            aria-label="Open app information"
            title="App information"
          >
            i
          </button>
        </div>
      </header>

      <div className="pane-column">
        <div className="pane-display-head">
          <h2
            className="pane-mode-title-switch"
            data-active-mode={workspaceMode}
          >
            <button
              type="button"
              className="pane-mode-title pane-mode-title-wizard"
              onClick={handleOpenWizard}
              aria-pressed={isWizardWorkspaceMode}
            >
              Wizard
            </button>
            <button
              type="button"
              className="pane-mode-title pane-mode-title-editor"
              onClick={handleOpenEditor}
              aria-pressed={!isWizardWorkspaceMode}
            >
              Editor
            </button>
          </h2>
        </div>

        <aside ref={controlsRef} className="controls">
          <div className="controls-content" aria-hidden={isHeroVisible}>
        {workspaceMode === "wizard" ? (
          wizardPanel
        ) : (
          <>
        <div className="editor-target-banner">
          <div className="editor-target-head">
            <h2 className="editor-target-title">
              Editing {isEditingParticle ? `${getCornerLabel(editorTarget.corner)} particle` : "base"}
            </h2>
            <div className="editor-target-actions">
              {isEditingParticle ? (
                <>
                  <button
                    type="button"
                    className="btn-ghost"
                    onClick={() => setEditorTarget({ type: "base" })}
                  >
                    Switch to base
                  </button>
                  <button
                    type="button"
                    className="btn-ghost"
                    onClick={() => handleRemoveParticle(editorTarget.corner)}
                  >
                    Delete particle
                  </button>
                </>
              ) : null}
            </div>
          </div>
        </div>

        {isEditingParticle ? (
          <section className="section-panel particle-position-panel">
            <h2>Particle position</h2>
            <p className="helper">
              Move this particle around its anchor point using sliders or nudge buttons.
            </p>
            <label>
              Horizontal offset
              <input
                type="range"
                min={-PARTICLE_OFFSET_LIMIT}
                max={PARTICLE_OFFSET_LIMIT}
                step={1}
                value={activeParticle.offsetX}
                onChange={(event) =>
                  handleParticleOffsetChange(Number(event.target.value), activeParticle.offsetY)
                }
              />
              <small>{activeParticle.offsetX}px</small>
            </label>
            <label>
              Vertical offset
              <input
                type="range"
                min={-PARTICLE_OFFSET_LIMIT}
                max={PARTICLE_OFFSET_LIMIT}
                step={1}
                value={activeParticle.offsetY}
                onChange={(event) =>
                  handleParticleOffsetChange(activeParticle.offsetX, Number(event.target.value))
                }
              />
              <small>{activeParticle.offsetY}px</small>
            </label>
            <div className="particle-nudge-pad" role="group" aria-label="Nudge particle position">
              <button
                type="button"
                className="btn-ghost particle-nudge-button nudge-up"
                onClick={(event) => handleParticleNudge(0, event.shiftKey ? -8 : -1)}
              >
                Up
              </button>
              <button
                type="button"
                className="btn-ghost particle-nudge-button nudge-left"
                onClick={(event) => handleParticleNudge(event.shiftKey ? -8 : -1, 0)}
              >
                Left
              </button>
              <button
                type="button"
                className="btn-ghost particle-nudge-button nudge-reset"
                onClick={() => handleParticleOffsetChange(0, 0)}
              >
                Center
              </button>
              <button
                type="button"
                className="btn-ghost particle-nudge-button nudge-right"
                onClick={(event) => handleParticleNudge(event.shiftKey ? 8 : 1, 0)}
              >
                Right
              </button>
              <button
                type="button"
                className="btn-ghost particle-nudge-button nudge-down"
                onClick={(event) => handleParticleNudge(0, event.shiftKey ? 8 : 1)}
              >
                Down
              </button>
            </div>
            <small>Click for 1px moves. Shift + click for 8px.</small>
          </section>
        ) : null}

        <SectionPanel
          title="Content"
          isOpen={isContentSectionOpen}
          onToggleOpen={() => setContentSectionOpen((open) => !open)}
          isEnabled={isContentSectionEnabled}
          onToggleEnabled={handleContentSectionEnabledChange}
          headerPreview={<ContentSectionHeaderPreview state={state} />}
        >
          <>
              <ToggleGroup
                options={MODES}
                value={state.mode}
                onChange={(mode) => patchState({ mode })}
                labels={MODE_TOGGLE_LABELS}
              />

              {state.mode === "text" ? (
                <>
                  <label>
                    Text or emoji
                    <input
                      type="text"
                      value={state.content}
                      maxLength={12}
                      onChange={(event) => patchState({ content: event.target.value })}
                      placeholder="A, OK, 🙂"
                    />
                  </label>
                  <label>
                    <span className="label-head">
                      Font type
                      <HelpHint text={ADVANCED_HELP.fontFamily} setTooltip={setCursorTooltip} />
                    </span>
                    <button
                      type="button"
                      className="btn-secondary font-picker-trigger"
                      onClick={() => setFontPickerOpen(true)}
                    >
                      <span className="font-picker-trigger-title">{selectedFontLabel}</span>
                      <span className="font-picker-trigger-preview" style={{ fontFamily: state.fontFamily }}>
                        Aa Bb 123
                      </span>
                    </button>
                  </label>

                  <label>
                    <span className="label-head">
                      Font weight
                      <HelpHint text={ADVANCED_HELP.fontWeight} setTooltip={setCursorTooltip} />
                    </span>
                    <input
                      type="range"
                      min={FONT_WEIGHT_MIN}
                      max={FONT_WEIGHT_MAX}
                      step={100}
                      list="font-weight-stops"
                      value={Number.parseInt(state.fontWeight, 10)}
                      onChange={(event) =>
                        patchState({ fontWeight: String(Number(event.target.value)) })
                      }
                    />
                    <small>{state.fontWeight}</small>
                  </label>
                  <datalist id="font-weight-stops">
                    {FONT_WEIGHT_STOPS.map((weight) => (
                      <option key={weight} value={weight} />
                    ))}
                  </datalist>
                </>
              ) : state.mode === "image" ? (
                <ImageEditorControls
                  targetLabel="Content image"
                  inputRef={contentImageUploadInputRef}
                  imageState={getImageStateForTarget(state, "content")}
                  exportSizeLabel="Use content image size for export"
                  exportSizeSummary={
                    baseState.contentEnabled && baseState.mode === "image" && preferredImageExportDimensions
                      ? exportSizeSummary
                      : "Export uses the 500 x 500 square canvas until this image is active in the base composition."
                  }
                  isExportSizeEnabled={
                    baseState.contentEnabled && baseState.mode === "image" && Boolean(preferredImageExportDimensions)
                  }
                  isUsingExportImageSize={
                    baseState.contentEnabled && baseState.mode === "image" && shouldUseImportedImageExportSize
                  }
                  onExportSizeToggle={setUseImportedImageExportSize}
                  onFileChange={(event) => handleImageFileChange(event, "content")}
                  onUpload={() => handleUploadImageClick("content")}
                  onRecrop={() => handleRecropExistingImage("content")}
                  onRemove={() => handleRemoveImage("content")}
                  onPatch={(patch) => patchState(patch)}
                />
              ) : state.mode === "none" ? (
                <p className="helper">No content will be rendered.</p>
              ) : (
                <>
                  <label>
                    Icon name
                    <input
                      type="text"
                      value={state.lucide}
                      onChange={(event) => patchState({ lucide: event.target.value })}
                      onBlur={(event) =>
                        patchState({
                          lucide:
                            normalizeLucideName(event.target.value) || DEFAULT_STATE.lucide,
                        })
                      }
                      placeholder="sparkles, bell-ring, chart-line"
                    />
                    <div className="field-actions">
                      <button
                        type="button"
                        className="btn-ghost"
                        onClick={() => setIconPickerOpen(true)}
                      >
                        Browse all icons
                      </button>
                    </div>
                    <span className={activeMetrics.hasValidLucide ? "status ok" : "status warn"}>
                      {activeMetrics.hasValidLucide
                        ? `Loaded ${activeMetrics.iconName}`
                        : "Name not found, using sparkles"}
                    </span>
                  </label>
                  <label>
                    <span className="label-head">
                      Icon stroke weight
                      <HelpHint text={ADVANCED_HELP.lucideWeight} setTooltip={setCursorTooltip} />
                    </span>
                    <input
                      type="range"
                      min={LUCIDE_WEIGHT_MIN}
                      max={LUCIDE_WEIGHT_MAX}
                      step={0.4}
                      list="lucide-weight-stops"
                      value={state.lucideWeight}
                      onChange={(event) =>
                        patchState({ lucideWeight: Number.parseFloat(event.target.value) })
                      }
                    />
                    <small>{state.lucideWeight.toFixed(1)}px</small>
                  </label>
                  <datalist id="lucide-weight-stops">
                    {LUCIDE_WEIGHT_STOPS.map((weight) => (
                      <option key={weight} value={weight} />
                    ))}
                  </datalist>
                </>
              )}

              {state.mode !== "none" ? (
                <div className="field-actions">
                  <button type="button" className="btn-ghost" onClick={handleCenterContentToBase}>
                    Center content to base
                  </button>
                </div>
              ) : null}

              {state.mode !== "none" ? (
                <div className="content-zone-control">
                  <span>Zone</span>
                  <ContentZoneControl
                    iconState={state}
                    metrics={activeMetrics}
                    onChange={handleContentZoneChange}
                    onReset={handleResetContentZone}
                  />
                </div>
              ) : null}

              <label>
                Content transparency
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={1}
                  value={state.contentOpacity}
                  onChange={(event) =>
                    patchState({ contentOpacity: Number(event.target.value) })
                  }
                />
                <small>{state.contentOpacity}%</small>
              </label>

              {state.mode === "text" || state.mode === "icon" ? (
                <ContentRotationControl
                  value={state.contentRotation}
                  onChange={(contentRotation) => patchState({ contentRotation })}
                  onReset={() => patchState({ contentRotation: DEFAULT_STATE.contentRotation })}
                />
              ) : null}

              <label className="color-dot-control">
                <span>Content</span>
                <input
                  type="color"
                  value={state.textColor}
                  onChange={(event) => handleColorChange("textColor", event.target.value)}
                />
              </label>

              {state.mode !== "none" ? (
                <label>
                  <span className="label-head">
                    {contentSizeLabel}
                    <HelpHint text={ADVANCED_HELP.iconScale} setTooltip={setCursorTooltip} />
                  </span>
                  <input
                    type="range"
                    min={ICON_SCALE_MIN}
                    max={contentScaleMax}
                    step={2}
                    value={state.iconScale}
                    onChange={(event) => handleIconScaleChange(Number(event.target.value))}
                  />
                  <div className="size-quick-row">
                    <button
                      type="button"
                      className={state.iconScale === 60 ? "size-chip active" : "size-chip"}
                      onClick={() => handleIconScaleChange(60)}
                    >
                      S
                    </button>
                    <button
                      type="button"
                      className={state.iconScale === 80 ? "size-chip active" : "size-chip"}
                      onClick={() => handleIconScaleChange(80)}
                    >
                      M
                    </button>
                    <button
                      type="button"
                      className={state.iconScale === 100 ? "size-chip active" : "size-chip"}
                      onClick={() => handleIconScaleChange(100)}
                    >
                      L
                    </button>
                  </div>
                  <small>
                    {state.iconScale}% of the {currentBaseLabel}
                  </small>
                  {isTextScaleCappedByLink ? (
                    <small className="status warn">
                      Content size has reached the linked text-size limit for this{" "}
                      {currentBaseLabel}. To make the text larger, turn off Link text size to base
                      size in Advanced.
                    </small>
                  ) : null}
                </label>
              ) : null}

              {state.mode === "text" ? (
                <>
                  <button
                    type="button"
                    className={
                      isContentAdvancedOpen
                        ? "btn-ghost section-advanced-toggle active"
                        : "btn-ghost section-advanced-toggle"
                    }
                    onClick={() => setContentAdvancedOpen((open) => !open)}
                    aria-expanded={isContentAdvancedOpen}
                  >
                    <span
                      className={
                        isContentAdvancedOpen
                          ? "section-advanced-chevron open"
                          : "section-advanced-chevron"
                      }
                      aria-hidden="true"
                    >
                      ▸
                    </span>
                    Advanced
                  </button>

                  {isContentAdvancedOpen ? (
                    <div className="advanced-content">
                      <label className="advanced-check">
                        <input
                          type="checkbox"
                          checked={state.linkTextToSize}
                          onChange={(event) => patchState({ linkTextToSize: event.target.checked })}
                        />
                        <span className="label-head">
                          Link text size to base size
                          <HelpHint text={ADVANCED_HELP.linkTextToSize} setTooltip={setCursorTooltip} />
                        </span>
                      </label>
                      <small>
                        Turn this off to let {contentSizeLabel.toLowerCase()} control text size
                        directly.
                      </small>

                      <label>
                        <span className="label-head">
                          Letter spacing
                          <HelpHint text={ADVANCED_HELP.letterSpacing} setTooltip={setCursorTooltip} />
                        </span>
                        <input
                          type="range"
                          min={0}
                          max={20}
                          step={1}
                          value={state.spacing}
                          onChange={(event) => patchState({ spacing: Number(event.target.value) })}
                        />
                        <small>{state.spacing}px</small>
                      </label>
                    </div>
                  ) : null}
                </>
              ) : null}
          </>
        </SectionPanel>

        <SectionPanel
          title="Base"
          isOpen={isShapeSectionOpen}
          onToggleOpen={() => setShapeSectionOpen((open) => !open)}
          isEnabled={isShapeSectionEnabled}
          onToggleEnabled={handleShapeSectionEnabledChange}
          headerPreview={<ShapeSectionHeaderPreview state={state} />}
        >
          <>
              <label>
                <span className="label-head">
                  Base size
                  <HelpHint text={ADVANCED_HELP.baseSize} setTooltip={setCursorTooltip} />
                </span>
                <input
                  type="range"
                  min={ICON_BASE_SIZE_MIN}
                  max={ICON_BASE_SIZE_MAX}
                  step={2}
                  value={state.size}
                  onChange={(event) => patchState({ size: Number(event.target.value) })}
                />
                <div className="size-quick-row">
                  {ICON_BASE_SIZE_PRESETS.map((presetSize) => (
                    <button
                      type="button"
                      key={presetSize}
                      className={state.size === presetSize ? "size-chip active" : "size-chip"}
                      onClick={() => patchState({ size: presetSize })}
                    >
                      {presetSize}
                    </button>
                  ))}
                </div>
                <small>{state.size}px</small>
              </label>

              <div className="field-actions">
                <button type="button" className="btn-ghost" onClick={handleCenterBaseToIcon}>
                  Center base to icon
                </button>
              </div>

              <ToggleGroup
                options={SHAPE_MODE_OPTIONS}
                value={selectedShapeMode}
                onChange={handleShapeModeChange}
                labels={SHAPE_MODE_LABELS}
              />

              {selectedShapeMode === "shape" ? (
                <>
                  <label>
                    <span>Preset</span>
                    <div className="size-quick-row shape-preset-row">
                      {SHAPE_PRESET_OPTIONS.map((presetShape) => (
                        <button
                          type="button"
                          key={presetShape}
                          className={activeShapePreset === presetShape ? "size-chip active" : "size-chip"}
                          onClick={() => applyShapePreset(presetShape)}
                        >
                          {SHAPE_TOGGLE_LABELS[presetShape]}
                        </button>
                      ))}
                    </div>
                  </label>

                  <label>
                    Base transparency
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={1}
                      value={state.baseOpacity}
                      onChange={(event) => patchState({ baseOpacity: Number(event.target.value) })}
                    />
                    <small>{state.baseOpacity}%</small>
                  </label>

                  <div className="gradient-control-pair">
                    <GradientColorControl
                      label="Fill"
                      stops={state.fillStops}
                      gradientType={state.fillGradientType}
                      angle={state.fillGradientAngle}
                      centerX={state.fillGradientCenterX}
                      centerY={state.fillGradientCenterY}
                      onStopChange={(index, value) => handleGradientStopChange("fillStops", index, value)}
                      onAddStop={() => handleGradientStopAdd("fillStops")}
                      onRemoveStop={(index) => handleGradientStopRemove("fillStops", index)}
                      onGradientTypeChange={(type) => patchState({ fillGradientType: type })}
                      onAngleChange={(nextAngle) => patchState({ fillGradientAngle: nextAngle })}
                      onCenterChange={(x, y) =>
                        patchState({ fillGradientCenterX: x, fillGradientCenterY: y })
                      }
                    />

                    <GradientColorControl
                      label="Stroke"
                      stops={state.strokeStops}
                      gradientType={state.strokeGradientType}
                      angle={state.strokeGradientAngle}
                      centerX={state.strokeGradientCenterX}
                      centerY={state.strokeGradientCenterY}
                      onStopChange={(index, value) => handleGradientStopChange("strokeStops", index, value)}
                      onAddStop={() => handleGradientStopAdd("strokeStops")}
                      onRemoveStop={(index) => handleGradientStopRemove("strokeStops", index)}
                      onGradientTypeChange={(type) => patchState({ strokeGradientType: type })}
                      onAngleChange={(nextAngle) => patchState({ strokeGradientAngle: nextAngle })}
                      onCenterChange={(x, y) =>
                        patchState({ strokeGradientCenterX: x, strokeGradientCenterY: y })
                      }
                    />
                  </div>

                  <label>
                    Stroke width
                    <input
                      type="range"
                      min={0}
                      max={24}
                      step={1}
                      value={state.outline}
                      onChange={(event) => patchState({ outline: Number(event.target.value) })}
                    />
                    <small>{state.outline}px</small>
                  </label>

                  <label>
                    Width scale
                    <input
                      type="range"
                      min={ICON_SCALE_MIN}
                      max={260}
                      step={2}
                      value={state.widthScale}
                      onChange={(event) =>
                        patchState({ widthScale: Number(event.target.value) })
                      }
                    />
                    <small>{(state.widthScale / 100).toFixed(2)}x</small>
                  </label>

                  <label>
                    Height scale
                    <input
                      type="range"
                      min={SHAPE_HEIGHT_SCALE_MIN}
                      max={SHAPE_HEIGHT_SCALE_MAX}
                      step={2}
                      value={state.heightScale}
                      onChange={(event) =>
                        patchState({ heightScale: Number(event.target.value) })
                      }
                    />
                    <small>{(state.heightScale / 100).toFixed(2)}x</small>
                  </label>

                  <label>
                    Corner rounding
                    <input
                      type="range"
                      min={0}
                      max={SHAPE_RADIUS_MAX}
                      step={2}
                      value={state.radius}
                      onChange={(event) => patchState({ radius: Number(event.target.value) })}
                    />
                    <small>{state.radius}px</small>
                  </label>
                </>
              ) : state.shape === "folder" ? (
                <>
                  <FolderControls state={state} patchState={patchState} />

                  <label>
                    Base transparency
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={1}
                      value={state.baseOpacity}
                      onChange={(event) => patchState({ baseOpacity: Number(event.target.value) })}
                    />
                    <small>{state.baseOpacity}%</small>
                  </label>

                  <div className="gradient-control-pair">
                    <GradientColorControl
                      label="Fill"
                      stops={state.fillStops}
                      gradientType={state.fillGradientType}
                      angle={state.fillGradientAngle}
                      centerX={state.fillGradientCenterX}
                      centerY={state.fillGradientCenterY}
                      onStopChange={(index, value) => handleGradientStopChange("fillStops", index, value)}
                      onAddStop={() => handleGradientStopAdd("fillStops")}
                      onRemoveStop={(index) => handleGradientStopRemove("fillStops", index)}
                      onGradientTypeChange={(type) => patchState({ fillGradientType: type })}
                      onAngleChange={(nextAngle) => patchState({ fillGradientAngle: nextAngle })}
                      onCenterChange={(x, y) =>
                        patchState({ fillGradientCenterX: x, fillGradientCenterY: y })
                      }
                    />

                    <GradientColorControl
                      label="Stroke"
                      stops={state.strokeStops}
                      gradientType={state.strokeGradientType}
                      angle={state.strokeGradientAngle}
                      centerX={state.strokeGradientCenterX}
                      centerY={state.strokeGradientCenterY}
                      onStopChange={(index, value) => handleGradientStopChange("strokeStops", index, value)}
                      onAddStop={() => handleGradientStopAdd("strokeStops")}
                      onRemoveStop={(index) => handleGradientStopRemove("strokeStops")}
                      onGradientTypeChange={(type) => patchState({ strokeGradientType: type })}
                      onAngleChange={(nextAngle) => patchState({ strokeGradientAngle: nextAngle })}
                      onCenterChange={(x, y) =>
                        patchState({ strokeGradientCenterX: x, strokeGradientCenterY: y })
                      }
                    />
                  </div>

                  <label>
                    Stroke width
                    <input
                      type="range"
                      min={0}
                      max={24}
                      step={1}
                      value={state.outline}
                      onChange={(event) => patchState({ outline: Number(event.target.value) })}
                    />
                    <small>{state.outline}px</small>
                  </label>
                </>
              ) : state.shape === "image" ? (
                <>
                  <ImageEditorControls
                    targetLabel="Shape image"
                    inputRef={shapeImageUploadInputRef}
                    imageState={getImageStateForTarget(state, "shape")}
                    exportSizeLabel="Use shape image size for export"
                    exportSizeSummary={
                      baseState.shapeEnabled && baseState.shape === "image" && preferredImageExportDimensions
                        ? exportSizeSummary
                        : "Export uses the 500 x 500 square canvas until this shape image is active in the base composition."
                    }
                    isExportSizeEnabled={
                      baseState.shapeEnabled && baseState.shape === "image" && Boolean(preferredImageExportDimensions)
                    }
                    isUsingExportImageSize={
                      baseState.shapeEnabled && baseState.shape === "image" && shouldUseImportedImageExportSize
                    }
                    onExportSizeToggle={setUseImportedImageExportSize}
                    onFileChange={(event) => handleImageFileChange(event, "shape")}
                    onUpload={() => handleUploadImageClick("shape")}
                    onRecrop={() => handleRecropExistingImage("shape")}
                    onRemove={() => handleRemoveImage("shape")}
                    onPatch={(patch) =>
                      patchState(getImagePatchForTarget("shape", { ...getImageStateForTarget(state, "shape"), ...patch }))
                    }
                  />

                  <label>
                    Base transparency
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={1}
                      value={state.baseOpacity}
                      onChange={(event) => patchState({ baseOpacity: Number(event.target.value) })}
                    />
                    <small>{state.baseOpacity}%</small>
                  </label>

                  <div className="gradient-control-pair">
                    <GradientColorControl
                      label="Fill"
                      stops={state.fillStops}
                      gradientType={state.fillGradientType}
                      angle={state.fillGradientAngle}
                      centerX={state.fillGradientCenterX}
                      centerY={state.fillGradientCenterY}
                      onStopChange={(index, value) => handleGradientStopChange("fillStops", index, value)}
                      onAddStop={() => handleGradientStopAdd("fillStops")}
                      onRemoveStop={(index) => handleGradientStopRemove("fillStops", index)}
                      onGradientTypeChange={(type) => patchState({ fillGradientType: type })}
                      onAngleChange={(nextAngle) => patchState({ fillGradientAngle: nextAngle })}
                      onCenterChange={(x, y) =>
                        patchState({ fillGradientCenterX: x, fillGradientCenterY: y })
                      }
                    />

                    <GradientColorControl
                      label="Stroke"
                      stops={state.strokeStops}
                      gradientType={state.strokeGradientType}
                      angle={state.strokeGradientAngle}
                      centerX={state.strokeGradientCenterX}
                      centerY={state.strokeGradientCenterY}
                      onStopChange={(index, value) => handleGradientStopChange("strokeStops", index, value)}
                      onAddStop={() => handleGradientStopAdd("strokeStops")}
                      onRemoveStop={(index) => handleGradientStopRemove("strokeStops", index)}
                      onGradientTypeChange={(type) => patchState({ strokeGradientType: type })}
                      onAngleChange={(nextAngle) => patchState({ strokeGradientAngle: nextAngle })}
                      onCenterChange={(x, y) =>
                        patchState({ strokeGradientCenterX: x, strokeGradientCenterY: y })
                      }
                    />
                  </div>

                  <label>
                    Stroke width
                    <input
                      type="range"
                      min={0}
                      max={24}
                      step={1}
                      value={state.outline}
                      onChange={(event) => patchState({ outline: Number(event.target.value) })}
                    />
                    <small>{state.outline}px</small>
                  </label>

                  <label>
                    Corner radius
                    <input
                      type="range"
                      min={0}
                      max={80}
                      step={2}
                      value={state.radius}
                      onChange={(event) => patchState({ radius: Number(event.target.value) })}
                    />
                    <small>{state.radius}px</small>
                  </label>
                </>
              ) : null}

              <button
                type="button"
                className={
                  isShapeAdvancedOpen
                    ? "btn-ghost section-advanced-toggle active"
                    : "btn-ghost section-advanced-toggle"
                }
                onClick={() => setShapeAdvancedOpen((open) => !open)}
                aria-expanded={isShapeAdvancedOpen}
              >
                <span
                  className={
                    isShapeAdvancedOpen
                      ? "section-advanced-chevron open"
                      : "section-advanced-chevron"
                  }
                  aria-hidden="true"
                >
                  ▸
                </span>
                Advanced
              </button>

              {isShapeAdvancedOpen ? (
                <div className="advanced-content">
                  <label>
                    <span className="label-head">
                      Safe inset
                      <HelpHint text={ADVANCED_HELP.inset} setTooltip={setCursorTooltip} />
                    </span>
                    <input
                      type="range"
                      min={6}
                      max={40}
                      step={1}
                      value={state.inset}
                      onChange={(event) => patchState({ inset: Number(event.target.value) })}
                    />
                    <small>{state.inset}px</small>
                  </label>
                </div>
              ) : null}
          </>
        </SectionPanel>

        <SectionPanel
          title="Back"
          isOpen={isBackLayerSectionOpen}
          onToggleOpen={() => setBackLayerSectionOpen((open) => !open)}
          isEnabled={isBackLayerSectionEnabled}
          onToggleEnabled={handleBackLayerSectionEnabledChange}
          headerPreview={<BackLayerSectionHeaderPreview state={state} />}
        >
          <>
              <BackLayerWheel
                angle={state.backAngle}
                distance={state.backDistance}
                onChange={handleBackLayerChange}
                lockDistance={isBackDistanceLocked}
                lockAngle={isBackAngleLocked}
                onLockDistanceChange={setBackDistanceLocked}
                onLockAngleChange={setBackAngleLocked}
              />
              <button
                type="button"
                className="btn-ghost"
                disabled={isBackDistanceLocked}
                onClick={() => patchState({ backDistance: 0 })}
              >
                Reset back layer
              </button>

              <label className="color-dot-control">
                <span>Back</span>
                <input
                  type="color"
                  value={state.backColor}
                  onChange={(event) => handleColorChange("backColor", event.target.value)}
                />
              </label>
          </>
        </SectionPanel>

          </>
        )}
          </div>
          <div className="controls-hero" aria-hidden={!isHeroVisible}>
            <div className="controls-hero-content">
              <p className="controls-hero-eyebrow">Iquan</p>
              <h1>Tiny icons for real places</h1>
              <p className="controls-hero-copy">{HERO_DESCRIPTION}</p>
              <p className="controls-hero-story">
                Shape <strong>text</strong>, <strong>Lucide symbols</strong>, and{" "}
                <strong>uploaded images</strong> into crisp little assets; tune the base,
                outlines, particles, and colors, then preview them where they actually live
                before exporting a PNG or saving the whole project.
              </p>
              <label className="controls-hero-walkthrough">
                <input
                  type="checkbox"
                  checked={walkthroughRequested}
                  onChange={handleWalkthroughToggle}
                />
                <span className="controls-hero-walkthrough-box" aria-hidden="true" />
                <span>Walk me through it</span>
              </label>
              <div className="controls-hero-actions">
                <button type="button" className="btn-primary controls-hero-cta" onClick={handleStartBuilder}>
                  {isDefaultComposition ? "Start the Wizard" : "Continue in the Wizard"}
                </button>
                <div className="controls-hero-alternates" aria-label="Other ways to start">
                  <button
                    type="button"
                    className="btn-secondary controls-hero-alt-button"
                    onClick={handleOpenEditor}
                  >
                    Open Editor
                  </button>
                  <button
                    type="button"
                    className="btn-secondary controls-hero-alt-button"
                    onClick={handleOpenLandingImport}
                  >
                    Import Project
                  </button>
                </div>
              </div>
              <p className="starter-template-label">Start from a preset</p>
              <div className="starter-template-grid" aria-label="Starter templates">
                {STARTER_TEMPLATES.map((template) => (
                  <StarterTemplateButton
                    key={template.id}
                    template={template}
                    onClick={() => handleApplyStarterTemplate(template)}
                  />
                ))}
              </div>
            </div>
          </div>
        </aside>
      </div>

      <div className="pane-column">
        <div className="pane-display-head">
          <h2 className="pane-display-title">Preview</h2>
        </div>

        <main className={previewContextMode === "message" ? "preview preview-message-mode" : "preview"}>
          <div className="preview-body" aria-hidden={isHeroVisible}>
            <div className="preview-header">
              <span>
                Base {baseMetrics.dimensions.width} x {baseMetrics.dimensions.height} in{" "}
                {canvasSize} x {canvasSize} canvas |{" "}
                {baseState.mode === "text"
                  ? `fit ${baseMetrics.fittedFontSize}px`
                  : baseMetrics.iconName}
              </span>
            </div>

            <div className="preview-stage" data-walkthrough-target="preview-stage">
              <div className="inspect-selector">
                <div className="inspect-selector-row">
                  <button
                    type="button"
                    className={
                      isSelectMenuOpen
                        ? "inspect-selector-button active"
                        : "inspect-selector-button"
                    }
                    onClick={() => {
                      setSelectMenuOpen((open) => !open);
                      setHighlightedInspectId("");
                    }}
                    aria-expanded={isSelectMenuOpen}
                    aria-haspopup="menu"
                  >
                    Select Something
                  </button>
                  <span className="inspect-selector-hint">
                    ...or use the mouse in the preview space to move and resize elements.
                    Hold Shift to keep proportions.
                  </span>
                </div>
                {isSelectMenuOpen ? (
                  <div className="inspect-selector-menu" role="menu">
                    {inspectTargets.length > 0 ? (
                      inspectTargets.map((target) => (
                        <button
                          type="button"
                          key={target.id}
                          className={
                            highlightedInspectId === target.id
                              ? "inspect-selector-item highlighted"
                              : "inspect-selector-item"
                          }
                          role="menuitem"
                          onMouseEnter={() => setHighlightedInspectId(target.id)}
                          onMouseLeave={() => setHighlightedInspectId("")}
                          onFocus={() => setHighlightedInspectId(target.id)}
                          onBlur={() => setHighlightedInspectId("")}
                          onClick={() => handleSelectInspectPart(target)}
                        >
                          <span>{target.label}</span>
                        </button>
                      ))
                    ) : (
                      <span className="inspect-selector-empty">No visible pieces</span>
                    )}
                  </div>
                ) : null}
              </div>
              <div className="preview-main-shell">
                <div
                  className="preview-canvas"
                  style={{ width: `${canvasSize}px`, height: `${canvasSize}px` }}
                >
                  <div
                    className="preview-zoom-layer"
                    style={{
                      transform: previewCompositionTransform,
                    }}
                  >
                    <CompositeIconStack
                      baseState={baseState}
                      particles={particles}
                      editorTarget={editorTarget}
                      className="preview-main-stack"
                      interactive={true}
                      inspectMode={true}
                      highlightedInspectId={highlightedInspectId}
                      inspectDragScale={previewLayout.scale * previewZoomScale}
                      showCornerHotspots={true}
                      onSelectBase={handleSelectBase}
                      onSelectParticle={handleSelectParticle}
                      onCornerAdd={handleCornerAddOrSelect}
                      onHighlightInspectPart={setHighlightedInspectId}
                      onSelectInspectPart={handleSelectInspectPart}
                      onDragInspectPart={handleDragInspectPart}
                      onResizeInspectPart={handleResizeInspectPart}
                    />
                  </div>
                </div>
              </div>
            </div>

            <section className="preview-contexts">
              <div className="preview-contexts-head">
                <div className="preview-contexts-title">
                  <h3>{previewContextMode === "message" ? "Message Preview" : "Quick Previews"}</h3>
                  <span>
                    {previewContextMode === "message"
                      ? "Messaging Platforms"
                      : "White, #323338, and black"}
                  </span>
                </div>
                <div className="preview-context-mode-toggle">
                  {PREVIEW_CONTEXT_OPTIONS.map((option) => (
                    <button
                      type="button"
                      key={option.id}
                      className={
                        previewContextMode === option.id
                          ? "preview-context-mode-button active"
                          : "preview-context-mode-button"
                      }
                      onClick={() => setPreviewContextMode(option.id)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {previewContextMode === "surfaces" ? (
                <div className="quick-preview-grid">
                  {QUICK_PREVIEW_SURFACES.map((surface) => (
                    <div key={surface.id} className={`quick-preview-tile ${surface.className}`}>
                      <p className="quick-preview-label">{surface.label}</p>
                      <div className="quick-preview-icon">
                        <div
                          className="context-icon-scale"
                          style={{
                            transform: `translate(-50%, -50%) scale(${quickPreviewScale})`,
                          }}
                        >
                          {renderContextCompositeStack()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="message-preview-shell">
                  <div className="message-preview-row">
                    <div className="message-preview-avatar" aria-hidden="true">
                      <span className="message-preview-avatar-initial">A</span>
                    </div>

                    <div className="message-preview-content">
                      <div className="message-preview-meta">
                        <span className="message-preview-author">Username</span>
                        <span className="message-preview-time">5:09 p.m.</span>
                      </div>

                      <p className="message-preview-line message-preview-line-inline-demo">
                        Within text
                        <span className="message-preview-inline-icon">
                          <span
                            className="context-icon-scale"
                            style={{
                              transform: `translate(-50%, -50%) scale(${messageInlineScale})`,
                            }}
                          >
                            {renderContextCompositeStack()}
                          </span>
                        </span>
                      </p>

                      <div className="message-preview-large-icon">
                        <span
                          className="context-icon-scale"
                          style={{
                            transform: `translate(-50%, -50%) scale(${messageLargeScale})`,
                          }}
                        >
                          {renderContextCompositeStack()}
                        </span>
                      </div>

                      <p className="message-preview-line message-preview-line-spaced">
                        This message has a reaction
                      </p>
                      <div className="message-preview-reactions">
                        <div className="message-preview-reaction message-preview-reaction-active">
                          <span className="message-preview-reaction-icon">
                            <span
                              className="context-icon-scale"
                              style={{
                                transform: `translate(-50%, -50%) scale(${messageReactionScale})`,
                              }}
                            >
                              {renderContextCompositeStack()}
                            </span>
                          </span>
                          <span className="message-preview-reaction-count">1</span>
                        </div>
                        <div className="message-preview-reaction-add" aria-hidden="true">
                          <svg
                            viewBox="0 0 24 24"
                            width="18"
                            height="18"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.7"
                          >
                            <circle cx="12" cy="12" r="8" />
                            <path d="M8.5 13.2c.9 1.1 2.1 1.6 3.5 1.6s2.6-.5 3.5-1.6" />
                            <circle cx="9.3" cy="10.2" r="1" fill="currentColor" stroke="none" />
                            <circle cx="14.7" cy="10.2" r="1" fill="currentColor" stroke="none" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </section>
          </div>
          <div className="preview-hero" aria-hidden={!isHeroVisible}>
            <div className="preview-hero-grid" aria-hidden="true" />
            <div className="preview-hero-samples">
              {heroSamples.map((sample, index) => {
                const layout = HERO_SAMPLE_LAYOUT[index];
                return (
                  <div
                    key={sample.id}
                    className="hero-sample"
                    style={{
                      left: layout.left,
                      top: layout.top,
                    }}
                  >
                    <div
                      className="hero-sample-card"
                      style={{
                        "--hero-rotation": `${layout.rotation}deg`,
                        "--hero-delay": `${layout.delay}ms`,
                      }}
                    >
                      <StaticCompositionPreview
                        baseState={sample.state}
                        particles={sample.particles}
                        targetSize={layout.size}
                        padding={14}
                        className="hero-sample-icon"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="preview-hero-center">
              <StaticCompositionPreview
                baseState={baseState}
                particles={particles}
                editorTarget={editorTarget}
                targetSize={HERO_PRIMARY_ICON_SIZE}
                padding={20}
                className="hero-primary-icon"
              />
            </div>
          </div>
        </main>
      </div>

      <section
        className="export-share-pane app-export-share-pane"
        data-hidden={isHeroVisible}
        aria-label="Export and sharing controls"
      >
        <div className="export-share-pane-head">
          <h3>Export + share</h3>
          <span>{exportTargetWidth} x {exportTargetHeight} output</span>
        </div>

        <label className="export-share-pane-label">
          <span>Workspace canvas</span>
          <div className="size-quick-row">
            {CANVAS_SIZE_PRESETS.map((size) => (
              <button
                type="button"
                key={size}
                className={canvasSize === size ? "size-chip active" : "size-chip"}
                onClick={() => handleCanvasSizeChange(size)}
              >
                {size}
              </button>
            ))}
          </div>
          <small>{canvasSize} x {canvasSize}</small>
        </label>

        <label className="export-share-pane-label">
          <span>PNG scale</span>
          <div className="size-quick-row">
            {EXPORT_SCALE_OPTIONS.map((scale) => (
              <button
                type="button"
                key={scale}
                className={exportScale === scale ? "size-chip active" : "size-chip"}
                onClick={() => setExportScale(scale)}
              >
                {scale}x
              </button>
            ))}
          </div>
          <small>{exportSizeSummary}</small>
        </label>

        <div className="export-pane-secondary-row">
          <button
            type="button"
            className="btn-ghost"
            onClick={() => {
              setLoadCode(fullShareCode);
              setShareOpen(true);
            }}
          >
            Import / export code
          </button>
          <button type="button" className="btn-secondary" onClick={handleCopyShareLink}>
            Copy link
          </button>
          <button type="button" className="btn-secondary" onClick={handleLoadIquanLogo}>
            Use iquan logo
          </button>
        </div>

        <button type="button" className="btn-primary export-pane-primary" onClick={handleExport}>
          Export PNG
        </button>
      </section>

      {walkthroughOverlay}

      {exportCaptureBuffer}

      <input
        ref={projectFileInputRef}
        type="file"
        accept=".iquan.json,application/json"
        className="visually-hidden-file"
        onChange={handleProjectFileChange}
      />

      {aboutModal}
      {specModal}

      <Modal
        open={isShareOpen}
        title="Import / Export Code"
        onClose={() => setShareOpen(false)}
        actions={
          <>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setShareOpen(false)}
            >
              Close
            </button>
            <button type="button" className="btn-primary" onClick={handleLoadCode}>
              Apply code
            </button>
          </>
        }
      >
        <p className="about-modal-copy import-export-modal-copy">
          Share links are best for text and icon work. Project files preserve everything,
          including uploaded images. Paste an IC code, URL, or .iquan JSON below, then apply it.{" "}
          {hasImageBackedShare
            ? "This icon uses uploaded images, so export a project file for full fidelity."
            : ""}
        </p>
        <div className="import-export-workspace">
          <label className="import-export-code-field">
            <span>Import code or project JSON</span>
            <textarea
              value={loadCode}
              onChange={(event) => setLoadCode(event.target.value)}
              placeholder="Paste IC11|... code, URL, or .iquan JSON"
            />
          </label>

          <div className="import-export-group-grid">
            <section className="import-export-group">
              <div>
                <h4>Share</h4>
                <p>Use these for text and icon compositions.</p>
              </div>
              <div className="import-export-group-actions">
                <button type="button" className="btn-secondary" onClick={handleCopyShareLink}>
                  Copy link
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() =>
                    copyToClipboard(fullShareCode, "Share code copied (full fidelity)")
                  }
                >
                  Copy code
                </button>
              </div>
            </section>

            <section className="import-export-group">
              <div>
                <h4>Project file</h4>
                <p>Best for uploaded images or work you want to edit later.</p>
              </div>
              <div className="import-export-group-actions">
                <button type="button" className="btn-secondary" onClick={handleImportProjectClick}>
                  Import file
                </button>
                <button type="button" className="btn-secondary" onClick={handleExportProject}>
                  Export project
                </button>
              </div>
            </section>
          </div>

          <button
            type="button"
            className="btn-ghost import-export-paste"
            onClick={handlePasteCode}
          >
            Paste from clipboard
          </button>
        </div>
      </Modal>

      <IconPickerModal
        open={isIconPickerOpen}
        onClose={() => setIconPickerOpen(false)}
        selectedIcon={activeMetrics.iconName}
        onSelect={handleSelectLucide}
      />

      <FontPickerModal
        open={isFontPickerOpen}
        onClose={() => setFontPickerOpen(false)}
        selectedFont={state.fontFamily}
        onSelect={handleSelectFont}
      />

      <ImageCropModal
        open={imageCropState.open}
        title={imageCropState.targetKind === "shape" ? "Crop Shape Image?" : "Crop Content Image?"}
        targetLabel={imageCropState.targetKind === "shape" ? "Shape image" : "Content image"}
        imageData={imageCropState.imageData}
        imageName={imageCropState.imageName}
        imageWidth={imageCropState.imageWidth}
        imageHeight={imageCropState.imageHeight}
        draft={imageCropState.draft}
        onDraftChange={(draft) =>
          setImageCropState((current) => ({
            ...current,
            draft: clampCropDraft(draft, current.imageWidth, current.imageHeight),
          }))
        }
        onApplyCrop={handleApplySquareCrop}
        onKeepOriginal={handleKeepOriginalImage}
        onClose={closeImageCropModal}
      />

      {cursorTooltip ? (
        <div
          className="cursor-tooltip"
          style={{ left: `${cursorTooltip.x}px`, top: `${cursorTooltip.y}px` }}
        >
          {cursorTooltip.text}
        </div>
      ) : null}

      {toast ? <div className="toast">{toast}</div> : null}
    </div>
  );
}

export {
  DEFAULT_STATE,
  PROJECT_FILE_VERSION,
  SHARE_CODE_VERSION,
  createProjectPayload,
  extractShareCodeFromUrl,
  resolveUrlHydration,
  createShareUrl,
  encodeIconState,
  encodeState,
  encodeProjectPayload,
  decodeState,
  decodeProjectPayload,
  decodeProjectOrShareInput,
  sanitizeIconState,
};

export default App;
