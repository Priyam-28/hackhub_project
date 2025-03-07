"use client"; // Make sure this is a Client Component

import React from "react";

export default function Overlay({ show = false }) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
      {/* Spinner */}
      <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
