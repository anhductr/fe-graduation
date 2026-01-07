import { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import {
  Box,
  IconButton,
  Button,
  CircularProgress,
  Switch,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import { FaCloudUploadAlt } from "react-icons/fa";
import { api } from "../../libs/axios.js";

// Constants
const MEDIA_OWNER_TYPE = "CATEGORY";

export default function CateUpload() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const queryClient = useQueryClient();
  const parentIdFromLocation = location.state?.parentId ?? null;

  const isEditMode = !!id;

  // State
  const [form, setForm] = useState({
    name: "",
    description: "",
    parentId: null,
    special: false,
  });

  const [img, setImg] = useState({
    file: null,
    preview: null,
    isExisting: false,
  });

  const { data: allCategories = [], isLoading: isLoadingAllCategories } =
    useQuery({
      queryKey: ["all-categories"],
      queryFn: async () => {
        const res = await api.get("/product-service/category/getAll");
        return res.data.result || [];
      },
    });

  const {
    data: existingCategory,
    isLoading: isLoadingCategory,
    error: categoryError,
  } = useQuery({
    queryKey: ["category", id],
    queryFn: async () => {
      const res = await api.get(`/product-service/category/cate/${id}`);
      return res.data.result;
    },
    enabled: isEditMode,
  });

  // Fetch media for existing category
  const { data: existingMedia = [] } = useQuery({
    queryKey: ["category-media", id],
    queryFn: async () => {
      const res = await api.get("/media-service/media/product/get-media", {
        params: {
          ownerId: id,
          mediaOwnerType: MEDIA_OWNER_TYPE,
        },
      });
      return res.data?.result?.mediaResponseList || [];
    },
    enabled: isEditMode,
  });

  // ============ COMPUTED VALUES ============

  // Get all descendant IDs to prevent circular reference
  const getDescendantIds = useMemo(() => {
    if (!id || !allCategories.length) return [];

    const descendants = [];
    const findDescendants = (parentId) => {
      allCategories.forEach((cat) => {
        if (cat.parentId === parentId) {
          descendants.push(cat.id);
          findDescendants(cat.id); // Recursively find children
        }
      });
    };

    findDescendants(id);
    return descendants;
  }, [id, allCategories]);

  // Filter available parent categories (exclude self and descendants)
  const availableParents = useMemo(() => {
    return allCategories.filter(
      (c) => c.id !== id && !getDescendantIds.includes(c.id)
    );
  }, [allCategories, id, getDescendantIds]);

  // ============ EFFECTS ============

  // Initialize form data in edit mode
  useEffect(() => {
    if (isEditMode && existingCategory && form.name === "") {
      setForm({
        name: existingCategory.name || "",
        description: existingCategory.description || "",
        parentId: existingCategory.parentId,
        special: existingCategory.special || false,
      });
    }
  }, [isEditMode, existingCategory, form.name]);

  // Initialize image in edit mode
  useEffect(() => {
    if (isEditMode && existingMedia.length > 0 && !img.preview) {
      console.log(existingMedia);
      setImg({
        file: null,
        preview: existingMedia[0].url,
        isExisting: true,
      });
    }
  }, [isEditMode, existingMedia, img.preview]);

  // Set parent ID from navigation state (create mode only)
  useEffect(() => {
    if (parentIdFromLocation && !isEditMode) {
      setForm((prev) => ({ ...prev, parentId: parentIdFromLocation }));
    }
  }, [parentIdFromLocation, isEditMode]);

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      if (img.preview?.startsWith("blob:")) {
        URL.revokeObjectURL(img.preview);
      }
    };
  }, [img.preview]);

  // ============ HANDLERS ============

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Revoke old blob URL if exists
    if (img.preview?.startsWith("blob:")) {
      URL.revokeObjectURL(img.preview);
    }

    setImg({
      file,
      preview: URL.createObjectURL(file),
      isExisting: false,
    });
  };

  const handleImageRemove = (e) => {
    e.stopPropagation();

    if (img.preview?.startsWith("blob:")) {
      URL.revokeObjectURL(img.preview);
    }

    setImg({
      file: null,
      preview: null,
      isExisting: false,
    });
  };

  const handleFormChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // ============ IMAGE UPLOAD HELPERS ============

  const deleteOldImage = async (cateId) => {
    try {
      await api.delete("/media-service/media/delete/ownerId", {
        data: {
          ownerId: cateId,
          mediaOwnerType: MEDIA_OWNER_TYPE,
        },
      });
    } catch (error) {
      console.error("Error deleting old image:", error);
      // Don't throw - allow upload to proceed
    }
  };

  const uploadNewImage = async (cateId, file) => {
    const formData = new FormData();
    formData.append("multipartFile", file);
    formData.append("ownerId", cateId);
    formData.append("mediaOwnerType", MEDIA_OWNER_TYPE);

    await api.post("/media-service/media/thumbnail", formData);
  };

  const handleImageUpload = async (cateId) => {
    if (!img.file) return;

    // Delete old image if we're replacing an existing one
    if (isEditMode && img.isExisting) {
      await deleteOldImage(cateId);
    }

    // Upload new image
    await uploadNewImage(cateId, img.file);
  };

  // ============ MUTATIONS ============

  const saveMutation = useMutation({
    mutationFn: async (formData) => {
      let res;
      let cateId;

      if (isEditMode) {
        // Update existing category
        res = await api.put("/product-service/category/update_cate", {
          id,
          ...formData,
        });
        cateId = id;
      } else {
        // Create new category
        res = await api.post("/product-service/category/create", formData);
        cateId = res.data?.result?.id;
      }

      // Handle image upload if needed
      if (cateId && img.file) {
        try {
          await handleImageUpload(cateId);
        } catch (uploadError) {
          console.error("Image upload failed:", uploadError);
        }
      }

      return res.data;
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await saveMutation.mutateAsync(form);

      // Success handling
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["all-categories"] });

      navigate("/categories", {
        state: {
          popup: {
            open: true,
            severity: "success",
            message: isEditMode
              ? "Cập nhật danh mục thành công!"
              : "Thêm danh mục thành công!",
          },
        },
      });
    } catch (error) {
      // Error handling
      console.error("Submission failed:", error);
      navigate("/categories", {
        state: {
          popup: {
            open: true,
            severity: "error",
            message:
              error?.response?.data?.message ||
              (isEditMode
                ? "Cập nhật danh mục thất bại!"
                : "Tạo danh mục thất bại!"),
          },
        },
      });
    }
  };

  // ============ LOADING & ERROR STATES ============

  if (isEditMode && isLoadingCategory) {
    return (
      <div className="py-6 px-[100px] flex justify-center items-center min-h-[400px]">
        <CircularProgress />
      </div>
    );
  }

  if (categoryError) {
    return (
      <div className="py-6 px-[100px]">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p className="text-red-600 font-medium">
            Không thể tải dữ liệu danh mục. Vui lòng thử lại.
          </p>
          <Button
            onClick={() => navigate("/categories")}
            variant="outlined"
            color="error"
            className="!mt-4"
          >
            Quay lại
          </Button>
        </div>
      </div>
    );
  }

  // ============ RENDER ============

  return (
    <>
      <div className="py-6 px-[100px]">
        <h3 className="text-[30px] font-bold mb-6 text-[#403e57]">
          {isEditMode ? "Chỉnh sửa danh mục" : "Thêm danh mục"}
        </h3>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl shadow p-6 space-y-6 text-[18px]"
        >
          {/* Name Input */}
          <div className="flex flex-col gap-2">
            <label className="font-medium">
              Tên danh mục <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => handleFormChange("name", e.target.value)}
              className="bg-[#fafafa] px-4 h-[42px] rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#6440F5]"
              required
              maxLength={100}
            />
          </div>

          {/* Description Input */}
          <div className="flex flex-col gap-2">
            <label className="font-medium">Mô tả</label>
            <textarea
              rows={4}
              value={form.description}
              onChange={(e) => handleFormChange("description", e.target.value)}
              className="bg-[#fafafa] px-4 py-3 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#6440F5] resize-none"
              maxLength={500}
            />
          </div>

          {/* Parent Category Select */}
          <div className="flex flex-col gap-2">
            <label className="font-medium">Danh mục cha</label>
            <select
              value={form.parentId ?? ""}
              onChange={(e) =>
                handleFormChange(
                  "parentId",
                  e.target.value === "" ? null : e.target.value
                )
              }
              className="bg-[#fafafa] px-4 h-[42px] rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#6440F5]"
              disabled={isLoadingAllCategories}
            >
              <option value="">— Không có (Danh mục gốc) —</option>
              {availableParents.map((cate) => (
                <option key={cate.id} value={cate.id}>
                  {cate.name}
                </option>
              ))}
            </select>
            {isEditMode && (
              <p className="text-sm text-gray-500">
                * Không thể chọn chính danh mục này hoặc các danh mục con của nó
              </p>
            )}
          </div>

          {/* Image Upload */}
          <div className="flex flex-col gap-2">
            <label className="font-medium">Ảnh danh mục</label>
            <Box
              sx={{
                width: "100%",
                height: 260,
                border: "2px dashed #bbb",
                borderRadius: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                position: "relative",
                overflow: "hidden",
                bgcolor: img.preview ? "transparent" : "#fafafa",
                transition: "all 0.2s",
                "&:hover": {
                  borderColor: "#6440F5",
                  bgcolor: img.preview ? "transparent" : "#f5f3ff",
                },
              }}
              onClick={() => document.getElementById("img-input").click()}
            >
              {img.preview ? (
                <>
                  <img
                    src={img.preview}
                    alt="preview"
                    style={{
                      maxWidth: "100%",
                      maxHeight: "100%",
                      objectFit: "cover",
                    }}
                  />
                  <IconButton
                    size="small"
                    onClick={handleImageRemove}
                    sx={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      background: "rgba(255,255,255,0.9)",
                      "&:hover": {
                        background: "rgba(255,255,255,1)",
                      },
                    }}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <AddPhotoAlternateIcon className="!text-[100px] text-gray-400" />
                  <p className="text-gray-500 text-sm">Nhấn để chọn ảnh</p>
                </div>
              )}
              <input
                id="img-input"
                type="file"
                hidden
                accept="image/*"
                onChange={handleImageSelect}
              />
            </Box>
          </div>

          {/* Special Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-700">Đánh dấu đặc biệt</p>
              <p className="text-sm text-gray-500">
                Danh mục này sẽ được hiển thị nổi bật
              </p>
            </div>
            <Switch
              checked={form.special}
              onChange={(e) => handleFormChange("special", e.target.checked)}
              color="primary"
            />
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              onClick={() => navigate("/categories")}
              variant="outlined"
              className="!flex-1 !py-3"
              disabled={saveMutation.isPending}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={saveMutation.isPending}
              variant="contained"
              className="!flex-[2] !flex !items-center !justify-center !gap-2 !py-3 !bg-gradient-to-r !from-[#4a2fcf] !to-[#6440F5]"
            >
              <FaCloudUploadAlt className="text-[24px]" />
              <span className="text-[18px] font-medium">
                {isEditMode ? "Cập nhật danh mục" : "Tạo danh mục"}
              </span>
            </Button>
          </div>
        </form>
      </div>

      {/* Loading Overlay */}
      {saveMutation.isPending && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white p-8 rounded-xl flex flex-col items-center gap-4 min-w-[200px]">
            <CircularProgress size={48} />
            <p className="font-medium text-gray-700 text-lg">
              {isEditMode ? "Đang cập nhật..." : "Đang tạo danh mục..."}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
