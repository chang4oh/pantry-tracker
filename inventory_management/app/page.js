"use client";
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
  ThemeProvider,
  createTheme,
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

// Create a custom theme with Roboto font
const theme = createTheme({
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
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
  width: '90%',
  maxWidth: 400,
  bgcolor: "white",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
  display: "flex",
  flexDirection: "column",
  gap: 3,
  borderRadius: '15px', // Rounded corners
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
    const docRef = doc(collection(firestore, 'inventory'), item);
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

  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ThemeProvider theme={theme}>
      <Box
        width="100vw"
        height="100vh"
        display={'flex'}
        justifyContent={'center'}
        flexDirection={'column'}
        alignItems={'center'}
        gap={2}
        sx={{ 
          backgroundImage: 'url(/path-to-your-background-image.jpg)', 
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          p: 2
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
        <Box 
          border={'1px solid #333'} 
          width="100%" 
          maxWidth="1000px"
          borderRadius="15px"
          sx={{
            bgcolor: 'white',
            boxShadow: 3,
            p: 2
          }}
        >
          <Box
            width="100%"
            height="100px"
            bgcolor={'#ADD8E6'}
            display={'flex'}
            justifyContent={'center'}
            alignItems={'center'}
            borderRadius="15px 15px 0 0"
          >
            <Typography variant={'h2'} color={'#333'} textAlign={'center'}>
              Inventory Items
            </Typography>
          </Box>
          <Stack width="100%" spacing={2} padding={2}>
            {/* Header Row */}
            <Grid container spacing={1} paddingX={2} alignItems="center" bgcolor="#e0e0e0" borderRadius="15px">
              <Grid item xs={4} sm={3} md={2}>
                <Typography variant="h6" color="#333" fontWeight="bold">
                  Product
                </Typography>
              </Grid>
              <Grid item xs={4} sm={3} md={2}>
                <Typography variant="h6" color="#333" fontWeight="bold">
                  Quantity
                </Typography>
              </Grid>
              <Grid item xs={4} sm={6} md={4}>
                <Typography variant="h6" color="#333" fontWeight="bold">
                  Last Modified
                </Typography>
              </Grid>
              <Grid item xs={4} sm={6} md={2}>
                <Typography variant="h6" color="#333" fontWeight="bold">
                  Actions
                </Typography>
              </Grid>
            </Grid>

            {/* Item Rows */}
            <Stack height="500px" spacing={2} overflow={'auto'}>
              {filteredInventory.map(({ name, quantity, lastModified }) => (
                <Grid container key={name} spacing={1} alignItems="center" paddingX={2}>
                  <Grid item xs={4} sm={3} md={2}>
                    <Typography variant={'h5'} color={'#333'}>
                      {name.charAt(0).toUpperCase() + name.slice(1)}
                    </Typography>
                  </Grid>
                  <Grid item xs={4} sm={3} md={2}>
                    <Typography variant={'h5'} color={'#333'}>
                      {quantity}
                    </Typography>
                  </Grid>
                  <Grid item xs={4} sm={6} md={4}>
                    <Typography variant={'h5'} color={'#333'}>
                      {lastModified ? new Date(lastModified.seconds * 1000).toLocaleDateString() : 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid item xs={4} sm={6} md={2}>
                    <Stack direction="row" spacing={1}>
                      <Button variant="contained" onClick={() => addItem(name)} fullWidth>
                        Add
                      </Button>
                      <Button variant="contained" onClick={() => removeItem(name)} fullWidth>
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
              label="Search Inventory"
              variant="outlined"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              fullWidth
              sx={{ maxWidth: '300px' }}
            />
            <Button variant="contained" onClick={handleOpen} sx={{ flexShrink: 0 }}>
              Add New Item
            </Button>
          </Stack>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
