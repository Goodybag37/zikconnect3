import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { DataGrid } from "@mui/x-data-grid";
import { Box } from "@mui/material";
import AuthContext from "../AuthContext";
import { FaTrash } from "react-icons/fa";
import { IconButton, Menu, MenuItem } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from "@mui/material";

const Worker = () => {
  const [data, setData] = useState([]);
  const [approvedIds, setApprovedIds] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuRowId, setMenuRowId] = useState(null); // 👈 this is the missing part
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmDialogUser, setConfirmDialogUser] = useState(null);

  const apiUrls = process.env.REACT_APP_API_URL;
  const { user } = useContext(AuthContext);
  const userbread =
    user?.userId || JSON.parse(localStorage.getItem("user"))?.userId;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${apiUrls}/api/workers`);

        setData(res.data.data);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };
    fetchData();
  }, [userbread, apiUrls]);

  //   const handleApprove = async (id, email, amount) => {
  //     try {
  //       await axios.post(`${apiUrls}/api/approve-funding`, { id, email, amount });
  //       alert(`User with ID ${id} approved`);
  //       setData((prevData) => prevData.filter((row) => row.id !== id));
  //       setApprovedIds((prev) => [...prev, id]);
  //     } catch (err) {
  //       console.error("Approval failed:", err);
  //       alert("Approval failed");
  //     }
  //   };

  //   // 2. Add handleDelete function
  //   const handleDelete = async (id) => {
  //     try {
  //       await axios.delete(`${apiUrls}/api/delete-funding/${id}`);
  //       alert(`Funding with ID ${id} deleted`);

  //       // Remove deleted row from UI
  //       setData((prevData) => prevData.filter((row) => row.id !== id));
  //     } catch (err) {
  //       console.error("Delete failed:", err);
  //       alert("Delete failed");
  //     }
  //   };

  const handleMenuOpen = (event, rowId) => {
    setAnchorEl(event.currentTarget);
    setMenuRowId(rowId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuRowId(null);
  };

  const handleResetTarget = async (id, user_id) => {
    // const confirmReset = window.confirm(
    //   "Are you sure you want to reset this worker's target to zero?"
    // );
    // if (!confirmReset) return;

    try {
      await axios.post(`${apiUrls}/api/reset-target`, { id, user_id });
      alert("Target has been reset successfully and user notified.");
    } catch (err) {
      console.error("Reset target error:", err);
      alert("Failed to reset target.");
    }
  };

  const columns = [
    { field: "id", headerName: "ID", flex: 1, minWidth: 80 },
    { field: "name", headerName: "name", flex: 1.5, minWidth: 150 },
    { field: "user_id", headerName: "User ID", flex: 1, minWidth: 120 },
    {
      field: "total_referral",
      headerName: "Referral",
      flex: 1,
      minWidth: 80,
    },
    {
      field: "referred_agents",
      headerName: "Agents",
      flex: 1,
      minWidth: 80,
    },
    {
      field: "referred_buysell",
      headerName: "Buysells",
      flex: 1,
      minWidth: 80,
    },
    {
      field: "referred_market",
      headerName: "Markets",
      flex: 1.5,
      minWidth: 80,
    },
    {
      field: "referred_event",
      headerName: "Events",
      flex: 1,
      minWidth: 80,
    },

    {
      field: "referred_lodge",
      headerName: "Lodges",
      flex: 1,
      minWidth: 80,
    },
    {
      field: "total_referral_fundings",
      headerName: "Ref funds",
      flex: 1,
      minWidth: 90,
    },
    {
      field: "referral_who_funded",
      headerName: "Fund referral",
      flex: 1,
      minWidth: 80,
    },
    {
      field: "weekly_target",
      headerName: "target",
      flex: 1,
      minWidth: 80,
    },
    {
      field: "referral_code",
      headerName: "referral_code",
      flex: 1,
      minWidth: 120,
    },
    {
      field: "action",
      headerName: "Action",
      flex: 1,
      minWidth: 120,
      renderCell: (params) => (
        <>
          <IconButton
            onClick={(event) => handleMenuOpen(event, params.row.id)}
            size="small"
          >
            <MoreVertIcon />
          </IconButton>
          {menuRowId === params.row.id && (
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem
                onClick={() => {
                  setConfirmDialogUser(params.row);
                  setConfirmDialogOpen(true);
                  handleMenuClose();
                }}
              >
                Fire Worker
              </MenuItem>

              <MenuItem
                onClick={() => {
                  handleResetTarget(params.row.id, params.row.user_id);
                  handleMenuClose();
                }}
              >
                Reset Target
              </MenuItem>
            </Menu>
          )}
        </>
      ),
    },
  ];

  return (
    <Box
      sx={{
        flexGrow: 1,
        width: { xs: "100vw", md: "calc(100vw - 240px)" },
        marginTop: "64px",
        marginLeft: { xs: 0, md: "240px" },
        padding: { xs: 1, md: 3 },
        height: "calc(100vh - 64px)",
        boxSizing: "border-box",
        overflow: "hidden", // ✅ important to let inner box scroll
        backgroundColor: "#0000",
      }}
    >
      <Box
        sx={{
          height: "100%",
          overflowX: "auto", // ✅ horizontal scroll here
          backgroundColor: "#f7f7f7",
          padding: 2,
          boxSizing: "border-box",
        }}
      >
        <Box
          sx={{
            minWidth: "1000px", // ✅ trigger horizontal scroll
            width: "fit-content", // ✅ ensures grid doesn’t shrink
          }}
        >
          <DataGrid
            rows={data}
            columns={columns}
            getRowId={(row) => row.id}
            pageSize={5}
            rowsPerPageOptions={[5, 10]}
            disableSelectionOnClick
            isRowSelectable={() => false}
            autoHeight={false} // ✅ needed for scroll
            sx={{
              backgroundColor: "#fff",
              border: "1px solid #ddd",
              borderRadius: 2,
              "& .MuiDataGrid-columnHeaders": {
                backgroundColor: "#f9f9f9",
              },
            }}
          />
          <Dialog
            open={confirmDialogOpen}
            onClose={() => setConfirmDialogOpen(false)}
          >
            <DialogTitle>Confirm Termination</DialogTitle>
            <DialogContent>
              <p>Are you sure you want to fire this worker?</p>
              <p>
                <strong>{confirmDialogUser?.email}</strong>
              </p>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setConfirmDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                color="error"
                onClick={async () => {
                  try {
                    await axios.post(`${apiUrls}/api/fire-worker`, {
                      user_id: confirmDialogUser.user_id,
                      id: confirmDialogUser.id,
                    });
                    alert("Worker has been fired.");
                    setConfirmDialogOpen(false);
                    setData((prev) =>
                      prev.filter((row) => row.id !== confirmDialogUser.id)
                    );
                  } catch (err) {
                    console.error("Failed to fire worker:", err);
                    alert("An error occurred.");
                  }
                }}
              >
                Confirm
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Box>
    </Box>
  );
};

export default Worker;
