import Members from '@/src/features/members/components/members';
import Header from '@/src/components/layout/headers/members/header';
import MainLayout from '@/src/components/layout/main-layout';

export default function MembersPage() {
   return (
      <MainLayout header={<Header />}>
         <Members />
      </MainLayout>
   );
}
