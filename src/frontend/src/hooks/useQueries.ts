import type { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Category,
  type InventoryItem,
  type UserProfile,
  UserRole,
} from "../backend.d";
import { useActor } from "./useActor";

export { Category, UserRole };

export function useAllInventoryItems() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["inventory"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllInventoryItems();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useLowStockItems() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["lowStock"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getLowStockItems();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCategorySummary() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["categorySummary"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCategorySummary();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCallerRole() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["callerRole"],
    queryFn: async () => {
      if (!actor) return UserRole.guest;
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCallerProfile() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["callerProfile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAllRequests() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["allRequests"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllItemRequests();
    },
    enabled: !!actor && !isFetching,
  });
}

export function usePendingRequests() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["pendingRequests"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPendingRequests();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAllIssueRecords() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["issueRecords"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllIssueRecords();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSaveProfile() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("No actor");
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["callerProfile"] }),
  });
}

export function useCreateItem() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (item: InventoryItem) => {
      if (!actor) throw new Error("No actor");
      return actor.createInventoryItem(item);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["inventory"] });
      qc.invalidateQueries({ queryKey: ["categorySummary"] });
      qc.invalidateQueries({ queryKey: ["lowStock"] });
    },
  });
}

export function useUpdateItem() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, item }: { id: bigint; item: InventoryItem }) => {
      if (!actor) throw new Error("No actor");
      return actor.updateInventoryItem(id, item);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["inventory"] });
      qc.invalidateQueries({ queryKey: ["categorySummary"] });
      qc.invalidateQueries({ queryKey: ["lowStock"] });
    },
  });
}

export function useDeleteItem() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("No actor");
      return actor.deleteInventoryItem(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["inventory"] });
      qc.invalidateQueries({ queryKey: ["categorySummary"] });
      qc.invalidateQueries({ queryKey: ["lowStock"] });
    },
  });
}

export function useIssueItem() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      itemId,
      issuedTo,
      department,
      quantity,
      notes,
    }: {
      itemId: bigint;
      issuedTo: string;
      department: string;
      quantity: bigint;
      notes: string;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.issueItem(itemId, issuedTo, department, quantity, notes);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["inventory"] });
      qc.invalidateQueries({ queryKey: ["issueRecords"] });
      qc.invalidateQueries({ queryKey: ["lowStock"] });
    },
  });
}

export function useSubmitRequest() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      itemId,
      department,
      quantity,
      reason,
    }: {
      itemId: bigint;
      department: string;
      quantity: bigint;
      reason: string;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.submitItemRequest(itemId, department, quantity, reason);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["allRequests"] }),
  });
}

export function useApproveRequest() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, notes }: { id: bigint; notes: string }) => {
      if (!actor) throw new Error("No actor");
      return actor.approveRequest(id, notes);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["allRequests"] });
      qc.invalidateQueries({ queryKey: ["pendingRequests"] });
      qc.invalidateQueries({ queryKey: ["inventory"] });
    },
  });
}

export function useRejectRequest() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, notes }: { id: bigint; notes: string }) => {
      if (!actor) throw new Error("No actor");
      return actor.rejectRequest(id, notes);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["allRequests"] });
      qc.invalidateQueries({ queryKey: ["pendingRequests"] });
    },
  });
}

export function useAssignRole() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ user, role }: { user: Principal; role: UserRole }) => {
      if (!actor) throw new Error("No actor");
      return actor.assignCallerUserRole(user, role);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["isAdmin"] });
      qc.invalidateQueries({ queryKey: ["callerRole"] });
    },
  });
}
