import ListContactMail from '@/Components/Admin/ContactMail/ListContactMail';

export const metadata = {
  title: 'Contact Mail - Admin',
  description: 'Manage contact mail records',
  keywords: 'contact, mail, admin',
};

const page = () => {
  return <ListContactMail />;
};

export default page;
