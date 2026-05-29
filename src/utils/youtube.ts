// Build-time fetch of the Ecohydraulics YouTube channel's latest videos via the
// public RSS feed (no API key required). Falls back to a baked-in list if the
// feed is unreachable during the build, so CI never fails on a network hiccup.

export interface ChannelVideo {
    id: string;
    title: string;
}

// @ecohydraulics9581 resolves to this channel id.
const CHANNEL_ID = "UClGaUTQkZZUFXxpznALnoTQ";
const FEED_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;

// Fallback snapshot (used only if the live feed can't be fetched at build time).
const FALLBACK_VIDEOS: ChannelVideo[] = [
    { id: "Cg_4xwx07vk", title: "Andres Vargas Luna interview" },
    { id: "oOrOwOnqqjs", title: "Knut Alfredsen interview" },
    { id: "T_3C76VRh6k", title: "16th International Symposium on Ecohydraulics Announcement" },
    { id: "y4-M7u6__To", title: "ISE2024 Greetings by Michele Mossa" },
    { id: "LAFo6QVZKuc", title: "Ecohydraulics community meeting" },
    { id: "4EABnMR_gJI", title: "Christoph Hauer Interview" },
    { id: "5oT5V94ia6Y", title: "Optimising the design of bamboo structures for mangrove restoration" },
    { id: "YV7aRW1eDXk", title: "The role of vegetation on bankfull river morphodynamics" },
    { id: "bd3LC5LbGfU", title: "Modeling of Salt march dynamics" },
    { id: "ozdMhURCVaA", title: "Restoring multi life-stage, connected aquatic habitat" },
    { id: "cXzS6NtYKww", title: "Vegetation-Generated Turbulence and Bedload Transport" },
    { id: "laoh6FysoNU", title: "ISE2020 Presentation on Geomorphic Sustainability of Fluvial Habitat" },
];

function decodeEntities(s: string): string {
    return s
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&apos;/g, "'");
}

export async function getChannelVideos(max = 12): Promise<ChannelVideo[]> {
    try {
        const res = await fetch(FEED_URL, {
            signal: AbortSignal.timeout(15000),
            headers: { "User-Agent": "Mozilla/5.0 (compatible; ecohydraulics-site-build)" },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const xml = await res.text();
        const entries = [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].map((m) => m[1]);
        const videos: ChannelVideo[] = [];
        for (const e of entries) {
            const idMatch = e.match(/<yt:videoId>([^<]+)<\/yt:videoId>/);
            const titleMatch = e.match(/<media:title>([^<]+)<\/media:title>/) || e.match(/<title>([^<]+)<\/title>/);
            if (idMatch) {
                videos.push({ id: idMatch[1], title: decodeEntities(titleMatch ? titleMatch[1] : "") });
            }
            if (videos.length >= max) break;
        }
        if (videos.length) return videos;
        throw new Error("no entries parsed");
    } catch (err) {
        console.warn(`[youtube] live feed unavailable, using fallback list: ${(err as Error).message}`);
        return FALLBACK_VIDEOS.slice(0, max);
    }
}
