import './styles/global.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {MainPage} from "@/pages/MainPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<MainPage/>} />
      </Routes>
      <ToastContainer position='bottom-right' autoClose={3000} />
    </BrowserRouter>
  );
}

export default App;
