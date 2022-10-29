import { TextField } from "@mui/material";
import React from "react";
import { Formik, Form, useField } from "formik";
import style from "./customInput.module";

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
      <TextField className={style["text-field"]} {...field} {...props} />
      {meta.touched && meta.error ? (
        <div className={style["error"]}>{meta.error}</div>
      ) : null}
    </>
  );
}

export default MyTextInput;