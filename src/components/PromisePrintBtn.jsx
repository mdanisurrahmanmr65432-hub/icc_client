'use client';
import React from 'react';
import { MdPrint } from 'react-icons/md';

export default function PromisePrintBtn({ item, index, page }) {
  const handlePrint = () => {
    // প্রিন্ট করার জন্য একটি ডাইনামিক হিডেন আইফ্রেম (iframe) তৈরি করা হচ্ছে
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow.document;

    // টোকেন বা স্লিপের জন্য একটি সুন্দর ক্লিন CSS ও HTML স্ট্রাকচার
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Promise Token - ${item?.client_name || 'Client'}</title>
          <style>
            body { font-family: 'Courier New', Courier, monospace; padding: 20px; color: #333; max-width: 400px; margin: 0 auto; }
            .header { text-align: center; border-b: 2px dashed #000; padding-bottom: 10px; margin-bottom: 15px; }
            .title { font-size: 18px; font-weight: bold; uppercase; margin: 5px 0; }
            .meta { font-size: 11px; color: #666; margin-bottom: 5px; }
            .info-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            .info-table td { padding: 6px 0; font-size: 13px; vertical-align: top; }
            .info-table td.label { font-weight: bold; width: 40%; }
            .note-box { border: 1px solid #ccc; padding: 10px; margin-top: 15px; font-style: italic; font-size: 12px; background: #f9f9f9; }
            .footer { text-align: center; margin-top: 30px; font-size: 10px; border-top: 1px dashed #ccc; padding-top: 10px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">🤝 PROMISE SLIP</div>
            <div class="meta">Printed on: ${new Date().toLocaleString('en-GB')}</div>
            <div class="meta">Serial: Sl-#${((page - 1) * 30 + index + 1)}</div>
          </div>
          
          <table class="info-table">
            <tr>
              <td class="label">Client Name:</td>
              <td>${item?.client_name || 'N/A'}</td>
            </tr>
            <tr>
              <td class="label">IP Address:</td>
              <td style="font-family: monospace; font-weight: bold;">${item?.ip || 'N/A'}</td>
            </tr>
            <tr>
              <td class="label">Address/Zone:</td>
              <td>${item?.address || 'N/A'}</td>
            </tr>
            <tr>
              <td class="label">Promise Date:</td>
              <td style="text-decoration: underline; font-weight: bold;">
                ${item?.promise_date ? new Date(item.promise_date).toLocaleDateString('en-GB') : 'N/A'}
              </td>
            </tr>
          </table>

          <div class="note-box">
            <strong>Collection Note:</strong><br/>
            "${item?.promise_note || 'No custom instruction written.'}"
          </div>

          <div class="footer">
            <p>Thank you for staying with us.</p>
            <p>System Generated Token</p>
          </div>

          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.frameElement.remove(); }, 100);
            };
          </script>
        </body>
      </html>
    `;

    doc.open();
    doc.write(printContent);
    doc.close();
  };

  return (
    <button
      onClick={handlePrint}
      className="btn btn-xs btn-outline btn-info flex items-center gap-1 transition-all duration-200"
      title="Print Promise Details"
    >
      <MdPrint size={13} /> Print
    </button>
  );
}