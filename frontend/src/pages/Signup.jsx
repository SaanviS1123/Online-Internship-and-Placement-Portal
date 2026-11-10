
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";

export default function Signup() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setPending(true);

    try {
      await api("/api/auth/register", {
        method: "POST",
        body: { fullName, email, password },
      });

      setSuccess("Registration successful! You can now sign in.");
      setFullName("");
      setEmail("");
      setPassword("");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="card login stack" onSubmit={onSubmit}>
      <div>
        <h1>Create account</h1>
        <p className="lede">
          Register as a student to explore internships and prepare for placements.
        </p>
      </div>

      {error && <div className="banner error">{error}</div>}
      {success && <div className="banner">{success}</div>}

      <label>
        Full Name
        <input
          type="text"
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          maxLength={100}
          required
        />
      </label>

      <label>
        Email
        <input
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </label>

      <label>
        Password
        <input
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          minLength={8}
          maxLength={72}
          required
        />
      </label>

      <button type="submit" disabled={pending}>
        {pending ? "Creating account…" : "Create account"}
      </button>

      <p>
        Already have an account? <Link to="/login">Sign in</Link>
      </p>
    </form>
  );
}
