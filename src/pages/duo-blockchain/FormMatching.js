import fs from 'fs';

const CompareJsonFiles = (filePath1, filePath2) => {
  const file1 = fs.readFileSync(filePath1, 'utf8');
  const file2 = fs.readFileSync(filePath2, 'utf8');

  const json1 = JSON.parse(file1);
  const json2 = JSON.parse(file2);

  const isFile1True = json1.clinicalCareDeclaration === true;
  const isFile2True = json2.clinicalCareDeclaration === true;

  if (isFile1True && isFile2True) {
    console.log('Both users have approved the clinical declaration form');
  } else {
    console.log('Both users have not approved the clinical declaration form');
  }
};

const filePath1 = 'C:/Users/bamdi/Downloads/form_data.json';
const filePath2 = 'C:/Users/bamdi/Downloads/form_data.json';

CompareJsonFiles(filePath1, filePath2);
