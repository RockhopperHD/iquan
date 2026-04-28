# Iquan Formation and Rendering Specification

This document describes how an iquan is formed from an iquan code, how that code becomes a renderable composition, and how host applications should display iquans inline as text-like characters. It is intended to be detailed enough for another application, including an LLM-built application, to implement iquans as a feature without reusing the original React UI.

The reference implementation for this spec lives in `src/App.jsx`. The current canonical share-code version is `IC11`. The current full project-file version is `IQP1`.

## Conceptual Model

An iquan is a compact, renderable icon composition. It is not a single Unicode character, but host apps should treat it like a custom emoji or inline attachment: a single atomic character-like object that can be inserted in text, selected as one unit, copied, deleted, scaled with the surrounding font size, and aligned to the text baseline.

An iquan composition contains:

- A required base icon state.
- Zero or more particle icon states anchored to points around the base.
- A canvas size used for editor/export framing, defaulting to `500`.

Every icon state contains:

- A base shape, folder base, image base, or disabled base.
- Content inside the base: text, a Lucide icon, an uploaded image, or disabled content.
- Optional back layer behind the base, offset by angle and distance.
- Optional content and base offsets for moving the content face or base surface away from the icon state's origin.
- Paint, stroke, opacity, typography, image-processing, sizing, and rounding fields.

Particles are independent icon states. They use the same rendering rules as the base, but are positioned relative to a named anchor point on the base.

## Code Families

There are two modern ways to carry an iquan:

1. `IC11` share code: compact, URL-friendly, intended for paste/share links and inline text insertion.
2. `IQP1` project JSON: verbose, full-fidelity project file, intended to preserve uploaded image payloads and metadata.

Legacy `IC3` through `IC10` codes exist in the app. New implementations should decode `IC11` and `IQP1` first. Legacy decode support is useful for compatibility, but should not be used for new output.

## `IC11` Share Code Format

An `IC11` code has this shape:

```text
IC11|<base64url-json-payload>
```

The part after the pipe is a UTF-8 JSON string encoded with base64url:

- Encode JSON text as UTF-8 bytes.
- Standard base64 encode the bytes.
- Replace `+` with `-`.
- Replace `/` with `_`.
- Remove trailing `=` padding.

To decode:

- Replace `-` with `+`.
- Replace `_` with `/`.
- Add `=` padding until the length is divisible by 4.
- Standard base64 decode to bytes.
- Decode UTF-8 to JSON text.
- Parse JSON.

The decoded payload has this shape:

```json
{
  "version": "IC11",
  "b": {
    "t": "OK",
    "f": ["#ecfeff", "#a5f3fc"],
    "o": ["#0891b2"]
  },
  "c": 500,
  "p": [
    [2, 8, -8, { "m": "icon", "l": "sparkles", "s": 70 }]
  ]
}
```

Payload fields:

| Field | Required | Meaning |
| --- | --- | --- |
| `version` | Yes | Must be `IC11` for current output. `IC9` and `IC10` use the same decoded shape in the reference app. |
| `b` | Yes | Compact base icon state. Missing fields are filled from defaults. |
| `c` | No | Canvas size in px. Defaults to `500`. Sanitized to `320..960`. |
| `p` | No | Particle list. Each item is `[cornerIndex, offsetX, offsetY, compactIconState?]`. |

The share-code encoder omits fields whose values match defaults. A decoder must expand the compact object, apply defaults, then sanitize.

Important: URL-safe share codes intentionally strip uploaded image payloads. If an iquan uses content-image mode or shape-image mode, a URL-safe code can describe that an image should exist but may not contain `imageData` or `baseImageData`. Full image fidelity requires an `IQP1` project file or some host-provided asset mapping.

To encode a new `IC11` code from a state:

1. Sanitize the base icon state.
2. If producing a URL-safe share code, clear all content-image and shape-image payload fields on the base and every particle.
3. Sanitize the canvas size to `320..960`.
4. Build `b` by comparing each full icon-state field to the default state and writing only fields whose values differ, using the compact-token map below.
5. Iterate particle corners in the fixed order `topLeft`, `topMiddle`, `topRight`, `left`, `right`, `bottomLeft`, `bottomMiddle`, `bottomRight`.
6. For each existing particle, sanitize it and write `[cornerIndex, offsetX, offsetY]`.
7. Compact the particle's icon state. If any fields differ from defaults, append that compact object as the fourth array item.
8. Build `{ "version": "IC11", "b": compactBase }`, adding `c` only if the canvas is not `500`, and adding `p` only if at least one particle exists.
9. JSON-stringify the payload without requiring indentation.
10. Base64url-encode the JSON and prepend `IC11|`.

## `IQP1` Project File Format

Project files are JSON, not base64-wrapped:

```json
{
  "version": "IQP1",
  "app": "iquan",
  "metadata": {
    "title": "Untitled Iquan icon",
    "createdAt": "2026-04-27T00:00:00.000Z"
  },
  "canvasSize": 500,
  "base": {
    "mode": "text",
    "content": "A"
  },
  "particles": {
    "topRight": {
      "offsetX": 8,
      "offsetY": -8,
      "icon": {
        "mode": "icon",
        "lucide": "sparkles"
      }
    }
  }
}
```

Project fields:

| Field | Required | Meaning |
| --- | --- | --- |
| `version` | Yes | Must be `IQP1`. |
| `app` | Yes | Must be `iquan`. |
| `metadata` | No | Free metadata. The app writes a title and may write `createdAt`. |
| `canvasSize` | No | Export/editor canvas size, sanitized to `320..960`. |
| `base` | Yes | Full, uncompacted icon state. |
| `particles` | No | Object keyed by particle corner names. |

