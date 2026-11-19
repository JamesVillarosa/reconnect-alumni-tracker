import { ArrowLeft, CircleUserRound, Settings, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import ICSLogo from "../assets/logos/ics.png";
import UPLogo from "../assets/logos/up.png";
import ReConnectLogo from "../assets/logos/logo.png";
import ProfilePic from "../assets/placeholders/pfp_placeholder.avif";
import FontInc from "../assets/font_inc.svg";
import { useAuthContext } from "../hooks/useAuthContext";
import { useState } from "react";
import { useLogout } from "../hooks/useLogout";

/**
 * A header containing a back and settings button. Default horizontal padding is px-5.
 *
 * Used in the following page/s: News and Articles Page
 * @param {string} className - for additional styling / overriding styling
 *
 * @example
 * // Overriding styling
 * <BackAndSettingsHeader className="px-10"/>
 */
export const BackAndSettingsHeader: React.FC<{
  //settingsAction: () => void;
  className?: string;
}> = ({
  //settingsAction,
  className = "",
}) => {
  const navigate = useNavigate();
  return (
    <div
      className={`flex lg:hidden justify-between bg-white text-DarkerPrimary py-5 px-5 ${className} sticky top-0 z-90`}
    >
      <button>
        <ArrowLeft
          onClick={() => {
            navigate(-1);
          }}
        />
      </button>
      <button>
        <Settings onClick={() => {}} />
      </button>
    </div>
  );
};

/**
 * A header containing a back, font size changer, and user profile button. Default horizontal padding is px-5.
 *
 * Used in the following page/s: News and Articles Page
 * @param {string} className - for additional styling / overriding styling
 *
 * @example
 * // Overriding styling
 * <BackAndFontAndProfileHeader className='px-6'/>
 */
export const BackAndFontAndProfileHeader: React.FC<{
  //settingsAction: () => void;
  className?: string;
}> = ({
  //settingsAction,
  className = "",
}) => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const profileImage: string = user ? user.profile_picture : "";

  const [isFontChangerOpen, setIsFontChangerOpen] = useState<boolean>(false);
  const [isProfilePopUpMenu, setIsProfilePopUpMenu] = useState<boolean>(false);

  return (
    <div
      className={`flex lg:hidden justify-between bg-white text-DarkerPrimary py-2 px-5 ${className} sticky top-0 z-90`}
    >
      <button>
        <ArrowLeft
          onClick={() => {
            navigate(-1);
          }}
        />
      </button>

      <div className="relative flex">
        {/* font size changer */}
        <button
          onClick={() => {
            setIsFontChangerOpen(true);
          }}
        >
          <img src={FontInc} className="h-[3rem]" />
        </button>
        <FontSizeSelector
          isOpen={isFontChangerOpen}
          closeFontChanger={() => {
            setIsFontChangerOpen(false);
          }}
          className="right-0 top-15"
        />

        {/* profile picture, redirects to profile page */}
        <button
          className="h-[3rem] rounded-full p-1"
          onClick={() => {
            setIsProfilePopUpMenu(true);
          }}
        >
          <div className="w-full h-full overflow-hidden bg-white rounded-full">
            {profileImage ? (
              <img src={profileImage} className="object-cover w-full h-full" />
            ) : (
              <img
                src={ProfilePic}
                alt="Profile"
                className="object-cover w-full h-full border-3 border-Gradient2 rounded-full p-[.15rem]"
              />
            )}
          </div>
        </button>
        <ProfilePopUpMenu
          isOpen={isProfilePopUpMenu}
          closeProfilePopUpMenu={() => {
            setIsProfilePopUpMenu(false);
          }}
          className="top-15"
        />
      </div>
    </div>
  );
};

/**
 * A header containing a font adjuster, app logos, and a profile button. Default horizontal padding is px-5. Used mainly in the HomePage, shows up in mobile view.
 * @param {string} className - for additional styling / overriding styling
 *
 * @example
 * // Overriding styling
 * <HomePageMobileHeader className="px-10"/>
 */
export const HomePageMobileHeader: React.FC<{
  className?: string;
}> = ({ className = "" }) => {
  const { user } = useAuthContext();
  const profileImage: string = user ? user.profile_picture : "";

  // const [isFontChangerOpen, setIsFontChangerOpen] = useState<boolean>(false);
  const [isProfilePopUpMenu, setIsProfilePopUpMenu] = useState<boolean>(false);

  return (
    <>
      <div
        className={`flex lg:hidden justify-between bg-white sticky z-10 top-0 -mx-5 py-2 px-5 mb-5 ${className}`}
      >
        {/* font size changer */}
        <div className="relative">
          {/* NOTE: temporarily disabled due to implementation problems */}
          {/* <button onClick={() => {setIsFontChangerOpen(true)}}>
                        <img src={FontInc} className='h-[3rem]'/>
                    </button>
                    <FontSizeSelector isOpen={isFontChangerOpen} closeFontChanger={() => {setIsFontChangerOpen(false)}}/> */}
        </div>
        {/* logos */}
        <div className="flex gap-1 h-[3rem]">
          <img src={UPLogo} />
          <img src={ICSLogo} />
          <img src={ReConnectLogo} />
        </div>
        {/* profile picture, redirects to profile page */}
        <div className="relative">
          <button
            className="h-[3rem] rounded-full p-1 bg-VerticalDarkAndBlueGradient"
            onClick={() => {
              setIsProfilePopUpMenu(true);
            }}
          >
            <div className="w-full h-full overflow-hidden bg-white rounded-full">
              {profileImage ? (
                <img
                  src={profileImage}
                  className="object-cover w-full h-full"
                />
              ) : (
                <CircleUserRound
                  style={{ color: "var(--color-Primary)" }}
                  className="object-cover w-full h-full"
                />
              )}
            </div>
          </button>
          <ProfilePopUpMenu
            isOpen={isProfilePopUpMenu}
            closeProfilePopUpMenu={() => {
              setIsProfilePopUpMenu(false);
            }}
          />
        </div>
      </div>
    </>
  );
};

