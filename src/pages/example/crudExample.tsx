import {
  Box,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { Skill } from "src/common/Entity/Skill";
import { useAppDispatch, useAppSelector } from "src/hooks/reduxHooks";
import {
  addExample,
  fetchExampleList,
  selectAllExample,
} from "src/slices/exampleSlice";

const crudExample = () => {
  const list = useAppSelector(selectAllExample);
  console.log(list);
  const dispatch = useAppDispatch();
  useEffect(() => {
    console.log("Getting list");
    dispatch(fetchExampleList());
  }, []);

  const addHandler = (data: any) => {
    dispatch(addExample(data));
  };

  if (list.length) {
    return (
      <Box
        sx={{
          p: 5,
          display: "flex",
          flexDirection: "row",
          justifyContent: 'center',
          alignItems: "center",
          textAlign: "center",
        }}
      >
        <List
          sx={{
            width: "100%",
            maxWidth: 360,
            bgcolor: "background.paper",
          }}
        >
          {list.map((value) => (
            <ListItem
              sx={{padding:'15px'}}
              key={value?.id}
              disableGutters
              secondaryAction={
                <IconButton aria-label="comment" title="Delete">
                 
                </IconButton>
              }
            >
              <ListItemText primary={`${value?.skillName}`} />
            </ListItem>
          ))}
        </List>
      </Box>
    );
  }

  return (
    <>
      <h1>Hello from CRUD operation</h1>;
      <Button
        component="a"
        onClick={() => dispatch(fetchExampleList())}
        variant="contained"
        sx={{ px: 5.5, marginRight: "5px" }}
      >
        Hit me for api call
      </Button>
    </>
  );
};

export default crudExample;
