// pages/ForgotPassword.jsx

import React, { useState } from "react";
import assets from "../assets/assets";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const ForgotPassword = () => {

  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const [timer, setTimer] = useState(0)
  const [isSending, setIsSending] = useState(false)

  useEffect(() => {

    let interval;

    if (timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => prev - 1)
      }, 1000)
    }

    return () => clearInterval(interval)

  }, [timer])

  const submitHandler = async (e) => {
    e.preventDefault();

    if (timer > 0) {
      toast.error(`Please wait ${timer}s before requesting another OTP`)
      return
    }

    try {

      setIsSending(true)

      const res = await axios.post("/api/auth/forgot-password", { email });

      toast.success(res.data.message || "OTP sent to your email 📩");

      // store email for reset page
      localStorage.setItem("resetEmail", email);

      setTimer(60)

      setTimeout(() => {
        navigate("/reset-password")
      }, 1200)

    } catch (error) {

      toast.error(error.response?.data?.message || "Error sending OTP");

    }
    finally {
      setIsSending(false)
    }
  };

  return (

    <div className="min-h-screen bg-cover bg-center flex items-center
    justify-center gap-8 sm:justify-evenly max-sm:flex-col backdrop-blur-2xl">

      {/* LEFT */}
      <img src={assets.logo_big} alt="" className="w-[min(30vw,250px)]" />

      {/* RIGHT */}

      <form
        onSubmit={submitHandler}
        className="border-2 bg-white/8 text-white border-gray-500 p-6 flex
      flex-col gap-6 rounded-lg shadow-lg">

        <h2 className="font-medium text-2xl">Forgot Password</h2>

        <input
          type="email"
          placeholder="Enter your email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="p-2 border border-gray-500 rounded-md
          focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

        <button
          type="submit"
          className="py-3 bg-gradient-to-r from-purple-400
          to-violet-600 text-white rounded-md cursor-pointer">

          {timer > 0 ? `Resend OTP in ${timer}s` : "Send OTP"}

        </button>

      </form>

    </div>

  );

};

export default ForgotPassword;