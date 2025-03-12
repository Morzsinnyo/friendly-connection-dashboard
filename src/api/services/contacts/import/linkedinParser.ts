
import { Contact } from "@/api/types/contacts";

/**
 * Process a LinkedIn CSV export file and convert it to Contact objects
 */
export async function processLinkedInCSV(file: File): Promise<Partial<Contact>[]> {
  const fileContent = await file.text();
  const lines = fileContent.split('\n');
  
  // If there are no lines or just the header, return empty array
  if (lines.length <= 1) {
    console.log("CSV file is empty or contains only headers");
    return [];
  }
  
  // Parse the header row to find column indexes
  const header = parseCSVLine(lines[0]);
  console.log("LinkedIn CSV Headers:", header);
  
  // Find indexes for the fields we care about
  const firstNameIndex = header.findIndex(col => col === "First Name");
  const lastNameIndex = header.findIndex(col => col === "Last Name");
  const emailIndex = header.findIndex(col => col === "Email Address");
  const companyIndex = header.findIndex(col => col === "Company");
  const positionIndex = header.findIndex(col => col === "Position");
  
  // If we don't have the minimum required fields, return empty array
  if (firstNameIndex === -1 || lastNameIndex === -1) {
    console.error("LinkedIn CSV is missing required name columns");
    return [];
  }
  
  const contacts: Partial<Contact>[] = [];
  
  // Process each data row (skip header)
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue; // Skip empty lines
    
    const values = parseCSVLine(line);
    
    // Skip rows that don't have enough values
    if (values.length <= Math.max(firstNameIndex, lastNameIndex)) {
      console.log(`Skipping row ${i}: Not enough values`);
      continue;
    }
    
    const firstName = values[firstNameIndex]?.trim() || "";
    const lastName = values[lastNameIndex]?.trim() || "";
    
    // Skip rows without name data
    if (!firstName && !lastName) {
      console.log(`Skipping row ${i}: No name data`);
      continue;
    }
    
    // Create the contact object with a temporary ID
    const contact: Partial<Contact> = {
      id: crypto.randomUUID(),
      full_name: `${firstName} ${lastName}`.trim(),
      email: emailIndex !== -1 ? values[emailIndex]?.trim() || null : null,
      company: companyIndex !== -1 ? values[companyIndex]?.trim() || null : null,
      job_title: positionIndex !== -1 ? values[positionIndex]?.trim() || null : null
    };
    
    contacts.push(contact);
  }
  
  console.log(`Found ${contacts.length} valid LinkedIn contacts out of ${lines.length - 1} rows`);
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
