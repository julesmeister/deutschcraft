"use client";

import { useState } from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { RoleStatsSection } from "@/components/teacher/RoleStatsSection";
import { RoleUsersTable } from "@/components/teacher/RoleUsersTable";
import { useFirebaseAuth } from "@/lib/hooks/useFirebaseAuth";
import { useUsersPaginated, useUserStats } from "@/lib/hooks/useUsers";
import { updateUser } from "@/lib/services/user";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/toast";
import { UserRole, User } from "@/lib/models/user";

export default function RoleManagementPage() {
  const { session } = useFirebaseAuth();
  const toast = useToast();
  const [roleFilter, setRoleFilter] = useState<"all" | "STUDENT" | "TEACHER">(
    "all"
  );
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  // Use optimized paginated hook with server-side pagination
  const {
    users: allUsers,
    isLoading,
    refetch,
    page: currentPage,
    totalPages,
    totalCount,
    goToPage,
  } = useUsersPaginated({
    pageSize: 50, // Fetch 50 users per page from server
    roleFilter,
  });

  // Fetch accurate stats
  const { stats: userStats } = useUserStats();

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    if (!session?.user?.email) {
      toast.error("You must be logged in to change roles");
      return;
    }

    // Prevent self-demotion
    if (userId === session.user.email && newRole !== "TEACHER") {
      toast.error("You cannot change your own role");
      return;
    }

    try {
      setUpdatingUserId(userId);

      const updates: Partial<User> = { role: newRole };

      // Update enrollment status based on role change
      if (newRole === "STUDENT" || newRole === "TEACHER") {
        updates.enrollmentStatus = "approved";
      } else if (newRole === "PENDING_APPROVAL") {
        updates.enrollmentStatus = "pending";
      }

      await updateUser(userId, updates);
      await refetch();
      toast.success(`Role updated to ${newRole}`);
    } catch (error) {
      console.error("[handleRoleChange] Error:", error);
      toast.error("Failed to update role");
    } finally {
      setUpdatingUserId(null);
    }
  };

  if (!session?.user?.email) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center bg-white border border-red-200 rounded-2xl p-8 max-w-md">
          <EmptyState
            icon="🔒"
            title="Authentication Required"
            description="Please sign in to manage user roles."
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader
        title="Role Management 👑"
        subtitle="Manage user roles and permissions"
      />

      <div className="container mx-auto px-6 py-8">
        {/* Stats Overview */}
        <RoleStatsSection
          totalUsers={userStats.totalUsers}
          students={userStats.students}
          teachers={userStats.teachers}
          pending={userStats.pending}
        />

        {/* Users Table */}
        <RoleUsersTable
          users={allUsers}
          isLoading={isLoading}
          currentUserEmail={session.user.email}
          onRoleChange={handleRoleChange}
          updatingUserId={updatingUserId}
          currentPage={currentPage}
          totalPages={totalPages}
          totalCount={totalCount}
          onPageChange={goToPage}
          roleFilter={roleFilter}
          onRoleFilterChange={setRoleFilter}
        />
      </div>
    </div>
  );
}
