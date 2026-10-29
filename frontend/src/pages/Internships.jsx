import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api, formatDate } from "../api";

const FILTERS = [
  ["q", "Keyword"],
  ["location", "Location"],
  ["organisation", "Organisation"],
  ["eligibility", "Eligibility"],
];

export default function Internships() {
  const [params, setParams] = useSearchParams();
  const [draft, setDraft] = useState({
    q: params.get("q") || "",
    location: params.get("location") || "",
    organisation: params.get("organisation") || "",
    eligibility: params.get("eligibility") || "",
  });
  const [internships, setInternships] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const hasFilters = FILTERS.some(([key]) => params.get(key));

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setError("");

      try {
        const query = params.toString();
        const result = await api(`/api/internships${query ? `?${query}` : ""}`);
        if (active) {
          setInternships(result.internships);
        }
      } catch (requestError) {
        if (active) {
          setError(requestError.message);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [params]);

  function search(event) {
    event.preventDefault();
    const next = {};

    for (const [key] of FILTERS) {
      if (draft[key].trim()) {
        next[key] = draft[key].trim();
      }
    }

    setParams(next);
  }

  function clearFilters() {
    setDraft({ q: "", location: "", organisation: "", eligibility: "" });
    setParams({});
  }

  return (
    <section>
      <h1>Internships</h1>
      <p className="lede">
        Open listings that are still accepting applications. Closed and expired listings stay out of this list.
      </p>
      <form className="filters" onSubmit={search}>
        {FILTERS.map(([key, label]) => (
          <label key={key}>
            {label}
            <input
              value={draft[key]}
              maxLength={80}
              onChange={(event) =>
                setDraft((current) => ({ ...current, [key]: event.target.value }))
              }
            />
          </label>
        ))}
        <button type="submit">Search</button>
        <button className="quiet" type="button" onClick={clearFilters}>
          Clear
        </button>
      </form>
      {error && <div className="banner error">{error}</div>}
      {loading ? (
        <p>Loading internships…</p>
      ) : internships.length === 0 ? (
        <div className="banner notice">
          {hasFilters
            ? "No internships match your search."
            : "No internships are available right now."}
        </div>
      ) : (
        <div className="grid">
          {internships.map((internship) => (
            <article className="listing" key={internship.id}>
              <h2>{internship.title}</h2>
              <div className="meta">
                <span>{internship.organisation}</span>
                <span>{internship.location}</span>
                <span>{internship.eligibility}</span>
                <span>{formatDate(internship.deadline)}</span>
              </div>
              <p className="excerpt">{internship.description}</p>
              <Link className="button" to={`/internships/${internship.id}`}>
                View details
              </Link>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
