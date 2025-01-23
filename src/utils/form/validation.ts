export type ValidationRule = {
  validate: (value: any) => boolean;
  message: string;
};

export type ValidationResult = {
  isValid: boolean;
  errors: string[];
};

export const createValidator = (rules: ValidationRule[]) => {
  return (value: any): ValidationResult => {
    const errors: string[] = [];
    
    rules.forEach(rule => {
      if (!rule.validate(value)) {
        errors.push(rule.message);
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  };
};

export const validateField = (value: any, rules: ValidationRule[]): ValidationResult => {
  return createValidator(rules)(value);
};

export const validateForm = (values: Record<string, any>, validationRules: Record<string, ValidationRule[]>): Record<string, ValidationResult> => {
  const results: Record<string, ValidationResult> = {};
  
  Object.keys(validationRules).forEach(field => {
    results[field] = validateField(values[field], validationRules[field]);
  });
  
  return results;
};