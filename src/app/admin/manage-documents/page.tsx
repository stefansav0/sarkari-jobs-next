"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

// Define the structure of a Document
type Document = {
    _id: string;
    title: string;
    category: string;
    serviceType: string;
    description: string;
};

const AdminDocuments = () => {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchDocuments = async () => {
        try {
            const res = await fetch("/api/documents");
            const data = await res.json();
            if (res.ok) {
                setDocuments(data.documents || []);
            } else {
                throw new Error(data.message || "Failed to load documents");
            }
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("Something went wrong.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this document?");
        if (!confirmDelete) return;

        try {
            const res = await fetch(`/api/documents/${id}`, {
                method: "DELETE",
            });

            if (res.ok) {
                alert("✅ Document deleted successfully!");
                setDocuments((prev) => prev.filter((doc) => doc._id !== id));
            } else {
                alert("❌ Failed to delete document.");
            }
        } catch (err) {
            console.error(err);
            alert("❌ Error occurred while deleting.");
        }
    };

    useEffect(() => {
        fetchDocuments();
    }, []);

    return (
        <div className="max-w-5xl mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-indigo-700">Manage Documents</h1>
                <Link
                    href="/admin/add-document"
                    className="bg-green-600 text-white px-4 py-2 rounded shadow"
                >
                    ➕ Add Document
                </Link>
            </div>

            {loading ? (
                <p>Loading...</p>
            ) : error ? (
                <p className="text-red-600">{error}</p>
            ) : documents.length === 0 ? (
                <p>No documents found.</p>
            ) : (
                <div className="grid gap-4">
                    {documents.map((doc) => (
                        <div
                            key={doc._id}
                            className="p-4 border rounded shadow bg-white flex justify-between items-start"
                        >
                            <div>
                                <h2 className="text-lg font-semibold text-blue-700">{doc.title}</h2>
                                <p className="text-sm text-gray-600">
                                    {doc.category} — {doc.serviceType}
                                </p>
                                <p className="text-sm text-gray-500 mt-1">{doc.description}</p>
                            </div>
                            <div className="flex gap-2">
                                <Link
                                    href={`/admin/edit-document/${doc._id}`}
                                    className="bg-yellow-500 text-white px-3 py-1 rounded"
                                >
                                    ✏️ Edit
                                </Link>
                                <button
                                    onClick={() => handleDelete(doc._id)}
                                    className="bg-red-600 text-white px-3 py-1 rounded"
                                >
                                    🗑️ Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminDocuments;
