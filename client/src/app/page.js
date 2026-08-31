import Link from "next/link";
import { Show, SignInButton, SignUpButton } from "@clerk/nextjs";

/* Hallmark · macrostructure: stat-led */
const STATS = [
  { value: "26", label: "Questions, two phases" },
  { value: "16", label: "Document types" },
  { value: "09", label: "Government schemes" },
  { value: "04", label: "Industries covered" },
];

const STEPS = [
  {
    title: "Answer a short questionnaire",
    body: "Tell us your industry, size, and location. Phase A is the same for every business; Phase B adapts to your industry.",
  },
  {
    title: "We build your business profile",
    body: "Your answers are normalized against MSME thresholds and Indian regulatory rules — no forms, no paper trails.",
  },
  {
    title: "Get your personalized roadmap",
    body: "A matched list of the documents and licenses you need, plus the government schemes your business is eligible for.",
  },
];

const INDUSTRIES = [
  { index: "01", name: "Food Processing", tagline: "FSSAI, pollution NOC, and food-manufacturing licences" },
  { index: "02", name: "Textile / Garment", tagline: "Factory licence, dyeing consents, and tech-upgradation schemes" },
  { index: "03", name: "Handicrafts & Handloom", tagline: "Artisan identity, GI certificates, and artisan schemes" },
  { index: "04", name: "IT / Software Services", tagline: "Startup India, STPI benefits, and export clearances" },
];

function Footer() {
  return (
    <footer className="wrap mt-24 border-t hairline py-8">
      <p className="mono-tag flex flex-wrap items-center gap-x-3 gap-y-1">
        <span>© 2026 ClearPath</span>
        <span aria-hidden="true">·</span>
        <span>Built for SIH 26130</span>
        <span aria-hidden="true">·</span>
        <span>Data model driven, not hardcoded</span>
      </p>
    </footer>
  );
}
export default function Home() {
  return (
    <main>
      {/* Hero — title left, lede + stat panel right */}
      <section className="wrap grid items-end gap-12 pb-16 pt-14 sm:pt-20 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <p className="mono-tag">SIH 26130 · For Indian MSMEs</p>
          <h1 className="display-heading mt-5 text-[clamp(2.75rem,6vw,4.5rem)]">
            Compliance, without the guesswork.
          </h1>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-muted">
            ClearPath turns your business details into a concrete roadmap of
            the government documents, licenses, and schemes you need to
            operate in India — in minutes, not months.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Show when="signed-out">
              <SignUpButton mode="modal">
                <span className="btn btn-success">Start your roadmap →</span>
              </SignUpButton>
              <SignInButton mode="modal">
                <span className="btn btn-ghost">Sign in</span>
              </SignInButton>
            </Show>
            <Show when="signed-in">
              <Link href="/questionnaire" className="btn btn-success">
                Open your roadmap →
              </Link>
            </Show>
          </div>
        </div>

        {/* Stat panel */}
        <div className="panel p-6 sm:p-8">
          <p className="mono-tag">What the engine covers</p>
          <div className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-lg bg-line">
            {STATS.map((stat) => (
              <div key={stat.label} className="bg-surface p-5">
                <div className="font-mono text-3xl font-bold tracking-tight">
                  {stat.value}
                </div>
                <div className="mt-1.5 text-[13px] leading-snug text-muted">{stat.label}</div>
              </div>
            ))}
          </div>
          <p className="mt-5 text-[13px] leading-relaxed text-muted">
            Rules are stored as data, not code — the same engine matches
            documents and schemes from one decision tree.
          </p>
        </div>
      </section>

      {/* How it works — stepped ledger, mono indexes */}
      <section className="border-y hairline bg-surface/60">
        <div className="wrap py-14">
          <p className="mono-tag">How it works</p>
          <div className="mt-8 grid gap-0 lg:grid-cols-3 lg:gap-10">
            {STEPS.map((step, i) => (
              <article key={step.title} className="border-t border-line py-6 lg:border-t-0 lg:py-0 lg:pt-6">
                <div className="font-mono text-sm font-bold text-faint">{`0${i + 1}`}</div>
                <h2 className="font-display mt-3 text-xl font-semibold tracking-tight">{step.title}</h2>
                <p className="mt-2 max-w-[34ch] text-[15px] leading-relaxed text-muted">{step.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Industries covered — catalogue grid */}
      <section className="wrap py-14">
        <p className="mono-tag">Industries covered today</p>
        <div className="mt-8 grid gap-px overflow-hidden rounded-xl border hairline bg-line sm:grid-cols-2">
          {INDUSTRIES.map((item) => (
            <div key={item.name} className="bg-surface p-6">
              <div className="font-mono text-xs text-faint">{item.index}</div>
              <h3 className="font-display mt-2 text-lg font-semibold tracking-tight">{item.name}</h3>
              <p className="mt-1.5 text-[13px] text-muted">{item.tagline}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA strip */}
      <section className="wrap py-12">
        <div className="panel flex flex-col items-start gap-5 p-8 sm:flex-row sm:items-center sm:justify-between sm:p-10">
          <div>
            <h2 className="font-display text-2xl font-semibold tracking-tight">
              Ready to see your roadmap?
            </h2>
            <p className="mt-1 text-[15px] text-muted">
              Ten minutes of questions is all it takes.
            </p>
          </div>
          <Show when="signed-out">
            <SignUpButton mode="modal">
              <span className="btn btn-success">Start your roadmap</span>
            </SignUpButton>
          </Show>
          <Show when="signed-in">
            <Link href="/questionnaire" className="btn btn-success">
              Start your roadmap
            </Link>
          </Show>
        </div>
      </section>

      <Footer />
    </main>
  );
}
