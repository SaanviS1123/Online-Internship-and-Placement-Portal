import { Link, useNavigate } from "react-router-dom";
import { useSession } from "../session";

export default function Layout({ children }) {
  const navigate = useNavigate();
  const { session, signOut } = useSession();
  const role = session?.user.role;

  function logout() {
    signOut();
    navigate("/login");
  }

  return (
    <div className="shell">
      <header className="topbar">
        <Link className="brand" to="/internships">Internship Portal</Link>
        {session && (
          <nav className="nav" aria-label="Main navigation">
            <Link to="/internships">Internships</Link>
            {role === "student" && (
              <>
                <Link to="/applications">My applications</Link>
                <Link to="/preparation/tests">Aptitude tests</Link>
                <Link to="/preparation/resources">Resources</Link>
                <Link to="/preparation/results">Results</Link>
              </>
            )}
            {role === "recruiter" && (
              <>
                <Link to="/manage">My listings</Link>
                <Link to="/reviews">Applications</Link>
              </>
            )}
            {role === "admin" && <Link to="/admin">Administration</Link>}
            <button type="button" onClick={logout}>Log out</button>
          </nav>
        )}
      </header>
      <main className="page">{children}</main>
    </div>
  );
}
