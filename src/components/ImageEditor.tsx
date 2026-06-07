"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import ReactCrop, { type Crop, type PixelCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

type TextLayer = {
  id: string;
  value: string;
  xPct: number; // center X as % of image
  yPct: number; // center Y as % of image
  sizePct: number; // font size as % of image height
  color: string;
  bold: boolean;
  italic: boolean;
};

const ASPECTS: { label: string; value: number | undefined }[] = [
  { label: "Free", value: undefined },
  { label: "1:1", value: 1 },
  { label: "16:9", value: 16 / 9 },
  { label: "4:3", value: 4 / 3 },
  { label: "3:4", value: 3 / 4 },
];

const TEXT_COLORS = ["#ffffff", "#000000", "#2563eb", "#eb0028", "#f59e0b", "#10b981"];

let uid = 0;
const nextId = () => `t${++uid}`;

export default function ImageEditor({
  src,
  title = "Edit image",
  initialAspect,
  onCancel,
  onApply,
}: {
  src: string;
  title?: string;
  initialAspect?: number;
  onCancel: () => void;
  onApply: (dataUrl: string) => void;
}) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [currentSrc, setCurrentSrc] = useState(src);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [aspect, setAspect] = useState<number | undefined>(initialAspect);
  const [busy, setBusy] = useState(false);

  const [texts, setTexts] = useState<TextLayer[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const dragRef = useRef<string | null>(null);
  // Displayed image height (px) — used to scale the preview text size.
  const [dispH, setDispH] = useState(0);

  const selected = texts.find((t) => t.id === selectedId) ?? null;

  const measure = useCallback(() => {
    if (imgRef.current) setDispH(imgRef.current.clientHeight);
  }, []);

  const onImageLoad = useCallback(() => {
    setCrop(undefined);
    setCompletedCrop(undefined);
    if (imgRef.current) setDispH(imgRef.current.clientHeight);
  }, []);

  useEffect(() => {
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure]);

  function updateText(id: string, patch: Partial<TextLayer>) {
    setTexts((arr) => arr.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  }

  function addText() {
    const t: TextLayer = {
      id: nextId(),
      value: "New text",
      xPct: 50,
      yPct: 50,
      sizePct: 7,
      color: "#ffffff",
      bold: true,
      italic: false,
    };
    setTexts((arr) => [...arr, t]);
    setSelectedId(t.id);
  }

  function removeText(id: string) {
    setTexts((arr) => arr.filter((t) => t.id !== id));
    setSelectedId((s) => (s === id ? null : s));
  }

  // ---- Dragging text layers ----
  useEffect(() => {
    function onMove(e: PointerEvent) {
      const id = dragRef.current;
      const img = imgRef.current;
      if (!id || !img) return;
      const rect = img.getBoundingClientRect();
      const xPct = ((e.clientX - rect.left) / rect.width) * 100;
      const yPct = ((e.clientY - rect.top) / rect.height) * 100;
      updateText(id, {
        xPct: Math.max(0, Math.min(100, xPct)),
        yPct: Math.max(0, Math.min(100, yPct)),
      });
    }
    function onUp() {
      dragRef.current = null;
    }
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, []);

  async function rotate(dir: 1 | -1) {
    setBusy(true);
    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = currentSrc;
      await img.decode();
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalHeight;
      canvas.height = img.naturalWidth;
      const ctx = canvas.getContext("2d")!;
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((dir * 90 * Math.PI) / 180);
      ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
      setCurrentSrc(canvas.toDataURL("image/png"));
      setCrop(undefined);
      setCompletedCrop(undefined);
    } catch {
      // ignore — likely a CORS-tainted remote image
    } finally {
      setBusy(false);
    }
  }

  function chooseAspect(value: number | undefined) {
    setAspect(value);
    const img = imgRef.current;
    if (value && img) {
      const w = img.width;
      const h = img.height;
      let cw = w;
      let ch = cw / value;
      if (ch > h) {
        ch = h;
        cw = ch * value;
      }
      setCrop({ unit: "px", x: (w - cw) / 2, y: (h - ch) / 2, width: cw, height: ch });
    }
  }

  async function apply() {
    const img = imgRef.current;
    if (!img) return;
    setBusy(true);
    try {
      const scaleX = img.naturalWidth / img.width;
      const scaleY = img.naturalHeight / img.height;

      const cropPx =
        completedCrop && completedCrop.width > 0
          ? completedCrop
          : ({ x: 0, y: 0, width: img.width, height: img.height } as PixelCrop);

      const cropXn = cropPx.x * scaleX;
      const cropYn = cropPx.y * scaleY;
      const outW = Math.round(cropPx.width * scaleX);
      const outH = Math.round(cropPx.height * scaleY);

      const canvas = document.createElement("canvas");
      canvas.width = outW;
      canvas.height = outH;
      const ctx = canvas.getContext("2d")!;
      ctx.imageSmoothingQuality = "high";

      ctx.drawImage(img, cropXn, cropYn, outW, outH, 0, 0, outW, outH);

      // Draw each text layer at its position within the crop.
      for (const t of texts) {
        const label = t.value.trim();
        if (!label) continue;
        const fontPx = Math.max(8, Math.round((t.sizePct / 100) * img.naturalHeight));
        const weight = t.bold ? "700" : "400";
        const style = t.italic ? "italic" : "normal";
        ctx.font = `${style} ${weight} ${fontPx}px Poppins, Arial, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const cx = (t.xPct / 100) * img.naturalWidth - cropXn;
        const cy = (t.yPct / 100) * img.naturalHeight - cropYn;
        ctx.shadowColor = "rgba(0,0,0,0.55)";
        ctx.shadowBlur = fontPx * 0.22;
        ctx.shadowOffsetY = Math.max(1, fontPx * 0.04);
        ctx.fillStyle = t.color;
        ctx.fillText(label, cx, cy);
        ctx.shadowColor = "transparent";
      }

      onApply(canvas.toDataURL("image/png"));
    } catch {
      // CORS-tainted image — fall back to original
      onApply(currentSrc);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 p-4">
      <div className="flex max-h-[94vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3">
          <h2 className="text-base font-semibold text-gray-900">{title}</h2>
          <button onClick={onCancel} aria-label="Close" className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="grid flex-1 grid-cols-1 gap-4 overflow-y-auto p-5 lg:grid-cols-[1fr_300px]">
          {/* Canvas/crop area */}
          <div className="flex items-start justify-center rounded-xl bg-gray-900/95 p-3">
            <div className="relative inline-block">
              <ReactCrop
                crop={crop}
                onChange={(c) => setCrop(c)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={aspect}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  ref={imgRef}
                  src={currentSrc}
                  alt="To edit"
                  crossOrigin="anonymous"
                  onLoad={onImageLoad}
                  className="max-h-[58vh] w-auto select-none"
                />
              </ReactCrop>

              {/* Draggable text overlay (container ignores pointers; texts capture them) */}
              <div className="pointer-events-none absolute inset-0">
                {texts.map((t) => (
                  <div
                    key={t.id}
                    onPointerDown={(e) => {
                      e.stopPropagation();
                      dragRef.current = t.id;
                      setSelectedId(t.id);
                    }}
                    className={`pointer-events-auto absolute -translate-x-1/2 -translate-y-1/2 cursor-move whitespace-nowrap px-1 ${
                      selectedId === t.id ? "outline-dashed outline-1 outline-blue-400" : ""
                    }`}
                    style={{
                      left: `${t.xPct}%`,
                      top: `${t.yPct}%`,
                      color: t.color,
                      fontSize: `${Math.max(8, (t.sizePct / 100) * (dispH || 300))}px`,
                      fontWeight: t.bold ? 700 : 400,
                      fontStyle: t.italic ? "italic" : "normal",
                      textShadow: "0 1px 3px rgba(0,0,0,0.55)",
                      lineHeight: 1,
                    }}
                  >
                    {t.value || "Text"}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Side controls */}
          <div className="space-y-4">
            {/* Crop & rotate */}
            <div className="rounded-xl border border-gray-200 p-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">Crop & Rotate</p>
              <div className="flex flex-wrap gap-1.5">
                {ASPECTS.map((a) => (
                  <button
                    key={a.label}
                    onClick={() => chooseAspect(a.value)}
                    className={`rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors ${
                      aspect === a.value
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-300 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {a.label}
                  </button>
                ))}
              </div>
              <div className="mt-2 flex gap-2">
                <button onClick={() => rotate(-1)} className="flex-1 rounded-lg border border-gray-300 px-2 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50">
                  ⟲ Left
                </button>
                <button onClick={() => rotate(1)} className="flex-1 rounded-lg border border-gray-300 px-2 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50">
                  ⟳ Right
                </button>
              </div>
            </div>

            {/* Text layers */}
            <div className="rounded-xl border border-gray-200 p-3">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Text Layers</p>
                <button onClick={addText} className="rounded-md bg-blue-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-blue-700">
                  + Add
                </button>
              </div>

              {texts.length === 0 && (
                <p className="text-xs text-gray-400">
                  Add text, then drag it on the image to position it.
                </p>
              )}

              <div className="space-y-1">
                {texts.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedId(t.id)}
                    className={`flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-xs ${
                      selectedId === t.id ? "bg-blue-50 text-blue-700" : "hover:bg-gray-50 text-gray-600"
                    }`}
                  >
                    <span className="truncate">{t.value || "(empty)"}</span>
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        removeText(t.id);
                      }}
                      className="ml-2 text-red-500 hover:text-red-700"
                    >
                      ✕
                    </span>
                  </button>
                ))}
              </div>

              {/* Selected text editor */}
              {selected && (
                <div className="mt-3 space-y-3 border-t border-gray-100 pt-3">
                  <input
                    value={selected.value}
                    onChange={(e) => updateText(selected.id, { value: e.target.value })}
                    placeholder="Text…"
                    className="w-full rounded-lg border border-gray-300 px-2.5 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateText(selected.id, { bold: !selected.bold })}
                      className={`rounded-md border px-2.5 py-1 text-sm font-bold ${
                        selected.bold ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-300 text-gray-600"
                      }`}
                    >
                      B
                    </button>
                    <button
                      onClick={() => updateText(selected.id, { italic: !selected.italic })}
                      className={`rounded-md border px-2.5 py-1 text-sm italic ${
                        selected.italic ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-300 text-gray-600"
                      }`}
                    >
                      I
                    </button>
                    <label className="ml-auto flex items-center gap-1 text-xs text-gray-500">
                      Size
                      <input
                        type="range"
                        min={3}
                        max={20}
                        value={selected.sizePct}
                        onChange={(e) => updateText(selected.id, { sizePct: Number(e.target.value) })}
                      />
                    </label>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {TEXT_COLORS.map((c) => (
                      <button
                        key={c}
                        onClick={() => updateText(selected.id, { color: c })}
                        aria-label={`Color ${c}`}
                        className={`h-6 w-6 rounded-full ring-2 ${
                          selected.color === c ? "ring-blue-500" : "ring-gray-200"
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                    <input
                      type="color"
                      value={selected.color}
                      onChange={(e) => updateText(selected.id, { color: e.target.value })}
                      className="h-6 w-8 cursor-pointer rounded border border-gray-200 bg-white"
                      aria-label="Custom color"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-gray-100 px-5 py-3">
          <button onClick={onCancel} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            Cancel
          </button>
          <button onClick={() => onApply(currentSrc)} disabled={busy} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60">
            Use Original
          </button>
          <button onClick={apply} disabled={busy} className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
            {busy ? "Processing…" : "Apply & Use"}
          </button>
        </div>
      </div>
    </div>
  );
}
