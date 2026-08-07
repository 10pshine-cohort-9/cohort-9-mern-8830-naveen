import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import NoteEditor from "./pages/NoteEditor";
import Profile from "./pages/Profile";
import ChangePassword from "./pages/ChangePassword";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      <Route path="/notes" element={<Dashboard />} />
      <Route path="/editor" element={<NoteEditor />} />
      <Route path="/editor/:id" element={<NoteEditor/>}/>
      <Route path="/profile" element={<Profile />} />
      <Route path="/change-password" element={<ChangePassword />} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}


export default App;