// pop ups

/**
 * A pop up that allows the user to change the font size. Not implemented globally yet.
 * @param {boolean} isOpen - for controlling the visibility of the popup
 * @param {function} closeFontChanger - a function for setting isOpen to false
 * @param {string} className - for additional styling / overriding styling
 *
 * @example
 * <FontSizeSelector isOpen={isFontChangerOpen} closeFontChanger={() => {setIsFontChangerOpen(false)}}/>
 */
export const FontSizeSelector: React.FC<{
  isOpen: boolean;
  closeFontChanger: () => void;
  className?: string;
}> = ({
  //settingsAction,
  isOpen,
  closeFontChanger,
  className = "",
}) => {
  const fontSizeList: string[] = [
    "text-xs",
    "text-sm",
    "text-base",
    "text-lg",
    "text-xl",
  ];
  const [fontSize, setFontSize] = useState<string>(fontSizeList[2]);

  const handleFontSizeChange = (size: string) => {
    setFontSize(size);
  };

  return (
    <div
      className={`p-5 flex flex-col absolute bg-white shadow-sm rounded-3xl z-50 gap-4 text-Primary ${
        isOpen ? "" : "hidden"
      } ${className}`}
    >
      <X className="self-end cursor-pointer" onClick={closeFontChanger} />
      <h3 className={`self-start ${fontSize} font-semibold`}>Font Size</h3>
      <div className="relative flex items-center gap-5">
        {/* circles */}
        {fontSizeList.map((size) => {
          return (
            <button
              key={size}
              className="z-10 p-4"
              onClick={() => {
                handleFontSizeChange(size);
              }}
            >
              <div
                className={`h-2 w-2 ${
                  fontSize == size ? "h-3 w-3" : ""
                } rounded-full bg-Primary`}
              />
            </button>
          );
        })}
        {/* line connector */}
        <div className="absolute left-[1.5rem] right-[1.5rem] h-[3px] bg-Primary z-0" />
      </div>
      <div className="flex justify-between w-full -mt-6 text-sm font-semibold">
        <h4>Smallest</h4>
        <h4>Default</h4>
        <h4>Largest</h4>
      </div>
    </div>
  );
};

/**
 * A pop up that gives contains the user's profile picture, current position details, and menu options.
 * User details and View Profile buttons redirect to Profile Page.
 * Can be closed by clicking outside of the component (not implemented yet)
 * @param {boolean} isOpen - for controlling the visibility of the popup
 * @param {function} closeProfilePopup - a function for setting isOpen to false
 * @param {string} className - for additional styling / overriding styling
 *
 * @example
 * <FontSizeSelector isOpen={isFontChangerOpen} closeFontChanger={() => {setIsFontChangerOpen(false)}}/>
 */
export const ProfilePopUpMenu: React.FC<{
  isOpen: boolean;
  closeProfilePopUpMenu: () => void;
  className?: string;
}> = ({
  //settingsAction,
  isOpen,
  closeProfilePopUpMenu,
  className = "",
}) => {
  const { user } = useAuthContext();
  const { logout } = useLogout();
  const username: string = user
    ? user.first_name + " " + user.last_name
    : "Loading...";
  const position: string = "UI/UX Designer";
  const company: string = "Parkwood Entertainment";
  // const profileImage: string = user ? user.profile_picture : '';
  const profileImage: string = ""; // uncomment the line above this and delete this line

  return (
    <div
      className={`p-5 flex flex-col items-start min-w-80 absolute right-0 bg-white shadow-sm rounded-3xl z-50 gap-1 text-Primary ${
        isOpen ? "" : "hidden"
      } ${className}`}
    >
      <X className="self-end cursor-pointer" onClick={closeProfilePopUpMenu} />
      {/* user details */}
      <Link
        to="/user/profile"
        className="flex gap-3 rounded-lg hover:bg-gray-100"
      >
        <div className="h-[3rem] w-[3rem] flex-none rounded-full p-1 bg-VerticalDarkAndBlueGradient">
          <div className="w-full h-full overflow-hidden bg-white rounded-full">
            {profileImage ? (
              <img src={profileImage} className="object-cover w-full h-full" />
            ) : (
              <CircleUserRound
                style={{ color: "var(--color-Primary)" }}
                className="object-cover w-full h-full"
              />
            )}
          </div>
        </div>
        <div>
          <h2>{username}</h2>
          <h2>{position + " at " + company}</h2>
        </div>
      </Link>
      <Link to="/user/profile" className="w-full">
        <button
          className={`w-full bg-Gradient2 text-white text-sm font-medium hover:bg-Gradient1 hover:brightness-110 py-2 px-4 my-3 rounded-lg`}
        >
          View Profile
        </button>
      </Link>
      {/* @luis-dm where are these supposed to go? */}
      {/* <button className="w-full py-1 rounded-lg hover:bg-gray-100 text-start">
        Settings & Privacy
      </button>
      <button className="w-full py-1 rounded-lg hover:bg-gray-100 text-start">
        Activity
      </button> */}
      <br />
      <button
        className="w-full py-1 rounded-lg hover:bg-gray-100 text-start"
        onClick={() => {
          logout();
        }}
      >
        Sign Out
      </button>
    </div>
  );
};
