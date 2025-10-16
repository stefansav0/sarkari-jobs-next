'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";


const Profile = () => {
    const [user, setUser] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({ name: "", email: "" });

    const router = useRouter();

    useEffect(() => {
        if (typeof window !== "undefined") {
            const storedUser = localStorage.getItem("user");
            if (storedUser) {
                const parsedUser = JSON.parse(storedUser);
                setUser(parsedUser);
                setFormData({ name: parsedUser.name, email: parsedUser.email });
            }
        }
    }, []);

    const handleInputChange = (e) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleUpdateProfile = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.put(
                "/api/auth/update-profile",
                formData,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const updatedUser = response.data.user;
            localStorage.setItem("user", JSON.stringify(updatedUser));
            setUser(updatedUser);
            setEditMode(false);
            alert("Profile updated successfully!");
        } catch (error) {
            console.error("Update error:", error);
            alert("Failed to update profile.");
        }
    };

    const handleDeleteAccount = async () => {
        const confirmDelete = window.confirm("Are you sure you want to delete your account?");
        if (!confirmDelete) return;

        try {
            const token = localStorage.getItem("token");
            await axios.delete("/api/auth/delete-account", {
                headers: { Authorization: `Bearer ${token}` },
            });

            localStorage.removeItem("user");
            localStorage.removeItem("token");
            alert("Account deleted successfully.");
            router.push("/login"); // Replace with actual login route
        } catch (error) {
            console.error("Delete error:", error);
            alert("Failed to delete account.");
        }
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">User Profile</h1>
            {user ? (
                <div className="bg-white shadow-md p-4 rounded-lg space-y-4">
                    {editMode ? (
                        <>
                            <div>
                                <label className="block font-medium">Name:</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="w-full border rounded px-3 py-2"
                                />
                            </div>
                            <div>
                                <label className="block font-medium">Email:</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="w-full border rounded px-3 py-2"
                                />
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleUpdateProfile}
                                    className="bg-blue-600 text-white px-4 py-2 rounded"
                                >
                                    Save
                                </button>
                                <button
                                    onClick={() => setEditMode(false)}
                                    className="bg-gray-300 px-4 py-2 rounded"
                                >
                                    Cancel
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <p><strong>Name:</strong> {user.name}</p>
                            <p><strong>Email:</strong> {user.email}</p>
                            <p><strong>Role:</strong> {user.role || "User"}</p>
                            <div className="flex gap-2 mt-4">
                                <button
                                    onClick={() => setEditMode(true)}
                                    className="bg-yellow-500 text-white px-4 py-2 rounded"
                                >
                                    Edit Profile
                                </button>
                                <button
                                    onClick={handleDeleteAccount}
                                    className="bg-red-600 text-white px-4 py-2 rounded"
                                >
                                    Delete Account
                                </button>
                            </div>
                        </>
                    )}
                </div>
            ) : (
                <p className="text-red-500">No user data found. Please log in.</p>
            )}
        </div>
    );
};

export default Profile;
