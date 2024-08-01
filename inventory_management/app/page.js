'use client'
import Image from "next/image";
import { useState, useEffect } from "react";
import { firestore } from "@/Firebase";
import { Box, Typography } from "@mui/material";


export default function Home() {
  const [inventory, setInventory] = useState([])
  const [open, setOpen] = useState([false])
  const [itemName, setItemName] = useState(['']) /* default value empty string */

  const updateInventory = async () => {
    const snapshot = query(collection(firestore, 'inventory'))
    const docs = await getDocs(snapshot)
    const inventoryList = []
    docs.forEach((doc) => {
      inventoryList.push({
        name: doc.id,
        ...doc.date(),
      })
    })
    setInventory(inventoryList)
  }


  useEffect(() => { /* update when page loads */
    updateInventory()
  }, [])

  return (
    <Box>
      <Typography variant='h1'>Inventory Management</Typography>
      {
        inventory.forEach((item) => {
          return (<>
            {item.name}
            {item.count}
          </>)
        })
      }
    </Box>
  )
}
