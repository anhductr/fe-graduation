import { useEffect, useState, useMemo } from "react";
import { FaCloudUploadAlt } from "react-icons/fa";
import {
  Box,
  IconButton,
  TextField,
  Switch,
  FormControlLabel,
  FormControl,
  Radio,
  RadioGroup,
  Typography,
  Autocomplete,
  Button,
  InputAdornment,
  FormLabel,
} from "@mui/material";
import { CircularProgress } from "@mui/material";
import axios from "axios";
import debounce from "lodash.debounce";

import { useNavigate } from "react-router";
import Chip from "@mui/material/Chip";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import "dayjs/locale/vi";
import { viVN } from "@mui/x-date-pickers/locales";
dayjs.locale("vi");
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";

export default function PromotionUpload() {
  const token = localStorage.getItem("token");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [active, setActive] = useState(true);
  const [discountType, setDiscountType] = useState("DISCOUNT_PERCENT"); // percent | fixed
  const [discountPercent, setDiscountPercent] = useState("");
  const [fixedAmount, setFixedAmount] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [minimumOrderAmount, setMinimumOrderAmount] = useState("");
  const [usageType, setUsageType] = useState("UNLIMITED"); // unlimited | limited
  const [usageLimited, setUsageLimited] = useState("");
  const [usageLimitPerUser, setUsageLimitPerUser] = useState(1);
  const [maxDiscountAmount, setMaxDiscountAmount] = useState("");

  const [applyTo, setApplyTo] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [promotionKind, setPromotionKind] = useState("VOUCHER");

  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    if (newValue === 0) {
      // Voucher
      setPromotionKind("VOUCHER");
      setApplyTo("Product");
    } else if (newValue === 1) {
      // Discount / Auto
      setPromotionKind("AUTO");
      if (!applyTo) setApplyTo("ALL");
    } else if (newValue === 2) {
      // Flash Sale
      setPromotionKind("FLASH_SALE");
      setApplyTo("Product");
      setUsageLimitPerUser(1);
      setUsageType("LIMITED");
      setUsageLimited(1);
      if (startDate) {
        setEndDate(dayjs(startDate).add(18, 'hour'));
      }
    }
  };

  // Effect: Flash Sale always lasts 18 hours from Start Date
  useEffect(() => {
    if (promotionKind === "FLASH_SALE" && startDate) {
      setEndDate(dayjs(startDate).add(18, "hour"));
    }
  }, [startDate, promotionKind]);

  //product
  const [productOptions, setProductOptions] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [inputValueProduct, setInputValueProduct] = useState("");

  const searchProducts = async (keyword) => {
    if (!keyword || keyword.trim().length < 2) return [];
    try {
      const res = await axios.post(
        "/api/v1/search-service/search/admin?page=1&size=30",
        { productName: keyword.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return res.data.result.productGetVMList || [];
    } catch (err) {
      console.error("Lỗi tìm kiếm sản phẩm:", err);
      return [];
    }
  };

  // Debounce search
  const debouncedSearch = useMemo(
    () =>
      debounce(async (keyword) => {
        setLoadingProducts(true);
        const results = await searchProducts(keyword);

        const formatted = results.map((item) => ({
          id: item.id,
          name: item.name,
        }));

        setProductOptions(formatted);
        setLoadingProducts(false);
      }, 500),
    [token] // nếu token thay đổi thì tạo lại
  );

  // Khi người dùng gõ
  useEffect(() => {
    if (inputValueProduct && inputValueProduct.trim().length >= 2) {
      debouncedSearch(inputValueProduct);
    } else {
      // Khi xóa hoặc < 2 ký tự → vẫn giữ lại các sản phẩm đã chọn trong dropdown
      setProductOptions(
        selectedProducts.map((p) => ({
          id: p.id,
          name: p.name,
          price: p.price,
        }))
      );
    }
  }, [inputValueProduct, selectedProducts]);

  //category
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [inputValueCategory, setInputValueCategory] = useState("");

  const searchCategories = async (keyword) => {
    if (!keyword || keyword.trim().length < 2) return [];

    try {
      const res = await axios.post(
        "/api/v1/search-service/search/category/admin",
        {
          name: keyword.trim(),
          limit: 10,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log("search category res: ", res.data.result);
      // Giả sử CategoryGetListVM có field 'data' chứa mảng category
      // Nếu cấu trúc khác (ví dụ result trực tiếp là list), bạn có thể điều chỉnh
      return res.data.result || [];
    } catch (err) {
      // Nếu là lỗi từ Axios (có response từ server)
      if (err.response) {
        // Server trả về lỗi (4xx, 5xx)
        console.error("Lỗi tìm kiếm category - Server response:", {
          status: err.response.status,
          statusText: err.response.statusText,
          data: err.response.data, // Thường chứa message chi tiết từ backend
          headers: err.response.headers,
        });

        // Ví dụ: nếu backend dùng ApiResponse với code != 200
        if (err.response.data?.message) {
          console.error("Message từ server:", err.response.data.message);
        }
      }
      // Lỗi request không gửi được (mạng, CORS, timeout,...)
      else if (err.request) {
        console.error(
          "Lỗi tìm kiếm category - Không nhận được response:",
          err.request
        );
      }
      // Lỗi khác (cấu hình axios sai, v.v.)
      else {
        console.error(
          "Lỗi tìm kiếm category - Setup request lỗi:",
          err.message
        );
      }

      // Bạn vẫn có thể log full error object để debug sâu hơn nếu cần
      console.error("Full error object:", err);

      return [];
    }
  };

  // Debounce search
  const debouncedCateSearch = useMemo(
    () =>
      debounce(async (keyword) => {
        setLoadingCategories(true);
        const results = await searchCategories(keyword);
        const formatted = results.map((item) => ({
          id: item.id,
          name: item.value,
          // có thể thêm image, sku, v.v.
        }));

        setCategoryOptions(formatted);
        setLoadingCategories(false);
      }, 500),
    [token] // nếu token thay đổi thì tạo lại
  );

  // Khi người dùng gõ
  useEffect(() => {
    if (inputValueCategory && inputValueCategory.trim().length >= 2) {
      debouncedCateSearch(inputValueCategory);
    } else {
      // Khi xóa hoặc < 2 ký tự → vẫn giữ lại các danh mục đã chọn trong dropdown
      setCategoryOptions(
        selectedCategories.map((c) => ({
          id: c.id,
          name: c.name,
        }))
      );
    }
  }, [inputValueCategory, selectedCategories, debouncedCateSearch]);

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const createPromotionMutation = useMutation({
    mutationFn: (payload) =>
      axios.post("/api/v1/promotion-service/promotion/create", payload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }),

    onSuccess: (response) => {
      console.log("Tạo khuyễn mãi kho thành công:", response.data);

      // Tự động refetch danh sách lịch sử + tồn kho
      queryClient.invalidateQueries({ queryKey: ["promotions"] });
      navigate("/promotion", {
        state: {
          popup: {
            open: true,
            severity: "success",
            message: "Thêm khuyến mãi thành công!",
            vertical: "top",
            horizontal: "center",
          },
        },
      });
    },

    onError: (err) => {
      navigate("/promotion", {
        state: {
          popup: {
            open: true,
            severity: "error",
            message: err.response?.data?.message || "Tạo khuyến mãi thất bại!",
            vertical: "top",
            horizontal: "center",
          },
        },
      });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation
    if (!name || !name.trim()) {
      alert("Vui lòng nhập tên khuyến mãi!");
      return;
    }
    if (!description || !description.trim()) {
      alert("Vui lòng nhập mô tả khuyến mãi!");
      return;
    }
    if (!discountType) {
      alert("Vui lòng chọn loại giảm giá!");
      return;
    }
    if (
      discountType === "DISCOUNT_PERCENT" &&
      (!discountPercent || Number(discountPercent) <= 0)
    ) {
      alert("Vui lòng nhập phần trăm giảm giá hợp lệ!");
      return;
    }



    if (
      discountType === "FIXED_AMOUNT" &&
      (!fixedAmount || Number(fixedAmount) <= 0)
    ) {
      alert("Vui lòng nhập số tiền giảm giá hợp lệ!");
      return;
    }
    if (!usageType) {
      alert("Vui lòng chọn loại sử dụng!");
      return;
    }
    if (
      usageType === "LIMITED" &&
      (!usageLimited || Number(usageLimited) <= 0)
    ) {
      alert("Vui lòng nhập số lượt sử dụng hợp lệ!");
      return;
    }

    // Xác định applyTo value
    let applyToValue = "ALL";
    if (applyTo === "Product") applyToValue = "Product";
    else if (applyTo === "Category") applyToValue = "Category";

    // Xác định promotionKind
    let promotionKindValue = "AUTO";
    if (promotionKind === "VOUCHER") {
      promotionKindValue = "VOUCHER";
    }

    const payload = {
      name: name.trim(),
      descriptions: description.trim(),
      discountType: discountType,
      usageType: usageType,
      applyTo: applyToValue,
      active: active,
      promotionKind: promotionKind,
      // voucherCode removed as it is backend generated

      // Dates - convert to ISO string if exists
      startDate: startDate ? startDate.toISOString() : null,
      endDate: endDate ? endDate.toISOString() : null,

      // Discount values - send 0 if not applicable (backend requires primitive types)
      discountPercent:
        discountType === "DISCOUNT_PERCENT" ? Number(discountPercent) : 0,
      maxDiscountAmount: discountType === "DISCOUNT_PERCENT" && maxDiscountAmount ? Number(maxDiscountAmount) : 0,
      fixedAmount: discountType === "FIXED_AMOUNT" ? Number(fixedAmount) : 0,

      // Usage limits
      usageLimited: usageType === "LIMITED" ? Number(usageLimited) : 0,
      usageLimitPerUser: Number(usageLimitPerUser),

      // Minimum order
      minimumOrderPurchaseAmount: (promotionKind === "VOUCHER" && minimumOrderAmount)
        ? Number(minimumOrderAmount)
        : null,

      // Products/Categories - only send if applicable
      productId: applyTo === "Product" ? selectedProducts.map((p) => p.id) : [],
      categoryId:
        applyTo === "Category" ? selectedCategories.map((c) => c.id) : [],
    };

    // Gửi dữ liệu qua mutation
    createPromotionMutation.mutate(payload);
  };

  // //thumbnail
  // const [thumbnail, setThumbnail] = useState({ file: null, preview: "" });

  // //thumbnail function
  // const handleThumbnailFileChange = (e) => {
  //   const file = e.target.files[0];
  //   if (file) {
  //     // thu hồi URL cũ nếu có
  //     if (thumbnail.preview) URL.revokeObjectURL(thumbnail.preview);

  //     const preview = URL.createObjectURL(file);
  //     setThumbnail({ file, preview });

  //     // 👇 reset giá trị input để lần sau chọn lại cùng file vẫn chạy
  //     e.target.value = "";
  //   }
  // };

  // const handleThumbnailFileRemove = (e) => {
  //   e.stopPropagation();

  //   // thu hồi URL blob trước khi xóa
  //   if (thumbnail.preview) URL.revokeObjectURL(thumbnail.preview);

  //   // reset lại state và input
  //   setThumbnail({ file: null, preview: "" });
  //   document.getElementById("thumbnail-input").value = "";
  // };

  // const openThumbnailFilePicker = () => {
  //   document.getElementById("thumbnail-input").click();
  // };

  // // dọn dẹp blob khi unmount
  // useEffect(() => {
  //   return () => {
  //     if (thumbnail.preview) URL.revokeObjectURL(thumbnail.preview);
  //   };
  // }, [thumbnail]);

  // const previewsRef = useRef(new Set()); // để track và revoke sau

  // // cleanup on unmount: revoke tất cả preview còn lại
  // useEffect(() => {
  //   return () => {
  //     previewsRef.current.forEach((url) => URL.revokeObjectURL(url));
  //     previewsRef.current.clear();
  //   };
  // }, []);

  return (
    <>
      <div className="py-[10px] px-[100px]">
        <div className="flex justify-between items-center my-4">
          <h3 className="text-[30px] font-bold mb-4 text-[#403e57]">
            Thêm chương trình khuyến mãi
          </h3>
        </div>

        {/* Tabs moved to top */}
        <div className="flex flex-wrap shadow border-0 px-3 py-4 my-[10px] bg-white rounded-[10px] gap-5 mb-5">
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="tabs promotion types"
            sx={{
              width: "100%",
              "& .MuiTabs-indicator": { backgroundColor: "#4a2fcf" },
            }}
          >
            <Tab
              label="Mã Voucher"
              sx={{ textTransform: "none", fontWeight: 600, fontSize: "18px", "&.Mui-selected": { color: "#4a2fcf" } }}
            />
            <Tab
              label="Chương trình giảm giá"
              sx={{ textTransform: "none", fontWeight: 600, fontSize: "18px", "&.Mui-selected": { color: "#4a2fcf" } }}
            />
            <Tab
              label="Flash Sale"
              sx={{ textTransform: "none", fontWeight: 600, fontSize: "18px", "&.Mui-selected": { color: "#4a2fcf" } }}
            />
          </Tabs>

          {/* Context Notice / Voucher Code */}
          {tabValue === 0 && (
            <div className="w-full px-4 mb-2 flex gap-7 ">
              <Typography variant="body2" color="primary" fontWeight="bold">
                Mã Voucher sẽ được hệ thống tạo tự động sau khi tải lên.
              </Typography>
            </div>
          )}
          {tabValue === 2 && (
            <div className="w-full px-4 mb-4">
              <Typography color="error" fontWeight="bold">Flash Sale: Đang phát triển tính năng tạo nhiều deal.</Typography>
            </div>
          )}
        </div>

        {tabValue !== 2 ? (
          <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
            <div className="flex flex-wrap shadow border-0 px-3 py-6 my-[10px] px-[5px] mx-[0px] bg-white rounded-[10px] gap-10">
              <div className="w-screen px-4 py-2 font-semibold text-gray-900 text-[20px]">
                Thông tin cơ bản
              </div>

              <div className="w-full flex gap-7 mx-2">
                <div className="w-[200px] flex justify-end">
                  <h6 className="text-[18px]">Tên khuyến mãi</h6>
                </div>

                <div className="w-full pr-[53px]">
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    type="text"
                    className="bg-[#fafafa] pl-[15px] rounded-[5px] text-[15px] w-full h-[40px] border-[rgba(0,0,0,0.1)] border border-solid"
                  ></input>
                </div>
              </div>

              <div className="w-full flex gap-7 mx-2">
                <div className="w-[200px] flex justify-end">
                  <h6 className="text-[18px]">Mô tả khuyến mãi</h6>
                </div>

                <div className="w-full pr-[53px]">
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="bg-[#fafafa] pt-[15px] pl-[15px] rounded-[5px] text-[15px] w-full h-[118px] border-[rgba(0,0,0,0.1)] border border-solid"
                    rows={5}
                    cols={10}
                  ></textarea>
                </div>
              </div>

              {/* banner logic if needed */}

              <div className="w-full flex gap-7 mx-2">
                <div className="w-[200px] flex justify-end">
                  <h6 className="text-[18px]">Trạng thái</h6>
                </div>

                <div className="w-full pr-[53px]">
                  <Switch
                    checked={active}
                    onChange={(e) => setActive(e.target.checked)}
                    color="primary"
                  />
                  <span
                    className={
                      active ? "text-green-600 font-medium" : "text-gray-500"
                    }
                  >
                    {active ? "Kích hoạt ngay" : "Chưa kích hoạt"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap shadow border-0 px-3 py-6 my-[10px] px-[5px] mx-[0px] bg-white rounded-[10px] gap-5">
              <div className="w-screen px-4 py-2 font-semibold text-gray-900 text-[20px]">
                Loại giảm giá & Giá trị
              </div>

              <div className="w-full ml-[30px]">
                <Box
                  sx={{
                    "& .MuiFormControlLabel-label": {
                      fontSize: "18px",
                    },
                    "& .MuiRadio-root": {
                      transform: "scale(1.3)",
                      marginRight: "8px",
                    },
                  }}
                >
                  <RadioGroup
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value)}
                  >
                    <FormControlLabel
                      value="DISCOUNT_PERCENT"
                      control={<Radio />}
                      label="Giảm theo %"
                    />
                    <FormControlLabel
                      value="FIXED_AMOUNT"
                      control={<Radio />}
                      label="Giảm cố định số tiền"
                    />
                  </RadioGroup>
                </Box>
              </div>

              <div className="flex mx-[30px] w-full">
                {discountType === "DISCOUNT_PERCENT" ? (
                  <div className="flex w-[80%] gap-7">
                    {/* Giảm theo % */}
                    <div className="w-1/2">
                      <label className="block text-[18px] font-medium text-gray-800 mb-3">
                        Giảm (%) *
                      </label>
                      <TextField
                        type="number"
                        value={discountPercent}
                        onChange={(e) => setDiscountPercent(e.target.value)}
                        fullWidth
                        required
                        inputProps={{ min: 0, max: 100 }}
                        sx={{
                          "& .MuiInputBase-input": {
                            fontSize: "18px",
                            height: "28px",
                          },
                          "& .MuiOutlinedInput-root": { borderRadius: "12px" },
                        }}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">%</InputAdornment>
                          ),
                        }}
                        placeholder="Ví dụ: 20"
                      />
                    </div>
                    <div className="w-1/2">
                      <label className="block text-[18px] font-medium text-gray-800 mb-3">
                        Giảm tối đa (đ)
                      </label>
                      <TextField
                        type="number"
                        value={maxDiscountAmount}
                        onChange={(e) => setMaxDiscountAmount(e.target.value)}
                        fullWidth
                        inputProps={{ min: 0 }}
                        sx={{
                          "& .MuiInputBase-input": {
                            fontSize: "18px",
                            height: "28px",
                          },
                          "& .MuiOutlinedInput-root": { borderRadius: "12px" },
                        }}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">đ</InputAdornment>
                          ),
                        }}
                        placeholder="Không giới hạn"
                      />
                    </div>
                  </div>
                ) : (
                  /* Giảm cố định */
                  <div className="flex w-[50%] justify-center">
                    <div className="max-w-md w-full">
                      <label className="block text-[18px] font-medium text-gray-800 mb-3">
                        Số tiền giảm (đ) *
                      </label>
                      <TextField
                        type="number"
                        value={fixedAmount}
                        onChange={(e) => setFixedAmount(e.target.value)}
                        fullWidth
                        required
                        inputProps={{ min: 0 }}
                        sx={{
                          "& .MuiInputBase-input": {
                            fontSize: "18px",
                            height: "28px",
                          },
                          "& .MuiOutlinedInput-root": { borderRadius: "12px" },
                        }}
                        placeholder="Ví dụ: 200000"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-wrap shadow border-0 px-3 py-6 my-[10px] px-[5px] mx-[0px] bg-white rounded-[10px] gap-5">
              <div className="w-full ">
                <div className="w-screen px-4 py-2 font-semibold text-gray-900 text-[20px] mb-4">
                  Phạm vi áp dụng
                </div>

                <div className="w-full flex mx-[30px] flex-col gap-4">
                  <div className="w-full">
                    <RadioGroup
                      row
                      value={applyTo}
                      onChange={(e) => setApplyTo(e.target.value)}
                    >
                      {/* Discount Tab (1) allows All/Category */}
                      {tabValue === 1 && (
                        <>
                          <FormControlLabel value="ALL" control={<Radio />} label="Toàn bộ cửa hàng" />
                          <FormControlLabel value="Category" control={<Radio />} label="Theo danh mục" />
                        </>
                      )}

                      {/* Product is always available (for Voucher and Discount) */}
                      <FormControlLabel value="Product" control={<Radio />} label="Theo sản phẩm cụ thể" />
                    </RadioGroup>
                  </div>

                  {(applyTo === "Category" || applyTo === "Product") && (
                    <div className="w-[85%] p-6 bg-gradient-to-r from-[#4a2fcf10] to-[#6440f510] border-2 border-[#4a2fcf] rounded-2xl">
                      <Typography variant="h6" className="font-bold text-xl pb-5" sx={{ color: "#4a2fcf" }}>
                        {applyTo === "Category" ? "Chọn danh mục áp dụng" : "Chọn sản phẩm áp dụng"}
                      </Typography>

                      {/* Selector Logic */}
                      {applyTo === "Category" ? (
                        <Box sx={{ width: "100%" }}>
                          <Autocomplete
                            multiple
                            options={categoryOptions}
                            getOptionLabel={(option) => option.name}
                            loading={loadingCategories}
                            inputValue={inputValueCategory}
                            onInputChange={(e, v) => setInputValueCategory(v)}
                            value={selectedCategories}
                            onChange={(e, v) => setSelectedCategories(v || [])}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                label="Tìm danh mục..."
                                placeholder="Nhập tên..."
                                InputProps={{
                                  ...params.InputProps,
                                  endAdornment: (<>{loadingCategories && <CircularProgress size={20} />}{params.InputProps.endAdornment}</>)
                                }}
                              />
                            )}
                            renderTags={() => null}
                          />
                          {selectedCategories.length > 0 && (
                            <Box sx={{ mt: 2, display: "flex", flexWrap: "wrap", gap: 1 }}>
                              {selectedCategories.map((option) => (
                                <Chip
                                  key={option.id}
                                  label={option.name}
                                  onDelete={() => setSelectedCategories(prev => prev.filter(item => item.id !== option.id))}
                                  sx={{ backgroundColor: "#4a2fcf", color: "white" }}
                                />
                              ))}
                            </Box>
                          )}
                        </Box>
                      ) : (
                        <Box sx={{ width: "100%" }}>
                          <Autocomplete
                            multiple
                            options={productOptions}
                            getOptionLabel={(option) => option.name}
                            loading={loadingProducts}
                            inputValue={inputValueProduct}
                            onInputChange={(e, v) => setInputValueProduct(v)}
                            value={selectedProducts}
                            onChange={(e, v) => setSelectedProducts(v || [])}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                label="Tìm sản phẩm..."
                                placeholder="Nhập tên..."
                                InputProps={{
                                  ...params.InputProps,
                                  endAdornment: (<>{loadingProducts && <CircularProgress size={20} />}{params.InputProps.endAdornment}</>)
                                }}
                              />
                            )}
                            renderTags={() => null}
                          />
                          {selectedProducts.length > 0 && (
                            <Box sx={{ mt: 2, display: "flex", flexWrap: "wrap", gap: 1 }}>
                              {selectedProducts.map((option) => (
                                <Chip
                                  key={option.id}
                                  label={option.name}
                                  onDelete={() => setSelectedProducts(prev => prev.filter(item => item.id !== option.id))}
                                  sx={{ backgroundColor: "#4a2fcf", color: "white" }}
                                />
                              ))}
                            </Box>
                          )}
                        </Box>
                      )}

                      <div className="mt-5 text-right">
                        <Typography variant="body1" sx={{ color: "#4a2fcf", fontWeight: 700 }}>
                          Đã chọn: <span className="text-3xl font-bold">{applyTo === "Category" ? selectedCategories.length : selectedProducts.length}</span> {applyTo === "Category" ? "danh mục" : "sản phẩm"}
                        </Typography>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap shadow border-0 px-3 py-6 my-[10px] px-[5px] mx-[0px] bg-white rounded-[10px] gap-5">
              <div className="w-screen px-4 py-2 font-semibold text-gray-900 text-[20px]">
                Giới hạn, thời gian & mã giảm giá
              </div>
              <div className="w-full flex flex-col gap-5 mx-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <LocalizationProvider
                    dateAdapter={AdapterDayjs}
                    adapterLocale="vi"
                    localeText={
                      viVN.components.MuiLocalizationProvider.defaultProps
                        .localeText
                    }
                  >
                    {/* Từ ngày giờ */}
                    <DateTimePicker
                      label="Từ ngày"
                      value={startDate}
                      onChange={(newValue) => setStartDate(newValue)}
                      format="DD/MM/YYYY HH:mm"
                      slotProps={{
                        textField: {
                          sx: { width: "100%" },
                        },
                        actionBar: { actions: ["clear", "cancel", "accept"] },
                      }}
                    />

                    {/* Đến ngày giờ */}
                    <DateTimePicker
                      label="Đến ngày"
                      value={endDate}
                      onChange={(newValue) => setEndDate(newValue)}
                      minDateTime={startDate} // không cho chọn nhỏ hơn ngày bắt đầu
                      format="DD/MM/YYYY HH:mm"
                      slotProps={{
                        textField: {
                          sx: { width: "100%" },
                        },
                        actionBar: { actions: ["clear", "cancel", "accept"] },
                      }}
                    />
                  </LocalizationProvider>
                </div>

                {/* Đơn tối thiểu - ONLY FOR VOUCHER (Tab 0) */}
                {tabValue === 0 && (
                  <TextField
                    label="Giá trị đơn hàng tối thiểu (đ)"
                    type="number"
                    value={minimumOrderAmount}
                    onChange={(e) => setMinimumOrderAmount(e.target.value)}
                    fullWidth
                    required
                  />
                )}

                {/* Giới hạn lượt dùng */}
                <div className="">
                  <FormControl component="fieldset">
                    <FormLabel component="legend">Giới hạn lượt sử dụng</FormLabel>
                    <div className="flex flex-col gap-3 mt-2">
                      <div className="flex gap-4 items-center">
                        <Typography variant="body2" sx={{ minWidth: 150 }}>Tổng lượt dùng toàn hệ thống:</Typography>
                        <RadioGroup
                          row
                          value={usageType}
                          onChange={(e) => setUsageType(e.target.value)}
                        >
                          <FormControlLabel
                            value="UNLIMITED"
                            control={<Radio />}
                            label="Không giới hạn"
                          />
                          <FormControlLabel
                            value="LIMITED"
                            control={<Radio />}
                            label="Có giới hạn"
                          />
                        </RadioGroup>
                        {usageType === "LIMITED" && (
                          <TextField
                            type="number"
                            size="small"
                            label="Số lượng"
                            value={usageLimited}
                            onChange={(e) => setUsageLimited(e.target.value)}
                            sx={{ width: 150 }}
                            required
                          />
                        )}
                      </div>

                      <div className="flex gap-4 items-center mt-2">
                        <Typography variant="body2" sx={{ minWidth: 150 }}>Giới hạn mỗi khách hàng:</Typography>
                        <TextField
                          type="number"
                          size="small"
                          label="Số lần/khách"
                          value={usageLimitPerUser}
                          onChange={(e) => setUsageLimitPerUser(e.target.value)}
                          sx={{ width: 150 }}
                        />
                      </div>
                    </div>
                  </FormControl>
                </div>
              </div>
            </div>

            <div className="!w-full px-[60px] py-[30px]">
              <Button
                variant="contained"
                type="submit"
                className="!w-full !flex !items-cnter !justify-center !gap-2 !p-[15px] !bg-gradient-to-r !from-[#4a2fcf] !to-[#6440F5]"
              >
                <FaCloudUploadAlt className="text-[35px]" />
                <h3 className="text-[25px]">Tải lên</h3>
              </Button>
            </div>
          </form >
        ) : (
          <div className="h-[200px] flex items-center justify-center text-gray-500 italic">
            Nội dung Flash Sale sẽ được cập nhật.
          </div>
        )}

      </div >
      {
        createPromotionMutation.isPending && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white p-6 rounded-xl flex flex-col items-center gap-3">
              <CircularProgress color="primary" />
              <p className="text-gray-700 font-medium">Đang tải lên...</p>
            </div>
          </div>
        )
      }
    </>
  );
}
