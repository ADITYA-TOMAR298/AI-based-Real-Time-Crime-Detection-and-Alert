import { useEffect, useState } from "react";
import { getIncidentHistory } from "../../services/incidentService";

export default function History() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    loadHistory();
  }, []);

  async function loadHistory() {
    try {
      const data = await getIncidentHistory();
      setHistory(data);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">

      <h1 className="text-4xl font-bold mb-8">
        Incident History
      </h1>

      <div className="space-y-5">

        {history.length === 0 && (
          <div className="text-slate-400">
            No incidents found.
          </div>
        )}

        {history.map((item) => (

          <div
            key={item.id}
            className="bg-slate-900 rounded-xl p-5 border border-slate-800"
          >

            <div className="flex justify-between">

              <div>

                <div className="font-bold text-lg">

                  {item.incident_type}

                </div>

                <div className="text-slate-400">

                  {new Date(item.created_at).toLocaleString()}

                </div>

              </div>

              <div className="text-right">

                <div>

                  {(item.confidence * 100).toFixed(1)}%

                </div>

                <div>

                  {item.status}

                </div>

              </div>

            </div>

            {item.snapshot_path && (

              <img
                src={`http://localhost:8000/${item.snapshot_path}`}
                className="rounded-lg mt-5 w-80"
                alt="Snapshot"
              />

            )}

          </div>

        ))}

      </div>

    </div>
  );
}