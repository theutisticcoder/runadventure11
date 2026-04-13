import { c as createLucideIcon, j as jsxRuntimeExports, a as cn, r as reactExports, u as useInternetIdentity, b as useNavigate, S as Swords, M as MapPin, B as BookOpen, L as Link, d as Button } from "./index-BaXq_fki.js";
import { B as Badge, G as GENRE_BUTTON_COLORS, a as GENRE_COLORS, b as GENRE_BG_COLORS, c as GENRE_GLOW } from "./types-Du6IX1Jo.js";
import { M as MotionConfigContext, i as isHTMLElement, u as useConstant, P as PresenceContext, a as usePresence, b as useIsomorphicLayoutEffect, L as LayoutGroupContext, m as motion, C as ChevronRight } from "./proxy-lQ4TDVSR.js";
import { P as Play } from "./play-Dc3OxVnR.js";
import { U as User } from "./user-q8NX9-pT.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  ["path", { d: "M18 6 6 18", key: "1bl5f8" }],
  ["path", { d: "m6 6 12 12", key: "d8bk6v" }]
];
const X = createLucideIcon("x", __iconNode);
function Input({ className, type, ...props }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "input",
    {
      type,
      "data-slot": "input",
      className: cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className
      ),
      ...props
    }
  );
}
function setRef(ref, value) {
  if (typeof ref === "function") {
    return ref(value);
  } else if (ref !== null && ref !== void 0) {
    ref.current = value;
  }
}
function composeRefs(...refs) {
  return (node) => {
    let hasCleanup = false;
    const cleanups = refs.map((ref) => {
      const cleanup = setRef(ref, node);
      if (!hasCleanup && typeof cleanup === "function") {
        hasCleanup = true;
      }
      return cleanup;
    });
    if (hasCleanup) {
      return () => {
        for (let i = 0; i < cleanups.length; i++) {
          const cleanup = cleanups[i];
          if (typeof cleanup === "function") {
            cleanup();
          } else {
            setRef(refs[i], null);
          }
        }
      };
    }
  };
}
function useComposedRefs(...refs) {
  return reactExports.useCallback(composeRefs(...refs), refs);
}
class PopChildMeasure extends reactExports.Component {
  getSnapshotBeforeUpdate(prevProps) {
    const element = this.props.childRef.current;
    if (isHTMLElement(element) && prevProps.isPresent && !this.props.isPresent && this.props.pop !== false) {
      const parent = element.offsetParent;
      const parentWidth = isHTMLElement(parent) ? parent.offsetWidth || 0 : 0;
      const parentHeight = isHTMLElement(parent) ? parent.offsetHeight || 0 : 0;
      const computedStyle = getComputedStyle(element);
      const size = this.props.sizeRef.current;
      size.height = parseFloat(computedStyle.height);
      size.width = parseFloat(computedStyle.width);
      size.top = element.offsetTop;
      size.left = element.offsetLeft;
      size.right = parentWidth - size.width - size.left;
      size.bottom = parentHeight - size.height - size.top;
    }
    return null;
  }
  /**
   * Required with getSnapshotBeforeUpdate to stop React complaining.
   */
  componentDidUpdate() {
  }
  render() {
    return this.props.children;
  }
}
function PopChild({ children, isPresent, anchorX, anchorY, root, pop }) {
  var _a;
  const id = reactExports.useId();
  const ref = reactExports.useRef(null);
  const size = reactExports.useRef({
    width: 0,
    height: 0,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  });
  const { nonce } = reactExports.useContext(MotionConfigContext);
  const childRef = ((_a = children.props) == null ? void 0 : _a.ref) ?? (children == null ? void 0 : children.ref);
  const composedRef = useComposedRefs(ref, childRef);
  reactExports.useInsertionEffect(() => {
    const { width, height, top, left, right, bottom } = size.current;
    if (isPresent || pop === false || !ref.current || !width || !height)
      return;
    const x = anchorX === "left" ? `left: ${left}` : `right: ${right}`;
    const y = anchorY === "bottom" ? `bottom: ${bottom}` : `top: ${top}`;
    ref.current.dataset.motionPopId = id;
    const style = document.createElement("style");
    if (nonce)
      style.nonce = nonce;
    const parent = root ?? document.head;
    parent.appendChild(style);
    if (style.sheet) {
      style.sheet.insertRule(`
          [data-motion-pop-id="${id}"] {
            position: absolute !important;
            width: ${width}px !important;
            height: ${height}px !important;
            ${x}px !important;
            ${y}px !important;
          }
        `);
    }
    return () => {
      var _a2;
      (_a2 = ref.current) == null ? void 0 : _a2.removeAttribute("data-motion-pop-id");
      if (parent.contains(style)) {
        parent.removeChild(style);
      }
    };
  }, [isPresent]);
  return jsxRuntimeExports.jsx(PopChildMeasure, { isPresent, childRef: ref, sizeRef: size, pop, children: pop === false ? children : reactExports.cloneElement(children, { ref: composedRef }) });
}
const PresenceChild = ({ children, initial, isPresent, onExitComplete, custom, presenceAffectsLayout, mode, anchorX, anchorY, root }) => {
  const presenceChildren = useConstant(newChildrenMap);
  const id = reactExports.useId();
  let isReusedContext = true;
  let context = reactExports.useMemo(() => {
    isReusedContext = false;
    return {
      id,
      initial,
      isPresent,
      custom,
      onExitComplete: (childId) => {
        presenceChildren.set(childId, true);
        for (const isComplete of presenceChildren.values()) {
          if (!isComplete)
            return;
        }
        onExitComplete && onExitComplete();
      },
      register: (childId) => {
        presenceChildren.set(childId, false);
        return () => presenceChildren.delete(childId);
      }
    };
  }, [isPresent, presenceChildren, onExitComplete]);
  if (presenceAffectsLayout && isReusedContext) {
    context = { ...context };
  }
  reactExports.useMemo(() => {
    presenceChildren.forEach((_, key) => presenceChildren.set(key, false));
  }, [isPresent]);
  reactExports.useEffect(() => {
    !isPresent && !presenceChildren.size && onExitComplete && onExitComplete();
  }, [isPresent]);
  children = jsxRuntimeExports.jsx(PopChild, { pop: mode === "popLayout", isPresent, anchorX, anchorY, root, children });
  return jsxRuntimeExports.jsx(PresenceContext.Provider, { value: context, children });
};
function newChildrenMap() {
  return /* @__PURE__ */ new Map();
}
const getChildKey = (child) => child.key || "";
function onlyElements(children) {
  const filtered = [];
  reactExports.Children.forEach(children, (child) => {
    if (reactExports.isValidElement(child))
      filtered.push(child);
  });
  return filtered;
}
const AnimatePresence = ({ children, custom, initial = true, onExitComplete, presenceAffectsLayout = true, mode = "sync", propagate = false, anchorX = "left", anchorY = "top", root }) => {
  const [isParentPresent, safeToRemove] = usePresence(propagate);
  const presentChildren = reactExports.useMemo(() => onlyElements(children), [children]);
  const presentKeys = propagate && !isParentPresent ? [] : presentChildren.map(getChildKey);
  const isInitialRender = reactExports.useRef(true);
  const pendingPresentChildren = reactExports.useRef(presentChildren);
  const exitComplete = useConstant(() => /* @__PURE__ */ new Map());
  const exitingComponents = reactExports.useRef(/* @__PURE__ */ new Set());
  const [diffedChildren, setDiffedChildren] = reactExports.useState(presentChildren);
  const [renderedChildren, setRenderedChildren] = reactExports.useState(presentChildren);
  useIsomorphicLayoutEffect(() => {
    isInitialRender.current = false;
    pendingPresentChildren.current = presentChildren;
    for (let i = 0; i < renderedChildren.length; i++) {
      const key = getChildKey(renderedChildren[i]);
      if (!presentKeys.includes(key)) {
        if (exitComplete.get(key) !== true) {
          exitComplete.set(key, false);
        }
      } else {
        exitComplete.delete(key);
        exitingComponents.current.delete(key);
      }
    }
  }, [renderedChildren, presentKeys.length, presentKeys.join("-")]);
  const exitingChildren = [];
  if (presentChildren !== diffedChildren) {
    let nextChildren = [...presentChildren];
    for (let i = 0; i < renderedChildren.length; i++) {
      const child = renderedChildren[i];
      const key = getChildKey(child);
      if (!presentKeys.includes(key)) {
        nextChildren.splice(i, 0, child);
        exitingChildren.push(child);
      }
    }
    if (mode === "wait" && exitingChildren.length) {
      nextChildren = exitingChildren;
    }
    setRenderedChildren(onlyElements(nextChildren));
    setDiffedChildren(presentChildren);
    return null;
  }
  const { forceRender } = reactExports.useContext(LayoutGroupContext);
  return jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: renderedChildren.map((child) => {
    const key = getChildKey(child);
    const isPresent = propagate && !isParentPresent ? false : presentChildren === renderedChildren || presentKeys.includes(key);
    const onExit = () => {
      if (exitingComponents.current.has(key)) {
        return;
      }
      if (exitComplete.has(key)) {
        exitingComponents.current.add(key);
        exitComplete.set(key, true);
      } else {
        return;
      }
      let isEveryExitComplete = true;
      exitComplete.forEach((isExitComplete) => {
        if (!isExitComplete)
          isEveryExitComplete = false;
      });
      if (isEveryExitComplete) {
        forceRender == null ? void 0 : forceRender();
        setRenderedChildren(pendingPresentChildren.current);
        propagate && (safeToRemove == null ? void 0 : safeToRemove());
        onExitComplete && onExitComplete();
      }
    };
    return jsxRuntimeExports.jsx(PresenceChild, { isPresent, initial: !isInitialRender.current || initial ? void 0 : false, custom, presenceAffectsLayout, mode, root, onExitComplete: isPresent ? void 0 : onExit, anchorX, anchorY, children: child }, key);
  }) });
};
const GENRES = ["Fantasy", "SciFi", "Horror", "Mystery", "Romance"];
const GENRE_ICONS = {
  Fantasy: "⚔️",
  SciFi: "🚀",
  Horror: "💀",
  Mystery: "🔍",
  Romance: "💕"
};
const GENRE_LABELS = {
  Fantasy: "Fantasy",
  SciFi: "Sci-Fi",
  Horror: "Horror",
  Mystery: "Mystery",
  Romance: "Romance"
};
const GENRE_DESC = {
  Fantasy: "Dragons, ancient prophecies, and enchanted crossroads. Magic stirs with every step.",
  SciFi: "Alien signals, quantum rifts, and rogue AI — the future bleeds into the present.",
  Horror: "Something follows you through every block. The shadows grow longer at each turn.",
  Mystery: "A dead man's map. Missing persons. The truth hides just around the next corner.",
  Romance: "A chance encounter, a racing heart. The city conspires to bring two souls together."
};
const GENRE_BORDER_ACTIVE = {
  Fantasy: "border-amber-400",
  SciFi: "border-cyan-400",
  Horror: "border-red-500",
  Mystery: "border-purple-400",
  Romance: "border-rose-400"
};
const USERNAME_KEY = "runquest_username";
function getStoredUsername() {
  return localStorage.getItem(USERNAME_KEY) ?? "";
}
function saveUsername(name) {
  localStorage.setItem(USERNAME_KEY, name.trim());
}
function GenreCard({ genre, isSelected, onSelect }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    motion.button,
    {
      type: "button",
      whileHover: { scale: 1.03 },
      whileTap: { scale: 0.97 },
      onClick: () => onSelect(genre),
      "data-ocid": `genre-card-${genre.toLowerCase()}`,
      "aria-pressed": isSelected,
      "aria-label": `Select ${GENRE_LABELS[genre]} genre`,
      className: [
        "relative rounded-2xl border-2 p-5 flex flex-col items-center gap-3",
        "cursor-pointer text-left transition-all duration-200 outline-none",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "min-h-[140px] sm:min-h-[160px]",
        isSelected ? `${GENRE_BG_COLORS[genre]} ${GENRE_BORDER_ACTIVE[genre]} ${GENRE_GLOW[genre]}` : "bg-card border-border/50 hover:border-border"
      ].join(" "),
      children: [
        isSelected && /* @__PURE__ */ jsxRuntimeExports.jsx(
          motion.div,
          {
            initial: { scale: 0, opacity: 0 },
            animate: { scale: 1, opacity: 1 },
            className: "absolute top-3 right-3 w-5 h-5 rounded-full bg-current flex items-center justify-center",
            style: { color: "transparent" },
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                className: `w-5 h-5 rounded-full flex items-center justify-center ${GENRE_BUTTON_COLORS[genre].split(" ")[0]}`,
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "svg",
                  {
                    width: "10",
                    height: "8",
                    viewBox: "0 0 10 8",
                    fill: "none",
                    "aria-hidden": "true",
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "path",
                      {
                        d: "M1 4l2.5 2.5L9 1",
                        stroke: "currentColor",
                        strokeWidth: "1.8",
                        strokeLinecap: "round",
                        strokeLinejoin: "round"
                      }
                    )
                  }
                )
              }
            )
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-4xl leading-none", "aria-hidden": "true", children: GENRE_ICONS[genre] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "span",
          {
            className: `font-display font-bold text-lg leading-tight ${isSelected ? GENRE_COLORS[genre] : "text-foreground"}`,
            children: GENRE_LABELS[genre]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground text-center leading-snug line-clamp-2", children: GENRE_DESC[genre] })
      ]
    }
  );
}
function UsernamePrompt({ onSave, onSkip }) {
  const [value, setValue] = reactExports.useState("");
  const inputRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    var _a;
    (_a = inputRef.current) == null ? void 0 : _a.focus();
  }, []);
  const handleSave = () => {
    if (value.trim().length > 0) {
      onSave(value.trim());
    } else {
      onSkip();
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    motion.div,
    {
      initial: { opacity: 0, y: -12 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -12 },
      className: "relative bg-card border border-border/60 rounded-2xl p-5 mx-4 mb-6 max-w-screen-sm w-full self-center shadow-lg",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            onClick: onSkip,
            "aria-label": "Skip username setup",
            className: "absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md min-h-[44px] min-w-[44px] flex items-center justify-center",
            "data-ocid": "username-skip",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 18 })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mb-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(User, { size: 18, className: "text-accent" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display font-bold text-lg text-foreground leading-tight", children: "Set your adventurer name" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Shown on shared adventures" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              ref: inputRef,
              value,
              onChange: (e) => setValue(e.target.value),
              onKeyDown: (e) => e.key === "Enter" && handleSave(),
              placeholder: "e.g. DragonRunner88",
              maxLength: 40,
              className: "flex-1 min-h-[48px] text-base bg-muted/50 border-border/60",
              "data-ocid": "username-input",
              "aria-label": "Display name"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              onClick: handleSave,
              className: "min-h-[48px] px-5 font-semibold bg-accent text-accent-foreground hover:bg-accent/90",
              "data-ocid": "username-save",
              children: value.trim() ? "Save" : "Skip"
            }
          )
        ] })
      ]
    }
  );
}
function Home() {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const navigate = useNavigate();
  const [selectedGenre, setSelectedGenre] = reactExports.useState(null);
  const [showUsernamePrompt, setShowUsernamePrompt] = reactExports.useState(false);
  const [username, setUsername] = reactExports.useState("");
  reactExports.useEffect(() => {
    const stored = getStoredUsername();
    if (stored) {
      setUsername(stored);
    } else {
      const t = setTimeout(() => setShowUsernamePrompt(true), 800);
      return () => clearTimeout(t);
    }
  }, []);
  const handleUsernameSave = (name) => {
    saveUsername(name);
    setUsername(name);
    setShowUsernamePrompt(false);
  };
  const handleUsernameSkip = () => {
    saveUsername("Adventurer");
    setUsername("Adventurer");
    setShowUsernamePrompt(false);
  };
  const handleStartRun = () => {
    if (!selectedGenre) return;
    navigate({ to: "/run", search: { genre: selectedGenre } });
  };
  const selectedButtonClass = selectedGenre ? GENRE_BUTTON_COLORS[selectedGenre] : "";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 flex flex-col", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "relative flex flex-col items-center pt-10 pb-8 px-4 bg-background overflow-hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: "absolute inset-0 pointer-events-none",
          style: {
            background: "radial-gradient(ellipse 80% 50% at 50% 0%, oklch(var(--accent)/0.10) 0%, transparent 65%)"
          },
          "aria-hidden": "true"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative z-10 w-full max-w-screen-sm mx-auto flex flex-col items-center gap-4 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          motion.div,
          {
            initial: { scale: 0.7, opacity: 0 },
            animate: { scale: 1, opacity: 1 },
            transition: { duration: 0.5, ease: "easeOut" },
            className: "w-16 h-16 rounded-2xl bg-accent/20 border border-accent/40 flex items-center justify-center mb-1",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(Swords, { size: 32, className: "text-accent" })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          motion.div,
          {
            initial: { opacity: 0, y: 16 },
            animate: { opacity: 1, y: 0 },
            transition: { delay: 0.15, duration: 0.5 },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Badge,
                {
                  variant: "secondary",
                  className: "text-accent border-accent/30 bg-accent/10 text-sm px-4 py-1 mb-3",
                  children: "AI-Powered Running Stories"
                }
              ),
              username && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-base text-muted-foreground mb-2", children: [
                "Welcome back,",
                " ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground font-semibold", children: username })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "font-display font-bold text-5xl sm:text-6xl text-foreground leading-none tracking-tight", children: [
                "Run",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-accent", children: "Quest" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-lg sm:text-xl text-muted-foreground leading-snug max-w-sm mx-auto", children: "Real GPS. Real streets. Every intersection triggers an AI-narrated story chapter — shaped by your choices." })
            ]
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: showUsernamePrompt && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center bg-background", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      UsernamePrompt,
      {
        onSave: handleUsernameSave,
        onSkip: handleUsernameSkip
      }
    ) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "bg-muted/20 border-t border-border/40 py-10 px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-screen-sm mx-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        motion.div,
        {
          initial: { opacity: 0, y: 12 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true },
          transition: { duration: 0.4 },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display font-bold text-3xl text-foreground text-center mb-1", children: "Choose Your Genre" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-center mb-7 text-base", children: "Your genre shapes every chapter of the adventure." })
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("fieldset", { className: "grid grid-cols-2 gap-3 sm:gap-4 border-0 p-0 m-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("legend", { className: "sr-only", children: "Genre selection" }),
        GENRES.map((genre, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          motion.div,
          {
            initial: { opacity: 0, y: 20 },
            whileInView: { opacity: 1, y: 0 },
            viewport: { once: true },
            transition: { delay: i * 0.07, duration: 0.35 },
            className: genre === "Romance" ? "col-span-2 sm:col-span-1" : "",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              GenreCard,
              {
                genre,
                isSelected: selectedGenre === genre,
                onSelect: setSelectedGenre
              }
            )
          },
          genre
        ))
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        motion.div,
        {
          initial: { opacity: 0, y: 10 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true },
          transition: { delay: 0.4, duration: 0.4 },
          className: "mt-6",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { mode: "wait", children: selectedGenre ? /* @__PURE__ */ jsxRuntimeExports.jsx(
              motion.div,
              {
                initial: { opacity: 0, scale: 0.97 },
                animate: { opacity: 1, scale: 1 },
                exit: { opacity: 0, scale: 0.97 },
                transition: { duration: 0.2 },
                children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "button",
                  {
                    type: "button",
                    onClick: handleStartRun,
                    "data-ocid": "start-run-btn",
                    "aria-label": `Start run with ${selectedGenre} genre`,
                    className: [
                      "w-full min-h-[60px] rounded-2xl font-display font-bold text-xl",
                      "flex items-center justify-center gap-3 transition-all duration-200",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                      "shadow-lg active:scale-[0.98]",
                      selectedButtonClass
                    ].join(" "),
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { size: 22 }),
                      "Start ",
                      GENRE_LABELS[selectedGenre],
                      " Adventure",
                      /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { size: 20 })
                    ]
                  }
                )
              },
              "enabled"
            ) : /* @__PURE__ */ jsxRuntimeExports.jsx(
              motion.div,
              {
                initial: { opacity: 0 },
                animate: { opacity: 1 },
                exit: { opacity: 0 },
                children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "button",
                  {
                    type: "button",
                    disabled: true,
                    "aria-disabled": "true",
                    "data-ocid": "start-run-btn-disabled",
                    className: "w-full min-h-[60px] rounded-2xl font-display font-bold text-xl flex items-center justify-center gap-3 bg-muted text-muted-foreground cursor-not-allowed border border-border/40",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { size: 22 }),
                      "Select a genre to begin"
                    ]
                  }
                )
              },
              "disabled"
            ) }),
            !selectedGenre && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-center text-sm text-muted-foreground mt-3", children: "↑ Tap a genre card above to unlock your adventure" })
          ]
        }
      )
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "py-10 px-4 bg-background border-t border-border/40", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-screen-sm mx-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        motion.h2,
        {
          initial: { opacity: 0, y: 10 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true },
          className: "font-display font-bold text-2xl text-foreground text-center mb-6",
          children: "How It Works"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-4", children: [
        {
          step: "01",
          icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Swords, { size: 20, className: "text-accent" }),
          title: "Pick Your Genre",
          desc: "Choose from Fantasy, Sci-Fi, Horror, Mystery, or Romance to flavor your story."
        },
        {
          step: "02",
          icon: /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { size: 20, className: "text-accent" }),
          title: "Run Your Route",
          desc: "GPS tracks your path. Every real intersection triggers a new chapter narrated aloud."
        },
        {
          step: "03",
          icon: /* @__PURE__ */ jsxRuntimeExports.jsx(BookOpen, { size: 20, className: "text-accent" }),
          title: "Choose & Share",
          desc: "Pick directions that shape your story. Save and share your unique adventure."
        }
      ].map((item, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        motion.div,
        {
          initial: { opacity: 0, x: -16 },
          whileInView: { opacity: 1, x: 0 },
          viewport: { once: true },
          transition: { delay: i * 0.1, duration: 0.35 },
          className: "flex items-start gap-4 p-4 rounded-xl bg-card border border-border/40",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center flex-shrink-0", children: item.icon }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-xs text-muted-foreground", children: item.step }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display font-bold text-lg text-foreground", children: item.title })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-base text-muted-foreground leading-snug", children: item.desc })
            ] })
          ]
        },
        item.step
      )) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "py-8 px-4 bg-muted/20 border-t border-border/40", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-screen-sm mx-auto flex flex-col gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Link,
        {
          to: "/feed",
          search: { my: false },
          "data-ocid": "home-feed-link",
          className: "flex items-center justify-between p-4 rounded-xl bg-card border border-border/50 hover:border-accent/40 hover:bg-accent/5 transition-all duration-200 group min-h-[64px]",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10 h-10 rounded-lg bg-accent/15 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(BookOpen, { size: 18, className: "text-accent" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-display font-bold text-base text-foreground", children: "Adventure Feed" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Browse stories from all runners" })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              ChevronRight,
              {
                size: 18,
                className: "text-muted-foreground group-hover:text-accent transition-colors"
              }
            )
          ]
        }
      ),
      isAuthenticated && /* @__PURE__ */ jsxRuntimeExports.jsx(
        motion.div,
        {
          initial: { opacity: 0, y: 8 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.3 },
          children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Link,
            {
              to: "/feed",
              search: { my: true },
              "data-ocid": "home-my-adventures-link",
              className: "flex items-center justify-between p-4 rounded-xl bg-card border border-border/50 hover:border-accent/40 hover:bg-accent/5 transition-all duration-200 group min-h-[64px]",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10 h-10 rounded-lg bg-accent/15 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(User, { size: 18, className: "text-accent" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-display font-bold text-base text-foreground", children: "My Adventures" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Your saved runs and stories" })
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  ChevronRight,
                  {
                    size: 18,
                    className: "text-muted-foreground group-hover:text-accent transition-colors"
                  }
                )
              ]
            }
          )
        }
      )
    ] }) })
  ] });
}
export {
  Home as default
};
