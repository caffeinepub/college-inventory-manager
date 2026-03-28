import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface InventoryItem {
    id: bigint;
    lowStockThreshold: bigint;
    purchaseDate: Time;
    supplier: string;
    cost: number;
    name: string;
    unit: string;
    quantity: bigint;
    category: Category;
    location: string;
}
export type Time = bigint;
export interface ItemRequest {
    id: bigint;
    status: RequestStatus;
    itemId: bigint;
    createdAt: Time;
    notes: string;
    quantity: bigint;
    department: string;
    requestedBy: Principal;
    resolvedAt?: Time;
    resolvedBy?: Principal;
    reason: string;
}
export interface CategorySummary {
    itemCount: bigint;
    category: Category;
    totalQuantity: bigint;
}
export interface UserProfile {
    name: string;
    department: string;
}
export interface IssueRecord {
    id: bigint;
    itemId: bigint;
    notes: string;
    quantity: bigint;
    issuedAt: Time;
    issuedBy: Principal;
    issuedTo: string;
    department: string;
}
export enum Category {
    housekeeping = "housekeeping",
    plumbing = "plumbing",
    electrical = "electrical",
    carpentry = "carpentry"
}
export enum RequestStatus {
    pending = "pending",
    approved = "approved",
    rejected = "rejected"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    approveRequest(requestId: bigint, notes: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createInventoryItem(item: InventoryItem): Promise<bigint>;
    deleteInventoryItem(id: bigint): Promise<void>;
    getAllInventoryItems(): Promise<Array<InventoryItem>>;
    getAllIssueRecords(): Promise<Array<IssueRecord>>;
    getAllItemRequests(): Promise<Array<ItemRequest>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCategorySummary(): Promise<Array<CategorySummary>>;
    getInventoryItem(id: bigint): Promise<InventoryItem | null>;
    getIssueRecordsByItem(itemId: bigint): Promise<Array<IssueRecord>>;
    getItemsByCategory(category: Category): Promise<Array<InventoryItem>>;
    getLowStockItems(): Promise<Array<InventoryItem>>;
    getPendingRequests(): Promise<Array<ItemRequest>>;
    getRequestsByUser(user: Principal): Promise<Array<ItemRequest>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    issueItem(itemId: bigint, issuedTo: string, department: string, quantity: bigint, notes: string): Promise<bigint>;
    rejectRequest(requestId: bigint, notes: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    submitItemRequest(itemId: bigint, department: string, quantity: bigint, reason: string): Promise<bigint>;
    updateInventoryItem(id: bigint, item: InventoryItem): Promise<void>;
}
