import React, { useState, useEffect, useRef } from "react";
import Footer from "../components/auth/Footer";
import ReConnect from "../components/auth/ReConnect";

// import images
import Logo from "../assets/logos/logo.png";
import ICSLogo from "../assets/logos/ics.png";
import UPLBLogo from "../assets/logos/up.png";
import { CircleCheckBig, Eye, EyeOff, Mail } from "lucide-react";
import Button from "../components/Button";



const ForgotPasswordPage: React.FC = () => {
    const [step, setStep] = useState<"EmailInput" | "Verification" | "NewPassword" | "Success">("EmailInput");

    // email input
    const [email, setEmail] = useState<string>("");
    const [emailError, setEmailError] = useState<string>("");

    // verification
    const sampleValidCode = "0000";
    const [code, setCode] = useState(["", "", "", ""]);
    const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
    const [resetTimer, setResetTimer] = useState(false);
    const [timerDone, setTimerDone] = useState(false);
    const [codeError, setCodeError] = useState<string>("");

    // new password input
    const [newPassword, setNewPassword] = useState<string>("");
    const [newPasswordError, setNewPasswordError] = useState<string>("");
    const [showNewPassword, setShowNewPassword] = useState<boolean>(true);
    const [confirmPassword, setConfirmPassword] = useState<string>("");
    const [confirmPasswordError, setConfirmPasswordError] = useState<string>("");
    const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);

    const validateEmail = () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleContinueFromEmailInput = () => {
        let isValid = validateEmail();
        setEmailError(`${isValid ? "" : "Please enter a valid email"}`)
        // proceed to verification if email is valid
        if (email && isValid){
            setStep("Verification");
            handleSendCode();
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
        if (e.key === "Backspace" && !code[index] && index > 0) {
            const newCode = [...code];
            newCode[index - 1] = "";
            setCode(newCode);
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleChange = (value: string, index: number) => {
        if (!/^\d?$/.test(value)) return;
        const newCode = [...code];
        newCode[index] = value;
        setCode(newCode);
    
        // Move to next input
        if (value && index < 3) {
          inputRefs.current[index + 1]?.focus();
        }
    };

    // INTEGRATED with backend
    const handleContinueFromVerification = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/verify-code`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email,
                    code: code.join(""),
                })
            });
    
            if (!response.ok) {
                const data = await response.json();
                setCodeError(data.detail || "Invalid code. Please try again.");
            } else {
                setCodeError("");
                setStep("NewPassword");
            }
    
        } catch (error) {
            console.error("Error verifying code:", error);
            setCodeError("An error occurred while verifying the code.");
        }
    };

    const handleResendButton = () => {
        // only resend a code if the countdown for the current code is done
        if (timerDone) {
            handleSendCode();
        }
    }

    const handleContinueFromNewPassword = () => {
        let isPasswordValid = newPassword && newPassword.length > 8;
        setNewPasswordError(`${isPasswordValid ? "" : "Password must be at least 8 characters"}`)

        let arePasswordsMatching = confirmPassword && (newPassword === confirmPassword);
        setConfirmPasswordError(`${arePasswordsMatching ? "" : "Password does not match with new password"}`)
        
        // proceed to success message if code is valid
        if (isPasswordValid && arePasswordsMatching){
            handlePasswordChange();
            setStep("Success");
        }
    }

    //@TODO send code logic here
    const handleSendCode = async () => {
        try {
            setTimerDone(false);
            setResetTimer(prev => !prev);
    
            const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/send-reset-code`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email })
            });
    
            if (!response.ok) {
                const data = await response.json();
                setEmailError(data.detail || "Failed to send reset code.");
            } else {
                console.log("Reset code sent.");
            }
    
        } catch (error) {
            console.error("Error sending reset code:", error);
            setEmailError("An error occurred while sending the reset code.");
        }
    };

    //@TODO send password change here
    const handlePasswordChange = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/reset-password`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email,
                    code: code.join(""),
                    new_password: newPassword
                })
            });
    
            if (!response.ok) {
                const data = await response.json();
                setCodeError(data.detail || "Failed to reset password.");
            } else {
                console.log("Password reset successful.");
                setStep("Success");
            }
    
        } catch (error) {
            console.error("Error resetting password:", error);
            setCodeError("An error occurred while resetting the password.");
        }
    };


  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-Tertiary relative">
      {/* header part with logos and app name */}
      <div className="flex flex-row w-full items-center justify-center md:justify-between pt-7 pl-15 pr-15 absolute top-0 left-0">
        <div className="flex flex-row items-center justify-center">
          <img
            src={UPLBLogo}
            alt="UPLBLogo"
            className="w-13 sm:w-17 md:w-19 lg:w-21 h-auto m-1"
          />
          <img
            src={ICSLogo}
            alt="ICS Logo"
            className="w-12 sm:w-16 md:w-18 lg:w-20 h-auto m-1"
          />
          <img
            src={Logo}
            alt="Logo"
            className="w-12 sm:w-16 md:w-18 lg:w-20 h-auto m-1"
          />
        </div>
        <div className="hidden md:block">
          <ReConnect size="text-3xl" />
        </div>
      </div>

        {/* forgot password box */}
        <div className="bg-white max-w-[560px] p-10 rounded-xl m-10">
            {/* Email Input Portion */}
            <div className={`flex flex-col gap-3 ${ step==="EmailInput" ? '' : 'hidden'}`}>
                <h2 className="text-2xl text-Primary">Forgot Password</h2>
                <h3 className="text-sm text-[#828282]">Enter your email for the verification proccess, we will send a 4-digit code to your email.</h3>
                <div className="flex flex-col gap-1">
                    <h4 className="text-sm text-[#467EBA] font-medium">Please provide your email <span className="text-Required">*</span></h4>
                    <div className="flex items-center gap-2 border border-DarkerPrimary bg-[#f2f9ff] py-2 px-3 rounded-xl">
                        <Mail size={14} className="text-[#467EBA]"/>
                        <input
                            type="text"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email"
                            className="text-sm focus:outline-none placeholder-[#97A9BE]"
                        />
                    </div>
                    <h4 className="text-sm text-Warning font-medium">{emailError}</h4>
                </div>
                <Button
                    onClick={handleContinueFromEmailInput}>
                    CONTINUE
                </Button>
            </div>

            {/* Verification with 4 slot input and countdown */}
            <div className={`flex flex-col gap-3 ${ step==="Verification" ? '' : 'hidden'}`}>
                <h2 className="text-2xl text-Primary">Verification</h2>
                <h3 className="text-sm text-[#828282]">Enter the 4-digit code sent to your email.</h3>
                {/* Code Inputs */}
                <div className="flex justify-center space-x-3">
                    {code.map((digit, idx) => (
                    <input
                        key={idx}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleChange(e.target.value, idx)}
                        onKeyDown={(e) => handleKeyDown(e, idx)}
                        ref={(el) => {
                            inputRefs.current[idx] = el;
                          }}
                        className="w-12 h-12 text-xl text-center border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    ))}
                </div>
                <div>
                    <CountdownTimer resetSignal={resetTimer} doneSignal={() => setTimerDone(true)} />
                    <h4 className="text-sm text-Warning text-center pt-4 font-medium">{codeError}</h4>
                    <Button
                        onClick={handleContinueFromVerification}
                        className={`${timerDone ? 'hidden' : ''}`}
                    >
                        CONTINUE
                    </Button>
                    <Button
                        onClick={handleResendButton}
                        className={`${timerDone ? '' : 'hidden'}`}
                    >
                        RESEND CODE
                    </Button>
                </div>
                <h3 className="text-xs text-center text-[#828282]">Didn't receive a code?{" "} 
                    <button className="text-Primary"
                        onClick={handleResendButton}
                    >
                        Resend
                    </button>
                </h3>
            </div>

            {/* New Password Portion */}
            <div className={`flex flex-col gap-3 ${ step==="NewPassword" ? '' : 'hidden'}`}>
                <h2 className="text-2xl text-Primary">New Password</h2>
                <h3 className="text-sm text-[#828282]">Set a new password for your account so you can login and access all features.</h3>
                <div className="flex flex-col gap-1">
                    <h4 className="text-sm text-[#467EBA] font-medium">Enter new password</h4>
                    <div className="flex items-center gap-2 border border-DarkerPrimary bg-[#f2f9ff] py-2 px-3 rounded-xl">
                        <input
                            type={showNewPassword ? 'text' : 'password'}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Enter password"
                            className="text-sm focus:outline-none placeholder-[#97A9BE] w-full"
                        />
                        <button onClick={() => setShowNewPassword(prev => !prev)}>
                            { showNewPassword? <Eye size={14} className="text-[#467EBA]"/> : <EyeOff size={14} className="text-[#467EBA]"/>}
                        </button>
                    </div>
                    <h4 className="text-sm text-Warning font-medium">{newPasswordError}</h4>
                </div>
                <div className="flex flex-col gap-1">
                    <h4 className="text-sm text-[#467EBA] font-medium">Confirm password</h4>
                    <div className="flex items-center gap-2 border border-DarkerPrimary bg-[#f2f9ff] py-2 px-3 rounded-xl">
                        <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Enter password"
                            className="text-sm focus:outline-none placeholder-[#97A9BE] w-full"
                        />
                        <button onClick={() => setShowConfirmPassword(prev => !prev)}>
                            { showConfirmPassword? <Eye size={14} className="text-[#467EBA]"/> : <EyeOff size={14} className="text-[#467EBA]"/>}
                        </button>
                    </div>
                    <h4 className="text-sm text-Warning font-medium">{confirmPasswordError}</h4>
                </div>
                <Button
                    onClick={handleContinueFromNewPassword}>
                    CONTINUE
                </Button>
            </div>

            {/* Success message */}
            <div className={`flex flex-col items-center gap-4 ${ step==="Success" ? '' : 'hidden'}`}>
                <CircleCheckBig size={128} className="text-[#467EBA]"/>
                <h2 className="text-4xl text-center text-Primary">Success</h2>
                <h3 className="text-sm text-center text-[#828282]">Your password has been reset successfully</h3>
                <Button
                    onClick={() => {window.location.href = "/"}}>
                    CONTINUE
                </Button>
            </div>
        </div>
      
      {/* footer */}
      <div className="flex w-full absolute bottom-0 left-0">
        <Footer />
      </div>
    </div>
  );
};

const CountdownTimer: React.FC<{ resetSignal: boolean, doneSignal: () => void }> = ({ resetSignal, doneSignal }) => {
    const duration: number = 60;
    const [timeLeft, setTimeLeft] = useState(duration);

    // Format time as MM:SS
    const formatTime = (seconds: number) => {
        const mins = String(Math.floor(seconds / 60)).padStart(2, "0");
        const secs = String(seconds % 60).padStart(2, "0");
        return `${mins}:${secs}`;
    };

    useEffect(() => {
        setTimeLeft(duration); // reset when signal changes
    }, [resetSignal]);

    // Timer countdown
    useEffect(() => {
        if (timeLeft === 0) {
        //setResendEnabled(true);
        doneSignal();
        return;
        }
        const interval = setInterval(() => setTimeLeft((t) => t - 1), 1000);
        return () => clearInterval(interval);
    }, [timeLeft]);


    return (
        <div className={`text-DarkerPrimary text-sm font-semibold text-center ${formatTime(timeLeft) == "00:00" ? 'text-Required' : ''}`}>{formatTime(timeLeft)}</div>
    );
}

export default ForgotPasswordPage;
