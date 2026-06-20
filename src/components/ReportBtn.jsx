'use client';
import React from 'react';
import { MdWarning } from 'react-icons/md';
import Swal from 'sweetalert2';

const ReportBtn = ({ client }) => {
  
  const handleReportProblem = () => {
    Swal.fire({
      title: 'Report Problem',
      input: 'textarea',
      inputLabel: `Write problem for ${client?.client_name || 'Client'}`,
      inputPlaceholder: 'Type the issue/problem here...',
      showCancelButton: true,
      confirmButtonColor: '#3B82F6', // ব্লু কালার বাটন
      cancelButtonColor: '#6B7280',
      confirmButtonText: '📋 Copy Text', // সরাসরি কপি বাটন
      cancelButtonText: 'Cancel',
      preConfirm: (problemText) => {
        if (!problemText.trim()) {
          Swal.showValidationMessage('Please write the problem description first!');
        }
        return problemText;
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const problem = result.value;
        // Serial number-কে 001, 002 এভাবে ৩ ডিজিটে ফরম্যাট করার জন্য
        const formattedSl = String(client?.sl || 0).padStart(3, '0');
        
        // 📋 প্রতিটা লাইনের মাঝে একটি করে ফাঁকা লাইন (Gap) দেওয়া হয়েছে
        const finalMessage = `ID: ${formattedSl}\n\nNumber: ${client?.mobile || 'N/A'}\n\nAddress: ${client?.address || 'N/A'}\n\nProblem: ${problem}`;

        // সরাসরি ক্লিপবোর্ডে কপি করার লজিক
        navigator.clipboard.writeText(finalMessage)
          .then(() => {
            Swal.fire({
              icon: 'success',
              title: 'Copied!',
              text: 'Report text copied to clipboard successfully.',
              timer: 1500,
              showConfirmButton: false
            });
          })
          .catch(() => {
            Swal.fire({
              icon: 'error',
              title: 'Failed to copy',
              text: 'Something went wrong while copying.'
            });
          });
      }
    });
  };

  return (
    <button 
      onClick={handleReportProblem} 
      className="btn btn-xs btn-warning text-white font-medium flex items-center gap-1"
    >
      <MdWarning size={12} /> Report
    </button>
  );
};

export default ReportBtn;