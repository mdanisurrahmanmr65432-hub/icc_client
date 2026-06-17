'use client';
import useAxios from '@/hook/useAxios';
import { useQuery } from '@tanstack/react-query';
import React, { useState, useEffect } from 'react';
import { MdPrint, MdDownload, MdAttachMoney, MdReceipt, MdDesktopWindows, MdLocationOn } from 'react-icons/md';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import CollectionReportSheet from '@/components/CollectionReportSheet';

const PaidUsers = () => {
  const instance = useAxios();
  
  // ফিল্টার এবং ডেট স্টেটসমূহ
  const [filterType, setFilterType] = useState('month'); 
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [apiDates, setApiDates] = useState({ start: '', end: '' });

  // 🕒 ফিল্টার চেঞ্জ ট্র্যাক করার এফেক্ট
  useEffect(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const todayStr = `${yyyy}-${mm}-${dd}`;

    if (filterType === 'today') {
      setApiDates({ start: todayStr, end: todayStr });
    } else if (filterType === 'month') {
      const firstDay = `${yyyy}-${mm}-01`;
      setApiDates({ start: firstDay, end: todayStr });
    } else if (filterType === 'custom') {
      if (customStartDate && customEndDate) {
        setApiDates({ start: customStartDate, end: customEndDate });
      }
    } else {
      setApiDates({ start: '', end: '' });
    }
  }, [filterType, customStartDate, customEndDate]);

  // 🔍 ১. ডাটা ফেচিং
  const { data: paymentsLog = [], isLoading } = useQuery({
    queryKey: ['payments-history', apiDates],
    queryFn: async () => {
      const url = apiDates.start && apiDates.end 
        ? `/get-payments-data?startDate=${apiDates.start}&endDate=${apiDates.end}`
        : `/get-payments-data`;
      const res = await instance.get(url);
      return res.data.data; 
    },
  });

  // 📊 ২. টোটাল টাকা হিসাব
  const totalCollected = paymentsLog.reduce((sum, item) => sum + (item.amount || 0), 0);

  // 🖨️ ৩. প্রিন্ট ট্রিগার
  const handlePrint = () => {
    window.print();
  };

  // 📄 ৪. jsPDF দিয়ে ডাউনলোড লজিক
  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(22);
    doc.text('ICC Communication', 105, 15, { align: 'center' });
    doc.setFontSize(14);
    doc.text('Daily Collection Report', 105, 23, { align: 'center' });
    
    doc.setFontSize(11);
    doc.text(`Date: ${new Date().toLocaleDateString('en-GB')}`, 195, 23, { align: 'right' });
    doc.text(`Filter Mode: ${filterType.toUpperCase()}`, 14, 34);
    doc.text(`Total Collected: BDT ${totalCollected}/=`, 14, 40);

    const tableColumn = ["Id No.", "From (Receipt)", "Name", "Due Bill.", "Running BILL"];
    const tableRows = [];

    paymentsLog.forEach((payment) => {
      tableRows.push([
        payment.ip || 'N/A',        
        payment.receiptNo || 'N/A',  
        payment.client_name,         
        '',                          
        `${payment.amount}/=`       
      ]);
    });

    tableRows.push(['', '', '', 'Total:', `${totalCollected}/=`]);

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 46,
      theme: 'grid',
      styles: { fontSize: 11, cellPadding: 4, textColor: [0, 0, 0] },
      headStyles: { fillColor: [50, 50, 50], textColor: [255, 255, 255], fontStyle: 'bold' },
      columnStyles: {
        0: { halign: 'center' },
        1: { halign: 'center' },
        3: { halign: 'right' },
        4: { halign: 'right', fontStyle: 'bold' }
      }
    });

    doc.save(`Collection_Report_${new Date().toISOString().slice(0,10)}.pdf`);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 bg-gray-50 min-h-screen">
      
      {/* 📊 ১. কার্ড কন্ট্রোল সেকশন */}
      <div className="grid grid-cols-1 gap-4 mb-6 no-print">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">
              Collection ({filterType === 'today' ? "Today" : filterType === 'month' ? "This Month" : filterType === 'custom' ? "Custom Range" : "All Time"})
            </p>
            <h3 className="text-3xl font-bold text-green-600 mt-1">৳{totalCollected}/=</h3>
          </div>
          <div className="p-4 bg-green-50 rounded-full text-green-600">
            <MdAttachMoney size={32} />
          </div>
        </div>
      </div>

      {/* ⚙️ ২. ফিল্টার ও অ্যাকশন বাটন বার */}
      <div className="no-print mb-6 bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <div>
            <h2 className="text-lg font-bold text-gray-800">ICC Filter Panel</h2>
            <p className="text-xs text-gray-400">Total Statements Found: {paymentsLog.length}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <select 
              value={filterType} 
              onChange={(e) => setFilterType(e.target.value)}
              className="select select-sm select-bordered bg-gray-50 text-gray-700 font-medium w-full md:w-auto"
            >
              <option value="today">Today's Collection</option>
              <option value="month">This Month's Collection</option>
              <option value="custom">📅 Custom Date Range</option>
              <option value="all">All History</option>
            </select>

            <div className="flex gap-2 w-full md:w-auto justify-end">
              <button onClick={handlePrint} className="btn btn-sm btn-info text-white gap-1 flex-1 md:flex-none">
                <MdPrint size={16} /> Print Sheet
              </button>
              <button onClick={handleDownloadPDF} className="btn btn-sm btn-success text-white gap-1 flex-1 md:flex-none">
                <MdDownload size={16} /> Export PDF
              </button>
            </div>
          </div>
        </div>

        {filterType === 'custom' && (
          <div className="flex flex-wrap items-center gap-3 p-3 bg-blue-50/50 rounded-lg border border-blue-100">
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-gray-600">Start Date:</label>
              <input type="date" value={customStartDate} onChange={(e) => setCustomStartDate(e.target.value)} className="input input-sm input-bordered text-xs" />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-gray-600">End Date:</label>
              <input type="date" value={customEndDate} onChange={(e) => setCustomEndDate(e.target.value)} className="input input-sm input-bordered text-xs" />
            </div>
          </div>
        )}
      </div>

      {/* 📱 ৩. মোবাইল রেসপন্সিভ বক্স/কার্ড মোড লেআউট (শুধুমাত্র মোবাইলে শো করবে) */}
