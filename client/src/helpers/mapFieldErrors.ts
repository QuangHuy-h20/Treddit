import { FieldError } from "../generated/graphql";

// [
//     {field:'username', message:'some error'}
// ]

// {
//     username:'some error'
// }

export const mapFieldErrors = (errors: FieldError[]):{[key:string]: string} => {
  return errors.reduce(
    (accumulatedErrorObj, error) => ({
      ...accumulatedErrorObj,
      [error.field]: error.message,
    }),
    {}
  );
};
