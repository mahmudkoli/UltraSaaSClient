// ** React Imports
import { ChangeEvent, MouseEvent, useState, SyntheticEvent } from "react";

// ** MUI Imports
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";

// ** Icon Imports
import { SingleValueType } from "src/types/apps/singleValueTypes";
import SingleValueTypeConfigForm from "src/views/apps/singleValueType/singleValueForm";

interface State {
  password: string;
  showPassword: boolean;
}

interface Props {
  data?: SingleValueType;
}

const SingleTypeForm = () => {
  // ** States
  const [values, setValues] = useState<State>({
    password: "",
    showPassword: false,
  });
  const [confirmPassValues, setConfirmPassValues] = useState<State>({
    password: "",
    showPassword: false,
  });

  return (
    <Grid container spacing={6}>
      <Grid item xs={12} md={6}>
        <Card>
          <CardHeader title="Single Value t" />
          <CardContent>
            <SingleValueTypeConfigForm singleValueTypeData={null} />
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default SingleTypeForm;
