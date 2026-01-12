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
        { groupName: "Dung lượng ROM", group: "Storage", key: "Dung lượng" },
        { groupName: "Hỗ trợ mạng", group: "Connectivity", key: "Hỗ trợ mạng" },
        { groupName: "Kích thước màn hình", group: "Display", key: "Kích thước màn hình" },
        { groupName: "Hệ điều hành", group: "OperatingSystem", key: "Tên OS" },
        { groupName: "RAM", group: "RAM", key: "Dung lượng" },
    ],
    phoneChild: [
        { groupName: "Dung lượng ROM", group: "Storage", key: "Dung lượng" },
        { groupName: "Hỗ trợ mạng", group: "Connectivity", key: "Hỗ trợ mạng" },
        { groupName: "Kích thước màn hình", group: "Display", key: "Kích thước màn hình" },
        { groupName: "RAM", group: "RAM", key: "Dung lượng" },
    ],
    default: []
};

const createFilterStore = (priceOptions) => {
    return create((set, get) => ({
        connectivity: [],
        storage: [],        // cho Dung lượng ROM
        display: [],        // cho Kích thước màn hình
        operatingSystem: [],// cho Hệ điều hành (chỉ có trong phone)
        ram: [],
        priceRange: ["all"],
        priceRangeSlider: [0, 46990000],
        sortType: "default", // "default" | "asc" | "desc"

        setSortType: (type) => set({ sortType: type }),

        // Actions toggle tương ứng với spec
        toggleStorage: (value) =>
            set((state) => ({
                storage: state.storage.includes(value)
                    ? [] // Nếu đã chọn thì bỏ chọn
                    : [value], // Nếu chưa chọn thì thay thế = mảng chỉ có 1 phần tử
            })),

        toggleConnectivity: (value) =>
            set((state) => ({
                connectivity: state.connectivity.includes(value)
                    ? []
                    : [value],
            })),

        toggleDisplay: (value) =>
            set((state) => ({
                display: state.display.includes(value)
                    ? []
                    : [value],
            })),

        toggleOperatingSystem: (value) =>
            set((state) => ({
                operatingSystem: state.operatingSystem.includes(value)
                    ? []
                    : [value],
            })),

        toggleRam: (value) =>
            set((state) => ({
                ram: state.ram.includes(value)
                    ? []
                    : [value],
            })),

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


        resetFilters: () =>
            set({
                priceRange: ["all"],
                priceRangeSlider: [0, 46990000],
                storage: [],
                connectivity: [],
                display: [],
                operatingSystem: [],
                ram: [],
            }),
    }));
};

export const useFilterStore = createFilterStore(priceOptions);