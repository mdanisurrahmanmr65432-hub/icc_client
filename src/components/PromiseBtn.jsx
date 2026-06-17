'use client';
import React, { useState } from 'react';
import Swal from 'sweetalert2';
import useAxios from '@/hook/useAxios';
import { MdHandshake } from 'react-icons/md';

const PromiseBtn = ({ client, refetch }) => {
  const instance = useAxios();
  const [isOpen, setIsOpen] = useState(false);
  const [promiseDate, setPromiseDate] = useState('');
  const [promiseNote, setPromiseNote] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!promiseDate) {
      return Swal.fire({ icon: 'warning', title: 'Please select a date!', confirmButtonColor: '#3B82F6' });
    }

    try {
      // 👉 ফিক্স: বডিতে এখন client_name এবং address/zone পাঠানো হচ্ছে ব্যাকএন্ডের রিকোয়ারমেন্ট অনুযায়ী
      const res = await instance.patch('/update-promise-date', {
        id: client?._id,
        client_name: client?.client_name,
        address: client?.zone || client?.address || client?.location || 'N/A', // লোকেশন ফলব্যাক
        promise_date: promiseDate,
        promise_note: promiseNote
      });

      if (res.data?.success || res.status === 200) {
        Swal.fire({
          icon: 'success',
          title: 'Promise Recorded!',
          text: `Promise date set for ${client?.client_name}`,
          confirmButtonColor: '#10B981'
        });
        setIsOpen(false);
        setPromiseDate('');
        setPromiseNote('');
        if (refetch) refetch(); // টেবিল রিফেচ করবে
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
      {/* প্রমিজ বাটন */}
      <button 
        onClick={() => setIsOpen(true)} 
        className="btn btn-xs btn-warning text-gray-800 font-medium flex items-center gap-1"
      >
        <MdHandshake size={12} /> Promise
      </button>

      {/* 🗓️ প্রমিজ ইনপুট মোডাল */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 text-left">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-amber-500 text-white px-5 py-3 flex justify-between items-center">
              <h3 className="font-bold flex items-center gap-2"><MdHandshake /> Payment Promise</h3>
              <button type="button" onClick={() => setIsOpen(false)} className="text-white hover:text-gray-200 text-xl font-bold">&times;</button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">Client: <span className="font-bold text-gray-800">{client?.client_name}</span></p>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Expected Payment Date</label>
                <input 
                  type="date" 
                  value={promiseDate} 
                  onChange={(e) => setPromiseDate(e.target.value)} 
                  className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-gray-800"
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
                  className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-gray-800"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 border-t pt-3">
                <button type="button" onClick={() => setIsOpen(false)} className="btn btn-sm btn-outline">Cancel</button>
                <button type="submit" className="btn btn-sm btn-primary bg-amber-500 hover:bg-amber-600 text-white border-none">Save Promise</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default PromiseBtn;