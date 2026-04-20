import { describe, expect, it } from "vitest";
import {
  DEFAULT_STATE,
  SHARE_CODE_VERSION,
  createShareUrl,
  decodeState,
  encodeIconState,
  encodeState,
  extractShareCodeFromUrl,
  resolveUrlHydration,
  sanitizeIconState,
} from "./App.jsx";

describe("share codec", () => {
  it("encodes and decodes IC10 with content + shape image fields", () => {
    const base = sanitizeIconState({
      ...DEFAULT_STATE,
      mode: "image",
      shape: "image",
      content: "OK",
      imageData: "data:image/png;base64,CONTENT_IMAGE",
      imageName: "content-image",
      imageWidth: 120,
      imageHeight: 96,
      imageCropEnabled: true,
      imageCropX: 0.07,
      imageCropY: 0.03,
      imageCropSize: 0.82,
      baseImageData: "data:image/png;base64,SHAPE_IMAGE",
      baseImageName: "shape-image",
      baseImageWidth: 128,
      baseImageHeight: 128,
      baseImageCropEnabled: true,
      baseImageCropX: 0.11,
      baseImageCropY: 0.04,
      baseImageCropSize: 0.9,
      fillStops: ["#112233", "#445566"],
      strokeStops: ["#99aabb", "#ccddee"],
      strokeGradientType: "radial",
    });

    const particles = {
      topRight: {
        offsetX: 12,
        offsetY: -8,
        icon: sanitizeIconState({
          ...DEFAULT_STATE,
          mode: "image",
          content: "P",
          imageData: "data:image/png;base64,PARTICLE_IMAGE",
          imageName: "particle-image",
          imageWidth: 64,
          imageHeight: 64,
        }),
      },
    };

    const code = encodeState(base, particles, 640);
    expect(code.startsWith(`${SHARE_CODE_VERSION}|`)).toBe(true);

    const decoded = decodeState(code);
    expect(decoded.canvasSize).toBe(640);
    expect(decoded.base.imageData).toBe(base.imageData);
    expect(decoded.base.baseImageData).toBe(base.baseImageData);
    expect(decoded.base.baseImageName).toBe("shape-image");
    expect(decoded.particles.topRight.icon.imageData).toBe(
      "data:image/png;base64,PARTICLE_IMAGE",
    );
  });

  it("creates URL-safe share codes without embedded image payloads", () => {
    const base = sanitizeIconState({
      ...DEFAULT_STATE,
      mode: "image",
      shape: "image",
      imageData: "data:image/png;base64,CONTENT_IMAGE",
      baseImageData: "data:image/png;base64,SHAPE_IMAGE",
    });

    const particles = {
      bottomLeft: {
        offsetX: -6,
        offsetY: 9,
        icon: sanitizeIconState({
          ...DEFAULT_STATE,
          mode: "image",
          imageData: "data:image/png;base64,PARTICLE_IMAGE",
        }),
      },
    };

    const urlSafeCode = encodeState(base, particles, 500, { urlSafe: true });
    expect(urlSafeCode).not.toContain("data:image/");

    const decoded = decodeState(urlSafeCode);
    expect(decoded.base.imageData).toBe("");
    expect(decoded.base.baseImageData).toBe("");
    expect(decoded.particles.bottomLeft.icon.imageData).toBe("");
    expect(decoded.particles.bottomLeft.icon.baseImageData).toBe("");
  });

  it("extracts share code from ?code query", () => {
    const code = encodeState(DEFAULT_STATE, {}, 500, { urlSafe: true });
    const url = new URL(`https://example.com/?code=${encodeURIComponent(code)}`);
    expect(extractShareCodeFromUrl(url)).toBe(code);
  });

  it("extracts share code from legacy /code?= query", () => {
    const code = encodeState(DEFAULT_STATE, {}, 500, { urlSafe: true });
    const url = new URL(`https://example.com/code?=${encodeURIComponent(code)}`);
    expect(extractShareCodeFromUrl(url)).toBe(code);
  });

  it("treats blank and missing code query values as absent", () => {
    expect(extractShareCodeFromUrl(new URL("https://example.com/?code="))).toBe("");
    expect(extractShareCodeFromUrl(new URL("https://example.com/"))).toBe("");
  });

  it("resolves hydration to default for missing, blank, and invalid URL code", () => {
    const fallbackCode = encodeState(DEFAULT_STATE, {}, 500, { urlSafe: true });
    const missing = resolveUrlHydration(new URL("https://example.com/"), fallbackCode);
    const blank = resolveUrlHydration(new URL("https://example.com/?code="), fallbackCode);
    const invalid = resolveUrlHydration(new URL("https://example.com/?code=IC10|bad"), fallbackCode);

    expect(missing.status).toBe("missing");
    expect(missing.shareCode).toBe(fallbackCode);
    expect(blank.status).toBe("missing");
    expect(blank.shareCode).toBe(fallbackCode);
    expect(invalid.status).toBe("invalid");
    expect(invalid.shareCode).toBe(fallbackCode);
    expect(invalid.invalidCode).toBe("IC10|bad");
  });

  it("resolves hydration to decoded URL state when code is valid", () => {
    const code = encodeState(DEFAULT_STATE, {}, 500, { urlSafe: true });
    const next = resolveUrlHydration(
      new URL(`https://example.com/?code=${encodeURIComponent(code)}`),
      "IC10|fallback",
    );

    expect(next.status).toBe("valid");
    expect(next.shareCode).toBe(code);
    expect(next.decoded.canvasSize).toBe(500);
    expect(next.decoded.base.content).toBe(DEFAULT_STATE.content);
  });

  it("creates canonical share links and strips legacy /code path + unnamed query keys", () => {
    const code = encodeState(DEFAULT_STATE, {}, 500, { urlSafe: true });
    const normalized = createShareUrl(code, {
      currentUrl: `https://example.com/code?=${encodeURIComponent(code)}#old`,
      basePath: "/",
    });
    expect(normalized).toBe(`https://example.com/?code=${encodeURIComponent(code)}`);
  });

  it("creates canonical share links for subpath deployments", () => {
    const code = encodeState(DEFAULT_STATE, {}, 500, { urlSafe: true });
    const normalized = createShareUrl(code, {
      currentUrl: "https://example.com/code?=IC10%7Clegacy",
      basePath: "/iquan",
    });
    expect(normalized).toBe(`https://example.com/iquan/?code=${encodeURIComponent(code)}`);
  });

  it("decodes IC9 payloads for backward compatibility", () => {
    const base = sanitizeIconState({
      ...DEFAULT_STATE,
      mode: "image",
      baseImageData: "data:image/png;base64,SHAPE_IMAGE",
      baseImageName: "shape",
    });

    const ic10Code = encodeState(base, {}, 500);
    const ic9Code = ic10Code.replace(/^IC10\|/, "IC9|");

    const decoded = decodeState(ic9Code);
    expect(decoded.base.baseImageData).toBe("data:image/png;base64,SHAPE_IMAGE");
    expect(decoded.base.baseImageName).toBe("shape");
  });

  it("continues to decode legacy IC6 codes", () => {
    const legacyState = sanitizeIconState({
      ...DEFAULT_STATE,
      mode: "lucide",
      lucide: "bell-ring",
      size: 184,
      fillStops: ["#abcdef"],
      strokeStops: ["#223344"],
    });

    const legacyCode = encodeIconState(legacyState);
    expect(legacyCode.startsWith("IC6|")).toBe(true);

    const decoded = decodeState(legacyCode);
    expect(decoded.canvasSize).toBe(500);
    expect(decoded.base.mode).toBe("icon");
    expect(decoded.base.lucide).toBe("bell-ring");
    expect(decoded.base.size).toBe(184);
  });

  it("keeps updated fillStops when legacy fill is stale", () => {
    const sanitized = sanitizeIconState({
      ...DEFAULT_STATE,
      fill: "#111111",
      fillStops: ["#22cc88", "#004422"],
    });

    expect(sanitized.fill).toBe("#22cc88");
    expect(sanitized.fillStops[0]).toBe("#22cc88");
    expect(sanitized.fillStops[1]).toBe("#004422");
  });

  it("keeps updated strokeStops when legacy stroke color is stale", () => {
    const sanitized = sanitizeIconState({
      ...DEFAULT_STATE,
      strokeColor: "#111111",
      outlineColor: "#111111",
      strokeStops: ["#ff8844", "#5a2a00"],
    });

    expect(sanitized.strokeColor).toBe("#ff8844");
    expect(sanitized.outlineColor).toBe("#ff8844");
    expect(sanitized.strokeStops[0]).toBe("#ff8844");
    expect(sanitized.strokeStops[1]).toBe("#5a2a00");
  });
});
