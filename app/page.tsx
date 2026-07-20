"use client";

import type { CSSProperties } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Accessibility,
  Activity,
  Apple,
  Atom,
  Award,
  Bell,
  Bike,
  BookOpen,
  Bot,
  Brain,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  Camera,
  ChartNoAxesColumnIncreasing,
  ChartPie,
  CircuitBoard,
  CircleCheck,
  CircleDollarSign,
  ClipboardCheck,
  Cloud,
  CodeXml,
  Coffee,
  Compass,
  Cpu,
  Crown,
  Database,
  Dna,
  Earth,
  Eye,
  Factory,
  FileText,
  Fingerprint,
  Flag,
  FlaskConical,
  Gamepad2,
  Gift,
  Globe2,
  GraduationCap,
  Handshake,
  Heart,
  HeartPulse,
  Headphones,
  Hospital,
  House,
  KeyRound,
  Landmark,
  Languages,
  Laptop,
  Layers3,
  Leaf,
  Library,
  LifeBuoy,
  Lightbulb,
  LockKeyhole,
  Mail,
  Map,
  MapPin,
  Maximize2,
  Megaphone,
  Medal,
  MessageSquare,
  Microscope,
  Minimize2,
  Monitor,
  Mountain,
  Music,
  Network,
  Newspaper,
  Package,
  Palette,
  PawPrint,
  Phone,
  Pill,
  Plane,
  Podcast,
  Presentation,
  Printer,
  Quote,
  Radio,
  Receipt,
  Recycle,
  Rocket,
  Route,
  Satellite,
  Scale,
  School,
  Search,
  Settings,
  ShieldCheck,
  Ship,
  ShoppingBag,
  ShoppingCart,
  Smile,
  Smartphone,
  Speaker,
  Sparkles,
  Sprout,
  Star,
  Stethoscope,
  Store,
  Sun,
  Syringe,
  Target,
  Telescope,
  Terminal,
  TestTube,
  Timer,
  TrendingUp,
  TreePine,
  Trophy,
  Truck,
  Utensils,
  Users,
  Video,
  WalletCards,
  Waves,
  Wind,
  Workflow,
  Wrench,
  Zap,
  type LucideIcon,
} from "lucide-react";
import brand from "@/config/brand.json";
import v7 from "@/config/v7.json";
import type { IconName } from "@/lib/iconography";
import {
  DEFAULT_REALTIME_MODEL,
  isRealtimeModel,
  REALTIME_MODEL_OPTIONS,
  type RealtimeModel,
} from "@/lib/realtime-models";

type SceneKind = "cover" | "blank" | "hero" | "cards" | "metric" | "quote";

type SceneCard = {
  title: string;
  body: string;
  tag?: string;
  icon?: IconName;
};

type Scene = {
  id: string;
  sequence?: number;
  kind: SceneKind;
  eyebrow: string;
  title: string;
  subtitle?: string;
  icon?: IconName;
  accent: "ember" | "lime" | "sky" | "violet";
  cards?: SceneCard[];
  metric?: string;
  metricLabel?: string;
  quote?: string;
  attribution?: string;
  backgroundImage?: string;
  backgroundStatus?: "generating" | "reframing" | "ready" | "unavailable";
};

type ConnectionState = "ready" | "connecting" | "live" | "error";
type DeckMutation = "append" | "update" | "view";
type ExportFormat = "pdf" | "pptx";

const MICROPHONE_STORAGE_KEY = "zeroprep.microphone-device-id";
const REALTIME_MODEL_STORAGE_KEY = "zeroprep.realtime-model.v2";
const IMAGE_REFLOW_DELAY_MS = 560;

type DirectorCommand = {
  action?: "replace" | "merge_cards" | "focus" | "hold";
  scene?: Partial<Scene>;
  cards?: SceneCard[];
  caption?: string;
};

const INITIAL_SCENE: Scene = {
  id: "zeroprep-cover",
  sequence: 0,
  kind: "cover",
  eyebrow: brand.display_name,
  title: brand.tagline,
  accent: "lime",
};

const ICON_COMPONENTS: Record<IconName, LucideIcon> = {
  sparkles: Sparkles,
  lightbulb: Lightbulb,
  target: Target,
  "trending-up": TrendingUp,
  users: Users,
  rocket: Rocket,
  "shield-check": ShieldCheck,
  globe: Globe2,
  heart: Heart,
  zap: Zap,
  layers: Layers3,
  workflow: Workflow,
  timer: Timer,
  dollar: CircleDollarSign,
  quote: Quote,
  check: CircleCheck,
  brain: Brain,
  message: MessageSquare,
  megaphone: Megaphone,
  search: Search,
  cpu: Cpu,
  chart: ChartNoAxesColumnIncreasing,
  award: Award,
  leaf: Leaf,
  activity: Activity,
  atom: Atom,
  "book-open": BookOpen,
  bot: Bot,
  briefcase: BriefcaseBusiness,
  building: Building2,
  calendar: CalendarDays,
  camera: Camera,
  "chart-pie": ChartPie,
  "circuit-board": CircuitBoard,
  "clipboard-check": ClipboardCheck,
  cloud: Cloud,
  code: CodeXml,
  database: Database,
  dna: Dna,
  factory: Factory,
  flag: Flag,
  flask: FlaskConical,
  "graduation-cap": GraduationCap,
  handshake: Handshake,
  "heart-pulse": HeartPulse,
  hospital: Hospital,
  key: KeyRound,
  landmark: Landmark,
  laptop: Laptop,
  lock: LockKeyhole,
  mail: Mail,
  "map-pin": MapPin,
  microscope: Microscope,
  monitor: Monitor,
  mountain: Mountain,
  music: Music,
  network: Network,
  package: Package,
  palette: Palette,
  phone: Phone,
  plane: Plane,
  presentation: Presentation,
  radio: Radio,
  receipt: Receipt,
  recycle: Recycle,
  route: Route,
  scale: Scale,
  school: School,
  settings: Settings,
  "shopping-cart": ShoppingCart,
  smartphone: Smartphone,
  sprout: Sprout,
  star: Star,
  store: Store,
  stethoscope: Stethoscope,
  sun: Sun,
  telescope: Telescope,
  terminal: Terminal,
  trophy: Trophy,
  truck: Truck,
  video: Video,
  wallet: WalletCards,
  waves: Waves,
  wind: Wind,
  wrench: Wrench,
  accessibility: Accessibility,
  earth: Earth,
  eye: Eye,
  "file-text": FileText,
  fingerprint: Fingerprint,
  gamepad: Gamepad2,
  gift: Gift,
  headphones: Headphones,
  home: House,
  languages: Languages,
  library: Library,
  map: Map,
  medal: Medal,
  newspaper: Newspaper,
  pill: Pill,
  podcast: Podcast,
  printer: Printer,
  satellite: Satellite,
  ship: Ship,
  "shopping-bag": ShoppingBag,
  smile: Smile,
  speaker: Speaker,
  syringe: Syringe,
  "test-tube": TestTube,
  tree: TreePine,
  utensils: Utensils,
  coffee: Coffee,
  compass: Compass,
  crown: Crown,
  bell: Bell,
  "life-buoy": LifeBuoy,
  "paw-print": PawPrint,
  apple: Apple,
  bike: Bike,
};

function SemanticIcon({
  name = "sparkles",
  className,
}: {
  name?: IconName;
  className?: string;
}) {
  const Icon = ICON_COMPONENTS[name] || Sparkles;
  return <Icon className={className} strokeWidth={1.65} aria-hidden="true" />;
}

