import MenuBar from '@/components/(auth)/MenuBar';
import ServerBar from '@/components/(auth)/ServerBar';

export default async function Dashboard() {

  return (
    <>
      <ServerBar />
      <MenuBar />
    </>
  );
}
