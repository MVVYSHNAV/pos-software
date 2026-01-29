import { BrowserRouter, Routes, Route } from "react-router-dom"
import Pos from "@/pages/Pos"
import { Toaster } from "@/components/ui/toaster"

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Pos />} />
        <Route path="/pos" element={<Pos />} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  )
}
