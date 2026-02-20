import {
    Box,
    Stack,
    Typography,
    IconButton,
    Chip,
    Modal,
    Paper,
    Divider
} from "@mui/material";

import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

import { useMemo, useState } from "react";
import { Todo, Priority } from "../../types/todoModels";
import { nowIST, todayISTString } from "../../utils/istTime";
import { motion } from "framer-motion";

/* ========================================================= */

function buildCalendar(todos: Todo[], year: number, month: number) {

    const todayStr = todayISTString();

    const firstDay = new Date(
        `${year}-${String(month + 1).padStart(2, "0")}-01T00:00:00+05:30`
    );

    const startWeekday = firstDay.getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    const cells: any[] = [];

    for (let i = 0; i < startWeekday; i++) cells.push({});

    for (let d = 1; d <= totalDays; d++) {

        const dateStr =
            `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

        const dayTodos = todos.filter(t => t.deadline === dateStr);

        const overdueCount = dayTodos.filter(
            t => t.status !== "completed" && t.deadline && t.deadline < todayStr
        ).length;

        cells.push({
            day: d,
            dateStr,
            todos: dayTodos,
            isToday: dateStr === todayStr,
            overdueCount
        });
    }

    while (cells.length % 7 !== 0) cells.push({});

    return cells;
}

/* ========================================================= */

function getStatusChip(todo: Todo) {

    if (todo.status === "completed")
        return { label: "Completed", bg: "#00ffa6", color: "#002d22" };

    if (todo.deadline && todo.deadline < todayISTString())
        return { label: "Overdue", bg: "#ff4d4d", color: "#2b0000" };

    return { label: "Pending", bg: "#ffaa00", color: "#2c1600" };
}

function getPriorityChip(priority: Priority) {

    if (priority === "high")
        return { bg: "rgba(255,80,80,.28)" };

    if (priority === "medium")
        return { bg: "rgba(255,170,0,.25)" };

    return { bg: "rgba(60,170,255,.25)" };
}

function formatGroup(id: string) {
    return id.replace(/^grp_/, "");
}

/* ========================================================= */

export default function TodoMonthCalendar({ todos }: { todos: Todo[] }) {

    const now = nowIST();

    const [cursor, setCursor] = useState({
        year: now.getFullYear(),
        month: now.getMonth()
    });

    const [openDay, setOpenDay] = useState<any | null>(null);

    const cells = useMemo(
        () => buildCalendar(todos, cursor.year, cursor.month),
        [todos, cursor]
    );

    const monthLabel = useMemo(() => {
        return new Date(cursor.year, cursor.month).toLocaleString("en-IN", {
            month: "long",
            year: "numeric",
        });
    }, [cursor]);

    const weekday = ["S", "M", "T", "W", "T", "F", "S"];

    const goPrev = () => {
        setCursor(p => {
            const m = p.month - 1;
            if (m < 0) return { year: p.year - 1, month: 11 };
            return { year: p.year, month: m };
        });
    };

    const goNext = () => {
        setCursor(p => {
            const m = p.month + 1;
            if (m > 11) return { year: p.year + 1, month: 0 };
            return { year: p.year, month: m };
        });
    };

    return (
        <Stack spacing={1.4} sx={{
            p: 1.4,
            borderRadius: 3,
            background:
                "linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.015))",
            border: "1px solid rgba(255,255,255,0.08)",
            backdropFilter: "blur(24px)"
        }}>

            {/* HEADER */}
            <Stack direction="row" justifyContent="space-between" alignItems="center">
                <IconButton size="small" onClick={goPrev}>
                    <ChevronLeftIcon fontSize="small" />
                </IconButton>

                <Typography fontWeight={700} fontSize={14}>
                    {monthLabel}
                </Typography>

                <IconButton size="small" onClick={goNext}>
                    <ChevronRightIcon fontSize="small" />
                </IconButton>
            </Stack>

            {/* WEEKDAY */}
            <Box sx={{
                display: "grid",
                gridTemplateColumns: "repeat(7,minmax(0,1fr))",
                gap: "6px"
            }}>
                {weekday.map(w => (
                    <Typography key={w} sx={{ fontSize: 10, opacity: .5, textAlign: "center" }}>
                        {w}
                    </Typography>
                ))}
            </Box>

            {/* GRID */}
            <Box sx={{
                display: "grid",
                gridTemplateColumns: "repeat(7,minmax(0,1fr))",
                gap: "6px"
            }}>
                {cells.map((c, i) => {

                    if (!c.day) {
                        return <Box key={i} sx={{ height: 84 }} />;
                    }

                    const dense = c.todos.length > 3;
                    const visibleCount = dense ? 2 : 3;

                    const overdueHeat = Math.min(c.overdueCount * .12, .45);

                    return (
                        <motion.div key={i} whileTap={{ scale: .96 }}>
                            <Box
                                onClick={() => setOpenDay(c)}
                                sx={{
                                    minHeight: 84,
                                    borderRadius: 2,
                                    p: .6,
                                    cursor: "pointer",
                                    background: `
                    linear-gradient(180deg,rgba(0,0,0,0.32),rgba(0,0,0,0.2)),
                    radial-gradient(circle at top,
                    rgba(255,70,70,${overdueHeat}),transparent 70%)
                  `,
                                    border: c.isToday
                                        ? "1px solid rgba(0,255,166,.6)"
                                        : "1px solid rgba(255,255,255,0.05)"
                                }}
                            >
                                <Typography fontWeight={700} fontSize={12}>{c.day}</Typography>

                                <Stack spacing={0.2} mt={0.4}>
                                    {c.todos.slice(0, visibleCount).map((t: Todo) => {

                                        const priority = getPriorityChip(t.priority);

                                        return (
                                            <Chip
                                                key={t.id}
                                                label={t.title}
                                                size="small"
                                                sx={{
                                                    height: 18,
                                                    fontSize: 10,
                                                    background: priority.bg
                                                }}
                                            />
                                        )
                                    })}
                                    {c.todos.length > visibleCount && (
                                        <Typography fontSize={10} sx={{ opacity: .6 }}>
                                            +{c.todos.length - visibleCount}
                                        </Typography>
                                    )}
                                </Stack>
                            </Box>
                        </motion.div>
                    )
                })}
            </Box>

            {/* MODAL */}
            <Modal open={!!openDay} onClose={() => setOpenDay(null)}>
                <Box sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%,-50%)",
                    width: "92vw",
                    maxWidth: 360,
                    outline: "none"
                }}>
                    {openDay && (
                        <Paper sx={{
                            p: 1.6,
                            borderRadius: 2,
                            background:
                                "linear-gradient(180deg, rgba(0,255,170,0.10), rgba(0,0,0,0.6))",
                            border: "1px solid rgba(255,255,255,0.08)"
                        }}>

                            <Typography fontWeight={700} fontSize={13}>
                                Task's on 📅 {openDay.dateStr}
                            </Typography>

                            <Divider sx={{ my: 1, opacity: .2 }} />

                            {/* EXACTLY 3 TASKS VISIBLE */}
                            <Box
                                // spacing={0.8}
                                sx={{
                                    height: 350,   // 3 rows only
                                    overflowY: "auto",
                                    pr: .4,

                                    "&::-webkit-scrollbar": {
                                        width: 5,
                                    },
                                    "&::-webkit-scrollbar-thumb": {
                                        background: "rgba(255,255,255,.25)",
                                        borderRadius: 8,
                                    },
                                }}
                            >
                                {openDay.todos.length === 0 ? (

                                    <Box
                                        sx={{
                                            textAlign: "center",
                                            animation: "fadeIn .35s ease",
                                            "@keyframes fadeIn": {
                                                from: { opacity: 0, transform: "translateY(8px)" },
                                                to: { opacity: 1, transform: "translateY(0)" }
                                            }
                                        }}
                                    >
                                        <Typography fontSize={32}>😌</Typography>
                                        <Typography fontSize={12} sx={{ opacity: .6 }}>
                                            No tasks scheduled
                                        </Typography>
                                    </Box>

                                ) : (
                                    openDay.todos.map((t: Todo) => {

                                        const status = getStatusChip(t);

                                        return (
                                            <Paper key={t.id} sx={{
                                                p: 1,
                                                borderRadius: 1.2,
                                                background: "rgba(255,255,255,0.04)",
                                                border: status.label === "Overdue"
                                                    ? "1px solid rgba(255,80,80,.5)"
                                                    : "1px solid rgba(255,255,255,0.06)",
                                                mb: .8
                                            }}>
                                                <Typography fontSize={12}>
                                                    {t.title}
                                                </Typography>
                                                <Stack direction="row" spacing={0.4} mt={0.5} flexWrap="wrap">

                                                    <Chip
                                                        size="small"
                                                        label={status.label}
                                                        sx={{
                                                            background: status.bg,
                                                            color: status.color,
                                                            height: 18,
                                                            fontSize: 10,
                                                        }}
                                                    />

                                                    {t.groupIds?.map((g: string) => (
                                                        <Chip
                                                            key={g}
                                                            size="small"
                                                            label={formatGroup(g)}
                                                            variant="outlined"
                                                            color="primary"
                                                            sx={{ height: 18, fontSize: 10 }}
                                                        />
                                                    ))}

                                                </Stack>
                                            </Paper>
                                        )
                                    })
                                )}
                            </Box>

                        </Paper>
                    )}
                </Box>
            </Modal>

        </Stack>
    );
}
