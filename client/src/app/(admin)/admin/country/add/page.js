import AddCountry from '@/Components/Admin/Country/AddCountry';

export const metadata = {
  title: 'Add Country - Admin',
  description: 'Add new country',
  keywords: 'add, country, admin',
};

const page = () => {
    return (
        <AddCountry />
    );
};

export default page;
