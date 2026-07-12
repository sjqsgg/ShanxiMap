import { Suspense } from "react";
import type { Metadata } from "next";
import MapApp from "@/components/map/MapApp";

export const metadata: Metadata = {
  title: "地图 — 山西访古档案",
};

export default function MapPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-paper font-mono text-sm text-ink-faint">
          正在展开舆图……
        </div>
      }
    >
      <MapApp />
    </Suspense>
  );
}
