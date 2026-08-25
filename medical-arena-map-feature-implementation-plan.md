# Medical Arena — Knowledge Map / Canvas Feature
## Implementation Plan for Coding Agent

> **Purpose:** This file is an execution-ready implementation specification for adding a **Guide / Chat / Map** experience to the existing Medical Arena React Native Expo app.
>
> **Target:** A coding agent operating inside the repository should be able to implement this feature directly from this file without needing product clarification.
>
> **Repository:** `motohamy1/med-container-app`
>
> **Important:** This plan is based on the current repository structure and existing architecture. Do **not** replace the existing application architecture or redesign unrelated screens.

---

# 0. NON-NEGOTIABLE EXECUTION RULES

The coding agent MUST follow these rules.

1. **Do not rewrite unrelated code.**
2. **Do not replace Expo Router.**
3. **Do not introduce Redux/Zustand/another global state manager just for this feature.**
4. Reuse the existing dependencies whenever possible.
5. Prefer `react-native-svg`, `react-native-gesture-handler`, and `react-native-reanimated`, which are already used/installed in this project.
6. Do not add a heavyweight graph library unless there is a concrete implementation blocker.
7. Do not change the existing Medical Arena visual identity:
   - dark clinical interface
   - teal/turquoise primary identity
   - warm gold as signal/accent
   - lavender/pink for semantic states where already established
   - restrained, clinical, premium appearance
8. Do not create a flashy neon mind-map.
9. Do not add glassmorphism, rainbow node colors, excessive glow, particle effects, or decorative graph animations.
10. Keep animation state-driven and subtle, aligned with the project's 150–250 ms motion discipline.
11. Keep the current Guide and Chat behavior working exactly as before.
12. The Map is a **new representation of the same medical context**, not a new independent source of medical truth.
13. The Map must be usable even when the AI has not yet generated a perfect graph.
14. The first implementation should use deterministic local graph generation from existing structured content, then optionally enrich from the AI.
15. Never invent medical facts in the client. The graph should be generated from available structured topic content and/or explicit backend-generated structured graph data.
16. The coding agent must inspect the existing source files before editing them.
17. Before changing any file, confirm its current implementation and preserve existing conventions.
18. Run lint/type checks/tests after each major phase.
19. Do not silently break the existing topic route, chat route, or backend.
20. At the end, produce a concise implementation summary and list every modified/created file.

---

# 1. PRODUCT GOAL

Medical Arena currently lets the clinician:

- browse a medical specialty
- open a topic
- read the clinical guide
- open the AI assistant and ask questions
- receive structured clinical responses and citations

The new feature adds a **visual knowledge representation** of the same topic/conversation.

The mental model is:

```text
                      SAME MEDICAL CONTEXT
                              |
                +-------------+-------------+
                |             |             |
              Guide         Chat           Map
                |             |             |
             Read it       Ask it       Understand
                                          relationships
```

## User-facing terminology

### Topic screen
Use:

**Guide | Chat | Map**

### Global Chat Arena
Use:

**Chat | Map**

Do NOT call the user-facing mode "Canvas".

Internally, implementation names may use:

- `KnowledgeMap`
- `KnowledgeCanvas`
- `MedicalKnowledgeGraph`

Recommended internal naming:

- `KnowledgeMap`
- `KnowledgeMapCanvas`
- `KnowledgeMapNode`
- `KnowledgeMapEdge`

---

# 2. WHAT THE MAP IS

The Map is an interactive knowledge graph representing relationships among medical concepts.

Example:

```text
                HEART FAILURE
                      |
          +-----------+-----------+
          |           |           |
       Etiology    Symptoms    Diagnosis
          |           |           |
      Ischemic      Dyspnea      BNP
      Hypertension  Edema         Echo
      Valvular      Orthopnea     CXR
                      |
                 Management
                      |
          +-----------+-----------+
          |           |           |
      Diuretics      ACEi     Beta-blocker
```

This is NOT intended to be a complete ontology of medicine.

It is a **contextual map of the current topic/conversation**.

The current topic is the graph root.

---

# 3. CORE UX PRINCIPLES

## 3.1 Guide

Guide is linear and readable.

Use existing `ClinicalGuide`.

## 3.2 Chat

Chat is chronological and conversational.

Use existing `TopicChat` or existing `ChatTab` architecture.

## 3.3 Map

Map is spatial and relational.

The user can:

- pan
- zoom
- tap a node
- inspect a node
- focus on a node
- expand a node
- return to root
- open an explanation in Chat

## 3.4 Same context

Switching:

```text
Guide -> Chat
Guide -> Map
Chat -> Map
Map -> Chat
```

must preserve:

- specialty
- topic
- selected concept if one exists
- current visual theme/accent color
- relevant conversation context

---

# 4. EXISTING REPOSITORY CONTEXT

Current app uses Expo Router file-based navigation.

Relevant existing paths:

```text
app/
  (tabs)/
    ChatTab.tsx
    index.tsx
    pearls.tsx
    profile.tsx
    _layout.tsx

  specialty/
    [id]/
      [topic].tsx
      general.tsx
      index.tsx
      category/
        [categoryId].tsx

components/
  TopicChat.tsx
  CategoryPage.tsx
  FormattedClinicalText.tsx

services/
  aiService.ts
  dbService.ts

constants/
  Colors.ts
  SpecialtyData.ts
  ClinicalPresetsData.ts

backend/
  server.js
```

The topic route currently has:

- `Clinical Guide`
- `AI Assistant`

The file is:

`app/specialty/[id]/[topic].tsx`

Current component usage includes:

```tsx
<ClinicalGuide ... />
<TopicChat ... />
```

The global AI chat is implemented in:

`app/(tabs)/ChatTab.tsx`

The project already uses:

- `react-native-svg`
- `react-native-reanimated`
- `react-native-gesture-handler`
- Expo Router
- NativeWind
- Safe Area Context

Do not replace those technologies.

---

# 5. TARGET ARCHITECTURE

Create a small feature layer:

```text
components/
  KnowledgeMap/
    KnowledgeMap.tsx
    KnowledgeMapCanvas.tsx
    KnowledgeMapNode.tsx
    KnowledgeMapEdge.tsx
    KnowledgeMapToolbar.tsx
    KnowledgeMapNodeSheet.tsx
    KnowledgeMapEmptyState.tsx
    KnowledgeMapLegend.tsx
    index.ts

types/
  knowledgeMap.ts

services/
  knowledgeMapService.ts

utils/
  knowledgeMap/
    buildTopicGraph.ts
    layoutTopicGraph.ts
    normalizeKnowledgeGraph.ts
    graphConstants.ts
```

