import type { Lang } from "@/lib/i18n";

// Minimal block data types, typed to the fields these placeholder renderers
// actually use. Task 7 replaces these placeholders with real designs and
// should widen these types (or switch to generated Sanity types) as needed.
// Reference fields (teacher->, classes[]->, plans[]->, images[]->) are
// expanded inline by PAGE_QUERY's BLOCKS_PROJECTION but aren't read here yet.

type HeroBlock = {
  _type: "heroBlock";
  _key: string;
  headingLine1?: string | null;
  headingLine2?: string | null;
};

type MarqueeBlock = {
  _type: "marqueeBlock";
  _key: string;
  words?: string[] | null;
};

type AboutBlock = {
  _type: "aboutBlock";
  _key: string;
  heading?: string | null;
  headingAccent?: string | null;
};

type PedagogBlock = {
  _type: "pedagogBlock";
  _key: string;
  heading?: string | null;
  headingAccent?: string | null;
};

type TimeplanBlock = {
  _type: "timeplanBlock";
  _key: string;
  heading?: string | null;
  headingAccent?: string | null;
};

type PrisBlock = {
  _type: "prisBlock";
  _key: string;
  heading?: string | null;
  headingAccent?: string | null;
};

type GalleryBlock = {
  _type: "galleryBlock";
  _key: string;
  heading?: string | null;
  headingAccent?: string | null;
};

type NyheterBlock = {
  _type: "nyheterBlock";
  _key: string;
  heading?: string | null;
  headingAccent?: string | null;
};

type SignupFormBlock = {
  _type: "signupFormBlock";
  _key: string;
  heading?: string | null;
  headingAccent?: string | null;
};

export type PageBlock =
  | HeroBlock
  | MarqueeBlock
  | AboutBlock
  | PedagogBlock
  | TimeplanBlock
  | PrisBlock
  | GalleryBlock
  | NyheterBlock
  | SignupFormBlock;

type BlockType = PageBlock["_type"];

// Anchor ids for later in-page nav; marqueeBlock has none (it's decorative).
const SECTION_IDS: Partial<Record<BlockType, string>> = {
  heroBlock: "hjem",
  aboutBlock: "om",
  pedagogBlock: "pedagog",
  timeplanBlock: "timeplan",
  prisBlock: "pris",
  galleryBlock: "galleri",
  nyheterBlock: "nyheter",
  signupFormBlock: "kontakt",
};

const HEADING_CLASS = "font-serif text-3xl uppercase tracking-wide sm:text-4xl";
const ACCENT_CLASS = "text-flamenco-red italic";

function HeroBlockPlaceholder({ block }: { block: HeroBlock }) {
  return (
    <section id={SECTION_IDS.heroBlock} className="py-24">
      <h1 className={HEADING_CLASS}>
        {block.headingLine1}
        {block.headingLine2 ? <> <span className={ACCENT_CLASS}>{block.headingLine2}</span></> : null}
      </h1>
    </section>
  );
}

function MarqueeBlockPlaceholder({ block }: { block: MarqueeBlock }) {
  return (
    <section className="py-8">
      <p className={HEADING_CLASS}>{(block.words ?? []).join(" · ")}</p>
    </section>
  );
}

function HeadingOnlyBlock({
  block,
  id,
}: {
  block: { heading?: string | null; headingAccent?: string | null };
  id?: string;
}) {
  return (
    <section id={id} className="py-24">
      <h2 className={HEADING_CLASS}>
        {block.heading}
        {block.headingAccent ? <> <span className={ACCENT_CLASS}>{block.headingAccent}</span></> : null}
      </h2>
    </section>
  );
}

const BLOCK_COMPONENTS: {
  [K in BlockType]: (props: { block: Extract<PageBlock, { _type: K }>; lang: Lang }) => React.ReactElement;
} = {
  heroBlock: ({ block }) => <HeroBlockPlaceholder block={block} />,
  marqueeBlock: ({ block }) => <MarqueeBlockPlaceholder block={block} />,
  aboutBlock: ({ block }) => <HeadingOnlyBlock block={block} id={SECTION_IDS.aboutBlock} />,
  pedagogBlock: ({ block }) => <HeadingOnlyBlock block={block} id={SECTION_IDS.pedagogBlock} />,
  timeplanBlock: ({ block }) => <HeadingOnlyBlock block={block} id={SECTION_IDS.timeplanBlock} />,
  prisBlock: ({ block }) => <HeadingOnlyBlock block={block} id={SECTION_IDS.prisBlock} />,
  galleryBlock: ({ block }) => <HeadingOnlyBlock block={block} id={SECTION_IDS.galleryBlock} />,
  nyheterBlock: ({ block }) => <HeadingOnlyBlock block={block} id={SECTION_IDS.nyheterBlock} />,
  signupFormBlock: ({ block }) => <HeadingOnlyBlock block={block} id={SECTION_IDS.signupFormBlock} />,
};

export function BlockRenderer({ blocks, lang }: { blocks?: PageBlock[] | null; lang: Lang }) {
  if (!blocks?.length) return null;

  return (
    <>
      {blocks.map((block) => {
        const Component = BLOCK_COMPONENTS[block._type] as
          | ((props: { block: PageBlock; lang: Lang }) => React.ReactElement)
          | undefined;

        if (!Component) {
          if (process.env.NODE_ENV !== "production") {
            console.warn(`BlockRenderer: unknown block type "${(block as { _type: string })._type}"`);
          }
          return null;
        }

        return <Component key={block._key} block={block} lang={lang} />;
      })}
    </>
  );
}
