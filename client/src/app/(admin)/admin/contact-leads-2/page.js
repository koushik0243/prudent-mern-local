import ContactLeads2 from '@/Components/Admin/Contacts/ContactLeads2';

export const metadata = {
  title: 'Contact Leads 2 - Admin',
  description: 'Manage qualified and disqualified leads grouped by stage',
  keywords: 'contact leads, stage leads, qualified leads, disqualified leads, admin',
};

const page = () => {
    return (
        <ContactLeads2 />
    )
}

export default page
