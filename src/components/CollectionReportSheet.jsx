'use client';
import React from 'react';

const CollectionReportSheet = ({ paymentsLog, totalCollected, filterType, apiDates }) => {
  return (
    <div id="printable-area" className="bg-white rounded-xl shadow-sm p-4 md:p-8 border border-gray-200 max-w-5xl mx-auto mt-6">
      
      {/* 🖨️ প্রিন্ট হেড (নরমাল স্ক্রিনে হাইড থাকবে, প্রিন্ট এ শো করবে) */}
      <div className="text-center mb-8 hidden print:block">
        <h1 className="text-2xl font-normal text-gray-900 uppercase tracking-wide">ICC Communication</h1>
        <p className="text-base font-normal text-gray-700 mt-1">Daily Collection Report</p>
        <div className="text-right text-sm font-normal text-gray-800 mt-4">
          Date: {new Date().toLocaleDateString('en-GB')}
        </div>
      </div>

      {/* 📝 মূল খাতার ডাটা টেবিল (অতিরিক্ত বোল্ডনেস বা ডার্কনেস রিমুভ করা হয়েছে) */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse border border-black text-base">
          <thead>
            <tr className="bg-gray-50 text-black font-normal border-b border-black text-sm uppercase">
              <th className="py-2.5 px-3 border border-black text-center font-normal w-40">Id No.</th>
              <th className="py-2.5 px-3 border border-black text-center font-normal w-32">From</th>
              <th className="py-2.5 px-3 border border-black font-normal">Name</th>
              <th className="py-2.5 px-3 border border-black font-normal w-28">Due Bill.</th>
              <th className="py-2.5 px-3 border border-black text-right font-normal w-40">Running BILL</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black text-black font-normal">
            {paymentsLog.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-12 text-gray-400 italic text-base font-normal">
                  No data found for this selected date range.
                </td>
              </tr>
            ) : (
              <>
                {paymentsLog.map((payment) => (
                  <tr key={payment?._id} className="hover:bg-gray-50/50">
                    {/* Id No. কলাম (নরমাল ফন্ট) */}
                    <td className="py-2.5 px-3 border border-black text-center font-mono text-sm font-normal text-black">
                      {payment?.ip || 'N/A'}
                    </td>
                    {/* From কলাম (নরমাল ফন্ট) */}
                    <td className="py-2.5 px-3 border border-black text-center font-mono text-sm text-black font-normal">
                      {payment?.receiptNo || 'N/A'}
                    </td>
                    {/* Name কলাম (নরমাল ফন্ট) */}
                    <td className="py-2.5 px-3 border border-black text-base font-normal text-black">
                      {payment?.client_name}
                    </td>
                    {/* Due Bill (ফাঁকা ঘর) */}
                    <td className="py-2.5 px-3 border border-black"></td>
                    {/* Running BILL কলাম (অ্যামাউন্ট বোল্ড ছাড়া স্বাভাবিক রাখা হয়েছে) */}
                    <td className="py-2.5 px-3 border border-black text-right text-base font-normal text-black">
                      {payment?.amount}/=
                    </td>
                  </tr>
                ))}
                
                {/* মোট যোগফল রো (শুধুমাত্র টোটাল টেক্সট হাইলাইট করার জন্য হালকা বোল্ড, অ্যামাউন্ট নরমাল) */}
                <tr className="bg-gray-50/50 text-black border-t border-black">
                  <td colSpan="3" className="py-3 px-3 border border-black text-right"></td>
                  <td className="py-3 px-3 border border-black text-center text-base font-medium text-gray-700">Total:</td>
                  <td className="py-3 px-3 border border-black text-right text-base font-normal text-black">
                    {totalCollected}/=
                  </td>
                </tr>
              </>
            )}
          </tbody>
        </table>
      </div>

      {/* 🖨️ প্রিন্ট লেআউটের কাস্টম সিএসএস */}
      <style jsx global>{`
        @media print {
          @page {
            margin: 8mm; 
          }
          .no-print, .btn, select, input, footer, nav {
            display: none !important;
          }
          body { 
            background-color: white !important; 
            padding: 0 !important;
            margin: 0 !important;
            font-weight: normal !important;
            color: #000000 !important;
          }
          #printable-area { 
            box-shadow: none !important; 
            border: none !important; 
            max-w: 100% !important; 
            width: 100% !important; 
            padding: 0 !important; 
            margin: 0 !important;
          }
          table { border: 1px solid #000000 !important; }
          th, td { 
            border: 1px solid #000000 !important; 
            color: #000000 !important; 
            padding: 8px 6px !important;
            font-weight: normal !important; /* প্রিন্ট কপিতে সব লেখা স্বাভাবিক করার জন্য */
          }
        }
      `}</style>
    </div>
  );
};

export default CollectionReportSheet;