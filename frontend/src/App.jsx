import { Navigate, Route, Routes } from 'react-router-dom'
import Homepage from "./pages/Homepage.jsx";
import SettingsPage from "./pages/SettingsPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import SignUpPage from "./pages/SignUpPage.jsx";
import Navbar from "./components/Navbar.jsx"
import { useEffect } from 'react';
import { useAuthStore } from './store/useAuthStore.js';
import { useThemeStore } from './store/useThemeStore.js';
import {Loader} from "lucide-react";
import {Toaster} from "react-hot-toast";


const App = () => {
  const {authUser, checkAuth, isCheckingAuth} = useAuthStore();
  const {theme} = useThemeStore();

  useEffect(()=>{
    checkAuth();
  },[checkAuth]);

  if(isCheckingAuth && !authUser){
    return (
      <div className='flex items-center justify-center h-screen'>
        <Loader className="size-10 animate-spin"/>
      </div>
    )
  }
  return (
    <div data-theme={theme} className="min-h-screen w-full">
      <Navbar/>
        <Routes>
          <Route path="/" element={authUser?<Homepage/>:<Navigate to={"/login"}/>}/>
          <Route path="/signup" element={!authUser?<SignUpPage/>:<Navigate to={"/"}/>}/>
          <Route path="/login" element={!authUser?<LoginPage/>:<Navigate to={"/"}/>}/>
          <Route path="/settings" element={<SettingsPage/>}/>
          <Route path="/profile" element={authUser?<ProfilePage/>:<Navigate to={"/login"}/>}/>
        </Routes>
      <Toaster/>
    </div>
    )
}

export default App