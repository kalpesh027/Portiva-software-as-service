import { useState, useEffect } from "react";
import { CiCloudRainbow } from "react-icons/ci";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../features/authSlice";
import { cn } from "../utils/cn";
import { I } from "../utils/icons";
import Icon from "./common/Icon";

// dark / toggleDark are optional — only passed from Landing page
const Navbar = ({ dark = false, toggleDark }) => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  const isAuthPage = ["/login", "/register", "/verify-otp", "/create"].includes(
    location.pathname,
  );

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  const navLinks = [
    "Home",
    "Features",
    "Templates",
    "Pricing",
    "Blog",
    "Contact",
  ];

  const navBg = dark ? "bg-[#080e1a]/80" : "bg-white/80";
  const borderColor = dark ? "border-slate-800/60" : "border-slate-200/80";
  const textPrimary = dark ? "text-white" : "text-slate-900";
  const navLinkClass = dark
    ? "text-slate-300 hover:text-violet-400 hover:bg-white/5"
    : "text-slate-600 hover:text-violet-600 hover:bg-violet-50";
  const mobileDrawerBg = dark ? "bg-[#080e1a]/90" : "bg-white/90";
  const iconDarkStyle = dark
    ? "border border-white/40 bg-white/10 backdrop-blur-xl shadow-[0_4px_20px_rgba(255,255,255,0.15)]"
    : "";

  return (
    <header
      style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50 }}
      className={cn(
        "transition-all duration-500",
        scrolled
          ? cn(
              "py-3 backdrop-blur-[8px] border-b",
              navBg,
              borderColor,
              "shadow-lg",
              dark ? "shadow-black/40" : "shadow-slate-200/60",
            )
          : "py-5",
      )}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between md:justify-normal">
        {/* Logo and website text hidden on login, register, and stepper pages */}
        {![
          "/login",
          "/register",
          "/verify-otp",
          "/create",
          "/stepper",
        ].includes(location.pathname) && (
          <Link to="/" className="flex items-center gap-2.5">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center border border-slate-500 bg-white shadow-[0_4px_10px_rgba(0,0,0,0.05)] transition-all duration-300 ${iconDarkStyle}`}
            >
              <CiCloudRainbow
                size={28}
                className={dark ? "text-white" : "text-slate-700"}
              />
            </div>
            <span
              className={cn("font-black text-xl tracking-tight", textPrimary)}
            >
              Portiva
            </span>
          </Link>
        )}

        {/* Desktop nav links (hidden on auth pages) */}
        {!isAuthPage && (
          <nav className="hidden md:flex items-center gap-0.5 flex-1 justify-center">
            {navLinks.map((l) => (
              <Link
                key={l}
                to={l === "Home" ? "/" : `#${l.toLowerCase()}`}
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200",
                  navLinkClass,
                )}
              >
                {l}
              </Link>
            ))}
          </nav>
        )}

        {/* Right actions */}
        <div className="flex items-center gap-3 flex-1 justify-end">
          {/* Dark toggle — shown when toggleDark prop is provided */}
          {typeof toggleDark === "function" && (
            <button
              onClick={toggleDark}
              aria-label="Toggle theme"
              className={cn(
                "relative w-14 h-7 rounded-full transition-all duration-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2",
                dark ? "bg-violet-600" : "bg-slate-300",
              )}
            >
              <span
                className={cn(
                  "absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow-md flex items-center justify-center transition-transform duration-500",
                  dark ? "translate-x-7" : "translate-x-0",
                )}
              >
                <Icon
                  d={dark ? I.moon : I.sun}
                  size={12}
                  className={dark ? "text-violet-600" : "text-amber-500"}
                />
              </span>
            </button>
          )}

          {/* Auth buttons */}
          {user ? (
            <div className="hidden md:flex items-center gap-2">
              <Link
                to="/dashboard"
                className={cn(
                  "hidden md:inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold border rounded-xl transition-all",
                  dark
                    ? "border-slate-600 text-slate-200 hover:border-violet-500 hover:text-violet-300"
                    : "border-slate-300 text-slate-700 hover:border-violet-400 hover:text-violet-600",
                )}
              >
                <Icon d={I.dashboard} size={15} />
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="hidden md:inline-flex items-center gap-2 px-5 py-2 text-sm font-bold text-white rounded-xl bg-gradient-to-r from-violet-600 to-violet-400 shadow-md shadow-violet-500/25 hover:shadow-violet-500/45 hover:-translate-y-0.5 transition-all"
              >
                <Icon d={I.logout} size={14} />
                Logout
              </button>
            </div>
          ) : (
            !isAuthPage && (
              <div className="hidden md:flex items-center gap-2">
                <Link
                  to="/login"
                  className={cn(
                    "px-4 py-2 text-sm font-semibold border rounded-xl transition-all",
                    dark
                      ? "border-slate-600 text-slate-200 hover:border-violet-500 hover:text-violet-300"
                      : "border-slate-300 text-slate-700 hover:border-violet-400 hover:text-violet-600",
                  )}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2 text-sm font-bold text-white rounded-xl bg-gradient-to-r from-violet-600 to-violet-400 shadow-md shadow-violet-500/25 hover:shadow-violet-500/45 hover:-translate-y-0.5 transition-all"
                >
                  Sign Up
                </Link>
              </div>
            )
          )}

          {/* Mobile hamburger */}
          <button
            className={cn(
              "md:hidden p-2 rounded-xl",
              dark
                ? "text-slate-300 hover:bg-white/10"
                : "text-slate-600 hover:bg-slate-100",
            )}
            onClick={() => setOpen((o) => !o)}
          >
            <Icon d={open ? I.x : I.menu} size={22} />
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <div
        className={cn(
          "md:hidden overflow-hidden transition-all duration-300",
          open ? "max-h-[500px]" : "max-h-0",
        )}
      >
        <div
          className={cn(
            "px-6 pb-5 pt-2 flex flex-col gap-1 border-t backdrop-blur-2xl",
            mobileDrawerBg,
            dark ? "border-slate-800" : "border-slate-200",
          )}
        >
          {!isAuthPage &&
            navLinks.map((l) => (
              <Link
                key={l}
                to={l === "Home" ? "/" : `#${l.toLowerCase()}`}
                onClick={() => setOpen(false)}
                className={cn(
                  "px-4 py-3 text-sm font-medium rounded-xl transition-all",
                  navLinkClass,
                )}
              >
                {l}
              </Link>
            ))}

          <div
            className="flex gap-3 pt-3 border-t mt-2"
            style={{ borderColor: dark ? "#1e293b" : "#e2e8f0" }}
          >
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex-1 text-center py-2.5 text-sm font-semibold border rounded-xl",
                    dark
                      ? "border-slate-600 text-slate-200"
                      : "border-slate-300 text-slate-700",
                  )}
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setOpen(false);
                  }}
                  className="flex-1 text-center py-2.5 text-sm font-bold text-white rounded-xl bg-gradient-to-r from-violet-600 to-violet-400"
                >
                  Logout
                </button>
              </>
            ) : (
              !isAuthPage && (
                <>
                  <Link
                    to="/login"
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex-1 text-center py-2.5 text-sm font-semibold border rounded-xl",
                      dark
                        ? "border-slate-600 text-slate-200"
                        : "border-slate-300 text-slate-700",
                    )}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setOpen(false)}
                    className="flex-1 text-center py-2.5 text-sm font-bold text-white rounded-xl bg-gradient-to-r from-violet-600 to-violet-400"
                  >
                    Sign Up
                  </Link>
                </>
              )
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
