import EditCountry from '@/Components/Admin/Country/EditCountry';

export const metadata = {
  title: 'Edit Country - Admin',
  description: 'Edit country information',
  keywords: 'edit, country, admin',
};

const page = async ({ params }) => {
    const { id } = await params;
    return (
        <EditCountry id={id} />
    );
};

export default page;
