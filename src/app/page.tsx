'use client';

import MainLayout from '@/src/components/layout/main-layout';
import { AppShellBranded } from '@/src/components/layout/app-shell-branded';

export default function Home() {
   return (
      <MainLayout>
         <AppShellBranded />
      </MainLayout>
   );
}
