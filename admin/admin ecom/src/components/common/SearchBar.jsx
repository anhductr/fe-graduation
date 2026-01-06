import { useRef, forwardRef } from "react";
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
  top: 0,
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "inherit",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: "width 0.3s",
    width: "12ch",
    "&:focus": {
      width: "414px",
    },
    border: "1px solid #ccc",
    borderRadius: "6px",
  },
}));

// dùng forwardRef để component cha có thể điều khiển focus/blur
const SearchBar = forwardRef((props, ref) => {
  return (
    <>
      <SearchIconWrapper>
        <SearchIcon />
      </SearchIconWrapper>
      <StyledInputBase
        inputRef={ref}
        placeholder="Tìm kiếm…"
        inputProps={{ "aria-label": "search" }}
        onChange={props.onChange}
      />
    </>
  );
});

export default SearchBar;
