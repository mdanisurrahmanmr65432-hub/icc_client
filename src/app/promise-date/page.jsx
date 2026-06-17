'use client';
import useAxios from '@/hook/useAxios';
import { useQuery } from '@tanstack/react-query';
import React, { useState } from 'react';
import { MdLocalPhone, MdNavigateBefore, MdNavigateNext, MdAssignmentTurnedIn, MdSearch, MdLocationOn } from 'react-icons/md';
import Swal from 'sweetalert2';

export default function PromisesPage() {
  const instance = useAxios();
  
  // 🔍 ফিল্টার এবং প্যাগিনেশন স্টেট
  const [promiseDate, setPromiseDate] = useState('');
  const [addressSearch, setAddressSearch] = useState('');
  const [page, setPage] = useState(1);

  // 🔄 ব্যাকএন্ড থেকে সার্ভার-সাইড ফিল্টারড ডাটা নিয়ে আসা
  const { data: serverResponse = {}, refetch, isLoading } = useQuery({
    queryKey: ['promises-data', promiseDate, addressSearch, page], // 👈 এই কি-গুলো চেঞ্জ হলে অটোমেটিক ব্যাকএন্ড রি-হিট হবে
    queryFn: async () => {
      const res = await instance.get(`/get-promises-data?date=${promiseDate}&address=${addressSearch}&page=${page}`);
      return res.data; 
    },
    keepPreviousData: true // পেজ চেঞ্জ করার সময় স্মুথ এক্সপেরিয়েন্সের জন্য
  });

  // ব্যাকএন্ড রেসপন্স থেকে ডাটা আলাদা করা
  const promisesList = serverResponse?.data || [];
  const totalPromises = serverResponse?.totalPromises || 0;
  const totalPages = serverResponse?.totalPages || 1;

  // পেমেন্ট কালেক্ট করার ডামি বাটন হ্যান্ডলার
  const handleMarkPaid = (clientName) => {
    Swal.fire({
      title: "Collected?",
      text: `Mark bill for ${clientName} as collected?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: '#10B981',
      confirmButtonText: 'Yes, Paid!'
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire("Success!", "Payment status updated successfully.", "success");
        refetch();
      }
    });
  };

  return (
    <div className="container mx-auto p-4 md:p-6 bg-gray-50 min-h-screen">
      
      {/* 🔝 হেডার সেকশন */}
      <div className="mb-6 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b pb-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-amber-600 flex items-center gap-2">
            🤝 Payment Promise Directory
          </h1>
          <p className="text-xs md:text-sm text-gray-500">
            Server-side filtered layout displaying max 30 entries per page
          </p>
        </div>

        {/* 🔍 ব্যাকএন্ড ফিল্টারিং কন্ট্রোলস */}
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto flex-grow max-w-2xl">
          {/* অ্যাড্রেস ফিল্টার ইনপুট */}
          <div className="relative flex-grow">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><MdLocationOn size={16} /></span>
            <input 
              type="text" 
              value={addressSearch}
              onChange={(e) => { setAddressSearch(e.target.value); setPage(1); }} // টাইপ করলে পেজ ১ এ যাবে
              placeholder="Search by Area/Address (e.g., Kazi Bari)..." 
              className="w-full pl-9 pr-3 py-2 text-xs md:text-sm bg-white border border-gray-300 rounded-lg shadow-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-500" 
            />
          </div>
          
          {/* 📅 প্রমিজ ডেট ইনপুট */}
          <div className="relative w-full sm:w-48">
            <input 
              type="date" 
              value={promiseDate} 
              onChange={(e) => { setPromiseDate(e.target.value); setPage(1); }} 
              className="w-full px-3 py-2 text-xs md:text-sm bg-amber-50 border border-amber-300 rounded-lg shadow-sm text-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium" 
            />
            {promiseDate && (
              <button 
                onClick={() => { setPromiseDate(''); setPage(1); }} 
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 text-xs font-bold px-1"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        <div className="bg-amber-500 text-white px-4 py-2 rounded-lg shadow text-xs md:text-sm font-medium whitespace-nowrap">
          Found Match: {totalPromises}
        </div>
      </div>

      {/* ⏳ লোডিং স্টেট */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] bg-white rounded-xl shadow-sm">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-amber-500 mb-3"></div>
          <p className="text-gray-500 text-sm">Querying database sheets...</p>
        </div>
      ) : promisesList.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] bg-white rounded-xl p-6 border text-center shadow-sm">
          <p className="text-gray-400 text-lg font-semibold">No Promises Scheduled</p>
          <p className="text-gray-400 text-xs mt-1">No database records match this specific date or location filter.</p>
        </div>
      ) : (
        <>
          {/* 📱 ১. মোবাইল ভিউ (কার্ড লেআউট) */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {promisesList.map((item, idx) => (
              <div key={item?._id || idx} className="bg-white p-4 rounded-xl shadow-sm border border-amber-100 flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <h3 className="text-base font-bold text-gray-800">{item?.client_name}</h3>
                  <span className="bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded text-xs">
                    📅 {new Date(item?.promise_date).toLocaleDateString('en-GB')}
                  </span>
                </div>
                <p className="text-xs text-gray-600"><b>Address:</b> {item?.address || 'N/A'}</p>
                <div className="bg-gray-50 p-2 rounded text-xs text-gray-700 border italic">
                  " {item?.promise_note || 'No custom note.'} "
                </div>
                <button 
                  onClick={() => handleMarkPaid(item?.client_name)} 
                  className="btn btn-xs bg-emerald-600 hover:bg-emerald-700 text-white mt-2 border-none w-full"
                >
                  Collect Cash
                </button>
              </div>
            ))}
          </div>

          {/* 💻 ২. ডেক্সটপ ভিউ (টেবিল লেআউট - প্রতি পেজে সর্বোচ্চ ৩০টি) */}
          <div className="hidden md:block bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-100 text-gray-700 text-xs uppercase font-semibold border-b border-gray-200">
                    <th className="py-4 px-6 text-center w-16">No</th>
                    <th className="py-4 px-6">Client Name</th>
                    <th className="py-4 px-6">Follow-up Location / Address</th>
                    <th className="py-4 px-6 text-center">Scheduled Promise Date</th>
                    <th className="py-4 px-6">Collection Note / Discussion</th>
                    <th className="py-4 px-6 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm text-gray-600">
                  {promisesList.map((item, index) => (
                    <tr key={item?._id || index} className="hover:bg-amber-50/30 transition-colors">
                      <td className="py-4 px-6 text-center text-gray-400 font-mono">{(page - 1) * 30 + index + 1}</td>
                      <td className="py-4 px-6 font-semibold text-gray-800">{item?.client_name}</td>
                      <td className="py-4 px-6 max-w-xs truncate" title={item?.address}>{item?.address || 'N/A'}</td>
                      <td className="py-4 px-6 text-center">
                        <span className="bg-amber-100 text-amber-800 font-bold px-2.5 py-1 rounded text-xs">
                          📅 {new Date(item?.promise_date).toLocaleDateString('en-GB')}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-xs text-gray-500 italic max-w-sm truncate" title={item?.promise_note}>
                        {item?.promise_note || 'No explicit description.'}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <button 
                          onClick={() => handleMarkPaid(item?.client_name)} 
                          className="btn btn-xs bg-emerald-600 hover:bg-emerald-700 text-white font-medium flex items-center gap-1 mx-auto border-none"
                        >
                          <MdAssignmentTurnedIn size={12} /> Paid
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 🔢 ৩. সার্ভার সাইড প্যাগিনেশন বাটন কন্ট্রোল */}
          <div className="flex justify-center items-center gap-4 mt-6 pb-10">
            <button 
              disabled={page === 1} 
              onClick={() => setPage(prev => Math.max(prev - 1, 1))} 
              className="btn btn-sm btn-outline flex items-center gap-1 disabled:opacity-40"
            >
              <MdNavigateBefore size={18} /> Previous
            </button>
            <span className="text-xs md:text-sm font-semibold text-gray-700">
              Page {page} of {totalPages}
            </span>
            <button 
              disabled={page === totalPages} 
              onClick={() => setPage(prev => Math.min(prev + 1, totalPages))} 
              className="btn btn-sm btn-outline flex items-center gap-1 disabled:opacity-40"
            >
              Next <MdNavigateNext size={18} />
            </button>
          </div>
        </>
      )}
    </div>
  );
}