Project files may include `data:image/...` payloads and are the preferred interchange format when uploaded images matter.

## Compact Icon State Tokens

An `IC11` compact icon state maps short tokens to full icon-state fields. When decoding, map tokens back to full field names, merge over defaults, and sanitize.

| Token | Field |
| --- | --- |
| `m` | `mode` |
| `me` | `contentEnabled` |
| `h` | `shape` |
| `he` | `shapeEnabled` |
| `t` | `content` |
| `l` | `lucide` |
| `lw` | `lucideWeight` |
| `s` | `size` |
| `is` | `iconScale` |
| `ws` | `widthScale` |
| `hs` | `heightScale` |
| `pw` | `pillWidthScale` |
| `ph` | `pillHeightScale` |
| `r` | `radius` |
| `ftx` | `folderTabX` |
| `ftw` | `folderTabWidth` |
| `fth` | `folderTabHeight` |
| `fs` | `fontSize` |
| `lt` | `linkTextToSize` |
| `sp` | `spacing` |
| `ff` | `fontFamily` |
| `fw` | `fontWeight` |
| `in` | `inset` |
| `f` | `fillStops` |
| `ft` | `fillGradientType` |
| `fa` | `fillGradientAngle` |
| `fx` | `fillGradientCenterX` |
| `fy` | `fillGradientCenterY` |
| `bo` | `baseOpacity` |
| `tc` | `textColor` |
| `co` | `contentOpacity` |
| `cox` | `contentOffsetX` |
| `coy` | `contentOffsetY` |
| `cr` | `contentRotation` |
| `sox` | `shapeOffsetX` |
| `soy` | `shapeOffsetY` |
| `o` | `strokeStops` |
| `ot` | `strokeGradientType` |
| `oa` | `strokeGradientAngle` |
| `ox` | `strokeGradientCenterX` |
| `oy` | `strokeGradientCenterY` |
| `bc` | `backColor` |
| `ol` | `outline` |
| `ble` | `backLayerEnabled` |
| `bd` | `backDistance` |
| `ba` | `backAngle` |
| `id` | `imageData` |
| `im` | `imageName` |
| `iw` | `imageWidth` |
| `ih` | `imageHeight` |
| `ce` | `imageCropEnabled` |
| `cx` | `imageCropX` |
| `cy` | `imageCropY` |
| `cs` | `imageCropSize` |
| `ir` | `imageRotation` |
| `ihh` | `imageHue` |
| `ic` | `imageContrast` |
| `ib` | `imageBrightness` |
| `si` | `imageSilhouette` |
| `sc` | `imageSilhouetteColor` |
| `es` | `imageEdgeStroke` |
| `ec` | `imageEdgeStrokeColor` |
| `jd` | `baseImageData` |
| `jn` | `baseImageName` |
| `jw` | `baseImageWidth` |
| `jh` | `baseImageHeight` |
| `jce` | `baseImageCropEnabled` |
| `jcx` | `baseImageCropX` |
| `jcy` | `baseImageCropY` |
| `jcs` | `baseImageCropSize` |
| `jr` | `baseImageRotation` |
| `jhh` | `baseImageHue` |
| `jc` | `baseImageContrast` |
| `jb` | `baseImageBrightness` |
| `js` | `baseImageSilhouette` |
| `jsc` | `baseImageSilhouetteColor` |
| `jes` | `baseImageEdgeStroke` |
| `jec` | `baseImageEdgeStrokeColor` |

## Default Icon State

Use this state before applying compact or project fields:

```json
{
  "mode": "text",
  "contentEnabled": true,
  "shape": "shape",
  "shapeEnabled": true,
  "content": "A",
  "lucide": "sparkles",
  "lucideWeight": 1.9,
  "size": 168,
  "iconScale": 100,
  "widthScale": 100,
  "heightScale": 100,
  "pillWidthScale": 170,
  "pillHeightScale": 72,
  "radius": 24,
  "folderTabX": 12,
  "folderTabWidth": 34,
  "folderTabHeight": 20,
  "fontSize": 78,
  "linkTextToSize": true,
  "spacing": 0,
  "fontFamily": "Inter, system-ui, sans-serif",
  "fontWeight": "700",
  "inset": 16,
  "aesthetic": "flat",
  "fill": "#ffffff",
  "fillStops": ["#ffffff"],
  "fillGradientType": "linear",
  "fillGradientAngle": 135,
  "fillGradientCenterX": 50,
  "fillGradientCenterY": 50,
  "baseOpacity": 100,
  "textColor": "#1f2937",
  "contentOpacity": 100,
  "contentOffsetX": 0,
  "contentOffsetY": 0,
  "contentRotation": 0,
  "shapeOffsetX": 0,
  "shapeOffsetY": 0,
  "outlineColor": "#d6deed",
  "strokeColor": "#d6deed",
  "strokeStops": ["#d6deed"],
  "strokeGradientType": "linear",
  "strokeGradientAngle": 135,
  "strokeGradientCenterX": 50,
  "strokeGradientCenterY": 50,
  "backColor": "#c8d2e6",
  "outline": 2,
  "backLayerEnabled": true,
  "backDistance": 0,
  "backAngle": 45,
  "imageData": "",
  "imageName": "",
  "imageWidth": 0,
  "imageHeight": 0,
  "imageCropEnabled": false,
  "imageCropX": 0,
  "imageCropY": 0,
  "imageCropSize": 1,
  "imageRotation": 0,
  "imageHue": 0,
  "imageContrast": 100,
  "imageBrightness": 100,
  "imageSilhouette": false,
  "imageSilhouetteColor": "#111111",
  "imageEdgeStroke": 0,
  "imageEdgeStrokeColor": "#ffffff",
  "baseImageData": "",
  "baseImageName": "",
  "baseImageWidth": 0,
  "baseImageHeight": 0,
  "baseImageCropEnabled": false,
  "baseImageCropX": 0,
  "baseImageCropY": 0,
  "baseImageCropSize": 1,
  "baseImageRotation": 0,
  "baseImageHue": 0,
  "baseImageContrast": 100,
  "baseImageBrightness": 100,
  "baseImageSilhouette": false,
  "baseImageSilhouetteColor": "#111111",
  "baseImageEdgeStroke": 0,
  "baseImageEdgeStrokeColor": "#ffffff"
}
```

