import ShowUser from '@/Components/Admin/Users/ShowUser';

export const metadata = {
  title: "View User - Admin",
  description: "View user information",
  keywords: "view, user, admin",
};

const page = async ({ params }) => {
    const { id } = await params;
    return (
        <ShowUser id={id} />
    )
}

export default page
