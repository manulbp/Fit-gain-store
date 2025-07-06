import React from "react";

import { Button, TextField } from "@mui/material";
import { useContext, useState } from "react";
import { UserContext } from "../context/UserContext";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";

const LogIn = () => {
  const { loginUser } = useContext(UserContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await loginUser(email, password);
      setEmail("");
      setPassword("");
      navigate("/profile");
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-svh bg-white">
      <div className="container min-h-svh mx-auto px-2 md:px-0">
        <div className="w-full min-h-svh flex justify-center items-center">
          <div className="w-sm h-auto gap-5 flex flex-col justify-start items-start">
            <p className="font-bold text-3xl text-neutral-800">Log In</p>
            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}
            <TextField
              id="email"
              label="Email"
              variant="outlined"
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={!!error && error.includes("email")}
            />
            <TextField
              id="password"
              label="Password"
              variant="outlined"
              fullWidth
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={!!error && error.includes("password")}
            />
            <Button
              variant="contained"
              onClick={handleLogin}
              disabled={loading}
              className={`!w-full !p-3 !bg-sky-800 hover:!bg-sky-900 !text-white !font-semibold !capitalize !text-base`}
            >
              {loading ? "Logging In..." : "Log In"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogIn;