import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import {
  Box,
  Button,
  CircularProgress,
  MenuItem,
  Select,
  Checkbox,
  ListItemText,
  Chip,
  Alert,
} from "@mui/material";
import { FaCloudUploadAlt } from "react-icons/fa";
import { api } from "../../libs/axios.js";

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 300,
    },
  },
};

export default function BrandUpload() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // State
  const [form, setForm] = useState({
    name: "",
    categoryId: [],
  });

  // ============ QUERIES ============

  // Fetch all categories
  const {
    data: allCategories = [],
    isLoading: isLoadingCategories,
    error: categoriesError,
  } = useQuery({
    queryKey: ["all-categories"],
    queryFn: async () => {
      const res = await api.get("/product-service/category/getAll");
      return res.data?.result || [];
    },
  });

  // ============ COMPUTED VALUES ============

  // Find root category
  const rootCategory = useMemo(() => {
    // Backend logic specifically looks for name "root"
    const rootByName = allCategories.find((cat) => cat.name === "root");
    if (rootByName) return rootByName;

    // Fallback: finding one with no parent
    return allCategories.find((cat) => cat.parentId === null);
  }, [allCategories]);

  // Filter only root-level categories (children of root)
  // Backend only accepts categories directly under root
  const rootLevelCategories = useMemo(() => {
    if (!rootCategory) return [];
    return allCategories.filter((cat) => cat.parentId === rootCategory.id);
  }, [allCategories, rootCategory]);

  // ============ HANDLERS ============

  const handleFormChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleCategoryChange = (event) => {
    const {
      target: { value },
    } = event;
    handleFormChange(
      "categoryId",
      typeof value === "string" ? value.split(",") : value
    );
  };

  // ============ MUTATIONS ============

  const createMutation = useMutation({
    mutationFn: async (body) => {
      const res = await api.post("/product-service/brand/create", body);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brands"] });
      navigate("/categories", {
        state: {
          popup: {
            open: true,
            severity: "success",
            message: "Thêm thương hiệu thành công!",
          },
        },
      });
    },
    onError: (err) => {
      navigate("/categories", {
        state: {
          popup: {
            open: true,
            severity: "error",
            message: err.response?.data?.message || "Tạo thương hiệu thất bại!",
          },
        },
      });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    // Client-side validation
    if (!form.name.trim()) {
      alert("Vui lòng nhập tên thương hiệu");
      return;
    }

    if (form.categoryId.length === 0) {
      alert("Vui lòng chọn ít nhất một danh mục");
      return;
    }

    createMutation.mutate(form);
  };

  // ============ LOADING & ERROR STATES ============

  if (isLoadingCategories) {
    return (
      <div className="py-6 px-[100px] flex justify-center items-center min-h-[400px]">
        <CircularProgress />
      </div>
    );
  }

  if (categoriesError) {
    return (
      <div className="py-6 px-[100px]">
        <Alert severity="error" className="mb-4">
          Không thể tải danh sách danh mục. Vui lòng thử lại.
        </Alert>
        <Button
          onClick={() => navigate("/categories")}
          variant="outlined"
          color="error"
        >
          Quay lại
        </Button>
      </div>
    );
  }

  if (rootLevelCategories.length === 0) {
    return (
      <div className="py-6 px-[100px]">
        <Alert severity="warning" className="mb-4">
          Chưa có danh mục cấp 1 nào. Vui lòng tạo danh mục trước.
        </Alert>
        <Button
          onClick={() => navigate("/categories")}
          variant="contained"
          color="primary"
        >
          Quay lại
        </Button>
      </div>
    );
  }

  // ============ RENDER ============

  return (
    <>
      <div className="py-6 px-[100px]">
        <h3 className="text-[30px] font-bold mb-6 text-[#403e57]">
          Thêm thương hiệu
        </h3>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl shadow p-6 space-y-6 text-[18px]"
        >
          {/* Info Alert */}
          <Alert severity="info" className="mb-4">
            <strong>Lưu ý:</strong> Thương hiệu chỉ có thể liên kết với các danh
            mục cấp 1 (danh mục con trực tiếp của danh mục gốc).
          </Alert>

          {/* Name Input */}
          <div className="flex flex-col gap-2">
            <label className="font-medium">
              Tên thương hiệu <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => handleFormChange("name", e.target.value)}
              className="bg-[#fafafa] px-4 h-[56px] rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#6440F5]"
              placeholder="Nhập tên thương hiệu..."
              required
              maxLength={100}
            />
          </div>

          {/* Categories Multi-Select */}
          <div className="flex flex-col gap-2">
            <label className="font-medium">
              Danh mục liên kết <span className="text-red-500">*</span>
            </label>
            <Select
              multiple
              value={form.categoryId}
              onChange={handleCategoryChange}
              renderValue={(selected) => (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {selected.map((value) => {
                    const category = rootLevelCategories.find(
                      (c) => c.id === value
                    );
                    return (
                      <Chip
                        key={value}
                        label={category ? category.name : value}
                        size="small"
                        sx={{
                          bgcolor: "#e8e2ff",
                          color: "#6440F5",
                          fontWeight: 500,
                        }}
                      />
                    );
                  })}
                </Box>
              )}
              MenuProps={MenuProps}
              displayEmpty
              className="bg-[#fafafa]"
              sx={{
                bgcolor: "#fafafa",
                borderRadius: "8px",
                minHeight: "56px",
                "& .MuiSelect-select": {
                  padding: "14px",
                  display: "flex",
                  alignItems: "center",
                },
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "rgba(0,0,0,0.1)",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#6440F5",
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#6440F5",
                  borderWidth: "2px",
                },
              }}
            >
              <MenuItem disabled value="">
                <em className="text-gray-500">Chọn các danh mục cấp 1...</em>
              </MenuItem>
              {rootLevelCategories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  <Checkbox
                    checked={form.categoryId.indexOf(category.id) > -1}
                    sx={{
                      color: "#6440F5",
                      "&.Mui-checked": {
                        color: "#6440F5",
                      },
                    }}
                  />
                  <ListItemText
                    primary={category.name}
                    secondary={
                      category.description
                        ? category.description.substring(0, 50) + "..."
                        : ""
                    }
                  />
                </MenuItem>
              ))}
            </Select>
            <p className="text-sm text-gray-500">
              * Chỉ các danh mục cấp 1 được hiển thị (
              {rootLevelCategories.length} danh mục)
            </p>
          </div>

          {/* Selected Categories Summary */}
          {form.categoryId.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm font-medium text-blue-900 mb-2">
                Đã chọn {form.categoryId.length} danh mục:
              </p>
              <ul className="list-disc list-inside text-sm text-blue-800">
                {form.categoryId.map((id) => {
                  const cat = rootLevelCategories.find((c) => c.id === id);
                  return <li key={id}>{cat?.name || id}</li>;
                })}
              </ul>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              onClick={() => navigate("/categories")}
              variant="outlined"
              className="!flex-1 !py-3"
              disabled={createMutation.isPending}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending}
              variant="contained"
              className="!flex-[2] !flex !items-center !justify-center !gap-2 !py-3 !bg-gradient-to-r !from-[#4a2fcf] !to-[#6440F5]"
            >
              <FaCloudUploadAlt className="text-[24px]" />
              <span className="text-[18px] font-medium">Tạo thương hiệu</span>
            </Button>
          </div>
        </form>
      </div>

      {/* Loading Overlay */}
      {createMutation.isPending && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white p-8 rounded-xl flex flex-col items-center gap-4 min-w-[200px]">
            <CircularProgress size={48} />
            <p className="font-medium text-gray-700 text-lg">
              Đang tạo thương hiệu...
            </p>
          </div>
        </div>
      )}
    </>
  );
}
