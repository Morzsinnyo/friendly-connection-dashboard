
import { Contact } from "@/api/types/contacts";

/**
 * Process a LinkedIn CSV export file and convert it to Contact objects
 */
export async function processLinkedInCSV(file: File): Promise<Partial<Contact>[]> {
  const fileContent = await file.text();
  const lines = fileContent.split('\n');
  
  if (lines.length <= 1) {
    console.log("CSV file is empty or contains only one line");
    return [];
  }
  
  // Look for the header row - LinkedIn exports might have metadata at the top
  // so the header row might not be the first row
  let headerRowIndex = -1;
  const linkedInHeaderMarkers = ["First Name", "Last Name", "Email Address", "Company", "Position", "Profile URL"];
  
  // Scan the first 10 rows (or fewer if the file is smaller) for LinkedIn header markers
  const maxRowsToScan = Math.min(10, lines.length);
  for (let i = 0; i < maxRowsToScan; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const rowFields = parseCSVLine(line);
    
    // Count how many LinkedIn markers are present in this row
    let markerCount = 0;
    for (const marker of linkedInHeaderMarkers) {
      if (rowFields.includes(marker)) {
        markerCount++;
      }
    }
    
    // If we found at least 3 markers, we've likely found the header row
    if (markerCount >= 3) {
      headerRowIndex = i;
      console.log(`Found LinkedIn header row at line ${i + 1}`);
      break;
    }
  }
  
  if (headerRowIndex === -1) {
    console.error("No LinkedIn header row found in the first 10 rows of the CSV file");
    return [];
  }
  
  // Parse the header row to find column indexes
  const header = parseCSVLine(lines[headerRowIndex]);
  console.log("LinkedIn CSV Headers:", header);
  
  // Find indexes for the fields we care about
  const firstNameIndex = header.findIndex(col => col === "First Name");
  const lastNameIndex = header.findIndex(col => col === "Last Name");
  const emailIndex = header.findIndex(col => col === "Email Address");
  const companyIndex = header.findIndex(col => col === "Company");
  const positionIndex = header.findIndex(col => col === "Position");
  const profileUrlIndex = header.findIndex(col => col === "Profile URL");
  
  // If we don't have the minimum required fields, return empty array with an error
  if (firstNameIndex === -1 || lastNameIndex === -1) {
    console.error("LinkedIn CSV is missing required name columns. Headers found:", header);
    return [];
  }
  
  const contacts: Partial<Contact>[] = [];
  
  // Process each data row (skip all rows up to and including the header)
  for (let i = headerRowIndex + 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue; // Skip empty lines
    
    const values = parseCSVLine(line);
    
    // Skip rows that don't have enough values
    if (values.length <= Math.max(firstNameIndex, lastNameIndex)) {
      console.log(`Skipping row ${i + 1}: Not enough values`);
      continue;
    }
    
    const firstName = values[firstNameIndex]?.trim() || "";
    const lastName = values[lastNameIndex]?.trim() || "";
    
    // Skip rows without name data
    if (!firstName && !lastName) {
      console.log(`Skipping row ${i + 1}: No name data`);
      continue;
    }
    
    // Create the contact object with a temporary ID
    const contact: Partial<Contact> = {
      id: crypto.randomUUID(),
      full_name: `${firstName} ${lastName}`.trim(),
      email: emailIndex !== -1 && emailIndex < values.length ? values[emailIndex]?.trim() || null : null,
      company: companyIndex !== -1 && companyIndex < values.length ? values[companyIndex]?.trim() || null : null,
      job_title: positionIndex !== -1 && positionIndex < values.length ? values[positionIndex]?.trim() || null : null,
      linkedin_url: profileUrlIndex !== -1 && profileUrlIndex < values.length ? values[profileUrlIndex]?.trim() || null : null
    };
    
    contacts.push(contact);
  }
  
  console.log(`Found ${contacts.length} valid LinkedIn contacts out of ${lines.length - headerRowIndex - 1} data rows`);
  return contacts;
}

/**
 * Simple CSV line parser that handles quoted fields
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  // Add the last field
  result.push(current.trim());
  
  return result;
}
