import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    TextField, Button, Paper, Box, Typography,
    Snackbar, Alert, InputAdornment, IconButton
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { api } from '../../libs/axios';

export default function ChangePassword() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });
    const [errors, setErrors] = useState({});
    const [popup, setPopup] = useState({
        open: false,
        severity: 'info',
        message: ''
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user types
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const togglePasswordVisibility = (field) => {
        setShowPasswords(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.currentPassword) {
            newErrors.currentPassword = 'Vui lòng nhập mật khẩu hiện tại';
        }

        if (!formData.newPassword) {
            newErrors.newPassword = 'Vui lòng nhập mật khẩu mới';
        } else if (formData.newPassword.length < 6) {
            newErrors.newPassword = 'Mật khẩu mới phải có ít nhất 6 ký tự';
        } else if (formData.newPassword === formData.currentPassword) {
            newErrors.newPassword = 'Mật khẩu mới phải khác mật khẩu hiện tại';
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu mới';
        } else if (formData.newPassword !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) {
            return;
        }

        setLoading(true);

        try {
            await api.post('/user-service/auth/change-password', {
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword
            });

            setPopup({
                open: true,
                severity: 'success',
                message: 'Đổi mật khẩu thành công!'
            });

            // Reset form
            setFormData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });

            // Navigate back after 2 seconds
            setTimeout(() => {
                navigate(-1);
            }, 2000);

        } catch (error) {
            console.error('Error changing password:', error);
            setPopup({
                open: true,
                severity: 'error',
                message: error.response?.data?.message || 'Đổi mật khẩu thất bại. Vui lòng kiểm tra lại mật khẩu hiện tại.'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        navigate(-1);
    };

    return (
        <div className="py-[10px] px-[100px]">
            <Snackbar
                open={popup.open}
                autoHideDuration={3000}
                onClose={() => setPopup(prev => ({ ...prev, open: false }))}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert severity={popup.severity} variant="filled" sx={{ width: '100%' }}>
                    {popup.message}
                </Alert>
            </Snackbar>

            <div className="flex justify-between items-center my-4">
                <h3 className="text-[30px] font-bold mb-4 text-[#403e57]">
                    Thay đổi mật khẩu
                </h3>
            </div>

            <Paper elevation={0} className="shadow border-0 p-8 my-[20px] bg-white rounded-[10px]">
                <Box
                    component="form"
                    onSubmit={handleSubmit}
                    sx={{
                        maxWidth: 600,
                        mx: 'auto',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 3
                    }}
                >
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Vui lòng nhập mật khẩu hiện tại và mật khẩu mới để thay đổi.
                    </Typography>

                    <TextField
                        fullWidth
                        label="Mật khẩu hiện tại"
                        name="currentPassword"
                        type={showPasswords.current ? 'text' : 'password'}
                        value={formData.currentPassword}
                        onChange={handleChange}
                        error={!!errors.currentPassword}
                        helperText={errors.currentPassword}
                        required
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        onClick={() => togglePasswordVisibility('current')}
                                        edge="end"
                                    >
                                        {showPasswords.current ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            )
                        }}
                    />

                    <TextField
                        fullWidth
                        label="Mật khẩu mới"
                        name="newPassword"
                        type={showPasswords.new ? 'text' : 'password'}
                        value={formData.newPassword}
                        onChange={handleChange}
                        error={!!errors.newPassword}
                        helperText={errors.newPassword || 'Mật khẩu phải có ít nhất 6 ký tự'}
                        required
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        onClick={() => togglePasswordVisibility('new')}
                                        edge="end"
                                    >
                                        {showPasswords.new ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            )
                        }}
                    />

                    <TextField
                        fullWidth
                        label="Xác nhận mật khẩu mới"
                        name="confirmPassword"
                        type={showPasswords.confirm ? 'text' : 'password'}
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        error={!!errors.confirmPassword}
                        helperText={errors.confirmPassword}
                        required
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        onClick={() => togglePasswordVisibility('confirm')}
                                        edge="end"
                                    >
                                        {showPasswords.confirm ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            )
                        }}
                    />

                    <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={loading}
                            sx={{
                                flex: 1,
                                py: 1.5,
                                background: 'linear-gradient(to right, #4a2fcf, #6440F5)',
                                '&:hover': {
                                    background: 'linear-gradient(to right, #3a1fbf, #5430E5)',
                                }
                            }}
                        >
                            {loading ? 'Đang xử lý...' : 'Đổi mật khẩu'}
                        </Button>
                        <Button
                            type="button"
                            variant="outlined"
                            onClick={handleCancel}
                            disabled={loading}
                            sx={{
                                flex: 1,
                                py: 1.5,
                                color: '#403e57',
                                borderColor: '#ccc'
                            }}
                        >
                            Hủy
                        </Button>
                    </Box>
                </Box>
            </Paper>
        </div>
    );
}
