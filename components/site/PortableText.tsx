import React from "react";
import {
  PortableText as PortableTextBase,
  type PortableTextComponents,
} from "@portabletext/react";
import type { PortableTextBlock } from "@portabletext/types";

// Renders Portable Text with paragraph classes that match the design. Each
// caller passes the `<p>` className used by its section so the reference
// styling is reproduced verbatim.
export function PortableText({
  value,
  paragraphClassName,
}: {
  value: PortableTextBlock[];
  paragraphClassName?: string;
}) {
  const components: PortableTextComponents = {
    block: {
      normal: ({ children }) => <p className={paragraphClassName}>{children}</p>,
    },
  };

  return <PortableTextBase value={value} components={components} />;
}
