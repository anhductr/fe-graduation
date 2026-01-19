import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from 'react-toastify';

const ComparisonContext = createContext();

export const useComparison = () => {
    return useContext(ComparisonContext);
};

export const ComparisonProvider = ({ children }) => {
    const [compareList, setCompareList] = useState(() => {
        try {
            const saved = localStorage.getItem('compareList');
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            return [];
        }
    });

    useEffect(() => {
        localStorage.setItem('compareList', JSON.stringify(compareList));
    }, [compareList]);

    const addToCompare = (product) => {
        if (compareList.length >= 3) {
            toast.warn("Bạn chỉ có thể so sánh tối đa 3 sản phẩm!");
            return;
        }
        if (compareList.some((item) => item.id === product.id)) {
            toast.info("Sản phẩm đã có trong danh sách so sánh.");
            return;
        }

        // Check categorization compatibility if needed, but for now allow any
        // or maybe check if category matches first item? 
        // For now, let's keep it simple or maybe warn if categories are different?
        if (compareList.length > 0) {
            // Optional: Warning if categories are vastly different, but let's assume user knows what they are doing
        }

        setCompareList([...compareList, product]);
        toast.success("Đã thêm vào danh sách so sánh!");
    };

    const removeFromCompare = (productId) => {
        setCompareList(compareList.filter((item) => item.id !== productId));
        toast.success("Đã xóa khỏi danh sách so sánh.");
    };

    const clearComparison = () => {
        setCompareList([]);
        toast.info("Đã xóa toàn bộ danh sách so sánh.");
    };

    const isInCompareList = (productId) => {
        return compareList.some(item => item.id === productId);
    }

    return (
        <ComparisonContext.Provider
            value={{
                compareList,
                addToCompare,
                removeFromCompare,
                clearComparison,
                isInCompareList
            }}
        >
            {children}
        </ComparisonContext.Provider>
    );
};
