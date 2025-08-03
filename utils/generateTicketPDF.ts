// PDF генерація для квитка
import { openSansBase64 } from "@/utils/openSansFont";
import jsPDF from "jspdf";
import "svg2pdf.js";

export function generateTicketPDF({
  museumName,
  firstName,
  lastName,
  ticketNumber,
  visitDate,
  qrSvgId,
}: {
  museumName: string;
  firstName: string;
  lastName: string;
  ticketNumber: string;
  visitDate: string;
  qrSvgId: string;
}) {
  const doc = new jsPDF();
  doc.addFileToVFS("OpenSans-Regular.ttf", openSansBase64);
  doc.addFont("OpenSans-Regular.ttf", "OpenSans", "normal");
  doc.setFont("OpenSans");
  doc.setFontSize(18);
  doc.text(museumName, 20, 20);
  doc.setFontSize(12);
  doc.text(`Ім'я: ${firstName}`, 20, 35);
  doc.text(`Прізвище: ${lastName}`, 20, 45);
  doc.text(`Номер квитка: ${ticketNumber}`, 20, 55);
  doc.text(`Дата: ${visitDate}`, 20, 65);

  // Додаємо QR-код (SVG через svg2pdf.js)
  const svg = document.getElementById(qrSvgId);
  if (svg) {
    doc.svg(svg, { x: 20, y: 75, width: 60, height: 60 }).then(() => {
      doc.save(`ticket-${ticketNumber}.pdf`);
    });
    return;
  }
  doc.save(`ticket-${ticketNumber}.pdf`);
}
