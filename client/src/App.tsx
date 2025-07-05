import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Landing from "./pages/landing-new";
import Lab from "./pages/lab";
import DemoPage from "./pages/demo";
import NotFound from "./pages/not-found";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/lab/:experimentId?" element={<Lab />} />
        <Route path="/demo" element={<DemoPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;