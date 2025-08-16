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
  
  
  const isGanttInitialized = useRef(false);

  useEffect(() => {
    if (ganttContainer.current) {
      
      
      gantt.config.date_format = "%Y-%m-%d";
      
      // Chart scale configure
      gantt.config.scales = [
        { unit: "month", step: 1, format: "%F, %Y" },
        { unit: "day", step: 1, format: "%d, %D" }
      ];

     
      gantt.config.columns = [
        { name: "text",       label: "Task name",  tree: true, width: '*' },
        { name: "start_date", label: "Start date", align: "center", width: 120 },
        { name: "duration",   label: "Duration",   align: "center", width: 80 },
      ];
      
      
      if (!isGanttInitialized.current) {
        gantt.init(ganttContainer.current);
        isGanttInitialized.current = true;
      }
      
      
      gantt.clearAll();
      
      gantt.parse(tasks);
    }

  }, [tasks]); 
  useEffect(() => {
    return () => {
     
      isGanttInitialized.current = false;
      gantt.clearAll();
    };
  }, []); 

  return (
    <div 
      ref={ganttContainer} 
      style={{ width: '100%', height: '500px', marginTop: '20px' }}
      className="gantt-container"
    ></div>
  );
};

export default GanttChart;