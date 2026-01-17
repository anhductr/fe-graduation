import React, { useState } from 'react';
import {
    Box,
    Button,
    IconButton,
    TextField,
    CircularProgress
} from '@mui/material';
import bannerService from '../../services/bannerService';
import { toast } from 'react-toastify';
import { FaCloudUploadAlt } from "react-icons/fa";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import CloseIcon from "@mui/icons-material/Close";

const BannerForm = ({ onSuccess, onClose }) => {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState("");
    const [link, setLink] = useState("");
    const [loading, setLoading] = useState(false);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
        }
    };

    const handleImageRemove = (e) => {
        e.stopPropagation();
        if (preview) URL.revokeObjectURL(preview);
        setFile(null);
        setPreview("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            toast.error("Vui lòng chọn ảnh banner");
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("imageBanner", file);
            if (link) {
                formData.append("link", link);
            }

            await bannerService.createBanner(formData);
            toast.success("Tạo banner thành công");
            if (onSuccess) onSuccess();
            if (onClose) onClose();
        } catch (error) {
            console.error("Create banner error:", error);
            toast.error("Tạo banner thất bại");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 text-[16px]">
            {/* Image Upload */}
            <div className="flex flex-col gap-2">
                <label className="font-medium text-gray-700">Ảnh Banner <span className="text-red-500">*</span></label>
                <Box
                    sx={{
                        width: "100%",
                        height: 200,
                        border: "2px dashed #bbb",
                        borderRadius: 2,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        position: "relative",
                        overflow: "hidden",
                        bgcolor: preview ? "transparent" : "#fafafa",
                        transition: "all 0.2s",
                        "&:hover": {
                            borderColor: "#6440F5",
                            bgcolor: preview ? "transparent" : "#f5f3ff",
                        },
                    }}
                    onClick={() => document.getElementById("banner-img-input").click()}
                >
                    {preview ? (
                        <>
                            <img
                                src={preview}
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
                            <AddPhotoAlternateIcon className="!text-[60px] text-gray-400" />
                            <p className="text-gray-500 text-sm">Nhấn để chọn ảnh banner</p>
                        </div>
                    )}
                    <input
                        id="banner-img-input"
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={handleFileChange}
                    />
                </Box>
            </div>

            {/* Link Input */}
            <div className="flex flex-col gap-2">
                <label className="font-medium text-gray-700">Link liên kết</label>
                <input
                    type="text"
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    placeholder="VD: /products/123 hoặc https://google.com"
                    className="bg-[#fafafa] px-4 h-[42px] rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#6440F5] w-full"
                />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 justify-end">
                <Button
                    type="button"
                    onClick={onClose}
                    variant="outlined"
                    className="!py-2 !px-6"
                    disabled={loading}
                >
                    Hủy
                </Button>
                <Button
                    type="submit"
                    disabled={loading}
                    variant="contained"
                    className="!flex !items-center !justify-center !gap-2 !py-2 !px-6 !bg-gradient-to-r !from-[#4a2fcf] !to-[#6440F5]"
                >
                    {loading ? <CircularProgress size={20} color="inherit" /> : <FaCloudUploadAlt className="text-[20px]" />}
                    <span className="font-medium">
                        {loading ? 'Đang tạo...' : 'Tạo Banner'}
                    </span>
                </Button>
            </div>
        </form>
    );
};

export default BannerForm;
