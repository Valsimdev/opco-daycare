"use client";

import { use, useState } from "react";

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

function fetchPokemon(pokemonId: number): Promise<PokemonData> {
  return fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`)
    .then((res) => {
      if (!res.ok) throw new Error(`Pokémon #${pokemonId} no encontrado`);
      return res.json();
    });
}

export function PokemonViewer() {
  const [id, setId] = useState(1);

  const pokemonPromise = fetchPokemon(id);
  const pokemon = use(pokemonPromise);

  const navigate = (delta: number) => {
    const next = id + delta;
    if (next < 1) return;
    setId(next);
  };

  return (
    <div className="mx-auto max-w-lg rounded-2xl bg-surface p-6 shadow-lg">
      <h1 className="mb-4 text-center text-2xl font-display font-bold text-ink-900">
        Pokédex
      </h1>

      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          disabled={id <= 1}
          className="rounded-lg bg-coral-500 px-4 py-2 text-white transition hover:bg-coral-600 disabled:cursor-not-allowed disabled:opacity-40"
        >
          ← Anterior
        </button>

        <span className="font-display text-lg font-semibold text-ink-800">
          #{String(id).padStart(3, "0")}
        </span>

        <button
          onClick={() => navigate(1)}
          className="rounded-lg bg-coral-500 px-4 py-2 text-white transition hover:bg-coral-600 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Siguiente →
        </button>
      </div>

      <div>
        <div className="mb-4 flex justify-center">
          <img
            src={
              pokemon.sprites.other["official-artwork"].front_default ??
              pokemon.sprites.front_default ??
              ""
            }
            alt={pokemon.name}
            className="h-48 w-48 object-contain"
          />
        </div>

        <h2 className="mb-2 text-center text-xl font-display capitalize text-ink-900">
          {pokemon.name}
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
                  style={{ width: `${Math.min((s.base_stat / 255) * 100, 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
