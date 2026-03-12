import ListCities from '@/Components/Admin/City/ListCities';

export const metadata = {
  title: 'City - Admin',
  description: 'Manage cities',
  keywords: 'city, list, admin',
};

const page = () => {
    return (
        <ListCities />
    );
};

export default page;
