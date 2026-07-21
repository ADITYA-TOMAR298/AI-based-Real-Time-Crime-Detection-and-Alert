import { useEffect, useState } from "react";
import { getIncidentHistory } from "../../services/incidentService";

export default function Timeline() {

  const [history, setHistory] = useState([]);

  async function loadHistory() {

    try {

      const data = await getIncidentHistory();

      setHistory(data);

    } catch (err) {

      console.error(err);

    }

  }

  useEffect(() => {

    loadHistory();

    const interval = setInterval(loadHistory, 2000);

    return () => clearInterval(interval);

  }, []);

  return (

    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">

      <h2 className="text-2xl font-bold mb-5">

        Recent Events

      </h2>

      <div className="space-y-3 max-h-80 overflow-y-auto">

        {history.length === 0 && (

          <div className="text-slate-400">

            No incidents found.

          </div>

        )}

        {history.map((item) => (

  <div
    key={item.id}
    className="border border-slate-800 rounded-xl p-3"
  >

    <div className="flex justify-between">

      <span className="font-semibold">

        #{item.id}

      </span>

      <span>

        {new Date(item.created_at).toLocaleString()}

      </span>

    </div>

    <div className="mt-2">

      <span className="text-red-400">

        {item.incident_type}

      </span>

    </div>

    <div className="mt-1">

      Confidence :

      {(item.confidence * 100).toFixed(1)}%

    </div>

    <div className="mt-1">

      Status :

      {item.status}

    </div>

  </div>

))}

      </div>

    </div>

  );

}