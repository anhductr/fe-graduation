import { create } from "zustand";

export const priceOptions = [
    { label: "Dưới 2 triệu", range: [0, 2000000] },
    { label: "Từ 2 - 4 triệu", range: [2000000, 4000000] },
    { label: "Từ 4 - 7 triệu", range: [4000000, 7000000] },
    { label: "Từ 7 - 13 triệu", range: [7000000, 13000000] },
    { label: "Từ 13 - 20 triệu", range: [13000000, 20000000] },
    { label: "Trên 20 triệu", range: [20000000, Infinity] },
];

export const sortTypeMap = {
    default: "DEFAULT",     // Nổi bật
    asc: "PRICE_ASC",         // Giá tăng dần
    desc: "PRICE_DESC",       // Giá giảm dần
};

export const specFilters = {
    phone: [
        { group: "Dung lượng ROM", key: "rom", options: ["≤128 GB", "256 GB", "512 GB", "1 TB"] },
        { group: "Hiệu năng & Pin", key: "performance", options: ["Pin ≥ 5000 mAh", "Sạc nhanh ≥ 65W", "Chip flagship (Snapdragon 8 Gen / A17 Pro trở lên)"] },
        { group: "Hỗ trợ mạng", key: "network", options: ["5G", "eSIM", "Dual SIM"] },
        { group: "Kích thước màn hình", key: "screenSize", options: ["Dưới 6.1 inch", "6.1 - 6.7 inch", "Trên 6.7 inch"] },
    ],
    default: []
};

const createFilterStore = (priceOptions) => {
    return create((set, get) => ({
        priceRange: ["all"],
        os: [],
        rom: [],
        connection: [],
        priceRangeSlider: [0, 46990000],
        sortType: "default", // "default" | "asc" | "desc"

        setSortType: (type) => set({ sortType: type }),

        togglePrice: (range) =>
            set((state) => {
                if (state.priceRange.includes("all")) {
                    return { priceRange: [range] }; // Chọn cái đầu tiên, bỏ "all"
                }

                const exists = state.priceRange.some(
                    (r) => r[0] === range[0] && r[1] === range[1]
                );

                if (exists) {
                    // Nếu bỏ chọn cái đang có → nếu không còn ô nào thì về "all"
                    const updated = state.priceRange.filter(
                        (r) => r[0] !== range[0] || r[1] !== range[1]
                    );
                    return { priceRange: updated.length === 0 ? ["all"] : updated };
                } else {
                    // Chỉ cho phép chọn 1 ô duy nhất → thay thế bằng range mới
                    return { priceRange: [range] };
                }
            }),

        toggleAllPrices: () => set({ priceRange: ["all"] }),

        setPriceRangeSlider: (range) => set({ priceRangeSlider: range }),

        toggleOs: (value) =>
            set((state) => ({
                os: state.os.includes(value)
                    ? state.os.filter((v) => v !== value)
                    : [...state.os, value],
            })),

        toggleRom: (value) =>
            set((state) => ({
                rom: state.rom.includes(value)
                    ? state.rom.filter((v) => v !== value)
                    : [...state.rom, value],
            })),

        toggleConnection: (value) =>
            set((state) => ({
                connection: state.connection.includes(value)
                    ? state.connection.filter((v) => v !== value)
                    : [...state.connection, value],
            })),

        resetFilters: () =>
            set({
                priceRange: ["all"],
                priceRangeSlider: [0, 46990000],
                os: [],
                rom: [],
                connection: [],
            }),
    }));
};

export const useFilterStore = createFilterStore(priceOptions);