
import { Contact } from "@/api/types/contacts";

interface VCardField {
  name: string;
  params?: Record<string, string>;
  value: string;
}

interface ParsedVCard {
  fields: VCardField[];
  raw: string;
}

export interface ProcessingStatus {
  total: number;
  current: number;
  processed: Partial<Contact>[];
  errors: string[];
}

export async function processVCFFile(file: File): Promise<Partial<Contact>[]> {
  const fileContent = await file.text();
  
  // Split into individual vCards
  const vCards = fileContent
    .split("BEGIN:VCARD")
    .filter(card => card.trim())
    .map(card => card.trim());

  const contacts: Partial<Contact>[] = [];
  
  for (const card of vCards) {
    try {
      const parsedCard = parseVCard(card);
      const contact = mapVCardToContact(parsedCard);
      
      // Only include contacts that have a name and at least one phone number
      if (contact.full_name && (contact.business_phone || contact.mobile_phone)) {
        contacts.push(contact);
      }
    } catch (error) {
      console.error('Error parsing vCard:', error);
    }
  }

  return contacts;
}

function parseVCard(raw: string): ParsedVCard {
  const lines = raw.split("\n").map(line => line.trim());
  const fields: VCardField[] = [];

  for (const line of lines) {
    if (!line || line === "END:VCARD") continue;

    const [nameParams, ...valueParts] = line.split(":");
    const [name, ...params] = nameParams.split(";");
    
    const paramsObj: Record<string, string> = {};
    params.forEach(param => {
      const [key, value] = param.split("=");
      if (key && value) {
        paramsObj[key] = value;
      }
    });

    fields.push({
      name,
      params: Object.keys(paramsObj).length > 0 ? paramsObj : undefined,
      value: valueParts.join(":"),
    });
  }

  return { fields, raw };
}

function mapVCardToContact(parsedCard: ParsedVCard): Partial<Contact> {
  const contact: Partial<Contact> = {};
  
  for (const field of parsedCard.fields) {
    switch (field.name) {
      case "FN":
        contact.full_name = field.value;
        break;
      case "N":
        if (!contact.full_name) {
          const parts = field.value.split(";");
          contact.full_name = `${parts[1]} ${parts[0]}`.trim();
        }
        break;
      case "TEL":
        if (field.params?.TYPE) {
          if (field.params.TYPE.includes("WORK")) {
            contact.business_phone = field.value;
          } else if (field.params.TYPE.includes("CELL")) {
            contact.mobile_phone = field.value;
          }
        } else {
          // If no type specified, default to mobile
          contact.mobile_phone = field.value;
        }
        break;
      case "EMAIL":
        contact.email = field.value;
        break;
      case "ORG":
        contact.company = field.value;
        break;
      case "TITLE":
        contact.job_title = field.value;
        break;
    }
  }

  // Generate a temporary ID for selection purposes
  contact.id = crypto.randomUUID();
  
  return contact;
}
