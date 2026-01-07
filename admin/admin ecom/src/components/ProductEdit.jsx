import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { useEffect, useState, useRef } from 'react';
import Button from '@mui/material/Button';
import { FaCloudUploadAlt } from "react-icons/fa";
import {
    Box,
    IconButton,
    Popover,
    TextField,
} from "@mui/material";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import CloseIcon from "@mui/icons-material/Close";
import { BsPlusSquare } from "react-icons/bs";
import { ListItemText } from "@mui/material";
import Checkbox from '@mui/material/Checkbox';
import axios from 'axios';
import { FaPlus } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { useNavigate } from 'react-router';
import { useParams } from 'react-router-dom';
import Chip from '@mui/material/Chip';
import {
    DndContext,
    useSensor,
    useSensors,
    MouseSensor,
    TouchSensor,
    closestCenter,
} from "@dnd-kit/core";

import {
    SortableContext,
    useSortable,
    arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { HiOutlineTrash } from "react-icons/hi2";
import { BiRefresh } from "react-icons/bi";
import { IoMdInformationCircle } from "react-icons/io";
import React from 'react';
import { HiOutlinePlus } from "react-icons/hi2";
import { IoMdArrowDropdown } from "react-icons/io";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CircularProgress } from "@mui/material";
import { IoMdClose } from "react-icons/io";
import TextEditor from './TextEditor';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';

const extensions = [
    StarterKit.configure({
        heading: false,
        blockquote: false,
        codeBlock: false,
        horizontalRule: false,
    }),
    Placeholder.configure({
        placeholder: 'Nhập mô tả sản phẩm...',  // Tùy chỉnh chữ ở đây
    }),
];

