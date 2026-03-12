import ShowState from '@/Components/Admin/State/ShowState';

export const metadata = {
  title: 'View State - Admin',
  description: 'View state information',
  keywords: 'view, state, admin',
};

const page = async ({ params }) => {
    const { id } = await params;
    return (
        <ShowState id={id} />
    );
};

export default page;
