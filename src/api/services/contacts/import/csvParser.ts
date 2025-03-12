
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
  
  console.log("Raw header line:", lines[0]);
  
  // Extract header row and parse columns
  const header = parseCSVLine(lines[0]);
  
  // Debug information
  console.log("CSV Header after parsing:", header);
  
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
 * Normalizes a field name for case-insensitive comparison
 */
function normalizeFieldName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Map CSV data to Contact object based on identified columns
 */
function mapCSVToContact(header: string[], values: string[]): Partial<Contact> {
  const contact: Partial<Contact> = {};
  
  // Create a record of column name to value
  const record: Record<string, string> = {};
  const normalizedRecord: Record<string, string> = {};
  
  header.forEach((col, index) => {
    if (index < values.length) {
      const cleanCol = col.trim();
      // Store the original column name to value mapping
      record[cleanCol] = values[index];
      
      // Also store normalized versions for fuzzy matching
      const normalizedCol = normalizeFieldName(cleanCol);
      normalizedRecord[normalizedCol] = values[index];
      
      // Add lowercase version for backwards compatibility
      record[cleanCol.toLowerCase()] = values[index];
    }
  });
  
  // Debug the record to see what field mappings we have
  console.log("CSV field mappings (original):", record);
  console.log("CSV field mappings (normalized):", normalizedRecord);
  
  // Try to extract first name and last name with various field naming patterns
  let firstName = '';
  let lastName = '';
  
  // Check all possible variations of first name
  if (normalizedRecord['firstname']) {
    firstName = normalizedRecord['firstname'];
  } else if (normalizedRecord['givenname']) {
    firstName = normalizedRecord['givenname'];
  } else if (record['First Name']) {
    firstName = record['First Name'];
  } else if (record['Given Name']) {
    firstName = record['Given Name'];
  }
  
  // Check all possible variations of last name
  if (normalizedRecord['lastname']) {
    lastName = normalizedRecord['lastname'];
  } else if (normalizedRecord['familyname']) {
    lastName = normalizedRecord['familyname'];
  } else if (normalizedRecord['surname']) {
    lastName = normalizedRecord['surname'];
  } else if (record['Last Name']) {
    lastName = record['Last Name'];
  } else if (record['Family Name']) {
    lastName = record['Family Name'];
  } else if (record['Surname']) {
    lastName = record['Surname'];
  }
  
  // Try to build full name from first and last name
  if (firstName && lastName) {
    contact.full_name = `${firstName} ${lastName}`.trim();
    console.log(`Created full name: "${contact.full_name}" from firstName="${firstName}" lastName="${lastName}"`);
  } 
  // Try to get full name directly if first/last name approach didn't work
  else if (normalizedRecord['name'] || normalizedRecord['fullname']) {
    contact.full_name = normalizedRecord['name'] || normalizedRecord['fullname'];
    console.log(`Using direct full name: "${contact.full_name}"`);
  }
  // Handle LinkedIn exports which might have first name and last name but not match our patterns
  else {
    // Find any header containing "first" and "name"
    const firstNameKey = Object.keys(record).find(k => 
      k.toLowerCase().includes('first') && k.toLowerCase().includes('name')
    );
    
    // Find any header containing "last" and "name"
    const lastNameKey = Object.keys(record).find(k => 
      k.toLowerCase().includes('last') && k.toLowerCase().includes('name')
    );
    
    if (firstNameKey && lastNameKey) {
      firstName = record[firstNameKey];
      lastName = record[lastNameKey];
      contact.full_name = `${firstName} ${lastName}`.trim();
      console.log(`Found name using pattern matching - first="${firstNameKey}", last="${lastNameKey}", full="${contact.full_name}"`);
    }
  }
  
  // Handle various email field names with case-insensitive and fuzzy matching
  if (normalizedRecord['email'] || normalizedRecord['emailaddress']) {
    contact.email = normalizedRecord['email'] || normalizedRecord['emailaddress'];
  } else {
    // Find any header containing "email"
    const emailKey = Object.keys(record).find(k => 
      k.toLowerCase().includes('email')
    );
    
    if (emailKey) {
      contact.email = record[emailKey];
    }
  }
  
  // Handle various phone field names
  if (normalizedRecord['phone'] || normalizedRecord['phonenumber'] || normalizedRecord['mobile']) {
    contact.mobile_phone = normalizedRecord['phone'] || normalizedRecord['phonenumber'] || normalizedRecord['mobile'];
  } else {
    // Find any header containing "phone" or "mobile"
    const phoneKey = Object.keys(record).find(k => 
      k.toLowerCase().includes('phone') || k.toLowerCase().includes('mobile')
    );
    
    if (phoneKey) {
      contact.mobile_phone = record[phoneKey];
    }
  }
  
  // Handle company name fields
  if (normalizedRecord['company'] || normalizedRecord['organization']) {
    contact.company = normalizedRecord['company'] || normalizedRecord['organization'];
  } else {
    // Find any header containing "company" or "organization"
    const companyKey = Object.keys(record).find(k => 
      k.toLowerCase().includes('company') || k.toLowerCase().includes('organization') || k.toLowerCase().includes('employer')
    );
    
    if (companyKey) {
      contact.company = record[companyKey];
    }
  }
  
  // Handle job title fields
  if (normalizedRecord['position'] || normalizedRecord['title'] || normalizedRecord['jobtitle']) {
    contact.job_title = normalizedRecord['position'] || normalizedRecord['title'] || normalizedRecord['jobtitle'];
  } else {
    // Find any header containing "title", "position", or "job"
    const titleKey = Object.keys(record).find(k => 
      k.toLowerCase().includes('title') || k.toLowerCase().includes('position') || 
      (k.toLowerCase().includes('job') && k.toLowerCase().includes('title'))
    );
    
    if (titleKey) {
      contact.job_title = record[titleKey];
    }
  }
  
  console.log("Final mapped contact:", contact);
  return contact;
}
