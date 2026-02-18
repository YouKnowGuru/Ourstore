'use client';

import { useState, useRef } from 'react';
import { Camera, Plus, Trash2, Shield, MapPin, User, LogOut, Loader2, Key, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useAuth } from '@/lib/hooks/useAuth';
import { userAPI } from '@/lib/services/api';
import { toast } from 'sonner';

const dzongkhags = [
    'Bumthang', 'Chhukha', 'Dagana', 'Gasa', 'Haa', 'Lhuentse',
    'Mongar', 'Paro', 'Pema Gatshel', 'Punakha', 'Samdrup Jongkhar',
    'Samtse', 'Sarpang', 'Thimphu', 'Trashigang', 'Trashiyangtse',
    'Trongsa', 'Tsirang', 'Wangdue Phodrang', 'Zhemgang'
];

const Profile = () => {
    const { user, logout, refreshUser } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [isAddingAddress, setIsAddingAddress] = useState(false);
    const [isDeletingAccount, setIsDeletingAccount] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [deletePassword, setDeletePassword] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [profileData, setProfileData] = useState({
        fullName: user?.fullName || '',
        phone: user?.phone || '',
    });

    const [newAddress, setNewAddress] = useState({
        fullName: user?.fullName || '',
        phone: user?.phone || '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        dzongkhag: '',
        postalCode: '',
        isDefault: false,
    });

    const handleUpdateProfile = async () => {
        setIsSubmitting(true);
        try {
            await userAPI.updateProfile(profileData);
            toast.success('Profile updated successfully');
            setIsEditing(false);
            refreshUser();
        } catch (error) {
            toast.error('Failed to update profile');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleProfilePictureChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[e.target.files.length - 1];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            toast.error('Image size should be less than 2MB');
            return;
        }

        setIsUploading(true);
        const formData = new FormData();
        formData.append('profilePicture', file);

        try {
            await userAPI.updateProfilePicture(formData);
            toast.success('Profile picture updated');
            refreshUser();
        } catch (error) {
            toast.error('Failed to update profile picture');
        } finally {
            setIsUploading(false);
        }
    };

    const handleAddAddress = async () => {
        setIsSubmitting(true);
        try {
            await userAPI.addAddress(newAddress);
            toast.success('Address added successfully');
            setIsAddingAddress(false);
            setNewAddress({
                fullName: user?.fullName || '',
                phone: user?.phone || '',
                addressLine1: '',
                addressLine2: '',
                city: '',
                dzongkhag: '',
                postalCode: '',
                isDefault: false,
                // @ts-ignore
                isDefault: false, // Ensure it's reset correctly
            });
            refreshUser();
        } catch (error) {
            toast.error('Failed to add address');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteAddress = async (id: string) => {
        try {
            await userAPI.deleteAddress(id);
            toast.success('Address deleted');
            refreshUser();
        } catch (error) {
            toast.error('Failed to delete address');
        }
    };

    const handleDeleteAccount = async () => {
        if (!deletePassword) {
            toast.error('Please enter your password to confirm');
            return;
        }

        setIsSubmitting(true);
        try {
            await userAPI.deleteAccount(deletePassword);
            toast.success('Account deleted successfully');
            logout();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to delete account');
        } finally {
            setIsSubmitting(false);
            setIsDeletingAccount(false);
        }
    };

    return (
        <div className="pt-24 pb-16 min-h-screen bg-gray-50/50">
            <div className="bhutan-container max-w-5xl">
                <div className="flex flex-col md:flex-row gap-8 items-start mb-8">
                    <div className="relative group">
                        <div className="w-32 h-32 rounded-2xl overflow-hidden shadow-xl ring-4 ring-white transition-transform duration-300 group-hover:scale-105">
                            {user?.profilePicture ? (
                                <img src={user.profilePicture} alt={user.fullName} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-maroon to-maroon/80 flex items-center justify-center">
                                    <span className="text-white text-4xl font-display font-medium">
                                        {user?.fullName?.charAt(0).toUpperCase() || 'U'}
                                    </span>
                                </div>
                            )}
                            {isUploading && (
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                                </div>
                            )}
                        </div>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute -bottom-2 -right-2 w-10 h-10 bg-saffron text-white rounded-xl shadow-lg border-2 border-white flex items-center justify-center hover:bg-saffron-600 transition-colors"
                            disabled={isUploading}
                        >
                            <Camera className="w-5 h-5" />
                        </button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleProfilePictureChange}
                        />
                    </div>

                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-3xl font-display font-bold text-gray-900">{user?.fullName}</h1>
                            {user?.role === 'admin' && (
                                <span className="bg-saffron/10 text-saffron text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full border border-saffron/20">Admin</span>
                            )}
                        </div>
                        <p className="text-gray-500 mb-4">{user?.email}</p>
                        <div className="flex flex-wrap gap-4">
                            <div className="flex items-center gap-2 text-sm text-gray-600 bg-white px-3 py-1.5 rounded-lg border shadow-sm">
                                <CheckCircle className="w-4 h-4 text-green-500" />
                                <span>Verified Account</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600 bg-white px-3 py-1.5 rounded-lg border shadow-sm">
                                <User className="w-4 h-4 text-blue-500" />
                                <span>Member Since: {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</span>
                            </div>
                        </div>
                    </div>

                    <Button
                        variant="outline"
                        className="hidden md:flex gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                        onClick={logout}
                    >
                        <LogOut className="w-4 h-4" />
                        Logout
                    </Button>
                </div>

                <Tabs defaultValue="profile" className="space-y-6">
                    <TabsList className="bg-white p-1 rounded-xl border shadow-sm h-12 inline-flex">
                        <TabsTrigger value="profile" className="rounded-lg data-[state=active]:bg-saffron data-[state=active]:text-white">
                            <User className="w-4 h-4 mr-2" />
                            General
                        </TabsTrigger>
                        <TabsTrigger value="addresses" className="rounded-lg data-[state=active]:bg-saffron data-[state=active]:text-white">
                            <MapPin className="w-4 h-4 mr-2" />
                            Addresses
                        </TabsTrigger>
                        <TabsTrigger value="security" className="rounded-lg data-[state=active]:bg-saffron data-[state=active]:text-white">
                            <Shield className="w-4 h-4 mr-2" />
                            Security
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="profile">
                        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="p-6 border-b flex items-center justify-between bg-gray-50/50">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-saffron/10 rounded-lg">
                                        <User className="w-5 h-5 text-saffron" />
                                    </div>
                                    <h2 className="text-xl font-bold">General Information</h2>
                                </div>
                                {!isEditing && (
                                    <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                                        Edit Details
                                    </Button>
                                )}
                            </div>
                            <div className="p-8">
                                {isEditing ? (
                                    <div className="grid md:grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label>Full Name</Label>
                                                <Input
                                                    value={profileData.fullName}
                                                    onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                                                    className="focus:ring-saffron"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Phone Number</Label>
                                                <Input
                                                    value={profileData.phone}
                                                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                                    placeholder="+975-XXXXXXXX"
                                                />
                                            </div>
                                            <div className="flex gap-3 pt-4">
                                                <Button
                                                    className="bg-saffron hover:bg-saffron-600 flex-1"
                                                    onClick={handleUpdateProfile}
                                                    disabled={isSubmitting}
                                                >
                                                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
                                                </Button>
                                                <Button variant="outline" onClick={() => setIsEditing(false)} className="flex-1">
                                                    Cancel
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="hidden md:block bg-gray-50 rounded-xl p-6 border text-sm text-gray-500">
                                            <p className="mb-2 font-semibold text-gray-700">Tips for your profile:</p>
                                            <ul className="list-disc list-inside space-y-2">
                                                <li>Use your real name for easier order tracking.</li>
                                                <li>Update your phone number for delivery updates.</li>
                                                <li>A profile picture helps us identify you better.</li>
                                            </ul>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="grid sm:grid-cols-2 gap-10">
                                        <div className="group">
                                            <p className="text-xs uppercase tracking-wider text-gray-400 font-bold mb-1">Full Name</p>
                                            <p className="text-lg font-medium text-gray-900 group-hover:text-saffron transition-colors">{user?.fullName}</p>
                                        </div>
                                        <div className="group">
                                            <p className="text-xs uppercase tracking-wider text-gray-400 font-bold mb-1">Email Address</p>
                                            <p className="text-lg font-medium text-gray-900 group-hover:text-saffron transition-colors">{user?.email}</p>
                                        </div>
                                        <div className="group">
                                            <p className="text-xs uppercase tracking-wider text-gray-400 font-bold mb-1">Phone Number</p>
                                            <p className="text-lg font-medium text-gray-900 group-hover:text-saffron transition-colors">{user?.phone || 'Not provided'}</p>
                                        </div>
                                        <div className="group">
                                            <p className="text-xs uppercase tracking-wider text-gray-400 font-bold mb-1">User Role</p>
                                            <p className="text-lg font-medium text-gray-900 capitalize group-hover:text-saffron transition-colors">{user?.role}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="addresses">
                        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="p-6 border-b flex items-center justify-between bg-gray-50/50">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-blue-100/50 rounded-lg">
                                        <MapPin className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <h2 className="text-xl font-bold">Delivery Addresses</h2>
                                </div>
                                <Dialog open={isAddingAddress} onOpenChange={setIsAddingAddress}>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" size="sm">
                                            <Plus className="w-4 h-4 mr-1.5" />
                                            New Address
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-md">
                                        <DialogHeader>
                                            <DialogTitle>Add Delivery Address</DialogTitle>
                                            <DialogDescription>Ensure your information is accurate for seamless delivery.</DialogDescription>
                                        </DialogHeader>
                                        <div className="space-y-4 mt-4 max-h-[60vh] overflow-y-auto px-1 custom-scrollbar">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label>Receiver Name</Label>
                                                    <Input
                                                        placeholder="Full Name"
                                                        value={newAddress.fullName}
                                                        onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Phone Number</Label>
                                                    <Input
                                                        placeholder="+975"
                                                        value={newAddress.phone}
                                                        onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Address Line 1</Label>
                                                <Input
                                                    placeholder="Street, Building, Flat"
                                                    value={newAddress.addressLine1}
                                                    onChange={(e) => setNewAddress({ ...newAddress, addressLine1: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Address Line 2 (Optional)</Label>
                                                <Input
                                                    placeholder="Landmark, Locality"
                                                    value={newAddress.addressLine2}
                                                    onChange={(e) => setNewAddress({ ...newAddress, addressLine2: e.target.value })}
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label>City</Label>
                                                    <Input
                                                        placeholder="Thimphu"
                                                        value={newAddress.city}
                                                        onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Dzongkhag</Label>
                                                    <select
                                                        value={newAddress.dzongkhag}
                                                        onChange={(e) => setNewAddress({ ...newAddress, dzongkhag: e.target.value })}
                                                        className="w-full px-3 py-2 border rounded-lg text-sm bg-white focus:ring-2 focus:ring-saffron/20 transition-all outline-none"
                                                    >
                                                        <option value="">Select...</option>
                                                        {dzongkhags.map((d) => (
                                                            <option key={d} value={d}>{d}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Postal Code</Label>
                                                <Input
                                                    placeholder="11001"
                                                    value={newAddress.postalCode}
                                                    onChange={(e) => setNewAddress({ ...newAddress, postalCode: e.target.value })}
                                                />
                                            </div>
                                            <div className="flex items-center gap-2 py-2">
                                                <input
                                                    type="checkbox"
                                                    id="isDefault"
                                                    checked={newAddress.isDefault}
                                                    onChange={(e) => setNewAddress({ ...newAddress, isDefault: e.target.checked })}
                                                    className="w-4 h-4 text-saffron accent-saffron"
                                                />
                                                <Label htmlFor="isDefault" className="text-sm cursor-pointer font-medium text-gray-600">Set as default delivery address</Label>
                                            </div>
                                            <Button
                                                className="w-full bg-saffron hover:bg-saffron-600 mt-2 shadow-lg"
                                                onClick={handleAddAddress}
                                                disabled={isSubmitting}
                                            >
                                                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Address'}
                                            </Button>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </div>
                            <div className="p-8">
                                {user?.addresses && user.addresses.length > 0 ? (
                                    <div className="grid sm:grid-cols-2 gap-6">
                                        {user.addresses.map((address) => (
                                            <div key={address._id} className="relative group border rounded-2xl p-6 hover:border-saffron/30 hover:shadow-md transition-all duration-300">
                                                {address.isDefault && (
                                                    <span className="absolute -top-2 left-4 bg-saffron text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-sm">DEFAULT</span>
                                                )}
                                                <div className="flex justify-between items-start">
                                                    <div className="space-y-1">
                                                        <p className="font-bold text-gray-900">{address.addressLine1}</p>
                                                        {address.addressLine2 && <p className="text-sm text-gray-600">{address.addressLine2}</p>}
                                                        <p className="text-sm text-gray-500">{address.city}, {address.dzongkhag}</p>
                                                    </div>
                                                    <button
                                                        onClick={() => handleDeleteAddress(address._id)}
                                                        className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-10 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100 flex flex-col items-center">
                                        <MapPin className="w-10 h-10 text-gray-200 mb-3" />
                                        <p className="text-gray-400 font-medium">No saved addresses yet</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="security">
                        <div className="grid md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="bg-white rounded-2xl border shadow-sm p-8 space-y-6">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-saffron/10 rounded-lg">
                                        <Key className="w-5 h-5 text-saffron" />
                                    </div>
                                    <h2 className="text-xl font-bold">Update Password</h2>
                                </div>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Current Password</Label>
                                        <Input type="password" placeholder="••••••••" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>New Password</Label>
                                        <Input type="password" placeholder="••••••••" />
                                    </div>
                                    <Button className="w-full bg-saffron hover:bg-saffron-600 shadow-md">
                                        Change Password
                                    </Button>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl border shadow-sm p-8 space-y-6 border-red-50">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-red-100 rounded-lg">
                                        <Trash2 className="w-5 h-5 text-red-600" />
                                    </div>
                                    <h2 className="text-xl font-bold text-red-600">Danger Zone</h2>
                                </div>
                                <p className="text-sm text-gray-500 leading-relaxed">
                                    Deleting your account is permanent. All your order history, saved addresses, and profile data will be erased. This action cannot be undone.
                                </p>
                                <Dialog open={isDeletingAccount} onOpenChange={setIsDeletingAccount}>
                                    <DialogTrigger asChild>
                                        <Button variant="destructive" className="w-full shadow-md bg-red-600 hover:bg-red-700">
                                            Delete My Account
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-md border-red-100 shadow-2xl">
                                        <DialogHeader>
                                            <DialogTitle className="text-red-600 flex items-center gap-2">
                                                <Shield className="w-5 h-5" />
                                                Are you absolutely sure?
                                            </DialogTitle>
                                            <DialogDescription className="pt-2 text-gray-600">
                                                This action is permanent and cannot be reversed. To confirm, please enter your password below.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="space-y-4 mt-4">
                                            <div className="space-y-2">
                                                <Label className="text-xs font-bold uppercase tracking-wider text-gray-400">Confirm with Password</Label>
                                                <Input
                                                    type="password"
                                                    placeholder="Your account password"
                                                    className="border-red-100 focus:ring-red-100"
                                                    value={deletePassword}
                                                    onChange={(e) => setDeletePassword(e.target.value)}
                                                />
                                            </div>
                                            <DialogFooter className="gap-2 sm:gap-0 mt-2">
                                                <Button
                                                    variant="outline"
                                                    onClick={() => {
                                                        setIsDeletingAccount(false);
                                                        setDeletePassword('');
                                                    }}
                                                    className="flex-1 sm:flex-none"
                                                >
                                                    I've changed my mind
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    onClick={handleDeleteAccount}
                                                    disabled={isSubmitting || !deletePassword}
                                                    className="flex-1 sm:flex-none bg-red-600 hover:bg-red-700 font-bold"
                                                >
                                                    {isSubmitting ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : 'Confirm Deletion'}
                                                </Button>
                                            </DialogFooter>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
};

export default Profile;
