// app/(DashboardLayout)/admin/article/[id]/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Box,
    TextField,
    Button,
    FormControlLabel,
    Checkbox,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Stack,
    Alert,
    CircularProgress,
    IconButton
} from '@mui/material';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';
import dynamic from 'next/dynamic';
import axios from 'axios';
import Image from 'next/image';
import { Upload as UploadIcon } from '@mui/icons-material';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css';

interface ArticleFormData {
    title: string;
    content: string;
    excerpt: string;
    category: string;
    featuredImage: string;
    isFeatured: boolean;
}

const initialFormData: ArticleFormData = {
    title: '',
    content: '',
    excerpt: '',
    category: '',
    featuredImage: '',
    isFeatured: false
};

export default function ArticleForm({ params }: { params: { id: string } }) {
    const router = useRouter();
    const isEditing = params.id !== 'new';
    const [formData, setFormData] = useState<ArticleFormData>(initialFormData);
    const [loading, setLoading] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (isEditing) {
            fetchArticle();
        }
    }, [isEditing]);

    const fetchArticle = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`/api/articles/${params.id}`);
            setFormData(response.data);
        } catch (error) {
            setError('Failed to fetch article');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field: keyof ArticleFormData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            setUploadingImage(true);
            const formData = new FormData();
            formData.append('file', file);

            const response = await axios.post('/api/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            handleChange('featuredImage', response.data.url);
        } catch (error) {
            setError('Failed to upload image');
        } finally {
            setUploadingImage(false);
        }
    };

    const quillModules = {
        toolbar: {
            container: [
                [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                ['link', 'image', 'video'],
                ['clean']
            ],
            handlers: {
                image: function() {
                    const input = document.createElement('input');
                    input.setAttribute('type', 'file');
                    input.setAttribute('accept', 'image/*');
                    input.click();

                    input.onchange = async () => {
                        const file = input.files?.[0];
                        if (!file) return;

                        try {
                            setLoading(true);
                            const formData = new FormData();
                            formData.append('file', file);

                            const response = await axios.post('/api/upload', formData, {
                                headers: {
                                    'Content-Type': 'multipart/form-data',
                                },
                            });

                            const range = (ReactQuill as any).getEditor().getSelection(true);
                            (ReactQuill as any).getEditor().insertEmbed(range.index, 'image', response.data.url);
                        } catch (error) {
                            setError('Failed to upload image');
                        } finally {
                            setLoading(false);
                        }
                    };
                }
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            setError('');
            setSuccess('');

            if (isEditing) {
                await axios.put(`/api/articles/${params.id}`, formData);
            } else {
                await axios.post('/api/articles', formData);
            }

            setSuccess('Article saved successfully!');
            if (!isEditing) {
                setFormData(initialFormData);
            }
            
            setTimeout(() => {
                router.push('/admin');
            }, 1500);

        } catch (error) {
            setError('Failed to save article');
        } finally {
            setLoading(false);
        }
    };

    if (loading && isEditing) {
        return (
            <PageContainer title="Loading..." description="Loading article data">
                <DashboardCard>
                    <Box display="flex" justifyContent="center" p={3}>
                        <CircularProgress />
                    </Box>
                </DashboardCard>
            </PageContainer>
        );
    }

    return (
        <PageContainer
            title={isEditing ? 'Edit Article' : 'Create Article'}
            description={isEditing ? 'Edit existing article' : 'Create a new article'}
        >
            <DashboardCard title={isEditing ? 'Edit Article' : 'Create Article'}>
                <Box component="form" onSubmit={handleSubmit}>
                    <Stack spacing={3}>
                        {error && <Alert severity="error">{error}</Alert>}
                        {success && <Alert severity="success">{success}</Alert>}

                        <TextField
                            label="Title"
                            value={formData.title}
                            onChange={(e) => handleChange('title', e.target.value)}
                            required
                            fullWidth
                        />

                        <TextField
                            label="Excerpt"
                            value={formData.excerpt}
                            onChange={(e) => handleChange('excerpt', e.target.value)}
                            required
                            fullWidth
                            multiline
                            rows={2}
                        />

                        <FormControl fullWidth>
                            <InputLabel>Category</InputLabel>
                            <Select
                                value={formData.category}
                                label="Category"
                                onChange={(e) => handleChange('category', e.target.value)}
                                required
                            >
                                <MenuItem value="রাজশাহী">রাজশাহী</MenuItem>
                                <MenuItem value="খেলাধুলা">খেলাধুলা</MenuItem>
                                <MenuItem value="বাংলাদেশ">বাংলাদেশ</MenuItem>
                                <MenuItem value="এডভার্টাইসমেন্ট">এডভার্টাইসমেন্ট</MenuItem>
                            </Select>
                        </FormControl>

                        <Box>
                            <input
                                type="file"
                                accept="image/*"
                                id="featured-image-upload"
                                style={{ display: 'none' }}
                                onChange={handleFileUpload}
                            />
                            <TextField
                                label="Featured Image URL"
                                value={formData.featuredImage}
                                onChange={(e) => handleChange('featuredImage', e.target.value)}
                                fullWidth
                                InputProps={{
                                    endAdornment: (
                                        <IconButton
                                            onClick={() => document.getElementById('featured-image-upload')?.click()}
                                            disabled={uploadingImage}
                                        >
                                            {uploadingImage ? <CircularProgress size={24} /> : <UploadIcon />}
                                        </IconButton>
                                    ),
                                }}
                            />
                            {formData.featuredImage && (
                                <Box mt={2}>
                                    <Image
                                        src={formData.featuredImage}
                                        alt="Featured image preview"
                                        width={200}
                                        height={120}
                                        style={{ objectFit: 'cover' }}
                                    />
                                </Box>
                            )}
                        </Box>

                        <Box sx={{ mb: 2 }}>
                            <ReactQuill
                                theme="snow"
                                value={formData.content}
                                onChange={(value) => handleChange('content', value)}
                                modules={quillModules}
                                style={{ height: '300px', marginBottom: '50px' }}
                            />
                        </Box>

                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={formData.isFeatured}
                                    onChange={(e) => handleChange('isFeatured', e.target.checked)}
                                />
                            }
                            label="Featured Article"
                        />

                        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                            <Button
                                type="button"
                                variant="outlined"
                                onClick={() => router.push('/admin')}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="contained"
                                disabled={loading}
                            >
                                {loading ? <CircularProgress size={24} /> : (isEditing ? 'Update' : 'Create')}
                            </Button>
                        </Box>
                    </Stack>
                </Box>
            </DashboardCard>
        </PageContainer>
    );
}