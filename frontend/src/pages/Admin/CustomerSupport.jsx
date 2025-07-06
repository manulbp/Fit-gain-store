
import { Button } from "@mui/material";
import { useContext, useState } from "react";
import { Navigate, Outlet, useNavigate } from "react-router-dom";
import AdminChat from "../../components/Panels/AdminChat";
import AdminTicket from "../../components/Panels/AdminTicket";
import { assets } from "../../assets/assets";
import { UserContext } from "../../context/UserContext";

const PanelButtons = [
  {
    id: 1,
    name: "Tickets",
  },
  {
    id: 2,
    name: "Chat",
  },
]

const CustomerSupport = () => {
  const { User } = useContext(UserContext);
  const navigate = useNavigate();

  const isAuthenticated = User.admin;

  if (!isAuthenticated) {
    return <Navigate to="/admin-login" replace />;
  }

  const [activeButtonId, setActiveButtonId] = useState(PanelButtons[0].id);

  const handleActiveButtonId = (id) => {
    setActiveButtonId(prev => !prev)
    if (id === 1) {
      navigate("/admin/customer-support/ticket");
    } else {
      navigate("/admin/customer-support/chat");
    }
  }

  return (
    <div className="w-full min-h-svh "
      style={{ backgroundImage: `url(${assets.adminImage})` }} >
      <div className="container h-full mx-auto px-2 md:px-0">
        <div className="w-full h-full flex justify-start items-start gap-2">
          <div className="min-w-[180px] min-h-svh bg-white p-4 flex justify-start items-start
           gap-2 border-r border-r-neutral-400">
            <div className="w-full flex flex-col gap-3">
              <div className="w-full flex flex-col gap-3 ">

                {PanelButtons.map((button, index) => (
                  <Button key={index} variant="text" onClick={() => handleActiveButtonId(button.id)}
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
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  )
}

export default CustomerSupport