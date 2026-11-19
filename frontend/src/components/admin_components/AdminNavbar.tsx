import { Link, useLocation } from "react-router-dom";
import {
  UsersRound,
  Heart,
  BriefcaseBusiness,
  LogOut,
  RefreshCcw,
  LayoutDashboard,
  CalendarMinus2,
} from "lucide-react";
import logo from "../../assets/logos/logo.png";
import BriefcaseFilled from "../custom_icons/BriefcaseIcon_filled.tsx";
import CalendarFilled from "../custom_icons/CalendarIconFilled.tsx";
import HeartFilled from "../custom_icons/HeartIconFilled.tsx";
import { useEffect, useState } from "react";
import { useLogout } from "../../hooks/useLogout.ts";

const AdminNavbar = () => {
  const { logout } = useLogout()
  const currentLocation = useLocation();
  const [activePage, setActivePage] = useState<string>("");
  useEffect(() => {
    const path = currentLocation.pathname;

    if (path.includes("dashboard")) setActivePage("Dashboard");
    else if (path.includes("alumni")) setActivePage("Alumni");
    else if (path.includes("events")) setActivePage("Events");
    else if (path.includes("donations")) setActivePage("Donations");
    else if (path.includes("jobs")) setActivePage("Jobs");
    else setActivePage("Dashboard");
  }, [currentLocation.pathname]);

  return (
    // replaced w-1/4 with w-full max-w-[20vw]
    <div
      className={`flex flex-col justify-between h-full min-h-screen w-full max-w-[20vw] bg-Tertiary gap-16 sticky top-0 z-90 border-DarkBlue`}
    >
      {/* name of app, redirects to homepage */}
      <Link
        to="/admin/dashboard"
        className="text-Primary size-20 font-medium pl-7 pt-12 flex-none hover:scale-[1.02] transition-transform"
      >
        <img src={logo} />
      </Link>

      {/* navigation buttons */}
      <div className="flex flex-col flex-2 gap-2 text-Primary items-start">
        <Link
          to="/admin/dashboard"
          className={`flex items-center gap-2 w-full px-7 p-3 hover:bg-MidBlue transition-all ${activePage == "Dashboard"
              ? "bg-MidBlue border-r-4 border-DarkerPrimary"
              : ""
            }`}
        >
          {activePage == "Dashboard" ? (
            <LayoutDashboard
              style={{
                fill: "var(--color-Primary)",
                color: "var(--color-Primary)",
              }}
            />
          ) : (
            <LayoutDashboard />
          )}
          <span className="text-Primary">Dashboard</span>
        </Link>

        <Link
          to="/admin/alumni"
          className={`flex items-center gap-2 w-full px-7 p-3 hover:bg-MidBlue transition-all ${activePage == "Alumni"
              ? "bg-MidBlue border-r-4 border-DarkerPrimary"
              : ""
            }`}
        >
          {activePage == "Alumni" ? (
            <UsersRound
              style={{
                fill: "var(--color-Primary)",
                color: "var(--color-Primary)",
              }}
            />
          ) : (
            <UsersRound />
          )}
          <span className="text-Primary">Alumni</span>
        </Link>

        <Link
          to="/admin/jobs"
          className={`flex items-center gap-2 w-full px-7 p-3 hover:bg-MidBlue transition-all ${activePage == "Jobs"
              ? "bg-MidBlue border-r-4 border-DarkerPrimary"
              : ""
            }`}
        >
          {activePage == "Jobs" ? (
            <BriefcaseFilled />
          ) : (
            <BriefcaseBusiness style={{ color: "var(--color-Primary)" }} />
          )}
          <span className="text-Primary">Jobs</span>
        </Link>

        <Link
          to="/admin/donations"
          className={`flex items-center gap-2 w-full px-7 p-3 hover:bg-MidBlue transition-all ${activePage == "Donations"
              ? "bg-MidBlue border-r-4 border-DarkerPrimary"
              : ""
            }`}
        >
          {activePage == "Donations" ? (
            <HeartFilled />
          ) : (
            <Heart style={{ color: "var(--color-Primary)" }} />
          )}
          <span className="text-Primary">Donations</span>
        </Link>

        <Link
          to="/admin/events"
          className={`flex items-center gap-2 w-full px-7 p-3 hover:bg-MidBlue transition-all ${activePage == "Events"
              ? "bg-MidBlue border-r-4 border-DarkerPrimary"
              : ""
            }`}
        >
          {activePage == "Events" ? (
            <CalendarFilled />
          ) : (
            <CalendarMinus2 style={{ color: "var(--color-Primary)" }} />
          )}
          <span className="text-Primary">Events</span>
        </Link>
      </div>

      {/* Switch Account & Log Out */}
      <div className="flex flex-col gap-1 pb-6" flex-none>
        <Link
          to={"/user"}
          className={`flex cursor-pointer items-center gap-2 w-full px-7 p-3 hover:bg-MidBlue transition-all `}
        >
          <RefreshCcw style={{ color: "var(--color-Primary)" }} />
          <span className="text-Primary">Switch Account</span>
        </Link>

        <div
          onClick={() => {
            logout()
          }}
          className={`flex cursor-pointer items-center gap-2 w-full px-7 p-3 hover:bg-MidBlue transition-all`}
        >
          <LogOut style={{ color: "var(--color-Required)" }} />
          <span className=" text-Required">Log Out</span>
        </div>
      </div>
    </div>
  );
};

export default AdminNavbar;