<div className="grid grid-cols-1 gap-4 md:hidden no-print mb-6">
  {paymentsLog.length === 0 ? (
    <div className="bg-white p-6 rounded-xl text-center border border-gray-100 text-gray-400">
      No payments log found for this range.
    </div>
  ) : (
    paymentsLog.map((payment, idx) => (
      <div key={payment?._id || idx} className="bg-white p-4 rounded-xl shadow-md border border-gray-100 flex flex-col gap-3 relative overflow-hidden">
        
        {/* IP Address এর বড় এবং প্রিমিয়াম টপ ব্যানার ডিজাইন */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 py-2 rounded-lg flex justify-between items-center shadow-sm">
          <div className="flex items-center gap-1.5">
            <MdDesktopWindows size={16} className="text-blue-200" />
            <span className="text-xs font-medium text-blue-100 uppercase tracking-wider">IP</span>
          </div>
          <span className="text-base font-black tracking-wide font-mono bg-white/20 px-2.5 py-0.5 rounded-md backdrop-blur-sm shadow-inner">
            {payment?.ip || 'N/A'}
          </span>
        </div>

        {/* ক্লায়েন্ট ইনফরমেশন সেকশন */}
        <div className="flex justify-between items-start pt-1">
          <div>
            <h3 className="text-base font-extrabold text-gray-800 tracking-tight">
              {payment?.client_name}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1 font-medium">
              <MdLocationOn size={13} className="text-gray-400" /> {payment?.zone || 'N/A'}
            </p>
          </div>
          <div className="text-right">
            <span className="text-base font-black text-emerald-600 block tracking-tight">
              ৳{payment?.amount}/=
            </span>
            <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-1.5 py-0.5 rounded-md mt-1 inline-block border border-emerald-100">
              Paid
            </span>
          </div>
        </div>

        {/* রিসিট নম্বর এবং ডেট (নিচের ফুটার পার্ট) */}
        <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-gray-100 text-gray-500 font-medium">
          <div className="flex items-center gap-1">
            <MdReceipt size={14} className="text-indigo-500" />
            <span>Receipt: <strong className="text-gray-700 font-mono">#{payment?.receiptNo || 'N/A'}</strong></span>
          </div>
          <div className="text-right text-gray-400">
            <span>Date: {payment?.date || 'N/A'}</span>
          </div>
        </div>

      </div>
    ))
  )}
</div>

      {/* 📝 ৪. ডেক্সটপ এবং প্রিন্ট লেআউট (মাঝারি ও বড় স্ক্রিনে টেবিল দেখাবে, মোবাইলে হাইড থাকবে) */}
      <div className="hidden md:block">
        <CollectionReportSheet 
          paymentsLog={paymentsLog} 
          totalCollected={totalCollected} 
          filterType={filterType}
          apiDates={apiDates}
        />
      </div>

      {/* প্রিন্ট করার সময় যাতে মোবাইল ভিউ হাইড হয়ে আসল প্রিন্ট শিটটাই প্রিন্ট হয় তার জন্য এই কন্ডিশন */}
      <div className="visible-print hidden">
        <CollectionReportSheet 
          paymentsLog={paymentsLog} 
          totalCollected={totalCollected} 
          filterType={filterType}
          apiDates={apiDates}
        />
      </div>

    </div>
  );
};

export default PaidUsers;