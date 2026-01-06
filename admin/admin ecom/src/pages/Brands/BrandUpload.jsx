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
import Checkbox from '@mui/material/Checkbox';
import ListItemText from '@mui/material/ListItemText';
import Chip from '@mui/material/Chip';


export default function BrandUpload() {

    const [categories, setCategories] = useState([]);
    const [name, setName] = useState("");
    const [listCategoryId, setListCategoryId] = useState([]);

    const navigate = useNavigate();

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
                console.log("res category: ", res);
                if (res.data && res.data.result && Array.isArray(res.data.result)) {
                    setCategories(res.data.result);
                } else {
                    console.error("Cấu trúc dữ liệu API không đúng:", res.data);
                    setCategories([]);
                }
            } catch (err) {
                console.error("Lỗi khi gọi API:", err);
            }
        };

        fetchAllCategories();
    }, []);

    // Xử lý thay đổi danh sách thể loại
    const handleListCategoryChange = (event) => {
        const {
            target: { value },
        } = event;
        setListCategoryId(
            // On autofill we get a stringified value.
            typeof value === 'string' ? value.split(',') : value,
        );
    };

    //form
    const queryClient = useQueryClient();

    const createBrand = async (body) => {
        const token = localStorage.getItem("token");

        const res = await axios.post("/api/v1/product-service/brand/create", body, {
            headers: {
                "Content-Type": "application/json",
                Authorization: token ? `Bearer ${token}` : "",
            },
        });
        console.log("res tạo brand ", res);
        return res.data;
    }

    // Dùng useMutation
    const createMutation = useMutation({
        mutationFn: createBrand,
        onSuccess: (res) => {
            queryClient.invalidateQueries(["brands"]);

            navigate("/categories", {
                state: {
                    popup: {
                        open: true,
                        severity: "success",
                        message: "Thêm thương hiệu thành công!",
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
                        message: err.response?.data?.message || "Tạo thương hiệu thất bại!",
                        vertical: "top",
                        horizontal: "center",
                    },
                },
            });
        },
    });

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

    // Xử lý submit form
    const handleSubmit = async (e) => {
        e.preventDefault(); // chặn reload trang
        const body = {
            name,
            categoryId: listCategoryId,
        };
        console.log("body submit brand ", body);
        createMutation.mutate(body);
    };


    return (
        <>
            <div className="py-[10px] px-[100px]">
                <div className='flex justify-between items-center my-4'>
                    <h3 className="text-[30px] font-bold mb-4 text-[#403e57]">
                        Thêm thương hiệu
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
                                            {selected.map((value) => {
                                                const category = categories.find(c => c.id === value);
                                                return (
                                                    <Chip key={value} label={category ? category.name : value} />
                                                )
                                            })}
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
                                    {categories.map((category) => (
                                        <MenuItem
                                            key={category.id}
                                            value={category.id}
                                        >
                                            <Checkbox checked={listCategoryId.indexOf(category.id) > -1} />
                                            <ListItemText primary={category.name} />
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
                        <p className="text-gray-700 font-medium">Đang tải lên dữ liệu...</p>
                    </div>
                </div>
            )}
        </>
    )
}