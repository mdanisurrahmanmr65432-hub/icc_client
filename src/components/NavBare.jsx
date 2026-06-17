'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MdHandshake, MdCheckCircle, MdHome } from 'react-icons/md';

const NavBare = () => {
  const pathname = usePathname();

  // একটি রিইউজেবল লিংক কম্পোনেন্ট একটিভ স্টেট সহ
  const NavLinks = () => {
    const links = [
      { name: 'Home', href: '/', icon: <MdHome size={18} /> },
      { name: 'Promise Users', href: '/promise-date', icon: <MdHandshake size={18} /> },
      { name: 'Paid Users', href: '/paid-users', icon: <MdCheckCircle size={18} /> },
    ];

    return (
      <>
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-600 font-semibold'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                {link.icon}
                {link.name}
              </Link>
            </li>
          );
        })}
      </>
    );
  };

  return (
    <div className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="navbar container mx-auto px-4 md:px-6 min-h-[56px] flex items-center justify-between">
        
        {/* Left Side: Menu Icon & Brand Logo */}
        <div className="flex items-center gap-2">
          {/* 📱 মোবাইল ড্রপডাউন মেনু (DaisyUI এর ক্লাসের ওপর ভিত্তি করে) */}
          <div className="dropdown md:hidden">
            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle text-gray-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h7"
                />
              </svg>
            </div>
            <ul
              tabIndex={0}
              className="dropdown-content menu menu-sm z-[1] mt-3 w-52 p-2 shadow bg-white border border-gray-100 rounded-xl gap-1"
            >
              <NavLinks />
            </ul>
          </div>

          {/* Brand Logo Section */}
          <Link href="/" className="flex items-center gap-2 select-none hover:opacity-90 transition-opacity">
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
            <span className="text-base md:text-lg font-bold text-gray-800 tracking-tight whitespace-nowrap">
              ISP Client Management
            </span>
          </Link>
        </div>

        {/* 💻 ডেক্সটপ নেভিগেশন মেনু (মাঝারি ও বড় স্ক্রিনের জন্য) */}
        <div className="hidden md:flex">
          <ul className="menu menu-horizontal px-1 gap-2">
            <NavLinks />
          </ul>
        </div>

      </div>
    </div>
  );
};

export default NavBare;