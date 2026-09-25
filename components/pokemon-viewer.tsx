"use client";

import { use, useState, startTransition, Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

interface PokemonData {
  id: number;
  name: string;
  sprites: {
    front_default: string | null;
    other: {
      "official-artwork": {
        front_default: string | null;
      };
    };
  };
  types: { slot: number; type: { name: string } }[];
  height: number;
  weight: number;
  stats: { base_stat: number; stat: { name: string } }[];
}

const typeColors: Record<string, string> = {
  normal: "bg-ink-400",
  fire: "bg-coral-600",
  water: "bg-blue-deep",
  grass: "bg-green-deep",
  electric: "bg-yellow-400",
  ice: "bg-sky-light",
  fighting: "bg-red-700",
  poison: "bg-purple-500",
  ground: "bg-yellow-700",
  flying: "bg-indigo-light",
  psychic: "bg-pink-500",
  bug: "bg-lime-600",
  rock: "bg-stone-500",
  ghost: "bg-purple-700",
  dragon: "bg-indigo-deep",
  steel: "bg-gray-400",
  fairy: "bg-pink-300",
};

const typeColorsES: Record<string, string> = {
  normal: "Normal",
  fire: "Fuego",
  water: "Agua",
  grass: "Planta",
  electric: "Eléctrico",
  ice: "Hielo",
  fighting: "Lucha",
  poison: "Veneno",
  ground: "Tierra",
  flying: "Volador",
  psychic: "Psíquico",
  bug: "Bicho",
  rock: "Roca",
  dragon: "Dragón",
  steel: "Acero",
  fairy: "Hada",
  ghost: "Fantasma",
  dark: "Siniestro",
};

const statLabels: Record<string, string> = {
  hp: "PS",
  attack: "Ataque",
  defense: "Defensa",
  "special-attack": "At. Esp.",
  "special-defense": "Def. Esp.",
  speed: "Velocidad",
};

// ✅ Promise cache: ensures the same Promise instance is reused across renders.
// Creating a new Promise on every render causes React to suspend repeatedly.
const pokemonCache = new Map<number, Promise<PokemonData>>();

function fetchPokemon(pokemonId: number): Promise<PokemonData> {
  if (!pokemonCache.has(pokemonId)) {
    const promise = fetch(
      `https://pokeapi.co/api/v2/pokemon/${pokemonId}`,
    ).then((res) => {
      if (!res.ok)
        throw new Error(`Pokémon #${pokemonId} no encontrado`);
      return res.json() as Promise<PokemonData>;
    });
    pokemonCache.set(pokemonId, promise);
  }
  return pokemonCache.get(pokemonId)!;
}

function refetchPokemon(pokemonId: number): Promise<PokemonData> {
  pokemonCache.delete(pokemonId);
  return fetchPokemon(pokemonId);
}

// ✅ Inner component that calls `use()` — must be wrapped in Suspense + ErrorBoundary.
function PokemonContent({
  pokemonPromise,
}: {
  pokemonPromise: Promise<PokemonData>;
}) {
  const pokemon = use(pokemonPromise);

  const imageSrc =
    pokemon.sprites.other["official-artwork"].front_default ??
    pokemon.sprites.front_default ??
    "";

  const displayName = pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);

  return (
    <>
      <div>
        <div className="mb-4 flex justify-center">
          <img
            src={imageSrc}
            alt={`Ilustración de ${displayName}`}
            className="h-48 w-48 object-contain"
          />
        </div>

        <h2 className="mb-2 text-center text-xl font-display capitalize text-ink-900">
          {displayName}
        </h2>

        <div className="mb-4 flex justify-center gap-2">
          {pokemon.types.map((t) => (
            <span
              key={t.type.name}
              className={`rounded-full px-3 py-1 text-sm font-semibold text-white ${typeColors[t.type.name] ?? "bg-ink-500"}`}
            >
              {typeColorsES[t.type.name] ?? t.type.name}
            </span>
          ))}
        </div>

        <div className="mb-4 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-lg bg-surface-muted p-2 text-center">
            <span className="text-ink-600">Altura</span>
            <p className="font-semibold text-ink-900">
              {(pokemon.height / 10).toFixed(1)} m
            </p>
          </div>
          <div className="rounded-lg bg-surface-muted p-2 text-center">
            <span className="text-ink-600">Peso</span>
            <p className="font-semibold text-ink-900">
              {(pokemon.weight / 10).toFixed(1)} kg
            </p>
          </div>
        </div>

        <div className="space-y-2">
          {pokemon.stats.map((s) => (
            <div key={s.stat.name} className="flex items-center gap-2 text-sm">
              <span className="w-20 text-ink-700">
                {statLabels[s.stat.name] ?? s.stat.name}
              </span>
              <span className="w-8 text-right font-semibold text-ink-900">
                {s.base_stat}
              </span>
              <div className="flex-1 overflow-hidden rounded-full bg-surface-muted">
                <div
                  className="h-2 rounded-full bg-coral-500 transition-all"
                  style={{
                    width: `${Math.min((s.base_stat / 255) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function PokemonLoading() {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-ink-600">
      <div className="mb-2 h-6 w-6 animate-spin rounded-full border-4 border-coral-500 border-t-transparent" />
      <span className="text-sm">Cargando Pokémon…</span>
    </div>
  );
}

// ✅ Parent component: manages state, wraps content with Suspense + ErrorBoundary.
export function PokemonViewer() {
  const [id, setId] = useState(1);
  const [pokemonPromise, setPokemonPromise] = useState<Promise<PokemonData>>(
    () => fetchPokemon(id),
  );

  const navigate = (delta: number) => {
    const next = id + delta;
    if (next < 1) return;
    setId(next);
    startTransition(() => {
      setPokemonPromise(fetchPokemon(next));
    });
  };

  function handleRetry() {
    startTransition(() => {
      setPokemonPromise(refetchPokemon(id));
    });
  }

  return (
    <div className="mx-auto max-w-lg rounded-2xl bg-surface p-6 shadow-lg">
      <h1 className="mb-4 text-center text-2xl font-display font-bold text-ink-900">
        Pokédex
      </h1>

      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          disabled={id <= 1}
          aria-label="Pokémon anterior"
          className="rounded-lg bg-coral-500 px-4 py-2 text-white transition hover:bg-coral-600 disabled:cursor-not-allowed disabled:opacity-40"
        >
          ← Anterior
        </button>

        <span
          className="font-display text-lg font-semibold text-ink-800"
          aria-live="polite"
        >
          #{String(id).padStart(3, "0")}
        </span>

        <button
          onClick={() => navigate(1)}
          aria-label="Siguiente Pokémon"
          className="rounded-lg bg-coral-500 px-4 py-2 text-white transition hover:bg-coral-600 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Siguiente →
        </button>
      </div>

      <ErrorBoundary
        resetKeys={[pokemonPromise]}
        fallbackRender={({ resetErrorBoundary }) => (
          <div className="rounded-lg bg-red-50 p-4 text-center">
            <p className="mb-2 text-red-700">
              No se pudo cargar el Pokémon.
            </p>
            <button
              onClick={() => {
                handleRetry();
                resetErrorBoundary();
              }}
              className="rounded-lg bg-coral-500 px-4 py-2 text-white transition hover:bg-coral-600"
            >
              Reintentar
            </button>
          </div>
        )}
      >
        <Suspense fallback={<PokemonLoading />}>
          <PokemonContent pokemonPromise={pokemonPromise} />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