## Sanitization Rules

Sanitization is part of formation. Do not render raw decoded fields directly.

General helpers:

```js
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const parseIntOr = (value, fallback) => Number.isFinite(Number.parseInt(value, 10))
  ? Number.parseInt(value, 10)
  : fallback;
const parseFloatOr = (value, fallback) => Number.isFinite(Number.parseFloat(value))
  ? Number.parseFloat(value)
  : fallback;
```

Field bounds and enums:

| Field | Sanitization |
| --- | --- |
| `mode` | Lowercase string. `lucide` aliases to `icon`. Allowed: `text`, `icon`, `image`, `none`. Unknown becomes `text`. |
| `contentEnabled` | `false` only if explicitly false or mode is `none`; otherwise true. |
| `shape` | Allowed raw values: `shape`, `folder`, `image`, `none`, `square`, `circle`, `pill`, `rectangle`. Canonical current state uses `shape`, `folder`, `image`, or disabled shape behavior. UI presets are represented by width, height, and radius. |
| `shapeEnabled` | `false` only if explicitly false or shape is `none`; otherwise true. |
| `content` | String, max 12 UTF-16 code units. Empty content renders as a space in text mode. |
| `lucide` | Trim, convert camelCase to kebab case, replace spaces/underscores with `-`, remove non-alphanumeric/hyphen characters, lowercase, collapse repeated hyphens, trim hyphens. Empty becomes `sparkles`. |
| `lucideWeight` | Float, `0.8..10`. |
| `size` | Integer, `64..320`. |
| `iconScale` | Integer, `40..140`. |
| `widthScale` | Integer, `40..260`. For legacy raw `rectangle`, default fallback is `160`; for legacy raw `pill`, fallback is `pillWidthScale` or `170`. |
| `heightScale` | Integer, `60..140`. For legacy raw `pill`, fallback is `pillHeightScale` or `72`. |
| `pillWidthScale` | Integer, `110..240`. |
| `pillHeightScale` | Integer, `60..110`. |
| `radius` | Integer, `0..240`, except raw `circle` or raw `pill` force `240`. Rendering later clamps to half of the smaller dimension. |
| `folderTabX` | Integer, `0..70`, tab start position as a percentage of folder width. |
| `folderTabWidth` | Integer, `18..82`, tab width as a percentage of folder width. |
| `folderTabHeight` | Integer, `10..42`, tab height as a percentage of folder height. |
| `fontSize` | Integer, `16..180`. |
| `linkTextToSize` | `false` only if explicitly false; otherwise true. |
| `spacing` | Integer, `0..20`. |
| `fontFamily` | String, no validation beyond conversion. |
| `fontWeight` | Integer parsed from input, clamped to `100..1000`, stored as a string. |
| `inset` | Integer, `6..40`. |
| `aesthetic` | Only `flat` is valid. |
| `fillStops` | Array or string. Keep at most two colors. Each color must be `#rrggbb`; invalid entries fall back. |
| `fill` | Legacy alias. If `fillStops` is not an array, use sanitized `fill` as first stop. |
| `fillGradientType` | `linear` or `radial`. |
| `fillGradientAngle` | Integer, `0..359`. |
| `fillGradientCenterX`, `fillGradientCenterY` | Integer, `0..100`. |
| `baseOpacity` | Integer, `0..100`. |
| `textColor` | `#rrggbb`, fallback `#1f2937`. |
| `contentOpacity` | Integer, `0..100`. |
| `contentOffsetX`, `contentOffsetY` | Floats, `-180..180` px. Moves text, Lucide icon, or content image relative to the icon state's content origin. |
| `contentRotation` | Float, `-180..180` degrees. Applies to text and Lucide icon content. Uploaded image rotation uses image-specific rotation fields. |
| `shapeOffsetX`, `shapeOffsetY` | Floats, `-180..180` px. Moves the base surface and its back layer relative to the icon state's origin. Content remains independently positioned by content offsets. |
| `strokeStops` | Same as `fillStops`. |
| `strokeColor`, `outlineColor` | Legacy aliases. If `strokeStops` is not an array, use `strokeColor` or `outlineColor` as first stop. |
| `strokeGradientType` | `linear` or `radial`. |
| `strokeGradientAngle` | Integer, `0..359`. |
| `strokeGradientCenterX`, `strokeGradientCenterY` | Integer, `0..100`. |
| `backColor` | `#rrggbb`, fallback `#c8d2e6`. |
| `outline` | Integer, `0..24`. |
| `backLayerEnabled` | `false` only if explicitly false; otherwise true. |
| `backDistance` | Integer, `0..32`. |
| `backAngle` | Integer, `0..359`. |
| Image data fields | `imageData` and `baseImageData` must start with `data:image/`; otherwise empty. |
| Image names | String, whitespace collapsed, max 120 characters; only meaningful when the corresponding image data exists. |
| Image dimensions | Integers, `0..1400`. |
| Image crop size | Float, `0.22..1`. |
| Image crop X/Y | Floats clamped so the square crop remains inside the source image. These are normalized source-image coordinates, not rendered-content offsets. |
| Image rotation | Float, `-180..180` degrees. |
| Image hue | Float, `-180..180` degrees. |
| Image contrast | Float, `0..220` percent. |
| Image brightness | Float, `0..220` percent. |
| Image silhouette | True only if explicitly true. |
| Image silhouette color | `#rrggbb`. |
| Image edge stroke | Integer, `0..28`. |
| Image edge stroke color | `#rrggbb`. |

