import { useContext, useRef } from "react";
import ProfilePic from "../../assets/placeholders/pfp_placeholder.avif";
import { useLogout } from "../../hooks/useLogout";
import { AuthContext } from "../../context/AuthContext";
import Button from "../../components/Button";

const AccountDropdown = ({ className }: { className?: string }) => {
  const buttonRef = useRef<HTMLDivElement>(null);
  const { logout } = useLogout();
  const authContext = useContext(AuthContext);
  const user = authContext?.user;
  const username: string = `${
    user ? user.first_name + " " + user.last_name : "Loading..."
  }`;
  const role: string = user?.role || "User";
  const company: string = user?.current_career?.company || "Company";

  return (
    <div className="dropdown dropdown-end w-max text-primary">
      <div
        tabIndex={0}
        role="button"
        ref={buttonRef}
        className="flex items-center justify-center h-10 rounded-full cursor-pointer aspect-square bg-Gradient2"
      >
        <img
          src={ProfilePic}
          alt="Profile"
          className="object-cover w-full h-full rounded-full p-[.15rem]"
        />
      </div>

      <ul
        tabIndex={0}
        className={`dropdown-content card bg-base-100 w-max min-w-72 rounded-xl z-[1] mt-4 p-4 shadow-xl ${
          className ?? ""
        }`}
      >
        <div className="flex flex-col p-1">
          <div className="flex flex-row ">
            <div className="flex justify-start p-2">
              <div className="flex justify-center h-12 rounded-full aspect-w-1 aspect-h-1 bg-Gradient2">
                <img
                  src={ProfilePic}
                  className="h-full rounded-full p-[.16rem]"
                />
              </div>
              <div className="flex flex-col justify-center gap-1 px-2">
                <h2 className="text-sm font-medium leading-none">{username}</h2>
                <p className="text-sm font-light leading-none">{`${role} at ${company}`}</p>
              </div>
            </div>
            <div className="flex flex-col"> </div>
          </div>
          {window.location.pathname !== "/user/profile" && (
            <Button
              onClick={() => {
                if (document.activeElement instanceof HTMLElement)
                  document.activeElement.blur();
                // navigate to profile page
                window.location.href = "/user/profile";
              }}
              className="p-2 mb-2 text-sm text-center transition bg-transparent rounded-lg font-regular grow hover:bg-MidBlue focus:bg-transparent active:bg-transparent"
            >
              View profile
            </Button>
          )}
          {/* <button
                        onClick={() => {
                            if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
                            // navigate to profile page
                            window.location.href = '/user/privacy-policy';
                        }}
                        className="p-2 text-base text-left transition bg-transparent rounded-lg grow hover:bg-MidBlue focus:bg-transparent active:bg-transparent"
                    >
                        Settings & Privacy
                    </button>
                    <button
                        onClick={() => {
                            if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
                            // navigate to profile page
                            // window.location.href = '/user/profile';
                        }}
                        className="p-2 text-base text-left transition bg-transparent rounded-lg grow hover:bg-MidBlue focus:bg-transparent active:bg-transparent"
                    >
                        Activity
                    </button> */}
          <button
            onClick={() => {
              if (document.activeElement instanceof HTMLElement)
                document.activeElement.blur();
              logout();
            }}
            className="p-2 mt-4 text-base text-left transition bg-transparent rounded-lg grow hover:bg-MidBlue focus:bg-transparent active:bg-transparent"
          >
            Sign out
          </button>
        </div>
      </ul>
    </div>
  );
};

export default AccountDropdown;
