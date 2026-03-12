import ListStates from '@/Components/Admin/State/ListStates';

export const metadata = {
  title: 'State - Admin',
  description: 'Manage states',
  keywords: 'state, list, admin',
};

const page = () => {
    return (
        <ListStates />
    );
};

export default page;
