import { Button } from "@mui/material";
import { useState, useEffect } from "react";
import { FaLeaf } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { authApi } from "../services/authApi";
import { api } from "../libs/axios";
import { useQueryClient } from "@tanstack/react-query";

export default function UserInfoPage() {
    const { user, isUserLoading } = useAuth();
    const [email, setEmail] = useState("");
    const [lastName, setLastName] = useState("");
    const [firstName, setFirstName] = useState("");
    const [password, setPassword] = useState("");
    const [username, setUsername] = useState("");
    const [phone, setPhone] = useState("");
    const [dob, setDob] = useState("");
    const [sex, setSex] = useState("");
    const [avatar, setAvatar] = useState("");
    const [previewAvatar, setPreviewAvatar] = useState(null);

    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarUrl, setAvatarUrl] = useState("");
    const [uploading, setUploading] = useState(false);

    const [updateInfo, setUpdateInfo] = useState(false);
    const [day, setDay] = useState('1');
    const [month, setMonth] = useState('1');
    const [year, setYear] = useState('1990');
    const [days, setDays] = useState([]);

    // Tạo danh sách năm từ 1900 đến năm hiện tại
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: currentYear - 1900 + 1 }, (_, i) => currentYear - i);

    // Tạo danh sách tháng
    const months = Array.from({ length: 12 }, (_, i) => i + 1);

    // Tính số ngày trong tháng
    const getDaysInMonth = (m, y) => {
        return new Date(y, m, 0).getDate(); // 0 = ngày cuối tháng trước
    };

    const DEFAULT_AVATAR_BG = "#E3F2FD";

    function getInitial(name = "") {
        return name.charAt(0).toUpperCase();
    }

    // Cập nhật danh sách ngày khi tháng/năm thay đổi
    useEffect(() => {
        const maxDays = getDaysInMonth(parseInt(month), parseInt(year));
        const dayList = Array.from({ length: maxDays }, (_, i) => i + 1);
        setDays(dayList);

        // Nếu ngày hiện tại > số ngày trong tháng mới → đặt lại về 1
        if (parseInt(day) > maxDays) {
            setDay('1');
        }
    }, [month, year]);

    useEffect(() => {
        if (user) {
            console.log("checkavt: ", user)
            setUsername(user.username || "");
            setEmail(user.email || "");
            setFirstName(user.firstName || "");
            setLastName(user.lastName || "");
            setPhone(user.phone || "");
            setSex(user.sex || "");
            setDob(user.dob || "");
            setAvatar(user.avatarUrl || "");
        }
    }, [user]);

    async function handleAvatarChange(e) {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            alert("Vui lòng chọn file ảnh");
            return;
        }

        setPreviewAvatar(URL.createObjectURL(file));
        setAvatarFile(file);

        try {
            setUploading(true);

            const formData = new FormData();
            formData.append("avatarFile", file);

            const res = await api.post(
                "/media-service/media/user/avatar",
                formData
            );

            console.log("Upload avatar response:", res.data.result?.url);
            setAvatarUrl(res.data.result?.url);

        } catch (err) {
            console.error(
                "Upload avatar error:",
                err.response?.data || err
            );
            alert("Upload ảnh thất bại");
        } finally {
            setUploading(false);
        }
    }

    const queryClient = useQueryClient();

    async function handleUpdateProfile() {
        const pad = (n) => String(n).padStart(2, "0");
        const dob =
            year && month && day
                ? `${year}-${pad(month)}-${pad(day)}`
                : null;
        const payload = {
            username,
            email,
            firstName,
            lastName,
            phone,
            sex,
            dob,
            avatarUrl: avatarUrl || user.avatarUrl
        };
        console.log("payload: ", payload)
        await api.put("/profile-service/profile", payload);
        queryClient.invalidateQueries({ queryKey: ["user"] });
        setUpdateInfo(false);
    }

    useEffect(() => {
        if (user?.dob) {
            const date = new Date(user.dob);
            setDay(String(date.getDate()));
            setMonth(String(date.getMonth() + 1));
            setYear(String(date.getFullYear()));
        }
    }, [user]);

    function formatDate(dateString) {
        const date = new Date(dateString);

        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();

        return `${day}/${month}/${year}`;
    }

    if (isUserLoading) {
        return <div className="p-10 text-center">Đang tải thông tin...</div>;
    }

    if (!user) {
        return <div className="p-10 text-center">Không tìm thấy thông tin người dùng</div>;
    }


    return (
        <>
            <div className="flex flex-col gap-2">
                <div className="text-[29px]">
                    Thông tin cá nhân
                </div>

                <div className="bg-white rounded-[10px] shadow ">
                    <div className="w-full flex flex-col justify-center items-center p-5 gap-4">
                        {updateInfo === false ? (
                            <>
                                <div className="flex flex-col items-center gap-3">
                                    {avatar ? (
                                        <img
                                            src={previewAvatar ||
                                                avatarUrl ||
                                                user.avatarUrl ||
                                                ""
                                            }
                                            alt="avatar"
                                            className="w-24 h-24 rounded-full object-cover border"
                                        />
                                    ) : (
                                        <div
                                            className="w-24 h-24 rounded-full flex items-center justify-center text-white text-3xl font-bold"
                                            style={{ backgroundColor: DEFAULT_AVATAR_BG, color: "#1976D2" }}
                                        >
                                            {getInitial(firstName || username)}
                                        </div>
                                    )}
                                </div>
                                <div className="flex justify-between w-[40%] text-[16px] border-b border-gray-300 p-2">
                                    <span className="text-gray-500">Tên người dùng</span>
                                    <span>{username}</span>
                                </div>

                                <div className="flex justify-between w-[40%] text-[16px] border-b border-gray-300 p-2">
                                    <span className="text-gray-500">Email</span>
                                    <span>{email}</span>
                                </div>

                                <div className="flex justify-between w-[40%] text-[16px] border-b border-gray-300 p-2">
                                    <span className="text-gray-500">Họ</span>
                                    <span>{firstName}</span>
                                </div>

                                <div className="flex justify-between w-[40%] text-[16px] border-b border-gray-300 p-2">
                                    <span className="text-gray-500">Tên</span>
                                    <span>{lastName}</span>
                                </div>

                                <div className="flex justify-between w-[40%] text-[16px] border-b border-gray-300 p-2">
                                    <span className="text-gray-500">Giới tính</span>
                                    <span>{sex}</span>
                                </div>

                                <div className="flex justify-between w-[40%] text-[16px] border-b border-gray-300 p-2">
                                    <span className="text-gray-500">Ngày sinh</span>
                                    <span>{user.dob ? formatDate(user.dob) : "—"}</span>
                                </div>

                                <Button
                                    variant="contained"
                                    sx={{
                                        bgcolor: '#03A9F4',
                                        '&:hover': { bgcolor: '#03A9F4' },
                                        textTransform: 'none',
                                        fontSize: '18px'
                                    }}
                                    onClick={() => setUpdateInfo(true)}
                                >
                                    Chỉnh sửa thông tin
                                </Button>
                            </>
                        ) : (
                            <>
                                <div className="w-[40%] flex flex-col gap-1">
                                    <div className="flex flex-col items-center gap-3">
                                        {previewAvatar ? (
                                            <img
                                                src={previewAvatar}
                                                alt="preview"
                                                className="w-24 h-24 rounded-full object-cover border"
                                            />
                                        ) : avatar ? (
                                            <img
                                                src={avatar}
                                                alt="avatar"
                                                className="w-24 h-24 rounded-full object-cover border"
                                            />
                                        ) : (
                                            <div
                                                className="w-24 h-24 rounded-full flex items-center justify-center text-white text-3xl font-bold"
                                                style={{ backgroundColor: DEFAULT_AVATAR_BG, color: "#1976D2" }}
                                            >
                                                {getInitial(firstName || username)}
                                            </div>
                                        )}

                                        <label className="cursor-pointer text-blue-500 text-sm">
                                            Chọn ảnh đại diện
                                            <input
                                                type="file"
                                                accept="image/*"
                                                hidden
                                                onChange={handleAvatarChange}
                                            />
                                        </label>
                                    </div>

                                </div>
                                <div className="w-[40%] flex gap-4">
                                    <div className="flex flex-col gap-1 flex-1">
                                        <span>Họ</span>
                                        <input type="text" placeholder="Họ" className="input-field" onChange={(e) => setFirstName(e.target.value)} required />
                                    </div>
                                    <div className="flex flex-col gap-1 flex-1">
                                        <span>Tên</span>
                                        <input type="text" placeholder="Tên" className="input-field" onChange={(e) => setLastName(e.target.value)} required />
                                    </div>
                                </div>
                                <div className="w-[40%] flex flex-col gap-1">
                                    <span>Số điện thoại</span>
                                    <input type="text" placeholder="Số điện thoại" className="input-field" onChange={(e) => setPhone(e.target.value)} />
                                </div>
                                <div className="w-[40%] flex flex-col gap-1">
                                    <label className="block font-medium text-gray-700 mb-2">Giới tính</label>
                                    <div className="flex gap-4">
                                        <label className="flex items-center gap-2">
                                            <input
                                                type="radio"
                                                name="sex"
                                                value="Nam"
                                                checked={sex === "Nam"}
                                                onChange={(e) => setSex(e.target.value)}
                                            />
                                            Nam
                                        </label>
                                        <label className="flex items-center gap-2">
                                            <input
                                                type="radio"
                                                name="sex"
                                                value="Nữ"
                                                checked={sex === "Nữ"}
                                                onChange={(e) => setSex(e.target.value)}
                                            />
                                            Nữ
                                        </label>
                                    </div>
                                </div>
                                <div className="w-[40%] flex flex-col gap-1">
                                    <label className="block font-medium text-gray-700 mb-2">Ngày sinh</label>
                                    <div className="flex gap-3">
                                        <div className="relative flex-1">
                                            <select
                                                value={day}
                                                onChange={(e) => setDay(e.target.value)}
                                                className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-10 text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                            >
                                                <option value="" disabled>Ngày</option>
                                                {days.map((d) => (
                                                    <option key={d} value={d}>{d}</option>
                                                ))}
                                            </select>
                                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </div>
                                        </div>


                                        <div className="relative flex-1">
                                            <select
                                                value={month}
                                                onChange={(e) => setMonth(e.target.value)}
                                                className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-10 text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                            >
                                                <option value="" disabled>Tháng</option>
                                                {months.map((m) => (
                                                    <option key={m} value={m}>{m}</option>
                                                ))}
                                            </select>
                                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </div>
                                        </div>


                                        <div className="relative flex-1">
                                            <select
                                                value={year}
                                                onChange={(e) => setYear(e.target.value)}
                                                className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-10 text-red-600 font-medium focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                            >
                                                <option value="" disabled>Năm</option>
                                                {years.map((y) => (
                                                    <option key={y} value={y}>{y}</option>
                                                ))}
                                            </select>
                                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <Button
                                    variant="contained"
                                    disabled={uploading}
                                    sx={{
                                        bgcolor: '#03A9F4',
                                        '&:hover': { bgcolor: '#03A9F4' },
                                        textTransform: 'none',
                                        fontSize: '18px'
                                    }}
                                    onClick={handleUpdateProfile}
                                >
                                    {uploading ? "Đang upload ảnh..." : "Cập nhật thông tin"}
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}
