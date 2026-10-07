import { Routes, Route } from "react-router";
import { Toaster } from "@/components/ui/sonner";
import Home from "./pages/Home";
import Inventory from "./pages/Inventory";
import CarDetail from "./pages/CarDetail";
import Sourced from "./pages/Sourced";
import SourcedDetail from "./pages/SourcedDetail";
import Track from "./pages/Track";
import Admin from "./pages/Admin";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/cars" element={<Inventory />} />
        <Route path="/cars/:id" element={<CarDetail />} />
        <Route path="/sourced" element={<Sourced />} />
        <Route path="/sourced/:id" element={<SourcedDetail />} />
        <Route path="/track" element={<Track />} />
        <Route path="/admin/*" element={<Admin />} />
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster position="top-center" richColors />
    </>
  );
}
