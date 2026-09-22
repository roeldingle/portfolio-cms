import { supabase } from "@/lib/supabase";
export const dynamic = "force-dynamic";

export default async function Home() {
  const { data: portfolio, error } = await supabase
    .from("portfolio")
    .select("*")
    .single();

  if (error) {
    console.log("SUPABASE ERROR:", error);
    return <main>Unable to load portfolio.</main>;
  }
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-slate-100 sm:px-10 lg:px-16">
      <div className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-5xl flex-col justify-between">
        <header className="max-w-3xl">
          <p className="mb-6 text-sm font-medium uppercase tracking-[0.25em] text-cyan-400">
            Developer Portfolio
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
            {portfolio.name}
          </h1>
          <ul className="mt-6 space-y-2 text-lg leading-6 text-slate-300 sm:text-xl">
            {portfolio.roles.map((role: string) => (
              <li key={role}>{role}</li>
            ))}
          </ul>
          <p className="mt-6 max-w-2xl text-base leading-6 text-slate-400 sm:text-lg">
            {portfolio.description}
          </p>
        </header>

        <section aria-labelledby="skills-heading" className="my-16">
          <h2
            id="skills-heading"
            className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400"
          >
            Skills
          </h2>
          <ul className="mt-5 flex max-w-4xl flex-wrap gap-3">
            {portfolio.skills.map((skill: string) => (
              <li
                key={skill}
                className="rounded-md border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-200"
              >
                {skill}
              </li>
            ))}
          </ul>
        </section>

        <footer className="border-t border-slate-800 pt-6">
          <nav aria-label="Social links" className="flex gap-6 text-sm font-medium">
            <a
              href={portfolio.github_url}
              className="text-slate-300 underline decoration-slate-600 underline-offset-4 hover:text-cyan-400"
            >
              GitHub
            </a>
            <a
              href={portfolio.linkedin_url}
              className="text-slate-300 underline decoration-slate-600 underline-offset-4 hover:text-cyan-400"
            >
              LinkedIn
            </a>
          </nav>
        </footer>
      </div>
    </main>
  );
}
