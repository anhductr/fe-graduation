import { useState, useEffect, useRef, useMemo } from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import { motion, AnimatePresence } from 'framer-motion';

export default function SpecsPopup({ openSpecsPopup, setOpenSpecsPopup, specifications }) {
    const [activeTab, setActiveTab] = useState(0);
    const containerRef = useRef(null);
    const headerRefs = useRef([]);
    const topHeaderRef = useRef(null); // ref cho header trên cùng (logo + title)
    const tabsRef = useRef(null);      // ref cho thanh tab sticky
    const [isScrollingByClick, setIsScrollingByClick] = useState(false);

    //FAKE DATA
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

    // Process specifications from prop
    const specsData = useMemo(() => {

        if (!specifications || specifications.length === 0) return [];


        // Group by 'group' field
        const groups = {};
        specifications.forEach(spec => {
            // Support multiple possible key names from backend
            let groupName = spec.group || spec.groupName || spec.attributeGroup || "Thông số khác";
            // Map to Vietnamese if exists
            groupName = groupMap[groupName] || groupName;
            const key = spec.key || spec.name || spec.attributeName || spec.specName || "N/A";
            const value = spec.value || spec.attributeValue || spec.specValue || "N/A";

            if (!groups[groupName]) {
                groups[groupName] = [];
            }
            groups[groupName].push({
                key: key,
                value: value
            });
        });

        // Convert to array format expected by UI
        return Object.keys(groups).map(groupName => ({
            key: groupName,
            value: groups[groupName]
        }));
    }, [specifications]);

    console.log('specsData', specsData);

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
                            className="absolute inset-0 bg-black/30 bg-black/20"
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
                                                backgroundColor: '#0096FF', // đỏ như Shopee
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
                                                color: '#0096FF !important',
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
                                                    // Ensure valid string before checking includes
                                                    String(spec.value || "").includes('\n') ? (
                                                        <div className="text-right leading-relaxed">
                                                            {String(spec.value).split('\n').map((line, i) => (
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