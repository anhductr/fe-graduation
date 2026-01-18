import Select from '@mui/material/Select';
import React from 'react';
import { useEffect, useState, useRef } from 'react';
import Button from '@mui/material/Button';
import { FaCloudUploadAlt } from "react-icons/fa";
import {
  Box,
  IconButton,
  Popover,
  TextField,
  MenuItem,
} from "@mui/material";
import { CircularProgress } from "@mui/material";
import TextEditor from '../../components/common/TextEditor';
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import CloseIcon from "@mui/icons-material/Close";
import { BsPlusSquare } from "react-icons/bs";
import axios from 'axios';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import { FaPlus } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { useNavigate } from 'react-router';
import Chip from '@mui/material/Chip';
import Checkbox from '@mui/material/Checkbox';
import ListItemText from '@mui/material/ListItemText';
import { HiOutlinePlus } from "react-icons/hi2";
import { IoMdClose } from "react-icons/io";
import {
  DndContext,
  useSensor,
  useSensors,
  MouseSensor,
  TouchSensor,
  closestCenter,
} from "@dnd-kit/core";
import { HiOutlineTrash } from "react-icons/hi2";
import { BiRefresh } from "react-icons/bi";
import { IoMdInformationCircle } from "react-icons/io";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Switch from '@mui/material/Switch';
import debounce from 'lodash/debounce';
import { useCallback } from 'react';
import {
  SortableContext,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";

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

export default function ProductUpload() {
  const [cate, setCate] = useState('');
  const [name, setName] = useState('');
  const [brandName, setBrandName] = useState('');
  const [video, setVideo] = useState('');
  const [description, setDescription] = useState('');
  const [avgRating, setAvgRating] = useState(0);
  const [listCategoryId, setListCategoryId] = useState([]);
  const [specifications, setSpecifications] = useState([{ key: "", value: [] }]);

  const [listVariants, setListVariants] = useState([{
    action: 'CREATE',
    variantName: '',
    price: '',
    color: '',
  }]);

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
    if (listVariants.length > 1) {
      setListVariants(prev => prev.filter((_, i) => i !== index));
      setListThumbnails(prev => prev.filter((_, i) => i !== index));
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
      return next;
    });
  };

  const navigate = useNavigate();

  //chỗ để xem dữ liệu
  // useEffect(() => {
  //   console.log("category IDs:", listCategoryId);
  // }, [listCategoryId]);

  // useEffect(() => {
  //   console.log("cate: ", cate);
  // }, [cate]);

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

  //thumbnail
  const [listThumbnails, setListThumbnails] = useState([{ file: null, preview: "" }]);

  //thumbnail function
  const handleVariantThumbnailChange = (index, e) => {
    const file = e.target.files[0];
    if (file) {
      // Thu hồi URL cũ nếu có
      setListThumbnails(prev => {
        const next = [...prev];
        if (next[index].preview) URL.revokeObjectURL(next[index].preview);
        const preview = URL.createObjectURL(file);
        next[index] = { file, preview };
        return next;
      });
      // Reset input value
      e.target.value = "";
    }
  };

  // const handleVariantThumbnailRemove = (index, e) => {
  //   e.stopPropagation();
  //   setListThumbnails(prev => {
  //     const next = [...prev];
  //     if (next[index].preview) URL.revokeObjectURL(next[index].preview);
  //     next[index] = { file: null, preview: "" };
  //     return next;
  //   });
  //   // Reset input
  //   document.getElementById(`thumbnail-input-${index}`).value = "";
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

  //các biến cho img list
  const [imageList, setImageList] = useState([]);

  // 👉 Xóa slot ảnh theo vị trí
  const removeImageSlot = (index) => {
    setImageList((prev) => prev.filter((_, i) => i !== index));
  };
  const fileInputRef = useRef(null);
  const currentIndexRef = useRef(null); // index slot hiện tại
  const previewsRef = useRef(new Set()); // để track và revoke sau

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
      setImageList((prev) => [...prev, { file: null, preview: null }]);
    }

    const preview = URL.createObjectURL(file);
    previewsRef.current.add(preview);

    setImageList((prev) => {
      const next = [...prev];
      next[idx] = { file, preview };
      return next;
    });

    e.target.value = "";
  };


  // Xóa ảnh tại slot idx
  const handleImgFileRemove = (e, idx) => {
    e.stopPropagation();
    setImageList((prev) => {
      const next = [...prev];
      if (next[idx]?.preview) {
        URL.revokeObjectURL(next[idx].preview);
        previewsRef.current.delete(next[idx].preview);
      }
      next[idx] = { file: null, preview: "" };
      return next;
    });
  };

  // cleanup on unmount: revoke tất cả preview còn lại
  useEffect(() => {
    return () => {
      previewsRef.current.forEach((url) => URL.revokeObjectURL(url));
      previewsRef.current.clear();
    };
  }, []);

  // --- DND kit setup ---
  const sensors = useSensors(useSensor(MouseSensor), useSensor(TouchSensor));

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setImageList((prev) => {
      const oldIndex = +active.id;
      const newIndex = +over.id;
      return arrayMove(prev, oldIndex, newIndex); // di chuyển và animation tự động
    });
  };

  function SortableImage({ id, img, onClick }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
      useSortable({ id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition, //DnD kit tự quản lý animation
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
      cursor: img.preview ? "grab" : "pointer",
      background: "#fff",
    };

    return (
      <div ref={setNodeRef} style={style} {...attributes} {...listeners} onClick={onClick}>
        <div className="group w-full h-full">
          <img
            src={img.preview}
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


  // useEffect(() => {
  //   console.log("video:", video);
  //   console.log("specifications: ", specifications)
  // }, [specifications]);

  // useEffect(() => {
  //   console.log("imglist: ", imageList)
  // }, [imageList]);

  useEffect(() => {
    setSpecifications(defaultSpecifications['1'] || []);
  }, []);

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

  //specifications
  const [value, setValue] = useState(1);
  const [addOnSpecMap, setAddOnSpecMap] = useState({}); // { 0: [...], 1: [...] }

  const handleChangeTab = (event, newValue) => {
    setValue(newValue);
    // console.log("change tab", newValue);
    setSpecifications(defaultSpecifications[newValue] || []);
    setAddOnSpecMap({});  // reset specifications khi đổi tab
  };

  const defaultSpecifications = {
    1: [ // Điện thoại & máy tính bảng
      {
        nameGroup: "Thông tin hàng hóa",
        specs: [
          { key: "Xuất xứ", value: "", type: "TECH", group: "General" },
        ]
      },
      {
        nameGroup: "Thiết kế & Trọng lượng",
        specs: [
          { key: "Kích thước", value: "", type: "TECH", group: "Design" },
          { key: "Trọng lượng", value: "", type: "TECH", group: "Design" },
          { key: "Chất liệu", value: "", type: "TECH", group: "Design" },
        ]
      },
      {
        nameGroup: "Bộ xử lý",
        specs: [
          { key: "Phiên bản CPU", value: "", type: "TECH", group: "Performance" },
          { key: "Loại CPU", value: "", type: "TECH", group: "Performance" },
          { key: "Số nhân", value: "", type: "TECH", group: "Performance" },
        ]
      },
      {
        nameGroup: "RAM",
        specs: [
          { key: "Dung lượng", value: "", type: "TECH", group: "RAM" },
        ]
      },
      {
        nameGroup: "Màn hình",
        specs: [
          { key: "Kích thước màn hình", value: "", type: "TECH", group: "Display" },
          { key: "Công nghệ màn hình", value: "", type: "TECH", group: "Display" },
          { key: "Chuẩn màn hình", value: "", type: "TECH", group: "Display" },
          { key: "Độ phân giải", value: "", type: "TECH", group: "Display" },
        ]
      },
      {
        nameGroup: "Đồ họa",
        specs: [
          { key: "Chip đồ họa", value: "", type: "TECH", group: "Graphic" },
        ]
      },
      {
        nameGroup: "Lưu trữ",
        specs: [
          { key: "Dung lượng", value: "", type: "TECH", group: "Storage" },
        ]
      },
      {
        nameGroup: "Camera sau",
        specs: [
          { key: "Số camera sau", value: "", type: "TECH", group: "Camera" },
          { key: "Độ phân giải", value: "", type: "TECH", group: "Camera" },
        ]
      },
      {
        nameGroup: "Giao tiếp và kết nối",
        specs: [
          { key: "Số khe SIM", value: "", type: "TECH", group: "Connectivity" },
          { key: "Hỗ trợ mạng", value: "", type: "TECH", group: "Connectivity" },
          { key: "Cổng giao tiếp", value: "", type: "TECH", group: "Connectivity" },
          { key: "Bluetooth", value: "", type: "TECH", group: "Connectivity" },
        ]
      },
      {
        nameGroup: "Thông tin pin và sạc",
        specs: [
          { key: "Loại pin", value: "", type: "TECH", group: "Battery" },
          { key: "Dung lượng pin", value: "", type: "TECH", group: "Battery" },
        ]
      },
      {
        nameGroup: "Hệ điều hành",
        specs: [
          { key: "Tên OS", value: "", type: "TECH", group: "OperatingSystem" },
          { key: "Phiên bản OS", value: "", type: "TECH", group: "OperatingSystem" },
        ]
      },
    ],

    2: [ // Laptop
      {
        nameGroup: "Thông tin hàng hóa",
        specs: [
          { key: "Xuất xứ", value: "", type: "TECH", group: "General" },
        ]
      },
      {
        nameGroup: "Thiết kế & Trọng lượng",
        specs: [
          { key: "Kích thước", value: "", type: "TECH", group: "Design" },
          { key: "Trọng lượng", value: "", type: "TECH", group: "Design" },
          { key: "Chất liệu", value: "", type: "TECH", group: "Design" },
        ]
      },
      {
        nameGroup: "Bộ xử lý",
        specs: [
          { key: "Hãng CPU", value: "", type: "TECH", group: "Performance" },
          { key: "Loại CPU", value: "", type: "TECH", group: "Performance" },
          { key: "CPU tổng hợp", value: "", type: "TECH", group: "Performance" },
          { key: "Công nghệ CPU", value: "", type: "TECH", group: "Performance" },
          { key: "Số nhân", value: "", type: "TECH", group: "Performance" },
          { key: "Số luồng", value: "", type: "TECH", group: "Performance" },
          { key: "Tốc độ tối đa", value: "", type: "TECH", group: "Performance" },
        ]
      },
      {
        nameGroup: "RAM",
        specs: [
          { key: "Dung lượng", value: "", type: "TECH", group: "Performance" },
          { key: "Loại Ram", value: "", type: "TECH", group: "Performance" },
          { key: "Tốc độ Ram", value: "", type: "TECH", group: "Performance" },
        ]
      },
      {
        nameGroup: "Màn hình",
        specs: [
          { key: "Kích thước màn hình", value: "", type: "TECH", group: "Display" },
          { key: "Công nghệ màn hình", value: "", type: "TECH", group: "Display" },
          { key: "Độ phân giải", value: "", type: "TECH", group: "Display" },
          { key: "Tấm nền", value: "", type: "TECH", group: "Display" },
          { key: "Tần số quét", value: "", type: "TECH", group: "Display" },
          { key: "Độ sáng", value: "", type: "TECH", group: "Display" },
          { key: "Độ Phủ màu", value: "", type: "TECH", group: "Display" },
          { key: "Tỷ lệ màn hình", value: "", type: "TECH", group: "Display" },
        ]
      },
      {
        nameGroup: "Đồ họa",
        specs: [
          { key: "Card đồ họa", value: "", type: "TECH", group: "Graphic" },
          { key: "Bộ nhớ", value: "", type: "TECH", group: "Graphic" },
        ]
      },
      {
        nameGroup: "Lưu trữ",
        specs: [
          { key: "Kiểu ổ cứng", value: "", type: "TECH", group: "Storage" },
          { key: "Loại SSD", value: "", type: "TECH", group: "Storage" },
          { key: "Dung lượng SSD", value: "", type: "TECH", group: "Storage" },
        ]
      },
      {
        nameGroup: "Tính năng & Đặc điểm",
        specs: [
          { key: "Kiểu bàn phím", value: "", type: "TECH", group: "Feature" },
          { key: "Đèn bàn phím", value: "", type: "TECH", group: "Feature" },
        ]
      },
      {
        nameGroup: "Giao tiếp & kết nối",
        specs: [
          { key: "Cổng giao tiếp", value: "", type: "TECH", group: "Connectivity" },
          { key: "Wifi", value: "", type: "TECH", group: "Connectivity" },
          { key: "Bluetooth", value: "", type: "TECH", group: "Connectivity" },
          { key: "Webcam", value: "", type: "TECH", group: "Connectivity" },
        ]
      },
      {
        nameGroup: "Thông tin pin & sạc",
        specs: [
          { key: "Dung lượng pin", value: "", type: "TECH", group: "Battery" },
        ]
      },
      {
        nameGroup: "Hệ điều hành",
        specs: [
          { key: "Tên OS", value: "", type: "TECH", group: "OperatingSystem" },
          { key: "Phiên bản OS", value: "", type: "TECH", group: "OperatingSystem" },
        ]
      },
    ],

    // Các tab khác giữ nguyên logic tương tự
    3: [ // Màn hình rời → chủ yếu Display + Design
      {
        nameGroup: "Thông tin hàng hóa",
        specs: [
          { key: "Xuất xứ", value: "", type: "TECH", group: "General" },
        ]
      },
      {
        nameGroup: "Thiết kế & Trọng lượng",
        specs: [
          { key: "Kích thước có chân đế", value: "", type: "TECH", group: "Design" },
          { key: "Trọng lượng sản phẩm có chân đế", value: "", type: "TECH", group: "Design" },
          { key: "Kiểu chân đế", value: "", type: "TECH", group: "Design" },
        ]
      },
      {
        nameGroup: "Màn hình",
        specs: [
          { key: "Loại màn hình", value: "", type: "TECH", group: "Display" },
          { key: "Kích thước màn hình", value: "", type: "TECH", group: "Display" },
          { key: "Công nghệ màn hình", value: "", type: "TECH", group: "Display" },
          { key: "Chuẩn màn hình FHD", value: "", type: "TECH", group: "Display" },
          { key: "Độ phân giải", value: "", type: "TECH", group: "Display" },
          { key: "Tấm nền", value: "", type: "TECH", group: "Display" },
          { key: "Tần số quét", value: "", type: "TECH", group: "Display" },
          { key: "Độ sáng", value: "", type: "TECH", group: "Display" },
          { key: "Độ Phủ màu", value: "", type: "TECH", group: "Display" },
          { key: "Tỷ lệ màn hình", value: "", type: "TECH", group: "Display" },
        ]
      },
      {
        nameGroup: "Thông số cơ bản",
        specs: [
          { key: "Góc nhìn", value: "", type: "TECH", group: "BasicSpecification" },
          { key: "Thời gian phản hồi", value: "", type: "TECH", group: "BasicSpecification" },
          { key: "Điện áp", value: "", type: "TECH", group: "BasicSpecification" },
        ]
      },
    ],

    4: [ // PC → chủ yếu Performance, Graphic, Storage, Design
      {
        nameGroup: "Thông tin hàng hóa",
        specs: [
          { key: "Xuất xứ", value: "", type: "TECH", group: "General" },
        ]
      },
      {
        nameGroup: "Thiết kế & Trọng lượng",
        specs: [
          { key: "Kích thước", value: "", type: "TECH", group: "Design" },
          { key: "Trọng lượng", value: "", type: "TECH", group: "Design" },
          { key: "Chất liệu", value: "", type: "TECH", group: "Design" },
          { key: "Loại Case", value: "", type: "TECH", group: "Design" },
          { key: "Kích thước Mainboard", value: "", type: "TECH", group: "Design" },
        ]
      },
      {
        nameGroup: "Bộ xử lý",
        specs: [
          { key: "Hãng CPU", value: "", type: "TECH", group: "Performance" },
          { key: "Loại CPU", value: "", type: "TECH", group: "Performance" },
          { key: "CPU tổng hợp", value: "", type: "TECH", group: "Performance" },
          { key: "Công nghệ CPU", value: "", type: "TECH", group: "Performance" },
          { key: "Số nhân", value: "", type: "TECH", group: "Performance" },
          { key: "Số luồng", value: "", type: "TECH", group: "Performance" },
        ]
      },
      {
        nameGroup: "Thông số cơ bản",
        specs: [
          { key: "Chipset", value: "", type: "TECH", group: "BasicSpecification" },
          { key: "Công suất", value: "", type: "TECH", group: "BasicSpecification" },
        ]
      },
      {
        nameGroup: "Lưu trữ",
        specs: [
          { key: "Kiểu ổ cứng", value: "", type: "TECH", group: "Storage" },
          { key: "Tổng số khe cắm SSD/HDD", value: "", type: "TECH", group: "Storage" },
          { key: "Số khe SSD/HDD còn lại", value: "", type: "TECH", group: "Storage" },
        ]
      },
      {
        nameGroup: "Đồ họa",
        specs: [
          { key: "Card đồ họa", value: "", type: "TECH", group: "Graphic" },
          { key: "Bộ nhớ", value: "", type: "TECH", group: "Graphic" },
        ]
      },
      {
        nameGroup: "Giao tiếp & kết nối",
        specs: [
          { key: "Cổng giao tiếp", value: "", type: "TECH", group: "Connectivity" },
        ]
      },
      {
        nameGroup: "Tính năng & Đặc điểm",
        specs: [
          { key: "Dạng tản nhiệt", value: "", type: "TECH", group: "Feature" },
          { key: "Chất liệu tản nhiệt", value: "", type: "TECH", group: "Feature" },
        ]
      },
    ],

    // Các tab còn lại bạn có thể bổ sung tương tự
    5: [ // Tai nghe
      {
        nameGroup: "Thông tin hàng hóa",
        specs: [
          { key: "Xuất xứ", value: "", type: "TECH", group: "General" },
        ]
      },
      {
        nameGroup: "Thiết kế & Trọng lượng",
        specs: [
          { key: "Kích thước", value: "", type: "TECH", group: "Design" },
          { key: "Trọng lượng", value: "", type: "TECH", group: "Design" },
          { key: "Chất liệu", value: "", type: "TECH", group: "Design" },
          { key: "Độ dài dây", value: "", type: "TECH", group: "Design" },
        ]
      },
      {
        nameGroup: "Thông số cơ bản",
        specs: [
          { key: "Loại tai nghe", value: "", type: "TECH", group: "BasicSpecification" },
          { key: "Dải tần số", value: "", type: "TECH", group: "BasicSpecification" },
          { key: "Kiểu kết nối", value: "", type: "TECH", group: "BasicSpecification" },
        ]
      },
      {
        nameGroup: "Giao tiếp & kết nối",
        specs: [
          { key: "Cổng giao tiếp", value: "", type: "TECH", group: "Connectivity" },
        ]
      },
      {
        nameGroup: "Thông tin pin & sạc",
        specs: [
          { key: "Dung lượng pin", value: "", type: "TECH", group: "Battery" },
          { key: "Thời gian sử dụng", value: "", type: "TECH", group: "Battery" },
        ]
      },
    ],

    6: [ // Loa
      {
        nameGroup: "Thông tin hàng hóa",
        specs: [
          { key: "Xuất xứ", value: "", type: "TECH", group: "General" },
        ]
      },
      {
        nameGroup: "Thiết kế & Trọng lượng",
        specs: [
          { key: "Trọng lượng", value: "", type: "TECH", group: "Design" },
          { key: "Chất liệu", value: "", type: "TECH", group: "Design" },
          { key: "Kích thước", value: "", type: "TECH", group: "Design" },
        ]
      },
      {
        nameGroup: "Thông số cơ bản",
        specs: [
          { key: "Loại Loa", value: "", type: "TECH", group: "BasicSpecification" },
          { key: "Số lượng Loa", value: "", type: "TECH", group: "BasicSpecification" },
          { key: "Kết nối", value: "", type: "TECH", group: "BasicSpecification" },
          { key: "Công suất", value: "", type: "TECH", group: "BasicSpecification" },
        ]
      },
      {
        nameGroup: "Giao tiếp & kết nối",
        specs: [
          { key: "Cổng giao tiếp", value: "", type: "TECH", group: "Connectivity" },
          { key: "Bluetooth", value: "", type: "TECH", group: "Connectivity" },
          { key: "Wifi", value: "", type: "TECH", group: "Connectivity" },
        ]
      },
      {
        nameGroup: "Thông tin pin & sạc",
        specs: [
          { key: "Dung lượng pin", value: "", type: "TECH", group: "Battery" },
          { key: "Thời gian sử dụng", value: "", type: "TECH", group: "Battery" },
        ]
      },
      {
        nameGroup: "Âm thanh",
        specs: [
          { key: "Công nghệ âm thanh", value: "", type: "TECH", group: "Sound" },
          { key: "Dải tần số", value: "", type: "TECH", group: "Sound" },
        ]
      },
    ],

    7: [ // chuột
      {
        nameGroup: "Thông tin hàng hóa",
        specs: [
          { key: "Xuất xứ", value: "", type: "TECH", group: "General" },
        ]
      },
      {
        nameGroup: "Thiết kế & Trọng lượng",
        specs: [
          { key: "Trọng lượng", value: "", type: "TECH", group: "Design" },
          { key: "Kích thước", value: "", type: "TECH", group: "Design" },
        ]
      },
      {
        nameGroup: "Thông số cơ bản",
        specs: [
          { key: "Loại chuột", value: "", type: "TECH", group: "BasicSpecification" },
          { key: "Kiểu kết nối", value: "", type: "TECH", group: "BasicSpecification" },
        ]
      }
    ],

    8: [ // bàn phím
      {
        nameGroup: "Thông tin hàng hóa",
        specs: [
          { key: "Xuất xứ", value: "", type: "TECH", group: "General" },
        ]
      },
      {
        nameGroup: "Thiết kế & Trọng lượng",
        specs: [
          { key: "Trọng lượng", value: "", type: "TECH", group: "Design" },
          { key: "Kích thước", value: "", type: "TECH", group: "Design" },
          { key: "Chất liệu", value: "", type: "TECH", group: "Design" },
        ]
      },
      {
        nameGroup: "Thông số cơ bản",
        specs: [
          { key: "Loại bàn phím", value: "", type: "TECH", group: "BasicSpecification" },
        ]
      },
      {
        nameGroup: "Giao tiếp và kết nối",
        specs: [
          { key: "Cổng kết nối", value: "", type: "TECH", group: "Connectivity" },
        ]
      },
    ],

    9: [  // Tùy chỉnh - bắt đầu với vài nhóm trống để người dùng thêm
      {
        nameGroup: "Thông tin hàng hóa",
        specs: [
          { key: "Xuất xứ", value: "", type: "TECH", group: "General" },
        ]
      },
      { nameGroup: "Thông tin chung", specs: [] },
      { nameGroup: "Thông số kỹ thuật", specs: [] },
      { nameGroup: "Tính năng nổi bật", specs: [] },
    ],
  };

  // Cập nhật key hoặc value
  const handleChangeSpecifications = (groupIndex, specIndex, field, newValue) => {
    setSpecifications(prev => {
      const newGroups = [...prev];
      const newSpecs = [...newGroups[groupIndex].specs];
      newSpecs[specIndex] = { ...newSpecs[specIndex], [field]: newValue };
      newGroups[groupIndex] = { ...newGroups[groupIndex], specs: newSpecs };
      return newGroups;
    });
  };

  // Thêm spec mới vào group
  const addSpecSlot = (groupIndex) => {
    setSpecifications(prev => {
      // Copy toàn bộ mảng groups
      const newGroups = prev.map((group, idx) => {
        if (idx !== groupIndex) return group;

        // Lấy group enum từ chính group hiện tại (nếu có spec đầu tiên) hoặc fallback
        const currentGroup = group.specs.length > 0
          ? group.specs[0].group
          : "General"; // hoặc bạn có thể định nghĩa default theo tab

        return {
          ...group,
          specs: [
            ...group.specs,
            {
              key: "",
              value: "",
              type: "TECH",
              group: currentGroup // dùng group của nhóm này
            }
          ]
        };
      });

      return newGroups;
    });
  };

  // Xóa spec
  const removeSpecSlot = (groupIndex, specIndex) => {
    setSpecifications((prev) =>
      prev.map((group, gIdx) =>
        gIdx !== groupIndex
          ? group
          : {
            ...group,
            specs: group.specs.filter((_, sIdx) => sIdx !== specIndex),
          }
      )
    );
  };

  // Hàm chuyển đổi specifications thành mảng phẳng cho ProductRequest.specifications
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


  //form
  const queryClient = useQueryClient();

  const createProduct = async ({ productData, listThumbnails, imageList }) => {
    const token = localStorage.getItem("token");

    // Bước 1: Tạo product (chỉ JSON sạch)
    let res = await axios.post("/api/v1/product-service/product/create", productData, {
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
    });

    // console.log("Res tạo product: ", res);

    const productId = res.data.result.id;
    // const ownerId
    const skuList = res.data.result.variantsResponses.map(v => v.sku);
    // Bước 2: Upload ảnh riêng
    const formData = new FormData();

    imageList.forEach((img) => {
      if (img.file) formData.append("imageProducts", img.file);
    });
    formData.append("productId", productId);

    await axios.post("/api/v1/media-service/media/product/image", formData, {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
        // Không set Content-Type, để browser tự set multipart/form-data
      },
    });

    // Bước 3: Upload thumbnail
    const thumbnailUploadPromises = listThumbnails.map(async (thumb, index) => {
      const sku = skuList[index];

      // Chỉ upload khi người dùng thực sự chọn ảnh cho variant đó
      if (thumb.file && sku) {
        const formData = new FormData();
        formData.append('multipartFile', thumb.file);
        formData.append('productId', productId);
        formData.append('ownerId', sku);
        formData.append('mediaOwnerType', 'PRODUCT_VARIANT');

        try {
          await axios.post('/api/v1/media-service/media/thumbnail', formData, {
            headers: {
              Authorization: token ? `Bearer ${token}` : "",
              // KHÔNG set Content-Type khi dùng FormData
            },
          });
          console.log(`Upload thumbnail thành công cho variant SKU: ${sku}`);
        } catch (err) {
          console.error(`Lỗi upload thumbnail cho SKU ${sku}:`, err.response?.data || err.message);
          // Ném lỗi ra để Promise.allSettled biết có thất bại
          throw err;
        }
      }
    });

    // Chờ TẤT CẢ các request thumbnail hoàn thành (song song)
    await Promise.allSettled(thumbnailUploadPromises);
    return res.data;
  };

  // Dùng useMutation
  const createMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: (res) => {
      queryClient.invalidateQueries(["products"]);

      navigate("/products", {
        state: {
          popup: {
            open: true,
            severity: "success",
            message: "Thêm sản phẩm thành công!",
            vertical: "top",
            horizontal: "center",
          },
        },
      });
    },
    onError: (err) => {
      navigate("/products", {
        state: {
          popup: {
            open: true,
            severity: "error",
            message: err.response?.data?.message || "Tạo sản phẩm thất bại!",
            vertical: "top",
            horizontal: "center",
          },
        },
      });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    // === VALIDATE DANH SÁCH BIẾN THỂ ===
    for (let i = 0; i < listVariants.length; i++) {
      const v = listVariants[i];

      if (!v.variantName?.trim()) {
        alert(`Vui lòng nhập tên cho phiên bản ${i + 1}`);
        return;
      }

      if (!v.color?.trim()) {
        alert(`Vui lòng nhập màu sắc cho phiên bản ${i + 1}`);
        return;
      }

      if (!v.price || Number(v.price) <= 0) {
        alert(`Vui lòng nhập giá hợp lệ (lớn hơn 0) cho phiên bản ${i + 1}`);
        return;
      }
    }

    const flattenedSpecs = flattenSpecifications();

    const body = {
      name,
      description,
      brandName,
      videoUrl: video,
      avgRating,
      categoryId: listCategoryId,
      specifications: flattenedSpecs, // ← đây chính là mảng cần gửi
      productVariants: listVariants
    };
    console.log("body gửi đi: ", body);

    createMutation.mutate({
      productData: body,
      listThumbnails,
      imageList
    });
  };

  const formatDisplay = (val) => {
    return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  useEffect(() => {
    console.log("lisst thumbnail: ", listThumbnails)
  }, [listThumbnails]);

  return (
    <>
      <div className="py-[10px] px-[100px]">
        <div className='flex justify-between items-center my-4'>
          <h3 className="text-[30px] font-bold mb-4 text-[#403e57]">
            Thêm sản phẩm
          </h3>
        </div>

        <form className='flex flex-col gap-3' onSubmit={handleSubmit}>
          <div className="flex flex-wrap shadow border-0 px-3 py-6 my-[10px] px-[5px] mx-[0px] bg-white rounded-[10px] gap-10">
            <div className="w-screen px-4 py-2 font-semibold text-gray-900 text-[20px]">
              Thông tin cơ bản
            </div>
            <div className='w-full flex gap-7 ml-2'>
              <div className='w-[200px] h-full'>
                <div className='flex flex-col items-end text-right gap-[91px] h-full'>
                  <h6 className="text-[18px]">Ảnh sản phẩm</h6>
                  <h6 className='text-[14px] font-semibold'><IoMdInformationCircle className='inline-block mr-1 text-[17px]' /> Kéo và thả ảnh để thay đổi vị trí.</h6>
                </div>
              </div>


              <div className='w-full flex gap-6 flex-wrap pr-[53px]'>
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
                                if (img.preview) {
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

            {/* video */}
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

              <div className='w-full pr-[53px]'>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  type='text'
                  className="bg-[#fafafa] pl-[15px] rounded-[5px] text-[15px] w-full h-[40px] border-[rgba(0,0,0,0.1)] border border-solid"
                />
              </div>
            </div>

            <div className='w-full flex gap-7 mx-2'>
              <div className='w-[200px] flex justify-end'>
                <h6 className="text-[18px]">Mô tả sản phẩm</h6>
              </div>

              <div className="w-full pr-[53px]">
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

              <div className='w-full pr-[53px]'>
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

          <div className="flex flex-wrap shadow border-0 px-3 py-6 my-[10px] px-[5px] mx-[0px] bg-white rounded-[10px] gap-10">
            <div className="w-screen px-4 py-2 font-semibold text-gray-900 text-[20px]">
              Thông tin các phiên bản
            </div>

            {listVariants.map((varItem, varIndex) => (
              <div key={varIndex} className="w-full relative">
                {listVariants.length > 1 && (
                  <IconButton
                    onClick={() => removeVariant(varIndex)}
                    className="absolute top-0 right-0 text-red-500"
                  >
                    <IoMdClose size={20} />
                  </IconButton>
                )}

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
                      name="color"
                      value={varItem.color}
                      onChange={(e) => handleVariantChange(varIndex, e)}
                      type='text'
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
                        {listThumbnails[varIndex].preview ? (
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
                        {listThumbnails[varIndex].preview ? (
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

          <div className="flex flex-wrap shadow border-0 px-3 py-6 my-[10px] px-[5px] mx-[0px] bg-white rounded-[10px] gap-2">
            <div className="w-screen px-4 py-2 font-semibold text-gray-900 text-[20px]">
              Thông số kĩ thuật
            </div>
            <div className='w-full mx-5'>
              <Box sx={{ width: '100%', typography: 'body1' }}>
                <TabContext value={value}>
                  <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <TabList
                      onChange={handleChangeTab}
                      aria-label="lab API tabs example"
                      variant="scrollable"
                      scrollButtons="auto"
                      sx={{
                        // indicator (thanh gạch dưới)
                        '& .MuiTabs-indicator': {
                          height: 3,
                          borderRadius: 2,
                          background: 'linear-gradient(90deg, #4a2fcf, #6440F5)', // gradient
                        },
                        // tab root; đặt style chung cho tất cả tab
                        '& .MuiTab-root': {
                          textTransform: 'none',
                          fontWeight: 500,
                          // style khi được chọn
                          '&.Mui-selected': {
                            color: '#4a2fcf', // màu chữ khi active
                          },
                        },
                      }}
                    >
                      <Tab label="Điện thoại & máy tính bảng" value={1} />
                      <Tab label="Laptop" value={2} />
                      <Tab label="Màn hình rời" value={3} />
                      <Tab label="Pc" value={4} />
                      <Tab label="Tai nghe" value={5} />
                      <Tab label="Loa" value={6} />
                      <Tab label="Chuột" value={7} />
                      <Tab label="Bàn phím" value={8} />
                      <Tab label="Tùy chỉnh" value={9} />
                    </TabList>
                  </Box>
                  {Array.from({ length: 9 }, (_, i) => (
                    <TabPanel value={i + 1} key={i}>
                      {specifications.map((groupItem, groupIndex) => (
                        <div key={groupIndex} className="mb-6">
                          <div className="w-full font-semibold text-gray-900 text-[18px]">
                            {groupItem.nameGroup}
                          </div>

                          {(groupItem.specs || []).map((spec, specIndex) => {
                            const uniqueKey = `${groupIndex}-${specIndex}`;
                            return (
                              <div key={uniqueKey} className="flex my-5 gap-10">
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
                            )
                          })}

                          <div className="flex justify-center items-center">
                            <IconButton onClick={() => addSpecSlot(groupIndex)}>
                              <FaPlus />
                            </IconButton>
                          </div>
                        </div>
                      ))}

                    </TabPanel>
                  ))}
                </TabContext>
              </Box>
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
      {createMutation.isPending && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white p-6 rounded-xl flex flex-col items-center gap-3">
            <CircularProgress color="primary" />
            <p className="text-gray-700 font-medium">Đang tải lên dữ liệu sản phẩm...</p>
          </div>
        </div>
      )}
    </>
  )
}