Optional later:

```text
backend/
  services/
    knowledgeGraphService.js
```

Do NOT split `backend/server.js` immediately unless needed for this feature.

---

# 6. DATA MODEL

Create:

`types/knowledgeMap.ts`

Use explicit TypeScript types.

Recommended model:

```ts
export type KnowledgeNodeType =
  | "root"
  | "section"
  | "concept"
  | "finding"
  | "investigation"
  | "treatment"
  | "drug"
  | "complication"
  | "red-flag"
  | "citation"
  | "question";

export type KnowledgeEdgeType =
  | "contains"
  | "causes"
  | "associated-with"
  | "presents-with"
  | "diagnosed-by"
  | "treated-with"
  | "complicated-by"
  | "supports"
  | "related-to"
  | "derived-from"
  | "asks-about";

export interface KnowledgeMapNode {
  id: string;
  label: string;
  type: KnowledgeNodeType;

  /**
   * Optional short description.
   * Never put large medical answers inside the node itself.
   */
  summary?: string;

  /**
   * Original content reference.
   * Examples:
   * - guide section ID
   * - chat message ID
   * - backend source ID
   */
  sourceId?: string;

  /**
   * Route/context needed when opening the content.
   */
  specialtyId?: string;
  topicId?: string;

  /**
   * Used for graph layout.
   */
  depth: number;

  /**
   * Optional fixed position if user moves the node.
   */
  position?: {
    x: number;
    y: number;
  };

  /**
   * Whether this node has hidden children.
   */
  expandable?: boolean;

  /**
   * Number of hidden children.
   */
  hiddenChildCount?: number;

  /**
   * Whether this node is currently selected/focused.
   */
  selectable?: boolean;

  /**
   * Used for UI semantics, not raw color.
   */
  priority?: "primary" | "secondary" | "tertiary";
}

export interface KnowledgeMapEdge {
  id: string;

  source: string;
  target: string;

  type: KnowledgeEdgeType;

  label?: string;

  /**
   * Optional confidence from server-generated graph data.
   * Range 0..1.
   */
  confidence?: number;

  /**
   * ID of source content if applicable.
   */
  sourceId?: string;
}

export interface KnowledgeMapGraph {
  id: string;

  rootNodeId: string;

  specialtyId?: string;
  specialtyName?: string;

  topicId?: string;
  topicName?: string;

  generatedAt: string;

  version: number;

  nodes: KnowledgeMapNode[];

  edges: KnowledgeMapEdge[];

  /**
   * Used to detect whether graph is local/deterministic or AI-generated.
   */
  source:
    | "topic-guide"
    | "conversation"
    | "hybrid"
    | "ai-generated";

  /**
   * If true, graph can be enriched/updated without replacing the UI.
   */
  isExpandable?: boolean;
}
```

---

# 7. GRAPH DESIGN

Use a hierarchical graph.

The root is always the current topic.

Example:

```text
root
 |
 +-- section
 |    |
 |    +-- concept
 |    +-- concept
 |
 +-- section
 |    |
 |    +-- finding
 |
 +-- section
      |
      +-- treatment
```

Do not start with arbitrary force-directed physics.

## Initial layout algorithm

Use a deterministic layered layout.

Recommended:

- root at top-center
- section nodes beneath root
- concepts beneath their section
- deeper concepts beneath their parent

Example:

```text
                 [ROOT]
                    |
       +------------+------------+
       |            |            |
    [Section]    [Section]    [Section]
       |            |            |
   [A] [B]        [C] [D]      [E] [F]
```

This is much more predictable on mobile than a free-form force graph.

---

# 8. MOBILE CANVAS MODEL

The map should live in a pannable/zoomable viewport.

Recommended architecture:

```text
View
  |
  +-- Toolbar
  |
  +-- Canvas viewport
       |
       +-- SVG
            |
            +-- Edges
            |
            +-- Nodes
```

Use:

- `react-native-svg` for edges, paths, node primitives
- `react-native-gesture-handler` for pan/pinch
- `react-native-reanimated` for transform state

Do not render each edge as a normal `View`.

Do not use absolute-positioned `View` lines for connections.

---

# 9. CANVAS INTERACTION REQUIREMENTS

## 9.1 Pan

One-finger drag:

- moves entire graph
- does not modify node positions

## 9.2 Pinch zoom

Two-finger pinch:

- zooms around focal point
- clamp zoom

Recommended:

```ts
MIN_ZOOM = 0.55
MAX_ZOOM = 2.8
DEFAULT_ZOOM = 1
```

Do not permit impossible zoom states.

## 9.3 Double tap

Double tap on empty canvas:

- reset/focus root

Double tap on selected node:

- center node

## 9.4 Tap node

Select node.

Selection should:

- increase visual emphasis
- highlight connected edges
- slightly dim unrelated nodes
- open or prepare the node detail UI

Do NOT instantly navigate away.

## 9.5 Long press node

Optional in first iteration.

If implemented, show actions:

```text
Ask about this
Explain
Expand
Focus
```

## 9.6 Focus

Toolbar action:

`Focus`

or context action:

`Focus node`

should move the selected node to center.

## 9.7 Reset view

Toolbar action:

`Reset`

returns:

```text
zoom = 1
center = root
```

---

# 10. TOOLBAR

Create:

`components/KnowledgeMap/KnowledgeMapToolbar.tsx`

Toolbar should be compact.

Suggested actions:

```text
[ + ] [ - ] [ Center ] [ Reset ]
```

Do not use too many icons.

Use existing Ionicons.

Recommended icons:

- zoom in: `add`
- zoom out: `remove`
- center: `locate-outline`
- reset: `refresh-outline`

Toolbar should remain visually subordinate to graph.

---

# 11. NODE UI

Create:

`KnowledgeMapNode.tsx`

Node presentation should be small enough for mobile.

Recommended sizes:

```text
Root:
width = 170
height = 52

Section:
width = 145
height = 44

Concept:
width = 125
height = 40
```

Do not put paragraphs inside nodes.

Node content:

```text
ICON
Title
optional hidden count
```

