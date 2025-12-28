import { useContext, useState } from "react";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { AppContent } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

const Login = () => {
  const navigate = useNavigate();
  const { backendUrl, setIsLoggedin, getUserData } = useContext(AppContent);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const role = "vendor";

  const onSubmitHandler = async (e) => {
    axios.defaults.withCredentials = true;

    try {
      e.preventDefault();
      const { data } = await axios.post(
        backendUrl + "/auth/vendor/login",
        {
          email,
          password,
          role,
        }
      );

      if (data.success) {
        setIsLoggedin(true);
        getUserData();
        navigate("/");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Login failed. Try again."
      );
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-200 px-6 sm:px-0">
      {/* Logo */}
      <div
        onClick={() => navigate("/")}
        className="cursor-pointer flex absolute top-3 left-3 sm:left-5"
      >
        <img src={assets.logo} alt="Logo" className="w-30 sm:w-65" />
      </div>

      {/* Card */}
      <div className="bg-white p-10 rounded-lg shadow-lg w-full sm:w-96 text-gray-700 text-sm">
        <h2 className="text-3xl font-semibold text-[#003DA5] text-center mb-3">
          Login
        </h2>
        <p className="text-sm mb-6 text-center text-gray-500">
          Login to your account
        </p>

        <form onSubmit={onSubmitHandler}>
          {/* Email */}
          <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-gray-100">
            <img src={assets.mail_icon} alt="Email" />
            <input
              className="bg-transparent outline-none placeholder-gray-400 flex-1"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email ID"
              required
            />
          </div>

          {/* Password */}
          <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-gray-100">
            <img src={assets.lock_icon} alt="Password" />
            <input
              className="bg-transparent outline-none placeholder-gray-400 flex-1"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
            />
          </div>

          {/* Forgot Password */}
          <p
            onClick={() => navigate("/reset-password")}
            className="mb-4 text-[#003DA5] cursor-pointer text-right"
          >
            Forgot Password?
          </p>

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-2.5 rounded-full bg-[#003DA5] text-white font-medium hover:bg-[#002D7A] transition cursor-pointer"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;



// import { useContext, useState } from "react";
// import { assets } from "../assets/assets";
// import { useNavigate } from "react-router-dom";
// import { AppContent } from "../context/AppContext";
// import axios from "axios";
// import { toast } from "react-toastify";

// const Login = () => {
//   const navigate = useNavigate();
//   const { backendUrl, setIsLoggedin, getUserData } = useContext(AppContent);

//   const [state, setState] = useState("Sign Up");
//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [role, setRole] = useState("vendor");

//   const onSubmitHandler = async (e) => {
//     try {
//       e.preventDefault();
//       axios.defaults.withCredentials = true;

//       if (state === "Sign Up") {
//         const { data } = await axios.post(backendUrl + "/auth/vendor/register", {
//           name,
//           email,
//           password,
//           role,
//         });

//         if (data.success) {
//           setIsLoggedin(true);
//           getUserData();
//           navigate("/");
//         } else {
//           toast.error(data.message);
//         }
//       } else {
//         const { data } = await axios.post(backendUrl + "/auth/vendor/login", {
//           email,
//           password,
//           role
//         });

//         if (data.success) {
//           setIsLoggedin(true);
//           getUserData();
//           navigate("/");
//         } else {
//           toast.error(data.message);
//         }
//       }
//     } catch (error) {
//       toast.error(error.message);
//     }
//   };

//   return (
//     <div className="flex items-center justify-center min-h-screen bg-gray-50 px-6 sm:px-0">
//       {/* Logo */}
//       <div
//         onClick={() => navigate("/")}
//         className="cursor-pointer flex absolute top-3 sm:left-5 left-3"
//       >
//         <div className="flex items-center gap-2 sm:gap-1">
//           <img src={assets.logo} alt="" className="w-30 sm:w-65" />
//         </div>
//       </div>

//       {/* Card */}
//       <div className="bg-white p-10 rounded-lg shadow-lg w-full sm:w-96 text-gray-700 text-sm">
//         <h2 className="text-3xl font-semibold text-[#003DA5] text-center mb-3">
//           {state === "Sign Up" ? "Create account" : "Login"}
//         </h2>
//         <p className="text-sm mb-6 text-center text-gray-500">
//           {state === "Sign Up"
//             ? "Create your account"
//             : "Login to your account!"}
//         </p>

//         <form onSubmit={onSubmitHandler}>
//           {state === "Sign Up" && (
//             <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-gray-100">
//               <img src={assets.person_icon} alt="" />
//               <input
//                 className="bg-transparent outline-none placeholder-gray-400 flex-1"
//                 onChange={(e) => setName(e.target.value)}
//                 value={name}
//                 type="text"
//                 placeholder="Full Name"
//                 required
//               />
//             </div>
//           )}

//           <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-gray-100">
//             <img src={assets.mail_icon} alt="" />
//             <input
//               className="bg-transparent outline-none placeholder-gray-400 flex-1"
//               type="email"
//               onChange={(e) => setEmail(e.target.value)}
//               value={email}
//               placeholder="Email id"
//               required
//             />
//           </div>

//           <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-gray-100">
//             <img src={assets.lock_icon} alt="" />
//             <input
//               className="bg-transparent outline-none placeholder-gray-400 flex-1"
//               type="password"
//               onChange={(e) => setPassword(e.target.value)}
//               value={password}
//               placeholder="Password"
//               required
//             />
//           </div>

// {state === "Sign Up" && (
//            <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-gray-100">
//               <img src={assets.person_icon} alt="Person Icon" />
//               <input
//                 value={role}
//                 name="role"
//                 disabled
//                 className="bg-transparent outline-none placeholder-gray-400 flex-1"
//                 type="text"
//                 placeholder="Vendor"
//                 required
//               />
//             </div> 
//             )}
//           <p
//             onClick={() => navigate("/reset-password")}
//             className="mb-4 text-[#003DA5] cursor-pointer"
//           >
//             Forgot Password ?
//           </p>

//           <button className="w-full py-2.5 rounded-full bg-[#003DA5] text-white font-medium cursor-pointer hover:bg-[#002D7A] transition">
//             {state}
//           </button>
//         </form>

//         {state === "Sign Up" ? (
//           <p className="text-gray-500 text-center text-sm mt-4">
//             Already have an account?{" "}
//             <span
//               onClick={() => setState("Login")}
//               className="text-[#003DA5] cursor-pointer underline"
//             >
//               Login here
//             </span>
//           </p>
//         ) : (
//           <p className="text-gray-500 text-center text-sm mt-4">
//             Don't have an account?{" "}
//             <span
//               onClick={() => setState("Sign Up")}
//               className="text-[#003DA5] cursor-pointer underline"
//             >
//               Sign Up
//             </span>
//           </p>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Login;
