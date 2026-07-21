import { Link } from "react-router-dom";
import { Shield, Camera, Bell } from "lucide-react";
import { motion } from "framer-motion";
import Navbar from "../../components/common/Navbar";

export default function Landing() {
  return (
    <>
        <Navbar />
    <div className="min-h-screen bg-slate-950 text-white">

      {/* Hero */}

      <section id="about" className="flex flex-col items-center justify-center px-6 text-center min-h-screen">

        <motion.div
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >

          <Shield className="w-20 h-20 mx-auto text-red-500 mb-6" />

          <h1 className="text-5xl font-bold mb-6">
            AI CRIME DETECTION
          </h1>

          <br />

          <p className="text-xl text-slate-400 max-w-3xl mx-auto">

            Real-time surveillance powered by Artificial Intelligence for
            anomaly detection and instant emergency alerts.

          </p>

          <br />

          <Link to="/login">

            <button className="mt-10 px-8 py-4 rounded-xl bg-red-600 hover:bg-red-700 transition text-lg font-semibold">

              Get Started

            </button>

          </Link>

        </motion.div>

      </section>

      {/* Features */}

      <section id="features" className="grid md:grid-cols-3 gap-8 px-12 pb-20">

        <FeatureCard
          icon={<Camera size={40} />}
          title="Live Monitoring"
          description="Monitor CCTV and webcams in real time using AI."
        />

        <FeatureCard
          icon={<Shield size={40} />}
          title="Crime Detection"
          description="Detect suspicious activities using deep learning."
        />

        <FeatureCard
          icon={<Bell size={40} />}
          title="Instant Alerts"
          description="Send alerts immediately when anomalies are detected."
        />

      </section>

    </div>
    </>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <motion.div
      whileHover={{ y: -10 }}
      className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center"
    >
      <div className="text-red-500 flex justify-center mb-4">
        {icon}
      </div>

      <h2 className="text-2xl font-semibold mb-4">
        {title}
      </h2>

      <p className="text-slate-400">
        {description}
      </p>
    </motion.div>
  );
}