'use client';
import React from 'react';
import { MdPrint, MdPictureAsPdf } from 'react-icons/md';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function ClientReportActions({ filteredData }) {
  
  // ১. প্রিন্ট করার ফাংশন (Full IP/ID সহ আপডেটেড)
  const handlePrint = () => {
    const newWindow = window.open('', '_blank');
    newWindow.document.write(`
      <html>
        <head>
          <title>ISP Client Report</title>
          <style>
            body { font-family: sans-serif; padding: 20px; color: #333; }
            h2 { text-align: center; margin-bottom: 5px; color: #1E3A8A; }
            p { text-align: center; font-size: 12px; color: #666; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; font-size: 12px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; vertical-align: top; }
            th { background-color: #f3f4f6; font-weight: bold; }
            .text-center { text-align: center; }
            .text-right { text-align: right; }
          </style>
        </head>
        <body>
          <h2>ICC Communication</h2>
          <p>Filtered Client Subscriber Report - Generated on: ${new Date().toLocaleDateString()}</p>
          <table>
            <thead>
              <tr>
                <th class="text-center">SL</th>
                <th>Name</th>
                <th>ID</th>
                <th>Mobile</th>
                <th>Address</th>
                <th class="text-right">Amount</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              ${filteredData.map(client => `
                <tr>
                  <td class="text-center">${client?.sl || ''}</td>
                  <td style="font-weight: bold;">${client?.client_name || ''}</td>
                  <td>${client?.ip || ''}</td> <!-- এখানে কোনো slice ছাড়াই full IP (যেমন: 0001-Toyub) আসবে -->
                  <td>${client?.mobile || ''}</td>
                  <td style="max-width: 200px; word-wrap: break-word;">${client?.address || ''}</td>
                  <td class="text-right">৳${client?.amount || 0}</td>
                  <td></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `);
    newWindow.document.close();
    newWindow.print();
  };

  // ২. jsPDF ফাংশন (Full IP/ID সহ আপডেটেড)
  const handleDownloadPDF = () => {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    // পিডিএফ হেডার টেক্সট
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(30, 58, 138);
    doc.text('ICC Communication', doc.internal.pageSize.getWidth() / 2, 15, { align: 'center' });

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(107, 114, 128);
    doc.text(`Subscriber Report (Filtered Data) - Generated: ${new Date().toLocaleDateString()}`, doc.internal.pageSize.getWidth() / 2, 21, { align: 'center' });

    // টেবিলের ডাটা ম্যাপিং
    const tableRows = filteredData.map(client => [
      client?.sl || '',
      client?.client_name || '',
      client?.ip || '', // এখানে কোনো slice ছাড়াই full IP (যেমন: 0001-Toyub) সরাসরি বসে যাবে
      client?.mobile || '',
      client?.address || '',
      `TK ${client?.amount || 0}`,
      '' // Remarks বক্স খালি
    ]);

    // autotable কনফিগারেশন
    doc.autoTable({
      startY: 28,
      head: [['SL', 'Name', 'ID', 'Mobile', 'Address', 'Amount', 'Remarks']],
      body: tableRows,
      theme: 'grid',
      headStyles: {
        fillColor: [31, 41, 55],
        textColor: [255, 255, 255],
        fontSize: 10,
        fontStyle: 'bold',
        halign: 'left'
      },
      styles: {
        fontSize: 9,
        cellPadding: 3,
        overflow: 'linecap',
        valign: 'top'
      },
      columnStyles: {
        0: { cellWidth: 12, halign: 'center' },
        1: { cellWidth: 40, fontStyle: 'bold' },
        2: { cellWidth: 30 },                   // ID/IP কলামের জন্য একটু স্পেস বাড়িয়ে ৩০ করা হলো যেন নামসহ ধরে
        3: { cellWidth: 32 },
        4: { cellWidth: 'auto' },               // বড় টেক্সট হলে অটো নিচে নামবে (Wrap হবে)
        5: { cellWidth: 25, halign: 'right' },
        6: { cellWidth: 35 }
      },
      didParseCell: function (data) {
        if (data.section === 'head') {
          if (data.column.index === 0) data.cell.styles.halign = 'center';
          if (data.column.index === 5) data.cell.styles.halign = 'right';
        }
      }
    });

    doc.save(`Client_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <div className="flex gap-2 w-full sm:w-auto">
      <button
        onClick={handlePrint}
        disabled={filteredData.length === 0}
        className="btn btn-sm btn-outline btn-neutral flex items-center gap-1.5 px-3 py-2 text-xs md:text-sm font-medium rounded-lg"
      >
        <MdPrint size={16} /> Print List
      </button>
      
      <button
        onClick={handleDownloadPDF}
        disabled={filteredData.length === 0}
        className="btn btn-sm bg-red-600 hover:bg-red-700 text-white border-none flex items-center gap-1.5 px-3 py-2 text-xs md:text-sm font-medium rounded-lg"
      >
        <MdPictureAsPdf size={16} /> Download PDF
      </button>
    </div>
  );
}