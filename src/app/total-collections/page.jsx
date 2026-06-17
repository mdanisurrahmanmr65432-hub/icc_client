'use client';
import useAxios from '@/hook/useAxios';
import { useQuery } from '@tanstack/react-query';
import React, { useState, useMemo } from 'react';

const TotalCollection = () => {
  const instance = useAxios();

  // 📅 চলতি মাসের ১ম এবং শেষ তারিখ ডিফল্ট সেট করার জন্য বছর ও মাস বের করা
  const currentYear = new Date().getFullYear();
  const currentMonth = String(new Date().getMonth() + 1).padStart(2, '0');

  // স্টেট ম্যানেজমেন্ট (ডিফল্ট চলতি মাস সিলেক্টেড থাকবে)
  const [selectedMonth, setSelectedMonth] = useState(`${currentYear}-${currentMonth}`);

  // ১. অল ক্লায়েন্ট ডাটা ফেচিং
  const { data: allClients = [], isLoading: clientsLoading } = useQuery({
    queryKey: ['total-collection-clients'],
    queryFn: async () => {
      const res = await instance.get('/get-client-data');
      return res.data;
    },
  });

  // ২. 🤝 আপনার ব্যাকএন্ডের সঠিক এন্ডপয়েন্ট (/get-payments-data) এবং প্যারামিটার অনুযায়ী পেমেন্ট লগ ফেচিং
  const { data: paymentsResponse, isLoading: paymentsLoading } = useQuery({
    queryKey: ['total-collection-payments', selectedMonth],
    queryFn: async () => {
      // নির্বাচিত মাসের ১ম তারিখ (01) এবং শেষ তারিখ (যেমন ৩০ বা ৩১) ডাইনামিক বের করা
      const startDate = `${selectedMonth}-01`;
      const year = parseInt(selectedMonth.split('-')[0]);
      const month = parseInt(selectedMonth.split('-')[1]);
      const lastDay = new Date(year, month, 0).getDate(); // মাসের শেষ দিন (৩০, ৩১ বা ২৮) বের করবে
      const endDate = `${selectedMonth}-${String(lastDay).padStart(2, '0')}`;

      // ব্যাকএন্ডের query ফিল্টার অনুযায়ী ডাটা রিকোয়েস্ট
      const res = await instance.get(`/get-payments-data?startDate=${startDate}&endDate=${endDate}`);
      return res.data;
    },
  });

  // ব্যাকএন্ড থেকে আসা পেমেন্ট অ্যারেটি আলাদা করা (আপনার ব্যাকএন্ড ডাটা পাঠায় { success: true, data: [...] } ফরম্যাটে)
  const paymentsLog = paymentsResponse?.data || [];

  // ⚙️ ডাটা প্রোসেসিং এবং ফিল্টারিং লজিক
  const reportData = useMemo(() => {
    // শুধুমাত্র Active ক্লায়েন্টদের ফিল্টার করা হচ্ছে
    const activeClients = allClients.filter(client => client?.status === 'Active');

    // সামারি কাউন্টার
    let totalPaidAmount = 0;
    let totalUnpaidAmount = 0;
    let paidCount = 0;
    let unpaidCount = 0;

    // ক্লায়েন্টদের ডাটার সাথে ব্যাকএন্ডের পেমেন্ট ম্যাচ করানো
    const updatedClients = activeClients.map(client => {
      
      // ⚡ ফিক্স: আপনার ব্যাকএন্ডে 'clientId' হিসেবে ডাটা জমা হয়। তাই আমরা string এ কনভার্ট করে ম্যাচ করাচ্ছি।
      const paymentInfo = paymentsLog.find(p => String(p?.clientId) === String(client?._id));
      
      const isPaid = !!paymentInfo;
      const billAmount = client?.amount || 0;

      if (isPaid) {
        // যদি ডাটাবেজে নির্দিষ্ট পেমেন্ট অ্যামাউন্ট থাকে তবে সেটি নিবে, না হলে ক্লায়েন্টের ফিক্সড অ্যামাউন্ট
        totalPaidAmount += (paymentInfo?.amount || billAmount);
        paidCount++;
      } else {
        totalUnpaidAmount += billAmount;
        unpaidCount++;
      }

      return {
        ...client,
        isPaid,
        paidAmount: isPaid ? (paymentInfo?.amount || billAmount) : 0
      };
    });

    return {
      clients: updatedClients,
      totalPaidAmount,
      totalUnpaidAmount,
      paidCount,
      unpaidCount
    };
  }, [allClients, paymentsLog]);

  // 🔢 SL ৩ ডিজিট ফরম্যাট (e.g., 003)
  const formatSlNumber = (sl) => {
    if (!sl && sl !== 0) return 'N/A';
    return String(sl).padStart(3, '0');
  };

  // 🖨️ ব্রাউজার প্রিন্ট ট্রিগার
  const handlePrint = () => {
    window.print();
  };

  if (clientsLoading || paymentsLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-2"></div>
        <p className="text-gray-500 text-sm">Generating Collection Report...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 bg-gray-50 min-h-screen no-print-bg">
      
      {/* 🔍 ফিল্টার এবং অ্যাকশন বার (প্রিন্টে হাইড থাকবে) */}
      <div className="mb-6 flex flex-wrap justify-between items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-200 no-print">
        <div className="flex items-center gap-2">
          <label className="text-sm font-semibold text-gray-700">Select Month:</label>
          <input 
            type="month" 
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button 
          onClick={handlePrint}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-medium shadow transition-colors"
        >
          Print Report
        </button>
      </div>

      {/* 📄 মূল প্রিন্ট এরিয়া */}
      <div id="printable-area" className="bg-white rounded-xl shadow-sm p-4 md:p-8 border border-gray-200 max-w-6xl mx-auto relative min-h-[700px] flex flex-col justify-between">
        
        <div>
          {/* 🖨️ প্রিন্ট হেডার */}
          <div className="text-center mb-6 hidden print:block">
            <h1 className="text-2xl font-normal text-gray-900 uppercase tracking-wide">ICC Communication</h1>
            <p className="text-base font-normal text-gray-700 mt-0.5">Monthly Collection Report (1 - 31st)</p>
            <p className="text-sm font-mono text-gray-600 mt-1">Month: {selectedMonth}</p>
          </div>

          {/* 📊 কালেকশন সামারি কার্ডস */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 border border-gray-200 p-4 rounded-xl bg-gray-50/50 print:bg-transparent print:border-gray-400 print:grid-cols-4">
            <div className="text-center md:text-left">
              <p className="text-xs text-gray-500 uppercase font-bold tracking-wider print:text-black">Paid Total</p>
              <p className="text-lg font-bold text-green-600 print:text-black">৳{reportData.totalPaidAmount}/=</p>
              <span className="text-xs text-gray-400 print:text-black">({reportData.paidCount} Clients)</span>
            </div>
            <div className="text-center md:text-left border-l border-gray-200 pl-2 md:pl-4 print:border-gray-400">
              <p className="text-xs text-gray-500 uppercase font-bold tracking-wider print:text-black">Unpaid Total</p>
              <p className="text-lg font-bold text-red-600 print:text-black">৳{reportData.totalUnpaidAmount}/=</p>
              <span className="text-xs text-gray-400 print:text-black">({reportData.unpaidCount} Clients)</span>
            </div>
            <div className="text-center md:text-left border-l border-gray-200 pl-2 md:pl-4 print:border-gray-400">
              <p className="text-xs text-gray-500 uppercase font-bold tracking-wider print:text-black">Expected Total</p>
              <p className="text-lg font-bold text-blue-600 print:text-black">৳{reportData.totalPaidAmount + reportData.totalUnpaidAmount}/=</p>
            </div>
            <div className="text-center md:text-left border-l border-gray-200 pl-2 md:pl-4 print:border-gray-400">
              <p className="text-xs text-gray-500 uppercase font-bold tracking-wider print:text-black">Target Status</p>
              <p className="text-lg font-bold text-gray-800 print:text-black">Active Only</p>
            </div>
          </div>

          {/* 📝 ডাটা টেবিল */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse border border-gray-400 text-sm table-fixed">
              <thead>
                <tr className="bg-gray-100 text-black font-semibold border-b border-gray-400 text-xs uppercase tracking-wider">
                  <th className="py-2.5 px-2 border border-gray-400 text-center w-[7%]">SL</th>
                  <th className="py-2.5 px-2 border border-gray-400 text-center w-[12%]">IP Address</th>
                  <th className="py-2.5 px-3 border border-gray-400 w-[20%]">Client Name</th>
                  <th className="py-2.5 px-3 border border-gray-400 w-[28%]">Address</th>
                  <th className="py-2.5 px-2 border border-gray-400 text-center w-[13%]">Mobile</th>
                  <th className="py-2.5 px-2 border border-gray-400 text-right w-[10%]">Bill</th>
                  <th className="py-2.5 px-2 border border-gray-400 text-center w-[10%]">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-400 text-black">
                {reportData.clients.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-12 text-gray-400 italic">
                      No active clients found.
                    </td>
                  </tr>
                ) : (
                  reportData.clients.map((client, index) => (
                    <tr key={client?._id || index} className="hover:bg-gray-50/50">
                      <td className="py-2 px-2 border border-gray-400 text-center font-mono text-xs">
                        {formatSlNumber(client?.sl || index + 1)}
                      </td>
                      <td className="py-2 px-2 border border-gray-400 text-center font-mono text-xs text-blue-600 break-all print:text-black">
                        {client?.ip || 'N/A'}
                      </td>
                      <td className="py-2 px-3 border border-gray-400 font-medium break-words">
                        {client?.client_name}
                      </td>
                      <td className="py-2 px-3 border border-gray-400 text-xs text-gray-600 break-words print:text-black">
                        {client?.address || 'N/A'}
                      </td>
                      <td className="py-2 px-2 border border-gray-400 text-center font-mono text-xs break-all">
                        {client?.mobile || 'N/A'}
                      </td>
                      <td className="py-2 px-2 border border-gray-400 text-right font-mono font-medium">
                        {client?.amount}/=
                      </td>
                      {/* স্ট্যাটাস বক্স: পেইড হলে শো করবে, আনপেইড হলে ঘরটি সম্পূর্ণ খালি থাকবে */}
                      <td className="py-2 px-2 border border-gray-400 text-center font-medium">
                        {client.isPaid ? (
                          <span className="px-2 py-0.5 rounded text-xs bg-green-100 text-green-800 border border-green-300 print:text-black print:p-1">
                            Paid
                          </span>
                        ) : (
                          <span className="block min-h-[18px]"></span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ⏬ 🖨️ একদম নিচে মার্জিনের কোণায় জেনারেটেড টেক্সট */}
        <div className="mt-12 text-right text-xs italic text-gray-500 font-mono tracking-wide print:fixed print:bottom-1 print:right-1 print:text-black">
          Generated by: Mahialam Rahat
        </div>

      </div>

      {/* 🖨️ প্রিন্ট লেআউটের কাস্টম সিএসএস (৫ মিলিমিটার মার্জিন ফিক্সড) */}
      <style jsx global>{`
        @media print {
          @page {
            margin: 5mm 5mm 5mm 5mm; 
          }
          .no-print, .btn, select, input, button {
            display: none !important;
          }
          body { 
            background-color: white !important; 
            color: #000000 !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          #printable-area { 
            box-shadow: none !important; 
            border: none !important; 
            max-w: 100% !important; 
            width: 100% !important; 
            padding: 0 !important; 
            margin: 0 !important;
            min-h: 100vh !important;
          }
          table { 
            border: 0.5px solid #999999 !important; 
            table-layout: fixed !important; 
            width: 100% !important;
            border-collapse: collapse !important;
          }
          th, td { 
            border: 0.5px solid #999999 !important; 
            color: #000000 !important; 
            padding: 6px 4px !important;
            font-weight: normal !important;
          }
          th {
            font-weight: bold !important;
            background-color: #f3f4f6 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `}</style>
    </div>
  );
};

export default TotalCollection;