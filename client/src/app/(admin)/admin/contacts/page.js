import ListContacts from '@/Components/Admin/Contacts/ListContacts';

export const metadata = {
  title: "Contacts - Admin",
  description: "Manage contacts",
  keywords: "contacts, list, admin",
};

const page = () => {
    return (
        <ListContacts />
    )
}

export default page
