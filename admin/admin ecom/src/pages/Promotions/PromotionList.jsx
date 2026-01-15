import { useRef, useState, useEffect } from "react";
import Pagination from "../../components/common/Pagination";
import Boxes from "../../components/common/Boxes";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Paper,
  Dialog,
  DialogActions,
  DialogTitle,
  Button,
  Chip,
  Tooltip,
  Box,
  Typography,
} from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import { MdDelete, MdEdit, MdCardMembership } from "react-icons/md";
import { FaRegUser, FaPlus } from "react-icons/fa6";
// import SearchBar from "../../components/common/SearchBar";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

import { VscFilter } from "react-icons/vsc";
import { IoIosArrowUp } from "react-icons/io";

import {
  TextField,
  FormControlLabel,
  Checkbox,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";

import { IoCloseCircleOutline, IoChevronForwardOutline } from "react-icons/io5";
import PromotionService from "../../services/PromotionService";

export default function PromotionList() {
  const inputSearchRef = useRef(null);
  const queryClient = useQueryClient();

  //filter
  const [isToggleFilter, setIsToggleFilter] = useState(false);
  function isOpenFilter() {
    setIsToggleFilter(!isToggleFilter);
  }
  const [status, setStatus] = useState("all");
  const [type, setType] = useState("all");
  const [onlyActive, setOnlyActive] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const hasFilter =
    status !== "all" || type !== "all" || onlyActive || startDate || endDate;

  const handleClear = () => {
    setStatus("all");
    setType("all");
    setOnlyActive(false);
    setStartDate("");
    setEndDate("");
  };

  // Pagination state
  const [page, setPage] = useState(1);
  const pageSize = 10;

  //api
  const fetchPromotions = async () => {
    // Note: The current API service exposes getAllPromotions which takes { page, size }
    // We will pass page and size
    const res = await PromotionService.getAllPromotions({
      page,
      size: pageSize,
    });
    console.log("Promo response:", res.data.result);
    return res.data.result; // Expecting PageResponse
  };

  const deletePromotion = async (promotionId) => {
    const res = await PromotionService.deletePromotion(promotionId);
    console.log("Deleted:", res.data);
    return res.data;
  };

  //user querry
  const {
    data: pageData,
    isLoading: isLoadingPromos,
    isError: isErrorPromos,
    error: errorPromos,
  } = useQuery({
    queryKey: ["promotions", page], // Add page to query key
    queryFn: fetchPromotions,
    keepPreviousData: true,
    refetchOnMount: "always",
  });

  // Khi có dữ liệu:
  const promotions = pageData?.data || [];
  const totalPromotions = pageData?.totalElements || 0;
  const totalPage = pageData?.totalPage || 1;

  const deleteMutation = useMutation({
    mutationFn: deletePromotion,
    onSuccess: (res) => {
      queryClient.invalidateQueries(["promotions"]);
      setPopup((prep) => ({
        ...prep,
        open: true,
        message: "Xóa khuyến mãi thành công!",
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
        message: "Xóa khuyến mãi thất bại!",
        severity: "error",
      }));
    },
  });

  //modal xóa
  const [openConfirm, setOpenConfirm] = useState(false);
  const [selectedPromotionId, setSelectedPromotionId] = useState(null);
  const handleDeleteClick = (promotionId) => {
    setSelectedPromotionId(promotionId);
    setOpenConfirm(true);
  };
  const handleConfirmDelete = () => {
    if (selectedPromotionId) {
      deleteMutation.mutate(selectedPromotionId);
    }
    setOpenConfirm(false);
    setSelectedPromotionId(null);
  };
  const handleCancelDelete = () => {
    setOpenConfirm(false);
    setSelectedPromotionId(null);
  };

  //popup thông báo
  const [popup, setPopup] = useState({
    open: false,
    vertical: "top",
    horizontal: "center",
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
    if (isLoadingPromos) {
      setPopup({
        open: true,
        vertical: "top",
        horizontal: "center",
        severity: "info",
        message: "Đang tải danh sách khuyến mãi...",
      });
    } else if (isErrorPromos) {
      // Lấy chi tiết lỗi từ server (nếu có)
      const serverError = isErrorPromos?.response?.data?.message;
      const serverDetail = isErrorPromos?.response?.data?.error; // nếu backend trả thêm field này
      const fallbackMessage = isErrorPromos?.message || "Không xác định";

      // Log đầy đủ ra console để debug
      console.error("Chi tiết lỗi từ server:", isErrorPromos);

      setPopup({
        open: true,
        vertical: "top",
        horizontal: "center",
        severity: "error",
        message: `Lỗi khi tải danh sách khuyến mãi: ${serverError || serverDetail || fallbackMessage
          }`,
      });
    } else {
      // Khi load xong thì tắt snackbar loading
      setPopup((prev) => ({ ...prev, open: false }));
    }
  }, [isLoadingPromos, isErrorPromos, errorPromos]);

  const formatVND = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Hàm tính trạng thái và màu
  const getStatusChip = (promotion) => {
    const now = new Date();
    const start = new Date(promotion.startDate);
    const end = new Date(promotion.endDate);

    if (!promotion.active) {
      return (
        <Chip
          label="Đã tắt"
          color="default"
          size="small"
          sx={{
            height: 20,
            fontSize: "0.68rem",
            "& .MuiChip-label": { px: 0.75 },
          }}
        />
      );
    }
    if (now < start) {
      return (
        <Chip
          label="Sắp diễn ra"
          color="info"
          size="small"
          sx={{
            height: 20,
            fontSize: "0.68rem",
            "& .MuiChip-label": { px: 0.75 },
          }}
        />
      );
    }
    if (now > end) {
      return (
        <Chip
          label="Đã hết hạn"
          color="error"
          size="small"
          sx={{
            height: 20,
            fontSize: "0.68rem",
            "& .MuiChip-label": { px: 0.75 },
          }}
        />
      );
    }
    if (
      promotion.usageType === "LIMITED" &&
      promotion.usageCount >= promotion.usageLimited
    ) {
      return (
        <Chip
          label="Hết lượt"
          color="warning"
          size="small"
          sx={{
            height: 20,
            fontSize: "0.68rem",
            "& .MuiChip-label": { px: 0.75 },
          }}
        />
      );
    }
    return (
      <Chip
        label="Đang hoạt động"
        color="success"
        size="small"
        sx={{
          height: 20,
          fontSize: "0.68rem",
          "& .MuiChip-label": { px: 0.75 },
        }}
      />
    );
  };

  return (
    <>
      <div className="py-[10px] px-[100px]">
        <Snackbar
          anchorOrigin={{ vertical, horizontal }}
          open={open}
          key={vertical + horizontal}
          autoHideDuration={isLoadingPromos ? null : 3000}
          onClose={() => setPopup((prev) => ({ ...prev, open: false }))}
        >
          <Alert
            severity={popup.severity ?? "info"} // dùng ?? để tránh lỗi undefined
            variant="filled"
            sx={{ width: "100%" }}
          >
            {popup.message || ""}
          </Alert>
        </Snackbar>

        <div className="flex justify-between items-center my-4">
          <h3 className="text-[30px] font-bold mb-4 text-[#403e57]">
            Quản lý Các Chương Trình Khuyến mãi
          </h3>
        </div>

        <div className="flex flex-wrap gap-[26px] w-full">
          <Boxes
            color={"#81faf8ff"}
            header={"Tổng khách hàng"}
            icon={<FaRegUser />}
          ></Boxes>
          <Boxes
            color={"#e8806bff"}
            header={"Tổng thành viên"}
            icon={<MdCardMembership />}
          ></Boxes>
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
                inputSearchRef.current.blur(); // click ngoài -> blur input
              }
            }}
          >
            {/* <SearchBar
              ref={inputSearchRef}
              // onChange={(e) => setSearchTerm(e.target.value)}
            /> */}
            <Button
              size="medium"
              className={`${isToggleFilter
                ? "!border-2 !border-gray-500"
                : "!border !border-[#ccc]"
                } !text-[#403e57] !ml-4 !px-3 !rounded-[10px] !hover:bg-gray-100 !normal-case`}
              variant="outlined"
              onClick={isOpenFilter}
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
              to="/promotion/promotion-upload"
            >
              <FaPlus className="mr-1" />
              <span className="ml-1">Thêm chương trình giảm giá mới</span>
            </Button>
          </div>
          {/* filter */}
          <div
            aria-label="submenu"
            className={`${isToggleFilter === true
              ? "pointer-events-auto"
              : "h-[0px] opacity-0 pointer-events-none"
              } !text-[rgba(0,0,0,0.7)] overflow-hidden transition-all duration-300 flex flex-col items-center gap-5`}
          >
            {/* Trạng thái */}
            <div className="flex mt-[20px] w-full">
              <Box
                sx={{
                  fontSize: "15px",
                  "& *": { fontSize: "inherit" },
                  "& .MuiInputLabel-root": { fontSize: "15px" },
                  "& .MuiOutlinedInput-input": { fontSize: "15px", py: 0.75 },
                  "& .MuiFormControlLabel-label": { fontSize: "15px" },
                  display: "flex",
                  gap: 2,
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "100%",
                }}
              >
                {/* Trạng thái */}
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel>Trạng thái</InputLabel>
                  <Select
                    value={status}
                    label="Trạng thái"
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <MenuItem value="all">Tất cả trạng thái</MenuItem>
                    <MenuItem value="active">Đang hoạt động</MenuItem>
                    <MenuItem value="upcoming">Sắp diễn ra</MenuItem>
                    <MenuItem value="expired">Đã hết hạn</MenuItem>
                    <MenuItem value="inactive">Đã tắt</MenuItem>
                  </Select>
                </FormControl>

                {/* Loại khuyến mãi */}
                <FormControl size="small" sx={{ minWidth: 130 }}>
                  <InputLabel>Loại</InputLabel>
                  <Select
                    value={type}
                    label="Loại"
                    onChange={(e) => setType(e.target.value)}
                  >
                    <MenuItem value="all">Tất cả loại</MenuItem>
                    <MenuItem value="percent">Giảm theo %</MenuItem>
                    <MenuItem value="fixed">Giảm cố định</MenuItem>
                    <MenuItem value="freeship">Freeship</MenuItem>
                  </Select>
                </FormControl>

                {/* Date range */}
                <div className="flex items-center gap-3">
                  <TextField
                    label="Từ ngày"
                    type="date"
                    size="small"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    sx={{ width: 145 }}
                  />

                  <IoChevronForwardOutline size={20} color="#666" />

                  <TextField
                    label="Đến ngày"
                    type="date"
                    size="small"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    sx={{ width: 145 }}
                  />
                </div>

                {/* Checkbox */}
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={onlyActive}
                      onChange={(e) => setOnlyActive(e.target.checked)}
                      size="small"
                    />
                  }
                  label="Chỉ hiển thị đang hoạt động"
                />
              </Box>
            </div>

            {/* Nút Xóa bộ lọc */}
            {hasFilter && (
              <Button
                variant="outlined"
                color="error"
                size="small"
                startIcon={<IoCloseCircleOutline size={18} />}
                onClick={handleClear}
                className="w-fit"
              >
                Xóa bộ lọc
              </Button>
            )}
          </div>
        </div>

        <div className="shadow border-0 p-5 my-[20px] mx-[0px] bg-white rounded-[10px]">
          {/* table */}
          <div className="mt-3">
            <TableContainer
              component={Paper}
              sx={{
                borderTop: "1px solid #e0e0e0",
                borderRight: "1px solid #e0e0e0",
                borderLeft: "1px solid #e0e0e0",
                borderRadius: 2,
                overflow: "hidden",
                boxShadow: 1,
              }}
            >
              <Table
                stickyHeader
                sx={{
                  "& .MuiTableCell-root": {
                    fontSize: "12px",
                  },
                }}
              >
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#f8f9fa" }}>
                    <TableCell sx={{ fontWeight: 600 }}>
                      Tên khuyến mãi
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>
                      Đối tượng áp dụng
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="center">
                      Loại khuyến mãi
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Mã giảm giá</TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="center">
                      Giá trị giảm
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="center">
                      Hiệu lực
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="center">
                      Sử dụng
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="center">
                      Trạng thái
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="center">
                      Thao tác
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {promotions?.map((promo) => {
                    const isPercent = promo.discountType === "DISCOUNT_PERCENT";
                    const discountText = isPercent
                      ? `${promo.discountPercent}%`
                      : formatVND(promo.fixedAmount);

                    return (
                      <TableRow
                        key={promo.id}
                        hover
                        sx={{ "&:last-child td": { border: 0 } }}
                      >
                        {/* Tên khuyến mãi */}
                        <TableCell>
                          <Box>
                            <Typography
                              variant="subtitle2"
                              fontWeight={400}
                              fontSize={12}
                              sx={{
                                fontStyle: "normal",
                                maxWidth: 100,
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {promo.name}
                            </Typography>
                          </Box>
                        </TableCell>

                        {/* Loại khuyến mãi */}
                        <TableCell align="center">
                          {promo.categoryName?.length > 0 ? (
                            <Chip
                              label={"Danh mục"}
                              size="small"
                              variant="outlined"
                              sx={{
                                height: 20,
                                fontSize: "0.68rem",
                                "& .MuiChip-label": { px: 0.75 },
                                color: "#14B8A6",
                                borderColor: "#14B8A6",
                              }}
                            />
                          ) : promo.productId?.length > 0 ? (
                            <Chip
                              label={"Sản phẩm"}
                              size="small"
                              variant="outlined"
                              sx={{
                                height: 20,
                                fontSize: "0.68rem",
                                "& .MuiChip-label": { px: 0.75 },
                                color: "#3B82F6",
                                borderColor: "#3B82F6",
                              }}
                            />
                          ) : (
                            <Chip
                              label={"Người dùng"}
                              size="small"
                              variant="outlined"
                              sx={{
                                height: 20,
                                fontSize: "0.68rem",
                                "& .MuiChip-label": { px: 0.75 },
                                color: "#6366F1",
                                borderColor: "#6366F1",
                              }}
                            />
                          )}
                        </TableCell>

                        {/* Loại khuyến mãi */}
                        <TableCell align="center">
                          {isPercent ? "Giảm theo %" : "Giảm cố định"}
                        </TableCell>

                        {/* Mã giảm giá */}
                        <TableCell>
                          {promo.voucherCode ? (
                            <Chip
                              label={promo.voucherCode}
                              size="small"
                              color="primary"
                              variant="outlined"
                              sx={{
                                height: 20,
                                fontSize: "0.68rem",
                                "& .MuiChip-label": { px: 0.75 },
                              }}
                            />
                          ) : (
                            <Chip
                              label="Tự động"
                              size="small"
                              color="default"
                              sx={{
                                height: 20,
                                fontSize: "0.68rem",
                                "& .MuiChip-label": { px: 0.75 },
                              }}
                            />
                          )}
                        </TableCell>

                        {/* Giá trị giảm */}
                        <TableCell
                          align="center"
                          sx={{ fontWeight: 600, color: "#d32f2f" }}
                        >
                          {discountText}
                        </TableCell>

                        {/* Thời gian hiệu lực */}
                        <TableCell align="center">
                          <Box>
                            <div>
                              {new Date(promo.startDate).toLocaleDateString(
                                "vi-VN"
                              )}
                            </div>
                            <div>→</div>
                            <div>
                              {new Date(promo.endDate).toLocaleDateString(
                                "vi-VN"
                              )}
                            </div>
                          </Box>
                        </TableCell>

                        {/* Sử dụng */}
                        <TableCell align="center">
                          {promo.usageType === "UNLIMITED" ? (
                            <Chip
                              label="Không giới hạn"
                              size="small"
                              color="info"
                              sx={{
                                height: 20,
                                fontSize: "0.68rem",
                                "& .MuiChip-label": { px: 0.75 },
                              }}
                            />
                          ) : (
                            <Box>
                              <Typography
                                variant="body2"
                                fontWeight={600}
                                sx={{ fontSize: "0.75rem" }}
                              >
                                {promo.usageCount.toLocaleString()} /{" "}
                                {promo.usageLimited.toLocaleString()}
                              </Typography>
                              {promo.usageCount >= promo.usageLimited && (
                                <Typography
                                  color="error"
                                  sx={{
                                    fontSize: "0.6875rem",
                                    fontWeight: 500,
                                  }}
                                >
                                  Hết lượt
                                </Typography>
                              )}
                            </Box>
                          )}
                        </TableCell>

                        {/* Trạng thái */}
                        <TableCell align="center">
                          {getStatusChip(promo)}
                        </TableCell>

                        {/* Thao tác */}
                        <TableCell align="center">
                          <Tooltip title="Chỉnh sửa">
                            <IconButton
                              size="small"
                              component={Link}
                              to={`/promotion/promotion-edit/${promo.id}`}
                              color="primary"
                            >
                              <MdEdit />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Xóa">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeleteClick(promo.id)}
                            >
                              <MdDelete />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>

            <div className="flex justify-center pb-[20px] pt-[30px]">
              <Pagination
                currentPage={page}
                totalPage={totalPage}
                totalElements={totalPromotions}
                pageSize={pageSize}
                onPageChange={(newPage) => setPage(newPage)}
              />
            </div>
          </div>
        </div>
      </div>
      <Dialog open={openConfirm} onClose={handleCancelDelete}>
        <DialogTitle>
          Bạn có chắc chắn muốn xoá khuyến mãi này không?
        </DialogTitle>
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
