import React from "react";

interface ReConnectProps {
  size?: string;
}

const ReConnect: React.FC<ReConnectProps> = ({ size = "text-3xl" }) => {
  return (
    <div className="flex">
      <span className={`w-full ${size} text-Primary`}>RE:</span>
      <span className={`w-full font-bold ${size} text-Primary`}>CONNECT</span>
    </div>
  );
};

export default ReConnect;
