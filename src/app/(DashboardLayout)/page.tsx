'use client';
import { useState, useEffect, useCallback } from 'react';
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
    Button,
} from '@mui/material';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import SearchComp from './components/Search';

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
    const [categories, setCategories] = useState<any>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filters, setFilters] = useState({
        category: '',
        search: '',
        isFeatured: false,
        startDate: '',
        endDate: ''
    });

    const fetchArticles = useCallback(async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '10',
                ...(filters.category && { category: filters.category }),
                ...(filters.search && { searchQuery: filters.search }),
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
    }, [page, filters]);

    const fetchCategories = useCallback(async () => {
        try {
            const response = await axios.get(`/api/categories`);
            setCategories(response.data.categories);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    }, []);

    const handleSearch = useCallback((searchQuery: string) => {
        setFilters(prev => ({ ...prev, search: searchQuery }));
        setPage(1);
    }, []);

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
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await axios.delete(`/api/articles/${id}`);
            // Instead of reloading, just refetch articles
            fetchArticles();
        } catch (error) {
            console.error('Error deleting article:', error);
        }
    };

    useEffect(() => {
        fetchArticles();
    }, [fetchArticles]);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

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
                    <Stack spacing={2} direction={{ xs: 'column', sm: 'row' }} alignItems="center" mb={2}>
                        <FormControl sx={{ minWidth: 120 }}>
                            <InputLabel>Category</InputLabel>
                            <Select
                                value={filters.category}
                                label="Category"
                                onChange={(e) => handleFilterChange('category', e.target.value)}
                            >
                                <MenuItem value="">All</MenuItem>
                                {categories && categories.map((category: any, id: any) => {
                                    return (
                                        <MenuItem key={id} value={category.name}>{category.name}</MenuItem>
                                    );
                                })}
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

                        <SearchComp handleSearch={handleSearch} />

                        <Button 
                            variant="contained"
                            onClick={() => router.push('/admin/article/new')}
                            sx={{ mb: 2 }}
                        >
                            Create New Article
                        </Button>
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
                                    <TableCell>Edit</TableCell>
                                    <TableCell>Delete</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={8}>
                                            <Typography align="center">Loading...</Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : articles.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8}>
                                            <Typography align="center">No articles found</Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    articles.map((article) => (
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
                                            <TableCell>
                                                <Button
                                                    color='error'
                                                    variant="outlined"
                                                    size="small"
                                                    onClick={() => handleDelete(article._id)}
                                                >
                                                    Delete
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
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