import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface InvoiceData {
    id: string;
    client: string;
    amount: number;
    date: string;
    status: string;
}

export const generateInvoicePDF = (data: InvoiceData) => {
    const doc = new jsPDF();

    // -- Branding Colors --
    const primaryColor = '#181A20'; // Dark background-like
    const accentColor = '#FCD535';  // Binance Gold

    // -- Header Background --
    doc.setFillColor(primaryColor);
    doc.rect(0, 0, 210, 40, 'F');

    // -- Logo / Company Name --
    doc.setFontSize(22);
    doc.setTextColor(accentColor);
    doc.setFont('helvetica', 'bold');
    doc.text('A&A', 14, 20);

    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'normal');
    doc.text('Secure Commercial Quotes', 14, 26);

    // -- Title --
    doc.setFontSize(24);
    doc.setTextColor(primaryColor);
    doc.text('COMMERCIAL DEVIS', 140, 30, { align: 'right' }); // "Devis" is French for Quote

    // -- Info Block --
    let yPos = 55;

    // Sender Info (A&A)
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text('FROM:', 14, yPos);
    doc.setFontSize(11);
    doc.setTextColor(0);
    doc.text('A&A Inc.', 14, yPos + 6);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text('Aleo Blockchain Network', 14, yPos + 11);

    // Client Info
    doc.text('BILL TO:', 120, yPos);
    doc.setFontSize(11);
    doc.setTextColor(0);
    doc.text(data.client, 120, yPos + 6);

    // Invoice Details
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Invoice ID:`, 14, yPos + 25);
    doc.setTextColor(0);
    doc.text(data.id, 40, yPos + 25);

    doc.setTextColor(100);
    doc.text(`Date:`, 14, yPos + 31);
    doc.setTextColor(0);
    doc.text(data.date, 40, yPos + 31);

    doc.setTextColor(100);
    doc.text(`Status:`, 14, yPos + 37);
    doc.setTextColor(0);
    if (data.status === 'Accepted') {
        doc.setTextColor(0, 150, 0); // Green for accepted
    } else {
        doc.setTextColor(0);
    }
    doc.text(data.status.toUpperCase(), 40, yPos + 37);

    // -- Table --
    // We only have a total amount in the current data model, so we'll treat it as a single line item
    // In a real app, you'd pass an array of items
    const tableData = [
        ['Commercial Service / Consultation', '1', `$${data.amount.toLocaleString()}`, `$${data.amount.toLocaleString()}`]
    ];

    autoTable(doc, {
        startY: yPos + 45,
        head: [['Description', 'Qty', 'Unit Price', 'Total']],
        body: tableData,
        theme: 'grid',
        headStyles: {
            fillColor: primaryColor,
            textColor: accentColor,
            fontStyle: 'bold'
        },
        styles: {
            fontSize: 10,
            cellPadding: 4
        },
        columnStyles: {
            0: { cellWidth: 'auto' }, // Description
            1: { cellWidth: 20, halign: 'center' }, // Qty
            2: { cellWidth: 30, halign: 'right' }, // Unit Price
            3: { cellWidth: 30, halign: 'right' }  // Total
        }
    });

    // -- Totals --
    // @ts-ignore
    const finalY = doc.lastAutoTable.finalY + 10;

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text('Subtotal:', 140, finalY);
    doc.text('Tax (0%):', 140, finalY + 6); // Blockchain usually no tax logic by default in this demo

    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.setFont('helvetica', 'bold');
    doc.text('Total:', 140, finalY + 14);
    doc.text(`$${data.amount.toLocaleString()}`, 196, finalY + 14, { align: 'right' });

    // -- Footer / Signature --
    const pageHeight = doc.internal.pageSize.height;

    // Divider
    doc.setDrawColor(200);
    doc.line(14, pageHeight - 40, 196, pageHeight - 40);

    doc.setFontSize(9);
    doc.setTextColor(150);
    doc.setFont('helvetica', 'italic');
    doc.text('This quote is cryptographically secured on the Aleo Testnet Beta.', 105, pageHeight - 30, { align: 'center' });
    doc.text('Immutability guaranteed by Zero-Knowledge Proofs.', 105, pageHeight - 25, { align: 'center' });

    // Save
    doc.save(`Invoice_${data.id}_${data.date}.pdf`);
};
