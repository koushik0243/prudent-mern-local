import AddCity from '@/Components/Admin/City/AddCity';

export const metadata = {
  title: 'Add City - Admin',
  description: 'Add new city',
  keywords: 'add, city, admin',
};

const page = () => {
    return (
        <AddCity />
    );
};

export default page;
