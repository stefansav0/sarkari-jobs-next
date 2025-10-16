import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const JobListings = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("http://127.0.0.1:5000/api/jobs")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch jobs");
        return res.json();
      })
      .then((data) => {
        setJobs(data.jobs || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching jobs:", err);
        setError("Failed to load jobs. Please try again.");
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="text-center text-gray-600">Loading jobs...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Latest Jobs</h2>

      {jobs.length === 0 ? (
        <p className="text-gray-500">No jobs available.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {jobs.map((job) => {
            const departmentSlug = job.department
              .toLowerCase()
              .replace(/\s+/g, "-"); // e.g. "Indian Army" -> "indian-army"

            return (
              <div
                key={job._id}
                className="p-4 border rounded-lg shadow-md hover:shadow-lg transition bg-white"
              >
                <Link
                  to={`/jobs/${departmentSlug}/${job.slug}`}
                  className="text-lg font-semibold text-blue-600 hover:underline block mb-1"
                >
                  {job.title}
                </Link>
                <p className="text-sm text-gray-700">
                  {job.company} — {job.location}
                </p>
                <p className="text-sm text-gray-600 mt-1">{job.department}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default JobListings;
