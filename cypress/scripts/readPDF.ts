const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');

export const readPdf = (pathToPdf: string) =>
  new Promise((resolve) => {
    const pdfPath = path.resolve(pathToPdf);
    const dataBuffer = fs.readFileSync(pdfPath);
    pdf(dataBuffer).then((data) => {
      resolve(data);
    });
  });