const DEMO_BEATS: Array<{ transcript: string; scene: Scene }> = [
  {
    transcript:
      "The problem is simple: the best ideas arrive faster than our slides can keep up.",
    scene: {
      id: "problem",
      kind: "hero",
      eyebrow: "THE OLD WAY  /  TOO SLOW",
      title: "Ideas move fast.\nSlides don’t.",
      subtitle:
        "Static decks turn a live story into a sequence you have to chase.",
      accent: "violet",
      icon: "lightbulb",
    },
  },
  {
    transcript:
      "So we built three layers: capture what matters, compose the right visual, and perform it in the moment.",
    scene: {
      id: "three-layers",
      kind: "cards",
      eyebrow: "ONE FLOW  /  THREE LAYERS",
      title: "From voice to visual — live.",
      subtitle: "One thought becomes a coherent scene, not three disconnected slides.",
      accent: "lime",
      icon: "workflow",
      cards: [
        {
          tag: "01",
          title: "Capture",
          body: "Realtime speech, intent and emphasis.",
          icon: "message",
        },
        {
          tag: "02",
          title: "Compose",
          body: "A scene director chooses the right visual grammar.",
          icon: "layers",
        },
        {
          tag: "03",
          title: "Perform",
          body: "Motion lands exactly when the idea does.",
          icon: "zap",
        },
      ],
    },
  },
  {
    transcript:
      "The result is a stage that can respond in under seven hundred milliseconds without interrupting the speaker.",
    scene: {
      id: "latency",
      kind: "metric",
      eyebrow: "DESIGNED FOR FLOW",
      title: "Fast enough to feel inevitable.",
      subtitle:
        "The interface keeps listening while the current scene evolves in place.",
      accent: "sky",
      icon: "timer",
      metric: "<700",
      metricLabel: "MS TO FIRST VISUAL RESPONSE",
    },
  },
  {
    transcript:
      "Because the presentation should follow the speaker — not the other way around.",
    scene: {
      id: "manifesto",
      kind: "quote",
      eyebrow: "THE PRINCIPLE",
      title: "Presence over playback.",
      accent: "ember",
      icon: "quote",
      quote: "The presentation follows the speaker — not the other way around.",
      attribution: `${brand.display_name} / ${brand.category}`,
    },
  },
];

const ICON_RULES: Array<[RegExp, IconName]> = [
  [/\b(?:hospital|doctor|nurse|patient|medical|healthcare|clinic)\b/, "stethoscope"],
  [/\b(?:medicine|medication|pharma|drug|tablet)\b/, "pill"],
  [/\b(?:genetic|genome|biology|biotech|dna)\b/, "dna"],
  [/\b(?:heart|wellness|pulse|fitness|vital)\b/, "heart-pulse"],
  [/\b(?:education|student|teacher|teaching|course|university|graduate)\b/, "graduation-cap"],
  [/\b(?:book|reading|curriculum|chapter|knowledge)\b/, "book-open"],
  [/\b(?:science|experiment|laboratory|chemistry)\b/, "flask"],
  [/\b(?:microscope|microscopic|cellular)\b/, "microscope"],
  [/\b(?:space|satellite|orbit|astronomy)\b/, "satellite"],
  [/\b(?:software|developer|coding|code|programming|api)\b/, "code"],
  [/\b(?:data|database|storage|warehouse|analytics)\b/, "database"],
  [/\b(?:cloud|serverless|hosting)\b/, "cloud"],
  [/\b(?:robot|bot|automation|agentic|agent)\b/, "bot"],
  [/\b(?:ai|intelligence|think|brain|learn|model)\b/, "brain"],
  [/\b(?:network|connected|connectivity|infrastructure)\b/, "network"],
  [/\b(?:hardware|chip|semiconductor|circuit)\b/, "circuit-board"],
  [/\b(?:mobile|smartphone|app|phone)\b/, "smartphone"],
  [/\b(?:cybersecurity|secure|security|trust|safe|protect|privacy)\b/, "shield-check"],
  [/\b(?:password|locked|encryption|encrypted)\b/, "lock"],
  [/\b(?:identity|biometric|fingerprint|authentication)\b/, "fingerprint"],
  [/\b(?:revenue|money|price|cost|budget|sales|profit|dollar)\b/, "dollar"],
  [/\b(?:bank|finance|government|institution|policy)\b/, "landmark"],
  [/\b(?:business|company|enterprise|career|job|workplace)\b/, "briefcase"],
  [/\b(?:partner|partnership|deal|agreement|collaborate)\b/, "handshake"],
  [/\b(?:legal|law|justice|fairness|balance)\b/, "scale"],
  [/\b(?:grow|growth|scale|increase|traction|momentum)\b/, "trending-up"],
  [/\b(?:team|people|customer|audience|community|user)\b/, "users"],
  [/\b(?:launch|ship|start|build|product)\b/, "rocket"],
  [/\b(?:factory|manufacturing|industrial|production)\b/, "factory"],
  [/\b(?:delivery|logistics|freight|transport|truck)\b/, "truck"],
  [/\b(?:package|parcel|inventory|supply)\b/, "package"],
  [/\b(?:retail|shop|shopping|commerce|checkout)\b/, "shopping-cart"],
  [/\b(?:travel|flight|airline|airport|plane)\b/, "plane"],
  [/\b(?:location|place|venue|destination|nearby)\b/, "map-pin"],
  [/\b(?:world|global|international|market)\b/, "earth"],
  [/\b(?:climate|green|sustainable|sustainability|nature)\b/, "leaf"],
  [/\b(?:recycle|circular|reuse|waste)\b/, "recycle"],
  [/\b(?:forest|tree|woodland)\b/, "tree"],
  [/\b(?:ocean|sea|water|wave)\b/, "waves"],
  [/\b(?:energy|electric|power|fast|speed)\b/, "zap"],
  [/\b(?:photo|photography|picture|image)\b/, "camera"],
  [/\b(?:video|film|movie|cinema)\b/, "video"],
  [/\b(?:music|song|audio|sound)\b/, "music"],
  [/\b(?:podcast|episode|interview)\b/, "podcast"],
  [/\b(?:news|press|journalism|article)\b/, "newspaper"],
  [/\b(?:design|art|brand|creative|color)\b/, "palette"],
  [/\b(?:presentation|slides|deck|speaker|stage)\b/, "presentation"],
  [/\b(?:game|gaming|esports|play)\b/, "gamepad"],
  [/\b(?:food|meal|restaurant|dining|recipe)\b/, "utensils"],
  [/\b(?:language|translation|multilingual|localization)\b/, "languages"],
  [/\b(?:accessibility|accessible|inclusive|disability)\b/, "accessibility"],
  [/\b(?:home|house|housing|residential)\b/, "home"],
  [/\b(?:pet|animal|dog|cat)\b/, "paw-print"],
  [/\b(?:goal|priority|focus|objective|target)\b/, "target"],
  [/\b(?:time|minute|second|latency|deadline)\b/, "timer"],
  [/\b(?:flow|process|step|system|pipeline)\b/, "workflow"],
  [/\b(?:search|discover|find|research)\b/, "search"],
  [/\b(?:win|award|best|success|achieve|champion)\b/, "trophy"],
  [/\b(?:idea|imagine|insight|invention)\b/, "lightbulb"],
];

function iconFromText(value: string): IconName {
  const text = value.toLowerCase();
  return ICON_RULES.find(([pattern]) => pattern.test(text))?.[1] || "sparkles";
}

function copyDensity(
  value = "",
  mediumWordCount = 7,
  denseWordCount = 11,
) {
  const words = value.trim().split(/\s+/).filter(Boolean).length;
  if (words >= denseWordCount || value.length >= denseWordCount * 9) return "dense";
  if (words >= mediumWordCount || value.length >= mediumWordCount * 9) return "medium";
  return "short";
}

function fitCopy(value: string | undefined, maxLength: number, fallback = "") {
  const clean = (value || fallback)
    .split(/\r?\n/)
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .join("\n")
    .trim();
  if (clean.length <= maxLength) return clean;
  const clipped = clean.slice(0, maxLength + 1);
  const lastWord = Math.max(clipped.lastIndexOf(" "), clipped.lastIndexOf("\n"));
  return `${clipped.slice(0, lastWord > maxLength * 0.65 ? lastWord : maxLength).trim()}…`;
}

