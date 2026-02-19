import {
  Box,
  Stack,
  Typography,
  IconButton,
  Chip,
  Popover,
  Paper
} from "@mui/material";

import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

import { useMemo, useState } from "react";
import { Todo } from "../../types/todoModels";
import { nowIST, todayISTString } from "../../utils/istTime";
import { motion, AnimatePresence } from "framer-motion";

/* =========================================================
   BUILD CALENDAR (IST SAFE)
========================================================= */

function buildCalendar(todos:Todo[],year:number,month:number){

  const todayStr = todayISTString();

  const firstDay = new Date(
    `${year}-${String(month+1).padStart(2,"0")}-01T00:00:00+05:30`
  );

  const startWeekday = firstDay.getDay();
  const totalDays = new Date(year,month+1,0).getDate();

  const cells:any[]=[];

  for(let i=0;i<startWeekday;i++) cells.push({});

  for(let d=1;d<=totalDays;d++){

    const dateStr =
      `${year}-${String(month+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;

    const dayTodos = todos.filter(t=>t.deadline===dateStr);

    const overdueCount = dayTodos.filter(
      t=>t.status!=="completed" && t.deadline && t.deadline < todayStr
    ).length;

    cells.push({
      day:d,
      dateStr,
      todos:dayTodos,
      isToday:dateStr===todayStr,
      overdueCount
    });
  }

  while(cells.length%7!==0) cells.push({});

  return cells;
}

/* =========================================================
   COLOR ENGINE
========================================================= */

function getSmartStyle(todo:Todo){

  if(todo.status==="completed"){
    return {
      background:"linear-gradient(90deg,#00ffa6,#0bd98e)",
      color:"#002d22"
    };
  }

  if(todo.deadline && todo.deadline < todayISTString()){
    return {
      background:"linear-gradient(90deg,#ff4d4d,#ff884d)",
      color:"#2b0000"
    };
  }

  return {
    background:"linear-gradient(90deg,#ffb400,#ff9100)",
    color:"#2c1600"
  };
}

function getStatusChip(todo:Todo){

  if(todo.status==="completed"){
    return { label:"Completed", color:"#00ffa6" };
  }

  if(todo.deadline && todo.deadline < todayISTString()){
    return { label:"Overdue", color:"#ff4d4d" };
  }

  return { label:"Pending", color:"#ffaa00" };
}

/* =========================================================
   COMPONENT
========================================================= */

export default function TodoMonthCalendar({todos}:{todos:Todo[]}){

  const now = nowIST();

  const [cursor,setCursor] = useState({
    year:now.getFullYear(),
    month:now.getMonth()
  });

  const [dir,setDir] = useState(1);

  const [anchorEl,setAnchorEl] = useState<HTMLElement | null>(null);
  const [openDay,setOpenDay] = useState<any|null>(null);

  const cells = useMemo(
    ()=>buildCalendar(todos,cursor.year,cursor.month),
    [todos,cursor]
  );

  const monthLabel = new Intl.DateTimeFormat("en-IN",{
    month:"long",
    year:"numeric",
    timeZone:"Asia/Kolkata"
  }).format(
    new Date(`${cursor.year}-${String(cursor.month+1).padStart(2,"0")}-01T00:00:00+05:30`)
  );

  const weekday=["S","M","T","W","T","F","S"];

  const goPrev=()=>{
    setDir(-1);
    setCursor(p=>{
      const m=p.month-1;
      if(m<0)return{year:p.year-1,month:11};
      return{year:p.year,month:m};
    });
  };

  const goNext=()=>{
    setDir(1);
    setCursor(p=>{
      const m=p.month+1;
      if(m>11)return{year:p.year+1,month:0};
      return{year:p.year,month:m};
    });
  };

  return(
    <Stack
      spacing={1.8}
      sx={{
        p:1.6,
        borderRadius:3,
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.015))",
        border:"1px solid rgba(255,255,255,0.08)",
        backdropFilter:"blur(24px)"
      }}
    >

      {/* HEADER */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{borderBottom:"1px solid rgba(255,255,255,0.06)",pb:.7}}
      >
        <IconButton size="small" onClick={goPrev}>
          <ChevronLeftIcon fontSize="small"/>
        </IconButton>

        <Typography sx={{fontSize:15,fontWeight:700}}>
          {monthLabel}
        </Typography>

        <IconButton size="small" onClick={goNext}>
          <ChevronRightIcon fontSize="small"/>
        </IconButton>
      </Stack>

      {/* WEEKDAY */}
      <Box
        sx={{
          display:"grid",
          gridTemplateColumns:"repeat(7,minmax(0,1fr))",
          gap:"8px"
        }}
      >
        {weekday.map(w=>(
          <Typography key={w} sx={{fontSize:11,opacity:.5,textAlign:"center",fontWeight:700}}>
            {w}
          </Typography>
        ))}
      </Box>

      {/* GRID */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${cursor.year}-${cursor.month}`}
          initial={{x:dir>0?60:-60,opacity:0}}
          animate={{x:0,opacity:1}}
          exit={{x:dir>0?-60:60,opacity:0}}
          transition={{type:"spring",stiffness:260,damping:26}}
        >
          <Box
            sx={{
              display:"grid",
              gridTemplateColumns:"repeat(7,minmax(0,1fr))",
              gap:"8px"
            }}
          >
            {cells.map((c,i)=>{

              if(!c.day){
                return <Box key={i} sx={{height:92}}/>
              }

              const dense = c.todos.length>3;
              const visibleCount=dense?2:3;
              const overdueHeat = Math.min(c.overdueCount*.12,.45);

              return(
                <motion.div key={i} whileHover={{scale:1.03}}>
                  <Box
                    onClick={(e)=>{
                      setAnchorEl(e.currentTarget);
                      setOpenDay(c);
                    }}
                    sx={{
                      minHeight:92,
                      borderRadius:2,
                      p:.7,
                      cursor:"pointer",
                      background:`
                        linear-gradient(180deg,rgba(0,0,0,0.32),rgba(0,0,0,0.2)),
                        radial-gradient(circle at top,
                        rgba(255,70,70,${overdueHeat}),transparent 70%)
                      `,
                      border:c.isToday
                        ?"1px solid rgba(0,255,166,.6)"
                        :"1px solid rgba(255,255,255,0.05)",
                      display:"flex",
                      flexDirection:"column",
                      gap:.4,
                      overflow:"hidden",
                      position:"relative"
                    }}
                  >

                    {/* TODAY BREATHING */}
                    {c.isToday && (
                      <motion.div
                        style={{
                          position:"absolute",
                          inset:0,
                          borderRadius:8,
                          background:"radial-gradient(circle,#00ffa622,transparent 70%)",
                          pointerEvents:"none"
                        }}
                        animate={{opacity:[0.4,0.9,0.4]}}
                        transition={{duration:2.4,repeat:Infinity,ease:"easeInOut"}}
                      />
                    )}

                    <Typography
                      sx={{
                        fontSize:13,
                        fontWeight:700,
                        color:c.isToday?"#00ffa6":"#d6e2dc",
                        zIndex:2
                      }}
                    >
                      {c.day}
                    </Typography>

                    <Stack spacing={dense?0.25:0.4} sx={{zIndex:2}}>
                      {c.todos.slice(0,visibleCount).map((t:Todo,idx:number)=>{

                        const style=getSmartStyle(t);

                        return(
                          <Chip
                            key={t.id}
                            label={t.title}
                            size="small"
                            sx={{
                              height:dense?18:22,
                              fontSize:10,
                              fontWeight:700,
                              borderRadius:1,
                              ...style,
                              transform:`translateX(${idx*3}px)`,
                              width:"100%",
                              "& .MuiChip-label":{
                                px:1,
                                overflow:"hidden",
                                whiteSpace:"nowrap",
                                textOverflow:"ellipsis"
                              }
                            }}
                          />
                        )
                      })}

                      {c.todos.length>visibleCount && (
                        <Typography sx={{fontSize:11,opacity:.6,pl:.5}}>
                          +{c.todos.length-visibleCount} more
                        </Typography>
                      )}
                    </Stack>

                  </Box>
                </motion.div>
              )
            })}
          </Box>
        </motion.div>
      </AnimatePresence>

      {/* ================= PREMIUM POPOVER ================= */}
      <Popover
        open={!!openDay}
        anchorEl={anchorEl}
        onClose={()=>{setOpenDay(null);setAnchorEl(null);}}
        anchorOrigin={{vertical:"bottom",horizontal:"left"}}
        transformOrigin={{vertical:"top",horizontal:"left"}}
        PaperProps={{sx:{background:"transparent",boxShadow:"none"}}}
      >
        {openDay && (
          <Paper
            sx={{
              p:1.4,
              minWidth:260,
              maxWidth:320,
              borderRadius:2,
              background:
                "linear-gradient(180deg, rgba(0,255,170,0.12), rgba(0,0,0,0.6))",
              border:"1px solid rgba(0,255,170,0.25)",
              backdropFilter:"blur(22px)"
            }}
          >
            <Typography sx={{fontWeight:700,fontSize:13,mb:.8,opacity:.8}}>
              {openDay.dateStr}
            </Typography>

            <Stack spacing={1}>
              {openDay.todos.map((t:Todo)=>{

                const status=getStatusChip(t);

                return(
                  <Box key={t.id}>

                    <Typography sx={{fontWeight:700,fontSize:13}}>
                      {t.title}
                    </Typography>

                    <Stack direction="row" spacing={0.6} flexWrap="wrap" mt={0.6}>

                      <Chip
                        size="small"
                        label={status.label}
                        sx={{
                          background:status.color,
                          color:"#001a14",
                          fontWeight:700
                        }}
                      />

                      {t.groupIds?.map((g:string)=>(
                        <Chip
                          key={g}
                          size="small"
                          label={g}
                          variant="outlined"
                          sx={{
                            borderColor:"rgba(255,255,255,0.25)",
                            color:"#c7d6cf"
                          }}
                        />
                      ))}

                      {t.deadline && (
                        <Chip
                          size="small"
                          label={`📅 ${t.deadline}`}
                          variant="outlined"
                          sx={{
                            borderColor:"rgba(255,255,255,0.2)",
                            color:"#a8bdb6"
                          }}
                        />
                      )}

                    </Stack>

                  </Box>
                )
              })}
            </Stack>
          </Paper>
        )}
      </Popover>

    </Stack>
  );
}