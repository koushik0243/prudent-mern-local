import ListTagManagers from '@/Components/Admin/TagManagers/ListTagManagers';

export const metadata = {
  title: "Tag Managers - Admin",
  description: "Manage tag managers",
  keywords: "tag, managers, list, admin",
};

const page = () => {
    return (
        <ListTagManagers />
    )
}

export default page
