import React, { useState, useRef } from 'react';
import { Box, Dialog, DialogContent, DialogTitle, IconButton, Typography } from '@mui/material';
import BannerList from '../components/banner/BannerList';
import BannerForm from '../components/banner/BannerForm';
import CloseIcon from '@mui/icons-material/Close';

const BannerPage = () => {
    const [openCreate, setOpenCreate] = useState(false);

    // Ref to trigger data refresh in list if needed, 
    // currently BannerList fetches on mount. 
    // Ideally lift state up or use context/react-query.
    // For simplicity, we can force remount or pass a refresh trigger.
    // Actually, I'll just pass a key to BannerList to force re-render on success.
    const [refreshKey, setRefreshKey] = useState(0);

    const handleSuccess = () => {
        setRefreshKey(prev => prev + 1);
    };

    return (
        <Box>
            <BannerList
                key={refreshKey}
                onOpenCreate={() => setOpenCreate(true)}
            />

            <Dialog open={openCreate} onClose={() => setOpenCreate(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6">Tạo mới Banner</Typography>
                    <IconButton
                        aria-label="close"
                        onClick={() => setOpenCreate(false)}
                        sx={{
                            color: (theme) => theme.palette.grey[500],
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    <BannerForm
                        onSuccess={handleSuccess}
                        onClose={() => setOpenCreate(false)}
                    />
                </DialogContent>
            </Dialog>
        </Box>
    );
};

export default BannerPage;
