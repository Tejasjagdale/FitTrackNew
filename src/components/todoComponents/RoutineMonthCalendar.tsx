import {
  Box,
  Stack,
  Typography,
  IconButton
} from "@mui/material";

import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

import { useState } from "react";
import { Routine } from "../../types/todoModels";

/* ===========================================
   BUILD MONTH GRID
=========================================== */

function buildMonthMatrix(
  routine: Routine,
  year: number,
  month: number
) {

  const history = routine.history ?? [];

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const startWeekday = firstDay.getDay();
  const totalDays = lastDay.getDate();

  const cells: {
    day?: number;
    done?: boolean;
    future?: boolean;
  }[] = [];

  for (let i = 0; i < startWeekday; i++) {
    cells.push({});
  }

  for (let d = 1; d <= totalDays; d++) {

    const dateObj = new Date(year, month, d);
    const dateStr = dateObj.toISOString().slice(0,10);

    const isFuture =
      dateObj.getTime() >
      new Date().setHours(0,0,0,0);

    cells.push({
      day: d,
      done: history.includes(dateStr),
      future: isFuture
    });
  }

  return cells;
}

/* ===========================================
   COMPONENT
=========================================== */

export default function RoutineMonthCalendar({
  routine
}: {
  routine: Routine;
}) {

  const today = new Date();

  const [cursor,setCursor] = useState({
    year: today.getFullYear(),
    month: today.getMonth()
  });

  const cells = buildMonthMatrix(
    routine,
    cursor.year,
    cursor.month
  );

  const monthLabel = new Date(
    cursor.year,
    cursor.month
  ).toLocaleDateString("en-IN",{
    month:"long",
    year:"numeric"
  });

  const weekday = ["S","M","T","W","T","F","S"];

  const goPrev = ()=>{
    setCursor(prev=>{
      const m = prev.month - 1;
      if(m < 0){
        return {year:prev.year-1,month:11};
      }
      return {year:prev.year,month:m};
    });
  };

  const goNext = ()=>{
    setCursor(prev=>{
      const m = prev.month + 1;
      if(m > 11){
        return {year:prev.year+1,month:0};
      }
      return {year:prev.year,month:m};
    });
  };

  return (
    <Stack spacing={0.6}>

      {/* HEADER NAV */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
      >
        <IconButton size="small" onClick={goPrev}>
          <ChevronLeftIcon fontSize="small"/>
        </IconButton>

        <Typography sx={{ fontSize:11, opacity:.8 }}>
          {monthLabel}
        </Typography>

        <IconButton size="small" onClick={goNext}>
          <ChevronRightIcon fontSize="small"/>
        </IconButton>
      </Stack>

      {/* WEEKDAY HEADER */}
      <Box
        sx={{
          display:"grid",
          gridTemplateColumns:"repeat(7,1fr)",
          gap:"3px"
        }}
      >
        {weekday.map(w=>(
          <Typography
            key={w}
            sx={{
              fontSize:9,
              opacity:.45,
              textAlign:"center"
            }}
          >
            {w}
          </Typography>
        ))}
      </Box>

      {/* CALENDAR GRID */}
      <Box
        sx={{
          display:"grid",
          gridTemplateColumns:"repeat(7,1fr)",
          gap:"3px"
        }}
      >
        {cells.map((c,i)=>{

          if(!c.day){
            return <Box key={i} sx={{height:20}} />;
          }

          let bg = "rgba(255,255,255,0.05)";

          if(!c.future){
            bg = c.done
              ? "rgba(0,255,166,0.85)"   // completed
              : "rgba(255,70,70,0.7)";   // missed
          }

          return (
            <Box
              key={i}
              sx={{
                height:20,
                borderRadius:1,
                fontSize:10,
                display:"flex",
                alignItems:"center",
                justifyContent:"center",
                background:bg,
                color:c.done ? "#001a12" : "white",
                fontWeight:600
              }}
            >
              {c.day}
            </Box>
          );
        })}
      </Box>

    </Stack>
  );
}