import Types "../types/runs";
import RunsLib "../lib/runs";
import List "mo:core/List";
import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";

mixin (
  runs : List.List<RunsLib.Run>,
  userNames : Map.Map<Principal, Text>,
) {
  /// Save a new run and return its unique slug.
  /// Caller must be authenticated (non-anonymous).
  public shared ({ caller }) func saveRun(req : Types.SaveRunRequest) : async Text {
    if (caller.isAnonymous()) {
      Runtime.trap("Authentication required");
    };
    let nextId = runs.size();
    let (_, slug) = RunsLib.saveRun(runs, nextId, caller, req);
    slug;
  };

  /// Get all shared runs sorted by date, newest first.
  public query func getAllRuns() : async [Types.Run] {
    RunsLib.getAllRunsSortedByDate(runs);
  };

  /// Get a single run by its shareable slug.
  public query func getRunBySlug(slug : Text) : async ?Types.Run {
    RunsLib.getRunBySlug(runs, slug);
  };

  /// Get all runs belonging to a specific user principal.
  public query func getRunsByUser(userId : Principal) : async [Types.Run] {
    RunsLib.getRunsByUser(runs, userId);
  };

  /// Get all runs for the calling user.
  public shared query ({ caller }) func getMyRuns() : async [Types.Run] {
    RunsLib.getRunsByUser(runs, caller);
  };

  /// Save or update a display name for the calling principal.
  /// Caller must be authenticated (non-anonymous).
  public shared ({ caller }) func setUserName(name : Text) : async () {
    if (caller.isAnonymous()) {
      Runtime.trap("Authentication required");
    };
    userNames.add(caller, name);
  };

  /// Get the display name for a given principal, if set.
  public query func getUser(userId : Principal) : async ?Text {
    userNames.get(userId);
  };
};
