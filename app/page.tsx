import { cn } from "@/lib/utils";

/**
 * Token proof page.
 *
 * Every colour and type decision here comes from the tokens in globals.css,
 * which are mapped onto shadcn's semantic names. Anything added with
 * `npx shadcn add ...` inherits this palette without further wiring.
 */

const swatches = [
  { name: "ink", varName: "--optique-ink", note: "17.40:1 on white" },
  { name: "warm", varName: "--optique-warm", note: "panel ground" },
  { name: "brass", varName: "--optique-brass", note: "5.13:1 on warm" },
  { name: "muted", varName: "--optique-muted", note: "4.58:1 on warm" },
  { name: "hairline", varName: "--optique-hairline", note: "decorative only" },
];

function Outline({ children }: { children: React.ReactNode }) {
  return (
    <button
      className={cn(
        "inline-flex min-h-12 items-center justify-center border border-foreground",
        "px-6 text-[0.625rem] font-medium uppercase tracking-[0.24em]",
        "transition-colors duration-300 hover:bg-foreground hover:text-background",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
      )}
    >
      {children}
    </button>
  );
}

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-16">
      <span className="label text-brass">Optique — design system</span>
      <h1 className="font-display mt-4 text-5xl leading-none font-normal sm:text-6xl">
        Havana Brown
      </h1>
      <p className="text-muted-foreground mt-5 max-w-[46ch] text-sm leading-relaxed font-light">
        This page exists to prove the tokens resolve. The palette, type scale and
        control styling below are the same ones any shadcn component will pick up
        once it lands in <code className="text-foreground">components/ui</code>.
      </p>

      <div className="mt-10 flex flex-wrap gap-3">
        <Outline>Shop this frame</Outline>
        <button className="bg-primary text-primary-foreground min-h-12 px-6 text-[0.625rem] font-medium tracking-[0.24em] uppercase">
          Primary
        </button>
      </div>

      <section className="mt-16">
        <span className="label text-muted-foreground">Brand tokens</span>
        <div className="border-border mt-4 grid gap-px border sm:grid-cols-5 bg-border">
          {swatches.map((s) => (
            <div key={s.name} className="bg-card p-4">
              <span
                className="border-border block h-12 border"
                style={{ background: `var(${s.varName})` }}
              />
              <code className="mt-3 block text-[0.6875rem]">{s.name}</code>
              <span className="text-muted-foreground mt-1 block text-[0.6875rem]">
                {s.note}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="border-border mt-16 border-t pt-8">
        <span className="label text-brass">Adding components</span>
        <p className="text-muted-foreground mt-4 max-w-[64ch] text-sm leading-relaxed font-light">
          The registry namespace is configured in{" "}
          <code className="text-foreground">components.json</code>. Run the add
          command from the repository root; the component lands in{" "}
          <code className="text-foreground">components/ui</code> already themed.
        </p>
        <pre className="border-border bg-muted mt-4 overflow-x-auto border p-4 text-xs">
          <code>npx shadcn@latest add @skiper-ui/skiper40</code>
        </pre>
      </section>
    </main>
  );
}