Shape preset formation:

| User-facing preset | Canonical fields |
| --- | --- |
| Square | `shape: "shape"`, `widthScale: 100`, `heightScale: 100`, `radius: 24` |
| Circle | `shape: "shape"`, `widthScale: 100`, `heightScale: 100`, `radius: 240` |
| Pill | `shape: "shape"`, `widthScale: 170`, `heightScale: 72`, `radius: 240` |
| Rectangle | `shape: "shape"`, `widthScale: 160`, `heightScale: 100`, `radius: 24` |
| Folder | `shape: "folder"` plus `folderTabX`, `folderTabWidth`, `folderTabHeight`, and the normal base size, width, height, radius, fill, stroke, opacity, and back-layer fields |
| Image base | `shape: "image"` plus `baseImageData` and image-processing fields |
| No base | `shapeEnabled: false` or legacy raw `shape: "none"` |

## Authoring Options

The format represents these authoring choices. Host apps may expose all, some, or none of these controls, but must preserve and render them if present in an `IC11` or `IQP1` payload.

Content options:

- Enable/disable content with `contentEnabled`; disabled content renders nothing and normalizes `mode` back to the default for storage.
- Choose content mode: `text`, `icon`, `image`, or legacy/imported `none`.
- Text mode: edit `content`, `fontFamily`, `fontWeight`, `fontSize`, `linkTextToSize`, `spacing`, `textColor`, `contentOpacity`, `contentOffsetX`, `contentOffsetY`, `contentRotation`, `iconScale`, and `inset`.
- Icon mode: edit `lucide`, `lucideWeight`, `textColor`, `contentOpacity`, `contentOffsetX`, `contentOffsetY`, `contentRotation`, `iconScale`, and `inset`.
- Image mode: edit/upload/remove `imageData`, `imageName`, `imageWidth`, `imageHeight`, crop fields, `imageRotation`, `imageHue`, `imageContrast`, `imageBrightness`, `imageSilhouette`, `imageSilhouetteColor`, `imageEdgeStroke`, `imageEdgeStrokeColor`, `contentOpacity`, `contentOffsetX`, `contentOffsetY`, `iconScale`, and `inset`.

Base options:

- Enable/disable the base with `shapeEnabled`; disabled base renders no shape surface or back layer.
- Choose base mode: `shape`, `folder`, `image`, or legacy/imported `none`.
- Shape and folder bases share `size`, `widthScale`, `heightScale`, `radius`, `fillStops`, gradient fields, `strokeStops`, stroke gradient fields, `outline`, `baseOpacity`, `shapeOffsetX`, and `shapeOffsetY`.
- Folder bases also use `folderTabX`, `folderTabWidth`, and `folderTabHeight`.
- Image bases use `baseImageData`, `baseImageName`, `baseImageWidth`, `baseImageHeight`, crop fields, `baseImageRotation`, `baseImageHue`, `baseImageContrast`, `baseImageBrightness`, `baseImageSilhouette`, `baseImageSilhouetteColor`, `baseImageEdgeStroke`, and `baseImageEdgeStrokeColor`.
- Back layers use `backLayerEnabled`, `backColor`, `backDistance`, and `backAngle`, and move with `shapeOffsetX` and `shapeOffsetY`.

Movement and resizing options:

- Content movement writes `contentOffsetX` and `contentOffsetY`. The reference UI exposes a zone control, keyboard arrow nudging, and direct canvas dragging.
- Base movement writes `shapeOffsetX` and `shapeOffsetY`. The reference UI exposes direct canvas dragging.
- Content resize writes `iconScale`; if resized from a visual handle, the reference UI also shifts `contentOffsetX/Y` by half of the pointer delta so the opposite side behaves like the anchor.
- Base resize writes `widthScale` and `heightScale` for `shape` and `folder` bases, or `size` for non-rectangular/image-style bases; visual-handle resizing also shifts `shapeOffsetX/Y` by half of the pointer delta.
- Particle movement writes the particle's `offsetX` and `offsetY`, independent of the particle icon's own content/base offsets.
- Image crop movement writes `imageCropX/Y` or `baseImageCropX/Y`; image crop resize writes `imageCropSize` or `baseImageCropSize`. Crop movement changes the sampled source rectangle, not the rendered position inside the base.

## Particles

Particle corners are encoded by index in share codes:

| Index | Key | Anchor point on base |
| --- | --- | --- |
| `0` | `topLeft` | `(0, 0)` |
| `1` | `topMiddle` | `(baseWidth / 2, 0)` |
| `2` | `topRight` | `(baseWidth, 0)` |
| `3` | `left` | `(0, baseHeight / 2)` |
| `4` | `right` | `(baseWidth, baseHeight / 2)` |
| `5` | `bottomLeft` | `(0, baseHeight)` |
| `6` | `bottomMiddle` | `(baseWidth / 2, baseHeight)` |
| `7` | `bottomRight` | `(baseWidth, baseHeight)` |

Particle offsets:

- `offsetX` and `offsetY` are integers clamped to `-120..120`.
- A missing particle icon becomes a default particle derived from the base.
- A default particle copies the base, sets `size` to `round(base.size * 0.42)` clamped to `64..220`, sets image/disabled shapes back to `shape`, and sets `backDistance` to `0`.

