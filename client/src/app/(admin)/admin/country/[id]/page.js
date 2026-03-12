import ShowCountry from '@/Components/Admin/Country/ShowCountry';

export const metadata = {
  title: 'View Country - Admin',
  description: 'View country information',
  keywords: 'view, country, admin',
};

const page = async ({ params }) => {
    const { id } = await params;
    return (
        <ShowCountry id={id} />
    );
};

export default page;
