"use client"

import { useState, useEffect } from "react";
// Removed react-router-dom import (Code: 2307)


// Define the Job interface based on property access in the component
interface Job {
  _id: string; // Used for key and routing
  title: string; // Used for display, search, and table
  department?: string; // Used for display and search
  slug?: string;
  category?: string; // Used for display and filtering
  lastDate?: string; // Used for display
}

// Interface for the expected API response structure
interface JobsApiResponse {
  jobs: Job[];
  currentPage: number;
  totalPages: number;
}

// Utility function for delay (used in retry logic)
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const MAX_RETRIES = 3;

const Jobs = () => {
  // Use TypeScript generics to type the state variables
  const [jobs, setJobs] = useState<Job[]>([]);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  // Ensure 'error' can explicitly hold a string or null (Fixing Code: 2345)
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [search, setSearch] = useState<string>("");

  // Initial data fetch on mount
  useEffect(() => {
    fetchJobs(1, true);
  }, []);

  const fetchJobs = async (pageToFetch: number = 1, replace: boolean = false) => {
    setLoading(true);
    setError(null);
    let lastError: unknown = null;
    const url = `api/jobs?page=${pageToFetch}`;

    // LOG THE URL FOR DEBUGGING NETWORK ERRORS
    console.log("Attempting to fetch jobs from URL:", url);

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        const res = await fetch(url);

        if (!res.ok) {
          // If response status is not 2xx, throw an error with the status
          throw new Error(`HTTP error! Status: ${res.status}`);
        }

        const data: JobsApiResponse = await res.json();

        const newJobs: Job[] = Array.isArray(data.jobs) ? data.jobs : [];

        // Explicitly type 'prev' and the return value within setJobs 
        setJobs((prev: Job[]): Job[] => {
          const allJobs: Job[] = replace ? newJobs : [...prev, ...newJobs];
          // The type for job is now correctly inferred as Job
          const unique = Array.from(new Map(allJobs.map((job) => [job._id, job])).values());
          return unique;
        });

        setPage(data.currentPage || pageToFetch);
        setTotalPages(data.totalPages || 1);

        // Success, break out of the retry loop
        setLoading(false);
        return;

      } catch (err) {
        lastError = err;
        console.warn(`Fetch attempt ${attempt + 1} failed. Retrying in ${Math.pow(2, attempt)}s...`, err);

        if (attempt < MAX_RETRIES - 1) {
          // Wait for an exponentially increasing time before retrying
          await delay(Math.pow(2, attempt) * 1000);
        }
      }
    }

    // If we reach here, all retries failed
    console.error("Network or Fetch Error after all retries:", lastError);
    setError("Failed to load jobs after multiple attempts. The API server might be down or unreachable.");
    setLoading(false);
  };

  const handleLoadMore = () => {
    if (page < totalPages) {
      fetchJobs(page + 1);
    }
  };

  const jobCategories: string[] = [
    "All", "SSC", "Railway", "Banking", "UPSC",
    "Defence", "Medical", "Engineering", "State govt", "Central govt"
  ];

  // The filteredJobs function now correctly uses the Job type
  const filteredJobs = jobs.filter((job: Job) => { // Explicitly define job as Job
    const searchTerm = search.toLowerCase();

    // Use optional chaining (?) for safe property access
    const matchesSearch =
      job.title?.toLowerCase().includes(searchTerm) ||
      job.department?.toLowerCase().includes(searchTerm);

    const matchesCategory =
      selectedCategory === "All" ||
      job.category?.toLowerCase() === selectedCategory.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">Latest Government Jobs</h1>

      {/* Search Bar */}
      <div className="mb-6 flex justify-center">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title or department..."
          className="w-full max-w-md p-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap justify-center gap-3 mb-6">
        {jobCategories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${selectedCategory === category
              ? "bg-indigo-600 text-white"
              : "bg-gray-200 hover:bg-gray-300 text-gray-700"
              }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Job Table */}
      <div className="overflow-x-auto bg-white shadow rounded-lg border border-gray-200">
        {loading && page === 1 ? (
          <p className="text-center py-8">Loading jobs...</p>
        ) : error ? (
          <p className="text-center text-red-500 py-4">{error}</p>
        ) : filteredJobs.length === 0 ? (
          <p className="text-center text-gray-600 py-4">No jobs found.</p>
        ) : (
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-indigo-600 text-white">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-semibold">Job Title</th>
                <th className="text-left px-6 py-3 text-sm font-semibold">Category</th>
                <th className="text-left px-6 py-3 text-sm font-semibold">Last Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {/* Filtered jobs are now correctly typed as Job[] */}
              {filteredJobs.map((job: Job) => {
                const departmentSlug = job.department
                  ? job.department.toLowerCase().replace(/\s+/g, "-")
                  : "unknown";
                const jobSlug = job.slug || job._id;

                return (
                  <tr key={job._id} className="hover:bg-indigo-50 transition">
                    <td className="px-6 py-4 text-blue-600 font-medium">
                      {/* Using standard <a> tag with Next.js 'href' convention */}
                      <a href={`/jobs/${departmentSlug}/${jobSlug}`}>
                        {job.title}
                      </a>
                    </td>
                    <td className="px-6 py-4 text-gray-800 capitalize">{job.category || "—"}</td>
                    <td className="px-6 py-4 text-gray-700">
                      {job.lastDate
                        ? new Date(job.lastDate).toLocaleDateString()
                        : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Load More Button */}
      {page < totalPages && (
        <div className="mt-6 flex justify-center">
          <button
            onClick={handleLoadMore}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6 py-2 rounded-md shadow-md transition"
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
};

export default Jobs;
