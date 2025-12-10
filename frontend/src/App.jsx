import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import TaskDetail from "./pages/TaskDetail";
import ClientMyPage from "./pages/mypage/client/ClientMyPage";
import CoordinatorMyPage from "./pages/mypage/coordinator/CoordinatorMyPage";

function App() {
   return(
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<Home />} />
        <Route path="/task/:id" element={<TaskDetail />} />
        <Route path="/mypage/client" element={<ClientMyPage />} />
        <Route path="/mypage/coordinator" element={<CoordinatorMyPage />} />
      </Routes>
   )
}

export default App