Example:

```text
┌────────────────────┐
│  ✦  HEART FAILURE  │
└────────────────────┘
```

Section:

```text
┌─────────────────┐
│  Diagnosis      │
└─────────────────┘
```

Concept:

```text
┌───────────────┐
│ BNP           │
└───────────────┘
```

---

# 12. NODE COLOR SYSTEM

Do not invent unrelated colors.

Use existing `Colors` values.

Recommended semantic usage:

- root: `Colors.main`
- section: `Colors.accent` / established teal
- investigation: existing teal family
- treatment: main teal/primary identity
- complication/red flag: existing pink
- clinical/evidence: lavender
- secondary nodes: neutral graphite values

Color is NOT the only state signal.

Selection should also use:

- stroke width
- opacity
- subtle scale
- icon

---

# 13. EDGE DESIGN

Create:

`KnowledgeMapEdge.tsx`

Edges should be:

- thin
- restrained
- readable
- no glowing neon effect

Recommended stroke width:

```text
normal = 1.2
selected path = 2
```

Use curved or orthogonal paths.

Prefer a subtle rounded curve over harsh straight lines.

Example:

```text
M x1,y1
C x1,y1+40 x2,y2-40 x2,y2
```

Do not animate edges continuously.

Only animate selection state.

---

# 14. EDGE LABELS

Do not label every edge.

Edge labels should only appear when:

- the source/target relationship is meaningful
- the relationship is selected
- or the user explicitly enables relation details

Example:

```text
Heart Failure
      |
   causes
      |
   Dyspnea
```

On mobile, excessive edge labels will make the map unreadable.

---

# 15. NODE DETAIL UI

Create:

`KnowledgeMapNodeSheet.tsx`

When a node is tapped, show a bottom sheet-like panel.

Do not add a new navigation screen for every node.

Sheet content:

```text
---------------------------------------
Heart Failure
Cardiology

Clinical concept
---------------------------------------

Short summary...

[ Ask AI about this ]

[ Focus on this node ]

[ Expand related concepts ]
---------------------------------------
```

The sheet must be compact.

For long content, use a scroll area.

---

# 16. MAP -> CHAT BEHAVIOR

This is one of the most important interactions.

When user selects a node and taps:

**Ask AI about this**

the app should navigate to the correct chat context.

The initial query should be generated deterministically.

Example:

```text
"Explain the relationship between heart failure and pulmonary edema."
```

or:

```text
"Explain BNP in the context of heart failure."
```

Better implementation:

```ts
buildNodeQuestion(node, graphContext)
```

in:

`utils/knowledgeMap/buildNodeQuestion.ts`

Do not ask the model to generate the question.

Use deterministic templates.

Examples:

```text
concept:
"Explain {label} in the context of {topicName}."

relationship:
"Explain why {sourceLabel} is related to {targetLabel} in {topicName}."

treatment:
"What is the role of {label} in the management of {topicName}?"

investigation:
"Explain the role and interpretation of {label} in {topicName}."
```

---

# 17. CHAT -> MAP BEHAVIOR

When the user is in Chat and chooses Map:

The graph should represent:

1. current topic context
2. available guide structure
3. previously discussed concepts where possible

Do NOT attempt to map every word in the conversation.

Only extract meaningful concepts.

Initial version:

```text
topic root
+
guide sections
+
high-value concepts
```

Later version can add conversation-derived concepts.

---

# 18. GUIDE -> MAP BEHAVIOR

For a topic page:

`Clinical Guide | AI Assistant | Map`

Map generation should start from the topic data.

The preferred source order:

```text
1. Topic structured guide
2. Topic metadata
3. Existing specialty category structure
4. Conversation-derived concepts
5. AI-generated graph enrichment
```

The client must never invent new medical facts.

---

# 19. LOCAL GRAPH GENERATION

Create:

`utils/knowledgeMap/buildTopicGraph.ts`

The function should be deterministic.

Suggested API:

```ts
buildTopicGraph({
  specialty,
  topic,
}): KnowledgeMapGraph
```

It should:

1. create root node
2. map topic sections
3. create nodes from known structured sections
4. create relationship edges
5. deduplicate concepts
6. assign depth
7. return deterministic IDs

---

# 20. DETERMINISTIC IDS

Use stable IDs.

Recommended helper:

```ts
slugify()
```

Examples:

```text
heart-failure
heart-failure-diagnosis
heart-failure-treatment
heart-failure-bnp
```

Do NOT use:

```ts
Date.now()
Math.random()
```

for graph node identity.

Stable IDs are required for:

- selection
- focus
- graph updates
- preserving node state

---

# 21. GRAPH NORMALIZATION

Create:

`utils/knowledgeMap/normalizeKnowledgeGraph.ts`

Responsibilities:

- remove duplicate nodes
- remove duplicate edges
- fix missing references
- guarantee root exists
- enforce valid node types
- enforce valid edge types
- clamp confidence to 0..1
- remove self loops
- prevent circular rendering bugs
- ensure every edge source/target exists

Graph rendering must never crash because of malformed AI output.

---

# 22. LAYOUT ENGINE

Create:

`utils/knowledgeMap/layoutTopicGraph.ts`

Do NOT hardcode graph coordinates inside components.

Input:

```ts
nodes
edges
viewportWidth
viewportHeight
```

Output:

```ts
Map<string, { x: number; y: number }>
```

Recommended layout:

### Root

```text
x = viewportWidth / 2
y = 110
```

### Depth 1

Evenly distribute below root.

### Depth 2+

Distribute within the horizontal range of the parent section.

Apply minimum spacing.

Recommended initial horizontal spacing:

```text
node gap = 24
section gap = 42
```

Vertical spacing:

```text
depth gap = 86
```

These values can be tuned after visual testing.

---

# 23. GRAPH OVERFLOW

The graph may exceed the screen.

That is expected.

Do NOT compress everything until all nodes are tiny.

Graph readability is more important than keeping it visually contained.

Allow:

- horizontal panning
- vertical panning
- zoom

---

# 24. MAP EMPTY STATE

Create:

`KnowledgeMapEmptyState.tsx`

If no usable graph data exists:

```text
          [map icon]

      Knowledge Map

This topic does not have
enough structured content yet.

Ask the AI a question to start
building the map.

       [ Ask AI ]
```

Do not show an error state.

This is a valid state.

