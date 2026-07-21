import { useState } from "react";
import { useNavigate } from "react-router-dom";

import useAuth from "../../hooks/useAuth";

import UserInfoStep from "./steps/UserInfoStep";
import EmergencyStep from "./steps/EmergencyStep";
import CameraStep from "./steps/CameraStep";
import userService from "../../services/userService";

export default function Onboarding() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    fullName: user?.name || "",
    phone: "",

    email: user?.email || "",

    emergencyPhone: "",
    emergencyEmail: "",

    cameraType: "webcam",

    cameraName: "",
    ip: "",
    port: "554",
    username: "",
    password: "",
    rtsp: "",
  });

  const next = () => setStep((prev) => prev + 1);

  const back = () => setStep((prev) => prev - 1);

  const finishSetup = async () => {
    try {
      await userService.saveOnboarding({
        firebase_uid: user.uid,
        name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        emergency_phone: formData.emergencyPhone || null,
        emergency_email: formData.emergencyEmail || null,
      });
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      alert("We could not save your setup. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex justify-center py-10 px-5">
      <div className="w-full max-w-4xl">

        <h1 className="text-4xl font-bold text-center">
          Initial Setup
        </h1>

        <p className="text-slate-400 text-center mt-3 mb-10">
          Complete the setup to start AI surveillance.
        </p>

        <div className="w-full bg-slate-800 rounded-full h-3 mb-10">

          <div
            className="bg-red-600 h-3 rounded-full transition-all duration-300"
            style={{
              width: `${(step / 3) * 100}%`,
            }}
          />

        </div>

        {step === 1 && (
          <UserInfoStep
            formData={formData}
            setFormData={setFormData}
            next={next}
          />
        )}

        {step === 2 && (
          <EmergencyStep
            formData={formData}
            setFormData={setFormData}
            next={next}
            back={back}
          />
        )}

        {step === 3 && (
          <CameraStep
            formData={formData}
            setFormData={setFormData}
            back={back}
            finish={finishSetup}
          />
        )}

      </div>
    </div>
  );
}