Particle placement:

```js
function getParticlePlacement(corner, baseDimensions, particleDimensions, offsetX, offsetY) {
  const anchor = getCornerPoint(corner, baseDimensions.width, baseDimensions.height);
  const left = anchor.x - particleDimensions.width / 2 + offsetX;
  const top = anchor.y - particleDimensions.height / 2 + offsetY;
  return {
    left,
    top,
    centerX: left + particleDimensions.width / 2,
    centerY: top + particleDimensions.height / 2
  };
}
```

Particles render above the base at `z-index` equivalent priority.

## Icon Metrics

Before drawing an icon state, compute metrics.

Visible outline:

```js
const visibleOutline = iconState.outline;
```

Dimensions:

```js
function getDimensions(state) {
  if (state.shape === "shape" || state.shape === "folder") {
    return {
      width: Math.max(1, Math.round(state.size * (state.widthScale / 100))),
      height: Math.max(1, Math.round(state.size * (state.heightScale / 100)))
    };
  }
  return { width: state.size, height: state.size };
}
```

Border radius:

```js
function getShapeRadius(shape, width, height, radius) {
  if (shape === "none") return 0;
  return clamp(radius, 0, Math.min(width, height) / 2);
}
```

Back-layer offset:

```js
function getOffset(distance, angle) {
  const radians = (angle * Math.PI) / 180;
  return {
    x: Math.cos(radians) * distance,
    y: Math.sin(radians) * distance
  };
}
```

Content render size:

- For text mode, content uses a fitted font size.
- For icon and image mode, content render size is based on the base size and `iconScale`.
- `baseSize = min(width, height)`.
- `iconSafeSize = max(12, baseSize - (inset + outline) * 2)`.
- `iconScaleBaseSize = mode === "text" ? iconSafeSize : baseSize`.
- `iconRenderSize = max(10, round(iconScaleBaseSize * iconScale / 100))`.

## Text Measurement and Fitting

Text mode should fit inside the base. The reference implementation measures text on a canvas:

```js
function measureTextWidth(text, fontSize, fontWeight, fontFamily, spacing) {
  const sample = text || " ";
  context.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
  const metrics = context.measureText(sample);
  const visualWidth = Math.max(
    metrics.width,
    (metrics.actualBoundingBoxLeft ?? 0) + (metrics.actualBoundingBoxRight ?? metrics.width)
  );
  const spacingWidth = Math.max(0, [...sample].length - 1) * spacing;
  return (visualWidth + spacingWidth) * 1.04;
}
```

Fit bounds for text:

```js
const innerWidth = max(1, width - inset * 2 - outline * 2);
const innerHeight = max(1, height - inset * 2 - outline * 2);
const widthSlack = min(14, max(2, round(innerWidth * 0.14)));
const heightSlack = min(12, max(2, round(innerHeight * 0.12)));
const fitWidth = max(1, innerWidth - widthSlack);
const fitHeight = max(1, innerHeight - heightSlack);
const safeWidth = fitWidth * (iconScale / 100);
const safeHeight = fitHeight * (iconScale / 100);
```

Text fits if:

```js
measureTextWidth(content || " ", candidateFontSize, fontWeight, fontFamily, spacing) <= safeWidth
&& candidateFontSize <= safeHeight
```

Fitted font size:

- If mode is not `text`, use `round(size * 0.48 * iconScale / 100)`.
- If `linkTextToSize` is true, try the requested `fontSize`; if it does not fit, binary-search downward to the largest integer size that fits, with lower bound `8`.
- If `linkTextToSize` is false, binary-search up to `max(24, round(size * 2.2))`.

Text rendering:

- Position at the center of the icon plus `contentOffsetX` and `contentOffsetY`.
- Use `display: inline-flex`, `align-items: center`, `justify-content: center`.
- Use `line-height: 1`.
- Use `white-space: pre`.
- Apply `fontFamily`, `fontWeight`, `fontSize`, `letterSpacing`.
- Apply `color: textColor` and `opacity: contentOpacity / 100`.
- Rotate around the center by `contentRotation` degrees.
- Padding is `inset + outline`, though the centered absolute layout is what primarily controls placement.

## Paint and Gradients

Color stops:

- Up to two stops.
- One stop means a solid color.
- Two stops form either a linear or radial CSS gradient.

Paint string:

```js
function getGradientPaint(stops, type, angle, centerX = 50, centerY = 50) {
  if (stops.length < 2) return stops[0];
  if (type === "radial") {
    return `radial-gradient(circle at ${centerX}% ${centerY}%, ${stops.join(", ")})`;
  }
  return `linear-gradient(${angle}deg, ${stops.join(", ")})`;
}
```

Base surface:

- If `outline <= 0`: background is fill paint, no border.
- If `outline > 0` and there is one stroke stop: background is fill paint, border is `outline px solid strokeStops[0]`.
- If `outline > 0` and there are two stroke stops: border is transparent, background image is `<fillPaint>, <strokePaint>`, background origin is `border-box`, and background clip is `padding-box, border-box`.

Base opacity applies to the base surface only, not to content or particles.

## Image Processing

There are two independent image targets:

- Content image: `imageData`, used when `mode === "image"`.
- Shape image: `baseImageData`, used when `shape === "image"`.

Both use the same processing model. Shape-image fields are the content-image fields with a `base` prefix.

Processing pipeline:

