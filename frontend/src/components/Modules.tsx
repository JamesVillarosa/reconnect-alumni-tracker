import moduleImageOne from "../assets/homepage_module_one.webp";
import moduleImageTwo from "../assets/homepage_module_two.webp";
import moduleImageThree from "../assets/homepage_module_three.webp";
import moduleImageFour from "../assets/homepage_module_four.webp";
import { useNavigate } from "react-router-dom";

// for modules, to add routes once other webpages are created
const ModuleGrid: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="w-full h-full mt-4">
      <div className="flex flex-col gap-2">
        <div className="flex flex-row gap-3 justify-center">
          <div
            className="relative w-fit h-[240px] rounded-2xl cursor-pointer transition-transform transform hover:-translate-y-2 hover:shadow-lg"
            style={{ background: "var(--color-LightAndBlueGradient" }}
            onClick={() => {
              navigate("/user/jobs");
            }}
          >
            <img
              src={moduleImageOne}
              className="w-full h-full object-cover rounded-2xl"
            />
            <p className="whitespace-pre-line absolute bottom-2 right-1 text-right text-white text-xl font-semibold drop-shadow-[0px_1px_2px_rgba(0,0,0,1)] rounded-2xl">
              Browse and Share {"\n"} Opportunities
            </p>
          </div>
          <div
            className="relative w-fit h-[240px] rounded-2xl cursor-pointer transition-transform transform hover:-translate-y-2 hover:shadow-lg"
            style={{ background: "var(--color-LightAndBlueGradient" }}
            onClick={() => {
              navigate("/user/events");
            }}
          >
            <img
              src={moduleImageTwo}
              className="w-full h-full object-cover rounded-2xl"
            />
            <p className=" absolute bottom-2 right-1 text-right text-white text-xl font-semibold drop-shadow-[0px_1px_2px_rgba(0,0,0,1)] rounded-2xl">
              View Events
            </p>
          </div>
        </div>
        <div className="flex flex-row gap-3 justify-center">
          <div
            className="relative w-fit h-[200px] rounded-2xl cursor-pointer transition-transform transform hover:-translate-y-2 hover:shadow-lg"
            style={{ background: "var(--color-LightAndBlueGradient" }}
            onClick={() => {
              navigate("/user/donate");
            }}
          >
            <img
              src={moduleImageThree}
              className="w-full h-full object-cover rounded-2xl"
            />
            <p className=" absolute bottom-2 right-1 text-right text-white text-xl font-semibold drop-shadow-[0px_1px_2px_rgba(0,0,0,1)] rounded-2xl">
              Donate
            </p>
          </div>
          <div
            className="relative w-fit h-[200px] rounded-2xl cursor-pointer transition-transform transform hover:-translate-y-2 hover:shadow-lg"
            style={{ background: "var(--color-LightAndBlueGradient" }}
            onClick={() => {
              navigate("/user/requests/info");
            }}
          >
            <img
              src={moduleImageFour}
              className="w-full h-full object-cover rounded-2xl"
            />
            <p className="whitespace-pre-line absolute bottom-2 right-1 text-right text-white text-xl font-semibold drop-shadow-[0px_1px_2px_rgba(0,0,0,1)] rounded-2xl">
              Process{"\n"}Requests
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModuleGrid;
