import membersJson from "@/content/members/members.json";

export type StreamingPlatform =
  | "kick"
  | "youtube"
  | "twitch"
  | "fuwacchi"
  | "niconico"
  | "twitcasting";

export type SocialPlatform = "x" | "instagram" | "tiktok" | "discord";

export type StreamingHandle = {
  platform: StreamingPlatform;
  username: string;
  url: string;
};

export type Member = {
  slug: string;
  name: string;
  handle?: string;
  role: string;
  bio?: string;
  avatar: string;
  streamingPlatforms: StreamingHandle[];
  socials: { platform: SocialPlatform; url: string }[];
};

export const members: Member[] = membersJson.members as Member[];

export function getMembers(): Member[] {
  return members;
}

export function getMemberBySlug(slug: string): Member | undefined {
  return members.find((m) => m.slug === slug);
}
