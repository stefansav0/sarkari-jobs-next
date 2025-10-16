"use client";

import Link from "next/link";
import Image from "next/image"; // 👈 Add this at the top
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { jwtDecode } from "jwt-decode"; // <-- named import
import { FaUserCircle, FaBars, FaTimes } from "react-icons/fa";

interface DecodedToken {
  exp: number;
  // add any other fields from your token here, e.g. username, email, etc.
}

const Navbar = () => {
  const [user, setUser] = useState<DecodedToken | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  const handleLogout = useCallback(() => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    window.dispatchEvent(new Event("userLoggedOut"));
    router.push("/login");
  }, [router]);

  const loadUserFromToken = useCallback(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded: DecodedToken = jwtDecode(token);
        if (decoded.exp * 1000 < Date.now()) {
          handleLogout();
        } else {
          setUser(decoded);
        }
      } catch (error) {
        console.error("Invalid token", error);
        handleLogout();
      }
    } else {
      setUser(null);
    }
  }, [handleLogout]);

  useEffect(() => {
    loadUserFromToken();

    const onUserLoggedIn = () => loadUserFromToken();
    const onUserLoggedOut = () => setUser(null);

    window.addEventListener("userLoggedIn", onUserLoggedIn);
    window.addEventListener("userLoggedOut", onUserLoggedOut);

    return () => {
      window.removeEventListener("userLoggedIn", onUserLoggedIn);
      window.removeEventListener("userLoggedOut", onUserLoggedOut);
    };
  }, [loadUserFromToken]);

  return (
    <header className="bg-white shadow sticky top-0 z-50">
      <nav className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" aria-label="Go to homepage" className="flex items-center space-x-2">
          <Image
            src="/Logo1.webp"
            alt="Finderight Logo"
            width={32}
            height={32}
            priority
          />
          <span className="text-xl font-bold text-blue-600">Finderight</span>
        </Link>

        {/* Hamburger Icon (Mobile) */}
        <div className="md:hidden">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            className="focus:outline-none"
          >
            {menuOpen ? (
              <FaTimes className="text-2xl text-gray-700" />
            ) : (
              <FaBars className="text-2xl text-gray-700" />
            )}
          </button>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-4">
          <Link href="/" className="text-gray-700 hover:text-blue-600">
            Home
          </Link>
          <Link href="/jobs" className="text-gray-700 hover:text-blue-600">
            Jobs
          </Link>
          <Link href="/study-news" className="text-gray-700 hover:text-blue-600">
            Study News
          </Link>

          {user ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                aria-label="User menu"
                aria-expanded={dropdownOpen}
                className="text-2xl text-gray-700 hover:text-blue-600 focus:outline-none"
              >
                <FaUserCircle />
              </button>

              {dropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-48 bg-white text-black rounded-md shadow-md z-50"
                  role="menu"
                  aria-label="User dropdown"
                >
                  <Link
                    href="/profile"
                    className="block px-4 py-2 hover:bg-gray-100"
                    role="menuitem"
                    onClick={() => setDropdownOpen(false)}
                  >
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100"
                    role="menuitem"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/login" className="text-gray-700 hover:text-blue-600">
                Login
              </Link>
              <Link href="/signup" className="text-gray-700 hover:text-blue-600">
                Signup
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div
            id="mobile-menu"
            className="absolute top-full left-0 w-full bg-white shadow-md flex flex-col items-start px-4 py-2 md:hidden"
            role="menu"
          >
            <Link href="/" className="py-2 text-gray-700 hover:text-blue-600" onClick={() => setMenuOpen(false)}>
              Home
            </Link>
            <Link href="/jobs" className="py-2 text-gray-700 hover:text-blue-600" onClick={() => setMenuOpen(false)}>
              Jobs
            </Link>
            <Link href="/study-news" className="py-2 text-gray-700 hover:text-blue-600" onClick={() => setMenuOpen(false)}>
              Study News
            </Link>

            {user ? (
              <>
                <Link href="/profile" className="py-2 text-gray-700 hover:text-blue-600" onClick={() => setMenuOpen(false)}>
                  Profile
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setMenuOpen(false);
                  }}
                  className="py-2 text-gray-700 hover:text-blue-600"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="py-2 text-gray-700 hover:text-blue-600" onClick={() => setMenuOpen(false)}>
                  Login
                </Link>
                <Link href="/signup" className="py-2 text-gray-700 hover:text-blue-600" onClick={() => setMenuOpen(false)}>
                  Signup
                </Link>
              </>
            )}
          </div>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