1. Load the `data:image/...` source.
2. Create a square `720 x 720` canvas.
3. Determine the source rectangle.
4. Fit the source rectangle into the square canvas using contain scaling.
5. Translate canvas origin to center.
6. Rotate by `imageRotation` degrees.
7. Apply canvas filter: `hue-rotate(imageHue deg) contrast(imageContrast%) brightness(imageBrightness%)`.
8. Draw the image centered.
9. If silhouette is enabled, replace every non-transparent pixel's RGB with the silhouette color while preserving alpha.
10. If edge stroke is greater than zero, draw a colored alpha mask around the image in a circle of sample offsets, then draw the image over it.
11. Export the processed result as PNG data URL for rendering.

Source rectangle:

```js
function getImageSourceRect(imageState, imageWidth, imageHeight) {
  if (!imageState.imageCropEnabled) {
    return { sx: 0, sy: 0, sw: imageWidth, sh: imageHeight };
  }

  const shorter = Math.min(imageWidth, imageHeight);
  const cropSize = clamp(imageState.imageCropSize, 0.22, 1) * shorter;
  const maxX = Math.max(0, imageWidth - cropSize);
  const maxY = Math.max(0, imageHeight - cropSize);
  const sx = clamp(imageState.imageCropX * imageWidth, 0, maxX);
  const sy = clamp(imageState.imageCropY * imageHeight, 0, maxY);
  return { sx, sy, sw: cropSize, sh: cropSize };
}
```

Content image rendering:

- Occupies the full icon dimensions.
- Has padding `inset + outline`.
- Moves by `contentOffsetX` and `contentOffsetY`.
- Uses `object-fit: contain`.
- Applies `opacity: contentOpacity / 100`.

Shape image rendering:

- Lives inside the base surface, inset by `outline`.
- Border radius is `max(0, borderRadius - outline)`.
- Uses `object-fit: cover`.
- Is clipped by the base shape.
- Moves with the base surface through `shapeOffsetX` and `shapeOffsetY`.

Folder base rendering:

- `shape: "folder"` uses the same computed dimensions, opacity, fill, stroke, outline width, back layer, and radius fields as the regular base shape.
- The folder renders as a flat desktop folder with a top tab and rounded lower body.
- `folderTabX`, `folderTabWidth`, and `folderTabHeight` control the tab's horizontal position, width, and height.
- `fillStops` paint the main folder surface. `strokeStops` paint the folder outline. Implementations may use the app's linear or radial gradient fields for these paints, or may fall back to the first sanitized color stop.
- Content still renders as the content face over the folder base.

## DOM-Like Render Tree

A renderer can use DOM/CSS, SVG, canvas, or native drawing. The simplest mental model is this tree:

```text
composition stack
  base icon stack
    back layer, optional
    main layer
      base surface, optional
        processed shape image, optional
      content face, optional
  particle layer at topLeft/topMiddle/topRight/left/right/bottomLeft/bottomMiddle/bottomRight, optional
    particle icon stack
      back layer, optional
      main layer
        base surface, optional
        content face, optional
```

Icon stack:

- `position: relative`
- `display: grid`
- `place-items: center`
- width and height equal computed icon dimensions.

Back layer:

- Absolute, `inset: 0`.
- Width/height equal icon dimensions.
- Border radius equal computed border radius.
- Background `backColor`.
- Transform `translate(offset.x + shapeOffsetX px, offset.y + shapeOffsetY px)`.
- Opacity `1` if `backDistance > 0`, else `0`.
- Render only if `shapeEnabled`, `backLayerEnabled`, and shape is not `none`.

Main layer:

- Absolute, `inset: 0`, but the element itself is sized to icon dimensions.
- Border radius equal computed border radius.
- If shape is `image`, clip overflow.

Base surface:

- Absolute, `inset: 0`.
- Border radius equal computed border radius.
- Transform `translate(shapeOffsetX px, shapeOffsetY px)`.
- Opacity `baseOpacity / 100`.
- Paint and stroke from the paint rules above.
- Render only if `shapeEnabled` and shape is not `none`.

Text content:

- Absolute center.
- `transform: translate(calc(-50% + contentOffsetX px), calc(-50% + contentOffsetY px)) rotate(contentRotation deg)`.
- `z-index: 2`.

Lucide icon content:

- Absolute center.
- Width and height `iconRenderSize`.
- `transform: translate(calc(-50% + contentOffsetX px), calc(-50% + contentOffsetY px)) rotate(contentRotation deg)`.
- Render the named Lucide icon at `size = iconRenderSize` and `strokeWidth = lucideWeight`.
- Use `currentColor = textColor`.
- Opacity `contentOpacity / 100`.
- If the Lucide name is unknown, render `sparkles`.

Image content:

- Render processed content image if available.
- Full-size content container uses `transform: translate(contentOffsetX px, contentOffsetY px)`.
- The processed image itself is not additionally rotated by `contentRotation`; use `imageRotation` before rendering.
- If image mode has no image data, host apps may render nothing, a missing-image placeholder, or reject the code. For inline text, rendering nothing or a generic placeholder is less disruptive than showing editor text like "Upload image".

## Composition Bounds and Export Layout

The raw composition coordinate system starts with the base at `(0, 0)`. Back layers and particles can extend outside that rectangle.

Bounds:

