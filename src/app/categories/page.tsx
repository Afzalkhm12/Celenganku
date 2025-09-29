'use client';

import { useState, useEffect } from 'react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import CategoryForm from '../../components/categories/CategoryForm';
import { Plus, Edit, Trash2, Tag, TrendingUp, TrendingDown } from 'lucide-react';
import toast from 'react-hot-toast';

interface Category {
  id: string;
  name: string;
  type: 'INCOME' | 'EXPENSE';
  created_at: string;
  updated_at: string;
  _count: {
    transactions: number;
    budgets: number;
  };
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | undefined>();
  const [filterType, setFilterType] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL');

  useEffect(() => {
    fetchCategories();
  }, [filterType]);

  const fetchCategories = async () => {
    try {
      const url = filterType === 'ALL' ? '/api/categories' : `/api/categories?type=${filterType}`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Gagal memuat data kategori');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCategory = () => {
    setEditingCategory(undefined);
    setIsFormOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setIsFormOpen(true);
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus kategori ini?')) {
      return;
    }

    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Kategori berhasil dihapus');
        fetchCategories();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Gagal menghapus kategori');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Terjadi kesalahan saat menghapus kategori');
    }
  };

  const handleSaveCategory = () => {
    fetchCategories();
    setIsFormOpen(false);
  };

  const getTypeColor = (type: string) => {
    return type === 'INCOME' ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50';
  };

  const getTypeIcon = (type: string) => {
    return type === 'INCOME' ? TrendingUp : TrendingDown;
  };

  const filteredCategories = categories;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kelola Kategori</h1>
          <p className="text-gray-600 mt-1">
            Atur kategori pemasukan dan pengeluaran Anda
          </p>
        </div>
        <Button onClick={handleAddCategory}>
          <Plus className="h-4 w-4 mr-2" />
          Tambah Kategori
        </Button>
      </div>

      {/* Filter Buttons */}
      <div className="flex space-x-2">
        <Button
          variant={filterType === 'ALL' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setFilterType('ALL')}
        >
          Semua
        </Button>
        <Button
          variant={filterType === 'INCOME' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setFilterType('INCOME')}
          className={filterType === 'INCOME' ? 'bg-green-600 hover:bg-green-700' : ''}
        >
          <TrendingUp className="h-4 w-4 mr-1" />
          Pemasukan
        </Button>
        <Button
          variant={filterType === 'EXPENSE' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setFilterType('EXPENSE')}
          className={filterType === 'EXPENSE' ? 'bg-red-600 hover:bg-red-700' : ''}
        >
          <TrendingDown className="h-4 w-4 mr-1" />
          Pengeluaran
        </Button>
      </div>

      {filteredCategories.length === 0 ? (
        <Card className="text-center py-12">
          <Tag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {filterType === 'ALL' ? 'Belum ada kategori' : `Belum ada kategori ${filterType === 'INCOME' ? 'pemasukan' : 'pengeluaran'}`}
          </h3>
          <p className="text-gray-600 mb-4">
            Mulai dengan menambahkan kategori untuk mengorganisir transaksi Anda
          </p>
          <Button onClick={handleAddCategory}>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Kategori Pertama
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.map((category) => {
            const TypeIcon = getTypeIcon(category.type);
            return (
              <Card key={category.id} className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${getTypeColor(category.type)}`}>
                      <TypeIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {category.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {category.type === 'INCOME' ? 'Pemasukan' : 'Pengeluaran'}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEditCategory(category)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteCategory(category.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Transaksi:</span>
                    <span className="font-medium">{category._count.transactions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Anggaran:</span>
                    <span className="font-medium">{category._count.budgets}</span>
                  </div>
                </div>
                
                <div className="text-xs text-gray-500 mt-4">
                  Dibuat: {new Date(category.created_at).toLocaleDateString('id-ID')}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <CategoryForm
        category={editingCategory}
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSaveCategory}
      />
    </div>
  );
}