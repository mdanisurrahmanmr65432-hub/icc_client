'use client';
import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import useAxios from '@/hook/useAxios';
import { MdHandshake } from 'react-icons/md';

const PromiseBtn = ({ client, refetch }) => {
  const instance = useAxios();
  const [isOpen, setIsOpen] = useState(false);
  const [promiseDate, setPromiseDate] = useState('');
  const [promiseNote, setPromiseNote] = useState('');

  // 🔍 চেক করা হচ্ছে এই ইউজারের অলরেডি কোনো প্রমিজ ডাটা ব্যাকএন্ড থেকে এসেছে কিনা
  const hasPromise = client?.promiseInfo || null;

  // মোডাল ওপেন হলে যদি আগের প্রমিজ থাকে, তবে ইনপুট ফিল্ডে ডাটা অটো-লোড হবে
  useEffect(() => {
    if (isOpen) {
      if (hasPromise) {
        setPromiseDate(hasPromise.promise_date || '');
        setPromiseNote(hasPromise.promise_note || '');
      } else {
        setPromiseDate('');
        setPromiseNote('');
      }
    }
  }, [isOpen, hasPromise]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!promiseDate) {
      return Swal.fire({ icon: 'warning', title: 'Please select a date!', confirmButtonColor: '#3B82F6' });
    }

    try {
      // 👉 ফিক্স: বডিতে এখন ip-ও পাঠানো হচ্ছে ব্যাকএন্ডের রিকোয়ারমেন্ট অনুযায়ী
      const res = await instance.patch('/update-promise-date', {
        id: client?._id,
        client_name: client?.client_name,
        ip: client?.ip || 'N/A', // ⚡ আইপি ডাটা পাঠানো হচ্ছে
        address: client?.zone || client?.address || client?.location || 'N/A', 
        promise_date: promiseDate,
        promise_note: promiseNote
      });

      if (res.data?.success || res.status === 200) {
        Swal.fire({
          icon: 'success',
          title: hasPromise ? 'Promise Updated!' : 'Promise Recorded!',
          text: `Promise date successfully saved for ${client?.client_name}`,
          confirmButtonColor: '#10B981'
        });
        setIsOpen(false);
        if (refetch) refetch(); // মেইন টেবিল রিফেচ হবে, ফলে স্টেট সাথে সাথে চেঞ্জ হবে
      }
    } catch (error) {
      console.error("Promise API Error:", error);
      Swal.fire({
        icon: 'error',
        title: 'Failed!',
        text: error.response?.data?.message || 'Something went wrong.',
        confirmButtonColor: '#EF4444'
      });
    }
  };

  return (
    <>
      {/* 🟢/🟡 ডাইনামিক প্রমিজ বাটন */}
      <button 
        onClick={() => setIsOpen(true)} 
        className={`btn btn-xs font-semibold flex items-center gap-1 shadow-sm transition-all duration-200 ${
          hasPromise 
            ? 'bg-emerald-500 hover:bg-emerald-600 text-white border-none' 
            : 'btn-warning text-gray-800' 
        }`}
      >
        <MdHandshake size={13} /> 
        {hasPromise ? 'Promised' : 'Promise'}
      </button>

      {/* 🗓️ প্রমিজ ইনপুট মোডাল */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 text-left backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            <div className={`text-white px-5 py-3 flex justify-between items-center ${hasPromise ? 'bg-emerald-500' : 'bg-amber-500'}`}>
              <h3 className="font-bold flex items-center gap-2">
                <MdHandshake /> {hasPromise ? 'Update Payment Promise' : 'New Payment Promise'}
              </h3>
              <button type="button" onClick={() => setIsOpen(false)} className="text-white hover:text-gray-200 text-xl font-bold">&times;</button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 text-sm flex flex-col gap-1">
                <p className="text-gray-600">Client: <span className="font-bold text-gray-800">{client?.client_name}</span></p>
                {/* ⚡ মোডালে আইপি অ্যাড্রেস শো করা হচ্ছে */}
                <p className="text-xs text-gray-500">IP Address: <span className="font-mono bg-gray-200 px-1.5 py-0.5 rounded text-gray-700 font-semibold">{client?.ip || 'N/A'}</span></p>
              </div>
              
              <div>
                {/* অলরেডি ডেট থাকলে সেটি ছোট করে মনে করিয়ে দেওয়ার জন্য */}
                {hasPromise && (
                  <p className="text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded-md mb-3 border border-emerald-100 font-medium">
                    Current Promise: <strong>{hasPromise.promise_date}</strong>
                  </p>
                )}

                <label className="block text-xs font-semibold text-gray-600 mb-1">Expected Payment Date</label>
                <input 
                  type="date" 
                  value={promiseDate} 
                  onChange={(e) => setPromiseDate(e.target.value)} 
                  className={`w-full px-3 py-2 text-sm bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 text-gray-800 ${
                    hasPromise ? 'border-emerald-300 focus:ring-emerald-500' : 'border-gray-300 focus:ring-amber-500'
                  }`}
                  required 
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Short Note / Follow up</label>
                <textarea 
                  value={promiseNote} 
                  onChange={(e) => setPromiseNote(e.target.value)} 
                  placeholder="e.g., Will pay via bKash / Told to collect after 5 PM" 
                  rows="2" 
                  className={`w-full px-3 py-2 text-sm bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 text-gray-800 ${
                    hasPromise ? 'border-emerald-300 focus:ring-emerald-500' : 'border-gray-300 focus:ring-amber-500'
                  }`}
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 border-t pt-3 mt-1">
                <button type="button" onClick={() => setIsOpen(false)} className="btn btn-sm btn-outline">Cancel</button>
                <button 
                  type="submit" 
                  className={`btn btn-sm text-white border-none ${
                    hasPromise ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-amber-500 hover:bg-amber-600'
                  }`}
                >
                  {hasPromise ? 'Update Promise' : 'Save Promise'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default PromiseBtn;