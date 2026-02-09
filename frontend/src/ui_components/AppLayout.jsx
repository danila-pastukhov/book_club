// import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
// import Footer from "./Footer";
import NavBar from "./NavBar";
import { useTheme } from "@/context/ThemeContext";

const AppLayout = () => {
  const { darkMode, toggleDarkMode } = useTheme();

  return (
    <div>
      <main className="w-full bg-[#ffffff] dark:bg-[#181A2A]">
        <NavBar
          darkMode={darkMode}
          handleDarkMode={toggleDarkMode}
        />
        <ToastContainer />
        <Outlet />
        {/* <Footer /> */}
      </main>
    </div>
  );
};

export default AppLayout;
