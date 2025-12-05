'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { apiService } from '@/lib/api';
import type { User } from '@/lib/types';
import { formatDate } from '@/lib/utils/formatters';
import Toast from '@/components/ui/Toast';

export default function AdminUsersPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);
  const [lockDialog, setLockDialog] = useState<{
    isOpen: boolean;
    userId: string;
  } | null>(null);
  const [lockReason, setLockReason] = useState('');
  const [roles, setRoles] = useState<Array<{ id: string; name: string }>>([]);

  useEffect(() => {
    if (!loading && !user?.role?.name) {
      router.push('/login');
    } else if (!loading && user?.role?.name !== 'ADMIN') {
      router.push('/');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!loading && user?.role?.name === 'ADMIN') {
      fetchUsers();
      fetchRoles();
    }
  }, [loading, user]);

  useEffect(() => {
    filterUsers();
  }, [searchTerm, statusFilter, users]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getAllUsers();
      setUsers(response.data || []);
      setFilteredUsers(response.data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      showToast('Không thể tải danh sách người dùng', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await apiService.getRoles();
      const rolesData = Array.isArray(response) ? response : ((response as any)?.data || []);

      if (rolesData.length === 0) {
        setRoles([
          { id: '68ca389644f64c447986bbb1', name: 'ADMIN' },
          { id: '68ca389644f64c447986bbb2', name: 'CLIENT' }
        ]);
      } else {
        setRoles(rolesData);
      }
    } catch (error) {
      setRoles([
        { id: '68ca389644f64c447986bbb1', name: 'ADMIN' },
        { id: '68ca389644f64c447986bbb2', name: 'CLIENT' }
      ]);
    }
  };

  const handleRoleChange = async (userId: string, roleId: string, currentRoleId: string) => {
    if (roleId === currentRoleId) return;

    try {
      await apiService.updateUserRole(userId, roleId);
      showToast('Cập nhật vai trò thành công', 'success');
      fetchUsers();
    } catch (error) {
      console.error('Error updating role:', error);
      showToast('Không thể cập nhật vai trò', 'error');
    }
  };

  const filterUsers = () => {
    let filtered = [...users];

    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.fullname.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'ALL') {
      filtered = filtered.filter((user) => user.status === statusFilter);
    }

    setFilteredUsers(filtered);
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleLockUser = async () => {
    if (!lockDialog) return;

    try {
      await apiService.lockUser(lockDialog.userId, {
        reason: lockReason,
        durationMinutes: 525600,
      });
      showToast('Khóa tài khoản thành công', 'success');
      setLockDialog(null);
      setLockReason('');
      fetchUsers();
    } catch (error) {
      console.error('Error locking user:', error);
      showToast('Không thể khóa tài khoản', 'error');
    }
  };

  const handleUnlockUser = async (userId: string) => {
    try {
      await apiService.unlockUser(userId);
      showToast('Mở khóa tài khoản thành công', 'success');
      fetchUsers();
    } catch (error) {
      console.error('Error unlocking user:', error);
      showToast('Không thể mở khóa tài khoản', 'error');
    }
  };

  const openLockDialog = (userId: string) => {
    setLockDialog({ isOpen: true, userId });
  };

  const closeLockDialog = () => {
    setLockDialog(null);
    setLockReason('');
  };

  const openConfirmDialog = (title: string, message: string, onConfirm: () => void) => {
    setConfirmDialog({ isOpen: true, title, message, onConfirm });
  };

  const closeConfirmDialog = () => {
    setConfirmDialog(null);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ACTIVE: { label: 'Hoạt động', class: 'bg-green-100 text-green-800' },
      INACTIVE: { label: 'Không hoạt động', class: 'bg-gray-100 text-gray-800' },
      BLOCKED: { label: 'Đã khóa', class: 'bg-red-100 text-red-800' },
      SUSPENDED: { label: 'Tạm ngưng', class: 'bg-yellow-100 text-yellow-800' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.INACTIVE;
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${config.class}`}>
        {config.label}
      </span>
    );
  };

  const getRoleBadge = (roleName: string) => {
    const roleConfig = {
      ADMIN: { label: 'Admin', class: 'bg-purple-100 text-purple-800' },
      USER: { label: 'User', class: 'bg-blue-100 text-blue-800' },
    };

    const config = roleConfig[roleName as keyof typeof roleConfig] || roleConfig.USER;
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${config.class}`}>
        {config.label}
      </span>
    );
  };

  if (loading || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Quản lý người dùng</h1>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Tìm kiếm theo email hoặc tên..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-600 "
            />
          </div>
          <div className="sm:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-600 "
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="ACTIVE">Hoạt động</option>
              <option value="BLOCKED">Đã khóa</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tên
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Số điện thoại
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vai trò
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày tạo
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                      Không có người dùng nào
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((userData) => (
                    <tr key={userData.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {userData.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {userData.fullname}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {userData.phoneNumber || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <select
                          value={userData.role?.id || ''}
                          onChange={(e) => handleRoleChange(userData.id, e.target.value, userData.role?.id || '')}
                          className="px-3 py-1 text-xs font-semibold rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-gray-700"
                        >
                          {roles.map((role) => (
                            <option key={role.id} value={role.id}>
                              {role.name === 'ADMIN' ? 'Admin' : 'User'}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {getStatusBadge(userData.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(userData.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                        <div className="inline-flex items-center justify-center gap-2">
                          {userData.isLocked ? (
                            <button
                              onClick={() =>
                                openConfirmDialog(
                                  'Mở khóa tài khoản',
                                  `Bạn có chắc muốn mở khóa tài khoản ${userData.email}?`,
                                  () => handleUnlockUser(userData.id)
                                )
                              }
                              className="text-green-600 hover:text-green-900 font-medium"
                              title="Mở khóa"
                            >
                              Mở
                            </button>
                          ) : (
                            <button
                              onClick={() => openLockDialog(userData.id)}
                              className="text-red-600 hover:text-red-900 font-medium"
                              title="Khóa tài khoản"
                            >
                              Khóa
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Lock User Dialog */}
      {lockDialog && (
        <div className="fixed inset-0 bg-black/70 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Khóa tài khoản</h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lý do khóa <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={lockReason}
                  onChange={(e) => setLockReason(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-600"
                  placeholder="Nhập lý do khóa tài khoản..."
                />
              </div>
              <div className="flex gap-3 mt-4">
                <button
                  onClick={closeLockDialog}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                >
                  Hủy
                </button>
                <button
                  onClick={handleLockUser}
                  disabled={!lockReason.trim()}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Khóa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Dialog */}
      {confirmDialog && (
        <div className="fixed inset-0 bg-black/70 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium leading-6 text-gray-900 mb-2">
                {confirmDialog.title}
              </h3>
              <p className="text-sm text-gray-500 mb-4">{confirmDialog.message}</p>
              <div className="flex gap-3">
                <button
                  onClick={closeConfirmDialog}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                >
                  Hủy
                </button>
                <button
                  onClick={() => {
                    confirmDialog.onConfirm();
                    closeConfirmDialog();
                  }}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Xác nhận
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
