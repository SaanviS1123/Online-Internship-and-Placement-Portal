import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import { useSession } from "./session";
import InternshipDetail from "./pages/InternshipDetail";
import Internships from "./pages/Internships";
import ListingForm from "./pages/ListingForm";
import Login from "./pages/Login";
import ManageListings from "./pages/ManageListings";
import MyApplications from "./pages/MyApplications";
import ReviewApplications from "./pages/ReviewApplications";

function RequireAuth({ role, children }) {
  const { session } = useSession();

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (role && session.user.role !== role) {
    return <Navigate to="/internships" replace />;
  }

  return children;
}

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/internships"
          element={
            <RequireAuth>
              <Internships />
            </RequireAuth>
          }
        />
        <Route
          path="/internships/:id"
          element={
            <RequireAuth>
              <InternshipDetail />
            </RequireAuth>
          }
        />
        <Route
          path="/applications"
          element={
            <RequireAuth role="student">
              <MyApplications />
            </RequireAuth>
          }
        />
        <Route
          path="/manage"
          element={
            <RequireAuth role="recruiter">
              <ManageListings />
            </RequireAuth>
          }
        />
        <Route
          path="/manage/new"
          element={
            <RequireAuth role="recruiter">
              <ListingForm />
            </RequireAuth>
          }
        />
        <Route
          path="/manage/:id/edit"
          element={
            <RequireAuth role="recruiter">
              <ListingForm />
            </RequireAuth>
          }
        />
        <Route
          path="/reviews"
          element={
            <RequireAuth role="recruiter">
              <ReviewApplications />
            </RequireAuth>
          }
        />
        <Route path="*" element={<Navigate to="/internships" replace />} />
      </Routes>
    </Layout>
  );
}
