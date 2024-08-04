"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import { firestore } from "../firebase";
import {
  Box,
  Modal,
  Typography,
  Stack,
  TextField,
  Button,
  Grid,
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

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "white",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
  display: "flex",
  flexDirection: "column",
  gap: 3,
};

export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const updateInventory = async () => {
    const snapshot = query(collection(firestore, 'inventory'));
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
    const docRef = doc(collection(firestore, 'inventory'), item);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      await setDoc(docRef, { quantity: quantity + 1 });
    } else {
      await setDoc(docRef, { quantity: 1 });
    }
    await updateInventory();
  };

  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      if (quantity === 1) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, { quantity: quantity - 1 });
      }
    }
    await updateInventory();
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box
      width="100vw"
      height="100vh"
      display={'flex'}
      justifyContent={'center'}
      flexDirection={'column'}
      alignItems={'center'}
      gap={2}
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
          <Stack width="100%" direction={'row'} spacing={2}>
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
                setItemName('');
                handleClose();
              }}
            >
              Add
            </Button>
          </Stack>
        </Box>
      </Modal>
      <Box border={'1px solid #333'} width="1000px">
        <Box
          width="100%"
          height="100px"
          bgcolor={'#ADD8E6'}
          display={'flex'}
          justifyContent={'center'}
          alignItems={'center'}
        >
          <Typography variant={'h2'} color={'#333'} textAlign={'center'}>
            Inventory Items
          </Typography>
        </Box>
        <Stack width="100%" height="500px" spacing={2} overflow={'auto'} padding={2}>
          {filteredInventory.map(({ name, quantity }) => (
            <Grid container key={name} spacing={2} alignItems="center" paddingX={5}>
              <Grid item xs={4}>
                <Typography variant={'h5'} color={'#333'}>
                  {name.charAt(0).toUpperCase() + name.slice(1)}
                </Typography>
              </Grid>
              <Grid item xs={2}>
                <Typography variant={'h5'} color={'#333'}>
                  Quantity: {quantity}
                </Typography>
              </Grid>
              <Grid item xs={3}>
                <Button variant="contained" onClick={() => addItem(name)} fullWidth>
                  Add
                </Button>
              </Grid>
              <Grid item xs={3}>
                <Button variant="contained" onClick={() => removeItem(name)} fullWidth>
                  Remove
                </Button>
              </Grid>
            </Grid>
          ))}
        </Stack>
        <Stack direction="row" spacing={2} padding={2}>
          <TextField
            label="Search Inventory"
            variant="outlined"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button variant="contained" onClick={handleOpen}>
            Add New Item
          </Button>
        </Stack>
      </Box>
    </Box>
  );
}
