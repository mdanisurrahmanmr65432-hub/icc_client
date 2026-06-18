'use client'
import useAxios from '@/hook/useAxios';
import Link from 'next/link';
import React from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

const AddClient = () => {
  const instance = useAxios();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  // Form Submit Handler
  const onSubmit = async (data) => {
    const formattedData = {
      ...data,
      sl: Number(data.sl),
      amount: Number(data.amount),
    };

    try {
      // ব্যাকএন্ডে ডাটা পোস্ট করা হচ্ছে
      const res = await instance.post('insert-client', formattedData);
      
      // ⚡ ফিক্স: আপনার ব্যাকএন্ড রেসপন্স { success: true, result: { insertedId: "..." } } ফরম্যাটে ডাটা পাঠায়
      if (res?.data?.success && res?.data?.result?.insertedId) {
        toast.success('Client registered successfully!');
        reset(); // সফল হলে ফর্ম রিসেট হবে
      } else {
        toast.error('Something went wrong!');
      }
    } catch (error) {
      // ⚡ ফিক্স: ব্যাকএন্ড থেকে ডুপ্লিকেট আইপি/মোবাইল এরর (400) আসলে তা এখানে ধরা পড়বে
      if (error.response && error.response.data) {
        toast.error(error.response.data.message || 'Client already exists!');
      } else {
        toast.error('Failed to connect to server!');
      }
      console.error('Insert Client Error:', error);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6 bg-white rounded-xl shadow-md border border-gray-100 my-6">
      {/* Form Header */}
      <div className="mb-6 border-b border-gray-100 pb-4">
        <h2 className="text-xl md:text-2xl font-bold text-gray-800">
          Add New ISP Client
        </h2>
        <p className="text-xs md:text-sm text-gray-500 mt-1 mb-3">
          Fill in the information below to register a new network subscriber.
        </p>
        <Link href={'/'} className='btn btn-info text-white btn-sm md:btn-md'>Back</Link>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* SL Field */}
          <div className="form-control w-full">
            <label className="label py-1">
              <span className="label-text font-medium text-gray-700">Serial No (SL) *</span>
            </label>
            <input
              type="number"
              placeholder="e.g. 21"
              className={`input input-bordered w-full text-sm ${errors.sl ? 'input-error' : ''}`}
              {...register('sl', { required: 'Serial number is required' })}
            />
            {errors.sl && <span className="text-xs text-red-500 mt-1">{errors.sl.message}</span>}
          </div>

          {/* Client Name Field */}
          <div className="form-control w-full">
            <label className="label py-1">
              <span className="label-text font-medium text-gray-700">Client Name *</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Aysha"
              className={`input input-bordered w-full text-sm ${errors.client_name ? 'input-error' : ''}`}
              {...register('client_name', { required: 'Client name is required' })}
            />
            {errors.client_name && <span className="text-xs text-red-500 mt-1">{errors.client_name.message}</span>}
          </div>

          {/* Mobile Field */}
          <div className="form-control w-full">
            <label className="label py-1">
              <span className="label-text font-medium text-gray-700">Mobile Number *</span>
            </label>
            <input
              type="tel"
              placeholder="e.g. 01905022766"
              className={`input input-bordered w-full text-sm font-mono ${errors.mobile ? 'input-error' : ''}`}
              {...register('mobile', {
                required: 'Mobile number is required',
                pattern: { value: /^[0-9]+$/, message: 'Please enter a valid mobile number' },
              })}
            />
            {errors.mobile && <span className="text-xs text-red-500 mt-1">{errors.mobile.message}</span>}
          </div>

          {/* IP Field */}
          <div className="form-control w-full">
            <label className="label py-1">
              <span className="label-text font-medium text-gray-700">IP Address / Username *</span>
            </label>
            <input
              type="text"
              placeholder="e.g. 0018-Aysha"
              className={`input input-bordered w-full text-sm font-mono ${errors.ip ? 'input-error' : ''}`}
              {...register('ip', { required: 'IP Address/Username is required' })}
            />
            {errors.ip && <span className="text-xs text-red-500 mt-1">{errors.ip.message}</span>}
          </div>

          {/* Zone Field */}
          <div className="form-control w-full">
            <label className="label py-1">
              <span className="label-text font-medium text-gray-700">Zone *</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Gazipura Kazi Bari"
              className={`input input-bordered w-full text-sm ${errors.zone ? 'input-error' : ''}`}
              {...register('zone', { required: 'Zone is required' })}
            />
            {errors.zone && <span className="text-xs text-red-500 mt-1">{errors.zone.message}</span>}
          </div>

          {/* Speed Field */}
          <div className="form-control w-full">
            <label className="label py-1">
              <span className="label-text font-medium text-gray-700">Package Speed *</span>
            </label>
            <input
              type="text"
              placeholder="e.g. 20MB"
              className={`input input-bordered w-full text-sm ${errors.speed ? 'input-error' : ''}`}
              {...register('speed', { required: 'Speed package is required' })}
            />
            {errors.speed && <span className="text-xs text-red-500 mt-1">{errors.speed.message}</span>}
          </div>

          {/* Amount Field */}
          <div className="form-control w-full">
            <label className="label py-1">
              <span className="label-text font-medium text-gray-700">Bill Amount (৳) *</span>
            </label>
            <input
              type="number"
              placeholder="e.g. 500"
              className={`input input-bordered w-full text-sm ${errors.amount ? 'input-error' : ''}`}
              {...register('amount', {
                required: 'Bill amount is required',
                min: { value: 0, message: 'Amount cannot be negative' },
              })}
            />
            {errors.amount && <span className="text-xs text-red-500 mt-1">{errors.amount.message}</span>}
          </div>

          {/* Connection Date Field */}
          <div className="form-control w-full">
            <label className="label py-1">
              <span className="label-text font-medium text-gray-700">Connection Date *</span>
            </label>
            <input
              type="date"
              className={`input input-bordered w-full text-sm ${errors.connection_date ? 'input-error' : ''}`}
              {...register('connection_date', { required: 'Connection date is required' })}
            />
            {errors.connection_date && <span className="text-xs text-red-500 mt-1">{errors.connection_date.message}</span>}
          </div>
        </div>

        {/* Address Field */}
        <div className="form-control w-full">
          <label className="label py-1">
            <span className="label-text font-medium text-gray-700">Full Address *</span>
          </label>
          <textarea
            placeholder="e.g. Beside Kazi Bari Primary School Gazipura"
            rows="2"
            className={`textarea textarea-bordered w-full text-sm ${errors.address ? 'textarea-error' : ''}`}
            {...register('address', { required: 'Address is required' })}
          ></textarea>
          {errors.address && <span className="text-xs text-red-500 mt-1">{errors.address.message}</span>}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
          <button
            type="button"
            onClick={() => reset()}
            className="btn btn-ghost border border-gray-300 text-gray-600 hover:bg-gray-50 px-6 btn-sm md:btn-md"
          >
            Reset
          </button>
          <button
            type="submit"
            className="btn btn-primary text-white px-8 btn-sm md:btn-md"
          >
            Save Client
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddClient;