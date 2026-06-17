import useAxios from '@/hook/useAxios';
import { useQuery } from '@tanstack/react-query';
import React from 'react';
import { MdCheckCircleOutline, MdBlock } from 'react-icons/md';
import Swal from 'sweetalert2';

const PaidBtns = ({ client, refetch, className = "" }) => {
  const axiosInstance = useAxios();

  // ১. এই ক্লায়েন্টের এই মাসের পেমেন্ট স্ট্যাটাস চেক করা
  const { data: paymentStatus, refetch: checkPaidRefetch, isLoading } = useQuery({
    queryKey: ['check-payment', client?._id],
    queryFn: async () => {
      const res = await axiosInstance.get(`/check-payment/${client?._id}`);
      return res.data;
    },
    enabled: !!client?._id,
  });

  const isAlreadyPaid = paymentStatus?.isPaid;

  // ২. পপআপ দেখানো এবং সাবমিট করার ফাংশন
  const handlePaymentPopup = () => {
    Swal.fire({
      title: 'Confirm Payment',
      html: `
        <div style="text-align: left; font-family: sans-serif;">
          <div style="margin-bottom: 12px;">
            <label style="font-weight: 600; font-size: 13px; color: #4B5563;">Client Name:</label>
            <input type="text" value="${client?.client_name}" disabled class="swal2-input" style="margin: 4px 0 0 0; width: 100%; background: #F3F4F6; cursor: not-allowed; font-size: 14px; height: 38px;" />
          </div>
          <div style="margin-bottom: 12px;">
            <label style="font-weight: 600; font-size: 13px; color: #4B5563;">IP Address:</label>
            <input type="text" value="${client?.ip || 'N/A'}" disabled class="swal2-input" style="margin: 4px 0 0 0; width: 100%; background: #F3F4F6; cursor: not-allowed; font-size: 14px; height: 38px;" />
          </div>
          <div style="margin-bottom: 12px;">
            <label style="font-weight: 600; font-size: 13px; color: #4B5563;">Bill Amount (৳):</label>
            <input type="text" value="${client?.amount || 0}" disabled class="swal2-input" style="margin: 4px 0 0 0; width: 100%; background: #F3F4F6; cursor: not-allowed; font-size: 14px; height: 38px; font-weight: bold;" />
          </div>
          <div style="margin-bottom: 4px;">
            <label style="font-weight: 600; font-size: 13px; color: #374151;">Receipt No <span style="color: red;">*</span>:</label>
            <input type="text" id="receiptNo" placeholder="Enter Receipt Number Manually" class="swal2-input" style="margin: 4px 0 0 0; width: 100%; font-size: 14px; height: 38px;" />
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Submit Payment',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#10B981',
      cancelButtonColor: '#EF4444',
      focusConfirm: false,
      // পপআপের ইনপুট ভ্যালিডেশন এবং ডেটা রিড করা
      preConfirm: () => {
        const receiptNo = Swal.getPopup().querySelector('#receiptNo').value.trim();
        if (!receiptNo) {
          Swal.showValidationMessage(`Please enter a Receipt Number`);
        }
        return { receiptNo }; // এখান থেকে ডাটা পরবর্তী .then এ যাবে
      }
    }).then(async (result) => {
      // যদি ইউজার সাবমিট বাটনে ক্লিক করে এবং রসিদ নম্বর দেয়
      if (result.isConfirmed) {
        const { receiptNo } = result.value;

        try {
          // ব্যাকএন্ডে রিকোয়েস্ট পাঠানো হচ্ছে (বডিতে receiptNo এবং amount দেওয়া হলো)
          const res = await axiosInstance.post(`/payments?paidId=${client?._id}`, {
            amount: client?.amount,
            receiptNo: receiptNo, 
          });

          if (res.data?.success) {
            Swal.fire({
              title: "Success!",
              text: `Bill paid successfully with Receipt No: ${receiptNo}`,
              icon: "success",
              confirmButtonColor: '#10B981',
            });

            // বাটন ও মেইন ডাটা টেবিল রিফ্রেশ করা
            checkPaidRefetch();
            if (refetch) refetch();
          }
        } catch (error) {
          console.error("Payment Error:", error);
          const errMsg = error.response?.data?.message || "Something went wrong!";
          Swal.fire({
            title: "Error!",
            text: errMsg,
            icon: "error",
            confirmButtonColor: '#EF4444',
          });
        }
      }
    });
  };

  if (isLoading) {
    return (
      <button disabled className="btn btn-xs bg-gray-200 text-gray-400 cursor-not-allowed">
        Checking...
      </button>
    );
  }

  return (
    <button 
      onClick={handlePaymentPopup} // ক্লিকে এখন পপআপ ওপেন হবে
      disabled={isAlreadyPaid}
      className={`btn btn-xs text-white flex items-center justify-center gap-1 transition-all ${
        isAlreadyPaid 
          ? 'bg-gray-400 hover:bg-gray-400 border-none cursor-not-allowed text-gray-200' 
          : `btn-success ${className}`
      }`}
    >
      {isAlreadyPaid ? (
        <>
          <MdBlock size={14} /> Already Paid
        </>
      ) : (
        <>
          <MdCheckCircleOutline size={14} /> Paid
        </>
      )}
    </button>
  );
};

export default PaidBtns;