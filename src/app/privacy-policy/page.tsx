import React from "react";

const PrivacyPolicy = () => (
    <div className="max-w-4xl mx-auto px-6 py-12 text-gray-800">
        <h1 className="text-3xl font-bold text-blue-700 mb-6">Privacy Policy</h1>

        <p className="mb-4">
            At Finderight, we are committed to protecting your privacy and ensuring the security of any personal information you provide to us. This Privacy Policy outlines how we collect, use, disclose, and safeguard your data when you visit or interact with our website.
        </p>

        <h2 className="text-2xl font-semibold text-gray-700 mt-6 mb-2">Information We Collect</h2>
        <ul className="list-disc ml-6 mb-4 space-y-1">
            <li>Personal identification details (e.g., name, email address) provided during sign-up or contact.</li>
            <li>Technical information such as IP address, browser type, device data, and visit duration.</li>
            <li>Usage data including pages visited, search queries, and interaction patterns.</li>
        </ul>

        <h2 className="text-2xl font-semibold text-gray-700 mt-6 mb-2">How We Use Your Information</h2>
        <ul className="list-disc ml-6 mb-4 space-y-1">
            <li>To personalize your experience and improve our services.</li>
            <li>To send updates, newsletters, and job alerts (only if you opt in).</li>
            <li>To analyze user behavior and traffic for performance improvements.</li>
            <li>To respond to user inquiries or support requests.</li>
        </ul>

        <h2 className="text-2xl font-semibold text-gray-700 mt-6 mb-2">Cookies and Tracking</h2>
        <p className="mb-4">
            We use cookies and similar tracking technologies to enhance your browsing experience, manage sessions, and understand website usage. You can control cookie preferences through your browser settings.
        </p>

        <h2 className="text-2xl font-semibold text-gray-700 mt-6 mb-2">Third-Party Services</h2>
        <p className="mb-4">
            We may use trusted third-party tools (e.g., analytics providers, ad networks) that may collect limited data under their own privacy policies. We do not sell, trade, or share your personal information with unrelated third parties.
        </p>

        <h2 className="text-2xl font-semibold text-gray-700 mt-6 mb-2">Your Rights</h2>
        <ul className="list-disc ml-6 mb-4 space-y-1">
            <li>Access: You can request a copy of your stored personal data.</li>
            <li>Correction: You may update or correct your data at any time.</li>
            <li>Deletion: You can request deletion of your personal information from our system.</li>
        </ul>

        <h2 className="text-2xl font-semibold text-gray-700 mt-6 mb-2">Data Security</h2>
        <p className="mb-4">
            We take reasonable technical and organizational precautions to prevent data loss, misuse, or unauthorized access.
        </p>

        <h2 className="text-2xl font-semibold text-gray-700 mt-6 mb-2">Policy Updates</h2>
        <p className="mb-4">
            This Privacy Policy may be updated occasionally. Changes will be posted on this page with a revised effective date. We encourage you to review it periodically.
        </p>

        <p className="italic text-sm text-gray-600">
            By using our website, you consent to the terms of this Privacy Policy.
        </p>
    </div>
);

export default PrivacyPolicy;
