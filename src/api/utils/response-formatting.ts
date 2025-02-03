import { ApiResponse } from '@/api/types/common';
import { Contact, ContactResponse, transformContactResponse } from '@/api/types/contacts';
import { PostgrestResponse, PostgrestSingleResponse, PostgrestError } from '@supabase/supabase-js';

export async function formatApiResponse<T>(
  promise: Promise<PostgrestResponse<T> | PostgrestSingleResponse<T>>
): Promise<ApiResponse<T>> {
  const { data, error } = await promise;
  
  if (error) {
    console.error('API Error:', error);
    return {
      data: null,
      error,
    };
  }

  return {
    data: Array.isArray(data) ? data[0] : data,
    error: null,
  };
}

export async function formatContactResponse(
  promise: Promise<PostgrestSingleResponse<ContactResponse>>
): Promise<ApiResponse<Contact>> {
  const { data, error } = await promise;
  
  if (error) {
    console.error('Contact API Error:', error);
    return {
      data: null,
      error,
    };
  }

  if (!data) {
    return {
      data: null,
      error: null,
    };
  }

  try {
    const transformedContact = transformContactResponse(data);
    return {
      data: transformedContact,
      error: null,
    };
  } catch (error) {
    console.error('Error transforming contact:', error);
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error during contact transformation'),
    };
  }
}

export async function formatContactsResponse(
  promise: Promise<PostgrestResponse<ContactResponse>>
): Promise<ApiResponse<Contact[]>> {
  const { data, error } = await promise;
  
  if (error) {
    console.error('Contacts API Error:', error);
    return {
      data: null,
      error,
    };
  }

  if (!data) {
    return {
      data: [],
      error: null,
    };
  }

  try {
    const transformedContacts = data.map(transformContactResponse);
    return {
      data: transformedContacts,
      error: null,
    };
  } catch (error) {
    console.error('Error transforming contacts:', error);
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error during contacts transformation'),
    };
  }
}