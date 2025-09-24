import Teams from '@/src/features/teams/components/teams';
import Header from '@/src/components/layout/headers/teams/header';
import MainLayout from '@/src/components/layout/main-layout';

export default function TeamsPage() {
   return (
      <MainLayout header={<Header />}>
         <Teams />
      </MainLayout>
   );
}
