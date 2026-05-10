import Link from "next/link";

const stackItems = [
  ["Frontend", "Next.js App Router, React, TypeScript"],
  ["API", "Next.js Route Handler running on Vercel"],
  ["Database", "Supabase Postgres"],
  ["Data access", "@supabase/supabase-js with a server-side secret key"],
  ["Mobile client plan", "Flutter app calling the Vercel API from Swift/Kotlin"]
];

export default function AboutPage() {
  return (
    <main className="shell">
      <header className="siteHeader">
        <div className="siteHeaderInner">
          <Link className="brandMark" href="/" aria-label="Beacon API home">
            <span className="brandIcon" aria-hidden="true">
              B
            </span>
            <span>
              <strong>Beacon Data Registration Check</strong>
            </span>
          </Link>

          <nav className="topNav" aria-label="Main navigation">
            <Link href="/">Tester</Link>
            <Link className="active" href="/about">
              About
            </Link>
          </nav>
        </div>
      </header>

      <section className="workspace aboutWorkspace">
        <div className="heading">
          <p className="eyebrow">Project Overview</p>
          <h1>About This Beacon API</h1>
        </div>

        <div className="aboutGrid">
          <section className="panel aboutPanel">
            <h2>Purpose</h2>
            <p>
              This tool verifies that beacon payloads can be submitted through
              a Vercel-hosted REST API and inserted into a Supabase table.
            </p>
          </section>

          <section className="panel aboutPanel">
            <h2>Technical Stack</h2>
            <dl className="stackList">
              {stackItems.map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="panel aboutPanel widePanel">
            <h2>Request Flow</h2>
            <ol className="flowList">
              <li>Web or mobile client sends Date, UUID, Major, Minor, and Comment.</li>
              <li>The Vercel API validates the request body.</li>
              <li>The server-side Supabase client inserts the row into Postgres.</li>
              <li>The API returns the inserted record for confirmation.</li>
            </ol>
          </section>

          <section className="panel aboutPanel widePanel">
            <h2>免責事項</h2>
            <ul className="disclaimerList">
              <li>このWebアプリは個人が技術検証目的で作成・運用しているものです。商用サービスではありません。</li>
              <li>データの永続性・可用性について保証はありません。予告なくデータが削除される場合があります。</li>
              <li>本ツールの利用により生じた損害について、開発者は一切の責任を負いません。</li>
              <li>登録されたデータは検証目的でのみ使用し、第三者への提供は行いません。</li>
              <li>サーバーやデータベースは予告なく停止・変更される場合があります。</li>
            </ul>
          </section>
        </div>
      </section>

      <footer className="siteFooter">
        <div className="siteFooterInner">
          <span>&copy; 2025 tikomo software</span>
          <span>Personal verification tool</span>
        </div>
      </footer>
    </main>
  );
}
