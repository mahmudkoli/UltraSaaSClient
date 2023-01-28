import { TextField } from "@mui/material";
import React from "react";
import { Formik, Form, useField } from "formik";

interface Props {
  label: string;
  variant: string;
  name: string;
  id: string;
  type?:string;
  placeholder?: string;
}

function MyTextInput(props: Props) {
  const [field, meta] = useField(props);

  return (
    <>
      <TextField className="input-field" {...field} {...props} />
      {meta.touched && meta.error ? (
        <div className="input-field-error">{meta.error}</div>
      ) : null}
    </>
  );
}

export default MyTextInput;