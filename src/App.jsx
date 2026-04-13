import { BrowserRouter, Routes, Route } from "react-router-dom";
import Easy from "./pages/Easy";
import Medium from "./pages/Medium";
import Hard from "./pages/Hard";
import View from "./pages/View";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/easy" element={<Easy />} />
        <Route path="/medium" element={<Medium />} />
        <Route path="/hard" element={<Hard />} />
        <Route path="/view" element={<View />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;