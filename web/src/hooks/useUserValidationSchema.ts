import { formInputPhoneSchema } from '@schema';
import * as yup from 'yup';

export const useUserValidationSchema = () => {
  return yup.object({
    firstName: yup.string().required(),
    lastName: yup.string().required(),
    phone: formInputPhoneSchema,
    picture: yup.string(),
  });
};