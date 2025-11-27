import jsPDF from 'jspdf';

interface TicketData {
    eventName: string;
    eventDate: string;
    eventTime: string;
    eventLocation: string;
    attendeeName: string;
    ticketId: string;
    qrCodeUrl?: string;
}

export const generateTicketPDF = (data: TicketData) => {
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a5' // A5 is good for tickets
    });

    // Background
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, 148, 210, 'F');

    // Header
    doc.setFillColor(124, 58, 237); // Purple-600
    doc.rect(0, 0, 148, 45, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.text('DANCE.CASH', 74, 22, { align: 'center' });

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text('OFFICIAL EVENT TICKET', 74, 32, { align: 'center' });

    // Event Details
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');

    const splitTitle = doc.splitTextToSize(data.eventName, 120);
    doc.text(splitTitle, 74, 62, { align: 'center' });

    let yPos = 62 + (splitTitle.length * 8) + 8;

    // Date & Time
    doc.setFontSize(13);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    doc.text(`${data.eventDate} • ${data.eventTime}`, 74, yPos, { align: 'center' });
    yPos += 8;

    // Location
    doc.setFontSize(12);
    doc.text(data.eventLocation, 74, yPos, { align: 'center' });
    yPos += 18;

    // Divider
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    (doc as any).setLineDash([3, 3], 0);
    doc.line(25, yPos, 123, yPos);
    yPos += 15;

    // Attendee
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.text('ATTENDEE', 74, yPos, { align: 'center' });
    yPos += 7;

    doc.setFontSize(18);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text(data.attendeeName, 74, yPos, { align: 'center' });
    yPos += 18;

    // QR Code Section
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.setFont('helvetica', 'normal');
    doc.text('SCAN TO VIEW EVENT', 74, yPos, { align: 'center' });
    yPos += 6;

    // QR Code - COMPLETELY CLEAN, NO TEXT INSIDE
    if (data.qrCodeUrl) {
        try {
            doc.setFillColor(255, 255, 255);
            doc.rect(46, yPos, 56, 56, 'F');
            doc.setDrawColor(220, 220, 220);
            doc.setLineWidth(0.5);
            (doc as any).setLineDash([], 0);
            doc.rect(46, yPos, 56, 56, 'S');

            // Just the QR code image, nothing else
            doc.addImage(data.qrCodeUrl, 'PNG', 49, yPos + 3, 50, 50);
        } catch (e) {
            // If image fails, just show empty box - NO TEXT
            doc.setDrawColor(200, 200, 200);
            doc.rect(49, yPos + 3, 50, 50);
        }
    } else {
        // No QR URL - just empty box - NO TEXT
        doc.setDrawColor(200, 200, 200);
        doc.rect(49, yPos + 3, 50, 50);
    }
    yPos += 62;

    // Ticket ID
    doc.setFontSize(8);
    doc.setTextColor(140, 140, 140);
    doc.setFont('helvetica', 'normal');
    doc.text(`Ticket ID: ${data.ticketId}`, 74, yPos, { align: 'center' });
    yPos += 10;

    // Divider
    doc.setDrawColor(220, 220, 220);
    (doc as any).setLineDash([2, 2], 0);
    doc.line(30, yPos, 118, yPos);

    // Footer
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text('Present this ticket at the entrance', 74, 195, { align: 'center' });
    doc.setFontSize(7);
    doc.text('Powered by Dance.cash', 74, 202, { align: 'center' });

    doc.save(`ticket-${data.eventName.replace(/\s+/g, '-').toLowerCase()}.pdf`);
};
