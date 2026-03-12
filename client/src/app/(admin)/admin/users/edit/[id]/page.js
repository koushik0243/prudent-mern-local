import EditUser from '@/Components/Admin/Users/EditUser';

export const metadata = {
  title: "Edit User - Admin",
  description: "Edit user information",
  keywords: "edit, user, admin",
};

const page = async ({ params }) => {
    const { id } = await params;
    return (
        <EditUser id={id} />
    )
}

export default page
