import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { DataGrid } from "@mui/x-data-grid";
import { Box } from "@mui/material";
import AuthContext from "../AuthContext";
import { FaTrash } from "react-icons/fa";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from "@mui/material";

import { IconButton, Menu, MenuItem } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";

const People = () => {
  const [data, setData] = useState([]);
  const [approvedIds, setApprovedIds] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuRowId, setMenuRowId] = useState(null); // 👈 this is the missing part
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogAction, setDialogAction] = useState(""); // e.g. 'fund', 'verify', etc.
  const [selectedUser, setSelectedUser] = useState(null); // will store the whole row
  const [inputValue, setInputValue] = useState(""); // store amount, number, or message

  const apiUrls = process.env.REACT_APP_API_URL;
  const { user } = useContext(AuthContext);
  const userbread =
    user?.userId || JSON.parse(localStorage.getItem("user"))?.userId;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${apiUrls}/api/People`);

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

  //   const handleSendEmail = async (email) => {
  //     const message = prompt("Enter message to send to user:");
  //     if (!message) return;

  //     try {
  //       await axios.post(`${apiUrl}/api/send-email`, { email, message });
  //       alert("Email sent successfully!");
  //     } catch (err) {
  //       console.error("Error sending email:", err);
  //       alert("Failed to send email.");
  //     }
  //   };

  const handleMakeWorker = async (id, email, name, referral_code) => {
    try {
      await axios.post(`${apiUrls}/api/make-worker`, {
        id,
        email,
        name,
        referral_code,
      });
      alert("User promoted to worker successfully!");
    } catch (err) {
      console.error("Error promoting user:", err);
      alert("Failed to make worker.");
    }
  };

  //   const handleFundAccount = async (email) => {
  //     const amount = prompt("Enter amount to fund:");
  //     if (!amount) return;

  //     try {
  //       await axios.post(`${apiUrl}/api/fund-account`, { email, amount });
  //       alert("Account funded successfully!");
  //     } catch (err) {
  //       console.error("Error funding account:", err);
  //       alert("Failed to fund account.");
  //     }
  //   };

  const handleVerifyNumber = async (email) => {
    const phone = prompt("Enter phone number to verify:");
    if (!phone) return;

    try {
      await axios.post(`${apiUrls}/api/verify-number`, { email, phone });
      alert("Number verified successfully!");
    } catch (err) {
      console.error("Error verifying number:", err);
      alert("Failed to verify number.");
    }
  };

  const handleVerifyEmail = async (email) => {
    try {
      await axios.post(`${apiUrls}/api/verify-email-fast`, { email });
      alert("Email verified successfully!");
    } catch (err) {
      console.error("Error verifying email:", err);
      alert("Failed to verify email.");
    }
  };

  const columns = [
    { field: "id", headerName: "ID", flex: 1, minWidth: 80 },
    { field: "email", headerName: "email", flex: 1.5, minWidth: 250 },
    { field: "date", headerName: "date", flex: 1, minWidth: 120 },
    {
      field: "phone",
      headerName: "phone",
      flex: 1,
      minWidth: 140,
    },
    {
      field: "full_name",
      headerName: "name",
      flex: 1,
      minWidth: 150,
    },
    {
      field: "referred_by",
      headerName: "Referred By",
      flex: 1,
      minWidth: 100,
    },
    {
      field: "referrer_name",
      headerName: "Referred name",
      flex: 1,
      minWidth: 150,
    },
    {
      field: "referral_code",
      headerName: "referral code",
      flex: 1.5,
      minWidth: 100,
    },
    {
      field: "account_balance",
      headerName: "account balance",
      flex: 1,
      minWidth: 100,
    },

    {
      field: "email_status",
      headerName: "email status",
      flex: 1,
      minWidth: 100,
    },
    {
      field: "role",
      headerName: "role",
      flex: 1,
      minWidth: 100,
    },

    {
      field: "action",
      headerName: "Action",
      flex: 1,
      minWidth: 70,
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
                  setDialogAction("email");
                  setSelectedUser(params.row);
                  setDialogOpen(true);
                  handleMenuClose();
                }}
              >
                Send Email
              </MenuItem>

              <MenuItem
                onClick={() => {
                  handleMakeWorker(
                    params.row.id,
                    params.row.email,
                    params.row.full_name,
                    params.row.referral_code
                  );
                  handleMenuClose();
                }}
              >
                Make Worker
              </MenuItem>
              <MenuItem
                onClick={() => {
                  setDialogAction("fund");
                  setSelectedUser(params.row);
                  setDialogOpen(true);
                  handleMenuClose();
                }}
              >
                Fund Account
              </MenuItem>
              <MenuItem
                onClick={() => {
                  setDialogAction("number");
                  setSelectedUser(params.row);
                  setDialogOpen(true);
                  handleMenuClose();
                }}
              >
                Verify Number
              </MenuItem>

              <MenuItem
                onClick={() => {
                  handleVerifyEmail(params.row.email);
                  handleMenuClose();
                }}
              >
                Verify Email
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
          <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
            <DialogTitle>
              {dialogAction === "email"
                ? "Send Email"
                : dialogAction === "fund"
                ? "Fund Account"
                : "Verify Number"}
            </DialogTitle>
            <DialogContent>
              <TextField
                autoFocus
                margin="dense"
                label={
                  dialogAction === "email"
                    ? "Message"
                    : dialogAction === "fund"
                    ? "Amount"
                    : "Phone Number"
                }
                type={dialogAction === "fund" ? "number" : "text"}
                fullWidth
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button
                onClick={async () => {
                  try {
                    const payload = {
                      email: selectedUser.email,
                      ...(dialogAction === "email" && { message: inputValue }),
                      ...(dialogAction === "fund" && { amount: inputValue }),
                      ...(dialogAction === "number" && { phone: inputValue }),
                    };

                    await axios.post(
                      `${apiUrls}/api/${dialogAction}-action`,
                      payload
                    );
                    alert(`${dialogAction} completed successfully!`);
                    setDialogOpen(false);
                    setInputValue("");
                  } catch (err) {
                    console.error(err);
                    alert("Error performing action.");
                  }
                }}
              >
                Submit
              </Button>
            </DialogActions>
          </Dialog>
          ;
        </Box>
      </Box>
    </Box>
  );
};

export default People;
