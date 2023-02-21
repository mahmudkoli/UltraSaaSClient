// ** MUI Imports
import TextField from '@mui/material/TextField'
import { useField } from 'formik';

interface Props {
  label: string;
  variant: string;
  name: string;
  id: string;
  type?:string;
  placeholder?: string;
}


const TextFieldValidation = (props: Props) => {
  const [field, meta] = useField(props);

  return (
    <>
      <TextField {...field} {...props}  />
      {(meta.touched && meta.error) &&
      <p>{meta.error}</p>}
    </>
  )
}

export default TextFieldValidation
