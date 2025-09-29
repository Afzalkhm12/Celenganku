'use client';

import { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Modal } from '../ui/Modal';
import toast from 'react-hot-toast';

interface Category {
  id?: string;
  name: string;
  type: 'INCOME' | 'EXPENSE';
}

interface CategoryFormProps {
  category?: Category;
  isOpen: boolean;
  onClose: () => void;
  onSave: (category: Category) => void;
}

const categoryTypes = [
  { value: 'INCOME', label: 'Pemasukan' },
  { value: 'EXPENSE', label: 'Pengeluaran' },
];

export default function CategoryForm({ category, isOpen, onClose, onSave }: CategoryFormProps) {
  const [formData, setFormData] = useState<Category>({
    name: category?.name || '',
    type: category?.type || 'EXPENSE',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      const url = category?.id ? `/api/categories/${category.id}` : '/api/categories';
      const method = category?.id ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error) {
          toast.error(data.error);
        }
        return;
      }

      toast.success(category?.id ? 'Kategori berhasil diperbarui!' : 'Kategori berhasil dibuat!');
      onSave(data);
      onClose();
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: keyof Category, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={category?.id ? 'Edit Kategori' : 'Tambah Kategori Baru'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nama Kategori"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="Masukkan nama kategori"
          required
          error={errors.name}
        />

        <Select
          label="Tipe Kategori"
          value={formData.type}
          onChange={(e) => handleChange('type', e.target.value as 'INCOME' | 'EXPENSE')}
          options={categoryTypes}
          required
          error={errors.type}
        />

        <div className="flex justify-end space-x-3 mt-6">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isLoading}
          >
            Batal
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? 'Menyimpan...' : (category?.id ? 'Perbarui' : 'Simpan')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}