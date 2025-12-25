import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, User, ArrowRight, Loader2, Eye, EyeOff } from "lucide-react";
import { z } from "zod";

import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useToast } from "../hooks/use-toast";
import { useAuth } from "../hooks/useAuth";

// Use existing mascot image as logo
import logoImage from "../assets/image.png";

const loginSchema = z.object({
  email: z.string().email("Zadaj platný email"),
  password: z.string().min(6, "Heslo musí mať aspoň 6 znakov"),
});

const signupSchema = loginSchema.extend({
  displayName: z
    .string()
    .min(2, "Meno musí mať aspoň 2 znaky")
    .max(50, "Meno môže mať max 50 znakov"),
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
  const [mfaCode, setMfaCode] = useState("");

  const navigate = useNavigate();
  const { toast } = useToast();
  const { signIn, signUp, isAuthenticated, isLoading, mfaChallenge, verifyMfa } = useAuth();

  const showMfa = Boolean(mfaChallenge);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate("/home", { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  const schema = useMemo(() => (isLogin ? loginSchema : signupSchema), [isLogin]);
  const data = useMemo(
    () => (isLogin ? { email, password } : { email, password, displayName }),
    [isLogin, email, password, displayName]
  );

  const validateForm = () => {
    const result = schema.safeParse(data);
    if (!result.success) {
      const fieldErrors: FieldErrors = {};
      for (const err of result.error.issues) {
        const key = String(err.path?.[0] ?? "form");
        fieldErrors[key] = err.message;
      }
      setErrors(fieldErrors);
      return false;
    }
    setErrors({});
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      if (isLogin) {
        const { error, mfaRequired } = await signIn(email, password);

        if (mfaRequired) {
          toast({ title: "MFA Required", description: "Zadaj autentifikačný kód." });
          return;
        }

        if (error) {
          toast({
            title: "Prihlásenie zlyhalo",
            description: error.message.includes("Invalid") 
              ? "Nesprávny email alebo heslo." 
              : error.message,
            variant: "destructive",
          });
          return;
        }

        toast({ title: "Vitaj späť!", description: "Úspešne si sa prihlásil." });
        navigate("/home", { replace: true });
      } else {
        const { error } = await signUp(email, password, displayName);

        if (error) {
          toast({
            title: error.message.includes("registered") ? "Účet existuje" : "Registrácia zlyhala",
            description: error.message.includes("registered")
              ? "Tento email je už zaregistrovaný."
              : error.message,
            variant: "destructive",
          });
          return;
        }

        toast({ title: "Účet vytvorený!", description: "Vitaj v Starlink Heart." });
        navigate("/home", { replace: true });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMfaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mfaCode.trim().length !== 6) return;

    setIsSubmitting(true);
    try {
      const { error } = await verifyMfa(mfaCode.trim());
      if (error) {
        toast({ title: "MFA zlyhalo", description: error.message, variant: "destructive" });
        return;
      }
      toast({ title: "Prihlásenie úspešné!", description: "Vitaj späť." });
      navigate("/home", { replace: true });
    } catch {
      toast({ title: "MFA zlyhalo", description: "Neplatný kód.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleMode = () => {
    setIsLogin((v) => !v);
    setErrors({});
    setMfaCode("");
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
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            className="inline-flex items-center justify-center mb-4"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <img src={logoImage} alt="Starlink Heart" className="h-24 w-auto drop-shadow-2xl" />
          </motion.div>
          <h1 className="text-2xl font-black text-white tracking-tight">Starlink Heart</h1>
        </div>

        {/* Auth Card */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={showMfa ? "mfa" : isLogin ? "login" : "signup"}
              initial={{ opacity: 0, x: isLogin ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isLogin ? 20 : -20 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-xl font-bold mb-6 text-center text-white">
                {showMfa ? "Dvojfaktorové overenie" : isLogin ? "Vitaj späť" : "Vytvor si účet"}
              </h2>

              {showMfa ? (
                <form onSubmit={handleMfaSubmit} className="space-y-6">
                  <p className="text-center text-white/70">Zadaj kód z autentifikačnej apky</p>

                  <div className="space-y-2">
                    <Label htmlFor="mfaCode" className="text-white/80">Kód</Label>
                    <Input
                      id="mfaCode"
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      placeholder="000000"
                      value={mfaCode}
                      onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      className="text-center text-2xl tracking-widest bg-white/10 border-white/20 text-white placeholder:text-white/40"
                      maxLength={6}
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting || mfaCode.length !== 6}
                    className="w-full bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-600 hover:to-indigo-600 text-white font-bold h-12"
                  >
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Overiť <ArrowRight className="w-4 h-4 ml-2" /></>}
                  </Button>
                </form>
              ) : (
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
                </form>
              )}

              {!showMfa && (
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
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <p className="text-center text-xs text-white/30 mt-6">
          Pokračovaním súhlasíš s podmienkami používania.
        </p>
      </motion.div>
    </div>
  );
}
