"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useApi } from "@/lib/api";

/* Hallmark · macrostructure: catalogue */

function RoadmapSkeleton() {
  return (
    <main className="wrap py-14">
      <div className="skeleton h-8 w-64" />
      <div className="skeleton mt-3 h-4 w-96 max-w-full" />
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {[0, 1].map((i) => (
          <div key={i} className="skeleton h-20 w-full" />
        ))}
      </div>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="skeleton h-28 w-full" />
        ))}
      </div>
    </main>
  );
}

function ArrowUpRightIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M7 17 17 7M8 7h9v9" />
    </svg>
  );
}

export default function ProfileResultPage() {
  const params = useParams();
  const apiFetch = useApi();

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!params?.id) return;

    apiFetch(`/profile/${params.id}`)
      .then(setResult)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [apiFetch, params?.id]);

  if (loading) return <RoadmapSkeleton />;

  if (error) {
    return (
      <main className="wrap max-w-2xl py-14">
        <p className="mono-tag">Roadmap</p>
        <h1 className="display-heading mt-3 text-4xl">We couldn't load that roadmap</h1>
        <p className="error-panel mt-6" role="alert">
          {error}
        </p>
        <Link href="/questionnaire" className="btn btn-primary mt-6">
          Start a new questionnaire →
        </Link>
      </main>
    );
  }

  const docs = result.requiredDocuments || [];
  const schemes = result.eligibleSchemes || [];
return (
    <main className="wrap py-14">
      {/* Header */}
      <p className="mono-tag">Your roadmap</p>
      <h1 className="display-heading mt-3 max-w-2xl text-[clamp(2rem,4vw,3rem)]">
        Compliance roadmap for your business
      </h1>
      <p className="mt-3 max-w-xl text-muted">
        Based on your answers, here are the documents you'll likely need and
        the government schemes your business may be eligible for.
      </p>

      {/* Summary strip */}
      <div className="mt-8 grid gap-px overflow-hidden rounded-xl border hairline bg-line sm:grid-cols-2">
        <div className="bg-surface p-5">
          <div className="font-mono text-3xl font-bold">{docs.length}</div>
          <div className="mt-1 text-sm text-muted">Required documents</div>
        </div>
        <div className="bg-surface p-5">
          <div className="font-mono text-3xl font-bold text-success">{schemes.length}</div>
          <div className="mt-1 text-sm text-muted">Eligible government schemes</div>
        </div>
      </div>

      {/* Documents catalogue */}
      <section className="mt-12">
        <div className="flex items-baseline gap-3">
          <span className="font-mono text-xs font-bold text-faint">01</span>
          <h2 className="font-display text-2xl font-semibold tracking-tight">Required documents</h2>
        </div>

        {docs.length === 0 && (
          <p className="mt-4 text-muted">No specific documents matched your profile.</p>
        )}

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {docs.map((doc, i) => (
            <article key={doc.id} className="panel flex flex-col p-5">
              <div className="font-mono text-xs font-bold text-faint">
                {String(i + 1).padStart(2, "0")}
              </div>
              <h3 className="font-display mt-2 text-[17px] font-semibold leading-snug tracking-tight">
                {doc.name}
              </h3>
              {doc.description && (
                <p className="mt-2 text-[13px] leading-relaxed text-muted">{doc.description}</p>
              )}
            </article>
          ))}
        </div>
      </section>

      {/* Schemes catalogue */}
      <section className="mt-14">
        <div className="flex items-baseline gap-3">
          <span className="font-mono text-xs font-bold text-faint">02</span>
          <h2 className="font-display text-2xl font-semibold tracking-tight">Eligible schemes</h2>
          <span className="font-mono text-[11px] uppercase tracking-widest text-success">
            You qualify
          </span>
        </div>

        {schemes.length === 0 && (
          <p className="mt-4 text-muted">No schemes matched your profile.</p>
        )}

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {schemes.map((scheme, i) => (
            <article key={scheme.id} className="panel flex flex-col p-5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-faint">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="rounded-full bg-success-soft px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest text-success">
                  Eligible
                </span>
              </div>
              <h3 className="font-display mt-2 text-[17px] font-semibold leading-snug tracking-tight">
                {scheme.name}
              </h3>
              {scheme.benefits && (
                <p className="mt-2 text-[13px] leading-relaxed text-muted">{scheme.benefits}</p>
              )}
              {scheme.officialLink && (
                <a
                  href={scheme.officialLink}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-auto inline-flex items-center gap-1.5 pt-4 text-[13px] font-semibold text-ink underline decoration-line-strong underline-offset-4 hover:decoration-ink"
                >
                  Official page
                  <ArrowUpRightIcon />
                </a>
              )}
            </article>
          ))}
        </div>
      </section>

      {/* Actions */}
      <div className="mt-14 flex flex-col items-start gap-3 border-t hairline pt-8 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted">
          Want to explore another scenario? Answers can change the roadmap.
        </p>
        <Link href="/questionnaire" className="btn btn-primary">
          Build another roadmap
        </Link>
      </div>
    </main>
  );
}