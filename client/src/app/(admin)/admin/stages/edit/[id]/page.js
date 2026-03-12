import EditStage from '@/Components/Admin/Stages/EditStage';

export const metadata = {
  title: "Edit Stage - Admin",
  description: "Edit stage information",
  keywords: "edit, stage, admin",
};

const page = async ({ params }) => {
    const { id } = await params;
    return (
        <EditStage id={id} />
    )
}

export default page
