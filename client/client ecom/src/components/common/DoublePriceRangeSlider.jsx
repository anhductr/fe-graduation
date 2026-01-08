import Slider from '@mui/material/Slider';
import { styled } from '@mui/material/styles';
import { useCallback } from 'react';
// Tùy chỉnh style cho đẹp giống thiết kế hiện tại
const CustomSlider = styled(Slider)({
    color: '#000',
    height: 4,

    '& .MuiSlider-track': {
        border: 'none',
    },

    '& .MuiSlider-rail': {
        opacity: 0.5,
        backgroundColor: '#bfbfbf',
    },

    '& .MuiSlider-thumb': {
        width: 24,
        height: 24,
        backgroundColor: '#fff',
        border: '1px solid #ccc',

        // Bình thường: không shadow
        boxShadow: 'none',

        // Khi hover: vẫn không shadow, nhưng con trỏ thành grab
        '&:hover': {
            boxShadow: 'none', // quan trọng: override default hover shadow
            cursor: 'grab',
        },

        // Khi focus visible (Tab đến) - vẫn không shadow
        '&.Mui-focusVisible': {
            boxShadow: 'none',
        },

        // Chỉ khi active (nhấn giữ / đang kéo): mới hiện shadow xanh + grabbing
        '&.Mui-active': {
            boxShadow: '0px 0px 0px 4px rgba(0, 150, 255, 0.16)',
            width: 24,
            height: 24,
            cursor: 'grabbing',
        },
    },
});

export default function DoublePriceRangeSlider({
    min,
    max,
    value,
    onChange,
    toggleAllPrices,
    isCheckBox,
    setIsCheckBox,
    isSliderDefault
}) {

    const handleSliderChange = useCallback(
        (event, newValue) => {
            onChange(event, newValue);
        },
        [onChange] // dependency chỉ là onChange từ props
    );

    const handleInputChange = (index) => (e) => {
        let inputVal = e.target.value.replace(/[^\d]/g, '');
        if (inputVal === '') inputVal = index === 0 ? min : max;
        let num = parseInt(inputVal, 10) || min;

        num = Math.max(min, Math.min(max, num));

        const newValue = [...value];
        newValue[index] = num;

        if (index === 0 && num > newValue[1]) newValue[1] = num;
        if (index === 1 && num < newValue[0]) newValue[0] = num;

        onChange(null, newValue); // gọi callback từ props

        if (!isCheckBox) {
            setIsCheckBox(true);
            toggleAllPrices();
        }
        isSliderDefault.current = true;
    };

    const formatDisplay = (val) => {
        return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    };

    return (
        <div className="h-full ">
            <div className="px-4">
                <CustomSlider
                    value={value}
                    onChange={handleSliderChange}
                    min={min}
                    max={max}
                    step={1000}
                    disableSwap
                />
            </div>

            {/* 2 inputs ở dưới slider */}
            <div className="flex w-full justify-center gap-2 mb-3 text-[11px]">
                {/* input min */}
                <div className="relative">
                    <input
                        type="text"
                        inputMode="numeric"
                        value={formatDisplay(value[0])}
                        onChange={handleInputChange(0)}
                        className="text-right pr-[40px] w-[95px] border border-gray-300 rounded px-2 py-[6px] text-[12px] focus:outline-none focus:ring-1 focus:ring-[#0096FF]"
                    />
                    <span className="absolute right-[5px] top-1/2 -translate-y-1/2 text-[12px] text-gray-500 pointer-events-none">
                        .000đ
                    </span>
                </div>

                <span className="text-[26px] leading-none">~</span>

                {/* input max */}
                <div className="relative">
                    <input
                        type="text"
                        inputMode="numeric"
                        value={formatDisplay(value[1])}
                        onChange={handleInputChange(1)}
                        className="text-right pr-[40px] w-[95px] border border-gray-300 rounded px-2 py-[6px] text-[12px] focus:outline-none focus:ring-1 focus:ring-[#0096FF]"
                    />
                    <span className="absolute right-[5px] top-1/2 -translate-y-1/2 text-[12px] text-gray-500 pointer-events-none">
                        .000đ
                    </span>
                </div>
            </div>

        </div>
    );
}