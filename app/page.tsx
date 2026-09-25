import { Hero } from "@/components/hero";
import { LiveStatusCard } from "@/components/live-status-card";

const ACTIVITIES = [
  {
    title: "Kick での日常配信",
    body: "ふわっちで活動するメンバーが、Kick でも配信を行うことで Kick シーンを盛り上げています。雑談・ゲーム・音楽など、各メンバーの個性を活かした配信を毎日どこかで実施。",
  },
  {
    title: "メンバー間のレイドパス文化",
    body: "配信終了時のレイドパスを通じて、メンバー同士で視聴者を相互に送り合う応援文化を大切にしています。誕生日メンバーへのバースデーレイドパスは恒例。",
  },
  {
    title: "全一団長を中心とした運営",
    body: "全一団長を中心に、メンバー同士で揉めない・配信内での暴力行為禁止など、明確なルールを設けて健全な活動を継続しています。",
  },
];

export default function Home() {
  return (
    <>
      <Hero />

      <section className="mx-auto w-full max-w-5xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-12">
          <p className="text-xs font-bold tracking-[0.3em] text-[var(--accent-kick)]">
            ACTIVITIES
          </p>
          <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
            活動内容
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {ACTIVITIES.map((item) => (
            <article
              key={item.title}
              className="card-elevated rounded-lg bg-card p-6"
            >
              <h3 className="text-lg font-bold tracking-tight">{item.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {item.body}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-5xl px-4 pb-20 sm:px-6 lg:px-8">
        <LiveStatusCard />
      </section>
    </>
  );
}
