'use client';
import useAxios from '@/hook/useAxios';
import { useQuery } from '@tanstack/react-query';
import React, { useState, useEffect } from 'react';
import { MdPrint, MdDownload, MdAttachMoney, MdDateRange } from 'react-icons/md';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import CollectionReportSheet from '@/components/CollectionReportSheet'; // 👈 আগের ফাইলটি ইম্পোর্ট করা হলো

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

  // 📄 ৪. jsPDF দিয়ে খাতার ডিজাইনে ডাউনলোড লজিক
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
              className="select select-sm select-bordered bg-gray-50 text-gray-700 font-medium"
            >
              <option value="today">Today's Collection</option>
              <option value="month">This Month's Collection</option>
              <option value="custom">📅 Custom Date Range</option>
              <option value="all">All History</option>
            </select>

            <button onClick={handlePrint} className="btn btn-sm btn-info text-white gap-1">
              <MdPrint size={16} /> Print Sheet
            </button>
            <button onClick={handleDownloadPDF} className="btn btn-sm btn-success text-white gap-1">
              <MdDownload size={16} /> Export PDF
            </button>
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

      {/* 📝 ৩. চাইল্ড কম্পোনেন্ট লোড (এখানে প্রিন্ট শিট জেনারেট হচ্ছে প্রপ্স এর মাধ্যমে) */}
      <CollectionReportSheet 
        paymentsLog={paymentsLog} 
        totalCollected={totalCollected} 
        filterType={filterType}
        apiDates={apiDates}
      />

    </div>
  );
};

export default PaidUsers;