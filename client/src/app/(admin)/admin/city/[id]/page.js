import ShowCity from '@/Components/Admin/City/ShowCity';

export const metadata = {
  title: 'View City - Admin',
  description: 'View city information',
  keywords: 'view, city, admin',
};

const page = async ({ params }) => {
    const { id } = await params;
    return (
        <ShowCity id={id} />
    );
};

export default page;
