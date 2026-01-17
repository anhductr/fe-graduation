import React, { useEffect, useState, useRef } from 'react';
import {
    Box,
    Button,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Avatar,
    IconButton
} from '@mui/material';
import bannerService from '../../services/bannerService';
import { FaPlus } from 'react-icons/fa6';
import Boxes from '../common/Boxes';
import LocalSearchBar from '../common/LocalSearchBar';
import { MdOutlineCategory, MdDelete, MdEdit } from "react-icons/md";
import { BsCardImage } from "react-icons/bs";

const BannerList = ({ onOpenCreate }) => {
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const inputSearchRef = useRef(null);

    useEffect(() => {
        fetchBanners();
    }, []);

    const fetchBanners = async () => {
        try {
            const response = await bannerService.getAllBanners();
            setBanners(response.data?.result || []);
        } catch (error) {
            console.error("Failed to fetch banners:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="py-[10px] px-[100px]">
            <div className="flex justify-between items-center my-4">
                <h3 className="text-[30px] font-bold mb-4 text-[#403e57]">
                    Quản lý Banner
                </h3>
            </div>

            <div className="flex flex-wrap gap-[26px] w-full">
                <Boxes
                    color="#81bcfaff"
                    header={`Tổng Banner: ${banners.length}`}
                    icon={<BsCardImage />}
                />
                {/* You can add more stats here if available, e.g. Active Banners */}
            </div>

            <div className="shadow border-0 p-5 my-[20px] bg-white rounded-[10px]">
                {/* Search & Actions */}
                <div
                    className="py-5 relative flex"
                    onClick={(e) => {
                        if (inputSearchRef.current && e.target !== inputSearchRef.current) {
                            inputSearchRef.current.blur();
                        }
                    }}
                >
                    <div className="flex gap-2 w-full">
                        <LocalSearchBar
                            ref={inputSearchRef}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            value={searchTerm}
                        />
                        <Button
                            variant="contained"
                            className="!ml-auto !normal-case !bg-gradient-to-r !from-[#4a2fcf] !to-[#6440F5] !shadow"
                            onClick={onOpenCreate}
                        >
                            <FaPlus className="mr-1" />
                            <span className="ml-1">Thêm Banner</span>
                        </Button>
                    </div>
                </div>

                {/* Table */}
                <TableContainer
                    component={Paper}
                    sx={{
                        borderTop: "1px solid #e0e0e0",
                        borderRight: "1px solid #e0e0e0",
                        borderLeft: "1px solid #e0e0e0",
                    }}
                >
                    <Table>
                        <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
                            <TableRow>
                                <TableCell sx={{ width: "10%", fontWeight: 600 }}>ID</TableCell>
                                <TableCell sx={{ width: "30%", fontWeight: 600 }}>Hình ảnh</TableCell>
                                <TableCell sx={{ width: "40%", fontWeight: 600 }}>Link liên kết</TableCell>
                                <TableCell sx={{ width: "20%", fontWeight: 600 }} align="center">Thao tác</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {banners.length === 0 && !loading ? (
                                <TableRow>
                                    <TableCell colSpan={4} align="center" sx={{ py: 3, color: '#999' }}>
                                        Chưa có banner nào
                                    </TableCell>
                                </TableRow>
                            ) : (
                                banners
                                    .filter(b => !searchTerm || (b.link && b.link.toLowerCase().includes(searchTerm.toLowerCase())))
                                    .map((banner) => (
                                        <TableRow key={banner.id || Math.random()} hover>
                                            <TableCell>{banner.id}</TableCell>
                                            <TableCell>
                                                <div className="w-[150px] h-[80px] rounded-[8px] overflow-hidden border border-gray-200">
                                                    <img
                                                        src={banner.url || banner.imageUrl}
                                                        alt="banner"
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-gray-600">
                                                    {banner.link || banner.targetUrl || <em className="text-gray-400">Không có link</em>}
                                                </span>
                                            </TableCell>
                                            <TableCell align="center">
                                                {/* Placeholder for Edit/Delete if needed later */}
                                                {/* 
                                    <IconButton size="small" color="primary">
                                        <MdEdit />
                                    </IconButton> 
                                    */}
                                                <IconButton size="small" color="error">
                                                    <MdDelete />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </div>
        </div>
    );
};

export default BannerList;
