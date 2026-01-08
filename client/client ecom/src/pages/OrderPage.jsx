import { useState } from "react";

export default function OrderPage() {
    const [active, setActive] = useState("Tất cả");

    const tabs = ["Tất cả", "Đang xử lý", "Đang giao", "Hoàn tất", "Đã hủy"];

    return (
        <>
            <div className="flex flex-col gap-3">
                <div className="w-full flex justify-between items-center">
                    <div className="text-[29px]">
                        Đơn hàng của tôi
                    </div>

                    <div class="flex items-center w-full max-w-md bg-white rounded-full shadow px-4 py-2">
                        <input
                            type="text"
                            placeholder="Tìm theo tên đơn, mã đơn hoặc tên sản phẩm"
                            class="flex-grow outline-none text-gray-600 placeholder-gray-400 text-sm"
                        />
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            class="w-5 h-5 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
                        </svg>
                    </div>
                </div>

                <div className="flex items-center justify-between bg-white rounded-t-lg shadow pt-3">
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActive(tab)}
                            className={`pb-3 flex-1 font-medium transition ${active === tab
                                ? "text-[#03A9F4] border-b-2 border-[#03A9F4]"
                                : "text-gray-500 hover:text-gray-700"
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <div className="bg-white rounded-[10px] shadow w-full flex flex-col justify-center items-center p-5 gap-4">

                </div>
            </div>
        </>
    )
}
