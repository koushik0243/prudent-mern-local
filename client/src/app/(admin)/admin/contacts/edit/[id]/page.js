import EditContact from '@/Components/Admin/Contacts/EditContact';

export const metadata = {
  title: "Edit Contact - Admin",
  description: "Edit contact information",
  keywords: "edit, contact, admin",
};

const page = async ({ params }) => {
    const { id } = await params;
    return (
        <EditContact id={id} />
    )
}

export default page
