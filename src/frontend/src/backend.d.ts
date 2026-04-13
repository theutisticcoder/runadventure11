import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface SaveRunRequest {
    startTime: bigint;
    userName?: string;
    title: string;
    endTime: bigint;
    genre: string;
    chapters: Array<Chapter>;
    totalDistance: number;
    gpsRoute: Array<GpsCoord>;
    choices: Array<string>;
}
export interface Run {
    id: bigint;
    startTime: bigint;
    userName?: string;
    title: string;
    endTime: bigint;
    userId: Principal;
    slug: string;
    genre: string;
    chapters: Array<Chapter>;
    totalDistance: number;
    gpsRoute: Array<GpsCoord>;
    choices: Array<string>;
}
export interface Chapter {
    direction: string;
    text: string;
    streetName1: string;
    streetName2: string;
    choiceIndex: bigint;
}
export interface GpsCoord {
    lat: number;
    lon: number;
}
export interface backendInterface {
    getAllRuns(): Promise<Array<Run>>;
    getMyRuns(): Promise<Array<Run>>;
    getRunBySlug(slug: string): Promise<Run | null>;
    getRunsByUser(userId: Principal): Promise<Array<Run>>;
    getUser(userId: Principal): Promise<string | null>;
    saveRun(req: SaveRunRequest): Promise<string>;
    setUserName(name: string): Promise<void>;
}
