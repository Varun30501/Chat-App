import { assets } from "../assets/assets";

const AuthLayout = ({children}) => {

  return (

  <div className="flex h-screen">

    <div className="hidden md:flex w-1/2 items-center justify-center bg-gray-100">

      <img src={assets.header_img} className="w-[350px]" />

    </div>

    <div className="flex w-full md:w-1/2 items-center justify-center">

      {children}

    </div>

  </div>

  );
};

export default AuthLayout;