module {
  public type GpsCoord = {
    lat : Float;
    lon : Float;
  };

  public type Chapter = {
    text : Text;
    streetName1 : Text;
    streetName2 : Text;
    direction : Text;
    choiceIndex : Nat;
  };

  public type Run = {
    id : Nat;
    slug : Text;
    title : Text;
    genre : Text;
    chapters : [Chapter];
    choices : [Text];
    gpsRoute : [GpsCoord];
    startTime : Int;
    endTime : Int;
    totalDistance : Float;
    userId : Principal;
    userName : ?Text;
  };

  public type SaveRunRequest = {
    title : Text;
    genre : Text;
    chapters : [Chapter];
    choices : [Text];
    gpsRoute : [GpsCoord];
    startTime : Int;
    endTime : Int;
    totalDistance : Float;
    userName : ?Text;
  };
};
