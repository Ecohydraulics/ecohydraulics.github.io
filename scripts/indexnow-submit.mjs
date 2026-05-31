/**
 * Notify IndexNow (Bing, Yandex, and other participating engines) about the
 * URLs that changed in the latest push. Meant to run *after* the site is
 * deployed and live, from the GitHub Actions "indexnow" job.
 *
 * Behaviour:
 *   - Reads the newline-separated list of changed files from $CHANGED_FILES.
 *   - Content pages/posts map to their public URLs.
 *   - A change to a layout/component/style/config file affects every rendered
 *     page, so the whole sitemap is submitted instead.
 *   - Candidate URLs are intersected with the live sitemap so we never submit
 *     a URL that isn't actually served (avoids IndexNow 422s / wasted pings).
 *   - No-ops cleanly (exit 0) when there is nothing relevant to submit.
 *
 * Uses only Node built-ins (global fetch, fs) — no dependencies to install.
 */
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const HOST = "ecohydraulics.org";
const ORIGIN = `https://${HOST}`;
const PUBLIC_DIR = "public";
const SITEMAP_URL = `${ORIGIN}/sitemap-0.xml`;
const API_ENDPOINT = "https://api.indexnow.org/IndexNow";

// Files that affect every rendered page → submit the full sitemap.
const GLOBAL_CHANGE_RE =
    /^(src\/layouts\/|src\/components\/|src\/styles\/|src\/pages\/index\.|astro\.config\.|twilight\.config\.|src\/config\.|src\/content\.config\.)/;

// Discover the IndexNow key file in public/ (named "<key>.txt", whose contents
// equal "<key>"). Keeping the key in the served file — rather than hardcoded —
// means rotating the key is just swapping the file.
function findKey() {
    const candidates = readdirSync(PUBLIC_DIR).filter((f) =>
        /^[a-f0-9]{8,}\.txt$/i.test(f),
    );
    for (const file of candidates) {
        const key = file.replace(/\.txt$/i, "");
        const body = readFileSync(join(PUBLIC_DIR, file), "utf8").trim();
        if (body === key) {
            return { key, keyLocation: `${ORIGIN}/${file}` };
        }
    }
    return null;
}

// Map a changed source file to the URL it renders to, or null if it isn't a
// directly-addressable content file. Mirrors the content-collection routing:
//   src/content/pages/<slug>.md  -> /<slug>/
//   src/content/posts/<slug>.md  -> /posts/<slug>/
function fileToUrl(file) {
    let m;
    if ((m = file.match(/^src\/content\/pages\/(.+)\.mdx?$/))) {
        return `${ORIGIN}/${m[1]}/`;
    }
    if ((m = file.match(/^src\/content\/posts\/(.+)\.mdx?$/))) {
        return `${ORIGIN}/posts/${m[1]}/`;
    }
    return null;
}

async function fetchSitemapUrls() {
    const res = await fetch(SITEMAP_URL);
    if (!res.ok) throw new Error(`Failed to fetch sitemap (${res.status})`);
    const xml = await res.text();
    return new Set([...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((x) => x[1]));
}

async function main() {
    const keyInfo = findKey();
    if (!keyInfo) {
        console.log("IndexNow: no key file found in public/, skipping.");
        return;
    }

    const changed = (process.env.CHANGED_FILES || "")
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);

    const sitemap = await fetchSitemapUrls();

    let urls;
    if (changed.some((f) => GLOBAL_CHANGE_RE.test(f))) {
        console.log("IndexNow: global change detected → submitting full sitemap.");
        urls = [...sitemap];
    } else {
        const candidates = new Set();
        for (const file of changed) {
            const url = fileToUrl(file);
            if (url) candidates.add(url);
        }
        // A changed/added post also changes the home and archive listings.
        if ([...candidates].some((u) => u.includes("/posts/"))) {
            candidates.add(`${ORIGIN}/`);
            candidates.add(`${ORIGIN}/archive/`);
        }
        // Only keep URLs that are actually served (present in the live sitemap).
        urls = [...candidates].filter((u) => sitemap.has(u));
    }

    if (urls.length === 0) {
        console.log("IndexNow: no relevant URL changes, nothing to submit.");
        return;
    }

    const payload = {
        host: HOST,
        key: keyInfo.key,
        keyLocation: keyInfo.keyLocation,
        urlList: urls,
    };

    console.log(`IndexNow: submitting ${urls.length} URL(s):`);
    urls.forEach((u) => console.log(`  ${u}`));

    const res = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify(payload),
    });

    console.log(`IndexNow: API responded ${res.status} ${res.statusText}`);
    // 200 OK and 202 Accepted are both success.
    if (res.status !== 200 && res.status !== 202) {
        const text = await res.text().catch(() => "");
        throw new Error(`IndexNow submission failed: ${res.status} ${text}`);
    }
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
