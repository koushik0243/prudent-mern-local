import EditCity from '@/Components/Admin/City/EditCity';

export const metadata = {
  title: 'Edit City - Admin',
  description: 'Edit city information',
  keywords: 'edit, city, admin',
};

const page = async ({ params }) => {
    const { id } = await params;
    return (
        <EditCity id={id} />
    );
};

export default page;
