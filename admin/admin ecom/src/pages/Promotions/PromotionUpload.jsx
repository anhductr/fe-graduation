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
import PromotionService from "../../services/PromotionService";

import { useNavigate } from "react-router-dom";
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
import { useQuery } from "@tanstack/react-query";

export default function PromotionUpload() {
  const token = localStorage.getItem("token");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
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
  const [selectedCampaign, setSelectedCampaign] = useState(null); // New state for selected campaign

  const [tabValue, setTabValue] = useState(0);

  // Flash Sale State
  const [flashSaleItems, setFlashSaleItems] = useState([]);
  const [tempProduct, setTempProduct] = useState(null); // Single product selection for Flash Sale
  const [tempDiscountType, setTempDiscountType] = useState("DISCOUNT_PERCENT");
  const [tempDiscountValue, setTempDiscountValue] = useState("");

  const handleAddToFlashSale = () => {
    if (!tempProduct) {
      alert("Vui lòng chọn sản phẩm!");
      return;
    }
    if (!tempDiscountValue || Number(tempDiscountValue) <= 0) {
      alert("Vui lòng nhập giá trị giảm giá hợp lệ!");
      return;
    }

    // Check duplicate
    const exists = flashSaleItems.find(item => item.productId === tempProduct.id);
    if (exists) {
      alert("Sản phẩm này đã có trong danh sách Flash Sale!");
      return;
    }

    const newItem = {
      productId: tempProduct.id,
      productName: tempProduct.name,
      discountType: tempDiscountType,
      discountValue: Number(tempDiscountValue),
    };

    setFlashSaleItems([...flashSaleItems, newItem]);

    // Reset temp inputs
    setTempProduct(null);
    setTempDiscountValue("");
    setInputValueProduct(""); // clear search input
  };

  const handleRemoveFromFlashSale = (id) => {
    setFlashSaleItems(flashSaleItems.filter(item => item.productId !== id));
  };

  const handleTabChange = (event, newValue) => {
    // Reset all fields to initial values
    setName("");
    setDescription("");
    setDiscountType("DISCOUNT_PERCENT");
    setDiscountPercent("");
    setFixedAmount("");
    setStartDate(null);
    setEndDate(null);
    setMinimumOrderAmount("");
    setUsageType("UNLIMITED");
    setUsageLimited("");
    setUsageLimitPerUser(1);
    setMaxDiscountAmount("");
    setSelectedCategories([]);
    setSelectedProducts([]);
    setSelectedCampaign(null);
    setFlashSaleItems([]);
    setTempProduct(null);
    setTempDiscountValue("");
    setInputValueProduct("");
    setInputValueCategory("");

    setTabValue(newValue);
    if (newValue === 0) {
      // Voucher
      setPromotionKind("VOUCHER");
      setApplyTo("Product");
    } else if (newValue === 1) {
      // Discount / Auto
      setPromotionKind("AUTO");
      setApplyTo("ALL");
    } else if (newValue === 2) {
      // Flash Sale
      setPromotionKind("FLASH_SALE");
      setApplyTo("Product"); // Flash sale implicity uses product but list is managed separately
      setUsageLimitPerUser(1);
      setUsageType("LIMITED");
      setUsageLimited(1);
    }
  };

  // Effect: Flash Sale always lasts 18 hours from Start Date
  useEffect(() => {
    if (promotionKind === "FLASH_SALE" && startDate) {
      setEndDate(dayjs(startDate).add(18, "hour"));
    }
  }, [startDate, promotionKind]);

  //product generic search (reused)
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

  // Fetch campaigns
  const { data: campaignData, isLoading: isLoadingCampaigns } = useQuery({
    queryKey: ["campaigns"],
    queryFn: async () => {
      const res = await PromotionService.getAllCampaigns();
      return res.data?.result || [];
    }
  });

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
      // Logic dropdown: Nếu ở tab flash sale, có thể cần logic hiển thị khác nếu muốn
      // Hiện tại giữ logic search chung. 
      // Nhưng nếu đang chọn sản phẩm temp cho Flash Sale, option list có thể khác.
      // Tuy nhiên để đơn giản, giữ nguyên logic search.

      setProductOptions([]); // Clear options if empty input to hide dropdown unless necessary

    }
  }, [inputValueProduct, debouncedSearch]); // Reduced dependencies to avoid loops

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
      return res.data.result || [];
    } catch (err) {
      console.error("Lỗi tìm kiếm category:", err);
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
        }));

        setCategoryOptions(formatted);
        setLoadingCategories(false);
      }, 500),
    [token]
  );

  // Khi người dùng gõ category
  useEffect(() => {
    if (inputValueCategory && inputValueCategory.trim().length >= 2) {
      debouncedCateSearch(inputValueCategory);
    } else {
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
    mutationFn: (payload) => {
      if (payload.promotionKind === "FLASH_SALE") {
        return PromotionService.createFlashSale(payload);
      } else {
        // Use Service or keep axios (service preferred but keeping axios for standard is ok if consistent, lets use service if possible but I dont want to break existing if createPromotion signature differs).
        // The user updated PromotionService.createPromotion to take data.
        // payload here matches what createPromotion expects.
        return PromotionService.createPromotion(payload);
      }
    },

    onSuccess: (response) => {
      console.log("Tạo khuyến mãi thành công:", response.data);

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

    if (tabValue !== 2) {
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
    } else {
      // Flash Sale Validation
      if (flashSaleItems.length === 0) {
        alert("Vui lòng thêm ít nhất 1 sản phẩm cho Flash Sale!");
        return;
      }
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

    // Common fields
    const basePayload = {
      name: name.trim(),
      descriptions: description.trim(),
      usageType: usageType,
      applyTo: applyToValue, // Enum string
      promotionKind: promotionKind, // Enum string
      startDate: startDate ? startDate.toISOString() : null,
      endDate: endDate ? endDate.toISOString() : null,
      // Usage limits (backend common fields)
      usageLimited: usageType === "LIMITED" ? Number(usageLimited) : 0,
      usageLimitPerUser: Number(usageLimitPerUser),
      // Minimum order
      minimumOrderPurchaseAmount: (promotionKind === "VOUCHER" && minimumOrderAmount)
        ? Number(minimumOrderAmount)
        : null,
      campaignId: selectedCampaign ? selectedCampaign.id : null,
    };

    let finalPayload = {};

    if (tabValue === 2) {
      // FLASH SALE
      const flashSaleItemsRequest = flashSaleItems.map(item => ({
        productId: item.productId,
        discountPercent: item.discountType === "DISCOUNT_PERCENT" ? item.discountValue : 0,
        fixedAmount: item.discountType === "FIXED_AMOUNT" ? item.discountValue : 0
      }));

      finalPayload = {
        ...basePayload,
        applyTo: "Product",
        // Flash Sale specific DTO structure
        flashSaleItemRequests: flashSaleItemsRequest,
        campaignId: selectedCampaign ? selectedCampaign.id : null
      };

    } else {
      // VOUCHER & DISCOUNT (AUTO)
      finalPayload = {
        ...basePayload,
        discountType: discountType,
        discountPercent: discountType === "DISCOUNT_PERCENT" ? Number(discountPercent) : 0,
        maxDiscountAmount: discountType === "DISCOUNT_PERCENT" && maxDiscountAmount ? Number(maxDiscountAmount) : 0,
        fixedAmount: discountType === "FIXED_AMOUNT" ? Number(fixedAmount) : 0,

        // Products/Categories - only send if applicable (Flash Sale sends items separately)
        productId: applyTo === "Product" ? selectedProducts.map((p) => p.id) : [],
        categoryId: applyTo === "Category" ? selectedCategories.map((c) => c.id) : [],
      };
    }

    // Gửi dữ liệu qua mutation
    createPromotionMutation.mutate(finalPayload);
  };

  return (
    <>
      <div className="py-[10px] px-[100px]">
        <div className="flex justify-between items-center my-4">
          <h3 className="text-[30px] font-bold mb-4 text-[#403e57]">
            Thêm chương trình khuyến mãi
          </h3>
        </div>

        {/* Global Info Alert */}
        <div className="w-full bg-blue-50 border border-blue-200 rounded-lg p-4 mb-5 flex gap-3 items-center">
          <div className="text-blue-500">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
            </svg>
          </div>
          <Typography variant="body1" className="text-blue-800">
            Lưu ý: Chương trình khuyến mãi sẽ được kích hoạt sau <span className="font-bold">1 ngày</span> kể từ thời điểm tạo.
          </Typography>
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
        </div>

        <form className="flex flex-col gap-3" onSubmit={handleSubmit}>

          {/* === Campaign Selection === */}
          <div className="flex flex-wrap shadow border-0 px-3 py-6 my-[10px] bg-white rounded-[10px] gap-10">
            <div className="w-screen px-4 py-2 font-semibold text-gray-900 text-[20px]">
              Chiến dịch (Tùy chọn)
            </div>
            <div className="w-full px-4 mb-4">
              <Autocomplete
                options={campaignData || []}
                getOptionLabel={(option) => option.name || ""}
                value={selectedCampaign}
                onChange={(event, newValue) => setSelectedCampaign(newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Tìm kiếm và chọn chiến dịch..."
                    fullWidth
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "5px",
                        backgroundColor: "#fafafa",
                      },
                    }}
                  />
                )}
                renderOption={(props, option) => (
                  <li {...props} key={option.id}>
                    {option.name}
                  </li>
                )}
              />
            </div>
          </div>

          {/* 1. Basic Info - VISIBLE FOR ALL */}
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
          </div>

          {/* 2. Global Discount - HIDDEN FOR FLASH SALE (Tab 2) */}
          {tabValue !== 2 && (
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
                    row
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
                  <div className="flex w-full gap-7">
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
                        required={tabValue !== 2}
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
                  <div className="flex w-full justify-start">
                    <div className="max-w-md w-full">
                      <label className="block text-[18px] font-medium text-gray-800 mb-3">
                        Số tiền giảm (đ) *
                      </label>
                      <TextField
                        type="number"
                        value={fixedAmount}
                        onChange={(e) => setFixedAmount(e.target.value)}
                        fullWidth
                        required={tabValue !== 2}
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
          )}

          {/* 3. NEW FLASH SALE ITEMS SECTION - VISIBLE ONLY FOR TAB 2 */}
          {tabValue === 2 && (
            <div className="flex flex-wrap shadow border-0 px-3 py-6 my-[10px] px-[5px] mx-[0px] bg-white rounded-[10px] gap-5">
              <div className="w-screen px-4 py-2 font-semibold text-gray-900 text-[20px]">
                Danh sách sản phẩm Flash Sale
              </div>

              <div className="w-full px-5 flex flex-col gap-4">
                {/* Selector Area */}
                <div className="flex gap-4 items-end bg-gray-50 p-4 rounded-xl border border-dashed border-gray-300">
                  <div className="flex-1">
                    <Typography variant="subtitle2" className="mb-2 font-bold text-gray-700">1. Chọn sản phẩm</Typography>
                    <Autocomplete
                      options={productOptions}
                      getOptionLabel={(option) => option.name}
                      loading={loadingProducts}
                      inputValue={inputValueProduct}
                      onInputChange={(e, v) => setInputValueProduct(v)}
                      value={tempProduct}
                      onChange={(e, v) => setTempProduct(v)}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Tìm sản phẩm"
                          size="small"
                          InputProps={{
                            ...params.InputProps,
                            endAdornment: (<>{loadingProducts && <CircularProgress size={20} />}{params.InputProps.endAdornment}</>)
                          }}
                        />
                      )}
                    />
                  </div>

                  <div className="flex-1">
                    <Typography variant="subtitle2" className="mb-2 font-bold text-gray-700">2. Loại giảm giá</Typography>
                    <RadioGroup
                      row
                      value={tempDiscountType}
                      onChange={(e) => setTempDiscountType(e.target.value)}
                    >
                      <FormControlLabel value="DISCOUNT_PERCENT" control={<Radio size="small" />} label="Theo %" />
                      <FormControlLabel value="FIXED_AMOUNT" control={<Radio size="small" />} label="Số tiền" />
                    </RadioGroup>
                  </div>

                  <div className="flex-1">
                    <Typography variant="subtitle2" className="mb-2 font-bold text-gray-700">3. Giá trị giảm</Typography>
                    <TextField
                      size="small"
                      type="number"
                      fullWidth
                      label={tempDiscountType === "DISCOUNT_PERCENT" ? "Phần trăm (%)" : "Số tiền (đ)"}
                      value={tempDiscountValue}
                      onChange={(e) => setTempDiscountValue(e.target.value)}
                    />
                  </div>

                  <div>
                    <Button variant="contained" color="primary" onClick={handleAddToFlashSale} sx={{ height: 40, px: 3 }}>
                      Thêm
                    </Button>
                  </div>
                </div>

                {/* List Area */}
                {flashSaleItems.length > 0 ? (
                  <div className="w-full overflow-hidden border rounded-lg">
                    <table className="w-full text-sm text-left text-gray-500">
                      <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                        <tr>
                          <th className="px-6 py-3">Sản phẩm</th>
                          <th className="px-6 py-3">Loại giảm</th>
                          <th className="px-6 py-3">Giá trị</th>
                          <th className="px-6 py-3 text-right">Hành động</th>
                        </tr>
                      </thead>
                      <tbody>
                        {flashSaleItems.map((item, index) => (
                          <tr key={index} className="bg-white border-b hover:bg-gray-50">
                            <td className="px-6 py-4 font-medium text-gray-900">{item.productName}</td>
                            <td className="px-6 py-4">
                              {item.discountType === "DISCOUNT_PERCENT" ? "Phần trăm (%)" : "Cố định (đ)"}
                            </td>
                            <td className="px-6 py-4 font-bold text-[#4a2fcf]">
                              {item.discountValue} {item.discountType === "DISCOUNT_PERCENT" ? "%" : "đ"}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <Button
                                size="small"
                                color="error"
                                onClick={() => handleRemoveFromFlashSale(item.productId)}
                              >
                                Xóa
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center text-gray-400 italic py-4">Chưa có sản phẩm nào trong danh sách.</div>
                )}
              </div>
            </div>
          )}

          {/* 4. Scope (Apply To) - HIDDEN FOR FLASH SALE (Tab 2) */}
          {tabValue !== 2 && (
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
          )}

          {/* 5. Limits & Time - VISIBLE FOR ALL */}
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
                        helperText: promotionKind === "FLASH_SALE" ? "Tự động cộng 18 tiếng từ giờ bắt đầu" : ""
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
              {tabValue === 0 && (
                < div className="">
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
                            disabled={promotionKind === "FLASH_SALE"} // Flash Sale always limited
                          />
                          <FormControlLabel
                            value="LIMITED"
                            control={<Radio />}
                            label="Có giới hạn"
                            disabled={promotionKind === "FLASH_SALE"}
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
                          disabled={promotionKind === "FLASH_SALE"} // Flash Sale cố định 1
                          sx={{ width: 150 }}
                        />
                      </div>
                    </div>
                  </FormControl>
                </div>
              )}
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
