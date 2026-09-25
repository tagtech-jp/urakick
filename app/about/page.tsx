import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ABOUT / 裏キック団",
  description: "裏キック団（The Back Kick Gang）について",
};

export default function AboutPage() {
  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <p className="text-xs font-bold tracking-[0.3em] text-[var(--accent-kick)]">
        ABOUT
      </p>
      <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
        The Back Kick Gang
      </h1>
      <p className="mt-1 text-xl font-bold tracking-tight text-foreground/85">
        裏キック団
      </p>

      <div className="mt-10 space-y-5 text-base leading-relaxed text-foreground/85">
        <p>
          裏キック団は、ふわっちを主に活動しているメンバーが Kick
          を盛り上げるために、全一団長が設立した配信者集団です。
        </p>
        <p>
          メンバーはそれぞれの配信スタイルで Kick
          シーンに参加しながら、レイドパス文化を通じてお互いを応援し合っています。
        </p>
        <p>
          このサイトでは、メンバーの配信状況がリアルタイムで反映されます。配信中のメンバーには
          <span className="ml-1 mr-1 font-bold text-[var(--accent-pink)]">LIVE</span>
          バッジが表示され、クリックすると配信ページへ直接移動できます。
        </p>
      </div>

      <div className="mt-12 border-t border-border/60 pt-6 text-xs tracking-widest text-muted-foreground/70">
        詳細プロフィール・グループ紹介は順次追記予定
      </div>
    </section>
  );
}
