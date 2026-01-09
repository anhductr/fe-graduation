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
  const [usageLimited, setUsageLimited] = useState(0);
  const [applyTo, setApplyTo] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [promotionKind, setPromotionKind] = useState("AUTOMATIC");

  const [tabValue, setTabValue] = useState(0);
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

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
      promotionKind: promotionKindValue,

      // Dates - convert to ISO string if exists
      startDate: startDate ? startDate.toISOString() : null,
      endDate: endDate ? endDate.toISOString() : null,

      // Discount values - only send the relevant one
      discountPercent:
        discountType === "DISCOUNT_PERCENT" ? Number(discountPercent) : null,
      fixedAmount: discountType === "FIXED_AMOUNT" ? Number(fixedAmount) : null,

      // Usage limits
      usageLimited: usageType === "LIMITED" ? Number(usageLimited) : null,
      usageLimitPerUser: 1, // Default value

      // Minimum order
      minimumOrderPurchaseAmount: minimumOrderAmount
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
            Thêm chương trình giảm giá
          </h3>
        </div>

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

            {/* banner */}
            {/* <div className='w-full flex gap-7 ml-2'>
              <div className='w-[200px] h-full'>
                <div className='flex flex-col items-end text-right gap-[91px] h-full'>
                  <h6 className="text-[18px]">Ảnh khuyến mãi</h6>
                </div>
              </div> */}

            {/* <div className='w-full flex gap-6 flex-wrap pr-[53px]'>
                <div className='flex flex-col items-center gap-2'>
                  <Box
                    sx={{
                      width: 140,
                      height: 140,
                      border: "2px dashed #aaa",
                      borderRadius: 2,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      overflow: "hidden",
                      position: "relative",
                    }}
                    onClick={openThumbnailFilePicker}
                  >
                    {thumbnail.preview ? (
                      <div className="w-full h-full">
                        <img
                          src={thumbnail.preview}
                          alt="thumbnail"
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      </div>
                    ) : (
                      <div>
                        <AddPhotoAlternateIcon
                          fontSize="large"
                          sx={{
                            fill: "url(#gradient1)", // gradient cho icon
                          }}
                        />
                        <svg width={0} height={0}>
                          <defs>
                            <linearGradient id="gradient1" x1="0" y1="0" x2="1" y2="1">
                              <stop offset="0%" stopColor="#4a2fcf" />
                              <stop offset="100%" stopColor="#6440F5" />
                            </linearGradient>
                          </defs>
                        </svg>
                      </div>
                    )}
                  </Box>
                  <div className="flex flex-col justify-center items-center">
                    {thumbnail.preview ? (
                      <div className='flex gap-2'>
                        <IconButton
                          onClick={openThumbnailFilePicker}
                        >
                          <BiRefresh className='text-[25px]' />
                        </IconButton>

                        <IconButton
                          onClick={(e) => handleThumbnailFileRemove(e)}
                        >
                          <HiOutlineTrash className='text-[20px]' />
                        </IconButton>
                      </div>
                    ) : null}
                  </div>
                  <input
                    id="thumbnail-input"
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={handleThumbnailFileChange}
                  />
                </div>
              </div> */}
            {/* </div> */}

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
                <div className="flex w-[50%] justify-center">
                  {/* Giảm theo % */}
                  <div className="max-w-md w-full">
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
                      placeholder="Ví dụ: 20"
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
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              aria-label="tabs danh mục và thương hiệu"
              sx={{
                mb: 1,
                "& .MuiTabs-indicator": {
                  backgroundColor: "#4a2fcf",
                },
              }}
            >
              <Tab
                label="Voucher"
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "18px",
                  "&.Mui-selected": {
                    color: "#4a2fcf",
                  },
                }}
              />
              <Tab
                label="Giảm giá"
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "18px",
                  "&.Mui-selected": {
                    color: "#4a2fcf",
                  },
                }}
              />
            </Tabs>
            {tabValue === 0 && (
              <>
                <div className="w-screen px-4 py-2 font-semibold text-gray-900 text-[20px]">
                  Loại voucher
                </div>
                <div className="w-[40%] mx-[30px]">
                  <RadioGroup
                    value={promotionKind}
                    onChange={(e) => setPromotionKind(e.target.value)}
                  >
                    <FormControlLabel
                      value="AUTOMATIC"
                      control={<Radio />}
                      label="Không cần mã (tự động áp dụng)"
                    />
                    <FormControlLabel
                      value={"VOUCHER"}
                      control={<Radio />}
                      label="Khách phải nhập mã"
                    />
                  </RadioGroup>
                </div>
              </>
            )}
            {tabValue === 1 && (
              <>
                <div className="w-screen px-4 py-2 font-semibold text-gray-900 text-[20px]">
                  Điều kiện áp dụng
                </div>

                <div className="w-full flex mx-[30px]">
                  <div className="w-[40%]">
                    <RadioGroup
                      value={applyTo}
                      onChange={(e) => setApplyTo(e.target.value)}
                    >
                      <FormControlLabel
                        value="ALL"
                        control={<Radio />}
                        label="Áp dụng cho tất cả"
                      />
                      <FormControlLabel
                        value="Category"
                        control={<Radio />}
                        label="Chỉ áp dụng cho một số danh mục"
                      />
                      <FormControlLabel
                        value="Product"
                        control={<Radio />}
                        label="Chỉ áp dụng cho sản phẩm cụ thể"
                      />
                    </RadioGroup>
                  </div>

                  {/* HIỂN THỊ KHI CHỌN DANH MỤC HOẶC SẢN PHẨM */}
                  {(applyTo === "Category" || applyTo === "Product") && (
                    <div className="w-[60%] p-6 bg-gradient-to-r from-[#4a2fcf10] to-[#6440f510] border-2 border-[#4a2fcf] rounded-2xl">
                      {/* from-[#4a2fcf10] = #4a2fcf với độ trong suốt 6% → nền nhẹ nhàng */}

                      <Typography
                        variant="h6"
                        className="font-bold text-xl pb-5"
                        sx={{ color: "#4a2fcf" }} // chữ tím đậm
                      >
                        {applyTo === "Category"
                          ? "Chọn danh mục áp dụng"
                          : "Chọn sản phẩm áp dụng"}
                      </Typography>

                      {applyTo === "Category" ? (
                        <Box sx={{ width: "100%" }}>
                          {/* Thanh tìm kiếm sản phẩm */}
                          <Autocomplete
                            multiple
                            options={categoryOptions}
                            getOptionLabel={(option) => `${option.name}`}
                            loading={loadingCategories}
                            inputValue={inputValueCategory}
                            onInputChange={(e, newInputValue) =>
                              setInputValueCategory(newInputValue)
                            } // Quan trọng!
                            value={selectedCategories}
                            onChange={(e, newValue) => {
                              const updated = newValue || [];
                              setSelectedCategories(updated);
                              // setSelectedCategoriesId(updated.map(item => String(item.id)));
                            }}
                            filterSelectedOptions
                            noOptionsText="Không tìm thấy sản phẩm"
                            isOptionEqualToValue={(option, value) =>
                              option.id === value.id
                            }
                            clearIcon={null}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                label="Tìm sản phẩm theo tên..."
                                placeholder="Nhập tên sản phẩm để thêm..."
                                InputProps={{
                                  ...params.InputProps,
                                  endAdornment: (
                                    <>
                                      {loadingCategories && (
                                        <CircularProgress
                                          color="inherit"
                                          size={20}
                                        />
                                      )}
                                      {params.InputProps.endAdornment}
                                    </>
                                  ),
                                }}
                                sx={{
                                  "& .MuiInputBase-input": { fontSize: "15px" },
                                  "& .MuiInputLabel-root": {
                                    fontSize: "15px",
                                    color: "#4a2fcf",
                                    "&.Mui-focused": { color: "#4a2fcf" },
                                  },
                                  "& .MuiOutlinedInput-root": {
                                    "& fieldset": { borderColor: "#4a2fcf" },
                                    "&:hover fieldset": {
                                      borderColor: "#4a2fcf",
                                    },
                                    "&.Mui-focused fieldset": {
                                      borderColor: "#4a2fcf",
                                      borderWidth: 2,
                                    },
                                  },
                                  "& .MuiAutocomplete-tag": { display: "none" },
                                }}
                              />
                            )}
                            renderTags={() => null}
                            renderOption={(props, option) => (
                              <li {...props} key={option.id}>
                                <Box>
                                  <Typography variant="body1" fontWeight={500}>
                                    {option.name}
                                  </Typography>
                                </Box>
                              </li>
                            )}
                          />

                          {/* Danh sách sản phẩm đã chọn */}
                          {selectedCategories.length > 0 && (
                            <Box
                              sx={{
                                mt: 2,
                                display: "flex",
                                flexWrap: "wrap",
                                gap: 1,
                              }}
                            >
                              {selectedCategories.map((option) => (
                                <Chip
                                  key={option.id}
                                  label={`${option.name}`}
                                  size="medium"
                                  onDelete={() => {
                                    setSelectedCategories((prev) =>
                                      prev.filter(
                                        (item) => item.id !== option.id
                                      )
                                    );

                                    // setSelectedCategories(prev => prev.filter(id => id !== String(option.id)));
                                  }}
                                  sx={{
                                    backgroundColor: "#4a2fcf",
                                    color: "white",
                                    fontSize: "13px",
                                    height: 40,
                                    fontWeight: 600,
                                    "& .MuiChip-deleteIcon": {
                                      color: "white",
                                      "&:hover": {
                                        color: "rgba(255,255,255,0.8)",
                                      },
                                    },
                                  }}
                                />
                              ))}
                            </Box>
                          )}
                          {selectedCategories.length > 0 && (
                            <Button
                              size="small"
                              onClick={() => setSelectedCategories([])}
                              sx={{ mt: 2 }}
                            >
                              Xóa tất cả danh mục
                            </Button>
                          )}
                        </Box>
                      ) : (
                        <Box sx={{ width: "100%" }}>
                          {/* Thanh tìm kiếm sản phẩm */}
                          <Autocomplete
                            multiple
                            options={productOptions}
                            getOptionLabel={(option) => `${option.name}`}
                            loading={loadingProducts}
                            inputValue={inputValueProduct}
                            onInputChange={(e, newInputValue) =>
                              setInputValueProduct(newInputValue)
                            } // Quan trọng!
                            value={selectedProducts}
                            onChange={(e, newValue) => {
                              setSelectedProducts(newValue || []); // newValue có thể null
                            }}
                            filterSelectedOptions
                            noOptionsText="Không tìm thấy sản phẩm"
                            isOptionEqualToValue={(option, value) =>
                              option.id === value.id
                            }
                            clearIcon={null}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                label="Tìm sản phẩm theo tên..."
                                placeholder="Nhập tên sản phẩm để thêm..."
                                InputProps={{
                                  ...params.InputProps,
                                  endAdornment: (
                                    <>
                                      {loadingProducts && (
                                        <CircularProgress
                                          color="inherit"
                                          size={20}
                                        />
                                      )}
                                      {params.InputProps.endAdornment}
                                    </>
                                  ),
                                }}
                                sx={{
                                  "& .MuiInputBase-input": { fontSize: "15px" },
                                  "& .MuiInputLabel-root": {
                                    fontSize: "15px",
                                    color: "#4a2fcf",
                                    "&.Mui-focused": { color: "#4a2fcf" },
                                  },
                                  "& .MuiOutlinedInput-root": {
                                    "& fieldset": { borderColor: "#4a2fcf" },
                                    "&:hover fieldset": {
                                      borderColor: "#4a2fcf",
                                    },
                                    "&.Mui-focused fieldset": {
                                      borderColor: "#4a2fcf",
                                      borderWidth: 2,
                                    },
                                  },
                                  "& .MuiAutocomplete-tag": { display: "none" },
                                }}
                              />
                            )}
                            renderTags={() => null}
                            renderOption={(props, option) => (
                              <li {...props} key={option.id}>
                                <Box>
                                  <Typography variant="body1" fontWeight={500}>
                                    {option.name}
                                  </Typography>
                                </Box>
                              </li>
                            )}
                          />

                          {/* Danh sách sản phẩm đã chọn */}
                          {selectedProducts.length > 0 && (
                            <Box
                              sx={{
                                mt: 2,
                                display: "flex",
                                flexWrap: "wrap",
                                gap: 1,
                              }}
                            >
                              {selectedProducts.map((option) => (
                                <Chip
                                  key={option.id}
                                  label={`${option.name}`}
                                  size="medium"
                                  onDelete={() => {
                                    setSelectedProducts((prev) =>
                                      prev.filter(
                                        (item) => item.id !== option.id
                                      )
                                    );
                                  }}
                                  sx={{
                                    backgroundColor: "#4a2fcf",
                                    color: "white",
                                    fontSize: "13px",
                                    height: 40,
                                    fontWeight: 600,
                                    "& .MuiChip-deleteIcon": {
                                      color: "white",
                                      "&:hover": {
                                        color: "rgba(255,255,255,0.8)",
                                      },
                                    },
                                  }}
                                />
                              ))}
                            </Box>
                          )}
                          {selectedProducts.length > 0 && (
                            <Button
                              size="small"
                              onClick={() => setSelectedProducts([])}
                              sx={{ mt: 2 }}
                            >
                              Xóa tất cả sản phẩm
                            </Button>
                          )}
                        </Box>
                      )}

                      {/* Số lượng đã chọn - giữ nguyên vị trí và kiểu dáng đẹp */}
                      <div className="mt-5 text-right">
                        <Typography
                          variant="body1"
                          sx={{
                            color: "#4a2fcf",
                            fontWeight: 700,
                            fontSize: "1.1rem",
                          }}
                        >
                          Đã chọn:{" "}
                          <span className="text-3xl font-bold">
                            {applyTo === "Category"
                              ? selectedCategories.length
                              : selectedProducts.length}
                          </span>{" "}
                          {applyTo === "Category" ? "danh mục" : "sản phẩm"}
                        </Typography>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
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

              {/* Đơn tối thiểu */}
              <TextField
                label="Giá trị đơn hàng tối thiểu (đ) - để trống nếu không yêu cầu"
                type="number"
                value={minimumOrderAmount}
                onChange={(e) => setMinimumOrderAmount(e.target.value)}
                fullWidth
              />

              {/* Giới hạn lượt dùng */}
              <div className="">
                <FormControl component="fieldset">
                  <RadioGroup
                    row
                    value={usageType}
                    onChange={(e) => setUsageType(e.target.value)}
                  >
                    <FormControlLabel
                      value="UNLIMITED"
                      control={<Radio />}
                      label="Không giới hạn lượt dùng"
                    />
                    <FormControlLabel
                      value="LIMITED"
                      control={<Radio />}
                      label="Giới hạn tổng lượt dùng:"
                    />
                  </RadioGroup>
                </FormControl>

                {usageType === "LIMITED" && (
                  <TextField
                    type="number"
                    value={usageLimited}
                    onChange={(e) => setUsageLimited(e.target.value)}
                    sx={{ width: 200, mt: 2 }}
                    required
                  />
                )}
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
        </form>
      </div>
      {createPromotionMutation.isPending && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white p-6 rounded-xl flex flex-col items-center gap-3">
            <CircularProgress color="primary" />
            <p className="text-gray-700 font-medium">Đang tải lên...</p>
          </div>
        </div>
      )}
    </>
  );
}
