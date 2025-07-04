import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import { useTheme } from "../../contexts/ThemeContext";
import XCircleButton from "../common/XCircleButton";
import { formatDuration } from "../../utils/helpers"; // Import helper

const StudyHeatmap = ({ studyHistory, onClose }) => {
  const svgRef = useRef();
  const today = new Date();
  const oneYearAgo = new Date(
    today.getFullYear() - 1,
    today.getMonth(),
    today.getDate()
  );

  const { themeClasses } = useTheme();

  useEffect(() => {
    const data = {};
    // Sort history to process entries in chronological order
    const sortedHistory = [...studyHistory].sort((a, b) => {
      const dateA = a.date?.toDate ? a.date.toDate() : new Date(a.date);
      const dateB = b.date?.toDate ? b.date.toDate() : new Date(b.date);
      return dateA - dateB;
    });

    sortedHistory.forEach((entry) => {
      const date = entry.date?.toDate
        ? entry.date.toDate()
        : new Date(entry.date);
      const dateKey = date.toDateString();
      
      // Initialize if it's the first entry for the day
      if (!data[dateKey]) {
        data[dateKey] = {
          date: date,
          progress: 0,
          studyDuration: 0,
        };
      }

      // Overwrite progress with the current entry's progress
      data[dateKey].progress = entry.progress;
      // Accumulate study duration
      data[dateKey].studyDuration += entry.studyDuration || 0;
    });

    const dailyData = Object.values(data).map((d) => ({
      date: d.date,
      // The progress is now the latest for that day, not an average
      avgProgress: d.progress,
      totalStudyDuration: d.studyDuration,
    }));

    const dateMap = new Map(dailyData.map((d) => [d.date.toDateString(), d]));

    const cellSize = 15;
    const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    const formatDay = d3.timeFormat("%w");
    const formatWeek = d3.timeFormat("%U");
    const formatMonth = d3.timeFormat("%b");

    const allDays = d3.timeDays(oneYearAgo, today);

    const colorScale = d3
      .scaleQuantize()
      .domain([0, 100])
      .range(["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"]); // GitHub-like greens

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const numWeeks = d3.timeWeeks(
      d3.timeSunday(oneYearAgo),
      d3.timeSunday(today)
    ).length;
    const width = numWeeks * (cellSize + 2) + 50;
    const height = (cellSize + 2) * 7 + 50;

    svg
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", `0 0 ${width} ${height}`);

    const g = svg.append("g").attr("transform", `translate(30, 20)`);

    g.selectAll(".day-label")
      .data(weekDays)
      .enter()
      .append("text")
      .attr("class", `text-xs ${themeClasses.primaryText}`)
      .attr("fill", "#A9A9A9")
      .attr("x", -5)
      .attr("y", (d, i) => i * (cellSize + 2) + cellSize / 2)
      .attr("dy", ".35em")
      .attr("text-anchor", "end")
      .text((d) => d);

    g.selectAll(".day")
      .data(allDays)
      .enter()
      .append("rect")
      .attr("class", "day rounded-sm")
      .attr("width", cellSize)
      .attr("height", cellSize)
      .attr("x", (d) => formatWeek(d) * (cellSize + 2))
      .attr("y", (d) => formatDay(d) * (cellSize + 2))
      .attr("fill", (d) => {
        const entry = dateMap.get(d.toDateString());
        return entry ? colorScale(entry.avgProgress) : colorScale(0);
      })
      .append("title")
      .text((d) => {
        const entry = dateMap.get(d.toDateString());
        const dateStr = d.toLocaleDateString();
        const duration = entry
          ? formatDuration(entry.totalStudyDuration)
          : "0s";
        return `${dateStr}: ${
          entry ? entry.avgProgress.toFixed(0) : 0
        }% progress, Study Time: ${duration}`;
      });

    g.selectAll(".month-label")
      .data(d3.timeMonths(oneYearAgo, today))
      .enter()
      .append("text")
      .attr("class", `text-xs ${themeClasses.primaryText}`)
      .attr("fill", "#A9A9A9")
      .attr("x", (d) => formatWeek(d) * (cellSize + 2))
      .attr("y", -10)
      .text((d) => formatMonth(d));
  }, [studyHistory, today, oneYearAgo, themeClasses]); // Removed formatDuration from dependency array as it's a stable helper

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div
        className={`${themeClasses.secondaryBg} p-6 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-auto ${themeClasses.shadow} relative`}
      >
        <XCircleButton onClick={onClose} />
        <h3
          className={`text-2xl font-bold mb-4 text-center ${themeClasses.primaryText}`}
        >
          Study Heatmap
        </h3>
        <p className={`${themeClasses.secondaryText} mb-6 text-center`}>
          Daily study progress and accumulated study time over the last year.
        </p>
        <div className="flex justify-center items-center">
          <svg
            ref={svgRef}
            className={`${themeClasses.primaryBg} rounded-lg shadow-inner`}
          ></svg>
        </div>
      </div>
    </div>
  );
};

export default StudyHeatmap;
