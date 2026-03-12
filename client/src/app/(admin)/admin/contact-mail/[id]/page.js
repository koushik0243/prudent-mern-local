import ShowContactMail from '@/Components/Admin/ContactMail/ShowContactMail';

export const metadata = {
  title: 'View Contact Mail - Admin',
  description: 'View contact mail information',
  keywords: 'view, contact, mail, admin',
};

const page = async ({ params }) => {
  const { id } = await params;
  return <ShowContactMail id={id} />;
};

export default page;
