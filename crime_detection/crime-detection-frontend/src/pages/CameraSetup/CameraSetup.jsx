import { useEffect, useState } from "react";
import { getStatus } from "../../services/statusService";

export default function CameraSetup() {

    const [status, setStatus] = useState(null);

    useEffect(() => {

        loadStatus();

        const interval = setInterval(loadStatus, 2000);

        return () => clearInterval(interval);

    }, []);

    async function loadStatus() {

        try {

            const data = await getStatus();

            setStatus(data);

        } catch (err) {

            console.error(err);

        }

    }

    return (

        <div className="min-h-screen bg-slate-950 text-white p-8">

            <h1 className="text-4xl font-bold mb-8">

                Camera Setup

            </h1>

            <div className="bg-slate-900 rounded-xl p-6 border border-slate-800 space-y-4">

                <div className="flex justify-between">

                    <span>Camera</span>

                    <span className={status?.camera_connected ? "text-green-400" : "text-red-400"}>

                        {status?.camera_connected ? "Connected" : "Disconnected"}

                    </span>

                </div>

                <div className="flex justify-between">

                    <span>Backend</span>

                    <span className={status?.backend_connected ? "text-green-400" : "text-red-400"}>

                        {status?.backend_connected ? "Running" : "Stopped"}

                    </span>

                </div>

                <div className="flex justify-between">

                    <span>FPS</span>

                    <span>{status?.fps}</span>

                </div>

            </div>

        </div>

    );

}