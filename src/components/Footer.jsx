import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-100 py-4 mt-auto">
      <div className="container mx-auto px-4 text-center">
        <p className="text-xs md:text-sm text-gray-500 font-medium tracking-wide">
          Created by{' '}
          <span className="text-gray-800 font-semibold hover:text-blue-600 transition-colors cursor-pointer">
            mahialam rahat
          </span>
        </p>
      </div>
    </footer>
  );
};

export default Footer;