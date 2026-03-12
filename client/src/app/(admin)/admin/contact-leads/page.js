import ContactLeads from '@/Components/Admin/Contacts/ContactLeads';

export const metadata = {
  title: 'Contact Leads - Admin',
  description: 'Manage contact leads grouped by stages',
  keywords: 'contact leads, stages, lead pipeline, admin',
};

const page = () => {
    return (
        <ContactLeads />
    )
}

export default page
