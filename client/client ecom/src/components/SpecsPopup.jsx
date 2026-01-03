import { useState, useEffect, useRef } from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import { motion, AnimatePresence } from 'framer-motion';

export default function SpecsPopup({ openSpecsPopup, setOpenSpecsPopup }) {
    const [activeTab, setActiveTab] = useState(0);
    const containerRef = useRef(null);
    const headerRefs = useRef([]);
    const topHeaderRef = useRef(null); // ref cho header trên cùng (logo + title)
    const tabsRef = useRef(null);      // ref cho thanh tab sticky
    const [isScrollingByClick, setIsScrollingByClick] = useState(false);

    //FAKE DATA
    const specsData = [
        {
            key: "Thiết kế & Trọng lượng",
            value: [
                { key: "Trọng lượng sản phẩm", value: "231 g" },
                { key: "Chuẩn kháng nước / Bụi bẩn", value: "IP68" },
                { key: "Chất liệu", value: "Khung máy: Nhôm nguyên khối\nMặt lưng máy: Ceramic Shield" },
            ]
        },
        {
            key: "Bộ xử lý",
            value: [
                { key: "Phiên bản CPU", value: "Apple A19 Pro" },
                { key: "Loại CPU", value: "12-Core" },
                { key: "Số nhân", value: "6" },
            ]
        },
        {
            key: "RAM",
            value: [
                { key: "Dung lượng RAM", value: "12 GB" },
            ]
        },
        {
            key: "Màn hình",
            value: [
                { key: "Kích thước màn hình", value: "6.9 inch" },
                { key: "Công nghệ màn hình", value: "OLED" },
                { key: "Chuẩn màn hình", value: "Super Retina XDR" },
                { key: "Độ phân giải", value: "2868 x 1320 pixel" },
            ]
        },
        {
            key: "Đồ họa",
            value: [
                { key: "Chip đồ họa (GPU)", value: "Apple GPU 6-core" },
            ]
        },
        {
            key: "Lưu trữ",
            value: [
                { key: "Dung lượng", value: "256 GB" },
            ]
        },
        {
            key: "Camera sau",
            value: [
                { key: "Số camera sau", value: "3 camera" },
                { key: "Độ phân giải", value: "48MP + 12MP + 12MP" },
                { key: "Quay phim", value: "8K@24fps, 4K@60fps" },
            ]
        },
        {
            key: "Giao tiếp và kết nối",
            value: [
                { key: "Số khe SIM", value: "1 Nano SIM & 1 eSIM" },
                { key: "Hỗ trợ mạng", value: "5G" },
                { key: "Cổng giao tiếp", value: "USB-C" },
                { key: "Wi-Fi", value: "Wi-Fi 7" },
                { key: "Bluetooth", value: "Bluetooth 5.4" },
                { key: "NFC", value: "Có" },
            ]
        },
        {
            key: "Thông tin pin và sạc",
            value: [
                { key: "Loại pin", value: "Li-Ion" },
                { key: "Dung lượng pin", value: "Khoảng 5000 mAh" },
                { key: "Sạc nhanh", value: "45W có dây, 25W không dây (MagSafe)" },
            ]
        },
        {
            key: "Hệ điều hành",
            value: [
                { key: "Tên OS", value: "iOS" },
                { key: "Phiên bản OS", value: "iOS 19" },
            ]
        },
        {
            key: "Tính năng khác",
            value: [
                { key: "Bảo mật", value: "Face ID" },
                { key: "Cảm biến", value: "Cảm biến vân tay trong màn hình (dự kiến)" },
                { key: "Chống rung", value: "Sensor-shift OIS" },
            ]
        },
    ];

    //CHẶN CUỘN TRANG KHI MỞ MODAL
    useEffect(() => {
        if (openSpecsPopup) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [openSpecsPopup]);


    // Theo dõi scroll → auto highlight tab
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleScroll = () => {
            // NẾU ĐANG SCROLL DO CLICK → BỎ QUA, KHÔNG ĐỔI TAB
            if (isScrollingByClick) return;

            const scrollTop = container.scrollTop;

            // Lấy lại chiều cao thực tế mỗi lần scroll
            const headerHeight = topHeaderRef.current?.offsetHeight || 0;
            const tabsHeight = tabsRef.current?.offsetHeight || 0;
            const offset = headerHeight + tabsHeight + 20;

            let currentActive = 0;

            headerRefs.current.forEach((ref, index) => {
                if (ref && scrollTop + offset >= ref.offsetTop) {
                    currentActive = index;
                }
            });

            // Nếu đang ở cuối trang → giữ nguyên tab hiện tại (không nhảy về tab dài)
            const isAtBottom = Math.abs(
                container.scrollHeight - container.clientHeight - scrollTop
            ) < 50;

            if (!isAtBottom || scrollTop === 0) {
                setActiveTab(currentActive);
            }
            // Nếu isAtBottom → không đổi activeTab → giữ tab cuối cùng người dùng chọn
        };

        container.addEventListener('scroll', handleScroll);
        handleScroll();

        return () => container.removeEventListener('scroll', handleScroll);
    }, [openSpecsPopup, isScrollingByClick]); // ← QUAN TRỌNG: thêm dependency

    // Click tab → scroll mượt đến phần đó
    const scrollToTab = (index) => {
        setActiveTab(index);
        setIsScrollingByClick(true);
        const headerEl = headerRefs.current[index];

        const headerHeight = topHeaderRef.current?.offsetHeight || 0;
        const tabsHeight = tabsRef.current?.offsetHeight || 0;

        const offset = headerHeight + tabsHeight + 12;

        if (headerEl && containerRef.current) {
            containerRef.current.scrollTo({
                top: headerEl.offsetTop - offset,
                behavior: 'smooth'
            });

            // Tắt cờ sau khi scroll xong
            setTimeout(() => {
                setIsScrollingByClick(false);
            }, 600);
        }
    };

    return (
        <>
            <AnimatePresence>
                {openSpecsPopup && (
                    <div className="fixed inset-0 z-50 flex justify-end items-start">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.4 }}
                            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
                            onClick={() => setOpenSpecsPopup(false)}
                        />

                        {/* Popup */}
                        <motion.div
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{
                                type: "spring",
                                damping: 30,
                                stiffness: 300,
                            }}
                            className="relative bg-white w-[40%] h-full shadow-2xl overflow-hidden"
                        >
                            {/* Header */}
                            <div ref={topHeaderRef} className="p-6 border-b border-gray-300 sticky top-0 bg-white z-10">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <h3 className="text-lg font-semibold">Thông số kỹ thuật</h3>
                                    </div>
                                    <button
                                        onClick={() => setOpenSpecsPopup(false)}
                                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            {/* Sticky Tabs */}
                            <div ref={tabsRef} className="border-b border-gray-300 bg-white sticky top-[73px] z-20">
                                <Box sx={{ bgcolor: 'white' }}>
                                    <Tabs
                                        value={activeTab}
                                        onChange={(event, newValue) => {
                                            setActiveTab(newValue);
                                            scrollToTab(newValue);
                                        }}
                                        variant="scrollable"
                                        scrollButtons="auto"
                                        aria-label="scrollable tabs"
                                        TabIndicatorProps={{
                                            style: {
                                                backgroundColor: '#ef4444', // đỏ như Shopee
                                                height: '3px',
                                                borderRadius: '2px',
                                            }
                                        }}
                                        sx={{
                                            '& .MuiTabs-scrollButtons': {
                                                '&.Mui-disabled': { opacity: 0.3 },
                                            },
                                            '& .MuiTab-root': {
                                                textTransform: 'none',
                                                fontWeight: 500,
                                                fontSize: '0.875rem',
                                                minWidth: 'auto',
                                                padding: '12px 20px',
                                            },
                                            '& .Mui-selected': {
                                                color: '#ef4444 !important',
                                                fontWeight: 'bold',
                                            },
                                        }}
                                    >
                                        {specsData.map((item, index) => (
                                            <Tab
                                                key={index}
                                                label={item.key}
                                                disableRipple
                                                onClick={() => {
                                                    // Dùng setTimeout để đợi MUI cập nhật DOM
                                                    setTimeout(() => {
                                                        const container = document.querySelector('.MuiTabs-scroller');
                                                        const active = container?.querySelector('.Mui-selected');
                                                        if (container && active) {
                                                            container.scrollTo({
                                                                left: active.offsetLeft - 20,
                                                                behavior: 'smooth'
                                                            });
                                                        }
                                                    }, 100);
                                                }}
                                            />
                                        ))}
                                    </Tabs>
                                </Box>
                            </div>

                            {/* Nội dung tab hiện tại */}
                            <div ref={containerRef} className="p-6 flex flex-col gap-4 overflow-y-auto h-[calc(100vh-146px)] no-scrollbar">
                                {specsData.map((tabItem, tabIndex) => (
                                    <div key={tabIndex} ref={(el) => (headerRefs.current[tabIndex] = el)} className="space-y-2">
                                        {/* Tiêu đề tab (ví dụ: "Thiết kế & Trọng lượng") */}
                                        <h4 className="font-semibold text-gray-900 ">
                                            {tabItem.key}
                                        </h4>

                                        {/* Lặp qua từng dòng thông số trong tab đó */}
                                        {tabItem.value.map((spec, specIndex) => (
                                            <SpecRow
                                                key={specIndex}
                                                label={spec.key}
                                                value={
                                                    spec.value.includes('\n') ? (
                                                        <div className="text-right leading-relaxed">
                                                            {spec.value.split('\n').map((line, i) => (
                                                                <div key={i}>{line}</div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        spec.value
                                                    )
                                                }
                                            />
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}

// Component hiển thị 1 dòng thông số
function SpecRow({ label, value }) {
    return (
        <div className="flex justify-between py-2 border-b border-dotted border-gray-200  last:border-0">
            <span className="text-sm text-gray-600 max-w-[50%]">{label}</span>
            <span className="text-sm font-medium text-gray-900 text-right flex-1">
                {value}
            </span>
        </div>
    );
}