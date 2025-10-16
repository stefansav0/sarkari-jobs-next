import React, { Suspense } from "react";
import VerifyOtp from "./VerifyOtp";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyOtp />
    </Suspense>
  );
}
