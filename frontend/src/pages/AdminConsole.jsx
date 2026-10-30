import { useEffect, useState } from "react";
import { api } from "../api";
import { useSession } from "../session";

const emptyResource = {
  slug: "",
  category: "",
  title: "",
  description: "",
  url: "",
  is_available: true,
  sort_order: 0,
};

export default function AdminConsole() {
  const { session } = useSession();
  const [section, setSection] = useState("users");
  const [users, setUsers] = useState([]);
  const [internships, setInternships] = useState([]);
  const [resources, setResources] = useState([]);
  const [resource, setResource] = useState(emptyResource);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function loadAll() {
    setLoading(true);
    setError("");
    try {
      const [userData, internshipData, resourceData] = await Promise.all([
        api("/api/admin/users"),
        api("/api/admin/internships"),
        api("/api/admin/resources"),
      ]);
      setUsers(userData.users || []);
      setInternships(internshipData.internships || []);
      setResources(resourceData.resources || []);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadAll(); }, []);

  async function updateRole(userId, role) {
    setError("");
    setNotice("");
    try {
      const data = await api(`/api/admin/users/${userId}/role`, {
        method: "PATCH",
        body: { role },
      });
      setUsers((current) => current.map((user) => user.id === userId ? data.user : user));
      setNotice("User role updated.");
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function updateListing(listing) {
    setError("");
    setNotice("");
    try {
      const data = await api(`/api/admin/internships/${listing.id}/status`, {
        method: "PATCH",
        body: { is_active: !listing.is_active },
      });
      setInternships((current) => current.map((item) => item.id === listing.id
        ? { ...item, is_active: data.internship.is_active }
        : item));
      setNotice("Internship listing status saved.");
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  function editResource(item) {
    setEditingId(item.id);
    setResource({
      slug: item.slug,
      category: item.category,
      title: item.title,
      description: item.description,
      url: item.url || "",
      is_available: item.is_available,
      sort_order: item.sort_order,
    });
    setSection("resources");
  }

  function resetResourceForm() {
    setEditingId(null);
    setResource(emptyResource);
  }

  async function saveResource(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const data = await api(
        editingId ? `/api/admin/resources/${editingId}` : "/api/admin/resources",
        { method: editingId ? "PUT" : "POST", body: resource }
      );
      if (editingId) {
        setResources((current) => current.map((item) => item.id === editingId ? data.resource : item));
        setNotice("Preparation resource updated.");
      } else {
        setResources((current) => [...current, data.resource].sort((a, b) => a.sort_order - b.sort_order));
        setNotice("Preparation resource created.");
      }
      resetResourceForm();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="stack preparation-page">
      <div><p className="meta">PORTAL CONTROL</p><h1>Administration</h1><p className="lede">Manage account roles, internship listing availability and preparation resources.</p></div>
      {error && <p className="banner error" role="alert">{error}</p>}
      {notice && <p className="banner" role="status">{notice}</p>}
      <div className="actions admin-tabs" role="tablist" aria-label="Administration sections">
        <button className={section === "users" ? "" : "quiet"} role="tab" aria-selected={section === "users"} onClick={() => setSection("users")}>Users ({users.length})</button>
        <button className={section === "internships" ? "" : "quiet"} role="tab" aria-selected={section === "internships"} onClick={() => setSection("internships")}>Internships ({internships.length})</button>
        <button className={section === "resources" ? "" : "quiet"} role="tab" aria-selected={section === "resources"} onClick={() => setSection("resources")}>Resources ({resources.length})</button>
        <button className="quiet" onClick={loadAll}>Refresh</button>
      </div>
      {loading ? <p>Loading administration data…</p> : null}

      {!loading && section === "users" && (
        <div className="grid stack">
          {users.map((user) => (
            <article className="panel admin-row" key={user.id}>
              <div><strong>{user.full_name}</strong><p className="meta">{user.email} · User #{user.id}</p></div>
              <label className="admin-role">Role
                <select value={user.role} disabled={Number(user.id) === Number(session?.user.id)} onChange={(event) => updateRole(user.id, event.target.value)}>
                  <option value="student">Student</option>
                  <option value="recruiter">Recruiter</option>
                  <option value="admin">Admin</option>
                </select>
              </label>
            </article>
          ))}
          {users.length === 0 && <p className="meta">No user records found.</p>}
        </div>
      )}

      {!loading && section === "internships" && (
        <div className="grid stack">
          {internships.map((listing) => (
            <article className="panel admin-row" key={listing.id}>
              <div><strong>{listing.title}</strong><p className="meta">{listing.organisation} · {listing.location} · Recruiter: {listing.recruiter_name}</p></div>
              <div className="admin-actions"><span className={`pill ${listing.is_active ? "available" : "closed"}`}>{listing.is_active ? "Active" : "Inactive"}</span><button className="quiet" onClick={() => updateListing(listing)}>{listing.is_active ? "Deactivate" : "Activate"}</button></div>
            </article>
          ))}
          {internships.length === 0 && <p className="meta">No internship listings found.</p>}
        </div>
      )}

      {!loading && section === "resources" && (
        <div className="admin-resource-layout">
          <div className="grid stack">
            {resources.map((item) => (
              <article className="panel admin-row" key={item.id}>
                <div><strong>{item.title}</strong><p className="meta">{item.category} · {item.slug}</p></div>
                <div className="admin-actions"><span className={`pill ${item.is_available ? "available" : "closed"}`}>{item.is_available ? "Available" : "Unavailable"}</span><button className="quiet" onClick={() => editResource(item)}>Edit</button></div>
              </article>
            ))}
            {resources.length === 0 && <p className="meta">No preparation resources found.</p>}
          </div>
          <form className="panel admin-resource-form" onSubmit={saveResource}>
            <div className="row"><h2>{editingId ? "Edit resource" : "Add resource"}</h2>{editingId && <button type="button" className="quiet" onClick={resetResourceForm}>New</button>}</div>
            <label>Slug<input required maxLength="100" value={resource.slug} onChange={(event) => setResource({ ...resource, slug: event.target.value })} placeholder="quantitative-practice" /></label>
            <label>Category<input required maxLength="100" value={resource.category} onChange={(event) => setResource({ ...resource, category: event.target.value })} /></label>
            <label>Title<input required maxLength="180" value={resource.title} onChange={(event) => setResource({ ...resource, title: event.target.value })} /></label>
            <label>Description<textarea required maxLength="5000" value={resource.description} onChange={(event) => setResource({ ...resource, description: event.target.value })} /></label>
            <label>Resource URL<input type="url" maxLength="2048" value={resource.url} onChange={(event) => setResource({ ...resource, url: event.target.value })} placeholder="https://example.com/resource" /></label>
            <label>Display order<input type="number" min="0" max="10000" value={resource.sort_order} onChange={(event) => setResource({ ...resource, sort_order: Number(event.target.value) })} /></label>
            <label className="progress-checkbox"><input type="checkbox" checked={resource.is_available} onChange={(event) => setResource({ ...resource, is_available: event.target.checked })} /> Available to students</label>
            <button disabled={saving}>{saving ? "Saving…" : editingId ? "Save changes" : "Create resource"}</button>
          </form>
        </div>
      )}
      <p className="meta">Signed in as administrator. Every management action is checked by the API, not only by this page.</p>
    </section>
  );
}
