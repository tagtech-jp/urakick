import type { Metadata } from "next";
import Link from "next/link";
import { XIcon } from "@/components/x-icon";

export const metadata: Metadata = {
  title: "CONTACT / 裏キック団",
  description:
    "裏キック団へのお問い合わせ・コラボ依頼などはこちらから。メンバー個人へのご連絡はXのDMよりお願いします。",
};

const CHAIRMAN_X_URL = "https://x.com/zenitu1217";
const CHAIRMAN_X_HANDLE = "@zenitu1217";

export default function ContactPage() {
  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <header className="border-b border-border/60 pb-8">
        <p className="text-xs font-bold tracking-[0.3em] text-[var(--accent-kick)]">
          CONTACT
        </p>
        <h1 className="mt-2 text-4xl font-black tracking-tight sm:text-5xl">
          お問い合わせ
        </h1>
      </header>

      <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
        <article className="card-elevated flex flex-col gap-5 rounded-lg bg-card p-6 sm:p-8">
          <header>
            <p className="text-xs font-bold tracking-[0.3em] text-[var(--accent-pink)]">
              FOR FANS
            </p>
            <h2 className="mt-2 text-2xl font-black tracking-tight">
              メンバーへの連絡
            </h2>
          </header>
          <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
            メンバー個人への応援メッセージ、ファンレター、
            <br />
            その他個別のご連絡は
            <span className="mx-1 font-bold text-foreground">X の DM</span>
            よりお願いします。
          </p>
          <div className="mt-auto">
            <Link
              href="/members"
              className="inline-flex items-center gap-2 rounded-md border border-[var(--accent-kick)]/60 bg-[var(--accent-kick)]/15 px-5 py-3 text-sm font-bold tracking-wider text-[var(--accent-kick)] transition-all hover:bg-[var(--accent-kick)]/25"
            >
              メンバーから探す →
            </Link>
          </div>
        </article>

        <article className="card-elevated flex flex-col gap-5 rounded-lg bg-card p-6 sm:p-8">
          <header>
            <p className="text-xs font-bold tracking-[0.3em] text-[var(--accent-pink)]">
              FOR BUSINESS
            </p>
            <h2 className="mt-2 text-2xl font-black tracking-tight">
              裏キック団について
            </h2>
          </header>
          <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
            裏キック団全体に関するお問い合わせ、
            <br />
            案件のご相談、コラボレーションについてはこちら。
          </p>
          <div className="mt-auto">
            <a
              href={CHAIRMAN_X_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex flex-wrap items-center gap-x-3 gap-y-1 rounded-md border border-foreground/30 bg-foreground/5 px-5 py-3 text-sm font-bold tracking-wider text-foreground transition-all hover:border-foreground/60 hover:bg-foreground/10"
            >
              <XIcon size={18} />
              <span>{CHAIRMAN_X_HANDLE}</span>
              <span className="whitespace-nowrap text-xs font-normal text-muted-foreground">
                （全一 / ぜんいつ）
              </span>
            </a>
          </div>
        </article>
      </div>

      <div className="mt-12 border-t border-border/60 pt-6 text-xs tracking-widest text-muted-foreground/70">
        ※ 内容を確認後、順次ご返信いたします
      </div>
    </section>
  );
}
