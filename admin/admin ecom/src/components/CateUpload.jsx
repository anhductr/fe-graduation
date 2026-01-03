import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import { FaCloudUploadAlt } from "react-icons/fa";
import axios from 'axios';
import { useNavigate } from 'react-router';
import { useLocation } from 'react-router-dom';
import CloseIcon from '@mui/icons-material/Close';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import {
    Box,
    IconButton,
    Switch,
} from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CircularProgress } from "@mui/material";


export default function CateUpload() {
    const token = localStorage.getItem("token");

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [parentId, setParentId] = useState(null);
    const [parentName, setParentName] = useState("");
    const [img, setImg] = useState(null);
    const [special, setSpecial] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();


    useEffect(() => {
        const getCategoryById = async () => {
            try {
                const res = await axios.get(`/api/v1/product-service/category/cate/${location.state.parentId}`, {
                    headers: {
                        Authorization: token ? `Bearer ${token}` : "",
                    },
                });
                setParentName(res.data.result.name);
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
        if (location.state?.parentId) {
            setParentId(location.state.parentId);
            getCategoryById();
        }
    }, [location.state]);

    // Thêm state mới (thay thế cho parentCates)
    const [rootId, setRootId] = useState(null);
    const [rootName, setRootName] = useState("");

    // Trong useEffect
    useEffect(() => {
        const fetchCates = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await axios.get(
                    "/api/v1/product-service/category/getAll",
                    {
                        headers: {
                            Authorization: token ? `Bearer ${token}` : "",
                        },
                    }
                );

                console.log("API danh mục trả về: ", res.data);

                const allCategories = res.data.result || [];

                // Tìm danh mục duy nhất có parentId === null
                const root = allCategories.find(
                    (cate) => cate.parentId === null
                );

                // Lưu trực tiếp danh mục gốc
                if (root) {
                    setRootId(root.id);
                    setRootName(root.name);
                }

            } catch (err) {
                console.error("Lỗi khi gọi API danh mục:", err);
            }
        };

        fetchCates();
    }, []);

    // useEffect(() => {
    //     console.log("parentId: ", parentId);
    // }, [parentId]);

    // useEffect(() => {
    //     console.log("img: ", img);
    // }, [img]);

    useEffect(() => {
        console.log("root: ", rootName);
    }, [rootName]);

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

    //form
    const queryClient = useQueryClient();

    const createCate = async (body) => {
        const token = localStorage.getItem("token");

        console.log("body gửi đi: ", body);

        const res = await axios.post("/api/v1/product-service/category/create", body, {
            headers: {
                "Content-Type": "application/json",
                Authorization: token ? `Bearer ${token}` : "",
            },
        });

        console.log("Response từ tạo danh mục: ", res.data);

        const cateId = res.data?.result?.id;
        let uploadRes;

        if (img && cateId) {
            const formData = new FormData();
            formData.append("multipartFile", img.file);
            formData.append("ownerId", cateId);

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
        }

        return uploadRes?.data || res.data;
    }

    // Dùng useMutation
    const createMutation = useMutation({
        mutationFn: createCate,
        onSuccess: (res) => {
            queryClient.invalidateQueries(["categories"]);

            navigate("/categories", {
                state: {
                    popup: {
                        open: true,
                        severity: "success",
                        message: "Thêm danh mục thành công!",
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
                        message: err.response?.data?.message || "Tạo danh mục thất bại!",
                        vertical: "top",
                        horizontal: "center",
                    },
                },
            });
        },
    });

    // Xử lý submit form
    const handleSubmit = async (e) => {
        e.preventDefault(); // chặn reload trang
        const body = {
            name,
            description,
            parentId: !location.state ? rootId : parentId,
            special
        };

        console.log("Submitting body: ", body);
        createMutation.mutate(body);
    };


    return (
        <>
            <div className="py-[10px] px-[100px]">
                <div className='flex justify-between items-center my-4'>
                    <h3 className="text-[30px] font-bold mb-4 text-[#403e57]">
                        Thêm danh mục
                    </h3>
                </div>


                <form onSubmit={handleSubmit}>
                    <div className="flex flex-wrap shadow border-0 p-5 my-[20px] bg-white rounded-[10px] text-[18px] justify-between">
                        <div className="w-[49%] py-[5px] px-[10px] flex flex-col gap-4">

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

                        <div className="w-[49%] py-[5px] px-[10px] flex flex-col gap-4">
                            <div className="flex flex-col gap-2">
                                <h6 className=''>Danh mục cha</h6>
                                {!location.state ? (
                                    <div className="!w-full pl-[11px] bg-[#fafafa] rounded-[5px] w-full h-[40px] border-[rgba(0,0,0,0.1)] border border-solid leading-[40px]">
                                        {rootName}
                                    </div>
                                ) : (
                                    <div className="!w-full pl-[11px] bg-[#fafafa] rounded-[5px] w-full h-[40px] border-[rgba(0,0,0,0.1)] border border-solid leading-[40px]">
                                        {parentName}
                                    </div>
                                )}
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
                        <p className="text-gray-700 font-medium">Đang tải lên dữ liệu danh mục...</p>
                    </div>
                </div>
            )}
        </>
    )
}