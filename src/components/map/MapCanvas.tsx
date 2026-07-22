"use client";

import { useEffect, useRef } from "react";
import type { Building } from "@/lib/types";

declare global {
  interface Window {
    _AMapSecurityConfig?: { securityJsCode: string };
  }
}

/* eslint-disable @typescript-eslint/no-explicit-any */

const BASE_MARKER_SIZE = 8;
const BASE_MARKER_COLOR = "#746b5f";
const SELECTED_MARKER_COLOR = "#9e2b20";
const DEFAULT_TEXT_ZOOMS: [number, number] = [11, 20];

/** 山西省范围 + 缩放限制 */
const SHANXI_BOUNDS: [[number, number], [number, number]] = [
  [110.23, 34.58],
  [114.56, 40.74],
];
const ZOOMS: [number, number] = [7, 14];

/** 跨页面记住地图视野（详情页返回时恢复） */
const VIEW_KEY = "sx:map-view";

function saveView(map: any) {
  try {
    const c = map.getCenter();
    sessionStorage.setItem(
      VIEW_KEY,
      JSON.stringify({ zoom: map.getZoom(), center: [c.getLng(), c.getLat()] })
    );
  } catch {
    /* ignore */
  }
}

function loadView(): { zoom: number; center: [number, number] } | null {
  try {
    const raw = sessionStorage.getItem(VIEW_KEY);
    if (!raw) return null;
    const v = JSON.parse(raw);
    if (typeof v.zoom === "number" && Array.isArray(v.center)) return v;
  } catch {
    /* ignore */
  }
  return null;
}

function iconUri(b: Building, selected: boolean): string {
  const color = selected ? SELECTED_MARKER_COLOR : BASE_MARKER_COLOR;
  const d = BASE_MARKER_SIZE + (selected ? 5 : 0);
  const pad = 6;
  const s = d + pad * 2;
  const c = s / 2;
  const isGrotto = b.type === "石窟寺及石刻";
  const ring = selected
    ? `<circle cx="${c}" cy="${c}" r="${d / 2 + 4}" fill="none" stroke="${color}" stroke-width="1.5" opacity="0.8"/>`
    : "";
  const shape = isGrotto
    ? `<rect x="${c - d / 2}" y="${c - d / 2}" width="${d}" height="${d}" fill="${color}" stroke="#fffdf6" stroke-width="1.4" transform="rotate(45 ${c} ${c})"/>`
    : `<circle cx="${c}" cy="${c}" r="${d / 2}" fill="${color}" stroke="#fffdf6" stroke-width="1.4"/>`;
  const badge = b.yingzao
    ? `<rect x="${s - 11}" y="0" width="11" height="11" fill="#9e2b20"/><text x="${s - 5.5}" y="8.6" font-size="8" fill="#f8ecdc" text-anchor="middle" font-family="serif">测</text>`
    : "";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}">${ring}${shape}${badge}</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function textStyle(selected: boolean) {
  return {
    fontSize: 12,
    fillColor: selected ? "#9e2b20" : "#3d3120",
    strokeColor: "#f3ecdc",
    strokeWidth: 3,
  };
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
        plugins: ["AMap.DistrictLayer"],
      });
      if (disposed || !elRef.current) return;
      amapRef.current = AMap;
      const saved = loadView();
      const map = new AMap.Map(elRef.current, {
        viewMode: "2D",
        center: saved?.center ?? [112.4, 37.7],
        zoom: saved?.zoom ?? 7,
        zooms: ZOOMS,
        mapStyle: "amap://styles/whitesmoke",
      });
      // 锁定山西省范围
      map.setLimitBounds(
        new AMap.Bounds(SHANXI_BOUNDS[0], SHANXI_BOUNDS[1])
      );
      // 省 + 11地市行政边界
      const district = new AMap.DistrictLayer.Province({
        zIndex: 12,
        adcode: [140000],
        depth: 1,
        styles: {
          fill: "rgba(0,0,0,0)",
          "province-stroke": "rgba(139,115,85,0.6)",
          "city-stroke": "rgba(139,115,85,0.4)",
          "county-stroke": "rgba(0,0,0,0)",
        },
      });
      district.setMap(map);
      const layer = new AMap.LabelsLayer({ collision: true, zIndex: 120 });
      map.add(layer);
      map.on("click", () => onSelectRef.current(null));
      map.on("moveend", () => saveView(map));
      map.on("zoomend", () => saveView(map));
      mapRef.current = map;
      layerRef.current = layer;
      readyRef.current = true;
      if (process.env.NODE_ENV !== "production") {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).__sxMap = map;
      }
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
      const d = BASE_MARKER_SIZE + (selected ? 5 : 0) + 12;
      const zooms = selected ? [2, 20] : DEFAULT_TEXT_ZOOMS;
      const m = new AMap.LabelMarker({
        position: [b.lng, b.lat],
        zIndex: 20 + (selected ? 50 : 0),
        rank: 2000 + (selected ? 9000 : 0),
        icon: {
          image: iconUri(b, selected),
          size: [d, d],
          anchor: "center",
        },
        text: {
          content: b.name,
          direction: "right",
          offset: [1, 0],
          zooms,
          style: textStyle(selected),
        },
        extData: { id: b.id },
      });
      m.on("click", (e: any) => {
        const id = e.target?.getExtData?.()?.id;
        if (id) onSelectRef.current(id);
      });
      // hover 显示名称；未选中地点使用相同的常规显示阈值
      if (!selected) {
        m.on("mouseover", () => {
          m.setText({
            content: b.name,
            direction: "right",
            offset: [1, 0],
            zooms: [2, 20],
            style: textStyle(false),
          });
        });
        m.on("mouseout", () => {
          m.setText({
            content: b.name,
            direction: "right",
            offset: [1, 0],
            zooms: DEFAULT_TEXT_ZOOMS,
            style: textStyle(false),
          });
        });
      }
      return m;
    });
    if (markers.length) layer.add(markers);
  }

  // 数据/选中变化时重绘
  useEffect(() => {
    renderMarkers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buildings, selectedId]);

  // 选中时飞到该点
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedId) return;
    const b = buildings.find((x) => x.id === selectedId);
    if (!b) return;
    const zoom = Math.max(map.getZoom(), 10.5);
    // limitBounds 会打断动画式 setZoomAndCenter，这里用立即跳转保证到位
    map.setZoomAndCenter(zoom, [b.lng, b.lat], true);
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
