import React from "react";
import { Button } from "@mui/material";
import { User2 } from "lucide-react";
import { useContext, useState } from "react";
import { Navigate } from "react-router-dom";
import UserChat from "../components/Panels/UserChat";
import UserReviews from "../components/Panels/UserReviews";
import UserTicket from "../components/Panels/UserTicket";
import { UserContext } from "../context/UserContext";
import { assets } from "../assets/assets";

const PanelButtons = [
  {
    id: 1,
    name: "My Tickets",
  },
  {
    id: 2,
    name: "Chat",
  },
  {
    id: 3,
    name: "Reviews",
  },
]

const UserPage = () => {
  const { User } = useContext(UserContext);

  const isAuthenticated = User.user;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const [activeButtonId, setActiveButtonId] = useState(PanelButtons[0].id);

  return (
    <div className="w-full min-h-svh" 
        style={{ backgroundImage: `url(${assets.bgImage})` }}>
      <div className="container h-full mx-auto px-2 md:px-0">
        <div className="w-full h-full flex justify-start items-start gap-2">
          <div className="min-w-[180px] min-h-svh bg-white p-4 flex justify-start items-start
           gap-2 border-r border-r-neutral-400">
            <div className="w-full flex flex-col gap-3">
              <div className="w-full flex flex-col gap-3 ">

                <div className="flex justify-center items-center gap-3 border-b border-b-neutral-400 pb-4 mb-4">
                  <User2 className="stroke-neutral-700" size={24} strokeWidth={1.8} />
                  <p>My Account</p>
                </div>

                {PanelButtons.map((button, index) => (
                  <Button key={index} variant="text" onClick={() => setActiveButtonId(button.id)}
                    className={`${button.id === activeButtonId ?
                      "!bg-sky-100 hover:!bg-sky-200 !text-sky-800 !font-semibold"
                      : "!bg-white hover:!bg-sky-200 !text-neutral-800"}
             !flex !justify-center !items-center !gap-2 !capitalize !text-sm`}>
                    {button.name}
                  </Button>
                ))}

              </div>
            </div>

          </div>
          <div className="w-full h-full flex justify-start items-center gap-2">
            {activeButtonId === 1 && (<UserTicket />)}
            {activeButtonId === 2 && (<UserChat />)}
            {activeButtonId === 3 && (<UserReviews />)}
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserPage