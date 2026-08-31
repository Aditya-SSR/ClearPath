"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useApi } from "@/lib/api";

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

  if (loading) return <main style={{ padding: "2rem" }}><p>Loading your roadmap…</p></main>;

  if (error) {
    return (
      <main style={{ padding: "2rem" }}>
        <p style={{ color: "crimson" }}>{error}</p>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: "2rem" }}>
      <h1 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>Your Compliance Roadmap</h1>

      <h2>Required documents ({result.requiredDocuments.length})</h2>
      {result.requiredDocuments.length === 0 && <p>No specific documents matched your profile.</p>}
      <ul>
        {result.requiredDocuments.map((doc) => (
          <li key={doc.id} style={{ marginBottom: "0.75rem" }}>
            <strong>{doc.name}</strong>
            {doc.description && <div style={{ color: "gray" }}>{doc.description}</div>}
          </li>
        ))}
      </ul>

      <h2 style={{ marginTop: "2rem" }}>Eligible schemes ({result.eligibleSchemes.length})</h2>
      {result.eligibleSchemes.length === 0 && <p>No schemes matched your profile.</p>}
      <ul>
        {result.eligibleSchemes.map((scheme) => (
          <li key={scheme.id} style={{ marginBottom: "0.75rem" }}>
            <strong>{scheme.name}</strong>
            {scheme.benefits && <div>{scheme.benefits}</div>}
            {scheme.officialLink && (
              <a href={scheme.officialLink} target="_blank" rel="noreferrer">
                Official link
              </a>
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}