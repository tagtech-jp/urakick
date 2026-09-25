"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export function Hero() {
  return (
    <section className="relative min-h-svh w-full overflow-hidden border-b border-border/60">
      <video
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        poster="/hero-poster.jpg"
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-55"
      >
        <source src="/hero.mp4" type="video/mp4" />
      </video>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(11,13,15,0.4) 0%, rgba(11,13,15,0.6) 55%, rgba(11,13,15,0.95) 100%)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 25% 75%, rgba(83,252,24,0.18), transparent 55%), radial-gradient(ellipse at 80% 20%, rgba(255,77,210,0.10), transparent 50%)",
        }}
      />

      <div className="relative mx-auto flex min-h-svh max-w-7xl flex-col items-start justify-end gap-5 px-5 pb-14 pt-24 sm:gap-6 sm:px-6 sm:pb-20 lg:px-8 lg:pb-28">
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="font-black leading-[1.1]"
        >
          <span className="block text-2xl tracking-tight text-kick-soft drop-shadow-[0_2px_12px_rgba(83,252,24,0.35)] sm:text-4xl md:text-5xl lg:text-6xl">
            The Back Kick Gang
          </span>
          <span className="mt-2 block text-base font-bold tracking-tight text-foreground/85 sm:text-xl lg:text-2xl">
            裏キック団
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="max-w-2xl text-sm leading-relaxed text-foreground/95 drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)] sm:text-base lg:text-lg"
        >
          ふわっちを主に活動しているメンバーが、
          <span className="text-kick font-bold">Kick</span>
          を盛り上げるために
          <br className="hidden sm:inline" />
          <span className="font-bold">全一団長</span>
          が設立した配信者集団です。
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.45 }}
          className="flex flex-wrap gap-3 pt-1"
        >
          <Link
            href="/members"
            className="rounded-md border border-[var(--accent-kick)]/70 bg-[var(--accent-kick)]/15 px-5 py-2.5 text-sm font-bold tracking-wider text-[var(--accent-kick)] transition-all hover:bg-[var(--accent-kick)]/25 sm:px-6 sm:py-3 sm:text-base"
          >
            メンバー →
          </Link>
          <Link
            href="/rules"
            className="rounded-md border border-border bg-card/80 px-5 py-2.5 text-sm font-bold tracking-wider text-foreground/90 backdrop-blur transition-all hover:border-foreground hover:text-foreground sm:px-6 sm:py-3 sm:text-base"
          >
            ルール
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
