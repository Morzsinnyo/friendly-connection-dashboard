import { ApiResponse } from "../types/common";
import { transformDatabaseNotes } from "../types/contacts";

export const formatApiResponse = async <T extends { notes?: any }>(
  promise: Promise<{ data: T | T[] | null; error: any }>
): Promise<ApiResponse<T>> => {
  try {
    const { data, error } = await promise;
    
    if (error) {
      console.error('API Error:', error);
      return { data: null, error };
    }

    if (Array.isArray(data)) {
      const transformedData = data.map(item => ({
        ...item,
        notes: transformDatabaseNotes(item.notes)
      }));
      return { data: transformedData as T[], error: null };
    }

    if (data) {
      const transformedData = {
        ...data,
        notes: transformDatabaseNotes(data.notes)
      };
      return { data: transformedData as T, error: null };
    }

    return { data: null, error: null };
  } catch (error) {
    console.error('Error formatting API response:', error);
    return { data: null, error };
  }
};