import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, User, ArrowRight, Loader2, Eye, EyeOff, Chrome } from "lucide-react";
import { z } from "zod";

import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useToast } from "../hooks/use-toast";
import { useAuth } from "../hooks/useAuth";
import starryAvatar from "../assets/avatars/starry.png";

const loginSchema = z.object({
  email: z.string().email("Zadaj platný email"),
  password: z.string().min(6, "Heslo musí mať aspoň 6 znakov"),
});

const signupSchema = loginSchema.extend({
  displayName: z.string().min(2, "Meno musí mať aspoň 2 znaky").max(50, "Meno môže mať max 50 znakov"),
});

type FieldErrors = Record<string, string>;

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});

  const navigate = useNavigate();
  const { toast } = useToast();
  const { signIn, signUp, signInWithGoogle, isAuthenticated, isLoading } = useAuth();

  const schema = useMemo(() => (isLogin ? loginSchema : signupSchema), [isLogin]);
  const data = useMemo(
    () => (isLogin ? { email, password } : { email, password, displayName }),
    [isLogin, email, password, displayName]
  );

  React.useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate("/home", { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  const validateForm = () => {
    const result = schema.safeParse(data);
    if (!result.success) {
      const fieldErrors: FieldErrors = {};
      for (const err of result.error.issues) {
        fieldErrors[String(err.path?.[0] ?? "form")] = err.message;
      }
      setErrors(fieldErrors);
      return false;
    }
    setErrors({});
    return true;
  };

  const handleAuthError = (title: string, message: string) => {
    toast({ title, description: message, variant: "error" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const result = isLogin
        ? await signIn(email, password)
        : await signUp(email, password, displayName);

      if (result.error) {
        handleAuthError(isLogin ? "Prihlásenie zlyhalo" : "Registrácia zlyhala", result.error.message);
        return;
      }

      toast({
        title: isLogin ? "Vitaj späť!" : "Účet vytvorený!",
        description: isLogin ? "Úspešne si sa prihlásil." : "Vitaj v Starlink Heart.",
      });
      navigate("/home", { replace: true });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsSubmitting(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        handleAuthError("Google prihlásenie zlyhalo", error.message);
        return;
      }

      toast({ title: "Prihlásenie úspešné!", description: "Vitaj späť." });
      navigate("/home", { replace: true });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleMode = () => {
    setIsLogin((v) => !v);
    setErrors({});
    setShowPassword(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#060819] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-sky-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060819] flex items-center justify-center p-4 relative overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <motion.div
            className="inline-flex items-center justify-center mb-4"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <img src={starryAvatar} alt="Logo" className="w-16 h-auto drop-shadow-[0_0_15px_rgba(56,189,248,0.5)]" />
          </motion.div>
          <h1 className="text-2xl font-black text-white tracking-tight">Starlink Heart</h1>
        </div>

        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl">
          <h2 className="text-xl font-bold mb-2 text-center text-white">
            {isLogin ? "Vitaj späť" : "Vytvor si účet"}
          </h2>
          <p className="text-center text-white/60 text-sm mb-6">
            Prihlás sa emailom alebo cez Google.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="displayName" className="text-white/80">Meno</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                  <Input
                    id="displayName"
                    type="text"
                    placeholder="Tvoje meno"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="pl-11 bg-white/10 border-white/20 text-white placeholder:text-white/40"
                  />
                </div>
                {errors.displayName && <p className="text-xs text-red-400">{errors.displayName}</p>}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-white/80">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <Input
                  id="email"
                  type="email"
                  placeholder="tvoj@email.sk"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-11 bg-white/10 border-white/20 text-white placeholder:text-white/40"
                />
              </div>
              {errors.email && <p className="text-xs text-red-400">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-white/80">Heslo</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-11 pr-11 bg-white/10 border-white/20 text-white placeholder:text-white/40"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-400">{errors.password}</p>}
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-600 hover:to-indigo-600 text-white font-bold h-12 mt-2"
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>{isLogin ? "Prihlásiť sa" : "Vytvoriť účet"} <ArrowRight className="w-4 h-4 ml-2" /></>
              )}
            </Button>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isSubmitting}
              className="w-full h-12 rounded-xl border border-white/20 bg-white/10 text-white font-semibold flex items-center justify-center gap-2 hover:bg-white/15 transition-colors"
            >
              <Chrome className="w-4 h-4" />
              Pokračovať s Google
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={toggleMode}
              className="text-sm text-white/60 hover:text-white transition-colors"
            >
              {isLogin ? (
                <>Nemáš účet? <span className="text-sky-400 font-semibold">Registruj sa</span></>
              ) : (
                <>Máš účet? <span className="text-sky-400 font-semibold">Prihlás sa</span></>
              )}
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-white/30 mt-6">
          Pokračovaním súhlasíš s podmienkami používania.
        </p>
      </motion.div>
    </div>
  );
}
