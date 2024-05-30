import React from "react";
import { BounceLoader } from "react-spinners";

const Loader = () => {
  return (
    <div className="flex flex-1 ">
      <div className="m-auto">
        <BounceLoader color={"var(--primary)"} />
      </div>
    </div>
  );
};

export default Loader;
