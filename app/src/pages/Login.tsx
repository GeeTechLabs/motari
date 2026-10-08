import { useState } from "react";
import { useNavigate } from "react-router";
import { Lock, ArrowRight, ShieldCheck, AlertCircle } from "lucide-react";
import { trpc } from "@/providers/trpc";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();
  const utils = trpc.useUtils();

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: async () => {
      toast.success("Welcome back, Administrator");
      await utils.invalidate();
      navigate("/admin/cars");
    },
    onError: (err) => {
      setErrorMsg(err.message || "Invalid credentials");
      toast.error(err.message || "Invalid credentials");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    if (!username.trim() || !password) {
      setErrorMsg("Please enter both username and password");
      return;
    }
    loginMutation.mutate({ username, password });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink px-4 py-12 text-white">
      {/* Background ambient gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gold/10 via-ink to-ink pointer-events-none" />

      <div className="relative w-full max-w-md border border-white/10 bg-ink-soft/80 p-8 shadow-2xl backdrop-blur-md md:p-10">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-gold/30 bg-gold/10 text-gold">
            <Lock className="h-5 w-5" />
          </div>
          <h1 className="mt-4 font-serif text-2xl text-white md:text-3xl">
            Motari<span className="text-gold">.</span>
          </h1>
          <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.2em] text-white/50">
            Back Office Authentication
          </p>
        </div>

        {errorMsg && (
          <div className="mt-6 flex items-center gap-2 border border-red-500/30 bg-red-500/10 px-4 py-3 font-mono text-[11px] text-red-200">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-[0.14em] text-white/70">
              Username / Email
            </label>
            <Input
              type="text"
              autoComplete="username"
              placeholder="admin or admin@motari.co.ke"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1.5 border-white/20 bg-white/5 text-white placeholder:text-white/30 focus-visible:border-gold focus-visible:ring-gold/30"
              required
            />
          </div>

          <div>
            <label className="block font-mono text-[10px] uppercase tracking-[0.14em] text-white/70">
              Password
            </label>
            <Input
              type="password"
              autoComplete="current-password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1.5 border-white/20 bg-white/5 text-white placeholder:text-white/30 focus-visible:border-gold focus-visible:ring-gold/30"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="btn-gold mt-6 w-full gap-2 !text-ink"
          >
            {loginMutation.isPending ? (
              "Authenticating…"
            ) : (
              <>
                Enter Back Office
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 border-t border-white/10 pt-4 text-center">
          <div className="inline-flex items-center gap-1.5 font-mono text-[10px] text-white/40">
            <ShieldCheck className="h-3.5 w-3.5 text-gold" />
            <span>Restricted area — Authorized staff only</span>
          </div>
          <div className="mt-3">
            <button
              onClick={() => navigate("/")}
              className="font-mono text-[11px] text-white/50 hover:text-white hover:underline"
            >
              ← Back to public showroom
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
