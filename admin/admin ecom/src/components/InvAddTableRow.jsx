import { TableCell, TextField, IconButton, Autocomplete, CircularProgress } from "@mui/material";
import { FaTrash } from "react-icons/fa";
import axios from "axios";
import debounce from 'lodash.debounce';
import { useState, useMemo, useEffect } from 'react';
import { Select, MenuItem } from "@mui/material";

export default function InvAddTableRow({ item, onRemove, token, onItemChange, isWatchMode }) {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [variantOptions, setVariantOptions] = useState([]); // Danh sách variant (màu + sku)
  const [selectedVariantSku, setSelectedVariantSku] = useState(item.sku || '');

  const searchProducts = async (keyword) => {
    if (!keyword || keyword.trim().length < 2) return [];
    try {
      const res = await axios.post(
        "/api/v1/search-service/search/admin?page=1&size=20",
        { productName: keyword.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("response search: ", res)
      return res.data.result.productGetVMList || [];
    } catch (err) {
      console.error(err);
      return [];
    }
  };

  const debouncedSearch = useMemo(
    () => debounce(async (keyword) => {
      setLoading(true);
      const results = await searchProducts(keyword);
      const newOpts = results.map(r => ({
        id: r.id,
        label: r.name,
        variants: r.variants || []
      }));

      // Tạo một Map với id làm key → Map tự động loại trùng key (giữ lại cái cuối cùng)
      setOptions([...new Map(newOpts.map(o => [o.id, o])).values()]);
      setLoading(false);
    }, 500),
    []
  );

  const handleInputChange = (e, value) => {
    if (value && value.trim().length >= 2) {
      debouncedSearch(value);
    } else {
      setOptions(item.selectedProduct ? [item.selectedProduct] : []);
    }
  };


  // Trong component InvAddTableRow
  const [displayUnitCost, setDisplayUnitCost] = useState('');

  // Khi item thay đổi (ví dụ: load từ DB), đồng bộ lại display
  useEffect(() => {
    if (item.unitCost != null) {
      setDisplayUnitCost(formatVND(item.unitCost));
    } else {
      setDisplayUnitCost('');
    }
  }, [item.unitCost]);

  useEffect(() => {
    if (item.selectedProduct && item.selectedProduct.variants) {
      const variants = item.selectedProduct.variants || [];
      const opts = variants.map(v => ({
        label: v.color || 'Không có màu',
        sku: v.sku
      }));
      setVariantOptions(opts);

      // Nếu đã có sku cũ thì giữ lại chọn màu tương ứng
      const existing = opts.find(o => o.sku === item.sku);
      if (existing) {
        setSelectedVariantSku(item.sku);
      } else {
        setSelectedVariantSku('');
        onItemChange('sku', ''); // reset sku nếu không khớp
      }
    } else {
      setVariantOptions([]);
      setSelectedVariantSku('');
      onItemChange('sku', '');
    }
  }, [item.selectedProduct]);

  // Hàm format số → tiền Việt Nam
  const formatVND = (num) => {
    if (!num) return '';
    return Number(num).toLocaleString('vi-VN');
  };

  return (
    <>
      {isWatchMode ? (
        <TableCell>{item.productName}</TableCell>
      ) : (
        <TableCell>
          <Autocomplete
            open={open}
            onOpen={() => setOpen(true)}
            onClose={() => {
              setOpen(false);
              if (item.selectedProduct) setOptions([item.selectedProduct]);
            }}
            loading={loading}
            options={options}
            value={item.selectedProduct || null}
            getOptionLabel={(opt) => opt?.label || ''}
            isOptionEqualToValue={(a, b) => a?.id === b?.id}
            noOptionsText="không có kết quả..."

            onChange={(e, newVal) => {
              onItemChange('selectedProduct', newVal);
              onItemChange('productName', newVal?.label || '');
              onItemChange('productId', newVal?.id || null);
              if (newVal) setOptions([newVal]);

              // Reset variant khi đổi sản phẩm
              setVariantOptions([]);
              setSelectedVariantSku('');
              onItemChange('sku', '');
            }}

            onInputChange={handleInputChange}

            renderInput={(params) => (
              <TextField
                {...params}
                size="small"
                placeholder="Tìm sản phẩm..."
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {loading && <CircularProgress color="inherit" size={20} />}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />
        </TableCell>
      )}

      {/* Cột Màu (Variant) */}
      <TableCell align="center">
        {isWatchMode ? (
          item.color || '-'  // hiển thị màu lấy từ API
        ) : (
          <Select
            size="small"
            value={selectedVariantSku}
            onChange={(e) => {
              const newSku = e.target.value;
              setSelectedVariantSku(newSku);
              onItemChange('sku', newSku);
            }}
            displayEmpty
            disabled={!item.selectedProduct || variantOptions.length === 0}
            sx={{ width: 160 }}
            renderValue={(selected) => {
              if (!selected) return <span style={{ color: '#aaa' }}>Chọn màu</span>;
              return variantOptions.find(v => v.sku === selected)?.label || '';
            }}
          >
            {variantOptions.map((opt) => (
              <MenuItem key={opt.sku} value={opt.sku}>
                {opt.label}
              </MenuItem>
            ))}
          </Select>
        )}
      </TableCell>

      {/* Cột Số lượng */}
      <TableCell align="center">
        {isWatchMode ? (
          item.quantity
        ) : (
          <TextField
            size="small"
            type="number"
            value={item.quantity || ''}
            onChange={(e) => onItemChange('quantity', e.target.value)}
            sx={{ width: 90 }}
            inputProps={{ min: 1 }}
          />
        )}
      </TableCell>

      {/* Giá nhập */}
      <TableCell align="center">
        {isWatchMode ? (
          `${displayUnitCost} ₫`
        ) : (
          <TextField
            size="small"
            value={displayUnitCost}
            onChange={(e) => {
              let value = e.target.value;

              // Chỉ cho phép số và dấu chấm (do toLocaleString tạo ra)
              const cleanValue = value.replace(/[^\d]/g, ''); // xóa hết ký tự không phải số
              const numValue = cleanValue === '' ? 0 : Number(cleanValue);

              // Cập nhật hiển thị (có dấu chấm)
              setDisplayUnitCost(formatVND(numValue));

              onItemChange('unitCost', numValue);
            }}
            placeholder="0"
            sx={{ width: 160 }}
            inputProps={{
              inputMode: 'numeric',
              style: { textAlign: 'right' },
            }}
            InputProps={{
              endAdornment: <span className="text-gray-500 text-xs ml-1">₫</span>,
              // TẮT HOÀN TOÀN nút lên/xuống
              componentsProps: {
                input: {
                  // CSS hack để ẩn nút spinner trên Chrome/Edge
                  sx: {
                    '&::-webkit-outer-spin-button, &::-webkit-inner-spin-button': {
                      WebkitAppearance: 'none',
                      margin: 0,
                    },
                    '&[type=number]': {
                      MozAppearance: 'textfield', // Firefox
                    },
                  },
                },
              },
            }}
          />
        )}
      </TableCell>

      {!isWatchMode && (
        <TableCell align="center">
          <IconButton color="error" size="small" onClick={onRemove}>
            <FaTrash />
          </IconButton>
        </TableCell>
      )}
    </>
  );
}