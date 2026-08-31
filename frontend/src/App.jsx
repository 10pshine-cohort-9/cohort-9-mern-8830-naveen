import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import NoteEditor from "./pages/NoteEditor";
import Profile from "./pages/Profile";
import ChangePassword from "./pages/ChangePassword";
import NotFound from "./pages/NotFound";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from './pages/ResetPassword';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from "./context/AuthContext";
function App() {
  return (
    <AuthProvider>
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path='/forgot-password' element={<ForgotPassword/>}/>
      <Route path="/reset-password" element={<ResetPassword/>}/>

      <Route path="/notes" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/editor" element={<ProtectedRoute><NoteEditor /></ProtectedRoute>} />
      <Route path="/editor/:id" element={<ProtectedRoute><NoteEditor/></ProtectedRoute>}/>
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/change-password" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
    </AuthProvider>
  );
}


export default App;