const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const url = 'https://cqcitgazqwajbdyxqhtl.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxY2l0Z2F6cXdhamJkeXhxaHRsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MTAyNjg0NywiZXhwIjoyMTA2NjAyODQ3fQ.lWH89WCLiz0iZVg7GFnshv_nyUBvK2wJB2vRLnOCk8g';
const supabase = createClient(url, serviceKey);

// Parse CSV RFC-4180
function parseCSV(text) {
  const rows = [];
  let currentRow = [];
  let currentField = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (inQuotes) {
      if (char === '"' && nextChar === '"') {
        currentField += '"';
        i++; // skip escaped quote
      } else if (char === '"') {
        inQuotes = false;
      } else {
        currentField += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        currentRow.push(currentField);
        currentField = '';
      } else if (char === '\r') {
        if (nextChar === '\n') {
          i++; // skip \n
        }
        currentRow.push(currentField);
        rows.push(currentRow);
        currentRow = [];
        currentField = '';
      } else if (char === '\n') {
        currentRow.push(currentField);
        rows.push(currentRow);
        currentRow = [];
        currentField = '';
      } else {
        currentField += char;
      }
    }
  }

  if (currentField || currentRow.length > 0) {
    currentRow.push(currentField);
    rows.push(currentRow);
  }

  return rows;
}

async function run() {
  const filePath = 'C:/Users/hp/Downloads/trial_requests_rows.csv';
  console.log('Reading CSV from:', filePath);
  const text = fs.readFileSync(filePath, 'utf8');
  const rows = parseCSV(text);

  console.log(`Parsed ${rows.length} total rows (including header).`);
  const headers = rows[0].map(h => h.trim());
  console.log('Headers:', headers);

  const dataRows = rows.slice(1).filter(r => r.length > 1 && (r[headers.indexOf('name')] || r[headers.indexOf('email')]));
  console.log(`Found ${dataRows.length} valid trial request records.`);

  const trialsToInsert = dataRows.map(row => {
    const obj = {};
    headers.forEach((h, idx) => {
      obj[h] = row[idx];
    });

    return {
      course_id: obj.course_id ? Number(obj.course_id) : null,
      course_title: obj.course_title || 'General Free Trial',
      name: obj.name || 'Unknown',
      email: obj.email || '',
      whatsapp: obj.whatsapp || '',
      timezone: obj.timezone || 'Asia/Karachi',
      country: obj.country || '',
      message: obj.message || '',
      status: obj.status || 'pending',
      created_at: obj.created_at || new Date().toISOString(),
    };
  });

  let successCount = 0;
  for (let i = 0; i < trialsToInsert.length; i++) {
    const trial = trialsToInsert[i];
    const { error } = await supabase.from('trial_requests').insert(trial);
    if (error) {
      console.log(`Error inserting [${i + 1}/${trialsToInsert.length}] "${trial.name}":`, error.message);
    } else {
      successCount++;
      console.log(`✓ [${i + 1}/${trialsToInsert.length}] Imported trial for: ${trial.name} (${trial.whatsapp || trial.email})`);
    }
  }

  console.log(`\n========================================`);
  console.log(`Successfully imported ${successCount} of ${trialsToInsert.length} trial requests into Supabase!`);
  console.log(`========================================`);
}

run();
