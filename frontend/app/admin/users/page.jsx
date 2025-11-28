"use client";

import { useMemo, useState, useEffect } from "react";
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
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Users, Plus, Filter, Trash2, Edit2, Loader2 } from "lucide-react";

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

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    authors: 0,
    admins: 0
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
  const [saving, setSaving] = useState(false);

  // Fetch users from API
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('http://127.0.0.1:8000/api/auth/admin/users/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized - Please check your admin permissions');
        }
        throw new Error(`Failed to fetch users: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Transform the API data to match your frontend structure
        const transformedUsers = data.data.map(user => ({
          id: user.id,
          name: user.fullname || user.email,
          email: user.email,
          role: user.role,
          status: user.status,
          articles: user.articles_count,
          joined: user.joined,
          is_staff: user.is_staff,
          is_active: user.is_active,
          is_author: user.is_author
        }));
        
        setUsers(transformedUsers);
        setStats(data.stats);
      } else {
        throw new Error(data.message || 'Failed to fetch users');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  // Update user via API
  const updateUser = async (userId, userData) => {
    try {
      setSaving(true);
      const token = localStorage.getItem('access_token');
      
      const response = await fetch(`http://127.0.0.1:8000/api/auth/admin/users/${userId}/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullname: userData.name,
          email: userData.email,
          is_staff: userData.role === 'admin',
          is_active: userData.status === 'active'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update user');
      }

      const data = await response.json();
      
      if (data.success) {
        // Refresh the user list
        await fetchUsers();
        return true;
      } else {
        throw new Error(data.message || 'Failed to update user');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error updating user:', err);
      return false;
    } finally {
      setSaving(false);
    }
  };

  // Delete user via API
  const deleteUser = async (userId) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://127.0.0.1:8000/api/auth/admin/users/${userId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }

      // Refresh the user list
      await fetchUsers();
      return true;
    } catch (err) {
      setError(err.message);
      console.error('Error deleting user:', err);
      return false;
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

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

  const startEdit = (user) => {
    setEditingId(user.id);
    setEditDraft({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditDraft({
      name: "",
      email: "",
      role: "author",
      status: "active",
    });
  };

  const handleSaveEdit = async () => {
    const success = await updateUser(editingId, editDraft);
    if (success) {
      cancelEdit();
    }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      await deleteUser(id);
      if (editingId === id) {
        cancelEdit();
      }
    }
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
            {stats.active} active · {stats.authors} authors
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
                  {roleOptions.map(option => (
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
                  {statusOptions.map(option => (
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
                  Authors
                </TabsTrigger>
                <TabsTrigger value="admins" className="flex-1">
                  Admins
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="all" className="mt-4">
              <UserTable
                users={filteredUsers}
                editingId={editingId}
                editDraft={editDraft}
                onChangeDraft={setEditDraft}
                onEdit={startEdit}
                onCancelEdit={cancelEdit}
                onSaveEdit={handleSaveEdit}
                onDelete={handleDeleteUser}
                saving={saving}
              />
            </TabsContent>
            <TabsContent value="authors" className="mt-4">
              <UserTable
                users={filteredUsers.filter((u) => u.role === "author")}
                editingId={editingId}
                editDraft={editDraft}
                onChangeDraft={setEditDraft}
                onEdit={startEdit}
                onCancelEdit={cancelEdit}
                onSaveEdit={handleSaveEdit}
                onDelete={handleDeleteUser}
                saving={saving}
              />
            </TabsContent>
            <TabsContent value="admins" className="mt-4">
              <UserTable
                users={filteredUsers.filter((u) => u.role === "admin")}
                editingId={editingId}
                editDraft={editDraft}
                onChangeDraft={setEditDraft}
                onEdit={startEdit}
                onCancelEdit={cancelEdit}
                onSaveEdit={handleSaveEdit}
                onDelete={handleDeleteUser}
                saving={saving}
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
  onChangeDraft,
  onEdit,
  onCancelEdit,
  onSaveEdit,
  onDelete,
  saving,
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
          <TableHead>Articles</TableHead>
          <TableHead>Joined</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => {
          const isEditing = editingId === user.id;
          return (
            <TableRow key={user.id}>
              <TableCell>
                {isEditing ? (
                  <Input
                    value={editDraft.name}
                    onChange={(e) =>
                      onChangeDraft((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    disabled={saving}
                  />
                ) : (
                  <span className="font-medium">{user.name}</span>
                )}
              </TableCell>
              <TableCell>
                {isEditing ? (
                  <Input
                    value={editDraft.email}
                    onChange={(e) =>
                      onChangeDraft((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    disabled={saving}
                  />
                ) : (
                  <span className="text-xs text-muted-foreground">
                    {user.email}
                  </span>
                )}
              </TableCell>
              <TableCell>
                {isEditing ? (
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
                    <SelectTrigger className="w-[100px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="author">Author</SelectItem>
                      <SelectItem value="reader">Reader</SelectItem>
                    </SelectContent>
                  </Select>
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
                    <SelectTrigger className="w-[100px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
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
              <TableCell>{user.articles}</TableCell>
              <TableCell>
                <span className="text-xs text-muted-foreground">
                  {user.joined}
                </span>
              </TableCell>
              <TableCell className="space-x-1 text-right">
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
                      {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : "✓"}
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
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      type="button"
                      onClick={() => onDelete(user.id)}
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