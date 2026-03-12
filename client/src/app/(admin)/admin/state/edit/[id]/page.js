import EditState from '@/Components/Admin/State/EditState';

export const metadata = {
  title: 'Edit State - Admin',
  description: 'Edit state information',
  keywords: 'edit, state, admin',
};

const page = async ({ params }) => {
    const { id } = await params;
    return (
        <EditState id={id} />
    );
};

export default page;
