import MainLayout from '@/src/components/layout/main-layout';
import Inbox from '@/src/features/inbox/components/inbox';
import Header from '@/src/components/layout/headers/issues/header';

export default function InboxPage() {
   return (
      <MainLayout header={<Header />}>
         <Inbox />
      </MainLayout>
   );
}
