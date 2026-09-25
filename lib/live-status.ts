import type { Member, StreamingHandle, StreamingPlatform } from "@/content/members";

export type LiveStatus = {
  isLive: boolean;
  platform?: StreamingPlatform;
  liveUrl?: string;
  title?: string;
  viewers?: number;
  thumbnail?: string;
};

const FETCH_TIMEOUT_MS = 4000;

async function fetchWithTimeout(url: string): Promise<Response | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "application/json, text/plain, */*",
        "Accept-Language": "ja,en-US;q=0.9,en;q=0.8",
      },
      cache: "no-store",
    });
    return res;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function checkKick(handle: StreamingHandle): Promise<LiveStatus | null> {
  const res = await fetchWithTimeout(
    `https://kick.com/api/v2/channels/${encodeURIComponent(handle.username)}`,
  );
  if (!res || !res.ok) return null;
  try {
    const data = (await res.json()) as {
      livestream?: {
        is_live?: boolean;
        session_title?: string;
        viewer_count?: number;
        thumbnail?: { url?: string } | null;
      } | null;
    };
    const stream = data.livestream;
    if (!stream || stream.is_live !== true) return null;
    return {
      isLive: true,
      platform: "kick",
      liveUrl: handle.url,
      title: stream.session_title,
      viewers: stream.viewer_count,
      thumbnail: stream.thumbnail?.url ?? undefined,
    };
  } catch {
    return null;
  }
}

async function checkYouTube(
  handle: StreamingHandle,
): Promise<LiveStatus | null> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) return null;

  // Resolve channel ID: if username starts with "UC" treat as channel ID, otherwise resolve via handle
  let channelId = handle.username;
  if (!handle.username.startsWith("UC")) {
    const resolveUrl = `https://www.googleapis.com/youtube/v3/channels?part=id&forHandle=${encodeURIComponent(handle.username)}&key=${apiKey}`;
    const resolveRes = await fetchWithTimeout(resolveUrl);
    if (!resolveRes || !resolveRes.ok) return null;
    try {
      const data = (await resolveRes.json()) as { items?: { id: string }[] };
      channelId = data.items?.[0]?.id ?? "";
      if (!channelId) return null;
    } catch {
      return null;
    }
  }

  const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${encodeURIComponent(channelId)}&type=video&eventType=live&key=${apiKey}`;
  const res = await fetchWithTimeout(searchUrl);
  if (!res || !res.ok) return null;
  try {
    const data = (await res.json()) as {
      items?: {
        id?: { videoId?: string };
        snippet?: { title?: string; thumbnails?: { medium?: { url?: string } } };
      }[];
    };
    const item = data.items?.[0];
    if (!item?.id?.videoId) return null;
    return {
      isLive: true,
      platform: "youtube",
      liveUrl: handle.url,
      title: item.snippet?.title,
      thumbnail: item.snippet?.thumbnails?.medium?.url ?? undefined,
    };
  } catch {
    return null;
  }
}

async function checkPlatform(
  handle: StreamingHandle,
): Promise<LiveStatus | null> {
  switch (handle.platform) {
    case "kick":
      return checkKick(handle);
    case "youtube":
      return checkYouTube(handle);
    default:
      return null;
  }
}

export async function getLiveStatus(member: Member): Promise<LiveStatus> {
  if (member.streamingPlatforms.length === 0) {
    return { isLive: false };
  }
  for (const handle of member.streamingPlatforms) {
    const status = await checkPlatform(handle);
    if (status?.isLive) return status;
  }
  return { isLive: false };
}

export async function getLiveStatusBulk(
  members: Member[],
): Promise<Map<string, LiveStatus>> {
  const entries = await Promise.all(
    members.map(async (m) => [m.slug, await getLiveStatus(m)] as const),
  );
  return new Map(entries);
}
