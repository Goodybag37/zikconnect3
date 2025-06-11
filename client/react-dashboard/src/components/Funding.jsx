import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { DataGrid } from "@mui/x-data-grid";
import { Box } from "@mui/material";
import AuthContext from "../AuthContext";
import { FaTrash } from "react-icons/fa";

const Funding = () => {
  const [data, setData] = useState([]);
  const [approvedIds, setApprovedIds] = useState([]);
  const apiUrls = process.env.REACT_APP_API_URL;
  const { user } = useContext(AuthContext);
  const userbread =
    user?.userId || JSON.parse(localStorage.getItem("user"))?.userId;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${apiUrls}/api/fundings`);

        console.log("something came", res.data.data);
        setData(res.data.data);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };
    fetchData();
  }, [userbread, apiUrls]);

  const handleApprove = async (id, email, amount) => {
    try {
      await axios.post(`${apiUrls}/api/approve-funding`, { id, email, amount });
      alert(`User with ID ${id} approved`);
      setData((prevData) => prevData.filter((row) => row.id !== id));
      setApprovedIds((prev) => [...prev, id]);
    } catch (err) {
      console.error("Approval failed:", err);
      alert("Approval failed");
    }
  };

  // 2. Add handleDelete function
  const handleDelete = async (id) => {
    try {
      await axios.delete(`${apiUrls}/api/delete-funding/${id}`);
      alert(`Funding with ID ${id} deleted`);

      // Remove deleted row from UI
      setData((prevData) => prevData.filter((row) => row.id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Delete failed");
    }
  };

  const columns = [
    { field: "id", headerName: "ID", flex: 1, minWidth: 80 },
    { field: "email", headerName: "Email", flex: 1.5, minWidth: 150 },
    { field: "user_id", headerName: "User ID", flex: 1, minWidth: 120 },
    { field: "amount", headerName: "Amount", flex: 1, minWidth: 100 },
    { field: "phone", headerName: "Phone", flex: 1, minWidth: 100 },
    {
      field: "account_balance",
      headerName: "Account Balance",
      flex: 1,
      minWidth: 100,
    },
    { field: "date", headerName: "Date", flex: 1.5, minWidth: 130 },
    { field: "status", headerName: "Status", flex: 1, minWidth: 100 },
    {
      field: "action",
      headerName: "Action",
      flex: 1,
      minWidth: 120,
      renderCell: (params) => {
        const isApproved = approvedIds.includes(params.row.id);
        return (
          <div>
            <button
              onClick={() =>
                handleApprove(
                  params.row.id,
                  params.row.email,
                  params.row.amount
                )
              }
              disabled={isApproved}
              style={{
                padding: "6px 12px",
                backgroundColor: isApproved ? "#ccc" : "#4caf50",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                marginRight: "10px",
                cursor: isApproved ? "not-allowed" : "pointer",
              }}
            >
              {isApproved ? "Approved" : "Approve"}
            </button>
            <FaTrash
              onClick={() => handleDelete(params.row.id)}
              style={{
                color: "#000",
                cursor: "pointer",
                fontSize: "18px",
              }}
              title="Delete"
            />
          </div>
        );
      },
    },
  ];

  return (
    <Box
      sx={{
        flexGrow: 1,
        width: { xs: "100%", md: "calc(100vw - 240px)" },
        marginLeft: { xs: 0, md: "240px" },
        marginTop: "64px", // header height
        padding: { xs: 1, md: 3 },
        height: "calc(100vh - 64px)", // fills space below header
        boxSizing: "border-box",
        overflowX: "auto",

        WebkitOverflowScrolling: "touch",
        backgroundColor: "#0000",
      }}
    >
      <Box
        sx={{
          minWidth: "800px", // ✅ ensure scrollable
          // width: "100%",
          height: "100%",
          minHeight: "400px",
          backgroundColor: "#fff",
          border: "1px solid #ddd",
          borderRadius: "8px",
        }}
      >
        <DataGrid
          rows={data}
          columns={columns}
          getRowId={(row) => row.id}
          pageSize={5}
          rowsPerPageOptions={[5, 10]}
          disableSelectionOnClick
          sx={{
            width: "100%",
            height: "100%",

            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: "#f9f9f9",
            },
          }}
        />
      </Box>
    </Box>
  );
};

export default Funding;