export default function ProductEdit() {
    const { id } = useParams(); // lấy cate.id từ URL
    const token = localStorage.getItem("token");
    const navigate = useNavigate();

    const [cate, setCate] = useState('');
    const [name, setName] = useState('');
    const [video, setVideo] = useState('');
    const [description, setDescription] = useState('');
    const [avgRating, setAvgRating] = useState(0);
    const [imageList, setImageList] = useState([]);
    const [listCategoryId, setListCategoryId] = useState([]);
    const [specifications, setSpecifications] = useState([]);
    const [listThumbnails, setListThumbnails] = useState([{ file: null, preview: "" }]);
    const [brandName, setBrandName] = useState('');

    const action = useRef([]); // để lưu action hiện tại (thêm/sửa)
    const [listVariants, setListVariants] = useState([{
        variantName: '',
        price: '',
    }]);
    const [changedThumbnails, setChangedThumbnails] = useState([]);
    const [deletedVariants, setDeletedVariants] = useState([]);
    const [thumbnailsToDelete, setThumbnailsToDelete] = useState([]);

    //xử lý variant
    // Thêm hàm addVariant để thêm phiên bản mới
    const addVariant = () => {
        setListVariants(prev => [...prev, {
            action: 'CREATE',
            variantName: '',
            price: '',
            color: '',
        }]);
        setListThumbnails(prev => [...prev, { file: null, preview: "" }]);
    };

    // Thêm hàm removeVariant để xóa phiên bản theo index (giữ ít nhất 1)
    const removeVariant = (index) => {
        const varToRemove = listVariants[index];

        if (varToRemove.action === 'CREATE' || !varToRemove.sku) {
            // Variant mới → xóa local
            setListVariants(prev => prev.filter((_, i) => i !== index));

            setListThumbnails(prev => {
                const next = prev.filter((_, i) => i !== index);
                if (prev[index]?.preview?.startsWith('blob:')) {
                    URL.revokeObjectURL(prev[index].preview);
                }
                return next;
            });

            setChangedThumbnails(prev => prev
                .filter(item => item.index !== index)
                .map(item => item.index > index ? { ...item, index: item.index - 1 } : item)
            );

        } else {
            // Variant cũ
            const sku = varToRemove.sku;

            setThumbnailsToDelete(prev => {
                if (prev.some(item => item.ownerId === sku)) return prev;
                return [...prev, { sku, ownerId: sku }];
            });

            setDeletedVariants(prev => [...prev, { sku, action: 'DELETE' }]);

            setListVariants(prev => prev.filter((_, i) => i !== index));

            setListThumbnails(prev => {
                const next = prev.filter((_, i) => i !== index);
                if (prev[index]?.preview?.startsWith('blob:')) {
                    URL.revokeObjectURL(prev[index].preview);
                }
                return next;
            });

            setChangedThumbnails(prev => prev
                .filter(item => item.index !== index)
                .map(item => item.index > index ? { ...item, index: item.index - 1 } : item)
            );
        }
    };

    // Thay thế handleVariantChange để hỗ trợ theo index
    const handleVariantChange = (index, e) => {
        const { name, value } = e.target;
        setListVariants(prev => {
            const next = [...prev];
            next[index] = {
                ...next[index],
                [name]: value
            };
            if (!next[index].action && next[index].sku) {
                next[index].action = 'UPDATE';
            }
            return next;
        });
    };

    const [basicInfoToggle, setBasicInfoToggle] = useState(true)
    const [sellingInfoToggle, setSellingInfoToggle] = useState(true)
    const [specificationToggle, setSpecificationToggle] = useState(false)

    //description
    const editor = useEditor({
        extensions,
        content: description,
        onUpdate: ({ editor }) => {
            setDescription(editor.getHTML()); // Vẫn lưu HTML string
        },
        editorProps: {
            attributes: {
                class: 'prose prose-sm focus:outline-none min-h-[118px] pt-[15px] pl-[15px] pr-[15px] bg-[#fafafa] rounded-[5px] border border-solid border-[rgba(0,0,0,0.1)] [&_ul]:list-disc [&_ul>li::marker]:text-gray-800 [&_ul]:pl-6',
            },
        },
    });

    // Đồng bộ lại content khi description thay đổi từ onUpdate
    useEffect(() => {
        if (editor && description !== editor.getHTML() && !editor.isDestroyed) {
            editor.commands.setContent(description, false);
        }
    }, [description, editor]);

    const fetchProductById = async (id, token) => {
        const res = await axios.get(`/api/v1/product-service/product/${id}`, {
            headers: { Authorization: token ? `Bearer ${token}` : "" },
        });
        return res.data.result;
    };

    const {
        data: product,
        isLoading,
        isError,
        error,
    } = useQuery({
        queryKey: ["product", id],
        queryFn: () => fetchProductById(id, token),
        enabled: !!id, // chỉ gọi khi có id
    });

    useEffect(() => {
        console.log("product hehe:", product)
        if (product) {
            setName(product.name);
            setDescription(product.description);
            setAvgRating(product.avgRating);
            setListVariants(product.variantsResponses || []);
            setListCategoryId(product.listCategory.map(cate => cate.id));
            setSpecifications(groupSpecifications(product.specifications));
            setVideo(product.videoUrl);
            setBrandName(product.brandName);
            setImageList((prev) => {
                const updated = [...prev];
                product.mediaList.filter((file) => file.mediaPurpose === "GALLERY").forEach((file, index) => {
                    if (file.url) {
                        updated[index] = {
                            file: null, // không cần file thực
                            id: file.id,
                            ownerId: file.ownerId,
                            url: file.url,
                        };
                    }
                });
                return updated;
            });
            setListThumbnails(
                (product.variantsResponses || []).map(variant => ({
                    file: null,                    // không có file mới
                    preview: variant.thumbnail || ""  // lấy URL thumbnail từ backend
                }))
            );


        }
    }, [product]);

    useEffect(() => {
        const fetchCates = async () => {
            try {
                const res = await axios.get(
                    "/api/v1/product-service/category/getAll",
                    {
                        headers: {
                            Authorization: token ? `Bearer ${token}` : "",
                        },
                    }
                );
                const mapped = {};
                res.data.result
                    .filter((cate) => cate.id !== id) // bỏ cate hiện tại
                    .forEach((cate) => {
                        mapped[cate.name] = cate.id;
                    });

                setCate(mapped);
            } catch (err) {
                console.error("Lỗi khi gọi API:", err);
            }
        };

        fetchCates();
    }, []);

    //// xem dữ liệu //// 
    // useEffect(() => {
    //     console.log({
    //         name,
    //         description,
    //         listPrice,
    //         quantity,
    //         avgRating,
    //         sold,
    //         color,
    //         listCategoryId,
    //         specifications,
    //         video
    //     });
    // }, [
    //     name,
    //     description,
    //     listPrice,
    //     quantity,
    //     avgRating,
    //     sold,
    //     color,
    //     listCategoryId,
    //     specifications,
    //     video
    // ]);

    // useEffect(() => {
    //     console.log("variants: ", listVariants);
    // }, [listVariants]);

    // useEffect(() => {
    //     console.log("list thumbnail: ", listThumbnails);
    // }, [listThumbnails]);

    // useEffect(() => {
    //     console.log("changed thumbnail lists: ", changedThumbnails);
    // }, [changedThumbnails]);

    useEffect(() => {
        console.log("listVariants: ", listVariants);
    }, [listVariants]);

    //thumbnail function
    const handleVariantThumbnailChange = (index, e) => {
        const file = e.target.files[0];
        if (file) {
            const oldPreview = listThumbnails[index].preview || "";
            const isBlob = oldPreview.startsWith('blob:');
            const oldUrl = isBlob ? null : oldPreview; // nếu là blob → variant mới, oldUrl = null

            // Thu hồi blob cũ nếu có
            if (isBlob) URL.revokeObjectURL(oldPreview);

            const preview = URL.createObjectURL(file);

            // Xác định đây là variant mới hay cũ
            const isNewVariant = !listVariants[index].id && !listVariants[index].sku;
            // hoặc dùng: !oldUrl → nếu không có URL từ backend → là variant mới

            setChangedThumbnails(prev => {
                const filtered = prev.filter(item => item.index !== index);
                return [...filtered, {
                    index,
                    oldUrl,
                    newFile: file,
                    isNewVariant
                }];
            });

            setListThumbnails(prev => {
                const next = [...prev];
                next[index] = { file, preview };
                return next;
            });

            e.target.value = "";
        }
    };

    // const handleVariantThumbnailRemove = (index, e) => {
    //     e.stopPropagation();
    //     setListThumbnails(prev => {
    //         const next = [...prev];
    //         if (next[index].preview) URL.revokeObjectURL(next[index].preview);
    //         next[index] = { file: null, preview: "" };
    //         return next;
    //     });
    //     // Reset input
    //     document.getElementById(`thumbnail-input-${index}`).value = "";
    // };

    const openVariantThumbnailPicker = (index) => {
        document.getElementById(`thumbnail-input-${index}`).click();
    };

    // dọn dẹp blob khi unmount
    useEffect(() => {
        return () => {
            listThumbnails.forEach(thumb => {
                if (thumb.preview) URL.revokeObjectURL(thumb.preview);
            });
        };
    }, [listThumbnails]);

    // 👉 Xóa slot ảnh theo vị trí
    const removeImageSlot = (index) => {
        setImageList((prev) => prev.filter((_, i) => i !== index));
    };
    const fileInputRef = useRef(null);
    const currentIndexRef = useRef(null); // index slot hiện tại
    const urlRef = useRef(new Set()); // để track và revoke sau

    //img
    // Mở file picker cho slot idx
    const openImgFilePicker = (idx) => {
        currentIndexRef.current = idx;
        // reset value để chọn cùng file nữa vẫn trigger change
        if (fileInputRef.current) fileInputRef.current.value = "";
        fileInputRef.current?.click();
    };

    // Khi chọn file
    const handleImgFileSelect = (e) => {
        const file = e.target.files?.[0];
        const idx = currentIndexRef.current;

        if (!file) {
            // Người dùng ấn cancel → không làm gì cả
            currentIndexRef.current = null;
            return;
        }

        // Nếu đang thêm mới (ấn dấu +)
        if (idx === imageList.length) {
            // Thêm slot trước khi gán file
            setImageList((prev) => [...prev, { id: null, ownerId: null, file: null, url: null }]);
        }

        const url = URL.createObjectURL(file);

        action.current.push({ type: "upload", file: file, productId: id, url: url });

        urlRef.current.add(url);

        setImageList((prev) => {
            const next = [...prev];
            next[idx] = { id: null, ownerId: null, file, url };
            return next;
        });

        e.target.value = "";
    };


    // Xóa ảnh tại slot idx
    const handleImgFileRemove = (e, idx) => {
        e.stopPropagation();
        action.current.push({ type: "delete", url: imageList[idx].url, index: idx, fileName: imageList[idx].file?.name });
        // console.log("action after drag end: ", action.current);
        setImageList((prev) => {
            const next = [...prev];
            if (next[idx]?.url) {
                URL.revokeObjectURL(next[idx].url);
                urlRef.current.delete(next[idx].url);
            }
            next[idx] = { file: null, url: "" };
            return next;
        });
    };

    // cleanup on unmount: revoke tất cả url còn lại
    useEffect(() => {
        return () => {
            urlRef.current.forEach((url) => URL.revokeObjectURL(url));
            urlRef.current.clear();
        };
    }, []);


    // useEffect(() => {
    //     console.log("action: ", action.current);
    // }, [imageList]);

    //xử lý kéo thả ảnh
    // --- DND kit setup ---
    const sensors = useSensors(useSensor(MouseSensor), useSensor(TouchSensor))

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;
        const oldIndex = +active.id;
        const newIndex = +over.id;

        action.current.push({ type: "reorder", imageId: imageList[oldIndex].id, oldPosition: oldIndex + 1, newPosition: newIndex + 1, url: imageList[oldIndex].url });

        setImageList((prev) => {
            return arrayMove(prev, oldIndex, newIndex); // di chuyển và animation tự động
        });
    };


    function SortableImage({ id, img, onClick }) {
        const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
            useSortable({ id });

        const style = {
            transform: CSS.Transform.toString(transform),
            transition, // 🪄 DnD kit tự quản lý animation
            zIndex: isDragging ? 999 : undefined,
            opacity: isDragging ? 0.7 : 1,
            width: 135,
            height: 135,
            border: "2px dashed #aaa",
            borderRadius: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            overflow: "hidden",
            cursor: img.url ? "grab" : "pointer",
            background: "#fff",
        };
        return (
            <div ref={setNodeRef} style={style} {...attributes} {...listeners} onClick={onClick}>
                <div className="group w-full h-full">
                    <img
                        src={img.url}
                        alt={`slot-${id}`}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                </div>
            </div>
        );
    }


    //các biến cho video
    const anchorRef = useRef(null);
    const [anchorVid, setAnchorVid] = useState(null);     // anchor cho popover
    const [tempVid, setTempVid] = useState("");

    //video function
    const handleVidOpen = () => {
        setAnchorVid(anchorRef.current);
        setTempVid(video || ""); // show hiện có nếu muốn edit
    }

    const handleVidClose = () => {
        setAnchorVid(null);
        setTempVid("");
    };

    const handleVidRemove = (e) => {
        e.stopPropagation(); // ngăn open popover khi click nút xóa
        setVideo("");
    };


    const handleAddLinkVid = () => {
        if (!tempVid) {
            handleVidClose();
            return;
        }
        setVideo(tempVid);
        handleVidClose();
    };

    const getYouTubeId = (url) => {
        const regExp = /(?:youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*)/;
        const match = url.match(regExp);
        return match && match[1].length === 11 ? match[1] : null;
    };


    useEffect(() => {
        console.log("specifications: ", specifications)
    }, [specifications]);


    //thể loại
    const handleListCategoryChange = (event) => {
        setListCategoryId(event.target.value);
    };

    useEffect(() => {
        const fetchAllCategories = async () => {
            try {
                const token = localStorage.getItem("token"); // lấy token nếu cần
                const res = await axios.get(
                    "/api/v1/product-service/category/getAll",
                    {
                        headers: {
                            Authorization: token ? `Bearer ${token}` : "",
                        },
                    }
                );
                const mapped = {};
                res.data.result.forEach((cate) => {
                    mapped[cate.name] = cate.id;
                });
                setCate(mapped);
            } catch (err) {
                console.error("Lỗi khi gọi API:", err);
            }
        };

        fetchAllCategories();
    }, []);

    // useEffect(() => {
    //     console.log("cate: ", cate);
    // }, [cate]);

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

    /////////////////////////////////////////// specifications ///////////////////////////////////////////
    // Mapping group tiếng Anh từ API sang tiếng Việt để hiển thị đẹp như ProductUpload
    const groupMap = {
        General: "Thông tin hàng hóa",
        Design: "Thiết kế & Trọng lượng",
        Performance: "Bộ xử lý", // hoặc "Hiệu năng" tùy bạn muốn
        Display: "Màn hình",
        Graphic: "Đồ họa",
        Storage: "Lưu trữ",
        Camera: "Camera sau",
        Connectivity: "Giao tiếp và kết nối",
        Battery: "Thông tin pin và sạc",
        OperatingSystem: "Hệ điều hành",
        Feature: "Tính năng & Đặc điểm",
        BasicSpecification: "Thông số cơ bản",
        RAM: "RAM",
    };

    // Hàm helper nhỏ để lấy tên tiếng Anh từ tên tiếng Việt
    const getEnglishGroup = (vietnameseName) => {
        return Object.keys(groupMap).find(key => groupMap[key] === vietnameseName) || "General";
    };

    // Thay đổi key/value/type của một spec
    const handleChangeSpecifications = (groupIndex, specIndex, field, newValue) => {
        setSpecifications((prev) =>
            prev.map((group, gIdx) => {
                if (gIdx !== groupIndex) return group;
                const newSpecs = [...group.specs];
                newSpecs[specIndex] = { ...newSpecs[specIndex], [field]: newValue };
                return { ...group, specs: newSpecs };
            })
        );
    };

    // Thêm spec mới vào group
    const addSpecSlot = (groupIndex) => {
        setSpecifications((prev) =>
            prev.map((group, gIdx) => {
                if (gIdx !== groupIndex) return group;
                const englishGroup = getEnglishGroup(group.nameGroup); // ← dùng hàm này
                return {
                    ...group,
                    specs: [...group.specs, {
                        key: "",
                        value: "",
                        type: "TECH",
                        group: englishGroup  // ← lưu tiếng Anh
                    }],
                };
            })
        );
    };

    // Xóa spec
    const removeSpecSlot = (groupIndex, specIndex) => {
        setSpecifications((prev) =>
            prev.map((group, gIdx) => {
                if (gIdx !== groupIndex) return group;
                return {
                    ...group,
                    specs: group.specs.filter((_, sIdx) => sIdx !== specIndex),
                };
            })
        );
    };

    // Flatten lại để gửi API
    const flattenSpecifications = () => {
        if (!Array.isArray(specifications) || specifications.length === 0) {
            return [];
        }

        return specifications
            .flatMap(groupItem => groupItem.specs) // gộp tất cả specs từ các group
            .filter(spec => spec.key.trim() !== "" && spec.value.trim() !== "") // bỏ các dòng trống
            .map(spec => ({
                key: spec.key.trim(),
                value: spec.value.trim(),
                type: spec.type, // "TECH" hoặc "VARIANT"
                group: spec.group, // SpecGroup enum string như "General", "Display",...
            }));
    };


    const groupSpecifications = (specs) => {
        const groups = {};

        //Thêm tất cả specs thường từ product.specifications
        specs.forEach((spec) => {
            const g = spec.group || "General";

            if (!groups[g]) {
                groups[g] = {
                    nameGroup: groupMap[g] || g,
                    specs: [],
                };
            }

            groups[g].specs.push({
                key: spec.key,
                value: spec.value,
                type: spec.type || "TECH",  // giữ nguyên type từ backend
                group: g,
            });
        });

        return Object.values(groups);
    };

    //api function thumbnail
    const changeThumbnailAPI = async (productId, oldThumbnailUrl, newThumbnailFile, token) => {
        const formData = new FormData();
        formData.append("productId", productId);
        formData.append("oldThumbnailUrl", oldThumbnailUrl || ""); // phòng trường hợp null/undefined
        formData.append("newThumbnail", newThumbnailFile);

        const res = await axios.post(
            "/api/v1/media-service/media/product/change-thumbnail",
            formData,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                },
            }
        );
        return res.data;
    };

    //api function
    const uploadImageAPI = async (productId, files, token) => {
        const formData = new FormData();

        // Thêm từng file vào formData
        files.forEach((file) => {
            formData.append("listFile", file); // key phải trùng tên field backend mong đợi
        });

        formData.append("productId", productId);

        const res = await axios.post(
            "/api/v1/media-service/media/product/change-image",
            formData,
            {
                headers: {
                    Authorization: token ? `Bearer ${token}` : "",
                    "Content-Type": "multipart/form-data",
                },
            }
        );

        return res.data;
    };

    const deleteImageByUrlAPI = async (url, token) => {
        const res = await axios.delete("/api/v1/media-service/media/delete/url", {
            headers: {
                Authorization: token ? `Bearer ${token}` : "",
                "Content-Type": "application/json",
            },
            data: { url },
        });
        return res.data;
    };

    const reorderImageAPI = async (imageId, newPosition, token) => {
        const res = await axios.put(
            "/api/v1/media-service/media/product/reorder",
            { imageId, newPosition },
            {
                headers: {
                    Authorization: token ? `Bearer ${token}` : "",
                    "Content-Type": "application/json",
                },
            }
        );
        return res.data;
    };

    const getImageListAPI = async (productId, token) => {
        const res = await axios.get("/api/v1/media-service/media/product/get-media", {
            params: {
                ownerId: productId,
                mediaOwnerType: "PRODUCT",
            },
            headers: {
                Authorization: token ? `Bearer ${token}` : "",
            },
        });
        return res.data;
    };

    const handleAction = async (action, id, token) => {
        if (action.current.length === 0) return;
        let actionsToRun = [...action.current];
        const uploadImages = [];

        actionsToRun = actionsToRun.filter(item => {
            if (item.type === "upload" && item.file) {
                uploadImages.push(item.file);
                return false; // loại khỏi actionsToRun
            }
            return true;
        });

        if (uploadImages.length > 0) {
            await uploadImageAPI(id, uploadImages, token);
        }

        for (const act of actionsToRun) {
            try {
                if (act.type === "delete") {
                    await deleteImageByUrlAPI(act.url, token);
                } else if (act.type === "reorder") {
                    if (act.imageId === null) {
                        const res = await getImageListAPI(id, token);
                        act.imageId = res.result.mediaResponseList[act.oldPosition]?.id;
                    }
                    await reorderImageAPI(act.imageId, act.newPosition, token);
                }
                console.log("Action thành công:", act.type);
            } catch (err) {
                console.error(`Lỗi khi xử lý action ${act.type}:`, err);
            }
        }
    };

    function cleanActions(actions) {
        // Tạo mảng deleteAction để lưu các fileName cần xóa
        const deleteAction = [];

        // Lọc tất cả action có type là 'delete' và có fileName hợp lệ
        for (const action of actions) {
            if ((action.type === "delete") && action.fileName) {
                deleteAction.push(action.url);
            }
        }

        if (deleteAction.length === 0) return actions; // không có action nào để xóa

        // Xóa khỏi mảng actions gốc những action có fileName nằm trong uniqueDeleteAction
        for (let i = actions.length - 1; i >= 0; i--) {
            const a = actions[i];
            if (deleteAction.includes(a.url)) {
                actions.splice(i, 1);
            }
        }

        return actions;
    }

    const editProduct = async ({
        id,
        token,
        body,
        changedThumbnails = [],
        thumbnailsToDelete = [],
        action,
    }) => {
        // PUT update product info
        const res = await axios.put(
            "/api/v1/product-service/product/update",
            {
                id,
                name: body.name,
                description: body.description,
                brandName: body.brandName,
                videoUrl: body.videoUrl,
                avgRating: body.avgRating,
                categoryId: body.categoryId,
                specifications: body.specifications,
                productVariants: body.productVariants,
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: token ? `Bearer ${token}` : "",
                },
            }
        );

        console.log('res update', res)

        // Clean actions trước khi thực thi
        cleanActions(action.current);

        // THÊM ĐOẠN XỬ LÝ THAY ĐỔI THUMBNAIL CỦA CÁC VARIANT (song song)
        if (changedThumbnails && changedThumbnails.length > 0) {
            const token = localStorage.getItem("token");

            const thumbnailPromises = changedThumbnails.map(async ({ oldUrl, newFile, isNewVariant, index }) => {
                if (!newFile) return;

                const formData = new FormData();
                formData.append("productId", id);

                if (isNewVariant || !oldUrl) {
                    const ownerId = res.data.result.variantsResponses[index].sku;
                    formData.append("ownerId", ownerId);
                    formData.append("mediaOwnerType", "PRODUCT_VARIANT");
                    formData.append('multipartFile', newFile);
                    // Variant mới → upload như ProductUpload
                    return axios.post("/api/v1/media-service/media/thumbnail", formData, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "multipart/form-data"
                        }
                    });
                } else {
                    // Variant cũ → change thumbnail
                    formData.append('sku', listVariants[index].sku);
                    formData.append("newThumbnail", newFile);
                    formData.append("oldThumbnailUrl", oldUrl);
                    return axios.post("/api/v1/media-service/media/product/change-thumbnail", formData, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "multipart/form-data"
                        }
                    });
                }
            });

            await Promise.all(thumbnailPromises.filter(Boolean));
        }

        // 5. XÓA THUMBNAIL CỦA CÁC VARIANT BỊ XÓA (chỉ khi tất cả trên thành công)
        if (thumbnailsToDelete.length > 0) {
            const deletePromises = thumbnailsToDelete.map(sku =>
                axios.post("/api/v1/media-service/delete/ownerId", {
                    ownerId: sku,
                    mediaOwnerType: "VARIANT"
                }, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                })
            );

            await Promise.all(deletePromises);
            console.log(`Đã xóa thumbnail của ${thumbnailsToDelete.length} variant bị xóa`);
        }

        // Xử lý các action (upload / delete / reorder)
        await handleAction(action, id, token);

        // Reset lại action sau khi xong
        action.current = [];

        console.log("body gửi đi:", body);
        console.log("response:", res.data);
        return res.data;
    };


    //form
    const queryClient = useQueryClient();
    const editMutation = useMutation({
        mutationFn: editProduct,
        onSuccess: () => {
            queryClient.invalidateQueries(["products"]);
            navigate("/products", {
                state: {
                    popup: {
                        open: true,
                        severity: "success",
                        message: "Cập nhật sản phẩm thành công!",
                        vertical: "top",
                        horizontal: "center",
                    },
                },
            });
        },
        onError: (err) => {
            if (err.response) {
                console.error("📡 Status:", err.response.status);
                console.error("📩 Response data:", err.response.data);
                console.error("📑 Headers:", err.response.headers);
            } else if (err.request) {
                console.error("🕓 Không nhận được phản hồi từ server. Request:", err.request);
            } else {
                console.error("❌ Lỗi xảy ra khi setup request:", err.message);
            }
            navigate("/products", {
                state: {
                    popup: {
                        open: true,
                        severity: "error",
                        message: err.response?.data?.message || "Cập nhật sản phẩm thất bại!",
                        vertical: "top",
                        horizontal: "center",
                    },
                },
            });
        },
    });

    const handleSubmit = (e) => {
        e.preventDefault();

        // Gọi flatten để lấy specifications sạch và updatedVariant đầy đủ
        const flattenedSpecs = flattenSpecifications();
        const productVariantsToSend = [
            ...listVariants.filter(v => v.action),  // Chỉ lấy variant có action (CREATE/UPDATE)
            ...deletedVariants                      // Thêm các DELETE
        ];
        const body = {
            name,
            description,
            brandName,
            videoUrl: video,
            avgRating,
            categoryId: listCategoryId,
            specifications: flattenedSpecs,
            productVariants: productVariantsToSend
        };

        editMutation.mutate({
            id,
            token,
            body,
            changedThumbnails,
            action,
        });
    };

    const formatDisplay = (val) => {
        return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    };


    return (
        <>
            <div className="py-[10px] px-[100px] overflow-hidden">
                <div className='flex justify-between items-center my-4'>
                    <h3 className="text-[30px] font-bold mb-4 text-[#403e57]">
                        Chỉnh sửa sản phẩm
                    </h3>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    <div className="flex flex-col shadow border-0 px-3 py-6 px-[5px] mx-[0px] bg-white rounded-[10px] w-full">
                        <div className={` w-screen px-4 py-2 font-semibold text-gray-900 text-[20px] flex justify-between items-center ${basicInfoToggle ? "mb-10" : ""}`}>
                            <span>
                                Thông tin cơ bản
                            </span>

                            <button
                                type="button"
                                className="flex items-center gap-1 text-[40px]"
                                onClick={() => setBasicInfoToggle(!basicInfoToggle)}
                            >
                                <IoMdArrowDropdown className={`transition-transform duration-200 ${basicInfoToggle ? "" : "rotate-[90deg]"} transition-all duration-300`} />
                            </button>
                        </div>
                        <div className={`${basicInfoToggle === true ? "pointer-events-auto pb-8" : "h-[0px] opacity-0 pointer-events-none"} flex flex-col gap-8`}>
                            <div className='w-full flex gap-7 mx-2'>
                                <div className='w-[200px] h-full'>
                                    <div className='flex flex-col items-end text-right gap-[91px] h-full'>
                                        <h6 className="text-[18px]">Ảnh sản phẩm</h6>
                                        <h6 className='text-[14px] font-semibold'><IoMdInformationCircle className='inline-block mr-1 text-[17px]' /> Kéo và thả ảnh để thay đổi vị trí.</h6>
                                    </div>
                                </div>

                                <div className='w-full flex gap-7 flex-wrap'>
                                    {/* Ảnh sản phẩm có drag & drop */}
                                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                                        <SortableContext items={imageList.map((_, idx) => idx.toString())}>
                                            {imageList.map((img, idx) => (
                                                <div className="flex flex-col items-center gap-2" key={idx}>
                                                    <div>
                                                        <SortableImage
                                                            id={idx.toString()}
                                                            img={img}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                openImgFilePicker(idx);
                                                            }}
                                                            onRemove={(e) => {
                                                                e.stopPropagation();
                                                                handleImgFileRemove(e, idx);
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="flex flex-col justify-center items-center">
                                                        <h6>Ảnh {idx + 1}</h6>
                                                        <div className="flex gap-2">
                                                            <IconButton
                                                                onClick={(e) => {
                                                                    if (img.url) {
                                                                        handleImgFileRemove(e, idx);
                                                                    }
                                                                    removeImageSlot(idx);
                                                                }}
                                                            >
                                                                <HiOutlineTrash className="text-[20px]" />
                                                            </IconButton>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </SortableContext>
                                    </DndContext>

                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        style={{ display: "none" }}
                                        onChange={handleImgFileSelect}
                                    />
                                    {imageList.length < 9 && (
                                        <IconButton
                                            onClick={() => {
                                                currentIndexRef.current = imageList.length;
                                                openImgFilePicker(imageList.length);
                                            }}
                                            className="!w-[135px] !h-[135px] hover:!bg-transparent"
                                        >
                                            <HiOutlinePlus size={70} />
                                        </IconButton>
                                    )}
                                </div>
                            </div>

                            <div className='w-full flex gap-7 mx-2'>
                                <div className='w-[200px] flex justify-end'>
                                    <h6 className="text-[18px]">Video sản phẩm</h6>
                                </div>

                                <div className='w-full'>
                                    <Box
                                        sx={{
                                            width: 135,
                                            height: 135,
                                            border: "2px dashed #aaa",
                                            borderRadius: 2,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            cursor: "pointer",
                                            overflow: "hidden",
                                            position: "relative",
                                        }}
                                        ref={anchorRef}
                                        onClick={handleVidOpen}
                                    >
                                        {video ? (
                                            <Box sx={{ position: "relative", width: 135, height: 135 }} className="group">
                                                <img
                                                    src={`https://img.youtube.com/vi/${getYouTubeId(video)}/0.jpg`}
                                                    alt="video thumbnail"
                                                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                                />
                                                <IconButton
                                                    size="small"
                                                    onClick={(e) => handleVidRemove(e)}
                                                    sx={{
                                                        position: "absolute",
                                                        top: 4,
                                                        right: 4,
                                                        background: "rgba(255,255,255,0.7)",
                                                    }}
                                                    className='group-hover:opacity-100 opacity-0 !transition-opacity !duration-300'
                                                >
                                                    <CloseIcon fontSize="small" />
                                                </IconButton>
                                            </Box>
                                        ) : (
                                            <IconButton>
                                                <BsPlusSquare size={40} />
                                            </IconButton>
                                        )}

                                    </Box>
                                    <Popover
                                        open={Boolean(anchorVid)}
                                        anchorEl={anchorVid}
                                        onClose={handleVidClose}
                                        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
                                        transformOrigin={{ vertical: "top", horizontal: "center" }}
                                        disableEnforceFocus
                                        disableRestoreFocus
                                    >
                                        <Box sx={{ p: 1, display: "flex", gap: 1, alignItems: "center" }}>
                                            <TextField
                                                size="small"
                                                label="Link video"
                                                variant="outlined"
                                                value={tempVid}
                                                onChange={(e) => setTempVid(e.target.value)}
                                                sx={{
                                                    fontSize: "12px",
                                                    "& .MuiInputBase-root": {
                                                        fontSize: "12px", // chữ trong input
                                                        height: "32px",   // giảm chiều cao
                                                    },
                                                    "& .MuiInputLabel-root": {
                                                        fontSize: "12px", // chữ label
                                                    },
                                                }}
                                            />
                                            <Button
                                                variant="contained"
                                                size="small"
                                                sx={{ fontSize: "12px", minWidth: "50px", height: "32px" }}
                                                onClick={handleAddLinkVid}
                                            >
                                                OK
                                            </Button>
                                        </Box>
                                    </Popover>
                                </div>
                            </div>

                            <div className='w-full flex gap-7 mx-2'>
                                <div className='w-[200px] flex justify-end'>
                                    <h6 className="text-[18px]">Tên sản phẩm</h6>
                                </div>

                                <div className='w-full pr-[54px]'>
                                    <input value={name} onChange={(e) => setName(e.target.value)} type='text' className="bg-[#fafafa] pl-[15px] rounded-[5px] text-[15px] w-full h-[40px] border-[rgba(0,0,0,0.1)] border border-solid"></input>
                                </div>
                            </div>

                            <div className='w-full flex gap-7 mx-2'>
                                <div className='w-[200px] flex justify-end'>
                                    <h6 className="text-[18px]">Mô tả sản phẩm</h6>
                                </div>

                                <div className='w-full pr-[54px]'>
                                    <TextEditor
                                        description={description}
                                        setDescription={setDescription}
                                        placeholder="Nhập mô tả sản phẩm... (hỗ trợ bullet, đậm, nghiêng)" />
                                </div>
                            </div>

                            <div className='w-full flex gap-7 mx-2'>
                                <div className='w-[200px] flex justify-end'>
                                    <h6 className="text-[18px]">Tên thương hiệu</h6>
                                </div>

                                <div className='w-full pr-[53px]'>
                                    <input value={brandName} onChange={(e) => setBrandName(e.target.value)} type='text' className="bg-[#fafafa] pl-[15px] rounded-[5px] text-[15px] w-full h-[40px] border-[rgba(0,0,0,0.1)] border border-solid"></input>
                                </div>
                            </div>

                            <div className='w-full flex gap-7 mx-2'>
                                <div className='w-[200px] flex justify-end'>
                                    <h6 className="text-[18px]">Thể loại</h6>
                                </div>

                                <div className='w-full pr-[54px]'>
                                    <Select
                                        labelId="demo-multiple-chip-label"
                                        id="demo-multiple-chip"
                                        multiple
                                        value={listCategoryId}
                                        onChange={handleListCategoryChange}
                                        renderValue={(selected) => (
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                                {Object.keys(cate)
                                                    .filter((key) => selected.includes(cate[key])).map((value) => (
                                                        <Chip key={value} label={value} />
                                                    ))}
                                            </Box>
                                        )}
                                        MenuProps={MenuProps}
                                        className="!w-full !bg-[#fafafa] rounded-[5px] border-[rgba(0,0,0,0.1)] border border-solid"
                                    >
                                        {Object.entries(cate).map(([label, value]) => (
                                            <MenuItem
                                                key={label}
                                                value={value}
                                            >
                                                <Checkbox checked={Array.isArray(listCategoryId) && listCategoryId.indexOf(value) > -1} />
                                                <ListItemText primary={label} />
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap shadow border-0 px-3 py-6 px-[5px] mx-[0px] bg-white rounded-[10px]">
                        <div className={` w-screen px-4 py-2 font-semibold text-gray-900 text-[20px] flex justify-between items-center ${sellingInfoToggle ? "mb-10" : ""}`}>
                            <span>
                                Thông tin các phiên bản
                            </span>

                            <button
                                type="button"
                                className="flex items-center gap-1 text-[40px]"
                                onClick={() => setSellingInfoToggle(!sellingInfoToggle)}
                            >
                                <IoMdArrowDropdown className={`transition-transform duration-200 ${sellingInfoToggle ? "" : "rotate-[90deg]"} transition-all duration-300`} />
                            </button>
                        </div>

                        <div className={`${sellingInfoToggle === true ? "pointer-events-auto pb-8" : "h-[0px] opacity-0 pointer-events-none"} flex flex-col gap-8 w-full`}>
                            {listVariants.map((varItem, varIndex) => (
                                <div key={varIndex} className="w-full relative">

                                    <IconButton
                                        onClick={() => removeVariant(varIndex)}
                                        className="absolute top-0 right-0 text-red-500"
                                    >
                                        <IoMdClose size={20} />
                                    </IconButton>

                                    <div className='w-full flex gap-7 mx-2 py-3'>
                                        <div className='w-[200px] flex justify-end'>
                                            <h6 className="text-[18px]">Tên phiên bản</h6>
                                        </div>
                                        <div className='w-full pr-[65px]'>
                                            <input
                                                name="variantName"
                                                value={varItem.variantName}
                                                onChange={(e) => handleVariantChange(varIndex, e)}
                                                type='text'
                                                className="bg-[#fafafa] pl-[15px] rounded-[5px] text-[15px] w-full h-[40px] border-[rgba(0,0,0,0.1)] border border-solid"
                                                placeholder="Ví dụ: iPhone 17 Pro Đen 256GB"
                                            />
                                        </div>
                                    </div>

                                    <div className='w-full flex gap-7 mx-2 py-3'>
                                        <div className='w-[200px] flex justify-end'>
                                            <h6 className="text-[18px]">Giá sản phẩm</h6>
                                        </div>
                                        <div className='w-full pr-[65px]'>
                                            <input
                                                name="price"
                                                value={formatDisplay(varItem.price)} // hiển thị có dấu chấm (giả sử bạn đã có hàm formatDisplay)
                                                onChange={(e) => {
                                                    const rawValue = e.target.value.replace(/\./g, '');
                                                    if (/^\d*$/.test(rawValue)) {
                                                        handleVariantChange(varIndex, { target: { name: 'price', value: rawValue } });
                                                    }
                                                }}
                                                type='text'
                                                placeholder="Nhập giá (VND)"
                                                className="bg-[#fafafa] pl-[15px] rounded-[5px] text-[15px] w-full h-[40px] border-[rgba(0,0,0,0.1)] border border-solid"
                                            />
                                        </div>
                                    </div>

                                    <div className='w-full flex gap-7 mx-2 py-3'>
                                        <div className='w-[200px] flex justify-end'>
                                            <h6 className="text-[18px]">Màu sắc</h6>
                                        </div>
                                        <div className='w-full pr-[65px]'>
                                            <input
                                                name='color'
                                                type='text'
                                                value={varItem.color}
                                                onChange={(e) => handleVariantChange(varIndex, e)}
                                                className="bg-[#fafafa] pl-[15px] rounded-[5px] text-[15px] w-full h-[40px] border-[rgba(0,0,0,0.1)] border border-solid"
                                                placeholder="Ví dụ: Trắng, Xanh, Đen"
                                            />
                                        </div>
                                    </div>

                                    {/* thumbnail */}
                                    <div className='w-full flex gap-7 mx-2 py-3'>
                                        <div className='w-[200px] flex justify-end'>
                                            <h6 className="text-[18px]"> Ảnh thumbnail</h6>
                                        </div>
                                        <div className='w-full pr-[53px]'>
                                            <div className='flex flex-col gap-1'>
                                                <Box
                                                    sx={{
                                                        width: 135,
                                                        height: 135,
                                                        border: "2px dashed #aaa",
                                                        borderRadius: 2,
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        cursor: "pointer",
                                                        overflow: "hidden",
                                                        position: "relative",
                                                    }}
                                                    onClick={() => openVariantThumbnailPicker(varIndex)}
                                                >
                                                    {listThumbnails[varIndex]?.preview ? (
                                                        <>
                                                            <div className="w-full h-full">
                                                                <img
                                                                    src={listThumbnails[varIndex].preview}
                                                                    alt="thumbnail"
                                                                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                                                />
                                                            </div>
                                                        </>
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
                                                <div className="w-[135px] flex justify-center">
                                                    {listThumbnails[varIndex]?.preview ? (
                                                        <div className='flex gap-2'>
                                                            <IconButton
                                                                onClick={() => openVariantThumbnailPicker(varIndex)}
                                                            >
                                                                <BiRefresh className='text-[25px]' />
                                                            </IconButton>
                                                        </div>
                                                    ) : null}
                                                </div>
                                            </div>
                                            <input
                                                type="file"
                                                id={`thumbnail-input-${varIndex}`}
                                                onChange={(e) => handleVariantThumbnailChange(varIndex, e)}
                                                accept="image/*"
                                                className="hidden"
                                                style={{ display: "none" }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}

                            <div className="w-full flex justify-center mt-4">
                                <Button
                                    variant="outlined"
                                    startIcon={<FaPlus />}
                                    onClick={addVariant}
                                    className="!text-[#4a2fcf] !border-[#4a2fcf]"
                                >
                                    Thêm phiên bản
                                </Button>
                            </div>
                        </div>
                    </div>



                    <div className="flex flex-wrap shadow border-0 px-3 py-6 my-[10px] px-[5px] mx-[0px] bg-white rounded-[10px]">
                        <div className={` w-screen px-4 py-2 font-semibold text-gray-900 text-[20px] flex justify-between items-center ${specificationToggle ? "mb-10" : ""}`}>
                            <span>
                                Thông số kĩ thuật
                            </span>

                            <button
                                type="button"
                                className="flex items-center gap-1 text-[40px]"
                                onClick={() => setSpecificationToggle(!specificationToggle)}
                            >
                                <IoMdArrowDropdown className={`transition-transform duration-200 ${specificationToggle ? "" : "rotate-[90deg]"} transition-all duration-300`} />
                            </button>
                        </div>
                        <div className={`w-full mx-11 ${specificationToggle === true ? "pointer-events-auto pb-8" : "h-[0px] opacity-0 pointer-events-none"}`}>
                            <Box sx={{ width: '100%', typography: 'body1' }}>
                                {specifications.map((groupItem, groupIndex) => (
                                    <div key={groupIndex} className="mb-6">
                                        <div className="w-full font-semibold text-gray-900 text-[18px]">
                                            {groupItem.nameGroup}
                                        </div>

                                        {(groupItem.specs || []).map((spec, specIndex) => {
                                            const uniqueKey = `${groupIndex}-${specIndex}`;

                                            return (
                                                <div key={uniqueKey} className="flex my-5 gap-10" >
                                                    <div className="w-[47%] flex justify-end items-center gap-2">
                                                        <IconButton onClick={() => removeSpecSlot(groupIndex, specIndex)}>
                                                            <MdDelete />
                                                        </IconButton>
                                                        <input
                                                            value={spec.key}
                                                            onChange={(e) => handleChangeSpecifications(groupIndex, specIndex, 'key', e.target.value)}
                                                            type="text"
                                                            placeholder="Tên thông số"
                                                            className="bg-[#fafafa] pl-[15px] rounded-[5px] text-[15px] w-full h-[40px] border border-[rgba(0,0,0,0.1)]"
                                                        />
                                                    </div>

                                                    {/* Giá trị */}
                                                    <div className="w-[47%]">
                                                        <input
                                                            value={spec.value}
                                                            onChange={(e) => handleChangeSpecifications(groupIndex, specIndex, 'value', e.target.value)}
                                                            type="text"
                                                            placeholder="Giá trị thông số"
                                                            className="bg-[#fafafa] pl-[15px] rounded-[5px] text-[15px] w-full h-[40px] border border-[rgba(0,0,0,0.1)]"
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })}

                                        {/* Nút thêm spec vào group này */}
                                        <div className="flex justify-center mt-3">
                                            <IconButton onClick={() => addSpecSlot(groupIndex)}>
                                                <FaPlus className="text-[#6440F5]" />
                                            </IconButton>
                                        </div>
                                    </div>
                                ))}
                            </Box>
                        </div>
                    </div >

                    <div className='!w-full px-[60px] py-[30px]'>
                        <Button variant="contained" type='submit' className='!w-full !flex !items-cnter !justify-center !gap-2 !p-[15px] !bg-gradient-to-r !from-[#4a2fcf] !to-[#6440F5]'>
                            <FaCloudUploadAlt className='text-[35px]' />
                            <h3 className='text-[25px]'>Tải lên</h3>
                        </Button>
                    </div>
                </form >
            </div >

            {
                editMutation.isPending && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                        <div className="bg-white p-6 rounded-xl flex flex-col items-center gap-3">
                            <CircularProgress color="primary" />
                            <p className="text-gray-700 font-medium">Đang lưu thay đổi...</p>
                        </div>
                    </div>
                )
            }
        </>
    )
}
