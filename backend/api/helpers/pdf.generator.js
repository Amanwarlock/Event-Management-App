// PUPPETTEER not working isssue 
//https://github.com/puppeteer/puppeteer/issues/3443
const puppeteer = require("puppeteer");
const hbs = require("handlebars");
const path = require("path");
const fs = require("fs");
const fsExtra = require("fs-extra");
const moment = require("moment");

const uploadsDir = 'Uploads'; // wrt to project folder i,e backend;
const templateDir = '/api/templates'; // wrt to project root dir i,e backend
const templateName = 'guestList.hbs';

const compile = async function(templateName, data){
    let filePath = path.join(process.cwd(), templateDir,templateName);
    const html = fs.readFileSync(filePath,'utf-8');
    return hbs.compile(html)(data);
}

hbs.registerHelper("inc", function(value, options)
{
    return parseInt(value) + 1;
});

hbs.registerHelper('parseDate', function(value) {
    let dt = new Date(value);
    let m = moment(dt.toISOString(), "MM-DD-YYYY");
    return  `${dt.getDay()}/${dt.getMonth() + 1}/${dt.getFullYear()}`;
 });

async function generatePDF(fileName, event){
        try{    
            const browser = await puppeteer.launch();
            const content = await compile(templateName, {event:event});
            const page = await browser.newPage();
            await page.setContent(content);
            await page.emulateMedia('screen');
            fileName = `${fileName}.pdf`;
            let pdfFilePath = path.join(process.cwd(),uploadsDir,fileName);
            await page.pdf({
                path: pdfFilePath,
                format: 'A4',
                printBackground: true
            });
            console.log("PDF generated at path ", pdfFilePath);
            await browser.close();
            return pdfFilePath;
        }catch(e){
            console.log("Error occured while generating PDF", e.message);
            throw e;
        }
}

module.exports = {
    generatePDF: generatePDF,
};