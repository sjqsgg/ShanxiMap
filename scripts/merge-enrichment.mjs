#!/usr/bin/env node
/**
 * 合并 enrichment + images 数据到 buildings.json
 *
 * 合并规则：
 * 1. 描述：模板描述 → 替换为维基摘要（截取前 200 字左右）；手写描述保留不动
 * 2. 实用信息：新增 tel / rating 字段
 * 3. 维基链接：新增 wiki_url
 * 4. 配图：新增 image { url, thumb, license, artist }
 * 5. 坐标：非 high 精度 + 高德偏差 0.1-5km → 升级为高德坐标
 *
 * 用法：node scripts/merge-enrichment.mjs
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const buildingsPath = path.join(ROOT, "src/data/buildings.json");
const buildings = JSON.parse(fs.readFileSync(buildingsPath, "utf-8"));
const enrich = JSON.parse(
  fs.readFileSync(path.join(ROOT, "data/enrichment-result.json"), "utf-8")
);
const images = JSON.parse(
  fs.readFileSync(path.join(ROOT, "data/images-result.json"), "utf-8")
);

function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const rad = (x) => (x * Math.PI) / 180;
  const dLat = rad(lat2 - lat1);
  const dLng = rad(lng2 - lng1);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

// 维基摘要清理：去掉开头重复的"XX位于…"（和现有描述重复的部分），控制长度
function cleanWikiExtract(extract, maxLen = 250) {
  let text = extract
    .replace(/\n+/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (text.length > maxLen) {
    // 截断到最近的句号
    const cut = text.slice(0, maxLen);
    const lastPeriod = Math.max(
      cut.lastIndexOf("。"),
      cut.lastIndexOf("）"),
    );
    text = lastPeriod > maxLen * 0.5 ? cut.slice(0, lastPeriod + 1) : cut + "…";
  }
  return text;
}

// ── merge ───────────────────────────────────────────────────

const stats = {
  descUpgraded: 0,
  telAdded: 0,
  ratingAdded: 0,
  wikiUrlAdded: 0,
  imageAdded: 0,
  coordUpgraded: 0,
};

// Build lookup from enrichment
const enrichMap = {};
for (const b of enrich.buildings) {
  enrichMap[b.id] = b;
}

for (const b of buildings) {
  const e = enrichMap[b.id];
  if (!e) continue;

  // 1. Description upgrade (template → wiki)
  if (b.desc_source === "template" && e.wiki.matched && e.wiki.extract) {
    const cleaned = cleanWikiExtract(e.wiki.extract);
    if (cleaned.length > b.description.length) {
      b.description = cleaned;
      b.desc_source = "wiki";
      stats.descUpgraded++;
    }
  }

  // 2. Tel
  if (e.amap.matched && e.amap.tel) {
    b.tel = e.amap.tel;
    stats.telAdded++;
  }

  // 3. Rating
  if (e.amap.matched && e.amap.rating && e.amap.rating !== "0") {
    b.rating = e.amap.rating;
    stats.ratingAdded++;
  }

  // 4. Wiki URL
  if (e.wiki.matched && e.wiki.url) {
    b.wiki_url = e.wiki.url;
    stats.wikiUrlAdded++;
  }

  // 5. Image
  const img = images[b.id];
  if (img && img.url) {
    b.image = {
      url: img.url,
      thumb: img.thumb || "",
      license: img.license || "",
      artist: img.artist || "",
    };
    stats.imageAdded++;
  }

  // 6. Coordinate upgrade
  if (
    b.geo_precision !== "high" &&
    e.amap.matched &&
    e.amap.location
  ) {
    const [amapLng, amapLat] = e.amap.location;
    const dist = haversineKm(b.lat, b.lng, amapLat, amapLng);
    if (dist > 0.1 && dist < 5) {
      b.lat = amapLat;
      b.lng = amapLng;
      b.geo_precision = "amap";
      b.geo_source = "amap-enrichment";
      stats.coordUpgraded++;
    }
  }
}

// ── write ───────────────────────────────────────────────────

// Backup
const backupPath = path.join(ROOT, "data/buildings-backup.json");
fs.writeFileSync(
  backupPath,
  fs.readFileSync(buildingsPath)
);

// Write merged
fs.writeFileSync(buildingsPath, JSON.stringify(buildings, null, 2));

console.log("\n  合并完成！\n");
console.log("  描述升级 (模板→维基):", stats.descUpgraded);
console.log("  电话新增:", stats.telAdded);
console.log("  评分新增:", stats.ratingAdded);
console.log("  维基链接:", stats.wikiUrlAdded);
console.log("  配图新增:", stats.imageAdded);
console.log("  坐标改善:", stats.coordUpgraded);
console.log("\n  备份: data/buildings-backup.json");
console.log("  输出: src/data/buildings.json\n");
