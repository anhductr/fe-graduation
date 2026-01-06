import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { useState, useEffect, useRef } from 'react';
import Button from '@mui/material/Button';
import { FaCloudUploadAlt } from "react-icons/fa";
import axios from 'axios';
import { useParams } from 'react-router';
import { useNavigate } from 'react-router';
import {
    Box,
    IconButton,
    Switch,
} from "@mui/material";
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import CloseIcon from '@mui/icons-material/Close';
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CircularProgress } from "@mui/material";

export default function CateEdit() {
    const { id } = useParams(); // lấy cate.id từ URL
    const token = localStorage.getItem("token");
    const navigate = useNavigate();

    const [cates, setCates] = useState({});
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [parentId, setParentId] = useState(null);
    const [special, setSpecial] = useState(false);
    const [parentName, setParentName] = useState("");

    const [img, setImg] = useState(null);
    const hasImg = useRef(false);


    useEffect(() => {
        const getCategoryById = async () => {
            try {
                const res = await axios.get(`/api/v1/product-service/category/cate/${id}`, {
                    headers: {
                        Authorization: token ? `Bearer ${token}` : "",
                    },
                });
                console.log("Category details:", res);
                setName(res.data.result.name);
                setDescription(res.data.result.description);
                setParentId(res.data.result.parentId);
                setSpecial(res.data.result.special);
                const media = res.data.result?.mediaResponse;
                if (media && media.length > 0) {
                    hasImg.current = true;
                    setImg({
                        file: null,
                        preview: media[0].url,
                    });
                }
            } catch (err) {
                console.error("Lỗi khi gọi API danh mục bằng id", err);
                if (err.response) {
                    // Lỗi do server trả về
                    console.error("Lỗi từ server:", err.response.data);
                    console.error("Status code:", err.response.status);
                } else if (err.request) {
                    // Request gửi đi nhưng không nhận được phản hồi
                    console.error("Không có phản hồi từ server:", err.request);
                } else {
                    // Lỗi khác (ví dụ cấu hình sai)
                    console.error("Lỗi khi setup request:", err.message);
                }
            }
        };

        const fetchCates = async () => {
            try {
                const res = await axios.get(
                    "/api/v1/product-service/category/getAll",
                    {
                        headers: {
                            Authorization: token ? `Bearer ${token}` : "",
                        },
                    }
                );
                const mapped = {};
                console.log("All categories:", res.data);
                res.data.result.data
                    .filter((cate) => cate.id !== id) // bỏ cate hiện tại
                    .forEach((cate) => {
                        mapped[cate.name] = cate.id;
                    });

                setCates(mapped);
            } catch (err) {
                console.error("Lỗi khi gọi API tất cả danh mục", err);
                if (err.response) {
                    // Lỗi do server trả về
                    console.error("Lỗi từ server:", err.response.data);
                    console.error("Status code:", err.response.status);
                } else if (err.request) {
                    // Request gửi đi nhưng không nhận được phản hồi
                    console.error("Không có phản hồi từ server:", err.request);
                } else {
                    // Lỗi khác (ví dụ cấu hình sai)
                    console.error("Lỗi khi setup request:", err.message);
                }
            }
        };

        getCategoryById();
        fetchCates();
    }, []);

    useEffect(() => {
        console.log("cates: ", cates);
    }, [cates]);

    useEffect(() => {
        console.log("id: ", id);
        console.log("name: ", name);
        console.log("description: ", description);
        console.log("parentId: ", parentId);
        console.log("img: ", img);
    }, [id, name, description, parentId, img]);

    const handleParentChange = (event) => {
        const newParent = event.target.value;
        setParentId(newParent);
    };

    //form
    const queryClient = useQueryClient();
    const editCate = async (body) => {
        const token = localStorage.getItem("token");

        // Cập nhật thông tin danh mục
        const res = await axios.put(
            "/api/v1/product-service/category/update_cate",
            body,
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: token ? `Bearer ${token}` : "",
                },
            }
        );

        let uploadRes;

        // Nếu có ảnh mới → xóa ảnh cũ (nếu có) + upload lại
        if (img?.file) {
            if (hasImg?.current) {
                await axios.delete("/api/v1/media-service/media/delete/ownerId", {
                    headers: {
                        Authorization: token ? `Bearer ${token}` : "",
                    },
                    data: {
                        ownerId: id,
                        mediaOwnerType: "CATEGORY",
                    },
                });

                console.log("Đã xóa ảnh cũ thành công");
            } else {
                console.log("Danh mục chưa có ảnh, bỏ qua bước xóa");
            }

            // Upload ảnh mới
            const formData = new FormData();
            formData.append("multipartFile", img.file);
            formData.append("ownerId", id);

            uploadRes = await axios.post(
                "/api/v1/media-service/media/category/media",
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                        Authorization: token ? `Bearer ${token}` : "",
                    },
                }
            );

            console.log("Upload ảnh mới thành công:", uploadRes.data);
        }

        // Return kết quả: ưu tiên trả về uploadRes nếu có, ngược lại trả về res
        return uploadRes?.data || res.data;
    };

    // Dùng useMutation
    const createMutation = useMutation({
        mutationFn: editCate,
        onSuccess: (res) => {
            queryClient.invalidateQueries(["categories"]);

            navigate("/categories", {
                state: {
                    popup: {
                        open: true,
                        severity: "success",
                        message: "Cập nhật danh mục thành công!",
                        vertical: "top",
                        horizontal: "center",
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
                        message: err.response?.data?.message || "Cập nhật danh mục thất bại!",
                        vertical: "top",
                        horizontal: "center",
                    },
                },
            });
        },
    });


    const handleSubmit = async (e) => {
        e.preventDefault();
        const body = {
            id: id,
            name: name,
            description: description,
            parentId: parentId,
        };
        createMutation.mutate(body);
    };


    // Xử lý thay đổi file ảnh
    const handleImgFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const preview = URL.createObjectURL(file);
            setImg({ file, preview });
        }
    };

    const handleImgFileRemove = (e) => {
        e.stopPropagation();
        setImg(null);
    };

    const openImgFilePicker = () => {
        document.getElementById("img-input").click();
    };

    useEffect(() => {
        const getCategoryById = async () => {
            try {
                if (parentId !== null) {
                    const res = await axios.get(`/api/v1/product-service/category/cate/${parentId}`, {
                        headers: {
                            Authorization: token ? `Bearer ${token}` : "",
                        },
                    });
                    setParentName(res.data.result.name);
                } else {
                    setParentName(null);
                }
            } catch (err) {
                console.error("Lỗi khi gọi API danh mục cha", err);
                if (err.response) {
                    // Lỗi do server trả về
                    console.error("Lỗi từ server:", err.response.data);
                    console.error("Status code:", err.response.status);
                } else if (err.request) {
                    // Request gửi đi nhưng không nhận được phản hồi
                    console.error("Không có phản hồi từ server:", err.request);
                } else {
                    // Lỗi khác (ví dụ cấu hình sai)
                    console.error("Lỗi khi setup request:", err.message);
                }
            }
        };
        getCategoryById();
    }, [parentId]);

    return (
        <>
            <div className="py-[10px] px-[100px]">
                <div className='flex justify-between items-center my-4'>
                    <h3 className="text-[30px] font-bold mb-4 text-[#403e57]">
                        Chỉnh sửa danh mục
                    </h3>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="flex flex-wrap shadow border-0 p-5 my-[20px] bg-white rounded-[10px] text-[18px]">
                        <div className="w-full sm:w-1/2 py-[5px] px-[10px] flex flex-col gap-4">

                            <div className="flex flex-col gap-2">
                                <h6 className="">Tên</h6>
                                <input value={name} onChange={(e) => setName(e.target.value)} type='text' className="bg-[#fafafa] pl-[15px] rounded-[5px]  w-full h-[40px] border-[rgba(0,0,0,0.1)] border border-solid"></input>
                            </div>

                            <div className="flex flex-col gap-2 h-full">
                                <h6 className=''>Mô tả</h6>
                                <textarea value={description}
                                    onChange={(e) => setDescription(e.target.value)} className="bg-[#fafafa] pt-[15px] pl-[15px] rounded-[5px]  w-full h-full border-[rgba(0,0,0,0.1)] border border-solid" rows={5} cols={10}></textarea>
                            </div>

                        </div>

                        <div className="w-full sm:w-1/2 py-[5px] px-[10px] flex flex-col gap-4">
                            <div className="flex flex-col gap-2">
                                <h6 className=''>Danh mục cha</h6>
                                <Select
                                    value={parentId === null ? "" : parentId} // đang lưu id
                                    onChange={handleParentChange}
                                    displayEmpty
                                    inputProps={{ "aria-label": "Without label" }}
                                    className="!w-full bg-[#fafafa] rounded-[5px] w-full h-[40px] border-[rgba(0,0,0,0.1)] border border-solid !text-[18px]"
                                >
                                    <MenuItem value="">
                                        Không có danh mục cha
                                    </MenuItem>
                                    {Object.entries(cates).map(([name, id], index) => (
                                        <MenuItem key={index} value={id}>
                                            {name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </div>

                            {/* ảnh */}
                            <div className='flex flex-col gap-2 h-full'>
                                <h6>Ảnh</h6>
                                <Box
                                    sx={{
                                        width: "100%",
                                        height: 400,
                                        border: "2px dashed #aaa",
                                        borderRadius: 2,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        cursor: "pointer",
                                        overflow: "hidden",
                                        position: "relative",
                                    }}
                                    onClick={openImgFilePicker}
                                >
                                    {img ? (
                                        <>
                                            <img
                                                src={img.preview}
                                                alt="thumbnail"
                                                style={{ width: 300, height: 300, objectFit: "cover" }}
                                            />
                                            <IconButton
                                                size="small"
                                                onClick={handleImgFileRemove}
                                                sx={{
                                                    position: "absolute",
                                                    top: 4,
                                                    right: 4,
                                                    background: "rgba(255,255,255,0.7)",
                                                }}
                                            >
                                                <CloseIcon fontSize="small" />
                                            </IconButton>
                                        </>
                                    ) : (
                                        <div>
                                            <AddPhotoAlternateIcon
                                                sx={{
                                                    fill: "url(#gradient1)", // gradient cho icon
                                                }}
                                                className='!text-[140px]'
                                            />
                                            <svg width={0} height={0}>
                                                <defs>
                                                    <linearGradient id="gradient1" x1="0" y1="0" x2="1" y2="1">
                                                        <stop offset="0%" stopColor="#4a2fcf" />
                                                        <stop offset="100%" stopColor="#6440F5" />
                                                    </linearGradient>
                                                </defs>
                                            </svg>
                                        </div>
                                    )}
                                    <input
                                        id="img-input"
                                        type="file"
                                        accept="image/*"
                                        style={{ display: "none" }}
                                        onChange={handleImgFileChange}
                                    />
                                </Box>
                            </div>

                        </div>
                        <div className='py-[5px] px-[10px] w-full'>
                            <span className={`text-[21px] ${special ? 'text-green-600 font-medium' : 'text-gray-500'}`}>
                                Đặc biệt
                            </span>
                            <Switch
                                checked={special}
                                onChange={(e) => setSpecial(e.target.checked)}
                                color="primary"
                            />
                        </div>

                    </div>
                    <div className='!w-full px-[60px] py-[30px]'>
                        <Button type='submit' variant="contained" className='!w-full !flex !items-cnter !justify-center !gap-2 !p-[15px] !bg-gradient-to-r !from-[#4a2fcf] !to-[#6440F5]'>
                            <FaCloudUploadAlt className='text-[35px]' />
                            <h3 className='text-[25px]'>Tải lên</h3>
                        </Button>
                    </div>
                </form>
            </div>

            {createMutation.isPending && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white p-6 rounded-xl flex flex-col items-center gap-3">
                        <CircularProgress color="primary" />
                        <p className="text-gray-700 font-medium">Đang tải lưu thay đổi danh mục...</p>
                    </div>
                </div>
            )}
        </>
    )
}