---

# 25. MAP LOADING STATE

Loading must be quiet.

No elaborate animation.

Use existing project motion discipline.

Example:

```text
Preparing knowledge map...
```

Optional minimal shimmer/fade.

Do not block the entire screen if the base guide graph can be shown first.

---

# 26. INCREMENTAL GRAPH GENERATION

Prefer progressive behavior:

```text
screen opens
    |
    v
build local graph immediately
    |
    v
render map
    |
    v
optional AI enrichment
    |
    v
merge enriched nodes/edges
```

This makes the UI feel immediate.

The graph must not wait for an expensive AI request if local topic data is already available.

---

# 27. OPTIONAL AI GRAPH ENRICHMENT

Do not make this mandatory for V1.

If implemented, backend must return strict JSON, NOT free-form markdown.

Recommended backend response:

```json
{
  "topicId": "heart-failure",
  "nodes": [],
  "edges": []
}
```

Before accepting server graph data:

1. validate schema
2. normalize graph
3. reject invalid nodes
4. reject invalid edges
5. merge with local graph

Client must treat server graph as untrusted data.

---

# 28. BACKEND GRAPH CONTRACT

If adding backend support, do NOT make `/api/chat` return a graph automatically on every request.

That will increase payload size and complexity.

Instead create a dedicated endpoint:

```text
POST /api/knowledge-map
```

Body:

```json
{
  "specialtyId": "heart",
  "topicId": "heart-failure",
  "topicName": "Heart Failure",
  "conversation": []
}
```

Response:

```json
{
  "graph": {
    "id": "heart-heart-failure",
    "rootNodeId": "heart-failure",
    "specialtyId": "heart",
    "topicId": "heart-failure",
    "version": 1,
    "source": "ai-generated",
    "nodes": [],
    "edges": []
  }
}
```

Do not include citations directly in every node unless a source relationship is useful.

---

# 29. AI GRAPH PROMPT RULES

If backend AI generation is added:

The prompt must explicitly instruct:

1. only use supplied medical context
2. do not invent medical facts
3. only generate meaningful clinical relationships
4. keep graph small and useful
5. prefer high-value concepts
6. use exact allowed node types
7. use exact allowed edge types
8. return JSON only
9. do not output markdown
10. no commentary outside JSON

Recommended graph constraints:

```text
max nodes for first response: 40
max edges: 60
```

For mobile performance, keep the first graph smaller.

---

# 30. CONVERSATION-DERIVED MAP

Do NOT turn every message into a node.

Instead identify:

- current disease/topic
- major diagnostic concepts
- treatments
- investigations
- complications
- red flags
- high-value symptoms
- explicitly discussed drugs
- explicitly asked questions

Example:

Conversation:

```text
User:
What is DKA?

AI:
...

User:
What causes the acidosis?

AI:
...

User:
How do I treat it?
```

Graph should become:

```text
DKA
 |
 +--- Pathophysiology
 |       |
 |       +--- Ketogenesis
 |       +--- Metabolic acidosis
 |
 +--- Treatment
         |
         +--- IV fluids
         +--- Insulin
         +--- Potassium management
```

Not:

```text
What
is
the
cause
of
the
...
```

---

# 31. GRAPH MERGING

Create:

`utils/knowledgeMap/mergeKnowledgeGraphs.ts`

Behavior:

```text
local graph
    +
conversation graph
    +
AI enrichment
    =
normalized graph
```

Merge order:

1. local topic graph
2. conversation graph
3. AI enrichment

The local graph is authoritative for the base topic structure.

When duplicate concepts occur:

- merge by normalized label and semantic key
- preserve the strongest source
- combine source IDs
- keep stable node ID

---

# 32. MAP STATE

Do not add a global state manager.

State may live at screen/feature level.

Required state:

```ts
activeView: "guide" | "chat" | "map"

selectedNodeId?: string

zoom: number

panX: number

panY: number

focusedNodeId?: string

isNodeSheetOpen: boolean

graph: KnowledgeMapGraph | null
```

For topic route, `activeView` can live in `[topic].tsx`.

Pass props to child view components.

---

# 33. TOPIC PAGE CHANGES

Modify:

`app/specialty/[id]/[topic].tsx`

Current:

```text
Guide | AI Assistant
```

Target:

```text
Guide | AI Assistant | Map
```

Prefer user-facing label:

```text
Guide | Chat | Map
```

unless keeping "AI Assistant" is essential to existing naming consistency.

Recommended final text:

```text
Clinical Guide
AI Assistant
Map
```

Reason:
The current product already uses "AI Assistant", so do not rename that existing function unnecessarily.

The Map becomes the third tab.

---

# 34. TOPIC PAGE TAB UI

Do not use three giant buttons.

Use the existing segmented/tab visual language.

Current tab style should be extended rather than rewritten.

Requirements:

- three equal segments
- active segment uses specialty color
- inactive text stays muted
- subtle border
- no excessive shadow
- supports smaller mobile widths
- icons + text
- minimum touch target around 44 px height

Suggested icons:

```text
Clinical Guide -> book-outline
AI Assistant   -> chatbubbles-outline
Map            -> git-network-outline
```

If `git-network-outline` is unavailable in Ionicons, use:

```text
share-social-outline
```

or another existing network-style Ionicon.

Do not create a custom icon unless necessary.

---

# 35. GLOBAL CHAT CHANGES

Modify:

`app/(tabs)/ChatTab.tsx`

Add a compact `Chat | Map` mode switch at the top only when a medical context exists.

Possible context sources:

- route params
- current selected topic
- active conversation metadata

If no context exists:

```text
Chat only
```

Do NOT show Map without context.

---

# 36. GLOBAL CHAT CONTEXT

Create a shared context type:

```ts
export interface MedicalContext {
  specialtyId?: string;
  specialtyName?: string;

  topicId?: string;
  topicName?: string;

  conversationId?: string;

  selectedNodeId?: string;
}
```

This should live in:

`types/medicalContext.ts`

Do not create a React Context provider unless the current navigation architecture truly needs it.

Start by passing context through route params/props.

---

# 37. ROUTING

When entering Topic Chat:

Current route:

```text
/specialty/[id]/[topic]
```

Map is inside the same screen.

This is preferred.

Do NOT create:

```text
/specialty/[id]/[topic]/map
```

for V1.

Why:

