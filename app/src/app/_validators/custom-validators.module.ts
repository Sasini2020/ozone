import {FormGroup, ValidationErrors, ValidatorFn} from '@angular/forms';

export const allocationValidator: ValidatorFn = (control: FormGroup): ValidationErrors | null => {
  const allocationAvailable = control.get('allocationAvailable').value;
  const allocation = control.get('allocation').value;
  return allocationAvailable && allocation && (parseInt(allocation, 10) > parseInt(allocationAvailable, 10)) ?
    {invalidAllocation: true} : null;
};

