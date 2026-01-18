import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
// import Footer from "./Footer";  Make Footer2 and use it if a Footer is needed
import NavBar2 from "./NavBar2";

const AppLayout2 = ({ isAuthenticated, username, setIsAuthenticated, setUsername }) => {
  useEffect(function () {
    if (localStorage.getItem("dark") === null) {
      localStorage.setItem("dark", "false");
    }
  }, []);

  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("dark") === "true"
  );

  const handleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem("dark", newDarkMode ? "true" : "false");
  };

  return (
    <div className={darkMode ? "dark" : ""}>
      <main className="w-full bg-[#ffffff] dark:bg-[#181A2A]">
        <NavBar2
          darkMode={darkMode}
          handleDarkMode={handleDarkMode}
          isAuthenticated={isAuthenticated}
          username={username}
          setIsAuthenticated={setIsAuthenticated}
          setUsername={setUsername}
        />
        <ToastContainer />
        <Outlet />
        {/* <Footer /> */}
      </main>
    </div>
  );
};

export default AppLayout2;