- preserves topic context
- keeps the UI tab-like
- avoids duplicate data loading
- makes switching instant

---

# 38. MAP -> CHAT ROUTING

When pressing `Ask AI about this`:

Use the current topic route's chat tab state when possible.

Preferred behavior:

```text
Map
 |
 | tap node
 |
 | Ask AI about this
 v
AI Assistant
 |
 +-- selected concept is used as initial query
```

Do not create a duplicate chat screen.

---

# 39. SPECIALTY COLOR

Map receives:

```ts
themeColor={specialty.color}
```

as the TopicPage already does for Guide and Chat.

Root and active state may use the specialty color.

Do not hardcode specialty-specific colors inside Map components.

---

# 40. ACCESSIBILITY

At minimum:

## Nodes

Each node should have:

```tsx
accessibilityRole="button"
accessibilityLabel="Heart Failure"
accessibilityHint="Open concept details"
```

## Toolbar

Each action must have:

- accessibilityLabel
- minimum touch target
- meaningful icon name

## Color

Do not rely only on color to indicate selection.

Selection must also show:

- stroke
- size/scale
- opacity

---

# 41. PERFORMANCE REQUIREMENTS

Mobile graph rendering must remain smooth.

Rules:

1. Use `react-native-svg`.
2. Avoid a separate React component for thousands of primitive pieces.
3. V1 should support at least 40 nodes comfortably.
4. V1 should support at least 60 edges.
5. Memoize nodes and edges where needed.
6. Avoid recalculating layout on every frame.
7. Layout runs only when:
   - graph changes
   - viewport size changes
   - layout mode changes
8. Pan and zoom run on Reanimated shared values.
9. Do not put pan coordinates into React state every frame.
10. Do not trigger network calls during pan/zoom.

---

# 42. GESTURE IMPLEMENTATION

Use `react-native-gesture-handler`.

Required gestures:

```text
Pan
Pinch
Tap
Double Tap
```

Avoid gesture conflicts.

Recommended conceptual priority:

```text
pinch > pan > tap
```

Node taps must remain possible.

When starting a pan on an empty region:

- move canvas

When starting a gesture on a node:

- allow tap selection
- do not unexpectedly drag graph unless explicitly supported

V1 does NOT need node dragging.

---

# 43. DO NOT IMPLEMENT NODE DRAGGING IN V1

This is intentional.

Node dragging creates problems:

- persistence
- collision handling
- graph layout recalculation
- accidental movement
- more complicated gestures

V1 should focus on:

- pan
- zoom
- select
- focus
- expand
- chat

Node dragging can be a later feature.

---

# 44. EXPAND / COLLAPSE

Graph depth may become large.

Implement collapse support.

Every node may have:

```ts
expandable?: boolean
hiddenChildCount?: number
```

When a node with hidden children is expanded:

- add children
- animate them in
- recompute layout
- preserve current selected node where possible

When collapsed:

- hide descendants
- preserve node identity

Do not delete the source graph permanently.

Maintain:

```ts
collapsedNodeIds: Set<string>
```

in local map state.

---

# 45. INITIAL GRAPH SIZE

For V1:

```text
root
+
4–8 first-level sections
+
3–5 children per selected section
```

Do not render the entire potentially huge graph immediately.

Start focused.

---

# 46. AUTO-FOCUS

When Map opens:

1. graph generated
2. root node selected
3. camera centered on root and first-level nodes
4. zoom around 0.82–0.95 depending on node count

Do not force a zoom that makes text unreadable.

---

# 47. SELECTED NODE VISUAL STATE

Selected node:

- stronger stroke
- slightly larger scale (e.g. 1.04)
- connected edges emphasized
- unrelated nodes reduced to ~55–70% opacity
- selected node remains fully visible

Do not use huge animation.

Animation duration:

```text
180–220 ms
```

---

# 48. CONNECTED PATH HIGHLIGHT

When node selected:

Find:

```ts
incoming edges
outgoing edges
```

Highlight:

- selected node
- directly connected nodes
- directly connected edges

Do not highlight the entire graph.

---

# 49. NODE DETAIL SUMMARY

The summary must come from real data.

If no summary exists:

```text
No additional summary is available yet.
```

Do not let the UI fabricate a summary.

---

# 50. GUIDE CONNECTIONS

Every graph node that originates from the clinical guide should have:

```ts
sourceId
```

When available.

This allows future behavior:

```text
Tap node
 ->
Open corresponding guide section
```

V1 may show:

```text
Read in Clinical Guide
```

as an optional action.

---

# 51. MAP -> GUIDE

If a node represents a section:

Button:

**Open in Guide**

Expected behavior:

1. switch active view to Guide
2. scroll to relevant section if supported
3. otherwise position Guide at top

Do NOT build complicated deep-link scrolling if the current guide architecture doesn't support stable section IDs.

At minimum, switch to Guide and preserve topic context.

---

# 52. CITATION CONNECTION

Where a concept originated from a citation:

The node can optionally store:

```ts
sourceId
```

But do not dump citation text into the node.

A future detail sheet can show:

```text
Sources
[1] Europe PMC...
[2] ...
```

V1 may simply expose:

```text
Evidence available
```

when source metadata exists.

---

# 53. SECURITY / TRUST

Never trust graph JSON from backend.

Validation is required.

Reject:

- invalid node type
- invalid edge type
- edge to missing node
- giant string fields
- extreme coordinate values
- absurd node counts
- circular references if unsupported
- malformed JSON

Recommended limits:

```text
MAX_NODES = 60
MAX_EDGES = 100
MAX_LABEL_LENGTH = 80
MAX_SUMMARY_LENGTH = 500
```

---

# 54. ERROR HANDLING

If map generation fails:

DO NOT break the Topic screen.

Instead:

```text
Guide | Chat | Map
```

still works.

Map displays:

```text
Unable to prepare this map right now.

[Retry]
```

If local graph generation works but AI enrichment fails:

- keep local graph
- do not show a fatal error
- optional subtle notice:

```text
Showing topic map
```

---

# 55. OFFLINE / BACKEND UNAVAILABLE

Topic Map should still show the deterministic local graph if topic content exists.

This means the map is useful even without backend connectivity.

The AI enrichment endpoint is optional.

---

# 56. CACHING

V1 can use in-memory/component cache only.

Do not add persistent storage until necessary.

Potential future cache key:

