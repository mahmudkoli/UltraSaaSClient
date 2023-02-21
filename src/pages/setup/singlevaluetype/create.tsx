// ** MUI Imports
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";

// ** component Imports
import SingleValueTypeConfigForm from "src/views/apps/singleValueType/singleValueForm";
import SingleValueTitleCard from "src/views/apps/singleValueType/singleValueTitle";

const SingleTypeForm = () => {
  return (

    <Box sx={{ flexGrow: 1 }}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <SingleValueTitleCard title="Create Single Value" showButtonBox={false}/>
        </Grid>
        <Grid item xs={12}>
        <Card>
          <CardContent>
            <SingleValueTypeConfigForm singleValueTypeData={null} />
          </CardContent>
        </Card>
        </Grid>
      </Grid>
    </Box>
   
  );
};

export default SingleTypeForm;
