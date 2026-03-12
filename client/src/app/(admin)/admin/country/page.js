import ListCountries from '@/Components/Admin/Country/ListCountries';

export const metadata = {
  title: 'Country - Admin',
  description: 'Manage countries',
  keywords: 'country, list, admin',
};

const page = () => {
    return (
        <ListCountries />
    );
};

export default page;