```text
knowledge-map:{specialtyId}:{topicId}:{contentVersion}
```

Do not use AsyncStorage for the first implementation unless graph generation is demonstrably expensive.

---

# 57. GRAPH VERSIONING

Always include:

```ts
version: 1
```

This permits future migrations.

---

# 58. TEST DATA

Create a development fixture:

`constants/KnowledgeMapFixtures.ts`

Include at least:

1. simple 1-level graph
2. medium 2-level graph
3. graph with complications
4. graph with missing optional data
5. malformed graph for normalization tests

Example:

```ts
export const HEART_FAILURE_MAP_FIXTURE: KnowledgeMapGraph = ...
```

Do not use fake medical claims that could be mistaken for real clinical guidance outside clearly labeled development fixtures.

---

# 59. UNIT TESTS

Add tests for:

`buildTopicGraph`

Test:

- root exists
- stable IDs
- duplicate concepts removed
- expected sections generated

`normalizeKnowledgeGraph`

Test:

- missing nodes removed
- invalid edges removed
- self loops removed
- limits applied
- confidence clamped

`layoutTopicGraph`

Test:

- root positioned correctly
- no NaN coordinates
- depth ordering maintained

`buildNodeQuestion`

Test:

- correct topic inserted
- deterministic output
- no undefined labels

---

# 60. COMPONENT TESTS

At minimum test:

### KnowledgeMap

- renders root
- renders nodes
- renders edges
- selection works

### KnowledgeMapToolbar

- zoom in
- zoom out
- reset
- center

### KnowledgeMapNodeSheet

- opens
- closes
- displays node title
- Ask AI callback works

---

# 61. VISUAL QA

Test on:

- small Android phone
- medium Android phone
- larger Android phone

At minimum:

- 360 px-ish width
- 390 px-ish width
- 430 px-ish width

Check:

- tab labels don't collide
- toolbar doesn't overlap
- graph doesn't clip
- node text remains readable
- safe area is respected
- keyboard doesn't cover Chat after returning from Map

---

# 62. REDUCED MOTION

Use:

```ts
AccessibilityInfo.isReduceMotionEnabled
```

or the existing app convention.

When reduced motion is enabled:

- disable node scale animation
- disable map fade animation
- keep state changes instantaneous
- gestures still work

---

# 63. TYPOGRAPHY

Reuse existing project typography.

Do not introduce a new font.

The repository already uses IBM Plex fonts.

Follow existing `font-sans`, `font-sans-bold`, etc. conventions where NativeWind is already used.

---

# 64. VISUAL LANGUAGE

The Map should feel like this:

```text
clinical
precise
quiet
structured
premium
```

Not:

```text
gaming
neon
cyberpunk
social-media
mindfulness
```

The graph is a clinical navigation instrument.

---

# 65. TAB BEHAVIOR

On Topic page:

Default:

```text
Guide
```

Switch to Chat:

```text
activeTab = "chat"
```

Switch to Map:

```text
activeTab = "map"
```

Switching must not destroy loaded topic data.

If Chat has a conversation state already in memory, preserve it.

Do not remount Chat unnecessarily when toggling away and back.

Recommended:

```tsx
{activeTab === "guide" && ...}
{activeTab === "chat" && ...}
{activeTab === "map" && ...}
```

If preserving component state is important, keep all three mounted and hide inactive views carefully. Only do this if performance remains acceptable.

Default implementation can use conditional rendering.

---

# 66. IMPORTANT: PRESERVE EXISTING CHAT STATE

Current `TopicChat` stores messages locally.

If switching:

```text
Chat -> Map -> Chat
```

causes the chat to lose messages, fix this.

Preferred options:

1. Keep `TopicChat` mounted in topic page.
2. Or lift `messages` state to `[topic].tsx`.

Do NOT introduce global state for this.

The simplest preferred implementation:

- keep child mounted
- hide inactive child

Example concept:

```tsx
<View style={{ display: activeTab === "chat" ? "flex" : "none" }}>
  <TopicChat ... />
</View>
```

However, verify that `display:none` does not create keyboard/layout issues in React Native.

Alternative:

- render all tabs in a parent container
- use absolute/opacity/pointer-events carefully

Choose the simplest reliable solution after testing.

---

# 67. MAP INITIAL DATA SOURCE

Use existing topic data.

The current topic page already retrieves:

```ts
const spec = await dbService.getSpecialty(specId);
const data = await dbService.getTopic(specId, topic);
```

Use those exact objects where possible.

Do not fetch the same topic again from the network.

---

# 68. MAP SERVICE

Create:

`services/knowledgeMapService.ts`

Responsibilities:

```ts
getLocalTopicGraph()
getConversationGraph()
requestAIKnowledgeMap() // optional
mergeKnowledgeGraphs()
```

Do not make the UI component responsible for network logic.

---

# 69. SERVICE API

Recommended:

```ts
export async function buildKnowledgeMap(params: {
  specialty: SpecialtyData;
  topic: TopicItem;
}): Promise<KnowledgeMapGraph>
```

Initial implementation:

```text
buildKnowledgeMap
  -> buildTopicGraph
  -> normalizeKnowledgeGraph
```

Later:

```text
buildKnowledgeMap
  -> local graph
  -> optional AI enrichment
  -> merge
  -> normalize
```

---

# 70. NO DUPLICATE AI LOGIC

Do not copy `aiService.sendMessageByText()` logic into the map feature.

Reuse existing services where possible.

The map service should only call a dedicated graph endpoint if implemented.

---

# 71. BACKEND IMPLEMENTATION PHASE

Only add backend graph generation after the local graph UI is fully functional.

Phase order:

```text
Phase 1: UI shell
Phase 2: local graph
Phase 3: gestures
Phase 4: node interactions
Phase 5: chat integration
Phase 6: optional backend enrichment
```

This prevents AI complexity from blocking UI delivery.

---

# 72. DETAILED PHASE PLAN

# PHASE 1 — FOUNDATION

## Tasks

1. Inspect:
   - `app/specialty/[id]/[topic].tsx`
   - `components/TopicChat.tsx`
   - `components/ClinicalGuide.tsx`
   - `constants/SpecialtyData.ts`
   - `constants/Colors.ts`
   - `services/dbService.ts`
   - `services/aiService.ts`
