import { toast } from 'react-hot-toast';
import * as React from 'react';

export const useAppToast = () => {
  const stableToast = React.useMemo(() => ({
    success: (message: string) => toast.success(message),
    error: (message: string) => toast.error(message),
    loading: (message: string) => toast.loading(message),
    dismiss: (toastId?: string) => toast.dismiss(toastId),
  }), []); 

  return stableToast;
};