import Form from "next/form";
import { ChevronDownIcon, SearchIcon } from "@/components/ui/icons";
import type { Location } from "@/types/database";

/** Big search box used in the hero. Sends the person to /items with their search. */
export function SearchForm({ locations }: { locations: Location[] }) {
  return (
    <Form
      action="/items"
      className="flex flex-wrap gap-2 rounded-[20px] bg-white p-3 shadow-[0_18px_40px_rgba(0,0,0,0.22)]"
    >
      <div className="flex min-w-0 flex-[2_1_220px] flex-col gap-0.5 px-3.5 py-2">
        <label htmlFor="hero-q" className="text-xs font-bold uppercase tracking-wide text-ink-700">
          What did you lose?
        </label>
        <input
          id="hero-q"
          name="q"
          type="text"
          placeholder="e.g. student ID, umbrella, keys"
          className="min-h-8 border-none bg-transparent py-1 text-base text-ink-900 outline-none placeholder:text-ink-500"
        />
      </div>

      <div className="flex min-w-0 flex-[1_1_170px] flex-col gap-0.5 border-brand-200 px-3.5 py-2 sm:border-l">
        <label htmlFor="hero-loc" className="text-xs font-bold uppercase tracking-wide text-ink-700">
          Where?
        </label>
        <div className="relative min-w-0">
          <select
            id="hero-loc"
            name="location"
            defaultValue=""
            className="min-h-8 w-full min-w-0 appearance-none border-none bg-transparent py-1 pl-0 pr-10 text-base text-ink-900 outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
          >
            <option value="">Anywhere on campus</option>
            {locations.map((l) => (
              <option key={l.id} value={l.slug}>
                {l.name}
              </option>
            ))}
          </select>
          <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-700" />
        </div>
      </div>

      <button
        type="submit"
        className="flex min-h-14 flex-none items-center justify-center gap-2 rounded-[14px] bg-brand-700 px-7 text-base font-bold text-white hover:bg-brand-800"
      >
        <SearchIcon />
        Search
      </button>
    </Form>
  );
}
