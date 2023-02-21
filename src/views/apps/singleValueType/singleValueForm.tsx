import { Button, Grid, TextField } from "@mui/material";
import { Form, Formik } from "formik";
import { SingleValueTypeConfigFormValidation } from "src/configs/singleValue";
import { useAppDispatch } from "src/hooks/reduxHook";
import {
  addSingleValueTypeConfig,
  updateSingleValueTypeConfig,
} from "src/store/apps/singleValueType";
import { SingleValueType } from "src/types/apps/singleValueTypes";
import TextFieldValidation from "src/views/forms/form-elements/text-field/TextFieldValidation";



interface Props {
  singleValueTypeData: SingleValueType | null;
}

const SingleValueTypeConfigForm = ({ singleValueTypeData }: Props) => {
  const dispatch = useAppDispatch();

  const handleSubmit = (data: SingleValueType) => {
    console.log(data);
    if (data.id) {
      //update
      dispatch(updateSingleValueTypeConfig(data));
    } else {
      //create new
      dispatch(addSingleValueTypeConfig(data));
    }
  };
  return (
    <Grid container>
      <Grid item sm={12} md={12}>
        <Formik
          initialValues={{
            id: singleValueTypeData?.id ?? null,
            name: singleValueTypeData?.name ?? "",
            code: singleValueTypeData?.code ?? "",
            description: singleValueTypeData?.description ?? "",
          }}
          validationSchema={SingleValueTypeConfigFormValidation}
          onSubmit={(values: any, { resetForm }) => {
            handleSubmit(values);
            resetForm();
          }}
        >
          {({ handleSubmit, isSubmitting }) => (
            <Form onSubmit={handleSubmit} autoComplete="off">
              <TextFieldValidation
                label="Name"
                variant="standard"
                name="name"
                id="name"
                type="text"
              />
              <TextFieldValidation
                id="code"
                label="Code"
                variant="standard"
                type="text"
                name="code"
              />

              <TextFieldValidation
                id="description"
                label="Description"
                variant="standard"
                type="text"
                name="description"
              />

              <Button
                sx={{ margin: "10px 8px", float: "right" }}
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
