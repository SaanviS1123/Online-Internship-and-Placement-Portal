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
import AdminConsole from "./pages/AdminConsole";
import {
  AptitudeTests,
  AssessmentAttempt,
  AssessmentResults,
  PreparationResources,
} from "./pages/Preparation";

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

function StudentOnly({ children }) {
  return <RequireAuth role="student">{children}</RequireAuth>;
}

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/internships"
          element={<RequireAuth><Internships /></RequireAuth>}
        />
        <Route
          path="/internships/:id"
          element={<RequireAuth><InternshipDetail /></RequireAuth>}
        />
        <Route
          path="/applications"
          element={<RequireAuth role="student"><MyApplications /></RequireAuth>}
        />
        <Route
          path="/manage"
          element={<RequireAuth role="recruiter"><ManageListings /></RequireAuth>}
        />
        <Route
          path="/manage/new"
          element={<RequireAuth role="recruiter"><ListingForm /></RequireAuth>}
        />
        <Route
          path="/manage/:id/edit"
          element={<RequireAuth role="recruiter"><ListingForm /></RequireAuth>}
        />
        <Route
          path="/reviews"
          element={<RequireAuth role="recruiter"><ReviewApplications /></RequireAuth>}
        />
        <Route path="/admin" element={<RequireAuth role="admin"><AdminConsole /></RequireAuth>} />
        <Route path="/preparation/tests" element={<StudentOnly><AptitudeTests /></StudentOnly>} />
        <Route path="/preparation/attempt/:attemptId" element={<StudentOnly><AssessmentAttempt /></StudentOnly>} />
        <Route path="/preparation/results" element={<StudentOnly><AssessmentResults /></StudentOnly>} />
        <Route path="/preparation/results/:attemptId" element={<StudentOnly><AssessmentResults /></StudentOnly>} />
        <Route path="/preparation/resources" element={<StudentOnly><PreparationResources /></StudentOnly>} />
        <Route path="*" element={<Navigate to="/internships" replace />} />
      </Routes>
    </Layout>
  );
}
