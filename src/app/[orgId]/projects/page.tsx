import MainLayout from '@/src/components/layout/main-layout';
import Header from '@/src/components/layout/headers/projects/header';
import Projects from '@/src/features/projects/components/projects';

export default function ProjectsPage() {
   return (
      <MainLayout header={<Header />}>
         <Projects />
      </MainLayout>
   );
}