function formatSequenceNumber(value: number) {
  return String(Math.max(0, value)).padStart(2, "0");
}

function fitSceneToCanvas(scene: Scene): Scene {
  if (scene.kind === "cover" || scene.kind === "blank") return scene;
  const cardBodyLimit = (scene.cards?.length || 0) >= 4 ? 120 : 165;
  const cards = scene.kind === "cards"
    ? (scene.cards?.length
        ? scene.cards.slice(0, 4)
        : [{
            title: scene.title || "Key idea",
            body: scene.subtitle || "The speaker’s main point.",
            icon: scene.icon || "sparkles",
          }]
      ).map((card, index) => ({
        ...card,
        tag: fitCopy(card.tag, 4, formatSequenceNumber(index + 1)),
        title: fitCopy(card.title, 48, `Idea ${index + 1}`),
        body: fitCopy(card.body, cardBodyLimit, "Supporting detail"),
      }))
    : scene.cards;

  return {
    ...scene,
    eyebrow: fitCopy(scene.eyebrow, 48, "LIVE PRESENTATION"),
    title: fitCopy(scene.title, 72, "A new idea takes the stage."),
    subtitle: scene.subtitle ? fitCopy(scene.subtitle, 180) : undefined,
    cards,
    metric: scene.kind === "metric" ? fitCopy(scene.metric, 14, "—") : scene.metric,
    metricLabel:
      scene.kind === "metric" ? fitCopy(scene.metricLabel, 48, "KEY SIGNAL") : scene.metricLabel,
    quote: scene.kind === "quote" ? fitCopy(scene.quote, 240, scene.title) : scene.quote,
    attribution:
      scene.kind === "quote" ? fitCopy(scene.attribution, 60, "LIVE TRANSCRIPT") : scene.attribution,
  };
}

function normalizeScene(command: DirectorCommand, current: Scene): Scene | null {
  if (command.action === "hold") return null;

  if (command.action === "merge_cards" && command.cards?.length) {
    return {
      ...current,
      id: `merge-${Date.now()}`,
      kind: "cards",
      cards: command.cards.slice(0, 4),
      title: command.scene?.title || current.title,
      subtitle: command.caption || command.scene?.subtitle || current.subtitle,
      eyebrow: command.scene?.eyebrow || current.eyebrow,
      accent: command.scene?.accent || current.accent,
      icon: command.scene?.icon || current.icon || "layers",
    };
  }

  const incoming = command.scene || {};
  const kind = incoming.kind || current.kind;
  return {
    ...current,
    ...incoming,
    id: `directed-${Date.now()}`,
    kind,
    eyebrow: incoming.eyebrow || current.eyebrow,
    title: incoming.title || current.title,
    accent: incoming.accent || current.accent,
    cards:
      kind === "cards"
        ? (incoming.cards || command.cards || current.cards || []).slice(0, 4)
        : incoming.cards,
  };
}

function Waveform({ active }: { active: boolean }) {
  return (
    <span className={`waveform ${active ? "is-active" : ""}`} aria-hidden="true">
      {Array.from({ length: 16 }, (_, index) => (
        <span
          key={index}
          style={{ "--bar": index } as CSSProperties}
        />
      ))}
    </span>
  );
}

