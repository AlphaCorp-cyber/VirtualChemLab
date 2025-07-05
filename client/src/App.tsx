import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Landing from "./pages/landing-new";
import TestScrolling from "./pages/test-scrolling";
import Lab from "./pages/lab";
import NotFound from "./pages/not-found";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/lab" element={<Lab />} />
        <Route path="/lab/:experimentId" element={<Lab />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
