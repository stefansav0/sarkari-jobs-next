"use client";

import { useEffect, useRef } from "react";

// Extend the Window interface to include adsbygoogle property
declare global {
    interface Window {
        adsbygoogle?: any[];
    }
}

export default function HomeBannerAd() {
    // 1. Add a ref to track if the ad has already been pushed
    const adLoaded = useRef(false);

    useEffect(() => {
        // 2. Only push if we haven't done it yet
        if (!adLoaded.current) {
            try {
                (window.adsbygoogle = window.adsbygoogle || []).push({});
                // 3. Mark it as loaded so it doesn't run again on strict-mode double renders
                adLoaded.current = true; 
            } catch (e: any) {
                // 4. Safely ignore the "already have ads" error, but log real errors
                if (e.message && !e.message.includes("already have ads")) {
                    console.error("Adsbygoogle push error:", e);
                }
            }
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