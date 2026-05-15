"use client";

import { useEffect, useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { addFavorite, removeFavorite } from "@/app/actions/favorites";
import { cn } from "@/lib/utils";

type FavoriteButtonProps = {
  shopId: string;
  className?: string;
};

export function FavoriteButton({ shopId, className }: FavoriteButtonProps) {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(async ({ data }) => {
      const session = data.session;
      setIsLoggedIn(!!session);
      if (!session) return;

      const { data: fav } = await supabase
        .from("favorites")
        .select("id")
        .eq("shop_id", shopId)
        .eq("user_id", session.user.id)
        .maybeSingle();
      setIsFavorited(!!fav);
    });
  }, [shopId]);

  if (isLoggedIn === null) return null;

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (!isLoggedIn) {
      router.push("/login");
      return;
    }

    startTransition(async () => {
      if (isFavorited) {
        setIsFavorited(false);
        await removeFavorite(shopId);
      } else {
        setIsFavorited(true);
        await addFavorite(shopId);
      }
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      aria-label={isFavorited ? "Quitar de favoritos" : "Guardar en favoritos"}
      className={cn(
        "flex size-8 items-center justify-center rounded-full transition-colors",
        "bg-white/90 shadow-sm hover:bg-white dark:bg-zinc-800/90 dark:hover:bg-zinc-800",
        "disabled:opacity-50",
        className,
      )}
    >
      <Heart
        className={cn(
          "size-4 transition-colors",
          isFavorited
            ? "fill-rose-500 text-rose-500"
            : "fill-transparent text-zinc-400 hover:text-rose-400",
        )}
      />
    </button>
  );
}
