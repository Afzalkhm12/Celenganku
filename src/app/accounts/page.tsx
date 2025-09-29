'use client';

import { useState, useEffect } from 'react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import AccountForm from '../../components/accounts/AccountForm';
import { Plus, Edit, Trash2, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';

interface Account {
  id: string;
  name: string;
  type: string;
  balance: number;
  created_at: string;
  updated_at: string;
}

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | undefined>();

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const response = await fetch('/api/accounts');
      if (response.ok) {
        const data = await response.json();
        setAccounts(data);
      }
    } catch (error) {
      console.error('Error fetching accounts:', error);
      toast.error('Gagal memuat data akun');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAccount = () => {
    setEditingAccount(undefined);
    setIsFormOpen(true);
  };

  const handleEditAccount = (account: Account) => {
    setEditingAccount(account);
    setIsFormOpen(true);
  };

  const handleDeleteAccount = async (accountId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus akun ini?')) {
      return;
    }

    try {
      const response = await fetch(`/api/accounts/${accountId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Akun berhasil dihapus');
        fetchAccounts();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Gagal menghapus akun');
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error('Terjadi kesalahan saat menghapus akun');
    }
  };

  const handleSaveAccount = () => {
    fetchAccounts();
    setIsFormOpen(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getAccountTypeLabel = (type: string) => {
    const types = {
      savings: 'Tabungan',
      checking: 'Giro',
      credit: 'Kartu Kredit',
      cash: 'Tunai',
      investment: 'Investasi',
    };
    return types[type as keyof typeof types] || type;
  };

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
          <h1 className="text-2xl font-bold text-gray-900">Kelola Akun</h1>
          <p className="text-gray-600 mt-1">
            Kelola semua akun keuangan Anda dalam satu tempat
          </p>
        </div>
        <Button onClick={handleAddAccount}>
          <Plus className="h-4 w-4 mr-2" />
          Tambah Akun
        </Button>
      </div>

      {accounts.length === 0 ? (
        <Card className="text-center py-12">
          <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Belum ada akun
          </h3>
          <p className="text-gray-600 mb-4">
            Mulai dengan menambahkan akun pertama Anda
          </p>
          <Button onClick={handleAddAccount}>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Akun Pertama
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accounts.map((account) => (
            <Card key={account.id} className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {account.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {getAccountTypeLabel(account.type)}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEditAccount(account)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeleteAccount(account.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(account.balance)}
              </div>
              <div className="text-sm text-gray-500 mt-2">
                Dibuat: {new Date(account.created_at).toLocaleDateString('id-ID')}
              </div>
            </Card>
          ))}
        </div>
      )}

      <AccountForm
        account={editingAccount}
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSaveAccount}
      />
    </div>
  );
}