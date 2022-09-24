import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { decrement, increment } from "src/slices/counterSlice";
import { RootState } from "src/store";

//material imports
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";

const Counter = () => {
  const count = useSelector((state: RootState) => state.counter.value);
  const dispatch = useDispatch();

  return (
    <Box className="content-center">
      <Box
        sx={{
          p: 5,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        <Card variant="outlined" sx={{padding:'10px'}}>
          <Typography variant="h3" sx={{ mb: 2.5 }}>
            Count: {count}
          </Typography>
        </Card>

        <Box
          sx={{
            p: 5,
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          <Button
            component="a"
            onClick={() => dispatch(increment())}
            variant="contained"
            sx={{ px: 5.5, marginRight: "5px" }}
          >
            Increment
          </Button>

          <Button
            component="a"
            onClick={() => dispatch(decrement())}
            variant="contained"
            sx={{ px: 5.5 }}
          >
            Decrement
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default Counter;
