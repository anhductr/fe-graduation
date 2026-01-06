import React from "react";

export default function Boxes(props) {
    return (
        <div
            className="relative flex flex-col w-[23%] rounded-[10px] shadow overflow-hidden p-[20px] bg-white"
        >
            <div className="flex gap-4 w-full h-full">
                <div className="rounded-[10px] shadow" style={{
                    backgroundColor: props?.color
                }}>
                    {/* icon */}
                    <span className={`flex items-center justify-center rounded-[10px] w-[55px] h-[55px]`}>
                        {React.cloneElement(props?.icon, { className: "!text-black !opacity-50 !text-[32px]" })}
                    </span>
                </div>
                <div className="flex-col">
                    <h4 className="text-[13px] font-semibold">{props?.header}</h4>
                    <span className="text-[35px] font-bold leading-[35px]">{props?.total}</span>
                </div>

            </div>
        </div >
    )
}