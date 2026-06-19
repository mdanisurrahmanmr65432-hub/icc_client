'use client';
import useAxios from '@/hook/useAxios';
import { useQuery } from '@tanstack/react-query';
import React, { useState } from 'react';
import { MdPrint, MdDownload, MdAttachMoney, MdDesktopWindows, MdLocationOn, MdPhone } from 'react-icons/md';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const UnpaidUsers = () => {
  const instance = useAxios();
  const [zoneFilter, setZoneFilter] = useState('all');

  // 📡 ব্যাকএন্ড থেকে আনপেইড/বকেয়া ক্লায়েন্টদের ডাটা আনা
  const { data: unpaidLog = [], isLoading } = useQuery({
    queryKey: ['unpaid-users-history', zoneFilter],
    queryFn: async () => {
      const url = zoneFilter !== 'all' 
        ? `/get-unpaid-users?zone=${zoneFilter}` 
        : `/get-unpaid-users`;
      const res = await instance.get(url);
      return res.data.data; 
    },
  });

  // মোট বকেয়া টাকার হিসাব
  const totalDue = unpaidLog.reduce((sum, item) => sum + (item.amount || 0), 0);

  // ইউনিক জোন/এরিয়া লিস্ট বের করা
  const uniqueZones = ['all', ...new Set(unpaidLog.map(item => item.zone).filter(Boolean))];

  const formatSlNumber = (sl) => {
    if (!sl && sl !== 0) return 'N/A';
    return String(sl).padStart(3, '0');
  };

  // 🖨️ ব্রাউজার প্রিন্ট ফাংশন
  const handlePrint = () => {
    window.print();
  };

  // 📄 পিডিএফ এক্সপোর্ট ফাংশন (পিডিএফ-এও রিমার্কসের ফাঁকা ঘর যুক্ত করা হয়েছে)
  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.text('ICC Communication', 105, 15, { align: 'center' });
    doc.setFontSize(14);
    doc.text('Unpaid Users / Collection Sheet', 105, 23, { align: 'center' });
    
    doc.setFontSize(11);
    doc.text(`Date: ${new Date().toLocaleDateString('en-GB')}`, 195, 23, { align: 'right' });
    doc.text(`Zone: ${zoneFilter.toUpperCase()}`, 14, 34);
    doc.text(`Total Due Amount: BDT ${totalDue}/=`, 14, 40);

    const tableColumn = ["SL", "Client Name", "Due Amount", "Remarks / Signature"];
    const tableRows = [];

    unpaidLog.forEach((user) => {
      tableRows.push([
        formatSlNumber(user.sl), 
        user.client_name || 'N/A',  
        `${user.amount}/=`,
        '' // পিডিএফ ফাইলে ফাঁকা রিমার্কস ঘর
      ]);
    });

    tableRows.push(['', 'Total Due:', `${totalDue}/=`, '']);

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 46,
      theme: 'grid',
      styles: { fontSize: 10, cellPadding: 6, textColor: [0, 0, 0] },
      headStyles: { fillColor: [185, 28, 28], textColor: [255, 255, 255], fontStyle: 'bold' },
      columnStyles: {
        0: { halign: 'center', cellWidth: 15 }, 
        1: { halign: 'left', cellWidth: 60 }, 
        2: { halign: 'right', cellWidth: 35, fontStyle: 'bold' }, 
        3: { halign: 'left', cellWidth: 'auto' }
      }
    });

    doc.save(`Unpaid_Report_${new Date().toISOString().slice(0,10)}.pdf`);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 bg-gray-50 min-h-screen">
      
      {/* 📊 কার্ড কন্ট্রোল সেকশন */}
      <div className="grid grid-cols-1 gap-4 mb-6 no-print">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">
              Total Unpaid Amount ({zoneFilter === 'all' ? "All Zones" : zoneFilter})
            </p>
            <h3 className="text-3xl font-bold text-red-600 mt-1">৳{totalDue}/=</h3>
          </div>
          <div className="p-4 bg-red-50 rounded-full text-red-600">
            <MdAttachMoney size={32} />
          </div>
        </div>
      </div>

      {/* ⚙️ ফিল্টার ও অ্যাকশন বাটন বার */}
      <div className="no-print mb-6 bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <div>
            <h2 className="text-lg font-bold text-gray-800">ICC Unpaid Filter Panel</h2>
            <p className="text-xs text-gray-400">Total Unpaid Clients: {unpaidLog.length}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <select 
              value={zoneFilter} 
              onChange={(e) => setZoneFilter(e.target.value)}
              className="select select-sm select-bordered bg-gray-50 text-gray-700 font-medium w-full md:w-auto"
            >
              {uniqueZones.map((zone, idx) => (
                <option key={idx} value={zone}>
                  {zone === 'all' ? 'All Zones / Areas' : `📍 ${zone}`}
                </option>
              ))}
            </select>

            <div className="flex gap-2 w-full md:w-auto justify-end">
              <button onClick={handlePrint} className="btn btn-sm btn-info text-white gap-1 flex-1 md:flex-none">
                <MdPrint size={16} /> Print List
              </button>
              <button onClick={handleDownloadPDF} className="btn btn-sm btn-error text-white gap-1 flex-1 md:flex-none">
                <MdDownload size={16} /> Export PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      {/*📱 মোবাইল ভিউ */}
      <div className="grid grid-cols-1 gap-4 md:hidden no-print mb-6">
        {unpaidLog.length === 0 ? (
          <div className="bg-white p-6 rounded-xl text-center border border-gray-100 text-gray-400">
            No unpaid users found. Everything cleared! 🎉
          </div>
        ) : (
          unpaidLog.map((user, idx) => (
            <div key={user?._id || idx} className="bg-white p-4 rounded-xl shadow-md border border-gray-100 flex flex-col gap-3 relative overflow-hidden">
              <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white px-3 py-2 rounded-lg flex justify-between items-center shadow-sm">
                <div className="flex items-center gap-1.5">
                  <MdDesktopWindows size={16} className="text-red-200" />
                  <span className="text-xs font-medium text-red-100 uppercase tracking-wider">Client SL</span>
                </div>
                <span className="text-base font-black tracking-wide font-mono bg-white/20 px-2.5 py-0.5 rounded-md backdrop-blur-sm shadow-inner">
                  {formatSlNumber(user?.sl)}
                </span>
              </div>

              <div className="flex justify-between items-start pt-1">
                <div>
                  <h3 className="text-base font-extrabold text-gray-800 tracking-tight">{user?.client_name}</h3>
                  <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1 font-medium">
                    <MdPhone size={13} className="text-gray-400" /> {user?.mobile || 'N/A'}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-base font-black text-red-600 block tracking-tight">৳{user?.amount}/=</span>
                  <span className="text-[10px] bg-red-50 text-red-700 font-bold px-1.5 py-0.5 rounded-md mt-1 inline-block border border-red-100">Unpaid</span>
                </div>
              </div>

              <div className="pt-2 border-t border-gray-100 text-[11px] text-gray-500 font-medium flex items-start gap-1">
                <MdLocationOn size={14} className="text-red-500 mt-0.5 shrink-0" />
                <span>Address: <strong className="text-gray-700 font-normal">{user?.address || 'N/A'}</strong></span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 🖥️ ডেক্সটপ ভিউ এবং ক্লিন প্রিন্ট টেবিল লেআউট */}
      <div className="print-table-section bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        
        {/* প্রিন্ট হেডার (শুধুমাত্র প্রিন্ট কপিতে দৃশ্যমান হবে) */}
        <div className="hidden print:block text-center mb-6">
          <h1 className="text-3xl font-extrabold text-gray-950 tracking-tight">ICC Communication</h1>
          <p className="text-md font-bold text-gray-700 mt-1">Field Bill Collection Sheet (Unpaid Users)</p>
          <div className="flex justify-between items-center mt-4 px-2 border-b-2 border-gray-800 pb-2 text-sm font-semibold text-gray-700">
            <span>Zone: {zoneFilter === 'all' ? 'All Zones' : zoneFilter.toUpperCase()}</span>
            <span>Date: {new Date().toLocaleDateString('en-GB')}</span>
          </div>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="table w-full border-collapse border border-gray-200">
            <thead>
              <tr className="bg-gray-800 text-white text-xs uppercase font-bold text-center">
                <th className="border border-gray-300 py-3 w-16">SL</th>
                <th className="border border-gray-300 py-3 text-left pl-4">Client Name</th>
                <th className="border border-gray-300 py-3 screen-only">Mobile</th>
                <th className="border border-gray-300 py-3 text-left pl-4 screen-only">Address</th>
                <th className="border border-gray-300 py-3 text-right pr-4 w-36">Due Amount</th>
                <th className="border border-gray-300 py-3 w-56 print-only">Remarks / Signature</th>
              </tr>
            </thead>
            <tbody>
              {unpaidLog.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-gray-400 font-medium bg-gray-50">
                    No unpaid users found. Everything clear! 🎉
                  </td>
                </tr>
              ) : (
                unpaidLog.map((user, index) => (
                  <tr key={user?._id || index} className="text-sm hover:bg-gray-50 font-medium text-gray-700 transition-colors row-height">
                    <td className="border border-gray-200 text-center font-mono py-2.5">{formatSlNumber(user?.sl)}</td>
                    <td className="border border-gray-200 pl-4 font-bold text-gray-900">{user?.client_name || 'N/A'}</td>
                    <td className="border border-gray-200 text-center font-mono screen-only">{user?.mobile || 'N/A'}</td>
                    <td className="border border-gray-200 pl-4 text-xs max-w-xs truncate screen-only">{user?.address || 'N/A'}</td>
                    <td className="border border-gray-200 text-right pr-4 font-bold text-red-600 font-mono">৳{user?.amount}/=</td>
                    {/* প্রিন্ট কপিতে লেখার জন্য খালি ঘর */}
                    <td className="border border-gray-300 print-only"></td>
                  </tr>
                ))
              )}
              {/* টোটাল রো */}
              {unpaidLog.length > 0 && (
                <tr className="bg-red-50/50 font-bold text-gray-900">
                  <td colSpan="2" className="border border-gray-200 text-right pr-4 py-3 text-base print-total-col">Total Due Amount:</td>
                  <td colSpan="2" className="border border-gray-200 text-right pr-4 py-3 text-base screen-only">Total Due Amount:</td>
                  <td className="border border-gray-200 text-right pr-4 text-lg text-red-600 font-mono">৳{totalDue}/=</td>
                  <td className="border border-gray-300 print-only"></td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 🖨️ প্রিন্ট কন্ট্রোল এবং কাস্টম স্টাইল CSS */}
      <style jsx global>{`
        /* সাধারণ অবস্থায় প্রিন্ট কলাম হাইড থাকবে */
        .print-only {
          display: none !important;
        }

        @media print {
          body {
            background-color: white !important;
            color: black !important;
          }
          .no-print { 
            display: none !important; 
          }
          /* স্ক্রিনের কলাম হাইড করে প্রিন্ট কলাম দেখানো */
          .screen-only {
            display: none !important;
          }
          .print-only {
            display: table-cell !important;
          }
          .print-total-col {
            text-align: right !important;
          }
          .print-table-section {
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
            display: block !important;
          }
          table {
            width: 100% !important;
            border: 1px solid #000 !important;
          }
          th {
            background-color: #f3f4f6 !important;
            color: #000 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            border: 1px solid #000 !important;
            font-weight: bold !important;
            padding: 8px 4px !important;
          }
          td {
            border: 1px solid #000 !important;
            padding: 12px 6px !important; /* প্রিন্ট কপিতে লেখার সুবিধার জন্য একটু বড় প্যাডিং */
          }
          /* লেখার জন্য প্রতি লাইনের উচ্চতা বাড়ানো */
          .row-height {
            height: 45px !important; 
          }
        }
        @media (max-width: 767px) {
          .print-table-section { display: none; }
        }
      `}</style>
    </div>
  );
};

export default UnpaidUsers;