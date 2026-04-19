import React, { useState, useEffect, useRef } from "react";
import Header from "../components/header";

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [isChangingPass, setIsChangingPass] = useState(false);
  // FIX 1: Names must match backend keys exactly (old_password, new_password)
  const [passwords, setPasswords] = useState({
    old_password: "",
    new_password: "",
  });
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data);
        setFormData(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const saveDetails = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch("http://localhost:5000/api/profile/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData), // Ensure this matches DB columns
      });

      const result = await response.json();

      if (response.ok) {
        alert("Profile Updated Successfully!");
        setIsEditing(false);
        // Force refresh data from DB
        await fetchUserData();
      } else {
        // If the server returns an error, show it
        alert(`Update Failed: ${result.error || "Unknown error"}`);
      }
    } catch (err) {
      console.error("Save error:", err);
      alert("Could not connect to server.");
    }
  };

  // 2. UPLOAD PROFILE PIC
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const data = new FormData();
    data.append("profilePic", file);
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        "http://localhost:5000/api/profile/upload-pic",
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` }, // Do NOT set Content-Type header when using FormData
          body: data,
        },
      );

      if (response.ok) {
        alert("Image uploaded successfully!");
        fetchUserData(); // Refresh profile data
      } else {
        alert("Upload failed. Please try again.");
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("Server error during upload.");
    }
  };

  // 3. CHANGE PASSWORD (Fixed naming mismatch)
  const handlePasswordUpdate = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        "http://localhost:5000/api/profile/change-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(passwords), // Ensure this object has old_password and new_password
        },
      );

      const data = await response.json();
      if (response.ok) {
        alert("Password updated successfully!");
        setIsChangingPass(false);
        setPasswords({ old_password: "", new_password: "" });
      } else {
        alert(`Error: ${data.error || "Failed to update"}`);
      }
    } catch (err) {
      alert("Network Error: Could not connect to the server.");
    }
  };

  if (loading)
    return <div className="text-white text-center mt-5">Loading...</div>;

  return (
    <div className="dark-theme min-vh-100 pb-5 text-white">
      <Header />
      <div className="container py-5 mt-4">
        <div className="row g-4">
          <div className="col-lg-4">
            <div
              className="p-4 rounded-4 shadow-lg text-center"
              style={{ backgroundColor: "#161a2d" }}
            >
              <div
                onClick={() => fileInputRef.current.click()}
                className="mx-auto mb-3 rounded-circle bg-dark d-flex align-items-center justify-content-center shadow"
                style={{
                  width: "120px",
                  height: "120px",
                  border: "3px solid #05d9c6",
                  cursor: "pointer",
                }}
              >
                <span
                  className="display-4 fw-bold"
                  style={{ color: "#05d9c6" }}
                >
                  {user?.first_name?.[0]}
                </span>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                hidden
                onChange={handleFileChange}
              />
              <h3 className="fw-bold mb-1">
                {user?.first_name} {user?.last_name}
              </h3>
              <button
                className="btn btn-outline-light w-100 mt-4 rounded-3 fw-bold py-2"
                onClick={() => fileInputRef.current.click()}
              >
                Edit Profile Image
              </button>
            </div>
          </div>

          <div className="col-lg-8">
            <div
              className="p-4 p-md-5 rounded-4 shadow-lg h-100"
              style={{ backgroundColor: "#161a2d" }}
            >
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="fw-bold mb-0">Account Information</h4>
                {isEditing ? (
                  <button
                    className="btn btn-sm btn-success px-3"
                    onClick={saveDetails}
                  >
                    Save Changes
                  </button>
                ) : (
                  <button
                    className="btn btn-sm px-3 text-dark fw-bold"
                    style={{ background: "#05d9c6" }}
                    onClick={() => setIsEditing(true)}
                  >
                    Edit Details
                  </button>
                )}
              </div>

              <div className="row g-4 text-start">
                {["email", "contact_number", "hobbies"].map((field) => (
                  <div className="col-md-6" key={field}>
                    <label className="text-white-50 small d-block mb-1">
                      {field.toUpperCase()}
                    </label>
                    {isEditing ? (
                      <input
                        name={field}
                        value={formData[field] || ""}
                        onChange={handleInputChange}
                        className="form-control bg-dark text-white border-0 border-bottom"
                      />
                    ) : (
                      <p className="fw-bold">{user[field] || "Not set"}</p>
                    )}
                  </div>
                ))}
              </div>

              {/* Password Section */}
              <div className="mt-5 p-3 rounded-3 bg-dark">
                <h6>Password & Security</h6>
                {isChangingPass ? (
                  <div className="mt-3">
                    <input
                      type="password"
                      placeholder="Old Password"
                      className="form-control mb-2"
                      onChange={(e) =>
                        setPasswords({
                          ...passwords,
                          old_password: e.target.value,
                        })
                      }
                    />
                    <input
                      type="password"
                      placeholder="New Password"
                      className="form-control mb-2"
                      onChange={(e) =>
                        setPasswords({
                          ...passwords,
                          new_password: e.target.value,
                        })
                      }
                    />
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={handlePasswordUpdate}
                    >
                      Confirm Change
                    </button>
                    <button
                      className="btn btn-link btn-sm text-white-50"
                      onClick={() => setIsChangingPass(false)}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => setIsChangingPass(true)}
                  >
                    Change Password
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
