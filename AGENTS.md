# AGENTS.md - Agent Coding Guidelines

> Guidelines for agentic coding agents operating in this repository.

---

## 1. Build, Lint, and Test Commands

### Development
```bash
npm run dev          # Start Next.js development server (http://localhost:3000)
npm run build        # Production build
npm run start        # Start production server
```

### Linting
```bash
npm run lint         # Run ESLint (eslint-config-next/core-web-vitals + TypeScript)
```

### Testing
```bash
npm test             # Run Vitest in watch mode
npm test -- --run    # Run Vitest once (for CI/pre-commit)
npm test -- --run src/path/to/file.test.tsx   # Run single test file
npm test -- src/path/to/file.test.tsx -t "test name"  # Run single test
npm run test:watch  # Alias for watch mode
```

### Release Safety Checks (before merge)
```bash
npm run lint
npm test -- --run
npm run build
```

### E2E Testing (Playwright)
```bash
npm run test:e2e         # Run all E2E tests
npm run test:e2e:ui      # Run with UI mode
npm run test:e2e:headed  # Run in headed mode
npm run test:perf        # Run performance tests only
npx playwright show-report  # View HTML report
```

---

## 2. Code Style Guidelines

### General
- **Framework**: Next.js 16 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS v4 with custom config (brand color: #8A9A5B)
- **Testing**: Vitest + @testing-library/react + jsdom
- **Backend**: Supabase (SSR, server client, admin client)

### File Organization
```
src/
├── app/              # Next.js App Router pages
│   ├── api/         # API routes (route.ts)
│   └── components/ # Page-specific components
├── components/      # Shared components
│   ├── ui/          # Reusable UI components
│   ├── admin/      # Admin components
│   └── project/    # Project-related components
├── lib/             # Utilities, data, Supabase clients
├── hooks/           # Custom React hooks
└── context/         # React context providers
```

### Path Aliases (use these instead of relative paths)
```typescript
import { cn } from "@/lib/utils";
import { useUser } from "hooks/useUser";
import { MyComponent } from "components/ui/MyComponent";
import { useTheme } from "context/ThemeContext";
```

### Component Rules
1. **Client Components**: Add `"use client"` at the top of any component using:
   - React hooks (useState, useEffect, useCallback, etc.)
   - Browser APIs (window, document)
   - Event handlers
   - @testing-library/react

2. **Props**: Use TypeScript interfaces, avoid `any`
```typescript
interface MyComponentProps {
  title: string;
  items?: string[];  // optional with ?
  onAction: (id: string) => void;
}
```

3. **Naming**:
   - Components: PascalCase (e.g., `ProjectGrid.tsx`)
   - Hooks: camelCase with `use` prefix (e.g., `useUser.ts`)
   - Utilities: camelCase (e.g., `utils.ts`, `imageUtils.ts`)
   - Test files: `*.test.tsx` or `*.test.ts` (co-located)

### Error Handling (API Routes)
```typescript
export async function GET() {
  try {
    // ... logic
    return NextResponse.json(data);
  } catch (error) {
    console.error("GET Projects Error:", error);
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
  }
}
```

### Tailwind CSS
- Use custom colors from `tailwind.config.ts` (brand: #8A9A5B)
- Custom animations (fade-in-up), letter-spacing, font sizes (xxs)
- Use `cn()` utility for conditional classes: `cn("base-class", condition && "conditional")`

### Testing Guidelines
- Use AAA pattern (Arrange, Act, Assert)
- Mock Next.js components: `vi.mock('next/image', () => ({ default: (props) => <img {...props} /> }))`
- Use `data-testid` for complex components
- Mock fetch/global APIs as needed
- Clear mocks in `beforeEach`: `vi.clearAllMocks()`

---

## 3. Project-Specific Agent Rules (from .agent/rules/GEMINI.md)

### Request Classification
| Type | Keywords | Action |
|------|----------|--------|
| QUESTION | what is, how does | Text response |
| SURVEY | analyze, list files | Session intel |
| SIMPLE CODE | fix, add (single file) | Inline edit |
| COMPLEX CODE | build, create, implement | Requires task.md |
| DESIGN/UI | design, page, dashboard | Requires task.md |

### Agent Routing Protocol
Before any code/design work:
1. Identify correct specialist agent for domain
2. Read agent's .md file
3. Announce: "🤖 Applying knowledge of @[agent]..."
4. Load required skills from agent's frontmatter

### Socratic Gate
For complex requests, STOP and ask clarifying questions first:
- What is the GOAL?
- What are the edge cases?
- What files will be affected?

### Priority Order (Final Checklist)
1. Security → 2. Lint → 3. Tests → 4. Build → 5. UX → 6. SEO

---

## 4. Key Dependencies

```json
{
  "next": "16.1.1",
  "react": "19.2.3",
  "typescript": "^5",
  "tailwindcss": "^4",
  "vitest": "^4.0.18",
  "@testing-library/react": "^16.3.2",
  "@supabase/ssr": "^0.8.0",
  "framer-motion": "^12.26.2",
  "lucide-react": "^0.562.0"
}
```

---

## 5. Environment Variables

Required in `.env.local`:
- Supabase credentials (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)
- Google APIs (for sheets/drive integration)
- Upload bucket configuration

---

## 6. Important Notes

- This is a portfolio site with admin dashboard for project management
- Images are optimized via API route and stored in Supabase Storage
- Form submissions go to Google Sheets via API
- Use the testing matrix at `docs/testing-matrix.md` for high-value test coverage
