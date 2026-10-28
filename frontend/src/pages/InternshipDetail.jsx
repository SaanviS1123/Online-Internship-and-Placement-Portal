import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api, availabilityLabel, formatDate, getSession } from "../api";

export default function InternshipDetail() {
  const { id } = useParams();
  const session = getSession();
  const isStudent = session?.user.role === "student";
  const [internship, setInternship] = useState(null);
  const [profile, setProfile] = useState(null);
  const [education, setEducation] = useState("");
  const [skills, setSkills] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [pending, setPending] = useState(false);

  async function load() {
    const result = await api(`/api/internships/${id}`);
    setInternship(result.internship);

    if (isStudent) {
      const profileResult = await api("/api/profile");
      setProfile(profileResult.profile);
      setEducation(profileResult.profile.education || "");
      setSkills(profileResult.profile.skills || "");
    }
  }

  useEffect(() => {
    let active = true;

    load()
      .catch((requestError) => {
        if (active) {
          setError(requestError.message);
        }
      });

    return () => {
      active = false;
    };
  }, [id]);

  async function saveProfile(event) {
    event.preventDefault();
    setError("");
    setPending(true);

    try {
      await api("/api/profile", {
        method: "PUT",
        body: {
          phone: profile?.phone || "",
          education,
          skills,
          resumeUrl: profile?.resume_url || "",
        },
      });
      await load();
      setNotice("Profile saved. You can apply with these details.");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setPending(false);
    }
  }

  async function apply() {
    setError("");
    setNotice("");
    setPending(true);

    try {
      const result = await api(`/api/internships/${id}/apply`, { method: "POST" });
      setNotice(result.message);
      setInternship((current) => ({ ...current, has_applied: true }));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setPending(false);
    }
  }

  if (!internship && !error) {
    return <p>Loading internship…</p>;
  }

  if (!internship) {
    return <div className="banner error">{error}</div>;
  }

  const unavailable = internship.availability !== "open";
  const needsEducation = isStudent && !profile?.education?.trim();

  return (
    <article className="stack">
      <Link to="/internships">Back to internships</Link>
      <header className="listing">
        <div className="row">
          <h1>{internship.title}</h1>
          <span className={`pill ${internship.availability}`}>
            {availabilityLabel(internship.availability)}
          </span>
        </div>
        <div className="meta">
          <span>{internship.organisation}</span>
          <span>{internship.location}</span>
          <span>{internship.eligibility}</span>
          <span>{formatDate(internship.deadline)}</span>
        </div>
        <p>{internship.description}</p>
      </header>
      {unavailable && (
        <div className="banner notice">
          This internship is {internship.availability} and is not open for applications.
        </div>
      )}
      {error && <div className="banner error">{error}</div>}
      {notice && <div className="banner success">{notice}</div>}
      {isStudent && !unavailable && (
        <section className="card stack">
          <h2>Apply with your profile</h2>
          {needsEducation ? (
            <form className="stack" onSubmit={saveProfile}>
              <p>Add your education details before applying.</p>
              <label>
                Education
                <input
                  value={education}
                  maxLength={255}
                  onChange={(event) => setEducation(event.target.value)}
                  required
                />
              </label>
              <label>
                Skills
                <input
                  value={skills}
                  maxLength={5000}
                  onChange={(event) => setSkills(event.target.value)}
                />
              </label>
              <button type="submit" disabled={pending}>
                Save profile
              </button>
            </form>
          ) : (
            <>
              <p>
                {profile?.full_name} · {profile?.email}
                <br />
                {profile?.education}
                {profile?.skills ? ` · ${profile.skills}` : ""}
              </p>
              {internship.has_applied ? (
                <div className="banner notice">
                  You have already applied for this internship.
                </div>
              ) : (
                <button type="button" onClick={apply} disabled={pending}>
                  {pending ? "Submitting…" : "Submit application"}
                </button>
              )}
            </>
          )}
        </section>
      )}
    </article>
  );
}
