import React, { useState, useEffect, useRef } from "react";
// import { AArrowDown, AArrowUp } from "lucide-react";
import icsLogo from "../assets/logos/ics.png";
import upLogo from "../assets/logos/up.png";
import reconnectLogo from "../assets/logos/logo.png";
import SlotCounter from "react-slot-counter";
import LandingLoginField from "../components/auth/LandingLoginField";
import OAuthButton from "../components/auth/OAuthButton"; // New component
import globeImg from "../assets/earth-light.webp";

import Globe from "globe.gl";

/**
 *
 * @returns the main landing page of the website containing the sign-in interface.
 * @description This page includes a sign-in form, a sign-up link, and a legal disclaimer. The page also features an animated globe visual.
 */
const LandingPage: React.FC = () => {
  // State management for password visibility and auth toggle
  const [showPasswordVisible, setShowPasswordVisible] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [toggleEmailAuth, setToggleEmailAuth] = useState(false);

  const globeEl = useRef<any>(null);

  useEffect(() => {
    if (!globeEl.current) return;

    // commenting this out because it is not used, remove if not needed @luis-dm
    //   const markerSvg = `<svg viewBox="-4 0 36 36">
    //   <path fill="currentColor" d="M14,0 C21.732,0 28,5.641 28,12.6 C28,23.963 14,36 14,36 C14,36 0,24.064 0,12.6 C0,5.641 6.268,0 14,0 Z"></path>
    //   <circle fill="black" cx="14" cy="14" r="7"></circle>
    // </svg>`;

    const N = 10;
    const arcsData = [...Array(N).keys()].map(() => ({
      startLat: (Math.random() - 0.5) * 360,
      startLng: (Math.random() - 0.5) * 360,
      endLat: (Math.random() - 0.5) * 3600,
      endLng: (Math.random() - 0.5) * 360,
      color: [
        ["E8F9FF", "#E8F9FF", "E8F9FF", "#E8F9FF"][
          Math.floor(Math.random() * 4)
        ],
        ["E8F9FF", "#E8F9FF", "#E8F9FF", "E8F9FF"][
          Math.floor(Math.random() * 4)
        ],
      ],
    }));

    const world = new Globe(globeEl.current)
      .globeImageUrl(globeImg)
      .backgroundColor("rgba(0,0,0,0)")
      .arcsData(arcsData)
      .arcColor("color")
      .arcStroke(0.45)
      .arcDashLength(0.8)
      .arcDashGap(0.3)
      .arcDashAnimateTime(() => Math.random() * 4000 + 2500);

    // helper to fit the globe to its parent
    const resizeGlobe = () => {
      const { clientWidth, clientHeight } = globeEl.current;
      world.width(clientWidth).height(clientHeight);
    };
    // initial size
    resizeGlobe();
    // update on window resize
    window.addEventListener("resize", resizeGlobe);

    // Enable auto-rotate
    world.controls().autoRotate = true;
    world.controls().autoRotateSpeed = 3;
    world.controls().enableZoom = false;

    return () => {
      window.removeEventListener("resize", resizeGlobe);
      world._destructor?.();
    };
  }, []);

  return (
    <div className="flex flex-row items-start justify-center w-full min-h-screen overflow-y-auto text-white md:h-screen grow bg-Gradient2">
      <div className="flex flex-row justify-center w-full h-full xl:mx-16 max-w-[1480px] max-h-[1000px]">
        {/* LEFT PANEL - AUTHENTICATION INTERFACE */}
        <section className="flex flex-col justify-start items-center h-full basis-2/5 min-w-[25rem] p-8 z-100">
          {/* INSTITUTION LOGOS HEADER */}
          <div className="flex flex-row items-center justify-center w-full h-auto gap-2 md:justify-start">
            <img
              src={icsLogo}
              alt="Institute of Computer Science logo"
              className="w-20"
            />
            <img
              src={upLogo}
              alt="University of the Philippines logo"
              className="w-20"
            />
            <img src={reconnectLogo} alt="Reconnect logo" className="w-20" />
          </div>

          {/* MAIN CONTENT AREA */}
          <div className="flex flex-col items-start justify-center w-full gap-6 pl-0 grow">
            <div className="flex flex-col items-center justify-center w-full gap-6 drop">
              {/* ANIMATED HEADLINE */}
              <h1 className="w-full mt-16 text-4xl font-semibold text-center md:mt-8 md:text-left md:text-5xl/15 line">
                JOIN OUR <br className=" md:block" /> NETWORK OF OVER{" "}
                <SlotCounter
                  value="1,372"
                  direction="top-down"
                  startValue="1,372"
                  speed={0.75}
                  duration={3}
                  animateOnVisible={true}
                  valueClassName="drop-shadow-md"
                  containerClassName="-translate-y-1 -translate-x-1"
                />{" "}
                ICS ALUMNI.
              </h1>

              {/* OAUTH PROVIDERS SECTION */}
              <figure
                className={`flex flex-col items-stretch justify-center gap-4 px-1 self-stretch ${
                  toggleEmailAuth ? "hidden" : ""
                }`}
              >
                {/* NOTE: temporarily commented out due to deployment problems */}
                {/* <OAuthButton
                  provider="Facebook"
                  logo="fb"
                  href={`${import.meta.env.VITE_API_URL}/facebook/auth/signin`}
                /> */}
                <OAuthButton
                  provider="Google"
                  logo="google"
                  href={`${import.meta.env.VITE_API_URL}/google/auth/signin`}
                />

                {/* EMAIL AUTH TOGGLE */}
                <button
                  onClick={() => setToggleEmailAuth(true)}
                  className="w-full text-base text-white transition-all duration-200 bg-transparent border-2 border-white rounded-full active:brightness-90 hover:bg-white hover:text-Primary btn h-14"
                >
                  Sign in with Email
                </button>

                {/* LEGAL DISCLAIMER */}
                <figcaption className="p-2 text-xs font-light text-center ">
                  By clicking continue to join or sign in, you agree to
                  RE:CONNECT's{" "}
                  {/* @TODO Create User Agreement and Privacy Policy Pages */}
                  <a className="font-medium underline" href="/user-agreement">
                    User Agreement
                  </a>{" "}
                  and{" "}
                  <a className="font-medium underline" href="/privacy-policy">
                    Privacy Policy
                  </a>
                </figcaption>
              </figure>

              {/* EMAIL LOGIN FORM */}
              <LandingLoginField
                toggleEmailAuth={toggleEmailAuth}
                showPassword={showPassword}
                setShowPasswordVisible={setShowPasswordVisible}
                showPasswordVisible={showPasswordVisible}
                setShowPassword={setShowPassword}
                setToggleEmailAuth={setToggleEmailAuth}
              />

              {/* REGISTRATION PROMPT */}
              <div className="flex flex-col items-center justify-center w-full text-sm">
                <p>New to RE:CONNECT?</p>
                <strong className="mb-8">
                  <a className="font-bold underline" href="/signup">
                    Click here to join now
                  </a>
                </strong>
              </div>
            </div>
          </div>
        </section>

        {/* RIGHT PANEL - VISUAL SECTION */}
        <section className="flex-col items-center justify-start hidden h-full md:flex basis-3/5 shrink-1 ">
          {/* APPLICATION TITLE */}
          <h2 className="w-full px-8 m-8 text-2xl text-end">
            RE:<strong>CONNECT</strong>
          </h2>

          {/* ANIMATED GLOBE VISUAL */}
          <div className="flex justify-center items-center w-full h-[700px] px-4">
            <div ref={globeEl} className="h-full " />
          </div>

          {/* NOTE: might go back to this for future implementation */}
          {/* TEXT SIZE BUTTONS */}
          {/* <div className="flex flex-row justify-end w-full px-8 mb-16 right-8 bottom-8">
            <button className="w-16 p-0 text-white bg-transparent border-0 rounded-full shadow-none btn">
              <AArrowUp size={48} strokeWidth={2.25} />
            </button>
            <button className="p-0 text-white bg-transparent border-0 rounded-full shadow-none btn">
              <AArrowDown size={48} strokeWidth={2.25} />
            </button>
          </div> */}
        </section>
      </div>
    </div>
  );
};

export default LandingPage;
