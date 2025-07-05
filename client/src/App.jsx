import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Home from "./pages/Home";
import { ToastContainer } from 'react-toastify';


export default function App(){
  const [user, setUser] = useState(null)

  return(
    <BrowserRouter>
    <ToastContainer />
      <Routes>
        <Route path="/" element={user ? <Home user={user} /> : <Login setUser={setUser} /> }/>
      </Routes>
    </BrowserRouter>
  )
}