// pages/ResetPassword.jsx

import React, { useEffect, useState } from "react";
import assets from "../assets/assets";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const ResetPassword = () => {

    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState(["", "", "", "", "", ""])
    const [newPassword, setNewPassword] = useState("");

    const navigate = useNavigate();

    const handleOtpChange = (value, index) => {

        if (isNaN(value)) return

        const newOtp = [...otp]
        newOtp[index] = value.substring(value.length - 1)

        setOtp(newOtp)

        // move focus to next input
        if (value && index < 5) {
            document.getElementById(`otp-${index + 1}`).focus()
        }

    }

    const handleKeyDown = (e, index) => {

        if (e.key === "Backspace" && !otp[index] && index > 0) {
            document.getElementById(`otp-${index - 1}`).focus()
        }

    }

    useEffect(() => {

        const storedEmail = localStorage.getItem("resetEmail");

        if (storedEmail) {
            setEmail(storedEmail);
        }

        const firstInput = document.getElementById("otp-0");
        if (firstInput) firstInput.focus();

    }, []);

    const submitHandler = async (e) => {

        e.preventDefault();

        const otpValue = otp.join("");

        try {

            const res = await axios.post("/api/auth/reset-password", {
                email,
                otp: otpValue,
                newPassword
            });

            toast.success(res.data.message || "Password reset successful");

            localStorage.removeItem("resetEmail");

            navigate("/login")

        }
        catch (err) {

            toast.error(err.response?.data?.message || "Error resetting password")

        }

    };

    const handlePaste = (e) => {

        const paste = e.clipboardData.getData("text").trim()

        if (!/^\d{6}$/.test(paste)) return

        const pasteArray = paste.split("")

        setOtp(pasteArray)

        pasteArray.forEach((digit, index) => {
            const input = document.getElementById(`otp-${index}`)
            if (input) input.value = digit
        })

        document.getElementById("otp-5")?.focus()

    }

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

                <h2 className="font-medium text-2xl">Reset Password</h2>

                <input
                    type="email"
                    placeholder="Email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="p-2 border border-gray-500 rounded-md
        focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />

                <div className="flex gap-2 justify-center" onPaste={handlePaste}>

                    {otp.map((digit, index) => (
                        <input
                            id={`otp-${index}`}
                            key={index}
                            type="text"
                            maxLength="1"
                            value={digit}
                            onChange={(e) => handleOtpChange(e.target.value, index)}
                            onKeyDown={(e) => handleKeyDown(e, index)}
                            className="w-10 h-10 text-center border border-gray-500 rounded-md
  focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-transparent"
                        />
                    ))}

                </div>

                <input
                    type="password"
                    placeholder="New Password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="p-2 border border-gray-500 rounded-md
        focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />

                <button
                    type="submit"
                    className="py-3 bg-gradient-to-r from-purple-400
        to-violet-600 text-white rounded-md cursor-pointer">

                    Reset Password

                </button>

            </form>

        </div>

    );

};

export default ResetPassword;