'use client';
import useAxios from '@/hook/useAxios';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import React, { useState } from 'react';
import { MdLocalPhone, MdNavigateBefore, MdNavigateNext } from 'react-icons/md';
import Swal from 'sweetalert2';
import ClientReportActions from '@/components/ClientReportActions'; 
import PaidBtns from '@/components/PaidBtns';
import EditClientBtn from '@/components/EditClientBtn'; 
import PromiseBtn from '@/components/PromiseBtn';
import ReportBtn from '@/components/ReportBtn';

export default function ResponsiveClientList() {
  const instance = useAxios();
  
  const [filters, setFilters] = useState({
    name: '',
    mobile: '',
    ip: '',
    address: '',
    status: '' // ⚡ স্ট্যাটাস ফিল্টারিং এর জন্য নতুন স্টেট যুক্ত করা হলো
  });
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data: allClients = [], refetch, isLoading } = useQuery({
    queryKey: ['client-tables'],
    queryFn: async () => {
      const res = await instance.get('/get-client-data');
      return res.data; 
    },
  });

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setPage(1); 
  };

  // 📝 ক্লায়েন্ট সাইড ফিল্টারিং (স্ট্যাটাসসহ আপডেট করা হয়েছে)
  const filteredClients = allClients.filter(client => {
    const matchesName = client?.client_name?.toLowerCase().includes(filters.name.toLowerCase());
    const matchesMobile = client?.mobile?.toLowerCase().includes(filters.mobile.toLowerCase());
    const matchesIp = client?.ip?.toLowerCase().includes(filters.ip.toLowerCase());
    const matchesAddress = client?.address?.toLowerCase().includes(filters.address.toLowerCase());
    
    // ⚡ স্ট্যাটাস ফিল্টার সিলেক্ট করা থাকলে মিলিয়ে দেখবে, খালি থাকলে সব দেখাবে
    const matchesStatus = filters.status === '' || client?.status === filters.status;
    
    return matchesName && matchesMobile && matchesIp && matchesAddress && matchesStatus;
  });

  const totalClients = filteredClients.length;
  const totalPages = Math.ceil(totalClients / limit) || 1;
  
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const clientsData = filteredClients.slice(startIndex, endIndex);

  const handleStatusUpdate = async (id, status) => {
    const sat = status === 'Active' ? 'Inactive' : 'Active';
    await instance.patch('update-status', { id, status: sat });
    refetch();
  };

  const handleMarkPaid = (clientName) => {
    Swal.fire({
      title: "Success!",
      text: `Bill for ${clientName} has been marked as Paid (Dummy).`,
      icon: "success",
      confirmButtonColor: '#10B981',
    });
  };

  return (
    <div>
      <div className="container mx-auto p-4 md:p-6 bg-gray-50 min-h-screen">
        {/* Header section */}
        <div className="mb-6 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-800">
              ISP Client Management
            </h1>
            <p className="text-xs md:text-sm text-gray-500">
              Manage network subscribers layout optimized for all screens
            </p>
          </div>

          {/* 🔍 সার্চ ফিল্ডসমূহ (স্ট্যাটাস ড্রপডাউন গ্রিডে সেট করা হয়েছে) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3 w-full lg:w-auto flex-grow max-w-5xl">
            <input
              type="text"
              name="name"
              value={filters.name}
              onChange={handleFilterChange}
              placeholder="Search by Name..."
              className="w-full px-3 py-1.5 md:py-2 text-xs md:text-sm bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
            />
            <input
              type="text"
              name="mobile"
              value={filters.mobile}
              onChange={handleFilterChange}
              placeholder="Search by Mobile..."
              className="w-full px-3 py-1.5 md:py-2 text-xs md:text-sm bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
            />
            <input
              type="text"
              name="ip"
              value={filters.ip}
              onChange={handleFilterChange}
              placeholder="Search by IP..."
              className="w-full px-3 py-1.5 md:py-2 text-xs md:text-sm bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
            />
            <input
              type="text"
              name="address"
              value={filters.address}
              onChange={handleFilterChange}
              placeholder="Search by Address..."
              className="w-full px-3 py-1.5 md:py-2 text-xs md:text-sm bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
            />
            
            {/* ⚡ নতুন যুক্ত করা স্ট্যাটাস ফিল্টারিং ড্রপডাউন */}
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="w-full px-3 py-1.5 md:py-2 text-xs md:text-sm bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 font-medium cursor-pointer"
            >
              <option value="">All Status</option>
              <option value="Active">🟢 Active</option>
              <option value="Inactive">🔴 Inactive</option>
            </select>
          </div>

          <div className="bg-blue-600 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-lg shadow text-xs md:text-sm font-medium text-center whitespace-nowrap self-stretch sm:self-auto flex items-center justify-center">
            Total Clients: {totalClients}
          </div>
        </div>

        {/* অ্যাকশন বাটন সেকশন */}
        <div className="mb-4 flex flex-wrap justify-between items-center gap-3">
          <Link href={'/post'} className="btn btn-info text-white btn-sm md:btn-md">
            Add New
          </Link>
          <ClientReportActions filteredData={filteredClients} />
        </div>

        {/* --- LOADING ANIMATION --- */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] bg-white rounded-xl shadow-md border border-gray-100">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mb-4"></div>
            <p className="text-gray-500 font-medium animate-pulse text-sm">Loading Client Data, Please wait...</p>
          </div>
        ) : clientsData.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] bg-white rounded-xl shadow-md border border-gray-100 p-6">
            <p className="text-gray-400 text-lg font-semibold">No Clients Found</p>
            <p className="text-gray-400 text-xs mt-1">Try adjusting your search criteria</p>
          </div>
        ) : (
          <>
            {/* 1. Mobile Box/Card View */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
              {clientsData.map(client => (
                <div key={client?._id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs font-mono text-gray-400 mr-1">#{client?.sl}</span>
                      <h3 className="text-base font-bold text-gray-800 inline-block">{client?.client_name}</h3>
                      <p className="text-xs text-gray-400 mt-0.5">{client.zone}</p>
                    </div>
                    <span onClick={() => handleStatusUpdate(client?._id, client?.status)} className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border cursor-pointer ${client?.status === 'Active' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>{client?.status}</span>
                  </div>
                  
                  <div className="text-xs flex flex-col gap-1.5 text-gray-500 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-700">IP Address:</span>
                      <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded font-mono text-xs font-medium">{client?.ip || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-700">Mobile:</span>
                      {client?.mobile ? (
                        <a 
                          href={`tel:${client.mobile}`} 
                          className="text-blue-600 hover:underline flex items-center gap-1 font-mono text-xs bg-white border border-gray-200 px-2 py-0.5 rounded shadow-sm"
                        >
                          <MdLocalPhone size={12} className="text-green-500" /> {client.mobile}
                        </a>
                      ) : (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-700">Amount:</span>
                      <span className="text-gray-900 font-bold">৳{client?.amount || 0}</span>
                    </div>
                    {client?.promise_date && (
                      <div className="flex justify-between items-center bg-amber-50 p-1.5 rounded border border-amber-100 text-amber-800">
                        <span className="font-semibold">Promise Date:</span>
                        <span className="font-medium text-xs">{client?.promise_date}</span>
                      </div>
                    )}
                  </div>

                  <div className="text-xs flex flex-col gap-2 text-gray-500">
                    <p><strong className="text-gray-700">Address:</strong> {client?.address}</p>
                    {client?.promise_note && <p className="text-xs italic text-gray-400"><strong className="text-gray-600">Note:</strong> {client?.promise_note}</p>}
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100 justify-end">
                    {/* ⚡ নতুন রিপোর্ট বাটন */}
                     <ReportBtn client={client} />
                    <EditClientBtn client={client} refetch={refetch} />
                    <PromiseBtn client={client} refetch={refetch} />
                    <PaidBtns client={client} refetch={refetch} />
                  </div>
                </div>
              ))}
            </div>

            {/* 2. Desktop Table View */}
            <div id="printable-client-table" className="hidden md:block bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-100 text-gray-700 text-xs uppercase font-semibold tracking-wider border-b border-gray-200">
                      <th className="py-4 px-4 text-center">SL</th>
                      <th className="py-4 px-4">Client Name</th>
                      <th className="py-4 px-4">Address</th>
                      <th className="py-4 px-4">Mobile</th>
                      <th className="py-4 px-4">IP Address</th>
                      <th className="py-4 px-4">Zone</th>
                      <th className="py-4 px-4 text-center">Speed</th>
                      <th className="py-4 px-4 text-right">Amount</th>
                      <th className="py-4 px-4 text-center">Conn. Date</th>
                      <th className="py-4 px-4 text-center">Status</th>
                      <th className="py-4 px-4">Notes</th>
                      <th className="py-4 px-4 text-center no-print">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm text-gray-600">
                    {clientsData.map(client => (
                      <tr key={client?._id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4 text-center font-medium text-gray-400">{client?.sl}</td>
                        <td className="py-3 px-4 font-semibold text-gray-800">{client?.client_name}</td>
                        <td className="py-3 px-4 max-w-xs truncate" title={client?.address}>{client?.address}</td>
                        <td className="py-3 px-4 font-mono text-xs">
                          <a href={`tel:${client.mobile}`} className="text-blue-600 hover:underline flex items-center gap-1">
                            <MdLocalPhone className="text-gray-400" /> {client.mobile}
                          </a>
                        </td>
                        <td className="py-3 px-4 font-mono text-xs text-blue-600"><span className="bg-blue-50 rounded px-1.5 py-0.5">{client?.ip}</span></td>
                        <td className="py-3 px-4 text-gray-500">{client.zone}</td>
                        <td className="py-3 px-4 text-center"><span className="bg-purple-100 text-purple-700 font-semibold px-2 py-1 rounded text-xs">{client?.speed}</span></td>
                        <td className="py-3 px-4 text-right font-semibold text-gray-900">৳{client?.amount}</td>
                        <td className="py-3 px-4 text-center text-xs text-gray-500">{client?.connection_date}</td>
                        <td className="py-3 px-4 text-center">
                          <span onClick={() => handleStatusUpdate(client?._id, client?.status)} className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border cursor-pointer ${client?.status === 'Active' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>{client?.status}</span>
                        </td>
                        <td className="py-3 px-4 text-xs max-w-[180px] text-gray-500 italic">
                          {client?.promise_date ? (
                            <span className="block bg-amber-50 text-amber-800 p-1.5 rounded border border-amber-100">
                              Promise: {client.promise_date} <br />
                              <small className="text-gray-500">{client?.promise_note}</small>
                            </span>
                          ) : (
                            <span className="block bg-yellow-50 text-yellow-800 p-1.5 rounded border border-yellow-100 truncate">Package upgrade next month.</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center no-print">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* ⚡ নতুন রিপোর্ট বাটন */}
                            <ReportBtn client={client} />
                            <EditClientBtn client={client} refetch={refetch} />
                            <PromiseBtn client={client} refetch={refetch} />
                            <PaidBtns client={client} refetch={refetch} />
                            <button onClick={() => handleMarkPaid(client?.client_name)} className="btn btn-xs btn-success text-white font-medium">Paid</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 3. প্যাগিনেশন */}
            <div className="flex justify-center items-center gap-4 mt-6 pb-10">
              <button disabled={page === 1} onClick={() => setPage(prev => prev - 1)} className="btn btn-sm btn-outline flex items-center gap-1"><MdNavigateBefore size={18} /> Previous</button>
              <span className="text-xs md:text-sm font-semibold text-gray-700">Page {page} of {totalPages}</span>
              <button disabled={page === totalPages} onClick={() => setPage(prev => prev + 1)} className="btn btn-sm btn-outline flex items-center gap-1">Next <MdNavigateNext size={18} /></button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}