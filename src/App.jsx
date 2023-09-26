import React from "react";
import Register from "./components/Register";
import { ToastContainer } from 'react-toastify';
function App() {
  return <><Register />
    <ToastContainer
      position="top-right"
      autoClose={5000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick={false}
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="dark"
    />
  </>;
}

export default App;
