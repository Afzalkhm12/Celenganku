'use client';

import { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Modal } from '../ui/Modal';
import toast from 'react-hot-toast';

interface Account {
  id?: string;
  name: string;
  type: string;
  balance: number;
}

interface AccountFormProps {
  account?: Account;
  isOpen: boolean;
  onClose: () => void;
  onSave: (account: Account) => void;
}

const accountTypes = [
  { value: 'savings', label: 'Tabungan' },
  { value: 'checking', label: 'Giro' },
  { value: 'credit', label: 'Kartu Kredit' },
  { value: 'cash', label: 'Tunai' },
  { value: 'investment', label: 'Investasi' },
];

export default function AccountForm({ account, isOpen, onClose, onSave }: AccountFormProps) {
  const [formData, setFormData] = useState<Account>({
    name: account?.name || '',
    type: account?.type || '',
    balance: account?.balance || 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      const url = account?.id ? `/api/accounts/${account.id}` : '/api/accounts';
      const method = account?.id ? 'PUT' : 'POST';

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

      toast.success(account?.id ? 'Akun berhasil diperbarui!' : 'Akun berhasil dibuat!');
      onSave(data);
      onClose();
    } catch (error) {
      console.error('Error saving account:', error);
      toast.error('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: keyof Account, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={account?.id ? 'Edit Akun' : 'Tambah Akun Baru'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nama Akun"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="Masukkan nama akun"
          required
          error={errors.name}
        />

        <Select
          label="Tipe Akun"
          value={formData.type}
          onChange={(e) => handleChange('type', e.target.value)}
          options={accountTypes}
          placeholder="Pilih tipe akun"
          required
          error={errors.type}
        />

        <Input
          label="Saldo Awal"
          type="number"
          value={formData.balance}
          onChange={(e) => handleChange('balance', parseFloat(e.target.value) || 0)}
          placeholder="0"
          min="0"
          step="0.01"
          required
          error={errors.balance}
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
            {isLoading ? 'Menyimpan...' : (account?.id ? 'Perbarui' : 'Simpan')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}