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

  // ২. পেমেন্ট লগ বা কালেকশন ডাটা ফেচিং
  const { data: paymentsResponse, isLoading: paymentsLoading } = useQuery({
    queryKey: ['total-collection-payments', selectedMonth],
    queryFn: async () => {
      const startDate = `${selectedMonth}-01`;
      const year = parseInt(selectedMonth.split('-')[0]);
      const month = parseInt(selectedMonth.split('-')[1]);
      const lastDay = new Date(year, month, 0).getDate(); 
      const endDate = `${selectedMonth}-${String(lastDay).padStart(2, '0')}`;

      const res = await instance.get(`/get-payments-data?startDate=${startDate}&endDate=${endDate}`);
      return res.data;
    },
  });

  const paymentsLog = paymentsResponse?.data || [];

  // ⚙️ ডাটা প্রোসেসিং এবং ফিল্টারিং লজিক
  const reportData = useMemo(() => {
    const activeClients = allClients.filter(client => client?.status === 'Active');

    let totalPaidAmount = 0;
    let totalUnpaidAmount = 0;
    let paidCount = 0;
    let unpaidCount = 0;

    const updatedClients = activeClients.map(client => {
      const paymentInfo = paymentsLog.find(p => String(p?.clientId) === String(client?._id));
      
      const isPaid = !!paymentInfo;
      const billAmount = client?.amount || 0;

      if (isPaid) {
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
      
      {/* 🔍 ফিল্টার এবং অ্যাকশন বার */}
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
            <table className="w-full text-left border-collapse border border-gray-400 text-sm table-fixed print:table">
              
              <thead className="print:table-header-group">
                <tr className="bg-gray-100 text-black font-semibold border-b border-gray-400 text-xs uppercase tracking-wider">
                  {/* ⚡ উইডথ অ্যাডজাস্ট করা হলো: IP বাড়ানো হয়েছে, SL ও Mobile সামান্য কমানো হয়েছে */}
                  <th className="py-2.5 px-2 border border-gray-400 text-center w-[5%]">SL</th>
                  <th className="py-2.5 px-2 border border-gray-400 text-center w-[15%]">IP Address</th>
                  <th className="py-2.5 px-3 border border-gray-400 w-[20%]">Client Name</th>
                  <th className="py-2.5 px-3 border border-gray-400 w-[29%]">Address</th>
                  <th className="py-2.5 px-2 border border-gray-400 text-center w-[11%]">Mobile</th>
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
                    <tr key={client?._id || index} className="hover:bg-gray-50/50 print-row">
                      <td className="py-2 px-2 border border-gray-400 text-center font-mono text-xs">
                        {formatSlNumber(client?.sl || index + 1)}
                      </td>
                      {/* IP Address এর গ্যাপ সুন্দরভাবে দেখানোর ব্যবস্থা */}
                      <td className="py-2 px-2 border border-gray-400 text-center font-mono text-xs text-blue-600 whitespace-nowrap overflow-hidden text-ellipsis print:text-black">
                        {client?.ip || 'N/A'}
                      </td>
                      <td className="py-2 px-3 border border-gray-400 font-medium text-[13px] break-words">
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
        <div className="mt-12 text-right text-xs italic text-gray-500 font-mono tracking-wide print:fixed print:bottom-3 print:right-3 print:text-black">
          Generated by: Mahialam Rahat
        </div>

      </div>

      {/* 🖨️ সাইড মার্জিন ১ মিলিমিটারে নামানো এবং ওপরে-নিচে ১৫ মিলিমিটার ফিক্সড রাখার সিএসএস */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            /* ⚡ ডানে ও বামে মার্জিন কমিয়ে মাত্র ১ মিলিমিটার (1mm) করা হলো */
            margin: 15mm 1mm 15mm 1mm; 
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
            padding: 0 1mm !important; 
            margin: 0 !important;
            min-h: 100vh !important;
          }
          table { 
            border: 0.5px solid #999999 !important; 
            table-layout: fixed !important; 
            width: 100% !important;
            border-collapse: collapse !important;
            display: table !important;
          }
          thead {
            display: table-header-group !important;
          }
          tr {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          th, td { 
            border: 0.5px solid #999999 !important; 
            color: #000000 !important; 
            padding: 5px 3px !important; 
            font-weight: normal !important;
          }
          th {
            font-weight: bold !important;
            background-color: #f3f4f6 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .print-row {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
        }
      `}</style>
    </div>
  );
};

export default TotalCollection;