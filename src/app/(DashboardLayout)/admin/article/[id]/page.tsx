'use client';
import { useState, useEffect, useMemo, memo } from 'react';
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
import axios from 'axios';
import Image from 'next/image';
import { Upload as UploadIcon } from '@mui/icons-material';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Bold from '@tiptap/extension-bold';
import Italic from '@tiptap/extension-italic';
import Strike from '@tiptap/extension-strike';
import Heading from '@tiptap/extension-heading';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import Link from '@tiptap/extension-link';

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

const Toolbar = ({ editor }: { editor: any }) => {
    if (!editor) return null;

    return (
        <Box
            sx={{
                borderBottom: '1px solid black', // Black border at the bottom
                backgroundColor: '#f5f5f5', // Light gray background
                py: 1, // Padding on the y-axis
                mb: 2, // Margin at the bottom
            }}
        >
            <Stack direction="row" spacing={1} sx={{ px: 2 }}>
                <Button
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    disabled={!editor.can().chain().focus().toggleBold().run()}
                    variant={editor.isActive('bold') ? 'contained' : 'outlined'}
                    sx={{ textTransform: 'none' }} // Prevent uppercase text
                >
                    Bold
                </Button>
                <Button
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    disabled={!editor.can().chain().focus().toggleItalic().run()}
                    variant={editor.isActive('italic') ? 'contained' : 'outlined'}
                    sx={{ textTransform: 'none' }}
                >
                    Italic
                </Button>
                <Button
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    disabled={!editor.can().chain().focus().toggleStrike().run()}
                    variant={editor.isActive('strike') ? 'contained' : 'outlined'}
                    sx={{ textTransform: 'none' }}
                >
                    Strike
                </Button>
                <Button
                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                    variant={editor.isActive('heading', { level: 1 }) ? 'contained' : 'outlined'}
                    sx={{ textTransform: 'none' }}
                >
                    H1
                </Button>
                <Button
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    variant={editor.isActive('heading', { level: 2 }) ? 'contained' : 'outlined'}
                    sx={{ textTransform: 'none' }}
                >
                    H2
                </Button>
                <Button
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    variant={editor.isActive('bulletList') ? 'contained' : 'outlined'}
                    sx={{ textTransform: 'none' }}
                >
                    Bullet List
                </Button>
                <Button
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    variant={editor.isActive('orderedList') ? 'contained' : 'outlined'}
                    sx={{ textTransform: 'none' }}
                >
                    Ordered List
                </Button>
                <Button
                    onClick={() => {
                        const url = window.prompt('Enter the URL');
                        if (url) {
                            editor.chain().focus().toggleLink({ href: url }).run();
                        }
                    }}
                    variant={editor.isActive('link') ? 'contained' : 'outlined'}
                    sx={{ textTransform: 'none' }}
                >
                    Link
                </Button>
            </Stack>
        </Box>
    );
};

const TiptapEditor = ({ value, onChange }: { value: string; onChange: (value: string) => void }) => {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Bold,
            Italic,
            Strike,
            Heading.configure({
                levels: [1, 2],
            }),
            BulletList,
            OrderedList,
            Link.configure({
                openOnClick: false,
            }),
        ],
        content: value,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
    });

    useEffect(() => {
        if (editor && value !== editor.getHTML()) {
            editor.commands.setContent(value);
        }
    }, [value]);

    return (
        <Box
            sx={{
                border: '1px solid black', // Black border
                borderRadius: '4px', // Rounded corners
                minHeight: '300px', // Minimum height
                overflow: 'hidden', // Ensure content doesn't overflow
            }}
        >
            <Toolbar editor={editor} />
            <Box
                sx={{
                    padding: '16px', // Add padding inside the editor
                }}
            >
                <EditorContent editor={editor} />
            </Box>
        </Box>
    );
};

const MemoizedTiptapEditor = memo(TiptapEditor);

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
                                label="Upload Image"
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
                            <MemoizedTiptapEditor
                                value={formData.content}
                                onChange={(value) => handleChange('content', value)}
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