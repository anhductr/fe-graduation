import { useState, useEffect, useRef, useMemo } from 'react';
import Pagination from '@mui/material/Pagination';
import Boxes from '../../components/common/Boxes';
import axios from "axios";
import { Box, Button, IconButton, Dialog, DialogActions, DialogTitle, } from "@mui/material";
import { Link } from 'react-router';
import { FiBox } from "react-icons/fi";
import { MdOutlineDiscount } from "react-icons/md";
import SearchBar from '../../components/common/SearchBar';
import { VscFilter } from "react-icons/vsc";
import { IoIosArrowUp } from "react-icons/io";
import { FaPlus } from "react-icons/fa6";
import { AiOutlinePicture } from "react-icons/ai";
import { VscSymbolColor } from "react-icons/vsc";
import { AiOutlineEye } from "react-icons/ai";
import { IoTrashOutline } from "react-icons/io5";
import { MdOutlineModeEdit } from "react-icons/md";
import { RiFolderVideoLine } from "react-icons/ri";
import { FaRegStar } from "react-icons/fa";
import { AiOutlineDollar } from "react-icons/ai";
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { FaBoxes } from "react-icons/fa";
import { LiaEdit } from "react-icons/lia";
import Modal from '@mui/material/Modal';
import InventoryModal from '../../components/Inventory/InventoryModal';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { useLocation } from "react-router-dom";
import { TiStar } from "react-icons/ti";


