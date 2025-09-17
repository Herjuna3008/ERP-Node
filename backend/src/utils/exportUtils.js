const pdf = require('html-pdf');

function exportToPDF(html, options = {}) {
  return new Promise((resolve, reject) => {
    pdf.create(html, { format: "A4", ...options }).toBuffer((err, buffer) => {
      if (err) return reject(err)
      resolve(buffer)
    })
  })
};

module.exports = { exportToPDF };
