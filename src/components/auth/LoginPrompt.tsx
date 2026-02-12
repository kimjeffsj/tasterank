"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";

interface LoginPromptProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LoginPrompt({ open, onOpenChange }: LoginPromptProps) {
  const { signInWithGoogle } = useAuth();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm rounded-3xl">
        <DialogHeader className="text-center">
          <DialogTitle className="text-xl font-bold">
            Sign in to continue
          </DialogTitle>
          <DialogDescription className="text-gray-500">
            Sign in with Google to add food, rate, and rank your travel meals.
          </DialogDescription>
        </DialogHeader>
        <button
          onClick={signInWithGoogle}
          className="mt-4 flex w-full items-center justify-center gap-3 rounded-full bg-primary py-4 font-bold text-white shadow-glow transition-all active:scale-[0.97]"
        >
          <span className="material-icons-round text-xl">login</span>
          Continue with Google
        </button>
      </DialogContent>
    </Dialog>
  );
}
