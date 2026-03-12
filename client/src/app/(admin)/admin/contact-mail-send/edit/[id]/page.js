import EditContactMailSend from '@/Components/Admin/ContactMailSend/EditContactMailSend';

export const metadata = {
  title: 'Edit Contact Mail Send - Admin',
  description: 'Edit contact mail send information',
  keywords: 'edit, contact, mail, send, admin',
};

const page = async ({ params }) => {
  const { id } = await params;
  return <EditContactMailSend id={id} />;
};

export default page;
