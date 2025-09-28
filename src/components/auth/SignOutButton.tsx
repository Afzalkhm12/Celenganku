'use client';

import { signOut } from 'next-auth/react';
import { Button } from '@/components/ui/Button'; // Menggunakan path alias

export default function SignOutButton() {
  return (
    <Button 
      variant="outline" 
      size="sm"
      onClick={() => signOut({ callbackUrl: '/login' })}
    >
      Sign Out
    </Button>
  );
}
