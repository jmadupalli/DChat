import React from "react";
import { Routes, Route } from "react-router-dom";
import Register from "./components/Register";
import Chat from "./components/Chat";

function App() {
  return (
    <Routes>
      <Route exact path="/" element={<Register />} />
      <Route exact path="/chat" element={<Chat />} />
    </Routes>
  );
}

export default App;
