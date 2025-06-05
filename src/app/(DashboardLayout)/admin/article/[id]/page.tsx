// ✅ Preserves all original functionality including the rich text editor
// ✅ Adds conditional thumbnail input if a video is uploaded

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
    IconButton,
    Typography
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
    thumbnailImage?: string;
    isFeatured: boolean;
}

const initialFormData: ArticleFormData = {
    title: '',
    content: '',
    excerpt: '',
    category: '',
    featuredImage: '',
    thumbnailImage: '',
    isFeatured: false
};

const Toolbar = ({ editor }: { editor: any }) => {
    if (!editor) return null;
    return (
        <Box sx={{ borderBottom: '1px solid black', backgroundColor: '#f5f5f5', py: 1, mb: 2 }}>
            <Stack direction="row" spacing={1} sx={{ px: 2 }}>
                {['Bold', 'Italic', 'Strike'].map((type) => (
                    <Button
                        key={type}
                        onClick={() => editor.chain().focus()[`toggle${type}`]().run()}
                        disabled={!editor.can().chain().focus()[`toggle${type}`]().run()}
                        variant={editor.isActive(type.toLowerCase()) ? 'contained' : 'outlined'}
                        sx={{ textTransform: 'none' }}
                    >{type}</Button>
                ))}
                {[1, 2].map((level) => (
                    <Button
                        key={level}
                        onClick={() => editor.chain().focus().toggleHeading({ level }).run()}
                        variant={editor.isActive('heading', { level }) ? 'contained' : 'outlined'}
                        sx={{ textTransform: 'none' }}
                    >H{level}</Button>
                ))}
                {['BulletList', 'OrderedList'].map((list) => (
                    <Button
                        key={list}
                        onClick={() => editor.chain().focus()[`toggle${list}`]().run()}
                        variant={editor.isActive(list.toLowerCase()) ? 'contained' : 'outlined'}
                        sx={{ textTransform: 'none' }}
                    >{list.replace('List', ' List')}</Button>
                ))}
                <Button
                    onClick={() => {
                        const url = window.prompt('Enter the URL');
                        if (url) editor.chain().focus().toggleLink({ href: url }).run();
                    }}
                    variant={editor.isActive('link') ? 'contained' : 'outlined'}
                    sx={{ textTransform: 'none' }}
                >Link</Button>
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
            Heading.configure({ levels: [1, 2] }),
            BulletList,
            OrderedList,
            Link.configure({ openOnClick: false })
        ],
        content: value,
        onUpdate: ({ editor }) => onChange(editor.getHTML()),
    });

    useEffect(() => {
        if (editor && value !== editor.getHTML()) {
            editor.commands.setContent(value);
        }
    }, [value]);

    return (
        <Box sx={{ border: '1px solid black', borderRadius: '4px', minHeight: '300px', overflow: 'hidden' }}>
            <Toolbar editor={editor} />
            <Box sx={{ padding: '16px' }}>
                <EditorContent editor={editor} />
            </Box>
        </Box>
    );
};

const MemoizedTiptapEditor = memo(TiptapEditor);

