import React, { useRef, useContext, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import AuthContext from "../AuthContext";

const FaceCapture = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [error, setError] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, login } = useContext(AuthContext);
  const userbread =
    user?.userId || JSON.parse(localStorage.getItem("user"))?.userId; // Optional chaining to avoid errors if user is null
  const emailbread = user.email;
  const [loading, setLoading] = useState(false);

  const apiUrl = "http://localhost:4000";
  const apiUrls = process.env.REACT_APP_API_URL;

  const formData = location.state || {};

  useEffect(() => {
    const startVideo = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        setError("Unable to access your camera. Please check permissions.");
      }
    };

    startVideo();

    // Cleanup function to stop the video stream
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach((track) => track.stop()); // Stops each track
        videoRef.current.srcObject = null; // Clears the video source
      }
    };
  }, []);

  const captureImage = () => {
    if (canvasRef.current && videoRef.current) {
      const context = canvasRef.current.getContext("2d");
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;

      context.drawImage(
        videoRef.current,
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height
      );

      const image = canvasRef.current.toDataURL("image/png");
      setCapturedImage(image);
    }
  };

  const stopVideoStream = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const handleCaptureSubmit = async () => {
    if (loading) return; // Prevent multiple submissions
    setLoading(true);

    if (!capturedImage) {
      alert("Please capture your face before submitting.");
      return;
    }

    try {
      const completeFormData = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        if (key === "selectedFile") {
          if (!(value instanceof File)) {
            alert("Invalid file selected.");
            return;
          }
          completeFormData.append("file", value);
        } else {
          completeFormData.append(key, value);
        }
      });

      // Convert captured image to Blob if it's Base64-encoded
      if (
        typeof capturedImage === "string" &&
        capturedImage.startsWith("data:image")
      ) {
        const blob = await (await fetch(capturedImage)).blob();
        completeFormData.append("faceImage", blob, "capturedImage.jpg");
      } else {
        completeFormData.append("faceImage", capturedImage);
      }

      await axios.post(`${apiUrls}/api/upload-brand`, completeFormData);
      stopVideoStream();

      navigate("/thank-you");
    } catch (error) {
      console.error("Error submitting form data with face:", error);
      alert("Failed to submit form. Please try again.");
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        backgroundColor: "#f9f9f9",
      }}
    >
      <h2 style={{ marginBottom: "20px", textAlign: "center" }}>
        Capture Your Face
      </h2>
      {error && <p style={{ color: "red", marginBottom: "20px" }}>{error}</p>}
      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          maxWidth: "500px",
          aspectRatio: "1 / 1",
          marginBottom: "20px",
          borderRadius: "10px",
          overflow: "hidden",
          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
        }}
      >
        <video
          ref={videoRef}
          autoPlay
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>
      <button
        onClick={captureImage}
        style={{
          width: "70px",
          height: "70px",
          backgroundColor: "red",
          border: "none",
          borderRadius: "50%",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.3)",
          cursor: "pointer",
          marginBottom: "20px",
        }}
      />
      {capturedImage && (
        <div style={{ textAlign: "center" }}>
          <h3>Preview:</h3>
          <img
            src={capturedImage}
            alt="Captured face"
            style={{
              width: "100%",
              maxWidth: "300px",
              borderRadius: "10px",
              marginBottom: "20px",
            }}
          />
        </div>
      )}
      <button
        onClick={handleCaptureSubmit}
        className="submit-button bg-blue-gradient roommate-button"
        disabled={loading}
      >
        {loading ? "Submitting..." : "Submit"}
      </button>

      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  );
};

export default FaceCapture;
