import { useRef } from "react";
import InputBase from "@mui/material/InputBase";
import { styled } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";

const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: "100%",
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "inherit",
  width: "100%",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    width: "350px", 
    border: "1px solid #ccc",
    borderRadius: "6px",
  },
}));

export default function LocalSearchBar({ onChange, placeholder = "Tìm kiếm...", value, width }) {
  const inputRef = useRef(null);

  return (
      <div
        style={{ position: "relative", width: width || "350px" }}
        onClick={() => inputRef.current?.focus()} 
      >
        <SearchIconWrapper>
          <SearchIcon />
        </SearchIconWrapper>
        <StyledInputBase
          inputRef={inputRef}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
        />
      </div>
  );
}
