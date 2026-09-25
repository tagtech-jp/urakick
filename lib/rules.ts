import fs from "fs";
import path from "path";
import matter from "gray-matter";

export type Rule = {
  id: number;
  text: string;
  penalty: boolean;
  note: string | null;
};

export type RuleFrontmatter = {
  title: string;
  description: string;
  制定日: string;
  改定日: string | null;
  改定回数: number;
  適用範囲: string;
  罰則方針: string;
  rules: Rule[];
};

export type RuleData = {
  frontmatter: RuleFrontmatter;
  body: string;
};

const RULES_FILE = path.join(process.cwd(), "content", "rules", "oki-10.mdx");

export function getRules(): RuleData {
  const raw = fs.readFileSync(RULES_FILE, "utf-8");
  const { data, content } = matter(raw);
  return {
    frontmatter: data as RuleFrontmatter,
    body: content.trim(),
  };
}
