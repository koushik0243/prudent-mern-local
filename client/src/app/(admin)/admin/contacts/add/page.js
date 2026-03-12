import AddContact from '@/Components/Admin/Contacts/AddContact';

export const metadata = {
  title: "Add Contact - Admin",
  description: "Add new contact",
  keywords: "add, contact, admin",
};

const page = () => {
    return (
        <AddContact />
    )
}

export default page
