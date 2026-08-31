"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useApi } from "@/lib/api";

/* Hallmark · macrostructure: workbench */

const INDUSTRY_CARDS = [
  { slug: "food_processing", name: "Food Processing" },
  { slug: "textile_manufacturing", name: "Textile / Garment" },
  { slug: "handicrafts", name: "Handicrafts & Handloom" },
  { slug: "it_services", name: "IT / Software" },
];

// Human-readable labels for option values (values stay machine-friendly slugs)
const OPTION_LABELS = {
  new_business: "Starting new",
  already_operating: "Already operating",
  proprietorship: "Sole proprietorship",
  partnership: "Partnership firm",
  llp: "Limited Liability Partnership (LLP)",
  private_limited: "Private Limited (Pvt Ltd)",
  handloom: "Handloom",
  powerloom: "Powerloom",
  industrial: "Industrial zone",
  residential_mixed: "Residential / mixed-use",
  individual_artisan: "Individual artisan",
  registered_enterprise: "Registered enterprise",
  online: "Online",
  offline: "Offline",
  both: "Both",
  employees: "Employees",
  contractors: "Contractors",
  registered_office: "Registered office",
  remote: "Remote / no fixed office",
};

function prettyOption(value) {
  return OPTION_LABELS[value] ?? value;
}

function ChevronIcon() {
  return (
    <svg
      className="caret h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
    </div>
  );
}

function AnswerInput({ question, value, onChange }) {
  switch (question.inputType) {
    case "number":
      return (
        <input
          type="number"
          className="input"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
        />
      );

    case "boolean":
      return (
        <div className="select-wrap">
          <select
            className="input"
            value={value === true ? "true" : value === false ? "false" : ""}
            onChange={(e) => onChange(e.target.value === "" ? null : e.target.value === "true")}
          >
            <option value="">Select…</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
          <ChevronIcon />
        </div>
      );

    case "select":
      return (
        <div className="select-wrap">
          <select
            className="input"
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value || null)}
          >
            <option value="">Select…</option>
            {(question.options || []).map((option) => (
              <option key={option} value={option}>
                {prettyOption(option)}
              </option>
            ))}
          </select>
          <ChevronIcon />
        </div>
      );

    default:
      return (
        <input
          type="text"
          className="input"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Type your answer…"
        />
      );
  }
}

