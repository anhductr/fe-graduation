import { useState, useRef, useEffect } from "react";
import InputBase from "@mui/material/InputBase";
import { styled } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";
import Popover from "@mui/material/Popover";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import CircularProgress from "@mui/material/CircularProgress";
import axios from "axios";
import debounce from "lodash.debounce";
import { useMemo } from "react";

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
    width: "350px",  // ← Bố tự thay số này để chỉnh chiều dài thanh search (ví dụ 300px, 400px, 450px...)
    border: "1px solid #ccc",
    borderRadius: "6px",
  },
}));

export default function SearchBar({ onSelectProduct }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [keyword, setKeyword] = useState("");
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const token = localStorage.getItem("token");

  const searchProducts = async (kw) => {
    if (!kw || kw.trim().length < 2) return [];
    try {
      const res = await axios.post(
        "/api/v1/search-service/search/admin?page=1&size=20",
        { productName: kw.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log(res.data.result.productGetVMList);
      return res.data.result.productGetVMList || [];
    } catch (err) {
      console.error(err);
      return [];
    }
  };

  const debouncedSearch = useMemo(
    () => debounce(async (kw) => {
      setLoading(true);
      const results = await searchProducts(kw);
      setOptions(results.map(r => ({ id: r.id, label: r.name })));
      setLoading(false);
    }, 500),
    [token]
  );

  useEffect(() => {
    if (keyword.trim().length >= 2) {
      debouncedSearch(keyword);
    } else {
      setOptions([]);
    }
  }, [keyword, debouncedSearch]);

  const handleFocus = (e) => {
    setAnchorEl(e.currentTarget);
  };

  const handleSelect = (option) => {
    setKeyword(option.label);
    setOptions([]);
    setAnchorEl(null);
    if (onSelectProduct) onSelectProduct(option); // truyền cả option (có id và label)

    setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.setSelectionRange(option.label.length, option.label.length);
    }, 0);
  };

  const open = Boolean(anchorEl && keyword.trim().length >= 2 && (options.length > 0 || loading));

  return (
    <>
      <div
        style={{ position: "relative", width: "350px" }}
        onClick={() => inputRef.current?.focus()}  // ← Thêm dòng này
      >  {/* ← Giữ đồng bộ với width input nếu muốn */}
        <SearchIconWrapper>
          <SearchIcon />
        </SearchIconWrapper>
        <StyledInputBase
          inputRef={inputRef}
          placeholder="Tìm kiếm…"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onFocus={handleFocus}
        />
        {loading && (
          <CircularProgress
            color="inherit"
            size={20}
            sx={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)" }}
          />
        )}
      </div>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        disableEnforceFocus  // ← Quan trọng: cho phép focus vẫn ở input khi popover mở
        disableAutoFocus     // ← Ngăn popover tự lấy focus
        disableRestoreFocus  // ← Ngăn popover trả focus lại khi đóng (an toàn thêm)
        PaperProps={{
          sx: {
            width: inputRef.current?.offsetWidth || "350px",
            maxHeight: 300,
            overflow: "auto",
            mt: 0.5,  // optional: khoảng cách nhẹ với input
          },
        }}
      >
        <List dense>
          {loading ? (
            <ListItem>
              <ListItemText primary="Đang tải..." />
            </ListItem>
          ) : (
            options.map((opt) => (
              <ListItem
                key={opt.id}
                button
                onClick={() => handleSelect(opt)}
              >
                <ListItemText primary={opt.label} />
              </ListItem>
            ))
          )}
          {options.length === 0 && keyword.trim().length >= 2 && (
            <ListItem>
              <ListItemText primary="Không có kết quả" />
            </ListItem>
          )}
        </List>
      </Popover>
    </>
  );
}