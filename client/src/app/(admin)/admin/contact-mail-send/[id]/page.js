import ShowContactMailSend from '@/Components/Admin/ContactMailSend/ShowContactMailSend';

export const metadata = {
  title: 'View Contact Mail Send - Admin',
  description: 'View contact mail send information',
  keywords: 'view, contact, mail, send, admin',
};

const page = async ({ params }) => {
  const { id } = await params;
  return <ShowContactMailSend id={id} />;
};

export default page;
