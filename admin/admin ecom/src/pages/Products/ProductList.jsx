import { useState, useEffect, useRef, useMemo } from "react";
import Pagination from "@mui/material/Pagination";
import Boxes from "../../components/common/Boxes";
import {
  Box,
  Button,
  IconButton,
  Dialog,
  DialogActions,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Collapse,
  Chip,
  Typography,
} from "@mui/material";
import { Link } from "react-router-dom";
import { FiBox } from "react-icons/fi";
import { MdOutlineDiscount } from "react-icons/md";
import SearchBar from "../../components/common/ProductSearchBar";
import { VscFilter } from "react-icons/vsc";
import { IoIosArrowUp, IoIosArrowDown } from "react-icons/io";
import { FaPlus } from "react-icons/fa6";
import { IoTrashOutline } from "react-icons/io5";
import { MdOutlineModeEdit } from "react-icons/md";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import { useLocation } from "react-router-dom";
import ProductService from "../../services/ProductService";

// Row component for expandable table
function ProductRow({ product, onDelete }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <TableRow sx={{ "& > *": { borderBottom: "unset" } }}>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <IoIosArrowUp /> : <IoIosArrowDown />}
          </IconButton>
        </TableCell>
        <TableCell component="th" scope="row">
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <img
              src={
                product.mediaList[0]?.url || "https://via.placeholder.com/50"
              }
              alt={product.name}
              style={{
                width: 50,
                height: 50,
                borderRadius: 8,
                objectFit: "cover",
              }}
            />
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                {product.name}
              </Typography>
              <Box sx={{ display: "flex", gap: 0.5, mt: 0.5 }}>
                {product.listCategory?.map((cate) => (
                  <Chip
                    key={cate.id}
                    label={cate.name}
                    size="small"
                    sx={{ fontSize: "10px", height: 20 }}
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Box>
            </Box>
          </Box>
        </TableCell>
        <TableCell align="center">
          {product.variantsResponses?.length || 0}
        </TableCell>
        <TableCell align="center">{product.sold || 0}</TableCell>
        {/* <TableCell align="center">
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                       <StarRating rating={product.avgRating || 0} />
                    </Box>
                </TableCell> */}
        <TableCell align="center">
          <Box sx={{ display: "flex", gap: 1, justifyContent: "center" }}>
            <Link to={`/products/products-edit/${product.id}`}>
              <IconButton color="primary" size="small">
                <MdOutlineModeEdit />
              </IconButton>
            </Link>
            <IconButton
              color="error"
              size="small"
              onClick={() => onDelete(product.id)}
            >
              <IoTrashOutline />
            </IconButton>
          </Box>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography
                variant="h6"
                gutterBottom
                component="div"
                sx={{ fontSize: "14px", fontWeight: 600 }}
              >
                Các phiên bản (Variants)
              </Typography>
              <Table size="small" aria-label="variants">
                <TableHead>
                  <TableRow>
                    <TableCell>Ảnh</TableCell>
                    <TableCell>Tên phiên bản</TableCell>
                    <TableCell>SKU</TableCell>
                    <TableCell>Giá</TableCell>
                    <TableCell align="right">Trạng thái</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {product.variantsResponses?.map((variant) => (
                    <TableRow key={variant.sku}>
                      <TableCell>
                        <img
                          src={
                            variant.thumbnail ||
                            "https://via.placeholder.com/30"
                          }
                          alt={variant.variantName}
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 4,
                            objectFit: "cover",
                          }}
                        />
                      </TableCell>
                      <TableCell>{variant.variantName}</TableCell>
                      <TableCell>{variant.sku}</TableCell>
                      <TableCell>
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(variant.price)}
                      </TableCell>
                      <TableCell align="right">
                        <Chip
                          label={variant.stock > 0 ? "Còn hàng" : "Hết hàng"}
                          color={variant.stock > 0 ? "success" : "default"}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

// function StarRating({ rating }) {
//     const fullStars = Math.floor(rating);
//     const halfStar = rating % 1 >= 0.5;
//     const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
//     return (
//         <div className="flex text-yellow-400">
//             {[...Array(fullStars)].map((_, i) => (
//                 <TiStar key={"full" + i} className="text-[18px]"></TiStar>
//             ))}
//             {halfStar && <TiStar className="text-[18px] opacity-50"></TiStar>}
//             {/* Note: TiStar doesn't have half icon easily, simplfying for now */}
//             {[...Array(emptyStars)].map((_, i) => (
//                 <TiStar key={"empty" + i} className="text-[18px] text-gray-300"></TiStar>
//             ))}
//         </div>
//     );
// }

export default function ProductList() {
  //xử lý phân trang
  const [page, setPage] = useState(1);
  const size = 10; // Tăng size cho table

  //api function
  const queryClient = useQueryClient();

  const fetchProducts = async ({ queryKey }) => {
    const [, { page, size }] = queryKey;
    const res = await ProductService.getAllProducts({ page, size });
    return res.data.result;
  };

  const deleteProducts = async (productId) => {
    const resProduct = await ProductService.deleteProduct(productId);
    return resProduct.data;
  };

  const getAllCategories = async () => {
    const res = await ProductService.getAllCategories();
    // map name -> id để dùng tiện trong Select
    const mapped = {};
    res.data?.result?.forEach((cate) => {
      mapped[cate.name] = cate.id;
    });
    return mapped;
  };

  // Xóa sản phẩm
  const deleteMutation = useMutation({
    mutationFn: deleteProducts,
    onSuccess: (res) => {
      queryClient.invalidateQueries(["products"]);
      setPopup({
        open: true,
        message: "Xóa sản phẩm thành công!",
        severity: "success",
        horizontal: "center",
        vertical: "top",
      });
    },
    onError: (err) => {
      setPopup({
        open: true,
        message: err.response?.data?.message || "Xóa thất bại!",
        severity: "error",
        horizontal: "center",
        vertical: "top",
      });
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
  const {
    data: productData,
    isLoading: isLoadingProducts,
    isError: isErrorProducts,
    error: errorProducts,
  } = useQuery({
    queryKey: ["products", { page, size }],
    queryFn: fetchProducts,
    keepPreviousData: true,
  });

  // state cho kết quả tìm kiếm
  const [searchResults, setSearchResults] = useState(null);

  const handleSelectProduct = (product) => {
    if (product) {
      // Map data từ search API (SearchVM) sang structure của ProductRow (ProductResponse)
      const mappedProduct = {
        ...product,
        listCategory: product.categories || [],
        variantsResponses: product.variants || [],
        mediaList: product.mediaList || (product.imageList ? product.imageList.map(img => ({ url: img })) : [])
      };

      // Đảm bảo mediaList luôn là mảng để tránh lỗi truy cập [0]
      if (!mappedProduct.mediaList) {
        mappedProduct.mediaList = [];
      }

      setSearchResults([mappedProduct]);
    } else {
      setSearchResults(null);
    }
  };

  const totalProduct = searchResults ? searchResults.length : (productData?.totalElements || 0);
  const totalPageProduct = searchResults ? 1 : (productData?.pageSize || 1);

  // filter state
  const inputSearchRef = useRef(null);
  const [isToggleFilter, setIsToggleFilter] = useState(false);
  const [listCategoryId, setListCategoryId] = useState([]);

  const handleListCategoryChange = (event) => {
    const {
      target: { value },
    } = event;
    setListCategoryId(typeof value === "string" ? value.split(",") : value);
  };

  const { data: cate = {} } = useQuery({
    queryKey: ["categoryForProducts"],
    queryFn: getAllCategories,
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
    vertical: "top",
    horizontal: "center",
    severity: "info",
    message: "",
  });
  const { vertical, horizontal, open } = popup;

  const location = useLocation();

  useEffect(() => {
    if (location.state?.popup) {
      const timer = setTimeout(() => {
        setPopup({ ...location.state.popup, open: true });
      }, 100);
      window.history.replaceState({}, document.title);
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  // Loading/Error logic mostly handled by UI states, but keeping basic notification if needed
  useEffect(() => {
    if (isErrorProducts) {
      setPopup({
        open: true,
        vertical: "top",
        horizontal: "center",
        severity: "error",
        message: errorProducts?.response?.data?.message || "Lỗi tải dữ liệu",
      });
    }
  }, [isErrorProducts, errorProducts]);

  return (
    <>
      <div className="py-[10px] px-[100px]">
        <Snackbar
          anchorOrigin={{ vertical, horizontal }}
          open={open}
          key={vertical + horizontal}
          autoHideDuration={3000}
          onClose={() => setPopup((prev) => ({ ...prev, open: false }))}
        >
          <Alert
            severity={popup.severity}
            variant="filled"
            sx={{ width: "100%" }}
          >
            {popup.message}
          </Alert>
        </Snackbar>

        <div className="flex justify-between items-center my-4">
          <h3 className="text-[30px] font-bold mb-4 text-[#403e57]">
            Quản lý sản phẩm
          </h3>
        </div>

        <div className="flex flex-wrap gap-[26px] w-full">
          <Boxes
            color={"#9dcbfcff"}
            header={"Tổng sản phẩm"}
            total={totalProduct}
            icon={<FiBox />}
          ></Boxes>
          {/* <Boxes color={"#f4f292ff"} header={"Đang giảm giá"} total={totalProduct} icon={<MdOutlineDiscount />} ></Boxes> */}
        </div>

        {/* search bar + filter */}
        <div className="shadow border-0 p-5 my-[20px] bg-white rounded-[10px]">
          <div
            className="relative flex"
            onClick={(e) => {
              if (
                inputSearchRef.current &&
                e.target !== inputSearchRef.current
              ) {
                inputSearchRef.current.blur();
              }
            }}
          >
            <SearchBar
              ref={inputSearchRef}
              onSelectProduct={handleSelectProduct}
              onChange={(e) => {
                /* Implement search logic later or debounce */
                if (!e.target.value) {
                  setSearchResults(null);
                }
              }}
              placeholder="Tìm kiếm sản phẩm..."
            />
            <Button
              size="medium"
              className={`${isToggleFilter
                ? "!border-2 !border-gray-500"
                : "!border !border-[#ccc]"
                } !text-[#403e57] !ml-4 !px-3 !rounded-[10px] !hover:bg-gray-100 !normal-case`}
              variant="outlined"
              onClick={() => setIsToggleFilter(!isToggleFilter)}
            >
              <VscFilter className="" />
              <span className="ml-1">Bộ lọc</span>
              <IoIosArrowUp
                className={`ml-1 transition-transform duration-200 ${isToggleFilter ? "rotate-180" : "rotate-0"
                  }`}
              />
            </Button>
            <Button
              variant="contained"
              className="!ml-auto !normal-case !bg-gradient-to-r !from-[#4a2fcf] !to-[#6440F5] !shadow"
              component={Link}
              to="/products/products-upload"
            >
              <FaPlus className="mr-1" />
              <span className="ml-1">Thêm sản phẩm mới</span>
            </Button>
          </div>
          {/* filter submenu */}
          <div
            aria-label="submenu"
            className={`${isToggleFilter === true
              ? "pointer-events-auto"
              : "h-[0px] opacity-0 pointer-events-none"
              } !text-[rgba(0,0,0,0.7)] overflow-hidden transition-all duration-300 flex flex-col gap-3`}
          >
            <div className="flex flex-col mt-[10px] gap-1">
              <h1 className="text-[18px] font-bold">Danh mục</h1>
              <div className="flex justify-center">
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
                    <MenuItem key={label} value={value}>
                      {label}
                    </MenuItem>
                  ))}
                </Select>
                <Button
                  variant="contained"
                  className="!w-[49%] !rounded-[14px] !ml-auto !normal-case !bg-gray-600 !shadow"
                  onClick={() => setListCategoryId([])}
                >
                  <span className="ml-1">Xóa danh mục</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Table View */}
        <TableContainer
          component={Paper}
          className="shadow border-0 rounded-[10px] mb-[20px]"
        >
          <Table aria-label="collapsible table">
            <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
              <TableRow>
                <TableCell />
                <TableCell sx={{ fontWeight: "bold" }}>Sản phẩm</TableCell>
                <TableCell align="center" sx={{ fontWeight: "bold" }}>
                  Biến thể
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: "bold" }}>
                  Đã bán
                </TableCell>
                {/* <TableCell align="center" sx={{ fontWeight: 'bold' }}>Đánh giá</TableCell> */}
                <TableCell align="center" sx={{ fontWeight: "bold" }}>
                  Thao tác
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(searchResults || productData?.data)?.map((product) => (
                <ProductRow
                  key={product.id}
                  product={product}
                  onDelete={handleDeleteClick}
                />
              ))}
              {(!(searchResults || productData?.data) || (searchResults || productData?.data).length === 0) && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                    {isLoadingProducts
                      ? "Đang tải..."
                      : "Không có sản phẩm nào"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <div className="shadow border-0 p-5 my-[20px] bg-white rounded-[10px]">
          <div className="flex justify-center">
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
      <Dialog open={openConfirm} onClose={handleCancelDelete}>
        <DialogTitle>Bạn có chắc chắn muốn xoá sản phẩm này không?</DialogTitle>
        <DialogActions>
          <Button onClick={handleCancelDelete} color="inherit">
            Không
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
          >
            Có
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