export default function ProductList() {
    //xử lý phân trang
    const [page, setPage] = useState(1);
    const size = 6; // số sản phẩm mỗi trang

    //api function
    const queryClient = useQueryClient();

    const fetchProducts = async ({ queryKey }) => {
        const [, { page, size }] = queryKey;
        const token = localStorage.getItem("token");

        const res = await axios.get("/api/v1/product-service/product/getAll", {
            headers: {
                Authorization: token ? `Bearer ${token}` : "",
            },
            params: { page: page, size }, // backend thường bắt đầu từ 0
        });
        console.log("res1: ", res.data.result)
        return res.data.result;
    };

    const deleteProducts = async (productId) => {
        const token = localStorage.getItem("token");
        const headers = { Authorization: token ? `Bearer ${token}` : "" };

        //Xóa sản phẩm
        const resProduct = await axios.delete(
            `/api/v1/product-service/product/${productId}`,
            { headers }
        );

        return resProduct.data;
    };


    const getAllCategories = async () => {
        const token = localStorage.getItem("token");
        const res = await axios.get("/api/v1/product-service/category/getAll", {
            headers: {
                Authorization: token ? `Bearer ${token}` : "",
            },
        });

        // map name -> id để dùng tiện trong Select
        const mapped = {};
        res.data.result.data?.forEach((cate) => {
            mapped[cate.name] = cate.id;
        });

        return mapped; // return dữ liệu gọn hơn
    };

    // Xóa sản phẩm
    const deleteMutation = useMutation({
        mutationFn: deleteProducts,
        onSuccess: (res) => {
            console.log("Xóa thành công:", res);
            // Tự động làm mới danh sách
            queryClient.invalidateQueries(["products", "inventory"]);

            //Hiện thông báo thành công
            setPopup((prev) => ({
                ...prev,
                open: true,
                message: "Xóa sản phẩm thành công!",
                severity: "success",
            }));
        },
        onError: (err) => {
            if (err.response) {
                console.error("Lỗi từ server:", err.response.data);
            } else if (err.request) {
                alert("Không nhận được phản hồi từ server!");
            } else {
                console.error(`Lỗi khi gửi request: ${err.message}`);
            }
            setPopup((prev) => ({
                ...prev,
                open: true,
                message: err.response?.data?.message || "Xóa thất bại!",
                severity: "error",
            }));
        },
    });

    //modal xóa
    const [openConfirm, setOpenConfirm] = useState(false);
    const [selectedProductId, setSelectedProductId] = useState(null);
    const handleDeleteClick = (productId) => {
        setSelectedProductId(productId);
        setOpenConfirm(true);
    };
    const handleConfirmDelete = () => {
        if (selectedProductId) {
            deleteMutation.mutate(selectedProductId);
        }
        setOpenConfirm(false);
        setSelectedProductId(null);
    };
    const handleCancelDelete = () => {
        setOpenConfirm(false);
        setSelectedProductId(null);
    };

    //user querry
    //gọi và truyền data từ product api
    const {
        data: productData,
        isLoading: isLoadingProducts,
        isError: isErrorProducts,
        error: errorProducts,
    } = useQuery({
        queryKey: ["products", { page, size }], //thêm phân trang vào key
        queryFn: fetchProducts,
        refetchOnMount: "always",
        keepPreviousData: true,
    });

    const totalProduct = productData?.totalElements || 0;
    const totalPageProduct = productData?.pageSize || 1;

    //product detail
    const [productDetailOpen, setProductDetailOpen] = useState({});
    useEffect(() => {
        if (productData) {
            const subState = productData.data.reduce((acc, p) => {
                acc[p.id] = false;
                return acc;
            }, {});
            setProductDetailOpen(subState);
        }
    }, [productData]);

    const toggleProductDetail = (id) => {
        setProductDetailOpen((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    //xem dữ liệu
    // useEffect(() => {
    //     console.log('products:', products);
    // }, [products]);

    // useEffect(() => {
    //     console.log("list cate: ", listCategoryId)
    // }, [listCategoryId]);

    // useEffect(() => {
    //     console.log('product detail sub menu:', productDetailOpen);
    // }, [productDetailOpen]);

    // filter
    const inputSearchRef = useRef(null);
    const [isToggleFilter, setIsToggleFilter] = useState(false);
    const [listCategoryId, setListCategoryId] = useState([]);
    const handleListCategoryChange = (event) => {
        const {
            target: { value },
        } = event;
        setListCategoryId(typeof value === 'string' ? value.split(',') : value,);
    };

    function isOpenFilter() {
        setIsToggleFilter(!isToggleFilter);
    }

    // Gọi API bằng React Query
    const {
        data: cate = {}, // data chính là object { name: id }
        isLoading: isLoadingCate,
        isError: isErrorCate,
        error: errorCate,
    } = useQuery({
        queryKey: ["categoryForProducts"],
        queryFn: getAllCategories
    });

    const ITEM_HEIGHT = 48;
    const ITEM_PADDING_TOP = 8;
    const MenuProps = {
        PaperProps: {
            style: {
                maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
                width: 250,
            },
        },
    };

    //popup thông báo
    const [popup, setPopup] = useState({
        open: false,
        vertical: 'top',
        horizontal: 'center',
        severity: "info",
    });
    const { vertical, horizontal, open } = popup;

    const location = useLocation();

    useEffect(() => {
        if (location.state?.popup) {
            // Bọc trong timeout nhỏ để đảm bảo component render xong rồi mới set popup
            const timer = setTimeout(() => {
                setPopup({ ...location.state.popup, open: true }); // clone object mới
            }, 100);

            // Xóa state khỏi history để reload lại không hiện lại popup
            window.history.replaceState({}, document.title);

            return () => clearTimeout(timer);
        }
    }, [location.state]);


    useEffect(() => {
        if (isLoadingProducts) {
            setPopup({
                open: true,
                vertical: "top",
                horizontal: "center",
                severity: "info",
                message: "Đang tải dữ liệu sản phẩm...",
            });
        } else if (isErrorProducts) {
            const err = errorProducts;
            const serverError = err?.response?.data?.message;
            const fallbackMessage = err?.message || "Không xác định";

            console.error("Chi tiết lỗi:", err);

            setPopup({
                open: true,
                vertical: "top",
                horizontal: "center",
                severity: "error",
                message: `Lỗi khi tải dữ liệu: ${serverError || fallbackMessage}`,
            });
        } else {
            setPopup((prev) => ({ ...prev, open: false }));
        }
    }, [
        isLoadingProducts,
        isErrorProducts,
        errorProducts,
    ]);

    function StarRating({ rating }) {
        const fullStars = Math.floor(rating);
        const halfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
        return (
            <div className="flex text-yellow-400">
                {[...Array(fullStars)].map((_, i) => (
                    <TiStar key={"full" + i} className="fas fa-star text-[22px]"></TiStar>
                ))}
                {halfStar && <i className="fas fa-star-half-alt"></i>}
                {[...Array(emptyStars)].map((_, i) => (
                    <TiStar key={"empty" + i} className="far fa-star text-[22px]"></TiStar>
                ))}
            </div>
        );
    }


    //xử lý search
    const [searchTerm, setSearchTerm] = useState("");
    // const filteredProducts = useMemo(() => {
    //     return products.filter((p) => {
    //         //Kiểm tra tên sản phẩm
    //         const matchesName =
    //             !searchTerm ||
    //             p.name.toLowerCase().includes(searchTerm.toLowerCase());

    //         //Kiểm tra danh mục
    //         const matchesCategory =
    //             listCategoryId.length === 0 ||
    //             p.listCategory?.some((cate) =>
    //                 listCategoryId.includes(cate.id)
    //             );

    //         // 3️⃣ Trả về nếu thỏa cả hai điều kiện
    //         return matchesName && matchesCategory;
    //     });
    // }, [products, searchTerm, listCategoryId]);



    return (
        <>
            <div className="py-[10px] px-[100px]">
                <Snackbar
                    anchorOrigin={{ vertical, horizontal }}
                    open={open}
                    key={vertical + horizontal}
                    autoHideDuration={isLoadingProducts ? null : 3000}
                    onClose={() => setPopup((prev) => ({ ...prev, open: false }))}
                >
                    <Alert
                        severity={popup.severity ?? "info"}   // dùng ?? để tránh lỗi undefined
                        variant="filled"
                        sx={{ width: "100%" }}
                    >
                        {popup.message || ""}
                    </Alert>
                </Snackbar>

                <div className='flex justify-between items-center my-4'>
                    <h3 className="text-[30px] font-bold mb-4 text-[#403e57]">
                        Quản lý sản phẩm
                    </h3>
                </div>

                <div className="flex flex-wrap gap-[26px] w-full">
                    <Boxes color={"#9dcbfcff"} header={"Tổng sản phẩm"} total={totalProduct} icon={<FiBox />} ></Boxes>
                    <Boxes color={"#f4f292ff"} header={"Đang giảm giá"} total={totalProduct} icon={<MdOutlineDiscount />} ></Boxes>
                </div>

                {/* search bar + filter */}
                <div className='shadow border-0 p-5 my-[20px] bg-white rounded-[10px]'>
                    <div
                        className="relative flex"
                        onClick={(e) => {
                            if (inputSearchRef.current && e.target !== inputSearchRef.current) {
                                inputSearchRef.current.blur(); // click ngoài -> blur input
                            }
                        }}
                    >
                        <SearchBar
                            ref={inputSearchRef}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Button size="medium"
                            className={`${isToggleFilter ? "!border-2 !border-gray-500" : "!border !border-[#ccc]"} !text-[#403e57] !ml-4 !px-3 !rounded-[10px] !hover:bg-gray-100 !normal-case`}
                            variant="outlined"
                            onClick={isOpenFilter}
                        >
                            <VscFilter className='' />
                            <span className='ml-1'>Bộ lọc</span>
                            <IoIosArrowUp className={`ml-1 transition-transform duration-200 ${isToggleFilter ? "rotate-180" : "rotate-0"}`} />
                        </Button>
                        <Button variant="contained" className='!ml-auto !normal-case !bg-gradient-to-r !from-[#4a2fcf] !to-[#6440F5] !shadow' component={Link} to="/products/products-upload">
                            <FaPlus className='mr-1' />
                            <span className='ml-1'>Thêm sản phẩm mới</span>
                        </Button>
                    </div>
                    {/* filter */}
                    <div
                        aria-label="submenu"
                        className={`${isToggleFilter === true ? "pointer-events-auto" : "h-[0px] opacity-0 pointer-events-none"} !text-[rgba(0,0,0,0.7)] overflow-hidden transition-all duration-300 flex flex-col gap-3`}
                    >
                        <div className='flex flex-col mt-[10px] gap-1'>
                            <h1 className='text-[18px] font-bold'>
                                Danh mục
                            </h1>
                            <div className='flex justify-center'>
                                <Select
                                    labelId="demo-multiple-chip-label"
                                    id="demo-multiple-chip"
                                    multiple
                                    value={listCategoryId}
                                    onChange={handleListCategoryChange}
                                    MenuProps={MenuProps}
                                    className="!w-[49%] !bg-[#fafafa] rounded-[5px] border-[rgba(0,0,0,0.1)] border border-solid !p-[1px] !h-[45px] !rounded-[14px]"
                                >
                                    {Object.entries(cate).map(([label, value]) => (
                                        <MenuItem
                                            key={label}
                                            value={value}
                                        >
                                            {label}
                                        </MenuItem>
                                    ))}
                                </Select>
                                <Button variant="contained" className='!w-[49%] !rounded-[14px] !ml-auto !normal-case !bg-gray-600 !shadow' onClick={() => setListCategoryId([])}>
                                    <span className='ml-1'>xóa danh mục</span>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* product list */}
                <div className='flex flex-col gap-[20px]'>
                    {productData?.data?.map((product) => (
                        <div key={product.id} className='shadow border-0 rounded-[10px]'>
                            <div className="flex shadow border-0 p-5 bg-white rounded-[10px] justify-between items-center">
                                <div className='flex gap-2'>
                                    <div className=''>
                                        <img src={product.mediaList[0]?.url} alt={product.name} className="w-[110px] h-[110px] rounded-[10px]" />
                                    </div>
                                    <div className='flex flex-col justify-between'>
                                        <div className='flex justify-center items-center gap-4'>
                                            <h4 className="text-[22px] font-semibold">{product.name}</h4>
                                            <div className='flex flex-wrap items-start self-start gap-[8px]'>
                                                {product.listCategory.map((cate) => (
                                                    <div key={cate.name} className='text-[13px] rounded-[10px] bg-[#9dcbfcff] px-2 py-[2px] font-bold text-[#22558bff]'>
                                                        {cate.name}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className='flex gap-3'>
                                            <div className='flex items-center gap-1 text-[13px]'>
                                                <AiOutlinePicture className='' />
                                                <div>
                                                    {product.mediaList.length} ảnh
                                                </div>
                                            </div>
                                            <div className='flex items-center gap-1 text-[13px]'>
                                                <RiFolderVideoLine className='' />
                                                <div>
                                                    {(product.videoUrl === "") ? 0 : 1}
                                                </div>
                                            </div>
                                            {/* <div className='flex items-center gap-1 text-[13px]'>
                                                <VscSymbolColor className='' />
                                                <div className=''>
                                                    {(product.variantsResponses[0]?.color === "" ? "Không có" : product.variantsResponses[0]?.color)}
                                                </div>
                                            </div> */}
                                        </div>

                                        {/* <div className={`text-[13px] !text-[#f5f5f5] w-fit px-2 py-[2px] rounded-[10px] !bg-gradient-to-r !from-[#7b2ff7] !to-[#f107a3]`}>
                                            <StarRating rating={product.avgRating} />
                                        </div> */}

                                        <div className={`text-[13px] !text-[#f5f5f5] w-fit px-2 py-[2px] rounded-[10px] !bg-gradient-to-r !from-[#7b2ff7] !to-[#f107a3]`}>
                                            Đã bán {product.sold}
                                        </div>
                                        {/* <div className={`text-[13px] !text-[#f5f5f5] w-fit px-2 py-[2px] rounded-[10px] ${product.inStock === true ? "!bg-gradient-to-r !from-[#2ecc71] !to-[#27ae60]" : "!bg-gradient-to-r !from-[#e53935] !to-[#ff1744]"}`}>
                                        {(product.inStock === true) ?
                                        <div className='flex items-center gap-1'><HiArchiveBox className='' /> Còn hàng</div>
                                        :
                                        <div className='flex items-center gap-1'><HiArchiveBoxXMark className='' /> Hết hàng</div>}
                                        </div> */}
                                    </div>
                                </div>

                                <div className='flex flex-col self-start gap-4'>
                                    <div className='flex gap-4 self-start'>
                                        <div>
                                            <Button variant="contained" className='!normal-case !bg-gradient-to-r !from-[#7b2ff7] !to-[#f107a3] !rounded-[10px] !text-[13px]' onClick={() => toggleProductDetail(product.id)} startIcon={<AiOutlineEye className='!text-[17px]' />}>
                                                {productDetailOpen[product.id] === true ? "Thu gọn" : "Chi tiết"}
                                            </Button>
                                        </div>
                                        <Link to={`/products/products-edit/${product.id}`}>
                                            <Button variant="contained" className='!normal-case !bg-gradient-to-r !from-[#4a2fcf] !to-[#6440F5] !rounded-[10px] !text-[13px]' startIcon={<MdOutlineModeEdit className='!text-[17px]' />}>
                                                Sửa
                                            </Button>
                                        </Link>
                                        <div>
                                            <Button variant="contained" className='!normal-case !bg-gradient-to-r !from-[#e53935] !to-[#ff1744] !rounded-[10px] !text-[13px]' onClick={() => handleDeleteClick(product.id)} startIcon={<IoTrashOutline className='!text-[17px]' />}>
                                                Xóa
                                            </Button>
                                        </div>
                                    </div>

                                </div>
                            </div>
                            <div
                                aria-label="submenu"
                                className={`!text-[16px] mx-5 flex flex-wrap gap-3 justify-start ${productDetailOpen[product.id] === true ? "py-5" : "h-[0px] opacity-0"} !text-[rgba(0,0,0,0.7)] overflow-hidden transition-all duration-300`}
                            >
                                {product.variantsResponses.map((variant) => (
                                    <div className='flex gap-4 w-[24%]' key={variant.sku}>
                                        <img src={variant.thumbnail} className="w-[70px] h-[70px] rounded-[10px]" />
                                        <div className='flex flex-col gap-2'>
                                            <div className='text-[13px]'>
                                                {variant.variantName}
                                            </div>
                                            <div>
                                                {new Intl.NumberFormat("vi-VN", {
                                                    style: "currency",
                                                    currency: "VND",
                                                }).format(variant.price)}
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {/* <div className='flex flex-col w-[25%] items-center gap-[2px]'>
                                    <div className='flex gap-1 items-center justify-center'>
                                        <AiOutlineDollar />
                                        <div>Giá</div>
                                    </div>
                                    <div className='font-bold'>
                                        {new Intl.NumberFormat("vi-VN", {
                                            style: "currency",
                                            currency: "VND",
                                        }).format(product.variantsResponses[0].price)}
                                    </div>
                                </div> */}

                                {/* <div className='flex flex-col w-[25%] items-center gap-[2px]'>
                                    <div className='flex gap-1 items-center justify-center'>
                                        <MdOutlineDiscount />
                                        <div>Khuyến mãi</div>
                                    </div>
                                    <div className='font-bold'>
                                        {product.avgRating}
                                    </div>
                                </div> */}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="shadow border-0 p-5 my-[20px] bg-white rounded-[10px]">
                    <div className='flex justify-center'>
                        <Pagination
                            count={totalPageProduct}
                            page={page}
                            onChange={(e, value) => setPage(value)}
                            sx={{
                                "& .MuiPaginationItem-root.Mui-selected": {
                                    background: "linear-gradient(to right, #4a2fcf, #6440F5)",
                                    color: "#fff",
                                },
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Modal xác nhận xoá */}
            <Dialog
                open={openConfirm}
                onClose={handleCancelDelete}
            >
                <DialogTitle>Bạn có chắc chắn muốn xoá sản phẩm này không?</DialogTitle>
                <DialogActions>
                    <Button onClick={handleCancelDelete} color="inherit">
                        Không
                    </Button>
                    <Button onClick={handleConfirmDelete} color="error" variant="contained">
                        Có
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    )
}
