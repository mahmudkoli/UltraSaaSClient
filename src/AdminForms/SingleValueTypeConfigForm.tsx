import React from "react";
//@formik
import { Form, Formik } from "formik";
//@material UI
import { Button, Grid } from "@mui/material";
//@redux
import { useAppDispatch } from "src/hooks/reduxHooks";
//@custom components
import MyTextInput from "src/common/Components/FormInputField/MytextInput";
import { SingleValueTypeConfigFormValidation } from "./FormValidations/SingleValueTypeConfigFormValidation";
//Entity
import { SingleValueTypeConfig } from "src/common/Entity/SingleValueTypeConfig";


interface Props {
  singleValueTypeData: SingleValueTypeConfig | null
}


const SingleValueTypeConfigForm = ({singleValueTypeData} : Props) => {
  const dispatch = useAppDispatch();

  const handleSubmit = (data: SingleValueTypeConfig) => {
        console.log(data);
        if(data.id) {
          //update
        }
        else {
          //create new
        }
  };
  return (
    <Grid container>
      <Grid item sm={12} md={12}>
        <Formik
          initialValues={{ id: singleValueTypeData?.id??null ,name: singleValueTypeData?.name??"", code: singleValueTypeData?.code??"", description: singleValueTypeData?.description??"" }}
          validationSchema={SingleValueTypeConfigFormValidation}
          onSubmit={(values: any, { resetForm }) => {
            handleSubmit(values);
            resetForm();
          }}
        >
          {({ handleSubmit, isSubmitting }) => (
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
                disabled={isSubmitting}
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
