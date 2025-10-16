// app/disclaimer/page.tsx
import React from "react";

const Disclaimer = () => (
    <div className="max-w-4xl mx-auto px-6 py-12 text-gray-800">
        <h1 className="text-3xl font-bold text-blue-700 mb-6">Disclaimer</h1>

        <p className="mb-4">
            The content provided on <strong>Finderight</strong> is for general informational purposes only. We strive to keep all information—such as exam results, job alerts, admit cards, and educational updates—accurate and up to date. However, we do not make any warranties about the completeness, reliability, or accuracy of this information.
        </p>

        <p className="mb-4">
            Any action you take based on the information on this website is strictly at your own risk. <strong>Finderight</strong> will not be liable for any losses or damages in connection with the use of our website.
        </p>

        <p className="mb-4">
            We are <strong>not affiliated with any government body</strong> or institution. All job and exam information provided is sourced from publicly available government websites or official notifications. Users are advised to always verify details from the official government or institutional sources before acting upon them.
        </p>

        <p className="mb-4">
            This website may contain links to external websites that are not provided or maintained by us. <strong>Finderight does not guarantee the accuracy or relevance</strong> of any information on these external sites.
        </p>

        <p>
            By using this site, you acknowledge and agree to this disclaimer and the terms of use as outlined in our policies.
        </p>
    </div>
);

export default Disclaimer;
