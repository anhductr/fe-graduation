import { useEffect, useState, useRef, useMemo } from 'react';
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
    Button
} from "@mui/material";
import { CircularProgress } from "@mui/material";
import axios from "axios";
import debounce from 'lodash.debounce';

import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import { useNavigate } from 'react-router';
import Chip from '@mui/material/Chip';
import { HiOutlineTrash } from "react-icons/hi2";
import { BiRefresh } from "react-icons/bi";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { IoRefresh } from 'react-icons/io5';
import dayjs from 'dayjs';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import 'dayjs/locale/vi';
import { viVN } from '@mui/x-date-pickers/locales';
import { useParams } from 'react-router-dom';


dayjs.locale('vi');


export default function PromotionEdit() {
    const token = localStorage.getItem("token");
    const { id } = useParams();

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [active, setActive] = useState(true);
    const [isVoucher, setIsVoucher] = useState(false);
    const [discountType, setDiscountType] = useState('DISCOUNT_PERCENT'); // percent | fixed
    const [discountPercent, setDiscountPercent] = useState('');
    const [fixedAmount, setFixedAmount] = useState('');
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [minimumOrderAmount, setMinimumOrderAmount] = useState('');
    const [usageType, setUsageType] = useState('UNLIMITED'); // unlimited | limited
    const [usageLimited, setUsageLimited] = useState(0);
    const [applyTo, setApplyTo] = useState(null);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [selectedCategoriesId, setSelectedCategoriesId] = useState([]);
    const [selectedProductsId, setSelectedProductsId] = useState([]);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [defaultPromo, setDefaultPromo] = useState(null);
    const deleteApplyTo = useRef([]);

    //xử lý xóa danh mục và spham đã chọn
    const deletedCategoryIds = useRef(new Set());
    const deletedProductIds = useRef(new Set());
    useEffect(() => {
        console.log('deleted cate ids: ', Array.from(deletedCategoryIds.current));

        // Lấy tất cả ID hiện đang chọn
        const currentIds = new Set(selectedCategories.map(cat => cat.id));

        // Duyệt qua các ID đã xóa trước đó
        for (let id of deletedCategoryIds.current) {
            // Nếu ID đó giờ lại xuất hiện trong selected → người dùng thêm lại → xóa khỏi deleted
            if (currentIds.has(id)) {
                deletedCategoryIds.current.delete(id);
            }
        }
    }, [selectedCategories]);
    useEffect(() => {
        console.log('deleted product ids: ', Array.from(deletedProductIds.current));

        // Lấy tất cả ID hiện đang chọn
        const currentIds = new Set(selectedProducts.map(prod => prod.id));

        // Duyệt qua các ID đã xóa trước đó
        for (let id of deletedProductIds.current) {
            // Nếu ID đó giờ lại xuất hiện trong selected → người dùng thêm lại → xóa khỏi deleted
            if (currentIds.has(id)) {
                deletedProductIds.current.delete(id);
            }
        }
    }, [selectedProducts]);

    const fetchPromotionById = async (promotionId, token) => {
        const res = await axios.get(`/api/v1/promotion-service/promotion/getPromotion/${promotionId}`, {
            headers: { Authorization: token ? `Bearer ${token}` : "" },
        });
        console.log('res:: ', res.data.result)
        return res.data.result;
    };

    const loadInitialProducts = async (selectedProductsId) => {
        if (selectedProductsId.length === 0) {
            setSelectedProducts([]); // Đảm bảo rỗng nếu không có ID
            return;
        }

        try {
            setLoadingProducts(true); // Nếu bạn có state loading riêng cho phần này

            const res = await axios.post(
                "/api/v1/search-service/search/admin/get-by-list-id", // Điều chỉnh prefix nếu khác
                {
                    productIds: selectedProductsId, // Mảng String ID
                    page: 1,
                    size: selectedProductsId.length + 10 // Lấy đủ hoặc dư một chút
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            console.log('Load initial products res:', res.data);

            setSelectedProducts(res.data.result.productGetVMList);
        } catch (err) {
            console.error("Lỗi load sản phẩm ban đầu theo list ID:", err);
            if (err.response) {
                console.error("Server error:", err.response.status, err.response.data);
            }
            // Nếu lỗi, vẫn giữ ID nhưng không có tên (hoặc clear nếu muốn)
            setSelectedProducts([]);
        } finally {
            setLoadingProducts(false);
        }
    };

    const loadInitialCategories = async (selectedCategoriesId) => {
        if (selectedCategoriesId.length === 0) {
            setSelectedCategories([]); // Đảm bảo rỗng nếu không có ID
            return;
        }

        try {
            setLoadingCategories(true); // Nếu bạn có state loading riêng cho phần này

            const res = await axios.post(
                "/api/v1/search-service/search/category/get-by-list-id",
                {
                    categoryIds: selectedCategoriesId, // Mảng String ID
                    page: 1,
                    size: selectedCategoriesId.length
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            console.log('Load initial cate res:', res.data);

            setSelectedCategories(res.data.result.categoryGetVM);
        } catch (err) {
            console.error("Lỗi load danh muc ban đầu theo list ID:", err);
            if (err.response) {
                console.error("Server error:", err.response.status, err.response.data);
            }
            // Nếu lỗi, vẫn giữ ID nhưng không có tên (hoặc clear nếu muốn)
            setSelectedCategories([]);
        } finally {
            setLoadingCategories(false);
        }
    };

    const {
        data: promotion,
        isLoading,
        isError,
        error,
    } = useQuery({
        queryKey: ["promo", id],
        queryFn: () => fetchPromotionById(id, token),
        enabled: !!id, // chỉ gọi khi có id
    });

    useEffect(() => {
        console.log("promo hehe:", promotion)
        if (promotion) {
            setName(promotion.name);
            setDescription(promotion.descriptions);
            setActive(promotion.active);
            setIsVoucher(promotion.voucherCode === null ? false : true);
            setDiscountType(promotion.discountType);
            if (promotion.discountType === 'DISCOUNT_PERCENT') {
                setDiscountPercent(promotion.discountPercent);
            } else {
                setFixedAmount(promotion.fixedAmount);
            }
            setStartDate(promotion.startDate ? dayjs(promotion.startDate) : null);
            setEndDate(promotion.endDate ? dayjs(promotion.endDate) : null);
            setMinimumOrderAmount(promotion.minimumOrderPurchaseAmount);
            setUsageType(promotion.usageType); // unlimited | limited
            setUsageLimited(promotion.usageLimited);
            setApplyTo(promotion.applyTo);

            if (promotion.categoryName.length > 0) {
                setSelectedCategories(promotion.categoryName);
                setSelectedCategoriesId(promotion.categoryName);
                loadInitialCategories(promotion.categoryName);
            } else if (promotion.productId.length > 0) {
                setSelectedProducts(promotion.productId);
                setSelectedProductsId(promotion.productId);
                loadInitialProducts(promotion.productId);
            }
            setDefaultPromo(promotion)
        }
    }, [promotion]);

    // useEffect(() => {
    //     console.log('prd ids: ', selectedProductsId)
    //     console.log('prd: ', selectedProducts)
    // }, [selectedProductsId, selectedProducts])


    /////////// XỬ LÝ TÌM KIẾM SẢN PHẨM ///////////

    //product
    const [productOptions, setProductOptions] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(false);
    const [inputValueProduct, setInputValueProduct] = useState('');

    const searchProducts = async (keyword) => {
        if (!keyword || keyword.trim().length < 2) return [];
        try {
            const res = await axios.post(
                "/api/v1/search-service/search/admin?page=1&size=30",
                { productName: keyword.trim() },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            console.log('search res: ', res.data.result.data)
            return res.data.result.data || [];
        } catch (err) {
            console.error("Lỗi tìm kiếm sản phẩm:", err);
            return [];
        }
    };

    // Debounce search
    const debouncedProductSearch = useMemo(
        () => debounce(async (keyword) => {
            setLoadingProducts(true);
            const results = await searchProducts(keyword);

            const formatted = results.map(item => ({
                id: item.id,
                name: item.name,
                // có thể thêm image, sku, v.v.
            }));

            setProductOptions(formatted);
            setLoadingProducts(false);
        }, 500),
        [token] // nếu token thay đổi thì tạo lại
    );

    // Khi người dùng gõ
    useEffect(() => {
        if (inputValueProduct && inputValueProduct.trim().length >= 2) {
            debouncedProductSearch(inputValueProduct);
        } else {
            // Khi xóa hoặc < 2 ký tự → vẫn giữ lại các sản phẩm đã chọn trong dropdown
            setProductOptions(
                selectedProducts.map(p => ({
                    id: p.id,
                    name: p.name,
                    price: p.price
                }))
            );
        }
    }, [inputValueProduct, selectedProducts]);

    //category
    const [categoryOptions, setCategoryOptions] = useState([]);
    const [loadingCategories, setLoadingCategories] = useState(false);
    const [inputValueCategory, setInputValueCategory] = useState('');

    const searchCategories = async (keyword) => {
        if (!keyword || keyword.trim().length < 2) return [];

        try {
            const res = await axios.post(
                "/api/v1/search-service/search/category/admin",
                {
                    name: keyword.trim(),
                    page: 0,     // bạn đang fix page = 1
                    size: 10     // bạn muốn lấy tối đa 30 kết quả
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            console.log('search cate res: ', res.data);

            // Giả sử CategoryGetListVM có field 'data' chứa mảng category
            // Nếu cấu trúc khác (ví dụ result trực tiếp là list), bạn có thể điều chỉnh
            return res.data.result.categoryGetVM || [];
        } catch (err) {
            // Nếu là lỗi từ Axios (có response từ server)
            if (err.response) {
                // Server trả về lỗi (4xx, 5xx)
                console.error("Lỗi tìm kiếm category - Server response:", {
                    status: err.response.status,
                    statusText: err.response.statusText,
                    data: err.response.data,          // Thường chứa message chi tiết từ backend
                    headers: err.response.headers,
                });

                // Ví dụ: nếu backend dùng ApiResponse với code != 200
                if (err.response.data?.message) {
                    console.error("Message từ server:", err.response.data.message);
                }
            }
            // Lỗi request không gửi được (mạng, CORS, timeout,...)
            else if (err.request) {
                console.error("Lỗi tìm kiếm category - Không nhận được response:", err.request);
            }
            // Lỗi khác (cấu hình axios sai, v.v.)
            else {
                console.error("Lỗi tìm kiếm category - Setup request lỗi:", err.message);
            }

            // Bạn vẫn có thể log full error object để debug sâu hơn nếu cần
            console.error("Full error object:", err);

            return [];
        };
    }

    // Debounce search
    const debouncedCateSearch = useMemo(
        () => debounce(async (keyword) => {
            setLoadingCategories(true);
            const results = await searchCategories(keyword);

            const formatted = results.map(item => ({
                id: item.id,
                name: item.name,
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
            // Khi xóa hoặc < 2 ký tự → vẫn giữ lại các sản phẩm đã chọn trong dropdown
            setCategoryOptions(
                selectedCategories.map(p => ({
                    id: p.id,
                    name: p.name,
                }))
            );
        }
    }, [inputValueCategory, selectedCategories]);


    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const editPromotion = async ({
        token,
        body
    }) => {
        // PUT update product info
        const res = await axios.put(
            "/api/v1/promotion-service/promotion/update",
            {
                id: body.id,
                name: body.name,
                description: body.description,
                discountType: body.discountType,
                usageType: body.usageType,
                applyTo: body.applyTo,
                discountPercent: body.discountPercent,
                fixedAmount: body.fixedAmount,
                usageLimited: body.usageLimited,
                minimumOrderPurchaseAmount: body.minimumOrderPurchaseAmount,
                startDate: body.startDate,
                endDate: body.endDate,
                active: body.active,
                productId: body.productId,
                categoryId: body.categoryId,
                deleteApplyTo: body.deleteApplyTo
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: token ? `Bearer ${token}` : "",
                },
            }
        );

        return res.data;
    };



    //form
    const editMutation = useMutation({
        mutationFn: editPromotion,
        onSuccess: () => {
            queryClient.invalidateQueries(["promotions"]);
            navigate("/promotion", {
                state: {
                    popup: {
                        open: true,
                        severity: "success",
                        message: "Cập nhật khuyến mãi thành công!",
                        vertical: "top",
                        horizontal: "center",
                    },
                },
            });
        },
        onError: (err) => {
            if (err.response) {
                console.error("📡 Status:", err.response.status);
                console.error("📩 Response data:", err.response);
                console.error("📑 Headers:", err.response.headers);
            } else if (err.request) {
                console.error("🕓 Không nhận được phản hồi từ server. Request:", err.request);
            } else {
                console.error("❌ Lỗi xảy ra khi setup request:", err.message);
            }
            navigate("/promotion", {
                state: {
                    popup: {
                        open: true,
                        severity: "error",
                        message: err.response?.data?.message || "Cập nhật sản khuyến mãi bại!",
                        vertical: "top",
                        horizontal: "center",
                    },
                },
            });
        },
    });

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validate cơ bản
        if (!name?.trim()) return alert("Vui lòng nhập tên khuyến mãi");
        if (!discountType) return alert("Vui lòng chọn loại giảm giá");
        if (!applyTo) return alert("Vui lòng chọn đối tượng áp dụng");

        if (applyTo !== defaultPromo.applyTo) {
            if (applyTo === 'Category') {
                deleteApplyTo.current = defaultPromo.productId.length > 0 ? Array.from(defaultPromo.productId) : [];
            } else if (applyTo === 'Product') {
                deleteApplyTo.current = defaultPromo.categoryName.length > 0 ? Array.from(defaultPromo.categoryId) : [];
            }
        } else {
            if (applyTo === 'Category') {
                deleteApplyTo.current = Array.from(deletedCategoryIds.current);
            } else if (applyTo === 'Product') {
                deleteApplyTo.current = Array.from(deletedProductIds.current);
            }
        }

        let newCategoryIds;
        let newProductIds;

        if (applyTo === 'Product') {
            newProductIds = selectedProductsId.filter(
                item => !defaultPromo.productId.includes(item)
            );
            console.log('new selected product ids:', newProductIds);
        } else if (applyTo === 'Category') {
            newCategoryIds = selectedCategoriesId.filter(
                item => !defaultPromo.categoryName.includes(item)
            );
            console.log('new selected category ids:', newCategoryIds);
        }


        const payload = {
            id: id,
            name: name.trim(),
            description: description?.trim() || null,

            discountType: discountType,           // "DISCOUNT_PERCENT" | "FIXED_AMOUNT"
            usageType: usageType,

            applyTo: applyTo,                     // "User" | "Category" | "Product"

            // Số liệu 
            discountPercent: discountType === 'DISCOUNT_PERCENT' ? Number(discountPercent) || 0 : 0,
            fixedAmount: discountType === 'FIXED_AMOUNT' ? Number(fixedAmount) || 0 : 0,
            usageLimited: usageType === 'LIMITED' ? Number(usageLimited) || 0 : 0,
            minimumOrderPurchaseAmount: minimumOrderAmount ? Number(minimumOrderAmount) : null,

            // Date 
            startDate: startDate ? startDate.toISOString() : null,
            endDate: endDate ? endDate.toISOString() : null,

            active: active,

            productId: applyTo === 'Product'
                ? newProductIds
                : null,

            categoryId: applyTo === 'Category'
                ? newCategoryIds
                : null,

            deleteApplyTo: deleteApplyTo.current.length > 0 ? deleteApplyTo.current : null,
        };

        console.log("Payload gửi đi:", payload); // <<<<< CHECK CÁI NÀY TRONG CONSOLE!!!

        editMutation.mutate({ token, body: payload });
    };

    // const handleSubmit = (e) => {
    //     e.preventDefault();

    //     // Validation như cũ
    //     if (name === null) {
    //         alert("Vui lòng thêm tên khuyến mãi!");
    //         return;
    //     }
    //     if (description === null) {
    //         alert("Vui lòng thêm mô tả khuyến mãi");
    //         return;
    //     }
    //     if (discountType === null) {
    //         alert("Vui lòng chọn loại giảm giá");
    //         return;
    //     }
    //     if (usageType === null) {
    //         alert("Vui lòng chọn loại sử dụng");
    //         return;
    //     }
    //     if (applyTo === null) {
    //         alert("Vui lòng chọn đối tượng giảm giá");
    //         return;
    //     }

    //     const payload = {
    //         name: name.trim(),
    //         descriptions: description.trim(),
    //         discountType: discountType,
    //         usageType: usageType,
    //         applyTo: applyTo,
    //         discountPercent: discountPercent,
    //         fixedAmount: fixedAmount,
    //         usageLimited: usageLimited,
    //         minimumOrderPurchaseAmount: minimumOrderAmount,
    //         startDate: startDate,
    //         endDate: endDate,
    //         active: active,
    //         isVoucher: isVoucher,
    //         // Chỉ gửi đúng trường theo applyTo
    //         ...(applyTo === 'Product' && {
    //             productId: selectedProducts.map(p => p.id)
    //         }),
    //         ...(applyTo === 'Category' && {
    //             categoryId: selectedCategories.map(c => c.id)
    //         })
    //     };

    //     // Gửi dữ liệu qua mutation
    //     createPromotionMutation.mutate(payload);
    // };

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
                <div className='flex justify-between items-center my-4'>
                    <h3 className="text-[30px] font-bold mb-4 text-[#403e57]">
                        Thêm chương trình giảm giá
                    </h3>
                </div>

                <form className='flex flex-col gap-3' onSubmit={handleSubmit}>
                    <div className="flex flex-wrap shadow border-0 px-3 py-6 my-[10px] px-[5px] mx-[0px] bg-white rounded-[10px] gap-10">
                        <div className="w-screen px-4 py-2 font-semibold text-gray-900 text-[20px]">
                            Thông tin cơ bản
                        </div>

                        <div className='w-full flex gap-7 mx-2'>
                            <div className='w-[200px] flex justify-end'>
                                <h6 className="text-[18px]">Tên khuyến mãi</h6>
                            </div>

                            <div className='w-full pr-[53px]'>
                                <input value={name} onChange={(e) => setName(e.target.value)} type='text' className="bg-[#fafafa] pl-[15px] rounded-[5px] text-[15px] w-full h-[40px] border-[rgba(0,0,0,0.1)] border border-solid"></input>
                            </div>
                        </div>

                        <div className='w-full flex gap-7 mx-2'>
                            <div className='w-[200px] flex justify-end'>
                                <h6 className="text-[18px]">Mô tả khuyến mãi</h6>
                            </div>

                            <div className='w-full pr-[53px]'>
                                <textarea value={description}
                                    onChange={(e) => setDescription(e.target.value)} className="bg-[#fafafa] pt-[15px] pl-[15px] rounded-[5px] text-[15px] w-full h-[118px] border-[rgba(0,0,0,0.1)] border border-solid" rows={5} cols={10}></textarea>
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

                        <div className='w-full flex gap-7 mx-2'>
                            <div className='w-[200px] flex justify-end'>
                                <h6 className="text-[18px]">Trạng thái</h6>
                            </div>

                            <div className='w-full pr-[53px]'>
                                <Switch
                                    checked={active}
                                    onChange={(e) => setActive(e.target.checked)}
                                    color="primary"
                                />
                                <span className={active ? 'text-green-600 font-medium' : 'text-gray-500'}>
                                    {active ? 'Kích hoạt ngay' : 'Chưa kích hoạt'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap shadow border-0 px-3 py-6 my-[10px] px-[5px] mx-[0px] bg-white rounded-[10px] gap-5">
                        <div className="w-screen px-4 py-2 font-semibold text-gray-900 text-[20px]">
                            Loại giảm giá & Giá trị
                        </div>

                        <div className='w-full ml-[30px]'>
                            <Box sx={{
                                '& .MuiFormControlLabel-label': {
                                    fontSize: '18px'
                                },
                                '& .MuiRadio-root': {
                                    transform: 'scale(1.3)',
                                    marginRight: '8px'
                                }
                            }}>
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
                            {discountType === 'DISCOUNT_PERCENT' ? (
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
                                                '& .MuiInputBase-input': { fontSize: '18px', height: '28px' },
                                                '& .MuiOutlinedInput-root': { borderRadius: '12px' }
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
                                                '& .MuiInputBase-input': { fontSize: '18px', height: '28px' },
                                                '& .MuiOutlinedInput-root': { borderRadius: '12px' }
                                            }}
                                            placeholder="Ví dụ: 200000"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>


                    <div className="flex flex-wrap shadow border-0 px-3 py-6 my-[10px] px-[5px] mx-[0px] bg-white rounded-[10px] gap-5">
                        <div className="w-screen px-4 py-2 font-semibold text-gray-900 text-[20px]">
                            Điều kiện áp dụng
                        </div>

                        <div className='w-full flex mx-[30px]'>
                            <div className='w-[40%]'>
                                <RadioGroup value={applyTo} onChange={(e) => setApplyTo(e.target.value)}>
                                    <FormControlLabel value="User" control={<Radio />} label="Áp dụng cho người dùng" />
                                    <FormControlLabel value="Category" control={<Radio />} label="Chỉ áp dụng cho một số danh mục" />
                                    <FormControlLabel value="Product" control={<Radio />} label="Chỉ áp dụng cho sản phẩm cụ thể" />
                                </RadioGroup>
                            </div>

                            {/* HIỂN THỊ KHI CHỌN DANH MỤC HOẶC SẢN PHẨM */}
                            {(applyTo === 'Category' || applyTo === 'Product') && (
                                <div className="w-[60%] p-6 bg-gradient-to-r from-[#4a2fcf10] to-[#6440f510] border-2 border-[#4a2fcf] rounded-2xl">
                                    {/* from-[#4a2fcf10] = #4a2fcf với độ trong suốt 6% → nền nhẹ nhàng */}

                                    <Typography
                                        variant="h6"
                                        className="font-bold text-xl pb-5"
                                        sx={{ color: '#4a2fcf' }}   // chữ tím đậm
                                    >
                                        {applyTo === 'Category' ? 'Chọn danh mục áp dụng' : 'Chọn sản phẩm áp dụng'}
                                    </Typography>

                                    {applyTo === 'Category' ? (
                                        <Box sx={{ width: '100%' }}>
                                            {/* Thanh tìm kiếm sản phẩm */}
                                            <Autocomplete
                                                multiple
                                                options={categoryOptions}
                                                getOptionLabel={(option) => `${option.name}`}
                                                loading={loadingCategories}
                                                inputValue={inputValueCategory}
                                                onInputChange={(e, newInputValue) => setInputValueCategory(newInputValue)} // Quan trọng!
                                                value={selectedCategories}
                                                onChange={(e, newValue) => {
                                                    const updated = newValue || [];
                                                    setSelectedCategories(updated);
                                                    setSelectedCategoriesId(updated.map(item => String(item.id)));
                                                }}
                                                filterSelectedOptions
                                                noOptionsText="Không tìm thấy sản phẩm"
                                                isOptionEqualToValue={(option, value) => option.id === value.id}
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
                                                                    {loadingCategories && <CircularProgress color="inherit" size={20} />}
                                                                    {params.InputProps.endAdornment}
                                                                </>
                                                            ),
                                                        }}
                                                        sx={{
                                                            '& .MuiInputBase-input': { fontSize: '15px' },
                                                            '& .MuiInputLabel-root': {
                                                                fontSize: '15px',
                                                                color: '#4a2fcf',
                                                                '&.Mui-focused': { color: '#4a2fcf' }
                                                            },
                                                            '& .MuiOutlinedInput-root': {
                                                                '& fieldset': { borderColor: '#4a2fcf' },
                                                                '&:hover fieldset': { borderColor: '#4a2fcf' },
                                                                '&.Mui-focused fieldset': { borderColor: '#4a2fcf', borderWidth: 2 }
                                                            },
                                                            '& .MuiAutocomplete-tag': { display: 'none' }
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

                                            {/* Danh sách danh mục đã chọn */}
                                            {selectedCategories.length > 0 && (
                                                <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                                    {selectedCategories.map((option) => (
                                                        <Chip
                                                            key={option.id}
                                                            label={`${option.name}`}
                                                            size="medium"
                                                            onDelete={() => {
                                                                deletedCategoryIds.current.add(option.id);
                                                                setSelectedCategories(prev =>
                                                                    prev.filter(item => item.id !== option.id)
                                                                );

                                                                setSelectedCategoriesId(prev => prev.filter(id => id !== String(option.id)));
                                                            }}
                                                            sx={{
                                                                backgroundColor: '#4a2fcf',
                                                                color: 'white',
                                                                fontSize: '13px',
                                                                height: 40,
                                                                fontWeight: 600,
                                                                '& .MuiChip-deleteIcon': {
                                                                    color: 'white',
                                                                    '&:hover': { color: 'rgba(255,255,255,0.8)' }
                                                                }
                                                            }}
                                                        />
                                                    ))}
                                                </Box>
                                            )}
                                            {selectedCategories.length > 0 && (
                                                <Button
                                                    size="small"
                                                    sx={{ mt: 2 }}
                                                    onClick={() => {
                                                        selectedCategories.forEach(cat => {
                                                            deletedCategoryIds.current.add(cat.id);
                                                        });
                                                        setSelectedCategories([])
                                                    }}
                                                >
                                                    Xóa tất cả danh mục
                                                </Button>
                                            )}
                                        </Box>
                                    ) : (
                                        <Box sx={{ width: '100%' }}>
                                            {/* Thanh tìm kiếm sản phẩm */}
                                            <Autocomplete
                                                multiple
                                                options={productOptions}
                                                getOptionLabel={(option) => `${option.name}`}
                                                loading={loadingProducts}
                                                inputValue={inputValueProduct}
                                                onInputChange={(e, newInputValue) => setInputValueProduct(newInputValue)} // Quan trọng!
                                                value={selectedProducts}
                                                onChange={(e, newValue) => {
                                                    const updated = newValue || [];
                                                    setSelectedProducts(updated);
                                                    setSelectedProductsId(updated.map(item => String(item.id)));
                                                }}
                                                filterSelectedOptions
                                                noOptionsText="Không tìm thấy sản phẩm"
                                                isOptionEqualToValue={(option, value) => option.id === value.id}
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
                                                                    {loadingProducts && <CircularProgress color="inherit" size={20} />}
                                                                    {params.InputProps.endAdornment}
                                                                </>
                                                            ),
                                                        }}
                                                        sx={{
                                                            '& .MuiInputBase-input': { fontSize: '15px' },
                                                            '& .MuiInputLabel-root': {
                                                                fontSize: '15px',
                                                                color: '#4a2fcf',
                                                                '&.Mui-focused': { color: '#4a2fcf' }
                                                            },
                                                            '& .MuiOutlinedInput-root': {
                                                                '& fieldset': { borderColor: '#4a2fcf' },
                                                                '&:hover fieldset': { borderColor: '#4a2fcf' },
                                                                '&.Mui-focused fieldset': { borderColor: '#4a2fcf', borderWidth: 2 }
                                                            },
                                                            '& .MuiAutocomplete-tag': { display: 'none' }
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
                                                <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                                    {selectedProducts.map((option) => (
                                                        <Chip
                                                            key={option.id}
                                                            label={`${option.name}`}
                                                            size="medium"
                                                            onDelete={() => {
                                                                deletedProductIds.current.add(option.id);
                                                                setSelectedProducts(prev =>
                                                                    prev.filter(item => item.id !== option.id)
                                                                );

                                                                setSelectedProductsId(prev => prev.filter(id => id !== String(option.id)));

                                                            }}
                                                            sx={{
                                                                backgroundColor: '#4a2fcf',
                                                                color: 'white',
                                                                fontSize: '13px',
                                                                height: 40,
                                                                fontWeight: 600,
                                                                '& .MuiChip-deleteIcon': {
                                                                    color: 'white',
                                                                    '&:hover': { color: 'rgba(255,255,255,0.8)' }
                                                                }
                                                            }}
                                                        />
                                                    ))}
                                                </Box>
                                            )}
                                            {selectedProducts.length > 0 && (
                                                <Button
                                                    size="small"
                                                    sx={{ mt: 2 }}
                                                    onClick={() => {
                                                        selectedProducts.forEach(product => {
                                                            deletedProductIds.current.add(product.id);
                                                        });
                                                        setSelectedProducts([]);
                                                    }}
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
                                                color: '#4a2fcf',
                                                fontWeight: 700,
                                                fontSize: '1.1rem'
                                            }}
                                        >
                                            Đã chọn:{' '}
                                            <span className="text-3xl font-bold">
                                                {applyTo === 'Category' ? selectedCategories.length : selectedProducts.length}
                                            </span>{' '}
                                            {applyTo === 'Category' ? 'danh mục' : 'sản phẩm'}
                                        </Typography>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-wrap shadow border-0 px-3 py-6 my-[10px] px-[5px] mx-[0px] bg-white rounded-[10px] gap-5">
                        <div className="w-screen px-4 py-2 font-semibold text-gray-900 text-[20px]">
                            Giới hạn, thời gian & mã giảm giá
                        </div>
                        <div className='w-full flex flex-col gap-5 mx-5'>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="vi" localeText={viVN.components.MuiLocalizationProvider.defaultProps.localeText}>
                                    {/* Từ ngày giờ */}
                                    <DateTimePicker
                                        label="Từ ngày"
                                        value={startDate}
                                        onChange={(newValue) => setStartDate(newValue)}
                                        format="DD/MM/YYYY HH:mm"
                                        slotProps={{
                                            textField: {
                                                sx: { width: '100%' },
                                            },
                                            actionBar: { actions: ['clear', 'cancel', 'accept'] },
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
                                                sx: { width: '100%' },
                                            },
                                            actionBar: { actions: ['clear', 'cancel', 'accept'] },
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
                                    <RadioGroup row value={usageType} onChange={(e) => setUsageType(e.target.value)}>
                                        <FormControlLabel value="UNLIMITED" control={<Radio />} label="Không giới hạn lượt dùng" />
                                        <FormControlLabel value="LIMITED" control={<Radio />} label="Giới hạn tổng lượt dùng:" />
                                    </RadioGroup>
                                </FormControl>

                                {usageType === 'LIMITED' && (
                                    <TextField
                                        type="number"
                                        value={usageLimited}
                                        onChange={(e) => setUsageLimited(e.target.value)}
                                        sx={{ width: 200, mt: 2 }}
                                        required
                                    />
                                )}
                            </div>

                            {/* Mã giảm giá */}
                            <div>
                                <FormControl component="fieldset">
                                    <RadioGroup row value={isVoucher} onChange={(e) => setIsVoucher(e.target.value === 'true')}>
                                        <FormControlLabel value={false} control={<Radio />} label="Không cần mã (tự động áp dụng)" />
                                        <FormControlLabel value={true} control={<Radio />} label="Khách phải nhập mã" />
                                    </RadioGroup>
                                </FormControl>
                            </div>
                        </div>
                    </div>

                    <div className='!w-full px-[60px] py-[30px]'>
                        <Button variant="contained" type='submit' className='!w-full !flex !items-cnter !justify-center !gap-2 !p-[15px] !bg-gradient-to-r !from-[#4a2fcf] !to-[#6440F5]'>
                            <FaCloudUploadAlt className='text-[35px]' />
                            <h3 className='text-[25px]'>Tải lên</h3>
                        </Button>
                    </div>
                </form>
            </div>
            {editMutation.isPending && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white p-6 rounded-xl flex flex-col items-center gap-3">
                        <CircularProgress color="primary" />
                        <p className="text-gray-700 font-medium">Đang tải lên...</p>
                    </div>
                </div>
            )}
        </>
    )
}

