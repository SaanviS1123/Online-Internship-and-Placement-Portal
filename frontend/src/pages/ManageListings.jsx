import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, availabilityLabel, formatDate } from "../api";

export default function ManageListings() {
  const [internships, setInternships] = useState([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    const result = await api("/api/internships/mine");
    setInternships(result.internships);
  }

  useEffect(() => {
    let active = true;

    load()
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

  async function closeListing(internship) {
    setError("");
    setNotice("");

    try {
      const result = await api(`/api/internships/${internship.id}/close`, {
        method: "PATCH",
      });
      setNotice(result.message);
      await load();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  return (
    <section className="stack">
      <div className="row">
        <h1>My listings</h1>
        <Link className="button" to="/manage/new">
          New listing
        </Link>
      </div>
      {error && <div className="banner error">{error}</div>}
      {notice && <div className="banner success">{notice}</div>}
      {loading ? (
        <p>Loading listings…</p>
      ) : internships.length === 0 ? (
        <div className="banner notice">You have not published a listing yet.</div>
      ) : (
        internships.map((internship) => (
          <article className="card" key={internship.id}>
            <div className="row">
              <h2>{internship.title}</h2>
              <span className={`pill ${internship.availability}`}>
                {availabilityLabel(internship.availability)}
              </span>
            </div>
            <div className="meta">
              <span>{internship.organisation}</span>
              <span>{internship.location}</span>
              <span>{formatDate(internship.deadline)}</span>
            </div>
            <div className="actions">
              <Link className="button quiet" to={`/manage/${internship.id}/edit`}>
                Edit
              </Link>
              {internship.availability !== "closed" && (
                <button type="button" onClick={() => closeListing(internship)}>
                  Close listing
                </button>
              )}
            </div>
          </article>
        ))
      )}
    </section>
  );
}
