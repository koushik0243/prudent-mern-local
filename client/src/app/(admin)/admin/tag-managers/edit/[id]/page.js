import EditTagManager from '@/Components/Admin/TagManagers/EditTagManager';

export const metadata = {
  title: "Edit Tag Manager - Admin",
  description: "Edit tag manager information",
  keywords: "edit, tag, manager, admin",
};

const page = async ({ params }) => {
    const { id } = await params;
    return (
        <EditTagManager id={id} />
    )
}

export default page
