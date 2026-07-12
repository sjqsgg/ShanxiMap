"use client";

import { useEffect, useRef } from "react";
import type { Building, Tier } from "@/lib/types";
import { TIER_COLOR } from "@/lib/types";

declare global {
  interface Window {
    _AMapSecurityConfig?: { securityJsCode: string };
  }
}

/* eslint-disable @typescript-eslint/no-explicit-any */

const SIZE: Record<Tier, number> = { 必去: 18, 推荐: 13, 小众: 10, 可选: 9 };

function iconUri(b: Building, selected: boolean): string {
  const color = TIER_COLOR[b.tier];
  const d = SIZE[b.tier] + (selected ? 6 : 0);
  const pad = 6;
  const s = d + pad * 2;
  const c = s / 2;
  const ring = selected
    ? `<circle cx="${c}" cy="${c}" r="${d / 2 + 4}" fill="none" stroke="${color}" stroke-width="1.5" opacity="0.8"/>`
    : "";
  const badge = b.yingzao
    ? `<rect x="${s - 11}" y="0" width="11" height="11" fill="#9e2b20"/><text x="${s - 5.5}" y="8.6" font-size="8" fill="#f8ecdc" text-anchor="middle" font-family="serif">测</text>`
    : "";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}">${ring}<circle cx="${c}" cy="${c}" r="${d / 2}" fill="${color}" stroke="#fffdf6" stroke-width="1.6"/>${badge}</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function textZooms(tier: Tier): [number, number] {
  if (tier === "必去") return [2, 20];
  if (tier === "推荐") return [8.2, 20];
  return [9.2, 20];
}

export default function MapCanvas({
  buildings,
  selectedId,
  onSelect,
}: {
  buildings: Building[];
  selectedId: number | null;
  onSelect: (id: number | null) => void;
}) {
  const elRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const layerRef = useRef<any>(null);
  const amapRef = useRef<any>(null);
  const readyRef = useRef(false);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  // 初始化
  useEffect(() => {
    let disposed = false;
    (async () => {
      window._AMapSecurityConfig = {
        securityJsCode: process.env.NEXT_PUBLIC_AMAP_SECRET ?? "",
      };
      const AMapLoader = (await import("@amap/amap-jsapi-loader")).default;
      const AMap = await AMapLoader.load({
        key: process.env.NEXT_PUBLIC_AMAP_KEY ?? "",
        version: "2.0",
      });
      if (disposed || !elRef.current) return;
      amapRef.current = AMap;
      const map = new AMap.Map(elRef.current, {
        viewMode: "2D",
        center: [112.4, 37.6],
        zoom: 7,
        zooms: [6, 18],
        mapStyle: "amap://styles/whitesmoke",
      });
      const layer = new AMap.LabelsLayer({ collision: true, zIndex: 120 });
      map.add(layer);
      map.on("click", () => onSelectRef.current(null));
      mapRef.current = map;
      layerRef.current = layer;
      readyRef.current = true;
      renderMarkers();
    })();
    return () => {
      disposed = true;
      readyRef.current = false;
      mapRef.current?.destroy();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stateRef = useRef({ buildings, selectedId });
  stateRef.current = { buildings, selectedId };

  function renderMarkers() {
    const AMap = amapRef.current;
    const layer = layerRef.current;
    if (!AMap || !layer || !readyRef.current) return;
    const { buildings: list, selectedId: sel } = stateRef.current;
    layer.clear();
    const markers = list.map((b) => {
      const selected = b.id === sel;
      const d = SIZE[b.tier] + (selected ? 6 : 0) + 12;
      const zooms = textZooms(b.tier);
      const m = new AMap.LabelMarker({
        position: [b.lng, b.lat],
        zIndex:
          (b.tier === "必去" ? 40 : b.tier === "推荐" ? 30 : 20) +
          (selected ? 50 : 0),
        rank:
          (b.tier === "必去" ? 4000 : b.tier === "推荐" ? 3000 : 2000) +
          (selected ? 9000 : 0),
        icon: {
          image: iconUri(b, selected),
          size: [d, d],
          anchor: "center",
        },
        text: {
          content: b.name,
          direction: "right",
          offset: [1, 0],
          zooms: selected ? [2, 20] : zooms,
          style: {
            fontSize: b.tier === "必去" ? 13 : 12,
            fillColor: selected ? "#9e2b20" : "#3d3120",
            strokeColor: "#f3ecdc",
            strokeWidth: 3,
          },
        },
        extData: { id: b.id },
      });
      m.on("click", (e: any) => {
        const id = e.target?.getExtData?.()?.id;
        if (id) onSelectRef.current(id);
      });
      return m;
    });
    if (markers.length) layer.add(markers);
  }

  // 数据/选中变化时重绘
  useEffect(() => {
    renderMarkers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buildings, selectedId]);

  // 选中时平移视野
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedId) return;
    const b = buildings.find((x) => x.id === selectedId);
    if (!b) return;
    const zoom = Math.max(map.getZoom(), 10.5);
    map.setZoomAndCenter(zoom, [b.lng, b.lat], false, 400);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  return (
    <div className="absolute inset-0">
      <div ref={elRef} className="h-full w-full" />
      {/* 纸色滤镜：把灰白底图调成纸面色 */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "#f3ecdc", mixBlendMode: "multiply" }}
      />
    </div>
  );
}
