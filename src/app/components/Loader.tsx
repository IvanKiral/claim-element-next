import { JSX } from "react";

const Loader = (): JSX.Element => {
  return (
    <div className="animate-spin border-solid border-8 border-[#f3f3f3] rounded-full border-t-[#5b4ff5] w-16 h-16 m-auto" />
  );
};

export default Loader;