import React, { useEffect, useMemo, useState } from "react";
import {
    Box,
    Grid,
    Card,
    Typography,
    TextField,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    Button,
    Stack,
    MenuItem,
    CircularProgress,
    Pagination,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";

/* --------------------------------------------------------
   Your unified ExerciseItem model (UI formatted)
--------------------------------------------------------- */
interface ExerciseItem {
    srno: number;
    exc_name: string;
    video_src: string;
    og_link: string;
    slug: string;
    ext_img: string[];
    muscle_img: string;
    instructions: string[];
    related_excercises: { name: string }[];
    short_desc: string;
    benifits: string[];
    Type: string;
    Main_Muscle_Worked: string;
    Equipment: string;
    Level: string;
}

/* --------------------------------------------------------
   Helper: Remove HTML from WGER description
--------------------------------------------------------- */
const stripHTML = (html: string = "") =>
    html.replace(/<\/?[^>]+(>|$)/g, "").trim();

export default function ExerciseDatabasePage() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [search, setSearch] = useState("");
    const [data, setData] = useState<ExerciseItem[]>([]);
    const [selected, setSelected] = useState<ExerciseItem | null>(null);

    const [muscleFilter, setMuscleFilter] = useState("");
    const [equipmentFilter, setEquipmentFilter] = useState("");
    const [levelFilter, setLevelFilter] = useState("");
    const [typeFilter, setTypeFilter] = useState("");

    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(12);

    /* ------------------------------------------------------
       WGER API requires lookup tables:
       - muscles
       - equipment
       - categories
    ------------------------------------------------------- */
    const [muscleMap, setMuscleMap] = useState<Record<number, string>>({});
    const [equipmentMap, setEquipmentMap] = useState<Record<number, string>>({});
    const [categoryMap, setCategoryMap] = useState<Record<number, string>>({});

    /* ------------------------------------------------------
       Fetch all WGER datasets and map them to your format
    ------------------------------------------------------- */
    useEffect(() => {
        const load = async () => {
            try {
                const [exercisesRes, imagesRes, musclesRes, eqRes, catRes] =
                    await Promise.all([
                        fetch("https://wger.de/api/v2/exercise/?language=2&limit=500"),
                        fetch("https://wger.de/api/v2/exerciseimage/?limit=1000"),
                        fetch("https://wger.de/api/v2/muscle/?limit=200"),
                        fetch("https://wger.de/api/v2/equipment/?limit=200"),
                        fetch("https://wger.de/api/v2/exercisecategory/?limit=200"),
                    ]);

                const exJson = await exercisesRes.json();
                const imgJson = await imagesRes.json();
                const musJson = await musclesRes.json();
                const eqJson = await eqRes.json();
                const catJson = await catRes.json();

                /* --------------------------
                   Build lookup maps
                --------------------------- */
                const mm: Record<number, string> = {};
                musJson.results.forEach((m: any) => {
                    mm[m.id] = m.name;
                });

                const em: Record<number, string> = {};
                eqJson.results.forEach((e: any) => {
                    em[e.id] = e.name;
                });

                const cm: Record<number, string> = {};
                catJson.results.forEach((c: any) => {
                    cm[c.id] = c.name;
                });

                setMuscleMap(mm);
                setEquipmentMap(em);
                setCategoryMap(cm);

                /* --------------------------
                   Map exercise images
                --------------------------- */
                const imgMap: Record<number, string[]> = {};
                imgJson.results.forEach((img: any) => {
                    if (!imgMap[img.exercise]) imgMap[img.exercise] = [];
                    imgMap[img.exercise].push(img.image);
                });

                /* --------------------------
                   Map exercises to UI model
                --------------------------- */
                const mapped: ExerciseItem[] = exJson.results.map(
                    (ex: any, index: number) => ({
                        srno: index + 1,
                        exc_name: ex.name || "Unknown Exercise",
                        slug: "wger-" + ex.id,
                        og_link: `https://wger.de/en/exercise/${ex.id}`,

                        video_src:
                            "https://www.youtube.com/results?search_query=" +
                            encodeURIComponent(ex.name),

                        ext_img: imgMap[ex.id] || [],
                        muscle_img: imgMap[ex.id]?.[0] || "",

                        instructions: ex.description
                            ? [stripHTML(ex.description)]
                            : [],

                        short_desc: stripHTML(ex.description).slice(0, 200) + "...",

                        /* No related exercises in API */
                        related_excercises: [],
                        benifits: [],

                        Type: cm[ex.category] || "General",

                        Main_Muscle_Worked:
                            ex.muscles?.length
                                ? mm[ex.muscles[0]] || "General"
                                : "General",

                        Equipment:
                            ex.equipment?.length
                                ? em[ex.equipment[0]] || "None"
                                : "None",

                        Level: "Intermediate", // static because API doesn't expose level
                    })
                );

                setData(mapped);
            } catch (err) {
                console.error(err);
                setError("Failed to load WGER exercise data");
            } finally {
                setLoading(false);
            }
        };

        load();
    }, []);

    /* ------------------------------------------------------
       Reset pagination when filters change
    ------------------------------------------------------- */
    useEffect(
        () => setPage(1),
        [search, muscleFilter, equipmentFilter, levelFilter, typeFilter, pageSize]
    );

    /* ------------------------------------------------------
       Filtering logic
    ------------------------------------------------------- */
    const filtered = useMemo(() => {
        const s = search.toLowerCase();

        return data.filter((ex) => {
            if (s && !ex.exc_name.toLowerCase().includes(s)) return false;
            if (muscleFilter && ex.Main_Muscle_Worked !== muscleFilter) return false;
            if (equipmentFilter && ex.Equipment !== equipmentFilter) return false;
            if (typeFilter && ex.Type !== typeFilter) return false;
            if (levelFilter && ex.Level !== levelFilter) return false;
            return true;
        });
    }, [data, search, muscleFilter, equipmentFilter, levelFilter, typeFilter]);

    const totalPages = Math.ceil(filtered.length / pageSize);
    const pageData = filtered.slice((page - 1) * pageSize, page * pageSize);

    /* Filter lists */
    const muscles = Array.from(new Set(data.map((d) => d.Main_Muscle_Worked)));
    const equipments = Array.from(new Set(data.map((d) => d.Equipment)));
    const types = Array.from(new Set(data.map((d) => d.Type)));

    /* ------------------------------------------------------
       Loading & Error UI
    ------------------------------------------------------- */
    if (loading)
        return (
            <Box sx={{ p: 4, textAlign: "center" }}>
                <CircularProgress />
            </Box>
        );

    if (error)
        return (
            <Box sx={{ p: 4, textAlign: "center" }}>
                <Typography color="error">{error}</Typography>
            </Box>
        );

    /* ------------------------------------------------------
       MAIN UI
    ------------------------------------------------------- */
    return (
        <Box sx={{ p: 3 }}>
            {/* HEADER */}
            <Box className="glass-card" sx={{ p: 3, mb: 4, borderRadius: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
                    Exercise Library
                </Typography>

                <Typography variant="body1" sx={{ opacity: 0.8, mb: 3 }}>
                    Browse, filter, and learn how to perform every exercise.
                </Typography>

                <Grid container spacing={2}>
                    {/* SEARCH */}
                    <Grid item xs={12} md={6}>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                            <SearchIcon sx={{ mr: 1, opacity: 0.7 }} />
                            <TextField
                                fullWidth
                                label="Search Exercises"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </Box>
                    </Grid>

                    {/* FILTERS */}
                    <Grid item xs={12} md={6}>
                        <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
                            {/* Muscle */}
                            <TextField
                                select
                                size="small"
                                label="Muscle"
                                value={muscleFilter}
                                onChange={(e) => setMuscleFilter(e.target.value)}
                                sx={{ minWidth: 130 }}
                                SelectProps={{ displayEmpty: true }}
                            >
                                <MenuItem value="">
                                    <em>All</em>
                                </MenuItem>
                                {muscles.map((m) => (
                                    <MenuItem key={m} value={m}>
                                        {m}
                                    </MenuItem>
                                ))}
                            </TextField>

                            {/* Equipment */}
                            <TextField
                                select
                                size="small"
                                label="Equipment"
                                value={equipmentFilter}
                                onChange={(e) => setEquipmentFilter(e.target.value)}
                                sx={{ minWidth: 130 }}
                                SelectProps={{ displayEmpty: true }}
                            >
                                <MenuItem value="">
                                    <em>All</em>
                                </MenuItem>
                                {equipments.map((e) => (
                                    <MenuItem key={e} value={e}>
                                        {e}
                                    </MenuItem>
                                ))}
                            </TextField>

                            {/* Type */}
                            <TextField
                                select
                                size="small"
                                label="Type"
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value)}
                                sx={{ minWidth: 130 }}
                                SelectProps={{ displayEmpty: true }}
                            >
                                <MenuItem value="">
                                    <em>All</em>
                                </MenuItem>
                                {types.map((t) => (
                                    <MenuItem key={t} value={t}>
                                        {t}
                                    </MenuItem>
                                ))}
                            </TextField>

                            {/* Page Size */}
                            <TextField
                                select
                                size="small"
                                label="Items Per Page"
                                value={pageSize}
                                onChange={(e) => setPageSize(Number(e.target.value))}
                                sx={{ width: 120 }}
                            >
                                {[12, 24, 48, 96].map((n) => (
                                    <MenuItem key={n} value={n}>
                                        {n}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Stack>
                    </Grid>
                </Grid>
            </Box>

            {/* GRID */}
            <Grid container spacing={3}>
                {pageData.map((ex) => (
                    <Grid item xs={12} sm={6} md={4} key={ex.slug}>
                        <Card
                            className="glass-card"
                            onClick={() => setSelected(ex)}
                            sx={{
                                p: 2,
                                cursor: "pointer",
                                transition: "0.2s",
                                "&:hover": { transform: "scale(1.03)" },
                                height: "100%",
                            }}
                        >
                            <img
                                src={ex.ext_img?.[0] || "/placeholder.png"}
                                alt={ex.exc_name}
                                style={{
                                    width: "100%",
                                    borderRadius: 12,
                                    marginBottom: 12,
                                    height: 180,
                                    objectFit: "cover",
                                }}
                            />

                            <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                {ex.exc_name}
                            </Typography>

                            <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: "wrap" }}>
                                <Chip label={ex.Main_Muscle_Worked} size="small" color="primary" />
                                <Chip label={ex.Equipment} size="small" variant="outlined" />
                                <Chip label={ex.Type} size="small" />
                            </Stack>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* PAGINATION */}
            <Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
                <Pagination
                    count={totalPages}
                    page={page}
                    onChange={(_, v) => setPage(v)}
                    size="large"
                    color="primary"
                />
            </Box>

            {/* MODAL */}
            {selected && (
                <Dialog open fullWidth maxWidth="md" onClose={() => setSelected(null)}>
                    <DialogTitle sx={{ fontWeight: 700 }}>
                        {selected.exc_name}
                        <Button
                            sx={{ float: "right" }}
                            onClick={() => setSelected(null)}
                            startIcon={<CloseIcon />}
                        >
                            Close
                        </Button>
                    </DialogTitle>

                    <DialogContent sx={{ pb: 4 }}>
                        <img
                            src={selected.ext_img?.[0]}
                            style={{
                                width: "100%",
                                borderRadius: 12,
                                marginBottom: 20,
                            }}
                        />

                        <Typography variant="h6">Instructions</Typography>
                        <ul>
                            {selected.instructions.map((s, i) => (
                                <li key={i}>{s}</li>
                            ))}
                        </ul>

                        <Typography variant="h6" sx={{ mt: 3 }}>
                            Video
                        </Typography>

                        <a
                            target="_blank"
                            rel="noreferrer"
                            href={selected.video_src}
                            style={{ color: "#4af" }}
                        >
                            Search on YouTube →
                        </a>
                    </DialogContent>
                </Dialog>
            )}
        </Box>
    );
}
