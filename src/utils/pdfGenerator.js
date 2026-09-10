/**
 * PDF Generator Utility for Fixsy
 * Uses browser's native print functionality as a fallback
 */

export const generateReceiptPDF = (details, t, language) => {
    // Create a new window with receipt content
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
        alert(t('popupBlocked') || 'Please allow popups to download PDF');
        return;
    }

    const isRTL = language === 'ar';
    const dateStr = new Date(details.scheduledDate).toLocaleString(isRTL ? 'ar-EG' : 'en-US');

    const htmlContent = `
<!DOCTYPE html>
<html dir="${isRTL ? 'rtl' : 'ltr'}" lang="${language}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${t('receipt') || 'Receipt'} - Fixsy</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Segoe UI', Tahoma, sans-serif; 
            padding: 40px; 
            max-width: 600px; 
            margin: 0 auto;
            background: #f8fafc;
        }
        .receipt {
            background: white;
            border-radius: 16px;
            padding: 30px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px dashed #e2e8f0;
        }
        .logo {
            font-size: 32px;
            font-weight: bold;
            color: #0056D2;
        }
        .order-number {
            font-family: monospace;
            color: #64748b;
            margin-top: 10px;
        }
        .section {
            margin-bottom: 20px;
            padding: 15px;
            background: #f8fafc;
            border-radius: 12px;
        }
        .section-title {
            font-size: 12px;
            color: #94a3b8;
            text-transform: uppercase;
            margin-bottom: 8px;
        }
        .section-content {
            font-size: 16px;
            color: #1e293b;
            font-weight: 600;
        }
        .total {
            text-align: center;
            padding: 20px;
            background: linear-gradient(135deg, #0056D2 0%, #0040A0 100%);
            color: white;
            border-radius: 12px;
            margin-top: 20px;
        }
        .total-label { font-size: 14px; opacity: 0.9; }
        .total-amount { font-size: 32px; font-weight: bold; }
        .footer {
            text-align: center;
            margin-top: 30px;
            color: #94a3b8;
            font-size: 12px;
        }
        @media print {
            body { padding: 0; background: white; }
            .receipt { box-shadow: none; }
            .no-print { display: none; }
        }
    </style>
</head>
<body>
    <div class="receipt">
        <div class="header">
            <div class="logo">🔧 Fixsy</div>
            <div class="order-number">#${details.id?.slice(0, 8).toUpperCase() || 'N/A'}</div>
        </div>
        
        <div class="section">
            <div class="section-title">${t('technician') || 'Technician'}</div>
            <div class="section-content">${details.technician_name || 'N/A'}</div>
        </div>
        
        <div class="section">
            <div class="section-title">${t('service') || 'Service'}</div>
            <div class="section-content">${details.serviceType || t('maintenance') || 'Maintenance'}</div>
        </div>
        
        <div class="section">
            <div class="section-title">${t('date') || 'Date'}</div>
            <div class="section-content">${dateStr}</div>
        </div>
        
        <div class="section">
            <div class="section-title">${t('address') || 'Address'}</div>
            <div class="section-content">${details.client_address || 'N/A'}</div>
        </div>
        
        <div class="section">
            <div class="section-title">${t('paymentMethod') || 'Payment'}</div>
            <div class="section-content">${details.paymentMethod === 'wallet' ? (t('wallet') || 'Wallet') : (t('cash') || 'Cash')}</div>
        </div>
        
        <div class="total">
            <div class="total-label">${t('totalAmount') || 'Total Amount'}</div>
            <div class="total-amount">${details.price} ${t('currency') || 'EGP'}</div>
        </div>
        
        <div class="footer">
            <p>${t('thankYou') || 'Thank you for choosing Fixsy!'}</p>
            <p style="margin-top: 5px;">fixsy-app.web.app</p>
        </div>
    </div>
    
    <div class="no-print" style="text-align: center; margin-top: 20px;">
        <button onclick="window.print()" style="
            background: #0056D2; 
            color: white; 
            border: none; 
            padding: 15px 30px; 
            border-radius: 12px; 
            font-size: 16px; 
            font-weight: bold; 
            cursor: pointer;
        ">
            ${t('downloadPDF') || 'Download as PDF'} 📄
        </button>
    </div>
</body>
</html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
};

const pdfUtils = { generateReceiptPDF };

export default pdfUtils;
