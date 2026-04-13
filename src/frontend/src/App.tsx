import { Skeleton } from "@/components/ui/skeleton";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { Suspense, lazy } from "react";
import Layout from "./components/Layout";

// Lazy-loaded pages
const HomePage = lazy(() => import("./pages/Home"));
const ActiveRunPage = lazy(() => import("./pages/ActiveRun"));
const AdventureFeedPage = lazy(() => import("./pages/AdventureFeed"));
const StoryViewerPage = lazy(() => import("./pages/StoryViewer"));

function PageLoader() {
  return (
    <div className="flex-1 flex flex-col gap-4 p-6 max-w-screen-lg mx-auto w-full">
      <Skeleton className="h-10 w-1/3" />
      <Skeleton className="h-48 w-full" />
      <Skeleton className="h-24 w-2/3" />
    </div>
  );
}

// Root route with Layout wrapper
const rootRoute = createRootRoute({
  component: () => (
    <Layout>
      <Suspense fallback={<PageLoader />}>
        <Outlet />
      </Suspense>
    </Layout>
  ),
});

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

const runRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/run",
  validateSearch: (search: Record<string, unknown>) => ({
    genre: typeof search.genre === "string" ? search.genre : undefined,
  }),
  component: ActiveRunPage,
});

const feedRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/feed",
  validateSearch: (search: Record<string, unknown>) => ({
    my: search.my === true || search.my === "true",
  }),
  component: AdventureFeedPage,
});

const storyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/story/$slug",
  component: StoryViewerPage,
});

const routeTree = rootRoute.addChildren([
  homeRoute,
  runRoute,
  feedRoute,
  storyRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
