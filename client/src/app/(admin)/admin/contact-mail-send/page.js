import ListContactMailSend from '@/Components/Admin/ContactMailSend/ListContactMailSend';

export const metadata = {
  title: 'Contact Mail Send - Admin',
  description: 'Manage contact mail send records',
  keywords: 'contact, mail, send, admin',
};

const page = () => {
  return <ListContactMailSend />;
};

export default page;
