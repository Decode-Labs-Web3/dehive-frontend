import UserBar from '@/components/(auth)/UserBar';
import ServerBar from '@/components/(auth)/ServerBar';
import MessageBar from '@/components/(auth)/MessageBar';

export default async function Dashboard() {

  return (
    <>
      <ServerBar />
      <UserBar />
      <MessageBar />
    </>
  );
}
