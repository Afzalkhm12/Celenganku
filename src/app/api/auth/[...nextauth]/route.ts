// FIX: Impor handlers dari auth.ts yang sudah dikonfigurasi
import { handlers } from '../../../../auth';
// FIX: Ekspor handlers secara langsung sebagai GET dan POST
export const { GET, POST } = handlers;