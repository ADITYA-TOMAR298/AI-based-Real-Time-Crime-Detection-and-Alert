import { useEffect, useState } from "react";
import {
  AlertTriangle,
  ShieldCheck,
  CheckCircle,
} from "lucide-react";

import {
  getActiveIncident,
  acknowledgeIncident,
} from "../../services/incidentService";

export default function AlertsPanel() {

  const [incident, setIncident] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadIncident() {

    try {

      const data = await getActiveIncident();

      setIncident(data);

    } catch (err) {

      console.error(err);

    } finally {

      setLoading(false);

    }

  }

  useEffect(() => {

    loadIncident();

    const interval = setInterval(loadIncident, 1000);

    return () => clearInterval(interval);

  }, []);

  async function handleAcknowledge() {

    await acknowledgeIncident(incident.id);

    loadIncident();

  }

  if (loading) {

    return (

      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">

        Loading...

      </div>

    );

  }

  return (

    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">

      <h2 className="text-2xl font-bold flex items-center gap-2 mb-6">

        <AlertTriangle className="text-red-500" />

        Live Alerts

      </h2>

      {!incident?.active ? (

        <div className="flex items-center gap-3 text-green-400">

          <CheckCircle />

          No Active Incident

        </div>

      ) : (

        <div className="space-y-5">

          <div className="flex justify-between">

            <span>Incident ID</span>

            <span className="font-semibold">

              #{incident.id}

            </span>

          </div>

          <div className="flex justify-between">

            <span>Type</span>

            <span className="text-red-400 font-semibold">

              {incident.type}

            </span>

          </div>

          <div className="flex justify-between">

            <span>Confidence</span>

            <span>

              {(incident.confidence * 100).toFixed(1)}%

            </span>

          </div>

          <div className="flex justify-between">

            <span>Status</span>

            <span className="text-red-500">

              ACTIVE

            </span>

          </div>

          {incident.snapshot && (

            <img
              src={incident.snapshot}
              alt="Incident"
              className="rounded-xl border border-slate-700"
            />

          )}

          <button
            onClick={handleAcknowledge}
            className="w-full bg-red-600 hover:bg-red-700 py-3 rounded-xl font-semibold"
          >

            Acknowledge Incident

          </button>

        </div>

      )}

    </div>

  );

}