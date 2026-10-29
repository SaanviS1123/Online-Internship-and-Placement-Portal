import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../api";

const EMPTY = {
  title: "",
  organisation: "",
  description: "",
  eligibility: "",
  location: "",
  deadline: "",
};

export default function ListingForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const editing = Boolean(id);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!editing) {
      return undefined;
    }

    let active = true;

    api(`/api/internships/${id}`)
      .then((result) => {
        if (!active) {
          return;
        }

        const internship = result.internship;
        setForm({
          title: internship.title,
          organisation: internship.organisation,
          description: internship.description,
          eligibility: internship.eligibility,
          location: internship.location,
          deadline: internship.deadline || "",
        });
      })
      .catch((requestError) => {
        if (active) {
          setError(requestError.message);
        }
      });

    return () => {
      active = false;
    };
  }, [editing, id]);

  function update(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function onSubmit(event) {
    event.preventDefault();
    setError("");
    setPending(true);

    try {
      await api(editing ? `/api/internships/${id}` : "/api/internships", {
        method: editing ? "PUT" : "POST",
        body: form,
      });
      navigate("/manage");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="card stack" onSubmit={onSubmit}>
      <h1>{editing ? "Edit listing" : "New listing"}</h1>
      {error && <div className="banner error">{error}</div>}
      <label>
        Title
        <input name="title" value={form.title} onChange={update} maxLength={150} required />
      </label>
      <label>
        Organisation
        <input
          name="organisation"
          value={form.organisation}
          onChange={update}
          maxLength={150}
          required
        />
      </label>
      <label>
        Description
        <textarea
          name="description"
          value={form.description}
          onChange={update}
          maxLength={4000}
          required
        />
      </label>
      <label>
        Eligibility
        <input
          name="eligibility"
          value={form.eligibility}
          onChange={update}
          maxLength={255}
          required
        />
      </label>
      <label>
        Location
        <input name="location" value={form.location} onChange={update} maxLength={120} required />
      </label>
      <label>
        Deadline
        <input name="deadline" type="date" value={form.deadline} onChange={update} />
      </label>
      <button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save listing"}
      </button>
    </form>
  );
}