function SceneCanvas({
  scene,
  sceneNumber = scene.sequence ?? 0,
  phase,
}: {
  scene: Scene;
  sceneNumber?: number;
  phase: "entering" | "exiting";
}) {
  if (scene.kind === "cover") {
    return (
      <article
        className={`scene-layer scene-cover is-${phase}`}
        aria-label={`${brand.name} welcome cover — ${brand.tagline}`}
      />
    );
  }

  if (scene.kind === "blank") {
    return (
      <article
        className={`scene-layer scene-blank is-${phase}`}
        aria-label="Blank presentation canvas waiting for the speaker"
      />
    );
  }

  const cardCount = Math.min(Math.max(scene.cards?.length || 1, 1), 4);
  const featuredCard = Math.max(sceneNumber - 1, 0) % cardCount;
  const primaryCopy = scene.kind === "quote" ? scene.quote : scene.title;
  const primaryDensity = copyDensity(
    primaryCopy,
    scene.kind === "quote" ? 12 : 7,
    scene.kind === "quote" ? 20 : 11,
  );
  const supportDensity = copyDensity(scene.subtitle, 15, 24);
  const metricLength = scene.metric?.length || 0;
  const metricDensity = metricLength > 9 ? "dense" : metricLength > 6 ? "medium" : "short";
  const usesImageLayout = Boolean(scene.backgroundImage) || scene.backgroundStatus === "reframing";
  const imageryClass = scene.backgroundImage
    ? "is-imagery-ready"
    : scene.backgroundStatus === "reframing"
      ? "is-imagery-reframing"
      : scene.backgroundStatus === "generating"
        ? "is-imagery-pending"
        : "is-imagery-plain";

  return (
    <article
      className={`scene-layer scene-${scene.kind} is-${phase} accent-${scene.accent} copy-${primaryDensity} support-${supportDensity} ${imageryClass} ${usesImageLayout ? "has-generated-background" : ""}`}
    >
      {scene.backgroundImage && (
        <>
          <div
            key={scene.backgroundImage}
            className="scene-background"
            style={{ backgroundImage: `url("${scene.backgroundImage}")` }}
            aria-hidden="true"
          />
          <div className="scene-background-wash" aria-hidden="true" />
        </>
      )}
      <div className="scene-noise" />
      <div className="scene-orbit scene-orbit-one" />
      <div className="scene-orbit scene-orbit-two" />
      <div className="scene-content">
        <p className="scene-eyebrow">
          <span />
          <span className="scene-eyebrow-label">{scene.eyebrow}</span>
        </p>

        {scene.kind === "hero" && (
          <div className="hero-layout">
            <h1>{scene.title}</h1>
            <div className="hero-aside">
              <span className="hero-icon-halo">
                <SemanticIcon name={scene.icon} className="hero-icon" />
              </span>
              {scene.subtitle && <p>{scene.subtitle}</p>}
            </div>
          </div>
        )}

        {scene.kind === "cards" && (
          <div className={`cards-layout cards-count-${cardCount}`}>
            <div className="scene-heading">
              <h2>{scene.title}</h2>
              {scene.subtitle && <p>{scene.subtitle}</p>}
            </div>
            <div className={`card-grid cards-count-${cardCount}`}>
              {(scene.cards || []).map((card, index) => (
                <div
                  className={`idea-card card-copy-${copyDensity(card.body, 14, 22)} ${index === featuredCard ? "is-featured" : ""}`}
                  key={`card-${index}`}
                  style={{ "--delay": `${index * 90}ms` } as CSSProperties}
                >
                  <div className="card-topline">
                    <span className="card-number">
                      {card.tag || formatSequenceNumber(index + 1)}
                    </span>
                    <i />
                    <span className="card-icon-chip">
                      <SemanticIcon name={card.icon || iconFromText(`${card.title} ${card.body}`)} />
                    </span>
                  </div>
                  <h3>{card.title}</h3>
                  <p>{card.body}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {scene.kind === "metric" && (
          <div className="metric-layout">
            <div className="metric-copy">
              <h2>{scene.title}</h2>
              {scene.subtitle && <p>{scene.subtitle}</p>}
            </div>
            <div className="metric-visual">
              <div className="metric-ring">
                <span className="metric-icon">
                  <SemanticIcon name={scene.icon || "chart"} />
                </span>
                <span className={`metric-value metric-${metricDensity}`}>{scene.metric}</span>
                <span className="metric-unit">{scene.metricLabel}</span>
              </div>
            </div>
          </div>
        )}

        {scene.kind === "quote" && (
          <div className="quote-layout">
            <span className="quote-mark">
              <SemanticIcon name={scene.icon || "quote"} />
            </span>
            <blockquote>{scene.quote}</blockquote>
            <div className="quote-footer">
              <span>{scene.attribution}</span>
              <i />
            </div>
          </div>
        )}
      </div>
    </article>
  );
}

function exportFileStem(firstScene?: Scene) {
  const title = (firstScene?.title || `${brand.slug}-presentation`)
    .replace(/\n/g, " ")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase()
    .slice(0, 48) || `${brand.slug}-presentation`;
  const timestamp = new Date().toISOString().slice(0, 16).replace(/[T:]/g, "-");
  return `${title}-${timestamp}`;
}

async function createPdfDocument(images: string[], firstScene?: Scene) {
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "pt",
    format: [960, 540],
    compress: true,
  });
  pdf.setProperties({
    title: firstScene?.title.replace(/\n/g, " ") || `${brand.name} presentation`,
    subject: `Live presentation captured by ${brand.name}`,
    author: brand.name,
    creator: `${brand.name} live presentations`,
  });
  images.forEach((image, index) => {
    if (index > 0) pdf.addPage([960, 540], "landscape");
    pdf.addImage(image, "JPEG", 0, 0, 960, 540, undefined, "FAST");
  });
  return pdf;
}

function ExportSlide({ scene, index }: { scene: Scene; index: number }) {
  return (
    <div className="stage-canvas export-slide" data-export-slide>
      <SceneCanvas scene={scene} sceneNumber={index + 1} phase="entering" />
      <div className="stage-footer">
        <span>{brand.display_name} / AUTO-DIRECTOR</span>
        <span className="stage-progress"><i /></span>
        <span>© 2026</span>
      </div>
    </div>
  );
}

export default function Home() {
  const [scene, setScene] = useState<Scene>(INITIAL_SCENE);
  const [previousScene, setPreviousScene] = useState<Scene | null>(null);
  const [connection, setConnection] = useState<ConnectionState>("ready");
  const [isListening, setIsListening] = useState(false);
  const [isDemoRunning, setIsDemoRunning] = useState(false);
  const [transcript, setTranscript] = useState(
    "Say something worth seeing. I’ll decide whether to hold, update, or create a new scene.",
  );
  const [partialTranscript, setPartialTranscript] = useState("");
  const [error, setError] = useState("");
  const [directorStatus, setDirectorStatus] = useState("Waiting for your first idea");
  const [turnCount, setTurnCount] = useState(0);
  const [history, setHistory] = useState<Scene[]>([INITIAL_SCENE]);
  const [deckScenes, setDeckScenes] = useState<Scene[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [exporting, setExporting] = useState<ExportFormat | null>(null);
  const [exportProgress, setExportProgress] = useState({ current: 0, total: 0 });
  const [deliveryMessage, setDeliveryMessage] = useState("Start speaking to build a downloadable deck");
  const [microphones, setMicrophones] = useState<MediaDeviceInfo[]>([]);
  const [selectedMicrophoneId, setSelectedMicrophoneId] = useState("");
  const [activeMicrophoneLabel, setActiveMicrophoneLabel] = useState("");
  const [isDetectingMicrophones, setIsDetectingMicrophones] = useState(false);
  const [selectedRealtimeModel, setSelectedRealtimeModel] =
    useState<RealtimeModel>(DEFAULT_REALTIME_MODEL);
  const [isModelSettingsOpen, setIsModelSettingsOpen] = useState(false);

  const sceneRef = useRef(scene);
  const stageFrameRef = useRef<HTMLDivElement | null>(null);
  const exportDeckRef = useRef<HTMLDivElement | null>(null);
  const transitionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const demoTimers = useRef<Array<ReturnType<typeof setTimeout>>>([]);
  const peerRef = useRef<RTCPeerConnection | null>(null);
  const channelRef = useRef<RTCDataChannel | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const handledCalls = useRef(new Set<string>());
  const intentionalCloseRef = useRef(false);
  const imageryAbortRef = useRef<AbortController | null>(null);
  const imageryRevealTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingImageryUrlRef = useRef<string | null>(null);
  const imageryUnavailableRef = useRef(false);
  const imageryUrlsRef = useRef(new Set<string>());
  const nextSceneSequenceRef = useRef(0);

  useEffect(() => {
    sceneRef.current = scene;
  }, [scene]);

  const refreshMicrophones = useCallback(async () => {
    if (!navigator.mediaDevices?.enumerateDevices) {
      setMicrophones([]);
      return [];
    }

    const devices = await navigator.mediaDevices.enumerateDevices();
    const audioInputs = devices.filter(
      (device, index, items) =>
        device.kind === "audioinput" &&
        device.deviceId !== "default" &&
        items.findIndex(
          (candidate) =>
            candidate.kind === "audioinput" && candidate.deviceId === device.deviceId,
        ) === index,
    );
    setMicrophones(audioInputs);
    return audioInputs;
  }, []);

  useEffect(() => {
    const handleDeviceChange = () => void refreshMicrophones();
    const initialRefresh = window.setTimeout(() => {
      const storedMicrophoneId = window.localStorage.getItem(MICROPHONE_STORAGE_KEY);
      if (storedMicrophoneId) setSelectedMicrophoneId(storedMicrophoneId);
      const storedRealtimeModel = window.localStorage.getItem(REALTIME_MODEL_STORAGE_KEY);
      if (isRealtimeModel(storedRealtimeModel)) setSelectedRealtimeModel(storedRealtimeModel);
      handleDeviceChange();
    }, 0);
    navigator.mediaDevices?.addEventListener?.("devicechange", handleDeviceChange);
    return () => {
      window.clearTimeout(initialRefresh);
      navigator.mediaDevices?.removeEventListener?.("devicechange", handleDeviceChange);
    };
  }, [refreshMicrophones]);

  const detectMicrophones = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setError("This browser does not support microphone selection.");
      return;
    }

    setIsDetectingMicrophones(true);
    setError("");
    try {
      const permissionStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      permissionStream.getTracks().forEach((track) => track.stop());
      await refreshMicrophones();
    } catch (microphoneError) {
      setError(
        microphoneError instanceof Error
          ? microphoneError.message
          : "Microphone access was not granted.",
      );
    } finally {
      setIsDetectingMicrophones(false);
    }
  }, [refreshMicrophones]);

  const chooseMicrophone = useCallback((deviceId: string) => {
    setSelectedMicrophoneId(deviceId);
    if (deviceId) {
      window.localStorage.setItem(MICROPHONE_STORAGE_KEY, deviceId);
    } else {
      window.localStorage.removeItem(MICROPHONE_STORAGE_KEY);
    }
  }, []);

  const chooseRealtimeModel = useCallback((model: RealtimeModel) => {
    setSelectedRealtimeModel(model);
    window.localStorage.setItem(REALTIME_MODEL_STORAGE_KEY, model);
    setIsModelSettingsOpen(false);
  }, []);

  const stageScene = useCallback((next: Scene, deckMutation: DeckMutation = "append") => {
    if (deckMutation !== "update" && transitionTimer.current) {
      clearTimeout(transitionTimer.current);
      transitionTimer.current = null;
    }
    const fittedNext = fitSceneToCanvas(next);
    const outgoing = sceneRef.current;
    let sequence = fittedNext.sequence ?? 0;
    if (deckMutation === "append") {
      sequence = nextSceneSequenceRef.current + 1;
      nextSceneSequenceRef.current = sequence;
    } else if (deckMutation === "update" && sequence <= 0) {
      sequence = outgoing.sequence && outgoing.sequence > 0
        ? outgoing.sequence
        : nextSceneSequenceRef.current + 1;
      nextSceneSequenceRef.current = Math.max(nextSceneSequenceRef.current, sequence);
    }
    const numberedNext: Scene = { ...fittedNext, sequence };
    const isLogicalSceneUpdate =
      deckMutation === "update" &&
      outgoing.kind !== "cover" &&
      outgoing.kind !== "blank" &&
      outgoing.sequence === sequence;
    const startsLogicalScene =
      deckMutation === "append" || (deckMutation === "update" && !isLogicalSceneUpdate);

    if (!isLogicalSceneUpdate) {
      if (imageryRevealTimerRef.current) {
        clearTimeout(imageryRevealTimerRef.current);
        imageryRevealTimerRef.current = null;
      }
      if (pendingImageryUrlRef.current) {
        URL.revokeObjectURL(pendingImageryUrlRef.current);
        imageryUrlsRef.current.delete(pendingImageryUrlRef.current);
        pendingImageryUrlRef.current = null;
      }
      imageryAbortRef.current?.abort();
      imageryAbortRef.current = null;
    }

    const canGenerateImagery =
      v7.imagery.enabled &&
      !imageryUnavailableRef.current &&
      startsLogicalScene &&
      numberedNext.kind !== "cover" &&
      numberedNext.kind !== "blank";
    const stagedNext: Scene = isLogicalSceneUpdate
      ? {
          ...numberedNext,
          backgroundImage: outgoing.backgroundImage,
          backgroundStatus: outgoing.backgroundStatus,
        }
      : startsLogicalScene
        ? {
            ...numberedNext,
            backgroundImage: undefined,
            backgroundStatus: canGenerateImagery ? "generating" : undefined,
          }
        : numberedNext;
    const shouldTransitionScenes = deckMutation !== "update" && outgoing.id !== stagedNext.id;
    if (shouldTransitionScenes) {
      setPreviousScene(outgoing);
    } else if (deckMutation !== "update") {
      setPreviousScene(null);
    }
    setScene(stagedNext);
    sceneRef.current = stagedNext;
    setHistory((items) =>
      [
        ...items.filter((item) =>
          deckMutation === "update"
            ? item.sequence !== stagedNext.sequence
            : item.id !== stagedNext.id,
        ),
        stagedNext,
      ].slice(
        -v7.presentation.recent_scene_limit,
      ),
    );
    if (
      stagedNext.kind !== "blank" &&
      stagedNext.kind !== "cover" &&
      deckMutation !== "view"
    ) {
      setDeckScenes((items) => {
        if (deckMutation === "update" && items.length) {
          return [...items.slice(0, -1), stagedNext];
        }
        return [...items, stagedNext];
      });
      setDeliveryMessage("Presentation is building — stop when you are ready to export");
    }
    if (shouldTransitionScenes) {
      transitionTimer.current = setTimeout(() => setPreviousScene(null), 820);
    }

    if (!canGenerateImagery) return;

    const controller = new AbortController();
    imageryAbortRef.current = controller;
    const requestedSceneId = stagedNext.id;
    const requestedSceneSequence = stagedNext.sequence;
    const isRequestedSceneCurrent = () =>
      sceneRef.current.sequence === requestedSceneSequence;

    void (async () => {
      try {
        const response = await fetch("/api/imagery", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sceneId: requestedSceneId,
            kind: stagedNext.kind,
            eyebrow: stagedNext.eyebrow,
            title: stagedNext.title,
            subtitle: stagedNext.subtitle,
            metric: stagedNext.metric,
            metricLabel: stagedNext.metricLabel,
            quote: stagedNext.quote,
            cards: stagedNext.cards,
            accent: stagedNext.accent,
          }),
          signal: controller.signal,
        });

        if (!response.ok) {
          if (response.status === 503) imageryUnavailableRef.current = true;
          throw new Error("Scene imagery was unavailable.");
        }

        const imageBlob = await response.blob();
        if (controller.signal.aborted || !isRequestedSceneCurrent()) return;

        const imageUrl = URL.createObjectURL(imageBlob);
        imageryUrlsRef.current.add(imageUrl);
        const decodedImage = new Image();
        decodedImage.src = imageUrl;
        try {
          await decodedImage.decode();
        } catch {
          // The browser can still render the object URL even when decode is unavailable.
        }
        if (controller.signal.aborted || !isRequestedSceneCurrent()) {
          URL.revokeObjectURL(imageUrl);
          imageryUrlsRef.current.delete(imageUrl);
          return;
        }
        const syncCurrentScene = (nextScene: Scene) => {
          setScene(nextScene);
          sceneRef.current = nextScene;
          setHistory((items) =>
            items.map((item) =>
              item.sequence === requestedSceneSequence ? nextScene : item,
            ),
          );
          setDeckScenes((items) =>
            items.map((item) =>
              item.sequence === requestedSceneSequence ? nextScene : item,
            ),
          );
        };
        const revealImage = () => {
          if (!isRequestedSceneCurrent()) {
            URL.revokeObjectURL(imageUrl);
            imageryUrlsRef.current.delete(imageUrl);
            pendingImageryUrlRef.current = null;
            return;
          }
          pendingImageryUrlRef.current = null;
          syncCurrentScene({
            ...sceneRef.current,
            backgroundImage: imageUrl,
            backgroundStatus: "ready",
          });
        };
        const alreadyReservedImageSpace = Boolean(sceneRef.current.backgroundImage);
        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        if (alreadyReservedImageSpace || reduceMotion) {
          revealImage();
        } else {
          pendingImageryUrlRef.current = imageUrl;
          syncCurrentScene({
            ...sceneRef.current,
            backgroundStatus: "reframing",
          });
          imageryRevealTimerRef.current = setTimeout(() => {
            imageryRevealTimerRef.current = null;
            if (pendingImageryUrlRef.current !== imageUrl) return;
            revealImage();
          }, IMAGE_REFLOW_DELAY_MS);
        }
      } catch {
        if (controller.signal.aborted || !isRequestedSceneCurrent()) return;
        const unavailableScene: Scene = {
          ...sceneRef.current,
          backgroundStatus: "unavailable",
        };
        setScene(unavailableScene);
        sceneRef.current = unavailableScene;
        setHistory((items) =>
          items.map((item) =>
            item.sequence === requestedSceneSequence ? unavailableScene : item,
          ),
        );
        setDeckScenes((items) =>
          items.map((item) =>
            item.sequence === requestedSceneSequence ? unavailableScene : item,
          ),
        );
      } finally {
        if (imageryAbortRef.current === controller) imageryAbortRef.current = null;
      }
    })();
  }, []);

  const stopDemo = useCallback(() => {
    demoTimers.current.forEach(clearTimeout);
    demoTimers.current = [];
    setIsDemoRunning(false);
  }, []);

  const runDemo = useCallback(() => {
    stopDemo();
    setError("");
    setIsDemoRunning(true);
    DEMO_BEATS.forEach((beat, index) => {
      const timer = setTimeout(() => {
        setTranscript(beat.transcript);
        setPartialTranscript("");
        setDirectorStatus("Demo scene composed");
        stageScene(beat.scene, "append");
        if (index === DEMO_BEATS.length - 1) setIsDemoRunning(false);
      }, index * 2850 + 220);
      demoTimers.current.push(timer);
    });
  }, [stageScene, stopDemo]);

  const acknowledgeTool = useCallback((callId: string, payload: object) => {
    const channel = channelRef.current;
    if (!channel || channel.readyState !== "open") return;
    channel.send(
      JSON.stringify({
        type: "conversation.item.create",
        item: {
          type: "function_call_output",
          call_id: callId,
          output: JSON.stringify(payload),
        },
      }),
    );
  }, []);

  const handleDirectorCall = useCallback(
    (callId: string, rawArguments: string) => {
      if (!callId || handledCalls.current.has(callId)) return;
      handledCalls.current.add(callId);
      try {
        const command = JSON.parse(rawArguments) as DirectorCommand;
        const next = normalizeScene(command, sceneRef.current);
        if (next) {
          stageScene(
            next,
            command.action === "replace" ? "append" : "update",
          );
        }
        setDirectorStatus(
          command.action === "hold"
            ? "Held — no visual change"
            : command.action === "merge_cards"
              ? "Updated cards"
              : command.action === "focus"
                ? "Focused current scene"
                : "Composed a new scene",
        );
        acknowledgeTool(callId, {
          ok: true,
          action: next ? "staged" : "held",
          scene_id: next?.id || sceneRef.current.id,
        });
      } catch {
        setDirectorStatus("Director command failed");
        acknowledgeTool(callId, { ok: false, error: "Invalid scene command" });
      }
    },
    [acknowledgeTool, stageScene],
  );

  const handleRealtimeEvent = useCallback(
    (message: MessageEvent<string>) => {
      try {
        const event = JSON.parse(message.data) as Record<string, unknown>;
        const type = String(event.type || "");

        if (type === "input_audio_buffer.speech_started") {
          setIsListening(true);
          setPartialTranscript("");
          setDirectorStatus("Listening…");
        }
        if (type === "input_audio_buffer.speech_stopped") {
          setIsListening(false);
          setDirectorStatus("Directing your last thought…");
        }
        if (type === "conversation.item.input_audio_transcription.delta") {
          setPartialTranscript((value) => value + String(event.delta || ""));
        }
        if (type === "conversation.item.input_audio_transcription.completed") {
          const completed = String(event.transcript || "").trim();
          if (completed) {
            setTranscript(completed);
            setTurnCount((count) => count + 1);
          }
          setPartialTranscript("");
        }
        if (type === "response.function_call_arguments.done") {
          handleDirectorCall(String(event.call_id || ""), String(event.arguments || "{}"));
        }
        if (type === "response.output_item.done") {
          const item = event.item as Record<string, unknown> | undefined;
          if (item?.type === "function_call") {
            handleDirectorCall(String(item.call_id || ""), String(item.arguments || "{}"));
          }
        }
        if (type === "error") {
          const detail = event.error as Record<string, unknown> | undefined;
          const message = String(detail?.message || "The realtime session reported an error.");
          if (/active response in progress/i.test(message)) {
            setError("");
            return;
          }
          setError(message);
          setDirectorStatus("Realtime error");
        }
      } catch {
        // Ignore non-JSON data-channel messages.
      }
    },
    [handleDirectorCall],
  );

  const stopLive = useCallback(() => {
    intentionalCloseRef.current = true;
    channelRef.current?.close();
    peerRef.current?.close();
    streamRef.current?.getTracks().forEach((track) => track.stop());
    audioRef.current?.pause();
    channelRef.current = null;
    peerRef.current = null;
    streamRef.current = null;
    audioRef.current = null;
    handledCalls.current.clear();
    setActiveMicrophoneLabel("");
    setConnection("ready");
    setIsListening(false);
    setDirectorStatus("Presentation stopped");
    setDeliveryMessage("Presentation stopped — PDF and PowerPoint downloads are ready");
  }, []);

  const startLive = useCallback(async () => {
    if (connection === "live" || connection === "connecting") return;

    stopDemo();
    intentionalCloseRef.current = false;
    setConnection("connecting");
    setError("");
    setTurnCount(0);
    setDirectorStatus("Starting voice director…");
    setDeliveryMessage("Presentation is live — exports unlock when listening stops");

    try {
      const availableMicrophones = await refreshMicrophones();
      const requestedMicrophoneId = availableMicrophones.some(
        (device) => device.deviceId === selectedMicrophoneId,
      )
        ? selectedMicrophoneId
        : "";
      if (selectedMicrophoneId && !requestedMicrophoneId) chooseMicrophone("");

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          ...(requestedMicrophoneId
            ? { deviceId: { exact: requestedMicrophoneId } }
            : {}),
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      streamRef.current = stream;
      const microphoneTrack = stream.getAudioTracks()[0];
      setActiveMicrophoneLabel(
        microphoneTrack?.label ||
          availableMicrophones.find((device) => device.deviceId === requestedMicrophoneId)?.label ||
          "System default microphone",
      );
      await refreshMicrophones();

      const peer = new RTCPeerConnection();
      peerRef.current = peer;
      stream.getTracks().forEach((track) => peer.addTrack(track, stream));

      const audio = new Audio();
      audio.autoplay = true;
      audioRef.current = audio;
      peer.ontrack = (event) => {
        audio.srcObject = event.streams[0];
      };

      const channel = peer.createDataChannel("oai-events");
      channelRef.current = channel;
      channel.addEventListener("message", handleRealtimeEvent);
      channel.addEventListener("open", () => {
        setConnection("live");
        setTranscript("Listening continuously. Speak whenever you’re ready.");
        setDirectorStatus("Listening for your first idea");
      });
      channel.addEventListener("close", () => {
        if (intentionalCloseRef.current) return;
        stream.getTracks().forEach((track) => track.stop());
        setConnection("error");
        setIsListening(false);
        setDirectorStatus("Live connection ended");
        setError("The live connection ended unexpectedly. Start the presentation again.");
      });

      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);
      const response = await fetch("/api/realtime", {
        method: "POST",
        headers: {
          "Content-Type": "application/sdp",
          "X-ZeroPrep-Realtime-Model": selectedRealtimeModel,
        },
        body: offer.sdp,
      });

      if (!response.ok) {
        const detail = await response.text();
        throw new Error(detail || "Unable to create the realtime session.");
      }

      await peer.setRemoteDescription({
        type: "answer",
        sdp: await response.text(),
      });
    } catch (liveError) {
      stopLive();
      setConnection("error");
      setDirectorStatus("Could not start");
      setError(
        liveError instanceof Error
          ? liveError.message
          : "Unable to start the live voice session.",
      );
    }
  }, [
    chooseMicrophone,
    connection,
    handleRealtimeEvent,
    refreshMicrophones,
    selectedMicrophoneId,
    selectedRealtimeModel,
    stopDemo,
    stopLive,
  ]);

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === stageFrameRef.current);
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  const toggleFullscreen = useCallback(async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
        return;
      }
      if (!stageFrameRef.current?.requestFullscreen) {
        throw new Error("Fullscreen is not supported in this browser.");
      }
      await stageFrameRef.current.requestFullscreen();
    } catch (fullscreenError) {
      setError(
        fullscreenError instanceof Error
          ? fullscreenError.message
          : "Could not enter fullscreen mode.",
      );
    }
  }, []);

  const captureExportSlides = useCallback(async () => {
    const root = exportDeckRef.current;
    const slideNodes = root
      ? Array.from(root.querySelectorAll<HTMLElement>("[data-export-slide]"))
      : [];
    if (!slideNodes.length) throw new Error("There are no completed scenes to export yet.");

    if ("fonts" in document) await document.fonts.ready;
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
    });

    const { toJpeg } = await import("html-to-image");
    const images: string[] = [];
    setExportProgress({ current: 0, total: slideNodes.length });

    for (let index = 0; index < slideNodes.length; index += 1) {
      setExportProgress({ current: index + 1, total: slideNodes.length });
      images.push(
        await toJpeg(slideNodes[index], {
          width: v7.delivery.export_width_px,
          height: v7.delivery.export_height_px,
          canvasWidth: v7.delivery.export_width_px,
          canvasHeight: v7.delivery.export_height_px,
          pixelRatio: 1,
          quality: v7.delivery.capture.quality,
          backgroundColor: "#e9e7df",
          cacheBust: true,
        }),
      );
    }

    return images;
  }, []);

  const exportPresentation = useCallback(
    async (format: ExportFormat) => {
      if (exporting || !deckScenes.length) return;
      if (connection === "live" || connection === "connecting" || isDemoRunning) {
        setDeliveryMessage("Stop the presentation before exporting the completed deck");
        return;
      }

      setError("");
      setExporting(format);
      setDeliveryMessage(`Preparing ${format === "pdf" ? "PDF" : "PowerPoint"}…`);

      try {
        const images = await captureExportSlides();
        const fileStem = exportFileStem(deckScenes[0]);

        if (format === "pdf") {
          const pdf = await createPdfDocument(images, deckScenes[0]);
          pdf.save(`${fileStem}.pdf`);
        } else {
          const { default: PptxGenJS } = await import("pptxgenjs");
          const pptx = new PptxGenJS();
          pptx.layout = "LAYOUT_WIDE";
          pptx.author = brand.name;
          pptx.company = `${brand.name} live presentations`;
          pptx.subject = `Live presentation captured by ${brand.name}`;
          pptx.title = deckScenes[0]?.title.replace(/\n/g, " ") || `${brand.name} presentation`;
          images.forEach((image) => {
            const slide = pptx.addSlide();
            slide.background = { color: "E9E7DF" };
            slide.addImage({ data: image, x: 0, y: 0, w: 13.333, h: 7.5 });
          });
          await pptx.writeFile({
            fileName: `${fileStem}.pptx`,
            compression: true,
          });
        }

        setDeliveryMessage(
          `${format === "pdf" ? "PDF" : "PowerPoint"} downloaded — ${deckScenes.length} scenes`,
        );
      } catch (exportError) {
        const message =
          exportError instanceof Error
            ? exportError.message
            : "The presentation could not be exported.";
        setError(message);
        setDeliveryMessage("Export failed — try again");
      } finally {
        setExporting(null);
        setExportProgress({ current: 0, total: 0 });
      }
    },
    [captureExportSlides, connection, deckScenes, exporting, isDemoRunning],
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.tagName === "INPUT" || target?.tagName === "TEXTAREA") return;
      if (event.key.toLowerCase() === "d") runDemo();
      if (event.key.toLowerCase() === "f") {
        event.preventDefault();
        void toggleFullscreen();
      }
      if (
        connection !== "live" &&
        connection !== "connecting" &&
        document.fullscreenElement === stageFrameRef.current &&
        deckScenes.length &&
        (event.key === "ArrowLeft" || event.key === "ArrowRight")
      ) {
        event.preventDefault();
        const currentIndex = deckScenes.findIndex((item) => item.id === sceneRef.current.id);
        const startingIndex = currentIndex >= 0 ? currentIndex : deckScenes.length - 1;
        const nextIndex =
          event.key === "ArrowRight"
            ? Math.min(startingIndex + 1, deckScenes.length - 1)
            : Math.max(startingIndex - 1, 0);
        stageScene(deckScenes[nextIndex], "view");
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [connection, deckScenes, runDemo, stageScene, toggleFullscreen]);

  useEffect(() => {
    const imageryUrls = imageryUrlsRef.current;
    return () => {
      stopDemo();
      stopLive();
      imageryAbortRef.current?.abort();
      if (imageryRevealTimerRef.current) clearTimeout(imageryRevealTimerRef.current);
      imageryRevealTimerRef.current = null;
      pendingImageryUrlRef.current = null;
      imageryUrls.forEach((url) => URL.revokeObjectURL(url));
      imageryUrls.clear();
      if (transitionTimer.current) clearTimeout(transitionTimer.current);
    };
  }, [stopDemo, stopLive]);

  const displayTranscript = partialTranscript || transcript;
  const statusLabel =
    connection === "live"
      ? isListening
        ? "Listening"
        : "Live"
      : connection === "connecting"
        ? "Connecting"
        : isDemoRunning
          ? "Demo running"
          : connection === "error"
            ? "Needs setup"
            : "Ready";
  const canExport =
    deckScenes.length > 0 &&
    connection !== "live" &&
    connection !== "connecting" &&
    !isDemoRunning;
  const isWelcomeScene = scene.kind === "cover" || scene.kind === "blank";
  const activeDeckIndex = deckScenes.findIndex((item) => item.id === scene.id);
  const stageSceneNumber =
    isWelcomeScene
      ? 0
      : scene.sequence ?? (activeDeckIndex >= 0 ? activeDeckIndex + 1 : deckScenes.length);
  const deliveryStatus = exporting
    ? `Rendering scene ${exportProgress.current} of ${exportProgress.total}`
    : deliveryMessage;
  const selectedMicrophone = microphones.find(
    (device) => device.deviceId === selectedMicrophoneId,
  );
  const selectedRealtimeModelOption =
    REALTIME_MODEL_OPTIONS.find((option) => option.id === selectedRealtimeModel) ??
    REALTIME_MODEL_OPTIONS[0];
  const microphoneHelp =
    connection === "live"
      ? `LIVE INPUT / ${activeMicrophoneLabel || "SYSTEM DEFAULT MICROPHONE"}`
      : isDetectingMicrophones
        ? "CHECKING MICROPHONE ACCESS…"
        : microphones.length === 0
          ? "NO INPUTS FOUND / CONNECT A MICROPHONE AND DETECT AGAIN"
          : microphones.some((device) => device.label)
            ? `${microphones.length} INPUT${microphones.length === 1 ? "" : "S"} AVAILABLE`
            : "DEVICE NAMES HIDDEN / SELECT DETECT TO REVEAL THEM";

  return (
    <main className="app-shell">
      <header className="app-header">
        <a className="brand" href="#studio" aria-label={`${brand.name} home`}>
          <span className="brand-mark">{brand.mark}</span>
          <span>
            <strong>{brand.display_name}</strong>
            <small>{brand.category} / ZERO PREP</small>
          </span>
        </a>
        <div className="header-center">
          <span className={`status-dot status-${connection}`} />
          {statusLabel}
          <span className="header-divider" />
          {selectedRealtimeModelOption.shortLabel} / {v7.release}
        </div>
        <div className="header-actions">
          <span className="keyboard-hint"><kbd>D</kbd> demo · <kbd>F</kbd> full screen</span>
          <button
            className="present-button"
            type="button"
            onClick={() => void toggleFullscreen()}
            aria-label={isFullscreen ? "Exit fullscreen presentation" : "Present in fullscreen"}
          >
            {isFullscreen ? "Exit full screen" : "Present full screen"}
            {isFullscreen ? <Minimize2 aria-hidden="true" /> : <Maximize2 aria-hidden="true" />}
          </button>
        </div>
      </header>

      <div className="studio" id="studio">
        <section className="stage-panel" aria-label="Live presentation canvas">
          <div className="stage-frame" ref={stageFrameRef}>
            <button
              className="fullscreen-exit"
              type="button"
              onClick={() => void toggleFullscreen()}
              aria-label="Exit fullscreen presentation"
            >
              <Minimize2 aria-hidden="true" />
              Exit
            </button>
            <div className="stage-chrome">
              <span>
                {brand.display_name} / LIVE CANVAS
              </span>
              <span>
                {scene.kind === "cover"
                  ? "ZEROPREP COVER / AWAITING SPEECH"
                  : scene.kind === "blank"
                    ? "BLANK / AWAITING SPEECH"
                    : `${scene.kind.toUpperCase()} COMPOSITION`}
              </span>
              <span>
                16:9 / {scene.backgroundStatus === "generating"
                  ? "IMAGERY RENDERING"
                  : scene.backgroundStatus === "reframing"
                    ? "LAYOUT REFLOW"
                    : scene.backgroundImage
                      ? "GEMINI IMAGE LIVE"
                      : "LIVE"}
              </span>
            </div>
            <div className="stage-canvas" aria-live="polite">
              {previousScene && (
                <SceneCanvas
                  scene={previousScene}
                  sceneNumber={previousScene.sequence ?? Math.max(0, stageSceneNumber - 1)}
                  phase="exiting"
                />
              )}
              <SceneCanvas
                key={`scene-${stageSceneNumber}`}
                scene={scene}
                sceneNumber={stageSceneNumber}
                phase="entering"
              />
              {!isWelcomeScene && (
                <div className="stage-footer">
                  <span>
                    {brand.display_name} / AUTO-DIRECTOR
                  </span>
                  <span className="stage-progress"><i /></span>
                  <span>© 2026</span>
                </div>
              )}
            </div>
          </div>

          <div className="scene-strip" aria-label="Recent scenes">
            <span className="strip-label">RECENT SCENES</span>
            <div className="strip-items">
              {history.map((item, index) => (
                <button
                  className={`strip-scene ${item.id === scene.id ? "is-current" : ""}`}
                  key={item.id}
                  type="button"
                  onClick={() => stageScene(item, "view")}
                  disabled={connection === "live" || connection === "connecting"}
                  aria-label={`Show ${item.title.replace(/\n/g, " ")}`}
                >
                  <span>
                    {item.kind === "blank" || item.kind === "cover"
                      ? "00"
                      : formatSequenceNumber(
                          item.sequence ?? history
                            .slice(0, index + 1)
                            .filter(
                              (recent) => recent.kind !== "blank" && recent.kind !== "cover",
                            ).length,
                        )}
                  </span>
                  <i className={`mini-accent accent-${item.accent}`} />
                </button>
              ))}
            </div>
          </div>

          <div className="delivery-bar" aria-label="Present and export">
            <div className="delivery-copy">
              <span>DELIVERY MODE / {formatSequenceNumber(deckScenes.length)} SCENES</span>
              <strong>{deliveryStatus}</strong>
            </div>
            <div className="delivery-actions">
              <button
                className="delivery-button"
                type="button"
                onClick={() => void toggleFullscreen()}
              >
                {isFullscreen ? <Minimize2 aria-hidden="true" /> : <Maximize2 aria-hidden="true" />}
                <span>{isFullscreen ? "Exit" : "Full screen"}</span>
              </button>
              <button
                className="delivery-button"
                type="button"
                disabled={!canExport || exporting !== null}
                onClick={() => void exportPresentation("pdf")}
                aria-label="Download completed presentation as PDF"
              >
                <FileText aria-hidden="true" />
                <span>{exporting === "pdf" ? "Rendering…" : "PDF"}</span>
              </button>
              <button
                className="delivery-button"
                type="button"
                disabled={!canExport || exporting !== null}
                onClick={() => void exportPresentation("pptx")}
                aria-label="Download completed presentation as PowerPoint"
              >
                <Presentation aria-hidden="true" />
                <span>{exporting === "pptx" ? "Rendering…" : "PowerPoint"}</span>
              </button>
            </div>
          </div>
        </section>

        <aside className="director-panel" aria-label="Presentation director">
          <div className="director-heading">
            <div>
              <p>VOICE DIRECTOR</p>
              <h2>Make the room<br />feel your point.</h2>
            </div>
            <span
              className={`model-pill ${selectedRealtimeModel.endsWith("-mini") ? "is-mini" : ""}`}
              title={selectedRealtimeModelOption.label}
            >
              {selectedRealtimeModel.endsWith("-mini") ? "MINI" : "2.1"}
            </span>
          </div>

          <div className={`listening-card ${isListening ? "is-listening" : ""}`}>
            <div className="listening-topline">
              <span>{statusLabel.toUpperCase()}</span>
              <Waveform active={isListening || isDemoRunning} />
            </div>
            <p className={partialTranscript ? "is-partial" : ""}>“{displayTranscript}”</p>
            <div className="listening-meta">
              <span>
                {connection === "live"
                  ? `TURN ${String(turnCount).padStart(2, "0")} / VOICE + INTENT`
                  : "LOCAL PREVIEW"}
              </span>
              <span>{directorStatus.toUpperCase()}</span>
            </div>
          </div>

          <div className={`microphone-picker ${connection === "live" ? "is-live" : ""}`}>
            <div className="microphone-picker-heading">
              <label htmlFor="microphone-input">MICROPHONE INPUT</label>
              <button
                type="button"
                onClick={() => void detectMicrophones()}
                disabled={
                  connection === "live" ||
                  connection === "connecting" ||
                  isDetectingMicrophones
                }
              >
                {isDetectingMicrophones ? "DETECTING…" : "DETECT"}
              </button>
            </div>
            <div className="microphone-control-row">
              <div className="microphone-select-shell">
                <Headphones aria-hidden="true" />
                <select
                  id="microphone-input"
                  value={selectedMicrophoneId}
                  onChange={(event) => chooseMicrophone(event.target.value)}
                  disabled={
                    connection === "live" ||
                    connection === "connecting" ||
                    isDetectingMicrophones
                  }
                  aria-describedby="microphone-help"
                >
                  <option value="">System default microphone</option>
                  {selectedMicrophoneId && !selectedMicrophone && (
                    <option value={selectedMicrophoneId}>Previously selected microphone</option>
                  )}
                  {microphones.map((device, index) => (
                    <option key={device.deviceId || `microphone-${index}`} value={device.deviceId}>
                      {device.label || `Microphone ${index + 1}`}
                    </option>
                  ))}
                </select>
                <span aria-hidden="true">⌄</span>
              </div>
              <button
                className="model-settings-toggle"
                type="button"
                onClick={() => setIsModelSettingsOpen((isOpen) => !isOpen)}
                disabled={connection === "live" || connection === "connecting"}
                aria-label={`Choose voice model. Current model: ${selectedRealtimeModelOption.label}`}
                aria-expanded={isModelSettingsOpen}
                aria-controls="voice-model-settings"
                title="Voice model settings"
              >
                <Settings aria-hidden="true" />
              </button>
            </div>
            {isModelSettingsOpen && (
              <div className="model-settings-panel" id="voice-model-settings">
                <div className="model-settings-heading">
                  <span>VOICE MODEL</span>
                  <strong>Applies to the next session</strong>
                </div>
                <div className="model-options" role="radiogroup" aria-label="Voice model">
                  {REALTIME_MODEL_OPTIONS.map((option) => {
                    const isSelected = option.id === selectedRealtimeModel;
                    return (
                      <button
                        key={option.id}
                        className={isSelected ? "is-selected" : ""}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        onClick={() => chooseRealtimeModel(option.id)}
                      >
                        <span>
                          <strong>{option.label}</strong>
                          <small>{option.description}</small>
                        </span>
                        <i>{option.badge}</i>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            <small id="microphone-help">{microphoneHelp}</small>
          </div>

          {connection === "live" ? (
            <button
              className="mic-button stop-button"
              type="button"
              onClick={stopLive}
              aria-label="Stop presentation and end continuous listening"
            >
              <span className="stop-icon" aria-hidden="true"><i /></span>
              <span>
                <strong>Stop presentation</strong>
                <small>End continuous listening</small>
              </span>
              <span className="mic-arrow">■</span>
            </button>
          ) : (
            <button
              className="mic-button"
              type="button"
              onClick={() => void startLive()}
              disabled={connection === "connecting"}
              aria-label="Start presentation and listen continuously"
            >
              <span className="mic-icon" aria-hidden="true"><i /></span>
              <span>
                <strong>
                  {connection === "connecting"
                    ? "Starting presentation…"
                    : "Start live presentation"}
                </strong>
                <small>Listens continuously until stopped</small>
              </span>
              <span className="mic-arrow">↗</span>
            </button>
          )}

          {error && (
            <div className="error-note" role="alert">
              <span>!</span>
              <p>{error}</p>
            </div>
          )}

          <div className="decision-legend">
            <p>THE DIRECTOR DECIDES</p>
            <ul>
              <li><span>Hold</span><small>Filler or continuation</small></li>
              <li><span>Update</span><small>Same idea, more detail</small></li>
              <li><span>Compose</span><small>New visual beat</small></li>
            </ul>
          </div>
        </aside>
      </div>

      <div className="export-deck" ref={exportDeckRef} aria-hidden="true">
        {deckScenes.map((deckScene, index) => (
          <ExportSlide key={deckScene.id} scene={deckScene} index={index} />
        ))}
      </div>
    </main>
  );
}
