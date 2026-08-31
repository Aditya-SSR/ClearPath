"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useApi } from "@/lib/api";

function AnswerInput({ question, value, onChange }) {
  switch (question.inputType) {
    case "number":
      return (
        <input
          type="number"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
        />
      );

    case "boolean":
      return (
        <select
          value={value === true ? "true" : value === false ? "false" : ""}
          onChange={(e) => onChange(e.target.value === "" ? null : e.target.value === "true")}
        >
          <option value="">— select —</option>
          <option value="true">Yes</option>
          <option value="false">No</option>
        </select>
      );

    case "select":
      return (
        <select value={value ?? ""} onChange={(e) => onChange(e.target.value || null)}>
          <option value="">— select —</option>
          {(question.options || []).map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      );

    default:
      return <input type="text" value={value ?? ""} onChange={(e) => onChange(e.target.value)} />;
  }
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

  function renderQuestion(question) {
    const onChange = (value) => {
      setAnswer(question.key, value);
      if (question.key === "industry") {
        handleIndustryChange(value || "");
      }
    };

    const value = answers[question.key];

    return (
      <div key={question.key} style={{ marginBottom: "1rem" }}>
        <label style={{ display: "block", marginBottom: "0.25rem", fontWeight: 600 }}>
          {question.questionText}
        </label>
        <AnswerInput question={question} value={value} onChange={onChange} />
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

  if (loading) return <main style={{ padding: "2rem" }}><p>Loading questionnaire…</p></main>;

  return (
    <main style={{ maxWidth: 640, margin: "0 auto", padding: "2rem" }}>
      <h1 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>Business Questionnaire</h1>
      <p style={{ marginBottom: "1.5rem" }}>
        Answer the questions below to generate your personalized compliance roadmap.
      </p>

      {error && (
        <p style={{ color: "crimson", marginBottom: "1rem" }} role="alert">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit}>
        <h2>Phase A — General details</h2>
        {phaseA.map(renderQuestion)}

        <h2 style={{ marginTop: "2rem" }}>Phase B — Industry specific</h2>
        {!selectedIndustry && <p>Pick your industry above to load these questions.</p>}
        {phaseBLoading && <p>Loading industry questions…</p>}
        {!phaseBLoading && selectedIndustry && phaseB.map(renderQuestion)}

        <button
          type="submit"
          disabled={submitting || phaseBLoading || !selectedIndustry}
          style={{ marginTop: "1.5rem", padding: "0.5rem 1.25rem" }}
        >
          {submitting ? "Generating roadmap…" : "Submit & generate my roadmap"}
        </button>
      </form>
    </main>
  );
}