```js
function getIconContentBounds(iconState, metrics) {
  const { width, height } = metrics.dimensions;

  if (!iconState.contentEnabled || iconState.mode === "none") {
    return null;
  }

  if (iconState.mode === "image") {
    const inset = iconState.inset + metrics.visibleOutline;
    return {
      left: inset + iconState.contentOffsetX,
      top: inset + iconState.contentOffsetY,
      width: Math.max(10, width - inset * 2),
      height: Math.max(10, height - inset * 2)
    };
  }

  if (iconState.mode === "text") {
    const textWidth = measureTextWidth(
      iconState.content || " ",
      metrics.fittedFontSize,
      iconState.fontWeight,
      iconState.fontFamily,
      iconState.spacing
    );
    const boundWidth = clamp(textWidth, 16, width);
    const boundHeight = clamp(metrics.fittedFontSize * 1.08, 16, height);
    return {
      left: (width - boundWidth) / 2 + iconState.contentOffsetX,
      top: (height - boundHeight) / 2 + iconState.contentOffsetY,
      width: boundWidth,
      height: boundHeight
    };
  }

  const contentSize = Math.min(metrics.iconRenderSize, Math.max(width, height));
  return {
    left: (width - contentSize) / 2 + iconState.contentOffsetX,
    top: (height - contentSize) / 2 + iconState.contentOffsetY,
    width: contentSize,
    height: contentSize
  };
}

function getIconVisualBounds(iconState, metrics) {
  const hasShape = iconState.shapeEnabled && iconState.shape !== "none";
  const shapeMinX = hasShape ? Math.min(0, iconState.shapeOffsetX) : 0;
  const shapeMinY = hasShape ? Math.min(0, iconState.shapeOffsetY) : 0;
  const shapeMaxX = hasShape
    ? Math.max(metrics.dimensions.width, iconState.shapeOffsetX + metrics.dimensions.width)
    : metrics.dimensions.width;
  const shapeMaxY = hasShape
    ? Math.max(metrics.dimensions.height, iconState.shapeOffsetY + metrics.dimensions.height)
    : metrics.dimensions.height;
  const contentBounds = getIconContentBounds(iconState, metrics);
  const hasBack = hasShape && iconState.backLayerEnabled;
  const backMinX = hasBack ? metrics.offset.x + iconState.shapeOffsetX : 0;
  const backMinY = hasBack ? metrics.offset.y + iconState.shapeOffsetY : 0;
  const backMaxX = hasBack ? backMinX + metrics.dimensions.width : 0;
  const backMaxY = hasBack ? backMinY + metrics.dimensions.height : 0;

  return {
    minX: Math.min(shapeMinX, backMinX, contentBounds?.left ?? 0),
    minY: Math.min(shapeMinY, backMinY, contentBounds?.top ?? 0),
    maxX: Math.max(
      shapeMaxX,
      backMaxX,
      contentBounds ? contentBounds.left + contentBounds.width : 0
    ),
    maxY: Math.max(
      shapeMaxY,
      backMaxY,
      contentBounds ? contentBounds.top + contentBounds.height : 0
    )
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
    minX = Math.min(minX, placement.left + iconBounds.minX);
    minY = Math.min(minY, placement.top + iconBounds.minY);
    maxX = Math.max(maxX, placement.left + iconBounds.maxX);
    maxY = Math.max(maxY, placement.top + iconBounds.maxY);
  }

  return { minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY };
}
```

Layout into a target rectangle:

```js
function getCompositionLayout(bounds, targetWidth, targetHeight, safeMargin, allowUpscale) {
  const availableWidth = Math.max(1, targetWidth - safeMargin * 2);
  const availableHeight = Math.max(1, targetHeight - safeMargin * 2);
  const fitScale = Math.min(
    availableWidth / Math.max(1, bounds.width),
    availableHeight / Math.max(1, bounds.height)
  );
  const scale = allowUpscale ? fitScale : Math.min(1, fitScale);
  return {
    scale,
    offsetX: (targetWidth - bounds.width * scale) / 2 - bounds.minX * scale,
    offsetY: (targetHeight - bounds.height * scale) / 2 - bounds.minY * scale
  };
}
```

The app uses:

- Preview safe margin: `24`.
- Export safe margin: `0`.
- Default export size: `500 x 500`.
- Export scales: `1x`, `2x`, `3x`.

If the composition uses an imported image and the user chooses image-sized export, export dimensions can come from the active image dimensions or crop dimensions. Otherwise export uses the square canvas size.

## Inline Text Behavior

Host apps should make iquans behave like custom emoji.

Recommended text syntax:

- Store the underlying iquan as an `IC11|...` code or as an alias mapped to an `IC11|...` code.
- For quick emoji behavior, let users type an alias such as `:ok-iquan:` or paste a literal `IC11|...` code.
- Replace the typed token with an inline atomic iquan node in rich text.
- In plain text fallback, preserve either the alias or the raw `IC11|...` code.

Atomic behavior:

- Treat the rendered iquan as one character for cursor movement.
- Backspace/delete removes the whole iquan node.
- Copy/paste should preserve the `IC11` code and optionally a PNG fallback.
- The node should be non-editable internally; users edit by replacing the code or opening an iquan editor.
- Screen readers should receive a short label, for example `Iquan OK`, `Iquan smile`, or `Iquan icon`.

Inline sizing:

- The iquan should scale from the current font size, not from the original `canvasSize`.
- Let `fontPx` be the computed font size of the surrounding text.
- Recommended inline box size is `1.375em` square, matching the reference preview's `22px` iquan in `16px` text.
- For dense UIs, `1.25em` is acceptable.
- Compute `targetPx = fontPx * 1.375`.
- Compute composition scale with `targetPx / max(bounds.width, bounds.height)`.
- Render the whole composition centered in a square inline box of `targetPx x targetPx`.
- Use `vertical-align: -0.28em` to sit visually on the baseline like emoji.

Reference inline CSS:

```css
.iquan-inline {
  display: inline-block;
  width: 1.375em;
  height: 1.375em;
  position: relative;
  vertical-align: -0.28em;
  line-height: 1;
  contain: layout paint style;
}

.iquan-inline > .iquan-scale {
  position: absolute;
  top: 50%;
  left: 50%;
  transform-origin: center;
}
```

