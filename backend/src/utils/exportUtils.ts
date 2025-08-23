import pdf from 'html-pdf';

export function exportToPDF(html: string, options: any = {}): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    pdf.create(html, { format: 'A4', ...options }).toBuffer((err: any, buffer: Buffer) => {
      if (err) return reject(err);
      resolve(buffer);
    });
  });
}
