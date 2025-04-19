"use client";

import React, { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import axios from "axios";

const RedirectContent = () => {
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("url");
  const type = searchParams.get("type"); // automation or story
  const id = searchParams.get("id"); // automation or story ID

  useEffect(() => {
    const handleRedirect = async () => {
      if (!redirectUrl) return;
      
      // If we have a type and ID, increment the redirect count
      if (type && id) {
        try {
          // Increment redirect count based on type
          await axios.post('/api/increment-redirect', {
            type,
            id
          });
          console.log(`Incremented redirect count for ${type} ID: ${id}`);
        } catch (error) {
          console.error('Error incrementing redirect count:', error);
        }
      }
      
      // Redirect to the destination URL
      window.location.href = decodeURIComponent(redirectUrl);
    };
    
    handleRedirect();
  }, [redirectUrl, type, id]);

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
