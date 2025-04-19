"use client";

import React, { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

const RedirectContent = () => {
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("url");

  useEffect(() => {
    if (redirectUrl) {
      window.location.href = decodeURIComponent(redirectUrl);
    }
  }, [redirectUrl]);

  if (!redirectUrl) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 rounded-lg bg-white shadow-lg">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Invalid Redirect
          </h1>
          <p className="text-gray-600">No redirect URL provided</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-8 rounded-lg bg-white shadow-lg max-w-md w-full mx-4">
        <div className="mb-6">
          <div className="text-xl font-medium text-blue-600 mb-2">
            Redirecting...
          </div>
        </div>
        <div className="space-y-4">
          <p className="text-sm text-gray-500 break-all">
            Destination: {decodeURIComponent(redirectUrl)}
          </p>
        </div>
      </div>
    </div>
  );
};

const RedirectPage = () => {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center p-8 rounded-lg bg-white shadow-lg">
            <div className="text-xl text-gray-600">Loading...</div>
          </div>
        </div>
      }
    >
      <RedirectContent />
    </Suspense>
  );
};

export default RedirectPage;
