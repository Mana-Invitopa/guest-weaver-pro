import AdminDashboardLayout from "@/pages/AdminDashboardLayout";
import EventScheduler from "@/components/EventScheduler";

const SchedulerPage = () => {
  return (
    <AdminDashboardLayout>
      <EventScheduler eventId="global" />
    </AdminDashboardLayout>
  );
};

export default SchedulerPage;