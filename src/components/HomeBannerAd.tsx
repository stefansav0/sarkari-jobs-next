"use client";

import { useEffect } from "react";

// Extend the Window interface to include adsbygoogle property
declare global {
    interface Window {
        adsbygoogle?: unknown[];
    }
}

export default function HomeBannerAd() {
    useEffect(() => {
        try {
            (window.adsbygoogle = window.adsbygoogle || []).push({} as unknown);
        } catch (e) {
            console.error("Adsbygoogle push error:", e);
        }
    }, []);

    return (
        <ins
            className="adsbygoogle"
            style={{ display: "block" }}
            data-ad-client="ca-pub-9348579900264611"
            data-ad-slot="6741664630"
            data-ad-format="auto"
            data-full-width-responsive="true"
        />
    );
}
