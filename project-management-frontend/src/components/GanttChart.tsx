"use client";

import { useEffect, useRef } from 'react';
import { gantt } from 'dhtmlx-gantt';
import 'dhtmlx-gantt/codebase/dhtmlxgantt.css'; // CSS ইম্পোর্ট করুন

interface GanttChartProps {
  tasks: {
    data: any[];
    links: any[];
  };
}

const GanttChart = ({ tasks }: GanttChartProps) => {
  const ganttContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ganttContainer.current) {
      // গ্যান্ট চার্টের কলামগুলো কনফিগার করুন
      gantt.config.columns = [
        { name: 'text', label: 'Task name', tree: true, width: '*' },
        { name: 'start_date', label: 'Start time', align: 'center' },
        { name: 'duration', label: 'Duration', align: 'center' },
      ];

      // চার্টটি ইনিশিয়ালাইজ করুন
      gantt.init(ganttContainer.current);
      
      // ডেটা পার্স করুন
      gantt.parse(tasks);
    }
    
    // কম্পোনেন্ট আনমাউন্ট হওয়ার সময় চার্টটি পরিষ্কার করুন
    return () => {
      gantt.clearAll();
    };
  }, [tasks]); // যখন tasks prop পরিবর্তন হবে, তখন চার্টটি রি-রেন্ডার হবে

  return (
    <div 
      ref={ganttContainer} 
      style={{ width: '100%', height: '500px', marginTop: '20px' }}
    ></div>
  );
};

export default GanttChart;