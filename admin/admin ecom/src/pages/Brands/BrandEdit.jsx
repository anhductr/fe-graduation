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
import Checkbox from '@mui/material/Checkbox';
import ListItemText from '@mui/material/ListItemText';
import Chip from '@mui/material/Chip';
import { useLocation } from "react-router-dom";

export default function BrandEdit() {
    const navigate = useNavigate();
    const location = useLocation();

    // Lấy dữ liệu brand từ state (nếu có)
    const brandData = location.state?.brand;

    // State cho form
    const [name, setName] = useState(brandData?.name || "");
    const [listCategoryId, setListCategoryId] = useState(
        brandData?.categoryId || []
    );

    const [cate, setCate] = useState('');

    // useEffect(() => {
    //     console.log("cate: ", cate);
    // }, [cate]);

    // Xử lý thay đổi danh sách thể loại
    const handleListCategoryChange = (event) => {
        setListCategoryId(event.target.value);
    };

    useEffect(() => {
        const fetchAllCategories = async () => {
            try {
                const token = localStorage.getItem("token"); // lấy token nếu cần
                const res = await axios.get(
                    "/api/v1/product-service/category/getAll",
                    {
                        headers: {
                            Authorization: token ? `Bearer ${token}` : "",
                        },
                    }
                );
                const mapped = {};
                res.data.result.forEach((cate) => {
                    mapped[cate.name] = cate.id;
                });
                setCate(mapped);
            } catch (err) {
                console.error("Lỗi khi gọi API:", err);
            }
        };

        fetchAllCategories();
    }, []);

    //form
    const queryClient = useQueryClient();
    const editCate = async (body) => {
        const token = localStorage.getItem("token");

        // Cập nhật thông tin danh mục
        const res = await axios.put(
            "/api/v1/product-service/brand/update",
            body,
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: token ? `Bearer ${token}` : "",
                },
            }
        );

        // Return kết quả: ưu tiên trả về uploadRes nếu có, ngược lại trả về res
        return res.data;
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
                        message: "Cập nhật thương hiệu thành công!",
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
                        message: err.response?.data?.message || "Cập nhật thương hiệu thất bại!",
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
            name,
            categoryId: listCategoryId,
        };
        createMutation.mutate(body);
    };

    const ITEM_HEIGHT = 40;
    const ITEM_PADDING_TOP = 8;
    const MenuProps = {
        PaperProps: {
            style: {
                maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
                width: 250,
            },
        },
    };

    return (
        <>
            <div className="py-[10px] px-[100px]">
                <div className='flex justify-between items-center my-4'>
                    <h3 className="text-[30px] font-bold mb-4 text-[#403e57]">
                        Chỉnh sửa thương hiệu
                    </h3>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="flex flex-wrap shadow border-0 p-5 my-[20px] bg-white rounded-[10px] text-[18px] justify-between">
                        <div className="w-[49%] py-[5px] px-[10px] flex flex-col gap-4">
                            <div className="flex flex-col gap-2">
                                <h6 className="">Tên</h6>
                                <input value={name} onChange={(e) => setName(e.target.value)} type='text' className="bg-[#fafafa] pl-[15px] rounded-[5px] w-full h-[56px] border-[rgba(0,0,0,0.1)] border border-solid"></input>
                            </div>
                        </div>

                        <div className="w-[49%] py-[5px] px-[10px] flex flex-col gap-4">
                            <div className="flex flex-col gap-2">
                                <h6 className=''>Danh sách thể loại liên kết</h6>

                                <Select
                                    labelId="demo-multiple-chip-label"
                                    id="demo-multiple-chip"
                                    multiple
                                    value={listCategoryId}
                                    onChange={handleListCategoryChange}
                                    renderValue={(selected) => (
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                            {Object.keys(cate)
                                                .filter((key) => selected.includes(cate[key])).map((value) => (
                                                    <Chip key={value} label={value} />
                                                ))}
                                        </Box>
                                    )}
                                    MenuProps={MenuProps}
                                    className="!w-full !bg-[#fafafa] rounded-[5px] border-[rgba(0,0,0,0.1)] border border-solid"
                                    sx={{
                                        bgcolor: '#fafafa',
                                        borderRadius: '5px',
                                        border: '1px solid rgba(0,0,0,0.1)',
                                        height: '56px', // Quan trọng: cố định chiều cao
                                        '& .MuiSelect-select': {
                                            padding: '16.5px 14px', // padding chuẩn của MUI InputBase
                                            display: 'flex',
                                            alignItems: 'center',
                                        },
                                    }}
                                >
                                    {Object.entries(cate).map(([label, value]) => (
                                        <MenuItem
                                            key={label}
                                            value={value}
                                        >
                                            <Checkbox checked={Array.isArray(listCategoryId) && listCategoryId.indexOf(value) > -1} />
                                            <ListItemText primary={label} />
                                        </MenuItem>
                                    ))}
                                </Select>
                            </div>
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