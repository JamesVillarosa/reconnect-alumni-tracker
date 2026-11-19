import { saveAs } from 'file-saver';

export const handleExport = (data: any[], type: 'csv' | 'json' | 'txt') => {
  switch (type) {
    // csv file type
    case 'csv':
      const csvData = [
        [
          'Job ID', 
          'Author ID', 
          'Title', 
          'Company Name', 
          'Company Url', 
          'Location', 
          'Job Field',
          'Job Type', 
          'Job Level', 
          'Job Setup', 
          'Min Salary', 
          'Max Salary',
          'Description', 
          'Application Link', 
          'Qualifications',
          'Start Date', 
          'End Date', 
          'Status', 
          'Date Posted', 
          'Author Name'
        ],
        ...data.map((item) => [
          item._id,
          item.authorId,
          item.company_name,
          item.company_url,
          item.location,
          item.job_field,
          item.job_type,
          item.job_level,
          item.job_setup,
          item.min_salary,
          item.max_salary,
          item.description,
          item.application_link,
          item.qualifications ? `"${item.qualifications.join('; ').replace(/"/g, '""')}"` : '',
          item.start_date,
          item.end_date,
          item.status,
          item.date_posted,
          item.author_name,
        ]),
      ];

      const csvContent = csvData
        .map((row) => row.join(','))
        .join('\n');
      
      const csvLink = document.createElement('a');
      csvLink.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent);
      csvLink.download = 'data.csv';
      csvLink.click();
      break;

    // json file type
    case 'json':
      const jsonBlob = new Blob([JSON.stringify(data)], { type: 'application/json' });
      saveAs(jsonBlob, 'data.json');
      break;

    // txt file type
    case 'txt':
      const txtContent = data.map((item) =>
        `${item._id},
        ${item.authorId},
        ${item.title},
        ${item.company_name},
        ${item.company_url},
        ${item.location},
        ${item.job_field},
        ${item.job_type},
        ${item.job_level},
        ${item.job_setup},
        ${item.min_salary},
        ${item.max_salary},
        ${item.description},
        ${item.application_link},
        ${item.qualifications},
        ${item.start_date},
        ${item.end_date},
        ${item.status},
        ${item.date_posted},
        ${item.author_name},
        `).join('\n');

      const txtBlob = new Blob([txtContent], {type: 'text/plain' });
      saveAs(txtBlob, 'data.txt');
      break;

    default:
      console.error('Unsupported export type! Choose from CSV, JSON, or TXT.');
  }
};