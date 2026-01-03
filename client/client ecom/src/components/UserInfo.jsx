import { Button } from "@mui/material";
import { useState, useEffect } from "react";
import { FaLeaf } from "react-icons/fa";

export default function UserInfo() {
    const [email, setEmail] = useState("");
    const [lastName, setLastName] = useState("");
    const [firstName, setFirstName] = useState("");
    const [password, setPassword] = useState("");
    const [username, setUsername] = useState("");
    const [phone, setPhone] = useState("");
    const [dob, setDob] = useState("");
    const [gender, setGender] = useState("");

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
                                <div className="flex justify-between w-[40%] text-[16px] border-b border-gray-300 p-2">
                                    <span className="text-gray-500">Tên người dùng</span>
                                    <span>Quan Sky</span>
                                </div>

                                <div className="flex justify-between w-[40%] text-[16px] border-b border-gray-300 p-2">
                                    <span className="text-gray-500">Email</span>
                                    <span>ducanh020304@gmail.com</span>
                                </div>

                                <div className="flex justify-between w-[40%] text-[16px] border-b border-gray-300 p-2">
                                    <span className="text-gray-500">Họ</span>
                                    <span>Trần</span>
                                </div>

                                <div className="flex justify-between w-[40%] text-[16px] border-b border-gray-300 p-2">
                                    <span className="text-gray-500">Tên</span>
                                    <span>Đức Anh</span>
                                </div>

                                <div className="flex justify-between w-[40%] text-[16px] border-b border-gray-300 p-2">
                                    <span className="text-gray-500">Giới tính</span>
                                    <span>Nam</span>
                                </div>

                                <div className="flex justify-between w-[40%] text-[16px] border-b border-gray-300 p-2">
                                    <span className="text-gray-500">Ngày sinh</span>
                                    <span>04/02/2003</span>
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
                                    <span>Tên người dùng</span>
                                    <input type="text" placeholder="Username" className="input-field" onChange={(e) => setUsername(e.target.value)} required />
                                </div>
                                <div className="w-[40%] flex flex-col gap-1">
                                    <span>Email</span>
                                    <input type="email" placeholder="Email" className="input-field" onChange={(e) => setEmail(e.target.value)} required />
                                </div>
                                <div className="w-[40%] flex gap-4">
                                    <div className="flex flex-col gap-1 flex-1">
                                        <span>Họ</span>
                                        <input type="text" placeholder="Họ" className="input-field" onChange={(e) => setLastName(e.target.value)} required />
                                    </div>
                                    <div className="flex flex-col gap-1 flex-1">
                                        <span>Tên</span>
                                        <input type="text" placeholder="Tên" className="input-field" onChange={(e) => setFirstName(e.target.value)} required />
                                    </div>
                                </div>
                                <div className="w-[40%] flex flex-col gap-1">
                                    <span>Số điện thoại</span>
                                    <input type="text" placeholder="Số điện thoại" className="input-field" onChange={(e) => setPhone(e.target.value)} />
                                </div>
                                <div className="w-[40%] flex flex-col gap-1">
                                    <label class="block font-medium text-gray-700 mb-2">Giới tính</label>
                                    <div className="flex gap-4">
                                        <label class="flex items-center cursor-pointer">
                                            <input type="radio" name="gender" checked class="sr-only peer" />
                                            <div class="relative w-5 h-5 rounded-full border-2 border-red-500 peer-checked:bg-red-500 peer-checked:border-red-500 transition-all">
                                                <div class="absolute inset-1 bg-white rounded-full peer-checked:scale-100 scale-0 transition-transform"></div>
                                            </div>
                                            <span class="ml-2 text-gray-900">Nam</span>
                                        </label>

                                        <label class="flex items-center cursor-pointer">
                                            <input type="radio" name="gender" class="sr-only peer" />
                                            <div class="relative w-5 h-5 rounded-full border-2 border-gray-300 peer-checked:bg-white peer-checked:border-gray-400 transition-all">
                                                <div class="absolute inset-1 bg-white rounded-full peer-checked:scale-0 scale-100 transition-transform peer-checked:hidden"></div>
                                            </div>
                                            <span class="ml-2 text-gray-600">Nữ</span>
                                        </label>
                                    </div>
                                </div>
                                <div className="w-[40%] flex flex-col gap-1">
                                    <label class="block font-medium text-gray-700 mb-2">Ngày sinh</label>
                                    <div class="flex gap-3">
                                        <div class="relative flex-1">
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
                                            <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                                <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </div>
                                        </div>


                                        <div class="relative flex-1">
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
                                            <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                                <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </div>
                                        </div>


                                        <div class="relative flex-1">
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
                                            <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                                <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <Button
                                    variant="contained"
                                    sx={{
                                        bgcolor: '#03A9F4',
                                        '&:hover': { bgcolor: '#03A9F4' },
                                        textTransform: 'none',
                                        fontSize: '18px'
                                    }}
                                    onClick={() => setUpdateInfo(false)}
                                >
                                    Cập nhật thông tin
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
} 