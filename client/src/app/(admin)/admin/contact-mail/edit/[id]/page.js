import EditContactMail from '@/Components/Admin/ContactMail/EditContactMail';

export const metadata = {
  title: 'Edit Contact Mail - Admin',
  description: 'Edit contact mail information',
  keywords: 'edit, contact, mail, admin',
};

const page = async ({ params }) => {
  const { id } = await params;
  return <EditContactMail id={id} />;
};

export default page;
