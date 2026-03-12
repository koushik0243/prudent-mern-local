import ShowStage from '@/Components/Admin/Stages/ShowStage';

export const metadata = {
  title: "View Stage - Admin",
  description: "View stage information",
  keywords: "view, stage, admin",
};

const page = async ({ params }) => {
    const { id } = await params;
    return (
        <ShowStage id={id} />
    )
}

export default page
