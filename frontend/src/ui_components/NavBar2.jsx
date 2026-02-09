import { Switch } from "@/components/ui/switch";
import { FaHamburger } from "react-icons/fa";
import ResponsiveNavBar from "./ResponsiveNavBar";
import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const NavBar2 = ({
  darkMode,
  handleDarkMode,
}) => {
  const [showNavBar, setShowNavBar] = useState(false);
  const { logout: authLogout } = useAuth();

  function logout() {
    authLogout();
  }

  return (
    <>
      <nav className="max-container padding-x py-6 flex justify-between items-center  gap-6 sticky top-0 z-10 bg-[#FFFFFF] dark:bg-[#141624]">
        <Link to="/" className="text-[#141624] text-2xl dark:text-[#FFFFFF]">
          Home
        </Link>
        <Link to="/" className="text-[#141624] text-2xl dark:text-[#FFFFFF]">
          Pages (home)
        </Link>

        <Switch onCheckedChange={handleDarkMode} checked={darkMode} />
        <FaHamburger
          className="text-2xl cursor-pointer hidden max-md:block dark:text-white"
          onClick={() => setShowNavBar((curr) => !curr)}
        />
      </nav>

      {showNavBar && (
        <ResponsiveNavBar
          logout={logout}
        />
      )}
    </>
  );
};

export default NavBar2;
