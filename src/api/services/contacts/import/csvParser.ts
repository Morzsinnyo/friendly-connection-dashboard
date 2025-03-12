
import { Contact } from "@/api/types/contacts";

/**
 * Process a CSV file and convert it to Contact objects
 */
export async function processCSVFile(file: File): Promise<Partial<Contact>[]> {
  const fileContent = await file.text();
  const lines = fileContent.split('\n');
  
  // If there are no lines or just the header, return empty array
  if (lines.length <= 1) {
    return [];
  }
  
  // Extract header row and parse columns
  const header = parseCSVLine(lines[0]);
  
  const contacts: Partial<Contact>[] = [];
  
  // Process each data row (skip header)
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue; // Skip empty lines
    
    const values = parseCSVLine(line);
    const contact = mapCSVToContact(header, values);
    
    // Only include contacts that have a name
    if (contact.full_name) {
      // Generate a temporary ID for selection purposes
      contact.id = crypto.randomUUID();
      contacts.push(contact);
    }
  }
  
  return contacts;
}

/**
 * Parse a CSV line respecting quotes
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      // Toggle quote state
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      // End of field
      result.push(current.trim());
      current = '';
    } else {
      // Add character to current field
      current += char;
    }
  }
  
  // Add the last field
  result.push(current.trim());
  
  return result;
}

/**
 * Map CSV data to Contact object based on identified columns
 */
function mapCSVToContact(header: string[], values: string[]): Partial<Contact> {
  const contact: Partial<Contact> = {};
  
  // Create a record of column name to value
  const record: Record<string, string> = {};
  header.forEach((col, index) => {
    if (index < values.length) {
      record[col.toLowerCase()] = values[index];
    }
  });
  
  // Map LinkedIn CSV fields to our contact model
  // Handle common LinkedIn export field names
  if (record['first name'] && record['last name']) {
    contact.full_name = `${record['first name']} ${record['last name']}`.trim();
  } else if (record['name']) {
    contact.full_name = record['name'];
  }
  
  if (record['email']) {
    contact.email = record['email'];
  } else if (record['email address']) {
    contact.email = record['email address'];
  }
  
  if (record['phone'] || record['phone number']) {
    contact.mobile_phone = record['phone'] || record['phone number'];
  }
  
  if (record['company']) {
    contact.company = record['company'];
  } else if (record['organization']) {
    contact.company = record['organization'];
  }
  
  if (record['position'] || record['title'] || record['job title']) {
    contact.job_title = record['position'] || record['title'] || record['job title'];
  }
  
  return contact;
}
