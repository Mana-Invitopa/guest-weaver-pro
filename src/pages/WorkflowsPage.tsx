import AdminDashboardLayout from "@/pages/AdminDashboardLayout";
import EventWorkflowManager from "@/components/EventWorkflowManager";

const WorkflowsPage = () => {
  return (
    <AdminDashboardLayout>
      <EventWorkflowManager eventId="global" />
    </AdminDashboardLayout>
  );
};

export default WorkflowsPage;