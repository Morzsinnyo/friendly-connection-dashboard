export const defaultMessages = {
  required: 'This field is required',
  minLength: (length: number) => `Must be at least ${length} characters`,
  maxLength: (length: number) => `Must not exceed ${length} characters`,
  dateRange: 'End date must be after start date',
  url: 'Please enter a valid URL',
  email: 'Please enter a valid email address'
};

export const formatMessage = (template: string, params: Record<string, any> = {}): string => {
  return template.replace(/\${(\w+)}/g, (_, key) => params[key] || '');
};