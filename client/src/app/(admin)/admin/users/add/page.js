import AddUser from '@/Components/Admin/Users/AddUser';

export const metadata = {
  title: "Add User - Admin",
  description: "Add new user",
  keywords: "add, user, admin",
};

const page = () => {
    return (
        <AddUser />
    )
}

export default page
