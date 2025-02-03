import { ApiResponse } from '@/api/types/common';
import { Contact, ContactResponse, transformContactResponse } from '@/api/types/contacts';
import { PostgrestResponse, PostgrestSingleResponse } from '@supabase/supabase-js';

export function formatApiResponse<T>(
  promise: Promise<PostgrestResponse<T> | PostgrestSingleResponse<T>>
): Promise<ApiResponse<T>> {
  return promise.then(({ data, error }) => {
    if (error) {
      console.error('API Error:', error);
      return {
        data: null,
        error,
      };
    }

    return {
      data,
      error: null,
    };
  });
}

export function formatContactResponse(
  promise: Promise<PostgrestSingleResponse<ContactResponse>>
): Promise<ApiResponse<Contact>> {
  return promise.then(({ data, error }) => {
    if (error) {
      console.error('Contact API Error:', error);
      return {
        data: null,
        error,
      };
    }

    return {
      data: data ? transformContactResponse(data) : null,
      error: null,
    };
  });
}

export function formatContactsResponse(
  promise: Promise<PostgrestResponse<ContactResponse>>
): Promise<ApiResponse<Contact[]>> {
  return promise.then(({ data, error }) => {
    if (error) {
      console.error('Contacts API Error:', error);
      return {
        data: null,
        error,
      };
    }

    return {
      data: data ? data.map(transformContactResponse) : [],
      error: null,
    };
  });
}