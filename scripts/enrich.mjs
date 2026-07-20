#!/usr/bin/env node
/**
 * 山西古建数据补充脚本
 *
 * 第一轮：高德 POI 文本搜索 → 精确坐标、电话、营业时间、评分
 * 第二轮：中文维基百科 API  → 条目摘要（替换模板描述）
 *
 * 用法：
 *   export AMAP_WEB_KEY=你的web服务key
 *   node scripts/enrich.mjs          # 两轮都跑
 *   node scripts/enrich.mjs --wiki   # 只跑维基
 *   node scripts/enrich.mjs --amap   # 只跑高德
 *
 * 支持断点续传：中途 Ctrl-C 后重新运行会跳过已完成的条目。
 * 删除 data/enrich-checkpoint.json 可全部重跑。
 *
 * 输出：
 *   data/enrichment-result.json  — 结构化结果
 *   data/enrichment-review.md    — 人可读对比报告
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// ── proxy (for Wikipedia through GFW) ───────────────────────

const PROXY_URL = process.env.HTTPS_PROXY || process.env.HTTP_PROXY || "";
if (PROXY_URL) {
  const { ProxyAgent, setGlobalDispatcher } = await import("undici");
  setGlobalDispatcher(new ProxyAgent(PROXY_URL));
  console.log(`  proxy: ${PROXY_URL}`);
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

// ── config ──────────────────────────────────────────────────

const AMAP_KEY = process.env.AMAP_WEB_KEY || "";
const DELAY_AMAP = 220;
const DELAY_WIKI = 250;
const CHECKPOINT = path.join(ROOT, "data", "enrich-checkpoint.json");

const args = new Set(process.argv.slice(2));
const RUN_AMAP = args.size === 0 || args.has("--amap");
const RUN_WIKI = args.size === 0 || args.has("--wiki");

if (RUN_AMAP && !AMAP_KEY) {
  console.error("需要高德 key: export AMAP_WEB_KEY=xxx");
  process.exit(1);
}

// ── load data ───────────────────────────────────────────────

const buildings = JSON.parse(
  fs.readFileSync(path.join(ROOT, "src/data/buildings.json"), "utf-8")
);
console.log(`\n  山西古建数据补充  共 ${buildings.length} 条`);
console.log(`  模式: ${RUN_AMAP ? "高德" : ""}${RUN_AMAP && RUN_WIKI ? " + " : ""}${RUN_WIKI ? "维基" : ""}\n`);

// ── utils ───────────────────────────────────────────────────

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function loadCkpt() {
  try {
    return JSON.parse(fs.readFileSync(CHECKPOINT, "utf-8"));
  } catch {
    return { amap: {}, wiki: {} };
  }
}
function saveCkpt(c) {
  fs.writeFileSync(CHECKPOINT, JSON.stringify(c));
}

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

function elapsed(start) {
  const s = ((Date.now() - start) / 1000) | 0;
  return `${(s / 60) | 0}m${String(s % 60).padStart(2, "0")}s`;
}

// ── Phase 1: AMap POI text search ───────────────────────────

async function searchAmap(b) {
  const u = new URL("https://restapi.amap.com/v3/place/text");
  u.searchParams.set("key", AMAP_KEY);
  u.searchParams.set("keywords", b.name);
  u.searchParams.set("city", b.city.replace("市", ""));
  u.searchParams.set("citylimit", "true");
  u.searchParams.set("extensions", "all");
  u.searchParams.set("offset", "5");

  const res = await fetch(u, { signal: AbortSignal.timeout(8000) });
  const data = await res.json();
  if (data.status !== "1" || !data.pois?.length) return null;

  const poi =
    data.pois.find((p) => p.name.includes(b.name)) || data.pois[0];
  const [lng, lat] = poi.location.split(",").map(Number);

  return {
    matched: true,
    match_name: poi.name,
    match_type: poi.type || "",
    location: [lng, lat],
    address: poi.address || "",
    tel: (Array.isArray(poi.tel) ? poi.tel.join(";") : String(poi.tel || "")).replace(/;+$/, "").replace(/\[\]/, "") || "",
    opentime: poi.biz_ext?.opentime || "",
    rating: poi.biz_ext?.rating || "",
    cost: poi.biz_ext?.cost || "",
    photos: (poi.photos || []).slice(0, 3).map((p) => p.url),
  };
}

async function runAmap(ckpt) {
  console.log("=== 第一轮：高德 POI 搜索 ===\n");
  const t0 = Date.now();
  let hits = 0, skipped = 0, errors = 0;

  for (let i = 0; i < buildings.length; i++) {
    const b = buildings[i];

    if (ckpt.amap[b.id]) {
      if (ckpt.amap[b.id].matched) hits++;
      skipped++;
      continue;
    }

    try {
      const r = await searchAmap(b);
      ckpt.amap[b.id] = r || { matched: false };
      if (r?.matched) hits++;
    } catch (err) {
      ckpt.amap[b.id] = { matched: false, error: err.message };
      errors++;
    }

    const done = i + 1 - skipped;
    if (done % 50 === 0 || i === buildings.length - 1) {
      saveCkpt(ckpt);
    }
    process.stdout.write(
      `\r  [高德] ${i + 1}/${buildings.length}  命中 ${hits}  失败 ${errors}  ${elapsed(t0)}    `
    );
    await sleep(DELAY_AMAP);
  }

  saveCkpt(ckpt);
  console.log(
    `\n\n  高德完成: ${hits}/${buildings.length} 命中, ${skipped} 已跳过, ${errors} 失败  ${elapsed(t0)}\n`
  );
  return hits;
}

// ── Phase 2: Chinese Wikipedia ──────────────────────────────

const WIKI_UA =
  "ShanxiArchitectureMap/1.0 (educational project; contact: sjqsgg123@gmail.com)";

async function wikiExtract(title) {
  const u = new URL("https://zh.wikipedia.org/w/api.php");
  u.searchParams.set("action", "query");
  u.searchParams.set("titles", title);
  u.searchParams.set("prop", "extracts|info");
  u.searchParams.set("exintro", "1");
  u.searchParams.set("explaintext", "1");
  u.searchParams.set("redirects", "1");
  u.searchParams.set("format", "json");

  const res = await fetch(u, {
    headers: { "User-Agent": WIKI_UA },
    signal: AbortSignal.timeout(12000),
  });
  const data = await res.json();
  const pages = data.query?.pages;
  if (!pages) return null;

  const page = Object.values(pages)[0];
  if (page.missing !== undefined || !page.extract) return null;

  // 检测消歧义页（通常很短且包含"可以指"/"一般可以指"）
  if (
    page.extract.length < 300 &&
    /可以指|可能(是|指)|消歧义/.test(page.extract)
  ) {
    return { disambiguation: true, title: page.title, extract: page.extract };
  }

  return {
    matched: true,
    title: page.title,
    pageid: page.pageid,
    url: `https://zh.wikipedia.org/wiki/${encodeURIComponent(page.title)}`,
    extract: page.extract.slice(0, 1500),
  };
}

async function wikiSearchList(query) {
  const u = new URL("https://zh.wikipedia.org/w/api.php");
  u.searchParams.set("action", "query");
  u.searchParams.set("list", "search");
  u.searchParams.set("srsearch", query);
  u.searchParams.set("srlimit", "5");
  u.searchParams.set("format", "json");

  const res = await fetch(u, {
    headers: { "User-Agent": WIKI_UA },
    signal: AbortSignal.timeout(12000),
  });
  const data = await res.json();
  return data.query?.search || [];
}

async function searchWiki(b) {
  // 1. exact title
  const exact = await wikiExtract(b.name);

  if (exact && exact.matched) return exact;

  // 2. if disambiguation, try "建筑名 (城市)" or "建筑名 (县)"
  if (exact?.disambiguation) {
    await sleep(150);
    const county = b.county.replace("县", "").replace("市", "").replace("区", "");
    for (const suffix of [county, b.city.replace("市", ""), "山西"]) {
      const try2 = await wikiExtract(`${b.name} (${suffix})`);
      if (try2?.matched) return try2;
      await sleep(150);
    }
  }

  // 3. search API
  await sleep(150);
  const results = await wikiSearchList(`${b.name} 山西 ${b.type}`);
  // find best match: title contains building name or vice versa
  const match = results.find(
    (r) => r.title.includes(b.name) || b.name.includes(r.title)
  );
  if (!match) return null;

  await sleep(150);
  const result = await wikiExtract(match.title);
  return result?.matched ? result : null;
}

async function runWiki(ckpt) {
  console.log("=== 第二轮：维基百科 ===\n");
  const t0 = Date.now();
  let hits = 0, skipped = 0, errors = 0;

  for (let i = 0; i < buildings.length; i++) {
    const b = buildings[i];

    if (ckpt.wiki[b.id]) {
      if (ckpt.wiki[b.id].matched) hits++;
      skipped++;
      continue;
    }

    try {
      const r = await searchWiki(b);
      ckpt.wiki[b.id] = r || { matched: false };
      if (r?.matched) hits++;
    } catch (err) {
      ckpt.wiki[b.id] = { matched: false, error: err.message };
      errors++;
    }

    const done = i + 1 - skipped;
    if (done % 30 === 0 || i === buildings.length - 1) {
      saveCkpt(ckpt);
    }
    process.stdout.write(
      `\r  [维基] ${i + 1}/${buildings.length}  命中 ${hits}  失败 ${errors}  ${elapsed(t0)}    `
    );
    await sleep(DELAY_WIKI);
  }

  saveCkpt(ckpt);
  console.log(
    `\n\n  维基完成: ${hits}/${buildings.length} 命中, ${skipped} 已跳过, ${errors} 失败  ${elapsed(t0)}\n`
  );
  return hits;
}

// ── Report generation ───────────────────────────────────────

function generateReport(ckpt) {
  const TIER_ORDER = ["必去", "推荐", "小众", "可选"];

  let amapHits = 0, wikiHits = 0;
  for (const b of buildings) {
    if (ckpt.amap[b.id]?.matched) amapHits++;
    if (ckpt.wiki[b.id]?.matched) wikiHits++;
  }

  // JSON report
  const json = {
    meta: {
      generated: new Date().toISOString(),
      total: buildings.length,
      amap_hits: amapHits,
      wiki_hits: wikiHits,
      template_descs: buildings.filter((b) => b.desc_source === "template").length,
    },
    buildings: buildings.map((b) => ({
      id: b.id,
      name: b.name,
      tier: b.tier,
      type: b.type,
      city: b.city,
      dynasty: b.dynasty,
      current: {
        description: b.description,
        desc_source: b.desc_source,
        lat: b.lat,
        lng: b.lng,
        geo_precision: b.geo_precision,
      },
      amap: ckpt.amap[b.id] || { matched: false },
      wiki: ckpt.wiki[b.id] || { matched: false },
    })),
  };

  fs.writeFileSync(
    path.join(ROOT, "data/enrichment-result.json"),
    JSON.stringify(json, null, 2)
  );

  // Markdown review
  let md = "# 山西古建数据补充报告\n\n";
  md += `> 生成时间: ${json.meta.generated}\n\n`;
  md += "## 总览\n\n";
  md += `| 指标 | 数值 |\n|------|------|\n`;
  md += `| 建筑总数 | ${json.meta.total} |\n`;
  md += `| 高德 POI 命中 | ${json.meta.amap_hits} |\n`;
  md += `| 维基百科命中 | ${json.meta.wiki_hits} |\n`;
  md += `| 模板描述待升级 | ${json.meta.template_descs} |\n\n`;

  // coordinate improvement summary
  let coordImproved = 0;
  const coordBigDrift = [];
  for (const b of buildings) {
    const a = ckpt.amap[b.id];
    if (!a?.matched || !a.location) continue;
    const dist = haversineKm(b.lat, b.lng, a.location[1], a.location[0]);
    if (b.geo_precision !== "high" && dist < 5) coordImproved++;
    if (dist > 10)
      coordBigDrift.push({ name: b.name, id: b.id, dist: +dist.toFixed(1) });
  }
  md += "### 坐标\n\n";
  md += `- 非 high 精度可改善: ~${coordImproved} 条\n`;
  md += `- 偏差 >10km（需人工核实）: ${coordBigDrift.length} 条\n\n`;
  if (coordBigDrift.length) {
    md += "| 建筑 | id | 偏差 km |\n|------|----|---------|\n";
    for (const c of coordBigDrift.sort((a, b) => b.dist - a.dist).slice(0, 30)) {
      md += `| ${c.name} | ${c.id} | ${c.dist} |\n`;
    }
    md += "\n";
  }

  // practical info summary
  let hasPhone = 0, hasTime = 0, hasRating = 0;
  for (const b of buildings) {
    const a = ckpt.amap[b.id];
    if (!a?.matched) continue;
    if (a.tel) hasPhone++;
    if (a.opentime) hasTime++;
    if (a.rating && a.rating !== "0") hasRating++;
  }
  md += "### 实用信息新增\n\n";
  md += "| 字段 | 有数据 |\n|------|--------|\n";
  md += `| 电话 | ${hasPhone} |\n`;
  md += `| 营业时间 | ${hasTime} |\n`;
  md += `| 评分 | ${hasRating} |\n\n`;

  // wiki upgrade summary
  const upgradeable = buildings.filter(
    (b) => b.desc_source === "template" && ckpt.wiki[b.id]?.matched
  );
  md += "### 描述可升级\n\n";
  md += `模板描述 + 维基命中 = **${upgradeable.length}** 条可直接替换\n\n`;

  // per-tier details
  for (const tier of TIER_ORDER) {
    const group = json.buildings
      .filter((b) => b.tier === tier)
      .sort((a, b) => {
        const wa = a.wiki.matched ? 0 : 1;
        const wb = b.wiki.matched ? 0 : 1;
        if (wa !== wb) return wa - wb;
        const da = a.current.desc_source === "template" ? 0 : 1;
        const db = b.current.desc_source === "template" ? 0 : 1;
        return da - db;
      });

    md += `---\n\n## ${tier}（${group.length} 条）\n\n`;

    for (const b of group) {
      const isTemplate = b.current.desc_source === "template";
      const hasWiki = b.wiki.matched;
      const flag = isTemplate && hasWiki ? " -> 可替换" : "";

      md += `### ${b.name}（id:${b.id} · ${b.city} · ${b.dynasty}）${flag}\n\n`;

      md += `**现有描述** ${isTemplate ? "[模板]" : "[手写]"} (${b.current.description.length}字):\n`;
      md += `> ${b.current.description}\n\n`;

      if (hasWiki) {
        const ext =
          b.wiki.extract.length > 600
            ? b.wiki.extract.slice(0, 600) + "…"
            : b.wiki.extract;
        md += `**维基百科** [${b.wiki.title}](${b.wiki.url}):\n`;
        md += `> ${ext}\n\n`;
      }

      if (b.amap.matched) {
        const parts = [];
        if (b.amap.tel) parts.push(`电话 ${b.amap.tel}`);
        if (b.amap.opentime) parts.push(`营业 ${b.amap.opentime}`);
        if (b.amap.rating && b.amap.rating !== "0")
          parts.push(`评分 ${b.amap.rating}`);
        if (b.amap.cost && b.amap.cost !== "0")
          parts.push(`人均 ¥${b.amap.cost}`);
        if (parts.length) md += `**高德**: ${parts.join(" · ")}\n\n`;

        if (b.amap.location) {
          const dist = haversineKm(
            b.current.lat,
            b.current.lng,
            b.amap.location[1],
            b.amap.location[0]
          );
          if (dist > 0.5) {
            md += `**坐标偏差 ${dist.toFixed(1)}km**: `;
            md += `现有 [${b.current.lng}, ${b.current.lat}] → `;
            md += `高德 [${b.amap.location[0]}, ${b.amap.location[1]}]\n\n`;
          }
        }
      }
    }
  }

  fs.writeFileSync(path.join(ROOT, "data/enrichment-review.md"), md);

  console.log(`  data/enrichment-result.json  (${json.buildings.length} 条)`);
  console.log(`  data/enrichment-review.md`);
  console.log(`\n  统计: 高德 ${amapHits} 命中, 维基 ${wikiHits} 命中, 可升级描述 ${upgradeable.length} 条`);
}

// ── main ────────────────────────────────────────────────────

async function main() {
  const ckpt = loadCkpt();

  if (RUN_AMAP) await runAmap(ckpt);
  if (RUN_WIKI) await runWiki(ckpt);

  console.log("=== 生成报告 ===\n");
  generateReport(ckpt);

  console.log("\n  完成！早上看 data/enrichment-review.md\n");
}

main().catch((err) => {
  console.error("\n脚本异常:", err);
  process.exit(1);
});
