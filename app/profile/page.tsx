"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Edit2,
  Save,
  X,
  Upload,
  Camera,
  MapPin,
} from "lucide-react";
import { apiService, type UserProfile } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Toast } from "@/components/ui";
import { useToast } from "@/lib/hooks";
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from "@/lib/constants";

export default function ProfilePage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { toast, showToast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    fullname: "",
    phoneNumber: "",
    address: "",
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    const fetchProfile = async () => {
      setLoading(true);
      try {
        const data = await apiService.getProfile();
        if (data) {
          setProfile(data);
          setFormData({
            fullname: data.fullname,
            phoneNumber: data.phoneNumber || "",
            address: data.address || "",
          });
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [isAuthenticated, router]);

  const handleAvatarChange = (file: File) => {
    if (!file.type.startsWith("image/")) {
      showToast(ERROR_MESSAGES.INVALID_IMAGE_FILE, "error");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast(ERROR_MESSAGES.IMAGE_TOO_LARGE, "error");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
      setAvatarFile(file);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleAvatarChange(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleAvatarChange(file);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Update profile info
      const updated = await apiService.updateProfile(formData);
      if (updated) {
        setProfile(updated);

        // Upload avatar
        if (avatarFile) {
          const formDataUpload = new FormData();
          formDataUpload.append("file", avatarFile);

          try {
            const response = await fetch(
              `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/avatar`,
              {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${localStorage.getItem(
                    "accessToken"
                  )}`,
                },
                body: formDataUpload,
              }
            );

            if (response.ok) {
              const result = await response.json();
              // Update profile with new avatar
              const newAvatar =
                result.data?.avatar ||
                result.avatar ||
                result.data?.url ||
                result.url;
              if (newAvatar) {
                setProfile({ ...updated, avatar: newAvatar });
                // Reload page to update header avatar
                setTimeout(() => {
                  window.location.reload();
                }, 1000);
              }
            } else {
              console.error(
                "Avatar upload failed:",
                response.status,
                await response.text()
              );
              showToast(ERROR_MESSAGES.AVATAR_UPDATE_FAILED, "error");
            }
          } catch (error) {
            console.error("Avatar upload error:", error);
            showToast(ERROR_MESSAGES.AVATAR_UPDATE_FAILED, "error");
          }
        }

        setEditing(false);
        setAvatarPreview(null);
        setAvatarFile(null);
        showToast(SUCCESS_MESSAGES.PROFILE_UPDATE_SUCCESS, "success");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      showToast(ERROR_MESSAGES.PROFILE_UPDATE_FAILED, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        fullname: profile.fullname,
        phoneNumber: profile.phoneNumber || "",
        address: profile.address || "",
      });
    }
    setAvatarPreview(null);
    setAvatarFile(null);
    setEditing(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <p className="text-gray-600">Không thể tải thông tin người dùng</p>
      </div>
    );
  }

  return (
    <>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => {}}
        />
      )}
      <div className="min-h-screen pt-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <h1 className="text-3xl font-bold text-gray-900">
                Thông Tin Cá Nhân
              </h1>
            </div>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                <Edit2 className="w-4 h-4" />
                Chỉnh sửa
              </button>
            )}
          </div>

          {/* Profile Card */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            {/* Avatar */}
            <div className="flex justify-center mb-8">
              <div className="relative group">
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  className={`w-32 h-32 bg-green-600 rounded-full flex items-center justify-center overflow-hidden cursor-pointer transition ${
                    isDragging ? "ring-4 ring-green-400 scale-105" : ""
                  }`}
                  onClick={() => editing && fileInputRef.current?.click()}
                >
                  {avatarPreview || profile.avatar ? (
                    <img
                      src={avatarPreview || profile.avatar}
                      alt={profile.fullname}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-16 h-16 text-white" />
                  )}
                  {editing && (
                    <div className="absolute inset-0 bg-green bg-opacity-50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition">
                      <Camera className="w-8 h-8 text-white mb-1" />
                      <span className="text-white text-xs text-center px-2">
                        {isDragging ? "Thả ảnh vào đây" : "Kéo thả hoặc click"}
                      </span>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                {editing && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 p-2 bg-green-600 text-white rounded-full shadow-lg hover:bg-green-700 transition z-10"
                    title="Tải ảnh lên"
                  >
                    <Upload className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Profile Info */}
            <div className="space-y-6">
              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vai trò
                </label>
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <span className="text-green-700 font-medium">
                    {profile.role.name}
                  </span>
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Họ và tên
                </label>
                {editing ? (
                  <input
                    type="text"
                    value={formData.fullname}
                    onChange={(e) =>
                      setFormData({ ...formData, fullname: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                  />
                ) : (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <User className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-900">{profile.fullname}</span>
                  </div>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-900">{profile.email}</span>
                  <span className="ml-auto text-xs text-gray-500">
                    (Không thể thay đổi)
                  </span>
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số điện thoại
                </label>
                {editing ? (
                  <input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, phoneNumber: e.target.value })
                    }
                    placeholder="Nhập số điện thoại"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 placeholder:text-gray-600 placeholder:opacity-100"
                  />
                ) : (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-900">
                      {profile.phoneNumber || "Chưa cập nhật"}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Addresses Link */}
            {!editing && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={() => router.push('/profile/addresses')}
                  className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition"
                >
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-green-600" />
                    <span className="text-gray-900 font-medium">Quản lý địa chỉ</span>
                  </div>
                  <span className="text-gray-400">›</span>
                </button>
              </div>
            )}

            {/* Action Buttons */}
            {editing && (
              <div className="flex gap-4 mt-8">
                <button
                  onClick={handleCancel}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  <X className="w-5 h-5" />
                  Hủy
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:bg-gray-300"
                >
                  <Save className="w-5 h-5" />
                  {saving ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
