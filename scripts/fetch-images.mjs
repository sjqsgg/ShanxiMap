#!/usr/bin/env node
/**
 * 维基百科配图抓取脚本
 *
 * 从 enrich-checkpoint.json 读取维基命中条目，
 * 通过 pageimages API 获取每个条目的主图 URL。
 * 不下载原图——网站直接用 Wikimedia Commons URL + next/image 远程优化。
 *
 * 用法：
 *   node scripts/fetch-images.mjs
 *
 * 前置：需先跑过 enrich.mjs 生成 checkpoint
 *
 * 输出：
 *   data/images-result.json   — { [buildingId]: { url, thumb, file, width, height, license, artist } }
 *   data/images-review.md     — 人可读报告
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const PROXY_URL = process.env.HTTPS_PROXY || process.env.HTTP_PROXY || "";
if (PROXY_URL) {
  const { ProxyAgent, setGlobalDispatcher } = await import("undici");
  setGlobalDispatcher(new ProxyAgent(PROXY_URL));
  console.log(`  proxy: ${PROXY_URL}`);
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const DELAY = 350; // ms between requests (be polite to Wikipedia)
const THUMB_WIDTH = 800;
const WIKI_UA =
  "ShanxiArchitectureMap/1.0 (educational project; contact: sjqsgg123@gmail.com)";
const CKPT_FILE = path.join(ROOT, "data", "images-checkpoint.json");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function elapsed(start) {
  const s = ((Date.now() - start) / 1000) | 0;
  return `${(s / 60) | 0}m${String(s % 60).padStart(2, "0")}s`;
}

// ── load data ───────────────────────────────────────────────

const buildings = JSON.parse(
  fs.readFileSync(path.join(ROOT, "src/data/buildings.json"), "utf-8")
);
const enrichCkpt = JSON.parse(
  fs.readFileSync(path.join(ROOT, "data/enrich-checkpoint.json"), "utf-8")
);

// buildings with wiki match
const wikiHits = buildings.filter((b) => enrichCkpt.wiki[b.id]?.matched);
console.log(`\n  维基百科配图抓取  共 ${wikiHits.length} 条有维基条目\n`);

// ── checkpoint ──────────────────────────────────────────────

function loadCkpt() {
  try {
    return JSON.parse(fs.readFileSync(CKPT_FILE, "utf-8"));
  } catch {
    return {};
  }
}
function saveCkpt(c) {
  fs.writeFileSync(CKPT_FILE, JSON.stringify(c));
}

// ── API helpers ─────────────────────────────────────────────

async function getPageImage(wikiTitle) {
  const u = new URL("https://zh.wikipedia.org/w/api.php");
  u.searchParams.set("action", "query");
  u.searchParams.set("titles", wikiTitle);
  u.searchParams.set("prop", "pageimages");
  u.searchParams.set("piprop", "original|name");
  u.searchParams.set("format", "json");
  u.searchParams.set("redirects", "1");

  const res = await fetch(u, {
    headers: { "User-Agent": WIKI_UA },
    signal: AbortSignal.timeout(12000),
  });
  const data = await res.json();
  const page = Object.values(data.query.pages)[0];
  if (!page.original || !page.pageimage) return null;

  return {
    file: page.pageimage,
    url: page.original.source,
    width: page.original.width,
    height: page.original.height,
  };
}

async function getImageInfo(fileName) {
  const u = new URL("https://commons.wikimedia.org/w/api.php");
  u.searchParams.set("action", "query");
  u.searchParams.set("titles", `File:${fileName}`);
  u.searchParams.set("prop", "imageinfo");
  u.searchParams.set("iiprop", "extmetadata|url");
  u.searchParams.set("iiurlwidth", String(THUMB_WIDTH));
  u.searchParams.set("format", "json");

  const res = await fetch(u, {
    headers: { "User-Agent": WIKI_UA },
    signal: AbortSignal.timeout(12000),
  });
  const data = await res.json();
  const page = Object.values(data.query.pages)[0];
  const info = page?.imageinfo?.[0];
  if (!info) return null;

  const meta = info.extmetadata || {};
  const license =
    meta.LicenseShortName?.value || meta.License?.value || "unknown";
  const artist = (meta.Artist?.value || "")
    .replace(/<[^>]+>/g, "")
    .trim()
    .slice(0, 200);

  return {
    thumb: info.thumburl || "",
    license,
    artist,
    commonsUrl: info.descriptionurl || "",
  };
}

// ── main loop ───────────────────────────────────────────────

async function main() {
  const ckpt = loadCkpt();
  const t0 = Date.now();
  let hits = 0,
    skipped = 0,
    errors = 0;

  for (let i = 0; i < wikiHits.length; i++) {
    const b = wikiHits[i];

    if (ckpt[b.id]) {
      if (ckpt[b.id].url) hits++;
      skipped++;
      continue;
    }

    const wikiTitle = enrichCkpt.wiki[b.id].title;

    try {
      const img = await getPageImage(wikiTitle);
      if (!img) {
        ckpt[b.id] = { url: null };
      } else {
        await sleep(200);
        const info = await getImageInfo(img.file);
        ckpt[b.id] = {
          url: img.url,
          thumb: info?.thumb || "",
          file: img.file,
          width: img.width,
          height: img.height,
          license: info?.license || "unknown",
          artist: info?.artist || "",
          commonsUrl: info?.commonsUrl || "",
        };
        hits++;
      }
    } catch (err) {
      ckpt[b.id] = { url: null, error: err.message };
      errors++;
    }

    if ((i - skipped + 1) % 20 === 0 || i === wikiHits.length - 1) {
      saveCkpt(ckpt);
    }
    process.stdout.write(
      `\r  [图片] ${i + 1}/${wikiHits.length}  有图 ${hits}  无图 ${i + 1 - skipped - hits - errors}  失败 ${errors}  ${elapsed(t0)}    `
    );
    await sleep(DELAY);
  }

  saveCkpt(ckpt);
  console.log(
    `\n\n  完成: ${hits}/${wikiHits.length} 有图, ${skipped} 已跳过, ${errors} 失败  ${elapsed(t0)}\n`
  );

  // ── generate outputs ────────────────────────────────────

  console.log("=== 生成报告 ===\n");

  // JSON result
  const result = {};
  for (const b of buildings) {
    if (ckpt[b.id]?.url) {
      result[b.id] = ckpt[b.id];
    }
  }
  const jsonPath = path.join(ROOT, "data/images-result.json");
  fs.writeFileSync(jsonPath, JSON.stringify(result, null, 2));

  // Markdown review
  let md = "# 维基百科配图报告\n\n";
  md += `> 生成时间: ${new Date().toISOString()}\n\n`;
  md += `| 指标 | 数值 |\n|------|------|\n`;
  md += `| 维基条目命中 | ${wikiHits.length} |\n`;
  md += `| 有配图 | ${Object.keys(result).length} |\n`;
  md += `| 无图 | ${wikiHits.length - Object.keys(result).length} |\n\n`;

  // License summary
  const licCounts = {};
  for (const v of Object.values(result)) {
    const lic = v.license || "unknown";
    licCounts[lic] = (licCounts[lic] || 0) + 1;
  }
  md += "### 许可证分布\n\n";
  md += "| 许可证 | 数量 |\n|--------|------|\n";
  for (const [lic, cnt] of Object.entries(licCounts).sort(
    (a, b) => b[1] - a[1]
  )) {
    md += `| ${lic} | ${cnt} |\n`;
  }
  md += "\n";

  md += "### 使用须知\n\n";
  md += "- CC BY-SA：可免费使用，需注明作者 + 许可证 + 链接到 Commons 页面\n";
  md += "- 网站底部或图片下方加一行 `图片来源: Wikimedia Commons (CC BY-SA)` 即可\n";
  md += "- `next/image` 配置 `remotePatterns` 允许 `upload.wikimedia.org`\n\n";

  // Per-tier listing
  const TIERS = ["必去", "推荐", "小众", "可选"];
  for (const tier of TIERS) {
    const group = buildings.filter((b) => b.tier === tier);
    const withImg = group.filter((b) => result[b.id]);
    const without = group.filter(
      (b) => enrichCkpt.wiki[b.id]?.matched && !result[b.id]
    );

    md += `---\n\n## ${tier}（${withImg.length}/${group.length} 有图）\n\n`;

    for (const b of withImg) {
      const img = result[b.id];
      md += `- **${b.name}** (id:${b.id}) — ${img.width}x${img.height} ${img.license}`;
      md += img.artist ? ` by ${img.artist.slice(0, 60)}` : "";
      md += `\n  ${img.thumb || img.url}\n`;
    }

    if (without.length) {
      md += `\n**无图**: ${without.map((b) => b.name).join("、")}\n`;
    }
    md += "\n";
  }

  const mdPath = path.join(ROOT, "data/images-review.md");
  fs.writeFileSync(mdPath, md);

  console.log(`  ${jsonPath}`);
  console.log(`  ${mdPath}`);
  console.log(
    `\n  共 ${Object.keys(result).length} 张配图，许可证: ${Object.entries(licCounts).map(([k, v]) => k + ":" + v).join(", ")}`
  );
  console.log("\n  完成！\n");
}

main().catch((err) => {
  console.error("\n脚本异常:", err);
  process.exit(1);
});
