// File: src/app/page.tsx or src/app/home/page.tsx

import Link from "next/link";
import LatestJobs from "@/components/LatestJobs";

const homeCategories = [
  { name: "Result", path: "/result" },
  { name: "Admit Card", path: "/admit-card" },
  { name: "Answer Key", path: "/answer-key" },
  { name: "Admission", path: "/admission" },
  { name: "Documents", path: "/documents" },
];

const Home = () => {
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
        <LatestJobs />
      </section>
    </div>
  );
};

export default Home;
