import React from "react";

const AboutUs = () => {
    return (
        <div className="max-w-4xl mx-auto px-6 py-16 text-gray-800">
            <h1 className="text-3xl font-bold text-blue-700 mb-6">🧾 About Us</h1>

            <p className="mb-4">
                <strong>Welcome to Finderight – Your Trusted Sarkari Job Guide</strong>
            </p>

            <p className="mb-4">
                At Finderight, we are dedicated to bringing you the latest updates on government job recruitments, exam results, admit cards, answer keys, and more. Our mission is to simplify the search for Sarkari (government) job opportunities by presenting authentic and timely information in one place.
            </p>

            <p className="mb-4">
                We are not a government website, but we aim to bridge the information gap by referring to reliable official sources and ensuring transparency. Whether you’re preparing for SSC, UPSC, Railway, Banking, Police, Teaching, or State-level exams, Finderight helps you stay ahead with organized job alerts and updates.
            </p>

            <h2 className="text-2xl font-semibold text-gray-700 mb-2">Why Trust Finderight?</h2>
            <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Up-to-date job listings and results</li>
                <li>Easy navigation by category (Admit Cards, Results, Admissions, etc.)</li>
                <li>Reference links to official government websites</li>
                <li>User-friendly interface for fast browsing</li>
            </ul>

            <p className="italic text-sm text-red-600">
                Note: All the information on this site is for informational purposes. Kindly verify all updates from official sources before taking any action.
            </p>
        </div>
    );
};

export default AboutUs;
