import MainLayout from '@/src/components/layout/main-layout';
import Settings from '@/src/features/settings/components/settings';
import Header from '@/src/components/layout/headers/settings/header';

export default function SettingsPage() {
   return (
      <MainLayout header={<Header />} headersNumber={1}>
         <Settings />
      </MainLayout>
   );
}
