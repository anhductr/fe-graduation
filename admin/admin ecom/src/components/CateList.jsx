import { useRef } from 'react';
import SearchBar from './SearchBar';
import { useState, useEffect } from 'react';
import Pagination from '@mui/material/Pagination';
import Boxes from './Boxes';
import axios from "axios";
import { Link } from 'react-router';
import { MdDelete } from "react-icons/md";
import { MdEdit } from "react-icons/md";
import { FiPlus } from "react-icons/fi";
import { MdOutlineCategory } from "react-icons/md";
import { CiBoxList } from "react-icons/ci";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    IconButton, Paper, Box, Button, Dialog, DialogActions, DialogTitle
} from "@mui/material";
import {
    ExpandMore, ExpandLess,
} from "@mui/icons-material";
import { VscFilter } from "react-icons/vsc";
import { IoIosArrowUp } from "react-icons/io";
import { FaPlus } from "react-icons/fa6";
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { useLocation } from "react-router-dom";
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Chip from '@mui/material/Chip';
import { CiCircleRemove } from "react-icons/ci";
import { CiCircleCheck } from "react-icons/ci";
import { useNavigate } from "react-router-dom";

export default function CateList() {
    const navigate = useNavigate();

    const inputSearchRef = useRef(null);
    const [tabValue, setTabValue] = useState(0);

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    //api function
    const fetchCates = async () => {
        const token = localStorage.getItem("token"); // lấy token nếu cần
        const res = await axios.get(
            "/api/v1/product-service/category/getAll",
            {
                headers: {
                    Authorization: token ? `Bearer ${token}` : "",
                },
            }
        );

        console.log("Danh sách thể loại: ", res.data);

        const data = res.data.result;
        if (Array.isArray(data)) {
            return data;
        } else if (data && Array.isArray(data.data)) {
            return data.data;
        }
        return [];
    };

    const fetchBrand = async () => {
        const token = localStorage.getItem("token"); // lấy token nếu cần
        const res = await axios.get(
            "/api/v1/product-service/brand/get-all",
            {
                headers: {
                    Authorization: token ? `Bearer ${token}` : "",
                },
            }
        );

        console.log("Danh sách brand: ", res.data);

        const data = res.data.result;
        if (Array.isArray(data)) {
            return data;
        } else if (data && Array.isArray(data.data)) {
            return data.data;
        }
        return [];
    };

    const deleteCate = async (cateId) => {
        const token = localStorage.getItem("token");
        const res = await axios.delete(
            `/api/v1/product-service/category/delete/${cateId}`,
            {
                headers: {
                    Authorization: token ? `Bearer ${token}` : "",
                },
            }
        );
        console.log("Xóa thành công:", res.data);
        return res.data;
    };

    const deleteBrand = async (brandName) => {
        const token = localStorage.getItem("token");
        const res = await axios.delete(
            `/api/v1/product-service/brand/delete/${brandName}`,
            {
                headers: {
                    Authorization: token ? `Bearer ${token}` : "",
                },
            }
        );
        console.log("Xóa thành công:", res.data);
        return res.data;
    };


    function buildTree(list = []) {
        // map tất cả item theo id để dễ lookup
        const map = {};
        list.forEach(item => {
            map[item.id] = {
                ...item,
                children: []   // chuẩn bị mảng con
            };
        });

        // Gắn con vào cha (xây cây bình thường)
        list.forEach(item => {
            if (item.parentId !== null && item.parentId !== undefined && map[item.parentId]) {
                map[item.parentId].children.push(map[item.id]);
            }
        });

        // Tìm tất cả các node root (parentId === null)
        const roots = list?.filter(item => item.parentId === null || item.parentId === undefined) || [];

        // Thu thập tất cả các node con trực tiếp của các root (chính là cấp muốn hiển thị đầu tiên)
        const tree = [];
        roots.forEach(root => {
            if (map[root.id].children.length > 0) {
                tree.push(...map[root.id].children); // chỉ lấy con của root, không lấy root
            }
        });

        return tree;
    }

    //user querry cho danh mục
    const { data: cateData, isLoading: isLoadingCate, isError: isErrorCate, error: errorCate } = useQuery({
        queryKey: ["categories"],
        queryFn: fetchCates,
        refetchOnMount: "always",
    });

    //user querry cho brand
    const { data: brandData, isLoading: isLoadingBrand, isError: isErrorBrand, error: errorBrand } = useQuery({
        queryKey: ["brands"],
        queryFn: fetchBrand,
        refetchOnMount: "always",
    });

    //cate
    const cates = cateData || [];
    const treeData = buildTree(cates);

    //brand
    const brands = brandData || [];

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

    // Xóa thể loại
    const queryClient = useQueryClient();
    const deleteCateMutation = useMutation({
        mutationFn: deleteCate,
        onSuccess: (res) => {
            console.log("Xóa thành công:", res);
            // Tự động làm mới danh sách
            queryClient.invalidateQueries(["categories"]);

            //Hiện thông báo thành công
            setPopup((prev) => ({
                ...prev,
                open: true,
                message: "Xóa thể loại thành công!",
                severity: "success",
            }));
        },
        onError: (err) => {
            if (err.response) {
                console.error("Lỗi từ server:", err.response.data);
            } else if (err.request) {
                console.error("Không nhận được phản hồi từ server!");
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

    const deleteBrandMutation = useMutation({
        mutationFn: deleteBrand,
        onSuccess: (res) => {
            console.log("Xóa thành công:", res);
            // Tự động làm mới danh sách
            queryClient.invalidateQueries(["brands"]);

            //Hiện thông báo thành công
            setPopup((prev) => ({
                ...prev,
                open: true,
                message: "Xóa thể loại thành công!",
                severity: "success",
            }));
        },
        onError: (err) => {
            if (err.response) {
                console.error("Lỗi từ server:", err.response.data);
            } else if (err.request) {
                console.error("Không nhận được phản hồi từ server!");
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
    const [openConfirmCate, setOpenConfirmCate] = useState(false);
    const [selectedCateId, setSelectedCateId] = useState(null);
    const handleDeleteClickCate = (cateId) => {
        setSelectedCateId(cateId);
        setOpenConfirmCate(true);
    };
    const handleConfirmDeleteCate = () => {
        if (selectedCateId) {
            deleteCateMutation.mutate(selectedCateId);
        }
        setOpenConfirmCate(false);
        setSelectedCateId(null);
    };
    const handleCancelDeleteCate = () => {
        setOpenConfirmCate(false);
        setSelectedCateId(null);
    };

    const [openConfirmBrand, setOpenConfirmBrand] = useState(false);
    const [selectedBrand, setSelectedBrand] = useState(null);
    const handleDeleteBrandClick = (brandName) => {
        setSelectedBrand(brandName);
        setOpenConfirmBrand(true);
    };
    const handleConfirmDeleteBrand = () => {
        if (selectedBrand) {
            deleteBrandMutation.mutate(selectedBrand);
        }
        setOpenConfirmBrand(false);
        setSelectedBrand(null);
    };
    const handleCancelDeleteBrand = () => {
        setOpenConfirmBrand(false);
        setSelectedBrand(null);
    };

    useEffect(() => {
        if (isLoadingCate) {
            setPopup({
                open: true,
                vertical: "top",
                horizontal: "center",
                severity: "info",
                message: "Đang tải danh sách thể loại...",
            });
        } else if (isErrorCate) {
            // Lấy chi tiết lỗi từ server (nếu có)
            const serverError = isErrorCate?.response?.data?.message;
            const serverDetail = isErrorCate?.response?.data?.error; // nếu backend trả thêm field này
            const fallbackMessage = isErrorCate?.message || "Không xác định";

            // Log đầy đủ ra console để debug
            console.error("Chi tiết lỗi từ server:", isErrorCate);
            setPopup({
                open: true,
                vertical: "top",
                horizontal: "center",
                severity: "error",
                message: `Lỗi khi tải sản phẩm: ${serverError || serverDetail || fallbackMessage}`,
            });
        } else {
            // Khi load xong thì tắt snackbar loading
            setPopup((prev) => ({ ...prev, open: false }));
        }
    }, [isLoadingCate, isErrorCate, errorCate]);

    // Tạo map từ id category → name để hiển thị trong table thương hiệu
    const categoryMap = {};
    cateData?.forEach((cate) => {
        categoryMap[cate.id] = cate.name;
    });

    function Row({ row, level = 0 }) {
        const [open, setOpen] = useState(false);

        return (
            <>
                <TableRow>
                    <TableCell sx={{ pl: level * 3, alignItems: "center" }}>
                        <Box
                            component="span"
                            sx={{
                                display: "inline-block",
                                width: 36,       // giữ chỗ cho icon
                                textAlign: "center",
                                verticalAlign: "middle",
                            }}
                        >
                            {row.children.length !== 0 ? (
                                <IconButton size="small" onClick={() => setOpen(!open)}>
                                    {open ? <ExpandLess /> : <ExpandMore />}
                                </IconButton>
                            ) : null}
                        </Box>
                        {row.name}
                    </TableCell>
                    <TableCell align="center">
                        {row.mediaResponse && row.mediaResponse.length > 0 ? (
                            <img
                                src={row.mediaResponse[0].url}
                                alt="thumbnail"
                                style={{ width: 50, height: 50, objectFit: "cover", borderRadius: 8 }}
                            />
                        ) : (
                            "Không có ảnh"
                        )}
                    </TableCell>
                    <TableCell
                        align="center"
                    >
                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                            }}
                        >
                            {row.special ? (
                                <CiCircleCheck size={24} color="green" />
                            ) : (
                                <CiCircleRemove size={24} color="red" />
                            )}
                        </Box>
                    </TableCell>
                    <TableCell >{row.description}</TableCell>
                    <TableCell align="center">
                        <Link to={`/categories/categories-upload`} state={{ parentId: row.id }}>
                            <IconButton size="small"><FiPlus /></IconButton>
                        </Link>
                        <Link to={`/categories/categories-edit/${row.id}`}>
                            <IconButton size="small"><MdEdit /></IconButton>
                        </Link>
                        <IconButton size="small" onClick={() => handleDeleteClickCate(row.id)}><MdDelete /></IconButton>
                    </TableCell>
                </TableRow>

                {row.children && open && row.children.map((child) => (
                    <Row key={child.name} row={child} level={level + 1} />
                ))}
            </>
        );
    }

    //xem dữ liệu
    useEffect(() => {
        console.log('tree:', treeData);
    }, [treeData]);

    return (
        <>
            <div className="py-[10px] px-[100px]">
                <Snackbar
                    anchorOrigin={{ vertical, horizontal }}
                    open={open}
                    key={vertical + horizontal}
                    autoHideDuration={isLoadingCate ? null : 3000}
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
                        Quản lý danh mục
                    </h3>
                </div>

                <div className="flex flex-wrap gap-[26px] w-full">
                    <Boxes color={"#81bcfaff"} header={"Tổng danh mục"} icon={<MdOutlineCategory />} ></Boxes>
                    <Boxes color={"#dd92f4ff"} header={"Danh mục cha"} icon={<CiBoxList />} ></Boxes>
                </div>

                <div className="shadow border-0 p-5 my-[20px] bg-white rounded-[10px]">
                    {/* <div className="w-screen pt-2 pb-4 font-semibold text-gray-900 text-[20px]">
                        Danh sách thể loại
                    </div> */}

                    {/* Tabs */}
                    <Tabs
                        value={tabValue}
                        onChange={handleTabChange}
                        aria-label="tabs danh mục và thương hiệu"
                        sx={{
                            mb: 3,
                            '& .MuiTabs-indicator': {
                                backgroundColor: '#4a2fcf',
                            },
                        }}
                    >
                        <Tab
                            label="Danh sách thể loại"
                            sx={{
                                textTransform: 'none',
                                fontWeight: 600,
                                fontSize: '18px',
                                '&.Mui-selected': {
                                    color: '#4a2fcf',
                                },
                            }}
                        />
                        <Tab
                            label="Quản lý thương hiệu"
                            sx={{
                                textTransform: 'none',
                                fontWeight: 600,
                                fontSize: '18px',
                                '&.Mui-selected': {
                                    color: '#4a2fcf',
                                },
                            }}
                        />
                    </Tabs>
                    {tabValue === 0 && (
                        <>
                            {/* search bar + filter */}
                            <div
                                className="py-5 relative flex"
                                onClick={(e) => {
                                    if (inputSearchRef.current && e.target !== inputSearchRef.current) {
                                        inputSearchRef.current.blur(); // click ngoài -> blur input
                                    }
                                }}
                            >
                                <SearchBar ref={inputSearchRef} />
                                <Button size="medium" className='!text-[#403e57] !border !border-[#ccc] !ml-4 !px-3 !rounded-[10px] !hover:bg-gray-100 !normal-case' variant="outlined" >
                                    <VscFilter className='' />
                                    <span className='ml-1'>Bộ lọc</span>
                                    <IoIosArrowUp className='ml-1' />
                                </Button>
                                <Button variant="contained" className='!ml-auto !normal-case !bg-gradient-to-r !from-[#4a2fcf] !to-[#6440F5] !shadow' component={Link} to="/categories/categories-upload">
                                    <FaPlus className='mr-1' />
                                    <span className='ml-1'>Thêm thể loại mới</span>
                                </Button>
                            </div>
                            {/* table */}
                            <div className=''>
                                <TableContainer component={Paper} sx={{
                                    borderTop: "1px solid #e0e0e0",
                                    borderRight: "1px solid #e0e0e0",
                                    borderLeft: "1px solid #e0e0e0",
                                }}>
                                    <Table>
                                        <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
                                            <TableRow>
                                                <TableCell sx={{ width: "35%" }}>Tên thể loại</TableCell>
                                                <TableCell sx={{ width: "15%" }} align="center">Ảnh</TableCell>
                                                <TableCell sx={{ width: "10%" }} align="center">Đặc biệt</TableCell>
                                                <TableCell sx={{ width: "20%" }} align="center">Mô tả</TableCell>
                                                <TableCell sx={{ width: "20%" }} align="center">Thao tác</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {treeData.map((row) => (
                                                <Row key={row.name} row={row} />
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </div>
                        </>
                    )}

                    {tabValue === 1 && (
                        <>
                            {/* search bar + filter */}
                            <div
                                className="py-5 relative flex"
                                onClick={(e) => {
                                    if (inputSearchRef.current && e.target !== inputSearchRef.current) {
                                        inputSearchRef.current.blur(); // click ngoài -> blur input
                                    }
                                }}
                            >
                                <SearchBar ref={inputSearchRef} />

                                <Button variant="contained" className='!ml-auto !normal-case !bg-gradient-to-r !from-[#4a2fcf] !to-[#6440F5] !shadow' component={Link} to="/categories/brand-upload">
                                    <FaPlus className='mr-1' />
                                    <span className='ml-1'>Thêm thương hiệu mới</span>
                                </Button>
                            </div>

                            <TableContainer component={Paper} sx={{
                                borderTop: "1px solid #e0e0e0",
                                borderRight: "1px solid #e0e0e0",
                                borderLeft: "1px solid #e0e0e0",
                            }}>
                                <Table>
                                    <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
                                        <TableRow>
                                            <TableCell sx={{ width: "30%" }}>Tên thương hiệu</TableCell>
                                            <TableCell sx={{ width: "50%" }}>Danh sách thể loại liên kết</TableCell>
                                            <TableCell sx={{ width: "20%" }} align="center">Thao tác</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {brands.map((brand, index) => (
                                            <TableRow key={index}> {/* Dùng name làm key vì không có id */}
                                                <TableCell>{brand.name}</TableCell>
                                                <TableCell>
                                                    {brand.categoryId && brand.categoryId.length > 0 ? (
                                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                            {brand.categoryId.map((catId) => {
                                                                const catName = categoryMap[catId] || `ID: ${catId} (không tìm thấy)`;
                                                                return (
                                                                    <Chip
                                                                        key={catId}
                                                                        label={catName}
                                                                        size="small"
                                                                        color="primary"
                                                                        variant="outlined"
                                                                    />
                                                                );
                                                            })}
                                                        </Box>
                                                    ) : (
                                                        <span style={{ color: '#999' }}>Chưa liên kết thể loại nào</span>
                                                    )}
                                                </TableCell>
                                                <TableCell align="center">
                                                    {/* Nút sửa - truyền name hoặc bạn có thể mã hóa để làm param */}

                                                    <IconButton
                                                        size="small"
                                                        onClick={() => {
                                                            navigate("/categories/brand-edit", {
                                                                state: { brand },  // truyền brand đầy đủ
                                                                replace: false     // giữ history
                                                            });
                                                        }}
                                                    >
                                                        <MdEdit />
                                                    </IconButton>

                                                    {/* Nút xóa - tạm thời comment nếu chưa có API xóa theo name */}
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleDeleteBrandClick(brand.name)}
                                                        color="error"
                                                    >
                                                        <MdDelete />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </>
                    )}
                </div>
            </div>
            {/* Modal xác nhận xoá */}
            <Dialog
                open={openConfirmCate}
                onClose={handleCancelDeleteCate}
            >
                <DialogTitle>Bạn có chắc chắn muốn xoá thể loại này không?</DialogTitle>
                <DialogActions>
                    <Button onClick={handleCancelDeleteCate} color="inherit">
                        Không
                    </Button>
                    <Button onClick={handleConfirmDeleteCate} color="error" variant="contained">
                        Có
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={openConfirmBrand}
                onClose={handleCancelDeleteBrand}
            >
                <DialogTitle>Bạn có chắc chắn muốn xoá thương hiệu này không?</DialogTitle>
                <DialogActions>
                    <Button onClick={handleCancelDeleteBrand} color="inherit">
                        Không
                    </Button>
                    <Button onClick={handleConfirmDeleteBrand} color="error" variant="contained">
                        Có
                    </Button>
                </DialogActions>
            </Dialog>
        </>

    )
}