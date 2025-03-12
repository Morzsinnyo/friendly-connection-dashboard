
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
  
  // Debug information
  console.log("CSV Header:", header);
  
  const contacts: Partial<Contact>[] = [];
  
  // Process each data row (skip header)
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue; // Skip empty lines
    
    const values = parseCSVLine(line);
    const contact = mapCSVToContact(header, values);
    
    // Debug information for first few contacts
    if (i < 3) {
      console.log(`Contact data row ${i}:`, values);
      console.log(`Mapped contact ${i}:`, contact);
    }
    
    // Only include contacts that have a name
    if (contact.full_name) {
      // Generate a temporary ID for selection purposes
      contact.id = crypto.randomUUID();
      contacts.push(contact);
    } else {
      console.log(`Skipping row ${i} - no name found:`, values);
    }
  }
  
  console.log(`Found ${contacts.length} valid contacts out of ${lines.length - 1} rows`);
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
      // Don't add the quotes to the result
    } else if (char === ',' && !inQuotes) {
      // End of field
      result.push(cleanField(current));
      current = '';
    } else {
      // Add character to current field
      current += char;
    }
  }
  
  // Add the last field - make sure we don't forget it
  result.push(cleanField(current));
  
  return result;
}

/**
 * Clean a field value by trimming whitespace and removing quotes
 */
function cleanField(field: string): string {
  // Trim whitespace and remove any surrounding quotes
  field = field.trim();
  if (field.startsWith('"') && field.endsWith('"')) {
    field = field.substring(1, field.length - 1);
  }
  return field;
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
      const cleanCol = col.trim();
      // Store both the original column name and the lowercase version
      // to support case-insensitive matching
      record[cleanCol.toLowerCase()] = values[index];
      record[cleanCol] = values[index]; // Keep original for exact matching too
    }
  });
  
  // Debug the record to see what field mappings we have
  console.log("CSV field mappings:", record);
  
  // Map field names, supporting both standard and LinkedIn export formats
  
  // Handle various name field combinations with case-insensitive matching
  if (record['first name'] && record['last name']) {
    contact.full_name = `${record['first name']} ${record['last name']}`.trim();
  } else if (record['First Name'] && record['Last Name']) {
    contact.full_name = `${record['First Name']} ${record['Last Name']}`.trim();
  } else if (record['firstname'] && record['lastname']) {
    contact.full_name = `${record['firstname']} ${record['lastname']}`.trim();
  } else if (record['name']) {
    contact.full_name = record['name'];
  } else if (record['Name']) {
    contact.full_name = record['Name'];
  }
  
  // Handle various email field names with case-insensitive matching
  if (record['email']) {
    contact.email = record['email'];
  } else if (record['Email']) {
    contact.email = record['Email'];
  } else if (record['email address']) {
    contact.email = record['email address'];
  } else if (record['Email Address']) {
    contact.email = record['Email Address'];
  }
  
  // Handle various phone field names
  if (record['phone'] || record['Phone']) {
    contact.mobile_phone = record['phone'] || record['Phone'];
  } else if (record['phone number'] || record['Phone Number']) {
    contact.mobile_phone = record['phone number'] || record['Phone Number'];
  } else if (record['mobile'] || record['Mobile']) {
    contact.mobile_phone = record['mobile'] || record['Mobile'];
  }
  
  // Handle company name fields
  if (record['company']) {
    contact.company = record['company'];
  } else if (record['Company']) {
    contact.company = record['Company'];
  } else if (record['organization'] || record['Organization']) {
    contact.company = record['organization'] || record['Organization'];
  }
  
  // Handle job title fields
  if (record['position']) {
    contact.job_title = record['position'];
  } else if (record['Position']) {
    contact.job_title = record['Position'];
  } else if (record['title'] || record['Title']) {
    contact.job_title = record['title'] || record['Title'];
  } else if (record['job title'] || record['Job Title']) {
    contact.job_title = record['job title'] || record['Job Title'];
  }
  
  return contact;
}
