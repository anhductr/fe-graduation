import { useEffect, useState, useRef } from 'react';
import Pagination from '@mui/material/Pagination';
import Boxes from '../../components/common/Boxes';
import axios from "axios";
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    IconButton, Paper, Dialog, DialogActions, DialogTitle, Button
} from "@mui/material";
import { Link } from 'react-router';
import { MdDelete } from "react-icons/md";
import { IoEye } from "react-icons/io5";
import { FaRegUser } from "react-icons/fa6";
import { MdCardMembership } from "react-icons/md";
import SearchBar from '../../components/common/SearchBar';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { useLocation } from "react-router-dom";


export default function UserList() {
    const inputSearchRef = useRef(null);
    const token = localStorage.getItem("token"); // lấy token nếu cần
    const queryClient = useQueryClient();

    //api
    const fetchUsers = async () => {
        const res = await axios.get(
            "/api/v1/user-service/users/get-all",
            {
                headers: {
                    Authorization: token ? `Bearer ${token}` : "",
                },
            }
        );

        console.log("API response:", res.data);
        return res.data.result;
    };

    const deleteUser = async (userId) => {
        const res = await axios.delete(
            `/api/v1/user-service/users/${userId}`,
            {
                headers: {
                    Authorization: token ? `Bearer ${token}` : "",
                }
            }
        );
        console.log("Xóa thành công:", res.data);
        return res.data;
    }

    //user querry
    const { data, isLoading: isLoadingUsers, isError: isErrorUsers, error: errorUsers } = useQuery({
        queryKey: ["users"],
        queryFn: fetchUsers,
        refetchOnMount: "always",
    });

    // Khi có dữ liệu:
    const users = data?.data || [];
    const totalUsers = data?.totalElements || 0;
    const totalPage = data?.totalPage || 1;

    const deleteMutation = useMutation({
        mutationFn: deleteUser,
        onSuccess: (res) => {
            queryClient.invalidateQueries(["users"]);
            setPopup((prep) => ({
                ...prep,
                open: true,
                message: "Xóa người dùng thành công!",
                severity: "success",
            })
            )
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
                message: "Xóa người dùng thất bại!",
                severity: "error"
            }))
        }
    })

    //modal xóa
    const [openConfirm, setOpenConfirm] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const handleDeleteClick = (userId) => {
        setSelectedUserId(userId);
        setOpenConfirm(true);
    };
    const handleConfirmDelete = () => {
        if (selectedUserId) {
            deleteMutation.mutate(selectedUserId);
        }
        setOpenConfirm(false);
        setSelectedUserId(null);
    };
    const handleCancelDelete = () => {
        setOpenConfirm(false);
        setSelectedUserId(null);
    };

    //popup thông báo
    const [popup, setPopup] = useState({
        open: false,
        vertical: 'top',
        horizontal: 'center',
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
        if (isLoadingUsers) {
            setPopup({
                open: true,
                vertical: "top",
                horizontal: "center",
                severity: "info",
                message: "Đang tải danh sách người dùng...",
            });
        } else if (isErrorUsers) {
            // Lấy chi tiết lỗi từ server (nếu có)
            const serverError = isErrorUsers?.response?.data?.message;
            const serverDetail = isErrorUsers?.response?.data?.error; // nếu backend trả thêm field này
            const fallbackMessage = isErrorUsers?.message || "Không xác định";

            // Log đầy đủ ra console để debug
            console.error("Chi tiết lỗi từ server:", isErrorUsers);

            setPopup({
                open: true,
                vertical: "top",
                horizontal: "center",
                severity: "error",
                message: `Lỗi khi tải danh sách người dùng: ${serverError || serverDetail || fallbackMessage}`,
            });
        } else {
            // Khi load xong thì tắt snackbar loading
            setPopup((prev) => ({ ...prev, open: false }));
        }
    }, [isLoadingUsers, isErrorUsers, errorUsers]);

    return (
        <>
            <div className="py-[10px] px-[100px]">
                <Snackbar
                    anchorOrigin={{ vertical, horizontal }}
                    open={open}
                    key={vertical + horizontal}
                    autoHideDuration={isLoadingUsers ? null : 3000}
                    onClose={() => setPopup((prev) => ({ ...prev, open: false }))}
                >
                    <Alert
                        severity={popup.severity ?? "info"}   // dùng ?? để tránh lỗi undefined
                        variant="filled"
                        sx={{ width: "100%" }}
                    >
                        {popup.message || ""}
                    </Alert>
                </Snackbar>

                <div className='flex justify-between items-center my-4'>
                    <h3 className="text-[30px] font-bold mb-4 text-[#403e57]">
                        Quản lý người dùng
                    </h3>
                </div>

                <div className="flex flex-wrap gap-[26px] w-full">
                    <Boxes color={"#81faf8ff"} header={"Tổng khách hàng"} icon={<FaRegUser />} ></Boxes>
                    <Boxes color={"#e8806bff"} header={"Tổng thành viên"} icon={<MdCardMembership />} ></Boxes>
                </div>

                {/* search bar + filter */}
                <div
                    className="shadow border-0 p-5 my-[20px] bg-white rounded-[10px] relative"
                    onClick={(e) => {
                        if (inputSearchRef.current && e.target !== inputSearchRef.current) {
                            inputSearchRef.current.blur(); // click ngoài -> blur input
                        }
                    }}
                >
                    <SearchBar ref={inputSearchRef} />
                </div>

                <div className="shadow border-0 p-5 my-[20px] mx-[0px] bg-white rounded-[10px]">
                    {/* table */}
                    <div className='mt-3'>
                        <TableContainer component={Paper} sx={{
                            borderTop: "1px solid #e0e0e0",
                            borderRight: "1px solid #e0e0e0",
                            borderLeft: "1px solid #e0e0e0",
                        }}>
                            <Table>
                                <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
                                    <TableRow>
                                        <TableCell>Tên người dùng</TableCell>
                                        <TableCell>Email</TableCell>
                                        <TableCell align="center">Thao tác</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {users.map((user) => (
                                        <TableRow>
                                            <TableCell >{user.username}</TableCell>
                                            <TableCell >{user.email}</TableCell>
                                            <TableCell align="center">
                                                <Link to={`/users/users-list/users-view/${user.username}`}>
                                                    <IconButton size="small"><IoEye /></IconButton>
                                                </Link>
                                                <IconButton size="small"><MdDelete /></IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        <div className='flex justify-center pb-[20px] pt-[30px]'>
                            <Pagination
                                count={10}
                                sx={{
                                    "& .MuiPaginationItem-root.Mui-selected": {
                                        background: "linear-gradient(to right, #4a2fcf, #6440F5)",
                                        color: "#fff",
                                    },
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>
            <Dialog
                open={openConfirm}
                onClose={handleCancelDelete}
            >
                <DialogTitle>Bạn có chắc chắn muốn xoá danh mục này không?</DialogTitle>
                <DialogActions>
                    <Button onClick={handleCancelDelete} color="inherit">
                        Không
                    </Button>
                    <Button onClick={handleConfirmDelete} color="error" variant="contained">
                        Có
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    )
}