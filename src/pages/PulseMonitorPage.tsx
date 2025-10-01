import PulseMonitor from "@/components/PulseMonitor";

const PulseMonitorPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Pulse Monitor</h1>
        <p className="text-muted-foreground">
          Surveillez les métriques en temps réel de vos événements
        </p>
      </div>
      
      <PulseMonitor />
    </div>
  );
};

export default PulseMonitorPage;
