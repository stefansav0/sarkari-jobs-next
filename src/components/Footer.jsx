"use client";

import Link from "next/link";

const Footer = () => {
  return (
    <footer className="bg-white border-t shadow-inner py-4 text-sm text-gray-600">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 flex-wrap">
        
        {/* Navigation Links */}
        <div className="flex flex-wrap gap-6 justify-center md:justify-start text-sm font-medium">
          <Link href="/about-us" className="hover:text-blue-600 transition-colors">
            About Us
          </Link>
          <Link href="/disclaimer" className="hover:text-blue-600 transition-colors">
            Disclaimer
          </Link>
          <Link href="/privacy-policy" className="hover:text-blue-600 transition-colors">
            Privacy Policy
          </Link>
          <Link href="/terms-and-conditions" className="hover:text-blue-600 transition-colors">
            Terms & Conditions
          </Link>
          <Link href="/contact" className="hover:text-blue-600 transition-colors">
            Contact Us
          </Link>
        </div>

        {/* Copyright */}
        <div className="text-center md:text-left">
          © {new Date().getFullYear()}{" "}
          <span className="font-semibold text-gray-700">Finderight</span>. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
