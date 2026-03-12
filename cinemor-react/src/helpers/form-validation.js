export { ValidationError as YupValidationError } from "yup";

export const convertFormDataToJSON = (formData) => {
  const data = {};
  for (const [key, value] of formData.entries()) {
    if (!key.startsWith("$")) {
      data[key] = value;
    }
  }
  return data;
};

export const response = (ok, data, message, errors = {}) => {
  return {
    ok,
    data,
    message: message || (ok ? "Vorgang erfolgreich" : "Es ist ein Fehler aufgetreten"),
    errors,
  };
};

export const initialState = {
  ok: null,
  data: {},
  message: "",
  errors: {},
};

export const transformYupErrors = (errors, data) => {
  const errObject = {};
  errors.forEach((error) => {
    errObject[error.path] = error.message;
  });

  return response(false, data, "", errObject);
};
