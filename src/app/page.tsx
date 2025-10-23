"use client";

import Link from "next/link";
import { useState } from "react";
// Import your LatestJobs component correctly
import LatestJobs from "@/components/LatestJobs";

const homeCategories = [
  { name: "Result", path: "/result" },
  { name: "Admit Card", path: "/admit-card" },
  { name: "Answer Key", path: "/answer-key" },
  { name: "Admission", path: "/admission" },
  { name: "Documents", path: "/documents" },
];

const faqs = [
  {
    question: "What kind of jobs are listed on Finderight?",
    answer:
      "Finderight provides information on various government job opportunities across India, including central and state-level recruitments such as UPSC, SSC, Railway, Defence, Banking, Teaching, and PSU vacancies. Please note that Finderight is an independent platform and does not guarantee job offers.",
  },
  {
    question: "Is Finderight free to use?",
    answer:
      "Yes, Finderight is completely free for all users. You can access job listings, results, admit cards, and answer keys without any subscription or hidden charges. However, we do not take responsibility for third-party links or content.",
  },
  {
    question: "How can I get job alerts?",
    answer:
      "You can sign up for our free email newsletter to receive the latest Sarkari job notifications directly in your inbox. We respect your privacy—your data is securely handled and will never be shared with third parties without your consent.",
  },
];

const Home = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-12 relative">
      {/* 🔹 Hero Section */}
      <section className="text-center py-14 px-4 bg-gradient-to-r from-blue-700 to-indigo-800 text-white rounded-xl shadow-lg">
        <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-4">
          Find Your Dream Sarkari Job
        </h1>
        <p className="text-lg md:text-xl text-white/90">
          Get the latest updates on government jobs, results, admit cards, and more.
        </p>
      </section>

      {/* 🔹 Navigation Categories */}
      <nav
        aria-label="Home category navigation"
        className="flex flex-wrap justify-center gap-4 mt-10"
      >
        {homeCategories.map((cat) => (
          <Link
            key={cat.path}
            href={cat.path}
            className="px-6 py-2 text-sm md:text-base rounded-full border border-gray-300 bg-white hover:bg-blue-50 hover:text-blue-700 font-medium shadow-sm transition"
          >
            {cat.name}
          </Link>
        ))}
      </nav>

      {/* 🔹 Latest Jobs Component */}
      <section className="mt-12">
        {/* Replace this with your actual LatestJobs component */}
        <LatestJobs />
      </section>

      {/* 🔹 About Section */}
      <section className="mt-20 bg-gray-50 p-8 rounded-xl shadow-sm">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-6">
          About Finderight
        </h2>
        <p className="text-gray-700 text-lg leading-relaxed text-center max-w-3xl mx-auto">
          Finderight is your one-stop destination for all the latest government job
          updates, results, admit cards, and admission information in India. We aim
          to simplify your Sarkari job search by providing accurate, timely, and
          verified notifications — all in one place.
        </p>

        <div className="grid md:grid-cols-3 gap-8 mt-10 text-center">
          <div className="p-6 bg-white rounded-xl shadow hover:shadow-md transition">
            <h3 className="text-xl font-semibold text-blue-700 mb-2">
              Latest Jobs
            </h3>
            <p className="text-gray-600">
              Get real-time job alerts for SSC, UPSC, Railway, Banking, Defence,
              and State-level exams.
            </p>
          </div>
          <div className="p-6 bg-white rounded-xl shadow hover:shadow-md transition">
            <h3 className="text-xl font-semibold text-blue-700 mb-2">
              Admit Cards
            </h3>
            <p className="text-gray-600">
              Download your admit cards easily and prepare for your exams without
              missing deadlines.
            </p>
          </div>
          <div className="p-6 bg-white rounded-xl shadow hover:shadow-md transition">
            <h3 className="text-xl font-semibold text-blue-700 mb-2">
              Results
            </h3>
            <p className="text-gray-600">
              Check your exam results, answer keys, and cut-off marks quickly and
              accurately.
            </p>
          </div>
        </div>
      </section>

      {/* 🔹 FAQ Section */}
      <section className="mt-20">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-10">
          FAQ - Finderight
        </h2>

        <div className="max-w-4xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden transition-all"
            >
              <button
                onClick={() => toggleFAQ(index)}
                aria-expanded={openIndex === index}
                className="w-full flex justify-between items-center px-6 py-4 text-left focus:outline-none hover:bg-blue-50"
              >
                <span className="font-semibold text-gray-900 text-lg">
                  {faq.question}
                </span>
                <span
                  className={`text-blue-600 text-2xl transform transition-transform duration-300 ${openIndex === index ? "rotate-45" : ""
                    }`}
                >
                  +
                </span>
              </button>

              <div
                className={`px-6 transition-all duration-300 overflow-hidden ${openIndex === index ? "max-h-48 py-4" : "max-h-0"
                  }`}
              >
                <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
