import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';

export const generateAndShareStatement = async (transactions, user, t) => {
  const txRows = transactions.map(tx => {
    const isPositive = tx.type === 'RECEIVE' || tx.type === 'SALE';
    const amountStr = `${isPositive ? '+' : '-'}${tx.amount} ${tx.currency}`;
    const dateStr = new Date(tx.timestamp).toLocaleString();
    const typeStr = t(`common.wallet.tx_type.${(tx.type || 'unknown').toLowerCase()}`, tx.type).toUpperCase();
    const statusStr = t(`common.wallet.status_type.${(tx.status || 'PENDING').toLowerCase()}`, tx.status).toUpperCase();
    
    return `
      <tr>
        <td>${dateStr}</td>
        <td>${typeStr}</td>
        <td>${tx.toFrom || '-'}</td>
        <td style="color: ${isPositive ? '#10B981' : '#1A2840'}; font-weight: bold;">${amountStr}</td>
        <td>${statusStr}</td>
      </tr>
    `;
  }).join('');

  const html = `
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
        <style>
          body { font-family: 'Helvetica', sans-serif; padding: 20px; color: #1A2840; }
          .header { text-align: center; margin-bottom: 30px; }
          .title { font-size: 24px; font-weight: bold; color: #1A2840; }
          .subtitle { font-size: 14px; color: #64748B; margin-top: 5px; }
          .user-info { margin-bottom: 20px; font-size: 14px; line-height: 1.5; padding: 15px; background: #F8FAFC; border-radius: 8px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
          th { text-align: left; padding: 12px 10px; background-color: #20365B; color: #FFFFFF; font-weight: bold; }
          td { padding: 12px 10px; border-bottom: 1px solid #E2E8F0; }
          tr:nth-child(even) { background-color: #F8FAFC; }
          .footer { margin-top: 40px; text-align: center; font-size: 10px; color: #94A3B8; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">DizzitUp Statement</div>
          <div class="subtitle">${user?.role === 'merchant' ? 'Business Account' : 'Personal Account'}</div>
        </div>
        
        <div class="user-info">
          <strong>Account Holder:</strong> ${user?.firstName || ''} ${user?.lastName || ''} <br/>
          <strong>Date Generated:</strong> ${new Date().toLocaleDateString()}<br/>
          <strong>Total Transactions:</strong> ${transactions.length}
        </div>

        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Details</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${txRows}
          </tbody>
        </table>

        <div class="footer">
          Generated securely by DizzitApp
        </div>
      </body>
    </html>
  `;

  try {
    const { base64 } = await Print.printToFileAsync({ 
      html, 
      margins: { top: 30, bottom: 30, left: 30, right: 30 },
      base64: true 
    });
    
    // Write the base64 directly to the document directory to bypass Expo Go unreadable cache errors
    const pdfName = `DizzitUp_Statement_${Date.now()}.pdf`;
    const newUri = FileSystem.documentDirectory + pdfName;
    
    await FileSystem.writeAsStringAsync(newUri, base64, {
      encoding: FileSystem.EncodingType.Base64
    });

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(newUri, { 
        UTI: 'com.adobe.pdf', 
        mimeType: 'application/pdf', 
        dialogTitle: 'DizzitUp Statement' 
      });
    }
  } catch (error) {
    console.error("Error generating PDF:", error);
  }
};
