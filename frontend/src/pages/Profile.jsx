import React, { useState, useEffect } from 'react';
import { Camera, Mail, Phone, MapPin, User, Shield, Star, Package } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import Loading from '../components/common/Loading';

const Profile = () => {
    const { user, updateUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [editing, setEditing] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        username: '',
        email: '',
        phone: '',
        address: ''
    });
    const [stats, setStats] = useState({
        totalListings: 0,
        totalBids: 0,
        wonAuctions: 0,
        rating: 0
    });

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                username: user.username || '',
                email: user.email || '',
                phone: user.phone || '',
                address: user.address || ''
            });
            setStats({
                totalListings: user.totalListings || 0,
                totalBids: user.totalBids || 0,
                wonAuctions: user.wonAuctions || 0,
                rating: user.rating || 0
            });
        }
    }, [user]);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(
                'http://localhost:5000/api/users/profile',
                formData,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            if (updateUser) {
                updateUser(response.data.data || response.data.user);
            }
            
            toast.success('Profile updated successfully');
            setEditing(false);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('Please upload an image file');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image size must be less than 5MB');
            return;
        }

        const formData = new FormData();
        formData.append('image', file);

        setUploading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                'http://localhost:5000/api/users/upload-avatar',
                formData,
                { 
                    headers: { 
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    } 
                }
            );
            
            if (updateUser) {
                updateUser({ ...user, image: response.data.imageUrl });
            }
            
            toast.success('Profile picture updated');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to upload image');
        } finally {
            setUploading(false);
        }
    };

    if (!user) {
        return <Loading fullScreen />;
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-5xl mx-auto px-4">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">My Profile</h1>
                    <p className="text-gray-600">Manage your account information</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="relative w-32 h-32 mx-auto mb-4">
                                <img
                                    src={user.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || user.username)}&size=128`}
                                    alt={user.name}
                                    className="w-full h-full rounded-full object-cover border-4 border-gray-200"
                                />
                                <label
                                    htmlFor="avatar-upload"
                                    className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors"
                                >
                                    {uploading ? (
                                        <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                                    ) : (
                                        <Camera className="w-5 h-5" />
                                    )}
                                </label>
                                <input
                                    id="avatar-upload"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="hidden"
                                    disabled={uploading}
                                />
                            </div>

                            <div className="text-center">
                                <h2 className="text-2xl font-bold text-gray-900 mb-1">{user.name}</h2>
                                <p className="text-gray-600 mb-2">@{user.username}</p>
                                <div className="flex items-center justify-center gap-1 text-yellow-500 mb-4">
                                    <Star className="w-5 h-5 fill-current" />
                                    <span className="font-semibold">{stats.rating.toFixed(1)}</span>
                                    <span className="text-gray-500 text-sm">({user.totalRatings || 0} ratings)</span>
                                </div>
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                                    <Shield className="w-4 h-4" />
                                    {user.role || 'User'}
                                </div>
                            </div>

                            <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600 flex items-center gap-2">
                                        <Package className="w-4 h-4" />
                                        Total Listings
                                    </span>
                                    <span className="font-semibold text-gray-900">{stats.totalListings}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">Total Bids</span>
                                    <span className="font-semibold text-gray-900">{stats.totalBids}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">Won Auctions</span>
                                    <span className="font-semibold text-gray-900">{stats.wonAuctions}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-gray-900">Profile Information</h3>
                                {!editing ? (
                                    <button
                                        onClick={() => setEditing(true)}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        Edit Profile
                                    </button>
                                ) : (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => {
                                                setEditing(false);
                                                setFormData({
                                                    name: user.name || '',
                                                    username: user.username || '',
                                                    email: user.email || '',
                                                    phone: user.phone || '',
                                                    address: user.address || ''
                                                });
                                            }}
                                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleSubmit}
                                            disabled={loading}
                                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                                        >
                                            {loading ? 'Saving...' : 'Save Changes'}
                                        </button>
                                    </div>
                                )}
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <User className="w-4 h-4 inline mr-2" />
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        disabled={!editing}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Username
                                    </label>
                                    <input
                                        type="text"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleInputChange}
                                        disabled={!editing}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <Mail className="w-4 h-4 inline mr-2" />
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        disabled={!editing}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <Phone className="w-4 h-4 inline mr-2" />
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        disabled={!editing}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                                        placeholder="+1 (555) 000-0000"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <MapPin className="w-4 h-4 inline mr-2" />
                                        Address
                                    </label>
                                    <textarea
                                        name="address"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        disabled={!editing}
                                        rows={3}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                                        placeholder="Street, City, State, ZIP"
                                    />
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