2. Create:
   - `types/knowledgeMap.ts`
   - `types/medicalContext.ts`
   - `components/KnowledgeMap/*`
   - `utils/knowledgeMap/*`
   - `services/knowledgeMapService.ts`
3. Do not modify backend yet.
4. Add basic types.
5. Add fixture.
6. Build basic static map.

### Acceptance criteria

- App builds.
- Existing screens remain unchanged except new Map option.
- Basic Map can render root + child nodes.

---

# PHASE 2 — TOPIC TAB

Modify:

`app/specialty/[id]/[topic].tsx`

Add third tab:

```text
Clinical Guide | AI Assistant | Map
```

Add:

```ts
type ActiveTab = "guide" | "chat" | "map";
```

Render Map:

```tsx
<KnowledgeMap
  specialty={specialty}
  topic={topicData}
/>
```

### Acceptance criteria

- Three tabs visible.
- Active tab styling is consistent with existing app.
- Map opens without navigating to another screen.
- Back navigation still works.

---

# PHASE 3 — GRAPH DATA

Implement:

`buildTopicGraph.ts`

Map actual topic data into:

```text
root
sections
concepts
```

Do not over-extract.

### Acceptance criteria

For a known topic, Map shows:

- topic root
- several clinically meaningful sections
- at least a few child concepts

No duplicate nodes.

---

# PHASE 4 — LAYOUT

Implement:

`layoutTopicGraph.ts`

Use layered layout.

### Acceptance criteria

- no overlap for normal graph size
- deterministic layout
- readable spacing
- graph extends beyond viewport when needed

---

# PHASE 5 — CANVAS

Implement:

`KnowledgeMapCanvas.tsx`

Use:

- SVG
- Reanimated
- Gesture Handler

Implement:

- pan
- pinch
- tap
- double tap

### Acceptance criteria

- smooth pan
- smooth zoom
- reset works
- graph remains interactive
- no frame-by-frame React state updates

---

# PHASE 6 — NODE DETAILS

Implement:

`KnowledgeMapNodeSheet.tsx`

Tap node.

Show:

- title
- type
- summary
- actions

### Acceptance criteria

- opens reliably
- closes reliably
- no navigation glitches
- selected node remains selected

---

# PHASE 7 — MAP -> CHAT

Implement deterministic question builder.

Example:

```text
Explain BNP in the context of Heart Failure.
```

When user taps:

`Ask AI about this`

switch to Chat.

The query should appear in Chat input or be submitted automatically according to existing UX.

Preferred:

### Do not auto-submit without clear user intent.

Put the generated question into the chat input and let the user send it.

If product direction already auto-sends starter prompts, reuse that existing convention.

### Acceptance criteria

- correct topic context
- correct selected concept
- user lands in Chat
- no duplicate chat instance
- existing conversation preserved

---

# PHASE 8 — CHAT -> MAP

Only show Map option when a topic context is available.

When opening Map:

- build/reuse graph
- optionally include conversation-derived concepts

### Acceptance criteria

- global Chat with context can access Map
- global Chat with no context does not show Map

---

# PHASE 9 — COLLAPSE / EXPAND

Implement:

```text
collapsedNodeIds
```

Tap expandable node.

### Acceptance criteria

- children hide/show
- layout updates
- current focus remains stable

---

# PHASE 10 — OPTIONAL AI ENRICHMENT

Only after V1 is stable.

Add:

```text
POST /api/knowledge-map
```

Implement:

- JSON schema validation
- limits
- normalization
- graph merging

### Acceptance criteria

If endpoint fails:

- local graph remains
- app remains usable
- no fatal error

---

# 73. FILE-BY-FILE SPECIFICATION

## Create

### `types/knowledgeMap.ts`

Contains all graph/domain interfaces.

### `types/medicalContext.ts`

Contains shared context.

### `services/knowledgeMapService.ts`

Contains graph building/orchestration.

### `utils/knowledgeMap/buildTopicGraph.ts`

Converts TopicData -> local graph.

### `utils/knowledgeMap/layoutTopicGraph.ts`

Computes positions.

### `utils/knowledgeMap/normalizeKnowledgeGraph.ts`

Validates and normalizes graph.

### `utils/knowledgeMap/buildNodeQuestion.ts`

Creates deterministic AI questions.

### `utils/knowledgeMap/mergeKnowledgeGraphs.ts`

Merges graph sources.

### `components/KnowledgeMap/KnowledgeMap.tsx`

Feature-level container.

### `components/KnowledgeMap/KnowledgeMapCanvas.tsx`

Gesture + transform + SVG canvas.

### `components/KnowledgeMap/KnowledgeMapNode.tsx`

Node rendering.

### `components/KnowledgeMap/KnowledgeMapEdge.tsx`

Edge rendering.

### `components/KnowledgeMap/KnowledgeMapToolbar.tsx`

Zoom/reset/focus controls.

### `components/KnowledgeMap/KnowledgeMapNodeSheet.tsx`

Selected-node detail UI.

### `components/KnowledgeMap/KnowledgeMapEmptyState.tsx`

Empty state.

### `components/KnowledgeMap/index.ts`

Exports feature components.

### `constants/KnowledgeMapFixtures.ts`

Fixtures for testing.

---

# 74. POSSIBLE EXISTING FILE MODIFICATIONS

Modify only as needed:

```text
app/specialty/[id]/[topic].tsx
app/(tabs)/ChatTab.tsx
constants/Colors.ts        # only if absolutely necessary
services/aiService.ts      # only if sharing context requires it
backend/server.js          # only in AI enrichment phase
```

Do not modify:

- unrelated profile screens
- specialty home screens
- navigation architecture
- database schema
- package configuration unless required

---

# 75. DEPENDENCY POLICY

Before installing anything:

Check whether the functionality can be implemented with already installed dependencies.

Existing useful dependencies include:

- `react-native-svg`
- `react-native-reanimated`
- `react-native-gesture-handler`
- `expo-router`
- `expo-haptics`

Prefer no new dependency.

If a new dependency becomes unavoidable:

1. explain why it is necessary in the final summary
2. verify Expo 57 / RN 0.86 compatibility
3. install the exact compatible version
4. run `npx expo doctor`
5. verify Android build

Do not blindly install the newest package.

---

# 76. BUILD / VALIDATION COMMANDS

After implementation:

```bash
npm install
npx expo doctor
npx tsc --noEmit
npm run lint
```

If backend changed:

