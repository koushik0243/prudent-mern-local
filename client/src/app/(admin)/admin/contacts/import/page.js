import ImportContact from '@/Components/Admin/Contacts/ImportContact';

export const metadata = {
  title: 'Import Contact - Admin',
  description: 'Import contacts',
  keywords: 'import, contact, admin',
};

const page = () => {
    return (
        <ImportContact />
    );
};

export default page;
