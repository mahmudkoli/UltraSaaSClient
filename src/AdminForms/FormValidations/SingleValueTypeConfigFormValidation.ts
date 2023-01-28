import * as Yup from 'yup';

export const SingleValueTypeConfigFormValidation = Yup.object({
    name: Yup
        .string()
        .min(5, 'minimum length for name should be more than 4 characters')
        .required('Name is required'),
    code: Yup
        .string()
        .min(2, 'Minimum length for code should be at least 2 characters')
        .required('code is required'),
    description: Yup
        .string()
        .min(5, 'Minimum length for description should be more than 4 characters')
        .required('description is required'),
});


