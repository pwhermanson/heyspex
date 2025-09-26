'use client';

import MainLayout from '@/src/components/layout/main-layout';
import AllIssues from '@/src/components/shared/issues/all-issues';
import Header from '@/src/components/layout/headers/issues/header';

export default function Home() {
   return (
      <MainLayout header={<Header />}>
         <AllIssues />
      </MainLayout>
   );
}
