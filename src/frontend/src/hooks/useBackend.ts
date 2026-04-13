import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { createActor } from "../backend";
import type { Run } from "../lib/types";

// Map frontend Run type (with string userId) to/from backend Run type (Principal)
// The backend returns Principal for userId — we serialize to string for UI usage.

interface SaveRunParams {
  title: string;
  genre: string;
  chapters: Run["chapters"];
  choices: string[];
  gpsRoute: Run["gpsRoute"];
  startTime: number;
  endTime: number;
  totalDistance: number;
  userName?: string;
}

// Stub upload/download file helpers (no object storage in this project)
const noopUpload = async () => new Uint8Array();
const noopDownload = async () => {
  throw new Error("download not supported");
};

function useBackendActor() {
  return useActor<ReturnType<typeof createActor>>(
    (canisterId, _upload, _download, opts) =>
      createActor(canisterId, noopUpload, noopDownload, opts),
  );
}

export function useSaveRun() {
  const { actor, isFetching } = useBackendActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: SaveRunParams): Promise<string> => {
      if (!actor || isFetching) throw new Error("Actor not ready");
      const slug = await actor.saveRun({
        title: params.title,
        genre: params.genre,
        chapters: params.chapters.map((ch) => ({
          text: ch.text,
          streetName1: ch.streetName1,
          streetName2: ch.streetName2,
          direction: ch.direction,
          choiceIndex: BigInt(ch.choiceIndex),
        })),
        choices: params.choices,
        gpsRoute: params.gpsRoute,
        startTime: BigInt(params.startTime),
        endTime: BigInt(params.endTime),
        totalDistance: params.totalDistance,
        userName: params.userName,
      });
      return slug;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["runs"] });
      queryClient.invalidateQueries({ queryKey: ["myRuns"] });
    },
  });
}

export function useAllRuns() {
  const { actor, isFetching } = useBackendActor();
  return useQuery<Run[]>({
    queryKey: ["runs"],
    queryFn: async () => {
      if (!actor) return [];
      const runs = await actor.getAllRuns();
      return runs.map((r) => ({
        ...r,
        userId: r.userId.toString(),
        chapters: r.chapters.map((ch) => ({
          ...ch,
          choiceIndex: Number(ch.choiceIndex),
        })),
      }));
    },
    enabled: !isFetching,
    staleTime: 30_000,
  });
}

export function useRunBySlug(slug: string) {
  const { actor, isFetching } = useBackendActor();
  return useQuery<Run | null>({
    queryKey: ["run", slug],
    queryFn: async () => {
      if (!actor) return null;
      const run = await actor.getRunBySlug(slug);
      if (!run) return null;
      return {
        ...run,
        userId: run.userId.toString(),
        chapters: run.chapters.map((ch) => ({
          ...ch,
          choiceIndex: Number(ch.choiceIndex),
        })),
      };
    },
    enabled: !!slug && !isFetching,
  });
}

export function useMyRuns() {
  const { actor, isFetching } = useBackendActor();
  return useQuery<Run[]>({
    queryKey: ["myRuns"],
    queryFn: async () => {
      if (!actor) return [];
      const runs = await actor.getMyRuns();
      return runs.map((r) => ({
        ...r,
        userId: r.userId.toString(),
        chapters: r.chapters.map((ch) => ({
          ...ch,
          choiceIndex: Number(ch.choiceIndex),
        })),
      }));
    },
    enabled: !isFetching,
    staleTime: 30_000,
  });
}

// Convenience hook that bundles all backend operations
export function useBackend() {
  const { actor, isFetching } = useBackendActor();
  const queryClient = useQueryClient();
  const saveRunMutation = useSaveRun();

  const saveRun = useCallback(
    async (params: SaveRunParams): Promise<string> => {
      return saveRunMutation.mutateAsync(params);
    },
    [saveRunMutation],
  );

  const getAllRuns = useCallback(async (): Promise<Run[]> => {
    if (!actor) return [];
    const runs = await actor.getAllRuns();
    return runs.map((r) => ({
      ...r,
      userId: r.userId.toString(),
      chapters: r.chapters.map((ch) => ({
        ...ch,
        choiceIndex: Number(ch.choiceIndex),
      })),
    }));
  }, [actor]);

  const getRunBySlug = useCallback(
    async (slug: string): Promise<Run | null> => {
      if (!actor) return null;
      const run = await actor.getRunBySlug(slug);
      if (!run) return null;
      return {
        ...run,
        userId: run.userId.toString(),
        chapters: run.chapters.map((ch) => ({
          ...ch,
          choiceIndex: Number(ch.choiceIndex),
        })),
      };
    },
    [actor],
  );

  const getMyRuns = useCallback(async (): Promise<Run[]> => {
    if (!actor) return [];
    const runs = await actor.getMyRuns();
    return runs.map((r) => ({
      ...r,
      userId: r.userId.toString(),
      chapters: r.chapters.map((ch) => ({
        ...ch,
        choiceIndex: Number(ch.choiceIndex),
      })),
    }));
  }, [actor]);

  const invalidateRuns = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["runs"] });
    queryClient.invalidateQueries({ queryKey: ["myRuns"] });
  }, [queryClient]);

  return {
    saveRun,
    getAllRuns,
    getRunBySlug,
    getMyRuns,
    invalidateRuns,
    isSaving: saveRunMutation.isPending,
    isActorReady: !!actor && !isFetching,
  };
}
