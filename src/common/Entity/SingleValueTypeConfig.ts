import { Column } from "src/configs/tableConfig";

export type SingleValueTypeConfig = {
    id?:string;
    name:string;
    code:string;
    description:string;
}


//table setup
  export const singleValueTypeColumns: readonly Column[] = [
    { id: 'name', label: 'Name', minWidth: 10 },
    { id: 'code', label: 'Code', minWidth: 50 },
    {
      id: 'description',
      label: 'Description',
      minWidth: 100
      
    }
  ];