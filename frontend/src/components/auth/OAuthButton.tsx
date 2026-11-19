import React from "react";
import fbLogo from "../../assets/logos/fb.png";
import googleLogo from "../../assets/logos/google.png";

interface OAuthButtonProps {
  provider: "Facebook" | "Google";
  logo: "fb" | "google";
  email?: string;
  href: string;
}

const OAuthButton: React.FC<OAuthButtonProps> = ({ provider, logo, email, href }) => {
  const logos = {
    fb: fbLogo,
    google: googleLogo
  };

  return (
    <a
      href={href}
      className="active:brightness-90 hover:border-2 border-Tertiary duration-300 transition-all btn bg-transparent bg-gradient-to-bl from-Primary/70 to-Primary/5 flex flex-row justify-start items-center text-white border-0 shadow-none w-full text-2xl h-16 rounded-[1.8rem]"
    >
      {logo === "google" ? (
        <div className="flex items-center justify-center p-0 bg-white rounded-full min-w-11 w-11 h-11">
          <img src={logos[logo]} alt={`${provider} logo`} className="w-8 rounded-full" />
        </div>
      ) : (
        <img src={logos[logo]} alt={`${provider} logo`} className="w-12 pr-1 rounded-full" />
      )}
      
      <div className="flex flex-col items-start justify-center">
        <h2 className="text-sm font-bold text-left line-clamp-1">
          Continue with {provider}
        </h2>
        {email && <p className="text-xs font-light">{email}</p>}
      </div>
    </a>
  );
};

export default OAuthButton;