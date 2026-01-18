import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
    Box,
    IconButton,
    Button,
    CircularProgress,
    Switch,
    FormControlLabel
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import { FaCloudUploadAlt } from "react-icons/fa";
import { useMutation } from "@tanstack/react-query";
import PromotionService from "../../services/PromotionService";
import { api } from "../../libs/axios";
import { Select, MenuItem, FormControl, InputLabel } from "@mui/material";

// Target types mapping with Vietnamese labels
const OWNER_TYPES_MAP = [
    { value: "PRODUCT", label: "Sản phẩm" },
    { value: "CATEGORY", label: "Danh mục" },
    { value: "PRODUCT_VARIANT", label: "Biến thể sản phẩm" },
    { value: "BRAND", label: "Thương hiệu" },
    { value: "USER", label: "Người dùng" },
    { value: "PROMOTION", label: "Chương trình khuyến mãi" }
];

export default function CampaignUpload() {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = !!id;
    const location = useLocation();

    // State
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [ownerType, setOwnerType] = useState("PROMOTION"); // Default to PROMOTION
    const [showBanner, setShowBanner] = useState(false);
    const [img, setImg] = useState({
        file: null,
        preview: null,
        isExisting: false,
    });

    // Populate data in edit mode
    useEffect(() => {
        if (isEditMode && location.state?.campaign) {
            const { name, image, description } = location.state.campaign;
            setName(name || "");
            setDescription(description || "");
            if (image) {
                setShowBanner(true);
                setImg({
                    file: null,
                    preview: image,
                    isExisting: true,
                });
            }
        }
    }, [isEditMode, location.state]);

    // Clean up preview blob URL
    useEffect(() => {
        return () => {
            if (img.preview?.startsWith("blob:")) {
                URL.revokeObjectURL(img.preview);
            }
        };
    }, [img.preview]);

    const handleImageSelect = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

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

    const deleteOldImage = async (url) => {
        if (!url) return;
        try {
            await PromotionService.deleteMediaByUrl(url);
            console.log("✅ Old media deleted successfully from Cloud (URL):", url);
        } catch (error) {
            console.error("❌ Error deleting old image by URL:", error);
        }
    };

    const uploadNewImage = async (ownerId, file) => {
        const formData = new FormData();
        formData.append("imageBanner", file);
        formData.append("ownerId", ownerId);
        formData.append("ownerType", ownerType); // Already uppercase

        await api.post("/media-service/media/banner", formData);
    };

    const saveMutation = useMutation({
        mutationFn: async (payload) => {
            let res;
            let campaignId;

            if (isEditMode) {
                res = await PromotionService.updateCampaign({ ...payload, id });
                campaignId = id;
            } else {
                res = await PromotionService.createCampaign(payload);
                campaignId = res.data?.result?.id;
            }

            // Banner Logic
            if (campaignId && showBanner) {
                if (img.file) {
                    // Update: delete old then upload new
                    if (isEditMode && img.isExisting) {
                        await deleteOldImage(img.preview);
                    }
                    await uploadNewImage(campaignId, img.file);
                }
            } else if (campaignId && !showBanner && isEditMode && img.isExisting) {
                // If banner was toggled OFF in edit mode, remove it
                await deleteOldImage(img.preview);
            }

            return res.data;
        },
        onSuccess: () => {
            navigate("/promotion", {
                state: {
                    popup: {
                        open: true,
                        severity: "success",
                        vertical: "top",
                        horizontal: "center",
                        message: isEditMode ? "Cập nhật chiến dịch thành công!" : "Tạo chiến dịch thành công!",
                    }
                }
            });
        },
        onError: (err) => {
            navigate("/promotion", {
                state: {
                    popup: {
                        open: true,
                        severity: "error",
                        message: err.response?.data?.message || "Lưu chiến dịch thất bại!",
                        vertical: "top",
                        horizontal: "center",
                    },
                },
            });
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name.trim()) {
            alert("Vui lòng nhập tên chiến dịch");
            return;
        }

        if (showBanner && !img.preview) {
            alert("Vui lòng chọn ảnh cho banner hoặc tắt mục tạo banner");
            return;
        }

        const payload = {
            name: name.trim(),
            description: description.trim(),
        };

        saveMutation.mutate(payload);
    };

    return (
        <>
            <div className="py-6 px-[100px]">
                <h3 className="text-[30px] font-bold mb-6 text-[#403e57]">
                    {isEditMode ? "Chỉnh sửa chiến dịch" : "Thêm chiến dịch mới"}
                </h3>

                <form
                    onSubmit={handleSubmit}
                    className="bg-white rounded-xl shadow p-6 space-y-6 text-[18px]"
                >
                    <div className="flex flex-col gap-2">
                        <label className="font-medium">
                            Tên chiến dịch <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="bg-[#fafafa] px-4 h-[42px] rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#6440F5]"
                            required
                            maxLength={100}
                            placeholder="Nhập tên chiến dịch..."
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="font-medium">Mô tả</label>
                        <textarea
                            rows={4}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="bg-[#fafafa] px-4 py-3 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#6440F5] resize-none"
                            maxLength={500}
                            placeholder="Nhập mô tả chiến dịch..."
                        />
                    </div>

                    <div className="border-t pt-4">
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={showBanner}
                                    onChange={(e) => setShowBanner(e.target.checked)}
                                    color="primary"
                                />
                            }
                            label={<span className="font-semibold text-[#403e57]">Tạo Banner đi kèm</span>}
                        />
                    </div>

                    {showBanner && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="flex flex-col gap-2">
                                <label className="font-medium">Loại đối tượng đích</label>
                                <FormControl fullWidth size="small" sx={{ bgcolor: "#fafafa" }}>
                                    <Select
                                        value={ownerType}
                                        onChange={(e) => setOwnerType(e.target.value)}
                                        sx={{
                                            borderRadius: "8px",
                                            height: "42px",
                                            "& fieldset": { borderColor: "#E5E7EB" },
                                        }}
                                    >
                                        {OWNER_TYPES_MAP.map((item) => (
                                            <MenuItem key={item.value} value={item.value}>
                                                {item.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="font-medium">Ảnh banner chiến dịch</label>
                                <Box
                                    sx={{
                                        width: "100%",
                                        height: 300,
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
                                    onClick={() => document.getElementById("campaign-img-input").click()}
                                >
                                    {img.preview ? (
                                        <>
                                            <img
                                                src={img.preview}
                                                alt="preview"
                                                style={{
                                                    maxWidth: "100%",
                                                    maxHeight: "100%",
                                                    objectFit: "contain",
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
                                                    "&:hover": { background: "rgba(255,255,255,1)" },
                                                }}
                                            >
                                                <CloseIcon fontSize="small" />
                                            </IconButton>
                                        </>
                                    ) : (
                                        <div className="flex flex-col items-center gap-2">
                                            <AddPhotoAlternateIcon className="!text-[100px] text-gray-400" />
                                            <p className="text-gray-500 text-sm">Nhấn để chọn ảnh banner</p>
                                        </div>
                                    )}
                                    <input
                                        id="campaign-img-input"
                                        type="file"
                                        hidden
                                        accept="image/*"
                                        onChange={handleImageSelect}
                                    />
                                </Box>
                            </div>
                        </div>
                    )}

                    <div className="flex gap-3 pt-6">
                        <Button
                            type="button"
                            onClick={() => navigate("/promotion")}
                            variant="outlined"
                            className="!flex-1 !py-3 !rounded-lg !text-[16px]"
                            disabled={saveMutation.isPending}
                        >
                            Hủy
                        </Button>
                        <Button
                            type="submit"
                            disabled={saveMutation.isPending}
                            variant="contained"
                            className="!flex-[2] !flex !items-center !justify-center !gap-2 !py-3 !bg-gradient-to-r !from-[#4a2fcf] !to-[#6440F5] !rounded-lg"
                        >
                            <FaCloudUploadAlt className="text-[24px]" />
                            <span className="text-[18px] font-medium">
                                {isEditMode ? "Cập nhật chiến dịch" : "Tạo chiến dịch"}
                            </span>
                        </Button>
                    </div>
                </form>
            </div>

            {saveMutation.isPending && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white p-8 rounded-2xl shadow-2xl flex flex-col items-center gap-4 min-w-[240px]">
                        <CircularProgress size={48} sx={{ color: "#6440F5" }} />
                        <p className="font-semibold text-gray-700 text-lg">
                            {isEditMode ? "Đang cập nhật..." : "Đang xử lý..."}
                        </p>
                    </div>
                </div>
            )}
        </>
    );
}
