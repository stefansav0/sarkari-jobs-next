"use client";

import { useState, useEffect } from "react";

// ---------- Types ----------
interface Job {
  _id: string;
  title: string;
  department?: string;
  slug?: string;
  category?: string;
  lastDate?: string;
}

interface JobsApiResponse {
  jobs: Job[];
  currentPage: number;
  totalPages: number;
}

// ---------- Helpers ----------
const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));
const MAX_RETRIES = 3;

const Jobs = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [search, setSearch] = useState<string>("");

  useEffect(() => {
    fetchJobs(1, true);
  }, []);

  // ---------- Fetch Jobs ----------
  const fetchJobs = async (pageToFetch: number = 1, replace: boolean = false) => {
    setLoading(true);
    setError(null);

    const url = `/api/jobs?page=${pageToFetch}`;
    console.log("Fetching:", url);

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data: JobsApiResponse = await res.json();
        const newJobs = Array.isArray(data.jobs) ? data.jobs : [];

        setJobs((prev) => {
          const combined = replace ? newJobs : [...prev, ...newJobs];
          const unique = Array.from(
            new Map(combined.map((job) => [job._id, job])).values()
          );
          return unique;
        });

        setPage(data.currentPage);
        setTotalPages(data.totalPages);

        setLoading(false);
        return;
      } catch (err) {
        console.warn(`Retry ${attempt + 1} failed:`, err);
        if (attempt < MAX_RETRIES - 1) {
          await delay((attempt + 1) * 1000); // exponential backoff
        }
      }
    }

    setError("Failed to load jobs. Please try again later.");
    setLoading(false);
  };

  const filteredJobs = jobs.filter((job) => {
    const text = search.toLowerCase();

    const matchesSearch =
      job.title?.toLowerCase().includes(text) ||
      job.department?.toLowerCase().includes(text);

    const matchesCategory =
      selectedCategory === "All" ||
      job.category?.toLowerCase() === selectedCategory.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  const jobCategories = [
    "All",
    "SSC",
    "Railway",
    "Banking",
    "UPSC",
    "Defence",
    "Medical",
    "Engineering",
    "State govt",
    "Central govt",
  ];

  // ---------- UI ----------
  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
        Latest Government Jobs
      </h1>

      {/* Search */}
      <div className="mb-6 flex justify-center">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by job title or department..."
          className="w-full max-w-md p-2 border rounded shadow-sm focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Categories */}
      <div className="flex flex-wrap justify-center gap-3 mb-6">
        {jobCategories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium ${selectedCategory === cat
                ? "bg-indigo-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Jobs Table */}
      <div className="overflow-x-auto bg-white shadow rounded-lg border border-gray-200">
        {loading && page === 1 ? (
          <p className="text-center py-8">Loading jobs...</p>
        ) : error ? (
          <p className="text-center text-red-500 py-4">{error}</p>
        ) : filteredJobs.length === 0 ? (
          <p className="text-center py-4 text-gray-600">No jobs found.</p>
        ) : (
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-indigo-600 text-white">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold">
                  Job Title
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold">
                  Last Date
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {filteredJobs.map((job) => {
                const jobSlug = job.slug || job._id;

                return (
                  <tr key={job._id} className="hover:bg-indigo-50 transition">
                    <td className="px-6 py-4 text-blue-600 font-medium">
                      <a href={`/jobs/${jobSlug}`}>{job.title}</a>
                    </td>

                    <td className="px-6 py-4 capitalize">
                      {job.category || "—"}
                    </td>

                    <td className="px-6 py-4">
                      {job.lastDate
                        ? new Date(job.lastDate).toLocaleDateString("en-IN")
                        : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Load More */}
      {page < totalPages && (
        <div className="flex justify-center mt-6">
          <button
            onClick={() => fetchJobs(page + 1)}
            className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 shadow"
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
};

export default Jobs;
