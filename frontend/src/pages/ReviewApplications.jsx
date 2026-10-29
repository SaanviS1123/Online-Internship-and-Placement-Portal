import { useEffect, useState } from "react";
import { api, statusLabel } from "../api";

const STATUSES = ["submitted", "under_review", "accepted", "rejected"];

export default function ReviewApplications() {
  const [applications, setApplications] = useState([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    api("/api/applications/reviews")
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

  async function updateStatus(application, status) {
    setError("");
    setNotice("");

    try {
      const result = await api(`/api/applications/${application.id}`, {
        method: "PATCH",
        body: { status },
      });
      setNotice(result.message);
      setApplications((current) =>
        current.map((item) => (item.id === application.id ? result.application : item))
      );
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  return (
    <section className="stack">
      <h1>Applications</h1>
      <p className="lede">Update the status of applications submitted to your listings.</p>
      {error && <div className="banner error">{error}</div>}
      {notice && <div className="banner success">{notice}</div>}
      {loading ? (
        <p>Loading applications…</p>
      ) : applications.length === 0 ? (
        <div className="banner notice">No one has applied to your listings yet.</div>
      ) : (
        applications.map((application) => (
          <article className="card stack" key={application.id}>
            <div className="row">
              <h2>{application.internship.title}</h2>
              <span className={`pill ${application.status}`}>
                {statusLabel(application.status)}
              </span>
            </div>
            <p>
              {application.full_name} · {application.email}
              <br />
              {application.internship.organisation}
              <br />
              {application.education}
              {application.skills ? ` · ${application.skills}` : ""}
            </p>
            <label>
              Status
              <select
                value={application.status}
                onChange={(event) => updateStatus(application, event.target.value)}
              >
                {STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {statusLabel(status)}
                  </option>
                ))}
              </select>
            </label>
          </article>
        ))
      )}
    </section>
  );
}