```bash
cd backend
npm install
node --check server.js
```

Then test Android:

```bash
npx expo run:android
```

If the environment doesn't support Android locally, at minimum complete:

```bash
npx tsc --noEmit
npm run lint
npx expo doctor
```

---

# 77. ACCEPTANCE TEST CHECKLIST

## Topic route

- [ ] Topic opens
- [ ] Guide opens
- [ ] Chat opens
- [ ] Map opens
- [ ] Back navigation works

## Map

- [ ] Root node visible
- [ ] Child nodes visible
- [ ] Edges visible
- [ ] Pan works
- [ ] Pinch works
- [ ] Reset works
- [ ] Center works
- [ ] Tap node works
- [ ] Sheet opens
- [ ] Connected nodes highlight
- [ ] Unrelated nodes dim
- [ ] Expand/collapse works

## Chat integration

- [ ] Ask AI about concept works
- [ ] Context preserved
- [ ] Existing chat preserved
- [ ] No duplicate conversation

## Error handling

- [ ] Empty graph
- [ ] malformed graph
- [ ] backend unavailable
- [ ] invalid node
- [ ] invalid edge
- [ ] large graph

## Accessibility

- [ ] nodes have labels
- [ ] toolbar has labels
- [ ] touch targets are adequate
- [ ] reduced motion respected

## Performance

- [ ] no visible stutter on pan
- [ ] no visible stutter on pinch
- [ ] no expensive recalculation per frame
- [ ] graph with ~40 nodes remains usable

---

# 78. DESIGN DETAILS — RECOMMENDED DEFAULTS

```ts
const GRAPH_CONFIG = {
  minZoom: 0.55,
  maxZoom: 2.8,
  defaultZoom: 0.9,

  rootWidth: 170,
  rootHeight: 52,

  sectionWidth: 145,
  sectionHeight: 44,

  conceptWidth: 125,
  conceptHeight: 40,

  horizontalGap: 24,
  sectionGap: 42,
  verticalGap: 86,

  maxNodesInitial: 40,
  maxEdgesInitial: 60,
};
```

Tune visually after implementation, but keep these as starting values.

---

# 79. DO NOT OVER-ENGINEER V1

Explicitly DO NOT implement in V1:

- collaborative graph editing
- node dragging
- graph persistence across devices
- social sharing
- graph export image/PDF
- graph editing by user
- automatic complete medical ontology
- real-time AI graph regeneration on every keystroke
- WebSocket graph sync
- force-directed physics
- 3D graph
- AR visualization

These are future possibilities, not part of this implementation.

---

# 80. FUTURE ROADMAP

Possible future versions:

## V2

- conversation-derived graph
- AI graph enrichment
- expand on demand
- source/citation highlighting

## V3

- node dragging
- personal notes
- favorites
- "study this branch"
- graph snapshots

## V4

- cross-topic knowledge graph
- specialty-wide graph
- links between diseases, drugs, investigations and procedures

---

# 81. FINAL PRODUCT BEHAVIOR

The finished Medical Arena experience should feel like:

```text
User opens:
Heart Failure

                  ┌──────────────┐
                  │ Guide        │
                  │ Read clinical│
                  │ content      │
                  └──────────────┘

                       ↕ switch

                  ┌──────────────┐
                  │ Chat         │
                  │ Ask AI       │
                  └──────────────┘

                       ↕ switch

             ┌─────────────────────────┐
             │         MAP             │
             │                         │
             │    Heart Failure        │
             │          / | \           │
             │         /  |  \          │
             │  Etiology Symptoms Dx    │
             │             |             │
             │         Management       │
             │             |             │
             │         Treatments       │
             └─────────────────────────┘
```

The user should understand:

> **Guide = information**
>
> **Chat = conversation**
>
> **Map = relationships**

That distinction is the core UX principle.

---

# 82. DEFINITION OF DONE

The feature is considered DONE only when ALL of the following are true:

1. Topic page has three modes:
   - Clinical Guide
   - AI Assistant
   - Map
2. Map is integrated into the same topic context.
3. Map renders deterministic local topic structure.
4. Map supports pan.
5. Map supports pinch zoom.
6. Map supports node selection.
7. Map supports reset/center.
8. Node detail UI exists.
9. Map can send a selected concept to the existing AI chat.
10. Existing chat messages survive tab switching.
11. Existing Guide behavior is unchanged.
12. No unrelated navigation behavior is broken.
13. Graph normalization protects the app from malformed data.
14. TypeScript passes.
15. Lint passes.
16. Expo Doctor passes or any existing unrelated warnings are explicitly documented.
17. Android build is verified when the environment permits it.
18. No unnecessary dependency was added.
19. No flashy/non-clinical visual language was introduced.
20. Final implementation summary names all modified files.

---

# 83. CODING AGENT EXECUTION FORMAT

The coding agent should execute in this exact sequence:

```text
1. Inspect repository
2. Inspect current topic route
3. Inspect TopicChat
4. Inspect ClinicalGuide
5. Inspect SpecialtyData
6. Inspect Colors
7. Create graph types
8. Create local graph builder
9. Create normalization utility
10. Create deterministic layout utility
11. Create KnowledgeMap components
12. Add map to TopicPage
13. Verify Guide still works
14. Verify Chat still works
15. Implement gestures
16. Implement node selection
17. Implement node detail sheet
18. Implement Map -> Chat
19. Preserve Chat state across mode switching
20. Add tests
21. Run typecheck
22. Run lint
23. Run Expo Doctor
24. Run Android build if available
25. Only then consider backend AI enrichment
26. Summarize work
```

Do not skip directly to backend AI generation.

---

# 84. FINAL INSTRUCTION TO THE CODING AGENT

**Implement this feature as an incremental extension of the existing Medical Arena codebase.**

Do not redesign the application.

Do not replace working systems.

Do not invent a new architecture unless the existing code makes the described architecture technically impossible.

The feature must feel like it has always belonged inside Medical Arena.

The highest priority order is:

```text
1. Correctness
2. Existing app stability
3. Medical context integrity
4. UX clarity
5. Gesture performance
6. Visual consistency
7. AI enrichment
```

When trade-offs are necessary, prefer:

**simple + deterministic + robust**

over:

**clever + dynamic + fragile**

The Map is a visualization of medical knowledge, not a replacement for the existing clinical content or AI assistant.
