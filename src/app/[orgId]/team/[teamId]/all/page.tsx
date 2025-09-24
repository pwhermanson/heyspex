import AllIssues from '@/src/components/shared/issues/all-issues';
import Header from '@/src/components/layout/headers/issues/header';
import MainLayout from '@/src/components/layout/main-layout';

export default function AllIssuesPage() {
   return (
      <MainLayout header={<Header />}>
         <AllIssues />
      </MainLayout>
   );
}
