"use client";

import { FormEvent, useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

type ProfileForm = {
  profileName: string;
  roles: string;
  description: string;
  skills: string;
  githubUrl: string;
  linkedinUrl: string;
};

const initialForm: ProfileForm = {
  profileName: "",
  roles: "",
  description: "",
  skills: "",
  githubUrl: "",
  linkedinUrl: "",
};

export default function Home() {
  const [form, setForm] = useState<ProfileForm>(initialForm);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(true);
  const [loginError, setLoginError] = useState("");
  const [portfolioId, setPortfolioId] = useState<string | number | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState("");
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    async function checkSession() {
      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession();

      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setAuthLoading(false);

      if (!currentSession) {
        setLoading(false);
      }
    }

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setAuthLoading(false);

      if (!currentSession) {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      return;
    }

    async function loadPortfolio() {
      setLoading(true);
      const { data, error } = await supabase
        .from("portfolio")
        .select("*")
        .single();

      if (error) {
        console.error("Error loading portfolio:", error);
        setLoading(false);
        return;
      }

      setPortfolioId(data.id);
      setForm({
        profileName: data.name,
        roles: data.roles.join("\n"),
        description: data.description,
        skills: data.skills.join("\n"),
        githubUrl: data.github_url,
        linkedinUrl: data.linkedin_url,
      });
      setLoading(false);
    }

    loadPortfolio();
  }, [user]);

  function updateField(field: keyof ProfileForm, value: string) {
    setForm((currentForm) => ({ ...currentForm, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (portfolioId === null) {
      setSaveError("Unable to save because the portfolio record was not loaded.");
      return;
    }

    setSaving(true);
    setSaveSuccess("");
    setSaveError("");

    const roles = form.roles
      .split("\n")
      .map((role) => role.trim())
      .filter((role) => role.length > 0);
    const skills = form.skills
      .split("\n")
      .map((skill) => skill.trim())
      .filter((skill) => skill.length > 0);

    const { error } = await supabase
      .from("portfolio")
      .update({
        name: form.profileName,
        roles,
        description: form.description,
        skills,
        github_url: form.githubUrl,
        linkedin_url: form.linkedinUrl,
      })
      .eq("id", portfolioId);

    if (error) {
      setSaveError(error.message);
    } else {
      setSaveSuccess("Changes saved successfully.");
    }

    setSaving(false);
  }

  async function handleSignIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAuthLoading(true);
    setLoginError("");

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setLoginError(error.message);
      setAuthLoading(false);
      return;
    }

    setSession(data.session);
    setUser(data.user);
    setPassword("");
    setAuthLoading(false);
  }

  async function handleSignOut() {
    setAuthLoading(true);
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Error signing out:", error);
    }

    setSession(null);
    setUser(null);
    setAuthLoading(false);
  }

  if (authLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 text-slate-600">
        Loading...
      </main>
    );
  }

  if (!session || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-8 text-slate-900">
        <div className="w-full max-w-md">
          <header className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-700">
              Portfolio CMS
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
              Sign in
            </h1>
            <p className="mt-3 text-slate-600">
              Sign in to manage your portfolio content.
            </p>
          </header>

          <form
            onSubmit={handleSignIn}
            className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
          >
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-slate-800"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-2 block w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-slate-800"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-2 block w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
              />
            </div>

            {loginError && (
              <p role="alert" className="text-sm text-red-600">
                {loginError}
              </p>
            )}

            <button
              type="submit"
              disabled={authLoading}
              className="w-full rounded-md bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Sign In
            </button>
          </form>
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 text-slate-600">
        Loading portfolio...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <header className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-700">
            Portfolio CMS
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Profile settings
          </h1>
          <p className="mt-3 text-slate-600">
            Update the content displayed on your public portfolio.
          </p>
          <button
            type="button"
            onClick={handleSignOut}
            className="mt-5 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:ring-offset-2"
          >
            Sign Out
          </button>
        </header>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
        >
          <div>
            <label
              htmlFor="profile-name"
              className="block text-sm font-semibold text-slate-800"
            >
              Profile Name
            </label>
            <input
              id="profile-name"
              name="profileName"
              type="text"
              value={form.profileName}
              onChange={(event) => updateField("profileName", event.target.value)}
              className="mt-2 block w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
            />
          </div>

          <div>
            <label htmlFor="roles" className="block text-sm font-semibold text-slate-800">
              Roles
            </label>
            <textarea
              id="roles"
              name="roles"
              rows={4}
              value={form.roles}
              onChange={(event) => updateField("roles", event.target.value)}
              className="mt-2 block w-full resize-y rounded-md border border-slate-300 px-3 py-2.5 text-sm leading-6 outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-semibold text-slate-800"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              value={form.description}
              onChange={(event) => updateField("description", event.target.value)}
              className="mt-2 block w-full resize-y rounded-md border border-slate-300 px-3 py-2.5 text-sm leading-6 outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
            />
          </div>

          <div>
            <label htmlFor="skills" className="block text-sm font-semibold text-slate-800">
              Skills
            </label>
            <textarea
              id="skills"
              name="skills"
              rows={8}
              value={form.skills}
              onChange={(event) => updateField("skills", event.target.value)}
              className="mt-2 block w-full resize-y rounded-md border border-slate-300 px-3 py-2.5 text-sm leading-6 outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
            />
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label
                htmlFor="github-url"
                className="block text-sm font-semibold text-slate-800"
              >
                GitHub URL
              </label>
              <input
                id="github-url"
                name="githubUrl"
                type="text"
                value={form.githubUrl}
                onChange={(event) => updateField("githubUrl", event.target.value)}
                className="mt-2 block w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
              />
            </div>

            <div>
              <label
                htmlFor="linkedin-url"
                className="block text-sm font-semibold text-slate-800"
              >
                LinkedIn URL
              </label>
              <input
                id="linkedin-url"
                name="linkedinUrl"
                type="text"
                value={form.linkedinUrl}
                onChange={(event) => updateField("linkedinUrl", event.target.value)}
                className="mt-2 block w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
              />
            </div>
          </div>

          <div className="flex justify-end border-t border-slate-200 pt-6">
            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-md bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
          {saveSuccess && (
            <p role="status" className="text-sm text-green-700">
              {saveSuccess}
            </p>
          )}
          {saveError && (
            <p role="alert" className="text-sm text-red-600">
              {saveError}
            </p>
          )}
        </form>
      </div>
    </main>
  );
}
