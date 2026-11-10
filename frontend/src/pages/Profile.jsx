
import { useEffect, useState } from "react";
import { api, getSession } from "../api";

const EMPTY_EDUCATION = {
  institution: "",
  qualification: "",
  field_of_study: "",
  start_year: "",
  end_year: "",
  grade: "",
  currently_studying: false,
};

async function downloadResume() {
  const session = getSession();

  const response = await fetch("/api/profile/resume", {
    headers: {
      Authorization: `Bearer ${session.token}`,
    },
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message || "Unable to download resume.");
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "resume.pdf";
  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
}

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [educationRecords, setEducationRecords] = useState([]);
  const [skillRecords, setSkillRecords] = useState([]);
  const [resume, setResume] = useState(null);

  const [educationForm, setEducationForm] = useState(EMPTY_EDUCATION);
  const [editingEducationId, setEditingEducationId] = useState(null);
  const [skillInput, setSkillInput] = useState("");
  const [resumeFile, setResumeFile] = useState(null);

  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function loadProfile() {
    const result = await api("/api/profile");

    setProfile(result.profile);
    setEducationRecords(result.educationRecords || []);
    setSkillRecords(result.skillRecords || []);
    setResume(result.resume || null);
  }

  useEffect(() => {
    let active = true;

    api("/api/profile")
      .then((result) => {
        if (!active) return;

        setProfile(result.profile);
        setEducationRecords(result.educationRecords || []);
        setSkillRecords(result.skillRecords || []);
        setResume(result.resume || null);
      })
      .catch((requestError) => {
        if (active) setError(requestError.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  function updateEducationField(event) {
    const { name, value, type, checked } = event.target;

    setEducationForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
      ...(name === "currently_studying" && checked
        ? { end_year: "" }
        : {}),
    }));
  }

  function resetEducationForm() {
    setEducationForm(EMPTY_EDUCATION);
    setEditingEducationId(null);
  }

  function editEducation(record) {
    setEducationForm({
      institution: record.institution,
      qualification: record.qualification,
      field_of_study: record.field_of_study || "",
      start_year: record.start_year || "",
      end_year: record.end_year || "",
      grade: record.grade || "",
      currently_studying: record.currently_studying,
    });

    setEditingEducationId(record.id);
    setError("");
    setNotice("");
  }

  async function saveEducation(event) {
    event.preventDefault();
    setError("");
    setNotice("");
    setPending(true);

    try {
      const payload = {
        ...educationForm,
        start_year: educationForm.start_year || null,
        end_year: educationForm.currently_studying
          ? null
          : educationForm.end_year || null,
      };

      const path = editingEducationId
        ? `/api/profile/education/${editingEducationId}`
        : "/api/profile/education";

      await api(path, {
        method: editingEducationId ? "PUT" : "POST",
        body: payload,
      });

      await loadProfile();
      resetEducationForm();

      setNotice(
        editingEducationId
          ? "Education updated successfully."
          : "Education added successfully."
      );
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setPending(false);
    }
  }

  async function deleteEducation(id) {
    if (!window.confirm("Delete this education record?")) return;

    setError("");
    setNotice("");
    setPending(true);

    try {
      await api(`/api/profile/education/${id}`, {
        method: "DELETE",
      });

      await loadProfile();
      setNotice("Education deleted successfully.");

      if (editingEducationId === id) {
        resetEducationForm();
      }
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setPending(false);
    }
  }

  async function addSkill(event) {
    event.preventDefault();
    setError("");
    setNotice("");
    setPending(true);

    try {
      await api("/api/profile/skills", {
        method: "POST",
        body: { skill: skillInput },
      });

      setSkillInput("");
      await loadProfile();
      setNotice("Skill added successfully.");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setPending(false);
    }
  }

  async function deleteSkill(id) {
    setError("");
    setNotice("");
    setPending(true);

    try {
      await api(`/api/profile/skills/${id}`, {
        method: "DELETE",
      });

      await loadProfile();
      setNotice("Skill removed successfully.");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setPending(false);
    }
  }

  async function uploadResume(event) {
    event.preventDefault();

    if (!resumeFile) {
      setError("Please select a PDF resume.");
      return;
    }

    setError("");
    setNotice("");
    setPending(true);

    try {
      const session = getSession();
      const formData = new FormData();

      formData.append("resume", resumeFile);

      const response = await fetch("/api/profile/resume", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.token}`,
        },
        body: formData,
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.message || "Resume upload failed.");
      }

      setResume(result.resume);
      setResumeFile(null);

      event.target.reset();

      setNotice(result.message);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setPending(false);
    }
  }

  async function removeResume() {
    if (!window.confirm("Delete your uploaded resume?")) return;

    setError("");
    setNotice("");
    setPending(true);

    try {
      const result = await api("/api/profile/resume", {
        method: "DELETE",
      });

      setResume(null);
      setNotice(result.message);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setPending(false);
    }
  }

  async function handleDownload() {
    setError("");
    setNotice("");

    try {
      await downloadResume();
      setNotice("Resume download started.");
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  if (loading) {
    return <p>Loading profile...</p>;
  }

  if (!profile) {
    return (
      <div className="banner error">
        {error || "Unable to load your profile."}
      </div>
    );
  }

  return (
    <article className="stack profile-page">
      <header>
        <h1>My Profile</h1>
        <p className="lede">
          Manage your personal information, education, skills, and resume.
        </p>
      </header>

      {error && <div className="banner error">{error}</div>}
      {notice && <div className="banner success">{notice}</div>}

      <section className="card stack">
        <h2>Personal Information</h2>

        <div className="profile-details">
          <p><strong>Name:</strong> {profile.full_name}</p>
          <p><strong>Email:</strong> {profile.email}</p>
          <p><strong>Phone:</strong> {profile.phone || "Not provided"}</p>
        </div>
      </section>

      <section className="card stack">
        <h2>Education</h2>

        {educationRecords.length === 0 ? (
          <p>No education records added yet.</p>
        ) : (
          <div className="stack">
            {educationRecords.map((record) => (
              <div className="profile-record" key={record.id}>
                <div>
                  <h3>{record.qualification}</h3>
                  <p>{record.institution}</p>
                  {record.field_of_study && (
                    <p>Field: {record.field_of_study}</p>
                  )}
                  <p>
                    {record.start_year || "Year not specified"} –{" "}
                    {record.currently_studying
                      ? "Present"
                      : record.end_year || "Not specified"}
                  </p>
                  {record.grade && <p>Grade: {record.grade}</p>}
                </div>

                <div className="actions">
                  <button
                    type="button"
                    className="quiet"
                    onClick={() => editEducation(record)}
                    disabled={pending}
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    className="quiet"
                    onClick={() => deleteEducation(record.id)}
                    disabled={pending}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <form className="stack" onSubmit={saveEducation}>
          <h3>
            {editingEducationId ? "Edit education" : "Add education"}
          </h3>

          <label>
            Institution
            <input
              name="institution"
              value={educationForm.institution}
              onChange={updateEducationField}
              maxLength={180}
              required
            />
          </label>

          <label>
            Qualification
            <input
              name="qualification"
              value={educationForm.qualification}
              onChange={updateEducationField}
              maxLength={120}
              placeholder="B.Tech, B.Sc, M.Tech..."
              required
            />
          </label>

          <label>
            Field of study
            <input
              name="field_of_study"
              value={educationForm.field_of_study}
              onChange={updateEducationField}
              maxLength={120}
            />
          </label>

          <div className="grid profile-year-grid">
            <label>
              Start year
              <input
                type="number"
                name="start_year"
                min="1950"
                max="2100"
                value={educationForm.start_year}
                onChange={updateEducationField}
              />
            </label>

            <label>
              End year
              <input
                type="number"
                name="end_year"
                min="1950"
                max="2100"
                value={educationForm.end_year}
                onChange={updateEducationField}
                disabled={educationForm.currently_studying}
              />
            </label>
          </div>

          <label>
            Grade / CGPA
            <input
              name="grade"
              value={educationForm.grade}
              onChange={updateEducationField}
              maxLength={50}
            />
          </label>

          <label className="profile-checkbox">
            <input
              type="checkbox"
              name="currently_studying"
              checked={educationForm.currently_studying}
              onChange={updateEducationField}
            />
            Currently studying here
          </label>

          <div className="actions">
            <button type="submit" disabled={pending}>
              {pending
                ? "Saving..."
                : editingEducationId
                  ? "Update education"
                  : "Add education"}
            </button>

            {editingEducationId && (
              <button
                type="button"
                className="quiet"
                onClick={resetEducationForm}
                disabled={pending}
              >
                Cancel edit
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="card stack">
        <h2>Skills</h2>

        {skillRecords.length === 0 ? (
          <p>No skills added yet.</p>
        ) : (
          <div className="profile-skills">
            {skillRecords.map((item) => (
              <div className="profile-skill" key={item.id}>
                <span>{item.skill}</span>
                <button
                  type="button"
                  className="quiet"
                  onClick={() => deleteSkill(item.id)}
                  disabled={pending}
                  aria-label={`Remove ${item.skill}`}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}

        <form className="stack" onSubmit={addSkill}>
          <label>
            Add a skill
            <input
              value={skillInput}
              onChange={(event) => setSkillInput(event.target.value)}
              placeholder="e.g. Python, React, SQL"
              maxLength={80}
              required
            />
          </label>

          <div className="actions">
            <button type="submit" disabled={pending}>
              Add skill
            </button>
          </div>
        </form>
      </section>

      <section className="card stack">
        <h2>Resume</h2>

        {resume ? (
          <div className="profile-record">
            <div>
              <strong>{resume.file_name}</strong>
              <p>
                {(resume.file_size / 1024).toFixed(1)} KB · Uploaded{" "}
                {new Date(resume.uploaded_at).toLocaleDateString()}
              </p>
            </div>

            <div className="actions">
              <button
                type="button"
                onClick={handleDownload}
                disabled={pending}
              >
                Download
              </button>

              <button
                type="button"
                className="quiet"
                onClick={removeResume}
                disabled={pending}
              >
                Delete
              </button>
            </div>
          </div>
        ) : (
          <p>No resume uploaded yet.</p>
        )}

        <form className="stack" onSubmit={uploadResume}>
          <label>
            {resume ? "Replace resume (PDF)" : "Upload resume (PDF)"}
            <input
              type="file"
              accept=".pdf,application/pdf"
              onChange={(event) =>
                setResumeFile(event.target.files?.[0] || null)
              }
              required
            />
          </label>

          <p className="meta">
            PDF format only. Maximum file size: 5 MB.
          </p>

          <div className="actions">
            <button type="submit" disabled={pending || !resumeFile}>
              {pending ? "Uploading..." : "Upload resume"}
            </button>
          </div>
        </form>
      </section>
    </article>
  );
}
