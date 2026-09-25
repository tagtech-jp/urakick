import type { Metadata } from "next";
import { getRules } from "@/lib/rules";

export function generateMetadata(): Metadata {
  const { frontmatter } = getRules();
  return {
    title: "RULES / 裏キック団ルール",
    description: frontmatter.description,
  };
}

export default function RulesPage() {
  const { frontmatter } = getRules();
  const { rules, 罰則方針 } = frontmatter;

  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <header className="border-b border-border/60 pb-8">
        <p className="text-xs font-bold tracking-[0.3em] text-[var(--accent-kick)]">
          RULES
        </p>
        <h1 className="mt-2 text-4xl font-black tracking-tight sm:text-5xl">
          裏キック団ルール
        </h1>
      </header>

      <div className="mt-10 space-y-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
        <p>
          <span className="font-bold text-foreground">裏キック団ルール</span>
          とは、裏キック団の一員として必ず守らなければならない鉄則です。
        </p>
        <p>
          ルールを破った者は{罰則方針}。
        </p>
      </div>

      <ol className="mt-12 space-y-5">
        {rules.map((rule, index) => (
          <li
            key={rule.id}
            className="card-elevated rounded-lg bg-card p-6"
          >
            <p className="text-sm font-bold text-[var(--accent-kick)] sm:text-base">
              第{index + 1}条
            </p>
            <p className="mt-3 text-base leading-relaxed text-foreground/95 sm:text-lg">
              {rule.text}
            </p>
          </li>
        ))}
      </ol>

      <div className="mt-16 border-t border-border/60 pt-6 text-xs tracking-widest text-muted-foreground/70">
        制定：裏キック団 / 全一団長
      </div>
    </section>
  );
}
