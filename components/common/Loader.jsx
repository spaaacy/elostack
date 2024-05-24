import React from "react";
import { ClimbingBoxLoader } from "react-spinners";

const Loader = () => {
  return (
    <div className="flex flex-1 ">
      <div className="m-auto">
        <ClimbingBoxLoader color={"#EBEBEB"} />
      </div>
    </div>
  );
};

export default Loader;
