import ShowContact from '@/Components/Admin/Contacts/ShowContact';

export const metadata = {
  title: "View Contact - Admin",
  description: "View contact information",
  keywords: "view, contact, admin",
};

const page = async ({ params }) => {
    const { id } = await params;
    return (
        <ShowContact id={id} />
    )
}

export default page
