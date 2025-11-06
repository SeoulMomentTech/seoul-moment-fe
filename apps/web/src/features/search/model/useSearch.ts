import { useState } from "react";

const useSearch = () => {
  const [value, setValue] = useState("");

  const handleChange = (input: string) => {
    setValue(input);
  };

  const handleResetInput = () => {
    setValue("");
  };

  return { value, handleChange, handleResetInput };
};

export default useSearch;
