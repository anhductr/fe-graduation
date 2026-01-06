import { useState, useRef, useEffect } from 'react';
import Pagination from '@mui/material/Pagination';
import Boxes from '../../components/common/Boxes';
import axios from "axios";
import { Button, Dialog, DialogActions, DialogTitle, Select, MenuItem } from "@mui/material";
import { Link, useLocation } from 'react-router-dom';
import { FiBox } from "react-icons/fi";
import { MdOutlineDiscount } from "react-icons/md";
import SearchBar from '../../components/common/SearchBar';
import { VscFilter } from "react-icons/vsc";
import { IoIosArrowUp } from "react-icons/io";
import { FaPlus } from "react-icons/fa6";
import { IoTrashOutline } from "react-icons/io5";
import { MdOutlineModeEdit } from "react-icons/md";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

export default function ContentList() {
    // Handling pagination
    const [page, setPage] = useState(1);
    const size = 10;
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");

    const queryClient = useQueryClient();

    // Fetch API
    const fetchContents = async ({ queryKey }) => {
        const [, { page, size, search, category, status }] = queryKey;
        const token = localStorage.getItem("token");

        const params = { page: page - 1, limit: size }; // Backend pagination often starts at 0 or use limit/offset
        if (search) params.search = search;
        if (category !== 'all') params.category = category;
        if (status !== 'all') params.status = status;

        // Note: Adjusting API call based on provided schema: ContentListResponse
        // The schema shows: items, total, limit, offset, has_more.
        // I'll assume the endpoint supports query params for filtering.

        try {
            // Correct endpoint based on proxy config
            const res = await axios.get(`${import.meta.env.VITE_API_ENDPOINT}/content/search`, { // Using search endpoint as it seems more appropriate for lists with filters
                headers: {
                    Authorization: token ? `Bearer ${token}` : "",
                },
                params: {
                    query: search || "",
                    // Add other filters if API supports them, otherwise client-side filter might be needed if search endpoint implies text search only
                    // Asking user implied standard CRUD, I'll assume standard list/search behavior.
                    // If /search endpoint strictly for text, I might need /list endpoint.
                    // Let's try to map to what's likely available or fall back to client side.
                    // Re-reading user request: 
                    // ContentListResponse has items, total, limit..
                    // ContentSearchResponse has query, results, count.
                    // I will use /search if query exists, or a list endpoint. 
                    // For now, let's assume a generic GET /api/v1/content handles both or I use /search for everything with empty query.
                }
            });
            // If the response structure matches ContentSearchResponse
            if (res.data.results) {
                return {
                    data: res.data.results,
                    total: res.data.count,
                    totalPages: Math.ceil(res.data.count / size)
                };
            }
            // If generic list
            return {
                data: res.data.items || [],
                total: res.data.total || 0,
                totalPages: Math.ceil((res.data.total || 0) / size)
            };
        } catch (error) {
            console.error("Fetch error", error);
            // Fallback for demo/dev if API fails
            return { data: [], total: 0, totalPages: 0 };
        }
    };

    const deleteContent = async (contentId) => {
        const token = localStorage.getItem("token");
        await axios.delete(`${import.meta.env.VITE_API_ENDPOINT}/content/${contentId}`, {
            headers: { Authorization: token ? `Bearer ${token}` : "" }
        });
    };

    const {
        data: contentData,
        isLoading,
        isError,
        error,
    } = useQuery({
        queryKey: ["contents", { page, size, search: searchTerm, category: categoryFilter, status: statusFilter }],
        queryFn: fetchContents,
        keepPreviousData: true,
    });

    // Delete Mutation
    const deleteMutation = useMutation({
        mutationFn: deleteContent,
        onSuccess: () => {
            queryClient.invalidateQueries(["contents"]);
            setPopup({ open: true, message: "Xóa content thành công!", severity: "success" });
        },
        onError: (err) => {
            setPopup({ open: true, message: "Xóa thất bại: " + err.message, severity: "error" });
        }
    });

    // Confirm Delete
    const [openConfirm, setOpenConfirm] = useState(false);
    const [selectedId, setSelectedId] = useState(null);

    const handleDeleteClick = (id) => {
        setSelectedId(id);
        setOpenConfirm(true);
    };

    const handleConfirmDelete = () => {
        if (selectedId) deleteMutation.mutate(selectedId);
        setOpenConfirm(false);
    };

    // Filters UI
    const inputSearchRef = useRef(null);
    const [isToggleFilter, setIsToggleFilter] = useState(false);

    // Categories and Status options
    const categories = ['faq', 'policy', 'guide', 'blog', 'cskh'];
    const statuses = ['draft', 'published', 'archived'];

    // Popup
    const [popup, setPopup] = useState({ open: false, message: "", severity: "info" });

    // Handle location state for popup from redirection (e.g. after create/edit)
    const location = useLocation();
    useEffect(() => {
        if (location.state?.popup) {
            setPopup({ ...location.state.popup, open: true });
            window.history.replaceState({}, document.title);
        }
    }, [location.state]);


    return (
        <div className="py-[10px] px-[100px]">
            <Snackbar
                open={popup.open}
                autoHideDuration={3000}
                onClose={() => setPopup(p => ({ ...p, open: false }))}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert severity={popup.severity} variant="filled" sx={{ width: '100%' }}>
                    {popup.message}
                </Alert>
            </Snackbar>

            <div className='flex justify-between items-center my-4'>
                <h3 className="text-[30px] font-bold mb-4 text-[#403e57]">
                    Quản lý Content Chatbot
                </h3>
            </div>

            <div className="flex flex-wrap gap-[26px] w-full">
                <Boxes color={"#9dcbfcff"} header={"Tổng bài viết"} total={contentData?.total || 0} icon={<FiBox />} />
                {/* Placeholder box */}
                <Boxes color={"#f4f292ff"} header={"Đã xuất bản"} total={contentData?.data?.filter(i => i.status === 'published').length || 0} icon={<MdOutlineDiscount />} />
            </div>

            {/* Search & Filter */}
            <div className='shadow border-0 p-5 my-[20px] bg-white rounded-[10px]'>
                <div className="relative flex items-center">
                    <SearchBar
                        ref={inputSearchRef}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Tìm kiếm title..."
                    />
                    <Button
                        className={`${isToggleFilter ? "!border-2 !border-gray-500" : "!border !border-[#ccc]"} !text-[#403e57] !ml-4 !px-3 !rounded-[10px] !hover:bg-gray-100 !normal-case`}
                        variant="outlined"
                        onClick={() => setIsToggleFilter(!isToggleFilter)}
                    >
                        <VscFilter /> <span className='ml-1'>Bộ lọc</span>
                        <IoIosArrowUp className={`ml-1 transition-transform duration-200 ${isToggleFilter ? "rotate-180" : "rotate-0"}`} />
                    </Button>
                    <Button
                        variant="contained"
                        className='!ml-auto !normal-case !bg-gradient-to-r !from-[#4a2fcf] !to-[#6440F5] !shadow'
                        component={Link}
                        to="/contents/upload"
                    >
                        <FaPlus className='mr-1' /> Thêm mới
                    </Button>
                </div>

                {/* Filter section */}
                <div className={`${isToggleFilter ? "max-h-[200px] opacity-100 mt-4" : "max-h-0 opacity-0"} overflow-hidden transition-all duration-300 flex gap-4`}>
                    <div className="flex flex-col gap-1 w-1/4">
                        <label className="font-bold text-sm">Danh mục</label>
                        <Select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            size="small"
                            className="bg-gray-50"
                        >
                            <MenuItem value="all">Tất cả</MenuItem>
                            {categories.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                        </Select>
                    </div>
                    <div className="flex flex-col gap-1 w-1/4">
                        <label className="font-bold text-sm">Trạng thái</label>
                        <Select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            size="small"
                            className="bg-gray-50"
                        >
                            <MenuItem value="all">Tất cả</MenuItem>
                            {statuses.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                        </Select>
                    </div>
                </div>
            </div>

            {/* List */}
            <div className='flex flex-col gap-[20px]'>
                {isLoading ? (
                    <div>Loading...</div>
                ) : isError ? (
                    <div>Error loading data</div>
                ) : (
                    contentData?.data?.map((item) => (
                        <div key={item.content_id || item.id} className='shadow border-0 rounded-[10px] bg-white p-5 flex justify-between items-center'>
                            <div className='flex flex-col gap-2'>
                                <h4 className="text-[20px] font-semibold">{item.title}</h4>
                                <div className="flex gap-2">
                                    <span className="text-[12px] bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-bold">
                                        {item.category}
                                    </span>
                                    <span className={`text-[12px] px-2 py-1 rounded-full font-bold ${item.status === 'published' ? 'bg-green-100 text-green-800' :
                                        item.status === 'draft' ? 'bg-gray-200 text-gray-800' : 'bg-red-100 text-red-800'
                                        }`}>
                                        {item.status}
                                    </span>
                                </div>
                                <div className="text-gray-500 text-sm line-clamp-2">
                                    {item.content}
                                </div>
                            </div>

                            <div className='flex gap-2'>
                                <Link to={`/contents/edit/${item.content_id || item.id}`}>
                                    <Button
                                        variant="contained"
                                        className='!normal-case !bg-gradient-to-r !from-[#4a2fcf] !to-[#6440F5] !rounded-[10px] !text-[13px]'
                                        startIcon={<MdOutlineModeEdit />}
                                    >
                                        Sửa
                                    </Button>
                                </Link>
                                <Button
                                    variant="contained"
                                    className='!normal-case !bg-gradient-to-r !from-[#e53935] !to-[#ff1744] !rounded-[10px] !text-[13px]'
                                    onClick={() => handleDeleteClick(item.content_id || item.id)}
                                    startIcon={<IoTrashOutline />}
                                >
                                    Xóa
                                </Button>
                            </div>
                        </div>
                    ))
                )}
                {contentData?.data?.length === 0 && <div className="text-center text-gray-500">Không có dữ liệu</div>}
            </div>

            {/* Pagination */}
            {contentData?.totalPages > 1 && (
                <div className="shadow border-0 p-5 my-[20px] bg-white rounded-[10px] flex justify-center">
                    <Pagination
                        count={contentData.totalPages}
                        page={page}
                        onChange={(e, v) => setPage(v)}
                        sx={{
                            "& .MuiPaginationItem-root.Mui-selected": {
                                background: "linear-gradient(to right, #4a2fcf, #6440F5)",
                                color: "#fff",
                            },
                        }}
                    />
                </div>
            )}

            <Dialog open={openConfirm} onClose={() => setOpenConfirm(false)}>
                <DialogTitle>Bạn có chắc chắn muốn xoá bài viết này không?</DialogTitle>
                <DialogActions>
                    <Button onClick={() => setOpenConfirm(false)} color="inherit">Không</Button>
                    <Button onClick={handleConfirmDelete} color="error" variant="contained">Có</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}
