"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, UserPlus, Loader2, Shield, Ban, KeyRound, Trash2 } from "lucide-react";
import { toast } from "sonner";

import type { PaginationResponse } from "@/@types";
import { authClient } from "@/lib/auth-client";
import { fetcher } from "@/lib/fetcher";
import { PageHeader } from "@/components/dashboard/page-header";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";

type UserWithRole = {
  id: string;
  name: string;
  email: string;
  phoneNumber: string | null;
  nationalId: string | null;
  image?: string | null;
  role: string;
  banned: boolean | null;
  banReason: string | null;
  createdAt: string | Date;
};

const roleBadgeVariant: Record<string, string> = {
  admin: "bg-purple-100 text-purple-700",
  landlord: "bg-blue-100 text-blue-700",
  tenant: "bg-green-100 text-green-700",
};

function CreateUserDialog() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const result = await authClient.admin.createUser({
        name: formData.get("name") as string,
        email: formData.get("email") as string,
        password: formData.get("password") as string,
        role: formData.get("role") as "admin" | "user",
        data: {
          phoneNumber: formData.get("phoneNumber") as string,
        },
      });
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: () => {
      toast.success("User created");
      setOpen(false);
      void queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (error: Error) => {
      toast.error(error.message ?? "Failed to create user");
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <UserPlus className="size-4" />
          Create User
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New User</DialogTitle>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            createMutation.mutate(new FormData(e.currentTarget));
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" required placeholder="Enter names" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required placeholder="Enter email" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input id="phoneNumber" name="phoneNumber" required placeholder="Enter phone number" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              placeholder="Enter temporary password"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <select
              id="role"
              name="role"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
              defaultValue="tenant"
            >
              <option value="tenant">Tenant</option>
              <option value="landlord">Landlord</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <Button type="submit" className="w-full" disabled={createMutation.isPending}>
            {createMutation.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
            Create User
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function SetPasswordDialog({ userId, userName }: { userId: string; userName: string }) {
  const [open, setOpen] = useState(false);

  const mutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const result = await authClient.admin.setUserPassword({
        userId,
        newPassword: formData.get("password") as string,
      });
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: () => {
      toast.success("Password updated");
      setOpen(false);
    },
    onError: (error: Error) => {
      toast.error(error.message ?? "Failed to set password");
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <DropdownMenuItem className="px-0" onSelect={(e) => e.preventDefault()}>
          <KeyRound className="mr-1 size-4" />
          Set Password
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Set Password for {userName}</DialogTitle>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate(new FormData(e.currentTarget));
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="password">New Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Enter new password"
              required
              minLength={5}
            />
          </div>
          <Button type="submit" className="w-full" disabled={mutation.isPending}>
            {mutation.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
            Update Password
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function UserActions({ user }: { user: UserWithRole }) {
  const queryClient = useQueryClient();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const setRoleMutation = useMutation({
    mutationFn: async (role: string) => {
      const result = await authClient.admin.setRole({
        userId: user.id,
        role: role as "admin" | "user",
      });
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: () => {
      toast.success("Role updated");
      void queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (error: Error) => {
      toast.error(error.message ?? "Failed to update role");
    },
  });

  const banMutation = useMutation({
    mutationFn: async () => {
      const result = user.banned
        ? await authClient.admin.unbanUser({ userId: user.id })
        : await authClient.admin.banUser({ userId: user.id });
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: () => {
      toast.success(user.banned ? "User unbanned" : "User banned");
      void queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (error: Error) => {
      toast.error(error.message ?? "Failed to update ban status");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const result = await authClient.admin.removeUser({ userId: user.id });
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: () => {
      toast.success("User deleted");
      setDeleteOpen(false);
      void queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (error: Error) => {
      toast.error(error.message ?? "Failed to delete user");
    },
  });

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="size-8">
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem
            disabled={setRoleMutation.isPending}
            onSelect={() => setRoleMutation.mutate(user.role === "admin" ? "tenant" : "admin")}
            className="px-1 py-2"
          >
            <Shield className="mr-1 size-4" />
            {user.role === "admin" ? "Remove Admin" : "Make Admin"}
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={setRoleMutation.isPending}
            onSelect={() =>
              setRoleMutation.mutate(user.role === "landlord" ? "tenant" : "landlord")
            }
            className="px-0 py-1"
          >
            <Shield className="size-4" />
            {user.role === "landlord" ? "Set as Tenant" : "Set as Landlord"}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <SetPasswordDialog userId={user.id} userName={user.name} />
          <DropdownMenuSeparator />
          <DropdownMenuItem disabled={banMutation.isPending} onSelect={() => banMutation.mutate()}>
            <Ban className="mr-2 size-4" />
            {user.banned ? "Unban User" : "Ban User"}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-destructive" onSelect={() => setDeleteOpen(true)}>
            <Trash2 className="mr-2 size-4" />
            Delete User
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {user.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the user and all their data. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
              onClick={() => deleteMutation.mutate()}
            >
              {deleteMutation.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

const columns: ColumnDef<UserWithRole>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <div className="flex size-8 items-center justify-center rounded-full bg-muted text-xs font-medium">
          {row.original.name?.charAt(0)?.toUpperCase() ?? "?"}
        </div>
        <div className="flex flex-col gap-1">
          <span className="font-medium">{row.original.name}</span>
          <span className="text-muted-foreground">{row.original.email}</span>
          <span className="text-muted-foreground">{row.original.phoneNumber}</span>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "nationalId",
    header: "ID Number",
    cell: ({ row }) => (
      <span className="text-muted-foreground">{row.original.nationalId ?? "—"}</span>
    ),
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => (
      <Badge variant="secondary" className={roleBadgeVariant[row.original.role] ?? ""}>
        {row.original.role}
      </Badge>
    ),
  },
  {
    id: "status",
    header: "Status",
    cell: ({ row }) =>
      row.original.banned ? (
        <Badge variant="destructive" className="text-xs">
          Banned
        </Badge>
      ) : (
        <span className="text-xs text-muted-foreground">Active</span>
      ),
  },
  {
    accessorKey: "createdAt",
    header: "Joined",
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {new Date(row.original.createdAt).toLocaleDateString()}
      </span>
    ),
  },
  {
    id: "actions",
    header: "",
    enableSorting: false,
    size: 48,
    cell: ({ row }) => <UserActions user={row.original} />,
  },
];

export default function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const limit = 20;

  const usersQuery = useQuery<PaginationResponse<UserWithRole>>({
    queryKey: ["admin-users", search, roleFilter, page],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (search) params.set("search", search);
      if (roleFilter !== "all") params.set("role", roleFilter);
      return fetcher(`/admin/users?${params}`);
    },
  });

  const users = usersQuery.data?.data ?? [];
  const meta = usersQuery.data?.meta;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader
        title="Users"
        description={`${meta?.total ?? 0} total users`}
        actions={<CreateUserDialog />}
      />

      <DataTable
        columns={columns}
        data={users}
        loading={usersQuery.isLoading}
        search={{
          placeholder: "Search users...",
          value: search,
          onChange: (value) => {
            setSearch(value);
            setPage(1);
          },
        }}
        filterBy={[
          {
            id: "role",
            placeholder: "All Roles",
            value: roleFilter,
            onChange: (value) => {
              setRoleFilter(value);
              setPage(1);
            },
            options: [
              { label: "Tenant", value: "tenant" },
              { label: "Landlord", value: "landlord" },
              { label: "Admin", value: "admin" },
            ],
          },
        ]}
        pagination={{
          page,
          totalPages: meta?.totalPages ?? 1,
          onPageChange: setPage,
        }}
      />
    </div>
  );
}
