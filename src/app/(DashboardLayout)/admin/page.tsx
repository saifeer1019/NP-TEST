'use client';
import { useState, useEffect } from 'react';
import {
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Pagination,
    Box,
    Stack,
    Checkbox,
    FormControlLabel,
    Button
} from '@mui/material';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';
import axios from 'axios';
import { useRouter } from 'next/navigation';

interface Article {
    _id: string;
    title: string;
    category: string;
    publishDate: string;
    isFeatured: boolean;
    views: number;
    author: {
        name: string;
        email: string;
    };
}

const AdminPage = () => {
    const router = useRouter();
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filters, setFilters] = useState({
        category: '',
        isFeatured: false,
        startDate: '',
        endDate: ''
    });

    const fetchArticles = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '10',
                ...(filters.category && { category: filters.category }),
                ...(filters.isFeatured && { isFeatured: 'true' }),
                ...(filters.startDate && { startDate: new Date(filters.startDate).toISOString() }),
                ...(filters.endDate && { endDate: new Date(filters.endDate).toISOString() })
            });

            const response = await axios.get(`/api/articles?${params}`);
            setArticles(response.data.articles);
            setTotalPages(response.data.pagination.pages);
        } catch (error) {
            console.error('Error fetching articles:', error);
        } finally {
            setLoading(false);
        }
    };
    const handleSubmit = async (id: string) => {
        try {
            const article = articles.find((article) => article._id === id);
            if (article) {
                const updatedArticle = { ...article, isFeatured: !article.isFeatured };
                await axios.put(`/api/articles/${id}`, updatedArticle);
                setArticles(prevArticles =>
                    prevArticles.map(a => (a._id === id ? updatedArticle : a))
                );
            }
        } catch (error) {
            console.error('Error updating article:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchArticles();
    }, [page, filters]);

    const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
        setPage(value);
    };

    const handleFilterChange = (field: string, value: any) => {
        setFilters(prev => ({ ...prev, [field]: value }));
        setPage(1); // Reset to first page when filters change
    };

    return (
        <PageContainer title="Articles Management" description="Manage your articles">
            <DashboardCard title="Articles List">
                <Box sx={{ mb: 3 }}>
                    <Button 
                        variant="contained" 
                        onClick={() => router.push('/admin/article/new')}
                        sx={{ mb: 2 }}
                    >
                        Create New Article
                    </Button>

                    <Stack spacing={2} direction={{ xs: 'column', sm: 'row' }} alignItems="center" mb={2}>
                        <FormControl sx={{ minWidth: 120 }}>
                            <InputLabel>Category</InputLabel>
                            <Select
                                value={filters.category}
                                label="Category"
                                onChange={(e) => handleFilterChange('category', e.target.value)}
                            >
                                <MenuItem value="">All</MenuItem>
                                <MenuItem value="রাজশাহী">রাজশাহী</MenuItem>
                                <MenuItem value="Business">খেলাধুলা</MenuItem>
                                <MenuItem value="Lifestyle">বাংলাদেশ</MenuItem>
                                <MenuItem value="Lifestyle">এডভার্টাইসমেন্ট</MenuItem>
                         
                            </Select>
                        </FormControl>

                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={filters.isFeatured}
                                    onChange={(e) => handleFilterChange('isFeatured', e.target.checked)}
                                />
                            }
                            label="Featured Only"
                        />

                        <TextField
                            type="date"
                            label="Start Date"
                            value={filters.startDate}
                            onChange={(e) => handleFilterChange('startDate', e.target.value)}
                            InputLabelProps={{ shrink: true }}
                        />
                        
                        <TextField
                            type="date"
                            label="End Date"
                            value={filters.endDate}
                            onChange={(e) => handleFilterChange('endDate', e.target.value)}
                            InputLabelProps={{ shrink: true }}
                        />
                    </Stack>

                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Title</TableCell>
                                    <TableCell>Author</TableCell>
                                    <TableCell>Category</TableCell>
                                    <TableCell>Published</TableCell>
                                    <TableCell>Featured</TableCell>
                                    <TableCell>Views</TableCell>
                                    <TableCell>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={7}>
                                            <Typography align="center">Loading...</Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : articles.map((article) => (
                                    <TableRow key={article._id}>
                                        <TableCell>{article.title}</TableCell>
                                        <TableCell>{article.author?.name || 'N/A'}</TableCell>
                                        <TableCell>{article.category}</TableCell>
                                        <TableCell>
                                            {new Date(article.publishDate).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell>
                                            <Checkbox
                                                checked={article.isFeatured}
                                                onChange={() => handleSubmit(article._id)}
                                            />
                                        </TableCell>
                                        <TableCell>{article.views}</TableCell>
                                        <TableCell>
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                onClick={() => router.push(`/admin/article/${article._id}`)}
                                            >
                                                Edit
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                        <Pagination
                            count={totalPages}
                            page={page}
                            onChange={handlePageChange}
                            color="primary"
                        />
                    </Box>
                </Box>
            </DashboardCard>
        </PageContainer>
    );
};

export default AdminPage;