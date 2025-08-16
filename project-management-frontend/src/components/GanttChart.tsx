"use client";

import { useEffect, useRef } from 'react';
import { gantt } from 'dhtmlx-gantt';
import 'dhtmlx-gantt/codebase/dhtmlxgantt.css';

interface GanttChartProps {
  tasks: {
    data: any[];
    links: any[];
  };
}

const GanttChart = ({ tasks }: GanttChartProps) => {
  const ganttContainer = useRef<HTMLDivElement>(null);
  
  // একটি ref ব্যবহার করে ট্র্যাক করুন যে gantt ইনিশিয়ালাইজ হয়েছে কিনা
  const isGanttInitialized = useRef(false);

  useEffect(() => {
    if (ganttContainer.current) {
      
      // dhtmlx-gantt-কে বলুন কোন ফরম্যাটে ডেটা আসছে
      gantt.config.date_format = "%Y-%m-%d";
      
      // চার্টের স্কেল কনফিগার করুন
      gantt.config.scales = [
        { unit: "month", step: 1, format: "%F, %Y" },
        { unit: "day", step: 1, format: "%d, %D" }
      ];

      // কলাম কনফিগার করুন
      gantt.config.columns = [
        { name: "text",       label: "Task name",  tree: true, width: '*' },
        { name: "start_date", label: "Start date", align: "center", width: 120 },
        { name: "duration",   label: "Duration",   align: "center", width: 80 },
      ];
      
      // --- সমাধানটি এখানে ---
      // শুধুমাত্র যদি gantt আগে থেকে ইনিশিয়ালাইজড না থাকে, তাহলেই init() কল করুন
      if (!isGanttInitialized.current) {
        gantt.init(ganttContainer.current);
        isGanttInitialized.current = true;
      }
      
      // ডেটা পার্স করার আগে পুরনো ডেটা পরিষ্কার করুন
      gantt.clearAll();
      // নতুন ডেটা পার্স করুন
      gantt.parse(tasks);
    }

  }, [tasks]); // শুধুমাত্র tasks পরিবর্তন হলেই এই useEffect চলবে

  // কম্পোনেন্ট আনমাউন্ট হওয়ার সময় gantt instância পরিষ্কার করার জন্য useEffect
  useEffect(() => {
    return () => {
      // isGanttInitialized-কে false করে দিন যাতে পরবর্তীবার কম্পোনেন্ট মাউন্ট হলে init() আবার চলতে পারে
      isGanttInitialized.current = false;
      gantt.clearAll();
    };
  }, []); // খালি dependency array মানে এটি শুধুমাত্র আনমাউন্ট হওয়ার সময় চলবে

  return (
    <div 
      ref={ganttContainer} 
      style={{ width: '100%', height: '500px', marginTop: '20px' }}
      className="gantt-container"
    ></div>
  );
};

export default GanttChart;