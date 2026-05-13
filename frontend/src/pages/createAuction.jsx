import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/header';
import { supabase } from '../supabaseClient';

const CreateAuction = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    itemName: '',
    category: 'Anime Figurines',
    startingBid: '',
    duration: '3',
    description: '',
  });

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/');
      } else {
        setUser(user);
      }
    };
    checkUser();
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      alert('Please upload a valid image file (JPG, PNG, WEBP, or GIF).');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be smaller than 5MB.');
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      handleImageChange({ target: { files: [file] } });
    }
  };

  const handleDragOver = (e) => e.preventDefault();

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    try {
      let imageUrl = null;

      // Upload image to Supabase Storage if a file was selected
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${user.id}_${Date.now()}.${fileExt}`;
        const filePath = `listings/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('auction-images')
          .upload(filePath, imageFile, { upsert: false });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('auction-images')
          .getPublicUrl(filePath);

        imageUrl = urlData.publicUrl;
      }

      const endTime = new Date();
      endTime.setDate(endTime.getDate() + parseInt(formData.duration));

      const { error } = await supabase.from('auctions').insert([
        {
          seller_id: user.id,
          item_name: formData.itemName,
          description: formData.description,
          starting_price: parseFloat(formData.startingBid),
          current_bid: parseFloat(formData.startingBid),
          category: formData.category,
          end_time: endTime.toISOString(),
          status: 'pending',
          image_url: imageUrl,
        }
      ]);

      if (error) throw error;

      alert('Listing submitted! It will go live after admin approval.');
      navigate('/market');
    } catch (err) {
      console.error('Error creating auction:', err);
      alert('Failed to create auction: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dark-theme min-vh-100 pb-5">
      <Header />
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="p-4 p-md-5 rounded-4 shadow-lg" style={{ backgroundColor: '#161a2d', border: '1px solid rgba(255,255,255,0.1)' }}>
              <h2 className="text-white fw-bold mb-1">List Your Collectible</h2>
              <p className="text-white-50 small mb-4">Fill in the details below to create your auction listing.</p>

              <form className="row g-4 text-start" onSubmit={handleSubmit}>
                
                {/* Item Name */}
                <div className="col-12">
                  <label className="text-white-50 small mb-2">Item Name</label>
                  <input
                    type="text"
                    name="itemName"
                    className="form-control bg-dark border-secondary text-white py-3"
                    placeholder="e.g. Mint Condition Luffy Gear 5 Statue"
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Category & Starting Bid */}
                <div className="col-md-6">
                  <label className="text-white-50 small mb-2">Category</label>
                  <select name="category" className="form-select bg-dark border-secondary text-white py-3" onChange={handleChange}>
                    <option>Anime Figurines</option>
                    <option>Trading Cards</option>
                    <option>Manga</option>
                    <option>Video Games</option>
                    <option>Collectibles</option>
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="text-white-50 small mb-2">Starting Bid ($)</label>
                  <input
                    type="number"
                    name="startingBid"
                    className="form-control bg-dark border-secondary text-white py-3"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Duration */}
                <div className="col-md-6">
                  <label className="text-white-50 small mb-2">Duration (Days)</label>
                  <select name="duration" className="form-select bg-dark border-secondary text-white py-3" onChange={handleChange}>
                    <option value="1">1 Day</option>
                    <option value="3">3 Days</option>
                    <option value="5">5 Days</option>
                    <option value="7">7 Days</option>
                  </select>
                </div>

                {/* Description */}
                <div className="col-12">
                  <label className="text-white-50 small mb-2">Item Description</label>
                  <textarea
                    name="description"
                    rows="4"
                    className="form-control bg-dark border-secondary text-white"
                    placeholder="Tell bidders why this item is special..."
                    onChange={handleChange}
                    required
                  ></textarea>
                </div>

                {/* Image Upload */}
                <div className="col-12">
                  <label className="text-white-50 small mb-2 d-block">Item Image</label>

                  {imagePreview ? (
                    // Preview of selected image
                    <div className="position-relative d-inline-block w-100">
                      <div
                        className="rounded-4 overflow-hidden w-100 text-center"
                        style={{ backgroundColor: '#0e1121', border: '2px solid #05d9c6', height: '220px' }}
                      >
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="h-100 w-100 object-fit-contain p-2"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="btn btn-danger btn-sm position-absolute top-0 end-0 m-2 rounded-circle shadow"
                        style={{ width: '32px', height: '32px', padding: 0 }}
                        title="Remove image"
                      >
                        <i className="bi bi-x-lg"></i>
                      </button>
                      <p className="text-white-50 small mt-2 mb-0">
                        <i className="bi bi-check-circle-fill text-success me-1"></i>
                        {imageFile?.name} ({(imageFile?.size / 1024).toFixed(1)} KB)
                      </p>
                    </div>
                  ) : (
                    // Drag & drop / click to upload zone
                    <div
                      className="rounded-4 d-flex flex-column align-items-center justify-content-center gap-3 py-5"
                      style={{
                        border: '2px dashed rgba(5, 217, 198, 0.4)',
                        backgroundColor: '#0e1121',
                        cursor: 'pointer',
                        transition: '0.2s'
                      }}
                      onClick={() => fileInputRef.current?.click()}
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      onDragEnter={(e) => (e.currentTarget.style.borderColor = '#05d9c6')}
                      onDragLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(5, 217, 198, 0.4)')}
                    >
                      <i className="bi bi-cloud-arrow-up text-info" style={{ fontSize: '2.5rem' }}></i>
                      <div className="text-center">
                        <p className="text-white fw-bold mb-1">Drag & drop your image here</p>
                        <p className="text-white-50 small mb-0">or <span style={{ color: '#05d9c6' }}>click to browse</span></p>
                      </div>
                      <small className="text-white-50">JPG, PNG, WEBP or GIF · Max 5MB</small>
                    </div>
                  )}

                  {/* Hidden file input */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={handleImageChange}
                    className="d-none"
                  />
                </div>

                {/* Action Buttons */}
                <div className="col-12 mt-3">
                  <button
                    type="submit"
                    className="btn w-100 py-3 fw-bold shadow-lg mb-2"
                    style={{ backgroundColor: '#05d9c6', color: '#000', border: 'none' }}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Uploading & Launching...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-rocket-takeoff me-2"></i>
                        Launch Auction
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate('/market')}
                    className="btn btn-outline-secondary w-100 py-3 fw-bold"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateAuction;