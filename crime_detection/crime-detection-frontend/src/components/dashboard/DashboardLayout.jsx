import Header from "./Header";
import Sidebar from "./Sidebar";

import CameraFeed from "./CameraFeed";
import PredictionCard from "./PredictionCard";
import ConfidenceCard from "./ConfidenceCard";
import StatusCard from "./StatusCard";
import ProcessingCard from "./ProcessingCard";
import AlertsPanel from "./AlertsPanel";
import Timeline from "./Timeline";

// import AlertPopup from "../AlertPopup";
// import IncidentHistory from "../IncidentHistory";

export default function DashboardLayout() {

    return (

        <div className="min-h-screen bg-slate-950 text-white">

            <AlertPopup />

            <Header />

            <div className="flex">

                <Sidebar />

                <main className="flex-1 p-6 overflow-y-auto">

                    <CameraFeed />

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mt-6">

                        <PredictionCard />

                        <ConfidenceCard />

                        <ProcessingCard />

                        <StatusCard />

                    </div>

                    <div className="grid xl:grid-cols-2 gap-6 mt-6">

                        <AlertsPanel />

                        <Timeline />

                    </div>

                    <div className="mt-6">

                        <IncidentHistory />

                    </div>

                </main>

            </div>

        </div>

    );

}