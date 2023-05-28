const PdfPrinter = require('pdfmake');

const Downloads = require('../services/downloads-services');
const Expenses = require('../services/expense-services');
const S3 = require('../services/S3-services');

exports.getPDFLink = async (req, res) => {
  try {
    const startDate = req.query.start_date + 'T00:00:00Z';
    const endDate = req.query.end_date + 'T23:59:59Z';
    if (!startDate || !endDate || endDate < startDate) return res.status(400).json({ message: 'Bad dates' });

    const expenseData = await Expenses.findMany({
      userId: req.user._id,
      date: {
        $gte: startDate,
        $lte: endDate,
      },
    }, { date: -1 });

    const tableData = [];
    tableData.push(['Date', 'Category', 'Expense Name', 'Amount']);
    let totalExpense = 0;
    expenseData.forEach((e, i) => {
      tableData.push([e.date.toLocaleString(), e.category, e.name, e.price]);
      totalExpense += e.price;
      const len = expenseData.length;
      if (((i < len - 1 && ((expenseData[i + 1].date[6] > expenseData[i].date[6]) || expenseData[i + 1].date.getMonth() == 12 && expenseData[i].date.getMonth() == 1)) || (i === len - 1))) {
        tableData.push(['Monthly summary:', '', '', '']);
        tableData.push(['Month: ', expenseData[i].date.getMonth(), 'Amount: ', totalExpense]);
        totalExpense = 0;
      }
    });

    var fonts = {
      Courier: {
        normal: 'Courier',
        bold: 'Courier-Bold',
        italics: 'Courier-Oblique',
        bolditalics: 'Courier-BoldOblique',
      },
      Helvetica: {
        normal: 'Helvetica',
        bold: 'Helvetica-Bold',
        italics: 'Helvetica-Oblique',
        bolditalics: 'Helvetica-BoldOblique',
      },
      Times: {
        normal: 'Times-Roman',
        bold: 'Times-Bold',
        italics: 'Times-Italic',
        bolditalics: 'Times-BoldItalic',
      },
      Symbol: {
        normal: 'Symbol',
      },
      ZapfDingbats: {
        normal: 'ZapfDingbats',
      },
    };

    const printer = new PdfPrinter(fonts);

    const docDefinition = {
      content: [
        {
          layout: 'lightHorizontalLines',
          table: {
            headerRows: 1,
            widths: ['auto', 'auto', '*', 'auto'],

            body: tableData,
          },
        },
      ],
      defaultStyle: {
        font: 'Helvetica',
      },
    };

    const pdfMake = printer.createPdfKitDocument(docDefinition);

    const chunks = [];

    pdfMake.on('data', chunk => {
      chunks.push(chunk);
    });

    pdfMake.on('end', async () => {
      const result = Buffer.concat(chunks);
      const userId = req.user.id;
      const timeStamp = new Date();
      const fileName = `${userId}/${timeStamp}.pdf`;
      const fileUrl = await S3.uploadtoS3(result, fileName);
      await Downloads.create({
        url: fileUrl,
        userId: req.user._id,
      });
      res.status(200).json({ fileUrl, success: true });
    });

    pdfMake.end();
  } catch (err) {
    res.status(500).json({ fileUrl: '', success: false, message: err });
    console.log(err);
  }
};

exports.getDownloadLinks = async (req, res) => {
  const numberOfUrls = 5;
  try {
    const fileUrls = await Downloads.findMany(
      { userId: req.user._id },
      { date: -1 },
      numberOfUrls,
    );
    console.log(fileUrls);
    res.status(200).json({ fileUrls, success: true });
  } catch (err) {
    res.status(500).json({ fileUrls: '', success: false, message: err });
  }
};