Reference inline layout:

```js
function inlineIquanStyle(bounds, fontPx, ratio = 1.375) {
  const targetPx = fontPx * ratio;
  const scale = targetPx / Math.max(1, Math.max(bounds.width, bounds.height));
  return {
    box: { width: `${ratio}em`, height: `${ratio}em` },
    inner: {
      transform: `translate(-50%, -50%) scale(${scale})`
    },
    frame: {
      width: `${bounds.width}px`,
      height: `${bounds.height}px`
    },
    offset: {
      left: `${-bounds.minX}px`,
      top: `${-bounds.minY}px`
    }
  };
}
```

This mirrors the reference app's context preview:

- The inline preview targets `20px` in compact message mode and `22px` in full message mode.
- The scale is always `targetSize / max(bounds.width, bounds.height)`.
- The raw composition is offset by `-bounds.minX` and `-bounds.minY` so particles and back layers are included.

## Minimal Decode Procedure

```js
function decodeIquan(input) {
  const trimmed = String(input || "").trim();

  if (trimmed.startsWith("{")) {
    const project = JSON.parse(trimmed);
    if (project.version !== "IQP1" || project.app !== "iquan") {
      throw new Error("Unsupported Iquan project file.");
    }
    const base = sanitizeIconState(project.base);
    return {
      version: project.version,
      canvasSize: clamp(parseIntOr(project.canvasSize, 500), 320, 960),
      base,
      particles: sanitizeParticlesMap(project.particles, base)
    };
  }

  const [version, payload] = trimmed.split("|");
  if (!["IC11", "IC10", "IC9"].includes(version)) {
    throw new Error("Unsupported share code.");
  }

  const parsed = JSON.parse(decodeBase64Url(payload));
  const base = sanitizeIconState(expandCompactIconState(parsed.b));
  const particles = {};

  for (const entry of Array.isArray(parsed.p) ? parsed.p : []) {
    if (!Array.isArray(entry) || entry.length < 3) continue;
    const cornerKey = ["topLeft", "topMiddle", "topRight", "left", "right", "bottomLeft", "bottomMiddle", "bottomRight"][parseIntOr(entry[0], -1)];
    if (!cornerKey) continue;

    const source = { offsetX: entry[1], offsetY: entry[2] };
    if (entry[3] && typeof entry[3] === "object" && !Array.isArray(entry[3])) {
      source.icon = expandCompactIconState(entry[3]);
    }
    particles[cornerKey] = sanitizeParticle(source, base);
  }

  return {
    version,
    canvasSize: clamp(parseIntOr(parsed.c, 500), 320, 960),
    base,
    particles
  };
}
```

## Minimal Render Procedure

At a high level:

```js
function formIquanFromCode(code) {
  const decoded = decodeIquan(code);
  const baseMetrics = getIconMetrics(decoded.base);
  const particleLayers = buildParticleLayers(baseMetrics, decoded.particles);
  const bounds = getCompositeBounds(decoded.base, baseMetrics, particleLayers);
  return { ...decoded, baseMetrics, particleLayers, bounds };
}
```

To render into a square inline character:

```js
function renderInlineIquan(code, hostElement) {
  const formed = formIquanFromCode(code);
  const fontPx = parseFloat(getComputedStyle(hostElement).fontSize) || 16;
  const targetPx = fontPx * 1.375;
  const scale = targetPx / Math.max(1, Math.max(formed.bounds.width, formed.bounds.height));

  const wrapper = document.createElement("span");
  wrapper.className = "iquan-inline";
  wrapper.contentEditable = "false";
  wrapper.dataset.iquanCode = code;
  wrapper.setAttribute("role", "img");
  wrapper.setAttribute("aria-label", describeIquan(formed));

  const scaleNode = document.createElement("span");
  scaleNode.className = "iquan-scale";
  scaleNode.style.transform = `translate(-50%, -50%) scale(${scale})`;

  const frame = document.createElement("span");
  frame.style.position = "relative";
  frame.style.display = "block";
  frame.style.width = `${formed.bounds.width}px`;
  frame.style.height = `${formed.bounds.height}px`;

  const offset = document.createElement("span");
  offset.style.position = "absolute";
  offset.style.left = `${-formed.bounds.minX}px`;
  offset.style.top = `${-formed.bounds.minY}px`;
  offset.append(renderCompositionStack(formed));

  frame.append(offset);
  scaleNode.append(frame);
  wrapper.append(scaleNode);
  return wrapper;
}
```

`renderCompositionStack` should implement the DOM-like tree and metric rules above.

## Describing an Iquan for Accessibility

A simple label function:

```js
function describeIconState(state) {
  if (!state.contentEnabled || state.mode === "none") return "icon";
  if (state.mode === "text") return `Iquan ${state.content || "text"}`;
  if (state.mode === "icon") return `Iquan ${state.lucide}`;
  if (state.mode === "image") return `Iquan ${state.imageName || "image"}`;
  return "Iquan";
}
```

For a particle-heavy composition, the base label is usually enough for inline text. A detailed editor can expose particle labels separately.

## Implementation Checklist

To implement iquans in another app:

1. Detect or store an `IC11|...` code.
2. Base64url-decode the payload.
3. Expand compact icon fields with the token map.
4. Merge over the default icon state.
5. Sanitize every field.
6. Build base metrics.
7. Build particle metrics and placements.
8. Compute composite bounds.
9. Process any embedded images, or detect missing images and choose a placeholder/fallback.
10. Render the base stack and particle stacks.
11. For inline text, wrap the rendered composition in a single non-editable inline node sized in `em`.
12. Preserve the original code on copy/paste and serialization.
