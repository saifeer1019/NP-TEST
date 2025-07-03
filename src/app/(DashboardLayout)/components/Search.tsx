import { Box, IconButton, Input } from '@mui/material';
import { Search } from '@mui/icons-material';
import React, { useState } from 'react';

const SearchComp = ({ handleSearch }) => {
    const [searchQuery, setSearchQuery] = useState('');
    
    const handleSubmit = (e) => {
        e.preventDefault();
        handleSearch(searchQuery);
    };

    return (
        <Box 
            component="form" 
            onSubmit={handleSubmit} 
            sx={{ position: 'relative', width: '100%', maxWidth: '300px' }}
        >
            <Input
                disableUnderline
                placeholder="অনুসন্ধান করুন..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                type="text"
                sx={{
                    width: '100%',
                    px: 1.5,
                    py: 1,
                    pr: 5,
                    border: '1px solid #ccc',
                    borderRadius: 2,
                    fontSize: '0.9rem',
                    bgcolor: 'white',
                    '&:focus-within': {
                        borderColor: 'error.main',
                        boxShadow: theme => `0 0 0 2px ${theme.palette.error.light}`,
                    },
                }}
            />
            <IconButton 
                type="submit" 
                sx={{ 
                    position: 'absolute', 
                    right: 8, 
                    top: '50%', 
                    transform: 'translateY(-50%)' 
                }}
            >
                <Search fontSize="small" />
            </IconButton>
        </Box>
    );
};

export default SearchComp;