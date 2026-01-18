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
  Tabs,
  Tab,
} from "@mui/material";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { MdDelete, MdEdit, MdCardMembership } from "react-icons/md";
import { FaRegUser, FaPlus } from "react-icons/fa6";
import LocalSearchBar from "../../components/common/LocalSearchBar"; // Reuse existing LocalSearchBar
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
  const navigate = useNavigate();

  // Tab state - 0: Campaigns, 1: Voucher, 2: Auto, 3: Flash Sale
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

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

  //api - Fetch Vouchers
  const fetchVouchers = async () => {
    const res = await PromotionService.getAllVouchers({
      page,
      size: pageSize,
    });
    console.log("Voucher response:", res.data.result);
    return res.data.result;
  };

  //api - Fetch Auto Promotions
  const fetchAutoPromotions = async () => {
    const res = await PromotionService.getAllAutoPromotions({
      page,
      size: pageSize,
    });
    console.log("Auto Promotion response:", res.data.result);
    return res.data.result;
  };

  //api - Fetch Flash Sales
  const fetchFlashSales = async () => {
    const res = await PromotionService.getAllFlashSales({
      page,
      size: pageSize,
    });
    console.log("Flash Sale response:", res.data.result);
    return res.data.result;
  };

  const deletePromotion = async (promotionId) => {
    const res = await PromotionService.deletePromotion(promotionId);
    console.log("Deleted:", res.data);
    return res.data;
  };

  //user query - Vouchers
  const {
    data: voucherPageData,
    isLoading: isLoadingVouchers,
    isError: isErrorVouchers,
    error: errorVouchers,
  } = useQuery({
    queryKey: ["vouchers", page],
    queryFn: fetchVouchers,
    keepPreviousData: true,
    refetchOnMount: "always",
    enabled: tabValue === 1, // Only fetch when Voucher tab is active
  });

  //user query - Auto Promotions
  const {
    data: autoPageData,
    isLoading: isLoadingAuto,
    isError: isErrorAuto,
    error: errorAuto,
  } = useQuery({
    queryKey: ["autoPromotions", page],
    queryFn: fetchAutoPromotions,
    keepPreviousData: true,
    refetchOnMount: "always",
    enabled: tabValue === 2, // Only fetch when Auto tab is active
  });

  //user query - Flash Sales
  const {
    data: flashSalePageData,
    isLoading: isLoadingFlashSales,
    isError: isErrorFlashSales,
    error: errorFlashSales,
  } = useQuery({
    queryKey: ["flashSales", page],
    queryFn: fetchFlashSales,
    keepPreviousData: true,
    refetchOnMount: "always",
    enabled: tabValue === 3, // Only fetch when Flash Sale tab is active
  });

  // Extract data based on active tab
  const vouchers = voucherPageData?.data || [];
  const autoPromotions = autoPageData?.data || [];
  const flashSales = flashSalePageData?.data || [];

  // Use appropriate data based on tab
  const promotions = tabValue === 1 ? vouchers : tabValue === 2 ? autoPromotions : flashSales;
  const isLoadingPromos = tabValue === 1 ? isLoadingVouchers : tabValue === 2 ? isLoadingAuto : isLoadingFlashSales;
  const isErrorPromos = tabValue === 1 ? isErrorVouchers : tabValue === 2 ? isErrorAuto : isErrorFlashSales;
  const errorPromos = tabValue === 1 ? errorVouchers : tabValue === 2 ? errorAuto : errorFlashSales;

  const totalPage = tabValue === 1 ? (voucherPageData?.totalPage || 1) : tabValue === 2 ? (autoPageData?.totalPage || 1) : (flashSalePageData?.totalPage || 1);

  const deleteMutation = useMutation({
    mutationFn: deletePromotion,
    onSuccess: (res) => {
      // Invalidate all promotion types
      queryClient.invalidateQueries(["vouchers"]);
      queryClient.invalidateQueries(["autoPromotions"]);
      queryClient.invalidateQueries(["flashSales"]);
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
    message: ""
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
          label="Không hoạt động"
          color="error"
          size="small"
          sx={{ height: 20, fontSize: "0.68rem", "& .MuiChip-label": { px: 0.75 } }}
        />
      );
    }
    if (now < start) {
      return (
        <Chip
          label="Sắp diễn ra"
          color="info"
          size="small"
          sx={{ height: 20, fontSize: "0.68rem", "& .MuiChip-label": { px: 0.75 } }}
        />
      );
    }
    if (now > end) {
      return (
        <Chip
          label="Đã hết hạn"
          color="error"
          size="small"
          sx={{ height: 20, fontSize: "0.68rem", "& .MuiChip-label": { px: 0.75 } }}
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
          sx={{ height: 20, fontSize: "0.68rem", "& .MuiChip-label": { px: 0.75 } }}
        />
      );
    }
    return (
      <Chip
        label="Đang hoạt động"
        color="success"
        size="small"
        sx={{ height: 20, fontSize: "0.68rem", "& .MuiChip-label": { px: 0.75 } }}
      />
    );
  };

  // ========== CAMPAIGN (Tab 0) Logic ==========
  const [campaignSearch, setCampaignSearch] = useState("");
  const [deleteStartCampaign, setDeleteStartCampaign] = useState(null); // ID campaign to delete


  const { data: campaignData, isLoading: isLoadingCampaigns } = useQuery({
    queryKey: ["campaigns"],
    queryFn: async () => {
      const res = await PromotionService.getAllCampaigns();
      return res.data; // The service says ApiResponse<List>, so usually res.data.result or res.data depending on axios interceptor. 
      // Checking fetchPromotions above: res.data.result. 
      // Let's assume res.data.result based on typical pattern here. 
      // Wait, let's look at fetchPromotions again. 
      // fetchPromotions returns res.data.result.
      // So here I should probably return res.data.result.
      // But let's check the Code item view of fetchPromotions in previous turns.
      // "const res = await PromotionService.getAllPromotions... return res.data.result;"
      // So yes.
    },
  });

  const campaigns = campaignData?.result || []; // Safety check if result is nested

  const deleteCampaignMutation = useMutation({
    mutationFn: (id) => PromotionService.deleteCampaignById(id),
    onSuccess: async (data, variables) => {
      // variables is the id passed to mutate
      const campaignIdToDelete = variables;
      console.log("Campaign deleted successfully. Starting media cleanup for Campaign ID:", campaignIdToDelete);

      // Delete associated media after campaign deletion
      try {
        // Fetch all banners from API
        const bannersResponse = await PromotionService.getAllBanners();
        const banners = bannersResponse.data?.result || [];

        // Find banner with matching ownerId
        const campaignBanner = banners.find(banner => String(banner.ownerId) === String(campaignIdToDelete));

        if (campaignBanner && campaignBanner.bannerUrl) {
          console.log("🚀 Found banner URL from banner list, deleting:", campaignBanner.bannerUrl);
          await PromotionService.deleteMediaByUrl(campaignBanner.bannerUrl);
          console.log("✅ Media (banner) deleted successfully from Cloud.");
        } else {
          console.log("ℹ️ No associated banner found in banner list for this campaign.");
        }
      } catch (err) {
        console.error("Failed to delete campaign media:", err);
      }

      queryClient.invalidateQueries(["campaigns"]);
      setPopup({
        open: true,
        severity: "success",
        message: "Xóa chiến dịch thành công!",
        vertical: "top",
        horizontal: "center",
      });
      setDeleteStartCampaign(null);
    },
    onError: (err) => {
      setPopup({
        open: true,
        severity: "error",
        message: err.response?.data?.message || "Xóa chiến dịch thất bại!",
        vertical: "top",
        horizontal: "center",
      });
      setDeleteStartCampaign(null);
    }
  });


  const handleEditCampaign = (id, campaign) => {
    navigate(`/promotion/campaign-edit/${id}`, { state: { campaign } });
  }

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
            Quản lý Khuyến mãi
          </h3>
        </div>

        <div className="flex flex-wrap gap-[26px] w-full">
          <Boxes color={"#81faf8ff"} header={"Tổng số chiến dịch"} icon={<FaRegUser />} />
          <Boxes color={"#81faf8ff"} header={"Tổng số khuyến mãi voucher"} icon={<FaRegUser />} />
          <Boxes color={"#e8806bff"} header={"Tổng số khuyến mãi giảm giá"} icon={<MdCardMembership />} />
          <Boxes color={"#e8806bff"} header={"Tổng số khuyến mãi flash sale"} icon={<MdCardMembership />} />
        </div>

        {/* --- TABS --- */}
        <div className="shadow border-0 p-5 my-[20px] bg-white rounded-[10px]">
          {/* === Warning Alert === */}
          {campaigns.length === 0 && (
            <div className="w-full mb-3">
              <Alert severity="warning">
                Bạn cần phải tạo ít nhất 1 chiến dịch trước khi tạo khuyến mãi!
              </Alert>
            </div>
          )}

          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="promotion tabs"
            sx={{
              mb: 3,
              "& .MuiTabs-indicator": { backgroundColor: "#4a2fcf" },
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
                  <Button
                    variant="contained"
                    className="!ml-auto !normal-case !bg-gradient-to-r !from-[#4a2fcf] !to-[#6440F5] !shadow"
                    component={Link}
                    to="/promotion/campaign-upload"
                  >
                    <FaPlus className="mr-1" />
                    <span className="ml-1">Thêm chiến dịch mới</span>
                  </Button>
                </div>
              </div>

              {/* Campaign Table */}
              <TableContainer
                component={Paper}
                sx={{
                  borderTop: "1px solid #e0e0e0",
                  borderRight: "1px solid #e0e0e0",
                  borderLeft: "1px solid #e0e0e0",
                }}
              >
                <Table>
                  <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
                    <TableRow>
                      <TableCell sx={{ width: "30%", fontWeight: 600 }}>Tên chiến dịch</TableCell>
                      <TableCell sx={{ width: "30%", fontWeight: 600 }}>Mô tả</TableCell>
                      <TableCell sx={{ width: "20%" }} align="center">Thao tác</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {campaigns.filter(c => !campaignSearch || c.name.toLowerCase().includes(campaignSearch.toLowerCase())).map((camp) => (
                      <TableRow key={camp.id} hover>
                        <TableCell sx={{ fontWeight: 500 }}>{camp.name}</TableCell>
                        <TableCell sx={{ fontWeight: 500 }}>{camp.description}</TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: "flex", gap: 0.5, justifyContent: "center" }}>
                            <IconButton size="small" color="primary" onClick={() => handleEditCampaign(camp.id, camp)}>
                              <MdEdit />
                            </IconButton>
                            <IconButton size="small" color="error" onClick={() => setDeleteStartCampaign(camp.id)}>
                              <MdDelete />
                            </IconButton>
                          </Box>
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
        <DialogTitle>Bạn có chắc chắn muốn xoá khuyến mãi này không?</DialogTitle>
        <DialogActions>
          <Button onClick={handleCancelDelete} color="inherit">
            Không
          </Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            Có
          </Button>
        </DialogActions>
      </Dialog>

      {/* Campaign Delete Dialog */}
      <Dialog open={!!deleteStartCampaign} onClose={() => setDeleteStartCampaign(null)}>
        <DialogTitle>Bạn có chắc chắn muốn xoá chiến dịch này không?</DialogTitle>
        <DialogActions>
          <Button onClick={() => setDeleteStartCampaign(null)} color="inherit">
            Không
          </Button>
          <Button
            onClick={() => deleteCampaignMutation.mutate(deleteStartCampaign)}
            color="error"
            variant="contained"
            disabled={deleteCampaignMutation.isPending}
          >
            {deleteCampaignMutation.isPending ? "Đang xoá..." : "Có"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
