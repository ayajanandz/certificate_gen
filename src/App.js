import pdf from './certTemp.pdf';
import React, { useState } from 'react';


import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

const App = () => {
  const [studentName, setStudentName] = useState('');

  const [pdfBytes, setPdfBytes] = useState(null);
  const [modifiedPdfUrl, setModifiedPdfUrl] = useState(null);

  const loadPdf = async () => {
    try {
      const response = await fetch(pdf); // Adjust the path if necessary

      if (!response.ok) {
        throw new Error(`Failed to fetch PDF: ${response.statusText}`);
      }

      const pdfBuffer = await response.arrayBuffer();
      setPdfBytes(pdfBuffer);
    } catch (error) {
      console.error(error);
    }
  };

  const generateCertificate = async () => {
    try {
      if (!pdfBytes) {
        console.error('PDF not loaded');
        return;
      }

      const pdfDoc = await PDFDocument.load(pdfBytes);
      const page = pdfDoc.getPages()[0];

      // Use a standard font (Helvetica in this case)
      const font = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);

      const fontSize = 20;
      const text = studentName;
      const textWidth = font.widthOfTextAtSize(text, fontSize);
      const xPosition = (page.getWidth() - textWidth) / 2;
      const yPosition = 293; // Adjust as needed

      // Draw text using the embedded font
      page.drawText(text, { x: xPosition, y: yPosition, font, fontSize, color: rgb(0, 0, 0) });

      const modifiedPdfBytes = await pdfDoc.save();
      const modifiedPdfUrl = URL.createObjectURL(new Blob([modifiedPdfBytes], { type: 'application/pdf' }));

      setModifiedPdfUrl(modifiedPdfUrl);
    } catch (error) {
      console.error(error);
    }
  };

  const downloadCertificate = () => {
    const link = document.createElement('a');
    link.href = modifiedPdfUrl;
    link.target = '_blank';
    link.download = `${studentName} certificate.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
    <div>
      <h1>
        Certificate Generator
      </h1>
    </div>
      <label>
        Student Name:
        <input type="text" value={studentName} onChange={(e) => setStudentName(e.target.value)} />
      </label>
      <button onClick={loadPdf}>Load PDF</button>
      <button onClick={generateCertificate}>Generate Certificate</button>

      {modifiedPdfUrl && (
        <div>
          <p>Modified Certificate:</p>
          <iframe
            title="Modified Certificate"
            width="100%"
            height="500px"
            src={modifiedPdfUrl}
          />
          <button onClick={downloadCertificate}>Download Certificate</button>
        </div>
      )}
    </div>
  );
};

export default App;
