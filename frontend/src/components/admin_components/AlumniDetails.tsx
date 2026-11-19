import React from "react";
import ProfilePic from "../../assets/placeholders/pfp_placeholder.avif";
import { Info, GraduationCap, BriefcaseBusiness } from "lucide-react";
import Text from "../../components/Text";
import { AlumniProps } from "../../types/adminView";

/**
 * @interface AlumniDetailsProps
 * @description Props definition for the AlumniDetails component.
 * @property {AlumniProps} alumni - The object containing the data for the alumnus to display. This object should conform to the AlumniProps type structure.
 */
interface AlumniDetailsProps {
  alumni: AlumniProps;
}

/**
 * @component AlumniDetails
 * @description A React component responsible for rendering a detailed view of an alumnus's information.
 * It displays a profile picture alongside structured sections for basic, educational (currently placeholders),
 * and employment details. Uses a two-column grid layout for displaying key-value information within each section.
 *
 * @param {AlumniDetailsProps} props - The props for the component.
 * @param {AlumniProps} props.alumni - The data object for the specific alumnus whose details are being displayed.
 * @returns {React.ReactElement} The JSX structure for displaying alumni details.
 */
const AlumniDetails: React.FC<AlumniDetailsProps> = ({ alumni }) => {
  return (
    <div className="flex flex-row gap-12">
      <div className="rounded-full w-36 h-36 aspect-w-1 aspect-h-1 bg-Gradient2">
        <img
          src={ProfilePic}
          className="object-cover w-full h-full p-1 rounded-full"
        ></img>
      </div>
      <div className="flex flex-col gap-6">
        {/* BASIC INFORMATION */}
        <div className="flex flex-col">
          {/* title section */}
          <div className="flex flex-row gap-2 items-center">
            <Info className="text-Primary" size={16} />
            <Text
              text={"Basic Information"}
              format={"small"}
              className="!font-semibold"
            />
          </div>
          {/* details section */}
          <div className="grid grid-cols-[auto_1fr] gap-x-12 gap-y-1 pl-7">
            <div>
              <Text text={"Full Name:"} format={"small"} />
            </div>
            <div>
              <Text
                text={`${alumni.first_name} ${alumni.last_name}`}
                format={"small"}
              />
            </div>
            <div>
              <Text text={"Email Address:"} format={"small"} />
            </div>
            <div>
              <Text text={alumni.email} format={"small"} />
            </div>
            <div>
              <Text text={"Contact:"} format={"small"} />
            </div>
            <div>
              <Text text={"---"} format={"small"} />
            </div>
            <div>
              <Text text={"Location:"} format={"small"} />
            </div>
            <div>
              <Text text={alumni.location || "---"} format={"small"} />
            </div>
          </div>
        </div>

        {/* EDUCATIONAL INFORMATION */}
        <div className="flex flex-col">
          {/* title section */}
          <div className="flex flex-row gap-2 items-center">
            <GraduationCap className="text-Primary" size={16} />
            <Text
              text={"Educational Information"}
              format={"small"}
              className="!font-semibold"
            />
          </div>
          {/* details section */}
          <div className="grid grid-cols-[auto_1fr] gap-x-12 gap-y-1 pl-7">
            <div>
              <Text text={"PHD:"} format={"small"} />
            </div>
            <div>
              <Text text={undefined} format={"small"} />
            </div>
            <div>
              <Text text={"Masters:"} format={"small"} />
            </div>
            <div>
              <Text text={undefined} format={"small"} />
            </div>
            <div>
              <Text text={"Undergraduate:"} format={"small"} />
            </div>
            <div>
              <Text text={undefined} format={"small"} />
            </div>
          </div>
        </div>

        {/* EMPLOYMENT INFORMATION */}
        <div>
          <div className="flex flex-col">
            {/* title section */}
            <div className="flex flex-row gap-2 items-center">
              <BriefcaseBusiness className="text-Primary" size={16} />
              <Text
                text={"Employment Information"}
                format={"small"}
                className="!font-semibold"
              />
            </div>
            {/* details section */}
            <div className="grid grid-cols-[auto_1fr] gap-x-12 gap-y-1 pl-7">
              <div>
                <Text text={"Job Title:"} format={"small"} />
              </div>
              <div>
                <Text text={alumni.current_career?.position} format={"small"} />
              </div>
              <div>
                <Text text={"Company:"} format={"small"} />
              </div>
              <div>
                <Text text={alumni.current_career?.company} format={"small"} />
              </div>
              <div>
                <Text text={"Location:"} format={"small"} />
              </div>
              <div>
                <Text text={undefined} format={"small"} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlumniDetails;
