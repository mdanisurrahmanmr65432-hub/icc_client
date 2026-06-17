'use client';
import React, { useState } from 'react';
import Swal from 'sweetalert2';
import useAxios from '@/hook/useAxios';
import { MdEdit } from 'react-icons/md';

const EditClientBtn = ({ client, refetch }) => {
  const instance = useAxios();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    client_name: client?.client_name || '',
    mobile: client?.mobile || '',
    ip: client?.ip || '',
    address: client?.address || '',
    zone: client?.zone || '',
    speed: client?.speed || '',
    amount: client?.amount || 0,
  });

  // 🔐 পাসওয়ার্ড চেক করার ফাংশন
  const handleVerifyPassword = async () => {
    const { value: password } = await Swal.fire({
      title: 'Enter Admin Password',
      input: 'password',
      inputPlaceholder: 'Enter password to edit client',
      inputAttributes: {
        autocapitalize: 'off',
        autocorrect: 'off'
      },
      showCancelButton: true,
      confirmButtonColor: '#3B82F6',
    });

    if (password === '232601') {
      setIsOpen(true); // পাসওয়ার্ড মিললে এডিট মোডাল ওপেন হবে
    } else if (password) {
      Swal.fire({
        icon: 'error',
        title: 'Wrong Password!',
        text: 'You are not authorized to edit this client.',
        confirmButtonColor: '#EF4444'
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 📝 ডাটা আপডেট সাবমিট ফাংশন
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // আপনার ব্যাকএন্ডের API রাউট অনুযায়ী মিলিয়ে নেবেন (যেমন: /update-client-data)
      const res = await instance.patch(`/update-client`, {
        id: client?._id,
        ...formData
      });

      if (res.status === 200 || res.data) {
        Swal.fire({
          icon: 'success',
          title: 'Updated!',
          text: 'Client information updated successfully.',
          confirmButtonColor: '#10B981'
        });
        setIsOpen(false);
        refetch(); // মেইন টেবিল ডাটা রিফেচ করবে
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Failed!',
        text: 'Something went wrong while updating.',
        confirmButtonColor: '#EF4444'
      });
    }
  };

  return (
    <>
      {/* এডিট ট্রিগার বাটন */}
      <button 
        onClick={handleVerifyPassword} 
        className="btn btn-xs btn-info text-white font-medium flex items-center gap-1"
      >
        <MdEdit size={12} /> Edit
      </button>

      {/* 📑 ডাইনামিক এডিট মোডাল পপআপ */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fadeIn text-left">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-100">
            {/* মোডাল হেডার */}
            <div className="bg-gray-100 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-800">Edit Client: {client?.client_name}</h3>
              <button 
                onClick={() => setIsOpen(false)} 
                className="text-gray-500 hover:text-gray-800 text-xl font-bold"
              >
                &times;
              </button>
            </div>

            {/* মোডাল বডি বা ফর্ম */}
            <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Client Name</label>
                <input type="text" name="client_name" value={formData.client_name} onChange={handleChange} className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800" required />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Mobile Number</label>
                <input type="text" name="mobile" value={formData.mobile} onChange={handleChange} className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800" required />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">IP Address</label>
                <input type="text" name="ip" value={formData.ip} onChange={handleChange} className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800" required />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Zone / Area</label>
                <input type="text" name="zone" value={formData.zone} onChange={handleChange} className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Speed (e.g. 10MB)</label>
                <input type="text" name="speed" value={formData.speed} onChange={handleChange} className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Monthly Amount (৳)</label>
                <input type="number" name="amount" value={formData.amount} onChange={handleChange} className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800" required />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-600 mb-1">Full Address</label>
                <textarea name="address" value={formData.address} onChange={handleChange} rows="2" className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800" required></textarea>
              </div>

              {/* মোডাল ফুটার একশন বাটন */}
              <div className="sm:col-span-2 flex justify-end gap-2 border-t border-gray-100 pt-4 mt-2">
                <button type="button" onClick={() => setIsOpen(false)} className="btn btn-sm btn-outline">Cancel</button>
                <button type="submit" className="btn btn-sm btn-primary text-white">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default EditClientBtn;