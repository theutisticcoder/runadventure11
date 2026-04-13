import Types "../types/runs";
import List "mo:core/List";
import Array "mo:core/Array";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Order "mo:core/Order";
import Principal "mo:core/Principal";

module {
  public type Run = Types.Run;
  public type Chapter = Types.Chapter;
  public type GpsCoord = Types.GpsCoord;
  public type SaveRunRequest = Types.SaveRunRequest;

  /// Keep only alphanumeric ASCII characters and lowercase them.
  func slugifyWord(word : Text) : Text {
    let lower = word.toLower();
    var result = "";
    for (c in lower.toIter()) {
      let isLower = c >= 'a' and c <= 'z';
      let isDigit = c >= '0' and c <= '9';
      if (isLower or isDigit) {
        result #= Text.fromChar(c);
      };
    };
    result;
  };

  /// Generate a slug like "42-the-dragons-path" from id + first 3 words of title.
  public func generateSlug(id : Nat, title : Text) : Text {
    let words = title.split(#char ' ');
    var parts : [Text] = [];
    var count = 0;
    label collect for (w in words) {
      if (count >= 3) break collect;
      let part = slugifyWord(w);
      if (part.size() > 0) {
        parts := parts.concat([part]);
        count += 1;
      };
    };
    let idText = id.toText();
    if (parts.size() == 0) {
      idText;
    } else {
      let joined = parts.values().join("-");
      idText # "-" # joined;
    };
  };

  /// Save a new run into the list, returning (run, slug).
  public func saveRun(
    runs : List.List<Run>,
    nextId : Nat,
    caller : Principal,
    req : SaveRunRequest,
  ) : (Run, Text) {
    let slug = generateSlug(nextId, req.title);
    let run : Run = {
      id = nextId;
      slug = slug;
      title = req.title;
      genre = req.genre;
      chapters = req.chapters;
      choices = req.choices;
      gpsRoute = req.gpsRoute;
      startTime = req.startTime;
      endTime = req.endTime;
      totalDistance = req.totalDistance;
      userId = caller;
      userName = req.userName;
    };
    runs.add(run);
    (run, slug);
  };

  /// Find a run by its slug (returns null if not found).
  public func getRunBySlug(runs : List.List<Run>, slug : Text) : ?Run {
    runs.find(func(r : Run) : Bool { r.slug == slug });
  };

  /// Get all runs belonging to the given principal.
  public func getRunsByUser(runs : List.List<Run>, userId : Principal) : [Run] {
    runs.filter(func(r : Run) : Bool { r.userId == userId }).toArray();
  };

  /// Get all runs sorted by startTime descending (newest first).
  public func getAllRunsSortedByDate(runs : List.List<Run>) : [Run] {
    runs.toArray().sort(func(a : Run, b : Run) : Order.Order { Int.compare(b.startTime, a.startTime) });
  };
};