const isVideoFile = (url: string): boolean => {
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.avi', '.mov', '.wmv', '.flv', '.mkv'];
    const lowerUrl = url.toLowerCase();
    return videoExtensions.some(ext => lowerUrl.includes(ext)) ||
           lowerUrl.includes('video') ||
           lowerUrl.includes('youtube') ||
           lowerUrl.includes('vimeo');
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
        if (isEditing) fetchArticle();
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

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: 'featuredImage' | 'thumbnailImage') => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            setUploadingImage(true);
            const formData = new FormData();
            formData.append('file', file);
            const response = await axios.post('/api/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            handleChange(type, response.data.url);
        } catch (error) {
            setError('Failed to upload file');
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
            if (!isEditing) setFormData(initialFormData);
            setTimeout(() => router.push('/admin'), 1500);
        } catch (error) {
            setError('Failed to save article');
        } finally {
            setLoading(false);
        }
    };

    const showVideoThumbnailInput = isVideoFile(formData.featuredImage);

    return (
        <PageContainer title={isEditing ? 'Edit Article' : 'Create Article'} description={isEditing ? 'Edit existing article' : 'Create a new article'}>
            <DashboardCard title={isEditing ? 'Edit Article' : 'Create Article'}>
                <Box component="form" onSubmit={handleSubmit}>
                    <Stack spacing={3}>
                        {error && <Alert severity="error">{error}</Alert>}
                        {success && <Alert severity="success">{success}</Alert>}

                        <TextField label="Title" value={formData.title} onChange={(e) => handleChange('title', e.target.value)} required fullWidth />

                        <TextField label="Excerpt" value={formData.excerpt} onChange={(e) => handleChange('excerpt', e.target.value)} required fullWidth multiline rows={2} />

                        <FormControl fullWidth>
                            <InputLabel>Category</InputLabel>
                            <Select value={formData.category} label="Category" onChange={(e) => handleChange('category', e.target.value)} required>
                                <MenuItem value="রাজশাহী">রাজশাহী</MenuItem>
                                <MenuItem value="খেলাধুলা">খেলাধুলা</MenuItem>
                                <MenuItem value="বাংলাদেশ">বাংলাদেশ</MenuItem>
                                <MenuItem value="এডভার্টাইসমেন্ট">এডভার্টাইসমেন্ট</MenuItem>
                            </Select>
                        </FormControl>

                        <Box>
                            <input type="file" accept="image/*,video/*" id="featured-media-upload" style={{ display: 'none' }} onChange={(e) => handleFileUpload(e, 'featuredImage')} />
                            <TextField
                                label="Featured Image/Video URL"
                                value={formData.featuredImage}
                                onChange={(e) => handleChange('featuredImage', e.target.value)}
                                fullWidth
                                helperText="Upload an image or video file, or enter a URL"
                                InputProps={{
                                    endAdornment: (
                                        <IconButton onClick={() => document.getElementById('featured-media-upload')?.click()} disabled={uploadingImage}>
                                            {uploadingImage ? <CircularProgress size={24} /> : <UploadIcon />}
                                        </IconButton>
                                    )
                                }}
                            />
                            {formData.featuredImage && (
                                <Box mt={2}>
                                    {showVideoThumbnailInput ? (
                                        <video src={formData.featuredImage} width="300" height="180" controls style={{ objectFit: 'cover', borderRadius: '4px', border: '1px solid #ddd' }} />
                                    ) : (
                                        <Image src={formData.featuredImage} alt="Featured image preview" width={200} height={120} style={{ objectFit: 'cover', borderRadius: '4px', border: '1px solid #ddd' }} />
                                    )}
                                </Box>
                            )}
                        </Box>

                        {showVideoThumbnailInput && (
                            <Box>
                                <input type="file" accept="image/*" id="video-thumbnail-upload" style={{ display: 'none' }} onChange={(e) => handleFileUpload(e, 'thumbnailImage')} />
                                <TextField
                                    label="Video Thumbnail URL"
                                    value={formData.thumbnailImage || ''}
                                    onChange={(e) => handleChange('thumbnailImage', e.target.value)}
                                    fullWidth
                                    helperText="Upload or enter a thumbnail image for the video"
                                    InputProps={{
                                        endAdornment: (
                                            <IconButton onClick={() => document.getElementById('video-thumbnail-upload')?.click()} disabled={uploadingImage}>
                                                {uploadingImage ? <CircularProgress size={24} /> : <UploadIcon />}
                                            </IconButton>
                                        )
                                    }}
                                />
                                {formData.thumbnailImage && (
                                    <Box mt={2}>
                                        <Image src={formData.thumbnailImage} alt="Video thumbnail preview" width={200} height={120} style={{ objectFit: 'cover', borderRadius: '4px', border: '1px solid #ddd' }} />
                                    </Box>
                                )}
                            </Box>
                        )}

                        <MemoizedTiptapEditor value={formData.content} onChange={(value) => handleChange('content', value)} />

                        <FormControlLabel control={<Checkbox checked={formData.isFeatured} onChange={(e) => handleChange('isFeatured', e.target.checked)} />} label="Featured Article" />

                        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                            <Button type="button" variant="outlined" onClick={() => router.push('/admin')}>Cancel</Button>
                            <Button type="submit" variant="contained" disabled={loading}>{loading ? <CircularProgress size={24} /> : (isEditing ? 'Update' : 'Create')}</Button>
                        </Box>
                    </Stack>
                </Box>
            </DashboardCard>
        </PageContainer>
    );
}
