import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import userService from "../../services/userService";
import {
    Box,
    Card,
    CardContent,
    Typography,
    Grid,
    Avatar,
    Button,
    CircularProgress,
    Divider,
    Paper,
    Chip,
} from "@mui/material";
import { IoArrowBack, IoLocationSharp } from "react-icons/io5";

const UserProfile = () => {
    const { id } = useParams();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await userService.getUserById(id);
                const userData = response.data.result || response.data;
                setUser(userData);
            } catch (err) {
                console.error("Error fetching user:", err);
                setError("Không thể tải thông tin người dùng.");
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchUser();
        }
    }, [id]);

    if (loading) {
        return (
            <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                height="100vh"
            >
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box p={4} textAlign="center">
                <Typography color="error" gutterBottom>
                    {error}
                </Typography>
                <Button
                    component={Link}
                    to="/users"
                    startIcon={<IoArrowBack />}
                    variant="contained"
                >
                    Quay lại danh sách
                </Button>
            </Box>
        );
    }

    if (!user) {
        return (
            <Box p={4} textAlign="center">
                <Typography gutterBottom>Không tìm thấy người dùng.</Typography>
                <Button
                    component={Link}
                    to="/users"
                    startIcon={<IoArrowBack />}
                    variant="contained"
                >
                    Quay lại danh sách
                </Button>
            </Box>
        );
    }

    const fullName = [user.lastName, user.firstName].filter(Boolean).join(" ");

    return (
        <Box p={4}>
            <Button
                component={Link}
                to="/users"
                startIcon={<IoArrowBack />}
                sx={{ mb: 3 }}
                variant="outlined"
            >
                Quay lại
            </Button>

            <Grid container spacing={4}>
                {/* Left Column: Avatar & Basic Info */}
                <Grid item xs={12} md={4}>
                    <Card sx={{ boxShadow: 3, borderRadius: 2, height: "100%" }}>
                        <CardContent
                            sx={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                p: 4,
                            }}
                        >
                            <Avatar
                                src={user.avatarUrl || ""}
                                alt={fullName || "User"}
                                sx={{
                                    width: 150,
                                    height: 150,
                                    mb: 2,
                                    bgcolor: "primary.main",
                                    fontSize: "4rem",
                                }}
                            >
                                {user.lastName?.charAt(0).toUpperCase() || "U"}
                            </Avatar>
                            <Typography variant="h5" gutterBottom fontWeight="bold">
                                {fullName || "Người dùng"}
                            </Typography>
                            <Chip
                                label={user.role || "Customer"} // Assuming role might exist or just default
                                color="primary"
                                variant="outlined"
                                size="small"
                                sx={{ mb: 2 }}
                            />
                        </CardContent>
                    </Card>
                </Grid>

                {/* Right Column: Detailed Info & Addresses */}
                <Grid item xs={12} md={8}>
                    <Card sx={{ boxShadow: 3, borderRadius: 2, mb: 4 }}>
                        <CardContent sx={{ p: 3 }}>
                            <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ mb: 3 }}>
                                Thông tin cá nhân
                            </Typography>
                            <Grid container spacing={3}>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="subtitle2" color="textSecondary">
                                        Họ và tên
                                    </Typography>
                                    <Typography variant="body1" fontWeight="medium">
                                        {fullName || "---"}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="subtitle2" color="textSecondary">
                                        Số điện thoại
                                    </Typography>
                                    <Typography variant="body1" fontWeight="medium">
                                        {user.phone || "---"}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="subtitle2" color="textSecondary">
                                        Ngày sinh
                                    </Typography>
                                    <Typography variant="body1" fontWeight="medium">
                                        {user.dob ? new Date(user.dob).toLocaleDateString("vi-VN") : "---"}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="subtitle2" color="textSecondary">
                                        Giới tính
                                    </Typography>
                                    <Typography variant="body1" fontWeight="medium">
                                        {user.sex === null ? "---" : user.sex ? "Nam" : "Nữ"}
                                        {/* Assuming logic for sex, usually boolean or string. Adjust if 'Male'/'Female' */}
                                    </Typography>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>

                    <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
                        <CardContent sx={{ p: 3 }}>
                            <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ mb: 3 }}>
                                Sổ địa chỉ
                            </Typography>

                            {!user.address || user.address.length === 0 ? (
                                <Typography color="textSecondary">Chưa có địa chỉ nào.</Typography>
                            ) : (
                                <Grid container spacing={2}>
                                    {user.address.map((addr, index) => (
                                        <Grid item xs={12} key={addr.id || index}>
                                            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                                                <Box display="flex" alignItems="flex-start" gap={1}>
                                                    <IoLocationSharp size={24} color="#d32f2f" style={{ marginTop: 2 }} />
                                                    <Box>
                                                        <Box display="flex" gap={1} alignItems="center" mb={0.5}>
                                                            <Typography fontWeight="bold">
                                                                {addr.receiverName}
                                                            </Typography>
                                                            <Typography variant="body2" color="textSecondary">
                                                                | {addr.receiverPhone}
                                                            </Typography>
                                                        </Box>
                                                        <Typography variant="body2" color="textPrimary">
                                                            {addr.addressLine}, {addr.ward}, {addr.district}, {addr.city}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </Paper>
                                        </Grid>
                                    ))}
                                </Grid>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default UserProfile;
