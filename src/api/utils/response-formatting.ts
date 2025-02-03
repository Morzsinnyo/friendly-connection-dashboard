import { ApiResponse } from '@/api/types/common';
import { Contact, ContactResponse, transformContactResponse } from '@/api/types/contacts';

export function formatApiResponse<T>(data: T | null, error: Error | null = null): ApiResponse<T> {
  if (error) {
    return {
      data: null,
      error,
    };
  }

  return {
    data,
    error: null,
  };
}

export function formatContactResponse(response: ContactResponse | null, error: Error | null = null): ApiResponse<Contact> {
  if (error || !response) {
    return formatApiResponse(null, error);
  }

  return formatApiResponse(transformContactResponse(response));
}

export function formatContactsResponse(responses: ContactResponse[] | null, error: Error | null = null): ApiResponse<Contact[]> {
  if (error || !responses) {
    return formatApiResponse(null, error);
  }

  return formatApiResponse(responses.map(transformContactResponse));
}