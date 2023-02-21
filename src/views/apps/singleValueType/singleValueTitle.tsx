import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Grid,
  Typography,
} from "@mui/material";
import Link from "next/link";
import DialogCustomized from "src/@core/components/modal";
import singleValueConfig from "src/configs/singleValue";

interface Props {
    title:string;
    showButtonBox: boolean;
}

const SingleValueTitleCard = ({title, showButtonBox}:Props) => {
  return (
    <>
      <Card>
        <Box
          sx={{
            minWidth: 275,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <Grid item xs={8}>
            <CardContent>
              <Typography
                sx={{ fontSize: 24 }}
                color="text.primary"
                gutterBottom
              >
                {title}
              </Typography>
            </CardContent>
          </Grid>
          <Grid item xs={4}>
           {showButtonBox && <CardActions
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <Button sx={{ marginRight: "5px" }} variant="outlined">
                <Link href={"singlevaluetype/create"}>Create</Link>
              </Button>
              <DialogCustomized />
            </CardActions>}
          </Grid>
        </Box>
      </Card>
    </>
  );
};

export default SingleValueTitleCard;
