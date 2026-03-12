import ShowTagManager from '@/Components/Admin/TagManagers/ShowTagManager';

export const metadata = {
  title: "View Tag Manager - Admin",
  description: "View tag manager information",
  keywords: "view, tag, manager, admin",
};

const page = async ({ params }) => {
    const { id } = await params;
    return (
        <ShowTagManager id={id} />
    )
}

export default page
