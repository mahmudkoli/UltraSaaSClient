import React from "react";
//@formik
import { Form, Formik } from "formik";
//@material UI
import { Button, Grid } from "@mui/material";
//@redux
import { useAppDispatch } from "src/hooks/reduxHooks";
//@custom components
import MyTextInput from "src/common/Entity/FormInputField/MytextInput";
import { SingleValueTypeConfigFormValidation } from "./FormValidations/SingleValueTypeConfigFormValidation";

const SingleValueTypeConfigForm = () => {
  const dispatch = useAppDispatch();

  const handleSubmit = (data: any) => {
        console.log(data);
  };
  return (
    <Grid container>
      <Grid item sm={12} md={12}>
        <Formik
          initialValues={{ name: "", code: "", description: "" }}
          validationSchema={SingleValueTypeConfigFormValidation}
          onSubmit={(values: any, { resetForm }) => {
            handleSubmit(values);
            resetForm();
          }}
        >
          {({ handleSubmit, isSubmitting, errors, setFieldValue, values }) => (
            <Form onSubmit={handleSubmit} autoComplete="off">
              <MyTextInput
                label="Name"
                variant="standard"
                name="name"
                id="name"
                type="text"
              />
              <MyTextInput
                id="code"
                label="Code"
                variant="standard"
                type="text"
                name="code"
              />

              <MyTextInput
                id="description"
                label="Description"
                variant="standard"
                type="text"
                name="description"
              />

              <Button
                sx={{ margin: "10px 8px" }}
                variant="outlined"
                type="submit"
              >
                Submit
              </Button>
            </Form>
          )}
        </Formik>
      </Grid>
    </Grid>
  );
};

export default SingleValueTypeConfigForm;
