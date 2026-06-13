import React from 'react';

const NavBare = () => {
  return (
    <div className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="navbar container mx-auto px-4 md:px-6 min-h-[56px] flex items-center justify-start">
        {/* Brand Logo / Title Section */}
        <div className="flex items-center gap-2 select-none">
          {/* আইকন (ঐচ্ছিক, দেখতে সুন্দর লাগে) */}
          <div className="bg-blue-600 text-white p-1.5 rounded-lg shadow-sm">
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>

          {/* মেইন টাইটেল বা ক্লায়েন্ট নেম */}
          <span className="text-lg font-bold text-gray-800 tracking-tight">
            ISP Client Management
          </span>
        </div>
      </div>
    </div>
  );
};

export default NavBare;