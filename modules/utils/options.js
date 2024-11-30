export const saveOption = (option, value) => {
  // sabe option to local storage
  localStorage.setItem(option, value);
};

export const getOption = (option) => {
  // get option from local storage
  return localStorage.getItem(option);
};