function IndustryPicker({ value, onChange }) {
  return (
    <div className="grid gap-2 sm:grid-cols-2" role="radiogroup" aria-label="Industry">
      {INDUSTRY_CARDS.map((card) => {
        const active = value === card.slug;
        return (
          <button
            key={card.slug}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(card.slug)}
            className={
              active
                ? "flex items-center justify-between rounded-lg border-2 border-ink bg-surface px-4 py-3 text-left"
                : "flex items-center justify-between rounded-lg border border-line-strong bg-surface px-4 py-3 text-left hover:border-ink"
            }
          >
            <span className="font-display text-[15px] font-semibold tracking-tight">{card.name}</span>
            <span
              aria-hidden="true"
              className={
                active
                  ? "flex h-5 w-5 items-center justify-center rounded-full bg-ink text-surface"
                  : "h-5 w-5 rounded-full border border-line-strong"
              }
            >
              {active && (
                <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="3">
                  <path d="m5 13 4 4L19 7" />
                </svg>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export default function QuestionnairePage() {
  const router = useRouter();
  const apiFetch = useApi();

  const [phaseA, setPhaseA] = useState([]);
  const [phaseB, setPhaseB] = useState([]);
  const [answers, setAnswers] = useState({});
  const [selectedIndustry, setSelectedIndustry] = useState("");
  const [loading, setLoading] = useState(true);
  const [phaseBLoading, setPhaseBLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch("/questionnaire/questions")
      .then((data) => setPhaseA(data.phaseA || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [apiFetch]);

  async function handleIndustryChange(slug) {
    setSelectedIndustry(slug);
    setPhaseB([]);
    setPhaseBLoading(true);

    try {
      const data = await apiFetch(`/questionnaire/questions?industry=${encodeURIComponent(slug)}`);
      setPhaseB(data.phaseB || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setPhaseBLoading(false);
    }
  }

  function setAnswer(key, value) {
    setAnswers((prev) => {
      const next = { ...prev };
      if (value === null || value === "") {
        delete next[key]; // unanswered questions are simply not sent
      } else {
        next[key] = value;
      }
      return next;
    });
  }

  function resetAll() {
    setAnswers({});
    setSelectedIndustry("");
    setPhaseB([]);
    setError("");
  }

  // Wider spans for a few Phase A fields so the form reads in rows
  function questionSpan(key, list) {
    if (list.length <= 4) return "sm:col-span-2";
    return ["businessName", "industry", "hasPhysicalPremises"].includes(key) ? "sm:col-span-2" : "";
  }

  function renderQuestion(question, list) {
    const onChange = (value) => {
      setAnswer(question.key, value);
      if (question.key === "industry") {
        handleIndustryChange(value || "");
      }
    };

    const value = answers[question.key];

    if (question.key === "industry") {
      return (
        <div key={question.key} className="sm:col-span-2">
          <Field label={question.questionText}>
            <IndustryPicker value={value} onChange={onChange} />
          </Field>
        </div>
      );
    }

    return (
      <div key={question.key} className={questionSpan(question.key, list)}>
        <Field label={question.questionText}>
          <AnswerInput question={question} value={value} onChange={onChange} />
        </Field>
      </div>
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!selectedIndustry) {
      setError("Please select your industry first.");
      return;
    }

    setSubmitting(true);

    try {
      const result = await apiFetch("/questionnaire/submit", {
        method: "POST",
        body: JSON.stringify({ industry: selectedIndustry, answers }),
      });
      router.push(`/profile/${result.outputId}`);
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main className="wrap py-16">
        <div className="skeleton h-8 w-56" />
        <div className="skeleton mt-4 h-4 w-80" />
        <div className="skeleton mt-8 h-40 w-full max-w-2xl" />
      </main>
    );
  }

  const industryName = INDUSTRY_CARDS.find((c) => c.slug === selectedIndustry)?.name;

  return (
    <main className="wrap grid items-start gap-10 py-14 lg:grid-cols-[minmax(0,1fr)_240px]">
      {/* Form column */}
      <form onSubmit={handleSubmit} noValidate>
        <p className="mono-tag">Business questionnaire</p>
        <h1 className="display-heading mt-3 text-4xl">Build your compliance profile</h1>
        <p className="mt-3 max-w-xl text-muted">
          Answer honestly — every answer is matched against the rule engine to
          decide which documents and schemes apply to your business.
        </p>

        {error && (
          <p className="error-panel mt-6" role="alert">
            {error}
          </p>
        )}

        {/* Phase A */}
        <section className="panel mt-8 p-6 sm:p-8">
          <div className="flex items-baseline gap-3">
            <span className="font-mono text-xs font-bold text-faint">01</span>
            <h2 className="font-display text-xl font-semibold tracking-tight">About your business</h2>
          </div>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            {phaseA.map((q) => renderQuestion(q, phaseA))}
          </div>
        </section>

        {/* Phase B */}
        <section className="panel mt-6 p-6 sm:p-8">
          <div className="flex items-baseline gap-3">
            <span className="font-mono text-xs font-bold text-faint">02</span>
            <h2 className="font-display text-xl font-semibold tracking-tight">Industry questions</h2>
            {industryName && (
              <span className="font-mono text-[11px] uppercase tracking-widest text-success">
                {industryName}
              </span>
            )}
          </div>

          <div className="mt-6">
            {!selectedIndustry && (
              <p className="text-[15px] text-muted">
                Choose your industry in step 01 to load its specific questions.
              </p>
            )}

            {phaseBLoading && (
              <div className="space-y-4">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="skeleton h-12 w-full" />
                ))}
              </div>
            )}

            {!phaseBLoading && selectedIndustry && (
              <div className="grid gap-5 sm:grid-cols-2">
                {phaseB.map((q) => renderQuestion(q, phaseB))}
              </div>
            )}
          </div>
        </section>

        {/* Actions — reset (danger) / submit (success) */}
        <div className="mt-8 flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={resetAll}
            className="btn btn-danger sm:self-start"
            disabled={submitting}
          >
            Clear all answers
          </button>

          <button
            type="submit"
            className="btn btn-success"
            disabled={submitting || phaseBLoading || !selectedIndustry}
          >
            {submitting ? "Generating roadmap…" : "Generate my roadmap →"}
          </button>
        </div>
      </form>

      {/* Step rail */}
      <aside className="hidden lg:block">
        <div className="panel sticky top-24 p-5">
          <p className="mono-tag">Your progress</p>
          <ol className="mt-5 space-y-5">
            <li className="flex items-start gap-3">
              <span className="font-mono text-sm font-bold text-ink">01</span>
              <div>
                <p className="text-sm font-semibold">General details</p>
                <p className="text-xs text-faint">Industry, entity, location</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span
                className={`font-mono text-sm font-bold ${selectedIndustry ? "text-ink" : "text-faint"}`}
              >
                02
              </span>
              <div>
                <p className={`text-sm font-semibold ${selectedIndustry ? "" : "text-faint"}`}>
                  Industry questions
                </p>
                <p className="text-xs text-faint">
                  {selectedIndustry ? "Ready for your answers" : "Pick an industry first"}
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="font-mono text-sm font-bold text-faint">03</span>
              <div>
                <p className="text-sm font-semibold text-faint">Your roadmap</p>
                <p className="text-xs text-faint">Documents + schemes</p>
              </div>
            </li>
          </ol>
        </div>
      </aside>
    </main>
  );
}