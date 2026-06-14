export interface ValidationErrors {
  [key: string]: string | undefined;
}

export function validateEmail(email: string): string | undefined {
  if (!email) return "Email is required";
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return "Please enter a valid email address";
  return undefined;
}

export function validateRequired(value: string, fieldName: string): string | undefined {
  if (!value || value.trim() === "") {
    return `${fieldName} is required`;
  }
  return undefined;
}

export function validateMinLength(value: string, min: number, fieldName: string): string | undefined {
  if (value && value.length < min) {
    return `${fieldName} must be at least ${min} characters`;
  }
  return undefined;
}

export function validateMaxLength(value: string, max: number, fieldName: string): string | undefined {
  if (value && value.length > max) {
    return `${fieldName} must be no more than ${max} characters`;
  }
  return undefined;
}

export function validatePhone(phone: string): string | undefined {
  if (!phone) return undefined;
  const phoneRegex = /^[\d\s\-\+\(\)]+$/;
  if (!phoneRegex.test(phone)) return "Please enter a valid phone number";
  return undefined;
}

export function validateFileSize(file: File, maxSizeMB: number): string | undefined {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return `File size must be less than ${maxSizeMB}MB`;
  }
  return undefined;
}

export function validateFileType(file: File, allowedTypes: string[]): string | undefined {
  const fileExtension = file.name.split(".").pop()?.toLowerCase();
  const mimeType = file.type;
  
  const isValidExtension = fileExtension && allowedTypes.some(type => 
    type.toLowerCase().includes(fileExtension)
  );
  const isValidMime = allowedTypes.some(type => {
    const mimePart = type.split("/")[0];
    return mimePart ? mimeType.includes(mimePart) : false;
  });
  
  if (!isValidExtension && !isValidMime) {
    return `File type not allowed. Allowed types: ${allowedTypes.join(", ")}`;
  }
  return undefined;
}

