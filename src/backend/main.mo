import List "mo:core/List";
import Map "mo:core/Map";
import RunsLib "lib/runs";
import RunsApi "mixins/runs-api";

actor {
  let runs = List.empty<RunsLib.Run>();
  let userNames = Map.empty<Principal, Text>();

  include RunsApi(runs, userNames);
};
