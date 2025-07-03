'use client';
import { useEffect, useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Stack,
  IconButton
} from '@mui/material';
import { Delete, Edit, Save } from '@mui/icons-material';
import axios from 'axios';

interface Category {
  _id: string;
  name: string;
}

const CategoriesPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedName, setEditedName] = useState('');

  const fetchCategories = async () => {
    try {
      const res = await axios.get('/api/categories');
      setCategories(res.data.categories || res.data); // adjust to match API shape
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleAdd = async () => {
    if (!newCategory.trim()) return;
    try {
      await axios.post('/api/categories', { name: newCategory });
      setNewCategory('');
      fetchCategories();
    } catch (error) {
      console.error('Error adding category:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`/api/categories/${id}`);
      fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  const handleEdit = (id: string, name: string) => {
    setEditingId(id);
    setEditedName(name);
  };

  const handleSave = async (id: string) => {
    try {
      await axios.put(`/api/categories/${id}`, { name: editedName });
      setEditingId(null);
      fetchCategories();
    } catch (error) {
      console.error('Error updating category:', error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <Box p={3}>
      <Typography variant="h5" mb={2}>Manage Categories</Typography>

      {/* Add New Category */}
      <Stack direction="row" spacing={2} mb={3}>
        <TextField
          label="New Category"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
        />
        <Button variant="contained" onClick={handleAdd}>Add</Button>
      </Stack>

      {/* Category List */}
      {categories.map((category) => (
        <Paper key={category._id} sx={{ mb: 2, p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {editingId === category._id ? (
            <>
              <TextField
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                sx={{ flex: 1, mr: 2 }}
              />
              <IconButton onClick={() => handleSave(category._id)}><Save /></IconButton>
            </>
          ) : (
            <>
              <Typography>{category.name}</Typography>
              <Box>
                <IconButton onClick={() => handleEdit(category._id, category.name)}><Edit /></IconButton>
                <IconButton onClick={() => handleDelete(category._id)} color="error"><Delete /></IconButton>
              </Box>
            </>
          )}
        </Paper>
      ))}
    </Box>
  );
};

export default CategoriesPage;
