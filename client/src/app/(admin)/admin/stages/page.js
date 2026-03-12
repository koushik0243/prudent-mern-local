import ListStages from '@/Components/Admin/Stages/ListStages';

export const metadata = {
  title: "Stages - Admin",
  description: "Manage stages",
  keywords: "stages, list, admin",
};

const page = () => {
    return (
        <ListStages />
    )
}

export default page
