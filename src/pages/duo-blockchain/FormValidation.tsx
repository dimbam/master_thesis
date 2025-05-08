type FieldType = 'text' | 'checkbox' | 'radio' | 'dropdown' | 'daterange';

interface ValidationField {
  code: string;
  value: any;
  value2?: any;
  type: FieldType;
  message: string;
}

export const validateFieldSet = (
  selected: Record<string, boolean>,
  fields: ValidationField[],
): boolean => {
  for (const field of fields) {
    if (selected[field.code]) {
      const val = field.value;
      switch (field.type) {
        case 'text':
          if (!val || val.trim() === '') {
            alert(field.message);
            return false;
          }
          break;
        case 'checkbox':
          if (!val || val.length === 0) {
            alert(field.message);
            return false;
          }
          break;
        case 'radio':
        case 'dropdown':
          if (!val) {
            alert(field.message);
            return false;
          }
          break;
        case 'daterange':
          if (!field.value || !field.value2) {
            alert(field.message);
            return false;
          }
          if (new Date(field.value) > new Date(field.value2)) {
            alert('Start date cannot be after end date.');
            return false;
          }
      }
    }
  }
  return true;
};
