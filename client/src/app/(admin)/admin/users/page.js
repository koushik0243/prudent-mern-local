import ListUsers from '@/Components/Admin/Users/ListUsers';

export const metadata = {
  title: "Users - Admin",
  description: "Manage users",
  keywords: "users, list, admin",
};

const page = () => {
    return (
        <ListUsers />
    )
}

export default page
