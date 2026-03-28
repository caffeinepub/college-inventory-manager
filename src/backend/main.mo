import Map "mo:core/Map";
import Array "mo:core/Array";
import Time "mo:core/Time";
import Iter "mo:core/Iter";
import Text "mo:core/Text";
import Order "mo:core/Order";
import Int "mo:core/Int";
import Runtime "mo:core/Runtime";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import List "mo:core/List";
import Float "mo:core/Float";
import Set "mo:core/Set";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  type Category = {
    #electrical;
    #plumbing;
    #carpentry;
    #housekeeping;
  };

  type InventoryItem = {
    id : Nat;
    name : Text;
    category : Category;
    quantity : Nat;
    unit : Text;
    location : Text;
    supplier : Text;
    purchaseDate : Time.Time;
    cost : Float;
    lowStockThreshold : Nat;
  };

  type IssueRecord = {
    id : Nat;
    itemId : Nat;
    issuedTo : Text;
    department : Text;
    quantity : Nat;
    issuedAt : Time.Time;
    issuedBy : Principal;
    notes : Text;
  };

  type RequestStatus = {
    #pending;
    #approved;
    #rejected;
  };

  type ItemRequest = {
    id : Nat;
    itemId : Nat;
    requestedBy : Principal;
    department : Text;
    quantity : Nat;
    reason : Text;
    status : RequestStatus;
    createdAt : Time.Time;
    resolvedAt : ?Time.Time;
    resolvedBy : ?Principal;
    notes : Text;
  };

  type CategorySummary = {
    category : Category;
    itemCount : Nat;
    totalQuantity : Nat;
  };

  public type UserProfile = {
    name : Text;
    department : Text;
  };

  var nextItemId = 1;
  var nextIssueId = 1;
  var nextRequestId = 1;

  let inventoryItems = Map.empty<Nat, InventoryItem>();
  let issueRecords = Map.empty<Nat, IssueRecord>();
  let itemRequests = Map.empty<Nat, ItemRequest>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  module Category {
    public func compare(a : Category, b : Category) : Order.Order {
      func toNat(c : Category) : Nat {
        switch (c) {
          case (#electrical) { 0 };
          case (#plumbing) { 1 };
          case (#carpentry) { 2 };
          case (#housekeeping) { 3 };
        };
      };
      Nat.compare(toNat(a), toNat(b));
    };

    public func toText(cat : Category) : Text {
      switch (cat) {
        case (#electrical) { "Electrical" };
        case (#plumbing) { "Plumbing" };
        case (#carpentry) { "Carpentry" };
        case (#housekeeping) { "Housekeeping" };
      };
    };
  };

  // User Profile Management

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    // Allow any non-anonymous caller, even if not yet registered
    if (caller.isAnonymous()) {
      return null;
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Anonymous users cannot save profiles");
    };
    // Auto-register caller as user if not yet registered
    switch (accessControlState.userRoles.get(caller)) {
      case (null) {
        accessControlState.userRoles.add(caller, #user);
      };
      case (?_) {};
    };
    userProfiles.add(caller, profile);
  };

  // Inventory CRUD (Admin only)

  public shared ({ caller }) func createInventoryItem(item : InventoryItem) : async Nat {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can create inventory items");
    };
    let newItem = { item with id = nextItemId };
    inventoryItems.add(nextItemId, newItem);
    nextItemId += 1;
    newItem.id;
  };

  public shared ({ caller }) func updateInventoryItem(id : Nat, item : InventoryItem) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can update inventory items");
    };
    if (not (inventoryItems.containsKey(id))) {
      Runtime.trap("Item not found");
    };
    let updatedItem = { item with id };
    inventoryItems.add(id, updatedItem);
  };

  public shared ({ caller }) func deleteInventoryItem(id : Nat) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can delete inventory items");
    };
    if (not (inventoryItems.containsKey(id))) {
      Runtime.trap("Item not found");
    };
    inventoryItems.remove(id);
  };

  public query ({ caller }) func getInventoryItem(id : Nat) : async ?InventoryItem {
    inventoryItems.get(id);
  };

  public query ({ caller }) func getAllInventoryItems() : async [InventoryItem] {
    inventoryItems.values().toArray();
  };

  // Inventory Queries

  public query ({ caller }) func getItemsByCategory(category : Category) : async [InventoryItem] {
    inventoryItems.values().toArray().filter(func(item) { item.category == category });
  };

  public query ({ caller }) func getLowStockItems() : async [InventoryItem] {
    inventoryItems.values().toArray().filter(
      func(item) {
        item.quantity <= item.lowStockThreshold;
      }
    );
  };

  // Issue Items (Admin only)

  public shared ({ caller }) func issueItem(
    itemId : Nat,
    issuedTo : Text,
    department : Text,
    quantity : Nat,
    notes : Text
  ) : async Nat {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can issue items");
    };

    let ?item = inventoryItems.get(itemId) else {
      Runtime.trap("Item not found");
    };

    if (item.quantity < quantity) {
      Runtime.trap("Insufficient quantity available");
    };

    let issueRecord : IssueRecord = {
      id = nextIssueId;
      itemId;
      issuedTo;
      department;
      quantity;
      issuedAt = Time.now();
      issuedBy = caller;
      notes;
    };
    issueRecords.add(nextIssueId, issueRecord);
    nextIssueId += 1;

    let updatedItem = {
      item with quantity = item.quantity - quantity;
    };
    inventoryItems.add(itemId, updatedItem);

    issueRecord.id;
  };

  // Issue Record Queries (Admin only)

  public query ({ caller }) func getAllIssueRecords() : async [IssueRecord] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view all issue records");
    };
    issueRecords.values().toArray();
  };

  public query ({ caller }) func getIssueRecordsByItem(itemId : Nat) : async [IssueRecord] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view issue records");
    };
    issueRecords.values().toArray().filter(func(record) { record.itemId == itemId });
  };

  // Item Requests (Staff/User can create, Admin can manage)

  public shared ({ caller }) func submitItemRequest(
    itemId : Nat,
    department : Text,
    quantity : Nat,
    reason : Text
  ) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can submit item requests");
    };

    let ?item = inventoryItems.get(itemId) else {
      Runtime.trap("Item not found");
    };

    let request : ItemRequest = {
      id = nextRequestId;
      itemId;
      requestedBy = caller;
      department;
      quantity;
      reason;
      status = #pending;
      createdAt = Time.now();
      resolvedAt = null;
      resolvedBy = null;
      notes = "";
    };
    itemRequests.add(nextRequestId, request);
    nextRequestId += 1;

    request.id;
  };

  public shared ({ caller }) func approveRequest(requestId : Nat, notes : Text) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can approve requests");
    };

    let ?request = itemRequests.get(requestId) else {
      Runtime.trap("Request not found");
    };

    switch (request.status) {
      case (#pending) {};
      case (_) {
        Runtime.trap("Request already resolved");
      };
    };

    let ?item = inventoryItems.get(request.itemId) else {
      Runtime.trap("Item not found");
    };

    if (item.quantity < request.quantity) {
      Runtime.trap("Insufficient quantity available");
    };

    let updatedRequest = {
      request with
      status = #approved;
      resolvedAt = ?Time.now();
      resolvedBy = ?caller;
      notes;
    };
    itemRequests.add(requestId, updatedRequest);

    let updatedItem = {
      item with quantity = item.quantity - request.quantity;
    };
    inventoryItems.add(request.itemId, updatedItem);
  };

  public shared ({ caller }) func rejectRequest(requestId : Nat, notes : Text) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can reject requests");
    };

    let ?request = itemRequests.get(requestId) else {
      Runtime.trap("Request not found");
    };

    switch (request.status) {
      case (#pending) {};
      case (_) {
        Runtime.trap("Request already resolved");
      };
    };

    let updatedRequest = {
      request with
      status = #rejected;
      resolvedAt = ?Time.now();
      resolvedBy = ?caller;
      notes;
    };
    itemRequests.add(requestId, updatedRequest);
  };

  // Item Request Queries

  public query ({ caller }) func getAllItemRequests() : async [ItemRequest] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view all requests");
    };
    itemRequests.values().toArray();
  };

  public query ({ caller }) func getPendingRequests() : async [ItemRequest] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view pending requests");
    };
    itemRequests.values().toArray().filter(
      func(request) {
        switch (request.status) {
          case (#pending) { true };
          case (_) { false };
        };
      }
    );
  };

  public query ({ caller }) func getRequestsByUser(user : Principal) : async [ItemRequest] {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own requests");
    };
    itemRequests.values().toArray().filter(func(request) { request.requestedBy == user });
  };

  // Reports

  public query ({ caller }) func getCategorySummary() : async [CategorySummary] {
    let categories = Set.empty<Category>();
    inventoryItems.values().forEach(func(item) { categories.add(item.category) });

    let summaries = categories.toArray().map(
      func(cat) {
        let items = inventoryItems.values().toArray().filter(func(item) { item.category == cat });
        let itemCount = items.size();
        let totalQuantity = items.foldLeft(
          0,
          func(acc, item) { acc + item.quantity },
        );
        {
          category = cat;
          itemCount;
          totalQuantity;
        };
      }
    );
    summaries;
  };
};
