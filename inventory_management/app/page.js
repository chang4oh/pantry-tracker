"use client";

import { useState, useEffect, useRef } from "react";
import { firestore } from "../firebase";
import {
  Box,
  Modal,
  Typography,
  Stack,
  TextField,
  Button,
  Grid,
  ThemeProvider,
  createTheme,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from "@mui/material";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  setDoc,
  query,
  getDoc,
} from "firebase/firestore";
import Webcam from "react-webcam";
import { BrowserMultiFormatReader } from "@zxing/library";
import axios from "axios";

export default function Home() {
  const theme = createTheme({
    typography: {
      fontFamily: "Roboto, Arial, sans-serif",
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: "none",
          },
        },
      },
    },
  });

  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "90%",
    maxWidth: 400,
    bgcolor: "white",
    border: "2px solid #000",
    boxShadow: 24,
    p: 4,
    display: "flex",
    flexDirection: "column",
    gap: 3,
    borderRadius: "15px", 
  };

  const [inventory, setInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("name");
  const [scannerOpen, setScannerOpen] = useState(false);
  const [recipes, setRecipes] = useState([]);
  const webcamRef = useRef(null);
  const barcodeReader = new BrowserMultiFormatReader();

  const updateInventory = async () => {
    const snapshot = query(collection(firestore, "inventory"));
    const docs = await getDocs(snapshot);
    const inventoryList = [];
    docs.forEach((doc) => {
      inventoryList.push({ name: doc.id, ...doc.data() });
    });
    setInventory(inventoryList);
  };

  useEffect(() => {
    updateInventory();
  }, []);

  const addItem = async (item) => {
    const docRef = doc(collection(firestore, "inventory"), item);
    const docSnap = await getDoc(docRef);
    const now = new Date();

    if (docSnap.exists()) {
      const { quantity, lastModified } = docSnap.data();
      await setDoc(docRef, { quantity: quantity + 1, lastModified: now });
    } else {
      await setDoc(docRef, { quantity: 1, lastModified: now });
    }
    await updateInventory();
  };

  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, "inventory"), item);
    const docSnap = await getDoc(docRef);
    const now = new Date();

    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      if (quantity === 1) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, { quantity: quantity - 1, lastModified: now });
      }
    }
    await updateInventory();
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const handleScannerOpen = () => setScannerOpen(true);
  const handleScannerClose = () => setScannerOpen(false);

  const handleBarcodeScan = () => {
    if (webcamRef.current) {
      barcodeReader.decodeFromVideoDevice(
        null,
        webcamRef.current.video,
        (result, err) => {
          if (result) {
            addItem(result.text);
            setScannerOpen(false);
          }
        }
      );
    }
  };

  useEffect(() => {
    if (scannerOpen) {
      handleBarcodeScan();
    } else {
      barcodeReader.reset();
    }
  }, [scannerOpen]);

  const fetchRecipes = async () => {
    const items = inventory.map(item => item.name).join(", ");
    try {
      const response = await axios.post("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", {
        ingredients: items,
      });
      setRecipes(response.data.recipes);
    } catch (error) {
      console.error("Error fetching recipes:", error);
    }
  };

  const filteredInventory = inventory
    .filter((item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortOption === "name") {
        return a.name.localeCompare(b.name);
      } else if (sortOption === "quantity") {
        return b.quantity - a.quantity;
      } else if (sortOption === "date") {
        return new Date(b.lastModified.seconds * 1000) - new Date(a.lastModified.seconds * 1000);
      }
      return 0;
    });

  return (
    <ThemeProvider theme={theme}>
      <Box
        width="100vw"
        height="100vh"
        display={"flex"}
        justifyContent={"center"}
        flexDirection={"column"}
        alignItems={"center"}
        gap={2}
        sx={{
          backgroundImage: "url(inventory_management/img/background.png)",
          backgroundSize: "cover",
          backgroundRepeat: "repeat",
          p: 2,
        }}
      >
        <Modal
          open={open}
          onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={style}>
            <Typography id="modal-modal-title" variant="h6" component="h2">
              Add Item
            </Typography>
            <Stack width="100%" direction={"row"} spacing={2}>
              <TextField
                id="outlined-basic"
                label="Item"
                variant="outlined"
                fullWidth
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
              />
              <Button
                variant="outlined"
                onClick={() => {
                  addItem(itemName);
                  setItemName("");
                  handleClose();
                }}
              >
                Add
              </Button>
            </Stack>
          </Box>
        </Modal>
        <Box
          border={"1px solid #333"}
          width="100%"
          maxWidth="1000px"
          borderRadius="15px"
          sx={{
            bgcolor: "white",
            boxShadow: 3,
            p: 2,
          }}
        >
          <Box
            width="100%"
            height="100px"
            bgcolor={"#ADD8E6"}
            display={"flex"}
            justifyContent={"center"}
            alignItems={"center"}
            borderRadius="15px 15px 0 0"
          >
            <Typography variant={"h2"} color={"#333"} textAlign={"center"}>
              Pantry List
            </Typography>
          </Box>
          <Stack width="100%" spacing={2} padding={2}>
            <Grid
              container
              spacing={1}
              paddingX={2}
              alignItems="center"
              bgcolor="#e0e0e0"
              borderRadius="15px"
            >
              <Grid item xs={4} sm={3} md={2}>
                <Typography variant="h6" color="#333" fontWeight="bold">
                  Item
                </Typography>
              </Grid>
              <Grid item xs={4} sm={3} md={2}>
                <Typography variant="h6" color="#333" fontWeight="bold">
                  Quantity
                </Typography>
              </Grid>
              <Grid item xs={4} sm={6} md={4}>
                <Typography variant="h6" color="#333" fontWeight="bold">
                  Date
                </Typography>
              </Grid>
              <Grid item xs={4} sm={6} md={2}>
                <Typography
                  variant="h6"
                  color="#333"
                  fontWeight="bold"
                ></Typography>
              </Grid>
            </Grid>

            <Stack height="500px" spacing={2} overflow={"auto"}>
              {filteredInventory.map(({ name, quantity, lastModified }) => (
                <Grid
                  container
                  key={name}
                  spacing={1}
                  alignItems="center"
                  paddingX={2}
                >
                  <Grid item xs={4} sm={3} md={2}>
                    <Typography variant={"h5"} color={"#333"}>
                      {name.charAt(0).toUpperCase() + name.slice(1)}
                    </Typography>
                  </Grid>
                  <Grid item xs={4} sm={3} md={2}>
                    <Typography variant={"h5"} color={"#333"}>
                      {quantity}
                    </Typography>
                  </Grid>
                  <Grid item xs={4} sm={6} md={4}>
                    <Typography variant={"h5"} color={"#333"}>
                      {lastModified
                        ? new Date(
                            lastModified.seconds * 1000
                          ).toLocaleDateString()
                        : "N/A"}
                    </Typography>
                  </Grid>
                  <Grid item xs={4} sm={6} md={2}>
                    <Stack direction="row" spacing={1}>
                      <Button
                        variant="contained"
                        onClick={() => addItem(name)}
                        sx={{ width: "120px", height: "40px" }} 
                      >
                        Add
                      </Button>
                      <Button
                        variant="contained"
                        onClick={() => removeItem(name)}
                        sx={{ width: "120px", height: "40px" }} 
                      >
                        Remove
                      </Button>
                    </Stack>
                  </Grid>
                </Grid>
              ))}
            </Stack>
          </Stack>
          <Stack direction="row" spacing={2} padding={2} flexWrap="wrap">
            <TextField
              label="Search Pantry"
              variant="outlined"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              fullWidth
              sx={{ maxWidth: "300px" }}
            />
            <FormControl variant="outlined" sx={{ minWidth: 120 }}>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                label="Sort By"
              >
                <MenuItem value="name">Name</MenuItem>
                <MenuItem value="quantity">Quantity</MenuItem>
                <MenuItem value="date">Date</MenuItem>
              </Select>
            </FormControl>
            <Button
              variant="contained"
              onClick={handleOpen}
              sx={{ flexShrink: 0 }}
            >
              Add New Item
            </Button>
            <Button
              variant="outlined"
              onClick={handleScannerOpen}
              sx={{ flexShrink: 0 }}
            >
              Scan Barcode
            </Button>
          </Stack>
          <Stack padding={2}>
            <Button
              variant="contained"
              onClick={fetchRecipes}
              sx={{ flexShrink: 0 }}
            >
              Generate Recipes
            </Button>
            <Stack spacing={2}>
              {recipes.map((recipe, index) => (
                <Box key={index} p={2} border={"1px solid #ccc"}>
                  <Typography variant="h6">{recipe.title}</Typography>
                  <Typography>{recipe.description}</Typography>
                </Box>
              ))}
            </Stack>
          </Stack>
        </Box>

        <Modal
          open={scannerOpen}
          onClose={handleScannerClose}
          aria-labelledby="scanner-modal-title"
          aria-describedby="scanner-modal-description"
        >
          <Box sx={style}>
            <Typography id="scanner-modal-title" variant="h6" component="h2">
              Scan Barcode
            </Typography>
            <Webcam
              ref={webcamRef}
              audio={false}
              style={{ width: "100%" }}
            />
          </Box>
        </Modal>
      </Box>
    </ThemeProvider>
  );
}
