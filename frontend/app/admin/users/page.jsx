"use client";

import { useMemo, useState, useEffect, useRef, useCallback } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Users,
  Plus,
  Trash2,
  Edit2,
  Loader2,
  AlertTriangle,
} from "lucide-react";

const roleOptions = [
  { value: "all", label: "All roles" },
  { value: "admin", label: "Admin" },
  { value: "author", label: "Author" },
  { value: "reader", label: "Reader" },
];

const statusOptions = [
  { value: "all", label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "suspended", label: "Suspended" },
];

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Delete Confirmation Modal Component
function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  userName,
  isLoading,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-lg w-full max-w-md mx-4 border border-red-200 animate-in zoom-in-95">
        <div className="flex flex-col p-6">
          {/* Icon */}
          <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>

          {/* Content */}
          <div className="text-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Delete User
            </h3>
            <p className="text-sm text-gray-600">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-gray-900">"{userName}"</span>?
              This action cannot be undone and will permanently remove the user
              account and all associated data.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 border-gray-300 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={onConfirm}
              disabled={isLoading}
              className="flex-1 bg-red-600 hover:bg-red-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete User
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    authors: 0,
    admins: 0,
    readers: 0,
  });
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [editingId, setEditingId] = useState(null);
  const [editDraft, setEditDraft] = useState({
    name: "",
    email: "",
    role: "author",
    status: "active",
  });
  const [editErrors, setEditErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

  // Delete modal state
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    userId: null,
    userName: "",
    isLoading: false,
  });

  // Ref to track if initial load toast has been shown
  const initialLoadRef = useRef(false);

  // Get current user ID from token or API
  const getCurrentUserId = useCallback(async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (token) {
        return null;
      }
      return null;
    } catch (error) {
      console.error("Error getting current user ID:", error);
      return null;
    }
  }, []);

  // Validate edit form
  const validateEditForm = useCallback((draft) => {
    const errors = {};

    if (!draft.name?.trim()) {
      errors.name = "Name is required";
    }

    if (!draft.email?.trim()) {
      errors.email = "Email is required";
    } else if (!EMAIL_REGEX.test(draft.email)) {
      errors.email = "Please enter a valid email address";
    }

    if (!draft.role) {
      errors.role = "Role is required";
    }

    if (!draft.status) {
      errors.status = "Status is required";
    }

    return errors;
  }, []);

  // Fetch users from API
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("accessToken");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(
        "http://127.0.0.1:8000/api/auth/admin/users/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Unauthorized - Please check your admin permissions");
        }
        throw new Error(`Failed to fetch users: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        const transformedUsers = data.data.map((user) => ({
          id: user.id,
          name: user.fullname || user.email,
          email: user.email,
          role: user.role,
          status: user.status,
          articles: user.articles_count,
          joined: user.joined,
          is_admin: user.is_admin,
          is_active: user.is_active,
          is_author: user.is_author,
        }));

        setUsers(transformedUsers);
        setStats(data.stats);

        const currentAdmin = transformedUsers.find(
          (user) => user.role === "admin"
        );
        if (currentAdmin) {
          setCurrentUserId(currentAdmin.id);
        }

        if (!initialLoadRef.current) {
          toast.success("Users loaded successfully!", {
            position: "top-center",
          });
          initialLoadRef.current = true;
        }
      } else {
        throw new Error(data.message || "Failed to fetch users");
      }
    } catch (err) {
      setError(err.message);
      console.error("Error fetching users:", err);
      toast.error(`Failed to load users: ${err.message}`, {
        position: "top-center"
      });
    } finally {
      setLoading(false);
    }
  };

  // Update user via API
  const updateUser = async (userId, userData) => {
    try {
      setSaving(true);
      const token = localStorage.getItem("accessToken");

      const response = await fetch(
        `http://127.0.0.1:8000/api/auth/admin/users/update/${userId}/`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fullname: userData.name,
            email: userData.email,
            role: userData.role,
            status: userData.status,
          }),
        }
      );

      if (response.status === 404) {
        throw new Error("Update endpoint not implemented yet");
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to update user");
      }

      const data = await response.json();

      if (data.success) {
        toast.success("User updated successfully!", {
          position: "top-center"
        });
        await fetchUsers();
        return true;
      } else {
        throw new Error(data.message || "Failed to update user");
      }
    } catch (err) {
      const errorMessage = err.message || "Failed to update user";
      setError(errorMessage);
      console.error("Error updating user:", err);
      toast.error(`Failed to update user: ${errorMessage}`, {
        position: "top-center"
      });
      return false;
    } finally {
      setSaving(false);
    }
  };

  // Delete user via API
  const deleteUser = async (userId) => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(
        `http://127.0.0.1:8000/api/auth/admin/users/delete/${userId}/`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 404) {
        throw new Error("Delete endpoint not implemented yet");
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to delete user");
      }

      const data = await response.json();

      if (data.success) {
        toast.success("User deleted successfully!", {
          position: "top-center"
        });
        await fetchUsers();
        return true;
      } else {
        throw new Error(data.message || "Failed to delete user");
      }
    } catch (err) {
      const errorMessage = err.message || "Failed to delete user";
      setError(errorMessage);
      console.error("Error deleting user:", err);
      toast.error(`Failed to delete user: ${errorMessage}`, {
        position: "top-center"
      });
      return false;
    }
  };

  useEffect(() => {
    fetchUsers();
    getCurrentUserId();
  }, [getCurrentUserId]);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        !search ||
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase());

      const matchesRole =
        roleFilter === "all" ? true : user.role === roleFilter;

      const matchesStatus =
        statusFilter === "all" ? true : user.status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  // Delete modal functions
  const openDeleteModal = (user) => {
    // Prevent deleting own account
    if (user.id === currentUserId) {
      toast.error("You cannot delete your own account.", {
        position: "top-center"
      });
      return;
    }

    setDeleteModal({
      isOpen: true,
      userId: user.id,
      userName: user.name,
      isLoading: false,
    });
  };

  const closeDeleteModal = () => {
    setDeleteModal({
      isOpen: false,
      userId: null,
      userName: "",
      isLoading: false,
    });
  };

  const confirmDelete = async () => {
    try {
      setDeleteModal((prev) => ({ ...prev, isLoading: true }));

      const success = await deleteUser(deleteModal.userId);
      if (success) {
        closeDeleteModal();
        if (editingId === deleteModal.userId) {
          cancelEdit();
        }
      } else {
        closeDeleteModal();
      }
    } catch (err) {
      console.error("Error deleting user:", err);
      closeDeleteModal();
    }
  };

  const startEdit = (user) => {
    if (user.id === currentUserId) {
      toast.warning(
        "You cannot edit your own account from this page. Please use your profile settings.",
        {
          position: "top-center",
          duration: 5000,
        }
      );
      return;
    }

    setEditingId(user.id);
    setEditDraft({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
    });
    setEditErrors({});
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditDraft({
      name: "",
      email: "",
      role: "author",
      status: "active",
    });
    setEditErrors({});
  };

  const handleSaveEdit = async () => {
    const errors = validateEditForm(editDraft);
    if (Object.keys(errors).length > 0) {
      setEditErrors(errors);
      toast.error("Please fix the validation errors before saving.", {
        position: "top-center"
      });
      return;
    }

    if (editingId === currentUserId) {
      toast.error("Security violation: Cannot edit your own account.", {
        position: "top-center"
      });
      cancelEdit();
      return;
    }

    const success = await updateUser(editingId, editDraft);
    if (success) {
      cancelEdit();
    }
  };

  const isEditingOwnAccount = (userId) => {
    return userId === currentUserId;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-muted-foreground">Loading users...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="text-destructive">Error: {error}</div>
          <Button onClick={fetchUsers}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        userName={deleteModal.userName}
        isLoading={deleteModal.isLoading}
      />

      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            User Management
          </h1>
          <p className="text-sm text-muted-foreground">
            View and manage all users with search and filtering.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">
            <Users className="mr-1 h-3 w-3" />
            {stats.total} total
          </Badge>
          <Badge variant="outline" className="hidden sm:inline-flex">
            <Users className="mr-1 h-3 w-3" />
            {stats.active} active 
            {/* · {stats.authors}{" "}
            {stats.authors === 1 ? "author" : "authors"} · {stats.readers}{" "}
            {stats.readers === 1 ? "reader" : "readers"} */}
          </Badge>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filter & search</CardTitle>
          <CardDescription>
            Narrow down users by role, status, or name/email.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="flex-1">
              <Input
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  {roleOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Tabs defaultValue="all">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <TabsList className="w-full sm:w-auto">
                <TabsTrigger value="all" className="flex-1">
                  All users
                </TabsTrigger>
                <TabsTrigger value="authors" className="flex-1">
                  Authors ({stats.authors})
                </TabsTrigger>
                <TabsTrigger value="admins" className="flex-1">
                  Admins ({stats.admins})
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="all" className="mt-4">
              <UserTable
                users={filteredUsers}
                editingId={editingId}
                editDraft={editDraft}
                editErrors={editErrors}
                onChangeDraft={setEditDraft}
                onEdit={startEdit}
                onCancelEdit={cancelEdit}
                onSaveEdit={handleSaveEdit}
                onDelete={openDeleteModal}
                saving={saving}
                currentUserId={currentUserId}
                isEditingOwnAccount={isEditingOwnAccount}
                deleteModalLoading={deleteModal.isLoading}
              />
            </TabsContent>
            <TabsContent value="authors" className="mt-4">
              <UserTable
                users={filteredUsers.filter((u) => u.role === "author")}
                editingId={editingId}
                editDraft={editDraft}
                editErrors={editErrors}
                onChangeDraft={setEditDraft}
                onEdit={startEdit}
                onCancelEdit={cancelEdit}
                onSaveEdit={handleSaveEdit}
                onDelete={openDeleteModal}
                saving={saving}
                currentUserId={currentUserId}
                isEditingOwnAccount={isEditingOwnAccount}
                deleteModalLoading={deleteModal.isLoading}
              />
            </TabsContent>
            <TabsContent value="admins" className="mt-4">
              <UserTable
                users={filteredUsers.filter((u) => u.role === "admin")}
                editingId={editingId}
                editDraft={editDraft}
                editErrors={editErrors}
                onChangeDraft={setEditDraft}
                onEdit={startEdit}
                onCancelEdit={cancelEdit}
                onSaveEdit={handleSaveEdit}
                onDelete={openDeleteModal}
                saving={saving}
                currentUserId={currentUserId}
                isEditingOwnAccount={isEditingOwnAccount}
                deleteModalLoading={deleteModal.isLoading}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

function UserTable({
  users,
  editingId,
  editDraft,
  editErrors,
  onChangeDraft,
  onEdit,
  onCancelEdit,
  onSaveEdit,
  onDelete,
  saving,
  currentUserId,
  isEditingOwnAccount,
  deleteModalLoading,
}) {
  if (!users.length) {
    return (
      <div className="rounded-lg border border-dashed bg-muted/40 px-4 py-8 text-center text-sm text-muted-foreground">
        No users match your filters.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-left">Articles</TableHead>
          <TableHead>Joined At</TableHead>
          <TableHead className="text-center">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => {
          const isEditing = editingId === user.id;
          const isCurrentUser = user.id === currentUserId;

          return (
            <TableRow
              key={user.id}
              className={isCurrentUser ? "bg-muted/30" : ""}
            >
              <TableCell>
                {isEditing ? (
                  <div className="space-y-1">
                    <Input
                      value={editDraft.name}
                      onChange={(e) =>
                        onChangeDraft((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      disabled={saving}
                      className={editErrors.name ? "border-destructive" : ""}
                    />
                    {editErrors.name && (
                      <p className="text-xs text-destructive">
                        {editErrors.name}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{user.name}</span>
                    {isCurrentUser && (
                      <Badge variant="secondary" className="text-xs">
                        You
                      </Badge>
                    )}
                  </div>
                )}
              </TableCell>
              <TableCell>
                {isEditing ? (
                  <div className="space-y-1">
                    <Input
                      value={editDraft.email}
                      onChange={(e) =>
                        onChangeDraft((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                      disabled={saving}
                      className={editErrors.email ? "border-destructive" : ""}
                    />
                    {editErrors.email && (
                      <p className="text-xs text-destructive">
                        {editErrors.email}
                      </p>
                    )}
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">
                    {user.email}
                  </span>
                )}
              </TableCell>
              <TableCell>
                {isEditing ? (
                  <div className="space-y-1">
                    <Select
                      value={editDraft.role}
                      onValueChange={(value) =>
                        onChangeDraft((prev) => ({
                          ...prev,
                          role: value,
                        }))
                      }
                      disabled={saving}
                    >
                      <SelectTrigger
                        className={`w-[100px] ${
                          editErrors.role ? "border-destructive" : ""
                        }`}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="author">Author</SelectItem>
                        <SelectItem value="reader">Reader</SelectItem>
                      </SelectContent>
                    </Select>
                    {editErrors.role && (
                      <p className="text-xs text-destructive">
                        {editErrors.role}
                      </p>
                    )}
                  </div>
                ) : (
                  <Badge
                    variant={
                      user.role === "admin"
                        ? "default"
                        : user.role === "author"
                        ? "secondary"
                        : "outline"
                    }
                    className="text-[11px]"
                  >
                    {user.role}
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                {isEditing ? (
                  <div className="space-y-1">
                    <Select
                      value={editDraft.status}
                      onValueChange={(value) =>
                        onChangeDraft((prev) => ({
                          ...prev,
                          status: value,
                        }))
                      }
                      disabled={saving}
                    >
                      <SelectTrigger
                        className={`w-[100px] ${
                          editErrors.status ? "border-destructive" : ""
                        }`}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                      </SelectContent>
                    </Select>
                    {editErrors.status && (
                      <p className="text-xs text-destructive">
                        {editErrors.status}
                      </p>
                    )}
                  </div>
                ) : (
                  <Badge
                    variant={
                      user.status === "active" ? "outline" : "destructive"
                    }
                    className="text-[11px]"
                  >
                    {user.status}
                  </Badge>
                )}
              </TableCell>
              <TableCell className="text-left">{user.articles}</TableCell>
              <TableCell>
                <span className="text-xs text-muted-foreground">
                  {user.joined}
                </span>
              </TableCell>
              <TableCell className="space-x-1 text-center">
                {isEditing ? (
                  <>
                    <Button
                      size="icon-sm"
                      variant="outline"
                      className="mr-1"
                      type="button"
                      onClick={onSaveEdit}
                      disabled={saving}
                    >
                      {saving ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        "✓"
                      )}
                    </Button>
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      type="button"
                      onClick={onCancelEdit}
                      disabled={saving}
                    >
                      ✕
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      type="button"
                      onClick={() => onEdit(user)}
                      disabled={isCurrentUser || deleteModalLoading}
                      title={
                        isCurrentUser
                          ? "Edit your own account in profile settings"
                          : "Edit user"
                      }
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      type="button"
                      onClick={() => onDelete(user)}
                      disabled={isCurrentUser || deleteModalLoading}
                      title={
                        isCurrentUser
                          ? "Cannot delete your own account"
                          : "Delete user"
                      }
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </>
                )}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
