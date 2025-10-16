import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const SearchSection = () => {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();

      if (res.ok && data.type && data.slug) {
        navigate(`/${data.type}/${data.slug}`);
      } else {
        alert("No match found");
      }
    } catch (err) {
      console.error("Search error:", err);
      alert("Something went wrong");
    }
  };

  return (
    <div className="flex flex-col items-center p-6 bg-blue-600 text-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold">Find Your Dream Sarkari Job</h1>
      <p className="mt-2">Get the latest government job updates.</p>

      {/* 🔍 Search Input */}
      <form onSubmit={handleSearch} className="flex gap-2 mt-6 w-full max-w-md">
        <input
          type="text"
          placeholder="Search jobs, results, admit cards..."
          className="w-full px-4 py-2 rounded-lg text-black"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="submit" className="bg-white text-blue-600 font-semibold px-4 py-2 rounded-lg hover:bg-gray-200">
          Search
        </button>
      </form>

      {/* 🔘 Quick Navigation Buttons */}
      <div className="flex gap-4 mt-6 flex-wrap justify-center">
        <button
          onClick={() => navigate("/result")}
          className="bg-gray-200 text-black px-4 py-2 rounded-lg hover:bg-gray-300"
        >
          Result
        </button>
        <button
          onClick={() => navigate("/admit-card")}
          className="bg-gray-200 text-black px-4 py-2 rounded-lg hover:bg-gray-300"
        >
          Admit Card
        </button>
        <button
          onClick={() => navigate("/answer-key")}
          className="bg-gray-200 text-black px-4 py-2 rounded-lg hover:bg-gray-300"
        >
          Answer Key
        </button>
        <button
          onClick={() => navigate("/admission")}
          className="bg-gray-200 text-black px-4 py-2 rounded-lg hover:bg-gray-300"
        >
          Admission
        </button>
      </div>
    </div>
  );
};

export default SearchSection;
