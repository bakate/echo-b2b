"use client";
import { Button } from "@workspace/ui/components/button";
import { useMutation, useQuery } from "convex/react";
import { OrganizationSwitcher, UserButton } from "@clerk/nextjs";
import { api } from "@workspace/backend/_generated/api";

export default function Page() {
  const users = useQuery(api.users.getAllUsers);
  const addUser = useMutation(api.users.addUser);

  return (
    <div className="flex items-center justify-center min-h-svh">
      <div className="flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Hello World from app/web</h1>
        <Button size="sm">Button</Button>
        <ul>{users?.map((user) => <li key={user._id}>{user.name}</li>)}</ul>

        <Button onClick={() => addUser()}>Add User</Button>
        <UserButton />

        <OrganizationSwitcher hidePersonal />
      </div>
    </div>
  );
}
