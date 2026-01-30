import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

const DashboardHome = () => {
  const [date, setDate] = useState(new Date());

  return (
    <div className="flex flex-col lg:flex-row gap-6">

      {/* Welcome Card */}
      <div className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl shadow-lg p-8 flex justify-between items-center">

        <div>
          <h1 className="text-3xl font-bold mb-2">Welcome Back, Admin 👋</h1>
          <p className="text-blue-100 mb-4">
            Manage your system and track activity from here.
          </p>

          <div className="flex gap-4">
           
            <h6 className="border border-white px-5 py-2 rounded-lg">
              Explore
            </h6>
          </div>
        </div>

        <div className="hidden md:flex w-28 h-28 bg-white/20 rounded-xl items-center justify-center text-5xl">
          📦
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-2xl shadow-lg p-4">
        <Calendar onChange={setDate} value={date} />
      </div>

    </div>
  );
};

export default DashboardHome;