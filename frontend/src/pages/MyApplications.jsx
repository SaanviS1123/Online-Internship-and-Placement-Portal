import { useEffect, useState } from "react";
import { api, formatDate, statusLabel } from "../api";

export default function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    api("/api/applications")
      .then((result) => {
        if (active) {
          setApplications(result.applications);
        }
      })
      .catch((requestError) => {
        if (active) {
          setError(requestError.message);
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="stack">
      <h1>My applications</h1>
      <p className="lede">
        These are your applications only. Reopen this page to see a status a recruiter has changed.
      </p>
      {error && <div className="banner error">{error}</div>}
      {loading ? (
        <p>Loading applications…</p>
      ) : applications.length === 0 ? (
        <div className="banner notice">You have not applied for an internship yet.</div>
      ) : (
        applications.map((application) => (
          <article className="card" key={application.id}>
            <div className="row">
              <h2>{application.internship.title}</h2>
              <span className={`pill ${application.status}`}>
                {statusLabel(application.status)}
              </span>
            </div>
            <div className="meta">
              <span>{application.internship.organisation}</span>
              <span>{application.internship.location}</span>
              <span>{formatDate(application.internship.deadline)}</span>
            </div>
          </article>
        ))
      )}
    </section>
  );
}
