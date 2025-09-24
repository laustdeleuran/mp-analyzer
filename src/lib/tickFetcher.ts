import fs from 'node:fs/promises';
import path from 'node:path';

import { enhanceTicks } from './aggregation';
import type { BucketRequest, Tick, TickCache } from './types';

const CACHE_PATH = path.join(process.cwd(), 'data', 'ticks-cache.json');
const FETCH_INTERVAL = Number.parseInt(process.env.MP_FETCH_INTERVAL ?? '', 10) || 1000 * 60 * 60;

let currentRefresh: Promise<TickCache> | null = null;
let isInitialized = false;

function sanitize(content: string): string {
  return content.replace(/<!\[CDATA\[/g, '').replace(/\]\]>/g, '').trim();
}

function extractTag(xml: string, tag: string): string | null {
  const regex = new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`, 'i');
  const match = xml.match(regex);
  if (!match) return null;
  return sanitize(match[1]);
}

function extractAllTags(xml: string, tag: string): string[] {
  const regex = new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`, 'gi');
  const matches = [];
  let match: RegExpExecArray | null;
  while ((match = regex.exec(xml))) {
    matches.push(sanitize(match[1]));
  }
  return matches;
}

function parseRss(xml: string): Tick[] {
  const itemPattern = new RegExp('<item>[\\s\\S]*?<\\/item>', 'gi');
  const items = xml.match(itemPattern);
  if (!items) return [];

  return items.map((item, index) => {
    const title = extractTag(item, 'title') ?? '';
    const link = extractTag(item, 'link') ?? undefined;
    const pubDate = extractTag(item, 'pubDate') ?? extractTag(item, 'dc:date') ?? '';
    const categories = extractAllTags(item, 'category');
    const description = extractTag(item, 'description') ?? '';

    let routeName = title;
    let grade = '';
    let style = categories[0] ?? '';

    const titleMatch = title.match(/^(.*?):\s*(.*?)\s*\(([^)]+)\)/);
    if (titleMatch) {
      style = titleMatch[1].trim();
      routeName = titleMatch[2].trim();
      grade = titleMatch[3].trim();
    } else {
      const gradeMatch = title.match(/\(([^)]+)\)/);
      if (gradeMatch) {
        grade = gradeMatch[1].trim();
      }
    }

    if (!grade) {
      const gradeMatch = description.match(/Grade:\s*([^<]+)/i);
      if (gradeMatch) {
        grade = gradeMatch[1].trim();
      }
    }

    const areaMatch = description.match(/Area:\s*([^<]+)/i);
    const area = areaMatch ? areaMatch[1].trim() : categories.slice(1).join(' > ');

    const date = pubDate ? new Date(pubDate).toISOString().slice(0, 10) : '';

    return {
      id: extractTag(item, 'guid') ?? `${Date.parse(pubDate) || index}`,
      routeName,
      area,
      grade,
      style,
      date,
      link,
      gradeNumeric: null,
    } as Tick;
  });
}

async function ensureDirectory() {
  const dir = path.dirname(CACHE_PATH);
  await fs.mkdir(dir, { recursive: true });
}

async function readCacheFile(filePath: string): Promise<TickCache | null> {
  try {
    const raw = await fs.readFile(filePath, 'utf-8');
    const parsed = JSON.parse(raw) as TickCache;
    if (!Array.isArray(parsed.ticks)) {
      return null;
    }
    return {
      ...parsed,
      ticks: enhanceTicks(parsed.ticks as Tick[]),
    };
  } catch {
    return null;
  }
}

async function writeCache(cache: TickCache) {
  await ensureDirectory();
  await fs.writeFile(CACHE_PATH, JSON.stringify(cache, null, 2), 'utf-8');
}

function resolveFeedUrl(): string | null {
  if (process.env.MP_FEED_URL) return process.env.MP_FEED_URL;
  const userId = process.env.MP_USER_ID;
  if (!userId) return null;
  return `https://www.mountainproject.com/rss/user-ticks/${userId}`;
}

async function fetchRemoteTicks(): Promise<TickCache | null> {
  const feedUrl = resolveFeedUrl();
  if (!feedUrl) return null;
  try {
    const response = await fetch(feedUrl, {
      headers: {
        'User-Agent': 'mp-analyzer/1.0',
        Accept: 'application/rss+xml, application/xml',
      },
    });
    if (!response.ok) {
      return null;
    }
    const xml = await response.text();
    const ticks = enhanceTicks(parseRss(xml));
    return {
      lastFetched: new Date().toISOString(),
      ticks,
    };
  } catch {
    return null;
  }
}

export async function refreshTicks(force = false): Promise<TickCache> {
  if (currentRefresh && !force) {
    return currentRefresh;
  }

  currentRefresh = (async () => {
    const remote = await fetchRemoteTicks();
    if (remote && remote.ticks.length) {
      await writeCache(remote);
      return remote;
    }
    const existing = await readCacheFile(CACHE_PATH);
    if (existing) {
      return existing;
    }
    return { lastFetched: new Date().toISOString(), ticks: [] };
  })();

  try {
    return await currentRefresh;
  } finally {
    currentRefresh = null;
  }
}

export async function getCachedTicks(): Promise<TickCache> {
  const cached = await readCacheFile(CACHE_PATH);
  if (cached) {
    return cached;
  }
  return refreshTicks(true);
}

function scheduleBackgroundRefresh() {
  if (isInitialized) return;
  isInitialized = true;
  if (process.env.NODE_ENV === 'test') {
    return;
  }
  refreshTicks().catch(() => undefined);
  setInterval(() => {
    refreshTicks().catch(() => undefined);
  }, FETCH_INTERVAL);
}

export async function getBuckets(filters: BucketRequest) {
  scheduleBackgroundRefresh();
  const cache = await getCachedTicks();
  return { cache, filters };
}

export function ensureFetcher() {
  scheduleBackgroundRefresh();
}
