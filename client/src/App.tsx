import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import WorkingLanding from "./pages/working-landing";
import Lab from "./pages/lab";
import NotFound from "./pages/not-found";
import "@fontsource/inter";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<WorkingLanding />} />
        <Route path="/lab" element={<Lab />} />
        <Route path="/lab/:experimentId" element={<Lab />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
