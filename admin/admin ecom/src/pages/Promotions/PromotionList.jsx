import { useRef, useState, useEffect } from "react";
import Pagination from "../../components/common/Pagination"; // Corrected import path
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
import LocalSearchBar from "../../components/common/LocalSearchBar";
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
    setPage(1); // Reset page on tab change
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
    return res.data;
  };

  //api - Fetch Auto Promotions
  const fetchAutoPromotions = async () => {
    const res = await PromotionService.getAllAutoPromotions({
      page,
      size: pageSize,
    });
    return res.data;
  };

  //api - Fetch Flash Sales
  const fetchFlashSales = async () => {
    const res = await PromotionService.getAllFlashSales({
      page,
      size: pageSize,
    });
    return res.data;
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
    enabled: tabValue === 1,
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
    enabled: tabValue === 2,
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
    enabled: tabValue === 3,
  });

  // Extract data based on active tab
  // Check if result is an array or a pagination object with content/data
  const getListFromData = (data) => {
    if (!data?.result) return [];
    if (Array.isArray(data.result)) return data.result;
    return data.result.content || data.result.data || [];
  };

  const vouchers = getListFromData(voucherPageData);
  const autoPromotions = getListFromData(autoPageData);
  const flashSales = getListFromData(flashSalePageData);

  // Use appropriate data based on tab
  const promotions = tabValue === 1 ? vouchers : tabValue === 2 ? autoPromotions : flashSales;
  const isLoadingPromos = tabValue === 1 ? isLoadingVouchers : tabValue === 2 ? isLoadingAuto : isLoadingFlashSales;
  const isErrorPromos = tabValue === 1 ? isErrorVouchers : tabValue === 2 ? isErrorAuto : isErrorFlashSales;
  const errorPromos = tabValue === 1 ? errorVouchers : tabValue === 2 ? errorAuto : errorFlashSales;

  // Calculate totals for pagination
  const getTotalPage = (data) => data?.result?.totalPages || data?.totalPage || 1;
  const getTotalElements = (data) => data?.result?.totalElements || data?.totalElements || 0;

  const totalPage = tabValue === 1 ? getTotalPage(voucherPageData) : tabValue === 2 ? getTotalPage(autoPageData) : getTotalPage(flashSalePageData);
  const totalPromotions = tabValue === 1 ? getTotalElements(voucherPageData) : tabValue === 2 ? getTotalElements(autoPageData) : getTotalElements(flashSalePageData);

  const deleteMutation = useMutation({
    mutationFn: deletePromotion,
    onSuccess: (res) => {
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
      setPopup((prev) => ({
        ...prev,
        open: true,
        message: err.response?.data?.message || "Xóa khuyến mãi thất bại!",
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
      const timer = setTimeout(() => {
        setPopup({ ...location.state.popup, open: true });
      }, 100);
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
      setPopup({
        open: true,
        vertical: "top",
        horizontal: "center",
        severity: "error",
        message: "Lỗi khi tải danh sách khuyến mãi",
      });
    } else {
      setPopup((prev) => ({ ...prev, open: false }));
    }
  }, [isLoadingPromos, isErrorPromos, errorPromos]);

  const formatVND = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const getStatusChip = (promotion) => {
    const now = new Date();
    const start = new Date(promotion.startDate);
    const end = new Date(promotion.endDate);

    if (!promotion.active) {
      return <Chip label="Không hoạt động" color="error" size="small" variant="outlined" />;
    }
    if (now < start) {
      return <Chip label="Sắp diễn ra" color="info" size="small" variant="outlined" />;
    }
    if (now > end) {
      return <Chip label="Đã hết hạn" color="error" size="small" variant="outlined" />;
    }
    return <Chip label="Đang hoạt động" color="success" size="small" variant="outlined" />;
  };

  // ========== CAMPAIGN (Tab 0) Logic ==========
  const [campaignSearch, setCampaignSearch] = useState("");
  const [deleteStartCampaign, setDeleteStartCampaign] = useState(null);

  const { data: campaignData, isLoading: isLoadingCampaigns } = useQuery({
    queryKey: ["campaigns"],
    queryFn: async () => {
      const res = await PromotionService.getAllCampaigns();
      return res.data;
    },
  });

  const campaigns = campaignData?.result || [];

  const deleteCampaignMutation = useMutation({
    mutationFn: (id) => PromotionService.deleteCampaignById(id),
    onSuccess: async (data, variables) => {
      const campaignIdToDelete = variables;
      try {
        const campaignToDelete = campaigns.find(c => String(c.id) === String(campaignIdToDelete));
        if (campaignToDelete && campaignToDelete.image) {
          console.log("🚀 Found banner URL, deleting:", campaignToDelete.image);
          await PromotionService.deleteMediaByUrl(campaignToDelete.image);
          console.log("✅ Media (banner) deleted successfully from Cloud.");
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
          autoHideDuration={4000}
          onClose={() => setPopup((prev) => ({ ...prev, open: false }))}
        >
          <Alert severity={popup.severity ?? "info"} variant="filled" sx={{ width: "100%" }}>
            {popup.message || ""}
          </Alert>
        </Snackbar>

        <div className="flex justify-between items-center my-4">
          <h3 className="text-[30px] font-bold mb-4 text-[#403e57]">Quản lý Khuyến mãi</h3>
        </div>

        <div className="flex flex-wrap gap-[26px] w-full">
          <Boxes color={"#81faf8ff"} header={"Tổng số chiến dịch"} icon={<FaRegUser />} />
          <Boxes color={"#81faf8ff"} header={"Tổng số khuyến mãi voucher"} icon={<FaRegUser />} />
          <Boxes color={"#e8806bff"} header={"Tổng số khuyến mãi giảm giá"} icon={<MdCardMembership />} />
          <Boxes color={"#e8806bff"} header={"Tổng số khuyến mãi flash sale"} icon={<MdCardMembership />} />
        </div>

        <div className="shadow border-0 p-5 my-[20px] bg-white rounded-[10px]">
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
            sx={{ mb: 3, "& .MuiTabs-indicator": { backgroundColor: "#4a2fcf" } }}
          >
            <Tab label="Danh sách Chiến dịch" />
            <Tab label="Voucher" />
            <Tab label="Khuyến mãi tự động" />
            <Tab label="Flash Sale" />
          </Tabs>

          {/* === TAB 0: CAMPAIGNS === */}
          {tabValue === 0 && (
            <>
              <div className="py-5 relative flex">
                <div className="flex gap-2 w-full">
                  <LocalSearchBar
                    onChange={(e) => setCampaignSearch(e.target.value)}
                    value={campaignSearch}
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

              <TableContainer component={Paper} sx={{ border: "1px solid #e0e0e0" }}>
                <Table>
                  <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
                    <TableRow>
                      <TableCell sx={{ width: "30%", fontWeight: 600 }}>Tên chiến dịch</TableCell>
                      <TableCell sx={{ width: "30%", fontWeight: 600 }}>Mô tả</TableCell>
                      <TableCell sx={{ width: "20%" }} align="center">Thao tác</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {campaigns
                      .filter(c => !campaignSearch || c.name.toLowerCase().includes(campaignSearch.toLowerCase()))
                      .map((camp) => (
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
                      ))}
                    {campaigns.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={3} align="center">Không có dữ liệu</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}

          {/* === TABS 1, 2, 3: PROMOTIONS === */}
          {tabValue !== 0 && (
            <>
              <div className="relative flex mb-5">
                <Button
                  size="medium"
                  className={`${isToggleFilter ? "!border-2 !border-gray-500" : "!border !border-[#ccc]"} !text-[#403e57] !mr-4 !px-3 !rounded-[10px] !hover:bg-gray-100 !normal-case`}
                  variant="outlined"
                  onClick={isOpenFilter}
                >
                  <VscFilter className="" />
                  <span className="ml-1">Bộ lọc</span>
                  <IoIosArrowUp className={`ml-1 transition-transform duration-200 ${isToggleFilter ? "rotate-180" : "rotate-0"}`} />
                </Button>

                <Button
                  variant="contained"
                  className="!ml-auto !normal-case !bg-gradient-to-r !from-[#4a2fcf] !to-[#6440F5] !shadow"
                  onClick={() => {
                    if (campaigns.length === 0) {
                      setPopup({
                        open: true,
                        vertical: "top",
                        horizontal: "center",
                        severity: "error",
                        message: "Bạn chưa tạo campaign! Vui lòng tạo campaign trước.",
                      });
                      return;
                    }
                    navigate("/promotion/promotion-upload");
                  }}
                >
                  <FaPlus className="mr-1" />
                  <span className="ml-1">Thêm khuyến mãi mới</span>
                </Button>
              </div>

              {/* Filter Area */}
              <div className={`${isToggleFilter ? "pointer-events-auto h-auto mb-5" : "h-[0px] opacity-0 pointer-events-none"} overflow-hidden transition-all duration-300`}>
                <div className="flex gap-4 items-center">
                  <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel>Trạng thái</InputLabel>
                    <Select value={status} label="Trạng thái" onChange={(e) => setStatus(e.target.value)}>
                      <MenuItem value="all">Tất cả</MenuItem>
                      <MenuItem value="active">Đang hoạt động</MenuItem>
                    </Select>
                  </FormControl>
                  {/* Add more filters if needed */}
                  {hasFilter && (
                    <Button variant="outlined" color="error" size="small" onClick={handleClear}>
                      Xóa bộ lọc
                    </Button>
                  )}
                </div>
              </div>

              {/* Promotion Table */}
              <TableContainer component={Paper} sx={{ border: "1px solid #e0e0e0" }}>
                <Table>
                  <TableHead sx={{ backgroundColor: "#f8f9fa" }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Tên khuyến mãi</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Loại</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Mã</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Giảm giá</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Thời gian</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Trạng thái</TableCell>
                      <TableCell sx={{ fontWeight: 600 }} align="center">Thao tác</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {promotions.map((promo) => (
                      <TableRow key={promo.id} hover>
                        <TableCell>{promo.name}</TableCell>
                        <TableCell>
                          {promo.applyTo === "Category" && <Chip label="Danh mục" size="small" />}
                          {promo.applyTo === "Product" && <Chip label="Sản phẩm" size="small" />}
                          {promo.applyTo === "All" && <Chip label="Tất cả" size="small" />}
                        </TableCell>
                        <TableCell>
                          {promo.voucherCode ? <Chip label={promo.voucherCode} size="small" color="primary" /> : <Chip label="---" size="small" />}
                        </TableCell>
                        <TableCell>
                          {promo.discountType === "DISCOUNT_PERCENT" ? `${promo.discountPercent}%` : formatVND(promo.fixedAmount)}
                        </TableCell>
                        <TableCell>
                          <div className="text-xs">
                            <div>{new Date(promo.startDate).toLocaleDateString("vi-VN")}</div>
                            <div>-</div>
                            <div>{new Date(promo.endDate).toLocaleDateString("vi-VN")}</div>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusChip(promo)}</TableCell>
                        <TableCell align="center">
                          <Tooltip title="Chỉnh sửa">
                            <IconButton size="small" color="primary" onClick={() => navigate(`/promotion/promotion-edit/${promo.id}`)}>
                              <MdEdit />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Xóa">
                            <IconButton size="small" color="error" onClick={() => handleDeleteClick(promo.id)}>
                              <MdDelete />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                    {promotions.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} align="center" sx={{ py: 3, fontStyle: "italic", color: "gray" }}>
                          Không có dữ liệu
                        </TableCell>
                      </TableRow>
                    )}
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
            </>
          )}

        </div>
      </div>

      <Dialog open={openConfirm} onClose={handleCancelDelete}>
        <DialogTitle>Bạn có chắc chắn muốn xoá khuyến mãi này không?</DialogTitle>
        <DialogActions>
          <Button onClick={handleCancelDelete} color="inherit">Không</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">Có</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!deleteStartCampaign} onClose={() => setDeleteStartCampaign(null)}>
        <DialogTitle>Bạn có chắc chắn muốn xoá chiến dịch này không?</DialogTitle>
        <DialogActions>
          <Button onClick={() => setDeleteStartCampaign(null)} color="inherit">Không</Button>
          <Button onClick={() => deleteCampaignMutation.mutate(deleteStartCampaign)} color="error" variant="contained">
            {deleteCampaignMutation.isPending ? "Đang xoá..." : "Có"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
